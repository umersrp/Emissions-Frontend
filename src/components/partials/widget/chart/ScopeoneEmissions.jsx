import React, { useState, useMemo, useEffect } from "react";
import RevenueBarChart from "@/components/partials/widget/chart/revenue-bar-chart";
import { Tooltip } from "@mui/material";
import { FOR_UNIT_KG, FOR_UNIT_NM3, FOR_UNIT_THOUSAND_M3, FOR_UNIT_THOUSAND_KWH, FOR_UNIT_THOUSAND_KGCO2E} from "@/constant/scope1/calculate-process-emission";
/* -------------------- CATEGORY COLORS -------------------- */
const categoryColors = {
  Stationary: "bg-blue-100 text-blue-800",
  Mobile: "bg-green-100 text-green-800",
  Fugitive: "bg-purple-100 text-purple-800",
  Process: "bg-orange-100 text-orange-800",
};

/* -------------------- EMISSION NORMALIZER -------------------- */
const getEmissionValue = (fuel, category) => {
  if (!fuel) return 0;

  // Parse the value to number, handling string inputs and scientific notation
  const parseNumber = (value) => {
    if (value === null || value === undefined || value === "") return 0;
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      // Handle scientific notation like "9.00000e+7"
      if (value.includes('e')) {
        try {
          return parseFloat(value);
        } catch {
          return 0;
        }
      }
      const parsed = parseFloat(value.replace(/,/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Try to get emission value from different fields
  const getEmissionFromFields = (fuel) => {
    // First try calculatedEmissionTCo2e (most reliable)
    const tco2e = parseNumber(fuel.calculatedEmissionTCo2e);
    if (tco2e > 0) return tco2e;
    
    // Then try totalEmissionTCo2e
    const totalTco2e = parseNumber(fuel.totalEmissionTCo2e);
    if (totalTco2e > 0) return totalTco2e;
    
    // For Process, amountOfEmissions might be in different units
    // So we only use it as last resort
    return parseNumber(fuel.amountOfEmissions || 0);
  };

  switch (category) {
    case "Fugitive":
      // For fugitive, always prioritize calculatedEmissionTCo2e
      const fugitiveTco2e = parseNumber(fuel.calculatedEmissionTCo2e);
      if (fugitiveTco2e > 0) return fugitiveTco2e;
      
      // Fallback: convert leakage in kg to tCO2e
      const leakage = parseNumber(fuel.leakageValue);
      return leakage * 0.001;

    case "Mobile":
      // Mobile - use calculatedEmissionTCo2e
      return parseNumber(fuel.calculatedEmissionTCo2e);

    case "Stationary":
    case "Process":
    default:
      return getEmissionFromFields(fuel);
  }
};

/* -------------------- GET TOP N ITEMS BY EMISSION -------------------- */
const getTopItems = (items, category, limit = 3) => {
  if (!items || !Array.isArray(items) || items.length === 0) return [];

  // Map items with their emission values
  const itemsWithEmissions = items.map(item => ({
    ...item,
    emissionValue: getEmissionValue(item, category)
  }));

  // Sort by emission value in descending order
  const sortedItems = itemsWithEmissions.sort((a, b) => b.emissionValue - a.emissionValue);

  // Return top N items
  return sortedItems.slice(0, limit);
};

/* -------------------- GET NAME FOR DISPLAY -------------------- */
const getDisplayName = (fuel, category) => {
  switch (category) {
    case "Stationary":
    case "Mobile":
      return fuel?.fuelName || fuel?.fuelType || "—";
    
    case "Fugitive":
      return fuel?.materialRefrigerant || fuel?.fuelName || fuel?.fuelType || "—";
    
    case "Process":
      return fuel?.activityType || fuel?.fuelName || fuel?.fuelType || "—";
    
    default:
      return fuel?.fuelName || fuel?.fuelType || fuel?.activityType || "—";
  }
};

/* -------------------- GET QUANTITY DISPLAY -------------------- */
const getQuantityDisplay = (fuel, category) => {
  switch (category) {
    case "Stationary":
      if (fuel?.fuelConsumption !== undefined && fuel?.consumptionUnit) {
        return `${fuel.fuelConsumption} ${fuel.consumptionUnit}`;
      }
      return "—";
    
    case "Mobile":
      if (fuel?.distanceTraveled !== undefined && fuel?.distanceUnit) {
        return `${fuel.distanceTraveled} ${fuel.distanceUnit}`;
      }
      return "—";
    
    case "Fugitive":
      if (fuel?.leakageValue !== undefined) {
        const unit = fuel?.consumptionUnit || "kg";
        return `${fuel.leakageValue} ${unit}`;
      }
      return "—";
    
    // case "Process":
    //   // For Process, show amountOfEmissions if available
    //   if (fuel?.amountOfEmissions !== undefined) {
    //     // Hardcoded unit as "tonnes"
    //     return `${fuel.amountOfEmissions} tonnes`;
    //   }
     case "Process":
      // For Process, show amountOfEmissions if available
      if (fuel?.amountOfEmissions !== undefined && fuel?.activityType) {
        const activityType = fuel.activityType.trim();
        const amount = fuel.amountOfEmissions;
        
        // Check conditions based on activityType
        if (FOR_UNIT_KG.includes(activityType)) {
          return `${amount} kg`;
        } else if (activityType === FOR_UNIT_NM3) {
          return `${amount} Nm³`;
        } else if (activityType === FOR_UNIT_THOUSAND_M3) {
          return `${amount} m³`;
        } else if (activityType === FOR_UNIT_THOUSAND_KWH) {
          return `${amount} kWh`;
        } else if (FOR_UNIT_THOUSAND_KGCO2E.includes(activityType)) {
          return `${amount} kgCO₂e`;
        } else {
          // Default for all other process activities
          return `${amount} tonnes`;
        }
      }
      return "—";
    
    default:
      return "—";
  }
};

/* -------------------- FORMAT EMISSION VALUE -------------------- */
const formatEmissionValue = (value) => {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const ScopeEmissionsSection = ({ dashboardData, loading, resetTrigger = 0, onRegisterReset }) => {
  if (!dashboardData?.scope1) return null;

  /* -------------------- STATE -------------------- */
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [rowLimit, setRowLimit] = useState(3);

  /* -------------------- BAR CHART DATA -------------------- */
  const totalEmissionFor = (items, category) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, fuel) => sum + getEmissionValue(fuel, category), 0);
  };

  // Get process data
  const processData = useMemo(() => {
    return dashboardData.scope1.EmissionActivityListData || dashboardData.scope1.processEmissions || [];
  }, [dashboardData]);

  const barChartData = useMemo(() => [
    {
      name: "Stationary",
      displayName: "Stationary Combustion",
      value: totalEmissionFor(dashboardData.scope1.stationaryListData, "Stationary"),
      icon: "🔥",
      color: "from-blue-500 to-blue-600"
    },
    {
      name: "Mobile",
      displayName: "Mobile Combustion",
      value: totalEmissionFor(dashboardData.scope1.transportListData, "Mobile"),
      icon: "🚗",
      color: "from-green-500 to-green-600"
    },
    {
      name: "Fugitive",
      displayName: "Fugitive Emission",
      value: totalEmissionFor(dashboardData.scope1.fugitiveListData, "Fugitive"),
      icon: "💨",
      color: "from-orange-500 to-orange-600"
    },
    {
      name: "Process",
      displayName: "Process Emission",
      value: totalEmissionFor(processData, "Process"),
      icon: "🏭",
      color: "from-purple-500 to-purple-600"
    },
  ], [dashboardData, processData]);

  /* -------------------- TOP ITEMS BY CATEGORY -------------------- */
  const topItemsByCategory = useMemo(() => {
    const limit = rowLimit;
    
    return {
      Stationary: getTopItems(dashboardData.scope1.stationaryListData, "Stationary", limit),
      Mobile: getTopItems(dashboardData.scope1.transportListData, "Mobile", limit),
      Fugitive: getTopItems(dashboardData.scope1.fugitiveListData, "Fugitive", limit),
      Process: getTopItems(processData, "Process", limit),
    };
  }, [dashboardData, processData, rowLimit]);

  /* -------------------- BAR CLICK HANDLER -------------------- */
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

  /* -------------------- RESET VIEW -------------------- */
  const resetView = () => {
    setSelectedCategory(null);
    setRowLimit(3);
  };

  // Get category color
  const getCategoryColor = (categoryKey) => {
    const colors = {
      Stationary: "bg-blue-50 border-blue-200 text-blue-700",
      Mobile: "bg-green-50 border-green-200 text-green-700",
      Fugitive: "bg-orange-50 border-orange-200 text-orange-700",
      Process: "bg-purple-50 border-purple-200 text-purple-700"
    };
    return colors[categoryKey] || "bg-gray-50 border-gray-200 text-gray-700";
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* ==================== BAR CHART SECTION ==================== */}
      <div className="flex-1">
        <div className="h-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all hover:shadow-xl">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 7-3 1-3-1-1-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Scope 1 Emissions Overview</h3>
                  <p className="text-sm text-gray-500">Direct emissions from owned or controlled sources</p>
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

          {/* Chart Content */}
          <div className="p-6">
            {loading ? (
              <div className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-3"></div>
                  <p className="text-gray-500">Loading chart data...</p>
                </div>
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

          {/* Footer Stats */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Click on any bar to view detailed breakdown</span>
              <span className="font-medium">Data in tCO₂e</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== TABLE / DETAILS SECTION ==================== */}
      <div className="flex-1">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all hover:shadow-xl">
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
                    {selectedCategory ? `${barChartData.find(c => c.name === selectedCategory)?.displayName || selectedCategory} Details` : "Top Categories"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedCategory 
                      ? "Detailed breakdown of emission sources" 
                      : "Overview of top emission sources by category"}
                  </p>
                </div>
              </div>
              
              {/* Summary Badge */}
              {selectedCategory && (
                <div className="hidden sm:block">
                  <div className="px-3 py-1.5 bg-purple-50 rounded-lg">
                    <p className="text-xs font-medium text-purple-700">
                      Showing top {rowLimit} sources
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="max-h-[580px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="p-6 space-y-5">
              {Object.entries(topItemsByCategory)
                .filter(([categoryKey]) => 
                  selectedCategory ? categoryKey === selectedCategory : true
                )
                .map(([categoryKey, items]) => {
                  const categoryInfo = barChartData.find(item => item.name === categoryKey);
                  const categoryDisplayName = categoryInfo?.displayName || categoryKey;
                  const totalValue = categoryInfo?.value || 0;

                  if (!items.length) {
                    return (
                      <div
                        key={categoryKey}
                        className="border border-gray-200 rounded-xl p-6 text-center bg-gray-50"
                      >
                        <p className="text-gray-500">No data available for {categoryDisplayName}</p>
                      </div>
                    );
                  }

                  return (
                    <div key={categoryKey} className="space-y-3">
                      {/* Category Header */}
                      <div className={`flex items-center justify-between p-3 rounded-xl ${getCategoryColor(categoryKey)}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{categoryInfo?.icon || "📊"}</span>
                          <span className="font-semibold">{categoryDisplayName}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{formatEmissionValue(totalValue)}</p>
                          <p className="text-xs opacity-75">tCO₂e total</p>
                        </div>
                      </div>

                      {/* Items Grid */}
                      <div
                        className={`grid gap-3 ${
                          selectedCategory
                            ? "grid-cols-1 sm:grid-cols-2"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        }`}
                      >
                        {items.map((item, idx) => {
                          const emissionValue = getEmissionValue(item, categoryKey);
                          return (
                            <div
                              key={idx}
                              className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all hover:border-gray-300"
                            >
                              {/* Item Name */}
                              <div className="px-3 py-2 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                                <p className="text-sm font-medium text-gray-800 truncate" title={getDisplayName(item, categoryKey)}>
                                  {getDisplayName(item, categoryKey)}
                                </p>
                              </div>
                              
                              {/* Emission Value */}
                              <div className="px-3 py-2 border-b border-gray-100">
                                <div className="flex items-baseline justify-between">
                                  <span className="text-xs text-gray-500">Emissions:</span>
                                  <span className="text-base font-bold text-red-600">
                                    {formatEmissionValue(emissionValue)}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-400">tCO₂e</span>
                              </div>
                              
                              {/* Quantity */}
                              <div className="px-3 py-2 bg-gray-50">
                                <div className="flex items-center gap-1">
                                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  <span className="text-xs text-gray-600 truncate">
                                    {getQuantityDisplay(item, categoryKey)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
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
                  ? `${rowLimit} emission sources displayed` 
                  : "Showing top 3 sources per category"}
              </span>
              {!selectedCategory && (
                <span className="text-blue-600">Click on chart bars for detailed view →</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScopeEmissionsSection;