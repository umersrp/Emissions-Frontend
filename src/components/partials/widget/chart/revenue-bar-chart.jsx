// import React from "react";
// import Chart from "react-apexcharts";
// import useDarkMode from "@/hooks/useDarkMode";
// import useRtl from "@/hooks/useRtl";

// const RevenueBarChart = ({
//   chartData = [],
//   height = 450,
//   onBarClick,
//   selectedCategory,
//   selectedBuilding = null, // Add this prop
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
//       type: 'bar',
//       toolbar: { show: false },
//       zoom: { enabled: false }
//     },
//     grid: {
//       padding: {
//         bottom: 20 // Add padding for rotated labels
//       }
//     },
//     plotOptions: {
//       bar: {
//         columnWidth: '70%', // Adjust bar width if needed
//       }
//     },

//     plotOptions: {
//       bar: {
//         horizontal: false,
//         endingShape: "rounded",
//         columnWidth: "45%",
//         distributed: true,
//       },
//     },

//     // fill: {
//     //   colors: sortedData.map((item) => {
//     //     // If a building is selected from dashboard filter
//     //     if (selectedBuilding && item.buildingId === selectedBuilding) {
//     //       return "#34D399"; // blue highlight for selected building
//     //     }
//     //     // If a category is selected from bar click
//     //     if (item.name === selectedCategory) {
//     //       return "#34D399"; // blue highlight
//     //     }
//     //     // Highlight the max value bar (only if no selection is made)
//     //     // if (!selectedBuilding && !selectedCategory && item.value === maxValue && item.value > 0) {
//     //     //   return "#34D399"; // green for max value
//     //     // }
//     //     return "#4098ab"; // default grey for all other bars
//     //   }),
//     // },
// fill: {
//   colors: sortedData.map((item) => {
//     // If a building is selected from dashboard filter
//     if (selectedBuilding) {
//       // Only highlight the bar if it matches the selected building
//       if (item.buildingId === selectedBuilding) {
//         return "#34D399"; // green highlight for selected building
//       }
//       // All other bars should be gray
//       return "#d1d5db"; // light gray for all other bars
//     }
    
//     // If no building filter, apply category highlighting
//     if (item.name === selectedCategory) {
//       return "#34D399"; // green highlight
//     }
    
//     // Default color when no selections
//     return "#4098ab"; // teal color for all bars
//   }),
// },
//     dataLabels: { enabled: false },

//     stroke: { show: true, width: 2, colors: ["transparent"] },

//     // xaxis: {
//     //   categories: sortedData.map((item) => item.name),
//     //   labels: { 
//     //     formatter: function (a) {
//     //       console.log('labellsssss  2===>', a)
//     //       // Format the value without decimals
//     //       return Math.round(value).toLocaleString();
//     //     },
//     //     show: true, style: { colors: isDark ? "#CBD5E1" : "#475569", fontFamily: "Inter" } },
//     //   axisBorder: { show: false },
//     //   axisTicks: { show: false },
//     // },
//  xaxis: {
//   categories: sortedData.map((item) => item.name),
//   labels: { 
//     formatter: function (value) {
//       // Add safety check for undefined/null values
//       if (!value || typeof value !== 'string') {
//         return value || '';
//       }
      
//       // Adjust maxCharsPerLine based on screen size
//       const screenWidth = window.innerWidth;
//       let maxCharsPerLine;
      
//       if (screenWidth < 640) {
//         maxCharsPerLine = 8; // Small screens
//       } else if (screenWidth < 1024) {
//         maxCharsPerLine = 10; // Medium screens
//       } else {
//         maxCharsPerLine = 15; // Large screens
//       }
      
//       if (value.length <= maxCharsPerLine) return value;
      
//       const words = value.split(' ');
//       let lines = [];
//       let currentLine = '';
      
//       for (let word of words) {
//         if ((currentLine + word).length <= maxCharsPerLine) {
//           currentLine += (currentLine ? ' ' : '') + word;
//         } else {
//           if (currentLine) lines.push(currentLine);
//           currentLine = word;
//         }
//       }
      
//       if (currentLine) lines.push(currentLine);
      
//       return lines.length > 0 ? lines : value;
//     },
//     show: true,
//     rotate: -45,
//     rotateAlways: true,
//     hideOverlappingLabels: false,
//     trim: false,
//     minHeight: 80,
//     style: { 
//       colors: isDark ? "#CBD5E1" : "#475569", 
//       fontFamily: "Inter",
//       fontSize: '10px'
//     } 
//   },
//   axisBorder: { show: false },
//   axisTicks: { show: false },
//   tickPlacement: 'on'
// },
//     yaxis: {
//       opposite: isRtl,
//       labels: {
//         style: {
//           colors: isDark ? "#CBD5E1" : "#475569",
//           fontFamily: "Inter",
//         },
//         formatter: function (value) {
//           // console.log('labellsssss ===>', value)
//           // Format the value without decimals
//           return Math.round(value).toLocaleString();
//         },
//       },
//     },

//     tooltip: { y: { formatter: (val) => `${val.toLocaleString()} tCO₂e` } },

//     legend: { show: false },
//     grid: { show: false },
//   };

//   return <Chart options={options} series={series} type="bar" height={height} />;
// };

// export default RevenueBarChart;


import React from "react";
import Chart from "react-apexcharts";
import useDarkMode from "@/hooks/useDarkMode";
import useRtl from "@/hooks/useRtl";

const RevenueBarChart = ({
  chartData = [],
  height = 450,
  onBarClick,
  selectedCategory,
  selectedBuilding = null,
}) => {
  const [isDark] = useDarkMode();
  const [isRtl] = useRtl();

  // Filter out zero-emission categories
  const filteredData = chartData.filter((item) => Number(item.value || 0) !== 0);

  // Sort descending by value
  const sortedData = [...filteredData].sort(
    (a, b) => (Number(b.value) || 0) - (Number(a.value) || 0)
  );

  const values = sortedData.map((item) => Number(item.value) || 0);
  
  // Use displayName for x-axis labels if available, otherwise use name
  const displayNames = sortedData.map((item) => item.displayName || item.name);

  const series = [
    {
      name: "Emissions",
      data: values,
    },
  ];

  const options = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      zoom: { enabled: false },
      events: {
        // Add click event handler for bars
        dataPointSelection: (event, chartContext, config) => {
          if (onBarClick && sortedData[config.dataPointIndex]) {
            onBarClick(sortedData[config.dataPointIndex]);
          }
        }
      }
    },
    grid: {
      padding: {
        bottom: 20
      }
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
        if (selectedBuilding) {
          if (item.buildingId === selectedBuilding) {
            return "#34D399";
          }
          return "#d1d5db";
        }
        
        // Check if this bar matches the selected category
        if (selectedCategory) {
          // Handle both cases: if selectedCategory is the categoryKey or the full name
          if (item.name === selectedCategory || item.categoryKey === selectedCategory) {
            return "#34D399"; // Highlight color
          }
          return "#d1d5db"; // Dim other bars
        }
        
        return "#4098ab"; // Default color
      }),
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: displayNames,
      labels: { 
        formatter: function (value) {
          if (!value || typeof value !== 'string') {
            return value || '';
          }
          
          const screenWidth = window.innerWidth;
          let maxCharsPerLine;
          
          if (screenWidth < 640) {
            maxCharsPerLine = 8;
          } else if (screenWidth < 1024) {
            maxCharsPerLine = 10;
          } else {
            maxCharsPerLine = 20;
          }
          
          if (value.length <= maxCharsPerLine) return value;
          
          const words = value.split(' ');
          let lines = [];
          let currentLine = '';
          
          for (let word of words) {
            if ((currentLine + word).length <= maxCharsPerLine) {
              currentLine += (currentLine ? ' ' : '') + word;
            } else {
              if (currentLine) lines.push(currentLine);
              currentLine = word;
            }
          }
          
          if (currentLine) lines.push(currentLine);
          
          return lines.length > 0 ? lines : value;
        },
        show: true,
        rotate: -45,
        rotateAlways: true,
        hideOverlappingLabels: false,
        trim: false,
        minHeight: 23,
        style: { 
          colors: isDark ? "#CBD5E1" : "#475569", 
          fontFamily: "Inter",
          fontSize: '10px'
        } 
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tickPlacement: 'on'
    },
     yaxis: {
      opposite: isRtl,
      tickAmount: 3,
      labels: {
        style: {
          colors: isDark ? "#CBD5E1" : "#475569",
          fontFamily: "Inter",
        },
        formatter: function (value) {
          return Math.round(value).toLocaleString();
        },
      },
    },
    tooltip: { 
      y: { 
        formatter: (val) => `${val.toLocaleString()} tCO₂e`
      },
      x: {
        formatter: function (value, { seriesIndex, dataPointIndex }) {
          // Return the display name for tooltip
          return displayNames[dataPointIndex];
        }
      }
    },
    legend: { show: false },
    grid: { show: false },
  };

  return <Chart options={options} series={series} type="bar" height={height} />;
};

export default RevenueBarChart;