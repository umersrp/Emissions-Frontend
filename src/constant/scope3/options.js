//employee commuting options
export  const departmentOptions = [
        { value: 'Assembly', label: 'Assembly' },
        { value: 'Asset Integrity / Technical Integrity', label: 'Asset Integrity / Technical Integrity' },
        { value: 'Batching Plant', label: 'Batching Plant' },
        { value: 'Boiler', label: 'Boiler' },
        { value: 'Civil Construction', label: 'Civil Construction' },
        { value: 'Commissioning', label: 'Commissioning' },
        { value: 'Commercial', label: 'Commercial' },
        { value: 'Compressor', label: 'Compressor' },
        { value: 'Construction', label: 'Construction' },
        { value: 'Contracts', label: 'Contracts' },
        { value: 'Control Systems', label: 'Control Systems' },
        { value: 'Crane', label: 'Crane' },
        { value: 'Cyber Security', label: 'Cyber Security' },
        { value: 'Deaerator', label: 'Deaerator' },
        { value: 'Design', label: 'Design' },
        { value: 'Dewatering', label: 'Dewatering' },
        { value: 'Drilling', label: 'Drilling' },
        { value: 'Dust Collection / Handling', label: 'Dust Collection / Handling' },
        { value: 'Earthworks', label: 'Earthworks' },
        { value: 'EHS', label: 'EHS' },
        { value: 'Electrical', label: 'Electrical' },
        { value: 'Engineering', label: 'Engineering' },
        { value: 'Environment', label: 'Environment' },
        { value: 'Excavation', label: 'Excavation' },
        { value: 'Expansion', label: 'Expansion' },
        { value: 'Fabrication', label: 'Fabrication' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Fire Protection', label: 'Fire Protection' },
        { value: 'Fuel Handling', label: 'Fuel Handling' },
        { value: 'General Services', label: 'General Services' },
        { value: 'Geotechnical', label: 'Geotechnical' },
        { value: 'GGBS Handling', label: 'GGBS Handling' },
        { value: 'Grouting', label: 'Grouting' },
        { value: 'Health', label: 'Health' },
        { value: 'Heavy Lift', label: 'Heavy Lift' },
        { value: 'HEMP', label: 'HEMP' },
        { value: 'High Voltage', label: 'High Voltage' },
        { value: 'HR', label: 'HR' },
        { value: 'HVAC', label: 'HVAC' },
        { value: 'Industrial Gases', label: 'Industrial Gases' },
        { value: 'Infrastructure', label: 'Infrastructure' },
        { value: 'Installation', label: 'Installation' },
        { value: 'Instrumentation', label: 'Instrumentation' },
        { value: 'Insulation', label: 'Insulation' },
        { value: 'IT', label: 'IT' },
        { value: 'Legal', label: 'Legal' },
        { value: 'Lighting', label: 'Lighting' },
        { value: 'Logistics', label: 'Logistics' },
        { value: 'Low Voltage', label: 'Low Voltage' },
        { value: 'Maintenance', label: 'Maintenance' },
        { value: 'Management', label: 'Management' },
        { value: 'Manufacturing', label: 'Manufacturing' },
        { value: 'Material Handling', label: 'Material Handling' },
        { value: 'Materials', label: 'Materials' },
        { value: 'Mechanical', label: 'Mechanical' },
        { value: 'MEP', label: 'MEP' },
        { value: 'Mining', label: 'Mining' },
        { value: 'Motor Control Centre', label: 'Motor Control Centre' },
        { value: 'Operations', label: 'Operations' },
        { value: 'Piling', label: 'Piling' },
        { value: 'Planning', label: 'Planning' },
        { value: 'Power Distribution', label: 'Power Distribution' },
        { value: 'Process', label: 'Process' },
        { value: 'Procurement', label: 'Procurement' },
        { value: 'Production', label: 'Production' },
        { value: 'Project Controls', label: 'Project Controls' },
        { value: 'Project Management', label: 'Project Management' },
        { value: 'QA/QC', label: 'QA/QC' },
        { value: 'Quantity Surveying', label: 'Quantity Surveying' },
        { value: 'Quarry', label: 'Quarry' },
        { value: 'Reinforcement', label: 'Reinforcement' },
        { value: 'Risk', label: 'Risk' },
        { value: 'Safety', label: 'Safety' },
        { value: 'Scaffolding', label: 'Scaffolding' },
        { value: 'Security', label: 'Security' },
        { value: 'Sewage Treatment', label: 'Sewage Treatment' },
        { value: 'Site Infrastructure', label: 'Site Infrastructure' },
        { value: 'Stacker / Reclaimer', label: 'Stacker / Reclaimer' },
        { value: 'Static', label: 'Static' },
        { value: 'Steel', label: 'Steel' },
        { value: 'Structural', label: 'Structural' },
        { value: 'Supply Chain', label: 'Supply Chain' },
        { value: 'Survey', label: 'Survey' },
        { value: 'Switchgear', label: 'Switchgear' },
        { value: 'Telecom', label: 'Telecom' },
        { value: 'Temporary Works', label: 'Temporary Works' },
        { value: 'Training', label: 'Training' },
        { value: 'Transportation', label: 'Transportation' },
        { value: 'Utilities', label: 'Utilities' },
        { value: 'Warehouse', label: 'Warehouse' },
        { value: 'Water Treatment', label: 'Water Treatment' },
        { value: 'Welding', label: 'Welding' },
        { value: 'Workshop', label: 'Workshop' },
        { value: 'Other', label: 'Other' },
    ];

   
    // Transportation type options
export const transportationOptions = {
        motorbikeTypes: [
            { value: 'Small', label: 'Small (<125cc)' },
            { value: 'Medium', label: 'Medium (125-500cc)' },
            { value: 'Large', label: 'Large (>500cc)' },
            { value: 'Electric', label: 'Electric Motorbike' },
        ],

        taxiTypes: [
            { value: 'Regular taxi', label: 'Regular Taxi' },
            { value: 'Business class taxi', label: 'Business class taxi' },
        ],

        busTypes: [
            { value: 'Green Line Bus', label: 'Green Line Bus' },
            { value: 'Local bus', label: 'Local Bus' },
            { value: 'Intercity Bus (Non A.C)', label: 'Intercity Bus (Non A.C)' },
            { value: 'Intercity Bus (A.C)', label: 'Intercity Bus (A.C)' },
        ],

        trainTypes: [
            { value: 'National rail', label: 'National Rail' },
            { value: 'Subway/Metro', label: 'Subway/Metro' },
            { value: 'Green Line Train', label: 'Green Line Train' },
            { value: 'Metro', label: 'Metro' },
        ],

        carTypes: [
            {
                value: 'Small car - Petrol/LPG/CNG - up to 1.4-litre engine',
                label: 'Small car - Petrol/LPG/CNG - up to 1.4-litre engine'
            },
            {
                value: 'Small car - Diesel - up to a 1.7-litre engine',
                label: 'Small car - Diesel - up to a 1.7-litre engine'
            },
            {
                value: 'Medium car - Petrol/LPG/CNG - from 1.4-litre to 2.0-litre engine',
                label: 'Medium car - Petrol/LPG/CNG - from 1.4-litre to 2.0-litre engine'
            },
            {
                value: 'Medium car - Diesel - from 1.7-litre to 2.0-litre engine',
                label: 'Medium car - Diesel - from 1.7-litre to 2.0-litre engine'
            },
            {
                value: 'Large car - Petrol/LPG/CNG - 2.0-litre engine (+)',
                label: 'Large car - Petrol/LPG/CNG - 2.0-litre engine (+)'
            },
            {
                value: 'Large car - Diesel - 2.0-litre engine (+)',
                label: 'Large car - Diesel - 2.0-litre engine (+)'
            },
            {
                value: 'Average car - Unknown engine size',
                label: 'Average car - Unknown engine size'
            },
            {
                value: 'Executive - Large Executive or E-Segment Passenger Cars (2000 cc - 3500+ cc)',
                label: 'Executive - Large Executive or E-Segment Passenger Cars (2000 cc - 3500+ cc)'
            },
            {
                value: 'Luxury - Full size Luxury or F-Segment Premium Passenger Cars (3000 cc - 6000 cc)',
                label: 'Luxury - Full size Luxury or F-Segment Premium Passenger Cars (3000 cc - 6000 cc)'
            },
            {
                value: 'Sports - High Performance - High Speed Vehicles (2000 cc - 4000 cc+)',
                label: 'Sports - High Performance - High Speed Vehicles (2000 cc - 4000 cc+)'
            },
            {
                value: 'Dual purpose 4X4 - SUVs 4 wheel Drive or All Wheel Drive (1500 cc - 6000 cc)',
                label: 'Dual purpose 4X4 - SUVs 4 wheel Drive or All Wheel Drive (1500 cc - 6000 cc)'
            },
            {
                value: 'MPV - Multi-Purpose Vehicles / People Carriers (Highroof, Hiace, Suzuki APV, Vans etc.)',
                label: 'MPV - Multi-Purpose Vehicles / People Carriers (Highroof, Hiace, Suzuki APV, Vans etc.)'
            },
        ],

        fuelTypes: [
            { value: 'Petrol', label: 'Petrol' },
            { value: 'Diesel', label: 'Diesel' },
            { value: 'CNG', label: 'CNG' },
            { value: 'LPG', label: 'LPG' },
            { value: 'Electric', label: 'Electric' },
            { value: 'Hybrid', label: 'Hybrid (Petrol/Electric)' },
        ],

        personOptions: [
            { value: '1', label: '1 person' },
            { value: '2', label: '2 persons' },
            { value: '3', label: '3 persons' },
            { value: '4', label: '4 persons' },
            { value: '5', label: '5+ persons' },
        ],

        taxiPassengerOptions: [
            { value: '1', label: '1 passenger' },
            { value: '2', label: '2 passengers' },
            { value: '3', label: '3 passengers' },
            { value: '4', label: '4 passengers' },
            { value: '5', label: '5+ passengers' },
        ]
    };

    // Mode options for all transport types
export const modeOptions = [
        { value: 'individual', label: 'Individual' },
        { value: 'carpool', label: 'Carpool' },
        { value: 'both', label: 'Both (Individual & Carpool)' },
    ];


export const stakeholderOptions = [
  { value: "Assembly", label: "Assembly" },
  { value: "Asset Integrity / Technical Integrity", label: "Asset Integrity / Technical Integrity" },
  { value: "Biostatistics / Statistical Programming", label: "Biostatistics / Statistical Programming" },
  { value: "Blow Molding / Extrusion Trials Unit", label: "Blow Molding / Extrusion Trials Unit" },
  { value: "Boiler Operations", label: "Boiler Operations" },
  { value: "Carbon Accounting", label: "Carbon Accounting" },
  { value: "Catalyst & Additives Handling (Petrochem Focus)", label: "Catalyst & Additives Handling (Petrochem Focus)" },
  { value: "Catalyst Management", label: "Catalyst Management" },
  { value: "Change Management", label: "Change Management" },
  { value: "Chemical Operations (Olefins, Aromatics, Polymers)", label: "Chemical Operations (Olefins, Aromatics, Polymers)" },
  { value: "Clinical Data Management (CDM)", label: "Clinical Data Management (CDM)" },
  { value: "Clinical Operations", label: "Clinical Operations" },
  { value: "Clinical Research & Development (Clinical R&D)", label: "Clinical Research & Development (Clinical R&D)" },
  { value: "Clinical Trial Management / Site Monitoring", label: "Clinical Trial Management / Site Monitoring" },
  { value: "CMC (Chemistry, Manufacturing & Controls)", label: "CMC (Chemistry, Manufacturing & Controls)" },
  { value: "Commercial / Sales / Marketing", label: "Commercial / Sales / Marketing" },
  { value: "Compliance & Audits", label: "Compliance & Audits" },
  { value: "Compliance / Legal / Regulatory Affairs", label: "Compliance / Legal / Regulatory Affairs" },
  { value: "Compounding & Blending", label: "Compounding & Blending" },
  { value: "Compressed Air Systems", label: "Compressed Air Systems" },
  { value: "Corporate Banking", label: "Corporate Banking" },
  { value: "Costing & Budgeting", label: "Costing & Budgeting" },
  { value: "Cracker Unit Operations (e.g., Steam Cracker, Naphtha Cracker)", label: "Cracker Unit Operations (e.g., Steam Cracker, Naphtha Cracker)" },
  { value: "Customer Service", label: "Customer Service" },
  { value: "Cybersecurity", label: "Cybersecurity" },
  { value: "Data Analytics", label: "Data Analytics" },
  { value: "Document Control", label: "Document Control" },
  { value: "Drilling & Completions", label: "Drilling & Completions" },
  { value: "Effluent Treatment Plant (ETP)", label: "Effluent Treatment Plant (ETP)" },
  { value: "Emergency Response", label: "Emergency Response" },
  { value: "Emissions Monitoring", label: "Emissions Monitoring" },
  { value: "Energy Management", label: "Energy Management" },
  { value: "Environmental / Sustainability", label: "Environmental / Sustainability" },
  { value: "Environmental Compliance", label: "Environmental Compliance" },
  { value: "ERP Management", label: "ERP Management" },
  { value: "Feedstock Coordination / Feedstock Planning", label: "Feedstock Coordination / Feedstock Planning" },
  { value: "Finance & Accounting", label: "Finance & Accounting" },
  { value: "Fire & Emergency Response", label: "Fire & Emergency Response" },
  { value: "Fire & Safety", label: "Fire & Safety" },
  { value: "Flare Management / Flare Systems", label: "Flare Management / Flare Systems" },
  { value: "Formulation Development (F&D)", label: "Formulation Development (F&D)" },
  { value: "Gas Processing Plant", label: "Gas Processing Plant" },
  { value: "Grid Operations", label: "Grid Operations" },
  { value: "Health, Safety & Environment (HSE / EHS)", label: "Health, Safety & Environment (HSE / EHS)" },
  { value: "Heat Treatment", label: "Heat Treatment" },
  { value: "Human Resources (HR)", label: "Human Resources (HR)" },
  { value: "HVAC Systems", label: "HVAC Systems" },
  { value: "Hydrocarbon Accounting", label: "Hydrocarbon Accounting" },
  { value: "Industrial Automation", label: "Industrial Automation" },
  { value: "Inventory Management", label: "Inventory Management" },
  { value: "IT / OT / Digitalization", label: "IT / OT / Digitalization" },
  { value: "IT Infrastructure", label: "IT Infrastructure" },
  { value: "Kaizen / Continuous Improvement", label: "Kaizen / Continuous Improvement" },
  { value: "Laboratory Services", label: "Laboratory Services" },
  { value: "LNG Operations", label: "LNG Operations" },
  { value: "Loan Processing", label: "Loan Processing" },
  { value: "Logistics & Dispatch", label: "Logistics & Dispatch" },
  { value: "Logistics & Supply Chain", label: "Logistics & Supply Chain" },
  { value: "Maintenance & Reliabilit", label: "Maintenance & Reliabilit" },
  { value: "Maintenance & Reliability", label: "Maintenance & Reliability" },
  { value: "Manufacturing / Fabrication", label: "Manufacturing / Fabrication" },
  { value: "Marine & Offshore Operations", label: "Marine & Offshore Operations" },
  { value: "Materials Science / Polymer Lab", label: "Materials Science / Polymer Lab" },
  { value: "Mechanical, Electrical, and Instrumentation (MEI)", label: "Mechanical, Electrical, and Instrumentation (MEI)" },
  { value: "Medical Affairs / Scientific Liaison", label: "Medical Affairs / Scientific Liaison" },
  { value: "Medical Records", label: "Medical Records" },
  { value: "Medical Writing / Regulatory Writing", label: "Medical Writing / Regulatory Writing" },
  { value: "Monomer Production Units", label: "Monomer Production Units" },
  { value: "Occupational Health & Safety", label: "Occupational Health & Safety" },
  { value: "Offsites & Utilities", label: "Offsites & Utilities" },
  { value: "Oil Processing Plant", label: "Oil Processing Plant" },
  { value: "Operations / Production", label: "Operations / Production" },
  { value: "Packaging", label: "Packaging" },
  { value: "Packaging Development", label: "Packaging Development" },
  { value: "Payroll & Benefits", label: "Payroll & Benefits" },
  { value: "Petroleum Economics / Planning", label: "Petroleum Economics / Planning" },
  { value: "Pharmacovigilance / Drug Safety", label: "Pharmacovigilance / Drug Safety" },
  { value: "Pharmacy Services", label: "Pharmacy Services" },
  { value: "Pipeline Operations & Integrity", label: "Pipeline Operations & Integrity" },
  { value: "Planning & Scheduling", label: "Planning & Scheduling" },
  { value: "PLC Programming", label: "PLC Programming" },
  { value: "Polymer Operations / Polymerization Units", label: "Polymer Operations / Polymerization Units" },
  { value: "Power Generation", label: "Power Generation" },
  { value: "Process Engineering", label: "Process Engineering" },
  { value: "Process Safety / Technical Safety", label: "Process Safety / Technical Safety" },
  { value: "Processing Plants", label: "Processing Plants" },
  { value: "Procurement", label: "Procurement" },
  { value: "Procurement / Materials Management", label: "Procurement / Materials Management" },
  { value: "Product Formulation / R&D / Application Testing", label: "Product Formulation / R&D / Application Testing" },
  { value: "Production Operations", label: "Production Operations" },
  { value: "Production Planning & Control", label: "Production Planning & Control" },
  { value: "Projects / Engineering / Capital Projects", label: "Projects / Engineering / Capital Projects" },
  { value: "Quality Control / Quality Assurance", label: "Quality Control / Quality Assurance" },
  { value: "R&D / Product Development", label: "R&D / Product Development" },
  { value: "Radiology Department", label: "Radiology Department" },
  { value: "Recruitment & Training", label: "Recruitment & Training" },
  { value: "Refineries Operations", label: "Refineries Operations" },
  { value: "Refining Operations / Units (e.g., CDU, FCC, Hydrocracker)", label: "Refining Operations / Units (e.g., CDU, FCC, Hydrocracker)" },
  { value: "Regulatory Affairs", label: "Regulatory Affairs" },
  { value: "Reservoir Engineering", label: "Reservoir Engineering" },
  { value: "Resin Production Operations", label: "Resin Production Operations" },
  { value: "Retail Banking", label: "Retail Banking" },
  { value: "Risk Management", label: "Risk Management" },
  { value: "SCADA / DCS Systems", label: "SCADA / DCS Systems" },
  { value: "Sewage Treatment Plant (STP)", label: "Sewage Treatment Plant (STP)" },
  { value: "Stability Testing / ICH Compliance", label: "Stability Testing / ICH Compliance" },
  { value: "Subsurface / Geoscience", label: "Subsurface / Geoscience" },
  { value: "Supply Chain & Cold Chain Logistics", label: "Supply Chain & Cold Chain Logistics" },
  { value: "Surface Coating", label: "Surface Coating" },
  { value: "Sustainability Reporting", label: "Sustainability Reporting" },
  { value: "Technical Services", label: "Technical Services" },
  { value: "Terminal Operations / Tank Farm", label: "Terminal Operations / Tank Farm" },
  { value: "Tool Room", label: "Tool Room" },
  { value: "Transmission & Distribution", label: "Transmission & Distribution" },
  { value: "Treasury Operations", label: "Treasury Operations" },
  { value: "Turnaround (TAR) / Shutdown Management", label: "Turnaround (TAR) / Shutdown Management" },
  { value: "Utilities & Energy", label: "Utilities & Energy" },
  { value: "Vendor Management", label: "Vendor Management" },
  { value: "Warehouse Management", label: "Warehouse Management" },
  { value: "Waste Management", label: "Waste Management" },
  { value: "Water Treatment", label: "Water Treatment" },
  { value: "Welding & Fabrication", label: "Welding & Fabrication" },
  { value: "Well Services / Well Intervention", label: "Well Services / Well Intervention" }
];

// Options for Purchased Goods and Services Form

export const purchaseCategoryOptions = [
  { value: "Purchased Goods", label: "Purchased Goods" },
  { value: "Purchased Services", label: "Purchased Services" }
];

export const purchasedGoodsActivityTypes = [
  { value: "Food & Drinks", label: "Food & Drinks" },
  { value: "Raw Materials", label: "Raw Materials" },
  { value: "Chemicals", label: "Chemicals" },
  { value: "Manufactured Goods", label: "Manufactured Goods" },
  { value: "Vehicles", label: "Vehicles" },
  { value: "Fuel & Energy", label: "Fuel & Energy" },
  { value: "Textiles & Clothing", label: "Textiles & Clothing" },
  { value: "Equipment", label: "Equipment" }
];

export const purchasedServicesActivityTypes = [
  { value: "Business and Professional Services", label: "Business and Professional Services" },
  // { value: "Transport & Logistics", label: "Transport & Logistics" },
  { value: "Construction & Real Estate", label: "Construction & Real Estate" },
  { value: "Information & Technology", label: "Information & Technology" },
  { value: "Public & Education Services", label: "Public & Education Services" },
  { value: "Finance", label: "Finance" },
  { value: "Primary Industries", label: "Primary Industries" },
  { value: "Health & Social Care", label: "Health & Social Care" },
  { value: "Services & Leisure", label: "Services & Leisure" },
  { value: "Utilities & Waste", label: "Utilities & Waste" },
  { value: "Other Services", label: "Other Services" },
  { value: "Retail & Trade", label: "Retail & Trade" }
];

export const purchasedGoodsServicesTypes = {
  "Food & Drinks": [
    // { value: "Alcoholic beverages", label: "Alcoholic beverages" },
    { value: "Bakery and farinaceous products", label: "Bakery and farinaceous products" },
    { value: "Dairy products", label: "Dairy products" },
    { value: "Grain mill products, starches and starch products", label: "Grain mill products, starches and starch products" },
    { value: "Other food products", label: "Other food products" },
    { value: "Prepared animal feeds", label: "Prepared animal feeds" },
    { value: "Preserved meat and meat products", label: "Preserved meat and meat products" },
    { value: "Processed and preserved fish, crustaceans, molluscs, fruit and vegetables", label: "Processed and preserved fish, crustaceans, molluscs, fruit and vegetables" },
    { value: "Soft drinks", label: "Soft drinks" },
    { value: "Vegetable and animal oils and fats", label: "Vegetable and animal oils and fats" }
  ],
  "Raw Materials": [
    { value: "Basic iron and steel", label: "Basic iron and steel" },
    { value: "Cement, lime, plaster and articles of concrete, cement and plaster", label: "Cement, lime, plaster and articles of concrete, cement and plaster" },
    { value: "Coal and lignite", label: "Coal and lignite" },
    { value: "Coke and refined petroleum products", label: "Coke and refined petroleum products" },
    { value: "Glass, refractory, clay, other porcelain and ceramic, stone and abrasive products", label: "Glass, refractory, clay, other porcelain and ceramic, stone and abrasive products" },
    { value: "Other basic metals and casting", label: "Other basic metals and casting" },
    { value: "Other mining and quarrying products", label: "Other mining and quarrying products" },
    { value: "Petrochemicals", label: "Petrochemicals" },
    { value: "Wood and of products of wood and cork, except furniture; articles of straw and plaiting materials", label: "Wood and of products of wood and cork, except furniture; articles of straw and plaiting materials" }
  ],
  "Chemicals": [
    { value: "Basic pharmaceutical products and pharmaceutical preparations", label: "Basic pharmaceutical products and pharmaceutical preparations" },
    { value: "Dyestuffs, agro-chemicals", label: "Dyestuffs, agro-chemicals" },
    { value: "Industrial gases, inorganics and fertilisers (all inorganic chemicals)", label: "Industrial gases, inorganics and fertilisers (all inorganic chemicals)" },
    { value: "Other chemical products", label: "Other chemical products" },
    { value: "Paints, varnishes and similar coatings, printing ink and mastics", label: "Paints, varnishes and similar coatings, printing ink and mastics" },
    { value: "Soap and detergents, cleaning and polishing preparations, perfumes and toilet preparations", label: "Soap and detergents, cleaning and polishing preparations, perfumes and toilet preparations" },
    { value: "Tobacco products", label: "Tobacco products" }
  ],
  "Manufactured Goods": [
    { value: "Fabricated metal products, excl. machinery and equipment and weapons & ammunition", label: "Fabricated metal products, excl. machinery and equipment and weapons & ammunition" },
    { value: "Furniture", label: "Furniture" },
    { value: "Other manufactured goods", label: "Other manufactured goods" },
    { value: "Paper and paper products", label: "Paper and paper products" },
    { value: "Rubber and plastic products", label: "Rubber and plastic products" },
    { value: "Weapons and ammunition", label: "Weapons and ammunition" }
  ],
  "Vehicles": [
    { value: "Air and spacecraft and related machinery", label: "Air and spacecraft and related machinery" },
    { value: "Motor vehicles, trailers and semi-trailers", label: "Motor vehicles, trailers and semi-trailers" },
    { value: "Other transport equipment - 30.2/4/9", label: "Other transport equipment - 30.2/4/9" },
    { value: "Ships and boats", label: "Ships and boats" }
  ],
  "Fuel & Energy": [
    { value: "Crude petroleum and natural gas", label: "Crude petroleum and natural gas" },
    { value: "Electricity, transmission and distribution", label: "Electricity, transmission and distribution" },
    { value: "Gas; distribution of gaseous fuels through mains; steam and air conditioning supply", label: "Gas; distribution of gaseous fuels through mains; steam and air conditioning supply" }
  ],
  "Textiles & Clothing": [
    { value: "Leather and related products", label: "Leather and related products" },
    { value: "Other Textiles", label: "Other Textiles" },
    { value: "Wearing apparel", label: "Wearing apparel" }
  ],
  "Equipment": [
    { value: "Computer, electronic and optical products", label: "Computer, electronic and optical products" },
    { value: "Electrical equipment", label: "Electrical equipment" },
    { value: "Machinery and equipment n.e.c.", label: "Machinery and equipment n.e.c." }
  ],
  "Business and Professional Services": [
    { value: "Office administrative, office support and other business support services", label: "Office administrative, office support and other business support services" },
    { value: "Architectural and engineering services; technical testing and analysis services", label: "Architectural and engineering services; technical testing and analysis services" },
    { value: "Other professional, scientific and technical services", label: "Other professional, scientific and technical services" },
    { value: "Scientific research and development services", label: "Scientific research and development services" },
    { value: "Services to buildings and landscape", label: "Services to buildings and landscape" },
    { value: "Services furnished by membership organisations", label: "Services furnished by membership organisations" },
    { value: "Advertising and market research services", label: "Advertising and market research services" },
    { value: "Security and investigation services", label: "Security and investigation services" },
    { value: "Legal services", label: "Legal services" },
    { value: "Services of head offices; management consulting services", label: "Services of head offices; management consulting services" },
    { value: "Accounting, bookkeeping and auditing services; tax consulting services", label: "Accounting, bookkeeping and auditing services; tax consulting services" },
    { value: "Employment services", label: "Employment services" }
  ],
  // "Transport & Logistics": [
  //   { value: "Air transport services", label: "Air transport services" },
  //   { value: "Warehousing and support services for transportation", label: "Warehousing and support services for transportation" },
  //   { value: "Land transport services and transport services via pipelines, excluding rail transport", label: "Land transport services and transport services via pipelines, excluding rail transport" },
  //   { value: "Postal and courier services", label: "Postal and courier services" },
  //   { value: "Water transport services", label: "Water transport services" },
  //   { value: "Rail transport services", label: "Rail transport services" }
  // ],
  "Construction & Real Estate": [
    { value: "Repair, Maintenance, and Installation Services (Industrial & Technical Equipment) (NACE 33.11–14, 33.17, 33.19, 33.20)", label: "Repair, Maintenance, and Installation Services (Industrial & Technical Equipment) (NACE 33.11–14, 33.17, 33.19, 33.20)" },
    { value: "Repair services of computers and personal and household goods", label: "Repair services of computers and personal and household goods" },
    { value: "Constructions and construction works for civil engineering", label: "Constructions and construction works for civil engineering" },
    { value: "Specialised construction works", label: "Specialised construction works" },
    { value: "Buildings and building construction works", label: "Buildings and building construction works" },
    { value: "Real estate services on a fee or contract basis", label: "Real estate services on a fee or contract basis" },
    { value: "Owner-Occupiers' Housing Services", label: "Owner-Occupiers' Housing Services" },
    { value: "Real estate services, excluding on a fee or contract basis and imputed rent", label: "Real estate services, excluding on a fee or contract basis and imputed rent" },
    { value: "Repair and maintenance of ships and boats", label: "Repair and maintenance of ships and boats" },
    { value: "Repair and maintenance of aircraft and spacecraft", label: "Repair and maintenance of aircraft and spacecraft" }
  ],
  "Information & Technology": [
    { value: "Publishing services", label: "Publishing services" },
    { value: "Information services", label: "Information services" },
    { value: "Printing and recording services", label: "Printing and recording services" },
    { value: "Programming and broadcasting services", label: "Programming and broadcasting services" },
    { value: "Computer programming, consultancy and related services", label: "Computer programming, consultancy and related services" },
    { value: "Telecommunications services", label: "Telecommunications services" }
  ],

  "Public & Education Services": [
    { value: "Creative, arts and entertainment services", label: "Creative, arts and entertainment services" },
    { value: "Public administration and defence services; compulsory social security services", label: "Public administration and defence services; compulsory social security services" },
    { value: "Libraries, archives, museums and other cultural services", label: "Libraries, archives, museums and other cultural services" },
    { value: "Motion picture, video and TV programme production services, sound recording & music publishing", label: "Motion picture, video and TV programme production services, sound recording & music publishing" },
    { value: "Education services", label: "Education services" }
  ],
  "Finance": [
    { value: "Insurance, reinsurance and pension funding services, except compulsory social security", label: "Insurance, reinsurance and pension funding services, except compulsory social security" },
    { value: "Financial services, except insurance and pension funding", label: "Financial services, except insurance and pension funding" },
    { value: "Services auxiliary to financial services and insurance services", label: "Services auxiliary to financial services and insurance services" }

  ],
  "Primary Industries": [
    { value: "Products of agriculture, hunting and related services", label: "Products of agriculture, hunting and related services" },
    { value: "Mining support services", label: "Mining support services" },
    { value: "Fish and other fishing products; aquaculture products; support services to fishing", label: "Fish and other fishing products; aquaculture products; support services to fishing" },
    { value: "Products of forestry, logging and related services", label: "Products of forestry, logging and related services" }
  ],
  "Health & Social Care": [
    { value: "Veterinary services", label: "Veterinary services" },
    { value: "Social work services without accommodation", label: "Social work services without accommodation" },
    { value: "Human health services", label: "Human health services" },
    { value: "Residential care services", label: "Residential care services" }
  ],
  "Services & Leisure": [
    { value: "Travel agency, tour operator and other reservation services and related services", label: "Travel agency, tour operator and other reservation services and related services" },
    // { value: "Gambling and betting services", label: "Gambling and betting services" },
    { value: "Food and beverage serving services", label: "Food and beverage serving services" },
    { value: "Sports services and amusement and recreation services", label: "Sports services and amusement and recreation services" },
    { value: "Accommodation services", label: "Accommodation services" }
  ],
  "Utilities & Waste": [
   // { value: "Waste collection, treatment and disposal services; materials recovery services", label: "Waste collection, treatment and disposal services; materials recovery services" },
  // { value: "Sewerage services; sewage sludge", label: "Sewerage services; sewage sludge" },
    { value: "Natural water and supply services", label: "Natural water and supply services" },
    { value: "Remediation services", label: "Remediation services" }
  ],
  "Other Services": [
    { value: "Services of households as employers of domestic personnel", label: "Services of households as employers of domestic personnel" },
    { value: "Other personal services", label: "Other personal services" },
    { value: "Rental and leasing services", label: "Rental and leasing services" }
  ],
  "Retail & Trade": [
    { value: "Wholesale trade services, except of motor vehicles and motorcycles", label: "Wholesale trade services, except of motor vehicles and motorcycles" },
    { value: "Retail trade services, except of motor vehicles and motorcycles", label: "Retail trade services, except of motor vehicles and motorcycles" },
    { value: "Wholesale and retail trade and repair services of motor vehicles and motorcycles", label: "Wholesale and retail trade and repair services of motor vehicles and motorcycles" }
  ]
};

export const currencyUnitOptions = [
  { value: "USD", label: "$" }
];

// Fuel & Energy data

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
    { value: "Biodiesel ME", label: "Biodiesel ME" },//
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
    { value: "Grass / straw", label: "Grass / straw" }
  ]
};

export const fuelConsumptionUnits = [
  { value: "Tonnes", label: "Tonnes" },
  { value: "kg", label: "kg" },
  { value: "lb", label: "lb" },
  { value: "kWh", label: "kWh" },
  { value: "MWh", label: "MWh" },
  { value: "GWh", label: "GWh" },
  { value: "Joules", label: "Joules" },
  { value: "Gj", label: "Gj" },
  { value: "Mj", label: "Mj" },
  { value: "Tj", label: "Tj" },
  { value: "Btu", label: "Btu" },
  { value: "MMBtu", label: "MMBtu" },
  { value: "Litres", label: "Litres" },
  { value: "Gallons", label: "Gallons" },
  { value: "m3", label: "m3" },
  { value: "ft3", label: "ft3" },
  { value: "in3", label: "in3" },
  { value: "SCF", label: "SCF" }
];

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


export const units = [
  { value: "kWh", label: "kWh" },
  { value: "MWh", label: "MWh" }
]

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
  "Liquid Fuel": {
    "Aviation spirit": 3.10,
    "Aviation turbine fuel": 3.16,
    "Burning oil": 2.52,
    "Diesel (average biofuel blend)": 2.68,
    "Diesel (100% mineral diesel)": 3.18,
    "Fuel oil": 3.26,
    "Gas oil": 2.90,
    "Lubricants": 2.90,
    "Naphtha": 2.41,
    "Petrol (average biofuel blend)": 2.31,
    "Petrol (100% mineral petrol)": 2.37,
    "Processed fuel oils - residual oil": 3.50,
    "Processed fuel oils - distillate oil": 3.05,
    "Refinery miscellaneous": 3.00,
    "Waste oils": 2.80,
    "Marine gas oil": 3.15,
    "Marine fuel oil": 3.50
  },
  "Bio Liquid Fuel": {
    "Bioethanol": 0,
    "Biodiesel ME": 0,
    "Biodiesel ME (from used cooking oil)": 0,
    "Biodiesel ME (from tallow)": 0,
    "Biodiesel HVO": 0,
    "Biopropane": 0,
    "Development diesel": 0,
    "Development petrol": 0,
    "Off road biodiesel": 0,
    "Biomethane (liquified)": 0,
    "Methanol (bio)": 0,
    "Avtur (renewable)": 0
  },
  "Solid Fuel": {
    "Coal (industrial)": 2.42,
    "Coal (electricity generation)": 2.42,
    "Coal (domestic)": 2.42,
    "Coking coal": 2.20,
    "Petroleum coke": 3.10,
    "Coal (electricity generation - home produced coal only)": 2.42
  },
  "Biomass Fuel": {
    "Wood logs": 0,
    "Wood chips": 0,
    "Wood pellets": 0,
    "Grass / straw": 0
  },
  // Add Electricity factors at root
  "Electricity": {
    "kWh": 0.82,
    "MWh": 820,
    "GWh": 820000
  }
};

// export const unitConversion = {
//   // Mass
//   "kg": (v) => v,
//   "Tonnes": (v) => v * 1000,
//   "lb": (v) => v * 0.453592,
//   // Volume (Liquids / Gases)
//   "Litres": (v) => v,
//   "Gallons": (v) => v * 3.78541,
//   "m3": (v) => v,
//   "ft3": (v) => v * 0.0283168,
//   "in3": (v) => v * 0.000016387,
//   "SCF": (v) => v * 0.0283168,
//   // Energy
//   "kWh": (v) => v,
//   "MWh": (v) => v * 1000,
//   "GWh": (v) => v * 1_000_000,
//   "Joules": (v) => v / 3_600_000,
//   "Gj": (v) => v * 277.778,
//   "Mj": (v) => v / 3.6,
//   "Tj": (v) => v * 277_777.778,
//   "Btu": (v) => v * 0.000293071,
//   "MMBtu": (v) => v * 293.071
// };

export const unitConversion = {
  // Mass conversions → Tonnes
  "Tonnes": { factor: 1, to: "Tonnes" },
  "kg": { factor: 0.001, to: "Tonnes" },
  "lb": { factor: 0.000446429, to: "Tonnes" },
  "lb (pounds)": { factor: 0.000446429, to: "Tonnes" },
  

  // Energy conversions → kwh
  "kWh": { factor: 1, to: "kWh" },
  "Joules": { factor: 0.000000278, to: "kWh" },
  "Mj": { factor: 0.2778, to: "kWh" },
  "Gj": { factor: 277.78, to: "kWh" },
  "Tj": { factor: 277777.78, to: "kWh" },
  "MWh": { factor: 1000, to: "kWh" },
  "GWh": { factor: 1000000, to: "kWh" },
  "Btu": { factor: 0.00029307, to: "kWh" },
  "MMBtu": { factor: 293.07, to: "kWh" },

  // Volume conversions
  "Litres": { factor: 1, to: "Litres" },
  "Gallons": { factor: 4.54609, to: "Litres" },
  "ft3": { factor: 0.0283168, to: "m3" },
  "SCF": { factor: 0.0283168, to: "m3" },
  "in3": { factor: 1.63871e-5, to: "m3" },
};
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
  
export const unitsEmissionFactors = {
  //GASEOUS FUELS
  "Butane": {
    "tonnes": 344.30947,
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