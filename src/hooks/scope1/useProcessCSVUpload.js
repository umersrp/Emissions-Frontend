// hooks/scope1/useProcessCSVUpload.js
import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Import constants for process emissions
import {

  //   activityTypeOptions,
  // activityMetadata,

} from '@/constant/scope1/calculate-process-emission';
import { activityTypeOptions, activityMetadata, qualityControlOptions, stakeholderDepartmentOptions, } from '@/constant/scope1/options';

const useProcessCSVUpload = (buildings = []) => {
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
          month = parseInt(parts[1]) - 1; // Month is 0-indexed
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

        // Use a simple, robust CSV parser
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

        // Find header row - LOOK FOR USER-FRIENDLY HEADERS
        let headerRowIndex = 0; // Assume first row is header
        
        // Parse headers (keep original case/spacing for mapping)
        const headerValues = parseCSVLine(lines[headerRowIndex]);
        
        // Create header mapping for validation
        const headerMapping = {
          'typeofactivityprocess': 'activitytype',
        };
        
        // Normalize headers for checking
        const normalizedHeaders = headerValues.map(h => 
          h.toLowerCase().replace(/[^a-z0-9]/g, '')
        );
        
        console.log('Normalized headers:', normalizedHeaders);

        // Check if we have the required headers (using normalized versions)
        const requiredNormalized = [
          'buildingcode', 'stakeholderdepartment', 'amountofemissions', 
          'qualitycontrol', 'remarks', 'postingdate'
        ];
        
        // Also check for activity type variations
        const hasActivityType = normalizedHeaders.some(h => 
          h.includes('activity') || h.includes('process')
        );
        
        if (!hasActivityType) {
          reject(new Error('CSV must contain an activity type column'));
          return;
        }
        
        const missingHeaders = requiredNormalized.filter(h => !normalizedHeaders.includes(h));
        if (missingHeaders.length > 0) {
          reject(new Error(`Missing required columns: ${missingHeaders.join(', ')}`));
          return;
        }

        // Parse data rows - KEEP ORIGINAL HEADERS for mapping in validation
        const data = [];
        for (let i = headerRowIndex + 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const values = parseCSVLine(line);
          const row = {};
          
          // Use ORIGINAL headers (not normalized) so mapping works
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
  const validateProcessRow = useCallback((row, index) => {
    const errors = [];


    // Add this at the start of validateProcessRow function
    const headerMapping = {
 'typeofactivityprocess': 'activitytype',     };

    // Add this right after creating cleanedRow object
  
const cleanedRow = {};
Object.keys(row).forEach(key => {
  const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
  const mappedKey = headerMapping[normalizedKey] || normalizedKey;
  cleanedRow[mappedKey] = row[key]?.toString().trim();
});
    // Clean all row values
 
    // Required fields validation - REMOVED gasemitted from required fields
    const requiredFields = [
      'buildingcode', 'stakeholderdepartment', 'activitytype',
      'amountofemissions', 'qualitycontrol'  // gasemitted removed
    ];

    requiredFields.forEach(field => {
      if (!cleanedRow[field] || cleanedRow[field] === '') {
        errors.push(`${field} is required`);
      }
    });

    // Building validation (same as before)
    if (cleanedRow.buildingcode && buildings.length > 0) {
      const buildingExists = buildings.some(b =>
        b.buildingCode && b.buildingCode.toLowerCase() === cleanedRow.buildingcode.toLowerCase()
      );
      if (!buildingExists) {
        errors.push(`Invalid building code "${cleanedRow.buildingcode}". Available: ${buildings.slice(0, 3).map(b => b.buildingCode).join(', ')}...`);
      }
    }

    // Stakeholder validation (same as before)
    if (cleanedRow.stakeholderdepartment) {
      const validStakeholders = stakeholderDepartmentOptions.map(s => s.value);
      const matchedStakeholder = validStakeholders.find(s =>
        s.toLowerCase() === cleanedRow.stakeholderdepartment.toLowerCase()
      );
      if (!matchedStakeholder) {
        errors.push(`Invalid stakeholder "${cleanedRow.stakeholderdepartment}". Valid options: ${validStakeholders.slice(0, 5).join(', ')}...`);
      } else {
        cleanedRow.stakeholderdepartment = matchedStakeholder;
      }
    }

    // Activity type validation - NOW ALSO SETS THE GAS EMITTED
    if (cleanedRow.activitytype) {
      const validActivities = activityTypeOptions.map(a => a.value);
      const matchedActivity = validActivities.find(a =>
        a.toLowerCase() === cleanedRow.activitytype.toLowerCase()
      );

      if (!matchedActivity) {
        errors.push(`Invalid activity type "${cleanedRow.activitytype}". Valid options: ${validActivities.slice(0, 5).join(', ')}...`);
      } else {
        cleanedRow.activitytype = matchedActivity;

        // AUTO-POPULATE gas emitted based on activity type
        // Check if activityMetadata is an array or object
        if (Array.isArray(activityMetadata)) {
          // If it's an array, find the matching activity
          const activityMeta = activityMetadata.find(a =>
            a.activityType && a.activityType.toLowerCase() === matchedActivity.toLowerCase()
          );
          if (activityMeta && activityMeta.gasEmitted) {
            cleanedRow.gasemitted = activityMeta.gasEmitted;
          } else {
            errors.push(`Could not determine gas emitted for activity "${matchedActivity}"`);
          }
        } else if (activityMetadata && typeof activityMetadata === 'object') {
          // If it's an object map, get by key
          const activityMeta = activityMetadata[matchedActivity];
          if (activityMeta && activityMeta.gasEmitted) {
            cleanedRow.gasemitted = activityMeta.gasEmitted;
          } else {
            errors.push(`Could not determine gas emitted for activity "${matchedActivity}"`);
          }
        }
      }
    }

    // REMOVED the entire gas validation block since we're auto-populating it

    // Amount of emissions validation (same as before)
    if (cleanedRow.amountofemissions) {
      const cleanNum = cleanedRow.amountofemissions.toString()
        .replace(/[^0-9.-]/g, '')
        .replace(/^"+|"+$/g, '');

      const num = Number(cleanNum);
      if (isNaN(num)) {
        errors.push(`Amount of emissions must be a number, got "${cleanedRow.amountofemissions}"`);
      } else if (num < 0) {
        errors.push('Amount of emissions cannot be negative');
      } else if (num > 1000000000) {
        errors.push('Amount of emissions seems too large');
      } else {
        cleanedRow.amountofemissions = num.toString();
      }
    }

    // Quality control validation (same as before)
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

    // Date validation (same as before)
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

    // Remarks validation (same as before)
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
  // Helper function to calculate process emissions
  const calculateProcessEmissions = useCallback((gasEmitted, amount) => {
    // GWP (Global Warming Potential) values
    const gwpValues = {
      'CO2': 1,
      'CH4': 28,
      'N2O': 265,
      'HFC-23': 12400,
      'HFC-32': 677,
      'HFC-125': 3170,
      'HFC-134a': 1300,
      'HFC-143a': 4800,
      'HFC-152a': 138,
      'HFC-227ea': 3350,
      'HFC-236fa': 8060,
      'HFC-245fa': 858,
      'HFC-365mfc': 804,
      'HFC-43-10mee': 1650,
      'CF4': 6630,
      'C2F6': 11100,
      'C3F8': 8900,
      'C4F10': 9200,
      'C5F12': 8550,
      'C6F14': 7910,
      'SF6': 23500,
      'NF3': 16100
    };

    const gwp = gwpValues[gasEmitted] || 1; // Default to 1 if gas not found
    const amountNum = Number(amount) || 0;

    const totalEmissionInScope = amountNum * gwp;

    return {
      totalEmissionInScope,
      totalEmissionOutScope: 0 // Process emissions typically don't have biogenic CO2
    };
  }, []);

  const transformProcessPayload = useCallback((row) => {
    const emissions = calculateProcessEmissions(
      row.gasemitted,
      Number(row.amountofemissions)
    );

    return {
      buildingCode: row.buildingcode,
      stakeholderDepartment: row.stakeholderdepartment,
      activityType: row.activitytype,
      gasEmitted: row.gasemitted,
      amountOfEmissions: parseFloat(row.amountofemissions),
      qualityControl: row.qualitycontrol,
      remarks: row.remarks || '',
      postingDate: row.postingdate, // Already in ISO format from validation
      calculatedEmissionKgCo2e: emissions?.totalEmissionInScope || 0,
      calculatedEmissionTCo2e: emissions?.totalEmissionInScope ? emissions.totalEmissionInScope / 1000 : 0,
      calculatedBioEmissionKgCo2e: emissions?.totalEmissionOutScope || 0,
      calculatedBioEmissionTCo2e: emissions?.totalEmissionOutScope ? emissions.totalEmissionOutScope / 1000 : 0,
    };
  }, [calculateProcessEmissions]);

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
        const rowErrors = validateProcessRow(row, index);
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
          const payload = transformProcessPayload(row);

          await axios.post(
            `${process.env.REACT_APP_BASE_URL}/Process-Emissions/create`,
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

  const downloadProcessTemplate = () => {
    const exampleBuildings = buildings.slice(0, 1);
    const exampleBuildingCode = exampleBuildings[0]?.buildingCode || 'BLD-EXAMPLE-001';

    const exampleStakeholder = stakeholderDepartmentOptions[0]?.value || 'Assembly';
    const exampleActivity = activityTypeOptions[0]?.value || 'Cement production (CO₂ from calcination)';
    const exampleQC = 'Good';

    // Get current date in DD/MM/YYYY format for the template
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    // REMOVED gasemitted from the template
    const template = `building code,stakeholder department,type of activity / process,amount of emissions,quality control,remarks,posting date
${exampleBuildingCode},${exampleStakeholder},${exampleActivity},100,${exampleQC},Example record,${formattedDate}`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'process_emissions_template.csv';
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
    downloadProcessTemplate,
  };
};

export default useProcessCSVUpload;