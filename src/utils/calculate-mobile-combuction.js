
// import { mobileEmissionFactors } from "@/constant/calculate-mobile-combustion";

// export const calculateMobileCombustion = (vehicleType, fuelName, distance, unit) => {
//   if (!vehicleType || !fuelName || !distance || !unit) return null;

//   const factors = mobileEmissionFactors[vehicleType] || mobileEmissionFactors.default;
//   const unitFactors = factors[unit.toLowerCase()];

//   if (!unitFactors) {
//     console.warn(`No emission factors for unit "${unit}"`);
//     return null;
//   }

//   const emissionFactor = unitFactors[fuelName];
//   if (emissionFactor === undefined) {
//     console.warn(`No emission factor found for fuel "${fuelName}" in type "${vehicleType}"`);
//     return null;
//   }

//   const totalEmission = parseFloat(distance) * emissionFactor;

//   return {
//     emissionFactor,
//     totalEmission,
//     unitUsed: unit,
//   };
// };
// src/constant/calculate-mobile-combustion.js

import { mobileEmissionFactors } from "@/constant/mobileEmissionFactors";

// Step 1: Main calculation function
export const calculateMobileCombustion = (
  fuelName,
  distanceTraveled,
  distanceUnit,
  vehicleType = "default" // optional, default fallback
) => {
  if (!fuelName || !distanceTraveled || !distanceUnit) return null;

  const unit = distanceUnit.toLowerCase(); // "km" or "miles"

  // Step 2: Pick dataset for given vehicle type (fallback to default)
  const vehicleFactors = mobileEmissionFactors[vehicleType] || mobileEmissionFactors.default;
  const factorData = vehicleFactors[unit];

  if (!factorData) {
    console.warn(`No emission factors found for unit "${unit}".`);
    return null;
  }

  // Step 3: Get emission factor for selected fuel
  const emissionFactor = factorData[fuelName];
  if (emissionFactor === undefined) {
    console.warn(`No emission factor found for fuel "${fuelName}" in unit "${unit}".`);
    return null;
  }

  // Step 4: Calculate total emissions
  const distance = parseFloat(distanceTraveled);
  const totalEmissionKg = distance * emissionFactor;       // in kgCO2e
  const totalEmissionTonnes = totalEmissionKg / 1000;      // in tCO2e

  // Step 5: Return detailed object
  return {
    distance,
    unit,
    emissionFactor,
    totalEmissionKg,
    totalEmissionTonnes,
  };
};
