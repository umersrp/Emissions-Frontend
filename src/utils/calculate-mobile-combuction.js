
// import { mobileEmissionFactors } from "@/constant/calculate-mobile-combustion";

// export const calculateMobileCombustion = (
//   fuelName,
//   distanceTraveled,
//   distanceUnit,
//   vehicleType,
//   vehicleClassification, // 👈 new default
// ) => {
//   if (!fuelName || !distanceTraveled || !distanceUnit) return null;

//   const unit = distanceUnit.toLowerCase();

//   // find the classification group
//   const classificationData = mobileEmissionFactors[vehicleClassification];
//   if (!classificationData) {
//     console.warn(`No data found for classification "${vehicleClassification}"`);
//     return null;
//   }

//   // find the specific vehicle type inside classification
//   const vehicleData = classificationData[vehicleType];
//   if (!vehicleData) {
//     console.warn(`No data found for vehicle type "${vehicleType}" under "${vehicleClassification}"`);
//     return null;
//   }

//   const factorData = vehicleData[unit];
//   if (!factorData) {
//     console.warn(`No emission factors for unit "${unit}".`);
//     return null;
//   }

//   const emissionFactor = factorData[fuelName];
//   if (emissionFactor === undefined) {
//     console.warn(`No emission factor found for fuel "${fuelName}".`);
//     return null;
//   }

//   const distance = parseFloat(distanceTraveled);
//   const totalEmissionKg = distance * emissionFactor;
//   const totalEmissionTonnes = totalEmissionKg / 1000;

//   return {
//     distance,
//     unit,
//     emissionFactor,
//     totalEmissionKg,
//     totalEmissionTonnes,
//   };
// };
import { mobileEmissionFactors } from "@/constant/calculate-mobile-combustion";

export const calculateMobileCombustion = (
  fuelName,
  distanceTraveled,
  distanceUnit,
  vehicleType,
  vehicleClassification,
  weightLoaded = null // ✅ optional param for HGVs
) => {
  if (!distanceTraveled || !distanceUnit || !vehicleClassification) return null;

  const unit = distanceUnit.toLowerCase();

  // find classification
  const classificationData = mobileEmissionFactors[vehicleClassification];
  if (!classificationData) {
    console.warn(`No data found for classification "${vehicleClassification}"`);
    return null;
  }

  // find vehicle type
  const vehicleData = classificationData[vehicleType];
  if (!vehicleData) {
    console.warn(`No data found for vehicle type "${vehicleType}" under "${vehicleClassification}"`);
    return null;
  }

  // find unit-based emission factors
  const factorData = vehicleData[unit];
  if (!factorData) {
    console.warn(`No emission factors found for unit "${unit}".`);
    return null;
  }

  // ✅ Special condition for HGVs
  const isHGV =
    vehicleClassification === "Heavy Good Vehicles (HGVs All Diesel)" ||
    vehicleClassification === "Heavy Good Vehicles (Refrigerated HGVs All Diesel)";

  const lookupKey = isHGV ? weightLoaded : fuelName;

  const emissionFactor = factorData[lookupKey];
  if (emissionFactor === undefined) {
    console.warn(
      `No emission factor found for ${isHGV ? `weight "${weightLoaded}"` : `fuel "${fuelName}"`}.`
    );
    return null;
  }

  const distance = parseFloat(distanceTraveled);
  const totalEmissionKg = distance * emissionFactor;
  const totalEmissionTonnes = totalEmissionKg / 1000;

  return {
    distance,
    unit,
    emissionFactor,
    totalEmissionKg,
    totalEmissionTonnes,
  };
};
