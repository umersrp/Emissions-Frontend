
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import * as XLSX from "xlsx";
import { calculateMobileCombustion } from '@/utils/scope1/calculate-mobile-combuction';
import {
  FugitiveAndMobileStakeholderOptions,
  vehicleClassificationOptions,
  vehicleTypeOptionsByClassification,
  fuelNameOptionsByClassification,
  distanceUnitOptions,
  qualityControlOptions,
  weightLoadedOptions,
} from '@/constant/scope1/options';

const useMobileCSVUpload = (buildings = []) => {
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

  const cleanValue = useCallback((value) => {
    if (typeof value !== 'string') return value;
    return value.replace(/["']/g, '').trim();
  }, []);

  // CSV Parser
  const parseCSV = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const csvText = event.target.result;

          // Robust CSV parser
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

          // Find header row
          let headerRowIndex = -1;
          for (let i = 0; i < lines.length; i++) {
            const compactLine = lines[i]
              .replace(/['"]/g, '')
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '');

            if (compactLine.includes('buildingcode') && compactLine.includes('stakeholder')) {
              headerRowIndex = i;
              break;
            }
          }

          if (headerRowIndex === -1) {
            reject(new Error('CSV must contain header row with: buildingCode, stakeholder, vehicleClassification, vehicleType, fuelName, distanceTravelled, distanceUnit, qualityControl, weightLoaded, remarks, postingDate'));
            return;
          }

          // Parse headers
          const headerValues = parseCSVLine(lines[headerRowIndex]);
          const headers = headerValues.map(h =>
            cleanValue(h).toLowerCase().replace(/[^a-z0-9]/g, '')
          );

          // Expected headers
          const expectedHeaders = [
            'buildingcode', 'stakeholder', 'vehicleclassification', 'vehicletype',
            'fuelname', 'distancetravelled', 'distanceunit', 'qualitycontrol',
            'weightloaded', 'remarks', 'postingdate'
          ];

          // Check for missing headers
          const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
          if (missingHeaders.length > 0) {
            reject(new Error(`Missing required columns: ${missingHeaders.join(', ')}`));
            return;
          }

          // Parse data rows
          const data = [];
          for (let i = headerRowIndex + 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = parseCSVLine(line);

            const row = {};
            headers.forEach((header, index) => {
              row[header] = index < values.length ? cleanValue(values[index]) : '';
            });

            if (Object.values(row).some(val => val && val.toString().trim() !== '')) {
              data.push(row);
            }
          }

          console.log('Parsed CSV data:', JSON.stringify(data, null, 2));
          resolve(data);
        } catch (error) {
          reject(new Error(`Error parsing CSV: ${error.message}`));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, [cleanValue]);

  // Excel Parser
  // Excel Parser - Updated to preserve number formatting
  const parseExcel = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, {
            type: 'array',
            cellDates: false, // Don't convert dates automatically
            cellText: true,   // Keep cell text
            cellNF: true,     // Keep number formats
            cellHTML: false
          });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

          // Use raw: false to get formatted values
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
            header: 1,
            defval: '',
            raw: false  // This will return formatted values (e.g., "50%" instead of 0.5)
          });

          if (!jsonData || jsonData.length === 0) {
            reject(new Error('Excel file is empty'));
            return;
          }

          // Find header row
          let headerRowIndex = -1;
          for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row && row.length > 0) {
              const rowText = row.map(cell =>
                cell ? cell.toString().toLowerCase().replace(/[^a-z0-9]/g, '') : ''
              ).join('');

              if (rowText.includes('buildingcode') && rowText.includes('stakeholder')) {
                headerRowIndex = i;
                break;
              }
            }
          }

          if (headerRowIndex === -1) {
            reject(new Error('Excel must contain header row with: buildingCode, stakeholder, vehicleClassification, vehicleType, fuelName, distanceTravelled, distanceUnit, qualityControl, weightLoaded, remarks, postingDate'));
            return;
          }

          // Get headers
          const headers = jsonData[headerRowIndex].map(header =>
            cleanValue(header).toLowerCase().replace(/[^a-z0-9]/g, '')
          );

          // Expected headers
          const expectedHeaders = [
            'buildingcode', 'stakeholder', 'vehicleclassification', 'vehicletype',
            'fuelname', 'distancetravelled', 'distanceunit', 'qualitycontrol',
            'weightloaded', 'remarks', 'postingdate'
          ];

          // Check for missing headers
          const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
          if (missingHeaders.length > 0) {
            reject(new Error(`Missing required columns: ${missingHeaders.join(', ')}`));
            return;
          }

          // Parse data rows
          const parsedData = [];
          for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.every(cell => !cell || cell.toString().trim() === '')) continue;

            const rowData = {};
            headers.forEach((header, index) => {
              let value = index < row.length ? row[index] : '';

              // Special handling for weight loaded to preserve percentage format
              if (header === 'weightloaded' && value) {
                // If value is a number (like 0.5), convert to percentage string
                if (typeof value === 'number') {
                  const percentage = value * 100;
                  if (percentage === 0) value = '0%';
                  else if (percentage === 50) value = '50%';
                  else if (percentage === 100) value = '100%';
                  else value = `${percentage}%`;
                }
                // If value is already a string, keep as is
              }

              rowData[header] = value ? cleanValue(value) : '';
            });

            parsedData.push(rowData);
          }

          console.log('Parsed Excel data:', JSON.stringify(parsedData, null, 2));
          resolve(parsedData);
        } catch (error) {
          reject(new Error(`Error parsing Excel file: ${error.message}`));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }, [cleanValue]);

  const validateMobileRow = useCallback((row, index) => {
    const errors = [];
    const cleanedRow = {};

    // Clean all row values
    Object.keys(row).forEach(key => {
      cleanedRow[key] = cleanValue(row[key]);
    });

    // Normalize helper - removes all spaces and lowercases for comparison
    const normalize = (str) => str?.toLowerCase().replace(/\s+/g, '') || '';

    // Required fields validation
    const requiredFields = [
      'buildingcode', 'stakeholder', 'vehicleclassification', 'vehicletype',
      'fuelname', 'distancetravelled', 'distanceunit', 'qualitycontrol', 'postingdate'
    ];

    requiredFields.forEach(field => {
      if (!cleanedRow[field] || cleanedRow[field] === '') {
        errors.push(`${field} is required`);
      }
    });

    // Building validation
    if (cleanedRow.buildingcode && buildings.length > 0) {
      const buildingExists = buildings.some(b =>
        (b.buildingCode && b.buildingCode.toLowerCase() === cleanedRow.buildingcode.toLowerCase()) ||
        (b._id && b._id.toString() === cleanedRow.buildingcode)
      );
      if (!buildingExists) {
        errors.push(`Invalid building code "${cleanedRow.buildingcode}". Available: ${buildings.slice(0, 3).map(b => b.buildingCode || b._id).join(', ')}...`);
      } else {
        const matched = buildings.find(b => b.buildingCode && b.buildingCode.toLowerCase() === cleanedRow.buildingcode.toLowerCase());
        if (matched && matched.buildingCode) cleanedRow.buildingcode = matched.buildingCode;
      }
    }

    // Stakeholder validation
    if (cleanedRow.stakeholder) {
      const validStakeholders = FugitiveAndMobileStakeholderOptions.map(s => s.value);
      const matchedStakeholder = validStakeholders.find(s =>
        normalize(s) === normalize(cleanedRow.stakeholder)
      );
      if (!matchedStakeholder) {
        errors.push(`Invalid stakeholder "${cleanedRow.stakeholder}"`);
      } else {
        cleanedRow.stakeholder = matchedStakeholder;
      }
    }

    // Vehicle classification validation
    if (cleanedRow.vehicleclassification) {
      const validClassifications = vehicleClassificationOptions.map(v => v.value);
      const matchedClassification = validClassifications.find(v =>
        normalize(v) === normalize(cleanedRow.vehicleclassification)
      );
      if (!matchedClassification) {
        errors.push(`Invalid vehicle classification "${cleanedRow.vehicleclassification}"`);
      } else {
        cleanedRow.vehicleclassification = matchedClassification;
      }
    }

    // Vehicle type validation based on classification
    if (cleanedRow.vehicleclassification && cleanedRow.vehicletype) {
      const validTypes = vehicleTypeOptionsByClassification[cleanedRow.vehicleclassification]?.map(v => v.value) || [];
      const matchedType = validTypes.find(v =>
        normalize(v) === normalize(cleanedRow.vehicletype)
      );
      if (!matchedType) {
        errors.push(`Invalid vehicle type "${cleanedRow.vehicletype}" for classification "${cleanedRow.vehicleclassification}"`);
      } else {
        cleanedRow.vehicletype = matchedType;
      }
    }

    // Fuel name validation based on classification
    if (cleanedRow.vehicleclassification && cleanedRow.fuelname) {
      const validFuels = fuelNameOptionsByClassification[cleanedRow.vehicleclassification]?.map(f => f.value) || [];
      const matchedFuel = validFuels.find(f =>
        normalize(f) === normalize(cleanedRow.fuelname)
      );
      if (!matchedFuel) {
        errors.push(`Invalid fuel name "${cleanedRow.fuelname}" for classification "${cleanedRow.vehicleclassification}"`);
      } else {
        cleanedRow.fuelname = matchedFuel;
      }
    }

    // Distance traveled validation
    if (cleanedRow.distancetravelled) {
      const cleanNum = cleanedRow.distancetravelled.toString().replace(/[^0-9.-]/g, '');
      const num = Number(cleanNum);
      if (isNaN(num)) {
        errors.push(`Distance traveled must be a number, got "${cleanedRow.distancetravelled}"`);
      } else if (num < 0) {
        errors.push('Distance traveled cannot be negative');
      } else if (num > 10000000) {
        errors.push('Distance traveled seems too large');
      } else {
        cleanedRow.distancetravelled = num.toString();
      }
    }

    // Distance unit validation
    if (cleanedRow.distanceunit) {
      const validUnits = distanceUnitOptions.map(u => u.value);
      const matchedUnit = validUnits.find(u =>
        normalize(u) === normalize(cleanedRow.distanceunit)
      );
      if (!matchedUnit) {
        errors.push(`Invalid distance unit "${cleanedRow.distanceunit}"`);
      } else {
        cleanedRow.distanceunit = matchedUnit;
      }
    }

    // Quality control validation
    if (cleanedRow.qualitycontrol) {
      const validQC = qualityControlOptions.map(q => q.value);
      const matchedQC = validQC.find(q =>
        normalize(q) === normalize(cleanedRow.qualitycontrol)
      );
      if (!matchedQC) {
        errors.push(`Invalid quality control "${cleanedRow.qualitycontrol}"`);
      } else {
        cleanedRow.qualitycontrol = matchedQC;
      }
    }
    // Weight loaded validation (conditional)
    const isHGV = cleanedRow.vehicleclassification === "Heavy Good Vehicles (HGVs All Diesel)" ||
      cleanedRow.vehicleclassification === "Heavy Good Vehicles (Refrigirated HGVs All Diesel)";

    if (isHGV && cleanedRow.weightloaded) {
      const validWeights = weightLoadedOptions.map(w => w.value);

      const normalizeWeight = (weight) => {
        if (!weight) return weight;

        let weightStr = String(weight).trim();

        // Check if it's a decimal number (from Excel parsing percentages)
        // Handle cases like 0.5 (which is 50%), 1 (which is 100%), etc.
        const decimalNumber = parseFloat(weightStr);
        if (!isNaN(decimalNumber) && weightStr.match(/^[\d.]+$/)) {
          // Convert decimal to percentage format
          const percentageValue = decimalNumber * 100;
          if (percentageValue === 0) return "0%";
          if (percentageValue === 50) return "50%";
          if (percentageValue === 100) return "100%";
          // If it's a different number, format it as percentage
          return `${percentageValue}%`;
        }

        // Check for percentage with decimal places (e.g., "0.00%", "50.00%", "100.00%")
        const decimalPattern = /^(\d+(?:\.\d+)?)%$/;
        const match = weightStr.match(decimalPattern);

        if (match) {
          const number = parseFloat(match[1]);
          if (number === 0) return "0%";
          if (number === 50) return "50%";
          if (number === 100) return "100%";
          // If it's a different number, keep the original format
          return weightStr;
        }

        // Check for simple percentage format (e.g., "0%", "50%", "100%")
        const simplePattern = /^(\d+)%$/;
        const simpleMatch = weightStr.match(simplePattern);
        if (simpleMatch) {
          const number = parseInt(simpleMatch[1]);
          if (number === 0) return "0%";
          if (number === 50) return "50%";
          if (number === 100) return "100%";
          return weightStr;
        }

        // Check for "Average" (case insensitive)
        if (weightStr.toLowerCase() === "average") {
          return "Average";
        }

        // If it's already in the standard format
        if (validWeights.includes(weightStr)) {
          return weightStr;
        }

        return null;
      };

      const normalizedWeight = normalizeWeight(cleanedRow.weightloaded);

      if (!normalizedWeight) {
        errors.push(`Invalid weight loaded "${cleanedRow.weightloaded}". Accepted values: 0%, 0.00%, 50%, 50.00%, 100%, 100.00%, Average`);
      } else {
        cleanedRow.weightloaded = normalizedWeight;
      }
    }
    // Date validation
   // Date validation
if (cleanedRow.postingdate) {
  const parseToISODatePart = (input) => {
    if (!input) return null;
    let s = input.toString().trim().replace(/"/g, '');
    if (s.includes('T')) s = s.split('T')[0];
    
    // Remove any extra spaces
    s = s.trim();
    
    // Check for DD/MM/YYYY format
    const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const matchDDMMYYYY = s.match(ddmmyyyyRegex);
    
    if (matchDDMMYYYY) {
      const day = parseInt(matchDDMMYYYY[1], 10);
      const month = parseInt(matchDDMMYYYY[2], 10);
      const year = parseInt(matchDDMMYYYY[3], 10);
      
      // Validate day, month, year ranges
      if (month < 1 || month > 12) return null;
      if (day < 1 || day > 31) return null;
      if (year < 1900 || year > 2100) return null;
      
      const date = new Date(year, month - 1, day);
      
      // Validate the date is real (e.g., not 31/02/2025)
      if (date.getFullYear() !== year || 
          date.getMonth() !== month - 1 || 
          date.getDate() !== day) {
        return null;
      }
      
      // Check if date is in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date > today) return null;
      
      // Return ISO format
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    
    // Check for YYYY-MM-DD format
    const yyyymmddRegex = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
    const matchYYYYMMDD = s.match(yyyymmddRegex);
    
    if (matchYYYYMMDD) {
      const year = parseInt(matchYYYYMMDD[1], 10);
      const month = parseInt(matchYYYYMMDD[2], 10);
      const day = parseInt(matchYYYYMMDD[3], 10);
      
      // Validate ranges
      if (month < 1 || month > 12) return null;
      if (day < 1 || day > 31) return null;
      if (year < 1900 || year > 2100) return null;
      
      const date = new Date(year, month - 1, day);
      
      if (date.getFullYear() !== year || 
          date.getMonth() !== month - 1 || 
          date.getDate() !== day) {
        return null;
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date > today) return null;
      
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    
    // Try parsing with Date constructor as fallback
    const parsed = new Date(s);
    if (!isNaN(parsed.getTime())) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (parsed <= today) {
        return parsed.toISOString().split('T')[0];
      }
    }
    
    return null;
  };

  const iso = parseToISODatePart(cleanedRow.postingdate);
  if (!iso) {
    errors.push(`Invalid date. Please use DD/MM/YYYY or YYYY-MM-DD (got "${cleanedRow.postingdate}")`);
  } else {
    cleanedRow.postingdate = iso;
  }
} else {
  // If no date provided, use current date
  cleanedRow.postingdate = new Date().toISOString().split('T')[0];
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
  }, [buildings, cleanValue]);

  const transformMobilePayload = useCallback((row) => {
    const isHGV = row.vehicleclassification === "Heavy Good Vehicles (HGVs All Diesel)" ||
      row.vehicleclassification === "Heavy Good Vehicles (Refrigirated HGVs All Diesel)";

    // Normalize weight loaded for HGV vehicles
    const normalizeWeightLoaded = (weight) => {
      if (!weight) return null;
      let weightStr = weight.toString().trim();

      // Handle decimal numbers (0.5 -> 50%)
      const decimalNum = parseFloat(weightStr);
      if (!isNaN(decimalNum) && weightStr.match(/^[\d.]+$/)) {
        const percentage = decimalNum * 100;
        if (percentage === 0) return "0%";
        if (percentage === 50) return "50%";
        if (percentage === 100) return "100%";
        return `${percentage}%`;
      }

      // Handle percentage strings (0.00%, 50.00%, 100.00%)
      const percentageMatch = weightStr.match(/^(\d+(?:\.\d+)?)%$/);
      if (percentageMatch) {
        const num = parseFloat(percentageMatch[1]);
        if (num === 0) return "0%";
        if (num === 50) return "50%";
        if (num === 100) return "100%";
        return weightStr;
      }

      // Handle "Average" (case insensitive)
      if (weightStr.toLowerCase() === "average") return "Average";

      return weightStr;
    };

    const result = calculateMobileCombustion(
      isHGV ? null : row.fuelname,
      Number(row.distancetravelled),
      row.distanceunit,
      row.vehicletype,
      row.vehicleclassification,
      isHGV ? normalizeWeightLoaded(row.weightloaded) : null
    );

    return {
      buildingCode: row.buildingcode?.trim() || '',
      stakeholder: row.stakeholder,
      vehicleClassification: row.vehicleclassification,
      vehicleType: row.vehicletype,
      fuelName: row.fuelname,
      distanceTraveled: row.distancetravelled ? Number(row.distancetravelled) : null,
      distanceUnit: row.distanceunit?.trim() || null,
      qualityControl: row.qualitycontrol,
      weightLoaded: isHGV ? normalizeWeightLoaded(row.weightloaded) : null,
      calculatedEmissionKgCo2e: result?.totalEmissionKg || 0,
      calculatedEmissionTCo2e: result?.totalEmissionTonnes || 0,
      remarks: row.remarks?.trim() || '',
      postingDate: row.postingdate || new Date().toISOString().split('T')[0],
    };
  }, []); // Remove dependencies since we're not using cleanNumberValue/cleanStringValue
  const processUpload = useCallback(async (onSuccess = null) => {
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
          const payload = transformMobilePayload(row);

          const response = await fetch(`${process.env.REACT_APP_BASE_URL}/AutoMobile/Create`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Upload failed');
          }

          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            error: error.message
          });
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
  }, [csvState, transformMobilePayload]);

  const handleFileSelect = useCallback(async (file) => {
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
      // Choose parser based on file extension
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

      // Log raw data for debugging
      console.log('📥 RAW FILE DATA:', data);
      console.log('🔑 RAW KEYS:', Object.keys(data[0]));

      // Normalize keys: "building code" -> "buildingcode", etc.
      const normalizedData = data.map(row => {
        const normalizedRow = {};
        Object.keys(row).forEach(key => {
          const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
          normalizedRow[normalizedKey] = row[key];
        });
        return normalizedRow;
      });

      console.log('🔍 NORMALIZED DATA (sent to validation):', normalizedData);
      console.log('🔍 STAKEHOLDER VALUE:', JSON.stringify(normalizedData[0]?.stakeholder));

      const errors = [];
      normalizedData.forEach((row, index) => {
        const rowErrors = validateMobileRow(row, index);
        if (rowErrors.length > 0) {
          errors.push(`Row ${index + 2}: ${rowErrors.join(', ')}`);
        }
      });

      console.log('❌ VALIDATION ERRORS:', errors);

      setCsvState(prev => ({
        ...prev,
        file,
        parsedData: normalizedData,
        validationErrors: errors,
      }));

      if (errors.length === 0) {
        toast.success(`File validated: ${normalizedData.length} rows ready for upload`);
      } else {
        toast.warning(`Found ${errors.length} validation errors. Please fix them before uploading.`);
      }

      return normalizedData;
    } catch (error) {
      toast.error(`Error parsing file: ${error.message}`);
      console.error('File parsing error:', error);
      return null;
    }
  }, [parseCSV, parseExcel, validateMobileRow]);

  const resetUpload = useCallback(() => {
    setCsvState({
      file: null,
      uploading: false,
      progress: 0,
      results: null,
      validationErrors: [],
      parsedData: null,
    });
  }, []);

  const downloadMobileTemplate = useCallback(() => {
    const exampleBuildingCode = buildings[0]?.buildingCode || 'BLD-EXAMPLE-001';

    // Create worksheet data with headers
    const worksheetData = [
      [
        'Building Code',
        'Stakeholder',
        'Vehicle Classification',
        'Vehicle Type',
        'Fuel Name',
        'Distance Travelled',
        'Distance Unit',
        'Quality Control',
        'Weight Loaded',
        'Remarks',
        'Posting Date'
      ],
      [
      exampleBuildingCode,
      'Assembly',
      'By Market Segment',
      'Mini - City or A-Segment Passenger Cars (600 cc - 1200 cc)',
      'Diesel',
      '50',
      'km',
      'Highly Uncertain',
      '',
      'Example record',
      'dd/mm/yyyy'
      ],
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Auto-size columns for better readability
    worksheet['!cols'] = [
      { wch: 20 }, // building code
      { wch: 15 }, // stakeholder
      { wch: 25 }, // vehicle classification
      { wch: 35 }, // vehicle type
      { wch: 15 }, // fuel name
      { wch: 20 }, // distance travelled
      { wch: 15 }, // distance unit
      { wch: 20 }, // quality control
      { wch: 15 }, // weight loaded
      { wch: 30 }, // remarks
      { wch: 15 }  // posting date
    ];

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mobile Template');

    // Download the Excel file
    XLSX.writeFile(workbook, 'mobile_template.xlsx');
  }, [buildings]);

  return {
    csvState,
    handleFileSelect,
    processUpload,
    resetUpload,
    downloadMobileTemplate,
  };
};

export default useMobileCSVUpload;

