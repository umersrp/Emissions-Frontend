import React from "react";
import RevenueBarChart from "@/components/partials/widget/chart/revenue-bar-chart";
import { Tooltip } from "@mui/material"; // example: use MUI Tooltip or your preferred tooltip lib

const categoryColors = {
  Stationary: "bg-blue-100 text-blue-800",
  Mobile: "bg-green-100 text-green-800",
  Fugitive: "bg-purple-100 text-purple-800",
};

const Scope1EmissionsSection = ({ dashboardData, loading }) => {
  if (!dashboardData) return null;

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
      value: dashboardData.scope1.stationaryCombustion?.totalEmissionTCo2e || 0,
    },
  ];

  const topScope1Categories = {
    Stationary: dashboardData.scope1.stationaryFuelWise || [],
    Mobile: dashboardData.scope1.transportFuelWise || [],
    Fugitive: dashboardData.scope1.fugitiveFuelWise || [],
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Bar Chart Card */}
      <div className="flex-1 min-w-[320px] p-6 bg-white rounded-xl shadow-lg border border-gray-200">
        <h3 className="font-semibold mb-3 text-gray-900 text-xl">
          Scope 1 Emissions by Category
        </h3>
        <p className="mb-6 text-gray-600 leading-relaxed">
          Direct emissions from owned or controlled sources.
        </p>
        <RevenueBarChart chartData={barChartData} loading={loading} />
      </div>

      {/* Top Scope 1 Categories Table Card */}
      <div className="flex-1 min-w-[320px] p-6 bg-white rounded-xl shadow-lg border border-gray-200 overflow-auto max-h-[520px]">
        <h3 className="font-semibold mb-4 text-gray-900 text-xl">
          Top Scope 1 Categories: Direct Emissions
        </h3>

        <table className="w-full border-collapse table-auto text-sm">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr>
              <th className="border-b border-gray-300 p-3 text-left text-gray-700 font-medium">Category</th>
              <th className="border-b border-gray-300 p-3 text-left text-gray-700 font-medium">Fuel</th>
              <th className="border-b border-gray-300 p-3 text-right text-gray-700 font-medium">Emission (tCO₂e)</th>
              <th className="border-b border-gray-300 p-3 text-right text-gray-700 font-medium">Quantity (litre)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(topScope1Categories).map(([category, fuels]) =>
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
                        className={`border border-gray-300 p-3 font-semibold align-middle text-gray-800 ${categoryColors[category] || "bg-gray-100 text-gray-900"} rounded-l-lg`}
                        rowSpan={fuels.length}
                      >
                        {category}
                      </td>
                    )}
                    <td className="border border-gray-300 p-3 text-gray-700">{fuel._id || "Unknown"}</td>

                    <td className="border border-gray-300 p-3 text-right text-red-600 font-semibold">
                      <Tooltip title={`Emission from ${fuel._id || "Unknown"} in ${category}`} arrow>
                        <span>{(fuel.totalEmissionTCo2e || 0).toFixed(2)}</span>
                      </Tooltip>
                    </td>

                    <td className="border border-gray-300 p-3 text-right text-gray-600">
                      {/* Dynamic quantity here - fallback "2000 litre" */}
                      <Tooltip title="Approximate fuel quantity" arrow>
                        <span>{fuel.quantity ? `${fuel.quantity} litre` : "2000 litre"}</span>
                      </Tooltip>
                    </td>
                  </tr>
                ))
              ) : (
                <tr key={category} className="bg-gray-100">
                  <td className={`border border-gray-300 p-3 font-semibold ${categoryColors[category] || ""}`}>
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
  );
};

export default Scope1EmissionsSection;
