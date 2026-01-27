// import React from "react";
// import Chart from "react-apexcharts";
// import useDarkMode from "@/hooks/useDarkMode";
// import useRtl from "@/hooks/useRtl";

// const RevenueBarChart = ({
//   chartData = [],
//   height = 450,
//   onBarClick,
//   selectedCategory,
//   selectedBuilding = null,
// }) => {
//   const [isDark] = useDarkMode();
//   const [isRtl] = useRtl();

//   // Filter out zero-emission categories
//   const filteredData = chartData.filter((item) => Number(item.value || 0) !== 0);

//   // Sort descending by value
//   const sortedData = [...filteredData].sort(
//     (a, b) => (Number(b.value) || 0) - (Number(a.value) || 0)
//   );

//   const values = sortedData.map((item) => Number(item.value) || 0);

//   // Use displayName for x-axis labels if available, otherwise use name
//   const displayNames = sortedData.map((item) => item.displayName || item.name);

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
//       zoom: { enabled: false },
//       events: {
//     click: function (event, chartContext, config) {
//       const dataPointIndex = config.dataPointIndex;

//       if (dataPointIndex === -1) return; // clicked outside bars

//       const clickedData = sortedData[dataPointIndex];

//       if (clickedData && onBarClick) {
//         onBarClick(clickedData);
//       }
//     }
//   },
//     },
//     grid: {
//       padding: {
//         bottom: 19,
//       },
//       show: false
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
//         if (selectedBuilding) {
//           if (item.buildingId === selectedBuilding) {
//             return "#34D399";
//           }
//           return "#d1d5db";
//         }

//         // Check if this bar matches the selected category
//         if (selectedCategory) {
//           // Handle both cases: if selectedCategory is the categoryKey or the full name
//           if (item.name === selectedCategory || item.categoryKey === selectedCategory) {
//             return "#34D399"; // Highlight color
//           }
//           return "#d1d5db"; // Dim other bars
//         }

//         return "#4098ab"; // Default color
//       }),
//     },
//     dataLabels: { enabled: false },
//     stroke: { show: true, width: 2, colors: ["transparent"] },
//     xaxis: {
//       categories: displayNames,
//       labels: {
//         formatter: function (value) {
//           if (!value || typeof value !== 'string') {
//             return value || '';
//           }

//           const screenWidth = window.innerWidth;
//           let maxCharsPerLine;

//           if (screenWidth < 640) {
//             maxCharsPerLine = 8;
//           } else if (screenWidth < 1024) {
//             maxCharsPerLine = 10;
//           } else {
//             maxCharsPerLine = 20;
//           }

//           if (value.length <= maxCharsPerLine) return value;

//           const words = value.split(' ');
//           let lines = [];
//           let currentLine = '';

//           for (let word of words) {
//             if ((currentLine + word).length <= maxCharsPerLine) {
//               currentLine += (currentLine ? ' ' : '') + word;
//             } else {
//               if (currentLine) lines.push(currentLine);
//               currentLine = word;
//             }
//           }

//           if (currentLine) lines.push(currentLine);

//           return lines.length > 0 ? lines : value;
//         },
//         show: true,
//         rotate: -45,
//         rotateAlways: true,
//         hideOverlappingLabels: false,
//         trim: false,
//         minHeight: 50,
//         style: {
//           colors: isDark ? "#CBD5E1" : "#475569",
//           fontFamily: "Inter",
//           fontSize: '10px'
//         }
//       },
//       axisBorder: { 
//       show: true,
//       color: isDark ? '#4B5563' : '#9CA3AF', // Axis line color
//       height: 1, // Thickness of the axis line
//       offsetX: 0,
//       offsetY: 0
//     },
//     axisTicks: { 
//       show: false // Hide tick marks if you don't want them
//     },
//     tickPlacement: 'on'
  
      
//     },
//     yaxis: {
//       opposite: isRtl,
//       tickAmount: 3,
//       labels: {
//         style: {
//           colors: isDark ? "#CBD5E1" : "#475569",
//           fontFamily: "Inter",
//         },
//         formatter: function (value) {
//           return Math.round(value).toLocaleString();
//         },
//       },
//       axisBorder: {
//       show: true,
//       color: isDark ? '#4B5563' : '#9CA3AF', // Axis line color
//       width: 1, // Thickness of the axis line
//       offsetX: 0,
//       offsetY: 0
//     },
//     axisTicks: {
//       show: false // Hide tick marks if you don't want them
//     }
//     },
    
//    tooltip: {
//   enabled: true,
//   shared: false,
//   followCursor: true, // Tooltip follows cursor
//   intersect: false, // KEY: Show tooltip even when not directly on the bar
//   y: {
//     formatter: (val) => `${val.toLocaleString(undefined, {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2
//     })} tCO₂e`
//   },
//   x: {
//     formatter: function (value, { seriesIndex, dataPointIndex }) {
//       // Return the display name for tooltip
//       return displayNames[dataPointIndex];
//     }
//   }
// },
//     legend: { show: false },
//     // grid: { show: false },
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

  // Keep all data, including zero/null values
  const allData = chartData.map(item => ({
    ...item,
    value: Number(item.value) || 0, // Ensure value is a number
    displayName: item.displayName || item.name || 'Unknown'
  }));

  // Sort descending by value (zeros will be at the end)
  const sortedData = [...allData].sort(
    (a, b) => (Number(b.value) || 0) - (Number(a.value) || 0)
  );

  const values = sortedData.map((item) => Number(item.value) || 0);
  const displayNames = sortedData.map((item) => item.displayName || item.name || 'Unknown');

  // Calculate dynamic bar width based on number of bars
  const barCount = sortedData.length;
  let columnWidth = "45%"; // default
  
  if (barCount > 15) columnWidth = "25%";
  else if (barCount > 10) columnWidth = "30%";
  else if (barCount > 5) columnWidth = "40%";

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
        click: function (event, chartContext, config) {
          const dataPointIndex = config.dataPointIndex;
          if (dataPointIndex === -1) return; // clicked outside bars
          const clickedData = sortedData[dataPointIndex];
          if (clickedData && onBarClick) {
            onBarClick(clickedData);
          }
        }
      },
    },
    grid: {
      padding: {
        bottom: 19,
      },
      show: false
    },
    plotOptions: {
      bar: {
        horizontal: false,
        endingShape: "rounded",
        columnWidth: columnWidth,
        distributed: true,
        borderRadius: 4, // Add slight rounding
      },
    },
    fill: {
      colors: sortedData.map((item) => {
        // Handle zero values specially - make them more transparent
        if (item.value === 0) {
          return isDark ? "#64748b70" : "#94a3b870"; // Semi-transparent gray
        }

        if (selectedBuilding) {
          if (item.buildingId === selectedBuilding) {
            return "#34D399";
          }
          return isDark ? "#4b5563" : "#d1d5db"; // Dim other bars
        }

        // Check if this bar matches the selected category
        if (selectedCategory) {
          if (item.name === selectedCategory || item.categoryKey === selectedCategory) {
            return "#34D399"; // Highlight color
          }
          return isDark ? "#4b5563" : "#d1d5db"; // Dim other bars
        }

        return "#4098ab"; // Default color
      }),
    },
    dataLabels: { 
      enabled: false 
    },
    stroke: { 
      show: true, 
      width: 2, 
      colors: ["transparent"] 
    },
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
        minHeight: 50,
        style: {
          colors: isDark ? "#CBD5E1" : "#475569",
          fontFamily: "Inter",
          fontSize: barCount > 10 ? '9px' : '10px' // Smaller font for many bars
        }
      },
      axisBorder: { 
        show: true,
        color: isDark ? '#4B5563' : '#9CA3AF',
        height: 1,
        offsetX: 0,
        offsetY: 0
      },
      axisTicks: { 
        show: false 
      },
      tickPlacement: 'on'
    },
    yaxis: {
      opposite: isRtl,
      tickAmount: 4,
      min: 0,
      labels: {
        style: {
          colors: isDark ? "#CBD5E1" : "#475569",
          fontFamily: "Inter",
        },
        formatter: function (value) {
          if (value === 0) return '0';
          if (value < 1) return value.toFixed(2); // Show decimals for very small values
          return Math.round(value).toLocaleString();
        },
      },
      axisBorder: {
        show: true,
        color: isDark ? '#4B5563' : '#9CA3AF',
        width: 1,
        offsetX: 0,
        offsetY: 0
      },
      axisTicks: {
        show: false
      }
    },
    tooltip: {
      enabled: true,
      shared: false,
      followCursor: true,
      intersect: false,
      y: {
        formatter: (val) => {
          if (val === 0) return '0.00 tCO₂e';
          return `${val.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })} tCO₂e`;
        }
      },
      x: {
        formatter: function (value, { seriesIndex, dataPointIndex }) {
          return displayNames[dataPointIndex];
        }
      }
    },
    legend: { show: false },
    annotations: {
      yaxis: [{
        y: 0,
        borderColor: isDark ? '#475569' : '#cbd5e1',
        strokeDashArray: 0,
        borderWidth: 1
      }]
    }
  };

  // Add no-data message if all values are zero
  const allZero = values.every(val => val === 0);
  
  if (allZero) {
    return (
      <div style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          {/* <div className="text-xl text-gray-400 mb-2">📊</div> */}
          <p className="text-gray-500 dark:text-gray-400">No emissions data available</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">All categories show zero emissions</p>
        </div>
      </div>
    );
  }

  return <Chart options={options} series={series} type="bar" height={height} />;
};

export default RevenueBarChart;

