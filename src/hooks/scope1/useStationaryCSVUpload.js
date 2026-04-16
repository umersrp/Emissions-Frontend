import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { calculateStationaryEmissions } from '@/utils/scope1/calculate-stationary-emissions';
import {
  stakeholderOptions,
  equipmentTypeOptions,
  fuelTypeOptions,
  fuelNameOptionsByType,
  qualityControlOptions,
  fuelUnitOptionsByName,
} from '@/constant/scope1/stationary-data';
import { normalizeSubscriptNumbers } from '@/utils/normalizeText';
import * as XLSX from "xlsx";


const HEADER_MAPPING = {
  'buildingcode': ['buildingcode', 'building code', 'building-code', 'building_code', 'building'],
  'stakeholder': ['stakeholder', 'stakeholderdepartment', 'stake-holder', 'stakeholder department', 'department'],
  'equipmenttype': ['equipmenttype', 'equipment type', 'equipment', 'equipment-type', 'equipment_type'],
  'fueltype': ['fueltype', 'fuel type', 'fuel-type', 'fuel_type'],
  'fuelname': ['fuelname', 'fuel name', 'fuel-name', 'fuel_name', 'fuel'],
  'fuelconsumption': ['fuelconsumption', 'fuelconsumptionvalue', 'fuel-consumption', 'fuel_consumption', 'consumption', 'quantity'],
  'consumptionunit': ['consumptionunit', 'consumption unit', 'consumption-unit', 'consumption_unit', 'unit'],
  'qualitycontrol': ['qualitycontrol', 'quality control', 'quality-control', 'quality_control', 'quality'],
  'remarks': ['remarks', 'remark', 'comments', 'notes'],
  'postingdate': ['postingdate', 'posting date', 'date', 'posting-date', 'posting_date', 'record date']
};

const normalizeHeader = (header) => {
  return header.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
};
const useStationaryCSVUpload = (buildings = []) => {
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
    // Remove surrounding quotes
    cleaned = cleaned.replace(/^["']+|["']+$/g, '');
    // Remove Excel formula prefix
    cleaned = cleaned.replace(/^=/, '');
    return cleaned;
  }, []);

  const findMatchingField = (normalizedHeader) => {
    for (const [field, possibleNames] of Object.entries(HEADER_MAPPING)) {
      const normalizedPossibleNames = possibleNames.map(name => normalizeHeader(name));
      if (normalizedPossibleNames.includes(normalizedHeader)) {
        return field;
      }
    }
    return null;
  };
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

          // Use a simple, robust CSV parser
          const parseCSVLine = (line) => {
            const result = [];
            let current = '';
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              const nextChar = line[i + 1];

              if (char === '"') {
                if (inQuotes && nextChar === '"') {
                  // Double quote inside quotes = escaped quote
                  current += '"';
                  i++; // Skip next character
                } else {
                  // Start or end quotes
                  inQuotes = !inQuotes;
                }
              } else if (char === ',' && !inQuotes) {
                // End of field
                result.push(current);
                current = '';
              } else {
                // Regular character
                current += char;
              }
            }

            // Add the last field
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
            reject(new Error('CSV must contain header row with: buildingCode, stakeholder, equipmentType, fuelType, fuelName, fuelConsumption, consumptionUnit, qualityControl, remarks, postingDate'));
            return;
          }

          // Parse headers
          const headerValues = parseCSVLine(lines[headerRowIndex]);
          const headers = headerValues.map(h =>
            cleanCSVValue(h).toLowerCase().replace(/[^a-z0-9]/g, '')
          );

          // Expected headers
          // Create header mapping
          const headerMapping = {};
          const requiredFields = [
            'buildingcode', 'stakeholder', 'equipmenttype', 'fueltype',
            'fuelname', 'fuelconsumption', 'consumptionunit', 'qualitycontrol', 'postingdate'
          ];

          const missingHeaders = [];

          requiredFields.forEach(field => {
            const foundHeader = headerValues.find(header => {
              const normalizedHeader = normalizeHeader(header);
              return findMatchingField(normalizedHeader) === field;
            });

            if (foundHeader) {
              headerMapping[foundHeader] = field;
            } else {
              missingHeaders.push(field);
            }
          });

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

            // Map values to headers
            const row = {};
            Object.keys(headerMapping).forEach((originalHeader, idx) => {
              const mappedKey = headerMapping[originalHeader];
              row[mappedKey] = idx < values.length ? cleanCSVValue(values[idx]) : '';
            });

            // Only add row if it has data
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
  }, [cleanCSVValue]);

  // Excel Parser (NEW)
const parseExcel = useCallback((file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });

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
          reject(new Error('Excel must contain header row with: buildingCode, stakeholder, equipmentType, fuelType, fuelName, fuelConsumption, consumptionUnit, qualityControl, remarks, postingDate'));
          return;
        }

        // Get raw header values from Excel
        const rawHeaders = jsonData[headerRowIndex];
        
        // Create header mapping using friendly headers
        const headerMapping = {};
        const requiredFields = [
          'buildingcode', 'stakeholder', 'equipmenttype', 'fueltype',
          'fuelname', 'fuelconsumption', 'consumptionunit', 'qualitycontrol', 'postingdate'
        ];

        const missingHeaders = [];

        requiredFields.forEach(field => {
          const foundHeader = rawHeaders.find(header => {
            if (!header) return false;
            const normalizedHeader = normalizeHeader(header);
            return findMatchingField(normalizedHeader) === field;
          });
          
          if (foundHeader) {
            headerMapping[foundHeader] = field;
          } else {
            missingHeaders.push(field);
          }
        });

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
          
          // Use headerMapping to create row data with correct field names
          Object.entries(headerMapping).forEach(([originalHeader, mappedKey]) => {
            const headerIndex = rawHeaders.findIndex(h => h === originalHeader);
            const value = headerIndex < row.length ? row[headerIndex] : '';
            
            // Handle date conversion for postingdate field
            if (mappedKey === 'postingdate' && typeof value === 'number') {
              try {
                let iso = null;
                if (XLSX && XLSX.SSF && typeof XLSX.SSF.parse_date_code === 'function') {
                  const d = XLSX.SSF.parse_date_code(value);
                  if (d && d.y) {
                    iso = new Date(Date.UTC(d.y, d.m - 1, d.d, 0, 0, 0, 0)).toISOString();
                  }
                }
                if (!iso) {
                  const excelEpoch = Date.UTC(1899, 11, 30);
                  const msPerDay = 24 * 60 * 60 * 1000;
                  const jsDate = new Date(excelEpoch + (value * msPerDay));
                  iso = new Date(Date.UTC(jsDate.getUTCFullYear(), jsDate.getUTCMonth(), jsDate.getUTCDate(), 0, 0, 0, 0)).toISOString();
                }
                rowData[mappedKey] = iso;
              } catch (e) {
                rowData[mappedKey] = value ? cleanCSVValue(value) : '';
              }
            } else {
              rowData[mappedKey] = value ? cleanCSVValue(value) : '';
            }
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

  const validateStationaryRow = useCallback((row, index) => {
    const errors = [];
    const cleanedRow = {};

    // Clean all row values
    Object.keys(row).forEach(key => {
      cleanedRow[key] = row[key]?.toString().trim();
    });

    // Required fields validation
    const requiredFields = [
      'buildingcode', 'stakeholder', 'equipmenttype', 'fueltype',
      'fuelname', 'fuelconsumption', 'consumptionunit', 'qualitycontrol'
    ];

    requiredFields.forEach(field => {
      if (!cleanedRow[field] || cleanedRow[field] === '') {
        errors.push(`${field} is required`);
      }
    });

    // Building validation
    if (cleanedRow.buildingcode && buildings.length > 0) {
      const buildingExists = buildings.some(b =>
        b.buildingCode && b.buildingCode.toLowerCase() === cleanedRow.buildingcode.toLowerCase()
      );
      if (!buildingExists) {
        errors.push(`Invalid Building code "${cleanedRow.buildingcode}".`);
      }
    }

 
    if (cleanedRow.stakeholder) {
      const validStakeholders = stakeholderOptions.map(s => s.value);
      const matchedStakeholder = findFlexibleMatch(cleanedRow.stakeholder, validStakeholders);

      if (!matchedStakeholder) {
        errors.push(`Invalid Stakeholder "${cleanedRow.stakeholder}".`);
      } else {
        cleanedRow.stakeholder = matchedStakeholder;
      }
    }

    // Equipment type validation with subscript normalization and flexible matching
    if (cleanedRow.equipmenttype) {
      const validEquipment = equipmentTypeOptions.map(e => e.value);
      const normalizedInput = normalizeSubscriptNumbers(cleanedRow.equipmenttype);

      // First try with subscript normalization
      let matchedEquipment = validEquipment.find(equipment => {
        const normalizedEquipment = normalizeSubscriptNumbers(equipment);
        console.log('from xlsx:', normalizedInput);
        return normalizedEquipment.toLowerCase() === normalizedInput.toLowerCase();
      });

      console.log('Matched equipment (first attempt):', matchedEquipment);

      // If no match, try flexible matching (handles spaces around slashes)
      if (!matchedEquipment) {
        // Prepare valid options with subscript normalization applied
        const normalizedValidEquipment = validEquipment.map(equipment =>
          normalizeSubscriptNumbers(equipment)
        );

        // Try flexible match
        const flexibleMatch = findFlexibleMatch(normalizedInput, normalizedValidEquipment);

        if (flexibleMatch) {
          // Find the original equipment value
          const originalIndex = normalizedValidEquipment.findIndex(equip =>
            normalizeWithSlash(equip) === normalizeWithSlash(flexibleMatch)
          );
          matchedEquipment = validEquipment[originalIndex];
          console.log('Matched after flexible matching:', matchedEquipment);
        }
      }

      if (!matchedEquipment) {
        errors.push(`Invalid "Equipment Type" "${cleanedRow.equipmenttype}"`);
      } else {
        cleanedRow.equipmenttype = matchedEquipment;
      }
    }
  
    // Fuel type validation - FIXED with flexible matching
if (cleanedRow.fueltype) {
  const validFuelTypes = fuelTypeOptions.map(f => f.value);
  const matchedFuelType = findFlexibleMatch(cleanedRow.fueltype, validFuelTypes);
  
  if (!matchedFuelType) {
    errors.push(`Invalid "Fuel Type": "${cleanedRow.fueltype}".`);
  } else {
    cleanedRow.fueltype = matchedFuelType;
  }
}

 
    // Fuel name validation - FIXED with flexible matching
if (cleanedRow.fueltype && cleanedRow.fuelname) {
  const validFuelNames = fuelNameOptionsByType[cleanedRow.fueltype]?.map(f => f.value) || [];
  
  // Use flexible matching instead of exact match
  const matchedFuelName = findFlexibleMatch(cleanedRow.fuelname, validFuelNames);
  
  if (!matchedFuelName) {
    errors.push(`Invalid "Fuel Name": "${cleanedRow.fuelname}" for type "${cleanedRow.fueltype}".`);
  } else {
    cleanedRow.fuelname = matchedFuelName;
  }
}

    // Fuel consumption validation
    if (cleanedRow.fuelconsumption) {
      const cleanNum = cleanedRow.fuelconsumption.toString()
        .replace(/[^0-9.-]/g, '')
        .replace(/^"+|"+$/g, '');

      const num = Number(cleanNum);
      if (isNaN(num)) {
        errors.push(`Fuel consumption must be a number, got "${cleanedRow.fuelconsumption}"`);
      } else if (num < 0) {
        errors.push('Fuel consumption cannot be negative');
      } else if (num > 1000000000) {
        errors.push('Fuel consumption seems too large');
      } else {
        cleanedRow.fuelconsumption = num.toString();
      }
    }

    // Consumption unit validation
    if (cleanedRow.consumptionunit) {
      const allUnits = [
        ...fuelUnitOptionsByName.default,
        ...(cleanedRow.fuelname ? fuelUnitOptionsByName[cleanedRow.fuelname] || [] : [])
      ];

      const cleanUnit = cleanedRow.consumptionunit.toLowerCase();
      const matchedUnit = allUnits.find(u => u.toLowerCase() === cleanUnit);

      if (!matchedUnit) {
        errors.push(`Invalid "Consumption Unit": "${cleanedRow.consumptionunit}".`);
      } else {
        cleanedRow.consumptionunit = matchedUnit;
      }
    }

    // Quality control validation
    if (cleanedRow.qualitycontrol) {
      const validQC = qualityControlOptions.map(q => q.value);
      const matchedQC = validQC.find(q =>
        q.toLowerCase() === cleanedRow.qualitycontrol.toLowerCase()
      );
      if (!matchedQC) {
        errors.push(`Invalid "Quality Control": "${cleanedRow.qualitycontrol}".`);
      } else {
        cleanedRow.qualitycontrol = matchedQC;
      }
    }

    // Date validation
    if (cleanedRow.postingdate) {
      const isoDate = parseDateToISO(cleanedRow.postingdate);

      if (!isoDate) {
        errors.push(`Invalid Date Format: "${cleanedRow.postingdate}". Please provide a valid date (e.g., 01/15/2026)`);
      } else {
        cleanedRow.postingdate = isoDate;
      }
    } else {
      // If no date provided, use current date
      cleanedRow.postingdate = new Date(
        Date.UTC(
          new Date().getFullYear(),
          new Date().getMonth(),
          new Date().getDate(),
          0, 0, 0, 0
        )
      ).toISOString();
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

  const transformStationaryPayload = useCallback((row) => {
    const emissions = calculateStationaryEmissions(
      row.fuelname,
      Number(row.fuelconsumption),
      row.consumptionunit
    );

    return {
      buildingCode: row.buildingcode,
      stakeholder: row.stakeholder,
      equipmentType: row.equipmenttype,
      fuelType: row.fueltype,
      fuelName: row.fuelname,
      fuelConsumption: cleanNumberValue(row.fuelconsumption, 'Fuel consumption'),
      consumptionUnit: cleanStringValue(row.consumptionunit),
      qualityControl: row.qualitycontrol,
      remarks: cleanStringValue(row.remarks) || '',
      postingDate: row.postingdate,
      calculatedEmissionKgCo2e: emissions?.totalEmissionInScope || 0,
      calculatedEmissionTCo2e: emissions?.totalEmissionInScope ? emissions.totalEmissionInScope / 1000 : 0,
      calculatedBioEmissionKgCo2e: emissions?.totalEmissionOutScope || 0,
      calculatedBioEmissionTCo2e: emissions?.totalEmissionOutScope ? emissions.totalEmissionOutScope / 1000 : 0,
    };
  }, []);

  // Updated handleFileSelect with support for both CSV and Excel
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
      // Choose parser based on file extension
      let data;
      if (fileExtension === 'csv') {
        data = await parseCSV(file);
      } else {
        data = await parseExcel(file);
      }

      const errors = [];

      // Validate each row
      data.forEach((row, index) => {
        const rowErrors = validateStationaryRow(row, index);
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
          const payload = transformStationaryPayload(row);

          await axios.post(
            `${process.env.REACT_APP_BASE_URL}/stationary/create`,
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

  const downloadStationaryTemplate = useCallback(() => {
    const exampleBuildings = buildings.slice(0, 1);
    const exampleBuildingCode = exampleBuildings[0]?.buildingCode || 'BLD-EXAMPLE-001';

    const exampleStakeholder = stakeholderOptions[0]?.value || 'Assembly';
    const exampleEquipment = equipmentTypeOptions.find(e => e.value === 'Amine Reboilers')?.value || 'Amine Reboilers';
    const exampleFuelType = 'Gaseous Fuel';
    const exampleFuelName = 'Butane';
    const exampleUnit = 'kg';
    const exampleQC = 'Good';

      const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

    // Create worksheet data with headers
    const worksheetData = [
      [
        'Building Code',
        'Stakeholder / Department',
        'Equipment Type',
        'Fuel Type',
        'Fuel Name',
        'Fuel Consumption Value',
        'Consumption Unit',
        'Quality Control',
        'Remarks',
        'Posting Date'
      ],
      [
        exampleBuildingCode,
        exampleStakeholder,
        exampleEquipment,
        exampleFuelType,
        exampleFuelName,
        '100',
        exampleUnit,
        exampleQC,
        'Example record',
        getCurrentDate()
      ],
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Auto-size columns for better readability
    worksheet['!cols'] = [
      { wch: 20 }, // building code
      { wch: 25 }, // stakeholder
      { wch: 18 }, // equipment type
      { wch: 15 }, // fuel type
      { wch: 15 }, // fuel name
      { wch: 18 }, // fuel consumption
      { wch: 18 }, // consumption unit
      { wch: 18 }, // quality control
      { wch: 30 }, // remarks
      { wch: 15 }  // posting date
    ];

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stationary Template');

    // Download the Excel file
    XLSX.writeFile(workbook, 'stationary_template.xlsx');
  }, [buildings]);

  return {
    csvState,
    handleFileSelect,
    processUpload,
    resetUpload,
    downloadStationaryTemplate,
  };
};

export default useStationaryCSVUpload;
