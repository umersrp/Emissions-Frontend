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

const ScopeEmissionsSection = ({ dashboardData, loading , resetTrigger = 0,  

  onRegisterReset }) => {
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
      name: "Stationary", // Category key for filtering
      displayName: "Stationary Combustion", // Display name for chart
      value: totalEmissionFor(dashboardData.scope1.stationaryListData, "Stationary"),
    },
    {
      name: "Mobile",
      displayName: "Mobile Combustion",
      value: totalEmissionFor(dashboardData.scope1.transportListData, "Mobile"),
    },
    {
      name: "Fugitive",
      displayName: "Fugitive Emission",
      value: totalEmissionFor(dashboardData.scope1.fugitiveListData, "Fugitive"),
    },
    {
      name: "Process",
      displayName: "Process Emission",
      value: totalEmissionFor(processData, "Process"),
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
    setSelectedCategory(data.name); // This is now the category key
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

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* ==================== BAR CHART ==================== */}
      <div className="flex-1 w-[600px] p-6 bg-white rounded-xl shadow-lg border">
        <h3 className="font-semibold mb-3 text-xl text-gray-900">
          Scope 1 Emissions
        </h3>
        <p className="mb-6 text-gray-600">
          Direct emissions from owned or controlled sources.
        </p>

        <RevenueBarChart
          chartData={barChartData}
          loading={loading}
          onBarClick={handleBarClick}
          selectedCategory={selectedCategory}
        />
      </div>

      {/* ==================== TABLE ==================== */}
      <div className="flex-1 min-w-[320px] p-6 bg-white rounded-xl shadow-lg border overflow-auto max-h-[610px] scrollbar-hide">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-xl text-gray-900">
            Top Categories
          </h3>

          {selectedCategory && (
            <button
              onClick={resetView}
              className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
            >
              Reset view
            </button>
          )}
        </div>

        <div className="space-y-4">
          {Object.entries(topItemsByCategory)
            .filter(([categoryKey]) => 
              selectedCategory ? categoryKey === selectedCategory : true
            )
            .map(([categoryKey, items]) => {
              // Find the display name for this category
              const categoryInfo = barChartData.find(item => item.name === categoryKey);
              const categoryDisplayName = categoryInfo?.displayName || categoryKey;

              if (!items.length) {
                return (
                  <div
                    key={categoryKey}
                    className={`border border-gray-300 rounded p-2 font-semibold ${categoryColors[categoryKey] || 'bg-gray-100 text-gray-800'}`}
                  >
                    {categoryDisplayName} - <span className="italic text-gray-400">No data available</span>
                  </div>
                );
              }

              return (
                <div key={categoryKey} className="border border-gray-300 rounded p-2">
                  {/* Category Label */}
                  <div className={`font-semibold mb-2 p-1 rounded-md ${categoryColors[categoryKey] || 'bg-gray-100 text-gray-800'}`}>
                    {categoryDisplayName}
                  </div>

                  {/* Grid for items */}
                  <div
                    className={`grid gap-2 w-full ${
                      selectedCategory
                        ? "grid-cols-1 sm:grid-cols-2"
                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    }`}
                  >
                    {items.map((item, idx) => {
                      const emissionValue = getEmissionValue(item, categoryKey);
                      return (
                        <div key={idx} className="flex-1 min-w-0 border border-gray-300 rounded overflow-hidden">
                          {/* Item Name Row */}
                          <div className="p-2 font-medium border-b text-center truncate bg-gray-50">
                            {getDisplayName(item, categoryKey)}
                          </div>
                          {/* Emission Row */}
                          <div className="p-2 text-red-600 font-semibold border-b text-center truncate">
                            {formatEmissionValue(emissionValue)} tCO₂e
                          </div>
                          {/* Quantity Row */}
                          <div className="p-2 text-gray-700 font-medium text-center truncate">
                            {getQuantityDisplay(item, categoryKey)}
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
    </div>
  );
};

export default ScopeEmissionsSection;


