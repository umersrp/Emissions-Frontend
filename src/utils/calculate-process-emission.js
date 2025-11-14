import { processEmissionFactors } from "@/constant/calculate-process-emission"; // adjust path

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
