// import React from "react";
// import Chart from "react-apexcharts";
// import useDarkMode from "@/hooks/useDarkMode";
// import useRtl from "@/hooks/useRtl";

// const RevenueBarChart = ({ chartData = [], height = 450, onBarClick, selectedCategory }) => {
//   const [isDark] = useDarkMode();
//   const [isRtl] = useRtl();

//   // Filter out entries with a zero value (keep those with non-zero numeric values)
//   const filteredData = chartData.filter((item) => Number(item.value || 0) !== 0);

//   /*  SORT: Highest → Lowest */
//   const sortedData = [...filteredData].sort(
//     (a, b) => (Number(b.value) || 0) - (Number(a.value) || 0)
//   );

//   const values = sortedData.map((item) => Number(item.value) || 0);
//   const minValue = values.length ? Math.min(...values) : 0;
//   const maxValue = values.length ? Math.max(...values) : 0;

//   const series = [
//     {
//       name: "Emissions",
//       data: values,
//     },
//   ];

//   // const options = {
//   //   chart: {
//   //     type: "bar",
//   //     toolbar: { show: false },
//   //     events: {
//   //       dataPointSelection: (event, chartContext, config) => {
//   //         const index = config.dataPointIndex;
//   //         const clickedData = sortedData[index];
//   //         if (clickedData && onBarClick) {
//   //           onBarClick(clickedData);
//   //         }
//   //       },
//   //     },
//   //   },

//   //   plotOptions: {
//   //     bar: {
//   //       horizontal: false,
//   //       endingShape: "rounded",
//   //       columnWidth: "45%",
//   //       distributed: true,
//   //     },
//   //   },

//   //   fill: {
//   //     colors: values.map((v) => {
//   //       if (v === maxValue) return "#4669FA";
//   //       if (v === minValue) return "#c3c3c3";
//   //       return "#c3c3c3";
//   //     }),
//   //   },

//   //   dataLabels: { enabled: false },

//   //   stroke: {
//   //     show: true,
//   //     width: 2,
//   //     colors: ["transparent"],
//   //   },

//   //   // xaxis: {
//   //   //   categories: sortedData.map((item) => item.name),
//   //   //   labels: {
//   //   //     style: {
//   //   //       colors: isDark ? "#CBD5E1" : "#475569",
//   //   //       fontFamily: "Inter",
//   //   //     },
//   //   //   },
//   //   //   axisBorder: { show: true },
//   //   //   axisTicks: { show: true },
//   //   // },

//   //   yaxis: {
//   //     opposite: isRtl,
//   //     labels: {
//   //       style: {
//   //         colors: isDark ? "#CBD5E1" : "#475569",
//   //         fontFamily: "Inter",
//   //       },
//   //     },
//   //   },

//   //   tooltip: {
//   //     y: {
//   //       formatter: (val) => `${val.toLocaleString()} tCO₂e`,
//   //     },
//   //   },

//   //   // grid: {
//   //   //   show: true,
//   //   //   borderColor: isDark ? "#334155" : "#E2E8F0",
//   //   //   strokeDashArray: 10,
//   //   // },
//   // };


//   const options = {
//     chart: {
//       type: "bar",
//       toolbar: { show: false },
//       events: {
//         dataPointSelection: (event, chartContext, config) => {
//           const index = config.dataPointIndex;
//           const clickedData = sortedData[index];
//           if (clickedData && onBarClick) onBarClick(clickedData);
//         },
//       },
//     },

//     plotOptions: {
//       bar: {
//         horizontal: false,
//         endingShape: "rounded",
//         columnWidth: "45%",
//         distributed: true,
//       },
//     },

//     // Highlight the selected category
//     fill: {
//       colors: sortedData.map((item) => {
//         if (item.name === selectedCategory) return "#4669FA"; // blue highlight
//         if (item.value === maxValue) return "#34D399"; // green for max
//         if (item.value === minValue) return "#c3c3c3"; // grey for min
//         return "#c3c3c3"; // default grey
//       }),
//     },

//     dataLabels: { enabled: false },

//     stroke: {
//       show: true,
//       width: 2,
//       colors: ["transparent"],
//     },

//     xaxis: {
//       categories: sortedData.map((item) => item.name),
//       labels: {
//         show: true,
//         style: { colors: isDark ? "#CBD5E1" : "#475569", fontFamily: "Inter" },
//       },
//       axisBorder: { show: false },
//       axisTicks: { show: false },
//     },

//     yaxis: {
//       opposite: isRtl,
//       labels: {
//         style: { colors: isDark ? "#CBD5E1" : "#475569", fontFamily: "Inter" },
//       },
//     },

//     tooltip: {
//       y: {
//         formatter: (val) => `${val.toLocaleString()} tCO₂e`,
//       },
//     },

//     legend: { show: false },

//     grid: { show: false },
//   };


//   return <Chart options={options} series={series} type="bar" height={height} />;
// };

// export default RevenueBarChart;

//artat
// import React from "react";
// import Chart from "react-apexcharts";
// import useDarkMode from "@/hooks/useDarkMode";
// import useRtl from "@/hooks/useRtl";

// const RevenueBarChart = ({
//   chartData = [],
//   height = 450,
//   onBarClick,
//   selectedCategory,
// }) => {
//   const [isDark] = useDarkMode();
//   const [isRtl] = useRtl();

//   //  Filter out zero-emission buildings
//   const filteredData = chartData.filter((item) => Number(item.value || 0) !== 0);

//   //  Sort descending by value
//   const sortedData = [...filteredData].sort(
//     (a, b) => (Number(b.value) || 0) - (Number(a.value) || 0)
//   );

//   const values = sortedData.map((item) => Number(item.value) || 0);
//   const maxValue = Math.max(...values);

//   const series = [
//     {
//       name: "Emissions",
//       data: values,
//     },
//   ];

//   const options = {
//     chart: {
//       type: "bar",
//       toolbar: { show: false },
//       events: {
//         dataPointSelection: (event, chartContext, config) => {
//           const index = config.dataPointIndex;
//           const clickedData = sortedData[index];
//           if (clickedData && onBarClick) onBarClick(clickedData);
//         },
//       },
//     },

//     plotOptions: {
//       bar: {
//         horizontal: false,
//         endingShape: "rounded",
//         columnWidth: "45%",
//         distributed: true,
//       },
//     },

//     fill: {
//       colors: sortedData.map((item) => {
//         if (item.name === selectedCategory) return "#4669FA"; // blue highlight
//         if (item.value === maxValue && item.value > 0) return "#34D399"; // green max
//         return "#c3c3c3"; // default grey
//       }),
//     },

//     dataLabels: { enabled: false },

//     stroke: { show: true, width: 2, colors: ["transparent"] },

//     xaxis: {
//       categories: sortedData.map((item) => item.name),
//       labels: { show: true, style: { colors: isDark ? "#CBD5E1" : "#475569", fontFamily: "Inter" } },
//       axisBorder: { show: false },
//       axisTicks: { show: false },
//     },

// yaxis: {
//   opposite: isRtl,
//   labels: {
//     style: {
//       colors: isDark ? "#CBD5E1" : "#475569",
//       fontFamily: "Inter",
//     },
//     formatter: function (value) {
//       // Format the value without decimals
//       return Math.round(value).toLocaleString();
//     },
//   },
// },
//     tooltip: { y: { formatter: (val) => `${val.toLocaleString()} tCO₂e` } },

//     legend: { show: false },
//     grid: { show: false },
//   };

//   return <Chart options={options} series={series} type="bar" height={height} />;
// };

// export default RevenueBarChart;
//yasir 
import React from "react";
import Chart from "react-apexcharts";
import useDarkMode from "@/hooks/useDarkMode";
import useRtl from "@/hooks/useRtl";

const RevenueBarChart = ({
  chartData = [],
  height = 450,
  onBarClick,
  selectedCategory,
  selectedBuilding = null, // Add this prop
}) => {
  const [isDark] = useDarkMode();
  const [isRtl] = useRtl();

  //  Filter out zero-emission buildings
  const filteredData = chartData.filter((item) => Number(item.value || 0) !== 0);

  //  Sort descending by value
  const sortedData = [...filteredData].sort(
    (a, b) => (Number(b.value) || 0) - (Number(a.value) || 0)
  );

  const values = sortedData.map((item) => Number(item.value) || 0);
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
          const clickedData = sortedData[index];
          if (clickedData && onBarClick) onBarClick(clickedData);
        },
      },
    },

    plotOptions: {
      bar: {
        horizontal: false,
        endingShape: "rounded",
        columnWidth: "45%",
        distributed: true,
      },
    },

    fill: {
      colors: sortedData.map((item) => {
        // If a building is selected from dashboard filter
        if (selectedBuilding && item.buildingId === selectedBuilding) {
          return "#34D399"; // blue highlight for selected building
        }
        // If a category is selected from bar click
        if (item.name === selectedCategory) {
          return "#34D399"; // blue highlight
        }
        // Highlight the max value bar (only if no selection is made)
        // if (!selectedBuilding && !selectedCategory && item.value === maxValue && item.value > 0) {
        //   return "#34D399"; // green for max value
        // }
        return "#4098ab"; // default grey for all other bars
      }),
    },

    dataLabels: { enabled: false },

    stroke: { show: true, width: 2, colors: ["transparent"] },

    xaxis: {
      categories: sortedData.map((item) => item.name),
      labels: { show: true, style: { colors: isDark ? "#CBD5E1" : "#475569", fontFamily: "Inter" } },
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
        formatter: function (value) {
          // Format the value without decimals
          return Math.round(value).toLocaleString();
        },
      },
    },
    
    tooltip: { y: { formatter: (val) => `${val.toLocaleString()} tCO₂e` } },

    legend: { show: false },
    grid: { show: false },
  };

  return <Chart options={options} series={series} type="bar" height={height} />;
};

export default RevenueBarChart;