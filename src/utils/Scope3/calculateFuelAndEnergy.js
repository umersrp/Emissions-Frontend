// Emission Factors Constants

// Fuel consumption units emission factors
export const unitsEmissionFactors = {
  //GASEOUS FUELS
  "Butane": {
    "tonnes": 3033.38067,
    "litres": 1.74533,
    "kwh": 0.22241,
  },
  "CNG": {
    "tonnes": 2575.46441,
    "litres": 0.45070,
    "kwh": 0.18296,
  },
  "LNG": {
    "tonnes": 2603.30441,
    "litres": 1.17797,
    "kwh": 0.18494,
  },
  "LPG": {
    "tonnes": 2939.36095,
    "litres": 1.55713,
    "kwh": 0.21450,
  },
  "Natural gas": {
    "tonnes": 2575.46441,
    "m3": 2.06672,
    "kwh": 0.18296,
  },
};

// Fuel type emission factors for electricity
export const emissionFactors = {
  "Gaseous Fuel": {
    "Butane": 2.90,
    "CNG": 2.74,
    "LPG": 1.51,
    "Natural gas": 2.02,
    "Natural gas (100% mineral blend)": 2.02,
    "LNG": 2.75,
    "Other petroleum gas": 2.70,
    "Propane": 1.51
  },
  "Bio Gaseous Fuel": {
    "Biogas": 0,                // biogenic
    "Landfill gas": 0           // biogenic
  },
};

// Air travel emission factors (kgCO2e per passenger-km)
export const airTravelEmissionFactors = {
  "Domestic": {
    "Average passenger": 0.0335,
    "Economy class": 0.0335,
    "Business class": 0.0335,
    "Premium economy class": 0.0335,
    "First class": 0.0335,
  },
  "International": {
    "Average passenger": 0.02162,
    "Economy class": 0.02162,
    "Premium economy class": 0.01656,
    "Business class": 0.02649,
    "First class": 0.06623,
  },
};

// Taxi emission factors (kgCO2e per passenger-km)
export const taxiEmissionFactors = {
  "Regular taxi": 0.03697,
  "Business Class": 0.05090,
};

// Bus emission factors (kgCO2e per passenger-km)
export const busEmissionFactors = {
  "Local Bus": 0.03174,
  "Intercity Bus (Non A.C)": 0.01821,
  "Intercity Bus (A.C)": 0.02649,
  "Green Line": 0.00656,
};

// Train emission factors (kgCO2e per passenger-km)
export const trainEmissionFactors = {
  "National rail": 0.00897,
  "Green Line Train": 0.00117,
  "Metro": 0.00749,
  "Subway (underground)": 0.00728,
};

// T&D and WTT constants for electricity
const TD_FACTOR = 0.01853;
const WTT_FACTOR = 0.04590;
const WTT_TD_FACTOR = 0.00397;

// Helper to safely convert to number
const toNumber = (value) => {
  if (!value) return 0;
  return parseFloat(value) || 0;
};

/**
 * Main calculation function for Fuel & Energy emissions
 * @param {Object} data - Form data containing all input values
 * @returns {Object} - Calculated results A, B, C, D, E, F in KgCO2e and TCO2e
 */
export const calculateFuelAndEnergy = (data) => {
  if (!data) return null;

  // Initialize all results to 0
  let resultA = 0;
  let resultB = 0;
  let resultC = 0;
  let resultD = 0;
  let resultE = 0;
  let resultF = 0;

  // ==================== RESULT A ====================
  // A = A1 + A2
  
  // A1 = totalFuelConsumption * Emission Factor (based on fuelConsumptionUnit)
  const totalFuelConsumption = toNumber(data.totalFuelConsumption);
  const fuelConsumptionUnit = data.fuelConsumptionUnit?.toLowerCase(); // normalize to lowercase
  const fuel = data.fuel;
  
  // Get emission factor based on fuel type and unit
  const fuelEmissionFactor = unitsEmissionFactors?.[fuel]?.[fuelConsumptionUnit] || 0;
  const A1 = totalFuelConsumption * fuelEmissionFactor;

  // A2 = totalGrossElectricityPurchased * Emission Factor (based on fuel type)
  const totalGrossElectricityPurchased = toNumber(data.totalGrossElectricityPurchased);
  const fuelType = data.fuelType; // e.g., "Gaseous Fuel" or "Bio Gaseous Fuel"
  
  // Get emission factor based on fuel type for electricity
  const electricityEmissionFactor = emissionFactors?.[fuelType]?.[fuel] || 0;
  const A2 = totalGrossElectricityPurchased * electricityEmissionFactor;

  resultA = A1 + A2;

  // ==================== RESULT B ====================
  // B = b1 + b2 + b3
  
  const b1 = totalGrossElectricityPurchased * TD_FACTOR;
  const b2 = totalGrossElectricityPurchased * WTT_FACTOR;
  const b3 = totalGrossElectricityPurchased * WTT_TD_FACTOR;

  resultB = b1 + b2 + b3;

  // ==================== RESULT C ====================
  // C = airPassengers * airDistanceKm * Emission Factor (based on airTravelClass & airFlightType)
  
  const airPassengers = toNumber(data.airPassengers);
  const airDistanceKm = toNumber(data.airDistanceKm);
  const airTravelClass = data.airTravelClass; // e.g., "Economy class"
  const airFlightType = data.airFlightType; // e.g., "Domestic" or "International"

  // Get emission factor based on flight type and travel class
  const airEmissionFactor = airTravelEmissionFactors?.[airFlightType]?.[airTravelClass] || 0;
  resultC = airPassengers * airDistanceKm * airEmissionFactor;

  // ==================== RESULT D ====================
  // D = taxiPassengers * taxiDistanceKm * Emission Factor (based on taxiType)
  
  const taxiPassengers = toNumber(data.taxiPassengers);
  const taxiDistanceKm = toNumber(data.taxiDistanceKm);
  const taxiType = data.taxiType; // e.g., "Regular taxi" or "Business Class"

  // Get emission factor based on taxi type
  const taxiEmissionFactor = taxiEmissionFactors?.[taxiType] || 0;
  resultD = taxiPassengers * taxiDistanceKm * taxiEmissionFactor;

  // ==================== RESULT E ====================
  // E = busPassengers * busDistanceKm * Emission Factor (based on busType)
  
  const busPassengers = toNumber(data.busPassengers);
  const busDistanceKm = toNumber(data.busDistanceKm);
  const busType = data.busType; // e.g., "Local Bus", "Green Line"

  // Get emission factor based on bus type
  const busEmissionFactor = busEmissionFactors?.[busType] || 0;
  resultE = busPassengers * busDistanceKm * busEmissionFactor;

  // ==================== RESULT F ====================
  // F = trainPassengers * trainDistanceKm * Emission Factor (based on trainType)
  
  const trainPassengers = toNumber(data.trainPassengers);
  const trainDistanceKm = toNumber(data.trainDistanceKm);
  const trainType = data.trainType; // e.g., "Metro", "National rail"

  // Get emission factor based on train type
  const trainEmissionFactor = trainEmissionFactors?.[trainType] || 0;
  resultF = trainPassengers * trainDistanceKm * trainEmissionFactor;

  // ==================== RETURN ALL RESULTS ====================
  return {
    // Result A - Fuel consumption emissions
    resultA_KgCo2e: resultA,
    resultA_TCo2e: resultA / 1000,

    // Result B - Electricity T&D and WTT emissions
    resultB_KgCo2e: resultB,
    resultB_TCo2e: resultB / 1000,

    // Result C - Air travel emissions
    resultC_KgCo2e: resultC,
    resultC_TCo2e: resultC / 1000,

    // Result D - Taxi emissions
    resultD_KgCo2e: resultD,
    resultD_TCo2e: resultD / 1000,

    // Result E - Bus emissions
    resultE_KgCo2e: resultE,
    resultE_TCo2e: resultE / 1000,

    // Result F - Train emissions
    resultF_KgCo2e: resultF,
    resultF_TCo2e: resultF / 1000,

    // Total emissions (sum of all)
    totalEmissions_KgCo2e: resultA + resultB + resultC + resultD + resultE + resultF,
    totalEmissions_TCo2e: (resultA + resultB + resultC + resultD + resultE + resultF) / 1000,

    // Breakdown for debugging
    breakdown: {
      A: { 
        A1, 
        A2, 
        total: resultA,
        fuelEmissionFactor,
        electricityEmissionFactor 
      },
      B: { b1, b2, b3, total: resultB },
      C: { airEmissionFactor, total: resultC },
      D: { taxiEmissionFactor, total: resultD },
      E: { busEmissionFactor, total: resultE },
      F: { trainEmissionFactor, total: resultF },
    }
  };
};

// Example usage:
/*
const formData = {
  totalFuelConsumption: 1000,
  fuelConsumptionUnit: "Tonnes",
  fuel: "Butane",
  fuelType: "Gaseous Fuel",
  totalGrossElectricityPurchased: 1000,
  unit: "kWh",
  airPassengers: 5,
  airDistanceKm: 100,
  airTravelClass: "Economy class",
  airFlightType: "Domestic",
  taxiPassengers: 5,
  taxiDistanceKm: 100,
  taxiType: "Regular taxi",
  busPassengers: 5,
  busDistanceKm: 100,
  busType: "Local Bus",
  trainPassengers: 3,
  trainDistanceKm: 100,
  trainType: "Metro",
};

const results = calculateFuelAndEnergy(formData);
console.log(results);

// Expected output for the example:
// resultA_KgCo2e: 3036280.67 (A1: 3033380.67 + A2: 2900)
// resultB_KgCo2e: 66.4 (b1: 18.53 + b2: 45.90 + b3: 3.97)
// resultC_KgCo2e: 16.75 (5 * 100 * 0.0335)
// resultD_KgCo2e: 18.485 (5 * 100 * 0.03697)
// resultE_KgCo2e: 15.87 (5 * 100 * 0.03174)
// resultF_KgCo2e: 2.247 (3 * 100 * 0.00749)
// totalEmissions_KgCo2e: 3036399.772*/