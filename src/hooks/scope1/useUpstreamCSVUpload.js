// // import { useState, useCallback } from 'react';
// // import axios from 'axios';
// // import { toast } from 'react-toastify';
// // import { calculateUpstreamTransportationEmission } from '@/utils/Scope3/calculateUpstreamTransportation';
// // import {
// //   transportationCategoryOptions,
// //   purchasedGoodsActivityOptions,
// //   purchasedServicesActivityOptions,
// //   purchasedGoodsTypeMapping,
// //   vehicleCategoryOptions,
// //   vehicleTypeOptions
// // } from '@/constant/scope3/upstreamTransportation';
// // import { stakeholderDepartmentOptions, processQualityControlOptions } from '@/constant/scope1/options';

// // const useUpstreamCSVUpload = (buildings = []) => {
// //   const [csvState, setCsvState] = useState({
// //     file: null,
// //     uploading: false,
// //     progress: 0,
// //     results: null,
// //     validationErrors: [],
// //     parsedData: null,
// //   });

// //   // Clean CSV values
// //   const cleanCSVValue = useCallback((value) => {
// //     if (typeof value !== 'string') return value;
// //     let cleaned = value.trim();
// //     cleaned = cleaned.replace(/^["']+|["']+$/g, '');
// //     cleaned = cleaned.replace(/^=/, '');
// //     return cleaned;
// //   }, []);

// //   // Parse date to ISO format
// //   const parseDateToISO = useCallback((dateString) => {
// //     if (!dateString) return null;

// //     // Remove quotes and trim
// //     let cleaned = dateString.replace(/["']/g, '').trim();

// //     // If already ISO format with time, return as is
// //     if (cleaned.includes('T') && cleaned.endsWith('Z')) {
// //       return cleaned;
// //     }

// //     // Handle different date formats
// //     let date = null;

// //     // Try DD/MM/YYYY format (with / or - separators)
// //     const ddmmyyyyRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
// //     let matches = cleaned.match(ddmmyyyyRegex);
// //     if (matches) {
// //       const [_, day, month, year] = matches;
// //       // Create date in UTC to avoid timezone issues
// //       date = new Date(Date.UTC(
// //         parseInt(year),
// //         parseInt(month) - 1,
// //         parseInt(day),
// //         0, 0, 0, 0
// //       ));
// //     }

// //     // Try MM/DD/YYYY format if DD/MM/YYYY failed
// //     if (!date || isNaN(date.getTime())) {
// //       const mmddyyyyRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
// //       matches = cleaned.match(mmddyyyyRegex);
// //       if (matches) {
// //         const [_, month, day, year] = matches;
// //         date = new Date(Date.UTC(
// //           parseInt(year),
// //           parseInt(month) - 1,
// //           parseInt(day),
// //           0, 0, 0, 0
// //         ));
// //       }
// //     }

// //     // Try YYYY-MM-DD format
// //     if (!date || isNaN(date.getTime())) {
// //       const yyyymmddRegex = /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/;
// //       matches = cleaned.match(yyyymmddRegex);
// //       if (matches) {
// //         const [_, year, month, day] = matches;
// //         date = new Date(Date.UTC(
// //           parseInt(year),
// //           parseInt(month) - 1,
// //           parseInt(day),
// //           0, 0, 0, 0
// //         ));
// //       }
// //     }

// //     // Last resort: try native parsing
// //     if (!date || isNaN(date.getTime())) {
// //       date = new Date(cleaned);
// //     }

// //     // Return ISO string if valid
// //     if (date && !isNaN(date.getTime())) {
// //       return date.toISOString();
// //     }

// //     return null;
// //   }, []);

// //   // Parse CSV file
// //   const parseCSV = useCallback((file) => {
// //     return new Promise((resolve, reject) => {
// //       const reader = new FileReader();
// //       reader.onload = (event) => {
// //         try {
// //           const csvText = event.target.result;

// //           // CSV parser
// //           const parseCSVLine = (line) => {
// //             const result = [];
// //             let current = '';
// //             let inQuotes = false;

// //             for (let i = 0; i < line.length; i++) {
// //               const char = line[i];
// //               const nextChar = line[i + 1];

// //               if (char === '"') {
// //                 if (inQuotes && nextChar === '"') {
// //                   current += '"';
// //                   i++;
// //                 } else {
// //                   inQuotes = !inQuotes;
// //                 }
// //               } else if (char === ',' && !inQuotes) {
// //                 result.push(current);
// //                 current = '';
// //               } else {
// //                 current += char;
// //               }
// //             }
// //             result.push(current);
// //             return result;
// //           };

// //           const lines = csvText.split('\n').filter(line => line.trim() !== '');

// //           if (lines.length === 0) {
// //             reject(new Error('CSV file is empty'));
// //             return;
// //           }

// //           // Find header row
// //           let headerRowIndex = -1;
// //           for (let i = 0; i < lines.length; i++) {
// //             const cleanLine = lines[i].replace(/"/g, '').toLowerCase();
// //             if (cleanLine.includes('buildingcode') && cleanLine.includes('stakeholder')) {
// //               headerRowIndex = i;
// //               break;
// //             }
// //           }

// //           if (headerRowIndex === -1) {
// //             reject(new Error('CSV must contain header row with required columns'));
// //             return;
// //           }

// //           // Parse headers
// //           const headerValues = parseCSVLine(lines[headerRowIndex]);
// //           const headers = headerValues.map(h =>
// //             cleanCSVValue(h).toLowerCase().replace(/\s+/g, '')
// //           );

// //           // Expected headers
// //           const expectedHeaders = [
// //             'buildingcode', 'stakeholder', 'transportationcategory', 'activitytype',
// //             'purchasedgoodstype', 'vehiclecategory', 'vehicletype', 'weightloaded',
// //             'distancetravelled', 'amountspent', 'qualitycontrol', 'remarks', 'postingdate'
// //           ];

// //           // Check for missing headers
// //           const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
// //           if (missingHeaders.length > 0) {
// //             reject(new Error(`Missing required columns: ${missingHeaders.join(', ')}`));
// //             return;
// //           }

// //           // Parse data rows
// //           const data = [];
// //           for (let i = headerRowIndex + 1; i < lines.length; i++) {
// //             const line = lines[i].trim();
// //             if (!line) continue;

// //             const values = parseCSVLine(line);

// //             // Map values to headers
// //             const row = {};
// //             headers.forEach((header, index) => {
// //               row[header] = index < values.length ? cleanCSVValue(values[index]) : '';
// //             });

// //             if (Object.values(row).some(val => val && val.toString().trim() !== '')) {
// //               data.push(row);
// //             }
// //           }

// //           resolve(data);
// //         } catch (error) {
// //           reject(new Error(`Error parsing CSV: ${error.message}`));
// //         }
// //       };
// //       reader.onerror = () => reject(new Error('Failed to read file'));
// //       reader.readAsText(file);
// //     });
// //   }, [cleanCSVValue]);

// //   // Validate each row
// //   const validateRow = useCallback((row, index) => {
// //     const errors = [];
// //     const cleanedRow = {};

// //     // Clean all row values
// //     Object.keys(row).forEach(key => {
// //       cleanedRow[key] = row[key]?.toString().trim();
// //     });

// //     // Required fields
// //     const requiredFields = [
// //       'buildingcode', 'stakeholder', 'transportationcategory', 'activitytype',
// //       'qualitycontrol', 'postingdate'
// //     ];

// //     requiredFields.forEach(field => {
// //       if (!cleanedRow[field] || cleanedRow[field] === '') {
// //         errors.push(`${field} is required`);
// //       }
// //     });

// //     // Building validation
// //     if (cleanedRow.buildingcode && buildings.length > 0) {
// //       const buildingExists = buildings.some(b =>
// //         b.buildingCode && b.buildingCode.toLowerCase() === cleanedRow.buildingcode.toLowerCase()
// //       );
// //       if (!buildingExists) {
// //         errors.push(`Invalid building code "${cleanedRow.buildingcode}"`);
// //       }
// //     }

// //     // Transportation Category validation
// //     if (cleanedRow.transportationcategory) {
// //       const validCategories = transportationCategoryOptions.map(c => c.value);
// //       const matched = validCategories.find(c =>
// //         c.toLowerCase() === cleanedRow.transportationcategory.toLowerCase()
// //       );
// //       if (!matched) {
// //         errors.push(`Invalid transportation category "${cleanedRow.transportationcategory}"`);
// //       } else {
// //         cleanedRow.transportationcategory = matched;
// //       }
// //     }

// //     // Activity Type validation based on category
// //     if (cleanedRow.transportationcategory && cleanedRow.activitytype) {
// //       let validActivities = [];
// //       if (cleanedRow.transportationcategory === 'purchasedGoods') {
// //         validActivities = purchasedGoodsActivityOptions.map(a => a.value);
// //       } else if (cleanedRow.transportationcategory === 'purchasedServices') {
// //         validActivities = purchasedServicesActivityOptions.map(a => a.value);
// //       }

// //       const matchedActivity = validActivities.find(a =>
// //         a.toLowerCase() === cleanedRow.activitytype.toLowerCase()
// //       );
// //       if (!matchedActivity) {
// //         errors.push(`Invalid activity type "${cleanedRow.activitytype}" for category "${cleanedRow.transportationcategory}"`);
// //       } else {
// //         cleanedRow.activitytype = matchedActivity;
// //       }
// //     }

// //     // Purchased Goods Type validation
// //     if (cleanedRow.activitytype && cleanedRow.purchasedgoodstype) {
// //       const goodsOptions = purchasedGoodsTypeMapping[cleanedRow.activitytype] || [];
// //       const matchedGoods = goodsOptions.find(g =>
// //         g.value.toLowerCase() === cleanedRow.purchasedgoodstype.toLowerCase()
// //       );
// //       if (goodsOptions.length > 0 && !matchedGoods) {
// //         errors.push(`Invalid purchased goods type "${cleanedRow.purchasedgoodstype}" for activity "${cleanedRow.activitytype}"`);
// //       } else if (matchedGoods) {
// //         cleanedRow.purchasedgoodstype = matchedGoods.value;
// //       }
// //     }

// //     // Vehicle Category validation for purchasedGoods
// //     if (cleanedRow.transportationcategory === 'purchasedGoods') {
// //       if (!cleanedRow.vehiclecategory) {
// //         errors.push('Vehicle category is required for purchased goods');
// //       } else {
// //         const validVehicleCategories = vehicleCategoryOptions.map(v => v.value);
// //         const matched = validVehicleCategories.find(v =>
// //           v.toLowerCase() === cleanedRow.vehiclecategory.toLowerCase()
// //         );
// //         if (!matched) {
// //           errors.push(`Invalid vehicle category "${cleanedRow.vehiclecategory}"`);
// //         } else {
// //           cleanedRow.vehiclecategory = matched;
// //         }
// //       }
// //     }

// //     // Vehicle Type validation
// //     if (cleanedRow.vehiclecategory && cleanedRow.vehicletype) {
// //       const validTypes = vehicleTypeOptions[cleanedRow.vehiclecategory] || [];
// //       const matched = validTypes.find(t =>
// //         t.value.toLowerCase() === cleanedRow.vehicletype.toLowerCase()
// //       );
// //       if (validTypes.length > 0 && !matched) {
// //         errors.push(`Invalid vehicle type "${cleanedRow.vehicletype}" for category "${cleanedRow.vehiclecategory}"`);
// //       } else if (matched) {
// //         cleanedRow.vehicletype = matched.value;
// //       }
// //     }

// //     // Numeric validations
// //     if (cleanedRow.transportationcategory === 'purchasedGoods') {
// //       // Weight Loaded validation
// //       if (cleanedRow.weightloaded) {
// //         const num = Number(cleanedRow.weightloaded);
// //         if (isNaN(num)) {
// //           errors.push(`Weight loaded must be a number, got "${cleanedRow.weightloaded}"`);
// //         } else if (num < 0) {
// //           errors.push('Weight loaded cannot be negative');
// //         } else {
// //           cleanedRow.weightloaded = num.toString();
// //         }
// //       } else {
// //         errors.push('Weight loaded is required for purchased goods');
// //       }

// //       // Distance Travelled validation
// //       if (cleanedRow.distancetravelled) {
// //         const num = Number(cleanedRow.distancetravelled);
// //         if (isNaN(num)) {
// //           errors.push(`Distance travelled must be a number, got "${cleanedRow.distancetravelled}"`);
// //         } else if (num < 0) {
// //           errors.push('Distance travelled cannot be negative');
// //         } else {
// //           cleanedRow.distancetravelled = num.toString();
// //         }
// //       } else {
// //         errors.push('Distance travelled is required for purchased goods');
// //       }
// //     }

// //     if (cleanedRow.transportationcategory === 'purchasedServices') {
// //       if (cleanedRow.amountspent) {
// //         const num = Number(cleanedRow.amountspent);
// //         if (isNaN(num)) {
// //           errors.push(`Amount spent must be a number, got "${cleanedRow.amountspent}"`);
// //         } else if (num < 0) {
// //           errors.push('Amount spent cannot be negative');
// //         } else {
// //           cleanedRow.amountspent = num.toString();
// //         }
// //       } else {
// //         errors.push('Amount spent is required for purchased services');
// //       }
// //     }

// //     // Quality Control validation
// //     if (cleanedRow.qualitycontrol) {
// //       const validQC = processQualityControlOptions.map(q => q.value);
// //       const matched = validQC.find(q =>
// //         q.toLowerCase() === cleanedRow.qualitycontrol.toLowerCase()
// //       );
// //       if (!matched) {
// //         errors.push(`Invalid quality control "${cleanedRow.qualitycontrol}"`);
// //       } else {
// //         cleanedRow.qualitycontrol = matched;
// //       }
// //     }

// //     // Date validation and conversion to ISO
// //     if (cleanedRow.postingdate) {
// //       const isoDate = parseDateToISO(cleanedRow.postingdate);

// //       if (!isoDate) {
// //         errors.push(`Invalid date format "${cleanedRow.postingdate}". Please use DD/MM/YYYY format (e.g., 17/02/2026)`);
// //       } else {
// //         // Extract just the date part for validation
// //         const datePart = isoDate.split('T')[0];
// //         const date = new Date(datePart);

// //         if (isNaN(date.getTime())) {
// //           errors.push(`Invalid date "${cleanedRow.postingdate}"`);
// //         } else if (date > new Date()) {
// //           errors.push('Date cannot be in the future');
// //         } else {
// //           cleanedRow.postingdate = isoDate; // Store as ISO format
// //         }
// //       }
// //     }

// //     // Update original row with cleaned values
// //     if (errors.length === 0) {
// //       Object.keys(cleanedRow).forEach(key => {
// //         row[key] = cleanedRow[key];
// //       });
// //     }

// //     return errors;
// //   }, [buildings, parseDateToISO]);

// //   // Transform row to API payload
// //   const transformToPayload = useCallback((row) => {
// //     // Calculate emissions
// //     let calculatedEmissions = {};
// //     if (row.transportationcategory === 'purchasedGoods') {
// //       calculatedEmissions = calculateUpstreamTransportationEmission({
// //         transportationCategory: 'purchasedGoods',
// //         weightLoaded: parseFloat(row.weightloaded),
// //         distanceTravelled: parseFloat(row.distancetravelled),
// //         vehicleCategory: row.vehiclecategory,
// //         vehicleType: row.vehicletype,
// //       }) || {};
// //     } else if (row.transportationcategory === 'purchasedServices') {
// //       calculatedEmissions = calculateUpstreamTransportationEmission({
// //         transportationCategory: 'purchasedServices',
// //         amountSpent: parseFloat(row.amountspent),
// //         activityType: row.activitytype,
// //         unit: 'USD',
// //       }) || {};
// //     }

// //     return {
// //       buildingCode: row.buildingcode,
// //       stakeholderDepartment: row.stakeholder,
// //       transportationCategory: row.transportationcategory,
// //       activityType: row.activitytype,
// //       purchasedGoodsType: row.purchasedgoodstype || '',
// //       vehicleCategory: row.vehiclecategory || '',
// //       vehicleType: row.vehicletype || '',
// //       weightLoaded: row.weightloaded || '',
// //       distanceTravelled: row.distancetravelled || '',
// //       amountSpent: row.amountspent || '',
// //       unit: row.transportationcategory === 'purchasedServices' ? 'USD' : '',
// //       qualityControl: row.qualitycontrol,
// //       remarks: row.remarks || '',
// //       calculatedEmissionKgCo2e: calculatedEmissions.calculatedEmissionKgCo2e || 0,
// //       calculatedEmissionTCo2e: calculatedEmissions.calculatedEmissionTCo2e || 0,
// //       postingDate: row.postingdate, // Now in ISO format
// //     };
// //   }, []);

// //   // Handle file selection
// //   const handleFileSelect = async (file) => {
// //     if (!file.name.endsWith('.csv')) {
// //       toast.error('Please select a CSV file');
// //       return null;
// //     }

// //     if (file.size > 10 * 1024 * 1024) {
// //       toast.error('File size must be less than 10MB');
// //       return null;
// //     }

// //     try {
// //       const data = await parseCSV(file);
// //       const errors = [];

// //       // Validate each row
// //       data.forEach((row, index) => {
// //         const rowErrors = validateRow(row, index);
// //         if (rowErrors.length > 0) {
// //           errors.push(`Row ${index + 1}: ${rowErrors.join(', ')}`);
// //         }
// //       });

// //       setCsvState(prev => ({
// //         ...prev,
// //         file,
// //         parsedData: data,
// //         validationErrors: errors,
// //       }));

// //       return data;
// //     } catch (error) {
// //       toast.error(`Error parsing CSV: ${error.message}`);
// //       return null;
// //     }
// //   };

// //   // Process upload
// //   const processUpload = async (onSuccess = null) => {
// //     const { file, parsedData, validationErrors } = csvState;

// //     if (!file || validationErrors.length > 0 || !parsedData) {
// //       toast.error('Please fix validation errors first');
// //       return null;
// //     }

// //     setCsvState(prev => ({
// //       ...prev,
// //       uploading: true,
// //       progress: 0,
// //       results: null
// //     }));

// //     const results = {
// //       success: 0,
// //       failed: 0,
// //       errors: []
// //     };

// //     try {
// //       const totalRows = parsedData.length;

// //       for (let i = 0; i < totalRows; i++) {
// //         const row = parsedData[i];

// //         try {
// //           const payload = transformToPayload(row);

// //           await axios.post(
// //             `${process.env.REACT_APP_BASE_URL}/upstream/Create`,
// //             payload,
// //             {
// //               headers: {
// //                 Authorization: `Bearer ${localStorage.getItem('token')}`,
// //                 'Content-Type': 'application/json'
// //               }
// //             }
// //           );

// //           results.success++;
// //         } catch (error) {
// //           results.failed++;
// //           results.errors.push({
// //             row: i + 1,
// //             error: error.response?.data?.message || error.message
// //           });
// //         }

// //         const currentProgress = Math.round(((i + 1) / totalRows) * 100);
// //         if (currentProgress % 10 === 0 || i === totalRows - 1) {
// //           setCsvState(prev => ({
// //             ...prev,
// //             progress: currentProgress
// //           }));
// //         }
// //       }

// //       setCsvState(prev => ({
// //         ...prev,
// //         progress: 100,
// //         results: results,
// //         uploading: false
// //       }));

// //       setTimeout(() => {
// //         if (results.failed === 0) {
// //           toast.success(`Successfully uploaded ${results.success} records!`);
// //           if (onSuccess) onSuccess(results);
// //         } else {
// //           toast.warning(`Uploaded ${results.success} records, ${results.failed} failed.`);
// //         }
// //       }, 1000);

// //       return results;

// //     } catch (error) {
// //       console.error('Critical upload error:', error);
// //       setCsvState(prev => ({
// //         ...prev,
// //         uploading: false,
// //         progress: 0
// //       }));
// //       toast.error('Upload failed unexpectedly');
// //       throw error;
// //     }
// //   };

// //   // Reset upload state
// //   const resetUpload = () => {
// //     setCsvState({
// //       file: null,
// //       uploading: false,
// //       progress: 0,
// //       results: null,
// //       validationErrors: [],
// //       parsedData: null,
// //     });
// //   };

// //   // Download template
// //   const downloadTemplate = () => {
// //     const currentDate = new Date();
// //     const formattedDate = new Date(
// //       Date.UTC(
// //         currentDate.getFullYear(),
// //         currentDate.getMonth(),
// //         currentDate.getDate(),
// //         0, 0, 0, 0
// //       )
// //     ).toISOString();

// //     const headers = [
// //       'buildingcode', 'stakeholder', 'transportationcategory', 'activitytype',
// //       'purchasedgoodstype', 'vehiclecategory', 'vehicletype', 'weightloaded',
// //       'distancetravelled', 'amountspent','unit','qualitycontrol', 'remarks', 'postingdate'
// //     ].join(',');

// //     const exampleRows = [
// //       // Purchased goods example with DD/MM/YYYY format
// //       `BLD-1147,Assembly,purchasedGoods,Raw Materials,Petrochemicals,freightFlights,International,100,500,,,Good,Steel shipment,dd/mm/yyyy`,
// //       // Purchased services example with DD/MM/YYYY format
// //       `BLD-1147,Commercial,purchasedServices,Warehousing and support services for transportation,,,,,,5000,USD,Fair,Warehouse services,dd/mm/yyyy`
// //     ].join('\n');

// //     const csv = headers + '\n' + exampleRows;

// //     const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
// //     const url = URL.createObjectURL(blob);
// //     const a = document.createElement('a');
// //     a.href = url;
// //     a.download = 'upstream_transportation_template.csv';
// //     document.body.appendChild(a);
// //     a.click();
// //     URL.revokeObjectURL(url);
// //     document.body.removeChild(a);
// //   };

// //   return {
// //     csvState,
// //     handleFileSelect,
// //     processUpload,
// //     resetUpload,
// //     downloadTemplate,
// //   };
// // };

// // export default useUpstreamCSVUpload;

// import { useState, useCallback } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { calculateUpstreamTransportationEmission } from '@/utils/Scope3/calculateUpstreamTransportation';
// import {
//   transportationCategoryOptions,
//   purchasedGoodsActivityOptions,
//   purchasedServicesActivityOptions,
//   purchasedGoodsTypeMapping,
//   vehicleCategoryOptions,
//   vehicleTypeOptions
// } from '@/constant/scope3/upstreamTransportation';
// import { stakeholderDepartmentOptions, processQualityControlOptions } from '@/constant/scope1/options';

// const useUpstreamCSVUpload = (buildings = []) => {
//   const [csvState, setCsvState] = useState({
//     file: null,
//     uploading: false,
//     progress: 0,
//     results: null,
//     validationErrors: [],
//     parsedData: null,
//   });

//   // Clean CSV values
//   const cleanCSVValue = useCallback((value) => {
//     if (typeof value !== 'string') return value;
//     let cleaned = value.trim();
//     cleaned = cleaned.replace(/^["']+|["']+$/g, '');
//     cleaned = cleaned.replace(/^=/, '');
//     return cleaned;
//   }, []);

//   // Parse date to ISO format
//   const parseDateToISO = useCallback((dateString) => {
//     if (!dateString) return null;

//     // Remove quotes and trim
//     let cleaned = dateString.replace(/["']/g, '').trim();

//     // If already ISO format with time, return as is
//     if (cleaned.includes('T') && cleaned.endsWith('Z')) {
//       return cleaned;
//     }

//     // Handle different date formats
//     let date = null;

//     // Try DD/MM/YYYY format (with / or - separators)
//     const ddmmyyyyRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
//     let matches = cleaned.match(ddmmyyyyRegex);
//     if (matches) {
//       const [_, day, month, year] = matches;
//       // Create date in UTC to avoid timezone issues
//       date = new Date(Date.UTC(
//         parseInt(year),
//         parseInt(month) - 1,
//         parseInt(day),
//         0, 0, 0, 0
//       ));
//     }

//     // Try MM/DD/YYYY format if DD/MM/YYYY failed
//     if (!date || isNaN(date.getTime())) {
//       const mmddyyyyRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
//       matches = cleaned.match(mmddyyyyRegex);
//       if (matches) {
//         const [_, month, day, year] = matches;
//         date = new Date(Date.UTC(
//           parseInt(year),
//           parseInt(month) - 1,
//           parseInt(day),
//           0, 0, 0, 0
//         ));
//       }
//     }

//     // Try YYYY-MM-DD format
//     if (!date || isNaN(date.getTime())) {
//       const yyyymmddRegex = /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/;
//       matches = cleaned.match(yyyymmddRegex);
//       if (matches) {
//         const [_, year, month, day] = matches;
//         date = new Date(Date.UTC(
//           parseInt(year),
//           parseInt(month) - 1,
//           parseInt(day),
//           0, 0, 0, 0
//         ));
//       }
//     }

//     // Last resort: try native parsing
//     if (!date || isNaN(date.getTime())) {
//       date = new Date(cleaned);
//     }

//     // Return ISO string if valid
//     if (date && !isNaN(date.getTime())) {
//       return date.toISOString();
//     }

//     return null;
//   }, []);

//   // Parse CSV file
//   const parseCSV = useCallback((file) => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         try {
//           const csvText = event.target.result;

//           // CSV parser
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

//           // Get header row (first line)
//           const headerRowIndex = 0;
//           const headerValues = parseCSVLine(lines[headerRowIndex]);
//           console.log('Original headers:', headerValues);

//           // Check for required fields using flexible matching
//           const requiredChecks = [
//             { field: 'buildingcode', alternatives: ['buildingcode', 'building', 'building code'] },
//             { field: 'stakeholder', alternatives: ['stakeholder', 'stakeholder department', 'department'] },
//           ];

//           const normalizedHeaders = headerValues.map(h => 
//             h.toLowerCase().replace(/[^a-z0-9]/g, '')
//           );

//           console.log('Normalized headers:', normalizedHeaders);

//           const missingFields = [];
//           requiredChecks.forEach(check => {
//             const found = check.alternatives.some(alt => {
//               const normalizedAlt = alt.toLowerCase().replace(/[^a-z0-9]/g, '');
//               return normalizedHeaders.some(h => h.includes(normalizedAlt));
//             });
//             if (!found) {
//               missingFields.push(check.field);
//             }
//           });

//           if (missingFields.length > 0) {
//             reject(new Error(`Missing required columns: ${missingFields.join(', ')}`));
//             return;
//           }

//           // Parse data rows - KEEP ORIGINAL HEADERS
//           const data = [];
//           for (let i = headerRowIndex + 1; i < lines.length; i++) {
//             const line = lines[i].trim();
//             if (!line) continue;

//             const values = parseCSVLine(line);
//             const row = {};

//             // Use original headers to preserve friendly names
//             headerValues.forEach((header, index) => {
//               row[header] = index < values.length ? cleanCSVValue(values[index]) : '';
//             });

//             if (Object.values(row).some(val => val && val.toString().trim() !== '')) {
//               data.push(row);
//             }
//           }

//           console.log('Parsed CSV data:', data);
//           resolve(data);
//         } catch (error) {
//           reject(new Error(`Error parsing CSV: ${error.message}`));
//         }
//       };
//       reader.onerror = () => reject(new Error('Failed to read file'));
//       reader.readAsText(file);
//     });
//   }, [cleanCSVValue]);

//   // Validate each row
//   const validateRow = useCallback((row, index) => {
//     const errors = [];

//     // HEADER MAPPING for friendly headers
//     const headerMapping = {
//       // Building
//       'buildingcode': 'buildingcode',
//       'building': 'buildingcode',

//       // Stakeholder
//       'stakeholder': 'stakeholder',
//       'stakeholderdepartment': 'stakeholder',
//       'department': 'stakeholder',

//       // Transportation and Distribution Category
//       'transportationanddistributioncategory': 'transportationcategory',
//       'transportationcategory': 'transportationcategory',
//       'category': 'transportationcategory',

//       // Purchased Product Activity Type
//       'purchasedproductactivitytype': 'activitytype',
//       'activitytype': 'activitytype',
//       'activity': 'activitytype',

//       // Purchased Goods Type
//       'purchasedgoodstype': 'purchasedgoodstype',
//       'goodstype': 'purchasedgoodstype',

//       // Transportation Vehicle Category
//       'transportationvehiclecategory': 'vehiclecategory',
//       'vehiclecategory': 'vehiclecategory',

//       // Transportation Vehicle Type
//       'transportationvehicletype': 'vehicletype',
//       'vehicletype': 'vehicletype',

//       // Weight Loaded
//       'weightloaded': 'weightloaded',
//       'weight': 'weightloaded',

//       // Distance Travelled
//       'distancetravelled': 'distancetravelled',
//       'distance': 'distancetravelled',

//       // Amount Spent
//       'amountspent': 'amountspent',
//       'amount': 'amountspent',
//       'spent': 'amountspent',

//       // Unit
//       'unit': 'unit',

//       // Quality Control
//       'qualitycontrol': 'qualitycontrol',
//       'quality': 'qualitycontrol',
//       'qc': 'qualitycontrol',

//       // Remarks
//       'remarks': 'remarks',
//       'remark': 'remarks',
//       'note': 'remarks',

//       // Posting Date
//       'postingdate': 'postingdate',
//       'date': 'postingdate',
//     };

//     const cleanedRow = {};

//     // Apply header mapping
//     Object.keys(row).forEach(key => {
//       const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
//       const mappedKey = headerMapping[normalizedKey] || normalizedKey;
//       cleanedRow[mappedKey] = row[key]?.toString().trim() || '';
//     });

//     console.log(`Validating row ${index + 1}:`, cleanedRow);

//     // Required fields
//     const requiredFields = [
//       'buildingcode', 'stakeholder', 'transportationcategory', 'activitytype',
//       'qualitycontrol', 'postingdate'
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
//         errors.push(`Invalid building code "${cleanedRow.buildingcode}"`);
//       }
//     }

//     // Stakeholder validation
//     if (cleanedRow.stakeholder) {
//       const validStakeholders = stakeholderDepartmentOptions.map(s => s.value);
//       const matched = validStakeholders.find(s =>
//         s.toLowerCase() === cleanedRow.stakeholder.toLowerCase()
//       );
//       if (!matched) {
//         errors.push(`Invalid stakeholder "${cleanedRow.stakeholder}". Valid options: ${validStakeholders.slice(0, 5).join(', ')}...`);
//       } else {
//         cleanedRow.stakeholder = matched;
//       }
//     }

//     // Transportation Category validation - FIXED: map label to value
//     if (cleanedRow.transportationcategory) {
//       // Create a map of labels to values
//       const categoryMap = {
//         'purchased goods': 'purchasedGoods',
//         'purchased services': 'purchasedServices',
//       };

//       const lowerCategory = cleanedRow.transportationcategory.toLowerCase();
//       const mappedCategory = categoryMap[lowerCategory];

//       if (!mappedCategory) {
//         errors.push(`Invalid transportation category "${cleanedRow.transportationcategory}". Expected "Purchased Goods" or "Purchased Services"`);
//       } else {
//         cleanedRow.transportationcategory = mappedCategory;
//       }
//     }

//     // Activity Type validation based on category - FIXED: handle both cases
//     if (cleanedRow.transportationcategory && cleanedRow.activitytype) {
//       if (cleanedRow.transportationcategory === 'purchasedGoods') {
//         const validActivities = purchasedGoodsActivityOptions.map(a => a.value);
//         const matchedActivity = validActivities.find(a =>
//           a.toLowerCase() === cleanedRow.activitytype.toLowerCase()
//         );
//         if (!matchedActivity) {
//           errors.push(`Invalid activity type "${cleanedRow.activitytype}" for purchased goods. Valid options: ${validActivities.slice(0, 5).join(', ')}...`);
//         } else {
//           cleanedRow.activitytype = matchedActivity;
//         }
//       } else if (cleanedRow.transportationcategory === 'purchasedServices') {
//         const validActivities = purchasedServicesActivityOptions.map(a => a.value);
//         const matchedActivity = validActivities.find(a =>
//           a.toLowerCase() === cleanedRow.activitytype.toLowerCase()
//         );
//         if (!matchedActivity) {
//           errors.push(`Invalid activity type "${cleanedRow.activitytype}" for purchased services. Valid options: ${validActivities.slice(0, 5).join(', ')}...`);
//         } else {
//           cleanedRow.activitytype = matchedActivity;
//         }
//       }
//     }

//     // Purchased Goods Type validation
//     if (cleanedRow.activitytype && cleanedRow.purchasedgoodstype) {
//       const goodsOptions = purchasedGoodsTypeMapping[cleanedRow.activitytype] || [];
//       const matchedGoods = goodsOptions.find(g =>
//         g.value.toLowerCase() === cleanedRow.purchasedgoodstype.toLowerCase()
//       );
//       if (goodsOptions.length > 0 && !matchedGoods) {
//         errors.push(`Invalid purchased goods type "${cleanedRow.purchasedgoodstype}" for activity "${cleanedRow.activitytype}"`);
//       } else if (matchedGoods) {
//         cleanedRow.purchasedgoodstype = matchedGoods.value;
//       }
//     }

//     // Vehicle Category validation for purchasedGoods
//     if (cleanedRow.transportationcategory === 'purchasedGoods') {
//       if (!cleanedRow.vehiclecategory) {
//         errors.push('Vehicle category is required for purchased goods');
//       } else {
//         const validVehicleCategories = vehicleCategoryOptions.map(v => v.value);
//         const matched = validVehicleCategories.find(v =>
//           v.toLowerCase() === cleanedRow.vehiclecategory.toLowerCase()
//         );
//         if (!matched) {
//           errors.push(`Invalid vehicle category "${cleanedRow.vehiclecategory}"`);
//         } else {
//           cleanedRow.vehiclecategory = matched;
//         }
//       }
//     }

//     // Vehicle Type validation
//     if (cleanedRow.vehiclecategory && cleanedRow.vehicletype) {
//       const validTypes = vehicleTypeOptions[cleanedRow.vehiclecategory] || [];
//       const matched = validTypes.find(t =>
//         t.value.toLowerCase() === cleanedRow.vehicletype.toLowerCase()
//       );
//       if (validTypes.length > 0 && !matched) {
//         errors.push(`Invalid vehicle type "${cleanedRow.vehicletype}" for category "${cleanedRow.vehiclecategory}"`);
//       } else if (matched) {
//         cleanedRow.vehicletype = matched.value;
//       }
//     }

//     // Numeric validations
//     if (cleanedRow.transportationcategory === 'purchasedGoods') {
//       // Weight Loaded validation
//       if (cleanedRow.weightloaded) {
//         const num = Number(cleanedRow.weightloaded);
//         if (isNaN(num)) {
//           errors.push(`Weight loaded must be a number, got "${cleanedRow.weightloaded}"`);
//         } else if (num < 0) {
//           errors.push('Weight loaded cannot be negative');
//         } else {
//           cleanedRow.weightloaded = num.toString();
//         }
//       } else {
//         errors.push('Weight loaded is required for purchased goods');
//       }

//       // Distance Travelled validation
//       if (cleanedRow.distancetravelled) {
//         const num = Number(cleanedRow.distancetravelled);
//         if (isNaN(num)) {
//           errors.push(`Distance travelled must be a number, got "${cleanedRow.distancetravelled}"`);
//         } else if (num < 0) {
//           errors.push('Distance travelled cannot be negative');
//         } else {
//           cleanedRow.distancetravelled = num.toString();
//         }
//       } else {
//         errors.push('Distance travelled is required for purchased goods');
//       }
//     }

//     if (cleanedRow.transportationcategory === 'purchasedServices') {
//       if (cleanedRow.amountspent) {
//         const num = Number(cleanedRow.amountspent);
//         if (isNaN(num)) {
//           errors.push(`Amount spent must be a number, got "${cleanedRow.amountspent}"`);
//         } else if (num < 0) {
//           errors.push('Amount spent cannot be negative');
//         } else {
//           cleanedRow.amountspent = num.toString();
//         }
//       } else {
//         errors.push('Amount spent is required for purchased services');
//       }
//     }

//     // Quality Control validation
//     if (cleanedRow.qualitycontrol) {
//       const validQC = processQualityControlOptions.map(q => q.value);
//       const matched = validQC.find(q =>
//         q.toLowerCase() === cleanedRow.qualitycontrol.toLowerCase()
//       );
//       if (!matched) {
//         errors.push(`Invalid quality control "${cleanedRow.qualitycontrol}"`);
//       } else {
//         cleanedRow.qualitycontrol = matched;
//       }
//     }

//     // Date validation and conversion to ISO
//     if (cleanedRow.postingdate) {
//       const isoDate = parseDateToISO(cleanedRow.postingdate);

//       if (!isoDate) {
//         errors.push(`Invalid date format "${cleanedRow.postingdate}". Please use DD/MM/YYYY format (e.g., 17/02/2026)`);
//       } else {
//         // Extract just the date part for validation
//         const datePart = isoDate.split('T')[0];
//         const date = new Date(datePart);

//         if (isNaN(date.getTime())) {
//           errors.push(`Invalid date "${cleanedRow.postingdate}"`);
//         } else if (date > new Date()) {
//           errors.push('Date cannot be in the future');
//         } else {
//           cleanedRow.postingdate = isoDate;
//         }
//       }
//     }

//     // Remarks validation
//     if (cleanedRow.remarks && cleanedRow.remarks.length > 500) {
//       errors.push('Remarks cannot exceed 500 characters');
//     }

//     // Update original row with cleaned values
//     if (errors.length === 0) {
//       Object.keys(cleanedRow).forEach(key => {
//         row[key] = cleanedRow[key];
//       });
//     }

//     return errors;
//   }, [buildings, parseDateToISO]);

//   // Transform row to API payload
//   const transformToPayload = useCallback((row) => {
//     // Calculate emissions
//     let calculatedEmissions = {};
//     if (row.transportationcategory === 'purchasedGoods') {
//       calculatedEmissions = calculateUpstreamTransportationEmission({
//         transportationCategory: 'purchasedGoods',
//         weightLoaded: parseFloat(row.weightloaded),
//         distanceTravelled: parseFloat(row.distancetravelled),
//         vehicleCategory: row.vehiclecategory,
//         vehicleType: row.vehicletype,
//       }) || {};
//     } else if (row.transportationcategory === 'purchasedServices') {
//       calculatedEmissions = calculateUpstreamTransportationEmission({
//         transportationCategory: 'purchasedServices',
//         amountSpent: parseFloat(row.amountspent),
//         activityType: row.activitytype,
//         unit: 'USD',
//       }) || {};
//     }

//     const capitalizeFirstLetter = (text) => {
//       if (!text) return "";
//       return text.charAt(0).toUpperCase() + text.slice(1);
//     };

//     return {
//       buildingCode: row.buildingcode,
//       stakeholderDepartment: row.stakeholder,
//       transportationCategory: row.transportationcategory,
//       activityType: row.activitytype,
//       purchasedGoodsType: row.purchasedgoodstype || '',
//       vehicleCategory: row.vehiclecategory || '',
//       vehicleType: row.vehicletype || '',
//       weightLoaded: row.weightloaded || '',
//       distanceTravelled: row.distancetravelled || '',
//       amountSpent: row.amountspent || '',
//       unit: row.transportationcategory === 'purchasedServices' ? 'USD' : '',
//       qualityControl: row.qualitycontrol,
//       remarks: capitalizeFirstLetter(row.remarks || ''),
//       calculatedEmissionKgCo2e: calculatedEmissions.calculatedEmissionKgCo2e || 0,
//       calculatedEmissionTCo2e: calculatedEmissions.calculatedEmissionTCo2e || 0,
//       postingDate: row.postingdate,
//     };
//   }, []);

//   // Handle file selection
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
//         const rowErrors = validateRow(row, index);
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

//   // Process upload
//   const processUpload = async (onSuccess = null) => {
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
//           const payload = transformToPayload(row);

//           await axios.post(
//             `${process.env.REACT_APP_BASE_URL}/upstream/Create`,
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
//           results.errors.push({
//             row: i + 1,
//             error: error.response?.data?.message || error.message
//           });
//         }

//         const currentProgress = Math.round(((i + 1) / totalRows) * 100);
//         if (currentProgress % 10 === 0 || i === totalRows - 1) {
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
//       }, 1000);

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

//   // Reset upload state
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

//   // Download template with friendly headers
//   const downloadTemplate = () => {
//     const currentDate = new Date();
//     const day = String(currentDate.getDate()).padStart(2, '0');
//     const month = String(currentDate.getMonth() + 1).padStart(2, '0');
//     const year = currentDate.getFullYear();
//     const formattedDate = `${day}/${month}/${year}`;

//     // FRIENDLY HEADERS with your requested names
//     const headers = [
//       'Building Code',
//       'Stakeholder',
//       'Transportation and Distribution Category',
//       'Purchased Product Activity Type',
//       'Purchased Goods Type',
//       'Transportation Vehicle Category',
//       'Transportation Vehicle Type',
//       'Weight Loaded',
//       'Distance Travelled',
//       'Amount Spent',
//       'Unit',
//       'Quality Control',
//       'Remarks',
//       'Posting Date'
//     ].join(',');

//     // Using valid stakeholder values that exist in stakeholderDepartmentOptions
//     // Common valid values: Assembly, Electrical, Facilities, Finishing, Logistics, Machining, etc.
//     const exampleRows = [
//       // Purchased goods example
//       `BLD-1147,Assembly,Purchased Goods,Raw Materials,Petrochemicals,freightFlights,International,100,500,,,Good,Steel shipment,${formattedDate}`,
//       // Purchased services example
//       `BLD-1147,Assembly,Purchased Services,Warehousing and support services for transportation,,,,,,5000,USD,Fair,Warehouse services,${formattedDate}`
//     ].join('\n');

//     const csv = headers + '\n' + exampleRows;

//   const BOM = '\uFEFF';
//   const blob = new Blob([BOM + template], { type: 'text/csv;charset=utf-8;' });    const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'upstream_transportation_template.csv';
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
//     downloadTemplate,
//   };
// };

// export default useUpstreamCSVUpload;

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
  const validateRow = useCallback((row, index) => {
    const errors = [];

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
        errors.push(`Invalid building code "${cleanedRow.buildingcode}"`);
      }
    }

    if (cleanedRow.stakeholder) {
      const validStakeholders = stakeholderDepartmentOptions.map(s => s.value);
      const matched = validStakeholders.find(s =>
        s.toLowerCase() === cleanedRow.stakeholder.toLowerCase()
      );
      if (!matched) {
        errors.push(`Invalid stakeholder "${cleanedRow.stakeholder}". Valid options: ${validStakeholders.slice(0, 5).join(', ')}...`);
      } else {
        cleanedRow.stakeholder = matched;
      }
    }

    if (cleanedRow.transportationcategory) {
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
    }

    if (cleanedRow.transportationcategory && cleanedRow.activitytype) {
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
    }

    if (cleanedRow.activitytype && cleanedRow.purchasedgoodstype) {
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

    if (cleanedRow.transportationcategory === 'purchasedGoods') {
      if (!cleanedRow.vehiclecategory) {
        errors.push('Vehicle category is required for purchased goods');
      } else {
        const trimmedCategory = cleanedRow.vehiclecategory.toString().trim();

        // First try to find by value (case-insensitive)
        let matched = vehicleCategoryOptions.find(v =>
          v.value.toLowerCase() === trimmedCategory.toLowerCase()
        );

        // If not found, try to find by label (case-insensitive)
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

    if (cleanedRow.vehiclecategory && cleanedRow.vehicletype) {
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

    if (cleanedRow.transportationcategory === 'purchasedGoods') {
      if (cleanedRow.weightloaded) {
        const num = Number(cleanedRow.weightloaded);
        if (isNaN(num)) {
          errors.push(`Weight loaded must be a number, got "${cleanedRow.weightloaded}"`);
        } else if (num < 0) {
          errors.push('Weight loaded cannot be negative');
        } else {
          cleanedRow.weightloaded = num.toString();
        }
      } else {
        errors.push('Weight loaded is required for purchased goods');
      }

      if (cleanedRow.distancetravelled) {
        const num = Number(cleanedRow.distancetravelled);
        if (isNaN(num)) {
          errors.push(`Distance travelled must be a number, got "${cleanedRow.distancetravelled}"`);
        } else if (num < 0) {
          errors.push('Distance travelled cannot be negative');
        } else {
          cleanedRow.distancetravelled = num.toString();
        }
      } else {
        errors.push('Distance travelled is required for purchased goods');
      }
    }

    if (cleanedRow.transportationcategory === 'purchasedServices') {
      if (cleanedRow.amountspent) {
        const num = Number(cleanedRow.amountspent);
        if (isNaN(num)) {
          errors.push(`Amount spent must be a number, got "${cleanedRow.amountspent}"`);
        } else if (num < 0) {
          errors.push('Amount spent cannot be negative');
        } else {
          cleanedRow.amountspent = num.toString();
        }
      } else {
        errors.push('Amount spent is required for purchased services');
      }
    }

    if (cleanedRow.qualitycontrol) {
      const validQC = processQualityControlOptions.map(q => q.value);
      const matched = validQC.find(q =>
        q.toLowerCase() === cleanedRow.qualitycontrol.toLowerCase()
      );
      if (!matched) {
        errors.push(`Invalid quality control "${cleanedRow.qualitycontrol}"`);
      } else {
        cleanedRow.qualitycontrol = matched;
      }
    }

    if (cleanedRow.postingdate) {
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
      purchasedGoodsType: row.purchasedgoodstype || '',
      vehicleCategory: row.vehiclecategory || '',
      vehicleType: row.vehicletype || '',
      weightLoaded: row.weightloaded || '',
      distanceTravelled: row.distancetravelled || '',
      amountSpent: row.amountspent || '',
      unit: row.transportationcategory === 'purchasedServices' ? 'USD' : '',
      qualityControl: row.qualitycontrol,
      remarks: capitalizeFirstLetter(row.remarks || ''),
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