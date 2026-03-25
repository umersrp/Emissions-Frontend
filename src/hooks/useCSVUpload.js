import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const useCSVUpload = (options = {}) => {
  const {
    endpoint = '',
    limit = 10 * 1024 * 1024,
  } = options;

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

  //  Only strip T suffix if it looks like an ISO datetime, not just any "T"
  if (/\d{4}-\d{2}-\d{2}T/.test(cleaned)) {
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

          // Normalize Windows line endings \r\n → \n
          const normalizedText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
          const lines = normalizedText.split('\n').filter(line => line.trim() !== '');

          if (lines.length === 0) {
            reject(new Error('CSV file is empty'));
            return;
          }

          // Find header row (accept either buildingId or buildingCode)
          let headerRowIndex = -1;
          for (let i = 0; i < lines.length; i++) {
            const cleanLine = lines[i].replace(/['"]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
            if (cleanLine.includes('buildingid') || cleanLine.includes('buildingcode')) {
              headerRowIndex = i;
              break;
            }
          }

          if (headerRowIndex === -1) {
            reject(new Error('CSV must contain header row with buildingId or buildingCode field'));
            return;
          }

          // ✅ Use same inQuotes logic for headers (not plain split)
          const parseLineToValues = (line) => {
            const values = [];
            let inQuotes = false;
            let currentValue = '';

            for (let j = 0; j < line.length; j++) {
              const char = line[j];

              if (char === '"') {
                if (j + 1 < line.length && line[j + 1] === '"') {
                  currentValue += '"';
                  j++;
                } else {
                  inQuotes = !inQuotes;
                }
              } else if (char === ',' && !inQuotes) {
                values.push(currentValue.trim());
                currentValue = '';
              } else {
                currentValue += char;
              }
            }
            values.push(currentValue.trim());
            return values;
          };

          const headers = parseLineToValues(lines[headerRowIndex])
            .map(h => cleanCSVValue(h).toLowerCase().replace(/\s+/g, ''));

          console.log('🗂 HEADERS:', headers);

          const data = [];

          for (let i = headerRowIndex + 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = parseLineToValues(line).map(v => cleanCSVValue(v));
            console.log('📊 VALUE COUNT:', values.length, '| RAW LINE:', JSON.stringify(line));
            console.log('🔬 CHAR BY CHAR:', [...line].map((c, i) => `${i}:${JSON.stringify(c)}`).join(' ')); // 👈 ADD THIS

            console.log('📊 VALUES:', values);

            const row = {};
            headers.forEach((header, index) => {
              row[header] = index < values.length ? values[index] : '';
            });

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

  const handleFileSelect = async (file) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return null;
    }

    if (file.size > limit) {
      toast.error(`File size must be less than ${limit / (1024 * 1024)}MB`);
      return null;
    }

    try {
      const data = await parseCSV(file);
      setCsvState(prev => ({
        ...prev,
        file,
        parsedData: data,
      }));

      return data;
    } catch (error) {
      toast.error(`Error parsing CSV: ${error.message}`);
      return null;
    }
  };

  const processUpload = useCallback(async (payloadTransformer, rowValidator, onSuccess) => {
    const { file, parsedData, validationErrors } = csvState;

    if (!file || validationErrors.length > 0 || !parsedData) {
      toast.error('Please fix validation errors first');
      return null;
    }

    setCsvState(prev => ({ ...prev, uploading: true, progress: 0 }));

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i];

      try {
        // Validate row if validator provided
        if (rowValidator) {
          const rowErrors = rowValidator(row, i);
          if (rowErrors.length > 0) {
            throw new Error(rowErrors.join(', '));
          }
        }

        // Transform payload
        const payload = payloadTransformer ? payloadTransformer(row) : row;

        // Upload to endpoint
        await axios.post(
          endpoint,
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

      setCsvState(prev => ({
        ...prev,
        progress: Math.round(((i + 1) / parsedData.length) * 100)
      }));
    }

    setCsvState(prev => ({ ...prev, uploading: false, results }));

    if (results.failed === 0) {
      toast.success(`Successfully uploaded ${results.success} records!`);
      if (onSuccess) onSuccess(results);
    } else {
      toast.warning(`Uploaded ${results.success} records, ${results.failed} failed. Check error details.`);
    }

    return results;
  }, [csvState, endpoint]);

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

  // FIX: Added this function to update validation errors
  const updateValidationErrors = (errors) => {
    setCsvState(prev => ({ ...prev, validationErrors: errors }));
  };

  return {
    csvState,
    handleFileSelect,
    processUpload,
    resetUpload,
    updateValidationErrors, // FIX: Changed from setValidationErrors to updateValidationErrors
  };
};

export default useCSVUpload;