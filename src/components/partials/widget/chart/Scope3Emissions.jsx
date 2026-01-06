// import React from "react";
// import RevenueBarChart from "@/components/partials/widget/chart/revenue-bar-chart";
// import { Tooltip } from "@mui/material";

// /* ------------------ Colors ------------------ */
// const categoryColors = {
//   "Purchased Goods & Services": "bg-blue-100 text-blue-800",
//   // "Purchased Goods": "bg-teal-100 text-teal-800",
//   "Capital Goods": "bg-indigo-100 text-indigo-800",
//   "Waste Generated in Operations": "bg-green-100 text-green-800",
//   "Business Travel": "bg-purple-100 text-purple-800",
//   "Employee Commuting": "bg-orange-100 text-orange-800",
//   "Upstream Transportations": "bg-red-100 text-red-800",
//   "Downstream Transportations": "bg-yellow-100 text-yellow-800",
//   "Fuel & Energy": "bg-pink-100 text-pink-800",
//   "Commute Records": "bg-gray-100 text-gray-800",
// };

// /* ------------------ Helper ------------------ */
// const normalizeToArray = (data) => {
//   if (!data) return [];
//   return Array.isArray(data) ? data : [data];
// };

// /* ------------------ Component ------------------ */
// const Scope3EmissionsSection = ({ dashboardData, loading }) => {
//   if (!dashboardData?.scope3) return null;

//   const s3 = dashboardData.scope3;

//   // Normalize all categories
//   const purchasedGoodsAndServices = normalizeToArray(s3.purchasedGoodsAndServices);
//   const purchasedGoods = normalizeToArray(s3.purchasedGoods);
//   const capitalGoods = normalizeToArray(s3.CapitalGoods);
//   const wasteGenerated = normalizeToArray(s3.wasteGeneratedInOperations);
//   const businessTravel = normalizeToArray(s3.businessTravel);
//   const employeeCommuting = normalizeToArray(s3.CommuteRecords);
//   const upstreamTransport = normalizeToArray(s3.UpstreamTransportations);
//   const downstreamTransport = normalizeToArray(s3.DownstreamTransportations);
//   const fuelAndEnergy = normalizeToArray(s3.FuelAndEnergys);
//   const upstreamList = normalizeToArray(s3.Upstreamlist);
//   const downstreamList = normalizeToArray(s3.Downstreamlist);
//   const fuelAndEnergyList = normalizeToArray(s3.FuelandEnergylist);


//   // Bar chart
//   const barChartData = [
//     { name: "Purchased Goods", value: purchasedGoodsAndServices.reduce((s, i) => s + (i.totalEmissionTCo2e || 0), 0) },
//     { name: "Purchased Goods", value: purchasedGoods.reduce((s, i) => s + (i.totalEmissionTCo2e || 0), 0) },
//     { name: "Capital Goods", value: capitalGoods.reduce((s, i) => s + (i.totalEmissionTCo2e || 0), 0) },
//     { name: "Waste Generated", value: wasteGenerated.reduce((s, i) => s + (i.totalEmissionTCo2e || 0), 0) },
//     { name: "Business Travel", value: businessTravel.reduce((s, i) => s + (i.totalEmissionTCo2e || 0), 0) },
//     { name: "Employee Commuting", value: employeeCommuting.reduce((s, i) => s + (i.totalEmissionTCo2e || 0), 0) },
//     { name: "Upstream", value: upstreamTransport.reduce((s, i) => s + (i.totalEmissionTCo2e || 0), 0) },
//     { name: "Downstream", value: downstreamTransport.reduce((s, i) => s + (i.totalEmissionTCo2e || 0), 0) },
//     { name: "Fuel & Energy", value: fuelAndEnergy.reduce((s, i) => s + (i.totalEmissionTCo2e || 0), 0) },
//   ];

//   const totalScope3 = barChartData.reduce((sum, i) => sum + i.value, 0);

//   // Table sections
//   const tableSections = [
//     { title: "Purchased Goods & Services", data: purchasedGoodsAndServices, quantityLabel: "tCO₂e", quantityKey: "totalEmissionTCo2e" },
//     // { title: "Purchased Goods", data: purchasedGoods, quantityLabel: "tCO₂e", quantityKey: "totalEmissionTCo2e" },
//     // { title: "Capital Goods", data: capitalGoods, quantityLabel: "tCO₂e", quantityKey: "totalEmissionTCo2e" },
//     { title: "Waste Generated in Operations", data: wasteGenerated, quantityLabel: "tCO₂e", quantityKey: "totalEmissionTCo2e" },
//     { title: "Business Travel", data: businessTravel, quantityLabel: "tCO₂e", quantityKey: "totalEmissionTCo2e" },
//     { title: "Employee Commuting", data: employeeCommuting, quantityLabel: "tCO₂e", quantityKey: "totalEmissionTCo2e" },
//     { title: "Upstream Transportations", data: upstreamList, quantityLabel: "tCO₂e", quantityKey: "totalEmissionTCo2e" },
//     { title: "Downstream Transportations", data: downstreamList, quantityLabel: "tCO₂e", quantityKey: "totalEmissionTCo2e" },
//     { title: "Fuel & Energy", data: fuelAndEnergyList, quantityLabel: "tCO₂e", quantityKey: "totalEmissionTCo2e" },
//   ];

//   const getTop10ByEmission = (data = []) => {
//     return [...data]
//       .sort(
//         (a, b) =>
//           Number(b.totalEmissionTCo2e || 0) -
//           Number(a.totalEmissionTCo2e || 0)
//       )
//       .slice(0, 10);
//   };

//   return (
//     <div className="flex flex-col md:flex-row gap-8">
//       {/* Bar Chart */}
//       <div className="flex-1 min-w-[320px] p-6 bg-white rounded-xl shadow-lg border border-gray-200">
//         <h3 className="font-semibold mb-3 text-gray-900 text-xl">
//           Scope 3 Emissions by Category
//         </h3>
//         <RevenueBarChart chartData={barChartData} loading={loading} />
//         <div className="mt-4 text-gray-700 font-semibold">
//           Total Scope 3 Emissions: <span className="text-gray-900">{totalScope3.toFixed(2)} tCO₂e</span>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="flex-1 min-w-[320px] p-6 bg-white rounded-xl shadow-lg border border-gray-200 overflow-auto max-h-[520px]">
//         <h3 className="font-semibold mb-4 text-gray-900 text-xl">
//           Scope 3 Detailed Breakdown
//         </h3>
//         <table className="w-full border-collapse table-auto text-sm">
//           <thead className="sticky top-0 bg-gray-50 z-10">
//             <tr>
//               <th className="border-b p-3 text-left">Category</th>
//               <th className="border-b p-3 text-left">Type</th>
//               <th className="border-b p-3 text-right">Emission (tCO₂e)</th>
//               <th className="border-b p-3 text-right">Quantity</th>
//             </tr>
//           </thead>
//           <tbody>
//             {tableSections.map(({ title, data, quantityLabel, quantityKey }) => {
//               const top10Data = getTop10ByEmission(data);

//               return top10Data.length ? (
//                 top10Data.map((row, idx) => (
//                   <tr
//                     key={`${title}-${idx}`}
//                     className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
//                   >
//                     {idx === 0 && (
//                       <td
//                         rowSpan={top10Data.length}
//                         className={`border p-3 font-semibold align-middle ${categoryColors[title]}`}
//                       >
//                         {title}
//                       </td>
//                     )}

//                     <td className="border p-3">{row._id ?? "N/A"}</td>

//                     <td className="border p-3 text-right font-semibold">
//                       {Number(row.totalEmissionTCo2e || 0).toFixed(2)}
//                     </td>

//                     <td className="border p-3 text-right">
//                       {Number(row[quantityKey] || 0).toLocaleString()}
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr key={title}>
//                   <td
//                     className={`border p-3 font-semibold ${categoryColors[title]}`}
//                   >
//                     {title}
//                   </td>
//                   <td
//                     colSpan={3}
//                     className="border p-3 text-center italic text-gray-400"
//                   >
//                     No data available
//                   </td>
//                 </tr>
//               );
//             })}

//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default Scope3EmissionsSection;


import React, { useState } from "react";
import RevenueBarChart from "@/components/partials/widget/chart/revenue-bar-chart";
import { Tooltip } from "@mui/material";
import Button from "@/components/ui/Button";

/* ------------------ Colors ------------------ */
const categoryColors = {
  "Purchased Goods & Services": "bg-blue-100 text-blue-800",
  "Capital Goods": "bg-indigo-100 text-indigo-800",
  "Waste Generated in Operations": "bg-green-100 text-green-800",
  "Business Travel": "bg-purple-100 text-purple-800",
  "Employee Commuting": "bg-orange-100 text-orange-800",
  "Upstream Transportations": "bg-red-100 text-red-800",
  "Downstream Transportations": "bg-yellow-100 text-yellow-800",
  "Fuel & Energy": "bg-pink-100 text-pink-800",
  "Commute Records": "bg-gray-100 text-gray-800",
};

/* ------------------ Helper ------------------ */
const normalizeToArray = (data) => {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
};

/* ------------------ Component ------------------ */
const Scope3EmissionsSection = ({ dashboardData, loading }) => {
  if (!dashboardData?.scope3) return null;

  const s3 = dashboardData.scope3;

  /* ------------------ STATE ------------------ */
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [rowLimit, setRowLimit] = useState(3);

  // Normalize all categories
  const purchasedGoodsAndServices = normalizeToArray(s3.purchasedGoodsAndServices);
  const capitalGoods = normalizeToArray(s3.CapitalGoods);
  const wasteGenerated = normalizeToArray(s3.wasteGeneratedInOperations);
  const businessTravel = normalizeToArray(s3.businessTravel);
  const employeeCommuting = normalizeToArray(s3.CommuteRecords);
  const upstreamTransport = normalizeToArray(s3.UpstreamTransportations);
  const downstreamTransport = normalizeToArray(s3.DownstreamTransportations);
  const fuelAndEnergy = normalizeToArray(s3.FuelAndEnergys);
  const upstreamList = normalizeToArray(s3.Upstreamlist);
  const downstreamList = normalizeToArray(s3.Downstreamlist);
  const fuelAndEnergyList = normalizeToArray(s3.FuelandEnergylist);
  
  // Handle Capital Goods Data separately
  const capitalGoodsData = s3.CapitalGoodsData || [];
  const capitalGoodsList = capitalGoodsData.length > 0 ? capitalGoodsData[0]?.list || [] : [];
  
  // Handle Business Travel Data separately
  const businessTravelData = s3.BusinessTravelData || [];
  const businessTravelList = businessTravelData.length > 0 ? businessTravelData[0]?.list || [] : [];

  // Bar chart - Calculate totals for each category
  const barChartData = [
    { 
      name: "Purchased Goods & Services", 
      value: purchasedGoodsAndServices.reduce((s, i) => s + (i.totalEmissionTCo2e || 0), 0) 
    },
    { 
      name: "Capital Goods", 
      value: capitalGoods.reduce((s, i) => s + (i.totalEmissionTCo2e || 0), 0) 
    },
    { 
      name: "Waste Generated", 
      value: wasteGenerated.reduce((s, i) => s + (i.totalEmissionTCo2e || 0), 0) 
    },
    { 
      name: "Business Travel", 
      value: businessTravel.reduce((s, i) => s + (i.totalEmissionTCo2e || 0), 0) 
    },
    { 
      name: "Employee Commuting", 
      value: employeeCommuting.reduce((s, i) => s + (i.totalEmissionTCo2e || 0), 0) 
    },
    { 
      name: "Upstream Transportations", 
      value: upstreamTransport.reduce((s, i) => s + (i.totalEmissionTCo2e || 0), 0) 
    },
    { 
      name: "Downstream Transportations", 
      value: downstreamTransport.reduce((s, i) => s + (i.totalEmissionTCo2e || 0), 0) 
    },
    { 
      name: "Fuel & Energy Related Activities", 
      value: fuelAndEnergy.reduce((s, i) => s + (i.totalEmissionTCo2e || 0), 0) 
    },
  ];

  /* ------------------ PROCESS CAPITAL GOODS DATA ------------------ */
  const processCapitalGoodsData = () => {
    if (!capitalGoodsList || capitalGoodsList.length === 0) return [];
    
    // Group by purchasedActivityType
    const goodsByCategory = {};
    
    capitalGoodsList.forEach(item => {
      // Use purchasedActivityType or a default category
      const category = item.purchasedActivityType || item.purchaseCategory || "Other Goods";
      
      if (!goodsByCategory[category]) {
        goodsByCategory[category] = {
          _id: category,
          totalEmissionTCo2e: 0,
          count: 0,
          amountSpent: 0,
          items: []
        };
      }
      
      goodsByCategory[category].totalEmissionTCo2e += 
        (item.calculatedEmissionTCo2e || 0);
      goodsByCategory[category].count++;
      goodsByCategory[category].amountSpent += 
        parseFloat(item.amountSpent || 0);
      goodsByCategory[category].items.push(item);
    });
    
    // Convert to array and sort by emissions (highest first)
    return Object.values(goodsByCategory)
      .sort((a, b) => b.totalEmissionTCo2e - a.totalEmissionTCo2e);
  };

  const capitalGoodsTopCategories = processCapitalGoodsData();

  /* ------------------ PROCESS BUSINESS TRAVEL DATA ------------------ */
  const processBusinessTravelData = () => {
    if (!businessTravelList || businessTravelList.length === 0) return [];
    
    // Group by stakeholder
    const travelByStakeholder = {};
    
    businessTravelList.forEach(item => {
      // Use stakeholder or a default category
      const stakeholder = item.stakeholder || "Other Travel";
      
      if (!travelByStakeholder[stakeholder]) {
        travelByStakeholder[stakeholder] = {
          _id: stakeholder,
          totalEmissionTCo2e: 0,
          count: 0,
          buildingIds: new Set()
        };
      }
      
      travelByStakeholder[stakeholder].totalEmissionTCo2e += 
        (item.calculatedEmissionTCo2e || 0);
      travelByStakeholder[stakeholder].count++;
      if (item.buildingId) {
        travelByStakeholder[stakeholder].buildingIds.add(item.buildingId);
      }
    });
    
    // Convert to array and sort by emissions (highest first)
    return Object.values(travelByStakeholder)
      .map(item => ({
        ...item,
        buildingCount: item.buildingIds.size,
        buildingIds: Array.from(item.buildingIds)
      }))
      .sort((a, b) => b.totalEmissionTCo2e - a.totalEmissionTCo2e);
  };

  const businessTravelTopCategories = processBusinessTravelData();

  /* ------------------ TABLE DATA ------------------ */
  const topScope3Categories = {
    "Purchased Goods & Services": purchasedGoodsAndServices,
    "Capital Goods": capitalGoodsTopCategories, // Use processed capital goods data
    "Waste Generated in Operations": wasteGenerated,
    "Business Travel": businessTravelTopCategories, // Use processed business travel data
    "Employee Commuting": employeeCommuting,
    "Upstream Transportations": upstreamList,
    "Downstream Transportations": downstreamList,
    "Fuel & Energy": fuelAndEnergyList,
  };

  /* ------------------ BAR CLICK HANDLER ------------------ */
  const handleBarClick = (data) => {
    if (!data?.name) return;
    setSelectedCategory(data.name);
    setRowLimit(10);
  };

  /* ------------------ RESET VIEW ------------------ */
  const resetView = () => {
    setSelectedCategory(null);
    setRowLimit(3);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* ==================== BAR CHART ==================== */}
      <div className="flex-1 w-[600px] p-6 bg-white rounded-xl shadow-lg border">
        <h3 className="font-semibold mb-3 text-xl text-gray-900">
          Scope 3 Emissions by Category
        </h3>
        <p className="mb-6 text-gray-600">
          Indirect emissions from the value chain.
        </p>

        <RevenueBarChart
          chartData={barChartData}
          loading={loading}
          onBarClick={handleBarClick}
          selectedCategory={selectedCategory}
        />
      </div>

      {/* ==================== TABLE ==================== */}
      <div className="flex-1 min-w-[320px] p-6 bg-white rounded-xl shadow-lg border overflow-auto max-h-[620px] scrollbar-hide">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-xl text-gray-900">
            Top Categories
          </h3>

          {selectedCategory && (
            <Button
              onClick={resetView}
              className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
            >
              Reset view
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {Object.entries(topScope3Categories)
            .filter(([category]) => (selectedCategory ? category === selectedCategory : true))
            .map(([category, items]) => {
              // Get top items based on row limit
              const visibleItems = items
                .sort((a, b) => (b.totalEmissionTCo2e || 0) - (a.totalEmissionTCo2e || 0))
                .slice(0, rowLimit);

              if (!visibleItems.length) {
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
                <div key={category} className="border border-gray-300 rounded p-2">
                  {/* Category Label */}
                  <div className={`font-semibold mb-2 p-1 rounded-md ${categoryColors[category]}`}>
                    {category}
                
                  </div>

                  {/* Grid for items */}
                  <div
                    className={`grid gap-2 w-full ${selectedCategory
                        ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                        : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
                      }`}
                  >
                    {visibleItems.map((item, idx) => (
                      <div key={idx} className="flex-1 min-w-0 border border-gray-300 rounded overflow-hidden">
                        {/* Item Name */}
                        <div className="p-2 font-medium border-b text-center truncate bg-gray-50">
                          {item._id || "N/A"}
                         
                        </div>
                        
                        {/* Emission Value */}
                        <div className="p-2 text-red-600 font-semibold border-b text-center truncate">
                          {Number(item.totalEmissionTCo2e || 0).toLocaleString(undefined, {
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
  );
};

export default Scope3EmissionsSection;