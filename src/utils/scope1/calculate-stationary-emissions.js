// import { unitConversion, emissionFactors } from "@/constant/calculate-stationary-emissions";

// export const calculateStationaryEmissions = (fuelName, fuelConsumption, consumptionUnit) => {
//   if (!fuelName || !fuelConsumption || !consumptionUnit) return null;

//   const factorData = emissionFactors[fuelName];
//   if (!factorData) {
//     console.warn(` No emission factor found for fuel "${fuelName}".`);
//     return null;
//   }

//   // Step 1: Find conversion details
//   const conversion = unitConversion[consumptionUnit];
//   if (!conversion) {
//     console.warn(` No conversion mapping found for unit "${consumptionUnit}".`);
//     return null;
//   }

//   // Step 2: Convert value to base unit
//   const convertedValue = fuelConsumption * conversion.factor;

//   // Step 3: Select the correct emission factor key (depends on 'to' field)
//   const targetUnit = conversion.to.toLowerCase(); // e.g., "kwh", "litres", "tonnes", "m3"

//   const emissionFactor = factorData[targetUnit];
//   if (!emissionFactor) {
//     console.warn(
//       `No emission factor for unit "${targetUnit}" found in fuel "${fuelName}".`
//     );
//     return null;
//   }

//   // Step 4: Calculate total emission
//   const totalEmission = convertedValue * emissionFactor;

//   return {
//     convertedValue,
//     emissionFactor,
//     totalEmission,
//     unitUsed: targetUnit,
//   };
// };


// export const calculateStationaryEmissions = (fuelName, fuelConsumption, consumptionUnit) => {
//   if (!fuelName || !fuelConsumption || !consumptionUnit) return null;

//   // Normalize inputs
//   const normalizedFuel = fuelName.trim();
//   const normalizedUnit = consumptionUnit.toLowerCase();

//   // 1️⃣ Try to find emission factor in in-scope dataset
//   let factorData = emissionFactors[normalizedFuel];
//   let scopeType = "in-scope";

//   // 2️⃣ If not found, try out-of-scope dataset
//   if (!factorData) {
//     factorData = outOfScopeEmissionFactors[normalizedFuel];
//     scopeType = "out-of-scope";
//   }

//   // 3️⃣ Validate emission factor data
//   if (!factorData) {
//     console.warn(`⚠️ No emission factor found for fuel "${fuelName}".`);
//     return null;
//   }

//   // 4️⃣ Find conversion details
//   const conversion = unitConversion[normalizedUnit];
//   if (!conversion) {
//     console.warn(`⚠️ No conversion mapping found for unit "${consumptionUnit}".`);
//     return null;
//   }

//   // 5️⃣ Convert to base unit (e.g., litres → kWh, etc.)
//   const convertedValue = fuelConsumption * conversion.factor;
//   const targetUnit = conversion.to.toLowerCase();

//   // 6️⃣ Find emission factor for the converted unit
//   const emissionFactor = factorData[targetUnit];
//   if (!emissionFactor) {
//     console.warn(`⚠️ No emission factor for unit "${targetUnit}" found in fuel "${fuelName}".`);
//     return null;
//   }

//   // 7️⃣ Calculate total emissions
//   const totalEmission = convertedValue * emissionFactor;
//   const totalEmissionT = totalEmission / 1000; // convert kg → tonnes

//   // 8️⃣ Return complete result
//   return {
//     scopeType,             // "in-scope" or "out-of-scope"
//     convertedValue,        // converted fuel value
//     emissionFactor,        // factor used
//     totalEmission,         // in kg CO₂e
//     totalEmissionT,        // in tonnes CO₂e
//     unitUsed: targetUnit,  // e.g., "litres"
//   };
// };






// import { unitConversion, emissionFactors, outOfScopeEmissionFactors } from "@/constant/scope1/calculate-stationary-emissions";

// export const calculateStationaryEmissions = (fuelName, fuelConsumption, consumptionUnit) => {
//   if (!fuelName || !fuelConsumption || !consumptionUnit) return null;

//   const conversion = unitConversion[consumptionUnit];
//   if (!conversion) {
//     console.warn(`No conversion mapping found for unit "${consumptionUnit}".`);
//     return null;
//   }

//   const convertedValue = fuelConsumption * conversion.factor;
//   const targetUnit = conversion.to.toLowerCase(); // e.g., "kwh", "litres", "tonnes", "m3"

//   let result = {
//     convertedValue,
//     emissionFactorInScope: null,
//     emissionFactorOutScope: null,
//     totalEmissionInScope: null,
//     totalEmissionOutScope: null,
//   };

//   // --- In-scope ---
//   const inScopeFactor = emissionFactors[fuelName]?.[targetUnit];
//   if (inScopeFactor !== undefined) {
//     result.emissionFactorInScope = inScopeFactor;
//     result.totalEmissionInScope = convertedValue * inScopeFactor;
//   }

//   // --- Out-of-scope ---
//   const outScopeFactor = outOfScopeEmissionFactors[fuelName]?.[targetUnit];
//   if (outScopeFactor !== undefined) {
//     result.emissionFactorOutScope = outScopeFactor;
//     result.totalEmissionOutScope = convertedValue * outScopeFactor;
//   }

//   return result;
// };

import { unitConversion, emissionFactors, outOfScopeEmissionFactors } from "@/constant/scope1/calculate-stationary-emissions";

export const calculateStationaryEmissions = (fuelName, fuelConsumption, consumptionUnit) => {
  console.group('CALCULATE STATIONARY EMISSIONS - START');
  console.log('INPUT PARAMETERS:');
  console.log('- fuelName:', fuelName);
  console.log('- fuelConsumption:', fuelConsumption);
  console.log('- consumptionUnit:', consumptionUnit);
  
  if (!fuelName || !fuelConsumption || !consumptionUnit) {
    console.error(' Missing required parameters!');
    console.groupEnd();
    return null;
  }

  console.log('\n UNIT CONVERSION:');
  const conversion = unitConversion[consumptionUnit];
  if (!conversion) {
    console.error(` No conversion mapping found for unit "${consumptionUnit}"`);
    console.log('Available units:', Object.keys(unitConversion));
    console.groupEnd();
    return null;
  }
  
  console.log('- Conversion mapping:', conversion);
  console.log('- Factor:', conversion.factor);
  console.log('- Target unit:', conversion.to);
  
  const convertedValue = fuelConsumption * conversion.factor;
  const targetUnit = conversion.to.toLowerCase();
  
  console.log('- Converted value:', convertedValue);
  console.log('- Target unit (lowercase):', targetUnit);

  let result = {
    convertedValue,
    emissionFactorInScope: null,
    emissionFactorOutScope: null,
    totalEmissionInScope: null,
    totalEmissionOutScope: null,
  };

  console.log('\n IN-SCOPE EMISSION CALCULATION:');
  console.log('- Looking for fuelName in emissionFactors:', fuelName);
  console.log('- emissionFactors object has this fuel?', fuelName in emissionFactors);
  
  if (fuelName in emissionFactors) {
    console.log('- Fuel found! Available units for this fuel:', Object.keys(emissionFactors[fuelName]));
    console.log('- Looking for target unit:', targetUnit);
    
    const inScopeFactor = emissionFactors[fuelName]?.[targetUnit];
    console.log('- Emission factor found:', inScopeFactor);
    
    if (inScopeFactor !== undefined) {
      result.emissionFactorInScope = inScopeFactor;
      result.totalEmissionInScope = convertedValue * inScopeFactor;
      console.log('- Calculation:');
      console.log(`  ${convertedValue} ${targetUnit} × ${inScopeFactor} = ${result.totalEmissionInScope} kg CO2e`);
    } else {
      console.warn(` No in-scope emission factor found for unit "${targetUnit}"`);
      console.log('- Available units for this fuel:', Object.keys(emissionFactors[fuelName]));
    }
  } else {
    console.warn(` Fuel "${fuelName}" not found in emissionFactors (in-scope)`);
    console.log('- Available fuels in-scope:', Object.keys(emissionFactors));
  }

  console.log('\n OUT-OF-SCOPE (BIO) EMISSION CALCULATION:');
  console.log('- Looking for fuelName in outOfScopeEmissionFactors:', fuelName);
  console.log('- outOfScopeEmissionFactors has this fuel?', fuelName in outOfScopeEmissionFactors);
  
  if (fuelName in outOfScopeEmissionFactors) {
    console.log('- Fuel found! Available units for this fuel:', Object.keys(outOfScopeEmissionFactors[fuelName]));
    console.log('- Looking for target unit:', targetUnit);
    
    const outScopeFactor = outOfScopeEmissionFactors[fuelName]?.[targetUnit];
    console.log('- Emission factor found:', outScopeFactor);
    
    if (outScopeFactor !== undefined) {
      result.emissionFactorOutScope = outScopeFactor;
      result.totalEmissionOutScope = convertedValue * outScopeFactor;
      console.log('- Calculation:');
      console.log(`  ${convertedValue} ${targetUnit} × ${outScopeFactor} = ${result.totalEmissionOutScope} kg CO2e`);
      
      // Also show tonnes conversion
      if (result.totalEmissionOutScope) {
        console.log(`  In tonnes: ${result.totalEmissionOutScope / 1000} t CO2e`);
      }
    } else {
      console.warn(` No out-of-scope emission factor found for unit "${targetUnit}"`);
      console.log('- Available units for this fuel:', Object.keys(outOfScopeEmissionFactors[fuelName]));
      console.log('- Did you mean one of these?', Object.keys(outOfScopeEmissionFactors[fuelName]));
    }
  } else {
    console.warn(` Fuel "${fuelName}" not found in outOfScopeEmissionFactors (out-of-scope)`);
    console.log('- Available fuels out-of-scope:', Object.keys(outOfScopeEmissionFactors));
  }

  console.log('\n FINAL RESULT:');
  console.log('- Converted value:', result.convertedValue);
  console.log('- In-scope emission factor:', result.emissionFactorInScope);
  console.log('- Out-of-scope emission factor:', result.emissionFactorOutScope);
  console.log('- Total in-scope emissions:', result.totalEmissionInScope, 'kg CO2e');
  console.log('- Total out-of-scope emissions:', result.totalEmissionOutScope, 'kg CO2e');
  
  if (result.totalEmissionInScope) {
    console.log(`- In-scope in tonnes: ${result.totalEmissionInScope / 1000} t CO2e`);
  }
  if (result.totalEmissionOutScope) {
    console.log(`- Out-of-scope in tonnes: ${result.totalEmissionOutScope / 1000} t CO2e`);
  }

  console.log('\n DEBUG INFO:');
  console.log('- Consumption unit input:', consumptionUnit);
  console.log('- Target unit after conversion:', targetUnit);
  console.log('- Exact match for in-scope:', emissionFactors[fuelName]?.[targetUnit]);
  console.log('- Exact match for out-of-scope:', outOfScopeEmissionFactors[fuelName]?.[targetUnit]);
  
  // Check for case sensitivity issues
  const allInScopeKeys = Object.keys(emissionFactors);
  const allOutScopeKeys = Object.keys(outOfScopeEmissionFactors);
  console.log('\n CASE SENSITIVITY CHECK:');
  console.log('- Fuel name to match:', `"${fuelName}"`);
  console.log('- In-scope exact match?', allInScopeKeys.includes(fuelName));
  console.log('- Out-scope exact match?', allOutScopeKeys.includes(fuelName));
  
  // Find similar names if exact match not found
  if (!allInScopeKeys.includes(fuelName)) {
    const similarInScope = allInScopeKeys.filter(key => 
      key.toLowerCase().includes(fuelName.toLowerCase()) || 
      fuelName.toLowerCase().includes(key.toLowerCase())
    );
    if (similarInScope.length > 0) {
      console.log(' Similar in-scope fuel names:', similarInScope);
    }
  }
  
  if (!allOutScopeKeys.includes(fuelName)) {
    const similarOutScope = allOutScopeKeys.filter(key => 
      key.toLowerCase().includes(fuelName.toLowerCase()) || 
      fuelName.toLowerCase().includes(key.toLowerCase())
    );
    if (similarOutScope.length > 0) {
      console.log(' Similar out-of-scope fuel names:', similarOutScope);
    }
  }

  console.groupEnd();
  return result;
};