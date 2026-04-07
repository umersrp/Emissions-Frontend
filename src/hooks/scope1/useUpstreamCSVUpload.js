
// hooks/scope3/useUpstreamTransportationCSVUpload.js
import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as XLSX from "xlsx";
import { calculateUpstreamTransportationEmission } from '@/utils/Scope3/calculateUpstreamTransportation';
import {
  transportationCategoryOptions,
  purchasedGoodsActivityOptions,
  purchasedServicesActivityOptions,
  purchasedGoodsTypeMapping,
  vehicleCategoryOptions,
  vehicleTypeOptions
} from '@/constant/scope3/upstreamTransportation';
import { stakeholderDepartmentOptions, processQualityControlOptions } from '@/constant/scope1/options';

const useUpstreamCSVUpload = (buildings = []) => {
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


  // Helper function to normalize headers
  const normalizeHeader = useCallback((header) => {
    return header
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric characters
      .replace(/\([^)]*\)/g, ''); // Remove anything in parentheses like (tonnes), (km), ($)
  }, []);

  // Clean CSV values
  const cleanCSVValue = useCallback((value) => {
    if (typeof value !== 'string') return value;
    let cleaned = value.trim();
    cleaned = cleaned.replace(/^["']+|["']+$/g, '');
    cleaned = cleaned.replace(/^=/, '');
    return cleaned;
  }, []);

  // Parse date to ISO format
  const parseDateToISO = useCallback((dateString) => {
    if (!dateString) return null;

    let cleaned = dateString.replace(/["']/g, '').trim();

    if (cleaned.includes('T') && cleaned.endsWith('Z')) {
      return cleaned;
    }

    let date = null;

    const ddmmyyyyRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
    let matches = cleaned.match(ddmmyyyyRegex);
    if (matches) {
      const [_, day, month, year] = matches;
      date = new Date(Date.UTC(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        0, 0, 0, 0
      ));
    }

    if (!date || isNaN(date.getTime())) {
      const mmddyyyyRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
      matches = cleaned.match(mmddyyyyRegex);
      if (matches) {
        const [_, month, day, year] = matches;
        date = new Date(Date.UTC(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          0, 0, 0, 0
        ));
      }
    }

    if (!date || isNaN(date.getTime())) {
      const yyyymmddRegex = /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/;
      matches = cleaned.match(yyyymmddRegex);
      if (matches) {
        const [_, year, month, day] = matches;
        date = new Date(Date.UTC(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          0, 0, 0, 0
        ));
      }
    }

    if (!date || isNaN(date.getTime())) {
      date = new Date(cleaned);
    }

    if (date && !isNaN(date.getTime())) {
      return date.toISOString();
    }

    return null;
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
          console.log('Original headers:', headerValues);

          const requiredChecks = [
            { field: 'buildingcode', alternatives: ['buildingcode', 'building', 'building code'] },
            { field: 'stakeholder', alternatives: ['stakeholder', 'stakeholder department', 'department'] },
          ];

          const normalizedHeaders = headerValues.map(h =>
            h.toLowerCase().replace(/[^a-z0-9]/g, '')
          );

          console.log('Normalized headers:', normalizedHeaders);

          const missingFields = [];
          requiredChecks.forEach(check => {
            const found = check.alternatives.some(alt => {
              const normalizedAlt = alt.toLowerCase().replace(/[^a-z0-9]/g, '');
              return normalizedHeaders.some(h => h.includes(normalizedAlt));
            });
            if (!found) {
              missingFields.push(check.field);
            }
          });

          if (missingFields.length > 0) {
            reject(new Error(`Missing required columns: ${missingFields.join(', ')}`));
            return;
          }

          const data = [];
          for (let i = headerRowIndex + 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = parseCSVLine(line);
            const row = {};

            headerValues.forEach((header, index) => {
              row[header] = index < values.length ? cleanCSVValue(values[index]) : '';
            });

            if (Object.values(row).some(val => val && val.toString().trim() !== '')) {
              data.push(row);
            }
          }

          console.log('Parsed CSV data:', data);
          resolve(data);
        } catch (error) {
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
          console.log('Original Excel headers:', headerValues);

          const requiredChecks = [
            { field: 'buildingcode', alternatives: ['buildingcode', 'building', 'building code'] },
            { field: 'stakeholder', alternatives: ['stakeholder', 'stakeholder department', 'department'] },
          ];

          const normalizedHeaders = headerValues.map(h =>
            h ? h.toString().toLowerCase().replace(/[^a-z0-9]/g, '') : ''
          );

          console.log('Normalized Excel headers:', normalizedHeaders);

          const missingFields = [];
          requiredChecks.forEach(check => {
            const found = check.alternatives.some(alt => {
              const normalizedAlt = alt.toLowerCase().replace(/[^a-z0-9]/g, '');
              return normalizedHeaders.some(h => h.includes(normalizedAlt));
            });
            if (!found) {
              missingFields.push(check.field);
            }
          });

          if (missingFields.length > 0) {
            reject(new Error(`Missing required columns: ${missingFields.join(', ')}`));
            return;
          }

          const parsedData = [];
          for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.every(cell => !cell || cell.toString().trim() === '')) continue;

            const rowData = {};
            headerValues.forEach((header, index) => {
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

  // Validate each row
// Validate each row
const validateRow = useCallback((row, index) => {
  const errors = [];

  // ========== SIMPLE HELPER FUNCTIONS ==========
  const isNA = (value) => {
    if (!value) return true;
    const val = value.toString().toLowerCase().trim();
    return val === 'n/a' || val === 'na' || val === '';
  };

  const cleanValue = (value) => {
    if (isNA(value)) return null;
    return value.toString().trim();
  };

  const cleanNumber = (value, fieldName) => {
    if (isNA(value)) return null;
    
    const num = Number(value);
    if (isNaN(num)) {
      errors.push(`${fieldName} must be a number, got "${value}"`);
      return null;
    }
    if (num < 0) {
      errors.push(`${fieldName} cannot be negative`);
      return null;
    }
    return num;
  };
  // =============================================

  const headerMapping = {
    'buildingcode': 'buildingcode',
    'building': 'buildingcode',
    'buildingcode': 'buildingcode',
    'stakeholder': 'stakeholder',
    'stakeholderdepartment': 'stakeholder',
    'department': 'stakeholder',
    'transportationanddistributioncategory': 'transportationcategory',
    'transportationcategory': 'transportationcategory',
    'category': 'transportationcategory',
    'purchasedproductactivitytype': 'activitytype',
    'activitytype': 'activitytype',
    'activity': 'activitytype',
    'purchasedgoodstype': 'purchasedgoodstype',
    'goodstype': 'purchasedgoodstype',
    'transportationvehiclecategory': 'vehiclecategory',
    'vehiclecategory': 'vehiclecategory',
    'transportationvehicletype': 'vehicletype',
    'vehicletype': 'vehicletype',
    'weightloadedtonnes': 'weightloaded',
    'weight': 'weightloaded',
    'distancetravelledkm': 'distancetravelled',
    'distance': 'distancetravelled',
    'amountspent': 'amountspent',
    'amount': 'amountspent',
    'spent': 'amountspent',
    'unit': 'unit',
    'qualitycontrol': 'qualitycontrol',
    'quality': 'qualitycontrol',
    'qc': 'qualitycontrol',
    'remarks': 'remarks',
    'remark': 'remarks',
    'note': 'remarks',
    'postingdate': 'postingdate',
    'date': 'postingdate',
  };

  const cleanedRow = {};

  // Use the normalizeHeader helper
  Object.keys(row).forEach(key => {
    const normalizedKey = normalizeHeader(key);
    const mappedKey = headerMapping[normalizedKey] || normalizedKey;
    cleanedRow[mappedKey] = row[key]?.toString().trim() || '';
  });

  console.log(`Validating row ${index + 1}:`, cleanedRow);

  const requiredFields = [
    'buildingcode', 'stakeholder', 'transportationcategory', 'activitytype',
    'qualitycontrol', 'postingdate'
  ];

  requiredFields.forEach(field => {
    const val = cleanedRow[field];
    if (isNA(val)) {
      errors.push(`${field} is required`);
    }
  });

  if (errors.length > 0) {
    return errors;
  }

  // Building validation
  if (!isNA(cleanedRow.buildingcode) && buildings.length > 0) {
    const buildingExists = buildings.some(b =>
      b.buildingCode && b.buildingCode.toLowerCase() === cleanedRow.buildingcode.toLowerCase()
    );
    if (!buildingExists) {
      errors.push(`Invalid building code "${cleanedRow.buildingcode}"`);
    }
  }

  // Stakeholder validation
  if (!isNA(cleanedRow.stakeholder)) {
    const validStakeholders = stakeholderDepartmentOptions.map(s => s.value);
    const matched = validStakeholders.find(s =>
      s.toLowerCase() === cleanedRow.stakeholder.toLowerCase()
    );
    if (!matched) {
      errors.push(`Invalid stakeholder "${cleanedRow.stakeholder}". Valid options: ${validStakeholders.slice(0, 5).join(', ')}...`);
    } else {
      cleanedRow.stakeholder = matched;
    }
  } else {
    errors.push('Stakeholder is required');
  }

  // Transportation Category validation
  if (!isNA(cleanedRow.transportationcategory)) {
    const categoryMap = {
      'purchased goods': 'purchasedGoods',
      'purchased services': 'purchasedServices',
    };

    const lowerCategory = cleanedRow.transportationcategory.toLowerCase();
    const mappedCategory = categoryMap[lowerCategory];

    if (!mappedCategory) {
      errors.push(`Invalid transportation category "${cleanedRow.transportationcategory}". Expected "Purchased Goods" or "Purchased Services"`);
    } else {
      cleanedRow.transportationcategory = mappedCategory;
    }
  } else {
    errors.push('Transportation category is required');
  }

  // Activity Type validation
  if (!isNA(cleanedRow.activitytype) && cleanedRow.transportationcategory) {
    if (cleanedRow.transportationcategory === 'purchasedGoods') {
      const validActivities = purchasedGoodsActivityOptions.map(a => a.value);
      const matchedActivity = validActivities.find(a =>
        a.toLowerCase() === cleanedRow.activitytype.toLowerCase()
      );
      if (!matchedActivity) {
        errors.push(`Invalid activity type "${cleanedRow.activitytype}" for purchased goods. Valid options: ${validActivities.slice(0, 5).join(', ')}...`);
      } else {
        cleanedRow.activitytype = matchedActivity;
      }
    } else if (cleanedRow.transportationcategory === 'purchasedServices') {
      const validActivities = purchasedServicesActivityOptions.map(a => a.value);
      const matchedActivity = validActivities.find(a =>
        a.toLowerCase() === cleanedRow.activitytype.toLowerCase()
      );
      if (!matchedActivity) {
        errors.push(`Invalid activity type "${cleanedRow.activitytype}" for purchased services. Valid options: ${validActivities.slice(0, 5).join(', ')}...`);
      } else {
        cleanedRow.activitytype = matchedActivity;
      }
    }
  } else {
    errors.push('Activity type is required');
  }

  // Purchased Goods Type validation
  if (cleanedRow.activitytype && !isNA(cleanedRow.purchasedgoodstype)) {
    const goodsOptions = purchasedGoodsTypeMapping[cleanedRow.activitytype] || [];
    const matchedGoods = goodsOptions.find(g =>
      g.value.toLowerCase() === cleanedRow.purchasedgoodstype.toLowerCase()
    );
    if (goodsOptions.length > 0 && !matchedGoods) {
      errors.push(`Invalid purchased goods type "${cleanedRow.purchasedgoodstype}" for activity "${cleanedRow.activitytype}"`);
    } else if (matchedGoods) {
      cleanedRow.purchasedgoodstype = matchedGoods.value;
    }
  }

  // Vehicle Category validation for purchasedGoods
  if (cleanedRow.transportationcategory === 'purchasedGoods') {
    if (isNA(cleanedRow.vehiclecategory)) {
      errors.push('Vehicle category is required for purchased goods');
    } else {
      const trimmedCategory = cleanedRow.vehiclecategory.toString().trim();

      let matched = vehicleCategoryOptions.find(v =>
        v.value.toLowerCase() === trimmedCategory.toLowerCase()
      );

      if (!matched) {
        matched = vehicleCategoryOptions.find(v =>
          v.label.toLowerCase() === trimmedCategory.toLowerCase()
        );
      }

      if (!matched) {
        errors.push(`Invalid vehicle category "${cleanedRow.vehiclecategory}". Valid options: ${vehicleCategoryOptions.map(v => v.label).join(', ')}`);
      } else {
        cleanedRow.vehiclecategory = matched.value;
      }
    }
  }

  // Vehicle Type validation
  if (cleanedRow.vehiclecategory && !isNA(cleanedRow.vehicletype)) {
    const validTypes = vehicleTypeOptions[cleanedRow.vehiclecategory] || [];
    const trimmedType = cleanedRow.vehicletype.toString().trim();

    let matched = validTypes.find(t =>
      t.value.toLowerCase() === trimmedType.toLowerCase()
    );

    if (!matched) {
      matched = validTypes.find(t =>
        t.label?.toLowerCase() === trimmedType.toLowerCase()
      );
    }

    if (validTypes.length > 0 && !matched) {
      errors.push(`Invalid vehicle type "${cleanedRow.vehicletype}" for category "${cleanedRow.vehiclecategory}". Valid options: ${validTypes.map(t => t.label || t.value).join(', ')}`);
    } else if (matched) {
      cleanedRow.vehicletype = matched.value;
    }
  }

  // Numeric validations for purchased goods
  if (cleanedRow.transportationcategory === 'purchasedGoods') {
    // Weight Loaded validation
    const weightLoaded = cleanNumber(cleanedRow.weightloaded, 'Weight loaded');
    if (weightLoaded === null && !isNA(cleanedRow.weightloaded)) {
      // Error already pushed by cleanNumber
    } else if (weightLoaded === null && isNA(cleanedRow.weightloaded)) {
      errors.push('Weight loaded is required for purchased goods');
    } else {
      cleanedRow.weightloaded = weightLoaded;
    }

    // Distance Travelled validation
    const distanceTravelled = cleanNumber(cleanedRow.distancetravelled, 'Distance travelled');
    if (distanceTravelled === null && !isNA(cleanedRow.distancetravelled)) {
      // Error already pushed by cleanNumber
    } else if (distanceTravelled === null && isNA(cleanedRow.distancetravelled)) {
      errors.push('Distance travelled is required for purchased goods');
    } else {
      cleanedRow.distancetravelled = distanceTravelled;
    }
  }

  // Numeric validations for purchased services
  if (cleanedRow.transportationcategory === 'purchasedServices') {
    const amountSpent = cleanNumber(cleanedRow.amountspent, 'Amount spent');
    if (amountSpent === null && !isNA(cleanedRow.amountspent)) {
      // Error already pushed by cleanNumber
    } else if (amountSpent === null && isNA(cleanedRow.amountspent)) {
      errors.push('Amount spent is required for purchased services');
    } else {
      cleanedRow.amountspent = amountSpent;
    }
  }

  // Quality Control validation
  if (!isNA(cleanedRow.qualitycontrol)) {
    const validQC = processQualityControlOptions.map(q => q.value);
    const matched = validQC.find(q =>
      q.toLowerCase() === cleanedRow.qualitycontrol.toLowerCase()
    );
    if (!matched) {
      errors.push(`Invalid quality control "${cleanedRow.qualitycontrol}"`);
    } else {
      cleanedRow.qualitycontrol = matched;
    }
  } else {
    errors.push('Quality control is required');
  }

  // Date validation
  if (!isNA(cleanedRow.postingdate)) {
    const isoDate = parseDateToISO(cleanedRow.postingdate);

    if (!isoDate) {
      errors.push(`Invalid date format "${cleanedRow.postingdate}". Please use DD/MM/YYYY format (e.g., 17/02/2026)`);
    } else {
      const datePart = isoDate.split('T')[0];
      const date = new Date(datePart);

      if (isNaN(date.getTime())) {
        errors.push(`Invalid date "${cleanedRow.postingdate}"`);
      } else if (date > new Date()) {
        errors.push('Date cannot be in the future');
      } else {
        cleanedRow.postingdate = isoDate;
      }
    }
  } else {
    errors.push('Posting date is required');
  }

  // Remarks validation
  if (!isNA(cleanedRow.remarks) && cleanedRow.remarks.length > 500) {
    errors.push('Remarks cannot exceed 500 characters');
  }

  if (errors.length === 0) {
    Object.keys(cleanedRow).forEach(key => {
      row[key] = cleanedRow[key];
    });
  }

  return errors;
}, [buildings, parseDateToISO, normalizeHeader]);

  // Transform row to API payload
  const transformToPayload = useCallback((row) => {
    let calculatedEmissions = {};
    if (row.transportationcategory === 'purchasedGoods') {
      calculatedEmissions = calculateUpstreamTransportationEmission({
        transportationCategory: 'purchasedGoods',
        weightLoaded: parseFloat(row.weightloaded),
        distanceTravelled: parseFloat(row.distancetravelled),
        vehicleCategory: row.vehiclecategory,
        vehicleType: row.vehicletype,
      }) || {};
    } else if (row.transportationcategory === 'purchasedServices') {
      calculatedEmissions = calculateUpstreamTransportationEmission({
        transportationCategory: 'purchasedServices',
        amountSpent: parseFloat(row.amountspent),
        activityType: row.activitytype,
        unit: 'USD',
      }) || {};
    }

    const capitalizeFirstLetter = (text) => {
      if (!text) return "";
      return text.charAt(0).toUpperCase() + text.slice(1);
    };

    return {
    buildingCode: row.buildingcode,
    stakeholderDepartment: row.stakeholder,
    transportationCategory: row.transportationcategory,
    activityType: row.activitytype,
    purchasedGoodsType: cleanStringValue(row.purchasedgoodstype) || '',
    vehicleCategory: cleanStringValue(row.vehiclecategory) || '',
    vehicleType: cleanStringValue(row.vehicletype) || '',
    weightLoaded: cleanNumberValue(row.weightloaded),
    distanceTravelled: cleanNumberValue(row.distancetravelled),
    amountSpent: cleanNumberValue(row.amountspent),
    unit: row.transportationcategory === 'purchasedServices' ? 'USD' : '',
    qualityControl: row.qualitycontrol,
    remarks: capitalizeFirstLetter(cleanStringValue(row.remarks) || ''),
    calculatedEmissionKgCo2e: calculatedEmissions.calculatedEmissionKgCo2e || 0,
    calculatedEmissionTCo2e: calculatedEmissions.calculatedEmissionTCo2e || 0,
    postingDate: row.postingdate,
    };
  }, []);

  // Handle file selection
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
        const rowErrors = validateRow(row, index);
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

  // Process upload
  const processUpload = async (onSuccess = null) => {
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
          const payload = transformToPayload(row);

          await axios.post(
            `${process.env.REACT_APP_BASE_URL}/upstream/Create`,
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
          results.errors.push({
            row: i + 1,
            error: error.response?.data?.message || error.message
          });
        }

        const currentProgress = Math.round(((i + 1) / totalRows) * 100);
        if (currentProgress % 10 === 0 || i === totalRows - 1) {
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
      }, 1000);

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

  // Reset upload state
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

  // Download template
  const downloadTemplate = useCallback(() => {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    const headers = [
      'Building Code',
      'Stakeholder',
      'Transportation and Distribution Category',
      'Purchased Product Activity Type',
      'Purchased Goods Type',
      'Transportation Vehicle Category',
      'Transportation Vehicle Type',
      'Weight Loaded (tonnes)',
      'Distance Travelled (km)',
      'Amount Spent ($)',
      'Unit',
      'Quality Control',
      'Remarks',
      'Posting Date'
    ];

    const exampleRows = [
      [
        'BLD-8182',
        'Assembly',
        'Purchased Goods',
        'Raw Materials',
        'Petrochemicals',
        'Freight Flights',
        'International',
        '100',
        '500',
        '',
        '',
        'Good',
        'Steel shipment',
        formattedDate
      ],
      [
        'BLD-1147',
        'Assembly',
        'Purchased Services',
        'Warehousing and support services for transportation',
        '',
        '',
        '',
        '',
        '',
        '5000',
        'USD',
        'Fair',
        'Warehouse services',
        formattedDate
      ]
    ];

    const worksheetData = [
      headers,
      ...exampleRows,
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    const colWidths = headers.map(header => ({
      wch: Math.min(Math.max(header.length, 15), 45)
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

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Upstream Transport Template');
    XLSX.writeFile(workbook, 'upstream_transportation_template.xlsx');
  }, []);

  return {
    csvState,
    handleFileSelect,
    processUpload,
    resetUpload,
    downloadTemplate,
  };
};

export default useUpstreamCSVUpload;