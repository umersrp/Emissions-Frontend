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

    let cleaned = value.replace(/["']/g, '');
    cleaned = cleaned.replace(/^=/, '');

    if (cleaned.includes('T00:00:00.000Z')) {
      cleaned = cleaned.replace('T00:00:00.000Z', '');
    }

    if (cleaned.includes('T')) {
      cleaned = cleaned.split('T')[0];
    }

    return cleaned.trim();
  }, []);

  const parseCSV = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const csvText = event.target.result;
          const lines = csvText.split('\n').filter(line => line.trim() !== '');

          if (lines.length === 0) {
            reject(new Error('CSV file is empty'));
            return;
          }

          // Find header row
          let headerRowIndex = -1;
          for (let i = 0; i < lines.length; i++) {
            const cleanLine = lines[i].replace(/"/g, '').toLowerCase();
            if (cleanLine.includes('buildingid') && cleanLine.includes('stakeholder')) {
              headerRowIndex = i;
              break;
            }
          }

          if (headerRowIndex === -1) {
            reject(new Error('CSV must contain header row with: buildingId, stakeholder, equipmentType, fuelType, fuelName, fuelConsumption, consumptionUnit, qualityControl, remarks, postingDate'));
            return;
          }

          // Parse headers
          const headers = lines[headerRowIndex]
            .split(',')
            .map(h => cleanCSVValue(h).toLowerCase().replace(/\s+/g, ''));

          // Expected headers
          const expectedHeaders = [
            'buildingid', 'stakeholder', 'equipmenttype', 'fueltype',
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

            // Parse CSV line with quote handling
            const values = [];
            let inQuotes = false;
            let currentValue = '';

            for (let j = 0; j < line.length; j++) {
              const char = line[j];

              if (char === '"') {
                if (j + 2 < line.length && line[j + 1] === '"' && line[j + 2] === '"') {
                  j += 2; // Skip triple quotes
                } else if (j + 1 < line.length && line[j + 1] === '"') {
                  currentValue += '"';
                  j++;
                } else {
                  inQuotes = !inQuotes;
                }
              } else if (char === ',' && !inQuotes) {
                values.push(currentValue);
                currentValue = '';
              } else {
                currentValue += char;
              }
            }
            values.push(currentValue);

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

          resolve(data);
        } catch (error) {
          reject(new Error(`Error parsing CSV: ${error.message}`));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
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
      'buildingid', 'stakeholder', 'equipmenttype', 'fueltype',
      'fuelname', 'fuelconsumption', 'consumptionunit', 'qualitycontrol'
    ];

    requiredFields.forEach(field => {
      if (!cleanedRow[field] || cleanedRow[field] === '') {
        errors.push(`${field} is required`);
      }
    });

    // Building validation
    if (cleanedRow.buildingid && buildings.length > 0) {
      const buildingExists = buildings.some(b => b._id === cleanedRow.buildingid);
      if (!buildingExists) {
        errors.push(`Invalid building ID "${cleanedRow.buildingid}"`);
      }
    }

    // Stakeholder validation (case-insensitive)
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
      const matchedEquipment = validEquipment.find(e =>
        e.toLowerCase() === cleanedRow.equipmenttype.toLowerCase()
      );
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

    // Fuel name validation based on fuel type
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
      } else if (num > 1000000000) { // Reasonable upper limit
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
      let dateStr = cleanedRow.postingdate;
      if (dateStr.includes('T')) {
        dateStr = dateStr.split('T')[0];
      }
      dateStr = dateStr.replace(/"/g, '');

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dateStr)) {
        errors.push(`Date must be YYYY-MM-DD format, got "${cleanedRow.postingdate}"`);
      } else {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          errors.push(`Invalid date "${dateStr}"`);
        } else if (date > new Date()) {
          errors.push('Date cannot be in the future');
        } else if (date < new Date('1900-01-01')) {
          errors.push('Date seems too old');
        } else {
          cleanedRow.postingdate = dateStr;
        }
      }
    }

    // Remarks validation (optional but check length)
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
  }, [buildings]);

  const transformStationaryPayload = useCallback((row) => {
    const emissions = calculateStationaryEmissions(
      row.fuelname,
      Number(row.fuelconsumption),
      row.consumptionunit
    );

    return {
      buildingId: row.buildingid.trim(),
      stakeholder: row.stakeholder,
      equipmentType: row.equipmenttype,
      fuelType: row.fueltype,
      fuelName: row.fuelname,
      fuelConsumption: parseFloat(row.fuelconsumption),
      consumptionUnit: row.consumptionunit,
      qualityControl: row.qualitycontrol,
      remarks: row.remarks || '',
      postingDate: row.postingdate || new Date().toISOString().split('T')[0],
      calculatedEmissionKgCo2e: emissions?.totalEmissionInScope || 0,
      calculatedEmissionTCo2e: emissions?.totalEmissionInScope ? emissions.totalEmissionInScope / 1000 : 0,
      calculatedBioEmissionKgCo2e: emissions?.totalEmissionOutScope || 0,
      calculatedBioEmissionTCo2e: emissions?.totalEmissionOutScope ? emissions.totalEmissionOutScope / 1000 : 0,
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

      // Validate each row
      data.forEach((row, index) => {
        const rowErrors = validateStationaryRow(row, index);
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
        // toast.success(`CSV validated: ${data.length} rows ready for upload`);
      } else {
        // toast.warning(`Found ${errors.length} validation errors. Please fix them before uploading.`);
      }

      return data;
    } catch (error) {
    //  toast.error(`Error parsing CSV: ${error.message}`);
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

    // 3. Final State Update (SUCCESS/PARTIAL SUCCESS)
    // We set uploading to false HERE so the UI knows the process is finished
    setCsvState(prev => ({
      ...prev,
      progress: 100,
      results: results,
      uploading: false 
    }));

    if (results.failed === 0) {
      toast.success(`Successfully uploaded ${results.success} records!`);
      if (onSuccess) onSuccess(results);
    } else {
      toast.warning(`Uploaded ${results.success} records, ${results.failed} failed.`);
    }
    
    console.log('processUpload completed successfully');
    return results;

  } catch (error) {
    // 4. Final State Update (CRITICAL FAILURE)
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

  const downloadStationaryTemplate = () => {
    const exampleBuildings = buildings.slice(0, 3);
    const buildingList = exampleBuildings.map(b => `${b._id},${b.buildingName || 'Unnamed'}`).join('\n');

    const exampleStakeholder = stakeholderOptions[0]?.value || 'Assembly';
    const exampleEquipment = equipmentTypeOptions.find(e => e.value === 'Amine Reboilers')?.value || 'Amine Reboilers';
    const exampleFuelType = 'Liquid Fuel';
    const exampleFuelName = 'Diesel';
    const exampleUnit = 'kg';
    const exampleQC = 'Good';

    const template = `=== IMPORTANT: DO NOT USE QUOTES ===
Fill data WITHOUT quotes around values

=== SAMPLE DATA FORMAT ===
buildingid,stakeholder,equipmenttype,fueltype,fuelname,fuelconsumption,consumptionunit,qualitycontrol,remarks,postingdate
64f8a1b2c3d4e5f6a7b8c9d0,${exampleStakeholder},${exampleEquipment},${exampleFuelType},${exampleFuelName},100,${exampleUnit},${exampleQC},record 1,2024-01-15
64f8a1b2c3d4e5f6a7b8c9d1,Commercial,Generator,Gaseous Fuel,Natural Gas,50,m³,Fair,,2024-01-16

=== BUILDING REFERENCE (first 3) ===
${buildingList}

=== QUICK REFERENCE ===
- Stakeholder options start with: ${stakeholderOptions.slice(0, 3).map(s => s.value).join(', ')}...
- Equipment includes: Amine Reboilers, Boiler, Generator, etc.
- Fuel Types: Gaseous Fuel, Liquid Fuel, Solid Fuel, Bio Liquid Fuel, Bio Gaseous Fuel, Biomass Fuel
- Fuel Names: For Liquid Fuel: Diesel, Gasoline, Kerosene, Fuel Oil
- Units: kg, L, m³, etc.
- Quality: Highly Uncertain, Uncertain, Fair, Good, Exact
- Date: YYYY-MM-DD (e.g., 2024-01-15)`;

    const blob = new Blob([template], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stationary_template_NO_QUOTES.txt';
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
    downloadStationaryTemplate,
  };
};

export default useStationaryCSVUpload;