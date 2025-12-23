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
export const purchasedGoodsTypeMapping = {
  "Raw Materials": [
    { value: "basicIronSteel", label: "Basic iron and steel" },
    { value: "cement", label: "Cement, lime, plaster and articles of concrete, cement and plaster" },
    { value: "coalLignite", label: "Coal and lignite" },
    { value: "cokePetroleum", label: "Coke and refined petroleum products" },
    { value: "glassCeramic", label: "Glass, refractory, clay, other porcelain and ceramic, stone and abrasive products" },
    { value: "otherMetals", label: "Other basic metals and casting" },
    { value: "miningProducts", label: "Mining and quarrying products" },
    { value: "petrochemicals", label: "Petrochemicals" },
    { value: "woodProducts", label: "Wood and of products of wood and cork, except furniture; articles of straw and plaiting materials" },
    { value: "polymers", label: "Polymers" },
  ],
  "Chemicals": [
    { value: "pharmaceutical", label: "Basic pharmaceutical products and pharmaceutical preparations" },
    { value: "dyestuffsAgro", label: "Dyestuffs, agro-chemicals" },
    { value: "industrialGases", label: "Industrial gases, inorganics and fertilisers (all inorganic chemicals)" },
    { value: "otherChemical", label: "Other chemical products" },
    { value: "paintsVarnishes", label: "Paints, varnishes and similar coatings, printing ink and mastics" },
    { value: "soapDetergents", label: "Soap and detergents, cleaning and polishing preparations, perfumes and toilet preparations" },
    { value: "tobacco", label: "Tobacco products" },
    { value: "otherIndustrialChemicals", label: "Other Industrial Chemicals" },
  ],
  "Manufactured Goods": [
    { value: "fabricatedMetal", label: "Fabricated metal products, excl. machinery and equipment and weapons & ammunition" },
    { value: "furniture", label: "Furniture" },
    { value: "otherManufactured", label: "Other manufactured goods" },
    { value: "paperProducts", label: "Paper and paper products" },
    { value: "rubberPlastic", label: "Rubber and plastic products" },
    { value: "weaponsAmmunition", label: "Weapons and ammunition" },
    { value: "plasticPolymer", label: "Plastic/Polymer products" },
    { value: "metalFoils", label: "Metal Foils" },
  ],
  "Vehicles": [
    { value: "aircraft", label: "Air and spacecraft and related machinery" },
    { value: "motorVehicles", label: "Motor vehicles, trailers and semi-trailers" },
    { value: "otherTransport", label: "Other transport equipment" },
    { value: "shipsBoats", label: "Ships and boats" },
    { value: "vehicleParts", label: "Vehicle Parts" },
    { value: "otherAutoParts", label: "Other Auto Parts" },
    { value: "engineOils", label: "Engine Oils & Lubrications" },
  ],
  "Fuel & Energy": [
    { value: "crudePetroleum", label: "Crude petroleum and natural gas" },
    { value: "electricity", label: "Electricity, transmission and distribution" },
    { value: "gasSteam", label: "Gas; distribution of gaseous fuels through mains; steam and air conditioning supply" },
  ],
  "Textiles & Clothing": [
    { value: "leatherProducts", label: "Leather and related products" },
    { value: "otherTextiles", label: "Other Textiles" },
    { value: "wearingApparels", label: "Wearing Apparels" },
    { value: "homeTextiles", label: "Home Textiles" },
  ],
  "Equipment": [
    { value: "computerElectronics", label: "Computer, electronic and optical products" },
    { value: "electricalEquipment", label: "Electrical equipment" },
    { value: "machineryEquipment", label: "Machinery and Equipment n.e.c." },
  ],
  "Lubricants & Oil": [
    { value: "hydraulicOils", label: "Hydraulic Oils" },
    { value: "gearOils", label: "Gear Oils" },
    { value: "compressorOils", label: "Compressor Oils" },
    { value: "turbineOils", label: "Turbine Oils" },
    { value: "engineOilsIndustrial", label: "Engine Oils (Industrial / Heavy-Duty)" },
    { value: "heatTransferOils", label: "Heat Transfer Oils" },
    { value: "transformerOils", label: "Transformer Oils" },
    { value: "metalworkingFluids", label: "Metalworking Fluids" },
    { value: "greases", label: "Greases" },
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
  export const vehicleTypeOptions = {
    freightFlights: [
      { value: "domestic", label: "Domestic" },
      { value: "international", label: "International" },
    ],
    seaTanker: [
      { value: "crudeTanker", label: "Crude tanker" },
      { value: "productsTanker", label: "Products tanker" },
      { value: "chemicalTanker", label: "Chemical tanker" },
      { value: "lngTanker", label: "LNG tanker" },
      { value: "lpgTanker", label: "LPG Tanker" },
    ],
    cargoShip: [
      { value: "bulkCarrier", label: "Bulk carrier" },
      { value: "generalCargo", label: "General cargo" },
      { value: "containerShip", label: "Container ship" },
      { value: "vehicleTransport", label: "Vehicle transport" },
      { value: "roroFerry", label: "RoRo-Ferry" },
      { value: "largeRoPax", label: "Large RoPax ferry" },
      { value: "refrigeratedCargo", label: "Refrigerated cargo" },
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
  seaTanker: {
    crudeTanker: 0.00457, // kg CO2e per tonne-km
    productsTanker: 0.00902, // kg CO2e per tonne-km
    chemicalTanker: 0.01031, // kg CO2e per tonne-km
    lngTanker: 0.01153, // kg CO2e per tonne-km
    lpgTanker: 0.01037, // kg CO2e per tonne-km
  },
  
  // Cargo ship
  cargoShip: {
    bulkCarrier: 0.00353, // kg CO2e per tonne-km
    generalCargo: 0.01321, // kg CO2e per tonne-km
    containerShip: 0.01612, // kg CO2e per tonne-km
    vehicleTransport: 0.03852, // kg CO2e per tonne-km
    roroFerry: 0.05158, // kg CO2e per tonne-km
    largeRoPax: 0.37612, // kg CO2e per tonne-km
    refrigeratedCargo: 0.01306, // kg CO2e per tonne-km
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