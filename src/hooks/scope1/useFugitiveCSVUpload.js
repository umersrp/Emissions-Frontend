// src/hooks/useFugitiveCSVUpload.js
import useCSVUpload from '@/hooks/useCSVUpload';
import { toast } from 'react-toastify';
import { calculateFugitiveEmission } from '@/utils/scope1/calculate-fugitive-emission';
import {
  FugitiveAndMobileStakeholderOptions,
  FugitiveEquipmentTypeOptions,
  materialRefrigerantOptions,
  qualityControlOptions,
  consumptionUnitOptions,
} from '@/constant/scope1/options';

const useFugitiveCSVUpload = (buildings = []) => {
  const {
    csvState,
    handleFileSelect,
    processUpload,
    resetUpload,
    updateValidationErrors,
  } = useCSVUpload({
    endpoint: `${process.env.REACT_APP_BASE_URL}/Fugitive/Create`,
    limit: 10 * 1024 * 1024,
  });

  const cleanValue = (value) => {
    if (typeof value !== 'string') return value;
    return value.replace(/["']/g, '').trim();
  };

  const validateFugitiveRow = (row, index) => {
    const errors = [];
    const cleanedRow = {};

    // Clean all row values
    Object.keys(row).forEach(key => {
      cleanedRow[key] = cleanValue(row[key]);
    });

    // Required fields validation
    const requiredFields = [
      'buildingid', 'stakeholder', 'equipmenttype', 
      'materialrefrigerant', 'leakagevalue', 'consumptionunit', 
      'qualitycontrol', 'postingdate'
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

    // Equipment type validation
    if (cleanedRow.equipmenttype) {
      const validEquipmentTypes = FugitiveEquipmentTypeOptions.map(e => e.value);
      const matchedEquipment = validEquipmentTypes.find(e =>
        e.toLowerCase() === cleanedRow.equipmenttype.toLowerCase()
      );
      if (!matchedEquipment) {
        errors.push(`Invalid equipment type "${cleanedRow.equipmenttype}"`);
      } else {
        cleanedRow.equipmenttype = matchedEquipment;
      }
    }

    // Material/Refrigerant validation
    if (cleanedRow.materialrefrigerant) {
      const validMaterials = materialRefrigerantOptions.map(m => m.value);
      const matchedMaterial = validMaterials.find(m =>
        m.toLowerCase() === cleanedRow.materialrefrigerant.toLowerCase()
      );
      if (!matchedMaterial) {
        errors.push(`Invalid material/refrigerant "${cleanedRow.materialrefrigerant}"`);
      } else {
        cleanedRow.materialrefrigerant = matchedMaterial;
      }
    }

    // Leakage value validation
    if (cleanedRow.leakagevalue) {
      const cleanNum = cleanedRow.leakagevalue.toString()
        .replace(/[^0-9.-]/g, '');
      
      const num = Number(cleanNum);
      if (isNaN(num)) {
        errors.push(`Leakage value must be a number, got "${cleanedRow.leakagevalue}"`);
      } else if (num < 0) {
        errors.push('Leakage value cannot be negative');
      } else if (num > 1000000) { // Reasonable upper limit
        errors.push('Leakage value seems too large');
      } else {
        cleanedRow.leakagevalue = num.toString();
      }
    }

    // Consumption unit validation
    if (cleanedRow.consumptionunit) {
      const validUnits = consumptionUnitOptions.map(u => u.value);
      const matchedUnit = validUnits.find(u =>
        u.toLowerCase() === cleanedRow.consumptionunit.toLowerCase()
      );
      if (!matchedUnit) {
        errors.push(`Invalid consumption unit "${cleanedRow.consumptionunit}"`);
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
        errors.push(`Invalid quality control "${cleanedRow.qualitycontrol}"`);
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
  };

  const transformFugitivePayload = (row) => {
    // Calculate emissions
    const kgEmission = calculateFugitiveEmission(
      row.materialrefrigerant,
      parseFloat(row.leakagevalue)
    );
    const tEmission = kgEmission / 1000;

    return {
      buildingId: row.buildingid.trim(),
      stakeholder: row.stakeholder,
      equipmentType: row.equipmenttype,
      materialRefrigerant: row.materialrefrigerant,
      leakageValue: parseFloat(row.leakagevalue),
      consumptionUnit: row.consumptionunit,
      qualityControl: row.qualitycontrol,
      calculatedEmissionKgCo2e: kgEmission || 0,
      calculatedEmissionTCo2e: tEmission || 0,
      remarks: row.remarks || '',
      postingDate: row.postingdate || new Date().toISOString().split('T')[0],
    };
  };

  const handleFileSelectWithValidation = async (file) => {
    const data = await handleFileSelect(file);
    if (!data) return;

    const errors = [];
    data.forEach((row, index) => {
      const rowErrors = validateFugitiveRow(row, index);
      if (rowErrors.length > 0) {
        errors.push(`Row ${index + 1}: ${rowErrors.join(', ')}`);
      }
    });

    updateValidationErrors(errors);

    if (errors.length === 0) {
      toast.success(`CSV validated: ${data.length} rows ready for upload`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } else {
      toast.warning(`Found ${errors.length} validation errors. Please fix them before uploading.`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    }
  };

  const downloadFugitiveTemplate = () => {
    const exampleBuildings = buildings.slice(0, 3);
    const buildingList = exampleBuildings.map(b => `${b._id},${b.buildingName || 'Unnamed'}`).join('\n');

    // Get some example values
    const exampleStakeholder = FugitiveAndMobileStakeholderOptions[0]?.value || 'Fugitive & Mobile';
    const exampleEquipmentType = FugitiveEquipmentTypeOptions[0]?.value || 'AC - Refrigerant';
    const exampleMaterial = materialRefrigerantOptions[0]?.value || 'R-134a';
    const exampleUnit = consumptionUnitOptions[0]?.value || 'kg';
    const exampleQC = qualityControlOptions[0]?.value || 'Good';

    const template = `=== IMPORTANT: DO NOT USE QUOTES ===
Fill data WITHOUT quotes around values

=== SAMPLE DATA FORMAT ===
buildingid,stakeholder,equipmenttype,materialrefrigerant,leakagevalue,consumptionunit,qualitycontrol,remarks,postingdate
64f8a1b2c3d4e5f6a7b8c9d0,${exampleStakeholder},${exampleEquipmentType},${exampleMaterial},10,${exampleUnit},${exampleQC},AC maintenance,2024-01-15
64f8a1b2c3d4e5f6a7b8c9d1,${exampleStakeholder},${exampleEquipmentType},${exampleMaterial},5.5,${exampleUnit},${exampleQC},Regular check,2024-01-16

=== BUILDING REFERENCE (first 3) ===
${buildingList}

=== QUICK REFERENCE ===
- Stakeholder options: ${FugitiveAndMobileStakeholderOptions.slice(0, 3).map(s => s.value).join(', ')}...
- Equipment Types: ${FugitiveEquipmentTypeOptions.slice(0, 3).map(v => v.value).join(', ')}...
- Materials/Refrigerants: ${materialRefrigerantOptions.slice(0, 3).map(m => m.value).join(', ')}...
- Consumption Units: ${consumptionUnitOptions.map(u => u.value).join(', ')}
- Quality Control: ${qualityControlOptions.map(q => q.value).join(', ')}
- Date: YYYY-MM-DD (e.g., 2024-01-15)`;

    const blob = new Blob([template], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fugitive_emissions_template_NO_QUOTES.txt';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const processFugitiveUpload = async (onSuccess) => {
    return await processUpload(transformFugitivePayload, validateFugitiveRow, onSuccess);
  };

  return {
    csvState,
    handleFileSelect: handleFileSelectWithValidation,
    processUpload: processFugitiveUpload,
    resetUpload,
    downloadFugitiveTemplate,
  };
};

export default useFugitiveCSVUpload;   