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

const Scope2EmissionsSection = ({ dashboardData, loading , resetTrigger = 0,  // Add default value here
  onRegisterReset }) => {
  if (!dashboardData?.scope2) return null;

  const scope2 = dashboardData.scope2;

  /* ---------- State ---------- */
  const [selectedBuildingName, setSelectedBuildingName] = React.useState(null);
  const [selectedCategory, setSelectedCategory] = React.useState(null);
  const [rowLimit, setRowLimit] = React.useState(3);

  /* ---------- Bar Chart ---------- */
  const barChartData = React.useMemo(() => {
    if (!scope2.purchasedElectricity) return [];

    return [
      {
        name: "Location Based",
        displayName: "Location Based", // Explicit display name
        categoryKey: "Location-Based", // For table filtering
        value: Number(scope2.purchasedElectricity.totalLocationTCo2e ?? 0),
        type: "location"
      },
      {
        name: "Market Based", 
        displayName: "Market Based", // Explicit display name
        categoryKey: "Market-Based", // For table filtering
        value: Number(scope2.purchasedElectricity.totalMarketTCo2e ?? 0),
        type: "market"
      }
    ].filter(item => item.value > 0); // Only show items with value > 0
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
    
    // Use the categoryKey for filtering, fallback to name
    const category = data.categoryKey || data.name;
    setSelectedCategory(category);
    setRowLimit(10);
  };
  /* -------------------- EFFECT TO RESET ON PARENT TRIGGER -------------------- */
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

  return (
    <div className="flex flex-col gap-6">
      {/* ================= Total Card ================= */}
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
            selectedCategory={selectedCategory}
            height={400}
            onBarClick={handleBarClick}
            loading={loading}
          />
        </div>

        {/* ================= Table Card ================= */}
        <div className="flex-1 min-w-[320px] p-6 bg-white rounded-xl shadow-lg border overflow-auto max-h-[520px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-xl text-gray-900">
              Top Categories
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
            {Object.entries(topScope2Categories).map(([categoryKey, entries]) => {
              // Skip showing this category if another is selected
              if (selectedCategory && selectedCategory !== categoryKey) {
                return null;
              }

              const displayName = getCategoryDisplayName(categoryKey);

              if (!entries.length) {
                return (
                  <div
                    key={categoryKey}
                    className={`border border-gray-300 rounded p-2 font-semibold ${categoryColors[categoryKey] || 'bg-gray-100 text-gray-800'}`}
                  >
                    {displayName} - <span className="italic text-gray-400">No data available</span>
                  </div>
                );
              }

              return (
                <div key={categoryKey} className="border border-gray-300 rounded p-3">
                  {/* Category Label */}
                  <div className={`font-semibold mb-3 p-2 rounded-md scrollbar-hide ${categoryColors[categoryKey] || 'bg-gray-100 text-gray-800'}`}>
                    {displayName}
                  </div>

                  {/* Grid for entries */}
                  <div
                    className={`grid gap-2 w-full ${selectedCategory === categoryKey
                        ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                        : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                      }`}
                  >
                    {entries.map((entry) => (
                      <div key={entry._id} className="flex-1 min-w-0 border border-gray-300 rounded overflow-hidden">
                        {/* Unit name */}
                        <div className="p-2 font-medium border-b text-center truncate bg-gray-50">
                          {entry.unit}
                        </div>

                        {/* Emission value */}
                        <div className={`p-2 font-semibold text-center truncate ${categoryKey === "Location-Based" ? "text-red-600" : "text-blue-600"}`}>
                          {entry.emissionTCo2e.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })} tCO₂e
                        </div>
                        
                        {/* Electricity Consumption */}
                        <div className="p-2 text-gray-700 font-medium text-center truncate border-t">
                          {entry.totalElectricityConsumed.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })} {entry.unit.toLowerCase().includes('kwh') ? 'kWh' : 'MWh'}
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