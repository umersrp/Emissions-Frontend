// --- Energy Conversion Factors ---
// Converts various energy units to kwh
// export const conversionTokwh = {
//   Joules: 0.000000278,
//   Mj: 0.2778,
//   Gj: 277.78,
//   Tj: 277777.78,
//   MWh: 1000,
//   GWh: 1000000,
//   Btu: 0.00029307,
//   MMBtu: 293.07,
// };
export const unitConversion = {
  // Mass conversions → Tonnes
  "Tonnes": { factor: 1, to: "Tonnes" },
  "kg": { factor: 0.001, to: "Tonnes" },
  "lb": { factor: 0.000446429, to: "Tonnes" },
  "lb (pounds)": { factor: 0.000446429, to: "Tonnes" },
  

  // Energy conversions → kwh
  "kwh": { factor: 1, to: "kwh" },
  "Joules": { factor: 0.000000278, to: "kwh" },
  "Mj": { factor: 0.2778, to: "kwh" },
  "Gj": { factor: 277.78, to: "kwh" },
  "Tj": { factor: 277777.78, to: "kwh" },
  "MWh": { factor: 1000, to: "kwh" },
  "GWh": { factor: 1000000, to: "kwh" },
  "Btu": { factor: 0.00029307, to: "kwh" },
  "MMBtu": { factor: 293.07, to: "kwh" },

  // Volume conversions
  "Litres": { factor: 1, to: "Litres" },
  "Gallons": { factor: 4.54609, to: "Litres" },
  "ft3": { factor: 0.0283168, to: "m3" },
  "SCF": { factor: 0.0283168, to: "m3" },
  "in3": { factor: 1.63871e-5, to: "m3" },
};

export const emissionFactors = {
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
  "Natural gas (100% mineral blend)": {
    "tonnes": 2603.30441,
    "m3": 2.08906,
    "kwh": 0.18494,
  },
  "Other petroleum gas": {
    "tonnes": 2578.24647,
    "litres": 0.94442,
    "kwh": 0.18323,
  },
  "Propane": {
    "tonnes": 2997.63233,
    "litres": 1.54358,
    "kwh": 0.21410,
  },

  //LIQUID FUELS
  "Aviation spirit": {
    "tonnes": 3193.69480,
    "litres": 2.33116,
    "kwh": 0.24382,
  },
  "Aviation turbine fuel": {
    "tonnes": 3178.36520,
    "litres": 2.54269,
    "kwh": 0.24758,
  },
  "Burning oil": {
    "tonnes": 3165.04181,
    "litres": 2.54016,
    "kwh": 0.24677,
  },
  "Diesel (average biofuel blend)": {
    "tonnes": 3087.94462,
    "litres": 2.57082,
    "kwh": 0.24411,
  },
  "Diesel (100% mineral diesel)": {
    "tonnes": 3203.91143,
    "litres": 2.66155,
    "kwh": 0.25199,
  },
  "Fuel oil": {
    "tonnes": 3228.89019,
    "litres": 3.17492,
    "kwh": 0.26813,
  },
  "Gas oil": {
    "tonnes": 3226.57859,
    "litres": 2.75541,
    "kwh": 0.25650,
  },
  "Lubricants": {
    "tonnes": 3180.99992,
    "litres": 2.74934,
    "kwh": 0.26414,
  },
  "Naphtha": {
    "tonnes": 3142.37890,
    "litres": 2.11894,
    "kwh": 0.23647,
  },
  "Petrol (average biofuel blend)": {
    "tonnes": 2772.97935,
    "litres": 2.06916,
    "kwh": 0.21956,
  },
  "Petrol (100% mineral petrol)": {
    "tonnes": 3154.08213,
    "litres": 2.33984,
    "kwh": 0.24159,
  },
  "Processed fuel oils - residual oil": {
    "tonnes": 3228.89019,
    "litres": 3.17492,
    "kwh": 0.26813,
  },
  "Processed fuel oils - distillate oil": {
    "tonnes": 3226.57859,
    "litres": 2.75541,
    "kwh": 0.25650,
  },
  "Refinery miscellaneous": {
    "tonnes": 2944.32093,
    "kwh": 0.24663,
  },
  "Waste oils": {
    "tonnes": 3219.37916,
    "litres": 2.74924,
    "kwh": 0.25641,
  },
  "Marine gas oil": {
    "tonnes": 3245.30441,
    "litres": 2.77139,
    "kwh": 0.25798,
  },
  "Marine fuel oil": {
    "tonnes": 3154.75334,
    "litres": 3.10202,
    "kwh": 0.26197,
  },

  //SOLID FUELS
  "Coal (industrial)": {
    "tonnes": 2395.28994,
    "kwh": 0.32246,
  },
  "Coal (electricity generation)": {
    "tonnes": 2225.22448,
    "kwh": 0.31939,
  },
  "Coal (domestic)": {
    "tonnes": 2904.95234,
    "kwh": 0.34721,
  },
  "Coking coal": {
    "tonnes": 3164.65002,
    "kwh": 0.35790,
  },
  "Petroleum coke": {
    "tonnes": 3386.57168,
    "kwh": 0.34092,
  },
  "Coal (electricity generation - home produced coal only)": {
    "tonnes": 2221.74670,
    "kwh": 0.31939,
  },

  ///bio
   //BIOFUELS
  "Bioethanol": {
    "litres": 0.00901,
    "kwh": 0.00152,
    "tonnes": 11.35,
  },
  "Biodiesel ME": {
    "litres": 0.16751,
    "kwh": 0.01821,
    "tonnes": 188.22,
  },
  "Biomethane (compressed)": {
    "kwh": 0.00038,
    "tonnes": 5.21,
  },
  "Biodiesel ME (from used cooking oil)": {
    "litres": 0.16751,
    "kwh": 0.01821,
    "tonnes": 188.22,
  },
  "Biodiesel ME (from tallow)": {
    "litres": 0.16751,
    "kwh": 0.01821,
    "tonnes": 188.22,
  },
  "Biodiesel HVO": {
    "litres": 0.03558,
    "kwh": 0.00373,
    "tonnes": 45.62,
  },
  "Biopropane": {
    "litres": 0.00213,
    "kwh": 0.00032,
    "tonnes": 4.15,
  },
  "Development diesel": {
    "litres": 0.03705,
    "kwh": 0.00373,
    "tonnes": 44.61,
  },
  "Development petrol": {
    "litres": 0.01402,
    "kwh": 0.00152,
    "tonnes": 18.9,
  },
  "Off road biodiesel": {
    "litres": 0.16751,
    "kwh": 0.01821,
    "tonnes": 188.22,
  },
  "Biomethane (liquified)": {
    "kwh": 0.00038,
    "tonnes": 5.21,
  },
  "Methanol (bio)": {
    "litres": 0.00669,
    "kwh": 0.00152,
    "tonnes": 8.44,
  },
  "Avtur (renewable)": {
    "litres": 0.02531,
    "kwh": 0.00260,
    "tonnes": 31.79,
  },

  //BIOMASS
  "Wood logs": {
    "tonnes": 46.98508,
    "kwh": 0.01150,
  },
  "Wood chips": {
    "tonnes": 43.43964,
    "kwh": 0.01150,
  },
  "Wood pellets": {
    "tonnes": 55.19389,
    "kwh": 0.01150,
  },
  "Grass / straw": {
    "tonnes": 47.35709,
    "kwh": 0.01273,
  },

  //BIOGAS
  "Biogas": {
    "tonnes": 1.24314,
    "kwh": 0.00022,
  },
  "Landfill gas": {
    "tonnes": 0.69696,
    "kwh": 0.00020,
  },
};

export const outOfScopeEmissionFactors = {
  // LIQUID FUELS
  "Diesel (average biofuel blend)": {
    "tonnes": 163.17,
    "litres": 0.14,
    "kwh": 0.01,
  },
  "Petrol (average biofuel blend)": {
    "tonnes": 177.88,
    "litres": 0.13,
    "kwh": 0.01,
  },

  // BIOFUELS
  "Bioethanol": {
    "tonnes": 1.52,
    "litres": 0.25693,
    "kwh": 1910.0,
  },
  "Biodiesel ME": {
    "tonnes": 2.39,
    "litres": 0.25977,
    "kwh": 2680.0,
  },
  "Biomethane (compressed)": {
    "litres": 0.19901,
    "kwh": 2710.0,
  },
  "Biodiesel ME (from used cooking oil)": {
    "tonnes": 2.39,
    "litres": 0.25977,
    "kwh": 2680.0,
  },
  "Biodiesel ME (from tallow)": {
    "tonnes": 2.39,
    "litres": 0.25977,
    "kwh": 2680.0,
  },
  "Biodiesel HVO": {
    "tonnes": 2.43,
    "litres": 0.25499,
    "kwh": 3120.0,
  },
  "Biopropane": {
    "tonnes": 1.54,
    "litres": 0.23223,
    "kwh": 2990.0,
  },
  "Development diesel": {
    "tonnes": 2.33,
    "litres": 0.25275,
    "kwh": 3130.0,
  },
  "Off road biodiesel": {
    "tonnes": 2.39,
    "litres": 0.25977,
    "kwh": 2680.0,
  },
  "Biomethane (liquified)": {
    "litres": 0.20448,
    "kwh": 2780.0,
  },
  "Methanol (bio)": {
    "tonnes": 1.09,
    "litres": 0.24811,
    "kwh": 1370.0,
  },
  "Avtur (renewable)": {
    "tonnes": 2.51,
    "litres": 0.25826,
    "kwh": 3150.0,
  },

  // BIOMASS
  "Wood logs": {
    "tonnes": 1436.23,
    "kwh": 0.35,
  },
  "Wood chips": {
    "tonnes": 1335.71,
    "kwh": 0.35,
  },
  "Wood pellets": {
    "tonnes": 1677.18,
    "kwh": 0.35,
  },
  "Grass / straw": {
    "tonnes": 1287.25,
    "kwh": 0.35,
  },

  // BIOGAS
  "Biogas": {
    "tonnes": 1105.6695,
    "kwh": 0.19902,
  },
  "Landfill gas": {
    "tonnes": 679.98674,
    "kwh": 0.19902,
  },
};
