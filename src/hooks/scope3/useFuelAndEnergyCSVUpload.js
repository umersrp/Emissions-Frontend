// // // hooks/scope3/useFuelAndEnergyCSVUpload.js
// // import { useState, useCallback } from 'react';
// // import axios from 'axios';
// // import { toast } from 'react-toastify';
// // import { calculateFuelAndEnergy } from '@/utils/Scope3/calculateFuelAndEnergy';

// // import {
// //     fuelUnitOptionsByName, fuelEnergyTypes, fuelEnergyTypesChildTypes, AIR_TRAVEL_OPTIONS, AIR_FLIGHT_TYPES, TAXI_TYPES, BUS_TYPES, TRAIN_TYPES,
// // } from "@/constant/scope3/fuelAndEnergy";
// // import { stakeholderOptions, units, } from "@/constant/scope3/options";
// // import { qualityControlOptions } from "@/constant/scope1/options";


// // const electricityUnits=[
// //     {value:'kWh', label:'kWh'},
// //     {value:'MWh', label:'MWh'},
// // ];
// // const useFuelAndEnergyCSVUpload = (buildings = []) => {
// //   const [csvState, setCsvState] = useState({
// //     file: null,
// //     uploading: false,
// //     progress: 0,
// //     results: null,
// //     validationErrors: [],
// //     parsedData: null,
// //   });

// //   const cleanCSVValue = useCallback((value) => {
// //     if (typeof value !== 'string') return value;

// //     let cleaned = value.trim();

// //     // Remove surrounding quotes
// //     cleaned = cleaned.replace(/^["']+|["']+$/g, '');

// //     // Remove Excel formula prefix
// //     cleaned = cleaned.replace(/^=/, '');

// //     return cleaned;
// //   }, []);

// //   // Helper function to parse date in any format to ISO
// //   const parseDateToISO = useCallback((dateString) => {
// //     if (!dateString) return null;
    
// //     let cleanedDate = dateString.toString().trim();
// //     cleanedDate = cleanedDate.replace(/"/g, ''); // Remove quotes
    
// //     // Handle empty or invalid dates
// //     if (!cleanedDate || cleanedDate === '') return null;
    
// //     // Try to parse the date
// //     let date;
// //     let year, month, day;
    
// //     // Check if it's already an ISO string with timezone
// //     if (cleanedDate.includes('T')) {
// //       date = new Date(cleanedDate.split('T')[0]);
// //     } else {
// //       const parts = cleanedDate.split(/[\/\-\.]/);
      
// //       if (parts.length === 3) {
// //         if (parts[0].length === 4) {
// //           // Format: YYYY-MM-DD
// //           year = parseInt(parts[0]);
// //           month = parseInt(parts[1]) - 1;
// //           day = parseInt(parts[2]);
// //           date = new Date(year, month, day);
// //         } else if (parts[2].length === 4) {
// //           // Could be MM/DD/YYYY or DD/MM/YYYY
// //           if (parseInt(parts[0]) > 12) {
// //             // Likely DD/MM/YYYY
// //             day = parseInt(parts[0]);
// //             month = parseInt(parts[1]) - 1;
// //             year = parseInt(parts[2]);
// //             date = new Date(year, month, day);
// //           } else if (parseInt(parts[1]) > 12) {
// //             // Likely MM/DD/YYYY
// //             month = parseInt(parts[0]) - 1;
// //             day = parseInt(parts[1]);
// //             year = parseInt(parts[2]);
// //             date = new Date(year, month, day);
// //           } else {
// //             // Ambiguous - try both
// //             let testDate1 = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
// //             let testDate2 = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            
// //             if (!isNaN(testDate1.getTime()) && testDate1.getDate() === parseInt(parts[1])) {
// //               date = testDate1;
// //             } else if (!isNaN(testDate2.getTime()) && testDate2.getDate() === parseInt(parts[0])) {
// //               date = testDate2;
// //             }
// //           }
// //         } else {
// //           date = new Date(cleanedDate);
// //         }
// //       } else {
// //         date = new Date(cleanedDate);
// //       }
// //     }
    
// //     if (!date || isNaN(date.getTime())) {
// //       return null;
// //     }
    
// //     const isoDate = new Date(
// //       Date.UTC(
// //         date.getFullYear(),
// //         date.getMonth(),
// //         date.getDate(),
// //         0, 0, 0, 0
// //       )
// //     ).toISOString();
    
// //     return isoDate;
// //   }, []);

// //   // const parseCSV = useCallback((file) => {
// //   //   return new Promise((resolve, reject) => {
// //   //     const reader = new FileReader();
// //   //     reader.onload = (event) => {
// //   //       try {
// //   //         const csvText = event.target.result;

// //   //         const parseCSVLine = (line) => {
// //   //           const result = [];
// //   //           let current = '';
// //   //           let inQuotes = false;

// //   //           for (let i = 0; i < line.length; i++) {
// //   //             const char = line[i];
// //   //             const nextChar = line[i + 1];

// //   //             if (char === '"') {
// //   //               if (inQuotes && nextChar === '"') {
// //   //                 current += '"';
// //   //                 i++;
// //   //               } else {
// //   //                 inQuotes = !inQuotes;
// //   //               }
// //   //             } else if (char === ',' && !inQuotes) {
// //   //               result.push(current);
// //   //               current = '';
// //   //             } else {
// //   //               current += char;
// //   //             }
// //   //           }

// //   //           result.push(current);
// //   //           return result;
// //   //         };

// //   //         const lines = csvText.split('\n').filter(line => line.trim() !== '');

// //   //         if (lines.length === 0) {
// //   //           reject(new Error('CSV file is empty'));
// //   //           return;
// //   //         }

// //   //         // Find header row
// //   //         let headerRowIndex = -1;
// //   //         for (let i = 0; i < lines.length; i++) {
// //   //           const compactLine = lines[i]
// //   //             .replace(/['"]/g, '')
// //   //             .toLowerCase()
// //   //             .replace(/[^a-z0-9]/g, '');

// //   //           if (compactLine.includes('buildingcode') && compactLine.includes('fueltype')) {
// //   //             headerRowIndex = i;
// //   //             break;
// //   //           }
// //   //         }

// //   //         if (headerRowIndex === -1) {
// //   //           reject(new Error('CSV must contain header row with required columns'));
// //   //           return;
// //   //         }

// //   //         const headerValues = parseCSVLine(lines[headerRowIndex]);
// //   //         const headers = headerValues.map(h =>
// //   //           cleanCSVValue(h).toLowerCase().replace(/[^a-z0-9]/g, '')
// //   //         );

// //   //         // Expected headers
// //   //         const expectedHeaders = [
// //   //           'buildingcode', 'stakeholder', 'fueltype', 'fuel', 'totalfuelconsumption',
// //   //           'fuelconsumptionunit', 'totalgrosselectricitypurchased', 'unit', 'qualitycontrol',
// //   //           'remarks', 'postingdate', 'airpassengers', 'airdistancekm', 'airtravelclass',
// //   //           'airflighttype', 'taxipassengers', 'taxidistancekm', 'taxitype', 'buspassengers',
// //   //           'busdistancekm', 'bustype', 'trainpassengers', 'traindistancekm', 'traintype'
// //   //         ];

// //   //         const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
// //   //         if (missingHeaders.length > 0) {
// //   //           reject(new Error(`Missing required columns: ${missingHeaders.slice(0, 5).join(', ')}...`));
// //   //           return;
// //   //         }

// //   //         const data = [];
// //   //         for (let i = headerRowIndex + 1; i < lines.length; i++) {
// //   //           const line = lines[i].trim();
// //   //           if (!line) continue;

// //   //           const values = parseCSVLine(line);
// //   //           const row = {};
            
// //   //           headers.forEach((header, index) => {
// //   //             row[header] = index < values.length ? cleanCSVValue(values[index]) : '';
// //   //           });

// //   //           if (Object.values(row).some(val => val && val.toString().trim() !== '')) {
// //   //             data.push(row);
// //   //           }
// //   //         }

// //   //         resolve(data);
// //   //       } catch (error) {
// //   //         reject(new Error(`Error parsing CSV: ${error.message}`));
// //   //       }
// //   //     };
// //   //     reader.onerror = () => reject(new Error('Failed to read file'));
// //   //     reader.readAsText(file);
// //   //   });
// //   // }, [cleanCSVValue]);
// // const parseCSV = useCallback((file) => {
// //   return new Promise((resolve, reject) => {
// //     const reader = new FileReader();
// //     reader.onload = (event) => {
// //       try {
// //         const csvText = event.target.result;

// //         const parseCSVLine = (line) => {
// //           const result = [];
// //           let current = '';
// //           let inQuotes = false;

// //           for (let i = 0; i < line.length; i++) {
// //             const char = line[i];
// //             const nextChar = line[i + 1];

// //             if (char === '"') {
// //               if (inQuotes && nextChar === '"') {
// //                 current += '"';
// //                 i++;
// //               } else {
// //                 inQuotes = !inQuotes;
// //               }
// //             } else if (char === ',' && !inQuotes) {
// //               result.push(current);
// //               current = '';
// //             } else {
// //               current += char;
// //             }
// //           }

// //           result.push(current);
// //           return result;
// //         };

// //         const lines = csvText.split('\n').filter(line => line.trim() !== '');

// //         if (lines.length === 0) {
// //           reject(new Error('CSV file is empty'));
// //           return;
// //         }

// //         // Get header row (first line)
// //         const headerRowIndex = 0;
// //         const headerValues = parseCSVLine(lines[headerRowIndex]);
        
// //         console.log('Original headers:', headerValues);

// //         // Create a mapping for special headers
// //         const specialHeaderMapping = {
// //           'totalpurchasedelectricitygridsupplierspecificppa': 'totalgrosselectricitypurchased',
// //           'totalpurchasedelectricity': 'totalgrosselectricitypurchased',
// //         };

// //         // Normalize headers for checking
// //         const normalizedHeaders = headerValues.map(h => 
// //           h.toLowerCase().replace(/[^a-z0-9]/g, '')
// //         );

// //         console.log('Normalized headers:', normalizedHeaders);

// //         // Check for required fields using flexible matching
// //         const requiredChecks = [
// //           { field: 'buildingcode', alternatives: ['buildingcode', 'building'] },
// //           { field: 'stakeholder', alternatives: ['stakeholder', 'stakeholderdepartment', 'department'] },
// //           { field: 'fueltype', alternatives: ['fueltype', 'fueltype'] },
// //           { field: 'fuel', alternatives: ['fuel', 'fuelname'] },
// //           { field: 'qualitycontrol', alternatives: ['qualitycontrol', 'quality'] },
// //         ];

// //         const missingFields = [];
// //         requiredChecks.forEach(check => {
// //           const found = check.alternatives.some(alt => 
// //             normalizedHeaders.some(h => h.includes(alt))
// //           );
// //           if (!found) {
// //             missingFields.push(check.field);
// //           }
// //         });

// //         // Special check for electricity field (can have friendly name)
// //         const hasElectricityField = normalizedHeaders.some(h => 
// //           h.includes('totalpurchasedelectricity') || 
// //           h.includes('totalgrosselectricity') ||
// //           h.includes('electricitypurchased')
// //         );

// //         if (!hasElectricityField) {
// //           missingFields.push('totalgrosselectricitypurchased (or similar)');
// //         }

// //         if (missingFields.length > 0) {
// //           reject(new Error(`Missing required columns: ${missingFields.join(', ')}`));
// //           return;
// //         }

// //         // Parse data rows - KEEP ORIGINAL HEADERS
// //         const data = [];
// //         for (let i = headerRowIndex + 1; i < lines.length; i++) {
// //           const line = lines[i].trim();
// //           if (!line) continue;

// //           const values = parseCSVLine(line);
// //           const row = {};
          
// //           // Use original headers to preserve the friendly names
// //           headerValues.forEach((header, index) => {
// //             row[header] = index < values.length ? cleanCSVValue(values[index]) : '';
// //           });

// //           if (Object.values(row).some(val => val && val.toString().trim() !== '')) {
// //             data.push(row);
// //           }
// //         }

// //         console.log('Parsed CSV data:', data);
// //         resolve(data);
// //       } catch (error) {
// //         reject(new Error(`Error parsing CSV: ${error.message}`));
// //       }
// //     };
// //     reader.onerror = () => reject(new Error('Failed to read file'));
// //     reader.readAsText(file);
// //   });
// // }, [cleanCSVValue]);
// //   const validateFuelAndEnergyRow = useCallback((row, index) => {
// //     const errors = [];
// //     const headerMapping = {
// //     'totalgrosselectricitypurchased': 'totalgrosselectricitypurchased', // Keep as is
// //     'totalpurchasedelectricitygridsupplierspecificppa': 'totalgrosselectricitypurchased', // This maps the friendly header
// //   };

// //   const cleanedRow = {};
  
// //   // USE THIS MAPPED VERSION
// //   Object.keys(row).forEach(key => {
// //     const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
// //     const mappedKey = headerMapping[normalizedKey] || normalizedKey;
// //     cleanedRow[mappedKey] = row[key]?.toString().trim();
// //   });
// //     // Required fields
// //     const requiredFields = ['buildingcode', 'stakeholder', 'fueltype', 'fuel', 'qualitycontrol'];
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

// //     // Stakeholder validation
// //     if (cleanedRow.stakeholder) {
// //       const validStakeholders = stakeholderOptions.map(s => s.value);
// //       const matchedStakeholder = validStakeholders.find(s =>
// //         s.toLowerCase() === cleanedRow.stakeholder.toLowerCase()
// //       );
// //       if (!matchedStakeholder) {
// //         errors.push(`Invalid stakeholder "${cleanedRow.stakeholder}"`);
// //       } else {
// //         cleanedRow.stakeholder = matchedStakeholder;
// //       }
// //     }

// //     // Fuel Type validation
// //     if (cleanedRow.fueltype) {
// //       const validFuelTypes = fuelEnergyTypes.map(f => f.value);
// //       const matchedFuelType = validFuelTypes.find(f =>
// //         f.toLowerCase() === cleanedRow.fueltype.toLowerCase()
// //       );
// //       if (!matchedFuelType) {
// //         errors.push(`Invalid fuel type "${cleanedRow.fueltype}"`);
// //       } else {
// //         cleanedRow.fueltype = matchedFuelType;
// //       }
// //     }

// //     // Fuel Name validation
// //     if (cleanedRow.fueltype && cleanedRow.fuel) {
// //       const validFuels = fuelEnergyTypesChildTypes[cleanedRow.fueltype]?.map(f => f.value) || [];
// //       const matchedFuel = validFuels.find(f =>
// //         f.toLowerCase() === cleanedRow.fuel.toLowerCase()
// //       );
// //       if (!matchedFuel) {
// //         errors.push(`Invalid fuel name "${cleanedRow.fuel}" for type "${cleanedRow.fueltype}"`);
// //       } else {
// //         cleanedRow.fuel = matchedFuel;
// //       }
// //     }

// //     // Fuel Consumption validation
// //     if (cleanedRow.totalfuelconsumption) {
// //       const cleanNum = cleanedRow.totalfuelconsumption.toString()
// //         .replace(/[^0-9.-]/g, '')
// //         .replace(/^"+|"+$/g, '');

// //       const num = Number(cleanNum);
// //       if (isNaN(num)) {
// //         errors.push(`Fuel consumption must be a number, got "${cleanedRow.totalfuelconsumption}"`);
// //       } else if (num < 0) {
// //         errors.push('Fuel consumption cannot be negative');
// //       } else if (num > 1000000000) {
// //         errors.push('Fuel consumption seems too large');
// //       } else {
// //         cleanedRow.totalfuelconsumption = num.toString();
// //       }
// //     }

// //     // Fuel Consumption Unit validation
// //     if (cleanedRow.totalfuelconsumption && cleanedRow.fuelconsumptionunit) {
// //       const allUnits = [
// //         ...fuelUnitOptionsByName.default,
// //         ...(cleanedRow.fuel ? fuelUnitOptionsByName[cleanedRow.fuel] || [] : [])
// //       ];

// //       const cleanUnit = cleanedRow.fuelconsumptionunit.toLowerCase();
// //       const matchedUnit = allUnits.find(u => u.toLowerCase() === cleanUnit);

// //       if (!matchedUnit) {
// //         errors.push(`Invalid fuel consumption unit "${cleanedRow.fuelconsumptionunit}"`);
// //       } else {
// //         cleanedRow.fuelconsumptionunit = matchedUnit;
// //       }
// //     }

// //     // Electricity validation
// //     if (cleanedRow.totalgrosselectricitypurchased) {
// //       const cleanNum = cleanedRow.totalgrosselectricitypurchased.toString()
// //         .replace(/[^0-9.-]/g, '')
// //         .replace(/^"+|"+$/g, '');

// //       const num = Number(cleanNum);
// //       if (isNaN(num)) {
// //         errors.push(`Electricity must be a number, got "${cleanedRow.totalgrosselectricitypurchased}"`);
// //       } else if (num < 0) {
// //         errors.push('Electricity cannot be negative');
// //       } else {
// //         cleanedRow.totalgrosselectricitypurchased = num.toString();
// //       }
// //     }

// //     // Electricity Unit validation
// //     if (cleanedRow.totalgrosselectricitypurchased && cleanedRow.unit) {
// //       const validUnits = electricityUnits.map(u => u.value);
// //       const matchedUnit = validUnits.find(u =>
// //         u.toLowerCase() === cleanedRow.unit.toLowerCase()
// //       );
// //       if (!matchedUnit) {
// //         errors.push(`Invalid electricity unit "${cleanedRow.unit}"`);
// //       } else {
// //         cleanedRow.unit = matchedUnit;
// //       }
// //     }

// //     // At least one of fuel or electricity must be provided
// //     const hasFuel = cleanedRow.totalfuelconsumption && cleanedRow.totalfuelconsumption !== '';
// //     const hasElectricity = cleanedRow.totalgrosselectricitypurchased && cleanedRow.totalgrosselectricitypurchased !== '';
    
// //     if (!hasFuel && !hasElectricity) {
// //       errors.push('Either fuel consumption or electricity purchased must be provided');
// //     }

// //     // Quality Control validation
// //     if (cleanedRow.qualitycontrol) {
// //       const validQC = qualityControlOptions.map(q => q.value);
// //       const matchedQC = validQC.find(q =>
// //         q.toLowerCase() === cleanedRow.qualitycontrol.toLowerCase()
// //       );
// //       if (!matchedQC) {
// //         errors.push(`Invalid quality control "${cleanedRow.qualitycontrol}"`);
// //       } else {
// //         cleanedRow.qualitycontrol = matchedQC;
// //       }
// //     }

// //     // Travel field validations (if provided)
// //     if (cleanedRow.airpassengers || cleanedRow.airdistancekm) {
// //       if (!cleanedRow.airpassengers) errors.push('Air passengers required when air distance provided');
// //       if (!cleanedRow.airdistancekm) errors.push('Air distance required when air passengers provided');
// //       if (cleanedRow.airpassengers) {
// //         const num = Number(cleanedRow.airpassengers.replace(/[^0-9.-]/g, ''));
// //         if (isNaN(num) || num < 0) errors.push('Air passengers must be a positive number');
// //       }
// //       if (cleanedRow.airdistancekm) {
// //         const num = Number(cleanedRow.airdistancekm.replace(/[^0-9.-]/g, ''));
// //         if (isNaN(num) || num < 0) errors.push('Air distance must be a positive number');
// //       }
// //     }

// //     if (cleanedRow.airflighttype) {
// //       const validFlightTypes = AIR_FLIGHT_TYPES.map(f => f.value);
// //       if (!validFlightTypes.includes(cleanedRow.airflighttype)) {
// //         errors.push(`Invalid air flight type "${cleanedRow.airflighttype}"`);
// //       }
// //     }

// //     if (cleanedRow.airtravelclass && cleanedRow.airflighttype) {
// //       const validClasses = AIR_TRAVEL_OPTIONS[cleanedRow.airflighttype]?.map(c => c.value) || [];
// //       if (!validClasses.includes(cleanedRow.airtravelclass)) {
// //         errors.push(`Invalid travel class "${cleanedRow.airtravelclass}" for ${cleanedRow.airflighttype}`);
// //       }
// //     }

// //     // Taxi validations
// //     if (cleanedRow.taxipassengers || cleanedRow.taxidistancekm) {
// //       if (!cleanedRow.taxipassengers) errors.push('Taxi passengers required when taxi distance provided');
// //       if (!cleanedRow.taxidistancekm) errors.push('Taxi distance required when taxi passengers provided');
// //     }

// //     if (cleanedRow.taxitype) {
// //       const validTaxiTypes = TAXI_TYPES.map(t => t.value);
// //       if (!validTaxiTypes.includes(cleanedRow.taxitype)) {
// //         errors.push(`Invalid taxi type "${cleanedRow.taxitype}"`);
// //       }
// //     }

// //     // Bus validations
// //     if (cleanedRow.buspassengers || cleanedRow.busdistancekm) {
// //       if (!cleanedRow.buspassengers) errors.push('Bus passengers required when bus distance provided');
// //       if (!cleanedRow.busdistancekm) errors.push('Bus distance required when bus passengers provided');
// //     }

// //     if (cleanedRow.bustype) {
// //       const validBusTypes = BUS_TYPES.map(b => b.value);
// //       if (!validBusTypes.includes(cleanedRow.bustype)) {
// //         errors.push(`Invalid bus type "${cleanedRow.bustype}"`);
// //       }
// //     }

// //     // Train validations
// //     if (cleanedRow.trainpassengers || cleanedRow.traindistancekm) {
// //       if (!cleanedRow.trainpassengers) errors.push('Train passengers required when train distance provided');
// //       if (!cleanedRow.traindistancekm) errors.push('Train distance required when train passengers provided');
// //     }

// //     if (cleanedRow.traintype) {
// //       const validTrainTypes = TRAIN_TYPES.map(t => t.value);
// //       if (!validTrainTypes.includes(cleanedRow.traintype)) {
// //         errors.push(`Invalid train type "${cleanedRow.traintype}"`);
// //       }
// //     }

// //     // Date validation
// //     if (cleanedRow.postingdate) {
// //       const isoDate = parseDateToISO(cleanedRow.postingdate);
// //       if (!isoDate) {
// //         errors.push(`Invalid date format: "${cleanedRow.postingdate}"`);
// //       } else {
// //         cleanedRow.postingdate = isoDate;
// //       }
// //     } else {
// //       cleanedRow.postingdate = new Date(
// //         Date.UTC(
// //           new Date().getFullYear(),
// //           new Date().getMonth(),
// //           new Date().getDate(),
// //           0, 0, 0, 0
// //         )
// //       ).toISOString();
// //     }

// //     // Remarks validation
// //     if (cleanedRow.remarks && cleanedRow.remarks.length > 500) {
// //       errors.push('Remarks cannot exceed 500 characters');
// //     }

// //     if (errors.length === 0) {
// //       Object.keys(cleanedRow).forEach(key => {
// //         row[key] = cleanedRow[key];
// //       });
// //     }

// //     return errors;
// //   }, [buildings, parseDateToISO]);

// //   const transformFuelAndEnergyPayload = useCallback((row) => {
// //     const emission = calculateFuelAndEnergy({
// //       fuelType: row.fueltype,
// //       fuel: row.fuel,
// //       totalFuelConsumption: row.totalfuelconsumption ? Number(row.totalfuelconsumption) : 0,
// //       fuelConsumptionUnit: row.fuelconsumptionunit,
// //       totalGrossElectricityPurchased: row.totalgrosselectricitypurchased ? Number(row.totalgrosselectricitypurchased) : 0,
// //       unit: row.unit,
// //       airPassengers: row.airpassengers ? Number(row.airpassengers) : 0,
// //       airDistanceKm: row.airdistancekm ? Number(row.airdistancekm) : 0,
// //       airTravelClass: row.airtravelclass,
// //       airFlightType: row.airflighttype,
// //       taxiPassengers: row.taxipassengers ? Number(row.taxipassengers) : 0,
// //       taxiDistanceKm: row.taxidistancekm ? Number(row.taxidistancekm) : 0,
// //       taxiType: row.taxitype,
// //       busPassengers: row.buspassengers ? Number(row.buspassengers) : 0,
// //       busDistanceKm: row.busdistancekm ? Number(row.busdistancekm) : 0,
// //       busType: row.bustype,
// //       trainPassengers: row.trainpassengers ? Number(row.trainpassengers) : 0,
// //       trainDistanceKm: row.traindistancekm ? Number(row.traindistancekm) : 0,
// //       trainType: row.traintype,
// //     });

// //     const capitalizeFirstLetter = (text) => {
// //       if (!text) return "";
// //       return text.charAt(0).toUpperCase() + text.slice(1);
// //     };

// //     return {
// //       buildingCode: row.buildingcode,
// //       stakeholder: row.stakeholder,
// //       fuelType: row.fueltype,
// //       fuel: row.fuel,
// //       totalFuelConsumption: row.totalfuelconsumption ? Number(row.totalfuelconsumption) : null,
// //       fuelConsumptionUnit: row.fuelconsumptionunit || null,
// //       totalGrossElectricityPurchased: row.totalgrosselectricitypurchased ? Number(row.totalgrosselectricitypurchased) : null,
// //       unit: row.unit || null,
// //       qualityControl: row.qualitycontrol,
// //       remarks: capitalizeFirstLetter(row.remarks || ''),
// //       postingDate: row.postingdate,
// //       calculatedEmissionKgCo2e: emission.totalEmissions_KgCo2e || 0,
// //       calculatedEmissionTCo2e: emission.totalEmissions_TCo2e || 0,
      
// //       // Travel fields
// //       didTravelByAir: !!(row.airpassengers || row.airdistancekm),
// //       airPassengers: row.airpassengers ? Number(row.airpassengers) : null,
// //       airDistanceKm: row.airdistancekm ? Number(row.airdistancekm) : null,
// //       airTravelClass: row.airtravelclass || null,
// //       airFlightType: row.airflighttype || null,
      
// //       didTravelByTaxi: !!(row.taxipassengers || row.taxidistancekm),
// //       taxiPassengers: row.taxipassengers ? Number(row.taxipassengers) : null,
// //       taxiDistanceKm: row.taxidistancekm ? Number(row.taxidistancekm) : null,
// //       taxiType: row.taxitype || null,
      
// //       didTravelByBus: !!(row.buspassengers || row.busdistancekm),
// //       busPassengers: row.buspassengers ? Number(row.buspassengers) : null,
// //       busDistanceKm: row.busdistancekm ? Number(row.busdistancekm) : null,
// //       busType: row.bustype || null,
      
// //       didTravelByTrain: !!(row.trainpassengers || row.traindistancekm),
// //       trainPassengers: row.trainpassengers ? Number(row.trainpassengers) : null,
// //       trainDistanceKm: row.traindistancekm ? Number(row.traindistancekm) : null,
// //       trainType: row.traintype || null,
// //     };
// //   }, []);

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

// //       data.forEach((row, index) => {
// //         const rowErrors = validateFuelAndEnergyRow(row, index);
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

// //       if (errors.length === 0) {
// //         toast.success(`CSV validated: ${data.length} rows ready for upload`);
// //       } else {
// //         toast.warning(`Found ${errors.length} validation errors. Please fix them before uploading.`);
// //       }

// //       return data;
// //     } catch (error) {
// //       toast.error(`Error parsing CSV: ${error.message}`);
// //       return null;
// //     }
// //   };

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
// //           const payload = transformFuelAndEnergyPayload(row);

// //           await axios.post(
// //             `${process.env.REACT_APP_BASE_URL}/Fuel-And-Energy/Create`,
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
// //           const errorMessage = error.response?.data?.message || error.message;
// //           results.errors.push({
// //             row: i + 1,
// //             error: errorMessage
// //           });
// //         }

// //         const currentProgress = Math.round(((i + 1) / totalRows) * 100);
// //         const isLastRow = i === totalRows - 1;

// //         if (currentProgress % 10 === 0 || isLastRow) {
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
// //       }, 2000);

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

// //   const downloadFuelAndEnergyTemplate = () => {
// //     const exampleBuildings = buildings.slice(0, 1);
// //     const exampleBuildingCode = exampleBuildings[0]?.buildingCode || 'BLD-EXAMPLE-001';
    
// //     const exampleStakeholder = stakeholderOptions[0]?.value || 'Assembly';
// //     const exampleFuelType = 'Gaseous Fuel';
// //     const exampleFuel = 'Natural Gas';
// //     const exampleFuelUnit = 'm3';
// //     const exampleElectricityUnit = 'kWh';
// //     const exampleQC = 'Good';
// //     const exampleFlightType = 'Domestic';
// //     const exampleTravelClass = 'Average passenger';
// //     const exampleTaxiType = 'Regular taxi';
// //     const exampleBusType = 'Local Bus';
// //     const exampleTrainType = '';

// //     const template = `building code,stakeholder,fuel type,fuel,total fuel consumption,fuel consumption unit,total purchased electricity (grid / supplier specific / ppa),unit,quality control,remarks,posting date,air passengers,air distance km,air travel class,air flight type,taxi passengers,taxi distance km,taxi type,bus passengers,bus distance km,bus type,train passengers,train distance km,train type
// // ${exampleBuildingCode},${exampleStakeholder},${exampleFuelType},${exampleFuel},100,${exampleFuelUnit},500,${exampleElectricityUnit},${exampleQC},Example record,dd/mm/yyyy,2,1000,${exampleTravelClass},${exampleFlightType},1,50,${exampleTaxiType},10,100,${exampleBusType},5,200,${exampleTrainType}`;

// //     const blob = new Blob([template], { type: 'text/csv' });
// //     const url = URL.createObjectURL(blob);
// //     const a = document.createElement('a');
// //     a.href = url;
// //     a.download = 'fuel_energy_template.csv';
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
// //     downloadFuelAndEnergyTemplate,
// //   };
// // };

// // export default useFuelAndEnergyCSVUpload;


// // hooks/scope3/useFuelAndEnergyCSVUpload.js
// import { useState, useCallback } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { calculateFuelAndEnergy } from '@/utils/Scope3/calculateFuelAndEnergy';

// import {
//     fuelUnitOptionsByName, fuelEnergyTypes, fuelEnergyTypesChildTypes, AIR_TRAVEL_OPTIONS, AIR_FLIGHT_TYPES, TAXI_TYPES, BUS_TYPES, TRAIN_TYPES,
// } from "@/constant/scope3/fuelAndEnergy";
// import { stakeholderOptions, units, } from "@/constant/scope3/options";
// import { qualityControlOptions } from "@/constant/scope1/options";


// const electricityUnits=[
//     {value:'kWh', label:'kWh'},
//     {value:'MWh', label:'MWh'},
// ];

// const useFuelAndEnergyCSVUpload = (buildings = []) => {
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

//           // Get header row (first line)
//           const headerRowIndex = 0;
//           const headerValues = parseCSVLine(lines[headerRowIndex]);
          
//           console.log('Original headers:', headerValues);

//           // Create a mapping for special headers
//           const specialHeaderMapping = {
//             'totalpurchasedelectricitygridsupplierspecificppa': 'totalgrosselectricitypurchased',
//             'totalpurchasedelectricity': 'totalgrosselectricitypurchased',
//             'totalgrosselectricitypurchased': 'totalgrosselectricitypurchased',
//           };

//           // Normalize headers for checking
//           const normalizedHeaders = headerValues.map(h => 
//             h.toLowerCase().replace(/[^a-z0-9]/g, '')
//           );

//           console.log('Normalized headers:', normalizedHeaders);

//           // Check for required fields using flexible matching
//           const requiredChecks = [
//             { field: 'buildingcode', alternatives: ['buildingcode', 'building'] },
//             { field: 'stakeholder', alternatives: ['stakeholder', 'stakeholderdepartment', 'department'] },
//             { field: 'fueltype', alternatives: ['fueltype', 'fueltype'] },
//             { field: 'fuel', alternatives: ['fuel', 'fuelname'] },
//             { field: 'qualitycontrol', alternatives: ['qualitycontrol', 'quality'] },
//           ];

//           const missingFields = [];
//           requiredChecks.forEach(check => {
//             const found = check.alternatives.some(alt => 
//               normalizedHeaders.some(h => h.includes(alt))
//             );
//             if (!found) {
//               missingFields.push(check.field);
//             }
//           });

//           // Special check for electricity field (can have friendly name)
//           const hasElectricityField = normalizedHeaders.some(h => 
//             h.includes('totalpurchasedelectricity') || 
//             h.includes('totalgrosselectricity') ||
//             h.includes('electricitypurchased')
//           );

//           if (!hasElectricityField) {
//             missingFields.push('totalgrosselectricitypurchased (or similar)');
//           }

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
            
//             // Use original headers to preserve the friendly names
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

//   const validateFuelAndEnergyRow = useCallback((row, index) => {
//     const errors = [];
    
//     // ADD HEADER MAPPING FOR FRIENDLY HEADERS
//     const headerMapping = {
//       'totalpurchasedelectricitygridsupplierspecificppa': 'totalgrosselectricitypurchased',
//       'totalpurchasedelectricity': 'totalgrosselectricitypurchased',
//       'totalgrosselectricitypurchased': 'totalgrosselectricitypurchased',
//       'didtravelbyair': 'didtravelbyair',
//       'didtravelbytaxi': 'didtravelbytaxi',
//       'didtravelbybus': 'didtravelbybus',
//       'didtravelbytrain': 'didtravelbytrain',

//       // Air travel fields
//     'noofpassengerair': 'airpassengers',
//     'distancetravelledair': 'airdistancekm',    
//     'travelclass': 'airtravelclass',
//     'flighttype': 'airflighttype',
    
//     // Taxi travel fields
//     'noofpassengertaxi': 'taxipassengers',
//     'distancetravelledtaxi': 'taxidistancekm',
//     'taxitype': 'taxitype',
    
//     // Bus travel fields
//     'noofpassengerbus': 'buspassengers',
//     'distancetravelledbus': 'busdistancekm',
//     'bustype': 'bustype',
    
//     // Train travel fields
//     'noofpassengertrain': 'trainpassengers',
//     'distancetravelledtrain': 'traindistancekm',
//     'traintype': 'traintype',
//     };

//     const cleanedRow = {};
    
//     // USE MAPPED VERSION
//     Object.keys(row).forEach(key => {
//       const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
//       const mappedKey = headerMapping[normalizedKey] || normalizedKey;
//       cleanedRow[mappedKey] = row[key]?.toString().trim();
//     });

//     // Required fields
//     const requiredFields = ['buildingcode', 'stakeholder', 'fueltype', 'fuel', 'qualitycontrol'];
//     requiredFields.forEach(field => {
//       if (!cleanedRow[field] || cleanedRow[field] === '') {
//         errors.push(`${field} is required`);
//       }
//     });

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

//     // Fuel Type validation
//     if (cleanedRow.fueltype) {
//       const validFuelTypes = fuelEnergyTypes.map(f => f.value);
//       const matchedFuelType = validFuelTypes.find(f =>
//         f.toLowerCase() === cleanedRow.fueltype.toLowerCase()
//       );
//       if (!matchedFuelType) {
//         errors.push(`Invalid fuel type "${cleanedRow.fueltype}"`);
//       } else {
//         cleanedRow.fueltype = matchedFuelType;
//       }
//     }

//     // Fuel Name validation
//     if (cleanedRow.fueltype && cleanedRow.fuel) {
//       const validFuels = fuelEnergyTypesChildTypes[cleanedRow.fueltype]?.map(f => f.value) || [];
//       const matchedFuel = validFuels.find(f =>
//         f.toLowerCase() === cleanedRow.fuel.toLowerCase()
//       );
//       if (!matchedFuel) {
//         errors.push(`Invalid fuel name "${cleanedRow.fuel}" for type "${cleanedRow.fueltype}"`);
//       } else {
//         cleanedRow.fuel = matchedFuel;
//       }
//     }

//     // Fuel Consumption validation
//     if (cleanedRow.totalfuelconsumption) {
//       const cleanNum = cleanedRow.totalfuelconsumption.toString()
//         .replace(/[^0-9.-]/g, '')
//         .replace(/^"+|"+$/g, '');

//       const num = Number(cleanNum);
//       if (isNaN(num)) {
//         errors.push(`Fuel consumption must be a number, got "${cleanedRow.totalfuelconsumption}"`);
//       } else if (num < 0) {
//         errors.push('Fuel consumption cannot be negative');
//       } else if (num > 1000000000) {
//         errors.push('Fuel consumption seems too large');
//       } else {
//         cleanedRow.totalfuelconsumption = num.toString();
//       }
//     }

//     // Fuel Consumption Unit validation
//     if (cleanedRow.totalfuelconsumption && cleanedRow.fuelconsumptionunit) {
//       const allUnits = [
//         ...fuelUnitOptionsByName.default,
//         ...(cleanedRow.fuel ? fuelUnitOptionsByName[cleanedRow.fuel] || [] : [])
//       ];

//       const cleanUnit = cleanedRow.fuelconsumptionunit.toLowerCase();
//       const matchedUnit = allUnits.find(u => u.toLowerCase() === cleanUnit);

//       if (!matchedUnit) {
//         errors.push(`Invalid fuel consumption unit "${cleanedRow.fuelconsumptionunit}"`);
//       } else {
//         cleanedRow.fuelconsumptionunit = matchedUnit;
//       }
//     }

//     // Electricity validation
//     if (cleanedRow.totalgrosselectricitypurchased) {
//       const cleanNum = cleanedRow.totalgrosselectricitypurchased.toString()
//         .replace(/[^0-9.-]/g, '')
//         .replace(/^"+|"+$/g, '');

//       const num = Number(cleanNum);
//       if (isNaN(num)) {
//         errors.push(`Electricity must be a number, got "${cleanedRow.totalgrosselectricitypurchased}"`);
//       } else if (num < 0) {
//         errors.push('Electricity cannot be negative');
//       } else {
//         cleanedRow.totalgrosselectricitypurchased = num.toString();
//       }
//     }

//     // Electricity Unit validation
//     if (cleanedRow.totalgrosselectricitypurchased && cleanedRow.unit) {
//       const validUnits = electricityUnits.map(u => u.value);
//       const matchedUnit = validUnits.find(u =>
//         u.toLowerCase() === cleanedRow.unit.toLowerCase()
//       );
//       if (!matchedUnit) {
//         errors.push(`Invalid electricity unit "${cleanedRow.unit}"`);
//       } else {
//         cleanedRow.unit = matchedUnit;
//       }
//     }

//     // At least one of fuel or electricity must be provided
//     const hasFuel = cleanedRow.totalfuelconsumption && cleanedRow.totalfuelconsumption !== '';
//     const hasElectricity = cleanedRow.totalgrosselectricitypurchased && cleanedRow.totalgrosselectricitypurchased !== '';
    
//     if (!hasFuel && !hasElectricity) {
//       errors.push('Either fuel consumption or electricity purchased must be provided');
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

//     // Check for explicit Yes/No values for travel options
//     const checkTravelOption = (field, passengers, distance, type, typeFields = []) => {
//       if (cleanedRow[field]) {
//         const value = cleanedRow[field].toLowerCase();
//         const isSelected = value === 'yes' || value === 'true' || value === '1';
        
//         if (isSelected) {
//           if (!passengers) errors.push(`${field.replace('didtravelby', '')} passengers required when travel is Yes`);
//           if (!distance) errors.push(`${field.replace('didtravelby', '')} distance required when travel is Yes`);
//           if (type && !type) errors.push(`${field.replace('didtravelby', '')} type required when travel is Yes`);
//           typeFields.forEach(t => {
//             if (!cleanedRow[t]) errors.push(`${t} required when travel is Yes`);
//           });
//         }
//       }
//     };

//     checkTravelOption('didtravelbyair', cleanedRow.airpassengers, cleanedRow.airdistancekm, cleanedRow.airtravelclass, ['airflighttype']);
//     checkTravelOption('didtravelbytaxi', cleanedRow.taxipassengers, cleanedRow.taxidistancekm, cleanedRow.taxitype);
//     checkTravelOption('didtravelbybus', cleanedRow.buspassengers, cleanedRow.busdistancekm, cleanedRow.bustype);
//     checkTravelOption('didtravelbytrain', cleanedRow.trainpassengers, cleanedRow.traindistancekm, cleanedRow.traintype);

//     // Travel field validations (if data present)
//     if (cleanedRow.airpassengers || cleanedRow.airdistancekm) {
//       if (!cleanedRow.airpassengers) errors.push('Air passengers required when air distance provided');
//       if (!cleanedRow.airdistancekm) errors.push('Air distance required when air passengers provided');
//       if (cleanedRow.airpassengers) {
//         const num = Number(cleanedRow.airpassengers.replace(/[^0-9.-]/g, ''));
//         if (isNaN(num) || num < 0) errors.push('Air passengers must be a positive number');
//       }
//       if (cleanedRow.airdistancekm) {
//         const num = Number(cleanedRow.airdistancekm.replace(/[^0-9.-]/g, ''));
//         if (isNaN(num) || num < 0) errors.push('Air distance must be a positive number');
//       }
//     }

//     if (cleanedRow.airflighttype) {
//       const validFlightTypes = AIR_FLIGHT_TYPES.map(f => f.value);
//       if (!validFlightTypes.includes(cleanedRow.airflighttype)) {
//         errors.push(`Invalid air flight type "${cleanedRow.airflighttype}"`);
//       }
//     }

//     if (cleanedRow.airtravelclass && cleanedRow.airflighttype) {
//       const validClasses = AIR_TRAVEL_OPTIONS[cleanedRow.airflighttype]?.map(c => c.value) || [];
//       if (!validClasses.includes(cleanedRow.airtravelclass)) {
//         errors.push(`Invalid travel class "${cleanedRow.airtravelclass}" for ${cleanedRow.airflighttype}`);
//       }
//     }

//     // Taxi validations
//     if (cleanedRow.taxipassengers || cleanedRow.taxidistancekm) {
//       if (!cleanedRow.taxipassengers) errors.push('Taxi passengers required when taxi distance provided');
//       if (!cleanedRow.taxidistancekm) errors.push('Taxi distance required when taxi passengers provided');
//     }

//     if (cleanedRow.taxitype) {
//       const validTaxiTypes = TAXI_TYPES.map(t => t.value);
//       if (!validTaxiTypes.includes(cleanedRow.taxitype)) {
//         errors.push(`Invalid taxi type "${cleanedRow.taxitype}"`);
//       }
//     }

//     // Bus validations
//     if (cleanedRow.buspassengers || cleanedRow.busdistancekm) {
//       if (!cleanedRow.buspassengers) errors.push('Bus passengers required when bus distance provided');
//       if (!cleanedRow.busdistancekm) errors.push('Bus distance required when bus passengers provided');
//     }

//     if (cleanedRow.bustype) {
//       const validBusTypes = BUS_TYPES.map(b => b.value);
//       if (!validBusTypes.includes(cleanedRow.bustype)) {
//         errors.push(`Invalid bus type "${cleanedRow.bustype}"`);
//       }
//     }

//     // Train validations
//     if (cleanedRow.trainpassengers || cleanedRow.traindistancekm) {
//       if (!cleanedRow.trainpassengers) errors.push('Train passengers required when train distance provided');
//       if (!cleanedRow.traindistancekm) errors.push('Train distance required when train passengers provided');
//     }

//     if (cleanedRow.traintype) {
//       const validTrainTypes = TRAIN_TYPES.map(t => t.value);
//       if (!validTrainTypes.includes(cleanedRow.traintype)) {
//         errors.push(`Invalid train type "${cleanedRow.traintype}"`);
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
//     } else {
//       cleanedRow.postingdate = new Date(
//         Date.UTC(
//           new Date().getFullYear(),
//           new Date().getMonth(),
//           new Date().getDate(),
//           0, 0, 0, 0
//         )
//       ).toISOString();
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

//   const transformFuelAndEnergyPayload = useCallback((row) => {
//     const emission = calculateFuelAndEnergy({
//       fuelType: row.fueltype,
//       fuel: row.fuel,
//       totalFuelConsumption: row.totalfuelconsumption ? Number(row.totalfuelconsumption) : 0,
//       fuelConsumptionUnit: row.fuelconsumptionunit,
//       totalGrossElectricityPurchased: row.totalgrosselectricitypurchased ? Number(row.totalgrosselectricitypurchased) : 0,
//       unit: row.unit,
//       airPassengers: row.airpassengers ? Number(row.airpassengers) : 0,
//       airDistanceKm: row.airdistancekm ? Number(row.airdistancekm) : 0,
//       airTravelClass: row.airtravelclass,
//       airFlightType: row.airflighttype,
//       taxiPassengers: row.taxipassengers ? Number(row.taxipassengers) : 0,
//       taxiDistanceKm: row.taxidistancekm ? Number(row.taxidistancekm) : 0,
//       taxiType: row.taxitype,
//       busPassengers: row.buspassengers ? Number(row.buspassengers) : 0,
//       busDistanceKm: row.busdistancekm ? Number(row.busdistancekm) : 0,
//       busType: row.bustype,
//       trainPassengers: row.trainpassengers ? Number(row.trainpassengers) : 0,
//       trainDistanceKm: row.traindistancekm ? Number(row.traindistancekm) : 0,
//       trainType: row.traintype,
//     });

//     const capitalizeFirstLetter = (text) => {
//       if (!text) return "";
//       return text.charAt(0).toUpperCase() + text.slice(1);
//     };

//     // Helper function to determine if a travel option was selected
//     const isTravelSelected = (passengers, distance, type, explicitFlag) => {
//       // First check if there's an explicit flag (Yes/No)
//       if (explicitFlag !== undefined) {
//         const flagValue = explicitFlag.toString().toLowerCase();
//         if (flagValue === 'yes' || flagValue === 'true' || flagValue === '1') {
//           return true;
//         }
//         if (flagValue === 'no' || flagValue === 'false' || flagValue === '0') {
//           return false;
//         }
//       }
//       // Otherwise, check if ANY of the fields have values
//       return !!(passengers || distance || type);
//     };

//     return {
//       buildingCode: row.buildingcode,
//       stakeholder: row.stakeholder,
//       fuelType: row.fueltype,
//       fuel: row.fuel,
//       totalFuelConsumption: row.totalfuelconsumption ? Number(row.totalfuelconsumption) : null,
//       fuelConsumptionUnit: row.fuelconsumptionunit || null,
//       totalGrossElectricityPurchased: row.totalgrosselectricitypurchased ? Number(row.totalgrosselectricitypurchased) : null,
//       unit: row.unit || null,
//       qualityControl: row.qualitycontrol,
//       remarks: capitalizeFirstLetter(row.remarks || ''),
//       postingDate: row.postingdate,
//       calculatedEmissionKgCo2e: emission.totalEmissions_KgCo2e || 0,
//       calculatedEmissionTCo2e: emission.totalEmissions_TCo2e || 0,
      
//       // Travel fields - use explicit flags if available
//       didTravelByAir: isTravelSelected(row.airpassengers, row.airdistancekm, row.airtravelclass, row.didtravelbyair),
//       airPassengers: row.airpassengers ? Number(row.airpassengers) : null,
//       airDistanceKm: row.airdistancekm ? Number(row.airdistancekm) : null,
//       airTravelClass: row.airtravelclass || null,
//       airFlightType: row.airflighttype || null,
      
//       didTravelByTaxi: isTravelSelected(row.taxipassengers, row.taxidistancekm, row.taxitype, row.didtravelbytaxi),
//       taxiPassengers: row.taxipassengers ? Number(row.taxipassengers) : null,
//       taxiDistanceKm: row.taxidistancekm ? Number(row.taxidistancekm) : null,
//       taxiType: row.taxitype || null,
      
//       didTravelByBus: isTravelSelected(row.buspassengers, row.busdistancekm, row.bustype, row.didtravelbybus),
//       busPassengers: row.buspassengers ? Number(row.buspassengers) : null,
//       busDistanceKm: row.busdistancekm ? Number(row.busdistancekm) : null,
//       busType: row.bustype || null,
      
//       didTravelByTrain: isTravelSelected(row.trainpassengers, row.traindistancekm, row.traintype, row.didtravelbytrain),
//       trainPassengers: row.trainpassengers ? Number(row.trainpassengers) : null,
//       trainDistanceKm: row.traindistancekm ? Number(row.traindistancekm) : null,
//       trainType: row.traintype || null,
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

//       data.forEach((row, index) => {
//         const rowErrors = validateFuelAndEnergyRow(row, index);
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
//           const payload = transformFuelAndEnergyPayload(row);

//           await axios.post(
//             `${process.env.REACT_APP_BASE_URL}/Fuel-And-Energy/Create`,
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

//   const downloadFuelAndEnergyTemplate = () => {
//     const exampleBuildings = buildings.slice(0, 1);
//     const exampleBuildingCode = exampleBuildings[0]?.buildingCode || 'BLD-EXAMPLE-001';
    
//     const exampleStakeholder = stakeholderOptions[0]?.value || 'Assembly';
//     const exampleFuelType = 'Gaseous Fuel';
//     const exampleFuel = 'Natural Gas';
//     const exampleFuelUnit = 'm3';
//     const exampleElectricityUnit = 'kWh';
//     const exampleQC = 'Good';
//     const exampleFlightType = 'Domestic';
//     const exampleTravelClass = 'Average passenger';
//     const exampleTaxiType = 'Regular taxi';
//     const exampleBusType = 'Local Bus';
//     const exampleTrainType = 'National rail';

//     // Get current date in DD/MM/YYYY format
//     const currentDate = new Date();
//     const day = String(currentDate.getDate()).padStart(2, '0');
//     const month = String(currentDate.getMonth() + 1).padStart(2, '0');
//     const year = currentDate.getFullYear();
//     const formattedDate = `${day}/${month}/${year}`;

//     // USING FRIENDLY HEADER for electricity field
//     const template = `building code,stakeholder,fuel type,fuel,total fuel consumption,fuel consumption unit,Total Purchased Electricity (Grid / Supplier Specific / PPA),unit,quality control,remarks,posting date,did travel by air,no of passenger (air),distance travelled (air),travel class,flight type,did travel by taxi,no of passenger (taxi),distance travelled (taxi),taxi type,did travel by bus,no of passenger (bus),distance travelled (bus),bus type,did travel by train,no of passenger (train),distance travelled (train),train type
// ${exampleBuildingCode},${exampleStakeholder},${exampleFuelType},${exampleFuel},100,${exampleFuelUnit},500,${exampleElectricityUnit},${exampleQC},Example record,${formattedDate},Yes,2,1000,${exampleTravelClass},${exampleFlightType},No,0,0,,No,0,0,,Yes,5,200,${exampleTrainType}`;

//   const BOM = '\uFEFF';
//   const blob = new Blob([BOM + template], { type: 'text/csv;charset=utf-8;' });    const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'fuel_energy_template.csv';
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
//     downloadFuelAndEnergyTemplate,
//   };
// };

// export default useFuelAndEnergyCSVUpload;


// hooks/scope3/useFuelAndEnergyCSVUpload.js
import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as XLSX from "xlsx";
import { calculateFuelAndEnergy } from '@/utils/Scope3/calculateFuelAndEnergy';

import {
    fuelUnitOptionsByName, fuelEnergyTypes, fuelEnergyTypesChildTypes, AIR_TRAVEL_OPTIONS, AIR_FLIGHT_TYPES, TAXI_TYPES, BUS_TYPES, TRAIN_TYPES,
} from "@/constant/scope3/fuelAndEnergy";
import { stakeholderOptions, units, } from "@/constant/scope3/options";
import { qualityControlOptions } from "@/constant/scope1/options";


const electricityUnits = [
    { value: 'kWh', label: 'kWh' },
    { value: 'MWh', label: 'MWh' },
];

const useFuelAndEnergyCSVUpload = (buildings = []) => {
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
          
          console.log('Original headers:', headerValues);

          const specialHeaderMapping = {
            'totalpurchasedelectricitygridsupplierspecificppa': 'totalgrosselectricitypurchased',
            'totalpurchasedelectricity': 'totalgrosselectricitypurchased',
            'totalgrosselectricitypurchased': 'totalgrosselectricitypurchased',
          };

          const normalizedHeaders = headerValues.map(h => 
            h.toLowerCase().replace(/[^a-z0-9]/g, '')
          );

          console.log('Normalized headers:', normalizedHeaders);

          const requiredChecks = [
            { field: 'buildingcode', alternatives: ['buildingcode', 'building'] },
            { field: 'stakeholder', alternatives: ['stakeholder', 'stakeholderdepartment', 'department'] },
            { field: 'fueltype', alternatives: ['fueltype', 'fueltype'] },
            { field: 'fuel', alternatives: ['fuel', 'fuelname'] },
            { field: 'qualitycontrol', alternatives: ['qualitycontrol', 'quality'] },
          ];

          const missingFields = [];
          requiredChecks.forEach(check => {
            const found = check.alternatives.some(alt => 
              normalizedHeaders.some(h => h.includes(alt))
            );
            if (!found) {
              missingFields.push(check.field);
            }
          });

          const hasElectricityField = normalizedHeaders.some(h => 
            h.includes('totalpurchasedelectricity') || 
            h.includes('totalgrosselectricity') ||
            h.includes('electricitypurchased')
          );

          if (!hasElectricityField) {
            missingFields.push('totalgrosselectricitypurchased (or similar)');
          }

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

          const normalizedHeaders = headerValues.map(h => 
            h ? h.toString().toLowerCase().replace(/[^a-z0-9]/g, '') : ''
          );

          console.log('Normalized Excel headers:', normalizedHeaders);

          const requiredChecks = [
            { field: 'buildingcode', alternatives: ['buildingcode', 'building'] },
            { field: 'stakeholder', alternatives: ['stakeholder', 'stakeholderdepartment', 'department'] },
            { field: 'fueltype', alternatives: ['fueltype', 'fueltype'] },
            { field: 'fuel', alternatives: ['fuel', 'fuelname'] },
            { field: 'qualitycontrol', alternatives: ['qualitycontrol', 'quality'] },
          ];

          const missingFields = [];
          requiredChecks.forEach(check => {
            const found = check.alternatives.some(alt => 
              normalizedHeaders.some(h => h.includes(alt))
            );
            if (!found) {
              missingFields.push(check.field);
            }
          });

          const hasElectricityField = normalizedHeaders.some(h => 
            h.includes('totalpurchasedelectricity') || 
            h.includes('totalgrosselectricity') ||
            h.includes('electricitypurchased')
          );

          if (!hasElectricityField) {
            missingFields.push('totalgrosselectricitypurchased (or similar)');
          }

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

 const validateFuelAndEnergyRow = useCallback((row, index) => {
  const errors = [];
  
  // ADD HEADER MAPPING FOR FRIENDLY HEADERS
  const headerMapping = {
    'totalpurchasedelectricitygridsupplierspecificppa': 'totalgrosselectricitypurchased',
    'totalpurchasedelectricity': 'totalgrosselectricitypurchased',
    'totalgrosselectricitypurchased': 'totalgrosselectricitypurchased',
    'didtravelbyair': 'didtravelbyair',
    'didtravelbytaxi': 'didtravelbytaxi',
    'didtravelbybus': 'didtravelbybus',
    'didtravelbytrain': 'didtravelbytrain',

    // Air travel fields
    'noofpassengerair': 'airpassengers',
    'distancetravelledair': 'airdistancekm',    
    'travelclass': 'airtravelclass',
    'flighttype': 'airflighttype',
    
    // Taxi travel fields
    'noofpassengertaxi': 'taxipassengers',
    'distancetravelledtaxi': 'taxidistancekm',
    'taxitype': 'taxitype',
    
    // Bus travel fields
    'noofpassengerbus': 'buspassengers',
    'distancetravelledbus': 'busdistancekm',
    'bustype': 'bustype',
    
    // Train travel fields
    'noofpassengertrain': 'trainpassengers',
    'distancetravelledtrain': 'traindistancekm',
    'traintype': 'traintype',
  };

  const cleanedRow = {};
  
  // USE MAPPED VERSION
  Object.keys(row).forEach(key => {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    const mappedKey = headerMapping[normalizedKey] || normalizedKey;
    cleanedRow[mappedKey] = row[key]?.toString().trim();
  });

  // Required fields
  const requiredFields = ['buildingcode', 'stakeholder', 'fueltype', 'fuel', 'qualitycontrol'];
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

  // Fuel Type validation
  if (cleanedRow.fueltype) {
    const validFuelTypes = fuelEnergyTypes.map(f => f.value);
    const matchedFuelType = validFuelTypes.find(f =>
      f.toLowerCase() === cleanedRow.fueltype.toLowerCase()
    );
    if (!matchedFuelType) {
      errors.push(`Invalid fuel type "${cleanedRow.fueltype}"`);
    } else {
      cleanedRow.fueltype = matchedFuelType;
    }
  }

  // Fuel Name validation
  if (cleanedRow.fueltype && cleanedRow.fuel) {
    const validFuels = fuelEnergyTypesChildTypes[cleanedRow.fueltype]?.map(f => f.value) || [];
    const matchedFuel = validFuels.find(f =>
      f.toLowerCase() === cleanedRow.fuel.toLowerCase()
    );
    if (!matchedFuel) {
      errors.push(`Invalid fuel name "${cleanedRow.fuel}" for type "${cleanedRow.fueltype}"`);
    } else {
      cleanedRow.fuel = matchedFuel;
    }
  }

  // Fuel Consumption validation
  if (cleanedRow.totalfuelconsumption) {
    const cleanNum = cleanedRow.totalfuelconsumption.toString()
      .replace(/[^0-9.-]/g, '')
      .replace(/^"+|"+$/g, '');

    const num = Number(cleanNum);
    if (isNaN(num)) {
      errors.push(`Fuel consumption must be a number, got "${cleanedRow.totalfuelconsumption}"`);
    } else if (num < 0) {
      errors.push('Fuel consumption cannot be negative');
    } else if (num > 1000000000) {
      errors.push('Fuel consumption seems too large');
    } else {
      cleanedRow.totalfuelconsumption = num.toString();
    }
  }

  // Fuel Consumption Unit validation
  if (cleanedRow.totalfuelconsumption && cleanedRow.fuelconsumptionunit) {
    const allUnits = [
      ...fuelUnitOptionsByName.default,
      ...(cleanedRow.fuel ? fuelUnitOptionsByName[cleanedRow.fuel] || [] : [])
    ];

    const cleanUnit = cleanedRow.fuelconsumptionunit.toLowerCase();
    const matchedUnit = allUnits.find(u => u.toLowerCase() === cleanUnit);

    if (!matchedUnit) {
      errors.push(`Invalid fuel consumption unit "${cleanedRow.fuelconsumptionunit}"`);
    } else {
      cleanedRow.fuelconsumptionunit = matchedUnit;
    }
  }

  // Electricity validation
  if (cleanedRow.totalgrosselectricitypurchased) {
    const cleanNum = cleanedRow.totalgrosselectricitypurchased.toString()
      .replace(/[^0-9.-]/g, '')
      .replace(/^"+|"+$/g, '');

    const num = Number(cleanNum);
    if (isNaN(num)) {
      errors.push(`Electricity must be a number, got "${cleanedRow.totalgrosselectricitypurchased}"`);
    } else if (num < 0) {
      errors.push('Electricity cannot be negative');
    } else {
      cleanedRow.totalgrosselectricitypurchased = num.toString();
    }
  }

  // Electricity Unit validation
  if (cleanedRow.totalgrosselectricitypurchased && cleanedRow.unit) {
    const validUnits = electricityUnits.map(u => u.value);
    const matchedUnit = validUnits.find(u =>
      u.toLowerCase() === cleanedRow.unit.toLowerCase()
    );
    if (!matchedUnit) {
      errors.push(`Invalid electricity unit "${cleanedRow.unit}"`);
    } else {
      cleanedRow.unit = matchedUnit;
    }
  }

  // At least one of fuel or electricity must be provided
  const hasFuel = cleanedRow.totalfuelconsumption && cleanedRow.totalfuelconsumption !== '';
  const hasElectricity = cleanedRow.totalgrosselectricitypurchased && cleanedRow.totalgrosselectricitypurchased !== '';
  
  if (!hasFuel && !hasElectricity) {
    errors.push('Either fuel consumption or electricity purchased must be provided');
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

  // Check for explicit Yes/No values for travel options
  const checkTravelOption = (field, passengers, distance, type, typeFields = []) => {
    if (cleanedRow[field]) {
      const value = cleanedRow[field].toLowerCase();
      const isSelected = value === 'yes' || value === 'true' || value === '1';
      
      if (isSelected) {
        if (!passengers) errors.push(`${field.replace('didtravelby', '')} passengers required when travel is Yes`);
        if (!distance) errors.push(`${field.replace('didtravelby', '')} distance required when travel is Yes`);
        if (type && !type) errors.push(`${field.replace('didtravelby', '')} type required when travel is Yes`);
        typeFields.forEach(t => {
          if (!cleanedRow[t]) errors.push(`${t} required when travel is Yes`);
        });
      }
    }
  };

  checkTravelOption('didtravelbyair', cleanedRow.airpassengers, cleanedRow.airdistancekm, cleanedRow.airtravelclass, ['airflighttype']);
  checkTravelOption('didtravelbytaxi', cleanedRow.taxipassengers, cleanedRow.taxidistancekm, cleanedRow.taxitype);
  checkTravelOption('didtravelbybus', cleanedRow.buspassengers, cleanedRow.busdistancekm, cleanedRow.bustype);
  checkTravelOption('didtravelbytrain', cleanedRow.trainpassengers, cleanedRow.traindistancekm, cleanedRow.traintype);

  // Travel field validations (if data present)
  if (cleanedRow.airpassengers || cleanedRow.airdistancekm) {
    if (!cleanedRow.airpassengers) errors.push('Air passengers required when air distance provided');
    if (!cleanedRow.airdistancekm) errors.push('Air distance required when air passengers provided');
    if (cleanedRow.airpassengers) {
      const num = Number(cleanedRow.airpassengers.replace(/[^0-9.-]/g, ''));
      if (isNaN(num) || num < 0) errors.push('Air passengers must be a positive number');
    }
    if (cleanedRow.airdistancekm) {
      const num = Number(cleanedRow.airdistancekm.replace(/[^0-9.-]/g, ''));
      if (isNaN(num) || num < 0) errors.push('Air distance must be a positive number');
    }
  }

  // Air flight type validation - case insensitive
  if (cleanedRow.airflighttype) {
    const validFlightTypes = AIR_FLIGHT_TYPES.map(f => f.value);
    const matchedFlightType = validFlightTypes.find(ft => 
      ft.toLowerCase() === cleanedRow.airflighttype.toLowerCase()
    );
    if (!matchedFlightType) {
      errors.push(`Invalid air flight type "${cleanedRow.airflighttype}"`);
    } else {
      cleanedRow.airflighttype = matchedFlightType;
    }
  }

  // Travel class validation - case insensitive
  if (cleanedRow.airtravelclass && cleanedRow.airflighttype) {
    const validClasses = AIR_TRAVEL_OPTIONS[cleanedRow.airflighttype]?.map(c => c.value) || [];
    const matchedClass = validClasses.find(c => 
      c.toLowerCase() === cleanedRow.airtravelclass.toLowerCase()
    );
    if (!matchedClass) {
      errors.push(`Invalid travel class "${cleanedRow.airtravelclass}" for ${cleanedRow.airflighttype}`);
    } else {
      cleanedRow.airtravelclass = matchedClass;
    }
  }

  // Taxi validations
  if (cleanedRow.taxipassengers || cleanedRow.taxidistancekm) {
    if (!cleanedRow.taxipassengers) errors.push('Taxi passengers required when taxi distance provided');
    if (!cleanedRow.taxidistancekm) errors.push('Taxi distance required when taxi passengers provided');
  }

  // Taxi type validation - case insensitive
  if (cleanedRow.taxitype) {
    const validTaxiTypes = TAXI_TYPES.map(t => t.value);
    const matchedTaxiType = validTaxiTypes.find(tt => 
      tt.toLowerCase() === cleanedRow.taxitype.toLowerCase()
    );
    if (!matchedTaxiType) {
      errors.push(`Invalid taxi type "${cleanedRow.taxitype}"`);
    } else {
      cleanedRow.taxitype = matchedTaxiType;
    }
  }

  // Bus validations
  if (cleanedRow.buspassengers || cleanedRow.busdistancekm) {
    if (!cleanedRow.buspassengers) errors.push('Bus passengers required when bus distance provided');
    if (!cleanedRow.busdistancekm) errors.push('Bus distance required when bus passengers provided');
  }

  // Bus type validation - case insensitive
  if (cleanedRow.bustype) {
    const validBusTypes = BUS_TYPES.map(b => b.value);
    const matchedBusType = validBusTypes.find(bt => 
      bt.toLowerCase() === cleanedRow.bustype.toLowerCase()
    );
    if (!matchedBusType) {
      errors.push(`Invalid bus type "${cleanedRow.bustype}"`);
    } else {
      cleanedRow.bustype = matchedBusType;
    }
  }

  // Train validations
  if (cleanedRow.trainpassengers || cleanedRow.traindistancekm) {
    if (!cleanedRow.trainpassengers) errors.push('Train passengers required when train distance provided');
    if (!cleanedRow.traindistancekm) errors.push('Train distance required when train passengers provided');
  }

  // Train type validation - case insensitive
  if (cleanedRow.traintype) {
    const validTrainTypes = TRAIN_TYPES.map(t => t.value);
    const matchedTrainType = validTrainTypes.find(tt => 
      tt.toLowerCase() === cleanedRow.traintype.toLowerCase()
    );
    if (!matchedTrainType) {
      errors.push(`Invalid train type "${cleanedRow.traintype}"`);
    } else {
      cleanedRow.traintype = matchedTrainType;
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

  const transformFuelAndEnergyPayload = useCallback((row) => {
    const emission = calculateFuelAndEnergy({
      fuelType: row.fueltype,
      fuel: row.fuel,
      totalFuelConsumption: row.totalfuelconsumption ? Number(row.totalfuelconsumption) : 0,
      fuelConsumptionUnit: row.fuelconsumptionunit,
      totalGrossElectricityPurchased: row.totalgrosselectricitypurchased ? Number(row.totalgrosselectricitypurchased) : 0,
      unit: row.unit,
      airPassengers: row.airpassengers ? Number(row.airpassengers) : 0,
      airDistanceKm: row.airdistancekm ? Number(row.airdistancekm) : 0,
      airTravelClass: row.airtravelclass,
      airFlightType: row.airflighttype,
      taxiPassengers: row.taxipassengers ? Number(row.taxipassengers) : 0,
      taxiDistanceKm: row.taxidistancekm ? Number(row.taxidistancekm) : 0,
      taxiType: row.taxitype,
      busPassengers: row.buspassengers ? Number(row.buspassengers) : 0,
      busDistanceKm: row.busdistancekm ? Number(row.busdistancekm) : 0,
      busType: row.bustype,
      trainPassengers: row.trainpassengers ? Number(row.trainpassengers) : 0,
      trainDistanceKm: row.traindistancekm ? Number(row.traindistancekm) : 0,
      trainType: row.traintype,
    });

    const capitalizeFirstLetter = (text) => {
      if (!text) return "";
      return text.charAt(0).toUpperCase() + text.slice(1);
    };

    const isTravelSelected = (passengers, distance, type, explicitFlag) => {
      if (explicitFlag !== undefined) {
        const flagValue = explicitFlag.toString().toLowerCase();
        if (flagValue === 'yes' || flagValue === 'true' || flagValue === '1') {
          return true;
        }
        if (flagValue === 'no' || flagValue === 'false' || flagValue === '0') {
          return false;
        }
      }
      return !!(passengers || distance || type);
    };

    return {
      buildingCode: row.buildingcode,
      stakeholder: row.stakeholder,
      fuelType: row.fueltype,
      fuel: row.fuel,
      totalFuelConsumption: row.totalfuelconsumption ? Number(row.totalfuelconsumption) : null,
      fuelConsumptionUnit: row.fuelconsumptionunit || null,
      totalGrossElectricityPurchased: row.totalgrosselectricitypurchased ? Number(row.totalgrosselectricitypurchased) : null,
      unit: row.unit || null,
      qualityControl: row.qualitycontrol,
      remarks: capitalizeFirstLetter(row.remarks || ''),
      postingDate: row.postingdate,
      calculatedEmissionKgCo2e: emission.totalEmissions_KgCo2e || 0,
      calculatedEmissionTCo2e: emission.totalEmissions_TCo2e || 0,
      
      didTravelByAir: isTravelSelected(row.airpassengers, row.airdistancekm, row.airtravelclass, row.didtravelbyair),
      airPassengers: row.airpassengers ? Number(row.airpassengers) : null,
      airDistanceKm: row.airdistancekm ? Number(row.airdistancekm) : null,
      airTravelClass: row.airtravelclass || null,
      airFlightType: row.airflighttype || null,
      
      didTravelByTaxi: isTravelSelected(row.taxipassengers, row.taxidistancekm, row.taxitype, row.didtravelbytaxi),
      taxiPassengers: row.taxipassengers ? Number(row.taxipassengers) : null,
      taxiDistanceKm: row.taxidistancekm ? Number(row.taxidistancekm) : null,
      taxiType: row.taxitype || null,
      
      didTravelByBus: isTravelSelected(row.buspassengers, row.busdistancekm, row.bustype, row.didtravelbybus),
      busPassengers: row.buspassengers ? Number(row.buspassengers) : null,
      busDistanceKm: row.busdistancekm ? Number(row.busdistancekm) : null,
      busType: row.bustype || null,
      
      didTravelByTrain: isTravelSelected(row.trainpassengers, row.traindistancekm, row.traintype, row.didtravelbytrain),
      trainPassengers: row.trainpassengers ? Number(row.trainpassengers) : null,
      trainDistanceKm: row.traindistancekm ? Number(row.traindistancekm) : null,
      trainType: row.traintype || null,
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
        const rowErrors = validateFuelAndEnergyRow(row, index);
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
          const payload = transformFuelAndEnergyPayload(row);

          await axios.post(
            `${process.env.REACT_APP_BASE_URL}/Fuel-And-Energy/Create`,
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

  const downloadFuelAndEnergyTemplate = useCallback(() => {
    const exampleBuildings = buildings.slice(0, 1);
    const exampleBuildingCode = exampleBuildings[0]?.buildingCode || 'BLD-EXAMPLE-001';
    
    const exampleStakeholder = stakeholderOptions[0]?.value || 'Assembly';
    const exampleFuelType = 'Gaseous Fuel';
    const exampleFuel = 'Natural Gas';
    const exampleFuelUnit = 'm3';
    const exampleElectricityUnit = 'kWh';
    const exampleQC = 'Good';
    const exampleFlightType = 'Domestic';
    const exampleTravelClass = 'Average passenger';
    const exampleTaxiType = 'Regular taxi';
    const exampleBusType = 'Local Bus';
    const exampleTrainType = 'National rail';

    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    const headers = [
      'building code',
      'stakeholder',
      'fuel type',
      'fuel',
      'total fuel consumption',
      'fuel consumption unit',
      'Total Purchased Electricity (Grid / Supplier Specific / PPA)',
      'unit',
      'quality control',
      'remarks',
      'posting date',
      'did you have any business travel by air during the reporting period?',
      'no of passenger (air)',
      'distance travelled (air)',
      'travel class',
      'flight type',
      'did you have any business travel by taxi during the reporting period?',
      'no of passenger (taxi)',
      'distance travelled (taxi)',
      'taxi type',
      'did you have any business travel by bus during the reporting period?',
      'no of passenger (bus)',
      'distance travelled (bus)',
      'bus type',
      'did you have any business travel by train during the reporting period?',
      'no of passenger (train)',
      'distance travelled (train)',
      'train type'
    ];

    const exampleRow = [
      exampleBuildingCode,
      exampleStakeholder,
      exampleFuelType,
      exampleFuel,
      '100',
      exampleFuelUnit,
      '500',
      exampleElectricityUnit,
      exampleQC,
      'Example record',
      formattedDate,
      'Yes',
      '2',
      '1000',
      exampleTravelClass,
      exampleFlightType,
      'No',
      '0',
      '0',
      '',
      'No',
      '0',
      '0',
      '',
      'Yes',
      '5',
      '200',
      exampleTrainType
    ];

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
      wch: Math.min(Math.max(header.length, 15), 45)
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fuel & Energy Template');

    // Download the Excel file
    XLSX.writeFile(workbook, 'fuel_energy_template.xlsx');
  }, [buildings]);

  return {
    csvState,
    handleFileSelect,
    processUpload,
    resetUpload,
    downloadFuelAndEnergyTemplate,
  };
};

export default useFuelAndEnergyCSVUpload;

