import React, { useState } from "react";
import RevenueBarChart from "@/components/partials/widget/chart/revenue-bar-chart";
import { Tooltip } from "@mui/material";

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

  switch (category) {
    case "Fugitive":
      // Example: convert leakage in kg to tCO2e
      // You may have a proper factor per refrigerant type
      const leakage = Number(fuel.leakageValue || 0);
      // Replace 0.001 with actual GWP factor per refrigerant
      return leakage * 0.001;

    case "Mobile":
    case "Transport":
      // Use calculatedEmissionTCo2e if present, fallback to kg
      return Number(fuel.calculatedEmissionTCo2e ?? fuel.calculatedEmissionKgCo2e ?? 0);

    default:
      // Stationary / Process
      return Number(fuel.totalEmissionTCo2e ?? fuel.calculatedEmissionTCo2e ?? fuel.amountOfEmissions ?? 0);
  }
};


/* -------------------- NAME NORMALIZER -------------------- */
const getFuelName = (fuel) => {
  return (
    // fuel?._id ||
    fuel?.activityType ||
    fuel?.fuelType ||
    fuel?.fuelName ||
    fuel?.equipmentType ||
    "—"
  );
};

const Scope1EmissionsSection = ({ dashboardData, loading }) => {
  if (!dashboardData?.scope1) return null;

  /* -------------------- STATE -------------------- */
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [rowLimit, setRowLimit] = useState(3);

  /* -------------------- BAR CHART DATA -------------------- */
  const totalEmissionFor = (item) => {
    if (!item) return 0;
    if (Array.isArray(item)) {
      return item.reduce((sum, f) => sum + getEmissionValue(f), 0);
    }
    if (item?.totalEmissionTCo2e != null) return Number(item.totalEmissionTCo2e);
    return 0;
  };

  const barChartData = [
    {
      name: "Stationary",
      value: totalEmissionFor(dashboardData.scope1.stationaryListData),
    },
    {
      name: "Mobile",
      value: totalEmissionFor(dashboardData.scope1.transportListData),
    },
    {
      name: "Fugitive",
      value: totalEmissionFor(dashboardData.scope1.fugitiveListData),
    },
    {
      name: "Process",
      value:
        totalEmissionFor(dashboardData.scope1.EmissionActivityListData) ||
        totalEmissionFor(dashboardData.scope1.processEmissions),
    },
  ];

  /* -------------------- TABLE DATA -------------------- */
  const topScope1Categories = {
    Stationary: dashboardData.scope1.stationaryListData || [],
    Mobile: dashboardData.scope1.transportListData || [],
    Fugitive: dashboardData.scope1.fugitiveListData || [],
    Process: dashboardData.scope1.EmissionActivityListData || [],
  };

  /* -------------------- BAR CLICK HANDLER -------------------- */
  const handleBarClick = (data) => {
    if (!data?.name) return;
    setSelectedCategory(data.name);
    setRowLimit(10);
  };

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
      <div className="flex-1 min-w-[320px] p-6 bg-white rounded-xl shadow-lg border overflow-auto max-h-[520px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-xl text-gray-900">
            Top Categories
          </h3>

          {selectedCategory && (
            <button
              onClick={resetView}
              className="text-sm text-blue-600 hover:underline"
            >
              Reset view
            </button>
          )}
        </div>

        <div className="space-y-4">
          {Object.entries(topScope1Categories)
            .filter(([category]) => (selectedCategory ? category === selectedCategory : true))
            .map(([category, fuels]) => {
              const visibleFuels = fuels.slice(0, rowLimit);

              if (!visibleFuels.length) {
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
                  <div className={`font-semibold mb-2 ${categoryColors[category]}`}>
                    {category}
                  </div>

                  {/* Grid for fuels - FIXED: Cards now fill full width */}
                  <div
                    className={`grid gap-2 w-full ${selectedCategory
                        ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                        : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                      }`}
                  >
                    {visibleFuels.map((fuel, idx) => (
                      <div key={idx} className="flex-1 min-w-0 border border-gray-300 rounded overflow-hidden">
                        <div className="p-2 font-medium border-b text-center truncate">
                          {getFuelName(fuel)}
                        </div>
                        <div className="p-2 text-red-600 font-semibold border-b text-center truncate">
                          {getEmissionValue(fuel, category).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })} tCO₂e
                        </div>
                        {/* <div className="p-2 font-medium text-center truncate">
                          {fuel.quantity ? `${fuel.quantity} ${fuel.consumptionUnit || "unit"}` : "—"}
                        </div> */}
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

export default Scope1EmissionsSection;
