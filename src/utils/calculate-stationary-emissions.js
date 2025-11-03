// import { unitConversion, emissionFactors } from "@/constant/calculate-stationary-emissions";

// export const calculateStationaryEmissions = (fuelName, fuelConsumption, consumptionUnit) => {
//   if (!fuelName || !fuelConsumption || !consumptionUnit) return null;

//   const factorData = emissionFactors[fuelName];
//   if (!factorData) return null;

//   let xInKWh = fuelConsumption;

//   // Only convert to KWh if that’s the target of the conversion
//   const conversion = unitConversion[consumptionUnit];
//   if (conversion?.to === "KWh") {
//     xInKWh = fuelConsumption * conversion.factor;
//   }

//   // Read emission factor for kWh
//   const y = factorData["kWh"];
//   if (!y) return null;

//   const z = xInKWh * y;

//   return { xInKWh, y, z };
// };

import { unitConversion, emissionFactors } from "@/constant/calculate-stationary-emissions";

export const calculateStationaryEmissions = (fuelName, fuelConsumption, consumptionUnit) => {
  if (!fuelName || !fuelConsumption || !consumptionUnit) return null;

  const factorData = emissionFactors[fuelName];
  if (!factorData) {
    console.warn(` No emission factor found for fuel "${fuelName}".`);
    return null;
  }

  // Step 1: Find conversion details
  const conversion = unitConversion[consumptionUnit];
  if (!conversion) {
    console.warn(` No conversion mapping found for unit "${consumptionUnit}".`);
    return null;
  }

  // Step 2: Convert value to base unit
  const convertedValue = fuelConsumption * conversion.factor;

  // Step 3: Select the correct emission factor key (depends on 'to' field)
  const targetUnit = conversion.to.toLowerCase(); // e.g., "kwh", "litres", "tonnes", "m3"

  const emissionFactor = factorData[targetUnit];
  if (!emissionFactor) {
    console.warn(
      `No emission factor for unit "${targetUnit}" found in fuel "${fuelName}".`
    );
    return null;
  }

  // Step 4: Calculate total emission
  const totalEmission = convertedValue * emissionFactor;

  return {
    convertedValue,
    emissionFactor,
    totalEmission,
    unitUsed: targetUnit,
  };
};

