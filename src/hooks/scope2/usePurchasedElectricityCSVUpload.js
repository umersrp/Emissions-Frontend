// // src/hooks/scope2/usePurchasedElectricityCSVUpload.js
// import { useState, useCallback } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { calculatePurchasedElectricity } from '@/utils/scope2/calculate-purchased-electricity';
// import { GridStationEmissionFactors } from '@/constant/scope2/purchased-electricity';
// import {
//   qualityControlOptions,
// } from '@/constant/scope1/options';
// import { gridStationOptions, unitOptions } from '@/constant/scope2/options';

// const usePurchasedElectricityCSVUpload = (buildings = []) => {
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

//     // Handle empty or invalid dates
//     if (!cleanedDate || cleanedDate === '') return null;

//     // Try to parse the date
//     let date;
//     let year, month, day;

//     // Check if it's already an ISO string with timezone
//     if (cleanedDate.includes('T')) {
//       // Extract just the date part if it's a full ISO string
//       date = new Date(cleanedDate.split('T')[0]);
//     } else {
//       // Try to parse common date formats
//       const parts = cleanedDate.split(/[\/\-\.]/);

//       if (parts.length === 3) {
//         // Try different date format interpretations
//         if (parts[0].length === 4) {
//           // Format: YYYY-MM-DD
//           year = parseInt(parts[0]);
//           month = parseInt(parts[1]) - 1; // Month is 0-indexed
//           day = parseInt(parts[2]);
//           date = new Date(year, month, day);
//         } else if (parts[2].length === 4) {
//           // Could be MM/DD/YYYY or DD/MM/YYYY
//           // Check if first part is > 12 (likely day in DD/MM/YYYY)
//           if (parseInt(parts[0]) > 12) {
//             // Likely DD/MM/YYYY
//             day = parseInt(parts[0]);
//             month = parseInt(parts[1]) - 1;
//             year = parseInt(parts[2]);
//             date = new Date(year, month, day);
//           } else if (parseInt(parts[1]) > 12) {
//             // Likely MM/DD/YYYY (second part is day)
//             month = parseInt(parts[0]) - 1;
//             day = parseInt(parts[1]);
//             year = parseInt(parts[2]);
//             date = new Date(year, month, day);
//           } else {
//             // Ambiguous - try both and see which is valid
//             // First try MM/DD/YYYY
//             let testDate1 = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
//             // Then try DD/MM/YYYY
//             let testDate2 = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));

//             if (!isNaN(testDate1.getTime()) && testDate1.getDate() === parseInt(parts[1])) {
//               date = testDate1;
//             } else if (!isNaN(testDate2.getTime()) && testDate2.getDate() === parseInt(parts[0])) {
//               date = testDate2;
//             }
//           }
//         } else {
//           // Try creating date directly (browser might parse it)
//           date = new Date(cleanedDate);
//         }
//       } else {
//         // Try creating date directly
//         date = new Date(cleanedDate);
//       }
//     }

//     // If still invalid, return null
//     if (!date || isNaN(date.getTime())) {
//       return null;
//     }

//     // Create ISO string with time set to midnight UTC
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

//           // Find header row
//           let headerRowIndex = -1;
//           for (let i = 0; i < lines.length; i++) {
//             const cleanLine = lines[i].replace(/['"]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
//             if (cleanLine.includes('method') && cleanLine.includes('buildingcode')) {
//               headerRowIndex = i;
//               break;
//             }
//           }

//           if (headerRowIndex === -1) {
//             reject(new Error('CSV must contain header row with: method, buildingCode, unit, totalGrossElectricityGrid, gridStation, qualityControl, postingDate'));
//             return;
//           }

//           // Parse headers
//           const headerValues = parseCSVLine(lines[headerRowIndex]);
//           const headers = headerValues.map(h =>
//             cleanCSVValue(h).toLowerCase().replace(/\s+/g, '')
//           );

//           // Expected headers
//           const expectedHeaders = [
//             'method', 'buildingcode', 'unit', 'totalgrosselectricitygrid',
//             'gridstation', 'qualitycontrol', 'postingdate'
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

//   const validatePurchasedElectricityRow = useCallback((row, index) => {
//     const errors = [];
//     const cleanedRow = {};

//     // Clean all row values
//     Object.keys(row).forEach(key => {
//       cleanedRow[key] = row[key]?.toString().trim();
//     });

//     // Required fields validation
//     const requiredFields = [
//       'method', 'buildingcode', 'unit', 'totalgrosselectricitygrid',
//       'gridstation', 'qualitycontrol', 'postingdate'
//     ];

//     requiredFields.forEach(field => {
//       if (!cleanedRow[field] || cleanedRow[field] === '') {
//         errors.push(`${field} is required`);
//       }
//     });

//     // Method validation
//     if (cleanedRow.method) {
//       const validMethods = ['location_based', 'market_based'];
//       const matchedMethod = validMethods.find(m =>
//         m.toLowerCase() === cleanedRow.method.toLowerCase()
//       );
//       if (!matchedMethod) {
//         errors.push(`Invalid method "${cleanedRow.method}". Valid options: location_based, market_based`);
//       } else {
//         cleanedRow.method = matchedMethod;
//       }
//     }

//     // Building validation - using buildingCode
//     if (cleanedRow.buildingcode && buildings.length > 0) {
//       const buildingExists = buildings.some(b =>
//         b.buildingCode && b.buildingCode.toLowerCase() === cleanedRow.buildingcode.toLowerCase()
//       );
//       if (!buildingExists) {
//         errors.push(`Invalid building code "${cleanedRow.buildingcode}". Available: ${buildings.slice(0, 3).map(b => b.buildingCode).join(', ')}...`);
//       }
//     }

//     // Unit validation
//     if (cleanedRow.unit) {
//       const validUnits = unitOptions.map(u => u.value);
//       const matchedUnit = validUnits.find(u =>
//         u.toLowerCase() === cleanedRow.unit.toLowerCase()
//       );
//       if (!matchedUnit) {
//         errors.push(`Invalid unit "${cleanedRow.unit}". Valid options: kWh, MWh`);
//       } else {
//         cleanedRow.unit = matchedUnit;
//       }
//     }

//     // Total Gross Electricity Grid validation
//     if (cleanedRow.totalgrosselectricitygrid) {
//       const cleanNum = cleanedRow.totalgrosselectricitygrid.toString()
//         .replace(/[^0-9.-]/g, '')
//         .replace(/^"+|"+$/g, '');

//       const num = Number(cleanNum);
//       if (isNaN(num)) {
//         errors.push(`Total Gross Electricity Grid must be a number, got "${cleanedRow.totalgrosselectricitygrid}"`);
//       } else if (num < 0) {
//         errors.push('Total Gross Electricity Grid cannot be negative');
//       } else if (num > 1000000000) {
//         errors.push('Total Gross Electricity Grid seems too large');
//       } else {
//         cleanedRow.totalgrosselectricitygrid = num.toString();
//       }
//     }

//     // Total Other Supplier Electricity validation (optional)
//     if (cleanedRow.totalothersupplierelectricity) {
//       const cleanNum = cleanedRow.totalothersupplierelectricity.toString()
//         .replace(/[^0-9.-]/g, '')
//         .replace(/^"+|"+$/g, '');

//       const num = Number(cleanNum);
//       if (isNaN(num)) {
//         errors.push(`Total Other Supplier Electricity must be a number, got "${cleanedRow.totalothersupplierelectricity}"`);
//       } else if (num < 0) {
//         errors.push('Total Other Supplier Electricity cannot be negative');
//       } else if (num > 1000000000) {
//         errors.push('Total Other Supplier Electricity seems too large');
//       } else {
//         cleanedRow.totalothersupplierelectricity = num.toString();
//       }
//     }

//     // Total Electricity validation (optional)
//     if (cleanedRow.totalelectricity) {
//       const cleanNum = cleanedRow.totalelectricity.toString()
//         .replace(/[^0-9.-]/g, '')
//         .replace(/^"+|"+$/g, '');

//       const num = Number(cleanNum);
//       if (isNaN(num)) {
//         errors.push(`Total Electricity must be a number, got "${cleanedRow.totalelectricity}"`);
//       } else if (num < 0) {
//         errors.push('Total Electricity cannot be negative');
//       } else if (num > 1000000000) {
//         errors.push('Total Electricity seems too large');
//       } else {
//         cleanedRow.totalelectricity = num.toString();
//       }
//     }

//     // Grid Station validation
//     if (cleanedRow.gridstation) {
//       const validGridStations = gridStationOptions.map(g => g.value);
//       const matchedGridStation = validGridStations.find(g =>
//         g.toLowerCase() === cleanedRow.gridstation.toLowerCase()
//       );
//       if (!matchedGridStation) {
//         errors.push(`Invalid grid station "${cleanedRow.gridstation}". Valid options: ${validGridStations.join(', ')}`);
//       } else {
//         cleanedRow.gridstation = matchedGridStation;
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

//     // Date validation
//     if (cleanedRow.postingdate) {
//       const isoDate = parseDateToISO(cleanedRow.postingdate);

//       if (!isoDate) {
//         errors.push(`Invalid date format: "${cleanedRow.postingdate}". Please provide a valid date (e.g., 15/01/2024, 2024-01-15)`);
//       } else {
//         cleanedRow.postingdate = isoDate;
//       }
//     }

//     // Remarks validation (optional)
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

//   const transformPurchasedElectricityPayload = useCallback((row) => {
//     // Prepare data for calculation
//     const calculationData = {
//       method: row.method,
//       unit: row.unit,
//       totalGrossElectricityGrid: parseFloat(row.totalgrosselectricitygrid) || 0,
//       totalOtherSupplierElectricity: parseFloat(row.totalothersupplierelectricity) || 0,
//       gridStation: row.gridstation,
//       totalElectricity: parseFloat(row.totalelectricity) || 0,
//     };

//     // Calculate emissions
//     const result = calculatePurchasedElectricity(calculationData, GridStationEmissionFactors);

//     return {
//       buildingCode: row.buildingcode,
//       method: row.method,
//       unit: row.unit,
//       totalElectricity: parseFloat(row.totalelectricity) || null,
//       totalGrossElectricityGrid: parseFloat(row.totalgrosselectricitygrid) || null,
//       gridStation: row.gridstation,
//       totalOtherSupplierElectricity: parseFloat(row.totalothersupplierelectricity) || null,
//       qualityControl: row.qualitycontrol,
//       remarks: row.remarks || '',
//       postingDate: row.postingdate,
//       calculatedEmissionKgCo2e: result?.calculatedEmissionKgCo2e || 0,
//       calculatedEmissionTCo2e: result?.calculatedEmissionTCo2e || 0,
//       calculatedEmissionMarketKgCo2e: result?.calculatedEmissionMarketKgCo2e || null,
//       calculatedEmissionMarketTCo2e: result?.calculatedEmissionMarketTCo2e || null,
//     };
//   }, []);

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
//         const rowErrors = validatePurchasedElectricityRow(row, index);
//         if (rowErrors.length > 0) {
//           errors.push(`Row ${index + 1}: ${rowErrors.join(', ')}`);
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
//           const payload = transformPurchasedElectricityPayload(row);

//           await axios.post(
//             `${process.env.REACT_APP_BASE_URL}/Purchased-Electricity/Create`,
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

//   const downloadPurchasedElectricityTemplate = () => {
//     const exampleBuildings = buildings.slice(0, 1);
//     const exampleBuildingCode = exampleBuildings[0]?.buildingCode || 'BLD-EXAMPLE-001';

//     const exampleMethod = 'location_based';
//     const exampleUnit = 'kWh';
//     const exampleGridStation = 'Hyderabad Electric Supply Company (HESCO)';
//     const exampleQC = 'Good';

//     // Get current date in DD/MM/YYYY format
//     const currentDate = new Date();
//     const day = String(currentDate.getDate()).padStart(2, '0');
//     const month = String(currentDate.getMonth() + 1).padStart(2, '0');
//     const year = currentDate.getFullYear();
//     const formattedDate = `${day}/${month}/${year}`;

// const template = `method,building code,unit,total gross electricity grid,total other supplier electricity,grid station,total electricity,quality control,remarks,posting date
// ${exampleMethod},${exampleBuildingCode},${exampleUnit},1000,500,${exampleGridStation},1500,${exampleQC},Example record,${formattedDate}`;

//     const blob = new Blob([template], { type: 'text/csv' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'purchased_electricity_template.csv';
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
//     downloadPurchasedElectricityTemplate,
//   };
// };

// export default usePurchasedElectricityCSVUpload;


// src/hooks/scope2/usePurchasedElectricityCSVUpload.js
import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { calculatePurchasedElectricity } from '@/utils/scope2/calculate-purchased-electricity';
import { GridStationEmissionFactors } from '@/constant/scope2/purchased-electricity';
import {
  qualityControlOptions,
} from '@/constant/scope1/options';
import { gridStationOptions, unitOptions } from '@/constant/scope2/options';

const usePurchasedElectricityCSVUpload = (buildings = []) => {
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
          month = parseInt(parts[1]) - 1;
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

        // Get header row (first line)
        const headerRowIndex = 0;
        const headerValues = parseCSVLine(lines[headerRowIndex]);
        
        console.log('Original headers:', headerValues);

        // Create a function to generate a key from the header
        const generateKey = (header) => {
          const lower = header.toLowerCase().trim();
          
          // Method
          if (lower.includes('calculation method')) return 'method';
          
          // Building
          if (lower.includes('building code')) return 'buildingcode';
          
          // Unit
          if (lower.includes('unit')) return 'unit';

          if (lower.includes('total other supplier specific electricity purchased') || 
    lower.includes('total other supplier') && lower.includes('ppa')) {
  return 'totalothersupplierelectricity';
}
          
          // Total Purchased Electricity
          if (lower.includes('total purchased electricity')) return 'totalpurchasedelectricity';
          
          // Total Gross Electricity Grid
          if (lower.includes('total gross electricity purchased from grid')) return 'totalgrosselectricitygrid';
          
          // Grid Station
          if (lower.includes('grid station') && !lower.includes('total')) return 'gridstation';
          
          // Solar Panels toggle
          if (lower.includes('own solar panels') || lower.includes('renewable electricity generation plant')) return 'hassolarpanels';
          
          // Total Onsite Solar Consumption
          if (lower.includes('total onsite solar electricity consumption')) return 'totalonsitesolarconsumption';
          
          // Solar Retained Under RECs
          if (lower.includes('solar electricity is retained by you under valid recs')) return 'solarretainedunderrecs';
          
          // Solar Consumed But Sold
          if (lower.includes('solar electricity is consumed by you but its renewable instruments')) return 'solarconsumedbutsold';
          
          // Supplier Specific toggle
          if (lower.includes('purchase supplier specific electricity') && !lower.includes('how much')) return 'purchasessupplierspecific';
          
          // Supplier Specific Electricity quantity
          if (lower.includes('how much electricity') && lower.includes('purchased from specific supplier')) return 'supplierspecificelectricity';
          
          // Has Supplier Emission Factor toggle
          if (lower.includes('do you have the supplier specific emission factor') && !lower.includes("don't") && !lower.includes('ppa')) return 'hassupplieremissionfactor';
          
          // Supplier Emission Factor value
          if (lower === 'emission factor' || (lower.includes('emission factor') && !lower.includes('ppa') && !lower.includes('have'))) return 'supplieremissionfactor';
          
          // Don't Have Supplier Emission Factor
          if (lower.includes("don't have supplier specific emission factor") || lower.includes("i don't have supplier")) return 'donthavesupplieremissionfactor';
          
          // PPA toggle
// PPA toggle (Yes/No) - Header 15
if (lower.includes('do you purchase electricity under power purchase agreements') && 
    !lower.includes('how much')) {
  return 'hasppa';
}          
          // PPA Electricity quantity
if (lower.includes('how much electricity') && 
    lower.includes('power purchase agreement') && 
    !lower.includes('valid') && 
    !lower.includes('attributes')) {  // Add this to exclude renewable attributes
  return 'ppaelectricity';
}          
          // Has PPA Emission Factor toggle
          if (lower.includes('do you have the supplier specific emission factor') && lower.includes('power purchased agreement')) return 'hasppaemissionfactor';
          
          // PPA Emission Factor value
          if (lower.includes('ppa emission factor') || (lower.includes('emission factor') && lower.includes('ppa'))) return 'ppaemissionfactor';
          
          // Has PPA Valid Instruments
// PPA Valid Instruments (Yes/No toggle, NOT a number)
if ((lower.includes('valid energy instruments') || 
     lower.includes('rec') && lower.includes('ppa')) && 
     !lower.includes('how much')) {  // Add this to ensure it's not a quantity field
  return 'hasppavalidinstruments';
}          
          // Renewable Attributes toggle
          if (lower.includes('any other types of renewable energy attributes') || (lower.includes('renewable energy attributes') && !lower.includes('ppa'))) return 'hasrenewableattributes';
          
          // Renewable Attributes Electricity quantity
// Renewable Attributes Electricity quantity (value 150)
if (lower.includes('how much of your total electricity consumption') && 
    lower.includes('renewable energy attributes')) {
  return 'renewableattributeselectricity';
}          
          // Quality Control
          if (lower.includes('quality control')) return 'qualitycontrol';
          
          // Remarks
          if (lower.includes('remarks')) return 'remarks';
          
          
          // Posting Date
          if (lower.includes('posting date')) return 'postingdate';
          
          // Default: remove all non-alphanumeric
          return lower.replace(/[^a-z0-9]/g, '');
        };

        // Generate keys for each header
        const simplifiedHeaders = headerValues.map(h => generateKey(h));
        
        headerValues.forEach((header, index) => {
  console.log(`Header ${index}: "${header}" -> Key: "${simplifiedHeaders[index]}"`);
});
console.log('=================================');
        // Check for required fields
        const requiredChecks = [
          { field: 'buildingcode', alternatives: ['buildingcode'] },
        ];

        const missingFields = [];
        requiredChecks.forEach(check => {
          const found = check.alternatives.some(alt => 
            simplifiedHeaders.some(h => h === alt)
          );
          if (!found) {
            missingFields.push(check.field);
          }
        });

        if (missingFields.length > 0) {
          reject(new Error(`Missing required columns: ${missingFields.join(', ')}`));
          return;
        }

        // Parse data rows - use simplified headers as keys
        const data = [];
        for (let i = headerRowIndex + 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const values = parseCSVLine(line);
          const row = {};
          
          simplifiedHeaders.forEach((header, index) => {
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
 const validatePurchasedElectricityRow = useCallback((row, index) => {
  const errors = [];
  
  // HEADER MAPPING for friendly headers
  const headerMapping = {
  
    // Building
    'buildingcode': 'buildingcode',
    'building': 'buildingcode',
    
    // Unit
    'unit': 'unit',
    
    // Quality Control
    'qualitycontrol': 'qualitycontrol',
    'quality': 'qualitycontrol',
    'qc': 'qualitycontrol',
    
    // Remarks
    'remarks': 'remarks',
    'remark': 'remarks',
    
    // Posting Date
    'postingdate': 'postingdate',
    'date': 'postingdate',
    
    // Location Based Fields
    'totalelectricity': 'totalelectricity',
    'totalelectricityconsumption': 'totalelectricity',
    
    'totalgrosselectricitygrid': 'totalgrosselectricitygrid',
    'totalgrosselectricitypurchasedfromgrid': 'totalgrosselectricitygrid',
    
    'gridstation': 'gridstation',
    'gridstationname': 'gridstation',
    
  'totalothersupplierspecificelectricitypurchasedorpurchasedunderpowerpurchasedagreementppa': 'totalothersupplierelectricity',
    
    // Market Based Fields
    'totalpurchasedelectricity': 'totalpurchasedelectricity',
    'totalpurchasedelectricitygridsupplierspecificppa': 'totalpurchasedelectricity',
    
    // Solar Panels
    'doyouhaveyourownsolarpanelsoranyotherrenewableelectricitygenerationplantinstalledatyourfacilitythatisretainedbyyouundervalidrenewableenergyinstruments': 'hassolarpanels',
    'hassolarpanels': 'hassolarpanels',
    'onsitesolar': 'hassolarpanels',
    
    'whatisthetotalonsitesolarelectricityconsumption': 'totalonsitesolarconsumption',
    'totalonsitesolarconsumption': 'totalonsitesolarconsumption',
    
    'howmuchsolarelectricityisretainedbyyouundervalidrecsoranyotherenergyattributes': 'solarretainedunderrecs',
    'solarretainedunderrecs': 'solarretainedunderrecs',
    
    'howmuchsolarelectricityisconsumedbyyoubutitsrenewableinstrumentsorattributesissoldbyyoutoanotherentity': 'solarconsumedbutsold',
    'solarconsumedbutsold': 'solarconsumedbutsold',
    
    // Supplier Specific
    'doyoupurchasesupplierspecificelectricity': 'purchasessupplierspecific',
    'purchasessupplierspecific': 'purchasessupplierspecific',
    
    'howmuchelectricityfromtotalelectricityconsumptionispurchasedfromspecificsupplierundercontractualinstrument': 'supplierspecificelectricity',
    'supplierspecificelectricity': 'supplierspecificelectricity',
    
    'doyouhavethesupplierspecificemissionfactoringco₂ekwhforpurchasedsupplierspecificelectricityundercontractualinstrument': 'hassupplieremissionfactor',
    'hassupplieremissionfactor': 'hassupplieremissionfactor',
    
    'emissionfactor': 'supplieremissionfactor',
    'supplieremissionfactor': 'supplieremissionfactor',
    
    'idonothavesupplierspecificemissionfactor': 'donthavesupplieremissionfactor',
    'donthavesupplieremissionfactor': 'donthavesupplieremissionfactor',
    
    // PPA
    'doyoupurchaseelectricityunderpowerpurchaseagreementsppa': 'hasppa',
    'hasppa': 'hasppa',
    
    'howmuchelectricityfromtotalelectricityconsumptionispurchasedorcoveredunderpowerpurchaseagreementppa': 'ppaelectricity',
    'ppaelectricity': 'ppaelectricity',

    
    'doyouhavethesupplierspecificemissionfactoringco₂ekwhforpurchasedelectricityunderpowerpurchasedagreementppa': 'hasppaemissionfactor',
    'hasppaemissionfactor': 'hasppaemissionfactor',
    
    'ppaemissionfactor': 'ppaemissionfactor',
    
    'ordoyouhavethevalidenergyinstrumentsorrenewableenergyattributesrecreicicunderpowerpurchasedagreementsppa': 'hasppavalidinstruments',
    'hasppavalidinstruments': 'hasppavalidinstruments',
    
    // Renewable Attributes
    'doyouhaveanyothertypesofrenewableenergyattributesmarketbasedinstrumentsorrenewableenergycertificatesrecsthatareseparatefrompowerpurchaseagreementsppaandfromthosecoveringonsiterenewableelectricitygeneration': 'hasrenewableattributes',
    'hasrenewableattributes': 'hasrenewableattributes',
    
    'howmuchofyourtotalelectricityconsumptionexcludingsolargenerationandppacoveredelectricityiscoveredbyvalidrenewableenergyattributesormarketbasedinstruments': 'renewableattributeselectricity',
    'renewableattributeselectricity': 'renewableattributeselectricity',
  };

  const cleanedRow = {};

  // Apply header mapping
  Object.keys(row).forEach(key => {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    const mappedKey = headerMapping[normalizedKey] || normalizedKey;
    cleanedRow[mappedKey] = row[key]?.toString().trim() || '';
  });

  // DEBUG LOGS - Use the index parameter passed to the function
  console.log(`Row ${index + 1} - Original row:`, row);
  console.log(`Row ${index + 1} - Cleaned row after mapping:`, cleanedRow);

  // Required fields validation
  if (!cleanedRow.buildingcode) errors.push('buildingcode is required');
  if (!cleanedRow.unit) errors.push('unit is required');
  if (!cleanedRow.qualitycontrol) errors.push('qualitycontrol is required');
  if (!cleanedRow.postingdate) errors.push('postingdate is required');

  // If there are missing required fields, return early
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

  // Unit validation
  if (cleanedRow.unit) {
    const validUnits = unitOptions.map(u => u.value);
    const matchedUnit = validUnits.find(u =>
      u.toLowerCase() === cleanedRow.unit.toLowerCase()
    );
    if (!matchedUnit) {
      errors.push(`Invalid unit "${cleanedRow.unit}". Valid options: kWh, MWh`);
    } else {
      cleanedRow.unit = matchedUnit;
    }
  }

  // Helper function to check if a value is Yes/True/1
  const isYes = (value) => {
    if (!value) return false;
    const val = value.toString().toLowerCase().trim();
    return val === 'yes' || val === 'true' || val === '1';
  };

  // Method-specific validations
  if (cleanedRow.method === 'location_based') {
    // Required for location based
    if (!cleanedRow.totalelectricity) {
      errors.push('totalElectricity is required for Location Based method');
    }
    
    // At least one of grid or other supplier must be provided
    const hasGrid = cleanedRow.totalgrosselectricitygrid && cleanedRow.totalgrosselectricitygrid !== '';
    const hasOtherSupplier = cleanedRow.totalothersupplierelectricity && cleanedRow.totalothersupplierelectricity !== '';
    
    if (!hasGrid && !hasOtherSupplier) {
      errors.push('Either Total Gross Electricity Grid or Total Other Supplier Electricity must be provided for Location Based method');
    }
    
    // Grid station validation if grid is provided
    if (hasGrid && !cleanedRow.gridstation) {
      errors.push('gridstation is required when Total Gross Electricity Grid is provided');
    }
    
    if (cleanedRow.gridstation) {
      const validGridStations = gridStationOptions.map(g => g.value);
      const matchedGridStation = validGridStations.find(g =>
        g.toLowerCase() === cleanedRow.gridstation.toLowerCase()
      );
      if (!matchedGridStation) {
        errors.push(`Invalid grid station "${cleanedRow.gridstation}"`);
      } else {
        cleanedRow.gridstation = matchedGridStation;
      }
    }
  }

  if (cleanedRow.method === 'market_based') {
    // Required for market based
    if (!cleanedRow.totalpurchasedelectricity) {
      errors.push('totalPurchasedElectricity is required for Market Based method');
    }
    
    if (!cleanedRow.totalgrosselectricitygrid) {
      errors.push('totalGrossElectricityGrid is required for Market Based method');
    }
    
    if (!cleanedRow.gridstation) {
      errors.push('gridstation is required for Market Based method');
    }
    
    if (cleanedRow.gridstation) {
      const validGridStations = gridStationOptions.map(g => g.value);
      const matchedGridStation = validGridStations.find(g =>
        g.toLowerCase() === cleanedRow.gridstation.toLowerCase()
      );
      if (!matchedGridStation) {
        errors.push(`Invalid grid station "${cleanedRow.gridstation}"`);
      } else {
        cleanedRow.gridstation = matchedGridStation;
      }
    }

    // Check if at least one toggle is selected (has value Yes)
    const hasSolarPanels = isYes(cleanedRow.hassolarpanels);
    const hasSupplierSpecific = isYes(cleanedRow.purchasessupplierspecific);
    const hasPPA = isYes(cleanedRow.hasppa);
    const hasRenewableAttributes = isYes(cleanedRow.hasrenewableattributes);

    const hasAtLeastOneToggle = hasSolarPanels || hasSupplierSpecific || hasPPA || hasRenewableAttributes;

    if (!hasAtLeastOneToggle) {
      errors.push('At least one option (Solar Panels, Supplier Specific, PPA, or Renewable Attributes) must be selected for Market Based method');
    }

    // Validate solar panels fields
    if (hasSolarPanels) {
      if (!cleanedRow.totalonsitesolarconsumption) {
        errors.push('totalOnsiteSolarConsumption is required when Solar Panels is Yes');
      }
      if (!cleanedRow.solarretainedunderrecs) {
        errors.push('solarRetainedUnderRECs is required when Solar Panels is Yes');
      }
      if (!cleanedRow.solarconsumedbutsold) {
        errors.push('solarConsumedButSold is required when Solar Panels is Yes');
      }
    }

    // Validate supplier specific fields
    if (hasSupplierSpecific) {
      if (!cleanedRow.supplierspecificelectricity) {
        errors.push('supplierSpecificElectricity is required when Supplier Specific is Yes');
      }
      
      const hasEmissionFactor = isYes(cleanedRow.hassupplieremissionfactor);
      const hasNoEmissionFactor = isYes(cleanedRow.donthavesupplieremissionfactor);

      if (!hasEmissionFactor && !hasNoEmissionFactor) {
        errors.push('Either hasSupplierEmissionFactor or dontHaveSupplierEmissionFactor must be selected for Supplier Specific');
      }

      if (hasEmissionFactor && !cleanedRow.supplieremissionfactor) {
        errors.push('supplierEmissionFactor is required when hasSupplierEmissionFactor is Yes');
      }
    }

    // Validate PPA fields
    if (hasPPA) {
      if (!cleanedRow.ppaelectricity) {
        errors.push('ppaElectricity is required when PPA is Yes');
      }
      
      const hasEmissionFactor = isYes(cleanedRow.hasppaemissionfactor);
      const hasValidInstruments = isYes(cleanedRow.hasppavalidinstruments);

      if (!hasEmissionFactor && !hasValidInstruments) {
        errors.push('Either hasPPAEmissionFactor or hasPPAValidInstruments must be selected for PPA');
      }

      if (hasEmissionFactor && !cleanedRow.ppaemissionfactor) {
        errors.push('ppaEmissionFactor is required when hasPPAEmissionFactor is Yes');
      }
    }

    // Validate renewable attributes
    if (hasRenewableAttributes && !cleanedRow.renewableattributeselectricity) {
      errors.push('renewableAttributesElectricity is required when Renewable Attributes is Yes');
    }
  }

  // Numeric validations for all numeric fields
  const numericFields = [
    'totalelectricity', 'totalgrosselectricitygrid', 'totalothersupplierelectricity',
    'totalpurchasedelectricity', 'totalonsitesolarconsumption', 'solarretainedunderrecs',
    'solarconsumedbutsold', 'supplierspecificelectricity', 'supplieremissionfactor',
    'ppaelectricity', 'ppaemissionfactor', 'renewableattributeselectricity'
  ];

  numericFields.forEach(field => {
    if (cleanedRow[field] && cleanedRow[field] !== '') {
      const cleanNum = cleanedRow[field].toString()
        .replace(/[^0-9.-]/g, '')
        .replace(/^"+|"+$/g, '');

      const num = Number(cleanNum);
      if (isNaN(num)) {
        errors.push(`${field} must be a number, got "${cleanedRow[field]}"`);
      } else if (num < 0) {
        errors.push(`${field} cannot be negative`);
      } else {
        cleanedRow[field] = num.toString();
      }
    }
  });

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
      errors.push(`Invalid date format: "${cleanedRow.postingdate}". Please provide a valid date (e.g., 15/01/2024, 2024-01-15)`);
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



  const transformPurchasedElectricityPayload = useCallback((row) => {
    const userId = localStorage.getItem('userId');

    // Helper to convert Yes/No to boolean
const toBoolean = (value) => {
  if (!value) return false;
  const val = value.toString().toLowerCase().trim();
  return val === 'yes' || val === 'true' || val === '1';
};

    // Prepare data for calculation
    const calculationData = {
      method: row.method,
      unit: row.unit,
      totalElectricity: parseFloat(row.totalelectricity) || 0,
      totalGrossElectricityGrid: parseFloat(row.totalgrosselectricitygrid) || 0,
      totalOtherSupplierElectricity: parseFloat(row.totalothersupplierelectricity) || 0,
      gridStation: row.gridstation,
      totalPurchasedElectricity: parseFloat(row.totalpurchasedelectricity) || 0,
      hasSolarPanels: toBoolean(row.hassolarpanels),
      totalOnsiteSolarConsumption: parseFloat(row.totalonsitesolarconsumption) || 0,
      solarRetainedUnderRECs: parseFloat(row.solarretainedunderrecs) || 0,
      solarConsumedButSold: parseFloat(row.solarconsumedbutsold) || 0,
      purchasesSupplierSpecific: toBoolean(row.purchasessupplierspecific),
      supplierSpecificElectricity: parseFloat(row.supplierspecificelectricity) || 0,
      hasSupplierEmissionFactor: toBoolean(row.hassupplieremissionfactor),
      dontHaveSupplierEmissionFactor: toBoolean(row.donthavesupplieremissionfactor),
      supplierEmissionFactor: parseFloat(row.supplieremissionfactor) || 0,
      hasPPA: toBoolean(row.hasppa),
      ppaElectricity: parseFloat(row.ppaelectricity) || 0,
      hasPPAEmissionFactor: toBoolean(row.hasppaemissionfactor),
      hasPPAValidInstruments: toBoolean(row.hasppavalidinstruments),
      ppaEmissionFactor: parseFloat(row.ppaemissionfactor) || 0,
      hasRenewableAttributes: toBoolean(row.hasrenewableattributes),
      renewableAttributesElectricity: parseFloat(row.renewableattributeselectricity) || 0,
    };

    // Calculate emissions
    const result = calculatePurchasedElectricity(calculationData, GridStationEmissionFactors);

    const capitalizeFirstLetter = (text) => {
      if (!text) return "";
      return text.charAt(0).toUpperCase() + text.slice(1);
    };

    return {
      buildingCode: row.buildingcode,
      method: row.method,
      unit: row.unit,
      totalElectricity: parseFloat(row.totalelectricity) || null,
      totalGrossElectricityGrid: parseFloat(row.totalgrosselectricitygrid) || null,
      gridStation: row.gridstation || null,
      totalOtherSupplierElectricity: parseFloat(row.totalothersupplierelectricity) || null,
      totalPurchasedElectricity: parseFloat(row.totalpurchasedelectricity) || null,
      hasSolarPanels: toBoolean(row.hassolarpanels),
      totalOnsiteSolarConsumption: parseFloat(row.totalonsitesolarconsumption) || null,
      solarRetainedUnderRECs: parseFloat(row.solarretainedunderrecs) || null,
      solarConsumedButSold: parseFloat(row.solarconsumedbutsold) || null,
      purchasesSupplierSpecific: toBoolean(row.purchasessupplierspecific),
      supplierSpecificElectricity: parseFloat(row.supplierspecificelectricity) || null,
      hasSupplierEmissionFactor: toBoolean(row.hassupplieremissionfactor),
      dontHaveSupplierEmissionFactor: toBoolean(row.donthavesupplieremissionfactor),
      supplierEmissionFactor: parseFloat(row.supplieremissionfactor) || null,
      hasPPA: toBoolean(row.hasppa),
      ppaElectricity: parseFloat(row.ppaelectricity) || null,
      hasPPAEmissionFactor: toBoolean(row.hasppaemissionfactor),
      hasPPAValidInstruments: toBoolean(row.hasppavalidinstruments),
      ppaEmissionFactor: parseFloat(row.ppaemissionfactor) || null,
      hasRenewableAttributes: toBoolean(row.hasrenewableattributes),
      renewableAttributesElectricity: parseFloat(row.renewableattributeselectricity) || null,
      qualityControl: row.qualitycontrol,
      remarks: capitalizeFirstLetter(row.remarks || ''),
      postingDate: row.postingdate,
      calculatedEmissionKgCo2e: result?.calculatedEmissionKgCo2e || 0,
      calculatedEmissionTCo2e: result?.calculatedEmissionTCo2e || 0,
      calculatedEmissionMarketKgCo2e: result?.calculatedEmissionMarketKgCo2e || null,
      calculatedEmissionMarketTCo2e: result?.calculatedEmissionMarketTCo2e || null,
      createdBy: userId,
      updatedBy: userId,
    };
  }, []);

  // In your usePurchasedElectricityCSVUpload.js hook, update handleFileSelect:

const handleFileSelect = async (file, selectedMethod) => {
  if (!file.name.endsWith('.csv')) {
    toast.error('Please select a CSV file');
    return null;
  }

  if (file.size > 10 * 1024 * 1024) {
    toast.error('File size must be less than 10MB');
    return null;
  }

  try {
    const data = await parseCSV(file);
    const errors = [];

    // Validate each row - pass the selected method
    data.forEach((row, index) => {
      // Add the method to the row based on filter
      row.method = selectedMethod;
      const rowErrors = validatePurchasedElectricityRow(row, index);
      if (rowErrors.length > 0) {
        errors.push(`Row ${index + 1}: ${rowErrors.join(', ')}`);
      }
    });

    setCsvState(prev => ({
      ...prev,
      file,
      parsedData: data,
      validationErrors: errors,
    }));

    if (errors.length === 0) {
      toast.success(`CSV validated: ${data.length} rows ready for upload`);
    } else {
      toast.warning(`Found ${errors.length} validation errors. Please fix them before uploading.`);
    }

    return data;
  } catch (error) {
    toast.error(`Error parsing CSV: ${error.message}`);
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

    // 1. Initialize Uploading State
    setCsvState(prev => ({
      ...prev,
      uploading: true,
      progress: 0,
      results: null // Clear previous results
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
          const payload = transformPurchasedElectricityPayload(row);

          await axios.post(
            `${process.env.REACT_APP_BASE_URL}/Purchased-Electricity/Create`,
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

        // 2. Optimized Progress Updates
        const currentProgress = Math.round(((i + 1) / totalRows) * 100);
        const isLastRow = i === totalRows - 1;

        // Update every 10% or on the very last row
        if (currentProgress % 10 === 0 || isLastRow) {
          setCsvState(prev => ({
            ...prev,
            progress: currentProgress
          }));
        }
      }

      // 3. Final State Update
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

  const downloadPurchasedElectricityTemplate = (selectedMethod) => {
    const exampleBuildings = buildings.slice(0, 1);
    const exampleBuildingCode = exampleBuildings[0]?.buildingCode || 'BLD-4334';
    const exampleQC = 'Good';
    const exampleUnit = 'kWh';
    const exampleGridStation = 'Hyderabad Electric Supply Company (HESCO)';

    // Get current date in DD/MM/YYYY format
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    let headers = [];
    let exampleRow = '';

   if (selectedMethod === 'location_based') {
  // Location Based Template - Using Form Labels (all lowercase)
  headers = [
    'building code',
    'unit',
    'total electricity consumption',
    'total gross electricity purchased from grid station',
    'grid station',
    'total other supplier specific electricity purchased or purchased under power purchased agreement (ppa)',
    'quality control',
    'remarks',
    'posting date'
  ].join(',');

  exampleRow = `${exampleBuildingCode},${exampleUnit},1500,1000,${exampleGridStation},500,${exampleQC},Example location based record,${formattedDate}`;
} else {
  // Market Based Template - Using Form Labels (all lowercase)
  headers = [
    'building code',
    'unit',
    'total purchased electricity (grid / supplier specific / ppa)',
    'total gross electricity purchased from grid station',
    'grid station',
    'do you have your own solar panels or any other renewable electricity generation plant installed at your facility that is retained by you under valid renewable energy instruments?',
    'what is the total onsite solar electricity consumption?',
    'how much solar electricity is retained by you under valid recs or any other energy attributes?',
    'how much solar electricity is consumed by you but its renewable instruments or attributes is sold by you to another entity?',
    'do you purchase supplier specific electricity?',
    'how much electricity from total electricity consumption is purchased from specific supplier under contractual instrument?',
    'do you have the supplier specific emission factor in kgco₂e/kwh for purchased supplier specific electricity under contractual instrument?',
    'emission factor',
    "i don't have supplier specific emission factor",
    'do you purchase electricity under power purchase agreements (ppa)?',
    'how much electricity from total electricity consumption is purchased or covered under power purchase agreement (ppa)?',
    'do you have the supplier specific emission factor in kgco₂e/kwh for purchased electricity under power purchased agreement (ppa)?',
    'ppa emission factor',
    'or do you have the valid energy instruments or renewable energy attributes (rec / rec-i) etc. under power purchased agreements (ppa)?',
    'do you have any other types of renewable energy attributes market-based instruments or renewable energy certificates (recs) that are separate from power purchase agreements (ppa) and from those covering on-site renewable electricity generation?',
    'how much of your total electricity consumption (excluding solar generation and ppa-covered electricity) is covered by valid renewable energy attributes or market-based instruments?',
    'quality control',
    'remarks',
    'posting date'
  ].join(',');

  exampleRow = `${exampleBuildingCode},${exampleUnit},1500,1000,${exampleGridStation},Yes,500,400,100,Yes,300,Yes,0.5,No,Yes,200,Yes,0.4,No,Yes,150,${exampleQC},Example market based record,${formattedDate}`;
}

    const template = headers + '\n' + exampleRow;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchased_electricity_${selectedMethod}_template.csv`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return {
    csvState,
    handleFileSelect,
    processUpload,
    resetUpload,
    downloadPurchasedElectricityTemplate,
  };
};

export default usePurchasedElectricityCSVUpload;
