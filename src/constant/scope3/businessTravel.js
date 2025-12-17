export const travelClassOptions = [
  { "value": "Average passenger", "label": "Average passenger" },
  { "value": "Economy class", "label": "Economy class" },
  { "value": "Premium economy class", "label": "Premium economy class" },
  { "value": "Business class", "label": "Business class" },
  { "value": "First class", "label": "First class" }
]

export const flightTypeOptions = [
  { "value": "Domestic", "label": "Domestic" },
  { "value": "International", "label": "International" }
]

export const motorbikeTypeOptions = [
  { "value": "Small", "label": "Small" },
  { "value": "Medium", "label": "Medium" },
  { "value": "Large", "label": "Large" },
  { "value": "Average", "label": "Average" }
]

export const taxiTypeOptions = [
  { "value": "Regular taxi", "label": "Regular taxi" },
  { "value": "Business class taxi", "label": "Business class taxi" }
]

export const busTypeOptions = [
  { "value": "Local Bus", "label": "Local Bus" },
  { "value": "Intercity Bus (Non A.C)", "label": "Intercity Bus (Non A.C)" },
  { "value": "Intercity Bus (A.C)", "label": "Intercity Bus (A.C)" },
  { "value": "Green Line Bus", "label": "Green Line Bus" }
]

export const trainTypeOptions = [
  { "value": "National rail", "label": "National rail" },
  { "value": "Green Line Train", "label": "Green Line Train" },
  { "value": "Metro", "label": "Metro" },
  { "value": "Subway (underground)", "label": "Subway (underground)" }
]

export const carTypeOptions = [
  "Small car - Petrol/LPG/CNG - up to a 1.4-litre engine. Diesel - up to a 1.7-litre engine. Others - vehicles models of a similar size (i.e. market segment A or B)",
  "Medium car - Petrol/LPG/CNG - from 1.4-litre to 2.0-litre engine. Diesel - from 1.7-litre to 2.0-litre engine. Others - vehicles models of a similar size (i.e. generally market segment C)",
  "Large car - Petrol/LPG/CNG - 2.0-litre engine (+) . Diesel - 2.0-litre engine (+). Others - vehicles models of a similar size (i.e. generally market segment D and above)",
  "Average car - Unknown engine size.",
  "Executive - Large Executive or E-Segment Passenger Cars (2000 cc - 3500+ cc)",
  "Luxury - Full size Luxury or F-Segment Premium Passenger Cars (3000 cc - 6000 cc)",
  "Sports - High Performance - High Speed Vehicles ( 2000 cc - 4000 cc+)",
  "Dual purpose 4X4 - SUVs 4 wheel Drive or All Wheel Drive (1500 cc - 6000 cc)",
  "MPV - Multi-Purpose Vehicles / People Carriers (Highroof, Hiace,Suzuki APV, Vans etc.)  - Passenger or Transport Vehicle (1200 cc - 2000 cc)"
].map((x) => ({ value: x, label: x }));


export const carFuelTypeOptions = {
  "Small car - Petrol/LPG/CNG - up to a 1.4-litre engine. Diesel - up to a 1.7-litre engine. Others - vehicles models of a similar size (i.e. market segment A or B)": [
    "Diesel",
    "Petrol",
    "Hybrid",
    "CNG",
    "LPG",
    "Unknown",
    "Plug-in Hybrid Electric Vehicle",
    "Battery Electric Vehicle"
  ],
  "Medium car - Petrol/LPG/CNG - from 1.4-litre to 2.0-litre engine. Diesel - from 1.7-litre to 2.0-litre engine. Others - vehicles models of a similar size (i.e. generally market segment C)": [
    "Diesel",
    "Petrol",
    "Hybrid",
    "CNG",
    "LPG",
    "Unknown",
    "Plug-in Hybrid Electric Vehicle",
    "Battery Electric Vehicle"
  ],
  "Large car - Petrol/LPG/CNG - 2.0-litre engine (+) . Diesel - 2.0-litre engine (+). Others - vehicles models of a similar size (i.e. generally market segment D and above)": [
    "Diesel",
    "Petrol",
    "Hybrid",
    "CNG",
    "LPG",
    "Unknown",
    "Plug-in Hybrid Electric Vehicle",
    "Battery Electric Vehicle"
  ],
  "Average car - Unknown engine size.": [
    "Diesel",
    "Petrol",
    "Hybrid",
    "CNG",
    "LPG",
    "Unknown",
    "Plug-in Hybrid Electric Vehicle"
  ],
  "Executive - Large Executive or E-Segment Passenger Cars (2000 cc - 3500+ cc)": [
    "Diesel",
    "Petrol",
    "Unknown",
    "Plug-in Hybrid Electric Vehicle"
  ],
  "Luxury - Full size Luxury or F-Segment Premium Passenger Cars (3000 cc - 6000 cc)": [
    "Diesel",
    "Petrol",
    "Unknown",
    "Plug-in Hybrid Electric Vehicle",
    "Battery Electric Vehicle"
  ],
  "Sports - High Performance - High Speed Vehicles ( 2000 cc - 4000 cc+)": [
    "Diesel",
    "Petrol",
    "Unknown",
    "Plug-in Hybrid Electric Vehicle",
    "Battery Electric Vehicle"
  ],
  "Dual purpose 4X4 - SUVs 4 wheel Drive or All Wheel Drive (1500 cc - 6000 cc)": [
    "Diesel",
    "Petrol",
    "Unknown",
    "Plug-in Hybrid Electric Vehicle",
    "Battery Electric Vehicle"
  ],
  "MPV - Multi-Purpose Vehicles / People Carriers (Highroof, Hiace,Suzuki APV, Vans etc.)  - Passenger or Transport Vehicle (1200 cc - 2000 cc)": [
    "Diesel",
    "Petrol",
    "Unknown",
    "Plug-in Hybrid Electric Vehicle",
    "Battery Electric Vehicle"
  ]
}
//calculation

export const airTravelEmissionFactors = {
  Domestic: {
    "Average passenger": 0.13552,          // kg CO2e per passenger-km
    "Economy class": 0.13552,
    "Business class": 0.13552,
    "Premium economy class": 0.13552,
    "First class": 0.13552,
  },
  International: {
    "Average passenger": 0.0842,          // kg CO2e per passenger-km
    "Economy class": 0.06449,
    "Business class": 0.18701,
    "Premium economy class": 0.10318,
    "First class": 0.25794,
  },
};

export const taxiEmissionFactors = {
  "Regular taxi": 0.14861,
  "Business class taxi": 0.20402,
};

export const busEmissionFactors = {
  "Local Bus": 0.12525,
  "Intercity Bus (Non A.C)": 0.06875,
  "Intercity Bus (A.C)": 0.10385,
  "Green Line Bus": 0.02776,
};
export const trainEmissionFactors = {
  "National rail": 0.03546,
  "Green Line Train": 0.00446,
  "Metro": 0.02860,
  "Subway (underground)": 0.02780,
};
export const motorbikeEmissionFactors = {
  "Small": 0.08319,
  "Medium": 0.10108,
  "Large": 0.13252,
  "Average": 0.11367,
};
export const carEmissionFactors = {
  "Small car - Petrol/LPG/CNG - up to a 1.4-litre engine. Diesel - up to a 1.7-litre engine. Others - vehicles models of a similar size (i.e. market segment A or B)": {
    Petrol: 0.14308,   // kg CO2e per km
    LPG: 0.2126,
    CNG: 0.188,
    Diesel: 0.1434,
  },

  "Medium car - Petrol/LPG/CNG - from 1.4-litre to 2.0-litre engine. Diesel - from 1.7-litre to 2.0-litre engine. Others - vehicles models of a similar size (i.e. generally market segment C)": {
    Petrol: 0.2121,
    LPG: 0.1954,
    CNG: 0.1859,
    Diesel: 0.1687,
  },

  "Large car - Petrol/LPG/CNG - 2.0-litre engine (+) . Diesel - 2.0-litre engine (+). Others - vehicles models of a similar size (i.e. generally market segment D and above)": {
    Petrol: 0.2854,
    LPG: 0.2628,
    CNG: 0.2481,
    Diesel: 0.2421,
  },
  //
  "Average car - Unknown engine size.": {
    Petrol: 0.2250,
    LPG: 0.2073,
    CNG: 0.1972,
  },
  "Executive - Large Executive or E-Segment Passenger Cars (2000 cc - 3500+ cc)": {

    Diesel: 0.2500,
    Petrol: 0.2950,
  },
  "Luxury - Full size Luxury or F-Segment Premium Passenger Cars (3000 cc - 6000 cc)": {
    Diesel: 0.3200,
    Petrol: 0.3700,
  },
  "Sports - High Performance - High Speed Vehicles ( 2000 cc - 4000 cc+)": {
    Diesel: 0.3300,
    Petrol: 0.4000,
  },
  "Dual purpose 4X4 - SUVs 4 wheel Drive or All Wheel Drive (1500 cc - 6000 cc)": {
    Diesel: 0.2900,
    Petrol: 0.3400,
  },
  "MPV - Multi-Purpose Vehicles / People Carriers (Highroof, Hiace,Suzuki APV, Vans etc.)  - Passenger or Transport Vehicle (1200 cc - 2000 cc)": {
    Diesel: 0.2700,
    Petrol: 0.3000,
  }
};
