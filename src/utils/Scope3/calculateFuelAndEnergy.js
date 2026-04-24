import {
  unitConversion,
} from "@/constant/scope3/options";
import { unitsEmissionFactors,airTravelEmissionFactors, taxiEmissionFactors, busEmissionFactors, trainEmissionFactors } from "@/constant/scope3/fuelAndEnergy";

const TD_FACTOR = 0.01853;
const WTT_FACTOR = 0.04590;
const WTT_TD_FACTOR = 0.00397;

export const calculateFuelAndEnergy = (data) => {
  console.group("Fuel & Energy Emission Calculation");

  if (!data) {
    console.warn("No data provided");
    console.groupEnd();
    return null;
  }

  console.log(" Input Data:", data);

  let resultA = 0;
  let resultB = 0;
  let resultC = 0;
  let resultD = 0;
  let resultE = 0;
  let resultF = 0;


  console.group("🅰️ Result A – Fuel & Electricity");

  // Get input values
  let totalFuelConsumption = Number(data.totalFuelConsumption);
  const fuel = data.fuel;
  const fuelUnit = data.fuelConsumptionUnit;

  // ===== Step 1: Convert input to base unit =====
  const conversion = unitConversion?.[fuelUnit];
  if (conversion) {
    totalFuelConsumption = totalFuelConsumption * conversion.factor;
    console.log(`Converted ${fuelUnit} to ${conversion.to}:`, totalFuelConsumption);
  } else {
    console.warn("No conversion found for unit:", fuelUnit);
  }

  // ===== Step 2: Get emission factor =====
  const fuelFactor =
    unitsEmissionFactors?.[fuel]?.[conversion?.to.toLowerCase()] ||
    unitsEmissionFactors?.[fuel]?.[conversion?.to] ||
    0;

  // ===== Step 3: Calculate Result A =====
  resultA = totalFuelConsumption * fuelFactor;

  console.log("A Inputs:", {
    originalValue: data.totalFuelConsumption,
    totalFuelConsumption,
    fuel,
    fuelUnit,
    convertedUnit: conversion?.to,
    fuelFactor
  });
  console.log("🅰️ Result A Total:", resultA);
  let totalGrossElectricityPurchased = Number(data.totalGrossElectricityPurchased) || 0;
  const grossUnit = data.unit || data.totalGrossElectricityPurchasedUnit || '';

  // If unit is MWh convert to kWh (1 MWh = 1000 kWh)
  if (grossUnit === 'MWh') {
    console.log('Converting totalGrossElectricityPurchased from MWh to kWh');
    totalGrossElectricityPurchased = totalGrossElectricityPurchased * 1000;
  }

  // ==================== RESULT B ====================
  console.group("🅱️ Result B – T&D + WTT");

  const b1 = totalGrossElectricityPurchased * TD_FACTOR;
  const b2 = totalGrossElectricityPurchased * WTT_FACTOR;
  const b3 = totalGrossElectricityPurchased * WTT_TD_FACTOR;

  console.log("B Inputs:", { totalGrossElectricityPurchased, grossUnit });
  console.log("B Components:", { b1, b2, b3 });

  resultB = b1 + b2 + b3;
  console.log("🅱️ Result B Total:", resultB);
  console.groupEnd();

  // ==================== RESULT C ====================
  console.group("Result C – Air Travel");

  const airPassengers = Number(data.airPassengers);
  const airDistanceKm = Number(data.airDistanceKm);
const airTravelClass = data.airTravelClass?.value ?? data.airTravelClass;
const airFlightType = data.airFlightType?.value ?? data.airFlightType;    // e.g., "Domestic"

  const airFactor = airTravelEmissionFactors?.[airFlightType]?.[airTravelClass] || 0;
  resultC = airPassengers * airDistanceKm * airFactor;

  console.log("C Inputs:", { airPassengers, airDistanceKm, airFlightType, airTravelClass, airFactor });
  console.log("Result C:", resultC);
  console.groupEnd();

  // ==================== RESULT D ====================
  console.group("Result D – Taxi");

  const taxiPassengers = Number(data.taxiPassengers);
  const taxiDistanceKm = Number(data.taxiDistanceKm);
  // const taxiType = data.taxiType?.value;
  const taxiType = data.taxiType?.value ?? data.taxiType;


  const taxiFactor = taxiEmissionFactors?.[taxiType] || 0;
  resultD = taxiPassengers * taxiDistanceKm * taxiFactor;

  console.log("D Inputs:", { taxiPassengers, taxiDistanceKm, taxiType, taxiFactor });
  console.log("Result D:", resultD);
  console.groupEnd();

  // ==================== RESULT E ====================
  console.group("Result E – Bus");

  const busPassengers = Number(data.busPassengers);
  const busDistanceKm = Number(data.busDistanceKm);
  // const busType = data.busType?.value;
  const busType = data.busType?.value ?? data.busType;


  const busFactor = busEmissionFactors?.[busType] || 0;
  resultE = busPassengers * busDistanceKm * busFactor;

  console.log("E Inputs:", { busPassengers, busDistanceKm, busType, busFactor });
  console.log("Result E:", resultE);
  console.groupEnd();

  // ==================== RESULT F ====================
  console.group(" Result F – Train");

  const trainPassengers = Number(data.trainPassengers);
  const trainDistanceKm = Number(data.trainDistanceKm);
  // const trainType = data.trainType?.value;
  const trainType = data.trainType?.value ?? data.trainType;


  const trainFactor = trainEmissionFactors?.[trainType] || 0;
  resultF = trainPassengers * trainDistanceKm * trainFactor;

  console.log("F Inputs:", { trainPassengers, trainDistanceKm, trainType, trainFactor });
  console.log("Result F:", resultF);
  console.groupEnd();

  // ==================== TOTAL ====================
  const totalKg = resultA + resultB + resultC + resultD + resultE + resultF;

  console.group("TOTAL EMISSIONS");
  console.log("Total KgCO2e:", totalKg);
  console.log("Total TCO2e:", totalKg / 1000);
  console.groupEnd();

  console.groupEnd();

  return {
    resultA_KgCo2e: resultA,
    resultA_TCo2e: resultA / 1000,
    resultB_KgCo2e: resultB,
    resultB_TCo2e: resultB / 1000,
    resultC_KgCo2e: resultC,
    resultC_TCo2e: resultC / 1000,
    resultD_KgCo2e: resultD,
    resultD_TCo2e: resultD / 1000,
    resultE_KgCo2e: resultE,
    resultE_TCo2e: resultE / 1000,
    resultF_KgCo2e: resultF,
    resultF_TCo2e: resultF / 1000,
    totalEmissions_KgCo2e: totalKg,
    totalEmissions_TCo2e: totalKg / 1000,
  };
};
