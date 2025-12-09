import { processEmissionFactors } from "@/constant/scope1/calculate-process-emission"; // adjust path

export const calculateProcessEmission = (data) => {
  if (!data?.activityType || !data?.amountOfEmissions) return null;

  const factor = processEmissionFactors[data.activityType];
  if (!factor) {
    console.warn(`No emission factor found for "${data.activityType}"`);
    return null;
  }

  const totalEmissionKg = parseFloat(data.amountOfEmissions) * factor; // kgCO2e
  const totalEmissionT = totalEmissionKg / 1000; // tCO2e


  
  return {
    calculatedEmissionKgCo2e: totalEmissionKg,
    calculatedEmissionTCo2e: totalEmissionT
  };
};

// import { processEmissionFactors } from "@/constant/scope1/calculate-process-emission"; // adjust path

// export const calculateProcessEmission = (data) => {
//   if (!data?.activityType || !data?.amountOfEmissions) {
//     console.log("Missing activityType or amountOfEmissions:", data);
//     return null;
//   }

//   const factor = processEmissionFactors[data.activityType];
//   if (!factor) {
//     console.warn(`No emission factor found for "${data.activityType}"`);
//     return null;
//   }

//   const amount = parseFloat(data.amountOfEmissions);
//   const totalEmissionKg = amount * factor; // kgCO2e
//   const totalEmissionT = totalEmissionKg / 1000; // tCO2e

//   // Log full calculation details
//   // console.log("=== Process Emission Calculation ===");
//   // console.log("Activity Type:", data.activityType);
//   // console.log("Amount of Emissions:", amount);
//   // console.log("Emission Factor (kgCO2e/unit):", factor);
//   // console.log("Total Emission (kgCO2e):", totalEmissionKg);
//   // console.log("Total Emission (tCO2e):", totalEmissionT);
//   // console.log("==================================");

//   return {
//     calculatedEmissionKgCo2e: totalEmissionKg,
//     calculatedEmissionTCo2e: totalEmissionT
//   };
// };
