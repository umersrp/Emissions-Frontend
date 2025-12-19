import React from "react";
import Chart from "react-apexcharts";

const GroupChart1 = ({ chartData = [], loading }) => {
  // chartData example:
  // [
  //   { name: "Scope 1", value: 720 },
  //   { name: "Scope 2", value: 1105 },
  //   { name: "Scope 3", value: 685 },
  // ]

  const series = chartData.map((d) => d.value || 0);
  const labels = chartData.map((d) => d.name);

  const total = series.reduce((a, b) => a + b, 0);

  const colors = ["#22C55E", "#22D3EE", "#FACC15"]; // green, cyan, yellow

  const options = {
    chart: {
      type: "donut",
    },
    labels,
    colors,
    stroke: {
      width: 0,
    },
    legend: {
      show: false, // custom legend below
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(0)}%`,
      style: {
        fontSize: "12px",
        fontWeight: 600,
        colors: ["#374151"],
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              fontSize: "14px",
              fontWeight: 600,
              color: "#6B7280",
              formatter: () => total.toLocaleString(),
            },
            value: {
              show: true,
              fontSize: "22px",
              fontWeight: 700,
              color: "#111827",
              formatter: (val) => val.toLocaleString(),
            },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val.toLocaleString()} tCO₂e`,
      },
    },
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading chart...</p>;
  }

  return (
    <div className="flex flex-col items-center">
      {/* Donut Chart */}
      <Chart options={options} series={series} type="donut" height={260} />

      {/* Custom Legend (like PDF) */}
      <div className="flex gap-4 mt-4">
        {chartData.map((item, index) => {
          const percent =
            total > 0 ? Math.round((item.value / total) * 100) : 0;

          return (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index] }}
              />
              <span className="text-gray-700">
                {item.name} {percent}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GroupChart1;
