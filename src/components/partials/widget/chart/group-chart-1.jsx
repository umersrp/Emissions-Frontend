import React from "react";
import Chart from "react-apexcharts";

const GroupChart1 = ({ chartData = [], loading }) => {
  
  
  // Calculate total and percentages from ORIGINAL values
  const originalValues = chartData.map(d => Number(d.value) || 0);
  const total = originalValues.reduce((sum, val) => sum + val, 0);
  
  // Calculate original percentages
  const originalPercentages = originalValues.map(val => 
    total > 0 ? (val / total) * 100 : 0
  );

  // Create series for chart - use ACTUAL VALUES but ensure tiny slices are visible
  const series = originalValues; 
  // const series = originalValues.map((value, index) => {
  //   const percentage = originalPercentages[index];
  //   // For very small but non-zero percentages, ensure they're visible
  //   if (percentage > 0 && percentage < 1) {
  //     // Calculate a minimum visible value (at least 1% of total)
  //     return Math.max(value, total * 0.01);
  //   }
  //   return value;
  // });
  
  const labels = chartData.map((d) => d.name);

  // const colors = ["#22C55E", "#22D3EE", "#FACC15"]; // green, cyan, yellow
  const colors = ["#22C55E","#F43F5E", "#FACC15"]; // green, cyan, yellow


  const options = {
    chart: {
      type: "pie",
    },
    labels,
    colors,
   stroke: {
  width: 2,
  colors: ['#ffffff'],
},
    legend: {
      show: false, // custom legend below
    },
    dataLabels: {
      enabled: false,
      // Show original percentages
      formatter: function(val, opts) {
        const dataIndex = opts.seriesIndex;
        const originalPercentage = originalPercentages[dataIndex];
        
        // Format based on value
        if (originalPercentage === 0) {
          return '0%';
        }
        if (originalPercentage < 0.1) {
          return '<0.1%';
        }
        if (originalPercentage < 1) {
          return originalPercentage.toFixed(1) + '%';
        }
        return Math.round(originalPercentage) + '%';
      },
      style: {
        fontSize: "12px",
        fontWeight: 600,
        colors: ["#374151"],
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "0%",
          labels: {
            show: false,
            total: {
              show: true,
              label: "Total",
              fontSize: "17px",
              fontWeight: 600,
              color: "#6B7280",
              formatter: () => total.toLocaleString() + ' tCO₂e',
            },
            value: {
              show: true,
              fontSize: "22px",
              fontWeight: 700,
              color: "#111827",
              formatter: () => total.toLocaleString(),
            },
          },
        },
        // Ensure all slices are visible
        expandOnClick: true,
        startAngle: -90,
        endAngle: 270,
      },
    },
    // tooltip: {
    //   y: {
    //     formatter: function(val) {
    //       return val.toLocaleString() + ' tCO₂e';
    //     }
    //   }
    // },
tooltip: {
  custom: function({ series, seriesIndex, w }) {
    const percentage = originalPercentages[seriesIndex];
    let percentText = '0%';
    
    if (percentage === 0) {
      percentText = '0%';
    } else if (percentage < 0.1) {
      percentText = '<0.1%';
    } else if (percentage < 1) {
      percentText = percentage.toFixed(1) + '%';
    } else {
      percentText = Math.round(percentage) + '%';
    }
   return `<div style="
              padding: 8px 12px; 
              border-radius: 6px; 
              background:#333; 
              color: #fff; 
              font-size: 14px;
              display: flex;
              gap: 2px;
            ">
              <span>(${percentText})</span>
              <span style="color: #fffff; font-weight: 600;">${series[seriesIndex].toLocaleString()} tCO₂e</span>
            </div>`;
  }
},
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 300
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading chart...</p>;
  }

  // Calculate percentages for legend (using original values)
  const calculatePercent = (value, index) => {
    if (total === 0) return '0%';
    const percentage = originalPercentages[index];
    if (percentage === 0) {
      return '0%';
    }
    if (percentage < 0.1) {
      return '<0.1%';
    }
    if (percentage < 1) {
      return percentage.toFixed(1) + '%';
    }
    return Math.round(percentage) + '%';
  };

  return (
    <div className="flex flex-col items-center">
      {/* Donut Chart */}
      <Chart options={options} series={series} type="donut" height={290} />

      {/* Custom Legend (like PDF) */}
      <div className="flex gap-4 mt-10">
        {chartData.map((item, index) => {
          const percent = calculatePercent(item.value, index);
          
          return (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index] }}
              />
              <span className="text-gray-700">
                {item.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GroupChart1;