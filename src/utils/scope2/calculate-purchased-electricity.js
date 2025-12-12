// //V1
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
//     const calcKgCo2e = purchasedKwh * AVERAGE_GRID_EF;
//     // const calcKgCo2e = purchasedKwh * GridStationEmissionFactors[data.gridStation] || 0;

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
//       : ppaKwh * 0;

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




// //V2
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

//     const X = grossGridKwh + otherSupplierKwh;
//     const Y = AVERAGE_GRID_EF;

//     const Z = X * Y;

//     return {
//       calculatedEmissionKgCo2e: Z,
//       calculatedEmissionTCo2e: Z / 1000,
//       calculatedEmissionMarketKgCo2e: null,
//     };
//   }

//   // CONDITION 2 : MARKET-BASED
//   if (data.method === "market_based") {
//     // FIRST OUTPUT
//     const purchasedKwh = toKwh(data.totalPurchasedElectricity, unit);
//     const calcKgCo2e = purchasedKwh * AVERAGE_GRID_EF;

//     // SECOND OUTPUT
//     const grossGridKwh = toKwh(data.totalGrossElectricityGrid, unit);
//     const solarRetainedKwh = toKwh(data.solarRetainedUnderRECs, unit);
//     const solarSoldKwh = toKwh(data.solarConsumedButSold, unit);
//     const supplierSpecificKwh = toKwh(data.supplierSpecificElectricity, unit);
//     const ppaKwh = toKwh(data.ppaElectricity, unit);

//     // Renewable attributes (default 0 if user does not enter anything)
//     const renewableAttrKwh = data.renewableAttributesElectricity
//       ? toKwh(data.renewableAttributesElectricity, unit)
//       : 0;

//     // ITEM 1:
//     // Adjust gross grid by subtracting renewableAttrKwh but NOT below 0
//     let adjustedGrossGrid = grossGridKwh - renewableAttrKwh;
//     if (adjustedGrossGrid < 0) adjustedGrossGrid = 0;

//     const gridEF = GridStationEmissionFactors[data.gridStation] || 0;
//     const item1 = adjustedGrossGrid * gridEF;

//     // ITEM 2: Solar
//     const item2 =
//       solarRetainedKwh * 0 +
//       solarSoldKwh * GRID_RESIDUAL_MIX_EF;

//     // ITEM 3: Supplier-specific
//     const item3 = data.hasSupplierEmissionFactor
//       ? supplierSpecificKwh * parseFloat(data.supplierEmissionFactor)
//       : supplierSpecificKwh * GRID_RESIDUAL_MIX_EF;

//     // ITEM 4: PPA electricity
//     const item4 = data.hasPPAEmissionFactor
//       ? ppaKwh * parseFloat(data.ppaEmissionFactor)
//       : ppaKwh * 0;

//     // ITEM 5: Renewable attributes (use value directly)
//     const item5 = renewableAttrKwh * 0;

//     const calculatedMarketKg = item1 + item2 + item3 + item4 + item5;

//     return {
//       calculatedEmissionKgCo2e: calcKgCo2e,
//       calculatedEmissionTCo2e: calcKgCo2e / 1000,
//       calculatedEmissionMarketKgCo2e: calculatedMarketKg,
//       calculatedEmissionMarketTCo2e: calculatedMarketKg / 1000,
//     };
//   }

//   return null;
// };


//V3
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

  console.log("=== PURCHASED ELECTRICITY CALCULATION START ===");
  console.log("INPUT DATA:", JSON.parse(JSON.stringify(data)));
  console.log("UNIT:", unit);

  // CONDITION 1 : LOCATION-BASED
  if (data.method === "location_based") {
    console.log("\n--- LOCATION BASED CALCULATION ---");

    const grossGridKwh = toKwh(data.totalGrossElectricityGrid, unit);
    const otherSupplierKwh = toKwh(data.totalOtherSupplierElectricity, unit);

    console.log("Gross Grid (kWh):", grossGridKwh);
    console.log("Other Supplier (kWh):", otherSupplierKwh);

    const X = grossGridKwh + otherSupplierKwh;
    const Y = AVERAGE_GRID_EF;
    const Z = X * Y;

    console.log("Total X (Grid + Other):", X);
    console.log("EF (Average Grid):", Y);
    console.log("Final Emission (kgCO2e):", Z);

    console.log("=== END LOCATION BASED ===\n");

    return {
      calculatedEmissionKgCo2e: Z,
      calculatedEmissionTCo2e: Z / 1000,
      calculatedEmissionMarketKgCo2e: null,
    };
  }

  // CONDITION 2 : MARKET-BASED
  if (data.method === "market_based") {
    console.log("\n--- MARKET BASED CALCULATION ---");

    // FIRST OUTPUT
    const purchasedKwh = toKwh(data.totalPurchasedElectricity, unit);
    const calcKgCo2e = purchasedKwh * AVERAGE_GRID_EF;

    console.log("Purchased Electricity (kWh):", purchasedKwh);
    console.log("Location-based EF:", AVERAGE_GRID_EF);
    console.log("Calculated Emission (kgCO2e):", calcKgCo2e);

    // SECOND OUTPUT
    const grossGridKwh = toKwh(data.totalGrossElectricityGrid, unit);
    const solarRetainedKwh = toKwh(data.solarRetainedUnderRECs, unit);
    const solarSoldKwh = toKwh(data.solarConsumedButSold, unit);
    const supplierSpecificKwh = toKwh(data.supplierSpecificElectricity, unit);
    const ppaKwh = toKwh(data.ppaElectricity, unit);

    console.log("\n-- Converted kWh Values --");
    console.log("Gross Grid:", grossGridKwh);
    console.log("Solar Retained:", solarRetainedKwh);
    console.log("Solar Sold:", solarSoldKwh);
    console.log("Supplier Specific:", supplierSpecificKwh);
    console.log("PPA:", ppaKwh);

    // Renewable attributes (default 0)
    const renewableAttrKwh = data.renewableAttributesElectricity
      ? toKwh(data.renewableAttributesElectricity, unit)
      : 0;

    console.log("Renewable Attributes (Input or Default 0):", renewableAttrKwh);

    // ITEM 1
    let adjustedGrossGrid = grossGridKwh - renewableAttrKwh;
    if (adjustedGrossGrid < 0) adjustedGrossGrid = 0;

    const gridEF = GridStationEmissionFactors[data.gridStation] || 0;
    const item1 = adjustedGrossGrid * gridEF;

    console.log("\n-- ITEM 1 (Adjusted Gross Grid * Grid EF) --");
    console.log("Gross Grid:", grossGridKwh);
    console.log("Minus Renewable:", renewableAttrKwh);
    console.log("Adjusted Gross Grid:", adjustedGrossGrid);
    console.log("Grid EF:", gridEF);
    console.log("Item 1:", item1);

    // ITEM 2
    const item2 =
      solarRetainedKwh * 0 +
      solarSoldKwh * GRID_RESIDUAL_MIX_EF;

    console.log("\n-- ITEM 2 (Solar) --");
    console.log("Solar Retained * 0:", solarRetainedKwh * 0);
    console.log("Solar Sold * Residual EF:", solarSoldKwh * GRID_RESIDUAL_MIX_EF);
    console.log("Item 2:", item2);

    // ITEM 3
    const item3 = data.hasSupplierEmissionFactor
      ? supplierSpecificKwh * parseFloat(data.supplierEmissionFactor)
      : supplierSpecificKwh * GRID_RESIDUAL_MIX_EF;

    console.log("\n-- ITEM 3 (Supplier Specific) --");
    console.log("Has Supplier EF:", data.hasSupplierEmissionFactor);
    console.log("Supplier KWh:", supplierSpecificKwh);
    console.log(
      "Used EF:",
      data.hasSupplierEmissionFactor
        ? data.supplierEmissionFactor
        : GRID_RESIDUAL_MIX_EF
    );
    console.log("Item 3:", item3);

    // ITEM 4
    const item4 = data.hasPPAEmissionFactor
      ? ppaKwh * parseFloat(data.ppaEmissionFactor)
      : ppaKwh * 0;

    console.log("\n-- ITEM 4 (PPA) --");
    console.log("Has PPA EF:", data.hasPPAEmissionFactor);
    console.log("PPA kWh:", ppaKwh);
    console.log("Item 4:", item4);

    // ITEM 5
    const item5 = renewableAttrKwh * 0;

    console.log("\n-- ITEM 5 (Renewable Attributes * 0) --");
    console.log("Renewable Attr:", renewableAttrKwh);
    console.log("Item 5:", item5);

    const calculatedMarketKg = item1 + item2 + item3 + item4 + item5;

    console.log("\n=== FINAL MARKET BASED OUTPUT ===");
    console.log("Item1:", item1);
    console.log("Item2:", item2);
    console.log("Item3:", item3);
    console.log("Item4:", item4);
    console.log("Item5:", item5);
    console.log("TOTAL MARKET KG CO2e:", calculatedMarketKg);

    console.log("=== END MARKET BASED ===\n");

    return {
      calculatedEmissionKgCo2e: calcKgCo2e,
      calculatedEmissionTCo2e: calcKgCo2e / 1000,
      calculatedEmissionMarketKgCo2e: calculatedMarketKg,
      calculatedEmissionMarketTCo2e: calculatedMarketKg / 1000,
    };
  }

  console.log("=== END CALCULATION ===");
  return null;
};
