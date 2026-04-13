// src/hooks/scope2/usePurchasedElectricityCSVUpload.js
import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as XLSX from "xlsx";
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

          const generateKey = (header) => {
            const lower = header.toLowerCase().trim();
            
            if (lower.includes('calculation method')) return 'method';
            if (lower.includes('building code')) return 'buildingcode';
            if (lower.includes('unit')) return 'unit';
            if (lower.includes('total other supplier') && lower.includes('ppa')) return 'totalothersupplierelectricity';
            if (lower.includes('total purchased electricity')) return 'totalpurchasedelectricity';
            if (lower.includes('total gross electricity purchased from grid')) return 'totalgrosselectricitygrid';
            if (lower.includes('grid station') && !lower.includes('total')) return 'gridstation';
            if (lower.includes('own solar panels') || lower.includes('renewable electricity generation plant')) return 'hassolarpanels';
            if (lower.includes('total onsite solar electricity consumption')) return 'totalonsitesolarconsumption';
            if (lower.includes('solar electricity is retained by you under valid recs')) return 'solarretainedunderrecs';
            if (lower.includes('solar electricity is consumed by you but its renewable instruments')) return 'solarconsumedbutsold';
            if (lower.includes('purchase supplier specific electricity') && !lower.includes('how much')) return 'purchasessupplierspecific';
            if (lower.includes('how much electricity') && lower.includes('purchased from specific supplier')) return 'supplierspecificelectricity';
            if (lower.includes('do you have the supplier specific emission factor') && !lower.includes("don't") && !lower.includes('ppa')) return 'hassupplieremissionfactor';
            if (lower === 'emission factor' || (lower.includes('emission factor') && !lower.includes('ppa') && !lower.includes('have'))) return 'supplieremissionfactor';
            if (lower.includes("don't have supplier specific emission factor")) return 'donthavesupplieremissionfactor';
            if (lower.includes('do you purchase electricity under power purchase agreements') && !lower.includes('how much')) return 'hasppa';
            if (lower.includes('how much electricity') && lower.includes('power purchase agreement') && !lower.includes('valid') && !lower.includes('attributes')) return 'ppaelectricity';
            if (lower.includes('do you have the supplier specific emission factor') && lower.includes('power purchased agreement')) return 'hasppaemissionfactor';
            if (lower.includes('ppa emission factor') || (lower.includes('emission factor') && lower.includes('ppa'))) return 'ppaemissionfactor';
            // if ((lower.includes('valid energy instruments') || lower.includes('rec') && lower.includes('ppa')) && !lower.includes('how much')) return 'hasppavalidinstruments';
            // if (lower.includes('any other types of renewable energy attributes') || (lower.includes('renewable energy attributes') && !lower.includes('ppa'))) return 'hasrenewableattributes';
            if (lower.includes('any other types of renewable energy attributes') || lower.includes('separate from power purchase')) return 'hasrenewableattributes';  // moved up, catches header 19
            if ((lower.includes('valid energy instruments') || (lower.includes('rec') && lower.includes('ppa'))) && !lower.includes('how much') && !lower.includes('separate')) return 'hasppavalidinstruments';  //  'separate' guard added
            if (lower.includes('how much of your total electricity consumption') && lower.includes('renewable energy attributes')) return 'renewableattributeselectricity';
            if (lower.includes('total electricity consumption') && !lower.includes('grid') && !lower.includes('purchased')) return 'totalelectricity';
            if (lower.includes('quality control')) return 'qualitycontrol';
            if (lower.includes('remarks')) return 'remarks';
            if (lower.includes('posting date')) return 'postingdate';
            
            return lower.replace(/[^a-z0-9]/g, '');
          };

          const simplifiedHeaders = headerValues.map(h => generateKey(h));
          
          headerValues.forEach((header, index) => {
            console.log(`Header ${index}: "${header}" -> Key: "${simplifiedHeaders[index]}"`);
          });

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

          const generateKey = (header) => {
            const lower = header.toString().toLowerCase().trim();
            
            if (lower.includes('calculation method')) return 'method';
            if (lower.includes('building code')) return 'buildingcode';
            if (lower.includes('unit')) return 'unit';
            if (lower.includes('total other supplier') && lower.includes('ppa')) return 'totalothersupplierelectricity';
            if (lower.includes('total purchased electricity')) return 'totalpurchasedelectricity';
            if (lower.includes('total gross electricity purchased from grid')) return 'totalgrosselectricitygrid';
            if (lower.includes('grid station') && !lower.includes('total')) return 'gridstation';
            if (lower.includes('own solar panels') || lower.includes('renewable electricity generation plant')) return 'hassolarpanels';
            if (lower.includes('total onsite solar electricity consumption')) return 'totalonsitesolarconsumption';
            if (lower.includes('solar electricity is retained by you under valid recs')) return 'solarretainedunderrecs';
            if (lower.includes('solar electricity is consumed by you but its renewable instruments')) return 'solarconsumedbutsold';
            if (lower.includes('purchase supplier specific electricity') && !lower.includes('how much')) return 'purchasessupplierspecific';
            if (lower.includes('how much electricity') && lower.includes('purchased from specific supplier')) return 'supplierspecificelectricity';
            if (lower.includes('do you have the supplier specific emission factor') && !lower.includes("don't") && !lower.includes('ppa')) return 'hassupplieremissionfactor';
            if (lower === 'emission factor' || (lower.includes('emission factor') && !lower.includes('ppa') && !lower.includes('have'))) return 'supplieremissionfactor';
            if (lower.includes("don't have supplier specific emission factor")) return 'donthavesupplieremissionfactor';
            if (lower.includes('do you purchase electricity under power purchase agreements') && !lower.includes('how much')) return 'hasppa';
            if (lower.includes('how much electricity') && lower.includes('power purchase agreement') && !lower.includes('valid') && !lower.includes('attributes')) return 'ppaelectricity';
            if (lower.includes('do you have the supplier specific emission factor') && lower.includes('power purchased agreement')) return 'hasppaemissionfactor';
            // if (lower.includes('ppa emission factor') || (lower.includes('emission factor') && lower.includes('ppa'))) return 'ppaemissionfactor';
            // if ((lower.includes('valid energy instruments') || lower.includes('rec') && lower.includes('ppa')) && !lower.includes('how much')) return 'hasppavalidinstruments';
            if (lower.includes('any other types of renewable energy attributes') || lower.includes('separate from power purchase')) return 'hasrenewableattributes';
            if ((lower.includes('valid energy instruments') || (lower.includes('rec') && lower.includes('ppa'))) && !lower.includes('how much') && !lower.includes('separate')) return 'hasppavalidinstruments';
            if (lower.includes('any other types of renewable energy attributes') || (lower.includes('renewable energy attributes') && !lower.includes('ppa'))) return 'hasrenewableattributes';
            if (lower.includes('how much of your total electricity consumption') && lower.includes('renewable energy attributes')) return 'renewableattributeselectricity';
            if (lower.includes('total electricity consumption') && !lower.includes('grid') && !lower.includes('purchased')) return 'totalelectricity';
            if (lower.includes('quality control')) return 'qualitycontrol';
            if (lower.includes('remarks')) return 'remarks';
            if (lower.includes('posting date')) return 'postingdate';
            
            return lower.replace(/[^a-z0-9]/g, '');
          };

          const simplifiedHeaders = headerValues.map(h => generateKey(h));
          
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

          const parsedData = [];
          for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.every(cell => !cell || cell.toString().trim() === '')) continue;

            const rowData = {};
            simplifiedHeaders.forEach((header, index) => {
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

  const validatePurchasedElectricityRow = useCallback((row, index) => {
    const errors = [];
    
    const headerMapping = {
      'buildingcode': 'buildingcode',
      'building': 'buildingcode',
      'unit': 'unit',
      'qualitycontrol': 'qualitycontrol',
      'quality': 'qualitycontrol',
      'qc': 'qualitycontrol',
      'remarks': 'remarks',
      'remark': 'remarks',
      'postingdate': 'postingdate',
      'date': 'postingdate',
      'totalelectricity': 'totalelectricity',
      'totalelectricityconsumption': 'totalelectricity',
      'totalgrosselectricitygrid': 'totalgrosselectricitygrid',
      'gridstation': 'gridstation',
      'totalothersupplierelectricity': 'totalothersupplierelectricity',
      'totalpurchasedelectricity': 'totalpurchasedelectricity',
      'hassolarpanels': 'hassolarpanels',
      'totalonsitesolarconsumption': 'totalonsitesolarconsumption',
      'solarretainedunderrecs': 'solarretainedunderrecs',
      'solarconsumedbutsold': 'solarconsumedbutsold',
      'purchasessupplierspecific': 'purchasessupplierspecific',
      'supplierspecificelectricity': 'supplierspecificelectricity',
      'hassupplieremissionfactor': 'hassupplieremissionfactor',
      'supplieremissionfactor': 'supplieremissionfactor',
      'donthavesupplieremissionfactor': 'donthavesupplieremissionfactor',
      'hasppa': 'hasppa',
      'ppaelectricity': 'ppaelectricity',
      'hasppaemissionfactor': 'hasppaemissionfactor',
      'ppaemissionfactor': 'ppaemissionfactor',
      'hasppavalidinstruments': 'hasppavalidinstruments',
      'hasrenewableattributes': 'hasrenewableattributes',
      'renewableattributeselectricity': 'renewableattributeselectricity',
    };

    const cleanedRow = {};

    Object.keys(row).forEach(key => {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      const mappedKey = headerMapping[normalizedKey] || normalizedKey;
      cleanedRow[mappedKey] = row[key]?.toString().trim() || '';
    });

    console.log(`Row ${index + 1} - Cleaned row after mapping:`, cleanedRow);

    if (!cleanedRow.buildingcode) errors.push('buildingcode is required');
    if (!cleanedRow.unit) errors.push('unit is required');
    if (!cleanedRow.qualitycontrol) errors.push('qualitycontrol is required');
    if (!cleanedRow.postingdate) errors.push('postingdate is required');

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

    const isYes = (value) => {
      if (!value) return false;
      const val = value.toString().toLowerCase().trim();
      return val === 'yes' || val === 'true' || val === '1';
    };

    if (cleanedRow.method === 'location_based') {
      if (!cleanedRow.totalelectricity) {
        errors.push('totalElectricity is required for Location Based method');
      }
      
      const hasGrid = cleanedRow.totalgrosselectricitygrid && cleanedRow.totalgrosselectricitygrid !== '';
      const hasOtherSupplier = cleanedRow.totalothersupplierelectricity && cleanedRow.totalothersupplierelectricity !== '';
      
      if (!hasGrid && !hasOtherSupplier) {
        errors.push('Either Total Gross Electricity Grid or Total Other Supplier Electricity must be provided for Location Based method');
      }
      
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

      const hasSolarPanels = isYes(cleanedRow.hassolarpanels);
      const hasSupplierSpecific = isYes(cleanedRow.purchasessupplierspecific);
      const hasPPA = isYes(cleanedRow.hasppa);
      const hasRenewableAttributes = isYes(cleanedRow.hasrenewableattributes);

      const hasAtLeastOneToggle = hasSolarPanels || hasSupplierSpecific || hasPPA || hasRenewableAttributes;

      if (!hasAtLeastOneToggle) {
        errors.push('At least one option (Solar Panels, Supplier Specific, PPA, or Renewable Attributes) must be selected for Market Based method');
      }

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

      if (hasSupplierSpecific) {
        if (!cleanedRow.supplierspecificelectricity) {
          errors.push('supplierSpecificElectricity is required when Supplier Specific is Yes');
        }
        
        const hasEmissionFactor = isYes(cleanedRow.hassupplieremissionfactor);
        const hasNoEmissionFactor = isYes(cleanedRow.donthavesupplieremissionfactor);
         
       // Check if both are selected shouldn't happen with radio buttons, but validate anyway
    if (hasEmissionFactor && hasNoEmissionFactor) {
        errors.push('Cannot select both hasSupplierEmissionFactor and dontHaveSupplierEmissionFactor. Please choose only one option.');
    }

        if (!hasEmissionFactor && !hasNoEmissionFactor) {
          errors.push('Either hasSupplierEmissionFactor or dontHaveSupplierEmissionFactor must be selected for Supplier Specific');
        }

        if (hasEmissionFactor && !cleanedRow.supplieremissionfactor) {
          errors.push('supplierEmissionFactor is required when hasSupplierEmissionFactor is Yes');
        }
      }

      if (hasPPA) {
        if (!cleanedRow.ppaelectricity) {
          errors.push('ppaElectricity is required when PPA is Yes');
        }
        
        const hasEmissionFactor = isYes(cleanedRow.hasppaemissionfactor);
        const hasValidInstruments = isYes(cleanedRow.hasppavalidinstruments);

          if (hasEmissionFactor && hasValidInstruments) {
        errors.push('Cannot select both hasppaemissionfactor and hasppavalidinstruments. Please choose only one option.');
    }

        if (!hasEmissionFactor && !hasValidInstruments) {
          errors.push('Either hasPPAEmissionFactor or hasPPAValidInstruments must be selected for PPA');
        }

        if (hasEmissionFactor && !cleanedRow.ppaemissionfactor) {
          errors.push('ppaEmissionFactor is required when hasPPAEmissionFactor is Yes');
        }
      }

      if (hasRenewableAttributes && !cleanedRow.renewableattributeselectricity) {
        errors.push('renewableAttributesElectricity is required when Renewable Attributes is Yes');
      }
    }

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

    if (cleanedRow.postingdate) {
      const isoDate = parseDateToISO(cleanedRow.postingdate);

      if (!isoDate) {
        errors.push(`Invalid date format: "${cleanedRow.postingdate}". Please provide a valid date (e.g., 15/01/2024, 2024-01-15)`);
      } else {
        cleanedRow.postingdate = isoDate;
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
  }, [buildings, parseDateToISO]);

  const transformPurchasedElectricityPayload = useCallback((row) => {
    const userId = localStorage.getItem('userId');

    const toBoolean = (value) => {
      if (!value) return false;
      const val = value.toString().toLowerCase().trim();
      return val === 'yes' || val === 'true' || val === '1';
    };

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

    const result = calculatePurchasedElectricity(calculationData, GridStationEmissionFactors);

    const capitalizeFirstLetter = (text) => {
      if (!text) return "";
      return text.charAt(0).toUpperCase() + text.slice(1);
    };

   return {
  buildingCode: row.buildingcode,
  method: row.method,
  unit: row.unit,
  totalElectricity: cleanNumberValue(row.totalelectricity, 'Total electricity'),
  totalGrossElectricityGrid: cleanNumberValue(row.totalgrosselectricitygrid, 'Total gross electricity grid'),
  gridStation: cleanStringValue(row.gridstation),
  totalOtherSupplierElectricity: cleanNumberValue(row.totalothersupplierelectricity, 'Total other supplier electricity'),
  totalPurchasedElectricity: cleanNumberValue(row.totalpurchasedelectricity, 'Total purchased electricity'),
  hasSolarPanels: toBoolean(row.hassolarpanels),
  totalOnsiteSolarConsumption: cleanNumberValue(row.totalonsitesolarconsumption, 'Total onsite solar consumption'),
  solarRetainedUnderRECs: cleanNumberValue(row.solarretainedunderrecs, 'Solar retained under RECs'),
  solarConsumedButSold: cleanNumberValue(row.solarconsumedbutsold, 'Solar consumed but sold'),
  purchasesSupplierSpecific: toBoolean(row.purchasessupplierspecific),
  supplierSpecificElectricity: cleanNumberValue(row.supplierspecificelectricity, 'Supplier specific electricity'),
  hasSupplierEmissionFactor: toBoolean(row.hassupplieremissionfactor),
  dontHaveSupplierEmissionFactor: toBoolean(row.donthavesupplieremissionfactor),
  supplierEmissionFactor: cleanNumberValue(row.supplieremissionfactor, 'Supplier emission factor'),
  hasPPA: toBoolean(row.hasppa),
  ppaElectricity: cleanNumberValue(row.ppaelectricity, 'PPA electricity'),
  hasPPAEmissionFactor: toBoolean(row.hasppaemissionfactor),
  hasPPAValidInstruments: toBoolean(row.hasppavalidinstruments),
  ppaEmissionFactor: cleanNumberValue(row.ppaemissionfactor, 'PPA emission factor'),
  hasRenewableAttributes: toBoolean(row.hasrenewableattributes),
  renewableAttributesElectricity: cleanNumberValue(row.renewableattributeselectricity, 'Renewable attributes electricity'),
  qualityControl: row.qualitycontrol,
  remarks: capitalizeFirstLetter(cleanStringValue(row.remarks) || ''),
  postingDate: row.postingdate,
  calculatedEmissionKgCo2e: result?.calculatedEmissionKgCo2e || 0,
  calculatedEmissionTCo2e: result?.calculatedEmissionTCo2e || 0,
  calculatedEmissionMarketKgCo2e: result?.calculatedEmissionMarketKgCo2e || null,
  calculatedEmissionMarketTCo2e: result?.calculatedEmissionMarketTCo2e || null,
  createdBy: userId,
  updatedBy: userId,
};
  }, []);

  const handleFileSelect = async (file, selectedMethod) => {
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
        row.method = selectedMethod;
        const rowErrors = validatePurchasedElectricityRow(row, index);
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

const downloadPurchasedElectricityTemplate = useCallback((selectedMethod) => {
  const exampleBuildings = buildings.slice(0, 1);
  const exampleBuildingCode = exampleBuildings[0]?.buildingCode || 'BLD-4334';
  const exampleQC = 'Good';
  const exampleUnit = 'kWh';
  const exampleGridStation = 'Hyderabad Electric Supply Company (HESCO)';

  // Use a valid example date in DD/MM/YYYY format (not future date)
  const exampleDate = '03/04/2026'; // 3rd April 2026

  let headers = [];
  let exampleRow = [];

  if (selectedMethod === 'location_based') {
    headers = [
      'Building Code',
      'Total Electricity Consumption',
      'Unit',
      'Total Gross Electricity Purchased from Grid Station',
      'Grid Station',
      'Total other Supplier Specific Electricity Purchased or Purchased Under Power Purchased Agreement (PPA)',
      'Quality Control',
      'Remarks',
      'Posting Date'
    ];
    
    exampleRow = [
      exampleBuildingCode,
      '1500',
      exampleUnit,
      '1000',
      exampleGridStation,
      '500',
      exampleQC,
      'Example location based record',
      exampleDate // Using fixed valid date
      
    ];
  } else {
    headers = [
      'Building Code',
      'Total Purchased Electricity (Grid / Supplier Specific / PPA)',
      'Unit',
      'Total Gross Electricity Purchased from Grid Station',
      'Grid Station',
      'Do you have your own solar panels or any other renewable electricity generation plant installed at your facility that is retained by you under valid renewable energy instruments?',
      'What is the total onsite solar electricity consumption?',
      'How much solar electricity is retained by you under valid RECs or any other energy attributes?',
      'How much solar electricity is consumed by you but its renewable instruments or attributes is sold by you to another entity?',
      'Do you purchase supplier specific electricity?',
      'How much electricity from total electricity consumption is purchased from specific supplier under contractual instrument?',
      'Do you have the supplier specific emission factor in kgCO2e/kWh for purchased supplier specific electricity under contractual instrument?',
      'Emission Factor',
      'I don\'t have supplier specific emission factor',
      'Do you purchase electricity under power purchase agreements (PPA)?',
      'How much electricity from total electricity consumption is purchased or covered under power purchase agreement (PPA)?',
      'Do you have the supplier specific emission factor in kgCO2e/kWh for purchased electricity under power purchased agreement (PPA)?',
      'PPA Emission Factor',
      'Or do you have the valid energy instruments or renewable energy attributes (REC / REC-I) etc. under power purchased agreements (PPA)?',
      'Do you have any other Types of Renewable energy attributes market-based instruments or renewable energy certificates (RECs) that are separate from power purchase agreements (PPA) and from those covering on-site renewable electricity generation?',
      'How much of your total electricity consumption (excluding solar generation and PPA-Covered electricity) is covered by valid renewable energy attributes or market-based instruments?',
      'Quality Control',
      'Remarks',
      'Posting Date'
    ];
    
    exampleRow = [
      exampleBuildingCode,
      '1500',
      exampleUnit,
      '1000',
      exampleGridStation,
      'Yes',
      '500',
      '400',
      '100',
      'Yes',
      '300',
      'Yes',
      '0.5',
      'No',
      'Yes',
      '200',
      'Yes',
      '0.4',
      'No',
      'Yes',
      '150',
      exampleQC,
      'Example market based record',
      exampleDate // Using fixed valid date
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
    wch: Math.min(Math.max(header.length, 15), 50)
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
    selectedMethod === 'location_based' ? 'Location Based Template' : 'Market Based Template');

  // Download the Excel file
  XLSX.writeFile(workbook, `purchased_electricity_${selectedMethod}_template.xlsx`);
}, [buildings]);



// const downloadPurchasedElectricityTemplate = useCallback((selectedMethod) => {
//   const exampleBuildings = buildings.slice(0, 1);
//   const exampleBuildingCode = exampleBuildings[0]?.buildingCode || 'BLD-4334';
//   const exampleQC = 'Good';
//   const exampleUnit = 'kWh';
//   const exampleGridStation = 'Hyderabad Electric Supply Company (HESCO)';

//   // Use a valid example date in DD/MM/YYYY format (not future date)
//   const exampleDate = '03/04/2026'; // 3rd April 2026

//   // Helper function to insert line breaks at logical positions
//   const wrapHeader = (text, maxLength = 45) => {
//     if (!text || text.length <= maxLength) return text;
    
//     // Insert \n after specific phrases for better readability
//     const breakPoints = [
//       'Installed At Your Facility',
//       'Renewable Energy Instruments?',
//       'Valid RECs Or Any Other',
//       'To Another Entity?',
//       'Under Contractual Instrument?',
//       'For Purchased Supplier Specific Electricity',
//       'Under Power Purchased Agreement (PPA)?',
//       'Or Renewable Energy Certificates (RECs)',
//       'And From Those Covering On-Site',
//       'Renewable Electricity Generation?',
//     ];
    
//     let result = text;
//     for (const point of breakPoints) {
//       result = result.replace(point, point + '\n');
//     }
    
//     // If still too long, add breaks at word boundaries
//     if (result.length > maxLength + 20 && !result.includes('\n')) {
//       const words = result.split(' ');
//       let lines = [];
//       let currentLine = '';
      
//       for (const word of words) {
//         if ((currentLine + ' ' + word).length > maxLength) {
//           lines.push(currentLine.trim());
//           currentLine = word;
//         } else {
//           currentLine += (currentLine ? ' ' : '') + word;
//         }
//       }
//       if (currentLine) lines.push(currentLine.trim());
//       result = lines.join('\n');
//     }
    
//     return result;
//   };

//   // Pre-wrapped headers for complete control
//   const getWrappedHeader = (header) => {
//     const wrappedMap = {
//       // Solar Panels question
//       'Do You Have Your Own Solar Panels Or Any Other Renewable Electricity Generation Plant Installed At Your Facility That Is Retained By You Under Valid Renewable Energy Instruments?':
//         'Do You Have Your Own Solar Panels Or Any Other Renewable Electricity\nGeneration Plant Installed At Your Facility That Is Retained By You\nUnder Valid Renewable Energy Instruments?',
      
//       // Onsite Solar Consumption
//       'What Is The Total Onsite Solar Electricity Consumption?':
//         'What Is The Total Onsite Solar Electricity Consumption?',
      
//       // Solar retained under RECs
//       'How Much Solar Electricity Is Retained By You Under Valid RECs Or Any Other Energy Attributes?':
//         'How Much Solar Electricity Is Retained By You Under Valid RECs\nOr Any Other Energy Attributes?',
      
//       // Solar consumed but sold
//       'How Much Solar Electricity Is Consumed By You But Its Renewable Instruments Or Attributes Is Sold By You To Another Entity?':
//         'How Much Solar Electricity Is Consumed By You But Its Renewable\nInstruments Or Attributes Is Sold By You To Another Entity?',
      
//       // Supplier specific electricity question
//       'How Much Electricity From Total Electricity Consumption Is Purchased From Specific Supplier Under Contractual Instrument?':
//         'How Much Electricity From Total Electricity Consumption Is Purchased\nFrom Specific Supplier Under Contractual Instrument?',
      
//       // Supplier emission factor question
//       'Do You Have The Supplier Specific Emission Factor In kgCO2e/kWh For Purchased Supplier Specific Electricity Under Contractual Instrument?':
//         'Do You Have The Supplier Specific Emission Factor In kgCO2e/kWh\nFor Purchased Supplier Specific Electricity Under Contractual Instrument?',
      
//       // PPA electricity question
//       'How Much Electricity From Total Electricity Consumption Is Purchased Or Covered Under Power Purchase Agreement (PPA)?':
//         'How Much Electricity From Total Electricity Consumption Is Purchased\nOr Covered Under Power Purchase Agreement (PPA)?',
      
//       // PPA emission factor question
//       'Do You Have The Supplier Specific Emission Factor In kgCO2e/kWh For Purchased Electricity Under Power Purchased Agreement (PPA)?':
//         'Do You Have The Supplier Specific Emission Factor In kgCO2e/kWh\nFor Purchased Electricity Under Power Purchased Agreement (PPA)?',
      
//       // Valid energy instruments question
//       'Or Do You Have The Valid Energy Instruments Or Renewable Energy Attributes (REC / REC-I) Etc. Under Power Purchased Agreements (PPA)?':
//         'Or Do You Have The Valid Energy Instruments Or Renewable\nEnergy Attributes (REC / REC-I) Etc. Under Power Purchased Agreements (PPA)?',
      
//       // Renewable attributes separate from PPA
//       'Do You Have Any Other Types Of Renewable Energy Attributes Market-Based Instruments Or Renewable Energy Certificates (RECs) That Are Separate From Power Purchase Agreements (PPA) And From Those Covering On-Site Renewable Electricity Generation?':
//         'Do You Have Any Other Types Of Renewable Energy Attributes\nMarket-Based Instruments Or Renewable Energy Certificates (RECs)\nThat Are Separate From Power Purchase Agreements (PPA)\nAnd From Those Covering On-Site Renewable Electricity Generation?',
      
//       // Renewable attributes coverage
//       'How Much Of Your Total Electricity Consumption (Excluding Solar Generation And PPA-Covered Electricity) Is Covered By Valid Renewable Energy Attributes Or Market-Based Instruments?':
//         'How Much Of Your Total Electricity Consumption\n(Excluding Solar Generation And PPA-Covered Electricity)\nIs Covered By Valid Renewable Energy Attributes\nOr Market-Based Instruments?',
//     };
    
//     return wrappedMap[header] || wrapHeader(header);
//   };

//   let headers = [];
//   let exampleRow = [];

//   if (selectedMethod === 'location_based') {
//     headers = [
//       'Building Code',
//       'Total Electricity Consumption',
//       'Unit',
//       'Total Gross Electricity Purchased From Grid Station',
//       'Grid Station',
//       'Total Other Supplier Specific Electricity Purchased Or Purchased Under Power Purchased Agreement (PPA)',
//       'Quality Control',
//       'Posting Date',
//       'Remarks'
//     ];
    
//     exampleRow = [
//       exampleBuildingCode,
//       '1500',
//       exampleUnit,
//       '1000',
//       exampleGridStation,
//       '500',
//       exampleQC,
//       exampleDate,
//       'Example location based record'
//     ];
//   } else {
//     const rawHeaders = [
//       'Building Code',
//       'Total Purchased Electricity (Grid / Supplier Specific / PPA)',
//       'Unit',
//       'Total Gross Electricity Purchased From Grid Station',
//       'Grid Station',
//       'Quality Control',
//       'Posting Date',
//       'Remarks',
//       'Do You Have Your Own Solar Panels Or Any Other Renewable Electricity Generation Plant Installed At Your Facility That Is Retained By You Under Valid Renewable Energy Instruments?',
//       'What Is The Total Onsite Solar Electricity Consumption?',
//       'How Much Solar Electricity Is Retained By You Under Valid RECs Or Any Other Energy Attributes?',
//       'How Much Solar Electricity Is Consumed By You But Its Renewable Instruments Or Attributes Is Sold By You To Another Entity?',
//       'Do You Purchase Supplier Specific Electricity?',
//       'How Much Electricity From Total Electricity Consumption Is Purchased From Specific Supplier Under Contractual Instrument?',
//       'Do You Have The Supplier Specific Emission Factor In kgCO2e/kWh For Purchased Supplier Specific Electricity Under Contractual Instrument?',
//       'Emission Factor',
//       'I Don\'t Have Supplier Specific Emission Factor',
//       'Do You Purchase Electricity Under Power Purchase Agreements (PPA)?',
//       'How Much Electricity From Total Electricity Consumption Is Purchased Or Covered Under Power Purchase Agreement (PPA)?',
//       'Do You Have The Supplier Specific Emission Factor In kgCO2e/kWh For Purchased Electricity Under Power Purchased Agreement (PPA)?',
//       'PPA Emission Factor',
//       'Or Do You Have The Valid Energy Instruments Or Renewable Energy Attributes (REC / REC-I) Etc. Under Power Purchased Agreements (PPA)?',
//       'Do You Have Any Other Types Of Renewable Energy Attributes Market-Based Instruments Or Renewable Energy Certificates (RECs) That Are Separate From Power Purchase Agreements (PPA) And From Those Covering On-Site Renewable Electricity Generation?',
//       'How Much Of Your Total Electricity Consumption (Excluding Solar Generation And PPA-Covered Electricity) Is Covered By Valid Renewable Energy Attributes Or Market-Based Instruments?',
//     ];
    
//     // Apply wrapping to headers
//     headers = rawHeaders.map(header => getWrappedHeader(header));
    
//     exampleRow = [
//       exampleBuildingCode,
//       '1500',
//       exampleUnit,
//       '1000',
//       exampleGridStation,
//       exampleQC,
//       exampleDate,
//       'Example market based record',
//       'Yes',
//       '500',
//       '400',
//       '100',
//       'Yes',
//       '300',
//       'Yes',
//       '0.5',
//       'No',
//       'Yes',
//       '200',
//       'Yes',
//       '0.4',
//       'No',
//       'Yes',
//       '150'
//     ];
//   }

//   // Create worksheet data with headers and example row
//   const worksheetData = [
//     headers,
//     exampleRow,
//   ];

//   // Create workbook and worksheet
//   const workbook = XLSX.utils.book_new();
//   const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
//   // Apply styles to ALL cells
//   const range = XLSX.utils.decode_range(worksheet['!ref']);
//   for (let R = range.s.r; R <= range.e.r; R++) {
//     for (let C = range.s.c; C <= range.e.c; C++) {
//       const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
//       if (!worksheet[cellAddress]) continue;
      
//       worksheet[cellAddress].s = {
//   font: { bold: true, sz: 11 },
//   fill: { fgColor: { rgb: "E0E0E0" } },
//   alignment: {
//     wrapText: true,        // ✅ this must be here
//     vertical: 'top',
//     horizontal: 'center'
//   }
// };
//     }
//   }
  
//   // Set column widths (wider for text-heavy columns)
//   const colWidths = headers.map((header, index) => {
//     const textHeavyIndices = [8, 9, 10, 11, 13, 14, 18, 19, 21, 22, 23];
//     const isTextHeavy = textHeavyIndices.includes(index);
//     return { wch: isTextHeavy ? 40 : 18 };
//   });
//   worksheet['!cols'] = colWidths;

//   // Style header row separately (bold + background)
//   for (let C = range.s.c; C <= range.e.c; ++C) {
//     const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
//     if (!worksheet[cellAddress]) continue;
    
//     worksheet[cellAddress].s = {
//       font: { bold: true, sz: 11 },
//       fill: { fgColor: { rgb: "E0E0E0" } },
//       alignment: {
//         wrapText: true,
//         vertical: 'top',
//         horizontal: 'center'
//       }
//     };
//   }

//   // Set row heights (auto for all rows)
//   const rowCount = range.e.r - range.s.r + 1;
//   // worksheet['!rows'] = Array(rowCount).fill({ hpt: -1 });
//   worksheet['!rows'] = [
//   { hpt: 80 },  // Header row - tall enough for wrapped text
//   { hpt: 30 },  // Data row
// ];

//   // Add the worksheet to the workbook
//   XLSX.utils.book_append_sheet(workbook, worksheet, 
//     selectedMethod === 'location_based' ? 'Location Based Template' : 'Market Based Template');

//   // Download the Excel file
//   XLSX.writeFile(workbook, `purchased_electricity_${selectedMethod}_template.xlsx`);
// }, [buildings]);

  return {
    csvState,
    handleFileSelect,
    processUpload,
    resetUpload,
    downloadPurchasedElectricityTemplate,
  };
};

export default usePurchasedElectricityCSVUpload;
