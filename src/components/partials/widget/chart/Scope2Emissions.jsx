import React from "react";
import RevenueBarChart from "@/components/partials/widget/chart/revenue-bar-chart";
import { Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

/* =======================
   UI CONFIG
======================= */
const categoryColors = {
  "Purchased Electricity": "bg-yellow-100 text-yellow-800",
};

const unitColors = {
  kWh: "text-blue-600",
  MWh: "text-green-600",
  Unknown: "text-gray-400",
};

const normalizeUnit = (unit) => {
  if (!unit) return "Unknown";
  const u = unit.toLowerCase();
  if (u === "kwh") return "kWh";
  if (u === "mwh") return "MWh";
  return unit;
};

/* =======================
   AGGREGATION LOGIC
======================= */
const aggregateElectricityByUnit = (list = []) => {
  const map = {};
  list.forEach((item) => {
    const unit = normalizeUnit(item.unit);
    if (!map[unit]) {
      map[unit] = {
        _id: unit,
        totalLocationTCo2e: 0,
        totalElectricityConsumed: 0,
      };
    }
    map[unit].totalLocationTCo2e += Number(item.calculatedEmissionTCo2e || 0);
    map[unit].totalElectricityConsumed += Number(item.totalElectricity || 0);
  });
  return Object.values(map);
};

/* =======================
   COMPONENT
======================= */
const Scope2EmissionsSection = ({ dashboardData, loading }) => {
  if (!dashboardData?.scope2) return null;

  const scope2 = dashboardData.scope2;

  /* ---------- State ---------- */
  const [selectedBuildingName, setSelectedBuildingName] = React.useState(null);

  /* ---------- Bar Chart ---------- */
let barChartData = [];

if (scope2.purchasedElectricity) {
  barChartData.push({
    name: "Purchased Electricity",
    value: Number(scope2.purchasedElectricity.totalLocationTCo2e ?? 0),
  });
}

  // Filter to selected building if any
  if (selectedBuildingName) {
    barChartData = barChartData.filter(
      (b) => b.name === selectedBuildingName
    );
  }

  /* ---------- Table Data ---------- */
  const electricityByUnit = aggregateElectricityByUnit(
    scope2.electricityListData || []
  );
  const topScope2Categories = {
    "Purchased Electricity": electricityByUnit,
  };

  /* ---------- Total Emissions ---------- */
  const totalScope2 = barChartData.reduce((sum, item) => sum + item.value, 0);

  /* ---------- Handlers ---------- */
  const handleBarClick = (data) => {
    // Toggle selection: click same building again resets chart
    if (selectedBuildingName === data.name) {
      setSelectedBuildingName(null);
    } else {
      setSelectedBuildingName(data.name);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ================= Total Card ================= */}
      <div className="flex justify-end">
        <div className="p-4 btn-dark text-white rounded-xl shadow-md border border-black-400 font-semibold text-lg w-max">
          Total Scope 2 Emissions: {totalScope2.toFixed(3)} tCO₂e
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* ================= Chart Card ================= */}
        <div className="flex-1 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-xl text-gray-900">
              Emissions by Building
            </h3>
            <Tooltip
              title="This chart shows emissions from all buildings (tCO₂e)"
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
            selectedCategory={selectedBuildingName}
            height={400}
            onBarClick={handleBarClick}
          />
        </div>

        {/* ================= Table Card ================= */}
        <div className="flex-1 p-6 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-auto max-h-[520px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-xl text-gray-900">
              Scope 2 – Purchased Electricity
            </h3>
            <Tooltip
              title="This table shows emissions and consumption per unit"
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

          <table className="w-full border-collapse table-auto text-sm">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr>
                <th className="border-b p-3 text-left">Category</th>
                <th className="border-b p-3 text-left">Unit</th>
                <th className="border-b p-3 text-right">Emission (tCO₂e)</th>
                <th className="border-b p-3 text-right">Quantity</th>
              </tr>
            </thead>

            <tbody>
              {Object.entries(topScope2Categories).map(([category, fuels]) =>
                fuels.length > 0 ? (
                  fuels.map((fuel, idx) => (
                    <tr
                      key={`${category}-${fuel._id}`}
                      className={`transition-colors duration-200 hover:bg-yellow-50 ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      {idx === 0 && (
                        <td
                          rowSpan={fuels.length}
                          className={`border p-3 font-semibold align-middle ${categoryColors[category]}`}
                        >
                          {category}
                        </td>
                      )}

                      <td className="border p-3">{normalizeUnit(fuel._id)}</td>

                      <td
                        className={`border p-3 text-right font-semibold ${
                          unitColors[fuel._id] || ""
                        }`}
                      >
                        <Tooltip title="Location-based emissions" arrow>
                          <span>{Number(fuel.totalLocationTCo2e).toFixed(3)}</span>
                        </Tooltip>
                      </td>

                      <td className="border p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span>
                            {fuel.totalElectricityConsumed} {normalizeUnit(fuel._id)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr key={category}>
                    <td
                      className={`border p-3 font-semibold ${categoryColors[category]}`}
                    >
                      {category}
                    </td>
                    <td
                      className="border p-3 text-center italic text-gray-400"
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
