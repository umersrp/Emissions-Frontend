// import { wasteEmissionFactors } from "@/constant/scope3/wasteGenerated";

// export const calculateWasteEmission = (
//   totalWasteQty,
//   wasteType,
//   wasteTreatmentMethod
// ) => {
//   if (!totalWasteQty || !wasteType || !wasteTreatmentMethod) return null;

//   const typeFactors = wasteEmissionFactors[wasteType];

//   if (!typeFactors) {
//     console.warn(`No emission factors found for waste type "${wasteType}"`);
//     return null;
//   }

//   const emissionFactor = typeFactors[wasteTreatmentMethod];

//   if (!emissionFactor) {
//     console.warn(
//       `No emission factor found for "${wasteType}" with treatment "${wasteTreatmentMethod}"`
//     );
//     return null;
//   }

//   const totalEmissionKgCo2e =
//     parseFloat(totalWasteQty) * emissionFactor;

//   return totalEmissionKgCo2e;
// };
import { wasteEmissionFactors } from "@/constant/scope3/wasteGenerated";

export const calculateWasteEmission = (
  totalWasteQty,
  wasteType,
  wasteTreatmentMethod
) => {
  console.log("calculateWasteEmission called");

  console.log("Inputs:", {
    totalWasteQty,
    wasteType,
    wasteTreatmentMethod,
  });

  if (!totalWasteQty || !wasteType || !wasteTreatmentMethod) {
    console.warn("❌ Missing required inputs");
    return null;
  }

  const typeFactors = wasteEmissionFactors[wasteType];
  console.log("Type Factors:", typeFactors);

  if (!typeFactors) {
    console.warn(`❌ No emission factors found for waste type "${wasteType}"`);
    return null;
  }

  const emissionFactor = typeFactors[wasteTreatmentMethod];
  console.log("Emission Factor:", emissionFactor);

  if (!emissionFactor) {
    console.warn(
      `❌ No emission factor found for "${wasteType}" with treatment "${wasteTreatmentMethod}"`
    );
    return null;
  }

  const totalEmissionKgCo2e =
    parseFloat(totalWasteQty) * emissionFactor;

  console.log("Calculation Result:", {
    quantity: parseFloat(totalWasteQty),
    emissionFactor,
    totalEmissionKgCo2e,
  });

  return totalEmissionKgCo2e;
};
