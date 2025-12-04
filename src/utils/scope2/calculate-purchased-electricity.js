// // constants
// const AVERAGE_GRID_EF = 0.353; // KgCO2e/kWh
// const GRID_RESIDUAL_MIX_EF = 0.3883; // KgCO2e/kWh

// // Helper to convert based on unit
// const toKwh = (value, unit) => {
//   if (!value) return 0;
//   const num = parseFloat(value);
//   return unit === "MWh" ? num * 1000 : num;
// };

// // Main calculation function
// export const calculatePurchasedElectricity = (data, GridStationEmissionFactors) => {
//   if (!data?.method) return null;

//   const unit = data.unit || "kWh";

//   // CONDITION 1 : LOCATION-BASED
//   if (data.method === "location_based") {
//     const grossGridKwh = toKwh(data.totalGrossElectricityGrid, unit);
//     const otherSupplierKwh = toKwh(data.totalOtherSupplierElectricity, unit);

//     // X = total electricity
//     const X = grossGridKwh + otherSupplierKwh;

//     // Y = grid station emission factor
//     const Y = AVERAGE_GRID_EF;     //GridStationEmissionFactors[data.gridStation] || 0;

//     const Z = X * Y;

//     return {
//       calculatedEmissionKgCo2e: Z,
//       calculatedEmissionTCo2e: Z / 1000,
//       calculatedEmissionMarketKgCo2e: null,
//     };
//   }
//   // CONDITION 2 : MARKET-BASED
//   if (data.method === "market_based") {
//     // ---------------- 1) FIRST OUTPUT ----------------
//     const purchasedKwh = toKwh(data.totalPurchasedElectricity, unit);
//     // const calcKgCo2e = purchasedKwh * AVERAGE_GRID_EF;
//     const calcKgCo2e = purchasedKwh * GridStationEmissionFactors[data.gridStation] || 0;

//     // ---------------- 2) SECOND OUTPUT ----------------
//     const grossGridKwh = toKwh(data.totalGrossElectricityGrid, unit);
//     const solarRetainedKwh = toKwh(data.solarRetainedUnderRECs, unit);
//     const solarSoldKwh = toKwh(data.solarConsumedButSold, unit);
//     const supplierSpecificKwh = toKwh(data.supplierSpecificElectricity, unit);
//     const ppaKwh = toKwh(data.ppaElectricity, unit);
//     const renewableAttrKwh = toKwh(data.renewableAttributesElectricity, unit);

//     // Item 1: Total Gross Grid * Residual Mix
//     // const item1 = grossGridKwh * GRID_RESIDUAL_MIX_EF;
//     const item1 = grossGridKwh * GridStationEmissionFactors[data.gridStation] || 0;

//     // Item 2: Solar
//     const item2 =
//       solarRetainedKwh * 0 +
//       solarSoldKwh * GRID_RESIDUAL_MIX_EF;

//     // Item 3: Supplier-specific electricity
//     const item3 = data.hasSupplierEmissionFactor
//       ? supplierSpecificKwh * parseFloat(data.supplierEmissionFactor)
//       : supplierSpecificKwh * GRID_RESIDUAL_MIX_EF;

//     // Item 4: PPA electricity
//     const item4 = data.hasPPAEmissionFactor
//       ? ppaKwh * parseFloat(data.ppaEmissionFactor)
//       : ppaKwh * GRID_RESIDUAL_MIX_EF;

//     // Item 5: Renewable attributes
//     const item5 = renewableAttrKwh * 0;

//     const calculatedMarketKg = item1 + item2 + item3 + item4 + item5;

//     return {
//       calculatedEmissionKgCo2e: calcKgCo2e,      // from average grid 0.353
//       calculatedEmissionTCo2e: calcKgCo2e / 1000,
//       calculatedEmissionMarketKgCo2e: calculatedMarketKg,
//       calculatedEmissionMarketTCo2e: calculatedMarketKg / 1000,
//     };
//   }

//   return null;
// };


// constants
const AVERAGE_GRID_EF = 0.353; // KgCO2e/kWh
const GRID_RESIDUAL_MIX_EF = 0.3883; // KgCO2e/kWh

// Helper to convert based on unit
const toKwh = (value, unit) => {
  if (!value) return 0;
  const num = parseFloat(value);
  return unit === "MWh" ? num * 1000 : num;
};

// Main calculation function
export const calculatePurchasedElectricity = (data, GridStationEmissionFactors) => {
  if (!data?.method) return null;

  const unit = data.unit || "kWh";

  // CONDITION 1 : LOCATION-BASED
  if (data.method === "location_based") {
    const grossGridKwh = toKwh(data.totalGrossElectricityGrid, unit);
    const otherSupplierKwh = toKwh(data.totalOtherSupplierElectricity, unit);

    // X = total electricity
    const X = grossGridKwh + otherSupplierKwh;

    // Y = grid station emission factor
    const Y = AVERAGE_GRID_EF;     //GridStationEmissionFactors[data.gridStation] || 0;

    const Z = X * Y;

    return {
      calculatedEmissionKgCo2e: Z,
      calculatedEmissionTCo2e: Z / 1000,
      calculatedEmissionMarketKgCo2e: null,
    };
  }
  // CONDITION 2 : MARKET-BASED
  if (data.method === "market_based") {
    // ---------------- 1) FIRST OUTPUT ----------------
    const purchasedKwh = toKwh(data.totalPurchasedElectricity, unit);
    const calcKgCo2e = purchasedKwh * AVERAGE_GRID_EF;
    // const calcKgCo2e = purchasedKwh * GridStationEmissionFactors[data.gridStation] || 0;

    // ---------------- 2) SECOND OUTPUT ----------------
    const grossGridKwh = toKwh(data.totalGrossElectricityGrid, unit);
    const solarRetainedKwh = toKwh(data.solarRetainedUnderRECs, unit);
    const solarSoldKwh = toKwh(data.solarConsumedButSold, unit);
    const supplierSpecificKwh = toKwh(data.supplierSpecificElectricity, unit);
    const ppaKwh = toKwh(data.ppaElectricity, unit);
    const renewableAttrKwh = toKwh(data.renewableAttributesElectricity, unit);

    // Item 1: Total Gross Grid * Residual Mix
    // const item1 = grossGridKwh * GRID_RESIDUAL_MIX_EF;
    const item1 = grossGridKwh * GridStationEmissionFactors[data.gridStation] || 0;

    // Item 2: Solar
    const item2 =
      solarRetainedKwh * 0 +
      solarSoldKwh * GRID_RESIDUAL_MIX_EF;

    // Item 3: Supplier-specific electricity
    const item3 = data.hasSupplierEmissionFactor
      ? supplierSpecificKwh * parseFloat(data.supplierEmissionFactor)
      : supplierSpecificKwh * GRID_RESIDUAL_MIX_EF;

    // Item 4: PPA electricity
    const item4 = data.hasPPAEmissionFactor
      ? ppaKwh * parseFloat(data.ppaEmissionFactor)
      : ppaKwh * 0;

    // Item 5: Renewable attributes
    const item5 = renewableAttrKwh * 0;

    const calculatedMarketKg = item1 + item2 + item3 + item4 + item5;

    return {
      calculatedEmissionKgCo2e: calcKgCo2e,      // from average grid 0.353
      calculatedEmissionTCo2e: calcKgCo2e / 1000,
      calculatedEmissionMarketKgCo2e: calculatedMarketKg,
      calculatedEmissionMarketTCo2e: calculatedMarketKg / 1000,
    };
  }

  return null;
};
