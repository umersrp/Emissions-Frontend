// // src/hooks/useFugitiveCSVUpload.js
// import useCSVUpload from '@/hooks/useCSVUpload';
// import { toast } from 'react-toastify';
// import { calculateFugitiveEmission } from '@/utils/scope1/calculate-fugitive-emission';
// import {
//   FugitiveAndMobileStakeholderOptions,
//   FugitiveEquipmentTypeOptions,
//   materialRefrigerantOptions,
//   qualityControlOptions,
//   consumptionUnitOptions,
// } from '@/constant/scope1/options';

// const useFugitiveCSVUpload = (buildings = []) => {
//   const {
//     csvState,
//     handleFileSelect,
//     processUpload,
//     resetUpload,
//     updateValidationErrors,
//   } = useCSVUpload({
//     endpoint: `${process.env.REACT_APP_BASE_URL}/Fugitive/Create`,
//     limit: 10 * 1024 * 1024,
//   });

//   const cleanValue = (value) => {
//     if (typeof value !== 'string') return value;
//     return value.replace(/["']/g, '').trim();
//   };

//   const validateFugitiveRow = (row, index) => {
//     const errors = [];
//     const cleanedRow = {};

//     // Clean all row values
//     Object.keys(row).forEach(key => {
//       cleanedRow[key] = cleanValue(row[key]);
//     });

//     // Required fields validation
//     const requiredFields = [
//       'buildingcode', 'stakeholder', 'equipmenttype', 
//       'materialrefrigerant', 'leakagevalue', 'consumptionunit', 
//       'qualitycontrol', 'postingdate'
//     ];

//     requiredFields.forEach(field => {
//       if (!cleanedRow[field] || cleanedRow[field] === '') {
//         errors.push(`${field} is required`);
//       }
//     });

//     // Building validation
//  if (cleanedRow.buildingcode && buildings.length > 0) {
//   const buildingExists = buildings.some(b => b.buildingCode === cleanedRow.buildingcode);
//   if (!buildingExists) {
//     errors.push(`Invalid building Code "${cleanedRow.buildingcode}"`);
//   }
// }

//     // Stakeholder validation (case-insensitive)
//     if (cleanedRow.stakeholder) {
//       const validStakeholders = FugitiveAndMobileStakeholderOptions.map(s => s.value);
//       const matchedStakeholder = validStakeholders.find(s =>
//         s.toLowerCase() === cleanedRow.stakeholder.toLowerCase()
//       );
//       if (!matchedStakeholder) {
//         errors.push(`Invalid stakeholder "${cleanedRow.stakeholder}"`);
//       } else {
//         cleanedRow.stakeholder = matchedStakeholder;
//       }
//     }

//     // Equipment type validation
//     if (cleanedRow.equipmenttype) {
//       const validEquipmentTypes = FugitiveEquipmentTypeOptions.map(e => e.value);
//       const matchedEquipment = validEquipmentTypes.find(e =>
//         e.toLowerCase() === cleanedRow.equipmenttype.toLowerCase()
//       );
//       if (!matchedEquipment) {
//         errors.push(`Invalid equipment type "${cleanedRow.equipmenttype}"`);
//       } else {
//         cleanedRow.equipmenttype = matchedEquipment;
//       }
//     }

//     // Material/Refrigerant validation
//     if (cleanedRow.materialrefrigerant) {
//       const validMaterials = materialRefrigerantOptions.map(m => m.value);
//       const matchedMaterial = validMaterials.find(m =>
//         m.toLowerCase() === cleanedRow.materialrefrigerant.toLowerCase()
//       );
//       if (!matchedMaterial) {
//         errors.push(`Invalid material/refrigerant "${cleanedRow.materialrefrigerant}"`);
//       } else {
//         cleanedRow.materialrefrigerant = matchedMaterial;
//       }
//     }

//     // Leakage value validation
//     if (cleanedRow.leakagevalue) {
//       const cleanNum = cleanedRow.leakagevalue.toString()
//         .replace(/[^0-9.-]/g, '');
      
//       const num = Number(cleanNum);
//       if (isNaN(num)) {
//         errors.push(`Leakage value must be a number, got "${cleanedRow.leakagevalue}"`);
//       } else if (num < 0) {
//         errors.push('Leakage value cannot be negative');
//       } else if (num > 1000000) { // Reasonable upper limit
//         errors.push('Leakage value seems too large');
//       } else {
//         cleanedRow.leakagevalue = num.toString();
//       }
//     }

//     // Consumption unit validation
//     if (cleanedRow.consumptionunit) {
//       const validUnits = consumptionUnitOptions.map(u => u.value);
//       const matchedUnit = validUnits.find(u =>
//         u.toLowerCase() === cleanedRow.consumptionunit.toLowerCase()
//       );
//       if (!matchedUnit) {
//         errors.push(`Invalid consumption unit "${cleanedRow.consumptionunit}"`);
//       } else {
//         cleanedRow.consumptionunit = matchedUnit;
//       }
//     }

//     // Quality control validation
//     if (cleanedRow.qualitycontrol) {
//       const validQC = qualityControlOptions.map(q => q.value);
//       const matchedQC = validQC.find(q =>
//         q.toLowerCase() === cleanedRow.qualitycontrol.toLowerCase()
//       );
//       if (!matchedQC) {
//         errors.push(`Invalid quality control "${cleanedRow.qualitycontrol}"`);
//       } else {
//         cleanedRow.qualitycontrol = matchedQC;
//       }
//     }

//     // Date validation
// // Date validation
// if (cleanedRow.postingdate) {
//   let dateStr = cleanedRow.postingdate;
//   if (dateStr.includes('T')) {
//     dateStr = dateStr.split('T')[0];
//   }
//   dateStr = dateStr.replace(/"/g, '');

//   // Check for DD/MM/YYYY format
//   const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
//   const match = dateStr.match(ddmmyyyyRegex);
  
//   if (match) {
//     // Parse DD/MM/YYYY
//     const day = parseInt(match[1], 10);
//     const month = parseInt(match[2], 10) - 1; // Month is 0-indexed
//     const year = parseInt(match[3], 10);
    
//     const date = new Date(year, month, day);
    
//     // Validate the date is valid (e.g., not 31/02/2024)
//     if (isNaN(date.getTime()) || 
//         date.getDate() !== day || 
//         date.getMonth() !== month || 
//         date.getFullYear() !== year) {
//       errors.push(`Invalid date "${dateStr}" - please provide a valid DD/MM/YYYY date`);
//     } else if (date > new Date()) {
//       errors.push('Date cannot be in the future');
//     } else {
//       // Store in YYYY-MM-DD format for the API
//       const formattedYear = year;
//       const formattedMonth = String(month + 1).padStart(2, '0');
//       const formattedDay = String(day).padStart(2, '0');
//       cleanedRow.postingdate = `${formattedYear}-${formattedMonth}-${formattedDay}`;
//     }
//   } else {
//     // Also accept YYYY-MM-DD format for backward compatibility
//     const yyyymmddRegex = /^\d{4}-\d{2}-\d{2}$/;
//     if (yyyymmddRegex.test(dateStr)) {
//       const [year, month, day] = dateStr.split('-').map(Number);
//       const date = new Date(year, month - 1, day);
      
//       if (isNaN(date.getTime())) {
//         errors.push(`Invalid date "${dateStr}"`);
//       } else if (date > new Date()) {
//         errors.push('Date cannot be in the future');
//       } else {
//         cleanedRow.postingdate = dateStr; // Keep as is
//       }
//     } else {
//       errors.push(`Date must be DD/MM/YYYY format (e.g., 15/01/2024), got "${cleanedRow.postingdate}"`);
//     }
//   }
// }

//     // Remarks validation (optional but check length)
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
//   };

//   const transformFugitivePayload = (row) => {
//     // Calculate emissions
//     const kgEmission = calculateFugitiveEmission(
//       row.materialrefrigerant,
//       parseFloat(row.leakagevalue)
//     );
//     const tEmission = kgEmission / 1000;

//     return {
//       // API expects `buildingCode` (required). If we can match a building object,
//       // include its `_id` as `buildingId` as well for convenience.
//       buildingCode: row.buildingcode ? row.buildingcode.trim() : '',
//       buildingId: (() => {
//         if (!row.buildingcode) return undefined;
//         const match = buildings.find(b =>
//           (b.buildingCode && b.buildingCode === row.buildingcode) ||
//           (b.buildingName && b.buildingName === row.buildingcode) ||
//           (b._id && b._id === row.buildingcode)
//         );
//         return match ? match._id : row.buildingcode.trim();
//       })(),
//       stakeholder: row.stakeholder,
//       equipmentType: row.equipmenttype,
//       materialRefrigerant: row.materialrefrigerant,
//       leakageValue: parseFloat(row.leakagevalue),
//       consumptionUnit: row.consumptionunit,
//       qualityControl: row.qualitycontrol,
//       calculatedEmissionKgCo2e: kgEmission || 0,
//       calculatedEmissionTCo2e: tEmission || 0,
//       remarks: row.remarks || '',
//       postingDate: row.postingdate || new Date().toISOString().split('T')[0],
//     };
//   };

//   const handleFileSelectWithValidation = async (file) => {
//     const data = await handleFileSelect(file);
//     if (!data) return;
    
//      const normalizedData = data.map(row => {
//     const normalizedRow = {};
//     Object.keys(row).forEach(key => {
//       const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
//       normalizedRow[normalizedKey] = row[key];
//     });
//     return normalizedRow;
//   }); 

//     const errors = [];
//     data.forEach((row, index) => {
//       const rowErrors = validateFugitiveRow(row, index);
//       if (rowErrors.length > 0) {
//         errors.push(`Row ${index + 1}: ${rowErrors.join(', ')}`);
//       }
//     });

//     updateValidationErrors(errors);

//     if (errors.length === 0) {
//       toast.success(`CSV validated: ${data.length} rows ready for upload`, {
//         position: "top-right",
//         autoClose: 5000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         theme: "colored",
//       });
//     } else {
//       toast.warning(`Found ${errors.length} validation errors. Please fix them before uploading.`, {
//         position: "top-right",
//         autoClose: 5000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         theme: "colored",
//       });
//     }
//   };

// const downloadFugitiveTemplate = () => {
//   const exampleBuildings = buildings.slice(0, 2);
//   const exampleBuilding1 = exampleBuildings[0]?.buildingCode || 'BLD-6469';
  
//   const exampleStakeholder = FugitiveAndMobileStakeholderOptions[0]?.value || 'Assembly';
//   const exampleEquipmentType = FugitiveEquipmentTypeOptions.find(e => e.value === 'Air Handling Units (AHUs) with Refrigerants')?.value || 'Air Handling Units (AHUs) with Refrigerants';
//   const exampleMaterial = materialRefrigerantOptions[0]?.value || 'R-134a';
//   const exampleUnit = consumptionUnitOptions[0]?.value || 'kg';
//   const exampleQC = qualityControlOptions[0]?.value || 'Good';
  
//   // Get current date in DD/MM/YYYY format
//   const currentDate = new Date();
//   const day = String(currentDate.getDate()).padStart(2, '0');
//   const month = String(currentDate.getMonth() + 1).padStart(2, '0');
//   const year = currentDate.getFullYear();
//   const formattedDate = `${day}/${month}/${year}`;

//   const template = `building code,stakeholder,equipment type,material refrigerant,leakage value,consumption unit,quality control,remarks,posting date
// ${exampleBuilding1},${exampleStakeholder},${exampleEquipmentType},${exampleMaterial},10,${exampleUnit},${exampleQC},AC maintenance - Unit 1,${formattedDate}`;

//   const blob = new Blob([template], { type: 'text/csv' });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = 'fugitive_template.csv';
//   document.body.appendChild(a);
//   a.click();
//   URL.revokeObjectURL(url);
//   document.body.removeChild(a);
// };
//   const processFugitiveUpload = async (onSuccess) => {
//     return await processUpload(transformFugitivePayload, validateFugitiveRow, onSuccess);
//   };

//   return {
//     csvState,
//     handleFileSelect: handleFileSelectWithValidation,
//     processUpload: processFugitiveUpload,
//     resetUpload,
//     downloadFugitiveTemplate,
//   };
// };

// export default useFugitiveCSVUpload;   






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
import { normalizeSubscriptNumbers } from '@/utils/normalizeText';

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

    // Comprehensive header mapping
    const headerMapping = {
      // User-friendly header → Actual field name
      'unit': 'consumptionunit',
      
      'buildingcode': 'buildingcode',
      'refrigerant': 'materialrefrigerant',

      'equipment': 'equipmenttype',
      
      'leakagevalue': 'leakagevalue',
  
      
      'postingdate': 'postingdate',
      
      'quality': 'qualitycontrol',
    };

    // First, map the keys
    Object.keys(row).forEach(key => {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      const mappedKey = headerMapping[normalizedKey] || normalizedKey;
      cleanedRow[mappedKey] = cleanValue(row[key]);
    });

    // Debug log to see mapped fields
    console.log('Mapped row:', cleanedRow);

    // Required fields validation - now using mapped field names
    const requiredFields = [
      'buildingcode', 'stakeholder', 'equipmenttype', 
      'materialrefrigerant', 'leakagevalue', 'consumptionunit', 
      'qualitycontrol', 'postingdate'
    ];

    requiredFields.forEach(field => {
      if (!cleanedRow[field] || cleanedRow[field] === '') {
        errors.push(`${field} is required`);
      }
    });

    // Building validation
    if (cleanedRow.buildingcode && buildings.length > 0) {
      const buildingExists = buildings.some(b => b.buildingCode === cleanedRow.buildingcode);
      if (!buildingExists) {
        errors.push(`Invalid building Code "${cleanedRow.buildingcode}"`);
      }
    }

    // Stakeholder validation
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
    // if (cleanedRow.equipmenttype) {
    //   const validEquipmentTypes = FugitiveEquipmentTypeOptions.map(e => e.value);
    //   const matchedEquipment = validEquipmentTypes.find(e =>
    //     e.toLowerCase() === cleanedRow.equipmenttype.toLowerCase()
    //   );
    //   if (!matchedEquipment) {
    //     errors.push(`Invalid equipment type "${cleanedRow.equipmenttype}"`);
    //   } else {
    //     cleanedRow.equipmenttype = matchedEquipment;
    //   }
    // }
    // Equipment type validation
if (cleanedRow.equipmenttype) {
  const validEquipmentTypes = FugitiveEquipmentTypeOptions.map(e => e.value);
  const normalizedInput = normalizeSubscriptNumbers(cleanedRow.equipmenttype);
  
  const matchedEquipment = validEquipmentTypes.find(equipment => {
    const normalizedEquipment = normalizeSubscriptNumbers(equipment);
    return normalizedEquipment.toLowerCase() === normalizedInput.toLowerCase();
  });
  
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
      } else if (num > 1000000) {
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

      const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
      const match = dateStr.match(ddmmyyyyRegex);
      
      if (match) {
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1;
        const year = parseInt(match[3], 10);
        
        const date = new Date(year, month, day);
        
        if (isNaN(date.getTime()) || 
            date.getDate() !== day || 
            date.getMonth() !== month || 
            date.getFullYear() !== year) {
          errors.push(`Invalid date "${dateStr}" - please provide a valid DD/MM/YYYY date`);
        } else if (date > new Date()) {
          errors.push('Date cannot be in the future');
        } else {
          const formattedYear = year;
          const formattedMonth = String(month + 1).padStart(2, '0');
          const formattedDay = String(day).padStart(2, '0');
          cleanedRow.postingdate = `${formattedYear}-${formattedMonth}-${formattedDay}`;
        }
      } else {
        const yyyymmddRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (yyyymmddRegex.test(dateStr)) {
          const [year, month, day] = dateStr.split('-').map(Number);
          const date = new Date(year, month - 1, day);
          
          if (isNaN(date.getTime())) {
            errors.push(`Invalid date "${dateStr}"`);
          } else if (date > new Date()) {
            errors.push('Date cannot be in the future');
          } else {
            cleanedRow.postingdate = dateStr;
          }
        } else {
          errors.push(`Date must be DD/MM/YYYY format (e.g., 15/01/2024), got "${cleanedRow.postingdate}"`);
        }
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

  const transformFugitivePayload = (row) => {
    const kgEmission = calculateFugitiveEmission(
      row.materialrefrigerant,
      parseFloat(row.leakagevalue)
    );
    const tEmission = kgEmission / 1000;

    return {
      buildingCode: row.buildingcode ? row.buildingcode.trim() : '',
      buildingId: (() => {
        if (!row.buildingcode) return undefined;
        const match = buildings.find(b =>
          (b.buildingCode && b.buildingCode === row.buildingcode) ||
          (b.buildingName && b.buildingName === row.buildingcode) ||
          (b._id && b._id === row.buildingcode)
        );
        return match ? match._id : row.buildingcode.trim();
      })(),
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
    
    const normalizedData = data.map(row => {
      const normalizedRow = {};
      Object.keys(row).forEach(key => {
        const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        normalizedRow[normalizedKey] = row[key];
      });
      return normalizedRow;
    }); 

    const errors = [];
    normalizedData.forEach((row, index) => {
      const rowErrors = validateFugitiveRow(row, index);
      if (rowErrors.length > 0) {
        errors.push(`Row ${index + 2}: ${rowErrors.join(', ')}`);
      }
    });

    updateValidationErrors(errors);

    if (errors.length === 0) {
      toast.success(`CSV validated: ${data.length} rows ready for upload`);
    } else {
      toast.warning(`Found ${errors.length} validation errors. Please fix them before uploading.`);
    }
  };

  const downloadFugitiveTemplate = () => {
    const exampleBuildings = buildings.slice(0, 2);
    const exampleBuilding1 = exampleBuildings[0]?.buildingCode || 'BLD-6469';
    
    const exampleStakeholder = FugitiveAndMobileStakeholderOptions[0]?.value || 'Assembly';
    const exampleEquipmentType = FugitiveEquipmentTypeOptions.find(e => e.value === 'Air Handling Units (AHUs) with Refrigerants')?.value || 'Air Handling Units (AHUs) with Refrigerants';
    const exampleMaterial = materialRefrigerantOptions[0]?.value || 'R-134a';
    const exampleUnit = consumptionUnitOptions[0]?.value || 'kg';
    const exampleQC = qualityControlOptions[0]?.value || 'Good';
    
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    // 👇 Using user-friendly header "unit" instead of "consumption unit"
 const template = `building code,stakeholder,equipment type,material refrigerant,leakage value,unit,quality control,remarks,posting date
${exampleBuilding1},${exampleStakeholder},${exampleEquipmentType},${exampleMaterial},10,${exampleUnit},${exampleQC},AC maintenance - Unit 1,${formattedDate}`;

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + template], { type: 'text/csv;charset=utf-8;' });
    // const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fugitive_template.csv';
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


