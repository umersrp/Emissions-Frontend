// import { useState, useCallback } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { calculateStationaryEmissions } from '@/utils/scope1/calculate-stationary-emissions';
// import {
//   stakeholderOptions,
//   equipmentTypeOptions,
//   fuelTypeOptions,
//   fuelNameOptionsByType,
//   qualityControlOptions,
//   fuelUnitOptionsByName,
// } from '@/constant/scope1/stationary-data';
// import { normalizeSubscriptNumbers } from '@/utils/normalizeText';
// import * as XLSX from "xlsx";

// const useStationaryCSVUpload = (buildings = []) => {
//   const [csvState, setCsvState] = useState({
//     file: null,
//     uploading: false,
//     progress: 0,
//     results: null,
//     validationErrors: [],
//     parsedData: null,
//   });


//   const cleanCSVValue = useCallback((value) => {
//     if (typeof value !== 'string') return value;

//     let cleaned = value.trim();

//     // Remove surrounding quotes
//     cleaned = cleaned.replace(/^["']+|["']+$/g, '');

//     // Remove Excel formula prefix
//     cleaned = cleaned.replace(/^=/, '');

//     return cleaned;
//   }, []);

//   // Helper function to parse date in any format to ISO
// // Updated parseDateToISO function with better DD/MM/YYYY handling
// const parseDateToISO = useCallback((dateString) => {
//   if (!dateString) return null;
  
//   let cleanedDate = dateString.toString().trim();
//   cleanedDate = cleanedDate.replace(/"/g, ''); // Remove quotes
  
//   // Handle empty or invalid dates
//   if (!cleanedDate || cleanedDate === '') return null;
  
//   // Try to parse the date
//   let date;
//   let year, month, day;
  
//   // Check if it's already an ISO string with timezone
//   if (cleanedDate.includes('T')) {
//     // Extract just the date part if it's a full ISO string
//     date = new Date(cleanedDate.split('T')[0]);
//   } else {
//     // Try to parse common date formats
//     const parts = cleanedDate.split(/[\/\-\.]/);
    
//     if (parts.length === 3) {
//       // Try different date format interpretations
//       if (parts[0].length === 4) {
//         // Format: YYYY-MM-DD
//         year = parseInt(parts[0]);
//         month = parseInt(parts[1]) - 1; // Month is 0-indexed
//         day = parseInt(parts[2]);
//         date = new Date(year, month, day);
//       } else if (parts[2].length === 4) {
//         // Could be MM/DD/YYYY or DD/MM/YYYY
//         // Check if first part is > 12 (likely day in DD/MM/YYYY)
//         if (parseInt(parts[0]) > 12) {
//           // Likely DD/MM/YYYY
//           day = parseInt(parts[0]);
//           month = parseInt(parts[1]) - 1;
//           year = parseInt(parts[2]);
//           date = new Date(year, month, day);
//         } else if (parseInt(parts[1]) > 12) {
//           // Likely MM/DD/YYYY (second part is day)
//           month = parseInt(parts[0]) - 1;
//           day = parseInt(parts[1]);
//           year = parseInt(parts[2]);
//           date = new Date(year, month, day);
//         } else {
//           // Ambiguous - try both and see which is valid
//           // First try MM/DD/YYYY
//           let testDate1 = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
//           // Then try DD/MM/YYYY
//           let testDate2 = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          
//           if (!isNaN(testDate1.getTime()) && testDate1.getDate() === parseInt(parts[1])) {
//             date = testDate1;
//           } else if (!isNaN(testDate2.getTime()) && testDate2.getDate() === parseInt(parts[0])) {
//             date = testDate2;
//           }
//         }
//       } else {
//         // Try creating date directly (browser might parse it)
//         date = new Date(cleanedDate);
//       }
//     } else {
//       // Try creating date directly
//       date = new Date(cleanedDate);
//     }
//   }
  
//   // If still invalid, return null
//   if (!date || isNaN(date.getTime())) {
//     return null;
//   }
  
//   // Create ISO string with time set to midnight UTC
//   const isoDate = new Date(
//     Date.UTC(
//       date.getFullYear(),
//       date.getMonth(),
//       date.getDate(),
//       0, 0, 0, 0
//     )
//   ).toISOString();
  
//   return isoDate;
// }, []);

//   const parseCSV = useCallback((file) => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         try {
//           const csvText = event.target.result;

//           // Use a simple, robust CSV parser
//           const parseCSVLine = (line) => {
//             const result = [];
//             let current = '';
//             let inQuotes = false;

//             for (let i = 0; i < line.length; i++) {
//               const char = line[i];
//               const nextChar = line[i + 1];

//               if (char === '"') {
//                 if (inQuotes && nextChar === '"') {
//                   // Double quote inside quotes = escaped quote
//                   current += '"';
//                   i++; // Skip next character
//                 } else {
//                   // Start or end quotes
//                   inQuotes = !inQuotes;
//                 }
//               } else if (char === ',' && !inQuotes) {
//                 // End of field
//                 result.push(current);
//                 current = '';
//               } else {
//                 // Regular character
//                 current += char;
//               }
//             }

//             // Add the last field
//             result.push(current);
//             return result;
//           };

//           const lines = csvText.split('\n').filter(line => line.trim() !== '');

//           if (lines.length === 0) {
//             reject(new Error('CSV file is empty'));
//             return;
//           }

//           // Find header row - allow headers with spaces/hyphens/underscores by
//           // normalizing the line to alphanumeric only before checking.
//           let headerRowIndex = -1;
//           for (let i = 0; i < lines.length; i++) {
//             const compactLine = lines[i]
//               .replace(/['"]/g, '') // remove quotes
//               .toLowerCase()
//               .replace(/[^a-z0-9]/g, ''); // keep only alphanumeric

//             if (compactLine.includes('buildingcode') && compactLine.includes('stakeholder')) {
//               headerRowIndex = i;
//               break;
//             }
//           }

//           if (headerRowIndex === -1) {
//             reject(new Error('CSV must contain header row with: buildingCode, stakeholder, equipmentType, fuelType, fuelName, fuelConsumption, consumptionUnit, qualityControl, remarks, postingDate'));
//             return;
//           }

//           // Parse headers and normalize them to alphanumeric keys so headers
//           // like "Building Code" or "building_code" -> "buildingcode"
//           const headerValues = parseCSVLine(lines[headerRowIndex]);
//           const headers = headerValues.map(h =>
//             cleanCSVValue(h).toLowerCase().replace(/[^a-z0-9]/g, '')
//           );

//           // Expected headers
//           const expectedHeaders = [
//             'buildingcode', 'stakeholder', 'equipmenttype', 'fueltype',
//             'fuelname', 'fuelconsumption', 'consumptionunit', 'qualitycontrol', 'remarks', 'postingdate'
//           ];

//           // Check for missing headers
//           const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
//           if (missingHeaders.length > 0) {
//             reject(new Error(`Missing required columns: ${missingHeaders.join(', ')}`));
//             return;
//           }

//           // Parse data rows
//           const data = [];
//           for (let i = headerRowIndex + 1; i < lines.length; i++) {
//             const line = lines[i].trim();
//             if (!line) continue;

//             const values = parseCSVLine(line);

//             // Map values to headers
//             const row = {};
//             headers.forEach((header, index) => {
//               row[header] = index < values.length ? cleanCSVValue(values[index]) : '';
//             });

//             // Only add row if it has data
//             if (Object.values(row).some(val => val && val.toString().trim() !== '')) {
//               data.push(row);
//             }
//           }

//           console.log('Parsed CSV data:', JSON.stringify(data, null, 2)); // Debug log

//           resolve(data);
//         } catch (error) {
//           reject(new Error(`Error parsing CSV: ${error.message}`));
//         }
//       };
//       reader.onerror = () => reject(new Error('Failed to read file'));
//       reader.readAsText(file);
//     });
//   }, [cleanCSVValue]);

  

//   const validateStationaryRow = useCallback((row, index) => {
//     const errors = [];
//     const cleanedRow = {};

//     // Clean all row values
//     Object.keys(row).forEach(key => {
//       cleanedRow[key] = row[key]?.toString().trim();
//     });

//     // Required fields validation
//     const requiredFields = [
//       'buildingcode', 'stakeholder', 'equipmenttype', 'fueltype',
//       'fuelname', 'fuelconsumption', 'consumptionunit', 'qualitycontrol'
//     ];

//     requiredFields.forEach(field => {
//       if (!cleanedRow[field] || cleanedRow[field] === '') {
//         errors.push(`${field} is required`);
//       }
//     });

//     // Building validation - now using buildingCode instead of _id
//     if (cleanedRow.buildingcode && buildings.length > 0) {
//       const buildingExists = buildings.some(b =>
//         b.buildingCode && b.buildingCode.toLowerCase() === cleanedRow.buildingcode.toLowerCase()
//       );
//       if (!buildingExists) {
//         errors.push(`Invalid building code "${cleanedRow.buildingcode}". Available: ${buildings.slice(0, 3).map(b => b.buildingCode).join(', ')}...`);
//       }
//     }

//     // Stakeholder validation (case-insensitive)
//     if (cleanedRow.stakeholder) {
//       const validStakeholders = stakeholderOptions.map(s => s.value);
//       const matchedStakeholder = validStakeholders.find(s =>
//         s.toLowerCase() === cleanedRow.stakeholder.toLowerCase()
//       );
//       if (!matchedStakeholder) {
//         errors.push(`Invalid stakeholder "${cleanedRow.stakeholder}". Valid options: ${validStakeholders.slice(0, 5).join(', ')}...`);
//       } else {
//         cleanedRow.stakeholder = matchedStakeholder;
//       }
//     }

//     // Equipment type validation
//     // if (cleanedRow.equipmenttype) {
//     //   const validEquipment = equipmentTypeOptions.map(e => e.value);
//     //   const matchedEquipment = validEquipment.find(e =>
//     //     e.toLowerCase() === cleanedRow.equipmenttype.toLowerCase()
//     //   );
//     //   if (!matchedEquipment) {
//     //     errors.push(`Invalid equipment type "${cleanedRow.equipmenttype}"`);
//     //   } else {
//     //     cleanedRow.equipmenttype = matchedEquipment;
//     //   }
//     // }
//     // Equipment type validation
// if (cleanedRow.equipmenttype) {
//   const validEquipment = equipmentTypeOptions.map(e => e.value);
//   const normalizedInput = normalizeSubscriptNumbers(cleanedRow.equipmenttype);
  
//   const matchedEquipment = validEquipment.find(equipment => {
//     const normalizedEquipment = normalizeSubscriptNumbers(equipment);
//     return normalizedEquipment.toLowerCase() === normalizedInput.toLowerCase();
//   });
  
//   if (!matchedEquipment) {
//     errors.push(`Invalid equipment type "${cleanedRow.equipmenttype}"`);
//   } else {
//     cleanedRow.equipmenttype = matchedEquipment;
//   }
// }

//     // Fuel type validation
//     if (cleanedRow.fueltype) {
//       const validFuelTypes = fuelTypeOptions.map(f => f.value);
//       const matchedFuelType = validFuelTypes.find(f =>
//         f.toLowerCase() === cleanedRow.fueltype.toLowerCase()
//       );
//       if (!matchedFuelType) {
//         errors.push(`Invalid fuel type "${cleanedRow.fueltype}". Valid: ${validFuelTypes.join(', ')}`);
//       } else {
//         cleanedRow.fueltype = matchedFuelType;
//       }
//     }

//     // Fuel name validation based on fuel type
//     if (cleanedRow.fueltype && cleanedRow.fuelname) {
//       const validFuelNames = fuelNameOptionsByType[cleanedRow.fueltype]?.map(f => f.value) || [];
//       const matchedFuelName = validFuelNames.find(f =>
//         f.toLowerCase() === cleanedRow.fuelname.toLowerCase()
//       );
//       if (!matchedFuelName) {
//         errors.push(`Invalid fuel name "${cleanedRow.fuelname}" for type "${cleanedRow.fueltype}"`);
//       } else {
//         cleanedRow.fuelname = matchedFuelName;
//       }
//     }

//     // Fuel consumption validation
//     if (cleanedRow.fuelconsumption) {
//       const cleanNum = cleanedRow.fuelconsumption.toString()
//         .replace(/[^0-9.-]/g, '')
//         .replace(/^"+|"+$/g, '');

//       const num = Number(cleanNum);
//       if (isNaN(num)) {
//         errors.push(`Fuel consumption must be a number, got "${cleanedRow.fuelconsumption}"`);
//       } else if (num < 0) {
//         errors.push('Fuel consumption cannot be negative');
//       } else if (num > 1000000000) { // Reasonable upper limit
//         errors.push('Fuel consumption seems too large');
//       } else {
//         cleanedRow.fuelconsumption = num.toString();
//       }
//     }

//     // Consumption unit validation
//     if (cleanedRow.consumptionunit) {
//       const allUnits = [
//         ...fuelUnitOptionsByName.default,
//         ...(cleanedRow.fuelname ? fuelUnitOptionsByName[cleanedRow.fuelname] || [] : [])
//       ];

//       const cleanUnit = cleanedRow.consumptionunit.toLowerCase();
//       const matchedUnit = allUnits.find(u => u.toLowerCase() === cleanUnit);

//       if (!matchedUnit) {
//         errors.push(`Invalid consumption unit "${cleanedRow.consumptionunit}". Valid options include: ${allUnits.slice(0, 5).join(', ')}...`);
//       } else {
//         cleanedRow.consumptionunit = matchedUnit;
//       }
//     }

//     // Quality control validation
//     if (cleanedRow.qualitycontrol) {
//       const validQC = qualityControlOptions.map(q => q.value);
//       const matchedQC = validQC.find(q =>
//         q.toLowerCase() === cleanedRow.qualitycontrol.toLowerCase()
//       );
//       if (!matchedQC) {
//         errors.push(`Invalid quality control "${cleanedRow.qualitycontrol}". Valid: ${validQC.join(', ')}`);
//       } else {
//         cleanedRow.qualitycontrol = matchedQC;
//       }
//     }

//     // Date validation with flexible parsing
//     if (cleanedRow.postingdate) {
//       const isoDate = parseDateToISO(cleanedRow.postingdate);
      
//       if (!isoDate) {
//         errors.push(`Invalid date format: "${cleanedRow.postingdate}". Please provide a valid date (e.g., 2024-01-15, 01/15/2024, 15-01-2024)`);
//       } else {
//         cleanedRow.postingdate = isoDate;
//       }
//     } else {
//       // If no date provided, use current date in ISO format
//       cleanedRow.postingdate = new Date(
//         Date.UTC(
//           new Date().getFullYear(),
//           new Date().getMonth(),
//           new Date().getDate(),
//           0, 0, 0, 0
//         )
//       ).toISOString();
//     }

//     // Remarks validation (optional but check length)
//     if (cleanedRow.remarks && cleanedRow.remarks.length > 500) {
//       errors.push('Remarks cannot exceed 500 characters');
//     }

//     // Update original row with cleaned values if no errors
//     if (errors.length === 0) {
//       Object.keys(cleanedRow).forEach(key => {
//         row[key] = cleanedRow[key];
//       });
//     }

//     return errors;
//   }, [buildings, parseDateToISO]);

//   const transformStationaryPayload = useCallback((row) => {
//     const emissions = calculateStationaryEmissions(
//       row.fuelname,
//       Number(row.fuelconsumption),
//       row.consumptionunit
//     );

//     return {
//       buildingCode: row.buildingcode,
//       stakeholder: row.stakeholder,
//       equipmentType: row.equipmenttype,
//       fuelType: row.fueltype,
//       fuelName: row.fuelname,
//       fuelConsumption: parseFloat(row.fuelconsumption),
//       consumptionUnit: row.consumptionunit,
//       qualityControl: row.qualitycontrol,
//       remarks: row.remarks || '',
//       postingDate: row.postingdate, // Already in ISO format from validation
//       calculatedEmissionKgCo2e: emissions?.totalEmissionInScope || 0,
//       calculatedEmissionTCo2e: emissions?.totalEmissionInScope ? emissions.totalEmissionInScope / 1000 : 0,
//       calculatedBioEmissionKgCo2e: emissions?.totalEmissionOutScope || 0,
//       calculatedBioEmissionTCo2e: emissions?.totalEmissionOutScope ? emissions.totalEmissionOutScope / 1000 : 0,
//     };
//   }, []);

//   const handleFileSelect = async (file) => {
//     if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.csv') && !file.name.endsWith('.xls')) {
//       toast.error('Please select a CSV or Excel file');
//       console.error('Invalid file type selected:', file.name);
//       return null;
//     }

//     if (file.size > 10 * 1024 * 1024) {
//       toast.error('File size must be less than 10MB');
//       return null;
//     }

//     try {
//       const data = await parseCSV(file);
//       const errors = [];

//       // Validate each row
//       data.forEach((row, index) => {
//         const rowErrors = validateStationaryRow(row, index);
//         if (rowErrors.length > 0) {
//           errors.push(`Row ${index + 2}: ${rowErrors.join(', ')}`);
//         }
//       });

//       setCsvState(prev => ({
//         ...prev,
//         file,
//         parsedData: data,
//         validationErrors: errors,
//       }));

//       if (errors.length === 0) {
//         // toast.success(`CSV validated: ${data.length} rows ready for upload`);
//       } else {
//         // toast.warning(`Found ${errors.length} validation errors. Please fix them before uploading.`);
//       }

//       return data;
//     } catch (error) {
//       //  toast.error(`Error parsing CSV: ${error.message}`);
//       return null;
//     }
//   };

//   const processUpload = async (onSuccess = null) => {
//     console.log('processUpload started');
//     const { file, parsedData, validationErrors } = csvState;

//     if (!file || validationErrors.length > 0 || !parsedData) {
//       toast.error('Please fix validation errors first');
//       return null;
//     }

//     // 1. Initialize Uploading State
//     setCsvState(prev => ({
//       ...prev,
//       uploading: true,
//       progress: 0,
//       results: null // Clear previous results
//     }));

//     const results = {
//       success: 0,
//       failed: 0,
//       errors: []
//     };

//     try {
//       const totalRows = parsedData.length;

//       for (let i = 0; i < totalRows; i++) {
//         const row = parsedData[i];

//         try {
//           const payload = transformStationaryPayload(row);

//           await axios.post(
//             `${process.env.REACT_APP_BASE_URL}/stationary/create`,
//             payload,
//             {
//               headers: {
//                 Authorization: `Bearer ${localStorage.getItem('token')}`,
//                 'Content-Type': 'application/json'
//               }
//             }
//           );

//           results.success++;
//         } catch (error) {
//           results.failed++;
//           const errorMessage = error.response?.data?.message || error.message;
//           results.errors.push({
//             row: i + 1,
//             error: errorMessage
//           });
//         }

//         // 2. Optimized Progress Updates
//         const currentProgress = Math.round(((i + 1) / totalRows) * 100);
//         const isLastRow = i === totalRows - 1;

//         // Update every 10% or on the very last row
//         if (currentProgress % 10 === 0 || isLastRow) {
//           setCsvState(prev => ({
//             ...prev,
//             progress: currentProgress
//           }));
//         }
//       }

//       // 3. Final State Update (SUCCESS/PARTIAL SUCCESS)
//       // We set uploading to false HERE so the UI knows the process is finished
//       setCsvState(prev => ({
//         ...prev,
//         progress: 100,
//         results: results,
//         uploading: false
//       }));  

//       setTimeout(() => {
//         if (results.failed === 0) {
//           toast.success(`Successfully uploaded ${results.success} records!`);
//           if (onSuccess) onSuccess(results);
//         } else {
//           toast.warning(`Uploaded ${results.success} records, ${results.failed} failed.`);
//         }
//       }, 2000);
//       console.log('processUpload completed successfully');
//       return results;

//     } catch (error) {
//       // 4. Final State Update (CRITICAL FAILURE)
//       console.error('Critical upload error:', error);
//       setCsvState(prev => ({
//         ...prev,
//         uploading: false,
//         progress: 0
//       }));
//       toast.error('Upload failed unexpectedly');
//       throw error;
//     }
//   };
  
//   const resetUpload = () => {
//     setCsvState({
//       file: null,
//       uploading: false,
//       progress: 0,
//       results: null,
//       validationErrors: [],
//       parsedData: null,
//     });
//   };

//   const downloadStationaryTemplate = () => {
//     const exampleBuildings = buildings.slice(0, 1);
//     const exampleBuildingCode = exampleBuildings[0]?.buildingCode || 'BLD-EXAMPLE-001';
    
//     const exampleStakeholder = stakeholderOptions[0]?.value || 'Assembly';
//     const exampleEquipment = equipmentTypeOptions.find(e => e.value === 'Amine Reboilers')?.value || 'Amine Reboilers';
//     const exampleFuelType = 'Gaseous Fuel';
//     const exampleFuelName = 'Butane';
//     const exampleUnit = 'kg';
//     const exampleQC = 'Good';
    
//     // Get current date in ISO format with time set to midnight UTC
//     const currentDate = new Date();
//     const formattedDate = new Date(
//       Date.UTC(
//         currentDate.getFullYear(),
//         currentDate.getMonth(),
//         currentDate.getDate(),
//         0, 0, 0, 0
//       )
//     ).toISOString();

//     const template = `building code,stakeholder,equipment type,fuel type,fuel name,fuel consumption,consumption unit,quality control,remarks,posting date
// ${exampleBuildingCode},${exampleStakeholder},${exampleEquipment},${exampleFuelType},${exampleFuelName},100,${exampleUnit},${exampleQC},Example record,dd/mm/yyyy`;

//   // Add UTF-8 BOM (Byte Order Mark) to ensure Excel recognizes UTF-8 encoding
//   const BOM = '\uFEFF';
//   const blob = new Blob([BOM + template], { type: 'text/csv;charset=utf-8;' });
//     // const blob = new Blob([template], { type: 'text/csv' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'stationary_template.csv';
//     document.body.appendChild(a);
//     a.click();
//     URL.revokeObjectURL(url);
//     document.body.removeChild(a);
//   };

//   return {
//     csvState,
//     handleFileSelect,
//     processUpload,
//     resetUpload,
//     downloadStationaryTemplate,
//   };
// };

// export default useStationaryCSVUpload;


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

const useStationaryCSVUpload = (buildings = []) => {
  const [csvState, setCsvState] = useState({
    file: null,
    uploading: false,
    progress: 0,
    results: null,
    validationErrors: [],
    parsedData: null,
  });

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
          const expectedHeaders = [
            'buildingcode', 'stakeholder', 'equipmenttype', 'fueltype',
            'fuelname', 'fuelconsumption', 'consumptionunit', 'qualitycontrol', 'remarks', 'postingdate'
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

            // Map values to headers
            const row = {};
            headers.forEach((header, index) => {
              row[header] = index < values.length ? cleanCSVValue(values[index]) : '';
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

          // Get headers
          const headers = jsonData[headerRowIndex].map(header => 
            cleanCSVValue(header).toLowerCase().replace(/[^a-z0-9]/g, '')
          );

          // Expected headers
          const expectedHeaders = [
            'buildingcode', 'stakeholder', 'equipmenttype', 'fueltype',
            'fuelname', 'fuelconsumption', 'consumptionunit', 'qualitycontrol', 'remarks', 'postingdate'
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
              const value = index < row.length ? row[index] : '';
              rowData[header] = value ? cleanCSVValue(value) : '';
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
        errors.push(`Invalid building code "${cleanedRow.buildingcode}". Available: ${buildings.slice(0, 3).map(b => b.buildingCode).join(', ')}...`);
      }
    }

    // Stakeholder validation
    if (cleanedRow.stakeholder) {
      const validStakeholders = stakeholderOptions.map(s => s.value);
      const matchedStakeholder = validStakeholders.find(s =>
        s.toLowerCase() === cleanedRow.stakeholder.toLowerCase()
      );
      if (!matchedStakeholder) {
        errors.push(`Invalid stakeholder "${cleanedRow.stakeholder}". Valid options: ${validStakeholders.slice(0, 5).join(', ')}...`);
      } else {
        cleanedRow.stakeholder = matchedStakeholder;
      }
    }

    // Equipment type validation
    if (cleanedRow.equipmenttype) {
      const validEquipment = equipmentTypeOptions.map(e => e.value);
      const normalizedInput = normalizeSubscriptNumbers(cleanedRow.equipmenttype);
      
      const matchedEquipment = validEquipment.find(equipment => {
        const normalizedEquipment = normalizeSubscriptNumbers(equipment);
        return normalizedEquipment.toLowerCase() === normalizedInput.toLowerCase();
      });
      
      if (!matchedEquipment) {
        errors.push(`Invalid equipment type "${cleanedRow.equipmenttype}"`);
      } else {
        cleanedRow.equipmenttype = matchedEquipment;
      }
    }

    // Fuel type validation
    if (cleanedRow.fueltype) {
      const validFuelTypes = fuelTypeOptions.map(f => f.value);
      const matchedFuelType = validFuelTypes.find(f =>
        f.toLowerCase() === cleanedRow.fueltype.toLowerCase()
      );
      if (!matchedFuelType) {
        errors.push(`Invalid fuel type "${cleanedRow.fueltype}". Valid: ${validFuelTypes.join(', ')}`);
      } else {
        cleanedRow.fueltype = matchedFuelType;
      }
    }

    // Fuel name validation
    if (cleanedRow.fueltype && cleanedRow.fuelname) {
      const validFuelNames = fuelNameOptionsByType[cleanedRow.fueltype]?.map(f => f.value) || [];
      const matchedFuelName = validFuelNames.find(f =>
        f.toLowerCase() === cleanedRow.fuelname.toLowerCase()
      );
      if (!matchedFuelName) {
        errors.push(`Invalid fuel name "${cleanedRow.fuelname}" for type "${cleanedRow.fueltype}"`);
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
        errors.push(`Invalid consumption unit "${cleanedRow.consumptionunit}". Valid options include: ${allUnits.slice(0, 5).join(', ')}...`);
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
        errors.push(`Invalid quality control "${cleanedRow.qualitycontrol}". Valid: ${validQC.join(', ')}`);
      } else {
        cleanedRow.qualitycontrol = matchedQC;
      }
    }

    // Date validation
    if (cleanedRow.postingdate) {
      const isoDate = parseDateToISO(cleanedRow.postingdate);
      
      if (!isoDate) {
        errors.push(`Invalid date format: "${cleanedRow.postingdate}". Please provide a valid date (e.g., 2024-01-15, 01/15/2024, 15-01-2024)`);
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
      fuelConsumption: parseFloat(row.fuelconsumption),
      consumptionUnit: row.consumptionunit,
      qualityControl: row.qualitycontrol,
      remarks: row.remarks || '',
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

  // Create worksheet data with headers
  const worksheetData = [
    [
      'building code',
      'stakeholder',
      'equipment type',
      'fuel type',
      'fuel name',
      'fuel consumption',
      'consumption unit',
      'quality control',
      'remarks',
      'posting date'
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
