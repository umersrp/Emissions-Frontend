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
//   showZeroValues = true, // New prop to control zero/null value display
  
// }) => {
//   const [isDark] = useDarkMode();
//   const [isRtl] = useRtl();

//   // Process data based on showZeroValues prop
//   const processData = () => {
//     if (showZeroValues) {
//       // Keep all data, including zero/null values
//       return chartData.map(item => ({
//         ...item,
//         value: Number(item.value) || 0,
//         displayName: item.displayName || item.name || 'Unknown'
//       }));
//     } else {
//       // Filter out zero/null values
//       return chartData
//         .filter(item => {
//           const val = Number(item.value);
//           return !isNaN(val) && val !== 0;
//         })
//         .map(item => ({
//           ...item,
//           value: Number(item.value),
//           displayName: item.displayName || item.name || 'Unknown'
//         }));
//     }
//   };

//   const allData = processData();

//   // Sort descending by value (zeros will be at the end when showZeroValues is true)
//   const sortedData = [...allData].sort(
//     (a, b) => (Number(b.value) || 0) - (Number(a.value) || 0)
//   );

//   const values = sortedData.map((item) => Number(item.value) || 0);
//   const displayNames = sortedData.map((item) => item.displayName || item.name || 'Unknown');

//   // Calculate dynamic bar width based on number of bars
//   const barCount = sortedData.length;
//   let columnWidth = "45%"; // default

//   if (barCount > 15) columnWidth = "25%";
//   else if (barCount > 10) columnWidth = "30%";
//   else if (barCount > 5) columnWidth = "40%";

//   const maxValue = Math.max(...values, 1); // prevent 0

//   // Create the color array for the bars
//   const barColors = sortedData.map((item) => {
//     if (selectedBuilding) {
//       if (item.buildingId === selectedBuilding) {
//         return "#34D399";
//       }
//       return "#d1d5db";
//     }

//     // Check if this bar matches the selected category
//     if (selectedCategory) {
//       // Handle both cases: if selectedCategory is the categoryKey or the full name
//       if (item.name === selectedCategory || item.categoryKey === selectedCategory) {
//         return "#34D399"; // Highlight color
//       }
//       return "#d1d5db"; // Dim other bars
//     }

//     return "#4098ab"; // Default color
//   });

//   const series = [
//     {
//       name: "Emissions",
//       data: values,
//       color: "#4098ab", // Default fallback color
//     },
//     {
//       name: "Emission",
//       data: values.map(v => (v > 0 ? maxValue - v : 0)),
//       color: "transparent", // Make HoverCap transparent
//     }
//   ];

//   const options = {
//     chart: {
//       type: 'bar',
//       stacked: true,
//       toolbar: { show: false },
//       zoom: { enabled: false },
//       events: {
//         dataPointSelection: (event, chartContext, config) => {
//           // Allow clicks on BOTH series (index 0 for actual bar, index 1 for HoverCap)
//           if (config.seriesIndex !== undefined && config.dataPointIndex !== undefined) {
//             onBarClick?.(sortedData[config.dataPointIndex]);
//           }
//         }
//       },
//     },
//     grid: {
//       padding: {
//         bottom: 19,
//       },
//       show: false
//     },
//     states: {
//       hover: {
//         filter: {
//           type: 'none'
//         }
//       }
//     },
//     plotOptions: {
//       bar: {
//         horizontal: false,
//         columnWidth: columnWidth,
//         borderRadius: 4,
//         distributed: false,
//         colors: {
//           // Apply colors to each bar individually
//           ranges: barColors.map((color, index) => ({
//             from: index,
//             to: index,
//             color: color
//           }))
//         }
//       }
//     },
//     colors: barColors, // Set colors for the first series
//     fill: {
//       opacity: 1,
//       colors: barColors, // Set fill colors
//     },
//     stroke: {
//       width: [2, 0],
//       colors: barColors, // Set stroke colors for the first series
//     },
//     dataLabels: {
//       enabled: false
//     },
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
//           fontSize: barCount > 10 ? '9px' : '10px'
//         }
//       },
//       axisBorder: {
//         show: true,
//         color: isDark ? '#4B5563' : '#9CA3AF',
//         height: 1,
//         offsetX: 0,
//         offsetY: 0
//       },
//       axisTicks: {
//         show: false
//       },
//       tickPlacement: 'on'
//     },
//     yaxis: {
//       opposite: isRtl,
//       tickAmount: 4,
//       min: 0,
//       labels: {
//         style: {
//           colors: isDark ? "#CBD5E1" : "#475569",
//           fontFamily: "Inter",
//         },
//         formatter: function (value) {
//           if (value === 0) return '0';
//           if (value < 1) return value.toFixed(2);
//           return Math.round(value).toLocaleString();
//         },
//       },
//       axisBorder: {
//         show: true,
//         color: isDark ? '#4B5563' : '#9CA3AF',
//         width: 1,
//         offsetX: 0,
//         offsetY: 0
//       },
//       axisTicks: {
//         show: false
//       }
//     },
//     tooltip: {
//       intersect: true,
//       shared: false,
//       y: {
//         formatter: (_, { dataPointIndex }) => {
//           const realVal = values[dataPointIndex];
//           return `${realVal.toLocaleString(undefined, {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2
//           })} tCO₂e`;
//         }
//       }
//     },
//     legend: { show: false },
//     annotations: {
//       yaxis: [{
//         y: 0,
//         borderColor: isDark ? '#475569' : '#cbd5e1',
//         strokeDashArray: 0,
//         borderWidth: 1
//       }]
//     }
//   };

//   // Check if we should show the no-data message
//   const shouldShowNoData = () => {
//     if (showZeroValues) {
//       // When showing zero values, only show no-data if chartData is empty
//       return chartData.length === 0;
//     } else {
//       // When NOT showing zero values, show no-data if all values are zero or chartData is empty
//       return chartData.length === 0 || chartData.every(item => {
//         const val = Number(item.value);
//         return isNaN(val) || val === 0;
//       });
//     }
//   };

//   if (shouldShowNoData()) {
//     return (
//       <div style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//         <div className="text-center">
//           <p className="text-gray-500 dark:text-gray-400">No emissions data available</p>
//           <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
//             {showZeroValues 
//               ? "No categories to display" 
//               : "All categories show zero emissions"}
//           </p>
//         </div>
//       </div>
//     );
//   }

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
  showZeroValues = true,
  minBarHeight = 5, // Minimum visual height for bars (in percentage of max value)
}) => {
  const [isDark] = useDarkMode();
  const [isRtl] = useRtl();

  // Process data based on showZeroValues prop
  const processData = () => {
    if (showZeroValues) {
      // Keep all data, including zero/null values
      return chartData.map(item => ({
        ...item,
        value: Number(item.value) || 0,
        displayName: item.displayName || item.name || 'Unknown'
      }));
    } else {
      // Filter out zero/null values
      return chartData
        .filter(item => {
          const val = Number(item.value);
          return !isNaN(val) && val !== 0;
        })
        .map(item => ({
          ...item,
          value: Number(item.value),
          displayName: item.displayName || item.name || 'Unknown'
        }));
    }
  };

  const allData = processData();

  // Sort descending by value (zeros will be at the end when showZeroValues is true)
  const sortedData = [...allData].sort(
    (a, b) => (Number(b.value) || 0) - (Number(a.value) || 0)
  );

  // Get the actual values for tooltip
  const actualValues = sortedData.map((item) => Number(item.value) || 0);
  
  // Find the maximum actual value (excluding zeros for calculation)
  const maxActualValue = Math.max(...actualValues.filter(v => v > 0), 1);
  
  // Calculate minimum bar height as percentage of max value
  const minHeightValue = (minBarHeight / 100) * maxActualValue;
  
  // Create display values - these are what will be shown visually
  const displayValues = actualValues.map(value => {
    if (value === 0) return 0;
    // If value is too small, give it the minimum height
    if (value < minHeightValue) return minHeightValue;
    return value;
  });

  const displayNames = sortedData.map((item) => item.displayName || item.name || 'Unknown');

  // Calculate dynamic bar width based on number of bars
  const barCount = sortedData.length;
  let columnWidth = "45%"; // default

  if (barCount > 15) columnWidth = "25%";
  else if (barCount > 10) columnWidth = "30%";
  else if (barCount > 5) columnWidth = "40%";

  const maxDisplayValue = Math.max(...displayValues, 1); // prevent 0

  // Create the color array for the bars
  const barColors = sortedData.map((item) => {
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
  });

  const series = [
    {
      name: "Emissions",
      data: displayValues,
      color: "#4098ab", // Default fallback color
    },
    {
      name: "Emission",
      data: displayValues.map(v => (v > 0 ? maxDisplayValue - v : 0)),
      color: "transparent", // Make HoverCap transparent
    }
  ];

  const options = {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: { show: false },
      zoom: { enabled: false },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          // Allow clicks on BOTH series (index 0 for actual bar, index 1 for HoverCap)
          if (config.seriesIndex !== undefined && config.dataPointIndex !== undefined) {
            onBarClick?.(sortedData[config.dataPointIndex]);
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
    states: {
      hover: {
        filter: {
          type: 'none'
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: columnWidth,
        borderRadius: 4,
        distributed: false,
        colors: {
          // Apply colors to each bar individually
          ranges: barColors.map((color, index) => ({
            from: index,
            to: index,
            color: color
          }))
        }
      }
    },
    colors: barColors, // Set colors for the first series
    fill: {
      opacity: 1,
      colors: barColors, // Set fill colors
    },
    stroke: {
      width: [2, 0],
      colors: barColors, // Set stroke colors for the first series
    },
    dataLabels: {
      enabled: false
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
          fontSize: barCount > 10 ? '9px' : '10px'
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
          if (value < 1) return value.toFixed(2);
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
      intersect: true,
      shared: false,
      custom: function({ seriesIndex, dataPointIndex, w }) {
        // Get the actual data for this point
        const actualVal = actualValues[dataPointIndex];
        const displayVal = displayValues[dataPointIndex];
        const categoryName = displayNames[dataPointIndex];
        
        // Check if bar was enhanced
        const isEnhanced = actualVal > 0 && actualVal < displayVal;
        
        // Format the value
        const formattedValue = actualVal.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        
        // Determine the color based on highlighting
        let tooltipColor = "#4098ab";
        if (selectedBuilding) {
          if (sortedData[dataPointIndex]?.buildingId === selectedBuilding) {
            tooltipColor = "#34D399";
          } else {
            tooltipColor = "#d1d5db";
          }
        } else if (selectedCategory) {
          if (sortedData[dataPointIndex]?.name === selectedCategory || 
              sortedData[dataPointIndex]?.categoryKey === selectedCategory) {
            tooltipColor = "#34D399";
          } else {
            tooltipColor = "#d1d5db";
          }
        }
        
        // Build the tooltip HTML
        return `<div class="apexcharts-tooltip-title" style="margin-bottom: 5px;">${categoryName}</div>
                <div class="apexcharts-tooltip-series-group" style="display: flex; align-items: center;">
                  <div class="apexcharts-tooltip-marker" style="background-color: ${tooltipColor}; width: 12px; height: 12px; border-radius: 2px; margin-right: 8px;"></div>
                  <div class="apexcharts-tooltip-text" style="font-family: Inter, sans-serif;">
                    <div class="apexcharts-tooltip-y-group">
                      <span class="apexcharts-tooltip-text-label">Emissions: </span>
                      <span class="apexcharts-tooltip-text-value" style="font-weight: 600;">${formattedValue} tCO₂e</span>
                    </div>
                    ${isEnhanced ? 
                    ''
                      : ''
                    }
                  </div>
                </div>`;
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

  // Check if we should show the no-data message
  const shouldShowNoData = () => {
    if (showZeroValues) {
      // When showing zero values, only show no-data if chartData is empty
      return chartData.length === 0;
    } else {
      // When NOT showing zero values, show no-data if all values are zero or chartData is empty
      return chartData.length === 0 || chartData.every(item => {
        const val = Number(item.value);
        return isNaN(val) || val === 0;
      });
    }
  };

  if (shouldShowNoData()) {
    return (
      <div style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">No emissions data available</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {showZeroValues 
              ? "No categories to display" 
              : "All categories show zero emissions"}
          </p>
        </div>
      </div>
    );
  }

  return <Chart options={options} series={series} type="bar" height={height} />;
};

export default RevenueBarChart;

