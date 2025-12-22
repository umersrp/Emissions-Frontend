import React from "react";
import RevenueBarChart from "@/components/partials/widget/chart/revenue-bar-chart";
import { Tooltip } from "@mui/material";

/* ------------------ Colors ------------------ */
const categoryColors = {
  "Purchased Goods & Services": "bg-blue-100 text-blue-800",
  "Capital Goods": "bg-indigo-100 text-indigo-800",
  "Waste Generated in Operations": "bg-green-100 text-green-800",
  "Business Travel": "bg-purple-100 text-purple-800",
  "Employee Commuting": "bg-orange-100 text-orange-800",
};

const modeColors = {
  Air: "text-red-600",
  Bus: "text-blue-600",
  Taxi: "text-yellow-600",
  Train: "text-green-600",
};

/* ------------------ Component ------------------ */
const Scope3EmissionsSection = ({ dashboardData, loading }) => {
  if (!dashboardData?.scope3) return null;

  const {
    purchasedGoodsAndServices = [],
    wasteGeneratedInOperations = [],
    businessTravel = [],
    employeeCommuting = [],
  } = dashboardData.scope3;

  /* ------------------ Bar Chart ------------------ */
  const barChartData = [
    {
      name: "Purchased Goods & Services",
      value: purchasedGoodsAndServices.reduce(
        (s, i) => s + (i.totalEmissionTCo2e || 0),
        0
      ),
    },
    {
      name: "Waste Generated",
      value: wasteGeneratedInOperations.reduce(
        (s, i) => s + (i.totalEmissionTCo2e || 0),
        0
      ),
    },
    {
      name: "Business Travel",
      value: businessTravel.reduce(
        (s, i) => s + (i.totalEmissionTCo2e || 0),
        0
      ),
    },
    {
      name: "Employee Commuting",
      value: employeeCommuting.reduce(
        (s, i) => s + (i.totalEmissionTCo2e || 0),
        0
      ),
    },
  ];

  const totalScope3Emissions = barChartData.reduce(
    (acc, i) => acc + i.value,
    0
  );

  /* ------------------ Table Mapping ------------------ */
  const tableSections = [
    {
      title: "Purchased Goods & Services",
      data: purchasedGoodsAndServices,
      quantityLabel: "Spent Money",
      quantityKey: "totalSpentMoney",
    },
    {
      title: "Waste Generated in Operations",
      data: wasteGeneratedInOperations,
      quantityLabel: "Tonnes",
      quantityKey: "totalTonnes",
    },
    {
      title: "Business Travel",
      data: businessTravel,
      quantityLabel: "Passenger Km",
      quantityKey: "totalPassengerKm",
    },
    {
      title: "Employee Commuting",
      data: employeeCommuting,
      quantityLabel: "Total Km",
      quantityKey: "totalKm",
    },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* -------- Bar Chart -------- */}
      <div className="flex-1 min-w-[320px] p-6 bg-white rounded-xl shadow-lg border border-gray-200">
        <h3 className="font-semibold mb-3 text-gray-900 text-xl">
          Scope 3 Emissions by Category
        </h3>
        <p className="mb-6 text-gray-600 leading-relaxed">
          Other indirect emissions across the value chain.
        </p>

        <RevenueBarChart chartData={barChartData} loading={loading} />

        <div className="mt-4 text-gray-700 font-semibold">
          Total Scope 3 Emissions:{" "}
          <span className="text-gray-900">
            {totalScope3Emissions.toFixed(2)} tCO₂e
          </span>
        </div>
      </div>

      {/* -------- Detailed Table -------- */}
      <div className="flex-1 min-w-[320px] p-6 bg-white rounded-xl shadow-lg border border-gray-200 overflow-auto max-h-[520px]">
        <h3 className="font-semibold mb-4 text-gray-900 text-xl">
          Scope 3 Detailed Breakdown
        </h3>

        <table className="w-full border-collapse table-auto text-sm">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr>
              <th className="border-b p-3 text-left">Category</th>
              <th className="border-b p-3 text-left">Type / Mode</th>
              <th className="border-b p-3 text-right">Emission (tCO₂e)</th>
              <th className="border-b p-3 text-right">Quantity</th>
            </tr>
          </thead>

          <tbody>
            {tableSections.map(({ title, data, quantityLabel, quantityKey }) =>
              data.length ? (
                data.map((row, idx) => (
                  <tr
                    key={`${title}-${idx}`}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    {idx === 0 && (
                      <td
                        rowSpan={data.length}
                        className={`border p-3 font-semibold align-middle ${
                          categoryColors[title]
                        }`}
                      >
                        {title}
                      </td>
                    )}

                    <td className="border p-3 text-gray-700">
                      {row._id || "N/A"}
                    </td>

                    <td className="border p-3 text-right font-semibold">
                      <Tooltip title="Total emissions" arrow>
                        <span>
                          {(row.totalEmissionTCo2e || 0).toFixed(2)}
                        </span>
                      </Tooltip>
                    </td>

                    <td className="border p-3 text-right text-gray-600">
                      <Tooltip title={quantityLabel} arrow>
                        <span>
                          {row[quantityKey] ?? "N/A"}
                        </span>
                      </Tooltip>
                    </td>
                  </tr>
                ))
              ) : (
                <tr key={title}>
                  <td
                    className={`border p-3 font-semibold ${categoryColors[title]}`}
                  >
                    {title}
                  </td>
                  <td
                    colSpan={3}
                    className="border p-3 text-center italic text-gray-400"
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

export default Scope3EmissionsSection;
