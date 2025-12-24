// Transportation and Distribution Category Options
  export const transportationCategoryOptions = [
    { value: "purchasedGoods", label: "Purchased Goods" },
    { value: "purchasedServices", label: "Purchased Third-party Transportation and Distribution Services" },
  ];

  // Purchased Goods Activity Type Options
export const purchasedGoodsActivityOptions = [
  { value: "Raw Materials", label: "Raw Materials" },
  { value: "Chemicals", label: "Chemicals" },
  { value: "Manufactured Goods", label: "Manufactured Goods" },
  { value: "Vehicles", label: "Vehicles" },
  { value: "Fuel & Energy", label: "Fuel & Energy" },
  { value: "Textiles & Clothing", label: "Textiles & Clothing" },
  { value: "Equipment", label: "Equipment" },
  { value: "Lubricants & Oil", label: "Lubricants & Oil" },
];


  // Purchased Services Activity Type Options
export const purchasedServicesActivityOptions = [
  { value: "Air transport services", label: "Air transport services" },
  {
    value: "Warehousing and support services for transportation",
    label: "Warehousing and support services for transportation",
  },
  {
    value:
      "Land transport services and transport services via pipelines, excluding rail transport",
    label:
      "Land transport services and transport services via pipelines, excluding rail transport",
  },
  { value: "Postal and courier services", label: "Postal and courier services" },
  { value: "Rail transport services", label: "Rail transport services" },
  { value: "Water transport services", label: "Water transport services" },
];


  // Purchased Goods Type Options
// 
export const purchasedGoodsTypeMapping = {
  "Raw Materials": [
    { value: "Basic iron and steel", label: "Basic iron and steel" },
    { value: "Cement, lime, plaster and articles of concrete, cement and plaster", label: "Cement, lime, plaster and articles of concrete, cement and plaster" },
    { value: "Coal and lignite", label: "Coal and lignite" },
    { value: "Coke and refined petroleum products", label: "Coke and refined petroleum products" },
    { value: "Glass, refractory, clay, other porcelain and ceramic, stone and abrasive products", label: "Glass, refractory, clay, other porcelain and ceramic, stone and abrasive products" },
    { value: "Other basic metals and casting", label: "Other basic metals and casting" },
    { value: "Mining and quarrying products", label: "Mining and quarrying products" },
    { value: "Petrochemicals", label: "Petrochemicals" },
    { value: "Wood and of products of wood and cork, except furniture; articles of straw and plaiting materials", label: "Wood and of products of wood and cork, except furniture; articles of straw and plaiting materials" },
    { value: "Polymers", label: "Polymers" },
  ],

  "Chemicals": [
    { value: "Basic pharmaceutical products and pharmaceutical preparations", label: "Basic pharmaceutical products and pharmaceutical preparations" },
    { value: "Dyestuffs, agro-chemicals", label: "Dyestuffs, agro-chemicals" },
    { value: "Industrial gases, inorganics and fertilisers (all inorganic chemicals)", label: "Industrial gases, inorganics and fertilisers (all inorganic chemicals)" },
    { value: "Other chemical products", label: "Other chemical products" },
    { value: "Paints, varnishes and similar coatings, printing ink and mastics", label: "Paints, varnishes and similar coatings, printing ink and mastics" },
    { value: "Soap and detergents, cleaning and polishing preparations, perfumes and toilet preparations", label: "Soap and detergents, cleaning and polishing preparations, perfumes and toilet preparations" },
    { value: "Tobacco products", label: "Tobacco products" },
    { value: "Other Industrial Chemicals", label: "Other Industrial Chemicals" },
  ],

  "Manufactured Goods": [
    { value: "Fabricated metal products, excl. machinery and equipment and weapons & ammunition", label: "Fabricated metal products, excl. machinery and equipment and weapons & ammunition" },
    { value: "Furniture", label: "Furniture" },
    { value: "Other manufactured goods", label: "Other manufactured goods" },
    { value: "Paper and paper products", label: "Paper and paper products" },
    { value: "Rubber and plastic products", label: "Rubber and plastic products" },
    { value: "Weapons and ammunition", label: "Weapons and ammunition" },
    { value: "Plastic/Polymer products", label: "Plastic/Polymer products" },
    { value: "Metal Foils", label: "Metal Foils" },
  ],

  "Vehicles": [
    { value: "Air and spacecraft and related machinery", label: "Air and spacecraft and related machinery" },
    { value: "Motor vehicles, trailers and semi-trailers", label: "Motor vehicles, trailers and semi-trailers" },
    { value: "Other transport equipment", label: "Other transport equipment" },
    { value: "Ships and boats", label: "Ships and boats" },
    { value: "Vehicle Parts", label: "Vehicle Parts" },
    { value: "Other Auto Parts", label: "Other Auto Parts" },
    { value: "Engine Oils & Lubrications", label: "Engine Oils & Lubrications" },
  ],

  "Fuel & Energy": [
    { value: "Crude petroleum and natural gas", label: "Crude petroleum and natural gas" },
    { value: "Electricity, transmission and distribution", label: "Electricity, transmission and distribution" },
    { value: "Gas; distribution of gaseous fuels through mains; steam and air conditioning supply", label: "Gas; distribution of gaseous fuels through mains; steam and air conditioning supply" },
  ],

  "Textiles & Clothing": [
    { value: "Leather and related products", label: "Leather and related products" },
    { value: "Other Textiles", label: "Other Textiles" },
    { value: "Wearing Apparels", label: "Wearing Apparels" },
    { value: "Home Textiles", label: "Home Textiles" },
  ],

  "Equipment": [
    { value: "Computer, electronic and optical products", label: "Computer, electronic and optical products" },
    { value: "Electrical equipment", label: "Electrical equipment" },
    { value: "Machinery and Equipment n.e.c.", label: "Machinery and Equipment n.e.c." },
  ],

  "Lubricants & Oil": [
    { value: "Hydraulic Oils", label: "Hydraulic Oils" },
    { value: "Gear Oils", label: "Gear Oils" },
    { value: "Compressor Oils", label: "Compressor Oils" },
    { value: "Turbine Oils", label: "Turbine Oils" },
    { value: "Engine Oils (Industrial / Heavy-Duty)", label: "Engine Oils (Industrial / Heavy-Duty)" },
    { value: "Heat Transfer Oils", label: "Heat Transfer Oils" },
    { value: "Transformer Oils", label: "Transformer Oils" },
    { value: "Metalworking Fluids", label: "Metalworking Fluids" },
    { value: "Greases", label: "Greases" },
  ],
};
  // Transportation Vehicle Category Options
  export const vehicleCategoryOptions = [
    { value: "vans", label: "Vans" },
    { value: "hqv", label: "Heavy Good Vehicles" },
    { value: "hqvRefrigerated", label: "Heavy Good Vehicles (Refrigerated)" },
    { value: "freightFlights", label: "Freight flights" },
    { value: "rail", label: "Rail" },
    { value: "seaTanker", label: "Sea tanker" },
    { value: "cargoShip", label: "Cargo Ship" },
  ];

  // Vehicle Type Options based on Category
  // export const vehicleTypeOptions = {
  //   freightFlights: [
  //     { value: "domestic", label: "Domestic" },
  //     { value: "international", label: "International" },
  //   ],
  //   seaTanker: [
  //     { value: "crudeTanker", label: "Crude tanker" },
  //     { value: "productsTanker", label: "Products tanker" },
  //     { value: "chemicalTanker", label: "Chemical tanker" },
  //     { value: "lngTanker", label: "LNG tanker" },
  //     { value: "lpgTanker", label: "LPG Tanker" },
  //   ],
  //   cargoShip: [
  //     { value: "bulkCarrier", label: "Bulk carrier" },
  //     { value: "generalCargo", label: "General cargo" },
  //     { value: "containerShip", label: "Container ship" },
  //     { value: "vehicleTransport", label: "Vehicle transport" },
  //     { value: "roroFerry", label: "RoRo Ferry" },
  //     { value: "largeRoPax", label: "Large RoPax ferry" },
  //     { value: "refrigeratedCargo", label: "Refrigerated cargo" },
  //   ],
  // };
export const vehicleTypeOptions = {
  freightFlights: [
    { value: "Domestic", label: "Domestic" },
    { value: "International", label: "International" },
  ],

  seaTanker: [
    { value: "Crude tanker", label: "Crude tanker" },
    { value: "Products tanker", label: "Products tanker" },
    { value: "Chemical tanker", label: "Chemical tanker" },
    { value: "LNG tanker", label: "LNG tanker" },
    { value: "LPG Tanker", label: "LPG Tanker" },
  ],

  cargoShip: [
    { value: "Bulk carrier", label: "Bulk carrier" },
    { value: "General cargo", label: "General cargo" },
    { value: "Container ship", label: "Container ship" },
    { value: "Vehicle transport", label: "Vehicle transport" },
    { value: "RoRo Ferry", label: "RoRo Ferry" },
    { value: "Large RoPax ferry", label: "Large RoPax ferry" },
    { value: "Refrigerated cargo", label: "Refrigerated cargo" },
  ],
};



  ///calculation
  // Emission factors for purchasedGoods (weight × distance × EF)
export const purchasedGoodsEmissionFactors = {
  // Vans (no vehicle type needed)
  vans: 0.58, // kg CO2e per tonne-km
  
  // Heavy Good Vehicles
  hqv: 0.1302049, // kg CO2e per tonne-km
  
  // Heavy Good Vehicles (Refrigerated)
  hqvRefrigerated: 0.1302049, // kg CO2e per tonne-km
  
  // Rail
  rail: 0.0147049, // kg CO2e per tonne-km
  
  // Freight flights
  freightFlights: {
    domestic: 0.76022338, // kg CO2e per tonne-km
    international: 0.76022338, // kg CO2e per tonne-km
  },
  
  // Sea tanker
  // seaTanker: {
  //   crudeTanker: 0.00457, // kg CO2e per tonne-km
  //   productsTanker: 0.00902, // kg CO2e per tonne-km
  //   chemicalTanker: 0.01031, // kg CO2e per tonne-km
  //   lngTanker: 0.01153, // kg CO2e per tonne-km
  //   lpgTanker: 0.01037, // kg CO2e per tonne-km
  // },
  
  // // Cargo ship
  // cargoShip: {
  //   bulkCarrier: 0.00353, // kg CO2e per tonne-km
  //   generalCargo: 0.01321, // kg CO2e per tonne-km
  //   containerShip: 0.01612, // kg CO2e per tonne-km
  //   vehicleTransport: 0.03852, // kg CO2e per tonne-km
  //   roroFerry: 0.05158, // kg CO2e per tonne-km
  //   largeRoPax: 0.37612, // kg CO2e per tonne-km
  //   refrigeratedCargo: 0.01306, // kg CO2e per tonne-km
  // },
  seaTanker: {
  "Crude tanker": 0.00457, // kg CO2e per tonne-km
  "Products tanker": 0.00902, // kg CO2e per tonne-km
  "Chemical tanker": 0.01031, // kg CO2e per tonne-km
  "LNG tanker": 0.01153, // kg CO2e per tonne-km
  "LPG Tanker": 0.01037, // kg CO2e per tonne-km
},

// Cargo Ship
cargoShip: {
  "Bulk carrier": 0.00353, // kg CO2e per tonne-km
  "General cargo": 0.01321, // kg CO2e per tonne-km
  "Container ship": 0.01612, // kg CO2e per tonne-km
  "Vehicle transport": 0.03852, // kg CO2e per tonne-km
  "RoRo Ferry": 0.05158, // kg CO2e per tonne-km
  "Large RoPax ferry": 0.37612, // kg CO2e per tonne-km
  "Refrigerated cargo": 0.01306, // kg CO2e per tonne-km
},
};

// Emission factors for purchasedServices (amount spent × EF)
export const purchasedServicesEmissionFactors = {
  // Note: These are kg CO2e per currency unit (e.g., USD)
  "Air transport services": 2.3605478377936, // kg CO2e per USD
  "Warehousing and support services for transportation": 0.526131417528326, // kg CO2e per USD
  "Land transport services and transport services via pipelines, excluding rail transport": 0.839422069740741, // kg CO2e per USD
  "Postal and courier services": 0.345663932686455, // kg CO2e per USD
  "Water transport services": 2.34925453605423, // kg CO2e per USD
  "Rail transport services": 0.62363913421569, // kg CO2e per USD
};

// Mapping for activityType to emission factor key
export const activityTypeToEFKey = {
  // For purchasedServices
  "waterTransport": "waterTransport",
  "warehousingSupport": "warehousingSupport",
  // You might need to add more mappings based on your actual activityType values
};