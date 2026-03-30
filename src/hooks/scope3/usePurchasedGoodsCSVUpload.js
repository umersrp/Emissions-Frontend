// // hooks/scope3/usePurchasedGoodsCSVUpload.js
// import { useState, useCallback } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { calculatePurchasedGoodsEmission } from '@/utils/Scope3/calculatePurchasedGoodsEmission';
// import { qualityControlOptions } from "@/constant/scope1/options";
// import {
//   stakeholderOptions,
//   purchaseCategoryOptions,
//   purchasedGoodsActivityTypes,
//   purchasedServicesActivityTypes,
//   purchasedGoodsServicesTypes,
//   currencyUnitOptions
// } from "@/constant/scope3/options";

// const usePurchasedGoodsCSVUpload = (buildings = []) => {
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
//               date = testDate1;
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

//           // First line is header
//           const headerRowIndex = 0;
//           const headerValues = parseCSVLine(lines[headerRowIndex]);
          
//           console.log('Parsed headers:', headerValues);

//           // Create normalized headers
//           const headers = headerValues.map(h => {
//             return cleanCSVValue(h)
//               .toLowerCase()
//               .replace(/[^a-z0-9]/g, '');
//           });

//           console.log('Normalized headers:', headers);

//           // Required core headers
//           const requiredCoreHeaders = ['buildingcode', 'stakeholder', 'postingdate', 'purchasecategory', 'purchasedactivitytype', 'purchasedgoodsservicestype', 'amountspent', 'unit', 'qualitycontrol'];
//           const missingCoreHeaders = requiredCoreHeaders.filter(h => !headers.includes(h));
          
//           if (missingCoreHeaders.length > 0) {
//             reject(new Error(`Missing required columns: ${missingCoreHeaders.join(', ')}. Found: ${headerValues.join(', ')}`));
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

//             if (Object.values(row).some(val => val && val.toString().trim() !== '')) {
//               data.push(row);
//             }
//           }

//           console.log('Parsed CSV data:', data);
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

//   const validatePurchasedGoodsRow = useCallback((row, index, isCapitalGoods = false) => {
//     const errors = [];
//     const cleanedRow = {};

//     Object.keys(row).forEach(key => {
//       cleanedRow[key] = row[key]?.toString().trim() || '';
//     });

//     console.log(`Validating row ${index + 1}:`, cleanedRow);

//     // Required fields validation
//     if (!cleanedRow.buildingcode) errors.push('buildingcode is required');
//     if (!cleanedRow.stakeholder) errors.push('stakeholder is required');
//     if (!cleanedRow.postingdate) errors.push('postingdate is required');
//     if (!cleanedRow.purchasecategory) errors.push('purchasecategory is required');
//     if (!cleanedRow.purchasedactivitytype) errors.push('purchasedactivitytype is required');
//     if (!cleanedRow.purchasedgoodsservicestype) errors.push('purchasedgoodsservicestype is required');
//     if (!cleanedRow.amountspent) errors.push('amountspent is required');
//     if (!cleanedRow.unit) errors.push('unit is required');
//     if (!cleanedRow.qualitycontrol) errors.push('qualitycontrol is required');

//     if (errors.length > 0) {
//       return errors;
//     }

//     // Building validation
//     if (cleanedRow.buildingcode && buildings.length > 0) {
//       const buildingExists = buildings.some(b =>
//         b.buildingCode && b.buildingCode.toLowerCase() === cleanedRow.buildingcode.toLowerCase()
//       );
//       if (!buildingExists) {
//         errors.push(`Invalid building code "${cleanedRow.buildingcode}"`);
//       }
//     }

//     // Stakeholder validation
//     if (cleanedRow.stakeholder) {
//       const validStakeholders = stakeholderOptions.map(s => s.value);
//       const matchedStakeholder = validStakeholders.find(s =>
//         s.toLowerCase() === cleanedRow.stakeholder.toLowerCase()
//       );
//       if (!matchedStakeholder) {
//         errors.push(`Invalid stakeholder "${cleanedRow.stakeholder}"`);
//       } else {
//         cleanedRow.stakeholder = matchedStakeholder;
//       }
//     }

//     // Purchase Category validation
//     if (cleanedRow.purchasecategory) {
//       const validCategories = purchaseCategoryOptions.map(c => c.value);
//       const matchedCategory = validCategories.find(c =>
//         c.toLowerCase() === cleanedRow.purchasecategory.toLowerCase()
//       );
//       if (!matchedCategory) {
//         errors.push(`Invalid purchase category "${cleanedRow.purchasecategory}"`);
//       } else {
//         cleanedRow.purchasecategory = matchedCategory;
//       }
//     }

//     // Purchased Activity Type validation based on category
//     if (cleanedRow.purchasecategory && cleanedRow.purchasedactivitytype) {
//       let validActivityTypes = [];
//       if (cleanedRow.purchasecategory === 'Purchased Goods') {
//         validActivityTypes = purchasedGoodsActivityTypes.map(a => a.value);
//       } else if (cleanedRow.purchasecategory === 'Purchased Services') {
//         validActivityTypes = purchasedServicesActivityTypes.map(a => a.value);
//       }

//       const matchedActivity = validActivityTypes.find(a =>
//         a.toLowerCase() === cleanedRow.purchasedactivitytype.toLowerCase()
//       );
      
//       if (!matchedActivity) {
//         errors.push(`Invalid purchased activity type "${cleanedRow.purchasedactivitytype}" for category "${cleanedRow.purchasecategory}"`);
//       } else {
//         cleanedRow.purchasedactivitytype = matchedActivity;
//       }
//     }

//     // Purchased Goods/Services Type validation
//     if (cleanedRow.purchasedactivitytype && cleanedRow.purchasedgoodsservicestype) {
//       const validTypes = purchasedGoodsServicesTypes[cleanedRow.purchasedactivitytype] || [];
//       const validTypeValues = validTypes.map(t => t.value);
      
//       const matchedType = validTypeValues.find(t =>
//         t.toLowerCase() === cleanedRow.purchasedgoodsservicestype.toLowerCase()
//       );
      
//       if (!matchedType && validTypeValues.length > 0) {
//         errors.push(`Invalid purchased goods/services type "${cleanedRow.purchasedgoodsservicestype}" for activity "${cleanedRow.purchasedactivitytype}"`);
//       } else if (matchedType) {
//         cleanedRow.purchasedgoodsservicestype = matchedType;
//       }
//     }

//     // isCapitalGoods - for capital goods listing
//     if (isCapitalGoods) {
//       // If this is for capital goods, we need to ensure isCapitalGoods is true
//       // You can add a column in CSV for isCapitalGoods or derive it
//       if (cleanedRow.iscapitalgoods) {
//         cleanedRow.iscapitalgoods = cleanedRow.iscapitalgoods.toLowerCase() === 'yes' || 
//                                     cleanedRow.iscapitalgoods.toLowerCase() === 'true' || 
//                                     cleanedRow.iscapitalgoods === '1';
//       } else {
//         // Default to false if not specified
//         cleanedRow.iscapitalgoods = false;
//       }
//     }

//     // Amount Spent validation
//     if (cleanedRow.amountspent) {
//       const cleanNum = cleanedRow.amountspent.toString()
//         .replace(/[^0-9.-]/g, '')
//         .replace(/^"+|"+$/g, '');

//       const num = Number(cleanNum);
//       if (isNaN(num) || cleanNum === '') {
//         errors.push(`Amount spent must be a number, got "${cleanedRow.amountspent}"`);
//       } else if (num < 0) {
//         errors.push('Amount spent cannot be negative');
//       } else {
//         cleanedRow.amountspent = num.toString();
//       }
//     }

//     // Unit validation
//     if (cleanedRow.unit) {
//       const validUnits = currencyUnitOptions.map(u => u.value);
//       const matchedUnit = validUnits.find(u =>
//         u.toLowerCase() === cleanedRow.unit.toLowerCase()
//       );
//       if (!matchedUnit) {
//         errors.push(`Invalid unit "${cleanedRow.unit}"`);
//       } else {
//         cleanedRow.unit = matchedUnit;
//       }
//     }

//     // Quality Control validation
//     if (cleanedRow.qualitycontrol) {
//       const validQC = qualityControlOptions.map(q => q.value);
//       const matchedQC = validQC.find(q =>
//         q.toLowerCase() === cleanedRow.qualitycontrol.toLowerCase()
//       );
//       if (!matchedQC) {
//         errors.push(`Invalid quality control "${cleanedRow.qualitycontrol}"`);
//       } else {
//         cleanedRow.qualitycontrol = matchedQC;
//       }
//     }

//     // Date validation
//     if (cleanedRow.postingdate) {
//       const isoDate = parseDateToISO(cleanedRow.postingdate);
//       if (!isoDate) {
//         errors.push(`Invalid date format: "${cleanedRow.postingdate}"`);
//       } else {
//         cleanedRow.postingdate = isoDate;
//       }
//     }

//     // Remarks validation
//     if (cleanedRow.remarks && cleanedRow.remarks.length > 500) {
//       errors.push('Remarks cannot exceed 500 characters');
//     }

//     if (errors.length === 0) {
//       Object.keys(cleanedRow).forEach(key => {
//         row[key] = cleanedRow[key];
//       });
//     }

//     return errors;
//   }, [buildings, parseDateToISO]);

//   const transformPurchasedGoodsPayload = useCallback((row, isCapitalGoods = false) => {
//     const userId = localStorage.getItem('userId');

//     // Calculate emissions
//     const emissionResult = calculatePurchasedGoodsEmission({
//       amountSpent: row.amountspent ? parseFloat(row.amountspent) : 0,
//       purchasedGoodsServicesType: row.purchasedgoodsservicestype,
//     });

//     const capitalizeFirstLetter = (text) => {
//       if (!text) return "";
//       return text.charAt(0).toUpperCase() + text.slice(1);
//     };

//     return {
//       buildingCode: row.buildingcode,
//       stakeholder: row.stakeholder,
//       purchaseCategory: row.purchasecategory,
//       purchasedActivityType: row.purchasedactivitytype,
//       purchasedGoodsServicesType: row.purchasedgoodsservicestype,
//       isCapitalGoods: isCapitalGoods ? (row.iscapitalgoods || false) : false,
//       amountSpent: row.amountspent ? parseFloat(row.amountspent) : 0,
//       unit: row.unit,
//       qualityControl: row.qualitycontrol,
//       remarks: capitalizeFirstLetter(row.remarks || ''),
//       postingDate: row.postingdate,
//       calculatedEmissionKgCo2e: emissionResult?.calculatedEmissionKgCo2e || 0,
//       calculatedEmissionTCo2e: emissionResult?.calculatedEmissionTCo2e || 0,
//       createdBy: userId,
//       updatedBy: userId,
//     };
//   }, []);

//   const handleFileSelect = async (file, isCapitalGoods = false) => {
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

//       data.forEach((row, index) => {
//         const rowErrors = validatePurchasedGoodsRow(row, index, isCapitalGoods);
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

//   const processUpload = async (endpoint, isCapitalGoods = false, onSuccess = null) => {
//     console.log('processUpload started');
//     const { file, parsedData, validationErrors } = csvState;

//     if (!file || validationErrors.length > 0 || !parsedData) {
//       toast.error('Please fix validation errors first');
//       return null;
//     }

//     setCsvState(prev => ({
//       ...prev,
//       uploading: true,
//       progress: 0,
//       results: null
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
//           const payload = transformPurchasedGoodsPayload(row, isCapitalGoods);

//           console.log(`Uploading row ${i + 1}:`, payload);

//           await axios.post(
//             `${process.env.REACT_APP_BASE_URL}/Purchased-Goods-Services/create`,
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

//         const currentProgress = Math.round(((i + 1) / totalRows) * 100);
//         const isLastRow = i === totalRows - 1;

//         if (currentProgress % 10 === 0 || isLastRow) {
//           setCsvState(prev => ({
//             ...prev,
//             progress: currentProgress
//           }));
//         }
//       }

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

//   const downloadPurchasedGoodsTemplate = (isCapitalGoods = false) => {
//     const exampleBuildings = buildings.slice(0, 1);
//     const exampleBuildingCode = exampleBuildings[0]?.buildingCode || 'BLD-EXAMPLE-001';
    
//     const exampleStakeholder = 'Procurement';
//     const examplePurchaseCategory = 'Purchased Goods';
//     const exampleActivityType = 'Food & Drinks';
//     const exampleGoodsType = 'Bakery and Farinaceous Products';
//     const exampleUnit = 'USD';
//     const exampleQC = 'Good';

//     let template = `building code,stakeholder,posting date,purchase category,purchased activity type,purchased goods services type,amount spent,unit,quality control,remarks`;
    
//     if (isCapitalGoods) {
//       template = `building code,stakeholder,posting date,purchase category,purchased activity type,purchased goods services type,is capital goods,amount spent,unit,quality control,remarks`;
//       template += `\n${exampleBuildingCode},${exampleStakeholder},15/01/2024,${examplePurchaseCategory},${exampleActivityType},${exampleGoodsType},Yes,1000,${exampleUnit},${exampleQC},Example capital goods record`;
//     } else {
//       template += `\n${exampleBuildingCode},${exampleStakeholder},15/01/2024,${examplePurchaseCategory},${exampleActivityType},${exampleGoodsType},1000,${exampleUnit},${exampleQC},Example purchased goods record`;
//     }

//   const BOM = '\uFEFF';
//   const blob = new Blob([BOM + template], { type: 'text/csv;charset=utf-8;' });    const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = isCapitalGoods ? 'purchased_goods_and_services_template.csv' : 'purchased_goods_and_services_template.csv';
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
//     downloadPurchasedGoodsTemplate,
//   };
// };

// export default usePurchasedGoodsCSVUpload;


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

const usePurchasedGoodsCSVUpload = (buildings = []) => {
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

          const requiredCoreHeaders = ['buildingcode', 'stakeholder', 'postingdate', 'purchasecategory', 'purchasedactivitytype', 'purchasedgoodsservicestype', 'amountspent', 'unit', 'qualitycontrol'];
          const missingCoreHeaders = requiredCoreHeaders.filter(h => !headers.includes(h));
          
          if (missingCoreHeaders.length > 0) {
            reject(new Error(`Missing required columns: ${missingCoreHeaders.join(', ')}. Found: ${headerValues.join(', ')}`));
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
            return cleanCSVValue(h)
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '');
          });

          console.log('Normalized Excel headers:', headers);

          const requiredCoreHeaders = ['buildingcode', 'stakeholder', 'postingdate', 'purchasecategory', 'purchasedactivitytype', 'purchasedgoodsservicestype', 'amountspent', 'unit', 'qualitycontrol'];
          const missingCoreHeaders = requiredCoreHeaders.filter(h => !headers.includes(h));
          
          if (missingCoreHeaders.length > 0) {
            reject(new Error(`Missing required columns: ${missingCoreHeaders.join(', ')}. Found: ${headerValues.join(', ')}`));
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

  const validatePurchasedGoodsRow = useCallback((row, index, isCapitalGoods = false) => {
    const errors = [];
    const cleanedRow = {};

    Object.keys(row).forEach(key => {
      cleanedRow[key] = row[key]?.toString().trim() || '';
    });

    console.log(`Validating row ${index + 1}:`, cleanedRow);

    // Required fields validation
    if (!cleanedRow.buildingcode) errors.push('buildingcode is required');
    if (!cleanedRow.stakeholder) errors.push('stakeholder is required');
    if (!cleanedRow.postingdate) errors.push('postingdate is required');
    if (!cleanedRow.purchasecategory) errors.push('purchasecategory is required');
    if (!cleanedRow.purchasedactivitytype) errors.push('purchasedactivitytype is required');
    if (!cleanedRow.purchasedgoodsservicestype) errors.push('purchasedgoodsservicestype is required');
    if (!cleanedRow.amountspent) errors.push('amountspent is required');
    if (!cleanedRow.unit) errors.push('unit is required');
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
    if (cleanedRow.stakeholder) {
      const validStakeholders = stakeholderOptions.map(s => s.value);
      const matchedStakeholder = validStakeholders.find(s =>
        s.toLowerCase() === cleanedRow.stakeholder.toLowerCase()
      );
      if (!matchedStakeholder) {
        errors.push(`Invalid stakeholder "${cleanedRow.stakeholder}"`);
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
        errors.push(`Invalid purchase category "${cleanedRow.purchasecategory}"`);
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
        errors.push(`Invalid purchased activity type "${cleanedRow.purchasedactivitytype}" for category "${cleanedRow.purchasecategory}"`);
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
        errors.push(`Invalid purchased goods/services type "${cleanedRow.purchasedgoodsservicestype}" for activity "${cleanedRow.purchasedactivitytype}"`);
      } else if (matchedType) {
        cleanedRow.purchasedgoodsservicestype = matchedType;
      }
    }

    // isCapitalGoods - for capital goods listing
    if (isCapitalGoods) {
      if (cleanedRow.iscapitalgoods) {
        cleanedRow.iscapitalgoods = cleanedRow.iscapitalgoods.toLowerCase() === 'yes' || 
                                    cleanedRow.iscapitalgoods.toLowerCase() === 'true' || 
                                    cleanedRow.iscapitalgoods === '1';
      } else {
        cleanedRow.iscapitalgoods = false;
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

    // Unit validation
    if (cleanedRow.unit) {
      const validUnits = currencyUnitOptions.map(u => u.value);
      const matchedUnit = validUnits.find(u =>
        u.toLowerCase() === cleanedRow.unit.toLowerCase()
      );
      if (!matchedUnit) {
        errors.push(`Invalid unit "${cleanedRow.unit}"`);
      } else {
        cleanedRow.unit = matchedUnit;
      }
    }

    // Quality Control validation
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
      purchasedGoodsServicesType: row.purchasedgoodsservicestype,
      isCapitalGoods: isCapitalGoods ? (row.iscapitalgoods || false) : false,
      amountSpent: row.amountspent ? parseFloat(row.amountspent) : 0,
      unit: row.unit,
      qualityControl: row.qualitycontrol,
      remarks: capitalizeFirstLetter(row.remarks || ''),
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
        'building code',
        'stakeholder',
        'posting date',
        'purchase category',
        'purchased activity type',
        'purchased goods services type',
        'is capital goods',
        'amount spent',
        'unit',
        'quality control',
        'remarks'
      ];
      
      exampleRow = [
        exampleBuildingCode,
        exampleStakeholder,
        formattedDate,
        examplePurchaseCategory,
        exampleActivityType,
        exampleGoodsType,
        '',
        '1000',
        exampleUnit,
        exampleQC,
        'Example capital goods record'
      ];
    } else {
      headers = [
        'building code',
        'stakeholder',
        'posting date',
        'purchase category',
        'purchased activity type',
        'purchased goods services type',
        'amount spent',
        'unit',
        'quality control',
        'remarks'
      ];
      
      exampleRow = [
        exampleBuildingCode,
        exampleStakeholder,
        formattedDate,
        examplePurchaseCategory,
        exampleActivityType,
        exampleGoodsType,
        '1000',
        exampleUnit,
        exampleQC,
        'Example purchased goods record'
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
      wch: Math.min(Math.max(header.length, 15), 35)
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


