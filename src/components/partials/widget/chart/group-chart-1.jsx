import React from "react";
import Chart from "react-apexcharts";

const GroupChart1 = ({ chartData = [] }) => {
  const colors = ["#00EBFF", "#FB8F65", "#5743BE"]; // Scope 1,2,3 colors

  // Helper to format big numbers (K, M)
  const formatNumber = (num) => {
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num.toLocaleString();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {chartData.map((item, i) => {
        const series = [item.value || 0];
        const options = {
          chart: {
            type: "radialBar",
            sparkline: { enabled: true },
            toolbar: { show: false },
          },
          plotOptions: {
            radialBar: {
              hollow: { size: "60%" },
              dataLabels: {
                name: { show: true, fontSize: "14px", color: "#64748B" },
                value: {
                  show: true,
                  fontSize: "18px",
                  fontWeight: 600,
                  formatter: (val) => formatNumber(val),
                },
              },
            },
          },
          colors: [colors[i] || "#374151"],
          tooltip: {
            enabled: true,
            y: { formatter: (val) => val.toLocaleString() + " tCO₂e" },
          },
        };

        return (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md flex flex-col items-center justify-center hover:shadow-xl transition-shadow"
          >
            <Chart options={options} series={series} type="radialBar" height={140} />
            <div className="mt-3 text-center">
              <h3 className="text-gray-700 dark:text-gray-300 font-medium text-sm">{item.name}</h3>
              <p className="text-gray-900 dark:text-white font-bold text-lg mt-1">
                {formatNumber(item.value)} tCO₂e
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GroupChart1;
