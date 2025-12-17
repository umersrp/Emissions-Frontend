export const travelClassOptions=[
  { "value": "Average passenger", "label": "Average passenger" },
  { "value": "Economy class", "label": "Economy class" },
  { "value": "Premium economy class", "label": "Premium economy class" },
  { "value": "Business class", "label": "Business class" },
  { "value": "First class", "label": "First class" }
]

export const flightTypeOptions=[
  { "value": "Domestic", "label": "Domestic" },
  { "value": "International", "label": "International" }
]

export const motorbikeTypeOptions=[
  { "value": "Small", "label": "Small" },
  { "value": "Medium", "label": "Medium" },
  { "value": "Large", "label": "Large" },
  { "value": "Average", "label": "Average" }
]

export const taxiTypeOptions=[
  { "value": "Regular taxi", "label": "Regular taxi" },
  { "value": "Business class taxi", "label": "Business class taxi" }
]

export const busTypeOptions=[
  { "value": "Local Bus", "label": "Local Bus" },
  { "value": "Intercity Bus (Non A.C)", "label": "Intercity Bus (Non A.C)" },
  { "value": "Intercity Bus (A.C)", "label": "Intercity Bus (A.C)" },
  { "value": "Green Line Bus", "label": "Green Line Bus" }
]

export const  trainTypeOptions=[
  { "value": "National rail", "label": "National rail" },
  { "value": "Green Line Train", "label": "Green Line Train" },
  { "value": "Metro", "label": "Metro" },
  { "value": "Subway (underground)", "label": "Subway (underground)" }
]

export const carTypeOptions = [
  "Small car - Petrol/LPG/CNG up to 1.4L, Diesel up to 1.7L, others similar size (segment A or B)",
  "Medium car - Petrol/LPG/CNG 1.4L–2.0L, Diesel 1.7L–2.0L, segment C",
  "Large car - Petrol/LPG/CNG 2.0L+, Diesel 2.0L+, segment D and above",
  "Average car - Unknown engine size",
  "Executive - Large Executive, E-Segment 2000–3500+ cc",
  "Luxury - Full Size Luxury, F-Segment 3000–6000 cc",
  "Sports - High Performance 2000–4000+ cc",
  "Dual purpose 4X4 - SUVs AWD/4WD 1500–6000 cc",
  "MPV - Multi-Purpose Vehicles (Highroof, Hiace, APV, Vans etc.) 1200–2000 cc"
].map((x) => ({ value: x, label: x }));


export const  carFuelTypeOptions={
  "Small car - Petrol/LPG/CNG up to 1.4L, Diesel up to 1.7L, others similar size (segment A or B)": [
    "Diesel",
    "Petrol",
    "Hybrid",
    "CNG",
    "LPG",
    "Unknown",
    "Plug-in Hybrid Electric Vehicle",
    "Battery Electric Vehicle"
  ],
  "Medium car - Petrol/LPG/CNG 1.4L–2.0L, Diesel 1.7L–2.0L, segment C": [
    "Diesel",
    "Petrol",
    "Hybrid",
    "CNG",
    "LPG",
    "Unknown",
    "Plug-in Hybrid Electric Vehicle",
    "Battery Electric Vehicle"
  ],
  "Large car - Petrol/LPG/CNG 2.0L+, Diesel 2.0L+, segment D and above": [
    "Diesel",
    "Petrol",
    "Hybrid",
    "CNG",
    "LPG",
    "Unknown",
    "Plug-in Hybrid Electric Vehicle",
    "Battery Electric Vehicle"
  ],
  "Average car - Unknown engine size": [
    "Diesel",
    "Petrol",
    "Hybrid",
    "CNG",
    "LPG",
    "Unknown",
    "Plug-in Hybrid Electric Vehicle"
  ],
  "Executive - Large Executive, E-Segment 2000–3500+ cc": [
    "Diesel",
    "Petrol",
    "Unknown",
    "Plug-in Hybrid Electric Vehicle"
  ],
  "Luxury - Full Size Luxury, F-Segment 3000–6000 cc": [
    "Diesel",
    "Petrol",
    "Unknown",
    "Plug-in Hybrid Electric Vehicle",
    "Battery Electric Vehicle"
  ],
  "Sports - High Performance 2000–4000+ cc": [
    "Diesel",
    "Petrol",
    "Unknown",
    "Plug-in Hybrid Electric Vehicle",
    "Battery Electric Vehicle"
  ],
  "Dual purpose 4X4 - SUVs AWD/4WD 1500–6000 cc": [
    "Diesel",
    "Petrol",
    "Unknown",
    "Plug-in Hybrid Electric Vehicle",
    "Battery Electric Vehicle"
  ],
  "MPV - Multi-Purpose Vehicles (Highroof, Hiace, APV, Vans etc.) 1200–2000 cc": [
    "Diesel",
    "Petrol",
    "Unknown",
    "Plug-in Hybrid Electric Vehicle",
    "Battery Electric Vehicle"
  ]
}
//calc
  // airTravelEmissionFactors,
  // taxiEmissionFactors,
  // busEmissionFactors,
  // trainEmissionFactors,
  // motorbikeEmissionFactors,
  // carEmissionFactors,

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

export const taxiEmissionFactors= {
    "Regular taxi": 0.03697,
    "Business Class": 0.05090,
};

export const busEmissionFactors= {
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
export const motorbikeEmissionFactors = {
    "National rail": 0.00897,
    "Green Line Train": 0.00117,
    "Metro": 0.00749,
    "Subway (underground)": 0.00728,
};
export const carEmissionFactors = {
    "National rail": 0.00897,
    "Green Line Train": 0.00117,
    "Metro": 0.00749,
    "Subway (underground)": 0.00728,
};