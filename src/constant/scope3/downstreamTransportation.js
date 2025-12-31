// constant/scope3/downstreamTransportation.js

// Transportation and Distribution Category Options
export const transportationCategoryOptions = [
  { value: "Sold Goods", label: "Sold Goods" },
];

// Sold Goods Activity Type Options
export const soldProductActivityOptions = [
  { value: "Raw Materials", label: "Raw Materials" },
  { value: "Chemicals", label: "Chemicals" },
  { value: "Manufactured Goods", label: "Manufactured Goods" },
  { value: "Vehicles", label: "Vehicles" },
  { value: "Fuel & Energy", label: "Fuel & Energy" },
  { value: "Textiles & Clothing", label: "Textiles & Clothing" },
  { value: "Equipment", label: "Equipment" },
  { value: "Lubricants & Oil", label: "Lubricants & Oil" },
];

// Downstream Services Activity Type Options
export const downstreamServicesActivityOptions = [
  { value: "Distribution to Retailers", label: "Distribution to Retailers" },
  { value: "Distribution to Wholesalers", label: "Distribution to Wholesalers" },
  { value: "Direct to Consumer", label: "Direct to Consumer" },
  { value: "Inter-facility Transfer", label: "Inter-facility Transfer" },
];

// Sold Goods Type Options
export const soldGoodsTypeMapping = {
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
    { value: "Plastic / Polymer products", label: "Plastic / Polymer products" },
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

// Transportation Vehicle Category Options (same as upstream)
export const transportationVehicleCategoryOptions = [
  { value: "vans", label: "Vans" },
  { value: "hqv", label: "Heavy Good Vehicles" },
  { value: "hqvRefrigerated", label: "Heavy Good Vehicles (Refrigerated)" },
  { value: "freightFlights", label: "Freight flights" },
  { value: "rail", label: "Rail" },
  { value: "seaTanker", label: "Sea tanker" },
  { value: "cargoShip", label: "Cargo Ship" },
];

// Vehicle Type Options based on Category (same as upstream)
export const transportationVehicleTypeOptions = {
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

// Downstream Services Type Options
export const downstreamServicesTypeMapping = {
  "Distribution to Retailers": [
    { value: "Packaged Food", label: "Packaged Food" },
    { value: "Beverages", label: "Beverages" },
    { value: "Electronics", label: "Electronics" },
    { value: "Apparel", label: "Apparel" },
    { value: "Household Goods", label: "Household Goods" },
  ],
  "Distribution to Wholesalers": [
    { value: "Bulk Food Items", label: "Bulk Food Items" },
    { value: "Raw Materials", label: "Raw Materials" },
    { value: "Industrial Parts", label: "Industrial Parts" },
  ],
  "Direct to Consumer": [
    { value: "E-commerce Products", label: "E-commerce Products" },
    { value: "Subscription Boxes", label: "Subscription Boxes" },
    { value: "Fresh Produce", label: "Fresh Produce" },
  ],
  "Inter-facility Transfer": [
    { value: "Work-in-Progress", label: "Work-in-Progress" },
    { value: "Finished Goods", label: "Finished Goods" },
    { value: "Raw Materials", label: "Raw Materials" },
  ],
};

///calculation
// Emission factors for soldGoods (weight × distance × EF) - Same as upstream
export const soldGoodsEmissionFactors = {
  vans: 0.58, 
  hqv: 0.1302049, 
  hqvRefrigerated: 0.1302049, 
  rail: 0.0147049, 
  freightFlights: {
    Domestic: 0.76022338, 
    International: 0.76022338, 
  },
  
  // Sea tanker
  seaTanker: {
    "Crude tanker": 0.00457, 
    "Products tanker": 0.00902, 
    "Chemical tanker": 0.01031, 
    "LNG tanker": 0.01153, 
    "LPG Tanker": 0.01037, 
  },

  // Cargo Ship
  cargoShip: {
    "Bulk carrier": 0.00353, 
    "General cargo": 0.01321, 
    "Container ship": 0.01612, 
    "Vehicle transport": 0.03852, 
    "RoRo Ferry": 0.05158, 
    "Large RoPax ferry": 0.37612, 
    "Refrigerated cargo": 0.01306, 
  },
};

