// import React from "react";
// import RevenueBarChart from "@/components/partials/widget/chart/revenue-bar-chart";
// import { Tooltip } from "@mui/material";
// import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

// /* =======================
//    UI CONFIG
// ======================= */
// const categoryColors = {
//   "Purchased Electricity": "bg-yellow-100 text-yellow-800",
// };

// const unitColors = {
//   kWh: "text-blue-600",
//   MWh: "text-green-600",
//   Unknown: "text-gray-400",
// };

// const normalizeUnit = (unit) => {
//   if (!unit) return "Unknown";
//   const u = unit.toLowerCase();
//   if (u === "kwh") return "kWh";
//   if (u === "mwh") return "MWh";
//   return unit;
// };

// /* =======================
//    AGGREGATION LOGIC
// ======================= */
// const aggregateElectricityByUnit = (list = []) => {
//   const map = {};
//   list.forEach((item) => {
//     const unit = normalizeUnit(item.unit);
//     if (!map[unit]) {
//       map[unit] = {
//         _id: unit,
//         totalLocationTCo2e: 0,
//         totalElectricityConsumed: 0,
//       };
//     }
//     map[unit].totalLocationTCo2e += Number(item.calculatedEmissionTCo2e || 0);
//     map[unit].totalElectricityConsumed += Number(item.totalElectricity || 0);
//   });
//   return Object.values(map);
// };

// /* =======================
//    COMPONENT
// ======================= */
// const Scope2EmissionsSection = ({ dashboardData, loading }) => {
//   if (!dashboardData?.scope2) return null;

//   const scope2 = dashboardData.scope2;

//   /* ---------- State ---------- */
//   const [selectedBuildingName, setSelectedBuildingName] = React.useState(null);

//   /* ---------- Bar Chart ---------- */
// let barChartData = [];

// if (scope2.purchasedElectricity) {
//   barChartData.push({
//     name: "Purchased Electricity",
//     value: Number(scope2.purchasedElectricity.totalLocationTCo2e ?? 0),
//   });
// }

//   // Filter to selected building if any
//   if (selectedBuildingName) {
//     barChartData = barChartData.filter(
//       (b) => b.name === selectedBuildingName
//     );
//   }

//   /* ---------- Table Data ---------- */
//   const electricityByUnit = aggregateElectricityByUnit(
//     scope2.electricityListData || []
//   );
//   const topScope2Categories = {
//     "Purchased Electricity": electricityByUnit,
//   };

//   /* ---------- Total Emissions ---------- */
//   const totalScope2 = barChartData.reduce((sum, item) => sum + item.value, 0);

//   /* ---------- Handlers ---------- */
//   const handleBarClick = (data) => {
//     // Toggle selection: click same building again resets chart
//     if (selectedBuildingName === data.name) {
//       setSelectedBuildingName(null);
//     } else {
//       setSelectedBuildingName(data.name);
//     }
//   };

//   return (
//     <div className="flex flex-col gap-6">
//       {/* ================= Total Card ================= */}
//       <div className="flex justify-end">
//         <div className="p-4 btn-dark text-white rounded-xl shadow-md border border-black-400 font-semibold text-lg w-max">
//           Total Scope 2 Emissions: {totalScope2.toFixed(3)} tCO₂e
//         </div>
//       </div>

//       <div className="flex flex-col md:flex-row gap-8">
//         {/* ================= Chart Card ================= */}
//         <div className="flex-1 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="font-semibold text-xl text-gray-900">
//               Emissions by Building
//             </h3>
//             <Tooltip
//               title="This chart shows emissions from all buildings (tCO₂e)"
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
//           <RevenueBarChart
//             chartData={barChartData}
//             selectedCategory={selectedBuildingName}
//             height={400}
//             onBarClick={handleBarClick}
//           />
//         </div>

//         {/* ================= Table Card ================= */}
//         <div className="flex-1 p-6 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-auto max-h-[520px]">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="font-semibold text-xl text-gray-900">
//               Scope 2 – Purchased Electricity
//             </h3>
//             <Tooltip
//               title="This table shows emissions and consumption per unit"
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

//           <table className="w-full border-collapse table-auto text-sm">
//             <thead className="sticky top-0 bg-gray-50 z-10">
//               <tr>
//                 <th className="border-b p-3 text-left">Category</th>
//                 <th className="border-b p-3 text-left">Unit</th>
//                 <th className="border-b p-3 text-right">Emission (tCO₂e)</th>
//                 <th className="border-b p-3 text-right">Quantity</th>
//               </tr>
//             </thead>

//             <tbody>
//               {Object.entries(topScope2Categories).map(([category, fuels]) =>
//                 fuels.length > 0 ? (
//                   fuels.map((fuel, idx) => (
//                     <tr
//                       key={`${category}-${fuel._id}`}
//                       className={`transition-colors duration-200 hover:bg-yellow-50 ${
//                         idx % 2 === 0 ? "bg-white" : "bg-gray-50"
//                       }`}
//                     >
//                       {idx === 0 && (
//                         <td
//                           rowSpan={fuels.length}
//                           className={`border p-3 font-semibold align-middle ${categoryColors[category]}`}
//                         >
//                           {category}
//                         </td>
//                       )}

//                       <td className="border p-3">{normalizeUnit(fuel._id)}</td>

//                       <td
//                         className={`border p-3 text-right font-semibold ${
//                           unitColors[fuel._id] || ""
//                         }`}
//                       >
//                         <Tooltip title="Location-based emissions" arrow>
//                           <span>{Number(fuel.totalLocationTCo2e).toFixed(3)}</span>
//                         </Tooltip>
//                       </td>

//                       <td className="border p-3 text-right">
//                         <div className="flex items-center justify-end gap-2">
//                           <span>
//                             {fuel.totalElectricityConsumed} {normalizeUnit(fuel._id)}
//                           </span>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr key={category}>
//                     <td
//                       className={`border p-3 font-semibold ${categoryColors[category]}`}
//                     >
//                       {category}
//                     </td>
//                     <td
//                       className="border p-3 text-center italic text-gray-400"
//                       colSpan={3}
//                     >
//                       No data available
//                     </td>
//                   </tr>
//                 )
//               )}
//             </tbody>
//           </table>
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


const categoryColors = {
  "Location-Based": "bg-blue-100 text-blue-800",
  "Market-Based": "bg-green-100 text-green-800",
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

  // Filter entries by method type
  const filteredEntries = list.filter((item) => {
    const method = (item.method || "").toLowerCase();
    if (methodType === "Location-Based") {
      return method === "location_based";
    } else if (methodType === "Market-Based") {
      return method === "market_based";
    }
    return false;
  });

  // Sort entries by calculatedEmissionTCo2e (descending)
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    const aVal = Number(a.calculatedEmissionTCo2e || 0);
    const bVal = Number(b.calculatedEmissionTCo2e || 0);
    return bVal - aVal;
  });

  // Take top N entries
  return sortedEntries.slice(0, limit).map((item, index) => ({
    _id: item._id,
    unit: normalizeUnit(item.unit),
    totalElectricityConsumed: Number(item.totalElectricity || 0),
    emissionTCo2e: Number(item.calculatedEmissionTCo2e || 0),
    rank: index + 1,
    // Original data
    originalData: item
  }));
};


const Scope2EmissionsSection = ({ dashboardData, loading }) => {
  if (!dashboardData?.scope2) return null;

  const scope2 = dashboardData.scope2;

  /* ---------- State ---------- */
  const [selectedBuildingName, setSelectedBuildingName] = React.useState(null);
  const [selectedCategory, setSelectedCategory] = React.useState(null);
  const [rowLimit, setRowLimit] = React.useState(3);

  /* ---------- Bar Chart ---------- */
  let barChartData = [];

  if (scope2.purchasedElectricity) {
    barChartData.push({
      name: "Location-Based",
      value: Number(scope2.purchasedElectricity.totalLocationTCo2e ?? 0),
      type: "location"
    });

    barChartData.push({
      name: "Market-Based",
      value: Number(scope2.purchasedElectricity.totalMarketTCo2e ?? 0),
      type: "market"
    });
  }

  // Filter to selected building if any
  if (selectedBuildingName) {
    barChartData = barChartData.filter(
      (b) => b.name === selectedBuildingName
    );
  }

  /* ---------- Table Data ---------- */
  // Get top entries for each category based on method
  const topLocationEntries = getTopEntriesByMethod(
    scope2.electricityListData || [],
    "Location-Based",
    selectedCategory === "Location-Based" ? 10 : 3
  );

  const topMarketEntries = getTopEntriesByMethod(
    scope2.electricityListData || [],
    "Market-Based",
    selectedCategory === "Market-Based" ? 10 : 3
  );

  const topScope2Categories = {
    "Location-Based": topLocationEntries,
    "Market-Based": topMarketEntries
  };

  /* ---------- Total Emissions ---------- */
  const totalScope2 = barChartData.reduce((sum, item) => sum + item.value, 0);
  const locationTotal = Number(scope2.purchasedElectricity?.totalLocationTCo2e || 0);
  const marketTotal = Number(scope2.purchasedElectricity?.totalMarketTCo2e || 0);

  /* ---------- Handlers ---------- */
  const handleBarClick = (data) => {
    if (!data?.name) return;
    const category = data.name;

    if (selectedCategory === category) {
      // If same category is clicked again, reset
      resetView();
    } else {
      // Set selected category and show top 10 entries
      setSelectedCategory(category);
      setRowLimit(10);
      setSelectedBuildingName(category);
    }
  };

  /* ---------- Reset View ---------- */
  const resetView = () => {
    setSelectedCategory(null);
    setSelectedBuildingName(null);
    setRowLimit(3);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ================= Total Card ================= */}
      <div className="flex justify-end">
        <div className="p-4 btn-dark text-white rounded-xl shadow-md border border-black-400 font-semibold text-lg w-max">
          <div>Total Scope 2 Emissions: {totalScope2.toFixed(3)} tCO₂e</div>
          <div className="text-sm mt-1 opacity-90">
            <span className="mr-4">Location: {locationTotal.toFixed(3)} tCO₂e</span>
            <span>Market: {marketTotal.toFixed(3)} tCO₂e</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* ================= Chart Card ================= */}
        <div className="flex-1 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-xl text-gray-900">
              Scope 2 Emissions by Type
            </h3>
            <Tooltip
              title="This chart shows location-based and market-based emissions (tCO₂e)"
              arrow
            >
              <span className="cursor-pointer text-gray-400 hover:text-gray-600">
                <InfoOutlinedIcon
                  className="text-red-400 cursor-pointer"
                  fontSize="small"
                />
              </span>
            </Tooltip>
          </div>
          <RevenueBarChart
            chartData={barChartData}
            selectedCategory={selectedCategory || selectedBuildingName}
            height={400}
            onBarClick={handleBarClick}
          />
        </div>

        {/* ================= Table Card ================= */}
        <div className="flex-1 min-w-[320px] p-6 bg-white rounded-xl shadow-lg border overflow-auto max-h-[520px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-xl text-gray-900">
              Top Emission Entries by Method
            </h3>

            <div className="flex items-center gap-4">
              <Tooltip
                title="Shows top entries based on method (location_based or market_based)"
                arrow
              >
                <span className="cursor-pointer text-gray-400 hover:text-gray-600">
                  <InfoOutlinedIcon
                    className="text-red-400 cursor-pointer"
                    fontSize="small"
                  />
                </span>
              </Tooltip>

              {selectedCategory && (
                <button
                  onClick={resetView}
                  className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
                >
                  Reset view
                </button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {Object.entries(topScope2Categories).map(([category, entries]) => {
              // Skip showing this category if another is selected
              if (selectedCategory && selectedCategory !== category) {
                return null;
              }

              const itemsToShow = selectedCategory === category ? 10 : 3;

              if (!entries.length) {
                return (
                  <div
                    key={category}
                    className={`border border-gray-300 rounded p-2 font-semibold ${categoryColors[category]}`}
                  >
                    {category} - <span className="italic text-gray-400">No data available</span>
                  </div>
                );
              }

              return (
                <div key={category} className="border border-gray-300 rounded p-3">
                  {/* Category Label */}
                  <div className={`font-semibold mb-3 p-2 rounded-md scrollbar-hide ${categoryColors[category]}`}>
                    {category}
                  </div>

                  {/* Grid for entries */}
                  <div
                    className={`grid gap-2 w-full ${selectedCategory === category
                        ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                        : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                      }`}
                  >
                    {entries.slice(0, itemsToShow).map((entry) => (
                      <div key={entry._id} className="flex-1 min-w-0 border border-gray-300 rounded overflow-hidden">
                        {/* Unit name */}
                        <div className="p-2 font-medium border-b text-center truncate">
                          {entry.unit}
                        </div>

                        {/* Emission value */}
                        <div className={`p-2 font-semibold text-center truncate ${category === "Location-Based" ? "text-red-600" : "text-blue-600"
                          }`}>
                          {entry.emissionTCo2e.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })} tCO₂e
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scope2EmissionsSection;