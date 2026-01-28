import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Card from "@/components/ui/Card";
import GroupChart1 from "@/components/partials/widget/chart/group-chart-1"; // Pie/donut chart
import RevenueBarChart from "@/components/partials/widget/chart/revenue-bar-chart"; // Bar chart
import Scope1EmissionsSection from "@/components/partials/widget/chart/ScopeoneEmissions";
import Scope2EmissionsSection from "@/components/partials/widget/chart/Scope2Emissions";
import Scope3EmissionsSection from "@/components/partials/widget/chart/Scope3Emissions";
import Select from "@/components/ui/Select";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Tooltip } from '@mui/material';
// Import constants
import { NON_KYOTO_GASES } from "@/constant/scope1/calculate-fugitive-emission";
import {
  NON_KYOTO_ACTIVITIES,
  VO_ACTIVITIES,
  BIOGENIC_ACTIVITIES,
} from "@/constant/scope1/calculate-process-emission";
import Logo from "@/assets/images/logo/SrpLogo.png";
import { stakeholderOptions } from "@/constant/scope1/stationary-data";

// import { GHG_ACTIVITIES } from "@/constant/scope1/calculate-process-emission";

// Helper functions
const isNonKyotoMaterial = (materialRefrigerant) => {
  if (!materialRefrigerant) return false;

  return NON_KYOTO_GASES.some(gas =>
    materialRefrigerant.toLowerCase().includes(gas.toLowerCase())
  );
};

const isExcludedActivity = (activityType) => {
  if (!activityType) return false;

  const excludedActivities = [
    ...NON_KYOTO_ACTIVITIES,
    ...VO_ACTIVITIES,
    ...BIOGENIC_ACTIVITIES
  ];

  return excludedActivities.some(activity =>
    activityType.toLowerCase().includes(activity.toLowerCase())
  );
};

const calculateFugitiveEmissions = (fugitiveListData = []) => {
  return fugitiveListData.reduce((sum, record) => {
    if (isNonKyotoMaterial(record.materialRefrigerant)) {
      return sum;
    }

    const emissionValue = parseFloat(String(record.calculatedEmissionTCo2e)) || 0;
    return sum + emissionValue;
  }, 0);
};

const calculateProcessEmissions = (emissionActivityListData = []) => {
  let includedCount = 0;
  const result = emissionActivityListData.reduce((sum, record) => {
    if (isExcludedActivity(record.activityType)) {
      return sum;
    }
    includedCount++;
    const emissionValue = parseFloat(String(record.calculatedEmissionTCo2e)) || 0;
    return sum + emissionValue;
  }, 0);
  console.log(`PROCESS EMISSIONS: ${includedCount}/${emissionActivityListData.length} records included, Total: ${result} tCO₂e`);
  return result;
};

const Dashboard = () => {
  const [buildings, setBuildings] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  // const [selectedBuilding, setSelectedBuilding] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [appliedBuilding, setAppliedBuilding] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Fetch buildings list on mount
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/building/Get-All-Buildings?page=1&limit=100000`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Sort buildings A-Z by buildingName
        const sortedBuildings = (res.data?.data?.buildings || []).sort((a, b) => {
          const nameA = (a.buildingName || a.name || "").toLowerCase();
          const nameB = (b.buildingName || b.name || "").toLowerCase();
          return nameA.localeCompare(nameB);
        });

        setBuildings(sortedBuildings);
      } catch (error) {
        console.error("Error fetching buildings:", error);
      }
    };
    fetchBuildings();
  }, []);

  // Initial data fetch when component mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/dashboard/dashboard-data`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDashboardData(response.data.data);
      } catch (error) {
        console.error("Error fetching initial dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []); // Empty dependency array - runs once on mount


  const applyFilters = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = {};

      // Set applied building from the current dropdown selection
      setAppliedBuilding(selectedBuilding);

      if (selectedBuilding) {
        params.buildingId = selectedBuilding;
      }
      // if (selectedDepartments.length > 0) {
      //   params.stakeholder = selectedDepartments;
      // }
      if (selectedDepartments && selectedDepartments.length > 0) {
        params.stakeholder = selectedDepartments;
      }
      if (fromDate) {
        params.fromDate = fromDate;
      }
      if (toDate) {
        params.toDate = toDate;
      }

      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/dashboard/dashboard-data`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );
      setDashboardData(res.data.data);
    } catch (err) {
      console.error("Filter error", err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedDepartments([]);
    setFromDate("");
    setToDate("");
    setSelectedBuilding(null); // Clear dropdown selection
    setAppliedBuilding(null); // Clear applied building
    // window.location.reload();
    setResetTrigger(prev => prev + 1);
    // Optional: Refetch initial data when clearing filters

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/dashboard/dashboard-data`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDashboardData(response.data.data);
      } catch (error) {
        console.error("Error fetching initial dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  };
  // --- Calculate emissions ---
  const purchasedElectricity = dashboardData?.scope2?.purchasedElectricity;

  // Scope 1: sum of stationary, transport, fugitive, emissionActivity
  const scope1Emission = useMemo(() => {
    const stationary = dashboardData?.scope1?.stationaryCombustion?.totalEmissionTCo2e || 0;
    const transport = dashboardData?.scope1?.transport?.totalEmissionTCo2e || 0;
    const fugitive = calculateFugitiveEmissions(dashboardData?.scope1?.fugitiveListData);
    const process = calculateProcessEmissions(dashboardData?.scope1?.EmissionActivityListData);

    console.log("Scope 1 Calculation Debug");
    console.log("Stationary:", stationary);
    console.log("Transport:", transport);
    console.log("Fugitive emissions calculated:", fugitive);
    console.log("Process emissions calculated:", process);
    // console.log("Fugitive list data:", dashboardData?.scope1?.fugitiveListData);
    console.log("Process list data:", dashboardData?.scope1?.EmissionActivityListData);
    console.log("Total scope1Emission:", stationary + transport + fugitive + process);
    console.log("=== End Debug ===");
    return stationary + transport + fugitive + process;
  }, [dashboardData]);

  // Scope 2(Market): sum of market based for pie
  const scope2MarketEmission = Number(dashboardData?.scope2?.purchasedElectricity?.totalMarketTCo2e || 0);

  // Scope 2: sum of purchased electricity (location + market)
  const scope2Emission =
    Number(dashboardData?.scope2?.purchasedElectricity?.totalLocationTCo2e || 0) +
    Number(dashboardData?.scope2?.purchasedElectricity?.totalMarketTCo2e || 0);

  // Scope 3: default 0 if not available
  const scope3Emission = dashboardData?.scope3
    ? Object.values(dashboardData.scope3).reduce((sum, item) => {
      if (Array.isArray(item)) {
        return (
          sum +
          item.reduce(
            (subSum, subItem) =>
              subSum + Number(subItem?.totalEmissionTCo2e || 0),
            0
          )
        );
      }

      return sum + Number(item?.totalEmissionTCo2e || 0);
    }, 0)
    : 0;

  const totalEmission = scope1Emission + scope2Emission + scope3Emission;

  // Pie chart data
  const pieData = [
    { name: "Scope 1", value: Number(scope1Emission) || 0 },
    { name: "Scope 2", value: Number(scope2MarketEmission) || 0 },
    { name: "Scope 3", value: Number(scope3Emission) || 0 },
  ];

  const buildingMap = {};
  buildings.forEach((b) => {
    buildingMap[b._id] = b.buildingName;
  });


  // Bar chart data
  const barChartData = dashboardData?.companyBuildingEmissions?.map((item) => ({
    name: item.buildingName || "Unknown",
    value: item.totalEmissionTCo2e,
    buildingId: item.buildingId,
  })) || [];

  const sumEmissionTCo2e = (data) => {
    if (!data) return 0;

    // Case 1: Array of records
    if (Array.isArray(data)) {
      return data.reduce(
        (sum, item) => sum + (item?.totalEmissionTCo2e || 0),
        0
      );
    }

    // Case 2: Object with totalEmissionTCo2e
    if (typeof data === "object") {
      return data.totalEmissionTCo2e || 0;
    }

    return 0;
  };

  const allModelEmissionData = dashboardData
    ? [
      // Scope 1
      {
        name: "Stationary Combustion",
        value: dashboardData?.scope1?.stationaryCombustion?.totalEmissionTCo2e || 0,
      },
      {
        name: "Mobile Combustion",
        value: dashboardData?.scope1?.transport?.totalEmissionTCo2e || 0,
      },
      {
        name: "Fugitive Emissions",
        value: dashboardData?.scope1?.fugitive?.totalEmissionTCo2e || 0,
      },
      {
        name: "Process Emission",
        value: dashboardData?.scope1?.processEmissions?.totalEmissionTCo2e || 0,
      },

      // Scope 2
      {
        name: "Purchased Electricity Location Based",
        value: dashboardData?.scope2?.purchasedElectricity?.totalLocationTCo2e || 0,
      },
      {
        name: "Purchased Electricity Market Based",
        value: dashboardData?.scope2?.purchasedElectricity?.totalMarketTCo2e || 0,
      },

      // Scope 3
      {
        name: "Purchased Goods & Services",
        value: sumEmissionTCo2e(
          dashboardData?.scope3?.purchasedGoods
        ),
      },
      {
        name: "Business Travel",
        value: sumEmissionTCo2e(
          dashboardData?.scope3?.businessTravel
        ),
      },
      {
        name: "Waste Generated",
        value: sumEmissionTCo2e(
          dashboardData?.scope3?.wasteGenerateTotal
        ),
      },
      // {
      //   name: "Purchased Goods",
      //   value: sumEmissionTCo2e(
      //     dashboardData?.scope3?.purchasedGoods
      //   ),
      // },
      {
        name: "Fuel & Energy Related Activities",
        value: sumEmissionTCo2e(
          dashboardData?.scope3?.FuelAndEnergys
        ),
      },
      {
        name: "Upstream Transportation",
        value: sumEmissionTCo2e(
          dashboardData?.scope3?.UpstreamTransportations
        ),
      },
      {
        name: "Downstream Transportation",
        value: sumEmissionTCo2e(
          dashboardData?.scope3?.DownstreamTransportations
        ),
      },
      {
        name: "Capital Goods",
        value: sumEmissionTCo2e(
          dashboardData?.scope3?.CapitalGoods
        ),
      },

    ]
    : [];

  // Format numbers helper
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "0";

    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="flex bg-gray-100">
      {loading && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <img
              src={Logo}
              alt="Loading..."
              className="w-52 h-24 mx-auto animate-pulse"
            />
            {/* <p className="mt-4 text-gray-600 font-medium">Loading dashboard data...</p> */}
          </div>
        </div>
      )}

      {/* Sidebar: Building filter */}
      {/* Main content */}
      <main className={`flex-1 p-6 overflow-auto scrollbar-hide  ${loading ? 'opacity-100' : ''}`}>
        <div className="flex flex-wrap gap-4 mb-6 items-end bg-white p-4 rounded-xl shadow-lg">
          {/* Building filter */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Building</label>
            <Select
              value={selectedBuilding ? {
                value: selectedBuilding,
                label: buildingMap[selectedBuilding]
              } : null}
              onChange={(option) => {
                const buildingId = option ? option.value : null;
                setSelectedBuilding(buildingId); // Only update temporary selection
              }}
              options={buildings.map((b) => ({
                value: b._id,
                label: b.buildingName || b.name,
              }))}
              isClearable
              placeholder="Select a Building"
              className="w-48"
            />
          </div>

          {/* Department filter */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Departments
            </label>
            <Select
              options={stakeholderOptions}
              placeholder="Select Department"
              className="w-48 text-sm"
              isClearable
              value={
                stakeholderOptions.find(
                  opt => opt.value === selectedDepartments
                ) || null
              }
              onChange={(option) => {
                setSelectedDepartments(option ? option.value : null);
              }}
            />
          </div>

          {/* Date range filter */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              className="w-full border-2 border-gray-300 rounded-lg px-4 text-sm 
              focus:border-black focus:outline-none focus:ring-0
              hover:border-black transition-colors duration-200
              disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
              h-[40px]"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              className="w-full border-2 border-gray-300 rounded-lg px-4  text-sm 
              focus:border-black focus:outline-none focus:ring-0
              hover:border-black transition-colors duration-200
              disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
              h-[40px]"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={applyFilters}
              className="btn-dark py-2 px-4 rounded-lg font-semibold"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-semibold"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-5 gap-4 mb-6 ">
          {/* Total GHG Emissions */}
          <div className="col-span-2 bg-white rounded-xl shadow-lg md:h-[190px]  h-[170px]   p-3">
            <h3 className="text-2xl font-semibold mt-2">Total GHG Emissions</h3>
            <p className="text-xl text-red-500 font-bold flex flex-col mt-2">
              {formatNumber(totalEmission)}
              <span>tCO₂e</span>
            </p>
          </div>

          {/* Scope 1 Emissions */}
          <div className="flex-1 bg-white rounded-xl shadow-lg md:h-[170px]  h-[150px]  mt-2.5 p-3">
            <h3 className="text-sm xl:text-lg font-semibold -mt-2">Scope 1 Emissions</h3>
            <p className="text-xl text-purple-500 font-bold break-words">
              {formatNumber(scope1Emission)}
              <span className="block">tCO₂e</span>
            </p>
            <p className="text-[12px] text-gray-600">Direct Emissions</p>
          </div>

          {/* Scope 2 Emissions */}
          <div className="flex-1 bg-white rounded-xl shadow-lg md:h-[170px] h-[150px] mt-2.5 p-3">
            <h3 className="text-sm xl:text-lg font-semibold -mt-2">Scope 2 Emissions</h3>

            {/* Breakdown (smaller, subtle) */}
            <div className="space-y-1">
              <p className="text-[12px] text-black-500 flex flex-col">
                Location Based
                <span className="text-sm font-bold text-orange-500">
                  {formatNumber(purchasedElectricity?.totalLocationTCo2e || 0)} tCO₂e
                </span>
              </p>
              <p className="text-[12px] text-black-500 flex flex-col">
                Market Based
                <span className="text-[12px]  font-bold text-orange-500">
                  {formatNumber(purchasedElectricity?.totalMarketTCo2e || 0)} tCO₂e
                </span>
              </p>
            </div>
            <p className="text-[12px] text-gray-600">
              Indirect Emissions
            </p>
          </div>

          {/* Scope 3 Emissions */}
          <div className="flex-1 bg-white rounded-xl shadow-lg md:h-[170px]   h-[150px]  mt-2.5 p-3">
            <h3 className="text-sm xl:text-lg font-semibold -mt-2">Scope 3 Emissions</h3>
            <p className="text-xl text-purple-500 font-bold break-words">
              {formatNumber(scope3Emission)}
              <span className="block">tCO₂e</span>
            </p>
            <p className="text-[12px] text-gray-600">Other Indirect Emissions</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 mb-5">
          <Card className="flex-1  min-w-[320px]">
            <h3 className="font-semibold mb-20 text-xl flex items-center gap-2">
              GHG Emissions by Scopes
              <Tooltip title="This chart shows total GHG emissions for each building in tCO₂e.">
                <InfoOutlinedIcon className="text-red-400 cursor-pointer" fontSize="small" />
              </Tooltip>
            </h3>
            <GroupChart1 chartData={pieData} loading={loading} />
          </Card>

          {/* <Card className="flex-1  min-w-[320px] col-span-2">
            <h3 className="font-semibold  text-xl flex items-center gap-2">
              Building-Wise GHG Emissions
              <Tooltip title="This chart shows total GHG emissions for each building in tCO₂e. The selected building will be highlighted in blue.">
                <InfoOutlinedIcon className="text-red-400 cursor-pointer" fontSize="small" />
              </Tooltip>
            </h3>

            <RevenueBarChart
              chartData={barChartData}
              onBarClick={(building) => {
                console.log("Clicked building:", building);
                // If you want clicking to also select the building in the filter
                // setSelectedBuilding([building.buildingId]);
                // setSelectedBuilding(building.buildingId);
              }}
              selectedBuilding={appliedBuilding} // Pass the selected building ID
            />
          </Card> */}
          <Card className="flex-1 min-w-[320px] col-span-2 ">
             <h3 className="font-semibold text-xl flex items-center gap-2">
              Building-Wise GHG Emissions
              <Tooltip title="This chart shows total GHG emissions for each building in tCO₂e. The selected building will be highlighted in blue.">
                <InfoOutlinedIcon className="text-red-400 cursor-pointer" fontSize="small" />
              </Tooltip>
            </h3>
            {/* <div className="pr-20 min-w-[300px] overflow-x-auto scrollbar-hide ">  */}
{/*            <div style={{ minWidth: `${Math.max(barChartData.length * 60, 800)}px` }} > */}
              <RevenueBarChart
                chartData={barChartData}
                showZeroValues={false}
                onBarClick={(building) => {
                  console.log("Clicked building:", building);
                }}
                selectedBuilding={appliedBuilding}
              />
            {/* </div> */}
          
          </Card>
        </div>

        {/* Category-Wise GHG Emissions */}
        <div className="mb-5">
          <Card className="flex-1 min-w-[320px]" title="Category-Wise GHG Emissions">
            <div className="flex items-center gap-2 mb-4">
              <span>Category-Wise GHG Emissions</span>
              <Tooltip title="This chart shows emissions from all emission models combined (tCO₂e)." arrow>
                <InfoOutlinedIcon className="text-red-400 cursor-pointer" fontSize="small" />
              </Tooltip>
            </div>

            <RevenueBarChart
              chartData={allModelEmissionData}
              height={450}
            />
          </Card>
        </div>

        {/* scope 1 */}
        <div className="mb-5">
          <Card className="flex-1  min-w-[320px]" title="Scope 1 Emissions by Category">
            <Scope1EmissionsSection dashboardData={dashboardData} loading={loading} resetTrigger={resetTrigger} />
          </Card>
        </div>
        {/* scope 2 */}
        <div className="mb-5">
          <Card className="flex-1  min-w-[320px]" title="Scope 2 Emissions by Category">
            <Scope2EmissionsSection dashboardData={dashboardData} loading={loading} resetTrigger={resetTrigger} />
          </Card>
        </div>
        {/* scope 3 */}
        <div>
          <Card className="flex-1  min-w-[320px]" title="Scope 3 Emissions by Category">
            <Scope3EmissionsSection dashboardData={dashboardData} loading={loading} resetTrigger={resetTrigger} />
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
