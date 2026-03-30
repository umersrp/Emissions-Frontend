// // hooks/scope3/useWasteGeneratedCSVUpload.js
// import { useState, useCallback } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { calculateWasteEmission } from '@/utils/Scope3/calculateWasteGenerated';
// import {
//   wasteCategoryOptions,
//   wasteTypeOptions,
//   wasteTreatmentOptions,
// } from "@/constant/scope3/wasteGenerated";
// import {
//   qualityControlOptions,
//   FugitiveAndMobileStakeholderOptions
// } from "@/constant/scope1/options"

// const unitOptions = [
//   { value: 'Tonnes', label: 'Tonnes' },
// ];

// const useWasteGeneratedCSVUpload = (buildings = []) => {
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
//   const parseDateToISO = useCallback((dateString) => {
//     if (!dateString) return null;
    
//     let cleanedDate = dateString.toString().trim();
//     cleanedDate = cleanedDate.replace(/"/g, ''); // Remove quotes
    
//     if (!cleanedDate || cleanedDate === '') return null;
    
//     let date;
//     let year, month, day;
    
//     if (cleanedDate.includes('T')) {
//       date = new Date(cleanedDate.split('T')[0]);
//     } else {
//       const parts = cleanedDate.split(/[\/\-\.]/);
      
//       if (parts.length === 3) {
//         if (parts[0].length === 4) {
//           // Format: YYYY-MM-DD
//           year = parseInt(parts[0]);
//           month = parseInt(parts[1]) - 1;
//           day = parseInt(parts[2]);
//           date = new Date(year, month, day);
//         } else if (parts[2].length === 4) {
//           // Could be MM/DD/YYYY or DD/MM/YYYY
//           if (parseInt(parts[0]) > 12) {
//             // Likely DD/MM/YYYY
//             day = parseInt(parts[0]);
//             month = parseInt(parts[1]) - 1;
//             year = parseInt(parts[2]);
//             date = new Date(year, month, day);
//           } else if (parseInt(parts[1]) > 12) {
//             // Likely MM/DD/YYYY
//             month = parseInt(parts[0]) - 1;
//             day = parseInt(parts[1]);
//             year = parseInt(parts[2]);
//             date = new Date(year, month, day);
//           } else {
//             // Ambiguous - try both
//             let testDate1 = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
//             let testDate2 = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            
//             if (!isNaN(testDate1.getTime()) && testDate1.getDate() === parseInt(parts[1])) {
//               date = testDate1;
//             } else if (!isNaN(testDate2.getTime()) && testDate2.getDate() === parseInt(parts[0])) {
//               date = testDate2;
//             } else {
//               date = testDate1; // Default to first interpretation
//             }
//           }
//         } else {
//           date = new Date(cleanedDate);
//         }
//       } else {
//         date = new Date(cleanedDate);
//       }
//     }
    
//     if (!date || isNaN(date.getTime())) {
//       return null;
//     }
    
//     const isoDate = new Date(
//       Date.UTC(
//         date.getFullYear(),
//         date.getMonth(),
//         date.getDate(),
//         0, 0, 0, 0
//       )
//     ).toISOString();
    
//     return isoDate;
//   }, []);

//   const parseCSV = useCallback((file) => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         try {
//           const csvText = event.target.result;

//           const parseCSVLine = (line) => {
//             const result = [];
//             let current = '';
//             let inQuotes = false;

//             for (let i = 0; i < line.length; i++) {
//               const char = line[i];
//               const nextChar = line[i + 1];

//               if (char === '"') {
//                 if (inQuotes && nextChar === '"') {
//                   current += '"';
//                   i++;
//                 } else {
//                   inQuotes = !inQuotes;
//                 }
//               } else if (char === ',' && !inQuotes) {
//                 result.push(current);
//                 current = '';
//               } else {
//                 current += char;
//               }
//             }

//             result.push(current);
//             return result;
//           };

//           const lines = csvText.split('\n').filter(line => line.trim() !== '');

//           if (lines.length === 0) {
//             reject(new Error('CSV file is empty'));
//             return;
//           }

//           // Find header row
//           let headerRowIndex = -1;
//           for (let i = 0; i < lines.length; i++) {
//             const lineLower = lines[i].toLowerCase();
//             if (lineLower.includes('buildingcode') || 
//                 (lineLower.includes('building') && lineLower.includes('code')) ||
//                 (lineLower.includes('building') && lineLower.includes('wastecategory'))) {
//               headerRowIndex = i;
//               break;
//             }
//           }

//           if (headerRowIndex === -1) {
//             reject(new Error('CSV must contain header row with required columns'));
//             return;
//           }

//           const headerValues = parseCSVLine(lines[headerRowIndex]);
//           const headers = headerValues.map(h => {
//             // Clean the header: remove quotes, trim, lowercase, and normalize spaces/underscores/hyphens
//             return cleanCSVValue(h)
//               .toLowerCase()
//               .replace(/[^a-z0-9]/g, ''); // Remove all non-alphanumeric characters
//           });

//           // Expected headers (normalized)
//           const expectedHeaders = [
//             'buildingcode', 
//             'stakeholder', 
//             'wastecategory', 
//             'wastetype',
//             'wastetreatmentmethod', 
//             'unit', 
//             'totalwasteqty', 
//             'qualitycontrol',
//             'remarks', 
//             'postingdate'
//           ];

//           // Check for missing headers
//           const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
//           if (missingHeaders.length > 0) {
//             reject(new Error(`Missing required columns: ${missingHeaders.slice(0, 5).join(', ')}. Please ensure your CSV has the correct headers.`));
//             return;
//           }

//           const data = [];
//           for (let i = headerRowIndex + 1; i < lines.length; i++) {
//             const line = lines[i].trim();
//             if (!line) continue;

//             const values = parseCSVLine(line);
//             const row = {};
            
//             headers.forEach((header, index) => {
//               row[header] = index < values.length ? cleanCSVValue(values[index]) : '';
//             });

//             // Only add row if it has some data
//             if (Object.values(row).some(val => val && val.toString().trim() !== '')) {
//               data.push(row);
//             }
//           }

//           console.log('Parsed CSV data:', data); // Debug log
//           resolve(data);
//         } catch (error) {
//           console.error('CSV parsing error:', error);
//           reject(new Error(`Error parsing CSV: ${error.message}`));
//         }
//       };
//       reader.onerror = () => reject(new Error('Failed to read file'));
//       reader.readAsText(file);
//     });
//   }, [cleanCSVValue]);

//   const validateWasteRow = useCallback((row, index) => {
//     const errors = [];
//     const cleanedRow = {};

//     // Clean all row values
//     Object.keys(row).forEach(key => {
//       cleanedRow[key] = row[key]?.toString().trim() || '';
//     });

//     console.log(`Validating row ${index + 1}:`, cleanedRow); // Debug log

//     // Required fields validation
//     const requiredFields = [
//       'buildingcode', 
//       'stakeholder', 
//       'wastecategory', 
//       'wastetype',
//       'wastetreatmentmethod', 
//       'totalwasteqty', 
//       'qualitycontrol'
//     ];

//     requiredFields.forEach(field => {
//       if (!cleanedRow[field] || cleanedRow[field] === '') {
//         errors.push(`${field} is required`);
//       }
//     });

//     // If there are missing required fields, return early
//     if (errors.length > 0) {
//       return errors;
//     }

//     // Building validation
//     if (cleanedRow.buildingcode && buildings.length > 0) {
//       const buildingExists = buildings.some(b =>
//         b.buildingCode && b.buildingCode.toLowerCase() === cleanedRow.buildingcode.toLowerCase()
//       );
//       if (!buildingExists) {
//         errors.push(`Invalid building code "${cleanedRow.buildingcode}". Please check your building codes.`);
//       }
//     }

//     // Stakeholder validation (case-insensitive)
//     if (cleanedRow.stakeholder) {
//       const validStakeholders =  FugitiveAndMobileStakeholderOptions.map(s => s.value);
//       const matchedStakeholder = validStakeholders.find(s =>
//         s.toLowerCase() === cleanedRow.stakeholder.toLowerCase()
//       );
//       if (!matchedStakeholder) {
//         errors.push(`Invalid stakeholder "${cleanedRow.stakeholder}". Valid options: ${validStakeholders.slice(0, 5).join(', ')}...`);
//       } else {
//         cleanedRow.stakeholder = matchedStakeholder;
//       }
//     }

//     // Waste Category validation
//     if (cleanedRow.wastecategory) {
//       const validCategories = wasteCategoryOptions.map(c => c.value);
//       const matchedCategory = validCategories.find(c =>
//         c.toLowerCase() === cleanedRow.wastecategory.toLowerCase()
//       );
//       if (!matchedCategory) {
//         errors.push(`Invalid waste category "${cleanedRow.wastecategory}". Valid options: ${validCategories.slice(0, 5).join(', ')}...`);
//       } else {
//         cleanedRow.wastecategory = matchedCategory;
//       }
//     }

//     // Waste Type validation based on category
//     if (cleanedRow.wastecategory && cleanedRow.wastetype) {
//       // Get valid waste types for this category
//       const validWasteTypes = wasteTypeOptions[cleanedRow.wastecategory] || [];
      
//       if (validWasteTypes.length === 0) {
//         errors.push(`No waste types found for category "${cleanedRow.wastecategory}"`);
//       } else {
//         const validWasteTypeValues = validWasteTypes.map(w => w.value);
//         const matchedWasteType = validWasteTypeValues.find(w =>
//           w.toLowerCase() === cleanedRow.wastetype.toLowerCase()
//         );
        
//         if (!matchedWasteType) {
//           errors.push(`Invalid waste type "${cleanedRow.wastetype}" for category "${cleanedRow.wastecategory}". Valid options: ${validWasteTypeValues.slice(0, 5).join(', ')}...`);
//         } else {
//           cleanedRow.wastetype = matchedWasteType;
//         }
//       }
//     }

//     // Waste Treatment Method validation based on waste type
//     if (cleanedRow.wastetype && cleanedRow.wastetreatmentmethod) {
//       // Get valid treatment methods for this waste type
//       let validTreatments = wasteTreatmentOptions[cleanedRow.wastetype];
      
//       // If no specific treatments found, use default
//       if (!validTreatments || validTreatments.length === 0) {
//         validTreatments = wasteTreatmentOptions.default || [];
//       }
      
//       if (validTreatments.length === 0) {
//         errors.push(`No treatment methods found for waste type "${cleanedRow.wastetype}"`);
//       } else {
//         const validTreatmentValues = validTreatments.map(t => t.value);
//         const matchedTreatment = validTreatmentValues.find(t =>
//           t.toLowerCase() === cleanedRow.wastetreatmentmethod.toLowerCase()
//         );
        
//         if (!matchedTreatment) {
//           errors.push(`Invalid treatment method "${cleanedRow.wastetreatmentmethod}" for waste type "${cleanedRow.wastetype}". Valid options: ${validTreatmentValues.slice(0, 5).join(', ')}...`);
//         } else {
//           cleanedRow.wastetreatmentmethod = matchedTreatment;
//         }
//       }
//     }

//     // Unit validation
//     if (cleanedRow.unit) {
//       const validUnits = unitOptions.map(u => u.value);
//       const matchedUnit = validUnits.find(u =>
//         u.toLowerCase() === cleanedRow.unit.toLowerCase()
//       );
//       if (!matchedUnit) {
//         errors.push(`Invalid unit "${cleanedRow.unit}". Must be one of: ${validUnits.join(', ')}`);
//       } else {
//         cleanedRow.unit = matchedUnit;
//       }
//     } else {
//       cleanedRow.unit = 'Tonnes'; // Default unit
//     }

//     // Waste quantity validation
//     if (cleanedRow.totalwasteqty) {
//       const cleanNum = cleanedRow.totalwasteqty.toString()
//         .replace(/[^0-9.-]/g, '')
//         .replace(/^"+|"+$/g, '');

//       const num = Number(cleanNum);
//       if (isNaN(num) || cleanNum === '') {
//         errors.push(`Waste quantity must be a number, got "${cleanedRow.totalwasteqty}"`);
//       } else if (num < 0) {
//         errors.push('Waste quantity cannot be negative');
//       } else if (num > 1000000) {
//         errors.push('Waste quantity seems too large (max 1,000,000)');
//       } else {
//         cleanedRow.totalwasteqty = num.toString();
//       }
//     }

//     // Quality Control validation
//     if (cleanedRow.qualitycontrol) {
//       const validQC = qualityControlOptions.map(q => q.value);
//       const matchedQC = validQC.find(q =>
//         q.toLowerCase() === cleanedRow.qualitycontrol.toLowerCase()
//       );
//       if (!matchedQC) {
//         errors.push(`Invalid quality control "${cleanedRow.qualitycontrol}". Valid options: ${validQC.join(', ')}`);
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

//   // const transformWastePayload = useCallback((row) => {
//   //   // Convert quantity to kg for calculation if needed
//   //   let qtyForCalculation = Number(row.totalwasteqty);
    
//   //   // If unit is tonnes, convert to kg for calculation
//   //   if (row.unit?.toLowerCase() === 'tonnes') {
//   //     qtyForCalculation = Number(row.totalwasteqty) * 1000;
//   //   } else if (row.unit?.toLowerCase() === 'lbs') {
//   //     qtyForCalculation = Number(row.totalwasteqty) * 0.453592;
//   //   } else if (row.unit?.toLowerCase() === 'kg') {
//   //     qtyForCalculation = Number(row.totalwasteqty);
//   //   }

//   //   const emissionKg = calculateWasteEmission(
//   //     qtyForCalculation,
//   //     row.wastetype,
//   //     row.wastetreatmentmethod
//   //   );

//   //   const capitalizeFirstLetter = (text) => {
//   //     if (!text) return "";
//   //     return text.charAt(0).toUpperCase() + text.slice(1);
//   //   };

//   //   return {
//   //     buildingCode: row.buildingcode,
//   //     stakeholder: row.stakeholder,
//   //     wasteCategory: row.wastecategory,
//   //     wasteType: row.wastetype,
//   //     wasteTreatmentMethod: row.wastetreatmentmethod,
//   //     unit: row.unit || 'Tonnes',
//   //     totalWasteQty: Number(row.totalwasteqty),
//   //     qualityControl: row.qualitycontrol,
//   //     remarks: capitalizeFirstLetter(row.remarks || ''),
//   //     postingDate: row.postingdate,
//   //     calculatedEmissionKgCo2e: emissionKg || 0,
//   //     calculatedEmissionTCo2e: (emissionKg || 0) / 1000,
//   //   };
//   // }, []);
// const transformWastePayload = useCallback((row) => {
//   // Get user ID from localStorage
//   const userId = localStorage.getItem('userId');
  
//   // The calculateWasteEmission function expects the quantity in the correct unit
//   // Based on your calculation function, it seems to expect tonnes (since emission factors likely are per tonne)
//   let qtyForCalculation = Number(row.totalwasteqty);
  
//   // Convert to tonnes if needed (your emission factors might be per tonne)
//   if (row.unit?.toLowerCase() === 'kg') {
//     qtyForCalculation = Number(row.totalwasteqty) / 1000; // Convert kg to tonnes
//   } else if (row.unit?.toLowerCase() === 'lbs') {
//     qtyForCalculation = Number(row.totalwasteqty) * 0.000453592; // Convert lbs to tonnes
//   }
//   // If unit is 'tonnes', keep as is

//   const emissionKg = calculateWasteEmission(
//     qtyForCalculation, // Now in tonnes for calculation
//     row.wastetype,
//     row.wastetreatmentmethod
//   );

//   const capitalizeFirstLetter = (text) => {
//     if (!text) return "";
//     return text.charAt(0).toUpperCase() + text.slice(1);
//   };

//   return {
//     buildingCode: row.buildingcode,
//     stakeholder: row.stakeholder,
//     wasteCategory: row.wastecategory,
//     wasteType: row.wastetype,
//     wasteTreatmentMethod: row.wastetreatmentmethod,
//     unit: row.unit || 'Tonnes',
//     totalWasteQty: Number(row.totalwasteqty), // Store as entered by user
//     qualityControl: row.qualitycontrol,
//     remarks: capitalizeFirstLetter(row.remarks || ''),
//     postingDate: row.postingdate,
//     calculatedEmissionKgCo2e: emissionKg || 0, // This comes from calculateWasteEmission
//     calculatedEmissionTCo2e: (emissionKg || 0) / 1000,
//     createdBy: userId,
//     updatedBy: userId,
//   };
// }, []);
//   const handleFileSelect = async (file) => {
//     if (!file.name.endsWith('.csv')) {
//       toast.error('Please select a CSV file');
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
//         const rowErrors = validateWasteRow(row, index);
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
//         toast.success(`CSV validated: ${data.length} rows ready for upload`);
//       } else {
//         toast.warning(`Found ${errors.length} validation errors. Please fix them before uploading.`);
//       }

//       return data;
//     } catch (error) {
//       toast.error(`Error parsing CSV: ${error.message}`);
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
//           const payload = transformWastePayload(row);

//           console.log(`Uploading row ${i + 1}:`, payload); // Debug log

//           await axios.post(
//             `${process.env.REACT_APP_BASE_URL}/Waste-Generate/Create`,
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
//           console.error(`Error uploading row ${i + 1}:`, errorMessage);
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

//       // 3. Final State Update
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

//   const downloadWasteTemplate = () => {
//     const exampleBuildings = buildings.slice(0, 1);
//     const exampleBuildingCode = exampleBuildings[0]?.buildingCode || 'BLD-EXAMPLE-001';
    
//     const exampleStakeholder =  FugitiveAndMobileStakeholderOptions[0]?.value || 'Assembly';
//     const exampleWasteCategory = 'Construction';
//     const exampleWasteType = 'Average construction';
//     const exampleTreatment = 'Landfill';
//     const exampleUnit = 'Tonnes';
//     const exampleQC = 'Good';

//     const template = `building code,stakeholder,waste category,waste type,waste treatment method,unit,total waste qty,quality control,remarks,posting date
// ${exampleBuildingCode},${exampleStakeholder},${exampleWasteCategory},${exampleWasteType},${exampleTreatment},${exampleUnit},10,${exampleQC},Example waste record,dd/mm/yyyy`;

//   const BOM = '\uFEFF';
//   const blob = new Blob([BOM + template], { type: 'text/csv;charset=utf-8;' });    const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'waste_generated_template.csv';
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
//     downloadWasteTemplate,
//   };
// };

// export default useWasteGeneratedCSVUpload;

// hooks/scope3/useWasteGeneratedCSVUpload.js
import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as XLSX from "xlsx";
import { calculateWasteEmission } from '@/utils/Scope3/calculateWasteGenerated';
import {
  wasteCategoryOptions,
  wasteTypeOptions,
  wasteTreatmentOptions,
} from "@/constant/scope3/wasteGenerated";
import {
  qualityControlOptions,
  FugitiveAndMobileStakeholderOptions
} from "@/constant/scope1/options"

const unitOptions = [
  { value: 'Tonnes', label: 'Tonnes' },
  { value: 'kg', label: 'kg' },
  { value: 'lbs', label: 'lbs' },
];

const useWasteGeneratedCSVUpload = (buildings = []) => {
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

          let headerRowIndex = -1;
          for (let i = 0; i < lines.length; i++) {
            const lineLower = lines[i].toLowerCase();
            if (lineLower.includes('buildingcode') || 
                (lineLower.includes('building') && lineLower.includes('code')) ||
                (lineLower.includes('building') && lineLower.includes('wastecategory'))) {
              headerRowIndex = i;
              break;
            }
          }

          if (headerRowIndex === -1) {
            reject(new Error('CSV must contain header row with required columns'));
            return;
          }

          const headerValues = parseCSVLine(lines[headerRowIndex]);
          const headers = headerValues.map(h => {
            return cleanCSVValue(h)
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '');
          });

          const expectedHeaders = [
            'buildingcode', 
            'stakeholder', 
            'wastecategory', 
            'wastetype',
            'wastetreatmentmethod', 
            'unit', 
            'totalwasteqty', 
            'qualitycontrol',
            'remarks', 
            'postingdate'
          ];

          const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
          if (missingHeaders.length > 0) {
            reject(new Error(`Missing required columns: ${missingHeaders.slice(0, 5).join(', ')}. Please ensure your CSV has the correct headers.`));
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

          let headerRowIndex = -1;
          for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row && row.length > 0) {
              const rowText = row.map(cell => 
                cell ? cell.toString().toLowerCase().replace(/[^a-z0-9]/g, '') : ''
              ).join('');
              
              if (rowText.includes('buildingcode') || 
                  (rowText.includes('building') && rowText.includes('code')) ||
                  (rowText.includes('building') && rowText.includes('wastecategory'))) {
                headerRowIndex = i;
                break;
              }
            }
          }

          if (headerRowIndex === -1) {
            reject(new Error('Excel must contain header row with required columns'));
            return;
          }

          const headerValues = jsonData[headerRowIndex] || [];
          const headers = headerValues.map(h => {
            return cleanCSVValue(h)
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '');
          });

          const expectedHeaders = [
            'buildingcode', 
            'stakeholder', 
            'wastecategory', 
            'wastetype',
            'wastetreatmentmethod', 
            'unit', 
            'totalwasteqty', 
            'qualitycontrol',
            'remarks', 
            'postingdate'
          ];

          const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
          if (missingHeaders.length > 0) {
            reject(new Error(`Missing required columns: ${missingHeaders.slice(0, 5).join(', ')}`));
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

  const validateWasteRow = useCallback((row, index) => {
    const errors = [];
    const cleanedRow = {};

    Object.keys(row).forEach(key => {
      cleanedRow[key] = row[key]?.toString().trim() || '';
    });

    console.log(`Validating row ${index + 1}:`, cleanedRow);

    const requiredFields = [
      'buildingcode', 
      'stakeholder', 
      'wastecategory', 
      'wastetype',
      'wastetreatmentmethod', 
      'totalwasteqty', 
      'qualitycontrol'
    ];

    requiredFields.forEach(field => {
      if (!cleanedRow[field] || cleanedRow[field] === '') {
        errors.push(`${field} is required`);
      }
    });

    if (errors.length > 0) {
      return errors;
    }

    if (cleanedRow.buildingcode && buildings.length > 0) {
      const buildingExists = buildings.some(b =>
        b.buildingCode && b.buildingCode.toLowerCase() === cleanedRow.buildingcode.toLowerCase()
      );
      if (!buildingExists) {
        errors.push(`Invalid building code "${cleanedRow.buildingcode}". Please check your building codes.`);
      }
    }

    if (cleanedRow.stakeholder) {
      const validStakeholders = FugitiveAndMobileStakeholderOptions.map(s => s.value);
      const matchedStakeholder = validStakeholders.find(s =>
        s.toLowerCase() === cleanedRow.stakeholder.toLowerCase()
      );
      if (!matchedStakeholder) {
        errors.push(`Invalid stakeholder "${cleanedRow.stakeholder}". Valid options: ${validStakeholders.slice(0, 5).join(', ')}...`);
      } else {
        cleanedRow.stakeholder = matchedStakeholder;
      }
    }

    if (cleanedRow.wastecategory) {
      const validCategories = wasteCategoryOptions.map(c => c.value);
      const matchedCategory = validCategories.find(c =>
        c.toLowerCase() === cleanedRow.wastecategory.toLowerCase()
      );
      if (!matchedCategory) {
        errors.push(`Invalid waste category "${cleanedRow.wastecategory}". Valid options: ${validCategories.slice(0, 5).join(', ')}...`);
      } else {
        cleanedRow.wastecategory = matchedCategory;
      }
    }

    if (cleanedRow.wastecategory && cleanedRow.wastetype) {
      const validWasteTypes = wasteTypeOptions[cleanedRow.wastecategory] || [];
      
      if (validWasteTypes.length === 0) {
        errors.push(`No waste types found for category "${cleanedRow.wastecategory}"`);
      } else {
        const validWasteTypeValues = validWasteTypes.map(w => w.value);
        const matchedWasteType = validWasteTypeValues.find(w =>
          w.toLowerCase() === cleanedRow.wastetype.toLowerCase()
        );
        
        if (!matchedWasteType) {
          errors.push(`Invalid waste type "${cleanedRow.wastetype}" for category "${cleanedRow.wastecategory}". Valid options: ${validWasteTypeValues.slice(0, 5).join(', ')}...`);
        } else {
          cleanedRow.wastetype = matchedWasteType;
        }
      }
    }

    if (cleanedRow.wastetype && cleanedRow.wastetreatmentmethod) {
      let validTreatments = wasteTreatmentOptions[cleanedRow.wastetype];
      
      if (!validTreatments || validTreatments.length === 0) {
        validTreatments = wasteTreatmentOptions.default || [];
      }
      
      if (validTreatments.length === 0) {
        errors.push(`No treatment methods found for waste type "${cleanedRow.wastetype}"`);
      } else {
        const validTreatmentValues = validTreatments.map(t => t.value);
        const matchedTreatment = validTreatmentValues.find(t =>
          t.toLowerCase() === cleanedRow.wastetreatmentmethod.toLowerCase()
        );
        
        if (!matchedTreatment) {
          errors.push(`Invalid treatment method "${cleanedRow.wastetreatmentmethod}" for waste type "${cleanedRow.wastetype}". Valid options: ${validTreatmentValues.slice(0, 5).join(', ')}...`);
        } else {
          cleanedRow.wastetreatmentmethod = matchedTreatment;
        }
      }
    }

    if (cleanedRow.unit) {
      const validUnits = unitOptions.map(u => u.value);
      const matchedUnit = validUnits.find(u =>
        u.toLowerCase() === cleanedRow.unit.toLowerCase()
      );
      if (!matchedUnit) {
        errors.push(`Invalid unit "${cleanedRow.unit}". Must be one of: ${validUnits.join(', ')}`);
      } else {
        cleanedRow.unit = matchedUnit;
      }
    } else {
      cleanedRow.unit = 'Tonnes';
    }

    if (cleanedRow.totalwasteqty) {
      const cleanNum = cleanedRow.totalwasteqty.toString()
        .replace(/[^0-9.-]/g, '')
        .replace(/^"+|"+$/g, '');

      const num = Number(cleanNum);
      if (isNaN(num) || cleanNum === '') {
        errors.push(`Waste quantity must be a number, got "${cleanedRow.totalwasteqty}"`);
      } else if (num < 0) {
        errors.push('Waste quantity cannot be negative');
      } else if (num > 1000000) {
        errors.push('Waste quantity seems too large (max 1,000,000)');
      } else {
        cleanedRow.totalwasteqty = num.toString();
      }
    }

    if (cleanedRow.qualitycontrol) {
      const validQC = qualityControlOptions.map(q => q.value);
      const matchedQC = validQC.find(q =>
        q.toLowerCase() === cleanedRow.qualitycontrol.toLowerCase()
      );
      if (!matchedQC) {
        errors.push(`Invalid quality control "${cleanedRow.qualitycontrol}". Valid options: ${validQC.join(', ')}`);
      } else {
        cleanedRow.qualitycontrol = matchedQC;
      }
    }

    if (cleanedRow.postingdate) {
      const isoDate = parseDateToISO(cleanedRow.postingdate);
      
      if (!isoDate) {
        errors.push(`Invalid date format: "${cleanedRow.postingdate}". Please provide a valid date (e.g., 2024-01-15, 01/15/2024, 15-01-2024)`);
      } else {
        cleanedRow.postingdate = isoDate;
      }
    } else {
      cleanedRow.postingdate = new Date(
        Date.UTC(
          new Date().getFullYear(),
          new Date().getMonth(),
          new Date().getDate(),
          0, 0, 0, 0
        )
      ).toISOString();
    }

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

  const transformWastePayload = useCallback((row) => {
    const userId = localStorage.getItem('userId');
    
    let qtyForCalculation = Number(row.totalwasteqty);
    
    if (row.unit?.toLowerCase() === 'kg') {
      qtyForCalculation = Number(row.totalwasteqty) / 1000;
    } else if (row.unit?.toLowerCase() === 'lbs') {
      qtyForCalculation = Number(row.totalwasteqty) * 0.000453592;
    }

    const emissionKg = calculateWasteEmission(
      qtyForCalculation,
      row.wastetype,
      row.wastetreatmentmethod
    );

    const capitalizeFirstLetter = (text) => {
      if (!text) return "";
      return text.charAt(0).toUpperCase() + text.slice(1);
    };

    return {
      buildingCode: row.buildingcode,
      stakeholder: row.stakeholder,
      wasteCategory: row.wastecategory,
      wasteType: row.wastetype,
      wasteTreatmentMethod: row.wastetreatmentmethod,
      unit: row.unit || 'Tonnes',
      totalWasteQty: Number(row.totalwasteqty),
      qualityControl: row.qualitycontrol,
      remarks: capitalizeFirstLetter(row.remarks || ''),
      postingDate: row.postingdate,
      calculatedEmissionKgCo2e: emissionKg || 0,
      calculatedEmissionTCo2e: (emissionKg || 0) / 1000,
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
        const rowErrors = validateWasteRow(row, index);
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
          const payload = transformWastePayload(row);

          console.log(`Uploading row ${i + 1}:`, payload);

          await axios.post(
            `${process.env.REACT_APP_BASE_URL}/Waste-Generate/Create`,
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

  const downloadWasteTemplate = useCallback(() => {
    const exampleBuildings = buildings.slice(0, 1);
    const exampleBuildingCode = exampleBuildings[0]?.buildingCode || 'BLD-EXAMPLE-001';
    
    const exampleStakeholder = FugitiveAndMobileStakeholderOptions[0]?.value || 'Assembly';
    const exampleWasteCategory = 'Construction';
    const exampleWasteType = 'Average construction';
    const exampleTreatment = 'Landfill';
    const exampleUnit = 'Tonnes';
    const exampleQC = 'Good';

    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    const headers = [
      'building code',
      'stakeholder',
      'waste category',
      'waste type',
      'waste treatment method',
      'unit',
      'total waste qty',
      'quality control',
      'remarks',
      'posting date'
    ];

    const exampleRow = [
      exampleBuildingCode,
      exampleStakeholder,
      exampleWasteCategory,
      exampleWasteType,
      exampleTreatment,
      exampleUnit,
      '10',
      exampleQC,
      'Example waste record',
      formattedDate
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

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Waste Generated Template');
    XLSX.writeFile(workbook, 'waste_generated_template.xlsx');
  }, [buildings]);

  return {
    csvState,
    handleFileSelect,
    processUpload,
    resetUpload,
    downloadWasteTemplate,
  };
};

export default useWasteGeneratedCSVUpload;


