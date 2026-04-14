// src/hooks/useFugitiveCSVUpload.js
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import * as XLSX from "xlsx";
import { calculateFugitiveEmission } from '@/utils/scope1/calculate-fugitive-emission';
import {
  FugitiveAndMobileStakeholderOptions,
  FugitiveEquipmentTypeOptions,
  materialRefrigerantOptions,
  qualityControlOptions,
  consumptionUnitOptions,
} from '@/constant/scope1/options';
import { normalizeSubscriptNumbers } from '@/utils/normalizeText';

const useFugitiveCSVUpload = (buildings = []) => {
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
            reject(new Error('CSV must contain header row with: buildingCode, stakeholder, equipmentType, materialRefrigerant, leakageValue, unit, qualityControl, remarks, postingDate'));
            return;
          }

          // Parse headers
          const headerValues = parseCSVLine(lines[headerRowIndex]);
          const headers = headerValues.map(h =>
            cleanValue(h).toLowerCase().replace(/[^a-z0-9]/g, '')
          );

         const expectedHeaders = [
  { key: 'buildingcode', possible: ['buildingcode', 'building code', 'building'] },
  { key: 'stakeholder', possible: ['stakeholder', 'stakeholderdepartment'] },
  { key: 'equipmenttype', possible: ['equipmenttype', 'equipment type', 'equipment'] },
  { key: 'materialrefrigerant', possible: ['materialrefrigerant', 'material refrigerant', 'refrigerant', 'material'] },
  { key: 'leakagevalue', possible: ['leakagevalue', 'leakagevaluerechargevaluekg', 'leakagevaluekg', 'leakage value (kg)'] },
  { key: 'qualitycontrol', possible: ['qualitycontrol', 'quality control', 'quality'] },
  { key: 'remarks', possible: ['remarks', 'remark', 'notes'] },
  { key: 'postingdate', possible: ['postingdate', 'posting date', 'date'] }
];
// Create a mapping from actual header to expected key
const headerMapping = {};
const missingHeaders = [];

expectedHeaders.forEach(expected => {
  const foundHeader = headerValues.find(h => {
    const normalizedH = h.toLowerCase().replace(/[^a-z0-9]/g, '');
    return expected.possible.some(possible => 
      possible.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedH
    );
  });
  
  if (foundHeader) {
    headerMapping[foundHeader] = expected.key;
  } else {
    missingHeaders.push(expected.key);
  }
});

if (missingHeaders.length > 0) {
  reject(new Error(`Missing required columns: ${missingHeaders.join(', ')}`));
  return;
}

          // Check for missing headers
        

          // Parse data rows
         // Replace the data parsing section in parseCSV (around line 100-115):
const data = [];
for (let i = headerRowIndex + 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const values = parseCSVLine(line);
  const row = {};

  // Use the header mapping
  Object.keys(headerMapping).forEach((originalHeader, idx) => {
    const mappedKey = headerMapping[originalHeader];
    row[mappedKey] = idx < values.length ? cleanValue(values[idx]) : '';
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
            reject(new Error('Excel must contain header row with: buildingCode, stakeholder, equipmentType, materialRefrigerant, leakageValue, unit, qualityControl, remarks, postingDate'));
            return;
          }

          // Get headers
          const headers = jsonData[headerRowIndex].map(header =>
            cleanValue(header).toLowerCase().replace(/[^a-z0-9]/g, '')
          );

          // Expected headers
         // WITH THIS:
const expectedHeaders = [
  { key: 'buildingcode', possible: ['buildingcode', 'building code', 'building'] },
  { key: 'stakeholder', possible: ['stakeholder', 'stakeholderdepartment'] },
  { key: 'equipmenttype', possible: ['equipmenttype', 'equipment type', 'equipment'] },
  { key: 'materialrefrigerant', possible: ['materialrefrigerant', 'material refrigerant', 'refrigerant', 'material'] },
  { key: 'leakagevalue', possible: ['leakagevalue', 'leakagevaluerechargevaluekg', 'leakagevaluekg', 'leakage value (kg)'] },
  { key: 'qualitycontrol', possible: ['qualitycontrol', 'quality control', 'quality'] },
  { key: 'remarks', possible: ['remarks', 'remark', 'notes'] },
  { key: 'postingdate', possible: ['postingdate', 'posting date', 'date'] }
];

       const headerMapping = {};
const missingHeaders = [];

expectedHeaders.forEach(expected => {
  const foundHeader = headers.find((h, idx) => {
    const normalizedH = h.toLowerCase().replace(/[^a-z0-9]/g, '');
    return expected.possible.some(possible => 
      possible.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedH
    );
  });
  
  if (foundHeader) {
    const foundIndex = headers.findIndex(h => h === foundHeader);
    headerMapping[foundHeader] = { key: expected.key, index: foundIndex };
  } else {
    missingHeaders.push(expected.key);
  }
});

if (missingHeaders.length > 0) {
  reject(new Error(`Missing required columns: ${missingHeaders.join(', ')}`));
  return;
}

// Then in the data parsing:
const parsedData = [];
for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
  const row = jsonData[i];
  if (!row || row.every(cell => !cell || cell.toString().trim() === '')) continue;

  const rowData = {};
  Object.values(headerMapping).forEach(({ key, index }) => {
    const value = index < row.length ? row[index] : '';
    rowData[key] = value ? cleanValue(value) : '';
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

  const normalizeString = (str, options = {}) => {
  let normalized = str.toLowerCase();
  
  // Remove spaces around slashes
  normalized = normalized.replace(/\s*\/\s*/g, '/');
  
  // Add spaces around slashes (for comparison)
  const withSpaces = normalized.replace(/\//g, ' / ');
  
  // Return both variations for matching
  return {
    original: str.toLowerCase(),
    noSpacesAroundSlash: normalized,
    withSpacesAroundSlash: withSpaces.replace(/\s+/g, ' ').trim()
  };
};

const findFlexibleMatch = (input, validOptions) => {
  if (!input || !validOptions.length) return null;
  
  const inputNormalized = normalizeString(input);
  
  return validOptions.find(option => {
    const optionNormalized = normalizeString(option);
    
    return inputNormalized.original === optionNormalized.original ||
           inputNormalized.noSpacesAroundSlash === optionNormalized.noSpacesAroundSlash ||
           inputNormalized.withSpacesAroundSlash === optionNormalized.withSpacesAroundSlash;
  });
};


  const validateFugitiveRow = useCallback((row, index) => {
    const errors = [];
    const cleanedRow = {};

    // Comprehensive header mapping
    const headerMapping = {
      'buildingcode': 'buildingcode',
      'refrigerant': 'materialrefrigerant',
      'materialrefrigerant': 'materialrefrigerant',
      'equipment': 'equipmenttype',
      'leakagevalue': 'leakagevalue',
      'leakagevaluekg': 'leakagevalue',
      'leakagevaluerechargevaluekg': 'leakagevalue',
      'postingdate': 'postingdate',
      'quality': 'qualitycontrol',
    };

    // First, map the keys
    Object.keys(row).forEach(key => {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      const mappedKey = headerMapping[normalizedKey] || normalizedKey;
      cleanedRow[mappedKey] = cleanValue(row[key]);
    });

    console.log('Mapped row:', cleanedRow);

    // Required fields validation
    const requiredFields = [
      'buildingcode', 'stakeholder', 'equipmenttype',
      'materialrefrigerant', 'leakagevalue',
      'qualitycontrol', 'postingdate'
    ];

    requiredFields.forEach(field => {
      if (!cleanedRow[field] || cleanedRow[field] === '') {
        errors.push(`${field} is required`);
      }
    });

    // Building validation
    if (cleanedRow.buildingcode && buildings.length > 0) {
      const buildingExists = buildings.some(b => b.buildingCode === cleanedRow.buildingcode);
      if (!buildingExists) {
        errors.push(`Invalid building Code "${cleanedRow.buildingcode}"`);
      }
    }

    // Stakeholder validation
    // if (cleanedRow.stakeholder) {
    //   const validStakeholders = FugitiveAndMobileStakeholderOptions.map(s => s.value);
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
  const validStakeholders = FugitiveAndMobileStakeholderOptions.map(s => s.value);
  const matchedStakeholder = findFlexibleMatch(cleanedRow.stakeholder, validStakeholders);
  
  if (!matchedStakeholder) {
    errors.push(`Invalid stakeholder "${cleanedRow.stakeholder}"`);
  } else {
    cleanedRow.stakeholder = matchedStakeholder;
  }
}
    // Equipment type validation with subscript normalization
    // if (cleanedRow.equipmenttype) {
    //   const validEquipmentTypes = FugitiveEquipmentTypeOptions.map(e => e.value);
    //   const normalizedInput = normalizeSubscriptNumbers(cleanedRow.equipmenttype);

    //   const matchedEquipment = validEquipmentTypes.find(equipment => {
    //     const normalizedEquipment = normalizeSubscriptNumbers(equipment);
    //     return normalizedEquipment.toLowerCase() === normalizedInput.toLowerCase();
    //   });

    //   if (!matchedEquipment) {
    //     errors.push(`Invalid equipment type "${cleanedRow.equipmenttype}"`);
    //   } else {
    //     cleanedRow.equipmenttype = matchedEquipment;
    //   }
    // }
    if (cleanedRow.equipmenttype) {
  const validEquipmentTypes = FugitiveEquipmentTypeOptions.map(e => e.value);
  const normalizedInput = normalizeSubscriptNumbers(cleanedRow.equipmenttype);
  
  // First try with subscript normalization
  let matchedEquipment = validEquipmentTypes.find(equipment => {
    const normalizedEquipment = normalizeSubscriptNumbers(equipment);
    return normalizedEquipment.toLowerCase() === normalizedInput.toLowerCase();
  });
  
  // If no match, try flexible matching (handles spaces around slashes)
  if (!matchedEquipment) {
    // Prepare valid options with subscript normalization applied
    const normalizedValidOptions = validEquipmentTypes.map(equipment => 
      normalizeSubscriptNumbers(equipment)
    );
    
    matchedEquipment = findFlexibleMatch(normalizedInput, normalizedValidOptions);
    
    // If found, get the original equipment type value
    if (matchedEquipment) {
      const originalIndex = normalizedValidOptions.findIndex(opt => opt === matchedEquipment);
      matchedEquipment = validEquipmentTypes[originalIndex];
    }
  }
  
  if (!matchedEquipment) {
    errors.push(`Invalid equipment type "${cleanedRow.equipmenttype}"`);
  } else {
    cleanedRow.equipmenttype = matchedEquipment;
  }
}

    // Material/Refrigerant validation
    // if (cleanedRow.materialrefrigerant) {
    //   const validMaterials = materialRefrigerantOptions.map(m => m.value);
    //   const matchedMaterial = validMaterials.find(m =>
    //     m.toLowerCase() === cleanedRow.materialrefrigerant.toLowerCase()
    //   );
    //   if (!matchedMaterial) {
    //     errors.push(`Invalid material/refrigerant "${cleanedRow.materialrefrigerant}"`);
    //   } else {
    //     cleanedRow.materialrefrigerant = matchedMaterial;
    //   }
    // }
    if (cleanedRow.materialrefrigerant) {
  const validMaterials = materialRefrigerantOptions.map(m => m.value);
  const matchedMaterial = findFlexibleMatch(cleanedRow.materialrefrigerant, validMaterials);
  
  if (!matchedMaterial) {
    errors.push(`Invalid material/refrigerant "${cleanedRow.materialrefrigerant}"`);
  } else {
    cleanedRow.materialrefrigerant = matchedMaterial;
  }
}

    // Leakage value validation
    if (cleanedRow.leakagevalue) {
      const cleanNum = cleanedRow.leakagevalue.toString()
        .replace(/[^0-9.-]/g, '');

      const num = Number(cleanNum);
      if (isNaN(num)) {
        errors.push(`Leakage value must be a number, got "${cleanedRow.leakagevalue}"`);
      } else if (num < 0) {
        errors.push('Leakage value cannot be negative');
      } else if (num > 1000000) {
        errors.push('Leakage value seems too large');
      } else {
        cleanedRow.leakagevalue = num.toString();
      }
    }

    // Consumption unit validation
    if (cleanedRow.consumptionunit) {
      const validUnits = consumptionUnitOptions.map(u => u.value);
      const matchedUnit = validUnits.find(u =>
        u.toLowerCase() === cleanedRow.consumptionunit.toLowerCase()
      );
      if (!matchedUnit) {
        errors.push(`Invalid consumption unit "${cleanedRow.consumptionunit}"`);
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
        errors.push(`Invalid quality control "${cleanedRow.qualitycontrol}"`);
      } else {
        cleanedRow.qualitycontrol = matchedQC;
      }
    }

    // Date validation
    if (cleanedRow.postingdate) {
      let dateStr = cleanedRow.postingdate;
      if (dateStr.includes('T')) {
        dateStr = dateStr.split('T')[0];
      }
      dateStr = dateStr.replace(/"/g, '');

      const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
      const match = dateStr.match(ddmmyyyyRegex);

      if (match) {
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1;
        const year = parseInt(match[3], 10);

        const date = new Date(year, month, day);

        if (isNaN(date.getTime()) ||
          date.getDate() !== day ||
          date.getMonth() !== month ||
          date.getFullYear() !== year) {
          errors.push(`Invalid date "${dateStr}" - please provide a valid DD/MM/YYYY date`);
        } else {
          const formattedYear = year;
          const formattedMonth = String(month + 1).padStart(2, '0');
          const formattedDay = String(day).padStart(2, '0');
          cleanedRow.postingdate = `${formattedYear}-${formattedMonth}-${formattedDay}`;
        }
      } else {
        const yyyymmddRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (yyyymmddRegex.test(dateStr)) {
          const [year, month, day] = dateStr.split('-').map(Number);
          const date = new Date(year, month - 1, day);

          if (isNaN(date.getTime())) {
            errors.push(`Invalid date "${dateStr}"`);
          } else {
            cleanedRow.postingdate = dateStr;
          }
        } else {
          errors.push(`Date must be DD/MM/YYYY format (e.g., 15/01/2024), got "${cleanedRow.postingdate}"`);
        }
      }
    } else {
      // If no date provided, use current date
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      cleanedRow.postingdate = `${year}-${month}-${day}`;
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

  const transformFugitivePayload = useCallback((row) => {
    const kgEmission = calculateFugitiveEmission(
      row.materialrefrigerant,
      parseFloat(row.leakagevalue)
    );
    const tEmission = kgEmission / 1000;

    return {
      buildingCode: row.buildingcode ? row.buildingcode.trim() : '',
      buildingId: (() => {
        if (!row.buildingcode) return undefined;
        const match = buildings.find(b =>
          (b.buildingCode && b.buildingCode === row.buildingcode) ||
          (b.buildingName && b.buildingName === row.buildingcode) ||
          (b._id && b._id === row.buildingcode)
        );
        return match ? match._id : row.buildingcode.trim();
      })(),
      stakeholder: row.stakeholder,
      equipmentType: row.equipmenttype,
      materialRefrigerant: row.materialrefrigerant,
      leakageValue: cleanNumberValue(row.leakagevalue, 'Leakage value'),
      consumptionUnit: 'kg',
      qualityControl: row.qualitycontrol,
      calculatedEmissionKgCo2e: kgEmission || 0,
      calculatedEmissionTCo2e: tEmission || 0,
      remarks: cleanStringValue(row.remarks) || '',
      postingDate: row.postingdate || new Date().toISOString().split('T')[0],
    };
  }, [buildings]);

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

      // Normalize keys
      const normalizedData = data.map(row => {
        const normalizedRow = {};
        Object.keys(row).forEach(key => {
          const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
          normalizedRow[normalizedKey] = row[key];
        });
        return normalizedRow;
      });

      const errors = [];
      normalizedData.forEach((row, index) => {
        const rowErrors = validateFugitiveRow(row, index);
        if (rowErrors.length > 0) {
          errors.push(`Row ${index + 2}: ${rowErrors.join(', ')}`);
        }
      });

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
  }, [parseCSV, parseExcel, validateFugitiveRow]);

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
          const payload = transformFugitivePayload(row);

          const response = await fetch(`${process.env.REACT_APP_BASE_URL}/Fugitive/Create`, {
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
  }, [csvState, transformFugitivePayload]);

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

  const downloadFugitiveTemplate = useCallback(() => {
    const exampleBuildings = buildings.slice(0, 2);
    const exampleBuilding1 = exampleBuildings[0]?.buildingCode || 'BLD-8182';

    const exampleStakeholder = FugitiveAndMobileStakeholderOptions[0]?.value || 'Assembly';
    const exampleEquipmentType = FugitiveEquipmentTypeOptions.find(e => e.value === 'Air Handling Units (AHUs) with Refrigerants')?.value || 'Air Handling Units (AHUs) with Refrigerants';
    const exampleMaterial = materialRefrigerantOptions[0]?.value || 'R-134a';
    const exampleUnit = consumptionUnitOptions[0]?.value || 'kg';
    const exampleQC = qualityControlOptions[0]?.value || 'Good';

    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    // Create worksheet data with headers
    const worksheetData = [
      [
        'Building Code',
        'Stakeholder / Department',
        'Equipment Type',
        'Material / Refrigerant',
        'Leakage Value / Recharge Value (kg)',
        'Quality Control',
        'Remarks',
        'Posting Date'
      ],
      [
        exampleBuilding1,
        exampleStakeholder,
        exampleEquipmentType,
        exampleMaterial,
        '10',
        exampleQC,
        'AC maintenance - Unit 1',
        formattedDate
      ],

    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Auto-size columns for better readability
    worksheet['!cols'] = [
      { wch: 20 }, // building code
      { wch: 25 }, // stakeholder
      { wch: 35 }, // equipment type
      { wch: 25 }, // material refrigerant
      { wch: 18 }, // leakage value
      { wch: 15 }, // unit
      { wch: 20 }, // quality control
      { wch: 30 }, // remarks
      { wch: 15 }  // posting date
    ];

    // Style the header row (bold text with background)
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fugitive Template');

    // Download the Excel file
    XLSX.writeFile(workbook, 'fugitive_template.xlsx');
  }, [buildings]);

  return {
    csvState,
    handleFileSelect,
    processUpload,
    resetUpload,
    downloadFugitiveTemplate,
  };
};

export default useFugitiveCSVUpload;
