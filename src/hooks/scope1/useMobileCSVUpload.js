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
        // Normalize to the canonical buildingCode string (if found)
        const matched = buildings.find(b => b.buildingCode && b.buildingCode.toLowerCase() === cleanedRow.buildingcode.toLowerCase());
        if (matched && matched.buildingCode) cleanedRow.buildingcode = matched.buildingCode;
      }
    }

    // Stakeholder validation (case-insensitive)
    if (cleanedRow.stakeholder) {
      const validStakeholders = FugitiveAndMobileStakeholderOptions.map(s => s.value);
      const matchedStakeholder = validStakeholders.find(s =>
        s.toLowerCase() === cleanedRow.stakeholder.toLowerCase()
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
        v.toLowerCase() === cleanedRow.vehicleclassification.toLowerCase()
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
        v.toLowerCase() === cleanedRow.vehicletype.toLowerCase()
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
        f.toLowerCase() === cleanedRow.fuelname.toLowerCase()
      );
      if (!matchedFuel) {
        errors.push(`Invalid fuel name "${cleanedRow.fuelname}" for classification "${cleanedRow.vehicleclassification}"`);
      } else {
        cleanedRow.fuelname = matchedFuel;
      }
    }

    // Distance traveled validation
    if (cleanedRow.distancetravelled) {
      const cleanNum = cleanedRow.distancetravelled.toString()
        .replace(/[^0-9.-]/g, '');
      
      const num = Number(cleanNum);
      if (isNaN(num)) {
        errors.push(`Distance traveled must be a number, got "${cleanedRow.distancetravelled}"`);
      } else if (num < 0) {
        errors.push('Distance traveled cannot be negative');
      } else if (num > 10000000) { // Reasonable upper limit
        errors.push('Distance traveled seems too large');
      } else {
        cleanedRow.distancetravelled = num.toString();
      }
    }

    // Distance unit validation
    if (cleanedRow.distanceunit) {
      const validUnits = distanceUnitOptions.map(u => u.value);
      const matchedUnit = validUnits.find(u =>
        u.toLowerCase() === cleanedRow.distanceunit.toLowerCase()
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
        q.toLowerCase() === cleanedRow.qualitycontrol.toLowerCase()
      );
      if (!matchedQC) {
        errors.push(`Invalid quality control "${cleanedRow.qualitycontrol}"`);
      } else {
        cleanedRow.qualitycontrol = matchedQC;
      }
    }

    // Weight loaded validation (conditional)
    const isHGV = cleanedRow.vehicleclassification === "Heavy Good Vehicles (HGVs All Diesel)" ||
                  cleanedRow.vehicleclassification === "Heavy Good Vehicles (Refrigerated HGVs All Diesel)";
    
    if (isHGV && cleanedRow.weightloaded) {
      const validWeights = weightLoadedOptions.map(w => w.value);
      const matchedWeight = validWeights.find(w =>
        w.toLowerCase() === cleanedRow.weightloaded.toLowerCase()
      );
      if (!matchedWeight) {
        errors.push(`Invalid weight loaded "${cleanedRow.weightloaded}"`);
      } else {
        cleanedRow.weightloaded = matchedWeight;
      }
    }

    // Date validation
    if (cleanedRow.postingdate) {
      // Accept flexible date formats (prefer dd/mm/yyyy) and normalize to YYYY-MM-DD
      const parseToISODatePart = (input) => {
        if (!input) return null;
        let s = input.toString().trim();
        s = s.replace(/"/g, '');
        if (s.includes('T')) s = s.split('T')[0];

        // Normalize separators to '/'
        s = s.replace(/\./g, '/').replace(/-/g, '/');
        const parts = s.split('/').map(p => p.trim()).filter(Boolean);

        if (parts.length === 3) {
          let day, month, year;
          // If first part is 4-digit, assume YYYY/MM/DD
          if (parts[0].length === 4) {
            year = parts[0]; month = parts[1]; day = parts[2];
          } else if (parts[2].length === 4) {
            // Prefer DD/MM/YYYY
            day = parts[0]; month = parts[1]; year = parts[2];
          } else {
            // Ambiguous - assume DD/MM/YYYY
            day = parts[0]; month = parts[1]; year = parts[2];
          }

          const d = parseInt(day, 10);
          const m = parseInt(month, 10);
          const y = parseInt(year, 10);
          if (isNaN(d) || isNaN(m) || isNaN(y)) return null;

          const date = new Date(y, m - 1, d);
          if (isNaN(date.getTime())) return null;
          // Ensure constructed date matches components (guards against overflow)
          if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
          // Disallow future dates
          if (date > new Date()) return null;
          return date.toISOString().split('T')[0];
        }

        // Fallback to Date parse
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
  };

  const transformMobilePayload = (row) => {
    const isHGV = row.vehicleclassification === "Heavy Good Vehicles (HGVs All Diesel)" ||
                  row.vehicleclassification === "Heavy Good Vehicles (Refrigerated HGVs All Diesel)";

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

    const errors = [];
    data.forEach((row, index) => {
      const rowErrors = validateMobileRow(row, index);
      if (rowErrors.length > 0) {
        errors.push(`Row ${index + 1}: ${rowErrors.join(', ')}`);
      }
    });

    // FIX: Use the correct function name
    updateValidationErrors(errors);

    if (errors.length === 0) {
      toast.success(`CSV validated: ${data.length} rows ready for upload`,{
      style: { zIndex: 9999999, position: absolute}, 
    });
    } else {
      toast.warning(`Found ${errors.length} validation errors. Please fix them before uploading.`,{
      style: { zIndex: 9999999, position: absolute }, 
    });
    }
  };

//   const downloadMobileTemplate = () => {
//     const exampleBuildings = buildings.slice(0, 3);
//     const buildingList = exampleBuildings.map(b => `${b._id},${b.buildingName || 'Unnamed'}`).join('\n');

//     // Get some example values
//     const exampleStakeholder = FugitiveAndMobileStakeholderOptions[0]?.value || 'Fugitive & Mobile';
//     const exampleClassification = vehicleClassificationOptions[0]?.value || 'Cars (by Market Segment)';
//     const exampleVehicleType = vehicleTypeOptionsByClassification[exampleClassification]?.[0]?.value || 'Diesel Car - Small';
//     const exampleFuel = fuelNameOptionsByClassification[exampleClassification]?.[0]?.value || 'Diesel';
//     const exampleDistanceUnit = distanceUnitOptions[0]?.value || 'km';
//     const exampleQC = qualityControlOptions[0]?.value || 'Good';

//     const template = `=== IMPORTANT: DO NOT USE QUOTES ===
// Fill data WITHOUT quotes around values

// === SAMPLE DATA FORMAT ===
// buildingcode,stakeholder,vehicleclassification,vehicletype,fuelname,distancetraveled,distanceunit,qualitycontrol,weightloaded,remarks,postingdate
// 64f8a1b2c3d4e5f6a7b8c9d0,${exampleStakeholder},${exampleClassification},${exampleVehicleType},${exampleFuel},100,${exampleDistanceUnit},${exampleQC},,record 1,2024-01-15
// 64f8a1b2c3d4e5f6a7b8c9d1,Fugitive & Mobile,Heavy Good Vehicles (HGVs All Diesel),Rigid HGV (>33t),,500,km,Fair,>33t,heavy load,2024-01-16

// === BUILDING REFERENCE (first 3) ===
// ${buildingList}

// === QUICK REFERENCE ===
// - Stakeholder options: ${FugitiveAndMobileStakeholderOptions.slice(0, 3).map(s => s.value).join(', ')}...
// - Vehicle Classifications: ${vehicleClassificationOptions.slice(0, 3).map(v => v.value).join(', ')}...
// - Distance Units: ${distanceUnitOptions.map(u => u.value).join(', ')}
// - Quality Control: ${qualityControlOptions.map(q => q.value).join(', ')}
// - Weight Loaded (for HGVs): ${weightLoadedOptions.map(w => w.value).join(', ')}
// - Date: YYYY-MM-DD (e.g., 2024-01-15)`;

//     const blob = new Blob([template], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'mobile_combustion_template_NO_QUOTES.txt';
//     document.body.appendChild(a);
//     a.click();
//     URL.revokeObjectURL(url);
//     document.body.removeChild(a);
//   };
const downloadMobileTemplate = () => {
  // Just headers, no data rows
  const csvContent = 'buildingcode,stakeholder,vehicleclassification,vehicletype,fuelname,distancetraveled,distanceunit,qualitycontrol,weightloaded,remarks,postingdate';

  const blob = new Blob([csvContent], { type: 'text/csv' });
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