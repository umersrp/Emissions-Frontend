
// export const travelFields = {
//         didTravelByAir: [
//             "airPassengers",
//             "airDistanceKm",
//             "airTravelClass",
//             "airFlightType",
//         ],
//         didTravelByTaxi: [
//             "taxiPassengers",
//             "taxiDistanceKm",
//             "taxiType",
//         ],
//         didTravelByTrain: [
//             "trainPassengers",
//             "trainDistanceKm",
//             "trainType",
//         ],
//         didTravelByBus: [
//             "busPassengers",
//             "busDistanceKm",
//             "busType",
//         ],
//     };

// Air travel options (dependent)
export const AIR_TRAVEL_OPTIONS = {
    Domestic: [
        { value: "Average passenger", label: "Average passenger" },
        { value: "Economy class", label: "Economy class" },
        { value: "Premium economy class", label: "Premium economy class" },
        { value: "Business class", label: "Business class" },
        { value: "First class", label: "First class" },
    ],
    International: [
        { value: "Average passenger", label: "Average passenger" },
        { value: "Economy class", label: "Economy class" },
        { value: "Premium economy class", label: "Premium economy class" },
        { value: "Business class", label: "Business class" },
        { value: "First class", label: "First class" },
    ],
};

// Taxi
export const TAXI_TYPES = [
    { value: "Regular taxi", label: "Regular taxi" },
    { value: "Business Class", label: "Business Class" },
];

// Bus
export const BUS_TYPES = [
    { value: "Local Bus", label: "Local Bus" },
    { value: "Intercity Bus (Non A.C)", label: "Intercity Bus (Non A.C)" },
    { value: "Intercity Bus (A.C)", label: "Intercity Bus (A.C)" },
    { value: "Green Line", label: "Green Line" },
];

// Train
export const TRAIN_TYPES = [
    { value: "National rail", label: "National rail" },
    { value: "Green Line Train", label: "Green Line Train" },
    { value: "Metro", label: "Metro" },
    { value: "Subway (underground)", label: "Subway (underground)" },
];


// Air flight type (simple list)
export const AIR_FLIGHT_TYPES = [
    { value: "Domestic", label: "Domestic" },
    { value: "International", label: "International" },
];



export const fuelEnergyTypes = [
    { value: "Gaseous Fuel", label: "Gaseous Fuel" },
    { value: "Bio Gaseous Fuel", label: "Bio Gaseous Fuel" },
    { value: "Liquid Fuel", label: "Liquid Fuel" },
    { value: "Bio Liquid Fuel", label: "Bio Liquid Fuel" },
    { value: "Solid Fuel", label: "Solid Fuel" },
    { value: "Biomass Fuel", label: "Biomass Fuel" }
];

export const fuelEnergyTypesChildTypes = {
    "Gaseous Fuel": [
        { value: "Butane", label: "Butane" },
        { value: "CNG", label: "CNG" },
        { value: "LPG", label: "LPG" },
        { value: "Natural gas", label: "Natural gas" },
        { value: "Natural gas (100% mineral blend)", label: "Natural gas (100% mineral blend)" },
        { value: "LNG", label: "LNG" },
        { value: "Other petroleum gas", label: "Other petroleum gas" },
        { value: "Propane", label: "Propane" }
    ],
    "Bio Gaseous Fuel": [
        { value: "Biogas", label: "Biogas" },
        { value: "Landfill gas", label: "Landfill gas" }
    ],
    "Liquid Fuel": [
        { value: "Aviation spirit", label: "Aviation spirit" },
        { value: "Aviation turbine fuel", label: "Aviation turbine fuel" },
        { value: "Burning oil", label: "Burning oil" },
        { value: "Diesel (average biofuel blend)", label: "Diesel (average biofuel blend)" },
        { value: "Diesel (100% mineral diesel)", label: "Diesel (100% mineral diesel)" },
        { value: "Fuel oil", label: "Fuel oil" },
        { value: "Gas oil", label: "Gas oil" },
        { value: "Lubricants", label: "Lubricants" },
        { value: "Naphtha", label: "Naphtha" },
        { value: "Petrol (average biofuel blend)", label: "Petrol (average biofuel blend)" },
        { value: "Petrol (100% mineral petrol)", label: "Petrol (100% mineral petrol)" },
        { value: "Processed fuel oils - residual oil", label: "Processed fuel oils - residual oil" },
        { value: "Processed fuel oils - distillate oil", label: "Processed fuel oils - distillate oil" },
        { value: "Refinery miscellaneous", label: "Refinery miscellaneous" },
        { value: "Waste oils", label: "Waste oils" },
        { value: "Marine gas oil", label: "Marine gas oil" },
        { value: "Marine fuel oil", label: "Marine fuel oil" }
    ],
    "Bio Liquid Fuel": [
        { value: "Bioethanol", label: "Bioethanol" },
        { value: "Biodiesel ME", label: "Biodiesel ME" },
        { value: "Biomethane (compressed)", label: "Biomethane (compressed)" },
        { value: "Biodiesel ME (from used cooking oil)", label: "Biodiesel ME (from used cooking oil)" },
        { value: "Biodiesel ME (from tallow)", label: "Biodiesel ME (from tallow)" },
        { value: "Biodiesel HVO", label: "Biodiesel HVO" },
        { value: "Biopropane", label: "Biopropane" },
        { value: "Development diesel", label: "Development diesel" },
        { value: "Development petrol", label: "Development petrol" },
        { value: "Off road biodiesel", label: "Off road biodiesel" },
        { value: "Biomethane (liquified)", label: "Biomethane (liquified)" },
        { value: "Methanol (bio)", label: "Methanol (bio)" },
        { value: "Avtur (renewable)", label: "Avtur (renewable)" }
    ],
    "Solid Fuel": [
        { value: "Coal (industrial)", label: "Coal (industrial)" },
        { value: "Coal (electricity generation)", label: "Coal (electricity generation)" },
        { value: "Coal (domestic)", label: "Coal (domestic)" },
        { value: "Coking coal", label: "Coking coal" },
        { value: "Petroleum coke", label: "Petroleum coke" },
        { value: "Coal (electricity generation - home produced coal only)", label: "Coal (electricity generation - home produced coal only)" }
    ],
    "Biomass Fuel": [
        { value: "Wood logs", label: "Wood logs" },
        { value: "Wood chips", label: "Wood chips" },
        { value: "Wood pellets", label: "Wood pellets" },
        { value: "Grass/straw", label: "Grass/straw" }
    ]
};

// export const fuelConsumptionUnits = [
//     { value: "Tonnes", label: "Tonnes" },
//     { value: "kg", label: "kg" },
//     { value: "lb", label: "lb" },
//     { value: "kWh", label: "kWh" },
//     { value: "MWh", label: "MWh" },
//     { value: "GWh", label: "GWh" },
//     { value: "Joules", label: "Joules" },
//     { value: "Gj", label: "Gj" },
//     { value: "Mj", label: "Mj" },
//     { value: "Tj", label: "Tj" },
//     { value: "Btu", label: "Btu" },
//     { value: "MMBtu", label: "MMBtu" },
//     { value: "Litres", label: "Litres" },
//     { value: "Gallons", label: "Gallons" },
//     { value: "m3", label: "m3" },
//     { value: "ft3", label: "ft3" },
//     { value: "in3", label: "in3" },
//     { value: "SCF", label: "SCF" }
// ];

export const travelFields = {
    didTravelByAir: [
        "airPassengers",
        "airDistanceKm",
        "airTravelClass",
        "airFlightType",
    ],
    didTravelByTaxi: [
        "taxiPassengers",
        "taxiDistanceKm",
        "taxiType",
    ],
    didTravelByTrain: [
        "trainPassengers",
        "trainDistanceKm",
        "trainType",
    ],
    didTravelByBus: [
        "busPassengers",
        "busDistanceKm",
        "busType",
    ],
};

export const unitConversion = {
    "Tonnes": { factor: 1, to: "Tonnes" },
    "kg": { factor: 0.001, to: "Tonnes" },
    "lb": { factor: 0.000446429, to: "Tonnes" },
    "lb (pounds)": { factor: 0.000446429, to: "Tonnes" },

    "kwh": { factor: 1, to: "kwh" },
    "Joules": { factor: 0.000000278, to: "kwh" },
    "Mj": { factor: 0.2778, to: "kwh" },
    "Gj": { factor: 277.78, to: "kwh" },
    "Tj": { factor: 277777.78, to: "kwh" },
    "MWh": { factor: 1000, to: "kwh" },
    "GWh": { factor: 1000000, to: "kwh" },
    "Btu": { factor: 0.00029307, to: "kwh" },
    "MMBtu": { factor: 293.07, to: "kwh" },

    "Litres": { factor: 1, to: "Litres" },
    "Gallons": { factor: 4.54609, to: "Litres" },
    "ft3": { factor: 0.0283168, to: "m3" },
    "SCF": { factor: 0.0283168, to: "m3" },
    "in3": { factor: 1.63871e-5, to: "m3" },
};

// export const unitsEmissionFactors = {
//     "Butane": { "tonnes": 3033.38067, "litres": 1.74533, "kwh": 0.22241 },
//     "CNG": { "tonnes": 2575.46441, "litres": 0.45070, "kwh": 0.18296 },
//     "LNG": { "tonnes": 2603.30441, "litres": 1.17797, "kwh": 0.18494 },
//     "LPG": { "tonnes": 2939.36095, "litres": 1.55713, "kwh": 0.21450 },
//     "Natural gas": { "tonnes": 2575.46441, "m3": 2.06672, "kwh": 0.18296 },
//     "Natural gas (100% mineral blend)": { "tonnes": 2603.30441, "m3": 2.08906, "kwh": 0.18494 },
//     "Other petroleum gas": { "tonnes": 2578.24647, "litres": 0.94442, "kwh": 0.18323 },
//     "Propane": { "tonnes": 2997.63233, "litres": 1.54358, "kwh": 0.21410 },
//     // ... keep the rest as you already have
// };
// export const unitsEmissionFactors = {
//   //GASEOUS FUELS
//   "Butane": {
//     "tonnes": 344.30947,
//     "litres": 0.19765,
//     "kwh": 0.02524,
//   },
//   "CNG": {
//     "tonnes": 530.77887,
//     "litres": 0.09289,
//     "kwh": 0.03789,
//   },
//   "LNG": {
//     "tonnes": 912.22817,
//     "litres": 0.41277,
//     "kwh": 0.06512,
//   },
//   "LPG": {
//     "tonnes": 2939.36095,
//     "litres": 1.55713,
//     "kwh": 0.21450,
//   },
//   "Natural gas": {
//     "tonnes": 2575.46441,
//     "m3": 2.06672,
//     "kwh": 0.18296,
//   },
//   "Natural gas (100% mineral blend)": {
//     "tonnes": 2603.30441,
//     "m3": 2.08906,
//     "kwh": 0.18494,
//   },
//   "Other petroleum gas": {
//     "tonnes": 2578.24647,
//     "litres": 0.94442,
//     "kwh": 0.18323,
//   },
//   "Propane": {
//     "tonnes": 2997.63233,
//     "litres": 1.54358,
//     "kwh": 0.21410,
//   },

//   //LIQUID FUELS
//   "Aviation spirit": {
//     "tonnes": 3193.69480,
//     "litres": 2.33116,
//     "kwh": 0.24382,
//   },
//   "Aviation turbine fuel": {
//     "tonnes": 3178.36520,
//     "litres": 2.54269,
//     "kwh": 0.24758,
//   },
//   "Burning oil": {
//     "tonnes": 3165.04181,
//     "litres": 2.54016,
//     "kwh": 0.24677,
//   },
//   "Diesel (average biofuel blend)": {
//     "tonnes": 3087.94462,
//     "litres": 2.57082,
//     "kwh": 0.24411,
//   },
//   "Diesel (100% mineral diesel)": {
//     "tonnes": 3203.91143,
//     "litres": 2.66155,
//     "kwh": 0.25199,
//   },
//   "Fuel oil": {
//     "tonnes": 3228.89019,
//     "litres": 3.17492,
//     "kwh": 0.26813,
//   },
//   "Gas oil": {
//     "tonnes": 3226.57859,
//     "litres": 2.75541,
//     "kwh": 0.25650,
//   },
//   "Lubricants": {
//     "tonnes": 3180.99992,
//     "litres": 2.74934,
//     "kwh": 0.26414,
//   },
//   "Naphtha": {
//     "tonnes": 3142.37890,
//     "litres": 2.11894,
//     "kwh": 0.23647,
//   },
//   "Petrol (average biofuel blend)": {
//     "tonnes": 2772.97935,
//     "litres": 2.06916,
//     "kwh": 0.21956,
//   },
//   "Petrol (100% mineral petrol)": {
//     "tonnes": 3154.08213,
//     "litres": 2.33984,
//     "kwh": 0.24159,
//   },
//   "Processed fuel oils - residual oil": {
//     "tonnes": 3228.89019,
//     "litres": 3.17492,
//     "kwh": 0.26813,
//   },
//   "Processed fuel oils - distillate oil": {
//     "tonnes": 3226.57859,
//     "litres": 2.75541,
//     "kwh": 0.25650,
//   },
//   "Refinery miscellaneous": {
//     "tonnes": 2944.32093,
//     "kwh": 0.24663,
//   },
//   "Waste oils": {
//     "tonnes": 3219.37916,
//     "litres": 2.74924,
//     "kwh": 0.25641,
//   },
//   "Marine gas oil": {
//     "tonnes": 3245.30441,
//     "litres": 2.77139,
//     "kwh": 0.25798,
//   },
//   "Marine fuel oil": {
//     "tonnes": 3154.75334,
//     "litres": 3.10202,
//     "kwh": 0.26197,
//   },

//   //SOLID FUELS
//   "Coal (industrial)": {
//     "tonnes": 2395.28994,
//     "kwh": 0.32246,
//   },
//   "Coal (electricity generation)": {
//     "tonnes": 2225.22448,
//     "kwh": 0.31939,
//   },
//   "Coal (domestic)": {
//     "tonnes": 2904.95234,
//     "kwh": 0.34721,
//   },
//   "Coking coal": {
//     "tonnes": 3164.65002,
//     "kwh": 0.35790,
//   },
//   "Petroleum coke": {
//     "tonnes": 3386.57168,
//     "kwh": 0.34092,
//   },
//   "Coal (electricity generation - home produced coal only)": {
//     "tonnes": 2221.74670,
//     "kwh": 0.31939,
//   },

//   ///bio
//    //BIOFUELS
//   "Bioethanol": {
//     "litres": 0.00901,
//     "kwh": 0.00152,
//     "tonnes": 11.35,
//   },
//   "Biodiesel ME": {
//     "litres": 0.16751,
//     "kwh": 0.01821,
//     "tonnes": 188.22,
//   },
//   "Biomethane (compressed)": {
//     "kwh": 0.00038,
//     "tonnes": 5.21,
//   },
//   "Biodiesel ME (from used cooking oil)": {
//     "litres": 0.16751,
//     "kwh": 0.01821,
//     "tonnes": 188.22,
//   },
//   "Biodiesel ME (from tallow)": {
//     "litres": 0.16751,
//     "kwh": 0.01821,
//     "tonnes": 188.22,
//   },
//   "Biodiesel HVO": {
//     "litres": 0.03558,
//     "kwh": 0.00373,
//     "tonnes": 45.62,
//   },
//   "Biopropane": {
//     "litres": 0.00213,
//     "kwh": 0.00032,
//     "tonnes": 4.15,
//   },
//   "Development diesel": {
//     "litres": 0.03705,
//     "kwh": 0.00373,
//     "tonnes": 44.61,
//   },
//   "Development petrol": {
//     "litres": 0.01402,
//     "kwh": 0.00152,
//     "tonnes": 18.9,
//   },
//   "Off road biodiesel": {
//     "litres": 0.16751,
//     "kwh": 0.01821,
//     "tonnes": 188.22,
//   },
//   "Biomethane (liquified)": {
//     "kwh": 0.00038,
//     "tonnes": 5.21,
//   },
//   "Methanol (bio)": {
//     "litres": 0.00669,
//     "kwh": 0.00152,
//     "tonnes": 8.44,
//   },
//   "Avtur (renewable)": {
//     "litres": 0.02531,
//     "kwh": 0.00260,
//     "tonnes": 31.79,
//   },

//   //BIOMASS
//   "Wood logs": {
//     "tonnes": 46.98508,
//     "kwh": 0.01150,
//   },
//   "Wood chips": {
//     "tonnes": 43.43964,
//     "kwh": 0.01150,
//   },
//   "Wood pellets": {
//     "tonnes": 55.19389,
//     "kwh": 0.01150,
//   },
//   "Grass/straw": {
//     "tonnes": 47.35709,
//     "kwh": 0.01273,
//   },

//   //BIOGAS
//   "Biogas": {
//     "tonnes": 1.24314,
//     "kwh": 0.00022,
//   },
//   "Landfill gas": {
//     "tonnes": 0.69696,
//     "kwh": 0.00020,
//   },
// };

export const unitsEmissionFactors = {
    //GASEOUS FUELS
    "Butane": { tonnes: 344.30947, litres: 0.19765, kwh: 0.02524 },
    "CNG": { tonnes: 530.77887, litres: 0.09289, kwh: 0.03789 },
    "LNG": { tonnes: 912.22817, litres: 0.41277, kwh: 0.06512 },
    "LPG": { tonnes: 349.29282, litres: 0.18551, kwh: 0.02548 },

    "Natural gas": { tonnes: 423.16368, m3: 0.33660, kwh: 0.03021 },
    "Natural gas (100% mineral blend)": { tonnes: 423.16368, m3: 0.33660, kwh: 0.03021 },

    "Other petroleum gas": { tonnes: 302.95197, litres: 0.11097, kwh: 0.02153 },
    "Propane": { tonnes: 352.67018, litres: 0.18170, kwh: 0.02519 },

    //  LIQUID FUELS 
    "Aviation spirit": { tonnes: 813.26357, litres: 0.61425, kwh: 0.06253 },
    "Aviation turbine fuel": { tonnes: 661.79468, litres: 0.52817, kwh: 0.05153 },
    "Burning oil": { tonnes: 660.82605, litres: 0.53078, kwh: 0.05153 },
    "Diesel (average biofuel blend)": { tonnes: 733.64436, litres: 0.61101, kwh: 0.05816 },
    "Diesel (100% mineral diesel)": { tonnes: 752.02760, litres: 0.62409, kwh: 0.05913 },
    "Fuel oil": { tonnes: 714.86545, litres: 0.69539, kwh: 0.05913 },
    "Gas oil": { tonnes: 743.83524, litres: 0.62665, kwh: 0.05913 },

    "Lubricants": { tonnes: 1116.83712, kwh: 0.09238 },
    "Naphtha": { tonnes: 640.41464, kwh: 0.04822 },
    "Petrol (average biofuel blend)": { tonnes: 777.33392, litres: 0.58094, kwh: 0.06140 },
    "Petrol (100% mineral petrol)": { tonnes: 815.93523, litres: 0.60664, kwh: 0.06253 },

    "Processed fuel oils - residual oil": { tonnes: 1132.08149, litres: 1.10125, kwh: 0.09364 },
    "Processed fuel oils - distillate oil": { tonnes: 1123.49881, litres: 0.94650, kwh: 0.08931 },
    "Refinery miscellaneous": { tonnes: 348.98258, kwh: 0.02923 },
    "Waste oils": { tonnes: 1116.83712, kwh: 0.08895 },
    "Marine gas oil": { tonnes: 743.83524, litres: 0.62665, kwh: 0.05913 },
    "Marine fuel oil": { tonnes: 714.86545, litres: 0.69539, kwh: 0.05913 },

    //  SOLID FUELS 
    "Coal (industrial)": { tonnes: 418.14964, kwh: 0.05629 },
    "Coal (electricity generation)": { tonnes: 390.06647, kwh: 0.05629 },
    "Coal (domestic)": { tonnes: 470.95724, kwh: 0.05629 },
    "Coking coal": { tonnes: 497.73658, kwh: 0.05629 },
    "Petroleum coke": { tonnes: 402.62468, kwh: 0.04053 },
    "Coal (electricity generation - home produced coal only)": {
        tonnes: 389.45704,
        kwh: 0.05629,
    },
    //BIOFUELS
    "Bioethanol": {
        litres: 0.61516,
        kwh: 0.10407,
        tonnes: 774.76000,
    },
    "Biodiesel ME": {
        litres: 0.39508,
        kwh: 0.04296,
        tonnes: 443.91000,
    },
    "Biomethane (compressed)": {
        kwh: 0.05687,
        tonnes: 774.05000,
    },
    "Biodiesel ME (from used cooking oil)": {
        litres: 0.35340,
        kwh: 0.03843,
        tonnes: 397.08,
    },
    "Biodiesel ME (from tallow)": {
        litres: 0.53232,
        kwh: 0.05788,
        tonnes: 598.12,
    },
    "Biodiesel HVO": {
        litres: 0.56439,
        kwh: 0.05920,
        tonnes: 723.58,
    },
    "Biopropane": {
        litres: 0.15752,
        kwh: 0.02381,
        tonnes: 306.84,
    },
    "Development diesel": {
        litres: 0.83338,
        kwh: 0.08395,
        tonnes: 1003.40,
    },
    "Development petrol": {
        litres: 0.76505,
        kwh: 0.08315,
        tonnes: 1031.29,
    },
    "Off road biodiesel": {
        litres: 0.39508,
        kwh: 0.04296,
        tonnes: 443.91,
    },
    "Biomethane (liquified)": {
        kwh: 0.08605,
        tonnes: 1171.25,
    },
    "Methanol (bio)": {
        litres: 0.59414,
        kwh: 0.13535,
        tonnes: 749.23,
    },
    "Avtur (renewable)": {
        litres: 0.53386,
        kwh: 0.05492,
        tonnes: 670.52,
    },
    //  BIOMASS 
    "Wood logs": {
        tonnes: 52.14,
        kwh: 0.01277,
    },
    "Wood chips": {
        tonnes: 30.40,
        kwh: 0.00792,
    },
    "Wood pellets": {
        tonnes: 177.00,
        kwh: 0.03744,
    },
    "Grass/straw": {
        tonnes: 68.65,
        kwh: 0.01604,
    },
    //  BIOGAS 
    "Biogas": {
        tonnes: 102.85714,
        kwh: 0.01851,
    },
    "Landfill gas": {
        tonnes: 0.000,
        kwh: 0.000000,
    }
};


export const airTravelEmissionFactors = {
    Domestic: {
        "Average passenger": 0.0335,          // kg CO2e per passenger-km
        "Economy class": 0.0335,
        "Business class": 0.0335,
        "Premium economy class": 0.0335,
        "First class": 0.0335,
    },
    International: {
        "Average passenger": 0.02162,          // kg CO2e per passenger-km
        "Economy class": 0.01656,
        "Business class": 0.02649,
        "Premium economy class": 0.04802,
        "First class": 0.06623,
    },
};

export const taxiEmissionFactors = {
    "Regular taxi": 0.03697,
    "Business Class": 0.05090,
};

export const busEmissionFactors = {
    "Local Bus": 0.03174,
    "Intercity Bus (Non A.C)": 0.01821,
    "Intercity Bus (A.C)": 0.02649,
    "Green Line": 0.00656,
};

export const trainEmissionFactors = {
    "National rail": 0.00897,
    "Green Line Train": 0.00117,
    "Metro": 0.00749,
    "Subway (underground)": 0.00728,
};

//fuelUnitOptionsByName
export const fuelUnitOptionsByName = {
  default: [
    "Tonnes",
    "kg",
    "lb",
    "kWh",
    "MWh",
    "GWh",
    "Joules",
    "Gj",
    "Mj",
    "Tj",
    "Btu",
    "MMBtu"
  ],

  "Butane": ["Litres", "Gallons"],
  "CNG": ["Litres", "Gallons"],
  "LPG": ["Litres", "Gallons"],
  "Natural gas": ["m3", "ft3", "in3","SCF"],
  "Natural gas (100% mineral blend)": ["m3", "ft3", "in3", "SCF"],
  "LNG": ["Litres", "Gallons"],
  "Other petroleum gas": ["Litres", "Gallons"],
  "Propane": ["Litres", "Gallons"],
  "Aviation spirit": ["Litres", "Gallons"],
  "Aviation turbine fuel": ["Litres", "Gallons"],
  "Burning oil": ["Litres", "Gallons"],
  "Diesel (average biofuel blend)": ["Litres", "Gallons"],
  "Diesel (100% mineral diesel)": ["Litres", "Gallons"],
  "Fuel oil": ["Litres", "Gallons"],
  "Gas oil": ["Litres", "Gallons"],
  "Petrol (average biofuel blend)": ["Litres", "Gallons"],
  "Petrol (100% mineral petrol)": ["Litres", "Gallons"],
  "Processed fuel oils - residual oil": ["Litres", "Gallons"],
  "Processed fuel oils - distillate oil": ["Litres", "Gallons"],
  "Marine gas oil": ["Litres", "Gallons"],
  "Marine fuel oil": ["Litres", "Gallons"],
  "Bioethanol": ["Litres", "Gallons"],
  "Biodiesel ME": ["Litres", "Gallons"],
  "Biodiesel ME (from used cooking oil)": ["Litres", "Gallons"],
  "Biodiesel ME (from tallow)": ["Litres", "Gallons"],
  "Biodiesel HVO": ["Litres", "Gallons"],
  "Biopropane": ["Litres", "Gallons"],
  "Development diesel": ["Litres", "Gallons"],
  "Development petrol": ["Litres", "Gallons"],
  "Off road biodiesel": ["Litres", "Gallons"],
  "Methanol (bio)": ["Litres", "Gallons"],
  "Avtur (renewable)": ["Litres", "Gallons"],
  //
  
};
