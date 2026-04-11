
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

  // const validateFuelAndEnergyRow = useCallback((row, index) => {
  //   const errors = [];

  //   // ADD HEADER MAPPING FOR FRIENDLY HEADERS
  //   const headerMapping = {
  //     'totalpurchasedelectricitygridsupplierspecificppa': 'totalgrosselectricitypurchased',
  //     'totalpurchasedelectricity': 'totalgrosselectricitypurchased',
  //     'totalgrosselectricitypurchased': 'totalgrosselectricitypurchased',
  //     'didtravelbyair': 'didtravelbyair',
  //     'didtravelbytaxi': 'didtravelbytaxi',
  //     'didtravelbybus': 'didtravelbybus',
  //     'didtravelbytrain': 'didtravelbytrain',

  //     // Air travel fields
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
  //   };

  //   const cleanedRow = {};

  //   // USE MAPPED VERSION
  //   Object.keys(row).forEach(key => {
  //     const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
  //     const mappedKey = headerMapping[normalizedKey] || normalizedKey;
  //     cleanedRow[mappedKey] = row[key]?.toString().trim();
  //   });

  //   // Required fields
  //   const requiredFields = ['buildingcode', 'stakeholder', 'fueltype', 'fuel', 'qualitycontrol'];
  //   requiredFields.forEach(field => {
  //     if (!cleanedRow[field] || cleanedRow[field] === '') {
  //       errors.push(`${field} is required`);
  //     }
  //   });

  //   // Building validation
  //   if (cleanedRow.buildingcode && buildings.length > 0) {
  //     const buildingExists = buildings.some(b =>
  //       b.buildingCode && b.buildingCode.toLowerCase() === cleanedRow.buildingcode.toLowerCase()
  //     );
  //     if (!buildingExists) {
  //       errors.push(`Invalid building code "${cleanedRow.buildingcode}"`);
  //     }
  //   }

  //   // Stakeholder validation
  //   // if (cleanedRow.stakeholder) {
  //   //   const validStakeholders = stakeholderOptions.map(s => s.value);
  //   //   const matchedStakeholder = validStakeholders.find(s =>
  //   //     s.toLowerCase() === cleanedRow.stakeholder.toLowerCase()
  //   //   );
  //   //   if (!matchedStakeholder) {
  //   //     errors.push(`Invalid stakeholder "${cleanedRow.stakeholder}"`);
  //   //   } else {
  //   //     cleanedRow.stakeholder = matchedStakeholder;
  //   //   }
  //   // }
  //   // Stakeholder validation with flexible matching
  //   if (cleanedRow.stakeholder) {
  //     const validStakeholders = stakeholderOptions.map(s => s.value);
  //     const matchedStakeholder = findFlexibleMatch(cleanedRow.stakeholder, validStakeholders);

  //     if (!matchedStakeholder) {
  //       errors.push(`Invalid stakeholder "${cleanedRow.stakeholder}"`);
  //     } else {
  //       cleanedRow.stakeholder = matchedStakeholder;
  //     }
  //   }

  //   // Fuel Type validation
  //   if (cleanedRow.fueltype) {
  //     const validFuelTypes = fuelEnergyTypes.map(f => f.value);
  //     const matchedFuelType = validFuelTypes.find(f =>
  //       f.toLowerCase() === cleanedRow.fueltype.toLowerCase()
  //     );
  //     if (!matchedFuelType) {
  //       errors.push(`Invalid fuel type "${cleanedRow.fueltype}"`);
  //     } else {
  //       cleanedRow.fueltype = matchedFuelType;
  //     }
  //   }

  //   // Fuel Name validation
  //   // if (cleanedRow.fueltype && cleanedRow.fuel) {
  //   //   const validFuels = fuelEnergyTypesChildTypes[cleanedRow.fueltype]?.map(f => f.value) || [];
  //   //   const matchedFuel = validFuels.find(f => f.toLowerCase() === cleanedRow.fuel.toLowerCase());
  //   //   // console.log({matchedFuel, validFuels});
  //   //   console.log(cleanedRow.fuel.split(''));
  //   //   if (!matchedFuel) {
  //   //     errors.push(`Invalid fuel name "${cleanedRow.fuel}" for type "${cleanedRow.fueltype}"`);
  //   //   } else {
  //   //     cleanedRow.fuel = matchedFuel;
  //   //   }
  //   // }

  //   // my logic to handle subscript numbers and spaces around slashes in fuel name

  //   if (cleanedRow.fueltype && cleanedRow.fuel) {
  //     const validFuels = fuelEnergyTypesChildTypes[cleanedRow.fueltype]?.map(f => f.value) || [];

  //     // Use the flexible matching function
  //     const matchedFuel = findFlexibleMatch(cleanedRow.fuel, validFuels);

  //     if (!matchedFuel) {
  //       errors.push(`Invalid fuel name "${cleanedRow.fuel}" for type "${cleanedRow.fueltype}"`);
  //     } else {
  //       cleanedRow.fuel = matchedFuel;
  //     }
  //   }

  //   // Fuel Consumption validation
  //   if (cleanedRow.totalfuelconsumption) {
  //     const cleanNum = cleanedRow.totalfuelconsumption.toString()
  //       .replace(/[^0-9.-]/g, '')
  //       .replace(/^"+|"+$/g, '');

  //     const num = Number(cleanNum);
  //     if (isNaN(num)) {
  //       errors.push(`Fuel consumption must be a number, got "${cleanedRow.totalfuelconsumption}"`);
  //     } else if (num < 0) {
  //       errors.push('Fuel consumption cannot be negative');
  //     } else if (num > 1000000000) {
  //       errors.push('Fuel consumption seems too large');
  //     } else {
  //       cleanedRow.totalfuelconsumption = num.toString();
  //     }
  //   }

  //   // Fuel Consumption Unit validation
  //   if (cleanedRow.totalfuelconsumption && cleanedRow.fuelconsumptionunit) {
  //     const allUnits = [
  //       ...fuelUnitOptionsByName.default,
  //       ...(cleanedRow.fuel ? fuelUnitOptionsByName[cleanedRow.fuel] || [] : [])
  //     ];

  //     const cleanUnit = cleanedRow.fuelconsumptionunit.toLowerCase();
  //     const matchedUnit = allUnits.find(u => u.toLowerCase() === cleanUnit);

  //     if (!matchedUnit) {
  //       errors.push(`Invalid fuel consumption unit "${cleanedRow.fuelconsumptionunit}"`);
  //     } else {
  //       cleanedRow.fuelconsumptionunit = matchedUnit;
  //     }
  //   }

  //   // Electricity validation
  //   if (cleanedRow.totalgrosselectricitypurchased) {
  //     const cleanNum = cleanedRow.totalgrosselectricitypurchased.toString()
  //       .replace(/[^0-9.-]/g, '')
  //       .replace(/^"+|"+$/g, '');

  //     const num = Number(cleanNum);
  //     if (isNaN(num)) {
  //       errors.push(`Electricity must be a number, got "${cleanedRow.totalgrosselectricitypurchased}"`);
  //     } else if (num < 0) {
  //       errors.push('Electricity cannot be negative');
  //     } else {
  //       cleanedRow.totalgrosselectricitypurchased = num.toString();
  //     }
  //   }

  //   // Electricity Unit validation
  //   if (cleanedRow.totalgrosselectricitypurchased && cleanedRow.unit) {
  //     const validUnits = electricityUnits.map(u => u.value);
  //     const matchedUnit = validUnits.find(u =>
  //       u.toLowerCase() === cleanedRow.unit.toLowerCase()
  //     );
  //     if (!matchedUnit) {
  //       errors.push(`Invalid electricity unit "${cleanedRow.unit}"`);
  //     } else {
  //       cleanedRow.unit = matchedUnit;
  //     }
  //   }

  //   // At least one of fuel or electricity must be provided
  //   const hasFuel = cleanedRow.totalfuelconsumption && cleanedRow.totalfuelconsumption !== '';
  //   const hasElectricity = cleanedRow.totalgrosselectricitypurchased && cleanedRow.totalgrosselectricitypurchased !== '';

  //   if (!hasFuel && !hasElectricity) {
  //     errors.push('Either fuel consumption or electricity purchased must be provided');
  //   }

  //   // Quality Control validation
  //   if (cleanedRow.qualitycontrol) {
  //     const validQC = qualityControlOptions.map(q => q.value);
  //     const matchedQC = validQC.find(q =>
  //       q.toLowerCase() === cleanedRow.qualitycontrol.toLowerCase()
  //     );
  //     if (!matchedQC) {
  //       errors.push(`Invalid quality control "${cleanedRow.qualitycontrol}"`);
  //     } else {
  //       cleanedRow.qualitycontrol = matchedQC;
  //     }
  //   }

  //   // Check for explicit Yes/No values for travel options
  //   const checkTravelOption = (field, passengers, distance, type, typeFields = []) => {
  //     if (cleanedRow[field]) {
  //       const value = cleanedRow[field].toLowerCase();
  //       const isSelected = value === 'yes' || value === 'true' || value === '1';

  //       if (isSelected) {
  //         if (!passengers) errors.push(`${field.replace('didtravelby', '')} passengers required when travel is Yes`);
  //         if (!distance) errors.push(`${field.replace('didtravelby', '')} distance required when travel is Yes`);
  //         if (type && !type) errors.push(`${field.replace('didtravelby', '')} type required when travel is Yes`);
  //         typeFields.forEach(t => {
  //           if (!cleanedRow[t]) errors.push(`${t} required when travel is Yes`);
  //         });
  //       }
  //     }
  //   };

  //   checkTravelOption('didtravelbyair', cleanedRow.airpassengers, cleanedRow.airdistancekm, cleanedRow.airtravelclass, ['airflighttype']);
  //   checkTravelOption('didtravelbytaxi', cleanedRow.taxipassengers, cleanedRow.taxidistancekm, cleanedRow.taxitype);
  //   checkTravelOption('didtravelbybus', cleanedRow.buspassengers, cleanedRow.busdistancekm, cleanedRow.bustype);
  //   checkTravelOption('didtravelbytrain', cleanedRow.trainpassengers, cleanedRow.traindistancekm, cleanedRow.traintype);

  //   // Travel field validations (if data present)
  //   if (cleanedRow.airpassengers || cleanedRow.airdistancekm) {
  //     if (!cleanedRow.airpassengers) errors.push('Air passengers required when air distance provided');
  //     if (!cleanedRow.airdistancekm) errors.push('Air distance required when air passengers provided');
  //     if (cleanedRow.airpassengers) {
  //       const num = Number(cleanedRow.airpassengers.replace(/[^0-9.-]/g, ''));
  //       if (isNaN(num) || num < 0) errors.push('Air passengers must be a positive number');
  //     }
  //     if (cleanedRow.airdistancekm) {
  //       const num = Number(cleanedRow.airdistancekm.replace(/[^0-9.-]/g, ''));
  //       if (isNaN(num) || num < 0) errors.push('Air distance must be a positive number');
  //     }
  //   }

  //   // Air flight type validation - case insensitive
  //   if (cleanedRow.airflighttype) {
  //     const validFlightTypes = AIR_FLIGHT_TYPES.map(f => f.value);
  //     const matchedFlightType = validFlightTypes.find(ft =>
  //       ft.toLowerCase() === cleanedRow.airflighttype.toLowerCase()
  //     );
  //     if (!matchedFlightType) {
  //       errors.push(`Invalid air flight type "${cleanedRow.airflighttype}"`);
  //     } else {
  //       cleanedRow.airflighttype = matchedFlightType;
  //     }
  //   }

  //   // Travel class validation - case insensitive
  //   if (cleanedRow.airtravelclass && cleanedRow.airflighttype) {
  //     const validClasses = AIR_TRAVEL_OPTIONS[cleanedRow.airflighttype]?.map(c => c.value) || [];
  //     const matchedClass = validClasses.find(c =>
  //       c.toLowerCase() === cleanedRow.airtravelclass.toLowerCase()
  //     );
  //     if (!matchedClass) {
  //       errors.push(`Invalid travel class "${cleanedRow.airtravelclass}" for ${cleanedRow.airflighttype}`);
  //     } else {
  //       cleanedRow.airtravelclass = matchedClass;
  //     }
  //   }

  //   // Taxi validations
  //   if (cleanedRow.taxipassengers || cleanedRow.taxidistancekm) {
  //     if (!cleanedRow.taxipassengers) errors.push('Taxi passengers required when taxi distance provided');
  //     if (!cleanedRow.taxidistancekm) errors.push('Taxi distance required when taxi passengers provided');
  //   }

  //   // Taxi type validation - case insensitive
  //   if (cleanedRow.taxitype) {
  //     const validTaxiTypes = TAXI_TYPES.map(t => t.value);
  //     const matchedTaxiType = validTaxiTypes.find(tt =>
  //       tt.toLowerCase() === cleanedRow.taxitype.toLowerCase()
  //     );
  //     if (!matchedTaxiType) {
  //       errors.push(`Invalid taxi type "${cleanedRow.taxitype}"`);
  //     } else {
  //       cleanedRow.taxitype = matchedTaxiType;
  //     }
  //   }

  //   // Bus validations
  //   if (cleanedRow.buspassengers || cleanedRow.busdistancekm) {
  //     if (!cleanedRow.buspassengers) errors.push('Bus passengers required when bus distance provided');
  //     if (!cleanedRow.busdistancekm) errors.push('Bus distance required when bus passengers provided');
  //   }

  //   // Bus type validation - case insensitive
  //   if (cleanedRow.bustype) {
  //     const validBusTypes = BUS_TYPES.map(b => b.value);
  //     const matchedBusType = validBusTypes.find(bt =>
  //       bt.toLowerCase() === cleanedRow.bustype.toLowerCase()
  //     );
  //     if (!matchedBusType) {
  //       errors.push(`Invalid bus type "${cleanedRow.bustype}"`);
  //     } else {
  //       cleanedRow.bustype = matchedBusType;
  //     }
  //   }

  //   // Train validations
  //   if (cleanedRow.trainpassengers || cleanedRow.traindistancekm) {
  //     if (!cleanedRow.trainpassengers) errors.push('Train passengers required when train distance provided');
  //     if (!cleanedRow.traindistancekm) errors.push('Train distance required when train passengers provided');
  //   }

  //   // Train type validation - case insensitive
  //   if (cleanedRow.traintype) {
  //     const validTrainTypes = TRAIN_TYPES.map(t => t.value);
  //     const matchedTrainType = validTrainTypes.find(tt =>
  //       tt.toLowerCase() === cleanedRow.traintype.toLowerCase()
  //     );
  //     if (!matchedTrainType) {
  //       errors.push(`Invalid train type "${cleanedRow.traintype}"`);
  //     } else {
  //       cleanedRow.traintype = matchedTrainType;
  //     }
  //   }

  //   // Date validation
  //   if (cleanedRow.postingdate) {
  //     const isoDate = parseDateToISO(cleanedRow.postingdate);
  //     if (!isoDate) {
  //       errors.push(`Invalid date format: "${cleanedRow.postingdate}"`);
  //     } else {
  //       cleanedRow.postingdate = isoDate;
  //     }
  //   } else {
  //     cleanedRow.postingdate = new Date(
  //       Date.UTC(
  //         new Date().getFullYear(),
  //         new Date().getMonth(),
  //         new Date().getDate(),
  //         0, 0, 0, 0
  //       )
  //     ).toISOString();
  //   }

  //   // Remarks validation
  //   if (cleanedRow.remarks && cleanedRow.remarks.length > 500) {
  //     errors.push('Remarks cannot exceed 500 characters');
  //   }

  //   if (errors.length === 0) {
  //     Object.keys(cleanedRow).forEach(key => {
  //       row[key] = cleanedRow[key];
  //     });
  //   }

  //   return errors;
  // }, [buildings, parseDateToISO]);
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

    //friendly header
      'didyouhaveanybusinesstravelbyairduringthereportingperiod': 'didtravelbyair',
  'didyouhaveanybusinesstravelbytaxiduringthereportingperiod': 'didtravelbytaxi',
  'didyouhaveanybusinesstravelbybusduringthereportingperiod': 'didtravelbybus',
  'didyouhaveanybusinesstravelbytrainduringthereportingperiod': 'didtravelbytrain',
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

  // Stakeholder validation with flexible matching
  if (cleanedRow.stakeholder) {
    const validStakeholders = stakeholderOptions.map(s => s.value);
    const matchedStakeholder = findFlexibleMatch(cleanedRow.stakeholder, validStakeholders);

    if (!matchedStakeholder) {
      errors.push(`Invalid stakeholder "${cleanedRow.stakeholder}"`);
    } else {
      cleanedRow.stakeholder = matchedStakeholder;
    }
  }

  // Fuel Type validation
  if (cleanedRow.fueltype) {
    const validFuelTypes = fuelEnergyTypes.map(f => f.value);
    const matchedFuelType = findFlexibleMatch(cleanedRow.fueltype, validFuelTypes);
    if (!matchedFuelType) {
      errors.push(`Invalid fuel type "${cleanedRow.fueltype}"`);
    } else {
      cleanedRow.fueltype = matchedFuelType;
    }
  }

  // Fuel Name validation
  if (cleanedRow.fueltype && cleanedRow.fuel) {
    const validFuels = fuelEnergyTypesChildTypes[cleanedRow.fueltype]?.map(f => f.value) || [];
    const matchedFuel = findFlexibleMatch(cleanedRow.fuel, validFuels);

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
    const matchedUnit = findFlexibleMatch(cleanedRow.unit, validUnits);
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
    const matchedQC = findFlexibleMatch(cleanedRow.qualitycontrol, validQC);
    if (!matchedQC) {
      errors.push(`Invalid quality control "${cleanedRow.qualitycontrol}"`);
    } else {
      cleanedRow.qualitycontrol = matchedQC;
    }
  }

  
// ============ CLEAR TRAVEL DATA WHEN TOGGLE IS NO/FALSE/EMPTY ============
// This runs BEFORE travel validations to wipe any stray data

const clearTravelFields = (fields) => {
  fields.forEach(field => { cleanedRow[field] = ''; });
};

const isTravelFlagActive = (flag) => {
  if (!flag) return false;
  const val = flag.toString().toLowerCase().trim();
  return val === 'yes' || val === 'true' || val === '1';
};

// Air — clear if not explicitly Yes
if (!isTravelFlagActive(cleanedRow.didtravelbyair)) {
  cleanedRow.didtravelbyair = 'No';
  clearTravelFields(['airpassengers', 'airdistancekm', 'airtravelclass', 'airflighttype']);
}

// Taxi — clear if not explicitly Yes
if (!isTravelFlagActive(cleanedRow.didtravelbytaxi)) {
  cleanedRow.didtravelbytaxi = 'No';
  clearTravelFields(['taxipassengers', 'taxidistancekm', 'taxitype']);
}

// Bus — clear if not explicitly Yes
if (!isTravelFlagActive(cleanedRow.didtravelbybus)) {
  cleanedRow.didtravelbybus = 'No';
  clearTravelFields(['buspassengers', 'busdistancekm', 'bustype']);
}

// Train — clear if not explicitly Yes
if (!isTravelFlagActive(cleanedRow.didtravelbytrain)) {
  cleanedRow.didtravelbytrain = 'No';
  clearTravelFields(['trainpassengers', 'traindistancekm', 'traintype']);
}

  // ============ TRAVEL VALIDATIONS (NEW - EXPLICIT VERSION) ============
  
  // Air travel validation
  // Air travel validation
  if (cleanedRow.didtravelbyair) {
    const travelByAir = cleanedRow.didtravelbyair.toString().toLowerCase();
    const isAirTravelSelected = travelByAir === 'yes' || travelByAir === 'true' || travelByAir === '1';

    if (isAirTravelSelected) {
      // Check passengers
      if (isNA(cleanedRow.airpassengers) || cleanedRow.airpassengers === '0') {
        errors.push('Air passengers required when air travel is Yes');
      } else {
        const numPassengers = Number(cleanedRow.airpassengers.toString().replace(/[^0-9.-]/g, ''));
        if (isNaN(numPassengers) || numPassengers <= 0) {
          errors.push('Air passengers must be a positive number');
        }
      }

      // Check distance
      if (isNA(cleanedRow.airdistancekm) || cleanedRow.airdistancekm === '0') {
        errors.push('Air distance required when air travel is Yes');
      } else {
        const numDistance = Number(cleanedRow.airdistancekm.toString().replace(/[^0-9.-]/g, ''));
        if (isNaN(numDistance) || numDistance <= 0) {
          errors.push('Air distance must be a positive number');
        }
      }

      // Check travel class
      if (isNA(cleanedRow.airtravelclass)) {
        errors.push('Air travel class required when air travel is Yes');
      }

      // Check flight type - CRITICAL CHECK
      if (isNA(cleanedRow.airflighttype)) {
        errors.push('Flight type required when air travel is Yes');
      } else {
        const validFlightTypes = AIR_FLIGHT_TYPES.map(f => f.value);
        const matchedFlightType = findFlexibleMatch(cleanedRow.airflighttype, validFlightTypes);
        if (!matchedFlightType) {
          errors.push(`Invalid air flight type "${cleanedRow.airflighttype}"`);
        } else {
          cleanedRow.airflighttype = matchedFlightType;
        }
      }

      // Validate travel class if provided
      if (!isNA(cleanedRow.airtravelclass) && !isNA(cleanedRow.airflighttype)) {
        const validClasses = AIR_TRAVEL_OPTIONS[cleanedRow.airflighttype]?.map(c => c.value) || [];
        const matchedClass = findFlexibleMatch(cleanedRow.airtravelclass, validClasses);
        if (!matchedClass) {
          errors.push(`Invalid travel class "${cleanedRow.airtravelclass}" for ${cleanedRow.airflighttype}`);
        } else {
          cleanedRow.airtravelclass = matchedClass;
        }
      }
    }
  }

  // Taxi travel validation
  if (cleanedRow.didtravelbytaxi) {
    const travelByTaxi = cleanedRow.didtravelbytaxi.toString().toLowerCase();
    const isTaxiTravelSelected = travelByTaxi === 'yes' || travelByTaxi === 'true' || travelByTaxi === '1';
    
    if (isTaxiTravelSelected) {
      if (!cleanedRow.taxipassengers || cleanedRow.taxipassengers === '' || cleanedRow.taxipassengers === '0') {
        errors.push('Taxi passengers required when taxi travel is Yes');
      }
      if (!cleanedRow.taxidistancekm || cleanedRow.taxidistancekm === '' || cleanedRow.taxidistancekm === '0') {
        errors.push('Taxi distance required when taxi travel is Yes');
      }
      if (!cleanedRow.taxitype || cleanedRow.taxitype === '') {
        errors.push('Taxi type required when taxi travel is Yes');
      } else {
        const validTaxiTypes = TAXI_TYPES.map(t => t.value);
        const matchedTaxiType = findFlexibleMatch(cleanedRow.taxitype, validTaxiTypes);
        if (!matchedTaxiType) {
          errors.push(`Invalid taxi type "${cleanedRow.taxitype}"`);
        } else {
          cleanedRow.taxitype = matchedTaxiType;
        }
      }
    }
  }

  // Bus travel validation
  if (cleanedRow.didtravelbybus) {
    const travelByBus = cleanedRow.didtravelbybus.toString().toLowerCase();
    const isBusTravelSelected = travelByBus === 'yes' || travelByBus === 'true' || travelByBus === '1';
    
    if (isBusTravelSelected) {
      if (!cleanedRow.buspassengers || cleanedRow.buspassengers === '' || cleanedRow.buspassengers === '0') {
        errors.push('Bus passengers required when bus travel is Yes');
      }
      if (!cleanedRow.busdistancekm || cleanedRow.busdistancekm === '' || cleanedRow.busdistancekm === '0') {
        errors.push('Bus distance required when bus travel is Yes');
      }
      if (!cleanedRow.bustype || cleanedRow.bustype === '') {
        errors.push('Bus type required when bus travel is Yes');
      } else {
        const validBusTypes = BUS_TYPES.map(b => b.value);
        const matchedBusType = findFlexibleMatch(cleanedRow.bustype, validBusTypes);
        if (!matchedBusType) {
          errors.push(`Invalid bus type "${cleanedRow.bustype}"`);
        } else {
          cleanedRow.bustype = matchedBusType;
        }
      }
    }
  }

  // Train travel validation
  if (cleanedRow.didtravelbytrain) {
    const travelByTrain = cleanedRow.didtravelbytrain.toString().toLowerCase();
    const isTrainTravelSelected = travelByTrain === 'yes' || travelByTrain === 'true' || travelByTrain === '1';
    
    if (isTrainTravelSelected) {
      if (!cleanedRow.trainpassengers || cleanedRow.trainpassengers === '' || cleanedRow.trainpassengers === '0') {
        errors.push('Train passengers required when train travel is Yes');
      }
      if (!cleanedRow.traindistancekm || cleanedRow.traindistancekm === '' || cleanedRow.traindistancekm === '0') {
        errors.push('Train distance required when train travel is Yes');
      }
      if (!cleanedRow.traintype || cleanedRow.traintype === '') {
        errors.push('Train type required when train travel is Yes');
      } else {
        const validTrainTypes = TRAIN_TYPES.map(t => t.value);
        const matchedTrainType = findFlexibleMatch(cleanedRow.traintype, validTrainTypes);
        if (!matchedTrainType) {
          errors.push(`Invalid train type "${cleanedRow.traintype}"`);
        } else {
          cleanedRow.traintype = matchedTrainType;
        }
      }
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

  // Development debug logging to help trace why air flight type may be missing
  try {
    if (process.env.NODE_ENV === 'development') {
      const travelByAirFlag = cleanedRow.didtravelbyair && cleanedRow.didtravelbyair.toString().toLowerCase();
      if (travelByAirFlag === 'yes') {
        console.debug('[CSV Validation] validateFuelAndEnergyRow', {
          rowIndex: index,
          didtravelbyair: cleanedRow.didtravelbyair,
          airflighttype: cleanedRow.airflighttype,
          airtravelclass: cleanedRow.airtravelclass,
          airpassengers: cleanedRow.airpassengers,
          airdistancekm: cleanedRow.airdistancekm,
          errorsSnapshot: errors.slice(),
        });
      }
    }
  } catch (e) {
    // swallow debug errors
  }

  if (errors.length === 0) {
    Object.keys(cleanedRow).forEach(key => {
      row[key] = cleanedRow[key];
    });
  }

  return errors;
}, [buildings, parseDateToISO, findFlexibleMatch, isNA]);

 const transformFuelAndEnergyPayload = useCallback((row) => {

  Object.keys(row).forEach(key => {
    const lk = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (lk.includes('travelbyair'))   row['didtravelbyair']   = row[key];
    if (lk.includes('travelbytaxi'))  row['didtravelbytaxi']  = row[key];
    if (lk.includes('travelbybus'))   row['didtravelbybus']   = row[key];
    if (lk.includes('travelbytrain')) row['didtravelbytrain'] = row[key];
  });

  //  ADD THIS — determine which toggles are actually active
  const isFlagActive = (flag) => {
    if (!flag) return false;
    const val = flag.toString().toLowerCase().trim();
    return val === 'yes' || val === 'true' || val === '1';
  };

  const airActive   = isFlagActive(row.didtravelbyair);
  const taxiActive  = isFlagActive(row.didtravelbytaxi);
  const busActive   = isFlagActive(row.didtravelbybus);
  const trainActive = isFlagActive(row.didtravelbytrain);

  const emission = calculateFuelAndEnergy({
    fuelType: row.fueltype,
    fuel: row.fuel,
    totalFuelConsumption: row.totalfuelconsumption ? Number(row.totalfuelconsumption) : 0,
    fuelConsumptionUnit: row.fuelconsumptionunit,
    totalGrossElectricityPurchased: row.totalgrosselectricitypurchased ? Number(row.totalgrosselectricitypurchased) : 0,
    unit: row.unit,

    //  Only pass travel data if toggle is active, otherwise force 0/null
    airPassengers:  airActive  ? Number(row.airpassengers)  : 0,
    airDistanceKm:  airActive  ? Number(row.airdistancekm)  : 0,
    airTravelClass: airActive  ? row.airtravelclass          : null,
    airFlightType:  airActive  ? row.airflighttype           : null,

    taxiPassengers: taxiActive ? Number(row.taxipassengers) : 0,
    taxiDistanceKm: taxiActive ? Number(row.taxidistancekm) : 0,
    taxiType:       taxiActive ? row.taxitype                : null,

    busPassengers:  busActive  ? Number(row.buspassengers)  : 0,
    busDistanceKm:  busActive  ? Number(row.busdistancekm)  : 0,
    busType:        busActive  ? row.bustype                 : null,

    trainPassengers: trainActive ? Number(row.trainpassengers) : 0,
    trainDistanceKm: trainActive ? Number(row.traindistancekm) : 0,
    trainType:       trainActive ? row.traintype               : null,
  });

  const capitalizeFirstLetter = (text) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  return {
    buildingCode: row.buildingcode,
    stakeholder: row.stakeholder,
    fuelType: row.fueltype,
    fuel: row.fuel,
    totalFuelConsumption: cleanNumberValue(row.totalfuelconsumption),
    fuelConsumptionUnit: cleanStringValue(row.fuelconsumptionunit),
    totalGrossElectricityPurchased: cleanNumberValue(row.totalgrosselectricitypurchased),
    unit: cleanStringValue(row.unit),
    qualityControl: row.qualitycontrol,
    remarks: capitalizeFirstLetter(cleanStringValue(row.remarks) || ''),
    postingDate: row.postingdate,
    calculatedEmissionKgCo2e: emission.totalEmissions_KgCo2e || 0,
    calculatedEmissionTCo2e: emission.totalEmissions_TCo2e || 0,

    //  Only populate travel fields if toggle is active
    didTravelByAir: airActive,
    airPassengers:  airActive ? cleanNumberValue(row.airpassengers)  : null,
    airDistanceKm:  airActive ? cleanNumberValue(row.airdistancekm)  : null,
    airTravelClass: airActive ? cleanStringValue(row.airtravelclass)  : null,
    airFlightType:  airActive ? cleanStringValue(row.airflighttype)   : null,

    didTravelByTaxi: taxiActive,
    taxiPassengers:  taxiActive ? cleanNumberValue(row.taxipassengers) : null,
    taxiDistanceKm:  taxiActive ? cleanNumberValue(row.taxidistancekm) : null,
    taxiType:        taxiActive ? cleanStringValue(row.taxitype)        : null,

    didTravelByBus: busActive,
    busPassengers:  busActive ? cleanNumberValue(row.buspassengers) : null,
    busDistanceKm:  busActive ? cleanNumberValue(row.busdistancekm) : null,
    busType:        busActive ? cleanStringValue(row.bustype)        : null,

    didTravelByTrain: trainActive,
    trainPassengers:  trainActive ? cleanNumberValue(row.trainpassengers) : null,
    trainDistanceKm:  trainActive ? cleanNumberValue(row.traindistancekm) : null,
    trainType:        trainActive ? cleanStringValue(row.traintype)        : null,
  };
}, [cleanNumberValue, cleanStringValue]);

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
      'Building Code',
      'Stakeholder',
      'Fuel Type',
      'Fuel',
      'Total Fuel Consumption',
      'Fuel Consumption Unit',
      'Total Purchased Electricity (Grid / Supplier Specific / PPA)',
      'Unit',
      'Did You Have Any Business Travel By Air During The Reporting Period?',
      'No Of Passenger (Air)',
      'Distance Travelled (Air)',
      'Travel Class',
      'Flight Type',
      'Did You Have Any Business Travel By Taxi During The Reporting Period?',
      'No Of Passenger (Taxi)',
      'Distance Travelled (Taxi)',
      'Taxi Type',
      'Did You Have Any Business Travel By Bus During The Reporting Period?',
      'No Of Passenger (Bus)',
      'Distance Travelled (Bus)',
      'Bus Type',
      'Did You Have Any Business Travel By Train During The Reporting Period?',
      'No Of Passenger (Train)',
      'Distance Travelled (Train)',
      'Train Type',
      'Quality Control',
      'Remarks',
      'Posting Date',
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
      exampleTrainType,
      exampleQC,
      'Example record',
      formattedDate,
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

