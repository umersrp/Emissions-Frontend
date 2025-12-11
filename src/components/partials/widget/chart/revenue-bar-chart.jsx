import React from "react";
import Chart from "react-apexcharts";
import useDarkMode from "@/hooks/useDarkMode";
import useRtl from "@/hooks/useRtl";

const RevenueBarChart = ({ chartData = [], height = 400 }) => {
  const [isDark] = useDarkMode();
  const [isRtl] = useRtl();

  // Map incoming chartData into ApexCharts series format
  const series = [
    {
      name: "Scope 2 Emissions",
      data: chartData.map((item) => item.value || 0),
    },
  ];

  const options = {
    chart: {
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        endingShape: "rounded",
        columnWidth: "45%",
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      fontSize: "12px",
      fontFamily: "Inter",
      offsetY: -30,
      markers: { width: 8, height: 8, radius: 12 },
      labels: { colors: isDark ? "#CBD5E1" : "#475569" },
      itemMargin: { horizontal: 18, vertical: 0 },
    },
    title: {
      text: "Scope 2 Emissions",
      align: "left",
      offsetX: isRtl ? "0%" : 0,
      offsetY: 13,
      floating: false,
      style: { fontSize: "20px", fontWeight: 500, color: isDark ? "#fff" : "#0f172a" },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    yaxis: {
      opposite: isRtl,
      labels: { style: { colors: isDark ? "#CBD5E1" : "#475569", fontFamily: "Inter" } },
    },
    xaxis: {
      categories: chartData.map((item) => item.name) || [],
      labels: { style: { colors: isDark ? "#CBD5E1" : "#475569", fontFamily: "Inter" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    fill: { opacity: 1 },
    tooltip: {
      y: {
        formatter: (val) => val.toLocaleString() + " tCO₂e",
      },
    },
    colors: ["#4669FA", "#0CE7FA", "#FA916B"],
    grid: { show: true, borderColor: isDark ? "#334155" : "#E2E8F0", strokeDashArray: 10, position: "back" },
    responsive: [
      {
        breakpoint: 600,
        options: {
          legend: { position: "bottom", offsetY: 8, horizontalAlign: "center" },
          plotOptions: { bar: { columnWidth: "80%" } },
        },
      },
    ],
  };

  return <Chart options={options} series={series} type="bar" height={height} />;
};

export default RevenueBarChart;
