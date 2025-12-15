import React from "react";
import Chart from "react-apexcharts";
import useDarkMode from "@/hooks/useDarkMode";
import useWidth from "@/hooks/useWidth";


const RadialsChart = ({ data = [] }) => {
  const [isDark] = useDarkMode();
  const { width, breakpoints } = useWidth();

  // Map data into ApexCharts format
  const safeData = Array.isArray(data) ? data : [];

  const series = safeData.map((item) => item.value || 0);
  const labels = safeData.map((item) => item.name || "");

  const options = {
    chart: { toolbar: { show: false } },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            fontSize: "22px",
            color: isDark ? "#CBD5E1" : "#475569",
          },
          value: {
            fontSize: "16px",
            color: isDark ? "#CBD5E1" : "#475569",
          },
          total: {
            show: true,
            label: "Total",
            color: isDark ? "#CBD5E1" : "#475569",
            formatter: function () {
              return series.reduce((a, b) => a + b, 0);
            },
          },
        },
        track: { background: "#E2E8F0", strokeWidth: "97%" },
      },
    },
    labels,
    colors: ["#4669FA", "#FA916B", "#50C793", "#0CE7FA"],
  };

  return (
    <div>
      <Chart
        options={options}
        series={series}
        type="radialBar"
        height={width > breakpoints.md ? 360 : 250}
      />
    </div>
  );
};

export default RadialsChart;
