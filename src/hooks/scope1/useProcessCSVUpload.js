// hooks/scope1/useProcessCSVUpload.js
import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as XLSX from "xlsx";

// Import constants for process emissions
import {
  activityTypeOptions,
  activityMetadata,
  qualityControlOptions,
  stakeholderDepartmentOptions // Note: This is for validation only, not calculations
} from '@/constant/scope1/options';
import {   PROCESS_ACTIVITY_DATA } from '@/constant/scope1/calculate-process-emission';
import { normalizeSubscriptNumbers } from '@/utils/normalizeText';
import { processEmissionFactors } from '@/constant/scope1/calculate-process-emission';

// User-friendly column names and mappings
const USER_FRIENDLY_COLUMNS = {
  'buildingcode': 'Building Code',
  'stakeholderdepartment': 'Stakeholder Department',
  'activitytype': 'Type Of Activity / Process',
  'processactivitydata': 'Process Activity Data',
  'amountofemissions': 'Amount',
  'qualitycontrol': 'Quality Control',
  'remarks': 'Remarks',
  'postingdate': 'Posting Date'
};

const COLUMN_MAPPING = {
  'buildingcode': ['buildingcode', 'Building Code', 'building code', 'building-code', 'building_code'],
  'stakeholderdepartment': ['stakeholderdepartment', 'Stakeholder Department', 'stakeholder department', 'stakeholder-department', 'stakeholder_department'],
  'processactivitydata': ['processactivitydata', 'Activity Data', 'activity data', 'process-activity-data', 'process_activity_data'],
  'amountofemissions': ['amountofemissions', 'Amount'],
  'activitytype': ['typeofactivityprocess', 'Type Of Activity / Process', 'type of activity / process', 'activitytype', 'activity type', 'type-of-activity-process'],
  'qualitycontrol': ['qualitycontrol', 'Quality Control', 'quality control', 'quality-control', 'quality_control'],
  'remarks': ['remarks', 'Remarks', 'remark', 'comments', 'notes'],
  'postingdate': ['postingdate', 'Posting Date', 'posting date', 'date', 'posting-date', 'posting_date']
};

const useProcessCSVUpload = (buildings = []) => {
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

  // Helper function to parse date in any format to ISO
  const parseDateToISO = useCallback((dateString) => {
    if (!dateString) return null;

    let cleanedDate = dateString.toString().trim();
    cleanedDate = cleanedDate.replace(/"/g, ''); // Remove quotes

    // Handle empty or invalid dates
    if (!cleanedDate || cleanedDate === '') return null;

    // Try to parse the date
    let date;
    let year, month, day;

    // Check if it's already an ISO string with timezone
    if (cleanedDate.includes('T')) {
      // Extract just the date part if it's a full ISO string
      date = new Date(cleanedDate.split('T')[0]);
    } else {
      // Try to parse common date formats
      const parts = cleanedDate.split(/[\/\-\.]/);

      if (parts.length === 3) {
        // Try different date format interpretations
        if (parts[0].length === 4) {
          // Format: YYYY-MM-DD
          year = parseInt(parts[0]);
          month = parseInt(parts[1]) - 1; // Month is 0-indexed
          day = parseInt(parts[2]);
          date = new Date(year, month, day);
        } else if (parts[2].length === 4) {
          // Could be MM/DD/YYYY or DD/MM/YYYY
          // Check if first part is > 12 (likely day in DD/MM/YYYY)
          if (parseInt(parts[0]) > 12) {
            // Likely DD/MM/YYYY
            day = parseInt(parts[0]);
            month = parseInt(parts[1]) - 1;
            year = parseInt(parts[2]);
            date = new Date(year, month, day);
          } else if (parseInt(parts[1]) > 12) {
            // Likely MM/DD/YYYY (second part is day)
            month = parseInt(parts[0]) - 1;
            day = parseInt(parts[1]);
            year = parseInt(parts[2]);
            date = new Date(year, month, day);
          } else {
            // Ambiguous - try both and see which is valid
            // First try MM/DD/YYYY
            let testDate1 = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
            // Then try DD/MM/YYYY
            let testDate2 = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));

            if (!isNaN(testDate1.getTime()) && testDate1.getDate() === parseInt(parts[1])) {
              date = testDate1;
            } else if (!isNaN(testDate2.getTime()) && testDate2.getDate() === parseInt(parts[0])) {
              date = testDate2;
            }
          }
        } else {
          // Try creating date directly (browser might parse it)
          date = new Date(cleanedDate);
        }
      } else {
        // Try creating date directly
        date = new Date(cleanedDate);
      }
    }

    // If still invalid, return null
    if (!date || isNaN(date.getTime())) {
      return null;
    }

    // Create ISO string with time set to midnight UTC
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

  // Helper function to normalize header
  const normalizeHeader = useCallback((header) => {
    if (!header) return '';
    return header.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
  }, []);

  // Helper function to find matching column
  const findMatchingColumn = useCallback((header, possibleMatches) => {
    const normalizedHeader = normalizeHeader(header);
    return possibleMatches.some(match => normalizeHeader(match) === normalizedHeader);
  }, [normalizeHeader]);

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
          let headerRowIndex = 0;
          const headerValues = parseCSVLine(lines[headerRowIndex]);
          
          // Find matching columns
          const foundColumns = {};
          const requiredFields = ['buildingcode', 'stakeholderdepartment', 'processactivitydata', 'amountofemissions', 'qualitycontrol', 'postingdate'];

          headerValues.forEach(header => {
            for (const [field, possibleNames] of Object.entries(COLUMN_MAPPING)) {
              if (findMatchingColumn(header, possibleNames)) {
                foundColumns[field] = header;
                break;
              }
            }
          });

          // Check for activity type column
          let hasActivityType = false;
          for (const header of headerValues) {
            if (findMatchingColumn(header, COLUMN_MAPPING.activitytype)) {
              hasActivityType = true;
              foundColumns.activitytype = header;
              break;
            }
          }

          if (!hasActivityType) {
            reject(new Error('CSV must contain an activity type column'));
            return;
          }

          const missingHeaders = requiredFields.filter(field => !foundColumns[field]);
          if (missingHeaders.length > 0) {
            const friendlyMissing = missingHeaders.map(h => USER_FRIENDLY_COLUMNS[h]);
            reject(new Error(`Missing required columns: ${friendlyMissing.join(', ')}`));
            return;
          }

          // Parse data rows
          const data = [];
          for (let i = headerRowIndex + 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = parseCSVLine(line);
            const row = {};
            
            // Use the found column mapping
            Object.entries(foundColumns).forEach(([field, headerName]) => {
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
          reject(new Error(`Error parsing CSV: ${error.message}`));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, [cleanCSVValue, findMatchingColumn, normalizeHeader]);

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
          let headerRowIndex = 0;
          const headerValues = jsonData[headerRowIndex] || [];
          
          // Find matching columns
          const foundColumns = {};
          const requiredFields = ['buildingcode', 'stakeholderdepartment', 'processactivitydata', 'amountofemissions', 'qualitycontrol', 'postingdate'];

          headerValues.forEach(header => {
            if (!header) return;
            for (const [field, possibleNames] of Object.entries(COLUMN_MAPPING)) {
              if (findMatchingColumn(header, possibleNames)) {
                foundColumns[field] = header;
                break;
              }
            }
          });

          // Check for activity type column
          let hasActivityType = false;
          for (const header of headerValues) {
            if (header && findMatchingColumn(header, COLUMN_MAPPING.activitytype)) {
              hasActivityType = true;
              foundColumns.activitytype = header;
              break;
            }
          }

          if (!hasActivityType) {
            reject(new Error('Excel must contain an activity type column'));
            return;
          }

          const missingHeaders = requiredFields.filter(field => !foundColumns[field]);
          if (missingHeaders.length > 0) {
            const friendlyMissing = missingHeaders.map(h => USER_FRIENDLY_COLUMNS[h]);
            reject(new Error(`Missing required columns: ${friendlyMissing.join(', ')}`));
            return;
          }

          // Parse data rows
          const parsedData = [];
          for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.every(cell => !cell || cell.toString().trim() === '')) continue;

            const rowData = {};
            Object.entries(foundColumns).forEach(([field, headerName]) => {
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
  }, [cleanCSVValue, findMatchingColumn]);

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


  // Function to validate process activity data against activity type
  const validateProcessActivityData = useCallback((activityType, processActivityData) => {
    if (!activityType || !processActivityData) {
      return { isValid: false, errorMessage: 'Activity type and Activity Data are required' };
    }

    // Find the activity type in PROCESS_ACTIVITY_DATA (for validation only)
    const activityDataItem = PROCESS_ACTIVITY_DATA.find(
      item => item.value === activityType
    );

    if (!activityDataItem) {
      return { isValid: false, errorMessage: `No activity data options found for activity type "${activityType}"` };
    }

    // For validation, we just check if the activity data matches the label format
    // Since PROCESS_ACTIVITY_DATA contains the label (question) format
    // You might want to create a separate validation list or skip this validation
    // For now, we'll consider it valid if it's not empty
    if (!processActivityData || processActivityData.toString().trim() === '') {
      return { isValid: false, errorMessage: 'Activity Data cannot be empty' };
    }

    // Optional: Add specific validation rules here if needed
    // For example, check if the value matches expected patterns
    
    return { isValid: true, errorMessage: null };
  }, []);

  const validateProcessRow = useCallback((row, index) => {
    const errors = [];

    // Required fields validation with user-friendly names
    const requiredFields = [
      { field: 'buildingcode', friendlyName: 'Building Code' },
      { field: 'stakeholderdepartment', friendlyName: 'Stakeholder Department' },
      { field: 'activitytype', friendlyName: 'Type Of Activity / Process' },
      { field: 'processactivitydata', friendlyName: 'Process Activity Data' },
      { field: 'amountofemissions', friendlyName: 'Amount' },
      { field: 'qualitycontrol', friendlyName: 'Quality Control' }
    ];

    requiredFields.forEach(({ field, friendlyName }) => {
      if (!row[field] || row[field] === '' || row[field].toString().trim() === '') {
        errors.push(`${friendlyName} is required`);
      }
    });

    // Building validation
    if (row.buildingcode && buildings.length > 0) {
      const buildingExists = buildings.some(b =>
        b.buildingCode && b.buildingCode.toLowerCase() === row.buildingcode.toLowerCase()
      );
      if (!buildingExists) {
        errors.push(`Invalid building code "${row.buildingcode}". Available: ${buildings.slice(0, 3).map(b => b.buildingCode).join(', ')}...`);
      }
    }

    // Stakeholder validation
    // if (row.stakeholderdepartment) {
    //   const validStakeholders = stakeholderDepartmentOptions.map(s => s.value);
    //   const matchedStakeholder = validStakeholders.find(s =>
    //     s.toLowerCase() === row.stakeholderdepartment.toLowerCase()
    //   );
    //   if (!matchedStakeholder) {
    //     errors.push(`Invalid stakeholder "${row.stakeholderdepartment}". Valid options: ${validStakeholders.slice(0, 5).join(', ')}...`);
    //   } else {
    //     row.stakeholderdepartment = matchedStakeholder;
    //   }
    // }
    // Stakeholder validation with flexible matching
if (row.stakeholderdepartment) {
  const validStakeholders = stakeholderDepartmentOptions.map(s => s.value);
  const matchedStakeholder = findFlexibleMatch(row.stakeholderdepartment, validStakeholders);
  
  if (!matchedStakeholder) {
    errors.push(`Invalid stakeholder "${row.stakeholderdepartment}". Valid options: ${validStakeholders.slice(0, 5).join(', ')}...`);
  } else {
    row.stakeholderdepartment = matchedStakeholder;
  }
}

    // Activity type validation with subscript normalization
    // if (row.activitytype) {
    //   const validActivities = activityTypeOptions.map(a => a.value);
      
    //   let matchedActivity = null;
    //   const normalizedInput = normalizeSubscriptNumbers(row.activitytype);
      
    //   matchedActivity = validActivities.find(activity => {
    //     const normalizedActivity = normalizeSubscriptNumbers(activity);
    //     return normalizedActivity.toLowerCase() === normalizedInput.toLowerCase();
    //   });

    //   if (!matchedActivity) {
    //     errors.push(`Invalid activity type "${row.activitytype}". Valid options: ${validActivities.slice(0, 5).join(', ')}...`);
    //   } else {
    //     row.activitytype = matchedActivity;

    //     // AUTO-POPULATE gas emitted based on activity type
    //     if (Array.isArray(activityMetadata)) {
    //       const activityMeta = activityMetadata.find(a => {
    //         if (!a.activityType) return false;
    //         const normalizedActivityType = normalizeSubscriptNumbers(a.activityType);
    //         const normalizedMatched = normalizeSubscriptNumbers(matchedActivity);
    //         return normalizedActivityType.toLowerCase() === normalizedMatched.toLowerCase();
    //       });
          
    //       if (activityMeta && activityMeta.gasEmitted) {
    //         row.gasemitted = activityMeta.gasEmitted;
    //         console.log(`Auto-populated gas emitted for ${matchedActivity}: ${row.gasemitted}`);
    //       } else {
    //         errors.push(`Could not determine gas emitted for activity "${matchedActivity}"`);
    //       }
    //     } else if (activityMetadata && typeof activityMetadata === 'object') {
    //       const activityKeys = Object.keys(activityMetadata);
    //       const matchedKey = activityKeys.find(key => {
    //         const normalizedKey = normalizeSubscriptNumbers(key);
    //         const normalizedActivity = normalizeSubscriptNumbers(matchedActivity);
    //         return normalizedKey.toLowerCase() === normalizedActivity.toLowerCase();
    //       });
          
    //       if (matchedKey && activityMetadata[matchedKey] && activityMetadata[matchedKey].gasEmitted) {
    //         row.gasemitted = activityMetadata[matchedKey].gasEmitted;
    //         console.log(`Auto-populated gas emitted for ${matchedActivity}: ${row.gasemitted}`);
    //       } else {
    //         errors.push(`Could not determine gas emitted for activity "${matchedActivity}"`);
    //       }
    //     }
    //   }
    // }
// Activity type validation with subscript normalization and flexible matching
if (row.activitytype) {
  const validActivities = activityTypeOptions.map(a => a.value);
  
  let matchedActivity = null;
  const normalizedInput = normalizeSubscriptNumbers(row.activitytype);
  
  // First try with subscript normalization
  matchedActivity = validActivities.find(activity => {
    const normalizedActivity = normalizeSubscriptNumbers(activity);
    return normalizedActivity.toLowerCase() === normalizedInput.toLowerCase();
  });
  
  // If no match, try with flexible matching (handles spaces around slashes)
  if (!matchedActivity) {
    // Prepare valid options with subscript normalization applied
    const normalizedValidActivities = validActivities.map(activity => 
      normalizeSubscriptNumbers(activity)
    );
    
    const flexibleMatch = findFlexibleMatch(normalizedInput, normalizedValidActivities);
    
    if (flexibleMatch) {
      // Find the original activity value
      const originalIndex = normalizedValidActivities.findIndex(act => 
        normalizeWithSlash(act) === normalizeWithSlash(flexibleMatch)
      );
      matchedActivity = validActivities[originalIndex];
    }
  }
  
  if (!matchedActivity) {
    errors.push(`Invalid activity type "${row.activitytype}". Valid options: ${validActivities.slice(0, 5).join(', ')}...`);
  } else {
    row.activitytype = matchedActivity;

    // AUTO-POPULATE gas emitted based on activity type
    if (Array.isArray(activityMetadata)) {
      const activityMeta = activityMetadata.find(a => {
        if (!a.activityType) return false;
        const normalizedActivityType = normalizeSubscriptNumbers(a.activityType);
        const normalizedMatched = normalizeSubscriptNumbers(matchedActivity);
        return normalizedActivityType.toLowerCase() === normalizedMatched.toLowerCase();
      });
      
      if (activityMeta && activityMeta.gasEmitted) {
        row.gasemitted = activityMeta.gasEmitted;
        console.log(`Auto-populated gas emitted for ${matchedActivity}: ${row.gasemitted}`);
      } else {
        errors.push(`Could not determine gas emitted for activity "${matchedActivity}"`);
      }
    } else if (activityMetadata && typeof activityMetadata === 'object') {
      const activityKeys = Object.keys(activityMetadata);
      const matchedKey = activityKeys.find(key => {
        const normalizedKey = normalizeSubscriptNumbers(key);
        const normalizedActivity = normalizeSubscriptNumbers(matchedActivity);
        return normalizedKey.toLowerCase() === normalizedActivity.toLowerCase();
      });
      
      if (matchedKey && activityMetadata[matchedKey] && activityMetadata[matchedKey].gasEmitted) {
        row.gasemitted = activityMetadata[matchedKey].gasEmitted;
        console.log(`Auto-populated gas emitted for ${matchedActivity}: ${row.gasemitted}`);
      } else {
        errors.push(`Could not determine gas emitted for activity "${matchedActivity}"`);
      }
    }
  }
}

    // Process Activity Data validation (amount/number)
    if (row.amountofemissions) {
      const cleanNum = row.amountofemissions.toString()
        .replace(/[^0-9.-]/g, '')
        .replace(/^"+|"+$/g, '');

      const num = Number(cleanNum);
      if (isNaN(num)) {
        errors.push(`Process Activity Data must be a number, got "${row.amountofemissions}"`);
      } else if (num < 0) {
        errors.push('Process Activity Data cannot be negative');
      } else if (num > 1000000000) {
        errors.push('Process Activity Data seems too large');
      } else {
        row.amountofemissions = num.toString();
      }
    }

    // Activity Data field validation (text field)
    if (row.activitytype && row.processactivitydata) {
      const validation = validateProcessActivityData(row.activitytype, row.processactivitydata);
      if (!validation.isValid) {
        errors.push(validation.errorMessage);
      } else {
        // Store the validated activity data
        row.processactivitydata = row.processactivitydata.toString().trim();
      }
    }

    // Quality control validation
    if (row.qualitycontrol) {
      const validQC = qualityControlOptions.map(q => q.value);
      const matchedQC = validQC.find(q =>
        q.toLowerCase() === row.qualitycontrol.toLowerCase()
      );
      if (!matchedQC) {
        errors.push(`Invalid quality control "${row.qualitycontrol}". Valid: ${validQC.join(', ')}`);
      } else {
        row.qualitycontrol = matchedQC;
      }
    }

    // Date validation
    if (row.postingdate) {
      const isoDate = parseDateToISO(row.postingdate);

      if (!isoDate) {
        errors.push(`Invalid date format: "${row.postingdate}". Please provide a valid date (e.g., 2024-01-15, 01/15/2024, 15-01-2024)`);
      } else {
        row.postingdate = isoDate;
      }
    } else {
      row.postingdate = new Date(
        Date.UTC(
          new Date().getFullYear(),
          new Date().getMonth(),
          new Date().getDate(),
          0, 0, 0, 0
        )
      ).toISOString();
    }

    // Remarks validation
    if (row.remarks && row.remarks.length > 500) {
      errors.push('Remarks cannot exceed 500 characters');
    }

    return errors;
  }, [buildings, parseDateToISO, validateProcessActivityData]);

  // Helper function to calculate process emissions
  // const calculateProcessEmissions = useCallback((gasEmitted, amount) => {
  //   // GWP (Global Warming Potential) values
  //   const gwpValues = {
  //     'CO2': 1,
  //     'CH4': 28,
  //     'N2O': 265,
  //     'HFC-23': 12400,
  //     'HFC-32': 677,
  //     'HFC-125': 3170,
  //     'HFC-134a': 1300,
  //     'HFC-143a': 4800,
  //     'HFC-152a': 138,
  //     'HFC-227ea': 3350,
  //     'HFC-236fa': 8060,
  //     'HFC-245fa': 858,
  //     'HFC-365mfc': 804,
  //     'HFC-43-10mee': 1650,
  //     'CF4': 6630,
  //     'C2F6': 11100,
  //     'C3F8': 8900,
  //     'C4F10': 9200,
  //     'C5F12': 8550,
  //     'C6F14': 7910,
  //     'SF6': 23500,
  //     'NF3': 16100
  //   };

  //   const gwp = gwpValues[gasEmitted] || 1;
  //   const amountNum = Number(amount) || 0;

  //   const totalEmissionInScope = amountNum * gwp;

  //   return {
  //     totalEmissionInScope,
  //     totalEmissionOutScope: 0
  //   };
  // }, []);
  const calculateProcessEmissions = useCallback((activityType, amount) => {
  // Get the emission factor for this activity type
  const emissionFactor = processEmissionFactors[activityType];
  
  if (!emissionFactor) {
    console.warn(`No emission factor found for activity type: "${activityType}"`);
    return {
      totalEmissionInScope: 0,
      totalEmissionOutScope: 0
    };
  }
  
  const amountNum = Number(amount) || 0;
  const totalEmissionKg = amountNum * emissionFactor; // kgCO2e
  const totalEmissionT = totalEmissionKg / 1000; // tCO2e

  return {
    totalEmissionInScope: totalEmissionKg,
    totalEmissionOutScope: 0
  };
}, []);

// Also update the transformProcessPayload function to pass activityType instead of gasEmitted:


  const transformProcessPayload = useCallback((row) => {
    const emissions = calculateProcessEmissions(
      row.activitytype, 
      Number(row.amountofemissions)
    );

    return {
      buildingCode: row.buildingcode,
      stakeholderDepartment: row.stakeholderdepartment,
      activityType: row.activitytype,
      processActivityData: cleanStringValue(row.processactivitydata), // New field
      gasEmitted: row.gasemitted,
      amountOfEmissions: cleanNumberValue(row.amountofemissions),
      qualityControl: row.qualitycontrol,
      remarks: cleanStringValue(row.remarks) || '',
      postingDate: row.postingdate,
      calculatedEmissionKgCo2e: emissions?.totalEmissionInScope || 0,
      calculatedEmissionTCo2e: emissions?.totalEmissionInScope ? emissions.totalEmissionInScope / 1000 : 0,
      calculatedBioEmissionKgCo2e: emissions?.totalEmissionOutScope || 0,
      calculatedBioEmissionTCo2e: emissions?.totalEmissionOutScope ? emissions.totalEmissionOutScope / 1000 : 0,
    };
  }, [calculateProcessEmissions, cleanNumberValue, cleanStringValue]);

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
      
      if (!data || data.length === 0) {
        toast.error('No data found in file');
        return null;
      }

      const errors = [];

      // Validate each row
      data.forEach((row, index) => {
        const rowErrors = validateProcessRow(row, index);
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
          const payload = transformProcessPayload(row);

          await axios.post(
            `${process.env.REACT_APP_BASE_URL}/Process-Emissions/create`,
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

const downloadProcessTemplate = useCallback(() => {
    const exampleBuildings = buildings.slice(0, 1);
    const exampleBuildingCode = exampleBuildings[0]?.buildingCode || 'BLD-EXAMPLE-001';
    const exampleStakeholder = stakeholderDepartmentOptions[0]?.value || 'Assembly';
    const exampleQC = 'Good';

    // Get current date in DD/MM/YYYY format for the template
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
        'Type Of Activity / Process',
        'Process Activity Data',
        'Amount',
        'Quality Control',
        'Remarks',
        'Posting Date'
      ]
    ];

    // Add ONE example row with all fields filled (using first activity type as example)
    const firstActivity = PROCESS_ACTIVITY_DATA[0];
    worksheetData.push([
      exampleBuildingCode,
      exampleStakeholder,
      firstActivity.value,
      firstActivity.label,
      '100',
      exampleQC,
      'Example record - Replace with your data',  // Remarks only for example record
      formattedDate
    ]);

    // Add ALL activity types with their labels (only these two columns filled, remarks empty)
    PROCESS_ACTIVITY_DATA.forEach((activity) => {
      worksheetData.push([
        '',  // Building Code - leave empty
        '',  // Stakeholder Department - leave empty
        activity.value,  // Type Of Activity / Process
        activity.label,  // Activity Data
        '',  // Process Activity Data - leave empty
        '',  // Quality Control - leave empty
        '',  // Remarks - leave empty (no extra text)
        ''   // Posting Date - leave empty
      ]);
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Auto-size columns for better readability
    worksheet['!cols'] = [
      { wch: 20 }, // Building Code
      { wch: 25 }, // Stakeholder Department
      { wch: 45 }, // Type Of Activity / Process
      { wch: 45 }, // Activity Data
      { wch: 25 }, // Process Activity Data (Amount)
      { wch: 20 }, // Quality Control
      { wch: 40 }, // Remarks
      { wch: 15 }  // Posting Date
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Process Emissions Template');

    // Download the Excel file
    XLSX.writeFile(workbook, 'process_emissions_template.xlsx');
  }, [buildings]);
  return {
    csvState,
    handleFileSelect,
    processUpload,
    resetUpload,
    downloadProcessTemplate,
  };
};

export default useProcessCSVUpload;

