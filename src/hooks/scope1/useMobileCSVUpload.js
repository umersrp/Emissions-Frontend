import useCSVUpload from '@/hooks/useCSVUpload';
import { calculateMobileCombustion } from '@/utils/scope1/calculate-mobile-combuction';
import { toast } from 'react-toastify';
import {
  FugitiveAndMobileStakeholderOptions,
  vehicleClassificationOptions,
  vehicleTypeOptionsByClassification,
  fuelNameOptionsByClassification,
  distanceUnitOptions,
  qualityControlOptions,
  weightLoadedOptions,
} from '@/constant/scope1/options';

const useMobileCSVUpload = (buildings = []) => {
  const {
    csvState,
    handleFileSelect,
    processUpload,
    resetUpload,
    updateValidationErrors, // FIX: Updated to match new name
  } = useCSVUpload({
    endpoint: `${process.env.REACT_APP_BASE_URL}/AutoMobile/Create`,
    limit: 10 * 1024 * 1024,
  });

  const cleanValue = (value) => {
    if (typeof value !== 'string') return value;
    return value.replace(/["']/g, '').trim();
  };

const validateMobileRow = (row, index) => {
    const errors = [];
    const cleanedRow = {};

    // Clean all row values
    Object.keys(row).forEach(key => {
      cleanedRow[key] = cleanValue(row[key]);
    });

    //  Normalize helper - removes all spaces and lowercases for comparison
    const normalize = (str) => str?.toLowerCase().replace(/\s+/g, '') || '';

    // Required fields validation
    const requiredFields = [
      'buildingcode', 'stakeholder', 'vehicleclassification', 'vehicletype',
      'fuelname', 'distancetravelled', 'distanceunit', 'qualitycontrol', 'postingdate'
    ];

    requiredFields.forEach(field => {
      if (!cleanedRow[field] || cleanedRow[field] === '') {
        errors.push(`${field} is required`);
      }
    });

    // Building validation
    if (cleanedRow.buildingcode && buildings.length > 0) {
      const buildingExists = buildings.some(b =>
        (b.buildingCode && b.buildingCode.toLowerCase() === cleanedRow.buildingcode.toLowerCase()) ||
        (b._id && b._id.toString() === cleanedRow.buildingcode)
      );
      if (!buildingExists) {
        errors.push(`Invalid building code "${cleanedRow.buildingcode}". Available: ${buildings.slice(0,3).map(b => b.buildingCode || b._id).join(', ')}...`);
      } else {
        const matched = buildings.find(b => b.buildingCode && b.buildingCode.toLowerCase() === cleanedRow.buildingcode.toLowerCase());
        if (matched && matched.buildingCode) cleanedRow.buildingcode = matched.buildingCode;
      }
    }

    // Stakeholder validation
    if (cleanedRow.stakeholder) {
      const validStakeholders = FugitiveAndMobileStakeholderOptions.map(s => s.value);
      const matchedStakeholder = validStakeholders.find(s =>
        normalize(s) === normalize(cleanedRow.stakeholder)
      );
      if (!matchedStakeholder) {
        errors.push(`Invalid stakeholder "${cleanedRow.stakeholder}"`);
      } else {
        cleanedRow.stakeholder = matchedStakeholder;
      }
    }

    // Vehicle classification validation
    if (cleanedRow.vehicleclassification) {
      const validClassifications = vehicleClassificationOptions.map(v => v.value);
      const matchedClassification = validClassifications.find(v =>
        normalize(v) === normalize(cleanedRow.vehicleclassification)
      );
      if (!matchedClassification) {
        errors.push(`Invalid vehicle classification "${cleanedRow.vehicleclassification}"`);
      } else {
        cleanedRow.vehicleclassification = matchedClassification;
      }
    }

    // Vehicle type validation based on classification
    if (cleanedRow.vehicleclassification && cleanedRow.vehicletype) {
      const validTypes = vehicleTypeOptionsByClassification[cleanedRow.vehicleclassification]?.map(v => v.value) || [];
      const matchedType = validTypes.find(v =>
        normalize(v) === normalize(cleanedRow.vehicletype)
      );
      if (!matchedType) {
        errors.push(`Invalid vehicle type "${cleanedRow.vehicletype}" for classification "${cleanedRow.vehicleclassification}"`);
      } else {
        cleanedRow.vehicletype = matchedType;
      }
    }

    // Fuel name validation based on classification
    if (cleanedRow.vehicleclassification && cleanedRow.fuelname) {
      const validFuels = fuelNameOptionsByClassification[cleanedRow.vehicleclassification]?.map(f => f.value) || [];
      const matchedFuel = validFuels.find(f =>
        normalize(f) === normalize(cleanedRow.fuelname)
      );
      if (!matchedFuel) {
        errors.push(`Invalid fuel name "${cleanedRow.fuelname}" for classification "${cleanedRow.vehicleclassification}"`);
      } else {
        cleanedRow.fuelname = matchedFuel;
      }
    }

    // Distance traveled validation
    if (cleanedRow.distancetravelled) {
      const cleanNum = cleanedRow.distancetravelled.toString().replace(/[^0-9.-]/g, '');
      const num = Number(cleanNum);
      if (isNaN(num)) {
        errors.push(`Distance traveled must be a number, got "${cleanedRow.distancetravelled}"`);
      } else if (num < 0) {
        errors.push('Distance traveled cannot be negative');
      } else if (num > 10000000) {
        errors.push('Distance traveled seems too large');
      } else {
        cleanedRow.distancetravelled = num.toString();
      }
    }

    // Distance unit validation
    if (cleanedRow.distanceunit) {
      const validUnits = distanceUnitOptions.map(u => u.value);
      const matchedUnit = validUnits.find(u =>
        normalize(u) === normalize(cleanedRow.distanceunit)
      );
      if (!matchedUnit) {
        errors.push(`Invalid distance unit "${cleanedRow.distanceunit}"`);
      } else {
        cleanedRow.distanceunit = matchedUnit;
      }
    }

    // Quality control validation
    if (cleanedRow.qualitycontrol) {
      const validQC = qualityControlOptions.map(q => q.value);
      const matchedQC = validQC.find(q =>
        normalize(q) === normalize(cleanedRow.qualitycontrol)
      );
      if (!matchedQC) {
        errors.push(`Invalid quality control "${cleanedRow.qualitycontrol}"`);
      } else {
        cleanedRow.qualitycontrol = matchedQC;
      }
    }

    // Weight loaded validation (conditional)
    const isHGV = cleanedRow.vehicleclassification === "Heavy Good Vehicles (HGVs All Diesel)" ||
                  cleanedRow.vehicleclassification === "Heavy Good Vehicles (Refrigirated HGVs All Diesel)";


if (isHGV && cleanedRow.weightloaded) {
  const validWeights = weightLoadedOptions.map(w => w.value);
  
  // Function to normalize weight format to standard format
  const normalizeWeight = (weight) => {
    if (!weight) return weight;
    
    // Convert to string and trim
    let weightStr = String(weight).trim();
    
    // Check for percentage with decimal places (e.g., "0.00%", "50.00%", "100.00%")
    const decimalPattern = /^(\d+(?:\.\d+)?)%$/;
    const match = weightStr.match(decimalPattern);
    
    if (match) {
      const number = parseFloat(match[1]);
      // Convert to standard format without decimal places
      if (number === 0) return "0%";
      if (number === 50) return "50%";
      if (number === 100) return "100%";
      // If it's a different number, keep the original format
      return weightStr;
    }
    
    // If it's already in the standard format
    if (validWeights.includes(weightStr)) {
      return weightStr;
    }
    
    // If it's "Average"
    if (weightStr === "Average") {
      return "Average";
    }
    
    return null;
  };
  
  const normalizedWeight = normalizeWeight(cleanedRow.weightloaded);
  
  if (!normalizedWeight) {
    errors.push(`Invalid weight loaded "${cleanedRow.weightloaded}". Accepted values: 0%, 0.00%, 50%, 50.00%, 100%, 100.00%, Average`);
  } else {
    cleanedRow.weightloaded = normalizedWeight;
  }
}

    // Date validation
    if (cleanedRow.postingdate) {
      const parseToISODatePart = (input) => {
        if (!input) return null;
        let s = input.toString().trim().replace(/"/g, '');
        if (s.includes('T')) s = s.split('T')[0];
        s = s.replace(/\./g, '/').replace(/-/g, '/');
        const parts = s.split('/').map(p => p.trim()).filter(Boolean);

        if (parts.length === 3) {
          let day, month, year;
          if (parts[0].length === 4) {
            year = parts[0]; month = parts[1]; day = parts[2];
          } else {
            day = parts[0]; month = parts[1]; year = parts[2];
          }
          const d = parseInt(day, 10);
          const m = parseInt(month, 10);
          const y = parseInt(year, 10);
          if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
          const date = new Date(y, m - 1, d);
          if (isNaN(date.getTime())) return null;
          if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
          if (date > new Date()) return null;
          return date.toISOString().split('T')[0];
        }

        const parsed = new Date(s);
        if (isNaN(parsed.getTime())) return null;
        if (parsed > new Date()) return null;
        return parsed.toISOString().split('T')[0];
      };

      const iso = parseToISODatePart(cleanedRow.postingdate);
      if (!iso) {
        errors.push(`Invalid date. Please use DD/MM/YYYY or YYYY-MM-DD (got "${cleanedRow.postingdate}")`);
      } else {
        cleanedRow.postingdate = iso;
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
  };
  const transformMobilePayload = (row) => {
    const isHGV = row.vehicleclassification === "Heavy Good Vehicles (HGVs All Diesel)" ||
                  row.vehicleclassification === "Heavy Good Vehicles (Refrigirated HGVs All Diesel)";

    const result = calculateMobileCombustion(
      isHGV ? null : row.fuelname,
      Number(row.distancetravelled),
      row.distanceunit,
      row.vehicletype,
      row.vehicleclassification,
      isHGV ? row.weightloaded || null : null
    );

    return {
      buildingCode: row.buildingcode.trim(),
      stakeholder: row.stakeholder,
      vehicleClassification: row.vehicleclassification,
      vehicleType: row.vehicletype,
      fuelName: row.fuelname,
      distanceTraveled: parseFloat(row.distancetravelled),
      distanceUnit: row.distanceunit,
      qualityControl: row.qualitycontrol,
      weightLoaded: row.weightloaded || null,
      calculatedEmissionKgCo2e: result?.totalEmissionKg || 0,
      calculatedEmissionTCo2e: result?.totalEmissionTonnes || 0,
      remarks: row.remarks || '',
      postingDate: row.postingdate || new Date().toISOString().split('T')[0],
    };
  };

 const handleFileSelectWithValidation = async (file) => {
  const data = await handleFileSelect(file);
  if (!data) return;

  //  LOG 1: Raw data from CSV parser (before normalization)
  console.log('📥 RAW CSV DATA:', data);
  console.log('🔑 RAW KEYS:', Object.keys(data[0]));
console.log('📦 RAW stakeholder value:', JSON.stringify(data[0]?.stakeholder ?? data[0]?.['stakeholder ']));

  // Normalize keys: "building code" -> "buildingcode", etc.
  const normalizedData = data.map(row => {
    const normalizedRow = {};
    Object.keys(row).forEach(key => {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      normalizedRow[normalizedKey] = row[key];
    });
    return normalizedRow;
  });

   //  LOG 2: After key normalization (what validation actually sees)
  console.log('🔍 NORMALIZED DATA (sent to validation):', normalizedData);
  console.log('🔍 STAKEHOLDER VALUE:', JSON.stringify(normalizedData[0]?.stakeholder)); // shows hidden chars

  const errors = [];
  normalizedData.forEach((row, index) => {
    const rowErrors = validateMobileRow(row, index);
    if (rowErrors.length > 0) {
      errors.push(`Row ${index + 2}: ${rowErrors.join(', ')}`);
    }
  });
   //  LOG 3: Final errors
  console.log('❌ VALIDATION ERRORS:', errors);

  updateValidationErrors(errors);

  if (errors.length === 0) {
    toast.success(`CSV validated: ${normalizedData.length} rows ready for upload`);
  } else {
    toast.warning(`Found ${errors.length} validation errors. Please fix them before uploading.`);
  }
};

const downloadMobileTemplate = () => {
  const exampleBuildingCode = buildings[0]?.buildingCode || 'BLD-EXAMPLE-001';

  const csvContent = `building code,stakeholder,vehicle classification,vehicle type,fuel name,distance travelled,distance unit,quality control,weight loaded,remarks,posting date
${exampleBuildingCode},Assembly,By Market Segment,Mini - City or A-Segment Passenger Cars (600 cc - 1200 cc),Diesel,50,km,Highly Uncertain,,Example record,dd/mm/yyyy`;
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + template], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mobile_template.csv';
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

const processMobileUpload = async (onSuccess) => {
    return await processUpload(transformMobilePayload, validateMobileRow, onSuccess);
  };

  return {
    csvState,
    handleFileSelect: handleFileSelectWithValidation,
    processUpload: processMobileUpload,
    resetUpload,
    downloadMobileTemplate,
  };
};

export default useMobileCSVUpload;