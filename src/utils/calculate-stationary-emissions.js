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

import { unitConversion, emissionFactors, outOfScopeEmissionFactors } from "@/constant/scope1/calculate-stationary-emissions";

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

export const calculateStationaryEmissions = (fuelName, fuelConsumption, consumptionUnit) => {
  if (!fuelName || !fuelConsumption || !consumptionUnit) return null;

  const conversion = unitConversion[consumptionUnit];
  if (!conversion) {
    console.warn(`No conversion mapping found for unit "${consumptionUnit}".`);
    return null;
  }

  const convertedValue = fuelConsumption * conversion.factor;
  const targetUnit = conversion.to.toLowerCase(); // e.g., "kwh", "litres", "tonnes", "m3"

  let result = {
    convertedValue,
    emissionFactorInScope: null,
    emissionFactorOutScope: null,
    totalEmissionInScope: null,
    totalEmissionOutScope: null,
  };

  // --- In-scope ---
  const inScopeFactor = emissionFactors[fuelName]?.[targetUnit];
  if (inScopeFactor !== undefined) {
    result.emissionFactorInScope = inScopeFactor;
    result.totalEmissionInScope = convertedValue * inScopeFactor;
  }

  // --- Out-of-scope ---
  const outScopeFactor = outOfScopeEmissionFactors[fuelName]?.[targetUnit];
  if (outScopeFactor !== undefined) {
    result.emissionFactorOutScope = outScopeFactor;
    result.totalEmissionOutScope = convertedValue * outScopeFactor;
  }

  return result;
};
