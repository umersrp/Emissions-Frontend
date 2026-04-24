// import React from "react";
// import RevenueBarChart from "@/components/partials/widget/chart/revenue-bar-chart";
// import { Tooltip } from "@mui/material";
// import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
// import { useEffect } from "react";

// const categoryColors = {
//   "Location-Based": "bg-blue-100 text-blue-800",
//   "Location Based": "bg-blue-100 text-blue-800", // Add this for consistency
//   "Market-Based": "bg-green-100 text-green-800",
//   "Market Based": "bg-green-100 text-green-800", // Add this for consistency
// };

// const unitColors = {
//   kWh: "bg-blue-50 text-blue-700 border-blue-200",
//   MWh: "bg-green-50 text-green-700 border-green-200",
//   Unknown: "bg-gray-50 text-gray-700 border-gray-200",
// };

// const normalizeUnit = (unit) => {
//   if (!unit) return "Unknown";
//   const u = unit.toLowerCase();
//   if (u === "kwh") return "kWh";
//   if (u === "mwh") return "MWh";
//   return unit;
// };

// const getTopEntriesByMethod = (list = [], methodType, limit = 3) => {
//   if (!list.length) return [];

//   // Filter entries that have data for the requested method type
//   const filteredEntries = list.filter((item) => {
//     if (methodType === "Location-Based" || methodType === "Location Based") {
//       // Check if location-based emission exists and is non-zero
//       const locationEmission = Number(item.calculatedEmissionTCo2e || 0);
//       return locationEmission > 0;
//     } else if (methodType === "Market-Based" || methodType === "Market Based") {
//       // Check if market-based emission exists and is non-zero
//       const marketEmission = Number(item.calculatedEmissionMarketTCo2e || 0);
//       return marketEmission > 0;
//     }
//     return false;
//   });

//   // Sort entries by the appropriate emission value (descending)
//   const sortedEntries = [...filteredEntries].sort((a, b) => {
//     if (methodType === "Location-Based" || methodType === "Location Based") {
//       const aVal = Number(a.calculatedEmissionTCo2e || 0);
//       const bVal = Number(b.calculatedEmissionTCo2e || 0);
//       return bVal - aVal;
//     } else {
//       // Market-Based
//       const aVal = Number(a.calculatedEmissionMarketTCo2e || 0);
//       const bVal = Number(b.calculatedEmissionMarketTCo2e || 0);
//       return bVal - aVal;
//     }
//   });

//   // Take top N entries and format them
//   return sortedEntries.slice(0, limit).map((item, index) => ({
//     _id: item._id,
//     unit: normalizeUnit(item.unit),
//     totalElectricityConsumed: Number(item.totalElectricity || 0),
//     emissionTCo2e: methodType === "Location-Based" || methodType === "Location Based"
//       ? Number(item.calculatedEmissionTCo2e || 0)
//       : Number(item.calculatedEmissionMarketTCo2e || 0),
//     rank: index + 1,
//     // Original data for reference
//     originalData: item
//   }));
// };

// const Scope2EmissionsSection = ({ dashboardData, loading, resetTrigger = 0,  // Add default value here
//   onRegisterReset }) => {
//   if (!dashboardData?.scope2) return null;

//   const scope2 = dashboardData.scope2;

//   /* ---------- State ---------- */
//   const [selectedBuildingName, setSelectedBuildingName] = React.useState(null);
//   const [selectedCategory, setSelectedCategory] = React.useState(null);
//   const [rowLimit, setRowLimit] = React.useState(3);

//   /* ---------- Bar Chart ---------- */
//   const barChartData = React.useMemo(() => {
//     if (!scope2.purchasedElectricity) return [];

//     return [
//       {
//         name: "Location Based",
//         displayName: "Location Based", // Explicit display name
//         categoryKey: "Location-Based", // For table filtering
//         value: Number(scope2.purchasedElectricity.totalLocationTCo2e ?? 0),
//         type: "location"
//       },
//       {
//         name: "Market Based",
//         displayName: "Market Based", // Explicit display name
//         categoryKey: "Market-Based", // For table filtering
//         value: Number(scope2.purchasedElectricity.totalMarketTCo2e ?? 0),
//         type: "market"
//       },
//       {
//         name: " ", 
//         displayName: " ",
//         categoryKey: "spacer-1",
//         value: 0,
//         type: "spacer",
//         isPlaceholder: true 
//       },
//       {
//         name: "  ", 
//         displayName: "  ",
//         categoryKey: "spacer-2",
//         value: 0,
//         type: "spacer",
//         isPlaceholder: true
//       }
//     ].filter(item => item.value > 0); // Only show items with value > 0
//   }, [scope2]);

//   /* ---------- Table Data ---------- */
//   const getTopEntries = React.useCallback((methodType, limit) => {
//     return getTopEntriesByMethod(
//       scope2.electricityListData || [],
//       methodType,
//       limit
//     );
//   }, [scope2.electricityListData]);

//   const topScope2Categories = React.useMemo(() => {
//     const limit = rowLimit;

//     return {
//       "Location-Based": getTopEntries("Location-Based", limit),
//       "Market-Based": getTopEntries("Market-Based", limit)
//     };
//   }, [getTopEntries, rowLimit]);

//   /* ---------- Total Emissions ---------- */
//   const totalScope2 = barChartData.reduce((sum, item) => sum + item.value, 0);
//   const locationTotal = Number(scope2.purchasedElectricity?.totalLocationTCo2e || 0);
//   const marketTotal = Number(scope2.purchasedElectricity?.totalMarketTCo2e || 0);

//   /* ---------- Handlers ---------- */
//   const handleBarClick = (data) => {
//     if (!data?.name) return;

//     // Use the categoryKey for filtering, fallback to name
//     const category = data.categoryKey || data.name;
//     setSelectedCategory(category);
//     setRowLimit(10);
//   };
//   /* -------------------- EFFECT TO RESET ON PARENT TRIGGER -------------------- */
//   useEffect(() => {
//     if (resetTrigger > 0) {
//       resetView();
//     }
//   }, [resetTrigger]);

//   /* ---------- Reset View ---------- */
//   const resetView = () => {
//     setSelectedCategory(null);
//     setSelectedBuildingName(null);
//     setRowLimit(3);
//   };

//   // Get the display name for a category
//   const getCategoryDisplayName = (categoryKey) => {
//     const chartItem = barChartData.find(item =>
//       item.categoryKey === categoryKey || item.name === categoryKey
//     );
//     return chartItem?.displayName || chartItem?.name || categoryKey;
//   };

//   return (
//     <div className="flex flex-col gap-6">
//       {/* ================= Total Card ================= */}
//       <div className="flex flex-col md:flex-row gap-8">
//         {/* ================= Chart Card ================= */}
//         <div className="flex-1 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="font-semibold text-xl text-gray-900">
//               Scope 2 Emissions by Type
//             </h3>
//             <Tooltip
//               title="This chart shows location-based and market-based emissions (tCO₂e)"
//               arrow
//             >
//               <span className="cursor-pointer text-gray-400 hover:text-gray-600">
//                 <InfoOutlinedIcon
//                   className="text-red-400 cursor-pointer"
//                   fontSize="small"
//                 />
//               </span>
//             </Tooltip>
//           </div>
//           <div className=" ">
//             <RevenueBarChart
//               chartData={barChartData}
//               selectedCategory={selectedCategory}
//               height={400}
//               onBarClick={handleBarClick}
//               loading={loading}
//             // maxBarWidth="10%"
//             //  reduceGap={true}
//             />
//           </div>
//         </div>

//         {/* ================= Table Card ================= */}
//         <div className="flex-1 min-w-[320px] p-6 bg-white rounded-xl shadow-lg border overflow-auto scrollbar-hide  max-h-[520px]">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="font-semibold text-xl text-gray-900">
//               Top Categories
//             </h3>

//             <div className="flex items-center gap-4">
//               <Tooltip
//                 title="Shows top entries based on method (location_based or market_based)"
//                 arrow
//               >
//                 <span className="cursor-pointer text-gray-400 hover:text-gray-600">
//                   <InfoOutlinedIcon
//                     className="text-red-400 cursor-pointer"
//                     fontSize="small"
//                   />
//                 </span>
//               </Tooltip>

//               {selectedCategory && (
//                 <button
//                   onClick={resetView}
//                   className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
//                 >
//                   Reset view
//                 </button>
//               )}
//             </div>
//           </div>

//           <div className="space-y-6">
//             {Object.entries(topScope2Categories).map(([categoryKey, entries]) => {
//               // Skip showing this category if another is selected
//               if (selectedCategory && selectedCategory !== categoryKey) {
//                 return null;
//               }

//               const displayName = getCategoryDisplayName(categoryKey);

//               if (!entries.length) {
//                 return (
//                   <div
//                     key={categoryKey}
//                     className={`border border-gray-300 rounded p-2 font-semibold ${categoryColors[categoryKey] || 'bg-gray-100 text-gray-800'}`}
//                   >
//                     {displayName} - <span className="italic text-gray-400">No data available</span>
//                   </div>
//                 );
//               }

//               return (
//                 <div key={categoryKey} className="border border-gray-300 rounded p-3">
//                   {/* Category Label */}
//                   <div className={`font-semibold mb-3 p-2 rounded-md scrollbar-hide ${categoryColors[categoryKey] || 'bg-gray-100 text-gray-800'}`}>
//                     {displayName}
//                   </div>

//                   {/* Grid for entries */}
//                   <div
//                     className={`grid gap-2 w-full ${selectedCategory === categoryKey
//                       ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
//                       : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
//                       }`}
//                   >
//                     {entries.map((entry) => (
//                       <div key={entry._id} className="flex-1 min-w-0 border border-gray-300 rounded overflow-hidden">
//                         {/* Unit name */}
//                         <div className="p-2 font-medium border-b text-center truncate bg-gray-50">
//                           {entry.unit}
//                         </div>

//                         {/* Emission value */}
//                         <div className={`p-2 font-semibold text-center truncate ${categoryKey === "Location-Based" ? "text-red-600" : "text-blue-600"}`}>
//                           {entry.emissionTCo2e.toLocaleString(undefined, {
//                             minimumFractionDigits: 2,
//                             maximumFractionDigits: 2,
//                           })} tCO₂e
//                         </div>

//                         {/* Electricity Consumption */}
//                         <div className="p-2 text-gray-700 font-medium text-center truncate border-t">
//                           {entry.totalElectricityConsumed.toLocaleString(undefined, {
//                             minimumFractionDigits: 2,
//                             maximumFractionDigits: 2,
//                           })} {entry.unit.toLowerCase().includes('kwh') ? 'kWh' : 'MWh'}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Scope2EmissionsSection;

import React from "react";
import RevenueBarChart from "@/components/partials/widget/chart/revenue-bar-chart";
import { Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useEffect } from "react";

const categoryColors = {
  "Location-Based": "bg-blue-100 text-blue-800",
  "Location Based": "bg-blue-100 text-blue-800", // Add this for consistency
  "Market-Based": "bg-green-100 text-green-800",
  "Market Based": "bg-green-100 text-green-800", // Add this for consistency
};

const unitColors = {
  kWh: "bg-blue-50 text-blue-700 border-blue-200",
  MWh: "bg-green-50 text-green-700 border-green-200",
  Unknown: "bg-gray-50 text-gray-700 border-gray-200",
};

const normalizeUnit = (unit) => {
  if (!unit) return "Unknown";
  const u = unit.toLowerCase();
  if (u === "kwh") return "kWh";
  if (u === "mwh") return "MWh";
  return unit;
};

const getTopEntriesByMethod = (list = [], methodType, limit = 3) => {
  if (!list.length) return [];

  // Filter entries that have data for the requested method type
  const filteredEntries = list.filter((item) => {
    if (methodType === "Location-Based" || methodType === "Location Based") {
      // Check if location-based emission exists and is non-zero
      const locationEmission = Number(item.calculatedEmissionTCo2e || 0);
      return locationEmission > 0;
    } else if (methodType === "Market-Based" || methodType === "Market Based") {
      // Check if market-based emission exists and is non-zero
      const marketEmission = Number(item.calculatedEmissionMarketTCo2e || 0);
      return marketEmission > 0;
    }
    return false;
  });

  // Sort entries by the appropriate emission value (descending)
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (methodType === "Location-Based" || methodType === "Location Based") {
      const aVal = Number(a.calculatedEmissionTCo2e || 0);
      const bVal = Number(b.calculatedEmissionTCo2e || 0);
      return bVal - aVal;
    } else {
      // Market-Based
      const aVal = Number(a.calculatedEmissionMarketTCo2e || 0);
      const bVal = Number(b.calculatedEmissionMarketTCo2e || 0);
      return bVal - aVal;
    }
  });

  // Take top N entries and format them
  return sortedEntries.slice(0, limit).map((item, index) => ({
    _id: item._id,
    unit: normalizeUnit(item.unit),
    totalElectricityConsumed: Number(item.totalElectricity || 0),
    emissionTCo2e: methodType === "Location-Based" || methodType === "Location Based"
      ? Number(item.calculatedEmissionTCo2e || 0)
      : Number(item.calculatedEmissionMarketTCo2e || 0),
    rank: index + 1,
    // Original data for reference
    originalData: item
  }));
};

// const Scope2EmissionsSection = ({ dashboardData, loading, resetTrigger = 0,  // Add default value here
//   onRegisterReset }) => {
//   if (!dashboardData?.scope2) return null;

//   const scope2 = dashboardData.scope2;

//   /* ---------- State ---------- */
//   const [selectedBuildingName, setSelectedBuildingName] = React.useState(null);
//   const [selectedCategory, setSelectedCategory] = React.useState(null);
//   const [rowLimit, setRowLimit] = React.useState(3);

//   /* ---------- Bar Chart ---------- */
//   const barChartData = React.useMemo(() => {
//     if (!scope2.purchasedElectricity) return [];

//     return [
//       {
//         name: "Market Based",
//         displayName: "Market Based", // Explicit display name
//         categoryKey: "Market-Based", // For table filtering
//         value: Number(scope2.purchasedElectricity.totalMarketTCo2e ?? 0),
//         type: "market"
//       },
//       {
//         name: " ", 
//         displayName: " ",
//         categoryKey: "spacer-1",
//         value: 0,
//         type: "spacer",
//         isPlaceholder: true 
//       },
//       {
//         name: "  ", 
//         displayName: "  ",
//         categoryKey: "spacer-2",
//         value: 0,
//         type: "spacer",
//         isPlaceholder: true
//       },
//       {
//         name: "Location Based",
//         displayName: "Location Based", // Explicit display name
//         categoryKey: "Location-Based", // For table filtering
//         value: Number(scope2.purchasedElectricity.totalLocationTCo2e ?? 0),
//         type: "location"
//       }
//     ]; // Remove the filter - keep all items including placeholders
//   }, [scope2]);

//   /* ---------- Table Data ---------- */
//   const getTopEntries = React.useCallback((methodType, limit) => {
//     return getTopEntriesByMethod(
//       scope2.electricityListData || [],
//       methodType,
//       limit
//     );
//   }, [scope2.electricityListData]);

//   const topScope2Categories = React.useMemo(() => {
//     const limit = rowLimit;

//     return {
//       "Location-Based": getTopEntries("Location-Based", limit),
//       "Market-Based": getTopEntries("Market-Based", limit)
//     };
//   }, [getTopEntries, rowLimit]);

//   /* ---------- Total Emissions ---------- */
//   const totalScope2 = barChartData
//     .filter(item => !item.isPlaceholder) // Exclude placeholders from total
//     .reduce((sum, item) => sum + item.value, 0);
//   const locationTotal = Number(scope2.purchasedElectricity?.totalLocationTCo2e || 0);
//   const marketTotal = Number(scope2.purchasedElectricity?.totalMarketTCo2e || 0);

//   /* ---------- Handlers ---------- */
//   const handleBarClick = (data) => {
//     if (!data?.name || data.isPlaceholder) return; // Ignore placeholder clicks

//     // Use the categoryKey for filtering, fallback to name
//     const category = data.categoryKey || data.name;
//     setSelectedCategory(category);
//     setRowLimit(10);
//   };
//   /* -------------------- EFFECT TO RESET ON PARENT TRIGGER -------------------- */
//   useEffect(() => {
//     if (resetTrigger > 0) {
//       resetView();
//     }
//   }, [resetTrigger]);

//   /* ---------- Reset View ---------- */
//   const resetView = () => {
//     setSelectedCategory(null);
//     setSelectedBuildingName(null);
//     setRowLimit(3);
//   };

//   // Get the display name for a category
//   const getCategoryDisplayName = (categoryKey) => {
//     const chartItem = barChartData.find(item =>
//       item.categoryKey === categoryKey || item.name === categoryKey
//     );
//     return chartItem?.displayName || chartItem?.name || categoryKey;
//   };

//   return (
//     <div className="flex flex-col gap-6">
//       {/* ================= Total Card ================= */}
//       <div className="flex flex-col md:flex-row gap-8">
//         {/* ================= Chart Card ================= */}
//         <div className="flex-1 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="font-semibold text-xl text-gray-900">
//               Scope 2 Emissions by Type
//             </h3>
//             <Tooltip
//               title="This chart shows location-based and market-based emissions (tCO₂e)"
//               arrow
//             >
//               <span className="cursor-pointer text-gray-400 hover:text-gray-600">
//                 <InfoOutlinedIcon
//                   className="text-red-400 cursor-pointer"
//                   fontSize="small"
//                 />
//               </span>
//             </Tooltip>
//           </div>
//           <div className=" ">
//             <RevenueBarChart
//               chartData={barChartData}
//               selectedCategory={selectedCategory}
//               height={400}
//               onBarClick={handleBarClick}
//               loading={loading}
//             // maxBarWidth="10%"
//             //  reduceGap={true}
//             />
//           </div>
//         </div>

//         {/* ================= Table Card ================= */}
//         <div className="flex-1 min-w-[320px] p-6 bg-white rounded-xl shadow-lg border overflow-auto scrollbar-hide  max-h-[520px]">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="font-semibold text-xl text-gray-900">
//               Top Categories
//             </h3>

//             <div className="flex items-center gap-4">
//               <Tooltip
//                 title="Shows top entries based on method (location_based or market_based)"
//                 arrow
//               >
//                 <span className="cursor-pointer text-gray-400 hover:text-gray-600">
//                   <InfoOutlinedIcon
//                     className="text-red-400 cursor-pointer"
//                     fontSize="small"
//                   />
//                 </span>
//               </Tooltip>

//               {selectedCategory && (
//                 <button
//                   onClick={resetView}
//                   className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
//                 >
//                   Reset view
//                 </button>
//               )}
//             </div>
//           </div>

//           <div className="space-y-6">
//             {Object.entries(topScope2Categories).map(([categoryKey, entries]) => {
//               // Skip showing this category if another is selected
//               if (selectedCategory && selectedCategory !== categoryKey) {
//                 return null;
//               }

//               const displayName = getCategoryDisplayName(categoryKey);

//               if (!entries.length) {
//                 return (
//                   <div
//                     key={categoryKey}
//                     className={`border border-gray-300 rounded p-2 font-semibold ${categoryColors[categoryKey] || 'bg-gray-100 text-gray-800'}`}
//                   >
//                     {displayName} - <span className="italic text-gray-400">No data available</span>
//                   </div>
//                 );
//               }

//               return (
//                 <div key={categoryKey} className="border border-gray-300 rounded p-3">
//                   {/* Category Label */}
//                   <div className={`font-semibold mb-3 p-2 rounded-md scrollbar-hide ${categoryColors[categoryKey] || 'bg-gray-100 text-gray-800'}`}>
//                     {displayName}
//                   </div>

//                   {/* Grid for entries */}
//                   <div
//                     className={`grid gap-2 w-full ${selectedCategory === categoryKey
//                       ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
//                       : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
//                       }`}
//                   >
//                     {entries.map((entry) => (
//                       <div key={entry._id} className="flex-1 min-w-0 border border-gray-300 rounded overflow-hidden">
//                         {/* Unit name */}
//                         <div className="p-2 font-medium border-b text-center truncate bg-gray-50">
//                           {entry.unit}
//                         </div>

//                         {/* Emission value */}
//                         <div className={`p-2 font-semibold text-center truncate ${categoryKey === "Location-Based" ? "text-red-600" : "text-blue-600"}`}>
//                           {entry.emissionTCo2e.toLocaleString(undefined, {
//                             minimumFractionDigits: 2,
//                             maximumFractionDigits: 2,
//                           })} tCO₂e
//                         </div>

//                         {/* Electricity Consumption */}
//                         <div className="p-2 text-gray-700 font-medium text-center truncate border-t">
//                           {entry.totalElectricityConsumed.toLocaleString(undefined, {
//                             minimumFractionDigits: 2,
//                             maximumFractionDigits: 2,
//                           })} {entry.unit.toLowerCase().includes('kwh') ? 'kWh' : 'MWh'}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

const Scope2EmissionsSection = ({ dashboardData, loading, resetTrigger = 0, onRegisterReset }) => {
  if (!dashboardData?.scope2) return null;

  const scope2 = dashboardData.scope2;

  /* ---------- State ---------- */
  const [selectedBuildingName, setSelectedBuildingName] = React.useState(null);
  const [selectedCategory, setSelectedCategory] = React.useState(null);
  const [rowLimit, setRowLimit] = React.useState(3);

  /* ---------- Bar Chart Data ---------- */
  const barChartData = React.useMemo(() => {
    if (!scope2.purchasedElectricity) return [];

    return [
      {
        name: "Market Based",
        displayName: "Market Based",
        categoryKey: "Market-Based",
        value: Number(scope2.purchasedElectricity.totalMarketTCo2e ?? 0),
        type: "market",
        icon: "📊",
        color: "from-emerald-500 to-emerald-600"
      },
      {
        name: "Location Based",
        displayName: "Location Based",
        categoryKey: "Location-Based",
        value: Number(scope2.purchasedElectricity.totalLocationTCo2e ?? 0),
        type: "location",
        icon: "📍",
        color: "from-blue-500 to-blue-600"
      }
    ];
  }, [scope2]);

  /* ---------- Table Data ---------- */
  const getTopEntries = React.useCallback((methodType, limit) => {
    return getTopEntriesByMethod(
      scope2.electricityListData || [],
      methodType,
      limit
    );
  }, [scope2.electricityListData]);

  const topScope2Categories = React.useMemo(() => {
    const limit = rowLimit;

    return {
      "Location-Based": getTopEntries("Location-Based", limit),
      "Market-Based": getTopEntries("Market-Based", limit)
    };
  }, [getTopEntries, rowLimit]);

  /* ---------- Total Emissions ---------- */
  const totalScope2 = barChartData.reduce((sum, item) => sum + item.value, 0);
  const locationTotal = Number(scope2.purchasedElectricity?.totalLocationTCo2e || 0);
  const marketTotal = Number(scope2.purchasedElectricity?.totalMarketTCo2e || 0);

  /* ---------- Handlers ---------- */
  const handleBarClick = (data) => {
    if (!data?.name) return;
    const category = data.categoryKey || data.name;
    setSelectedCategory(category);
    setRowLimit(10);
  };

  /* ---------- Effect to Reset ---------- */
  useEffect(() => {
    if (resetTrigger > 0) {
      resetView();
    }
  }, [resetTrigger]);

  /* ---------- Reset View ---------- */
  const resetView = () => {
    setSelectedCategory(null);
    setSelectedBuildingName(null);
    setRowLimit(3);
  };

  // Get the display name for a category
  const getCategoryDisplayName = (categoryKey) => {
    const chartItem = barChartData.find(item =>
      item.categoryKey === categoryKey || item.name === categoryKey
    );
    return chartItem?.displayName || chartItem?.name || categoryKey;
  };

  // Get category color scheme
  const getCategoryColorScheme = (categoryKey) => {
    const schemes = {
      "Location-Based": {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        badge: "bg-blue-100 text-blue-800",
        icon: "📍"
      },
      "Market-Based": {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
        badge: "bg-emerald-100 text-emerald-800",
        icon: "📊"
      }
    };
    return schemes[categoryKey] || {
      bg: "bg-gray-50",
      border: "border-gray-200",
      text: "text-gray-700",
      badge: "bg-gray-100 text-gray-800",
      icon: "⚡"
    };
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Scope 2 Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-lg p-4 border border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Scope 2</p>
              <p className="text-2xl font-bold text-white mt-2">
                {totalScope2}
                <span className="text-sm font-normal text-gray-400 ml-1">tCO₂e</span>
              </p>
            </div>
            <div className="p-2 bg-gray-700/50 rounded-xl">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Location Based Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📍</span>
                <p className="text-sm font-semibold text-gray-700">Location Based</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {locationTotal}
                <span className="text-sm font-normal text-gray-500 ml-1">tCO₂e</span>
              </p>
              <p className="text-xs text-gray-500 mt-2">Grid average method</p>
            </div>
            <div className="px-2 py-1 bg-blue-100 rounded-lg">
              <span className="text-xs font-medium text-blue-700">Scope 2</span>
            </div>
          </div>
        </div>

        {/* Market Based Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📊</span>
                <p className="text-sm font-semibold text-gray-700">Market Based</p>
              </div>
              <p className="text-2xl font-bold text-emerald-600">
                {marketTotal}
                <span className="text-sm font-normal text-gray-500 ml-1">tCO₂e</span>
              </p>
              <p className="text-xs text-gray-500 mt-2">Contract instruments</p>
            </div>
            <div className="px-2 py-1 bg-emerald-100 rounded-lg">
              <span className="text-xs font-medium text-emerald-700">Scope 2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Row */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* ================= Chart Card ================= */}
        <div className="flex-1">
          <div className="h-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all hover:shadow-xl">
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Scope 2 Emissions by Type</h3>
                    <p className="text-sm text-gray-500">Location-based vs Market-based comparison</p>
                  </div>
                </div>
                <Tooltip title="This chart shows location-based and market-based emissions (tCO₂e)" arrow>
                  <div className="cursor-help">
                    <InfoOutlinedIcon className="text-gray-400 hover:text-orange-400 transition-colors" fontSize="small" />
                  </div>
                </Tooltip>
              </div>
            </div>

            {/* Chart Content */}
            <div className="p-6">
              {loading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-3"></div>
                    <p className="text-gray-500">Loading chart data...</p>
                  </div>
                </div>
              ) : (
                <RevenueBarChart
                  chartData={barChartData}
                  selectedCategory={selectedCategory}
                  height={400}
                  onBarClick={handleBarClick}
                  loading={loading}
                />
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Click on any bar to view detailed breakdown</span>
                <span className="font-medium">Data in tCO₂e</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= Table Card ================= */}
        <div className="flex-1">
          <div className="h-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all hover:shadow-xl">
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
                      {selectedCategory ? `${getCategoryDisplayName(selectedCategory)} Details` : "Emission Sources"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedCategory 
                        ? "Detailed breakdown of electricity consumption" 
                        : "Top emission sources by method"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Tooltip title="Shows top entries based on method (location_based or market_based)" arrow>
                    <div className="cursor-help">
                      <InfoOutlinedIcon className="text-gray-400 hover:text-indigo-400 transition-colors" fontSize="small" />
                    </div>
                  </Tooltip>

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
            </div>

            {/* Scrollable Table Content */}
            <div className="max-h-[520px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="p-6 space-y-6">
                {Object.entries(topScope2Categories).map(([categoryKey, entries]) => {
                  if (selectedCategory && selectedCategory !== categoryKey) {
                    return null;
                  }

                  const displayName = getCategoryDisplayName(categoryKey);
                  const colorScheme = getCategoryColorScheme(categoryKey);
                  const totalValue = categoryKey === "Location-Based" ? locationTotal : marketTotal;

                  if (!entries.length) {
                    return (
                      <div
                        key={categoryKey}
                        className={`border rounded-xl p-6 text-center ${colorScheme.bg} ${colorScheme.border}`}
                      >
                        <p className={`${colorScheme.text}`}>No data available for {displayName}</p>
                      </div>
                    );
                  }

                  return (
                    <div key={categoryKey} className="space-y-3">
                      {/* Category Header */}
                      <div className={`flex items-center justify-between p-3 rounded-xl ${colorScheme.bg} border ${colorScheme.border}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{colorScheme.icon}</span>
                          <span className={`font-semibold ${colorScheme.text}`}>{displayName}</span>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${colorScheme.text}`}>{totalValue}</p>
                          <p className="text-xs text-gray-500">tCO₂e total</p>
                        </div>
                      </div>

                      {/* Grid of entries */}
                      <div
                        className={`grid gap-3 ${
                          selectedCategory === categoryKey
                            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                        }`}
                      >
                        {entries.map((entry) => (
                          <div
                            key={entry._id}
                            className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all hover:border-gray-300"
                          >
                            {/* Unit Name */}
                            <div className="px-3 py-2 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                              <p className="text-sm font-medium text-gray-800 truncate" title={entry.unit}>
                                {entry.unit}
                              </p>
                            </div>

                            {/* Emission Value */}
                            <div className="px-3 py-2 border-b border-gray-100">
                              <div className="flex items-baseline justify-between">
                                <span className="text-xs text-gray-500">Emissions:</span>
                                <span className={`text-base font-bold ${categoryKey === "Location-Based" ? "text-blue-600" : "text-emerald-600"}`}>
                                  {entry.emissionTCo2e.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                              <span className="text-xs text-gray-400">tCO₂e</span>
                            </div>

                            {/* Electricity Consumption */}
                            <div className="px-3 py-2 bg-gray-50">
                              <div className="flex items-center gap-1">
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span className="text-xs text-gray-600 truncate">
                                  {entry.totalElectricityConsumed.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })} {entry.unit.toLowerCase().includes('kwh') ? 'kWh' : 'MWh'}
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
                    : "Showing top 3 sources per method"}
                </span>
                {!selectedCategory && (
                  <span className="text-orange-600">Click on chart bars for detailed view →</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scope2EmissionsSection;