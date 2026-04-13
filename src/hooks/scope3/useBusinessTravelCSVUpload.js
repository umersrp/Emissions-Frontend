// hooks/scope3/useBusinessTravelCSVUpload.js
import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as XLSX from "xlsx";
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
            { field: 'stakeholder', alternatives: ['stakeholder', 'stakeholderdepartment', 'department'] },
            { field: 'qualitycontrol', alternatives: ['qualitycontrol', 'quality', 'quality control'] },
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
            { field: 'stakeholder', alternatives: ['stakeholder', 'stakeholderdepartment', 'department'] },
            { field: 'qualitycontrol', alternatives: ['qualitycontrol', 'quality', 'quality control'] },
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

  const validateBusinessTravelRow = useCallback((row, index) => {
    const errors = [];
    
    // COMPLETE HEADER MAPPING for friendly headers
    const headerMapping = {
      // Friendly toggle headers - matching the form labels
      'didyouhaveanybusinesstravelbyairduringthereportingperiod': 'travelbyair',
      'didyouhaveanybusinesstravelbymotorbikeduringthereportingperiod': 'travelbymotorbike',
      'didyouhaveanybusinesstravelbytaxiduringthereportingperiod': 'travelbytaxi',
      'didyouhaveanybusinesstravelbybusduringthereportingperiod': 'travelbybus',
      'didyouhaveanybusinesstravelbytrainduringthereportingperiod': 'travelbytrain',
      'didyouhaveanybusinesstravelbycarduringthereportingperiod': 'travelbycar',
      'didyouhaveanyhotelstaysduringbusinesstravelinthereportingperiod': 'hotelstay',
      
      // Short version toggle headers
      'travelbyair': 'travelbyair',
      'travelbymotorbike': 'travelbymotorbike',
      'travelbytaxi': 'travelbytaxi',
      'travelbybus': 'travelbybus',
      'travelbytrain': 'travelbytrain',
      'travelbycar': 'travelbycar',
      'hotelstay': 'hotelstay',

      // Air travel fields
      'numberofpassengersair': 'airpassengers',
      'numberofpassengersair': 'airpassengers',
      'nopassengerair': 'airpassengers',
      'airpassengers': 'airpassengers',
      
      'distancetravelledair': 'airdistancekm',
      'distancetravelledairkm': 'airdistancekm',
      'distanceair': 'airdistancekm',
      'airdistancekm': 'airdistancekm',
      
      'travelclassair': 'airtravelclass',
      'travelclass': 'airtravelclass',
      'airtravelclass': 'airtravelclass',
      
      'flighttype': 'airflighttype',
      'airflighttype': 'airflighttype',
      
      // Motorbike travel fields
      'distancetravelledmotorbike': 'motorbikedistancekm',
      'distancetravelledmotorbikekm': 'motorbikedistancekm',
      'distancemotorbike': 'motorbikedistancekm',
      'motorbikedistancekm': 'motorbikedistancekm',
      'motorbiketype': 'motorbiketype',
      
      // Taxi travel fields
      'numberofpassengerstaxi': 'taxipassengers',
      'nopassengertaxi': 'taxipassengers',
      'taxipassengers': 'taxipassengers',
      
      'distancetravelledtaxi': 'taxidistancekm',
      'distancetravelledtaxikm': 'taxidistancekm',
      'distancetaxi': 'taxidistancekm',
      'taxidistancekm': 'taxidistancekm',
      
      'taxitype': 'taxitype',
      
      // Bus travel fields
      'numberofpassengersbus': 'buspassengers',
      'nopassengerbus': 'buspassengers',
      'buspassengers': 'buspassengers',
      
      'distancetravelledbus': 'busdistancekm',
      'distancetravelledbuskm': 'busdistancekm',
      'distancebus': 'busdistancekm',
      'busdistancekm': 'busdistancekm',
      
      'bustype': 'bustype',
      
      // Train travel fields
      'numberofpassengerstrain': 'trainpassengers',
      'nopassengertrain': 'trainpassengers',
      'trainpassengers': 'trainpassengers',
      
      'distancetravelledtrain': 'traindistancekm',
      'distancetravelledtrainkm': 'traindistancekm',
      'distancetrain': 'traindistancekm',
      'traindistancekm': 'traindistancekm',
      
      'traintype': 'traintype',
      
      // Car travel fields
      'distancetravelledcar': 'cardistancekm',
      'distancetravelledcarkm': 'cardistancekm',
      'distancecar': 'cardistancekm',
      'cardistancekm': 'cardistancekm',
      
      'cartype': 'cartype',
      'fueltypecar': 'carfueltype',
      'carfueltype': 'carfueltype',
      
      // Hotel stay fields
      'numberofrooms': 'hotelrooms',
      'hotelrooms': 'hotelrooms',
      'nightsstayed': 'hotelnights',
      'hotelnights': 'hotelnights',
      
      // Basic fields
      'buildingcode': 'buildingcode',
      'building': 'buildingcode',
      'buildingcode': 'buildingcode',
      'stakeholderdepartment': 'stakeholder',
      'stakeholder': 'stakeholder',
      'department': 'stakeholder',
      'qualitycontrol': 'qualitycontrol',
      'quality': 'qualitycontrol',
      'qualitycontrol': 'qualitycontrol',
      'postingdate': 'postingdate',
      'date': 'postingdate',
      'remarks': 'remarks',
      'remark': 'remarks',
    };

    const cleanedRow = {};
    
    // Apply header mapping with proper normalization
    Object.keys(row).forEach(key => {
      // Normalize the key: remove spaces, special characters, convert to lowercase
      const normalizedKey = key.toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '');
      const mappedKey = headerMapping[normalizedKey] || normalizedKey;
      cleanedRow[mappedKey] = row[key]?.toString().trim() || '';
    });

    console.log(`Validating row ${index + 1}:`, cleanedRow);

    // Required fields validation
    if (!cleanedRow.buildingcode) errors.push('Building Code is required');
    if (!cleanedRow.stakeholder) errors.push('Stakeholder / Department is required');
    if (!cleanedRow.qualitycontrol) errors.push('Quality Control is required');
    if (!cleanedRow.postingdate) errors.push('Posting Date is required');

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
    // if (cleanedRow.stakeholder) {
    //   const validStakeholders = stakeholderDepartmentOptions.map(s => s.value);
    //   const matchedStakeholder = validStakeholders.find(s =>
    //     s.toLowerCase() === cleanedRow.stakeholder.toLowerCase()
    //   );
    //   if (!matchedStakeholder) {
    //     errors.push(`Invalid stakeholder "${cleanedRow.stakeholder}"`);
    //   } else {
    //     cleanedRow.stakeholder = matchedStakeholder;
    //   }
    // }
    // Stakeholder validation with flexible matching
if (cleanedRow.stakeholder) {
  const validStakeholders = stakeholderDepartmentOptions.map(s => s.value);
  const matchedStakeholder = findFlexibleMatch(cleanedRow.stakeholder, validStakeholders);
  
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

    // Convert Yes/No to boolean - handles various formats
    const convertYesNo = (value) => {
      if (!value) return false;
      const val = value.toString().toLowerCase().trim();
      // Accept 'yes', 'true', '1', 'y', 'ye'
      return val === 'yes' || val === 'true' || val === '1' || val === 'y' || val === 'ye';
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
      errors.push('At least one travel option must be selected (set to "Yes" for any travel type)');
    }

    // Helper to validate numeric fields
    const validateNumeric = (value, fieldName) => {
      if (!value) return null;
      const num = Number(value.toString().replace(/[^0-9.-]/g, ''));
      if (isNaN(num) || num <= 0) {
        errors.push(`${fieldName} must be a positive number`);
        return null;
      }
      return num;
    };

    // AIR TRAVEL VALIDATION
    if (travelByAir) {
      if (!cleanedRow.airpassengers) {
        errors.push('Number of Passengers (Air) is required when air travel is Yes');
      } else {
        validateNumeric(cleanedRow.airpassengers, 'Air passengers');
      }
      
      if (!cleanedRow.airdistancekm) {
        errors.push('Distance Travelled (Air) is required when air travel is Yes');
      } else {
        validateNumeric(cleanedRow.airdistancekm, 'Air distance');
      }
      
      if (!cleanedRow.airtravelclass) {
        errors.push('Travel Class (Air) is required when air travel is Yes');
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
        errors.push('Flight Type is required when air travel is Yes');
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
        errors.push('Distance Travelled (Motorbike) is required when motorbike travel is Yes');
      } else {
        validateNumeric(cleanedRow.motorbikedistancekm, 'Motorbike distance');
      }
      
      if (!cleanedRow.motorbiketype) {
        errors.push('Motorbike Type is required when motorbike travel is Yes');
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
        errors.push('Number of Passengers (Taxi) is required when taxi travel is Yes');
      } else {
        validateNumeric(cleanedRow.taxipassengers, 'Taxi passengers');
      }
      
      if (!cleanedRow.taxidistancekm) {
        errors.push('Distance Travelled (Taxi) is required when taxi travel is Yes');
      } else {
        validateNumeric(cleanedRow.taxidistancekm, 'Taxi distance');
      }
      
      if (!cleanedRow.taxitype) {
        errors.push('Taxi Type is required when taxi travel is Yes');
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
        errors.push('Number of Passengers (Bus) is required when bus travel is Yes');
      } else {
        validateNumeric(cleanedRow.buspassengers, 'Bus passengers');
      }
      
      if (!cleanedRow.busdistancekm) {
        errors.push('Distance Travelled (Bus) is required when bus travel is Yes');
      } else {
        validateNumeric(cleanedRow.busdistancekm, 'Bus distance');
      }
      
      if (!cleanedRow.bustype) {
        errors.push('Bus Type is required when bus travel is Yes');
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
        errors.push('Number of Passengers (Train) is required when train travel is Yes');
      } else {
        validateNumeric(cleanedRow.trainpassengers, 'Train passengers');
      }
      
      if (!cleanedRow.traindistancekm) {
        errors.push('Distance Travelled (Train) is required when train travel is Yes');
      } else {
        validateNumeric(cleanedRow.traindistancekm, 'Train distance');
      }
      
      if (!cleanedRow.traintype) {
        errors.push('Train Type is required when train travel is Yes');
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
    // if (travelByCar) {
    //   if (!cleanedRow.cardistancekm) {
    //     errors.push('Distance Travelled (Car) is required when car travel is Yes');
    //   } else {
    //     validateNumeric(cleanedRow.cardistancekm, 'Car distance');
    //   }
      
    //   if (!cleanedRow.cartype) {
    //     errors.push('Car Type is required when car travel is Yes');
    //   } else {
    //     const validTypes = carTypeOptions.map(c => c.value);
    //     const matchedType = validTypes.find(t => 
    //       t.toLowerCase() === cleanedRow.cartype.toLowerCase()
    //     );
    //     if (!matchedType) {
    //       errors.push(`Invalid car type "${cleanedRow.cartype}"`);
    //     } else {
    //       cleanedRow.cartype = matchedType;
    //     }
    //   }
      
    //   if (!cleanedRow.carfueltype) {
    //     errors.push('Fuel Type (Car) is required when car travel is Yes');
    //   } else if (cleanedRow.cartype) {
    //     const validFuelTypes = carFuelTypeOptions[cleanedRow.cartype] || [];
    //     const matchedFuelType = validFuelTypes.find(f => 
    //       f.toLowerCase() === cleanedRow.carfueltype.toLowerCase()
    //     );
    //     if (!matchedFuelType) {
    //       errors.push(`Invalid car fuel type "${cleanedRow.carfueltype}" for car type "${cleanedRow.cartype}"`);
    //     } else {
    //       cleanedRow.carfueltype = matchedFuelType;
    //     }
    //   }
    // }
    // CAR TRAVEL VALIDATION with flexible matching
if (travelByCar) {
  if (!cleanedRow.cardistancekm) {
    errors.push('Distance Travelled (Car) is required when car travel is Yes');
  } else {
    validateNumeric(cleanedRow.cardistancekm, 'Car distance');
  }
  
  // Car type validation with flexible matching
  if (!cleanedRow.cartype) {
    errors.push('Car Type is required when car travel is Yes');
  } else {
    const validTypes = carTypeOptions.map(c => c.value);
    const matchedType = findFlexibleMatch(cleanedRow.cartype, validTypes);
    
    if (!matchedType) {
      errors.push(`Invalid car type "${cleanedRow.cartype}"`);
    } else {
      cleanedRow.cartype = matchedType;
    }
  }
  
  // Car fuel type validation with flexible matching
  if (!cleanedRow.carfueltype) {
    errors.push('Fuel Type (Car) is required when car travel is Yes');
  } else if (cleanedRow.cartype) {
    const validFuelTypes = carFuelTypeOptions[cleanedRow.cartype] || [];
    const matchedFuelType = findFlexibleMatch(cleanedRow.carfueltype, validFuelTypes);
    
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
        errors.push('Number of Rooms is required when hotel stay is Yes');
      } else {
        validateNumeric(cleanedRow.hotelrooms, 'Hotel rooms');
      }
      
      if (!cleanedRow.hotelnights) {
        errors.push('Nights Stayed is required when hotel stay is Yes');
      } else {
        validateNumeric(cleanedRow.hotelnights, 'Hotel nights');
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
      const val = value.toString().toLowerCase().trim();
      return val === 'yes' || val === 'true' || val === '1' || val === 'y' || val === 'ye';
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
  
  airPassengers: cleanNumberValue(row.airpassengers, 'Air passengers'),
  airDistanceKm: cleanNumberValue(row.airdistancekm, 'Air distance'),
  airTravelClass: cleanStringValue(row.airtravelclass),
  airFlightType: cleanStringValue(row.airflighttype),
  
  motorbikeDistanceKm: cleanNumberValue(row.motorbikedistancekm, 'Motorbike distance'),
  motorbikeType: cleanStringValue(row.motorbiketype),
  
  taxiPassengers: cleanNumberValue(row.taxipassengers, 'Taxi passengers'),
  taxiDistanceKm: cleanNumberValue(row.taxidistancekm, 'Taxi distance'),
  taxiType: cleanStringValue(row.taxitype),
  
  busPassengers: cleanNumberValue(row.buspassengers, 'Bus passengers'),
  busDistanceKm: cleanNumberValue(row.busdistancekm, 'Bus distance'),
  busType: cleanStringValue(row.bustype),
  
  trainPassengers: cleanNumberValue(row.trainpassengers, 'Train passengers'),
  trainDistanceKm: cleanNumberValue(row.traindistancekm, 'Train distance'),
  trainType: cleanStringValue(row.traintype),
  
  carDistanceKm: cleanNumberValue(row.cardistancekm, 'Car distance'),
  carType: cleanStringValue(row.cartype),
  carFuelType: cleanStringValue(row.carfueltype),
  
  hotelRooms: cleanNumberValue(row.hotelrooms, 'Hotel rooms'),
  hotelNights: cleanNumberValue(row.hotelnights, 'Hotel nights'),
  
  remarks: capitalizeFirstLetter(cleanStringValue(row.remarks) || ''),
  
  calculatedEmissionKgCo2e: emission?.totalEmissions_KgCo2e || 0,
  calculatedEmissionTCo2e: emission?.totalEmissions_TCo2e || 0,
  
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

  const downloadBusinessTravelTemplate = useCallback(() => {
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

    // FRIENDLY HEADERS matching the form toggle labels
    const headers = [
      'Building Code',
      'Stakeholder',
      'Did you have any business travel by air during the reporting period?',
      'Number of Passengers (Air)',
      'Distance Travelled (Air) (km)',
      'Travel Class (Air)',
      'Flight Type',
      'Did you have any business travel by motorbike during the reporting period?',
      'Distance Travelled (Motorbike) (km)',
      'Motorbike Type',
      'Did you have any business travel by taxi during the reporting period?',
      'Number of Passengers (Taxi)',
      'Distance Travelled (Taxi) (km)',
      'Taxi Type',
      'Did you have any business travel by bus during the reporting period?',
      'Number of Passengers (Bus)',
      'Distance Travelled (Bus) (km)',
      'Bus Type',
      'Did you have any business travel by train during the reporting period?',
      'Number of Passengers (Train)',
      'Distance Travelled (Train) (km)',
      'Train Type',
      'Did you have any business travel by car during the reporting period?',
      'Distance Travelled (Car) (km)',
      'Car Type',
      'Fuel Type (Car)',
      'Did you have any hotel stays during business travel in the reporting period?',
      'Number of Rooms',
      'Nights Stayed',
      'Quality Control',
      'Remarks',
      'Posting Date'
    ];

    const exampleRow = [
      exampleBuildingCode,
      exampleStakeholder,
      'Yes',
      '2',
      '1000',
      exampleTravelClass,
      exampleFlightType,
      'No',
      '0',
      '',
      'Yes',
      '1',
      '50',
      exampleTaxiType,
      'No',
      '0',
      '0',
      exampleBusType,
      'Yes',
      '5',
      '200',
      exampleTrainType,
      'Yes',
      '100',
      exampleCarType,
      exampleCarFuelType,
      'No',
      '0',
      '0',
       exampleQC,
      'Example business travel record',
      formattedDate
    ];

    const worksheetData = [
      headers,
      exampleRow,
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    const colWidths = headers.map(header => ({
      wch: Math.min(Math.max(header.length, 20), 65)
    }));
    worksheet['!cols'] = colWidths;

    const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = {
        font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F46E5" } },
        alignment: { wrapText: true, vertical: "top", horizontal: "center" }
      };
    }

    
    worksheet['!rows'] = [
      { hpt: 25 },
      { hpt: 25 },
      ...Array(worksheetData.length - 2).fill({ hpt: 20 })
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Business Travel Template');
    XLSX.writeFile(workbook, 'business_travel_template.xlsx');
  }, [buildings]);

  return {
    csvState,
    handleFileSelect,
    processUpload,
    resetUpload,
    downloadBusinessTravelTemplate,
  };
};

export default useBusinessTravelCSVUpload;