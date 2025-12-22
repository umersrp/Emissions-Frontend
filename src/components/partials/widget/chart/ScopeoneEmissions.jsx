import React, { useState } from "react";
import RevenueBarChart from "@/components/partials/widget/chart/revenue-bar-chart";
import { Tooltip } from "@mui/material";

const categoryColors = {
  Stationary: "bg-blue-100 text-blue-800",
  Mobile: "bg-green-100 text-green-800",
  Fugitive: "bg-purple-100 text-purple-800",
};

const Scope1EmissionsSection = ({ dashboardData, loading }) => {
  if (!dashboardData?.scope1) return null;

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [rowLimit, setRowLimit] = useState(3);

  /* -------------------- BAR CHART DATA -------------------- */
  const barChartData = [
    {
      name: "Fugitive",
      value: dashboardData.scope1.fugitive?.totalEmissionTCo2e || 0,
    },
    {
      name: "Process",
      value: dashboardData.scope1.emissionActivity?.totalEmissionTCo2e || 0,
    },
    {
      name: "Mobile",
      value: dashboardData.scope1.transport?.totalEmissionTCo2e || 0,
    },
    {
      name: "Stationary",
      value:
        dashboardData.scope1.stationaryCombustion?.totalEmissionTCo2e || 0,
    },
  ];

  /* -------------------- TABLE DATA -------------------- */
  const topScope1Categories = {
    Stationary: dashboardData.scope1.stationaryFuelWise || [],
    Mobile: dashboardData.scope1.transportFuelWise || [],
    Fugitive: dashboardData.scope1.fugitiveFuelWise || [],
  };

  /* -------------------- BAR CLICK HANDLER -------------------- */
  const handleBarClick = (data) => {
    if (!data?.name) return;
    setSelectedCategory(data.name);
    setRowLimit(10);
  };

  /* -------------------- RESET -------------------- */
  const resetView = () => {
    setSelectedCategory(null);
    setRowLimit(3);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* -------------------- BAR CHART -------------------- */}
      <div className="flex-1 min-w-[320px] p-6 bg-white rounded-xl shadow-lg border border-gray-200">
        <h3 className="font-semibold mb-3 text-gray-900 text-xl">
          Scope 1 Emissions by Category
        </h3>
        <p className="mb-6 text-gray-600 leading-relaxed">
          Direct emissions from owned or controlled sources.
        </p>

        <RevenueBarChart
          chartData={barChartData}
          loading={loading}
          onBarClick={handleBarClick}
        />
      </div>

      {/* -------------------- TABLE -------------------- */}
      <div className="flex-1 min-w-[320px] p-6 bg-white rounded-xl shadow-lg border border-gray-200 overflow-auto max-h-[520px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 text-xl">
            Top Scope 1 Categories: Direct Emissions
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

        <table className="w-full border-collapse table-auto text-sm">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr>
              <th className="border-b border-gray-300 p-3 text-left">
                Category
              </th>
              <th className="border-b border-gray-300 p-3 text-left">
                Fuel (Emission & Quantity)
              </th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(topScope1Categories)
              .filter(([category]) =>
                selectedCategory ? category === selectedCategory : true
              )
              .map(([category, fuels]) => {
                const limitedFuels = fuels.slice(0, rowLimit);

                return limitedFuels.length ? (
                  limitedFuels.map((fuel, idx) => (
                    <tr
                      key={`${category}-${fuel._id || idx}`}
                      className={
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }
                    >
                      {idx === 0 && (
                        <td
                          rowSpan={limitedFuels.length}
                          className={`border p-3 font-semibold align-middle ${
                            categoryColors[category] || "bg-gray-100"
                          }`}
                        >
                          {category}
                        </td>
                      )}

                      <td className="border p-3 text-gray-800">
                        {/* Fuel Name */}
                        <div className="font-medium">
                          {fuel._id || "Unknown Fuel"}
                        </div>

                        {/* Emission */}
                        <Tooltip title="Total emissions" arrow>
                          <div className="text-red-600 font-semibold text-sm mt-1">
                            Emission:{" "}
                            {(fuel.totalEmissionTCo2e || 0).toFixed(2)}{" "}
                            tCO₂e
                          </div>
                        </Tooltip>

                        {/* Quantity */}
                        <Tooltip title="Fuel quantity consumed" arrow>
                          <div className="text-gray-600 text-sm">
                            Quantity:{" "}
                            {fuel.quantity
                              ? `${fuel.quantity} litre`
                              : "2000 litre"}
                          </div>
                        </Tooltip>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr key={category}>
                    <td
                      className={`border p-3 font-semibold ${
                        categoryColors[category] || "bg-gray-100"
                      }`}
                    >
                      {category}
                    </td>
                    <td className="border p-3 text-center italic text-gray-400">
                      No data available
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Scope1EmissionsSection;
