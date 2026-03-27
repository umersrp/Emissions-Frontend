// // hooks/scope3/useBusinessTravelCSVUpload.js
// import { useState, useCallback } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { calculateBusinessTravel } from '@/utils/Scope3/calculateBusinessTravel';
// // import {
// //   travelClassOptions,
// //   flightTypeOptions,
// //   motorbikeTypeOptions,
// //   taxiTypeOptions,
// //   busTypeOptions,
// //   trainTypeOptions,
// //   carTypeOptions,
// //   carFuelTypeOptions,
// //   stakeholderDepartmentOptions,
// //   processQualityControlOptions,
// // } from '@/constant/scope3/businessTravelConstants';
// import {
//   travelClassOptions,
//   flightTypeOptions,
//   motorbikeTypeOptions,
//   taxiTypeOptions,
//   busTypeOptions,
//   trainTypeOptions,
//   carTypeOptions,
//   carFuelTypeOptions,
// } from "@/constant/scope3/businessTravel";
// import {
//   stakeholderDepartmentOptions,
//   processQualityControlOptions,
// } from "@/constant/scope1/options";

// const useBusinessTravelCSVUpload = (buildings = []) => {
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
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = (event) => {
//       try {
//         const csvText = event.target.result;

//         const parseCSVLine = (line) => {
//           const result = [];
//           let current = '';
//           let inQuotes = false;

//           for (let i = 0; i < line.length; i++) {
//             const char = line[i];
//             const nextChar = line[i + 1];

//             if (char === '"') {
//               if (inQuotes && nextChar === '"') {
//                 current += '"';
//                 i++;
//               } else {
//                 inQuotes = !inQuotes;
//               }
//             } else if (char === ',' && !inQuotes) {
//               result.push(current);
//               current = '';
//             } else {
//               current += char;
//             }
//           }

//           result.push(current);
//           return result;
//         };

//         const lines = csvText.split('\n').filter(line => line.trim() !== '');

//         if (lines.length === 0) {
//           reject(new Error('CSV file is empty'));
//           return;
//         }

//         // First, let's log the headers to see what we're getting
//         console.log('First line of CSV:', lines[0]);

//         // Find header row - be more flexible
//         let headerRowIndex = 0; // Assume first row is header

//         const headerValues = parseCSVLine(lines[headerRowIndex]);
//         console.log('Parsed headers:', headerValues);

//         // Create normalized headers (remove quotes, trim, lowercase, remove special chars)
//         const headers = headerValues.map(h => {
//           const cleaned = cleanCSVValue(h)
//             .toLowerCase()
//             .replace(/[^a-z0-9]/g, ''); // Remove all non-alphanumeric characters
//           return cleaned;
//         });

//         console.log('Normalized headers:', headers);

//         // Expected core headers (the absolute minimum required)
//         const requiredCoreHeaders = ['buildingcode', 'stakeholder'];
        
//         // Check if we have the core required headers
//         const missingCoreHeaders = requiredCoreHeaders.filter(h => !headers.includes(h));
        
//         if (missingCoreHeaders.length > 0) {
//           // Try alternative header matching - maybe the headers have spaces or different casing
//           const alternativeHeaders = headerValues.map(h => {
//             return cleanCSVValue(h)
//               .toLowerCase()
//               .replace(/\s+/g, ''); // Remove spaces only
//           });
          
//           console.log('Alternative headers (spaces removed):', alternativeHeaders);
          
//           const stillMissing = requiredCoreHeaders.filter(h => !alternativeHeaders.includes(h));
          
//           if (stillMissing.length > 0) {
//             reject(new Error(`CSV must contain at least these columns: building code, stakeholder. Found: ${headerValues.join(', ')}`));
//             return;
//           } else {
//             // Use the alternative headers
//             headers.length = 0;
//             headers.push(...alternativeHeaders);
//           }
//         }

//         const data = [];
//         for (let i = headerRowIndex + 1; i < lines.length; i++) {
//           const line = lines[i].trim();
//           if (!line) continue;

//           const values = parseCSVLine(line);
//           const row = {};
          
//           headers.forEach((header, index) => {
//             row[header] = index < values.length ? cleanCSVValue(values[index]) : '';
//           });

//           // Only add row if it has some data
//           if (Object.values(row).some(val => val && val.toString().trim() !== '')) {
//             data.push(row);
//           }
//         }

//         console.log('Parsed CSV data:', data); // Debug log
//         resolve(data);
//       } catch (error) {
//         console.error('CSV parsing error:', error);
//         reject(new Error(`Error parsing CSV: ${error.message}`));
//       }
//     };
//     reader.onerror = () => reject(new Error('Failed to read file'));
//     reader.readAsText(file);
//   });
// }, [cleanCSVValue]);

//   const validateBusinessTravelRow = useCallback((row, index) => {
//     const errors = [];
//     const cleanedRow = {};

//     // Clean all row values
//     Object.keys(row).forEach(key => {
//       cleanedRow[key] = row[key]?.toString().trim() || '';
//     });

//     console.log(`Validating row ${index + 1}:`, cleanedRow); // Debug log

//     // Required fields validation
//     if (!cleanedRow.buildingcode) errors.push('buildingcode is required');
//     if (!cleanedRow.stakeholder) errors.push('stakeholder is required');
//     if (!cleanedRow.qualitycontrol) errors.push('qualitycontrol is required');
//     if (!cleanedRow.postingdate) errors.push('postingdate is required');

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
//       const matchedStakeholder = validStakeholders.find(s =>
//         s.toLowerCase() === cleanedRow.stakeholder.toLowerCase()
//       );
//       if (!matchedStakeholder) {
//         errors.push(`Invalid stakeholder "${cleanedRow.stakeholder}"`);
//       } else {
//         cleanedRow.stakeholder = matchedStakeholder;
//       }
//     }

//     // Quality Control validation
//     if (cleanedRow.qualitycontrol) {
//       const validQC = processQualityControlOptions.map(q => q.value);
//       const matchedQC = validQC.find(q =>
//         q.toLowerCase() === cleanedRow.qualitycontrol.toLowerCase()
//       );
//       if (!matchedQC) {
//         errors.push(`Invalid quality control "${cleanedRow.qualitycontrol}"`);
//       } else {
//         cleanedRow.qualitycontrol = matchedQC;
//       }
//     }

//     // Boolean fields - convert string to boolean
//     const booleanFields = [
//       'travelbyair', 'travelbymotorbike', 'travelbytaxi', 
//       'travelbybus', 'travelbytrain', 'travelbycar', 'hotelstay'
//     ];
    
//     booleanFields.forEach(field => {
//       if (cleanedRow[field]) {
//         const value = cleanedRow[field].toLowerCase();
//         cleanedRow[field] = value === 'yes' || value === 'true' || value === '1';
//       } else {
//         cleanedRow[field] = false;
//       }
//     });

//     // Check if at least one travel option is selected
//     const anyTravelSelected = 
//       cleanedRow.travelbyair || 
//       cleanedRow.travelbymotorbike || 
//       cleanedRow.travelbytaxi || 
//       cleanedRow.travelbybus || 
//       cleanedRow.travelbytrain || 
//       cleanedRow.travelbycar || 
//       cleanedRow.hotelstay;

//     if (!anyTravelSelected) {
//       errors.push('At least one travel option must be selected');
//     }

//     // Air Travel validation
//     if (cleanedRow.travelbyair) {
//       // Passengers validation
//       if (!cleanedRow.airpassengers) {
//         errors.push('airpassengers is required when air travel is selected');
//       } else {
//         const passengers = Number(cleanedRow.airpassengers.replace(/[^0-9.-]/g, ''));
//         if (isNaN(passengers) || passengers <= 0) {
//           errors.push('airpassengers must be a positive number');
//         } else {
//           cleanedRow.airpassengers = passengers.toString();
//         }
//       }

//       // Distance validation
//       if (!cleanedRow.airdistancekm) {
//         errors.push('airdistancekm is required when air travel is selected');
//       } else {
//         const distance = Number(cleanedRow.airdistancekm.replace(/[^0-9.-]/g, ''));
//         if (isNaN(distance) || distance <= 0) {
//           errors.push('airdistancekm must be a positive number');
//         } else {
//           cleanedRow.airdistancekm = distance.toString();
//         }
//       }

//       // Travel class validation
//       if (!cleanedRow.airtravelclass) {
//         errors.push('airtravelclass is required when air travel is selected');
//       } else {
//         const validClasses = travelClassOptions.map(t => t.value);
//         const matchedClass = validClasses.find(c => 
//           c.toLowerCase() === cleanedRow.airtravelclass.toLowerCase()
//         );
//         if (!matchedClass) {
//           errors.push(`Invalid airtravelclass "${cleanedRow.airtravelclass}"`);
//         } else {
//           cleanedRow.airtravelclass = matchedClass;
//         }
//       }

//       // Flight type validation
//       if (!cleanedRow.airflighttype) {
//         errors.push('airflighttype is required when air travel is selected');
//       } else {
//         const validFlightTypes = flightTypeOptions.map(f => f.value);
//         const matchedFlightType = validFlightTypes.find(f => 
//           f.toLowerCase() === cleanedRow.airflighttype.toLowerCase()
//         );
//         if (!matchedFlightType) {
//           errors.push(`Invalid airflighttype "${cleanedRow.airflighttype}"`);
//         } else {
//           cleanedRow.airflighttype = matchedFlightType;
//         }
//       }
//     }

//     // Motorbike Travel validation
//     if (cleanedRow.travelbymotorbike) {
//       if (!cleanedRow.motorbikedistancekm) {
//         errors.push('motorbikedistancekm is required when motorbike travel is selected');
//       } else {
//         const distance = Number(cleanedRow.motorbikedistancekm.replace(/[^0-9.-]/g, ''));
//         if (isNaN(distance) || distance <= 0) {
//           errors.push('motorbikedistancekm must be a positive number');
//         } else {
//           cleanedRow.motorbikedistancekm = distance.toString();
//         }
//       }

//       if (!cleanedRow.motorbiketype) {
//         errors.push('motorbiketype is required when motorbike travel is selected');
//       } else {
//         const validTypes = motorbikeTypeOptions.map(m => m.value);
//         const matchedType = validTypes.find(t => 
//           t.toLowerCase() === cleanedRow.motorbiketype.toLowerCase()
//         );
//         if (!matchedType) {
//           errors.push(`Invalid motorbiketype "${cleanedRow.motorbiketype}"`);
//         } else {
//           cleanedRow.motorbiketype = matchedType;
//         }
//       }
//     }

//     // Taxi Travel validation
//     if (cleanedRow.travelbytaxi) {
//       if (!cleanedRow.taxipassengers) {
//         errors.push('taxipassengers is required when taxi travel is selected');
//       } else {
//         const passengers = Number(cleanedRow.taxipassengers.replace(/[^0-9.-]/g, ''));
//         if (isNaN(passengers) || passengers <= 0) {
//           errors.push('taxipassengers must be a positive number');
//         } else {
//           cleanedRow.taxipassengers = passengers.toString();
//         }
//       }

//       if (!cleanedRow.taxidistancekm) {
//         errors.push('taxidistancekm is required when taxi travel is selected');
//       } else {
//         const distance = Number(cleanedRow.taxidistancekm.replace(/[^0-9.-]/g, ''));
//         if (isNaN(distance) || distance <= 0) {
//           errors.push('taxidistancekm must be a positive number');
//         } else {
//           cleanedRow.taxidistancekm = distance.toString();
//         }
//       }

//       if (!cleanedRow.taxitype) {
//         errors.push('taxitype is required when taxi travel is selected');
//       } else {
//         const validTypes = taxiTypeOptions.map(t => t.value);
//         const matchedType = validTypes.find(t => 
//           t.toLowerCase() === cleanedRow.taxitype.toLowerCase()
//         );
//         if (!matchedType) {
//           errors.push(`Invalid taxitype "${cleanedRow.taxitype}"`);
//         } else {
//           cleanedRow.taxitype = matchedType;
//         }
//       }
//     }

//     // Bus Travel validation
//     if (cleanedRow.travelbybus) {
//       if (!cleanedRow.buspassengers) {
//         errors.push('buspassengers is required when bus travel is selected');
//       } else {
//         const passengers = Number(cleanedRow.buspassengers.replace(/[^0-9.-]/g, ''));
//         if (isNaN(passengers) || passengers <= 0) {
//           errors.push('buspassengers must be a positive number');
//         } else {
//           cleanedRow.buspassengers = passengers.toString();
//         }
//       }

//       if (!cleanedRow.busdistancekm) {
//         errors.push('busdistancekm is required when bus travel is selected');
//       } else {
//         const distance = Number(cleanedRow.busdistancekm.replace(/[^0-9.-]/g, ''));
//         if (isNaN(distance) || distance <= 0) {
//           errors.push('busdistancekm must be a positive number');
//         } else {
//           cleanedRow.busdistancekm = distance.toString();
//         }
//       }

//       if (!cleanedRow.bustype) {
//         errors.push('bustype is required when bus travel is selected');
//       } else {
//         const validTypes = busTypeOptions.map(b => b.value);
//         const matchedType = validTypes.find(t => 
//           t.toLowerCase() === cleanedRow.bustype.toLowerCase()
//         );
//         if (!matchedType) {
//           errors.push(`Invalid bustype "${cleanedRow.bustype}"`);
//         } else {
//           cleanedRow.bustype = matchedType;
//         }
//       }
//     }

//     // Train Travel validation
//     if (cleanedRow.travelbytrain) {
//       if (!cleanedRow.trainpassengers) {
//         errors.push('trainpassengers is required when train travel is selected');
//       } else {
//         const passengers = Number(cleanedRow.trainpassengers.replace(/[^0-9.-]/g, ''));
//         if (isNaN(passengers) || passengers <= 0) {
//           errors.push('trainpassengers must be a positive number');
//         } else {
//           cleanedRow.trainpassengers = passengers.toString();
//         }
//       }

//       if (!cleanedRow.traindistancekm) {
//         errors.push('traindistancekm is required when train travel is selected');
//       } else {
//         const distance = Number(cleanedRow.traindistancekm.replace(/[^0-9.-]/g, ''));
//         if (isNaN(distance) || distance <= 0) {
//           errors.push('traindistancekm must be a positive number');
//         } else {
//           cleanedRow.traindistancekm = distance.toString();
//         }
//       }

//       if (!cleanedRow.traintype) {
//         errors.push('traintype is required when train travel is selected');
//       } else {
//         const validTypes = trainTypeOptions.map(t => t.value);
//         const matchedType = validTypes.find(t => 
//           t.toLowerCase() === cleanedRow.traintype.toLowerCase()
//         );
//         if (!matchedType) {
//           errors.push(`Invalid traintype "${cleanedRow.traintype}"`);
//         } else {
//           cleanedRow.traintype = matchedType;
//         }
//       }
//     }

//     // Car Travel validation
//     if (cleanedRow.travelbycar) {
//       if (!cleanedRow.cardistancekm) {
//         errors.push('cardistancekm is required when car travel is selected');
//       } else {
//         const distance = Number(cleanedRow.cardistancekm.replace(/[^0-9.-]/g, ''));
//         if (isNaN(distance) || distance <= 0) {
//           errors.push('cardistancekm must be a positive number');
//         } else {
//           cleanedRow.cardistancekm = distance.toString();
//         }
//       }

//       if (!cleanedRow.cartype) {
//         errors.push('cartype is required when car travel is selected');
//       } else {
//         const validTypes = carTypeOptions.map(c => c.value);
//         const matchedType = validTypes.find(t => 
//           t.toLowerCase() === cleanedRow.cartype.toLowerCase()
//         );
//         if (!matchedType) {
//           errors.push(`Invalid cartype "${cleanedRow.cartype}"`);
//         } else {
//           cleanedRow.cartype = matchedType;
//         }
//       }

//       if (cleanedRow.cartype && cleanedRow.carfueltype) {
//         const validFuelTypes = carFuelTypeOptions[cleanedRow.cartype] || [];
//         const matchedFuelType = validFuelTypes.find(f => 
//           f.toLowerCase() === cleanedRow.carfueltype.toLowerCase()
//         );
//         if (!matchedFuelType) {
//           errors.push(`Invalid carfueltype "${cleanedRow.carfueltype}" for car type "${cleanedRow.cartype}"`);
//         } else {
//           cleanedRow.carfueltype = matchedFuelType;
//         }
//       } else if (cleanedRow.cartype && !cleanedRow.carfueltype) {
//         errors.push('carfueltype is required when car travel is selected');
//       }
//     }

//     // Hotel Stay validation
//     if (cleanedRow.hotelstay) {
//       if (!cleanedRow.hotelrooms) {
//         errors.push('hotelrooms is required when hotel stay is selected');
//       } else {
//         const rooms = Number(cleanedRow.hotelrooms.replace(/[^0-9.-]/g, ''));
//         if (isNaN(rooms) || rooms <= 0) {
//           errors.push('hotelrooms must be a positive number');
//         } else {
//           cleanedRow.hotelrooms = rooms.toString();
//         }
//       }

//       if (!cleanedRow.hotelnights) {
//         errors.push('hotelnights is required when hotel stay is selected');
//       } else {
//         const nights = Number(cleanedRow.hotelnights.replace(/[^0-9.-]/g, ''));
//         if (isNaN(nights) || nights <= 0) {
//           errors.push('hotelnights must be a positive number');
//         } else {
//           cleanedRow.hotelnights = nights.toString();
//         }
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

//     // Update original row with cleaned values if no errors
//     if (errors.length === 0) {
//       Object.keys(cleanedRow).forEach(key => {
//         row[key] = cleanedRow[key];
//       });
//     }

//     return errors;
//   }, [buildings, parseDateToISO]);

//   const transformBusinessTravelPayload = useCallback((row) => {
//     // Get user ID from localStorage
//     const userId = localStorage.getItem('userId');

//     // Prepare data for calculation
//     const calculationData = {
//       travelByAir: row.travelbyair || false,
//       travelByMotorbike: row.travelbymotorbike || false,
//       travelByTaxi: row.travelbytaxi || false,
//       travelByBus: row.travelbybus || false,
//       travelByTrain: row.travelbytrain || false,
//       travelByCar: row.travelbycar || false,
//       hotelStay: row.hotelstay || false,
      
//       airPassengers: row.airpassengers ? Number(row.airpassengers) : 0,
//       airDistanceKm: row.airdistancekm ? Number(row.airdistancekm) : 0,
//       airTravelClass: row.airtravelclass || '',
//       airFlightType: row.airflighttype || '',
      
//       motorbikeDistanceKm: row.motorbikedistancekm ? Number(row.motorbikedistancekm) : 0,
//       motorbikeType: row.motorbiketype || '',
      
//       taxiPassengers: row.taxipassengers ? Number(row.taxipassengers) : 0,
//       taxiDistanceKm: row.taxidistancekm ? Number(row.taxidistancekm) : 0,
//       taxiType: row.taxitype || '',
      
//       busPassengers: row.buspassengers ? Number(row.buspassengers) : 0,
//       busDistanceKm: row.busdistancekm ? Number(row.busdistancekm) : 0,
//       busType: row.bustype || '',
      
//       trainPassengers: row.trainpassengers ? Number(row.trainpassengers) : 0,
//       trainDistanceKm: row.traindistancekm ? Number(row.traindistancekm) : 0,
//       trainType: row.traintype || '',
      
//       carDistanceKm: row.cardistancekm ? Number(row.cardistancekm) : 0,
//       carType: row.cartype || '',
//       carFuelType: row.carfueltype || '',
      
//       hotelRooms: row.hotelrooms ? Number(row.hotelrooms) : 0,
//       hotelNights: row.hotelnights ? Number(row.hotelnights) : 0,
//     };

//     const emission = calculateBusinessTravel(calculationData);

//     const capitalizeFirstLetter = (text) => {
//       if (!text) return "";
//       return text.charAt(0).toUpperCase() + text.slice(1);
//     };

//     return {
//       buildingCode: row.buildingcode,
//       stakeholder: row.stakeholder,
//       qualityControl: row.qualitycontrol,
//       postingDate: row.postingdate,
      
//       travelByAir: row.travelbyair || false,
//       travelByMotorbike: row.travelbymotorbike || false,
//       travelByTaxi: row.travelbytaxi || false,
//       travelByBus: row.travelbybus || false,
//       travelByTrain: row.travelbytrain || false,
//       travelByCar: row.travelbycar || false,
//       hotelStay: row.hotelstay || false,
      
//       airPassengers: row.airpassengers ? Number(row.airpassengers) : null,
//       airDistanceKm: row.airdistancekm ? Number(row.airdistancekm) : null,
//       airTravelClass: row.airtravelclass || null,
//       airFlightType: row.airflighttype || null,
      
//       motorbikeDistanceKm: row.motorbikedistancekm ? Number(row.motorbikedistancekm) : null,
//       motorbikeType: row.motorbiketype || null,
      
//       taxiPassengers: row.taxipassengers ? Number(row.taxipassengers) : null,
//       taxiDistanceKm: row.taxidistancekm ? Number(row.taxidistancekm) : null,
//       taxiType: row.taxitype || null,
      
//       busPassengers: row.buspassengers ? Number(row.buspassengers) : null,
//       busDistanceKm: row.busdistancekm ? Number(row.busdistancekm) : null,
//       busType: row.bustype || null,
      
//       trainPassengers: row.trainpassengers ? Number(row.trainpassengers) : null,
//       trainDistanceKm: row.traindistancekm ? Number(row.traindistancekm) : null,
//       trainType: row.traintype || null,
      
//       carDistanceKm: row.cardistancekm ? Number(row.cardistancekm) : null,
//       carType: row.cartype || null,
//       carFuelType: row.carfueltype || null,
      
//       hotelRooms: row.hotelrooms ? Number(row.hotelrooms) : null,
//       hotelNights: row.hotelnights ? Number(row.hotelnights) : null,
      
//       remarks: capitalizeFirstLetter(row.remarks || ''),
      
//       calculatedEmissionKgCo2e: emission?.totalEmissions_KgCo2e || 0,
//       calculatedEmissionTCo2e: emission?.totalEmissions_TCo2e || 0,
      
//       createdBy: userId,
//       updatedBy: userId,
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
//         const rowErrors = validateBusinessTravelRow(row, index);
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
//           const payload = transformBusinessTravelPayload(row);

//           console.log(`Uploading row ${i + 1}:`, payload);

//           await axios.post(
//             `${process.env.REACT_APP_BASE_URL}/Business-Travel/Create`,
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

// const downloadBusinessTravelTemplate = () => {
//   const exampleBuildings = buildings.slice(0, 1);
//   const exampleBuildingCode = exampleBuildings[0]?.buildingCode || 'BLD-EXAMPLE-001';
  
//   const exampleStakeholder = 'Assembly';
//   const exampleQC = 'Good';

//   const template = `building code,stakeholder,quality control,posting date,travel by air,air passengers,air distance km,air travel class,air flight type,travel by motorbike,motorbike distance km,motorbike type,travel by taxi,taxi passengers,taxi distance km,taxi type,travel by bus,bus passengers,bus distance km,bus type,travel by train,train passengers,train distance km,train type,travel by car,car distance km,car type,car fuel type,hotel stay,hotel rooms,hotel nights,remarks
// ${exampleBuildingCode},${exampleStakeholder},${exampleQC},15/01/2024,Yes,2,1000,Economy class,Domestic,No,,,No,,,,No,,,,No,,,,No,,,,No,,,Example business travel record`;

//   const blob = new Blob([template], { type: 'text/csv' });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = 'business_travel_template.csv';
//   document.body.appendChild(a);
//   a.click();
//   URL.revokeObjectURL(url);
//   document.body.removeChild(a);
// };

//   return {
//     csvState,
//     handleFileSelect,
//     processUpload,
//     resetUpload,
//     downloadBusinessTravelTemplate,
//   };
// };

// export default useBusinessTravelCSVUpload;



// hooks/scope3/useBusinessTravelCSVUpload.js
// hooks/scope3/useBusinessTravelCSVUpload.js
import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { calculateBusinessTravel } from '@/utils/Scope3/calculateBusinessTravel';
import {
  travelClassOptions,
  flightTypeOptions,
  motorbikeTypeOptions,
  taxiTypeOptions,
  busTypeOptions,
  trainTypeOptions,
  carTypeOptions,
  carFuelTypeOptions,
} from "@/constant/scope3/businessTravel";
import {
  stakeholderDepartmentOptions,
  processQualityControlOptions,
} from "@/constant/scope1/options";

const useBusinessTravelCSVUpload = (buildings = []) => {
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
    cleaned = cleaned.replace(/^["']+|["']+$/g, '');
    cleaned = cleaned.replace(/^=/, '');
    return cleaned;
  }, []);

  const parseDateToISO = useCallback((dateString) => {
    if (!dateString) return null;
    let cleanedDate = dateString.toString().trim();
    cleanedDate = cleanedDate.replace(/"/g, '');
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
    
    if (!date || isNaN(date.getTime())) return null;
    
    const isoDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
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

          const headerRowIndex = 0;
          const headerValues = parseCSVLine(lines[headerRowIndex]);
          console.log('Original headers:', headerValues);

          const normalizedHeaders = headerValues.map(h => 
            h.toLowerCase().replace(/[^a-z0-9]/g, '')
          );
          console.log('Normalized headers:', normalizedHeaders);

          const requiredChecks = [
            { field: 'buildingcode', alternatives: ['buildingcode', 'building'] },
            { field: 'stakeholder', alternatives: ['stakeholder', 'stakeholderdepartment', 'department'] },
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

  const validateBusinessTravelRow = useCallback((row, index) => {
    const errors = [];
    
    // COMPLETE HEADER MAPPING
    const headerMapping = {
      // Travel flags
      'travelbyair': 'travelbyair',
      'travelbymotorbike': 'travelbymotorbike',
      'travelbytaxi': 'travelbytaxi',
      'travelbybus': 'travelbybus',
      'travelbytrain': 'travelbytrain',
      'travelbycar': 'travelbycar',
      'hotelstay': 'hotelstay',

      // Air travel fields
      'noofpassengerair': 'airpassengers',
      'nopassengerair': 'airpassengers',
      'airpassengers': 'airpassengers',
      
      'distancetravelledair': 'airdistancekm',
      'distanceair': 'airdistancekm',
      'airdistancekm': 'airdistancekm',
      
      'travelclass': 'airtravelclass',
      'airtravelclass': 'airtravelclass',
      'flighttype': 'airflighttype',
      'airflighttype': 'airflighttype',
      
      // Motorbike travel fields
      'distancetravelledmotorbike': 'motorbikedistancekm',
      'distancemotorbike': 'motorbikedistancekm',
      'motorbikedistancekm': 'motorbikedistancekm',
      
      'motorbiketype': 'motorbiketype',
      
      // Taxi travel fields
      'noofpassengertaxi': 'taxipassengers',
      'nopassengertaxi': 'taxipassengers',
      'taxipassengers': 'taxipassengers',
      
      'distancetravelledtaxi': 'taxidistancekm',
      'distancetaxi': 'taxidistancekm',
      'taxidistancekm': 'taxidistancekm',
      
      'taxitype': 'taxitype',
      
      // Bus travel fields
      'noofpassengerbus': 'buspassengers',
      'nopassengerbus': 'buspassengers',
      'buspassengers': 'buspassengers',
      
      'distancetravelledbus': 'busdistancekm',
      'distancebus': 'busdistancekm',
      'busdistancekm': 'busdistancekm',
      
      'bustype': 'bustype',
      
      // Train travel fields
      'noofpassengertrain': 'trainpassengers',
      'nopassengertrain': 'trainpassengers',
      'trainpassengers': 'trainpassengers',
      
      'distancetravelledtrain': 'traindistancekm',
      'distancetrain': 'traindistancekm',
      'traindistancekm': 'traindistancekm',
      
      'traintype': 'traintype',
      
      // Car travel fields
      'distancetravelledcar': 'cardistancekm',
      'distancecar': 'cardistancekm',
      'cardistancekm': 'cardistancekm',
      
      'cartype': 'cartype',
      'carfueltype': 'carfueltype',
      
      // Hotel stay fields
      'hotelrooms': 'hotelrooms',
      'hotelnights': 'hotelnights',
    };

    const cleanedRow = {};
    
    Object.keys(row).forEach(key => {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      const mappedKey = headerMapping[normalizedKey] || normalizedKey;
      cleanedRow[mappedKey] = row[key]?.toString().trim() || '';
    });

    console.log(`Validating row ${index + 1}:`, cleanedRow);

    // Required fields validation
    if (!cleanedRow.buildingcode) errors.push('buildingcode is required');
    if (!cleanedRow.stakeholder) errors.push('stakeholder is required');
    if (!cleanedRow.qualitycontrol) errors.push('qualitycontrol is required');
    if (!cleanedRow.postingdate) errors.push('postingdate is required');

    if (errors.length > 0) return errors;

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
      const validStakeholders = stakeholderDepartmentOptions.map(s => s.value);
      const matchedStakeholder = validStakeholders.find(s =>
        s.toLowerCase() === cleanedRow.stakeholder.toLowerCase()
      );
      if (!matchedStakeholder) {
        errors.push(`Invalid stakeholder "${cleanedRow.stakeholder}"`);
      } else {
        cleanedRow.stakeholder = matchedStakeholder;
      }
    }

    // Quality Control validation
    if (cleanedRow.qualitycontrol) {
      const validQC = processQualityControlOptions.map(q => q.value);
      const matchedQC = validQC.find(q =>
        q.toLowerCase() === cleanedRow.qualitycontrol.toLowerCase()
      );
      if (!matchedQC) {
        errors.push(`Invalid quality control "${cleanedRow.qualitycontrol}"`);
      } else {
        cleanedRow.qualitycontrol = matchedQC;
      }
    }

    // Convert Yes/No to boolean
    const convertYesNo = (value) => {
      if (!value) return false;
      const val = value.toString().toLowerCase();
      return val === 'yes' || val === 'true' || val === '1';
    };

    // Get boolean values for travel options
    const travelByAir = convertYesNo(cleanedRow.travelbyair);
    const travelByMotorbike = convertYesNo(cleanedRow.travelbymotorbike);
    const travelByTaxi = convertYesNo(cleanedRow.travelbytaxi);
    const travelByBus = convertYesNo(cleanedRow.travelbybus);
    const travelByTrain = convertYesNo(cleanedRow.travelbytrain);
    const travelByCar = convertYesNo(cleanedRow.travelbycar);
    const hotelStay = convertYesNo(cleanedRow.hotelstay);

    // Check if at least one travel option is selected
    const anyTravelSelected = travelByAir || travelByMotorbike || travelByTaxi || 
                              travelByBus || travelByTrain || travelByCar || hotelStay;

    if (!anyTravelSelected) {
      errors.push('At least one travel option must be selected');
    }

    // Helper to validate numeric fields
    const validateNumeric = (value, fieldName) => {
      if (!value) return null;
      const num = Number(value.toString().replace(/[^0-9.-]/g, ''));
      if (isNaN(num) || num < 0) {
        errors.push(`${fieldName} must be a positive number`);
        return null;
      }
      return num;
    };

    // AIR TRAVEL VALIDATION
    if (travelByAir) {
      if (!cleanedRow.airpassengers) {
        errors.push('Air passengers required when travel by air is Yes');
      } else {
        validateNumeric(cleanedRow.airpassengers, 'air passengers');
      }
      
      if (!cleanedRow.airdistancekm) {
        errors.push('Air distance required when travel by air is Yes');
      } else {
        validateNumeric(cleanedRow.airdistancekm, 'air distance');
      }
      
      if (!cleanedRow.airtravelclass) {
        errors.push('Air travel class required when travel by air is Yes');
      } else {
        const validClasses = travelClassOptions.map(t => t.value);
        const matchedClass = validClasses.find(c => 
          c.toLowerCase() === cleanedRow.airtravelclass.toLowerCase()
        );
        if (!matchedClass) {
          errors.push(`Invalid air travel class "${cleanedRow.airtravelclass}"`);
        } else {
          cleanedRow.airtravelclass = matchedClass;
        }
      }
      
      if (!cleanedRow.airflighttype) {
        errors.push('Air flight type required when travel by air is Yes');
      } else {
        const validFlightTypes = flightTypeOptions.map(f => f.value);
        const matchedFlightType = validFlightTypes.find(f => 
          f.toLowerCase() === cleanedRow.airflighttype.toLowerCase()
        );
        if (!matchedFlightType) {
          errors.push(`Invalid air flight type "${cleanedRow.airflighttype}"`);
        } else {
          cleanedRow.airflighttype = matchedFlightType;
        }
      }
    }

    // MOTORBIKE TRAVEL VALIDATION
    if (travelByMotorbike) {
      if (!cleanedRow.motorbikedistancekm) {
        errors.push('Motorbike distance required when travel by motorbike is Yes');
      } else {
        validateNumeric(cleanedRow.motorbikedistancekm, 'motorbike distance');
      }
      
      if (!cleanedRow.motorbiketype) {
        errors.push('Motorbike type required when travel by motorbike is Yes');
      } else {
        const validTypes = motorbikeTypeOptions.map(m => m.value);
        const matchedType = validTypes.find(t => 
          t.toLowerCase() === cleanedRow.motorbiketype.toLowerCase()
        );
        if (!matchedType) {
          errors.push(`Invalid motorbike type "${cleanedRow.motorbiketype}"`);
        } else {
          cleanedRow.motorbiketype = matchedType;
        }
      }
    }

    // TAXI TRAVEL VALIDATION
    if (travelByTaxi) {
      if (!cleanedRow.taxipassengers) {
        errors.push('Taxi passengers required when travel by taxi is Yes');
      } else {
        validateNumeric(cleanedRow.taxipassengers, 'taxi passengers');
      }
      
      if (!cleanedRow.taxidistancekm) {
        errors.push('Taxi distance required when travel by taxi is Yes');
      } else {
        validateNumeric(cleanedRow.taxidistancekm, 'taxi distance');
      }
      
      if (!cleanedRow.taxitype) {
        errors.push('Taxi type required when travel by taxi is Yes');
      } else {
        const validTypes = taxiTypeOptions.map(t => t.value);
        const matchedType = validTypes.find(t => 
          t.toLowerCase() === cleanedRow.taxitype.toLowerCase()
        );
        if (!matchedType) {
          errors.push(`Invalid taxi type "${cleanedRow.taxitype}"`);
        } else {
          cleanedRow.taxitype = matchedType;
        }
      }
    }

    // BUS TRAVEL VALIDATION
    if (travelByBus) {
      if (!cleanedRow.buspassengers) {
        errors.push('Bus passengers required when travel by bus is Yes');
      } else {
        validateNumeric(cleanedRow.buspassengers, 'bus passengers');
      }
      
      if (!cleanedRow.busdistancekm) {
        errors.push('Bus distance required when travel by bus is Yes');
      } else {
        validateNumeric(cleanedRow.busdistancekm, 'bus distance');
      }
      
      if (!cleanedRow.bustype) {
        errors.push('Bus type required when travel by bus is Yes');
      } else {
        const validTypes = busTypeOptions.map(b => b.value);
        const matchedType = validTypes.find(t => 
          t.toLowerCase() === cleanedRow.bustype.toLowerCase()
        );
        if (!matchedType) {
          errors.push(`Invalid bus type "${cleanedRow.bustype}"`);
        } else {
          cleanedRow.bustype = matchedType;
        }
      }
    }

    // TRAIN TRAVEL VALIDATION
    if (travelByTrain) {
      if (!cleanedRow.trainpassengers) {
        errors.push('Train passengers required when travel by train is Yes');
      } else {
        validateNumeric(cleanedRow.trainpassengers, 'train passengers');
      }
      
      if (!cleanedRow.traindistancekm) {
        errors.push('Train distance required when travel by train is Yes');
      } else {
        validateNumeric(cleanedRow.traindistancekm, 'train distance');
      }
      
      if (!cleanedRow.traintype) {
        errors.push('Train type required when travel by train is Yes');
      } else {
        const validTypes = trainTypeOptions.map(t => t.value);
        const matchedType = validTypes.find(t => 
          t.toLowerCase() === cleanedRow.traintype.toLowerCase()
        );
        if (!matchedType) {
          errors.push(`Invalid train type "${cleanedRow.traintype}"`);
        } else {
          cleanedRow.traintype = matchedType;
        }
      }
    }

    // CAR TRAVEL VALIDATION
    if (travelByCar) {
      if (!cleanedRow.cardistancekm) {
        errors.push('Car distance required when travel by car is Yes');
      } else {
        validateNumeric(cleanedRow.cardistancekm, 'car distance');
      }
      
      if (!cleanedRow.cartype) {
        errors.push('Car type required when travel by car is Yes');
      } else {
        const validTypes = carTypeOptions.map(c => c.value);
        const matchedType = validTypes.find(t => 
          t.toLowerCase() === cleanedRow.cartype.toLowerCase()
        );
        if (!matchedType) {
          errors.push(`Invalid car type "${cleanedRow.cartype}"`);
        } else {
          cleanedRow.cartype = matchedType;
        }
      }
      
      if (!cleanedRow.carfueltype) {
        errors.push('Car fuel type required when travel by car is Yes');
      } else if (cleanedRow.cartype) {
        const validFuelTypes = carFuelTypeOptions[cleanedRow.cartype] || [];
        const matchedFuelType = validFuelTypes.find(f => 
          f.toLowerCase() === cleanedRow.carfueltype.toLowerCase()
        );
        if (!matchedFuelType) {
          errors.push(`Invalid car fuel type "${cleanedRow.carfueltype}" for car type "${cleanedRow.cartype}"`);
        } else {
          cleanedRow.carfueltype = matchedFuelType;
        }
      }
    }

    // HOTEL STAY VALIDATION
    if (hotelStay) {
      if (!cleanedRow.hotelrooms) {
        errors.push('Hotel rooms required when hotel stay is Yes');
      } else {
        validateNumeric(cleanedRow.hotelrooms, 'hotel rooms');
      }
      
      if (!cleanedRow.hotelnights) {
        errors.push('Hotel nights required when hotel stay is Yes');
      } else {
        validateNumeric(cleanedRow.hotelnights, 'hotel nights');
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

    // Update original row with cleaned values if no errors
    if (errors.length === 0) {
      Object.keys(cleanedRow).forEach(key => {
        row[key] = cleanedRow[key];
      });
    }

    return errors;
  }, [buildings, parseDateToISO]);

  const transformBusinessTravelPayload = useCallback((row) => {
    const userId = localStorage.getItem('userId');

    const convertYesNo = (value) => {
      if (!value) return false;
      const val = value.toString().toLowerCase();
      return val === 'yes' || val === 'true' || val === '1';
    };

    const calculationData = {
      travelByAir: convertYesNo(row.travelbyair),
      travelByMotorbike: convertYesNo(row.travelbymotorbike),
      travelByTaxi: convertYesNo(row.travelbytaxi),
      travelByBus: convertYesNo(row.travelbybus),
      travelByTrain: convertYesNo(row.travelbytrain),
      travelByCar: convertYesNo(row.travelbycar),
      hotelStay: convertYesNo(row.hotelstay),
      
      airPassengers: row.airpassengers ? Number(row.airpassengers) : 0,
      airDistanceKm: row.airdistancekm ? Number(row.airdistancekm) : 0,
      airTravelClass: row.airtravelclass || '',
      airFlightType: row.airflighttype || '',
      
      motorbikeDistanceKm: row.motorbikedistancekm ? Number(row.motorbikedistancekm) : 0,
      motorbikeType: row.motorbiketype || '',
      
      taxiPassengers: row.taxipassengers ? Number(row.taxipassengers) : 0,
      taxiDistanceKm: row.taxidistancekm ? Number(row.taxidistancekm) : 0,
      taxiType: row.taxitype || '',
      
      busPassengers: row.buspassengers ? Number(row.buspassengers) : 0,
      busDistanceKm: row.busdistancekm ? Number(row.busdistancekm) : 0,
      busType: row.bustype || '',
      
      trainPassengers: row.trainpassengers ? Number(row.trainpassengers) : 0,
      trainDistanceKm: row.traindistancekm ? Number(row.traindistancekm) : 0,
      trainType: row.traintype || '',
      
      carDistanceKm: row.cardistancekm ? Number(row.cardistancekm) : 0,
      carType: row.cartype || '',
      carFuelType: row.carfueltype || '',
      
      hotelRooms: row.hotelrooms ? Number(row.hotelrooms) : 0,
      hotelNights: row.hotelnights ? Number(row.hotelnights) : 0,
    };

    const emission = calculateBusinessTravel(calculationData);

    const capitalizeFirstLetter = (text) => {
      if (!text) return "";
      return text.charAt(0).toUpperCase() + text.slice(1);
    };

    return {
      buildingCode: row.buildingcode,
      stakeholder: row.stakeholder,
      qualityControl: row.qualitycontrol,
      postingDate: row.postingdate,
      
      travelByAir: calculationData.travelByAir,
      travelByMotorbike: calculationData.travelByMotorbike,
      travelByTaxi: calculationData.travelByTaxi,
      travelByBus: calculationData.travelByBus,
      travelByTrain: calculationData.travelByTrain,
      travelByCar: calculationData.travelByCar,
      hotelStay: calculationData.hotelStay,
      
      airPassengers: row.airpassengers ? Number(row.airpassengers) : null,
      airDistanceKm: row.airdistancekm ? Number(row.airdistancekm) : null,
      airTravelClass: row.airtravelclass || null,
      airFlightType: row.airflighttype || null,
      
      motorbikeDistanceKm: row.motorbikedistancekm ? Number(row.motorbikedistancekm) : null,
      motorbikeType: row.motorbiketype || null,
      
      taxiPassengers: row.taxipassengers ? Number(row.taxipassengers) : null,
      taxiDistanceKm: row.taxidistancekm ? Number(row.taxidistancekm) : null,
      taxiType: row.taxitype || null,
      
      busPassengers: row.buspassengers ? Number(row.buspassengers) : null,
      busDistanceKm: row.busdistancekm ? Number(row.busdistancekm) : null,
      busType: row.bustype || null,
      
      trainPassengers: row.trainpassengers ? Number(row.trainpassengers) : null,
      trainDistanceKm: row.traindistancekm ? Number(row.traindistancekm) : null,
      trainType: row.traintype || null,
      
      carDistanceKm: row.cardistancekm ? Number(row.cardistancekm) : null,
      carType: row.cartype || null,
      carFuelType: row.carfueltype || null,
      
      hotelRooms: row.hotelrooms ? Number(row.hotelrooms) : null,
      hotelNights: row.hotelnights ? Number(row.hotelnights) : null,
      
      remarks: capitalizeFirstLetter(row.remarks || ''),
      
      calculatedEmissionKgCo2e: emission?.totalEmissions_KgCo2e || 0,
      calculatedEmissionTCo2e: emission?.totalEmissions_TCo2e || 0,
      
      createdBy: userId,
      updatedBy: userId,
    };
  }, []);

  const handleFileSelect = async (file) => {
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

      data.forEach((row, index) => {
        const rowErrors = validateBusinessTravelRow(row, index);
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
          const payload = transformBusinessTravelPayload(row);

          await axios.post(
            `${process.env.REACT_APP_BASE_URL}/Business-Travel/Create`,
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

  const downloadBusinessTravelTemplate = () => {
    const exampleBuildings = buildings.slice(0, 1);
    const exampleBuildingCode = exampleBuildings[0]?.buildingCode || 'BLD-EXAMPLE-001';
    
    const exampleStakeholder = 'Assembly';
    const exampleQC = 'Good';
    const exampleFlightType = 'Domestic';
    const exampleTravelClass = 'Economy class';
    const exampleTaxiType = 'Regular taxi';
    const exampleBusType = 'Intercity Bus (A.C)';
    const exampleTrainType = 'Metro';
    const exampleCarType = 'Medium car - Petrol/LPG/CNG - from 1.4-litre to 2.0-litre engine. Diesel - from 1.7-litre to 2.0-litre engine. Others - vehicles models of a similar size (i.e. generally market segment C)';
    const exampleCarFuelType = 'Unknown';

    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    const template = `building code,stakeholder,quality control,posting date,travel by air,no of passenger (air),distance travelled (air),travel class,flight type,travel by motorbike,distance travelled (motorbike),motorbike type,travel by taxi,no of passenger (taxi),distance travelled (taxi),taxi type,travel by bus,no of passenger (bus),distance travelled (bus),bus type,travel by train,no of passenger (train),distance travelled (train),train type,travel by car,distance travelled (car),car type,car fuel type,hotel stay,hotel rooms,hotel nights,remarks
${exampleBuildingCode},${exampleStakeholder},${exampleQC},${formattedDate},Yes,2,1000,${exampleTravelClass},${exampleFlightType},No,0,,Yes,1,50,${exampleTaxiType},No,0,0,${exampleBusType},Yes,5,200,${exampleTrainType},Yes,100,${exampleCarType},${exampleCarFuelType},No,0,0,Example business travel record`;

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + template], { type: 'text/csv;charset=utf-8;' });    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'business_travel_template.csv';
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
    downloadBusinessTravelTemplate,
  };
};

export default useBusinessTravelCSVUpload;