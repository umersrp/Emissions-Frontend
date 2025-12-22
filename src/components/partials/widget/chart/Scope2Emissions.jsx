import React from "react";
import RevenueBarChart from "@/components/partials/widget/chart/revenue-bar-chart";
import { Tooltip } from "@mui/material"; // or your preferred tooltip library

// Category colors
const categoryColors = {
  "Purchased Electricity": "bg-yellow-100 text-yellow-800",
  "Purchased Steam": "bg-red-100 text-red-800",
  "Purchased Heating": "bg-pink-100 text-pink-800",
};

// Unit colors for visual differentiation
const unitColors = {
  kWh: "text-blue-600",
  MWh: "text-green-600",
  Unknown: "text-gray-400",
};

// Normalize unit strings
const normalizeUnit = (unit) => {
  if (!unit) return "Unknown";
  const u = unit.toLowerCase();
  if (u === "kwh") return "kWh";
  if (u === "mwh") return "MWh";
  return unit;
};

const Scope2EmissionsSection = ({ dashboardData, loading }) => {
  if (!dashboardData) return null;

  // Bar chart data for Scope 2 categories
  const barChartData = [
    {
      name: "Purchased Electricity",
      value:
        (dashboardData.scope2.purchasedElectricity?.totalLocationTCo2e || 0) +
        (dashboardData.scope2.purchasedElectricity?.totalMarketTCo2e || 0),
    },
    {
      name: "Purchased Steam",
      value: dashboardData.scope2.purchasedSteam?.totalEmissionTCo2e || 0,
    },
    {
      name: "Purchased Heating",
      value: dashboardData.scope2.purchasedHeating?.totalEmissionTCo2e || 0,
    },
  ];

  // Top Scope 2 categories with unit-wise breakdown
  const topScope2Categories = {
    "Purchased Electricity":
      dashboardData.scope2.purchasedElectricityByUnit || [],
    // "Purchased Steam": dashboardData.scope2.purchasedSteamFuelWise || [],
    // "Purchased Heating": dashboardData.scope2.purchasedHeatingFuelWise || [],
  };

  // Calculate total Scope 2 emissions for summary
  const totalScope2Emissions = barChartData.reduce(
    (acc, item) => acc + item.value,
    0
  );

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Summary Card */}
      {/* <div className="w-full p-4 bg-yellow-50 rounded-lg shadow-inner border border-yellow-200 text-yellow-900 font-semibold text-lg">
        Total Scope 2 Emissions: {totalScope2Emissions.toFixed(2)} tCO₂e
      </div> */}

      {/* Bar Chart Card */}
      <div className="flex-1 min-w-[320px] p-6 bg-white rounded-xl shadow-lg border border-gray-200">
        <h3 className="font-semibold mb-3 text-gray-900 text-xl">
          Scope 2 Emissions by Category
        </h3>
        <p className="mb-6 text-gray-600 leading-relaxed">
          All other indirect emissions that occur in the value chain.
        </p>
        <RevenueBarChart chartData={barChartData} loading={loading} />
      </div>

      {/* Top Scope 2 Categories Table */}
      <div className="flex-1 min-w-[320px] p-6 bg-white rounded-xl shadow-lg border border-gray-200 overflow-auto max-h-[520px]">
        <h3 className="font-semibold mb-4 text-gray-900 text-xl">
          Top Scope 2 Categories: Indirect Emissions
        </h3>

        <div className="overflow-x-auto">
          <table
            className="w-full border-collapse table-auto text-sm"
            aria-label="Scope 2 emissions by category and unit"
          >
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr>
                <th className="border-b border-gray-300 p-3 text-left text-gray-700 font-medium">
                  Category
                </th>
                <th className="border-b border-gray-300 p-3 text-left text-gray-700 font-medium">
                  Energy Source / Unit
                </th>
                <th className="border-b border-gray-300 p-3 text-right text-gray-700 font-medium">
                  Emission (tCO₂e)
                </th>
                <th className="border-b border-gray-300 p-3 text-right text-gray-700 font-medium">
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(topScope2Categories).map(([category, fuels]) =>
                fuels.length > 0 ? (
                  fuels.map((fuel, idx) => (
                    <tr
                      key={`${category}-${fuel._id || idx}`}
                      className={`transition-colors duration-200 ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 cursor-pointer`}
                    >
                      {idx === 0 && (
                        <td
                          className={`border border-gray-300 p-3 font-semibold align-middle text-gray-800 ${
                            categoryColors[category] ||
                            "bg-gray-100 text-gray-900"
                          } rounded-l-lg`}
                          rowSpan={fuels.length}
                        >
                          {category}
                        </td>
                      )}
                      <td className="border border-gray-300 p-3 text-gray-700">
                        {normalizeUnit(fuel._id)}
                      </td>

                      <td
                        className={`border border-gray-300 p-3 text-right font-semibold ${
                          unitColors[normalizeUnit(fuel._id)] || "text-gray-600"
                        }`}
                      >
                        <Tooltip
                          title={`Emission from ${normalizeUnit(fuel._id)} in ${category}`}
                          arrow
                        >
                          <span>{(fuel.totalLocationTCo2e || 0).toFixed(2)}</span>
                        </Tooltip>
                      </td>

                      <td className="border border-gray-300 p-3 text-right text-gray-600">
                        <Tooltip title="Energy consumed" arrow>
                          <div className="flex items-center justify-end gap-2">
                            <span>
                              {fuel.totalElectricityConsumed
                                ? `${fuel.totalElectricityConsumed} ${normalizeUnit(
                                    fuel._id
                                  )}`
                                : "N/A"}
                            </span>
                            <div className="w-20 h-2 bg-gray-200 rounded overflow-hidden">
                              <div
                                className="h-2 bg-yellow-400"
                                style={{
                                  width: `${Math.min(
                                    (fuel.totalElectricityConsumed / 1000) * 100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </Tooltip>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr key={category} className="bg-gray-100">
                    <td
                      className={`border border-gray-300 p-3 font-semibold ${
                        categoryColors[category] || ""
                      }`}
                    >
                      {category}
                    </td>
                    <td
                      className="border border-gray-300 p-3 text-center text-gray-400 italic"
                      colSpan={3}
                    >
                      No data available
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Scope2EmissionsSection;
