import { fugitiveEmissionFactors } from "@/constant/scope1/calculate-fugitive-emission";

export const calculateFugitiveEmission = (material, leakageValue) => {
  if (!material || !leakageValue) return null;

  const factor = fugitiveEmissionFactors[material];
  if (!factor) {
    console.warn(`No emission factor found for "${material}"`);
    return null;
  }

  const totalEmissionKg = parseFloat(leakageValue) * factor;
  return totalEmissionKg;
};
