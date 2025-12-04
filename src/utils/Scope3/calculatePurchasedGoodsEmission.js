import { purchasedGoodsServicesEF } from "@/constant/scope3/purchasedGoodAndServices"; // adjust path

export const calculatePurchasedGoodsEmission = (data) => {
  if (!data?.amountSpent || !data?.purchasedGoodsServicesType) return null;

  const factor = purchasedGoodsServicesEF[data.purchasedGoodsServicesType];
  if (!factor) {
    console.warn(`No emission factor found for "${data.purchasedGoodsServicesType}"`);
    return null;
  }

  const amountSpent = parseFloat(data.amountSpent);
  const totalEmissionKg = amountSpent * factor; // kgCO2e
  const totalEmissionT = totalEmissionKg / 1000; // tCO2e

  return {
    calculatedEmissionKgCo2e: totalEmissionKg,
    calculatedEmissionTCo2e: totalEmissionT
  };
};
