import React from "react";
import Chart from "react-apexcharts";
import useDarkMode from "@/hooks/useDarkMode";
import useRtl from "@/hooks/useRtl";

const RevenueBarChart = ({ chartData = [], height = 400, onBarClick }) => {
  const [isDark] = useDarkMode();
  const [isRtl] = useRtl();

  const values = chartData.map((item) => item.value || 0);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const series = [
    {
      name: "Emissions",
      data: values,
    },
  ];

  const options = {
    chart: {
      type: "bar",
      toolbar: { show: false },
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
        // ✅ Per-bar coloring via fill.colors function
        colors: {
          ranges: [
            { from: minValue, to: minValue, color: "#A0A0A0" }, // grey for lowest
            { from: maxValue, to: maxValue, color: "#4669FA" }, // blue for highest
          ],
        },
      },
    },

    fill: {
      colors: values.map((v) => {
        if (v === maxValue) return "#4669FA";
        if (v === minValue) return "#A0A0A0";
        return "#7F9CF5"; // optional middle color
      }),
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

    grid: {
      show: true,
      borderColor: isDark ? "#334155" : "#E2E8F0",
      strokeDashArray: 10,
    },
  };

  return <Chart options={options} series={series} type="bar" height={height} />;
};

export default RevenueBarChart;
