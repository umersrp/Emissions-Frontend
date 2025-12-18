// import { purchasedGoodsServicesEF } from "@/constant/scope3/purchasedGoodAndServices"; // adjust path

// export const calculatePurchasedGoodsEmission = (data) => {
//   if (!data?.amountSpent || !data?.purchasedGoodsServicesType) return null;

//   const factor = purchasedGoodsServicesEF[data.purchasedGoodsServicesType];
//   if (!factor) {
//     console.warn(`No emission factor found for "${data.purchasedGoodsServicesType}"`);
//     return null;
//   }

//   const amountSpent = parseFloat(data.amountSpent);
//   const totalEmissionKg = amountSpent * factor; // kgCO2e
//   const totalEmissionT = totalEmissionKg / 1000; // tCO2e

//   return {
//     calculatedEmissionKgCo2e: totalEmissionKg,
//     calculatedEmissionTCo2e: totalEmissionT
//   };
// };

import { purchasedGoodsServicesEF } from "@/constant/scope3/purchasedGoodAndServices";

export const calculatePurchasedGoodsEmission = (data) => {
  console.group("Purchased Goods & Services Emission Calculation");

  console.log(" Input data:", data);

  if (!data?.amountSpent || !data?.purchasedGoodsServicesType) {
    console.warn(" Missing required inputs");
    console.groupEnd();
    return null;
  }

  const factor = purchasedGoodsServicesEF[data.purchasedGoodsServicesType];
  console.log(" Emission factor:", factor);

  if (!factor) {
    console.warn(
      `No emission factor found for "${data.purchasedGoodsServicesType}"`
    );
    console.groupEnd();
    return null;
  }

  const amountSpent = parseFloat(data.amountSpent);
  console.log(" Amount spent (parsed):", amountSpent);

  const totalEmissionKg = amountSpent * factor;
  console.log("Emission (kgCO2e):", totalEmissionKg);

  const totalEmissionT = totalEmissionKg / 1000;
  console.log(" Emission (tCO2e):", totalEmissionT);

  console.log(" Final Result:", {
    calculatedEmissionKgCo2e: totalEmissionKg,
    calculatedEmissionTCo2e: totalEmissionT,
  });

  console.groupEnd();

  return {
    calculatedEmissionKgCo2e: totalEmissionKg,
    calculatedEmissionTCo2e: totalEmissionT,
  };
};
