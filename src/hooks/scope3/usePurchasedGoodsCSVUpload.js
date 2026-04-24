// hooks/scope3/usePurchasedGoodsCSVUpload.js
import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as XLSX from "xlsx";
import { calculatePurchasedGoodsEmission } from '@/utils/Scope3/calculatePurchasedGoodsEmission';
import { qualityControlOptions } from "@/constant/scope1/options";
import {
  stakeholderOptions,
  purchaseCategoryOptions,
  purchasedGoodsActivityTypes,
  purchasedServicesActivityTypes,
  purchasedGoodsServicesTypes,
  currencyUnitOptions
} from "@/constant/scope3/options";


// Add this header mapping object at the top of your file (after imports)
const HEADER_MAPPING = {
  'buildingcode': ['buildingcode', 'building code', 'building-code', 'building_code'],
  'stakeholder': ['stakeholder', 'stake holder', 'stake-holder', 'stakeholderdepartment'],
  'postingdate': ['postingdate', 'posting date', 'date', 'posting-date', 'posting_date'],
  'purchasecategory': ['purchasecategory', 'purchase category', 'purchase-category', 'purchase_category', 'category'],
  'purchasedactivitytype': ['purchasedactivitytype', 'purchased activity type', 'purchased-activity-type', 'purchased_activity_type', 'activity type'],
  'purchasedgoodsservicestype': ['purchasedgoodsservicestype', 'purchased goods services type', 'purchased goods or services type', 'purchased goods/services type', 'goods/services type'],
  'amountspent': ['amountspent', 'amountspent$', 'amount-spent', 'amount_spent', 'amount', 'spent'],
  'qualitycontrol': ['qualitycontrol', 'quality control', 'quality-control', 'quality_control'],
  'iscapitalgoods': ['pleasespecifywhethertheselecteditemisacapitalgood', 'please specify whether the selected item is a capital good', 'iscapitalgoods', 'is capital goods'],
  'remarks': ['remarks', 'remark', 'comments', 'notes']
};

const usePurchasedGoodsCSVUpload = (buildings = []) => {
  const [csvState, setCsvState] = useState({
    file: null,
    uploading: false,
    progress: 0,
    results: null,
    validationErrors: [],
    parsedData: null,
  });
  // Helper function to normalize header
  const normalizeHeader = (header) => {
    return header.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  // Helper function to find matching field
  const findMatchingField = (normalizedHeader, headersToCheck) => {
    for (const [field, possibleNames] of Object.entries(HEADER_MAPPING)) {
      const normalizedPossibleNames = possibleNames.map(name => normalizeHeader(name));
      if (normalizedPossibleNames.includes(normalizedHeader)) {
        return field;
      }
    }
    return null;
  };

  const isNA = useCallback((value) => {
    if (!value) return true;
    const val = value.toString().toLowerCase().trim();
    return val === 'n/a' || val === 'na' || val === '';
  }, []);

  const cleanNumberValue = useCallback((value) => {
    if (isNA(value)) return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  }, [isNA]);

  const cleanStringValue = useCallback((value) => {
    if (isNA(value)) return null;
    return value.toString().trim();
  }, [isNA]);

  const cleanCSVValue = useCallback((value) => {
    if (typeof value !== 'string') return value;

    let cleaned = value.trim();

    // Remove surrounding quotes
    cleaned = cleaned.replace(/^["']+|["']+$/g, '');

    // Remove Excel formula prefix
    cleaned = cleaned.replace(/^=/, '');

    return cleaned;
  }, []);

  // Helper function to parse date in any format to ISO
  const parseDateToISO = useCallback((dateString) => {
    if (!dateString) return null;

    let cleanedDate = dateString.toString().trim();
    cleanedDate = cleanedDate.replace(/"/g, ''); // Remove quotes

    if (!cleanedDate || cleanedDate === '') return null;

    let date;
    let year, month, day;

    if (cleanedDate.includes('T')) {
      date = new Date(cleanedDate.split('T')[0]);
    } else {
      const parts = cleanedDate.split(/[\/\-\.]/);

      if (parts.length === 3) {
        if (parts[0].length === 4) {
          // Format: YYYY-MM-DD
          year = parseInt(parts[0]);
          month = parseInt(parts[1]) - 1;
          day = parseInt(parts[2]);
          date = new Date(year, month, day);
        } else if (parts[2].length === 4) {
          // Could be MM/DD/YYYY or DD/MM/YYYY
          if (parseInt(parts[0]) > 12) {
            // Likely DD/MM/YYYY
            day = parseInt(parts[0]);
            month = parseInt(parts[1]) - 1;
            year = parseInt(parts[2]);
            date = new Date(year, month, day);
          } else if (parseInt(parts[1]) > 12) {
            // Likely MM/DD/YYYY
            month = parseInt(parts[0]) - 1;
            day = parseInt(parts[1]);
            year = parseInt(parts[2]);
            date = new Date(year, month, day);
          } else {
            // Ambiguous - try both
            let testDate1 = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
            let testDate2 = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));

            if (!isNaN(testDate1.getTime()) && testDate1.getDate() === parseInt(parts[1])) {
              date = testDate1;
            } else if (!isNaN(testDate2.getTime()) && testDate2.getDate() === parseInt(parts[0])) {
              date = testDate2;
            } else {
              date = testDate1;
            }
          }
        } else {
          date = new Date(cleanedDate);
        }
      } else {
        date = new Date(cleanedDate);
      }
    }

    if (!date || isNaN(date.getTime())) {
      return null;
    }

    const isoDate = new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0, 0, 0, 0
      )
    ).toISOString();

    return isoDate;
  }, []);

  // CSV Parser
  // CSV Parser
  const parseCSV = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const csvText = event.target.result;

          const parseCSVLine = (line) => {
            const result = [];
            let current = '';
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              const nextChar = line[i + 1];

              if (char === '"') {
                if (inQuotes && nextChar === '"') {
                  current += '"';
                  i++;
                } else {
                  inQuotes = !inQuotes;
                }
              } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
              } else {
                current += char;
              }
            }

            result.push(current);
            return result;
          };

          const lines = csvText.split('\n').filter(line => line.trim() !== '');

          if (lines.length === 0) {
            reject(new Error('CSV file is empty'));
            return;
          }

          const headerRowIndex = 0;
          const headerValues = parseCSVLine(lines[headerRowIndex]);

          console.log('Parsed headers:', headerValues);

          // Map headers to field names
          const fieldMapping = {};
          const requiredFields = ['buildingcode', 'stakeholder', 'postingdate', 'purchasecategory', 'purchasedactivitytype', 'purchasedgoodsservicestype', 'amountspent','qualitycontrol'];

          headerValues.forEach(header => {
            const normalizedHeader = normalizeHeader(header);
            const matchedField = findMatchingField(normalizedHeader, requiredFields);
            if (matchedField) {
              fieldMapping[matchedField] = header;
            }
          });

          // Check for missing required fields
          const missingFields = requiredFields.filter(field => !fieldMapping[field]);

          if (missingFields.length > 0) {
            reject(new Error(`Missing required columns: ${missingFields.join(', ')}. Found: ${headerValues.join(', ')}`));
            return;
          }

          const data = [];
          for (let i = headerRowIndex + 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = parseCSVLine(line);
            const row = {};

            // Use the mapped field names
            Object.entries(fieldMapping).forEach(([field, headerName]) => {
              const index = headerValues.findIndex(h => h === headerName);
              row[field] = index < values.length ? cleanCSVValue(values[index]) : '';
            });

            if (Object.values(row).some(val => val && val.toString().trim() !== '')) {
              data.push(row);
            }
          }

          console.log('Parsed CSV data:', data);
          resolve(data);
        } catch (error) {
          console.error('CSV parsing error:', error);
          reject(new Error(`Error parsing CSV: ${error.message}`));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, [cleanCSVValue]);

  // Excel Parser
  // Excel Parser
  const parseExcel = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, {
            type: 'array',
            cellDates: false,
            cellText: true,
            cellNF: true,
            cellHTML: false
          });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

          const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
            header: 1,
            defval: '',
            raw: false
          });

          if (!jsonData || jsonData.length === 0) {
            reject(new Error('Excel file is empty'));
            return;
          }

          const headerRowIndex = 0;
          const headerValues = jsonData[headerRowIndex] || [];

          console.log('Parsed Excel headers:', headerValues);

          // Map headers to field names
          const fieldMapping = {};
          const requiredFields = ['buildingcode', 'stakeholder', 'postingdate', 'purchasecategory', 'purchasedactivitytype', 'purchasedgoodsservicestype', 'amountspent','qualitycontrol'];

          headerValues.forEach(header => {
            const normalizedHeader = normalizeHeader(header);
            const matchedField = findMatchingField(normalizedHeader, requiredFields);
            if (matchedField) {
              fieldMapping[matchedField] = header;
            }
          });

          // Check for missing required fields
          const missingFields = requiredFields.filter(field => !fieldMapping[field]);

          if (missingFields.length > 0) {
            reject(new Error(`Missing required columns: ${missingFields.join(', ')}. Found: ${headerValues.join(', ')}`));
            return;
          }

          const parsedData = [];
          for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.every(cell => !cell || cell.toString().trim() === '')) continue;

            const rowData = {};

            // Use the mapped field names
            Object.entries(fieldMapping).forEach(([field, headerName]) => {
              const index = headerValues.findIndex(h => h === headerName);
              const value = index < row.length ? row[index] : '';
              rowData[field] = value ? cleanCSVValue(value) : '';
            });

            parsedData.push(rowData);
          }

          console.log('Parsed Excel data:', parsedData);
          resolve(parsedData);
        } catch (error) {
          reject(new Error(`Error parsing Excel file: ${error.message}`));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }, [cleanCSVValue]);


  // Helper function for normalization (handles spaces around slashes)
  const normalizeWithSlash = (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/\s*\/\s*/g, '/')  // Remove spaces around slashes
      .replace(/\s+/g, ' ')        // Normalize multiple spaces
      .trim();
  };

  // Flexible matching function
  const findFlexibleMatch = (input, validOptions) => {
    if (!input || !validOptions.length) return null;

    const normalizedInput = normalizeWithSlash(input);

    // Try direct match with normalization
    let match = validOptions.find(option =>
      normalizeWithSlash(option) === normalizedInput
    );

    if (match) return match;

    // Try with spaces around slashes (for cases like "A/B" vs "A / B")
    const spacedInput = normalizedInput.replace(/\//g, ' / ');
    match = validOptions.find(option => {
      const normalizedOption = normalizeWithSlash(option);
      const spacedOption = normalizedOption.replace(/\//g, ' / ');
      return spacedOption === spacedInput;
    });

    return match;
  };

  const validatePurchasedGoodsRow = useCallback((row, index, isCapitalGoods = false) => {
    const errors = [];
    const cleanedRow = {};

    Object.keys(row).forEach(key => {
      cleanedRow[key] = row[key]?.toString().trim() || '';
    });

    console.log(`Validating row ${index + 1}:`, cleanedRow);

    // Required fields validation
    if (!cleanedRow.buildingcode) errors.push('Building Code is required');
    if (!cleanedRow.stakeholder) errors.push('Stakeholder is required');
    if (!cleanedRow.postingdate) errors.push('Postingdate is required');
    if (!cleanedRow.purchasecategory) errors.push('Purchase Category is required');
    if (!cleanedRow.purchasedactivitytype) errors.push('Purchased Activity Type is required');
    if (!cleanedRow.purchasedgoodsservicestype) errors.push('Purchased Goods or Services Type is required');
    if (!cleanedRow.amountspent) errors.push('Amount Spent is required');
    if (!cleanedRow.qualitycontrol) errors.push('Quality Control is required');

    if (errors.length > 0) {
      return errors;
    }

    // Building validation
    if (cleanedRow.buildingcode && buildings.length > 0) {
      const buildingExists = buildings.some(b =>
        b.buildingCode && b.buildingCode.toLowerCase() === cleanedRow.buildingcode.toLowerCase()
      );
      if (!buildingExists) {
        errors.push(`Invalid Blding Code "${cleanedRow.buildingcode}"`);
      }
    }

    // Stakeholder validation
    // if (cleanedRow.stakeholder) {
    //   const validStakeholders = stakeholderOptions.map(s => s.value);
    //   const matchedStakeholder = validStakeholders.find(s =>
    //     s.toLowerCase() === cleanedRow.stakeholder.toLowerCase()
    //   );
    //   if (!matchedStakeholder) {
    //     errors.push(`Invalid stakeholder "${cleanedRow.stakeholder}"`);
    //   } else {
    //     cleanedRow.stakeholder = matchedStakeholder;
    //   }
    // }
    if (cleanedRow.stakeholder) {
      const validStakeholders = stakeholderOptions.map(s => s.value);
      const matchedStakeholder = findFlexibleMatch(cleanedRow.stakeholder, validStakeholders);

      if (!matchedStakeholder) {
        errors.push(`Invalid Stakeholder "${cleanedRow.stakeholder}"`);
      } else {
        cleanedRow.stakeholder = matchedStakeholder;
      }
    }

    // Purchase Category validation
    if (cleanedRow.purchasecategory) {
      const validCategories = purchaseCategoryOptions.map(c => c.value);
      const matchedCategory = validCategories.find(c =>
        c.toLowerCase() === cleanedRow.purchasecategory.toLowerCase()
      );
      if (!matchedCategory) {
        errors.push(`Invalid Purchase Category "${cleanedRow.purchasecategory}"`);
      } else {
        cleanedRow.purchasecategory = matchedCategory;
      }
    }

    // Purchased Activity Type validation based on category
    if (cleanedRow.purchasecategory && cleanedRow.purchasedactivitytype) {
      let validActivityTypes = [];
      if (cleanedRow.purchasecategory === 'Purchased Goods') {
        validActivityTypes = purchasedGoodsActivityTypes.map(a => a.value);
      } else if (cleanedRow.purchasecategory === 'Purchased Services') {
        validActivityTypes = purchasedServicesActivityTypes.map(a => a.value);
      }

      const matchedActivity = validActivityTypes.find(a =>
        a.toLowerCase() === cleanedRow.purchasedactivitytype.toLowerCase()
      );

      if (!matchedActivity) {
        errors.push(`Invalid "Purchased Activity Type": "${cleanedRow.purchasedactivitytype}" for category "${cleanedRow.purchasecategory}"`);
      } else {
        cleanedRow.purchasedactivitytype = matchedActivity;
      }
    }

    // Purchased Goods/Services Type validation
    if (cleanedRow.purchasedactivitytype && cleanedRow.purchasedgoodsservicestype) {
      const validTypes = purchasedGoodsServicesTypes[cleanedRow.purchasedactivitytype] || [];
      const validTypeValues = validTypes.map(t => t.value);

      const matchedType = validTypeValues.find(t =>
        t.toLowerCase() === cleanedRow.purchasedgoodsservicestype.toLowerCase()
      );

      if (!matchedType && validTypeValues.length > 0) {
        errors.push(`Invalid "Purchased Goods or Services Type": "${cleanedRow.purchasedgoodsservicestype}" for activity "${cleanedRow.purchasedactivitytype}"`);
      } else if (matchedType) {
        cleanedRow.purchasedgoodsservicestype = matchedType;
      }
    }

    // In validatePurchasedGoodsRow, add handling for iscapitalgoods
    // if (isCapitalGoods) {
    //   // Check for iscapitalgoods field (from the friendly header)
    //   let isCapitalGoodsValue = cleanedRow.iscapitalgoods || cleanedRow['pleasespecifywhethertheselecteditemisacapitalgood'];

    //   if (isCapitalGoodsValue) {
    //     cleanedRow.iscapitalgoods = isCapitalGoodsValue.toLowerCase() === 'yes' ||
    //       isCapitalGoodsValue.toLowerCase() === 'true' ||
    //       isCapitalGoodsValue === '1';
    //   } else {
    //     cleanedRow.iscapitalgoods = false;
    //   }
    // }
    // Handle isCapitalGoods based on purchase category
  if (isCapitalGoods) {
    // Only apply capital goods logic for 'Purchased Goods' category
    if (cleanedRow.purchasecategory === 'Purchased Goods') {
      // Check for iscapitalgoods field
      let isCapitalGoodsValue = cleanedRow.iscapitalgoods || cleanedRow['pleasespecifywhethertheselecteditemisacapitalgood'];
      
      if (isCapitalGoodsValue) {
        cleanedRow.iscapitalgoods = isCapitalGoodsValue.toLowerCase() === 'yes' ||
          isCapitalGoodsValue.toLowerCase() === 'true' ||
          isCapitalGoodsValue === '1';
      } else {
        cleanedRow.iscapitalgoods = false;
      }
    } else if (cleanedRow.purchasecategory === 'Purchased Services') {
      // For Purchased Services, force isCapitalGoods to false
      cleanedRow.iscapitalgoods = false;
      
      // Optional: Add a warning if user provided a value
      if (cleanedRow.iscapitalgoods || cleanedRow['pleasespecifywhethertheselecteditemisacapitalgood']) {
        console.warn(`Row ${index + 2}: isCapitalGoods field ignored for Purchased Services category`);
      }
    }
  }

    // Amount Spent validation
    if (cleanedRow.amountspent) {
      const cleanNum = cleanedRow.amountspent.toString()
        .replace(/[^0-9.-]/g, '')
        .replace(/^"+|"+$/g, '');

      const num = Number(cleanNum);
      if (isNaN(num) || cleanNum === '') {
        errors.push(`Amount spent must be a number, got "${cleanedRow.amountspent}"`);
      } else if (num < 0) {
        errors.push('Amount spent cannot be negative');
      } else {
        cleanedRow.amountspent = num.toString();
      }
    }

    // Quality Control validation
    if (cleanedRow.qualitycontrol) {
      const validQC = qualityControlOptions.map(q => q.value);
      const matchedQC = validQC.find(q =>
        q.toLowerCase() === cleanedRow.qualitycontrol.toLowerCase()
      );
      if (!matchedQC) {
        errors.push(`Invalid Quality Control "${cleanedRow.qualitycontrol}"`);
      } else {
        cleanedRow.qualitycontrol = matchedQC;
      }
    }

    // Date validation
    if (cleanedRow.postingdate) {
      const isoDate = parseDateToISO(cleanedRow.postingdate);
      if (!isoDate) {
        errors.push(`Invalid Date Format: "${cleanedRow.postingdate}"`);
      } else {
        cleanedRow.postingdate = isoDate;
      }
    }

    // Remarks validation
    if (cleanedRow.remarks && cleanedRow.remarks.length > 500) {
      errors.push('Remarks cannot exceed 500 characters');
    }

    if (errors.length === 0) {
      Object.keys(cleanedRow).forEach(key => {
        row[key] = cleanedRow[key];
      });
    }

    return errors;
  }, [buildings, parseDateToISO]);

  const transformPurchasedGoodsPayload = useCallback((row, isCapitalGoods = false) => {
    const userId = localStorage.getItem('userId');

    const emissionResult = calculatePurchasedGoodsEmission({
      amountSpent: row.amountspent ? parseFloat(row.amountspent) : 0,
      purchasedGoodsServicesType: row.purchasedgoodsservicestype,
    });

    const capitalizeFirstLetter = (text) => {
      if (!text) return "";
      return text.charAt(0).toUpperCase() + text.slice(1);
    };

    return {
      buildingCode: row.buildingcode,
      stakeholder: row.stakeholder,
      purchaseCategory: row.purchasecategory,
      purchasedActivityType: row.purchasedactivitytype,
      purchasedGoodsServicesType: cleanStringValue(row.purchasedgoodsservicestype),
      isCapitalGoods: isCapitalGoods ? (row.iscapitalgoods || false) : false,
      amountSpent: cleanNumberValue(row.amountspent, 'Amount spent') || 0,
      unit: 'USD',
      qualityControl: row.qualitycontrol,
      remarks: capitalizeFirstLetter(cleanStringValue(row.remarks) || ''),
      postingDate: row.postingdate,
      calculatedEmissionKgCo2e: emissionResult?.calculatedEmissionKgCo2e || 0,
      calculatedEmissionTCo2e: emissionResult?.calculatedEmissionTCo2e || 0,
      createdBy: userId,
      updatedBy: userId,
    };
  }, []);

  const handleFileSelect = async (file, isCapitalGoods = false) => {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const isValidFile = ['csv', 'xlsx', 'xls'].includes(fileExtension);

    if (!isValidFile) {
      toast.error('Please select a CSV or Excel file');
      console.error('Invalid file type selected:', file.name);
      return null;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return null;
    }

    try {
      let data;
      if (fileExtension === 'csv') {
        data = await parseCSV(file);
      } else {
        data = await parseExcel(file);
      }

      if (!data || data.length === 0) {
        toast.error('No data found in file');
        return null;
      }

      const errors = [];

      data.forEach((row, index) => {
        const rowErrors = validatePurchasedGoodsRow(row, index, isCapitalGoods);
        if (rowErrors.length > 0) {
          errors.push(`Row ${index + 2}: ${rowErrors.join(', ')}`);
        }
      });

      setCsvState(prev => ({
        ...prev,
        file,
        parsedData: data,
        validationErrors: errors,
      }));

      if (errors.length === 0) {
        toast.success(`File validated: ${data.length} rows ready for upload`);
      } else {
        toast.warning(`Found ${errors.length} validation errors. Please fix them before uploading.`);
      }

      return data;
    } catch (error) {
      toast.error(`Error parsing file: ${error.message}`);
      console.error('File parsing error:', error);
      return null;
    }
  };

  const processUpload = async (endpoint, isCapitalGoods = false, onSuccess = null) => {
    console.log('processUpload started');
    const { file, parsedData, validationErrors } = csvState;

    if (!file || validationErrors.length > 0 || !parsedData) {
      toast.error('Please fix validation errors first');
      return null;
    }

    setCsvState(prev => ({
      ...prev,
      uploading: true,
      progress: 0,
      results: null
    }));

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    try {
      const totalRows = parsedData.length;

      for (let i = 0; i < totalRows; i++) {
        const row = parsedData[i];

        try {
          const payload = transformPurchasedGoodsPayload(row, isCapitalGoods);

          console.log(`Uploading row ${i + 1}:`, payload);

          await axios.post(
            `${process.env.REACT_APP_BASE_URL}/Purchased-Goods-Services/create`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            }
          );

          results.success++;
        } catch (error) {
          results.failed++;
          const errorMessage = error.response?.data?.message || error.message;
          results.errors.push({
            row: i + 1,
            error: errorMessage
          });
          console.error(`Error uploading row ${i + 1}:`, errorMessage);
        }

        const currentProgress = Math.round(((i + 1) / totalRows) * 100);
        const isLastRow = i === totalRows - 1;

        if (currentProgress % 10 === 0 || isLastRow) {
          setCsvState(prev => ({
            ...prev,
            progress: currentProgress
          }));
        }
      }

      setCsvState(prev => ({
        ...prev,
        progress: 100,
        results: results,
        uploading: false
      }));

      setTimeout(() => {
        if (results.failed === 0) {
          toast.success(`Successfully uploaded ${results.success} records!`);
          if (onSuccess) onSuccess(results);
        } else {
          toast.warning(`Uploaded ${results.success} records, ${results.failed} failed.`);
        }
      }, 2000);

      console.log('processUpload completed successfully');
      return results;

    } catch (error) {
      console.error('Critical upload error:', error);
      setCsvState(prev => ({
        ...prev,
        uploading: false,
        progress: 0
      }));
      toast.error('Upload failed unexpectedly');
      throw error;
    }
  };

  const resetUpload = () => {
    setCsvState({
      file: null,
      uploading: false,
      progress: 0,
      results: null,
      validationErrors: [],
      parsedData: null,
    });
  };


  const downloadPurchasedGoodsTemplate = useCallback((isCapitalGoods = false) => {
    const exampleBuildings = buildings.slice(0, 1);
    const exampleBuildingCode = exampleBuildings[0]?.buildingCode || 'BLD-EXAMPLE-001';

    const exampleStakeholder = 'Procurement';
    const examplePurchaseCategory = 'Purchased Goods';
    const exampleActivityType = 'Food & Drinks';
    const exampleGoodsType = 'Bakery and Farinaceous Products';
    const exampleUnit = 'USD';
    const exampleQC = 'Good';

    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    let headers = [];
    let exampleRow = [];

    if (isCapitalGoods) {
      headers = [
        'Building Code',
        'Stakeholder / Department',
        'Purchase Category',
        'Purchased Activity Type',
        'Purchased Goods or Services Type',
        'Please specify whether the selected item is a capital good.',
        'Amount Spent ($)',
        'Quality Control',
        'Remarks',
        'Posting Date'        
      ];

      exampleRow = [
        exampleBuildingCode,
        exampleStakeholder,
        examplePurchaseCategory,
        exampleActivityType,
        exampleGoodsType,
        '',
        '1000',
        exampleQC,
        'Example record',
        formattedDate
      ];
    } else {
      headers = [
        'Building Code',
        'Stakeholder / Department',
        'Purchase Category',
        'Purchased Activity Type',
        'Purchased Goods or Services Type',
        'Amount Spent ($)',
        'Quality Control',
        'Remarks',
        'Posting Date'
      ];

      exampleRow = [
        exampleBuildingCode,
        exampleStakeholder,
        examplePurchaseCategory,
        exampleActivityType,
        exampleGoodsType,
        '1000',
        exampleQC,
        'Example record',
        formattedDate
      ];
    }

    // Create worksheet data with headers and example row
    const worksheetData = [
      headers,
      exampleRow,
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Auto-size columns for better readability
    const colWidths = headers.map(header => ({
      wch: Math.min(Math.max(header.length, 25), 35)
    }));
    worksheet['!cols'] = colWidths;

    // Style the header row
    const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = {
        font: { bold: true, sz: 12 },
        fill: { fgColor: { rgb: "E0E0E0" } }
      };
    }

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet,
      isCapitalGoods ? 'Capital Goods Template' : 'Purchased Goods Template');

    // Download the Excel file
    XLSX.writeFile(workbook, isCapitalGoods ? 'purchased_goods_and_services_capital_template.xlsx' : 'purchased_goods_and_services_template.xlsx');
  }, [buildings]);

  return {
    csvState,
    handleFileSelect,
    processUpload,
    resetUpload,
    downloadPurchasedGoodsTemplate,
  };
};

export default usePurchasedGoodsCSVUpload;


