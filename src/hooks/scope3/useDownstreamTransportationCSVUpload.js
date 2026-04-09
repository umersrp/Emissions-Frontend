
// hooks/scope3/useDownstreamTransportationCSVUpload.js
import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as XLSX from "xlsx";
import { calculateDownstreamTransportationEmission } from '@/utils/Scope3/calculateDownstreamTransportation';
import {
  stakeholderDepartmentOptions,
  processQualityControlOptions,
} from "@/constant/scope1/options";
import {
  soldProductActivityOptions,
  soldGoodsTypeMapping,
  transportationVehicleCategoryOptions,
  transportationVehicleTypeOptions
} from '@/constant/scope3/downstreamTransportation';

const useDownstreamTransportationCSVUpload = (buildings = []) => {
  const [csvState, setCsvState] = useState({
    file: null,
    uploading: false,
    progress: 0,
    results: null,
    validationErrors: [],
    parsedData: null,
  });


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
    cleaned = cleaned.replace(/^["']+|["']+$/g, '');
    cleaned = cleaned.replace(/^=/, '');
    return cleaned;
  }, []);

  // Helper function to parse date in any format to ISO
  const parseDateToISO = useCallback((dateString) => {
    if (!dateString) return null;

    let cleanedDate = dateString.toString().trim();
    cleanedDate = cleanedDate.replace(/"/g, '');

    if (!cleanedDate || cleanedDate === '') return null;

    let date;
    let year, month, day;

    if (cleanedDate.includes('T')) {
      date = new Date(cleanedDate.split('T')[0]);
    } else {
      const parts = cleanedDate.split(/[\/\-\.]/);

      if (parts.length === 3) {
        if (parts[0].length === 4) {
          year = parseInt(parts[0]);
          month = parseInt(parts[1]) - 1;
          day = parseInt(parts[2]);
          date = new Date(year, month, day);
        } else if (parts[2].length === 4) {
          if (parseInt(parts[0]) > 12) {
            day = parseInt(parts[0]);
            month = parseInt(parts[1]) - 1;
            year = parseInt(parts[2]);
            date = new Date(year, month, day);
          } else if (parseInt(parts[1]) > 12) {
            month = parseInt(parts[0]) - 1;
            day = parseInt(parts[1]);
            year = parseInt(parts[2]);
            date = new Date(year, month, day);
          } else {
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

          const headers = headerValues.map(h => {
            return cleanCSVValue(h)
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '');
          });

          console.log('Normalized headers:', headers);

          const requiredCoreHeaders = ['buildingcode', 'stakeholder', 'postingdate'];
          const missingCoreHeaders = requiredCoreHeaders.filter(h => !headers.includes(h));

          if (missingCoreHeaders.length > 0) {
            reject(new Error(`CSV must contain at least these columns: building code, stakeholder, posting date. Found: ${headerValues.join(', ')}`));
            return;
          }

          const data = [];
          for (let i = headerRowIndex + 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = parseCSVLine(line);
            const row = {};

            headers.forEach((header, index) => {
              row[header] = index < values.length ? cleanCSVValue(values[index]) : '';
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

          const headers = headerValues.map(h => {
            return h ? cleanCSVValue(h).toLowerCase().replace(/[^a-z0-9]/g, '') : '';
          });

          console.log('Normalized Excel headers:', headers);

          const requiredCoreHeaders = ['buildingcode', 'stakeholder', 'postingdate'];
          const missingCoreHeaders = requiredCoreHeaders.filter(h => !headers.includes(h));

          if (missingCoreHeaders.length > 0) {
            reject(new Error(`Excel must contain at least these columns: building code, stakeholder, posting date. Found: ${headerValues.join(', ')}`));
            return;
          }

          const parsedData = [];
          for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.every(cell => !cell || cell.toString().trim() === '')) continue;

            const rowData = {};
            headers.forEach((header, index) => {
              const value = index < row.length ? row[index] : '';
              rowData[header] = value ? cleanCSVValue(value) : '';
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


  const validateDownstreamRow = useCallback((row, index) => {
    const errors = [];

    const headerMapping = {
      'buildingcode': 'buildingcode',
      'building': 'buildingcode',
      'stakeholder': 'stakeholder',
      'stakeholderdepartment': 'stakeholder',
      'department': 'stakeholder',
      'postingdate': 'postingdate',
      'date': 'postingdate',
      'soldproductactivitytype': 'soldproductactivitytype',
      'activitytype': 'soldproductactivitytype',
      'activity': 'soldproductactivitytype',
      'soldgoodstype': 'soldgoodstype',
      'goodstype': 'soldgoodstype',
      'transportationvehiclecategory': 'transportationvehiclecategory',
      'vehiclecategory': 'transportationvehiclecategory',
      'transportationvehicletype': 'transportationvehicletype',
      'vehicletype': 'transportationvehicletype',
      'weightloaded': 'weightloaded',
      'weight': 'weightloaded',
      'distancetravelled': 'distancetravelled',
      'distance': 'distancetravelled',
      'qualitycontrol': 'qualitycontrol',
      'quality': 'qualitycontrol',
      'qc': 'qualitycontrol',
      'remarks': 'remarks',
      'remark': 'remarks',
      'note': 'remarks',
    };

    const cleanedRow = {};

    Object.keys(row).forEach(key => {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      const mappedKey = headerMapping[normalizedKey] || normalizedKey;
      cleanedRow[mappedKey] = row[key]?.toString().trim() || '';
    });

    console.log(`Validating row ${index + 1}:`, cleanedRow);

    // Required fields validation
    if (!cleanedRow.buildingcode) errors.push('buildingcode is required');
    if (!cleanedRow.stakeholder) errors.push('stakeholder is required');
    if (!cleanedRow.postingdate) errors.push('postingdate is required');
    if (!cleanedRow.soldproductactivitytype) errors.push('soldproductactivitytype is required');
    if (!cleanedRow.transportationvehiclecategory) errors.push('transportationvehiclecategory is required');
    if (!cleanedRow.weightloaded) errors.push('weightloaded is required');
    if (!cleanedRow.distancetravelled) errors.push('distancetravelled is required');
    if (!cleanedRow.qualitycontrol) errors.push('qualitycontrol is required');

    if (errors.length > 0) {
      return errors;
    }

    // Building validation
    if (cleanedRow.buildingcode && buildings.length > 0) {
      const buildingExists = buildings.some(b =>
        b.buildingCode && b.buildingCode.toLowerCase() === cleanedRow.buildingcode.toLowerCase()
      );
      if (!buildingExists) {
        errors.push(`Invalid building code "${cleanedRow.buildingcode}"`);
      }
    }

    // Stakeholder validation
    // if (cleanedRow.stakeholder) {
    //   const validStakeholders = stakeholderDepartmentOptions.map(s => s.value);
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
      const validStakeholders = stakeholderDepartmentOptions.map(s => s.value);
      const matchedStakeholder = findFlexibleMatch(cleanedRow.stakeholder, validStakeholders);

      if (!matchedStakeholder) {
        errors.push(`Invalid stakeholder "${cleanedRow.stakeholder}"`);
      } else {
        cleanedRow.stakeholder = matchedStakeholder;
      }
    }

    // Sold Product Activity Type validation
    if (cleanedRow.soldproductactivitytype) {
      const validActivityTypes = soldProductActivityOptions.map(a => a.value);
      const matchedActivity = validActivityTypes.find(a =>
        a.toLowerCase() === cleanedRow.soldproductactivitytype.toLowerCase()
      );
      if (!matchedActivity) {
        errors.push(`Invalid sold product activity type "${cleanedRow.soldproductactivitytype}"`);
      } else {
        cleanedRow.soldproductactivitytype = matchedActivity;
      }
    }

    // Sold Goods Type validation (based on activity type)
    // if (cleanedRow.soldproductactivitytype && cleanedRow.soldgoodstype) {
    //   const validGoodsTypes = soldGoodsTypeMapping[cleanedRow.soldproductactivitytype] || [];
    //   const validGoodsValues = validGoodsTypes.map(g => g.value);

    //   const matchedGoodsType = validGoodsValues.find(g =>
    //     g.toLowerCase() === cleanedRow.soldgoodstype.toLowerCase()
    //   );

    //   if (!matchedGoodsType && validGoodsValues.length > 0) {
    //     errors.push(`Invalid sold goods type "${cleanedRow.soldgoodstype}" for activity type "${cleanedRow.soldproductactivitytype}"`);
    //   } else if (matchedGoodsType) {
    //     cleanedRow.soldgoodstype = matchedGoodsType;
    //   }
    // } else if (cleanedRow.soldproductactivitytype && !cleanedRow.soldgoodstype) {
    //   const validGoodsTypes = soldGoodsTypeMapping[cleanedRow.soldproductactivitytype] || [];
    //   if (validGoodsTypes.length > 0) {
    //     errors.push('soldgoodstype is required for this activity type');
    //   }
    // }
    // Sold Goods Type validation (based on activity type) with flexible matching
    if (cleanedRow.soldproductactivitytype && cleanedRow.soldgoodstype) {
      const validGoodsTypes = soldGoodsTypeMapping[cleanedRow.soldproductactivitytype] || [];
      const validGoodsValues = validGoodsTypes.map(g => g.value);

      const matchedGoodsType = findFlexibleMatch(cleanedRow.soldgoodstype, validGoodsValues);

      if (!matchedGoodsType && validGoodsValues.length > 0) {
        errors.push(`Invalid sold goods type "${cleanedRow.soldgoodstype}" for activity type "${cleanedRow.soldproductactivitytype}"`);
      } else if (matchedGoodsType) {
        cleanedRow.soldgoodstype = matchedGoodsType;
      }
    } else if (cleanedRow.soldproductactivitytype && !cleanedRow.soldgoodstype) {
      const validGoodsTypes = soldGoodsTypeMapping[cleanedRow.soldproductactivitytype] || [];
      if (validGoodsTypes.length > 0) {
        errors.push('soldgoodstype is required for this activity type');
      }
    }

    // Transportation Vehicle Category validation
    if (cleanedRow.transportationvehiclecategory) {
      const validCategories = transportationVehicleCategoryOptions.map(c => c.value);
      const matchedCategory = validCategories.find(c =>
        c.toLowerCase() === cleanedRow.transportationvehiclecategory.toLowerCase()
      );
      if (!matchedCategory) {
        errors.push(`Invalid transportation vehicle category "${cleanedRow.transportationvehiclecategory}"`);
      } else {
        cleanedRow.transportationvehiclecategory = matchedCategory;
      }
    }

    // Transportation Vehicle Type validation
    if (cleanedRow.transportationvehiclecategory && cleanedRow.transportationvehicletype) {
      const validTypes = transportationVehicleTypeOptions[cleanedRow.transportationvehiclecategory] || [];
      const validTypeValues = validTypes.map(t => t.value);

      const matchedType = validTypeValues.find(t =>
        t.toLowerCase() === cleanedRow.transportationvehicletype.toLowerCase()
      );

      if (!matchedType && validTypeValues.length > 0) {
        errors.push(`Invalid transportation vehicle type "${cleanedRow.transportationvehicletype}" for category "${cleanedRow.transportationvehiclecategory}"`);
      } else if (matchedType) {
        cleanedRow.transportationvehicletype = matchedType;
      }
    } else if (
      cleanedRow.transportationvehiclecategory &&
      ['freightFlights', 'seaTanker', 'cargoShip'].includes(cleanedRow.transportationvehiclecategory) &&
      !cleanedRow.transportationvehicletype
    ) {
      errors.push('transportationvehicletype is required for this vehicle category');
    }

    // Weight Loaded validation
    if (cleanedRow.weightloaded) {
      const cleanNum = cleanedRow.weightloaded.toString()
        .replace(/[^0-9.-]/g, '')
        .replace(/^"+|"+$/g, '');

      const num = Number(cleanNum);
      if (isNaN(num) || cleanNum === '') {
        errors.push(`Weight loaded must be a number, got "${cleanedRow.weightloaded}"`);
      } else if (num <= 0) {
        errors.push('Weight loaded must be greater than 0');
      } else {
        cleanedRow.weightloaded = num.toString();
      }
    }

    // Distance Travelled validation
    if (cleanedRow.distancetravelled) {
      const cleanNum = cleanedRow.distancetravelled.toString()
        .replace(/[^0-9.-]/g, '')
        .replace(/^"+|"+$/g, '');

      const num = Number(cleanNum);
      if (isNaN(num) || cleanNum === '') {
        errors.push(`Distance travelled must be a number, got "${cleanedRow.distancetravelled}"`);
      } else if (num <= 0) {
        errors.push('Distance travelled must be greater than 0');
      } else {
        cleanedRow.distancetravelled = num.toString();
      }
    }

    // Quality Control validation
    if (cleanedRow.qualitycontrol) {
      const validQC = processQualityControlOptions.map(q => q.value);
      const matchedQC = validQC.find(q =>
        q.toLowerCase() === cleanedRow.qualitycontrol.toLowerCase()
      );
      if (!matchedQC) {
        errors.push(`Invalid quality control "${cleanedRow.qualitycontrol}"`);
      } else {
        cleanedRow.qualitycontrol = matchedQC;
      }
    }

    // Date validation
    if (cleanedRow.postingdate) {
      const isoDate = parseDateToISO(cleanedRow.postingdate);
      if (!isoDate) {
        errors.push(`Invalid date format: "${cleanedRow.postingdate}"`);
      } else {
        cleanedRow.postingdate = isoDate;
      }
    }

    // Remarks validation
    if (cleanedRow.remarks && cleanedRow.remarks.length > 500) {
      errors.push('Remarks cannot exceed 500 characters');
    }

    // Update original row with cleaned values if no errors
    if (errors.length === 0) {
      Object.keys(cleanedRow).forEach(key => {
        row[key] = cleanedRow[key];
      });
    }

    return errors;
  }, [buildings, parseDateToISO]);

  const transformDownstreamPayload = useCallback((row) => {
    const userId = localStorage.getItem('userId');

    const emissionResult = calculateDownstreamTransportationEmission({
      transportationCategory: 'Sold Goods',
      weightLoaded: row.weightloaded ? parseFloat(row.weightloaded) : 0,
      distanceTravelled: row.distancetravelled ? parseFloat(row.distancetravelled) : 0,
      transportationVehicleCategory: row.transportationvehiclecategory,
      transportationVehicleType: row.transportationvehicletype,
    });

    const capitalizeFirstLetter = (text) => {
      if (!text) return "";
      return text.charAt(0).toUpperCase() + text.slice(1);
    };

    return {
      buildingCode: row.buildingcode,
      stakeholder: row.stakeholder,
      transportationCategory: 'Sold Goods',
      soldProductActivityType: row.soldproductactivitytype,
      soldGoodsType: cleanStringValue(row.soldgoodstype),
      transportationVehicleCategory: row.transportationvehiclecategory,
      transportationVehicleType: cleanStringValue(row.transportationvehicletype),
      weightLoaded: cleanNumberValue(row.weightloaded, 'Weight loaded') || 0,
      distanceTravelled: cleanNumberValue(row.distancetravelled, 'Distance travelled') || 0,
      qualityControl: row.qualitycontrol === 'Certain',
      remarks: capitalizeFirstLetter(cleanStringValue(row.remarks) || ''),
      postingDate: row.postingdate,
      calculatedEmissionKgCo2e: emissionResult?.calculatedEmissionKgCo2e || 0,
      calculatedEmissionTCo2e: emissionResult?.calculatedEmissionTCo2e || 0,
      createdBy: userId,
      updatedBy: userId,
    };
  }, []);

  const handleFileSelect = async (file) => {
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
        const rowErrors = validateDownstreamRow(row, index);
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

  const processUpload = async (onSuccess = null) => {
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
          const payload = transformDownstreamPayload(row);

          console.log(`Uploading row ${i + 1}:`, payload);

          await axios.post(
            `${process.env.REACT_APP_BASE_URL}/downstream/Create`,
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

  const downloadDownstreamTemplate = useCallback(() => {
    const exampleBuildings = buildings.slice(0, 1);
    const exampleBuildingCode = exampleBuildings[0]?.buildingCode || 'BLD-EXAMPLE-001';

    const exampleStakeholder = 'Assembly';
    const exampleActivityType = 'Raw Materials';
    const exampleGoodsType = 'Basic iron and steel';
    const exampleVehicleCategory = 'vans';
    const exampleQC = 'Good';

    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    const headers = [
      'Building Code',
      'Stakeholder',
      'Posting Date',
      'Sold Product Activity Type',
      'Sold Goods Type',
      'Transportation Vehicle Category',
      'Transportation Vehicle Type',
      'Weight Loaded',
      'Distance Travelled',
      'Quality Control',
      'Remarks'
    ];

    const exampleRow = [
      exampleBuildingCode,
      exampleStakeholder,
      formattedDate,
      exampleActivityType,
      exampleGoodsType,
      exampleVehicleCategory,
      '',
      '10',
      '500',
      exampleQC,
      'Example downstream transportation record'
    ];

    const worksheetData = [
      headers,
      exampleRow,
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    const colWidths = headers.map(header => ({
      wch: Math.min(Math.max(header.length, 15), 35)
    }));
    worksheet['!cols'] = colWidths;

    const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = {
        font: { bold: true, sz: 12 },
        fill: { fgColor: { rgb: "E0E0E0" } }
      };
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Downstream Transport Template');
    XLSX.writeFile(workbook, 'downstream_transportation_template.xlsx');
  }, [buildings]);

  return {
    csvState,
    handleFileSelect,
    processUpload,
    resetUpload,
    downloadDownstreamTemplate,
  };
};

export default useDownstreamTransportationCSVUpload;

