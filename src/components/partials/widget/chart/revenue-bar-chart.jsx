import React from "react";
import Chart from "react-apexcharts";
import useDarkMode from "@/hooks/useDarkMode";
import useRtl from "@/hooks/useRtl";

const RevenueBarChart = ({
  chartData = [],
  height = 400,
  onBarClick, // 👈 ADD THIS
}) => {
  const [isDark] = useDarkMode();
  const [isRtl] = useRtl();

  const series = [
    {
      name: "Emissions",
      data: chartData.map((item) => item.value || 0),
    },
  ];

  const options = {
    chart: {
      type: "bar",
      toolbar: { show: false },

      // 🔥 BAR CLICK EVENT
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const index = config.dataPointIndex;

          const clickedData = chartData[index];
          if (clickedData && onBarClick) {
            onBarClick(clickedData);
          }
        },
      },
    },

    plotOptions: {
      bar: {
        horizontal: false,
        endingShape: "rounded",
        columnWidth: "45%",
      },
    },

    dataLabels: { enabled: false },

    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },

    xaxis: {
      categories: chartData.map((item) => item.name),
      labels: {
        style: {
          colors: isDark ? "#CBD5E1" : "#475569",
          fontFamily: "Inter",
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },

    yaxis: {
      opposite: isRtl,
      labels: {
        style: {
          colors: isDark ? "#CBD5E1" : "#475569",
          fontFamily: "Inter",
        },
      },
    },

    tooltip: {
      y: {
        formatter: (val) => `${val.toLocaleString()} tCO₂e`,
      },
    },

    colors: ["#4669FA"],

    grid: {
      show: true,
      borderColor: isDark ? "#334155" : "#E2E8F0",
      strokeDashArray: 10,
    },
  };

  return (
    <Chart
      options={options}
      series={series}
      type="bar"
      height={height}
    />
  );
};

export default RevenueBarChart;
