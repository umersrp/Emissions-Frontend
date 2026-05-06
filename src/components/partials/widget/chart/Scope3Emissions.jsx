import React, { useState, useEffect } from "react";
import RevenueBarChart from "@/components/partials/widget/chart/revenue-bar-chart";
import { Tooltip } from "@mui/material";
import Button from "@/components/ui/Button";

/* ------------------ Colors ------------------ */
const categoryColors = {
  "Purchased Goods & Services": "bg-blue-100 text-blue-800",
  "Capital Goods": "bg-indigo-100 text-indigo-800",
  "Fuel & Energy": "bg-blue-100 text-pink-800",
  "Waste Generated": "bg-green-100 text-green-800",
  "Business Travel": "bg-purple-100 text-purple-800",
  "Employee Commuting": "bg-orange-100 text-orange-800",
  "Upstream Transportations": "bg-red-100 text-red-800",
  "Downstream Transportations": "bg-yellow-100 text-yellow-800",
  "Commute Records": "bg-gray-100 text-gray-800",
};

/* ------------------ Helper ------------------ */
const normalizeToArray = (data) => {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
};

/* ------------------ Get total emissions from data ------------------ */
/* ------------------ Get total emissions from data ------------------ */
const getTotalEmissions = (dataArray) => {
  if (!dataArray || dataArray.length === 0) return 0;

  // Check if data has totals property
  const firstItem = dataArray[0];

  if (firstItem.totals && Array.isArray(firstItem.totals)) {
    // Sum up all totals
    return firstItem.totals.reduce((sum, total) => {
      return sum + (total.totalEmissionTCo2e || 0);
    }, 0);
  } else if (firstItem.totalEmissionTCo2e) {
    // Direct total emission
    return dataArray.reduce((sum, item) => {
      return sum + (item.totalEmissionTCo2e || 0);
    }, 0);
  } else if (firstItem.list && Array.isArray(firstItem.list)) {
    // Calculate from list items - sum up calculatedEmissionTCo2e from each item in the list
    const allItems = dataArray.flatMap(item => item.list || []);
    return allItems.reduce((sum, item) => {
      return sum + (item.calculatedEmissionTCo2e || item.totalEmissionTCo2e || 0);
    }, 0);
  } else if (firstItem.calculatedEmissionTCo2e !== undefined) {
    // Direct items with calculatedEmissionTCo2e
    return dataArray.reduce((sum, item) => {
      return sum + (item.calculatedEmissionTCo2e || 0);
    }, 0);
  }

  // Add this for debugging
  console.log('getTotalEmissions - unexpected structure:', dataArray);
  return 0;
};

/* ------------------ Component ------------------ */
// const Scope3EmissionsSection = ({ dashboardData, loading, resetTrigger = 0,  // Add default value here
//   onRegisterReset }) => {
//   if (!dashboardData?.scope3) return null;

//   const s3 = dashboardData.scope3;

//   /* ------------------ STATE ------------------ */
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [rowLimit, setRowLimit] = useState(3);

//   // Normalize all categories
//   const purchasedGoodsAndServices = normalizeToArray(s3.purchasedGoodsAndServices);
//   const capitalGoods = normalizeToArray(s3.CapitalGoods);
//   const fuelAndEnergyList = normalizeToArray(s3.FuelandEnergylist);
//   const wasteGenerated = normalizeToArray(s3.wasteGeneratedInOperations);
//   const businessTravel = normalizeToArray(s3.businessTravel);
// const employeeCommuting = normalizeToArray(s3.commuteRecordList?.list || []); 
//  const upstreamTransport = normalizeToArray(s3.UpstreamTransportations);
//   const downstreamTransport = normalizeToArray(s3.DownstreamTransportations);
//   const fuelAndEnergy = normalizeToArray(s3.FuelAndEnergys);
//   const upstreamList = normalizeToArray(s3.Upstreamlist);
//   const downstreamList = normalizeToArray(s3.Downstreamlist);

//   // Handle Capital Goods Data separately
//   const capitalGoodsData = s3.CapitalGoodsData || [];
//   const capitalGoodsList = capitalGoodsData.length > 0 ? capitalGoodsData[0]?.list || [] : [];

//   // Handle Business Travel Data separately
//   const businessTravelData = s3.BusinessTravelData || [];
//   const businessTravelList = businessTravelData.length > 0 ? businessTravelData[0]?.list || [] : [];

//   // Bar chart - Calculate totals for each category using the helper function
//   const barChartData = [
//     {
//       name: "Purchased Goods & Services",
//       value: getTotalEmissions(purchasedGoodsAndServices)
//     },
//     {
//       name: "Capital Goods",
//       value: getTotalEmissions(capitalGoods)
//     },
//     {
//       name: "Fuel & Energy Related Activities",
//       value: getTotalEmissions(fuelAndEnergy)
//     },
//     {
//       name: "Waste Generated",
//       value: getTotalEmissions(wasteGenerated)
//     },
//     {
//       name: "Business Travel",
//       value: getTotalEmissions(businessTravel)
//     },
//     {
//       name: "Employee Commuting",
//       value: getTotalEmissions(employeeCommuting)
//     },
//     {
//       name: "Upstream Transportations",
//       value: getTotalEmissions(upstreamTransport)
//     },
//     {
//       name: "Downstream Transportations",
//       value: getTotalEmissions(downstreamTransport)
//     },

//   ];

//   // Debug: Log the bar chart data to see what's happening
//   console.log('Bar Chart Data:', barChartData);
//   console.log('Purchased Goods Data:', purchasedGoodsAndServices);
//   console.log('Waste Generated Data:', wasteGenerated);
//   console.log('Fuel & Energy Data:', fuelAndEnergy);


//   /* ------------------ PROCESS PURCHASED GOODS DATA ------------------ */
//   const processPurchasedGoodsData = () => {
//     if (!purchasedGoodsAndServices || purchasedGoodsAndServices.length === 0) return [];

//     // First, check if we need to flatten the data or if it's already flat
//     const itemsToProcess = purchasedGoodsAndServices.flatMap(item =>
//       item.list && Array.isArray(item.list) ? item.list : [item]
//     );

//     return itemsToProcess
//       .map(item => ({
//         _id: item.purchasedGoodsServicesType || item.purchaseCategory || "Uncategorized",
//         amount: item.amountSpent,
//         unit: item.unit,
//         databaseId: item._id,
//         totalEmissionTCo2e: item.calculatedEmissionTCo2e || 0,
//         originalItem: item
//       }))
//       .sort((a, b) => b.totalEmissionTCo2e - a.totalEmissionTCo2e);
//   };

//   const purchasedGoodsTopCategories = processPurchasedGoodsData();

//   /* ------------------ PROCESS CAPITAL GOODS DATA ------------------ */
//   const processCapitalGoodsData = () => {
//     if (!capitalGoodsList || capitalGoodsList.length === 0) return [];

//     return capitalGoodsList.map(item => ({
//       _id: item.purchasedGoodsServicesType || "Uncategorized",
//       amount: item.amountSpent,
//        unit: item.unit,
//       databaseId: item._id,
//       totalEmissionTCo2e: item.calculatedEmissionTCo2e || 0,
//       originalItem: item
//     }))
//       .sort((a, b) => b.totalEmissionTCo2e - a.totalEmissionTCo2e);
//   };
//   const capitalGoodsTopCategories = processCapitalGoodsData();

//   /* ------------------ PROCESS FUEL & ENERGY DATA ------------------ */
//   const processFuelEnergyData = () => {
//     if (!fuelAndEnergyList || fuelAndEnergyList.length === 0) return [];

//     // Extract individual items from list property if available
//     const allItems = fuelAndEnergyList.flatMap(item =>
//       item.list && Array.isArray(item.list) ? item.list : [item]
//     );

//     // Map individual items
//     return allItems
//       .filter(item => item && typeof item === 'object')
//       .map(item => ({
//         _id: item.fuelType || item.activityType || "Uncategorized",
//         databaseId: item._id,
//         totalEmissionTCo2e: item.calculatedEmissionTCo2e || 0,
//         originalItem: item
//       }))
//       .sort((a, b) => b.totalEmissionTCo2e - a.totalEmissionTCo2e);
//   };

//   const fuelEnergyTopCategories = processFuelEnergyData();

//   /* ------------------ PROCESS WASTE GENERATED DATA ------------------ */
//   const processWasteGeneratedData = () => {
//     if (!wasteGenerated || wasteGenerated.length === 0) return [];

//     // First, extract all individual items (flattening lists if they exist)
//     const allItems = wasteGenerated.flatMap(item =>
//       item.list && Array.isArray(item.list) ? item.list : [item]
//     );

//     // Map individual items
//     return allItems
//       .filter(item => item && typeof item === 'object')
//       .map(item => ({
//         _id: item.wasteType || item.activityType || "Uncategorized",
//         databaseId: item._id,
//         amount: item.totalWasteQty,
//         unit: item.unit,
//         totalEmissionTCo2e: item.calculatedEmissionTCo2e || 0,
//         originalItem: item
//       }))
//       .sort((a, b) => b.totalEmissionTCo2e - a.totalEmissionTCo2e);
//   };

//   const wasteGeneratedTopCategories = processWasteGeneratedData();
//   /* ------------------ PROCESS BUSINESS TRAVEL DATA ------------------ */
//   const processBusinessTravelData = () => {
//     if (!businessTravelList || businessTravelList.length === 0) return [];

//     return businessTravelList.map(item => ({
//       _id: item.stakeholder || "Other Travel",
//       databaseId: item._id,
//       totalEmissionTCo2e: item.calculatedEmissionTCo2e || 0,
//       originalItem: item
//     }))
//       .sort((a, b) => b.totalEmissionTCo2e - a.totalEmissionTCo2e);
//   };
//   const businessTravelTopCategories = processBusinessTravelData();

//   /* ------------------ PROCESS EMPLOYEE COMMUTING DATA ------------------ */
//   const processEmployeeCommutingData = () => {
//     if (!employeeCommuting || employeeCommuting.length === 0) return [];

//     // Flatten any nested `list` arrays and map fields as required:
//     //  - first row (display name): `submittedByEmail`
//     //  - second row: `calculatedEmissionTCo2e` (or `totalEmissionTCo2e`)
//     //  - third row: sum of distances (km)
//     const allItems = employeeCommuting.flatMap(item =>
//       item.list && Array.isArray(item.list) ? item.list : [item]
//     );

//     return allItems
//       .filter(item => item && typeof item === 'object')
//       .map(item => {
//         const distanceSum = (Number(item.motorbikeDistance) || 0)
//           + (Number(item.motorbikeDistanceCarpool) || 0)
//           + (Number(item.taxiDistance) || 0)
//           + (Number(item.taxiDistanceCarpool) || 0)
//           + (Number(item.busDistance) || 0)
//           + (Number(item.trainDistance) || 0)
//           + (Number(item.carDistance) || 0)
//           + (Number(item.carDistanceCarpool) || 0);

//         return {
//           // Show submitter email first (falls back to commuteType/stakeholder)
//           _id: item.submittedUsername ||  "Unknown Commuter",
//           databaseId: item._id,
//           totalEmissionTCo2e: item.calculatedEmissionTCo2e || item.totalEmissionTCo2e || 0,
//           // amount will show the summed distances with unit 'km' when available
//           amount: distanceSum > 0 ? distanceSum : (item.totalWasteQty || item.amount || "N/A"),
//           unit: distanceSum > 0 ? 'km' : (item.unit || ''),
//           originalItem: item
//         };
//       })
//       .sort((a, b) => b.totalEmissionTCo2e - a.totalEmissionTCo2e);
//   };
//   const employeeCommutingTopCategories = processEmployeeCommutingData();

//   /* ------------------ PROCESS UPSTREAM TRANSPORT DATA ------------------ */
//   const processUpstreamTransportData = () => {
//     if (!upstreamList || upstreamList.length === 0) return [];

//     // Extract individual items from list property if available
//     const allItems = upstreamList.flatMap(item =>
//       item.list && Array.isArray(item.list) ? item.list : [item]
//     );

//     // Map individual items
//     return allItems
//       .filter(item => item && typeof item === 'object')
//       .map(item => ({
//         _id: item.transportType || item.activityType || "Uncategorized",
//         databaseId: item._id,
//         totalEmissionTCo2e: item.calculatedEmissionTCo2e || 0,
//         originalItem: item
//       }))
//       .sort((a, b) => b.totalEmissionTCo2e - a.totalEmissionTCo2e);
//   };

//   const upstreamTransportTopCategories = processUpstreamTransportData();

//   /* ------------------ PROCESS DOWNSTREAM TRANSPORT DATA ------------------ */
//   const processDownstreamTransportData = () => {
//     if (!downstreamList || downstreamList.length === 0) return [];

//     // Extract individual items from list property if available
//     const allItems = downstreamList.flatMap(item =>
//       item.list && Array.isArray(item.list) ? item.list : [item]
//     );

//     // Map individual items
//     return allItems
//       .filter(item => item && typeof item === 'object')
//       .map(item => ({
//         _id: item.transportType || item.soldProductActivityType || "Uncategorized",
//         databaseId: item._id,
//         totalEmissionTCo2e: item.calculatedEmissionTCo2e || 0,
//         originalItem: item
//       }))
//       .sort((a, b) => b.totalEmissionTCo2e - a.totalEmissionTCo2e);
//   };

//   const downstreamTransportTopCategories = processDownstreamTransportData();


//   /* ------------------ TABLE DATA ------------------ */
//   const topScope3Categories = {
//     "Purchased Goods & Services": purchasedGoodsTopCategories,
//     "Capital Goods": capitalGoodsTopCategories,
//     "Fuel & Energy Related Activities": fuelEnergyTopCategories,
//     "Waste Generated": wasteGeneratedTopCategories,
//     "Business Travel": businessTravelTopCategories,
//     "Employee Commuting": employeeCommutingTopCategories,
//     "Upstream Transportations": upstreamTransportTopCategories,
//     "Downstream Transportations": downstreamTransportTopCategories,
//   };

//   /* ------------------ BAR CLICK HANDLER ------------------ */
//   const handleBarClick = (data) => {
//     if (!data?.name) return;
//     setSelectedCategory(data.name);
//     setRowLimit(10);
//   };
//   /* -------------------- EFFECT TO RESET ON PARENT TRIGGER -------------------- */
//   useEffect(() => {
//     if (resetTrigger > 0) {
//       resetView();
//     }
//   }, [resetTrigger]);

//   /* ------------------ RESET VIEW ------------------ */
//   const resetView = () => {
//     setSelectedCategory(null);
//     setRowLimit(3);
//   };

//   return (
//     <div className="flex flex-col md:flex-row gap-8">
//       {/* ==================== BAR CHART ==================== */}
//       <div className="flex-1 w-[600px] p-6 bg-white rounded-xl shadow-lg border">
//         <h3 className="font-semibold mb-3 text-xl text-gray-900">
//           Scope 3 Emissions by Category
//         </h3>
//         <p className="mb-6 text-gray-600">
//           Indirect emissions from the value chain.
//         </p>

//         <RevenueBarChart
//           chartData={barChartData}
//           loading={loading}
//           onBarClick={handleBarClick}
//           selectedCategory={selectedCategory}
//         />
//       </div>

//       {/* ==================== TABLE ==================== */}
//       <div className="flex-1 min-w-[320px] p-6 bg-white rounded-xl shadow-lg border overflow-auto max-h-[620px] scrollbar-hide">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="font-semibold text-xl text-gray-900">
//             Top Categories
//           </h3>

//           {selectedCategory && (
//             <Button
//               onClick={resetView}
//               className="btn font-normal btn-sm bg-gradient-to-r from-[#2d6d74] to-[#094382] text-white border-0 hover:opacity-90"
//             >
//               Reset view
//             </Button>
//           )}
//         </div>

//         <div className="space-y-4">
//           {Object.entries(topScope3Categories)
//             .filter(([category]) => (selectedCategory ? category === selectedCategory : true))
//             .map(([category, items]) => {
//               // Get top items based on row limit
//               const visibleItems = items.slice(0, rowLimit);

//               if (!visibleItems.length) {
//                 return (
//                   <div
//                     key={category}
//                     className={`border border-gray-300 rounded p-2 font-semibold ${categoryColors[category]}`}
//                   >
//                     {category} - <span className="italic text-gray-400">No data available</span>
//                   </div>
//                 );
//               }

//               return (
//                 <div key={category} className="border border-gray-300 rounded p-2">
//                   {/* Category Label */}
//                   <div className={`font-semibold mb-2 p-1 rounded-md ${categoryColors[category]}`}>
//                     {category}
//                   </div>

//                   {/* Grid for items */}
//                   <div
//                     className={`grid gap-2 w-full ${selectedCategory
//                       ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
//                       : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
//                       }`}
//                   >
//                     {visibleItems.map((item, idx) => (
//                       <div key={item.databaseId || idx} className="flex-1 min-w-0 border border-gray-300 rounded overflow-hidden">
//                         {/* Item Name */}
//                         <div className="p-2 font-medium border-b text-center truncate bg-gray-50">
//                           {item._id || "N/A"}
//                         </div>

//                         {/* Emission Value */}
//                         <div className="p-2 text-red-600 font-semibold border-b text-center truncate">
//                           {Number(item.totalEmissionTCo2e || 0).toLocaleString(undefined, {
//                             minimumFractionDigits: 2,
//                             maximumFractionDigits: 5,
//                           })} tCO₂e
//                         </div>

//                         <div className="p-2 font-medium border-b text-center truncate bg-gray-50">
//                           {item.amount || "N/A"}{" "}{item.unit === 'USD' ? '$' : item.unit || ''}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               );
//             })}
//         </div>
//       </div>
//     </div>
//   );
// };

import buildingIcon from "@/assets/images/icon/building.png";
import bulletTrainIcon from "@/assets/images/icon/bullet-train.png";
import cargoShipIcon from "@/assets/images/icon/cargo-ship.png";
import factoryIcon from "@/assets/images/icon/factory.png";
import twoTruckIcon from "@/assets/images/icon/tow-truck.png";
import charcoalIcon from "@/assets/images/icon/charcoal.png";
import garbageIcon from "@/assets/images/icon/garbage.png";
import planeIcon from "@/assets/images/icon/plane.png";
import lightIcon from "@/assets/images/icon/light.png";
import recycleBinIcon from "@/assets/images/icon/recycle-bin.png";


const Scope3EmissionsSection = ({ dashboardData, loading, resetTrigger = 0, onRegisterReset }) => {
  if (!dashboardData?.scope3) return null;

  const s3 = dashboardData.scope3;

  /* ------------------ STATE ------------------ */
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [rowLimit, setRowLimit] = useState(3);

  
  // Replace the categoryMetadata with PNG icons
  const categoryMetadata = {
    "Purchased Goods & Services": {
      icon: factoryIcon,
      iconType: "png",
      color: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      badge: "bg-blue-100 text-blue-800"
    },
    "Capital Goods": {
      icon: twoTruckIcon,
      iconType: "png",
      color: "from-indigo-500 to-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      text: "text-indigo-700",
      badge: "bg-indigo-100 text-indigo-800"
    },
    "Fuel & Energy Related Activities": {
      icon: charcoalIcon,
      iconType: "png",
      color: "from-orange-500 to-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-700",
      badge: "bg-orange-100 text-orange-800"
    },
    "Waste Generated": {
      icon: garbageIcon,
      iconType: "png",
      color: "from-green-500 to-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      badge: "bg-green-100 text-green-800"
    },
    "Business Travel": {
      icon: planeIcon,
      iconType: "png",
      color: "from-purple-500 to-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-700",
      badge: "bg-purple-100 text-purple-800"
    },
    "Employee Commuting": {
      icon: bulletTrainIcon,
      iconType: "png",
      color: "from-teal-500 to-teal-600",
      bg: "bg-teal-50",
      border: "border-teal-200",
      text: "text-teal-700",
      badge: "bg-teal-100 text-teal-800"
    },
    "Upstream Transportations": {
      icon: cargoShipIcon,
      iconType: "png",
      color: "from-cyan-500 to-cyan-600",
      bg: "bg-cyan-50",
      border: "border-cyan-200",
      text: "text-cyan-700",
      badge: "bg-cyan-100 text-cyan-800"
    },
    "Downstream Transportations": {
      icon: cargoShipIcon,
      iconType: "png",
      color: "from-rose-500 to-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-200",
      text: "text-rose-700",
      badge: "bg-rose-100 text-rose-800"
    }
  };

  // Normalize all categories
  const purchasedGoodsAndServices = normalizeToArray(s3.purchasedGoodsAndServices);
  const capitalGoods = normalizeToArray(s3.CapitalGoods);
  const fuelAndEnergyList = normalizeToArray(s3.FuelandEnergylist);
  const wasteGenerated = normalizeToArray(s3.wasteGeneratedInOperations);
  const businessTravel = normalizeToArray(s3.businessTravel);
  const employeeCommuting = normalizeToArray(s3.commuteRecordList?.list || []);
  const upstreamTransport = normalizeToArray(s3.UpstreamTransportations);
  const downstreamTransport = normalizeToArray(s3.DownstreamTransportations);
  const fuelAndEnergy = normalizeToArray(s3.FuelAndEnergys);
  const upstreamList = normalizeToArray(s3.Upstreamlist);
  const downstreamList = normalizeToArray(s3.Downstreamlist);

  // Handle Capital Goods Data separately
  const capitalGoodsData = s3.CapitalGoodsData || [];
  const capitalGoodsList = capitalGoodsData.length > 0 ? capitalGoodsData[0]?.list || [] : [];

  // Handle Business Travel Data separately
  const businessTravelData = s3.BusinessTravelData || [];
  const businessTravelList = businessTravelData.length > 0 ? businessTravelData[0]?.list || [] : [];

  // Bar chart - Calculate totals for each category
  const barChartData = [
    { name: "Purchased Goods & Services", value: getTotalEmissions(purchasedGoodsAndServices) },
    { name: "Capital Goods", value: getTotalEmissions(capitalGoods) },
    { name: "Fuel & Energy Related Activities", value: getTotalEmissions(fuelAndEnergy) },
    { name: "Waste Generated", value: getTotalEmissions(wasteGenerated) },
    { name: "Business Travel", value: getTotalEmissions(businessTravel) },
    { name: "Employee Commuting", value: getTotalEmissions(employeeCommuting) },
    { name: "Upstream Transportations", value: getTotalEmissions(upstreamTransport) },
    { name: "Downstream Transportations", value: getTotalEmissions(downstreamTransport) },
  ].filter(item => item.value > 0); // Only show categories with data

  const totalScope3 = barChartData.reduce((sum, item) => sum + item.value, 0);

  /* ------------------ PROCESS PURCHASED GOODS DATA ------------------ */
  const processPurchasedGoodsData = () => {
    if (!purchasedGoodsAndServices || purchasedGoodsAndServices.length === 0) return [];
    const itemsToProcess = purchasedGoodsAndServices.flatMap(item =>
      item.list && Array.isArray(item.list) ? item.list : [item]
    );
    return itemsToProcess
      .map(item => ({
        _id: item.purchasedGoodsServicesType || item.purchaseCategory || "Uncategorized",
        amount: item.amountSpent,
        unit: item.unit,
        databaseId: item._id,
        totalEmissionTCo2e: item.calculatedEmissionTCo2e || 0,
        originalItem: item
      }))
      .sort((a, b) => b.totalEmissionTCo2e - a.totalEmissionTCo2e);
  };

  /* ------------------ PROCESS CAPITAL GOODS DATA ------------------ */
  const processCapitalGoodsData = () => {
    if (!capitalGoodsList || capitalGoodsList.length === 0) return [];
    return capitalGoodsList.map(item => ({
      _id: item.purchasedGoodsServicesType || "Uncategorized",
      amount: item.amountSpent,
      unit: item.unit,
      databaseId: item._id,
      totalEmissionTCo2e: item.calculatedEmissionTCo2e || 0,
      originalItem: item
    })).sort((a, b) => b.totalEmissionTCo2e - a.totalEmissionTCo2e);
  };

  /* ------------------ PROCESS FUEL & ENERGY DATA ------------------ */
  const processFuelEnergyData = () => {
    if (!fuelAndEnergyList || fuelAndEnergyList.length === 0) return [];
    const allItems = fuelAndEnergyList.flatMap(item =>
      item.list && Array.isArray(item.list) ? item.list : [item]
    );
    return allItems
      .filter(item => item && typeof item === 'object')
      .map(item => ({
        _id: item.fuelType || item.activityType || "Uncategorized",
        databaseId: item._id,
        totalEmissionTCo2e: item.calculatedEmissionTCo2e || 0,
        originalItem: item
      }))
      .sort((a, b) => b.totalEmissionTCo2e - a.totalEmissionTCo2e);
  };

  /* ------------------ PROCESS WASTE GENERATED DATA ------------------ */
  const processWasteGeneratedData = () => {
    if (!wasteGenerated || wasteGenerated.length === 0) return [];
    const allItems = wasteGenerated.flatMap(item =>
      item.list && Array.isArray(item.list) ? item.list : [item]
    );
    return allItems
      .filter(item => item && typeof item === 'object')
      .map(item => ({
        _id: item.wasteType || item.activityType || "Uncategorized",
        databaseId: item._id,
        amount: item.totalWasteQty,
        unit: item.unit,
        totalEmissionTCo2e: item.calculatedEmissionTCo2e || 0,
        originalItem: item
      }))
      .sort((a, b) => b.totalEmissionTCo2e - a.totalEmissionTCo2e);
  };

  /* ------------------ PROCESS BUSINESS TRAVEL DATA ------------------ */
  const processBusinessTravelData = () => {
    if (!businessTravelList || businessTravelList.length === 0) return [];
    return businessTravelList.map(item => ({
      _id: item.stakeholder || "Other Travel",
      databaseId: item._id,
      totalEmissionTCo2e: item.calculatedEmissionTCo2e || 0,
      originalItem: item
    })).sort((a, b) => b.totalEmissionTCo2e - a.totalEmissionTCo2e);
  };

  /* ------------------ PROCESS EMPLOYEE COMMUTING DATA ------------------ */
  const processEmployeeCommutingData = () => {
    if (!employeeCommuting || employeeCommuting.length === 0) return [];
    const allItems = employeeCommuting.flatMap(item =>
      item.list && Array.isArray(item.list) ? item.list : [item]
    );
    return allItems
      .filter(item => item && typeof item === 'object')
      .map(item => {
        const distanceSum = (Number(item.motorbikeDistance) || 0) + (Number(item.motorbikeDistanceCarpool) || 0) +
          (Number(item.taxiDistance) || 0) + (Number(item.taxiDistanceCarpool) || 0) +
          (Number(item.busDistance) || 0) + (Number(item.trainDistance) || 0) +
          (Number(item.carDistance) || 0) + (Number(item.carDistanceCarpool) || 0);
        return {
          _id: item.submittedByEmail || "Unknown Commuter",
          databaseId: item._id,
          totalEmissionTCo2e: item.calculatedEmissionTCo2e || item.totalEmissionTCo2e || 0,
          amount: distanceSum > 0 ? distanceSum : (item.totalWasteQty || item.amount || "N/A"),
          unit: distanceSum > 0 ? 'km' : (item.unit || ''),
          originalItem: item
        };
      })
      .sort((a, b) => b.totalEmissionTCo2e - a.totalEmissionTCo2e);
  };

  /* ------------------ PROCESS UPSTREAM TRANSPORT DATA ------------------ */
  const processUpstreamTransportData = () => {
    if (!upstreamList || upstreamList.length === 0) return [];
    const allItems = upstreamList.flatMap(item =>
      item.list && Array.isArray(item.list) ? item.list : [item]
    );
    return allItems
      .filter(item => item && typeof item === 'object')
      .map(item => ({
        _id: item.transportType || item.activityType || "Uncategorized",
        databaseId: item._id,
        totalEmissionTCo2e: item.calculatedEmissionTCo2e || 0,
        originalItem: item
      }))
      .sort((a, b) => b.totalEmissionTCo2e - a.totalEmissionTCo2e);
  };

  /* ------------------ PROCESS DOWNSTREAM TRANSPORT DATA ------------------ */
  const processDownstreamTransportData = () => {
    if (!downstreamList || downstreamList.length === 0) return [];
    const allItems = downstreamList.flatMap(item =>
      item.list && Array.isArray(item.list) ? item.list : [item]
    );
    return allItems
      .filter(item => item && typeof item === 'object')
      .map(item => ({
        _id: item.transportType || item.soldProductActivityType || "Uncategorized",
        databaseId: item._id,
        totalEmissionTCo2e: item.calculatedEmissionTCo2e || 0,
        originalItem: item
      }))
      .sort((a, b) => b.totalEmissionTCo2e - a.totalEmissionTCo2e);
  };


  /* ------------------ TABLE DATA ------------------ */
  const topScope3Categories = {
    "Purchased Goods & Services": processPurchasedGoodsData(),
    "Capital Goods": processCapitalGoodsData(),
    "Fuel & Energy Related Activities": processFuelEnergyData(),
    "Waste Generated": processWasteGeneratedData(),
    "Business Travel": processBusinessTravelData(),
    "Employee Commuting": processEmployeeCommutingData(),
    "Upstream Transportations": processUpstreamTransportData(),
    "Downstream Transportations": processDownstreamTransportData(),
  };

  /* ------------------ BAR CLICK HANDLER ------------------ */
  const handleBarClick = (data) => {
    if (!data?.name) return;
    setSelectedCategory(data.name);
    setRowLimit(10);
  };

  /* -------------------- EFFECT TO RESET ON PARENT TRIGGER -------------------- */
  useEffect(() => {
    if (resetTrigger > 0) {
      resetView();
    }
  }, [resetTrigger]);

  /* ------------------ RESET VIEW ------------------ */
  const resetView = () => {
    setSelectedCategory(null);
    setRowLimit(3);
  };

  // const formatNumber = (num) => {
  //   if (!num) return '0';
  //   return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  // };
  const formatNumber = (num) => {
    if (!num) return '0';
    // Convert to number, truncate decimals (no rounding)
    const truncated = Math.trunc(Number(num));
    return truncated.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Total Scope 3 Summary Card */}
      <div className="bg-gradient-to-r from-[#094382] to-[#037db9] rounded-2xl shadow-lg sm:p-2 2xl:p-4 sm:pl-4 sm:pr-4 border border-teal-700">
        <div className="flex items-start justify-between">
          <div>
            <p className="sm:text-[10px] 2xl:text-sm font-medium text-blue-300 uppercase tracking-wider">Total Scope 3 Emissions</p>
            <p className="sm:text-lg 2xl:text-3xl font-bold text-white sm:mt-0 2xl:mt-2">
              {formatNumber(totalScope3)}
              <span className="text-sm font-normal text-blue-300 ml-1">tCO₂e</span>
            </p>
            <p className="text-xs text-blue-300 sm:mt-0 2xl:mt-2">Other indirect emissions across value chain</p>
          </div>
          <div className="p-2 bg-blue-700/50 rounded-xl">
            <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content Row */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* ==================== BAR CHART ==================== */}
        <div className="flex-1">
          <div className="h-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all hover:shadow-xl">
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Scope 3 Emissions by Category</h3>
                    <p className="text-sm text-gray-500">Indirect emissions from the value chain</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Content */}
            <div className="p-6">
              {loading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-3"></div>
                    <p className="text-gray-500">Loading chart data...</p>
                  </div>
                </div>
              ) : barChartData.length === 0 ? (
                <div className="h-[400px] flex items-center justify-center">
                  <p className="text-gray-500">No data available</p>
                </div>
              ) : (
                <RevenueBarChart
                  chartData={barChartData}
                  loading={loading}
                  onBarClick={handleBarClick}
                  selectedCategory={selectedCategory}
                />
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Click on any bar to view detailed breakdown</span>
                <span className="font-medium">{barChartData.length} categories with data</span>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== TABLE ==================== */}
        <div className="flex-1">
          <div className="h-fullbg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all hover:shadow-xl">
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {selectedCategory ? `${selectedCategory} Details` : "Emission Sources by Category"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedCategory ? "Detailed breakdown of emission sources" : "Top emission sources per category"}
                    </p>
                  </div>
                </div>

                {selectedCategory && (
                  <button
                    onClick={resetView}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-sm"
                  >
                    Reset View
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Table Content */}
            <div className="max-h-[515px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="p-6 space-y-5">
                {Object.entries(topScope3Categories)
                  .filter(([categoryName, items]) => (selectedCategory ? categoryName === selectedCategory : true))
                  .map(([categoryName, items]) => {

                    const metadata = categoryMetadata[categoryName] || {
                      icon: factoryIcon,
                      iconType: "png",
                      bg: "bg-gray-50",
                      border: "border-gray-200",
                      text: "text-gray-700",
                      badge: "bg-gray-100 text-gray-800"
                    };
                    const visibleItems = items.slice(0, rowLimit);

                    const categoryTotal = barChartData.find(c => c.name === categoryName)?.value || 0;

                    if (!visibleItems.length) {
                      return (
                        <div key={categoryName} className={`border rounded-xl p-6 text-center ${metadata.bg} ${metadata.border}`}>
                          <p className={metadata.text}>No data available for {categoryName}</p>
                        </div>
                      );
                    }

                    return (
                      <div key={categoryName} className="space-y-3">
                        {/* Category Header */}
                        <div className={`flex items-center justify-between sm:p-1.5 2xl:p-3 rounded-xl ${metadata.bg} border ${metadata.border}`}>
                          <div className="flex items-center gap-2">
                            {metadata.iconType === "png" ? (
                              <img
                                src={metadata.icon}
                                alt={categoryName}
                                className="w-5 h-5 object-contain filter grayscale opacity-60"
                              />
                            ) : (
                              <span className="text-xl">{metadata.icon}</span>
                            )}
                            <span className={`font-semibold ${metadata.text}`}>{categoryName}</span>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold ${metadata.text}`}>{formatNumber(categoryTotal)}</p>
                            <p className="text-xs text-gray-500">tCO₂e total</p>
                          </div>
                        </div>

                        {/* Grid of items */}
                        <div className={`grid gap-3 ${selectedCategory
                          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                          : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                          }`}>
                          {visibleItems.map((item, idx) => (
                            <div key={item.databaseId || idx} className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all hover:border-gray-300">
                              {/* Item Name */}
                              <div className="px-3 py-2 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                                <p className="text-sm font-medium text-gray-800 truncate" title={item._id || "N/A"}>
                                  {item._id || "N/A"}
                                </p>
                              </div>

                              {/* Emission Value */}
                              <div className="px-3 py-2 border-b border-gray-100">
                                <div className="flex items-baseline justify-between">
                                  <span className="text-xs text-gray-500">Emissions:</span>
                                  <span className="text-base font-bold text-teal-600">
                                    {Math.trunc(Number(item.totalEmissionTCo2e || 0)).toLocaleString()}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-400">tCO₂e</span>
                              </div>

                              {/* Quantity/Amount */}
                              <div className="px-3 py-2 bg-gray-50">
                                <div className="flex items-center gap-1">
                                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  <span className="text-xs text-gray-600 truncate">
                                    {item.amount || "N/A"} {item.unit === 'USD' ? '$' : (item.unit || '')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {selectedCategory
                    ? `Showing top ${rowLimit} emission sources`
                    : "Showing top 3 sources per category"}
                </span>
                {!selectedCategory && barChartData.length > 0 && (
                  <span className="text-teal-600">Click on chart bars for detailed view →</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scope3EmissionsSection;