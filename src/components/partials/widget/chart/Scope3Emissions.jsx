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
const getTotalEmissions = (dataArray) => {
  if (!dataArray || dataArray.length === 0) return 0;

  // Check if data has totals property (like your purchasedGoodsAndServices example)
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
    // Calculate from list items
    const allItems = dataArray.flatMap(item => item.list || []);
    return allItems.reduce((sum, item) => {
      return sum + (item.calculatedEmissionTCo2e || 0);
    }, 0);
  }

  return 0;
};

/* ------------------ Component ------------------ */
const Scope3EmissionsSection = ({ dashboardData, loading, resetTrigger = 0,  // Add default value here
  onRegisterReset }) => {
  if (!dashboardData?.scope3) return null;

  const s3 = dashboardData.scope3;

  /* ------------------ STATE ------------------ */
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [rowLimit, setRowLimit] = useState(3);

  // Normalize all categories
  const purchasedGoodsAndServices = normalizeToArray(s3.purchasedGoodsAndServices);
  const capitalGoods = normalizeToArray(s3.CapitalGoods);
  const fuelAndEnergyList = normalizeToArray(s3.FuelandEnergylist);
  const wasteGenerated = normalizeToArray(s3.wasteGeneratedInOperations);
  const businessTravel = normalizeToArray(s3.businessTravel);
  const employeeCommuting = normalizeToArray(s3.CommuteRecords);
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

  // Bar chart - Calculate totals for each category using the helper function
  const barChartData = [
    {
      name: "Purchased Goods & Services",
      value: getTotalEmissions(purchasedGoodsAndServices)
    },
    {
      name: "Capital Goods",
      value: getTotalEmissions(capitalGoods)
    },
    {
      name: "Fuel & Energy Related Activities",
      value: getTotalEmissions(fuelAndEnergy)
    },
    {
      name: "Waste Generated",
      value: getTotalEmissions(wasteGenerated)
    },
    {
      name: "Business Travel",
      value: getTotalEmissions(businessTravel)
    },
    {
      name: "Employee Commuting",
      value: getTotalEmissions(employeeCommuting)
    },
    {
      name: "Upstream Transportations",
      value: getTotalEmissions(upstreamTransport)
    },
    {
      name: "Downstream Transportations",
      value: getTotalEmissions(downstreamTransport)
    },

  ];

  // Debug: Log the bar chart data to see what's happening
  console.log('Bar Chart Data:', barChartData);
  console.log('Purchased Goods Data:', purchasedGoodsAndServices);
  console.log('Waste Generated Data:', wasteGenerated);
  console.log('Fuel & Energy Data:', fuelAndEnergy);


  /* ------------------ PROCESS PURCHASED GOODS DATA ------------------ */
  const processPurchasedGoodsData = () => {
    if (!purchasedGoodsAndServices || purchasedGoodsAndServices.length === 0) return [];

    // First, check if we need to flatten the data or if it's already flat
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

  const purchasedGoodsTopCategories = processPurchasedGoodsData();

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
    }))
      .sort((a, b) => b.totalEmissionTCo2e - a.totalEmissionTCo2e);
  };
  const capitalGoodsTopCategories = processCapitalGoodsData();

  /* ------------------ PROCESS FUEL & ENERGY DATA ------------------ */
  const processFuelEnergyData = () => {
    if (!fuelAndEnergyList || fuelAndEnergyList.length === 0) return [];

    // Extract individual items from list property if available
    const allItems = fuelAndEnergyList.flatMap(item =>
      item.list && Array.isArray(item.list) ? item.list : [item]
    );

    // Map individual items
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

  const fuelEnergyTopCategories = processFuelEnergyData();

  /* ------------------ PROCESS WASTE GENERATED DATA ------------------ */
  const processWasteGeneratedData = () => {
    if (!wasteGenerated || wasteGenerated.length === 0) return [];

    // First, extract all individual items (flattening lists if they exist)
    const allItems = wasteGenerated.flatMap(item =>
      item.list && Array.isArray(item.list) ? item.list : [item]
    );

    // Map individual items
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

  const wasteGeneratedTopCategories = processWasteGeneratedData();
  /* ------------------ PROCESS BUSINESS TRAVEL DATA ------------------ */
  const processBusinessTravelData = () => {
    if (!businessTravelList || businessTravelList.length === 0) return [];

    return businessTravelList.map(item => ({
      _id: item.stakeholder || "Other Travel",
      databaseId: item._id,
      totalEmissionTCo2e: item.calculatedEmissionTCo2e || 0,
      originalItem: item
    }))
      .sort((a, b) => b.totalEmissionTCo2e - a.totalEmissionTCo2e);
  };
  const businessTravelTopCategories = processBusinessTravelData();

  /* ------------------ PROCESS EMPLOYEE COMMUTING DATA ------------------ */
  const processEmployeeCommutingData = () => {
    if (!employeeCommuting || employeeCommuting.length === 0) return [];

    return employeeCommuting.map(item => ({
      _id: item.commuteType || item.stakeholder || "Uncategorized",
      databaseId: item._id,
      totalEmissionTCo2e: item.calculatedEmissionTCo2e || item.totalEmissionTCo2e || 0,
      originalItem: item
    }))
      .sort((a, b) => b.totalEmissionTCo2e - a.totalEmissionTCo2e);
  };
  const employeeCommutingTopCategories = processEmployeeCommutingData();

  /* ------------------ PROCESS UPSTREAM TRANSPORT DATA ------------------ */
  const processUpstreamTransportData = () => {
    if (!upstreamList || upstreamList.length === 0) return [];

    // Extract individual items from list property if available
    const allItems = upstreamList.flatMap(item =>
      item.list && Array.isArray(item.list) ? item.list : [item]
    );

    // Map individual items
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

  const upstreamTransportTopCategories = processUpstreamTransportData();

  /* ------------------ PROCESS DOWNSTREAM TRANSPORT DATA ------------------ */
  const processDownstreamTransportData = () => {
    if (!downstreamList || downstreamList.length === 0) return [];

    // Extract individual items from list property if available
    const allItems = downstreamList.flatMap(item =>
      item.list && Array.isArray(item.list) ? item.list : [item]
    );

    // Map individual items
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

  const downstreamTransportTopCategories = processDownstreamTransportData();

  
  /* ------------------ TABLE DATA ------------------ */
  const topScope3Categories = {
    "Purchased Goods & Services": purchasedGoodsTopCategories,
    "Capital Goods": capitalGoodsTopCategories,
    "Fuel & Energy Related Activities": fuelEnergyTopCategories,
    "Waste Generated": wasteGeneratedTopCategories,
    "Business Travel": businessTravelTopCategories,
    "Employee Commuting": employeeCommutingTopCategories,
    "Upstream Transportations": upstreamTransportTopCategories,
    "Downstream Transportations": downstreamTransportTopCategories,
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
              const visibleItems = items.slice(0, rowLimit);

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
                      <div key={item.databaseId || idx} className="flex-1 min-w-0 border border-gray-300 rounded overflow-hidden">
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

                        <div className="p-2 font-medium border-b text-center truncate bg-gray-50">
                          {item.amount || "N/A"}{" "}{item.unit === 'USD' ? '$' : item.unit || ''}
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