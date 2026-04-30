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


  // const applyFilters = async () => {
  //   setLoading(true);
  //   try {
  //     const token = localStorage.getItem("token");
  //     const params = {};

  //     // Set applied building from the current dropdown selection
  //     setAppliedBuilding(selectedBuilding);

  //     if (selectedBuilding) {
  //       params.buildingId = selectedBuilding;
  //     }
  //     // if (selectedDepartments.length > 0) {
  //     //   params.stakeholder = selectedDepartments;
  //     // }
  //     if (selectedDepartments && selectedDepartments.length > 0) {
  //       params.stakeholder = selectedDepartments;
  //     }
  //     if (fromDate) {
  //       params.fromDate = fromDate;
  //     }
  //     if (toDate) {
  //       params.toDate = toDate;
  //     }

  //     const res = await axios.get(
  //       `${process.env.REACT_APP_BASE_URL}/dashboard/dashboard-data`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //         params,
  //       }
  //     );
  //     setDashboardData(res.data.data);
  //   } catch (err) {
  //     console.error("Filter error", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const applyFilters = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = {};

      // Set applied building from the current dropdown selection
      const buildingToApply = selectedBuilding;
      setAppliedBuilding(buildingToApply);

      if (selectedBuilding) {
        params.buildingId = selectedBuilding;
      }
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
  // const formatNumber = (num) => {
  //   if (num === null || num === undefined) return "0";

  //   return num.toLocaleString(undefined, {
  //     minimumFractionDigits: 2,
  //     maximumFractionDigits: 2,
  //   });
  // };
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "0";
    // Truncate decimals (no rounding)
    const truncated = Math.trunc(Number(num));
    return truncated.toLocaleString();
  };

  return (
    <div className="flex">
      {loading && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <img
              src={Logo}
              alt="Loading..."
              className="w-52 h-52 mx-auto animate-pulse"
            />
            {/* <p className="mt-4 text-gray-600 font-medium">Loading dashboard data...</p> */}
          </div>
        </div>
      )}

      {/* Sidebar: Building filter */}
      {/* Main content */}
      <main className={`flex-1 overflow-auto scrollbar-hide  ${loading ? 'opacity-100' : ''}`}>
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          {/* Header */}
          <div className="px-6 py-4 border-b rounded-t-2xl bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                <p className="text-sm text-gray-500">Refine your data view</p>
              </div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Building filter */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Building
                </label>
                <Select
                  value={selectedBuilding ? {
                    value: selectedBuilding,
                    label: buildingMap[selectedBuilding]
                  } : null}
                  onChange={(option) => {
                    const buildingId = option ? option.value : null;
                    setSelectedBuilding(buildingId);
                  }}
                  options={buildings.map((b) => ({
                    value: b._id,
                    label: b.buildingName || b.name,
                  }))}
                  isClearable
                  placeholder="Select a Building"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: '0.75rem',
                      borderColor: '#e5e7eb',
                      boxShadow: 'none',
                      '&:hover': {
                        borderColor: '#3b82f6',
                      },
                    }),
                  }}
                />
              </div>

              {/* Department filter */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Department
                </label>
                <Select
                  options={stakeholderOptions}
                  placeholder="Select Department"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isClearable
                  value={
                    stakeholderOptions.find(
                      opt => opt.value === selectedDepartments
                    ) || null
                  }
                  onChange={(option) => {
                    setSelectedDepartments(option ? option.value : null);
                  }}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: '0.75rem',
                      borderColor: '#e5e7eb',
                      boxShadow: 'none',
                      '&:hover': {
                        borderColor: '#3b82f6',
                      },
                    }),
                  }}
                />
              </div>

              {/* From Date filter */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  From Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm 
            focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
            hover:border-blue-400 transition-all duration-200
            disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
            bg-white"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
              </div>

              {/* To Date filter */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  To Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm 
            focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
            hover:border-blue-400 transition-all duration-200
            disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
            bg-white"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>

            </div>

            {/* Active Filters Display */}
            {(selectedBuilding || selectedDepartments || fromDate || toDate) && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-gray-500">Active filters:</span>
                  {selectedBuilding && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Building: {buildingMap[selectedBuilding]}
                    </span>
                  )}
                  {selectedDepartments && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Department: {stakeholderOptions.find(opt => opt.value === selectedDepartments)?.label}
                    </span>
                  )}
                  {fromDate && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      From: {new Date(fromDate).toLocaleDateString()}
                    </span>
                  )}
                  {toDate && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      To: {new Date(toDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={applyFilters}
                    className="w-auto btn-dark py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Apply Filters
                  </button>
                  <button
                    onClick={clearFilters}
                    className="w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total GHG Emissions - Featured Card */}
          <div className="lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6 transition-all hover:shadow-xl hover:scale-[1.02]">
            <div>
              <div className="flex justify-between items-center gap-2">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total GHG Emissions</h3>
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <svg className="w-5 h-5 text-primary-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white mt-3">
                {formatNumber(totalEmission)}
                <span className="text-sm font-normal text-slate-400 ml-1">tCO₂e</span>
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700">
              <p className="text-xs text-slate-400">All scopes combined</p>
            </div>
          </div>

          {/* Scope 1 Emissions */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 transition-all hover:shadow-lg hover:border-purple-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-primary-50/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 7-3 1-3-1-1-7z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-700">Scope 1 Emissions</h3>
                </div>
                <p className="text-2xl font-bold text-primary-500">
                  {formatNumber(scope1Emission)}
                  <span className="text-sm font-normal text-gray-500 ml-1">tCO₂e</span>
                </p>
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-50/20 text-primary-500">
                  Direct Emissions
                </span>

              </div>
            </div>

          </div>

          {/* Scope 2 Emissions */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 transition-all hover:shadow-lg hover:border-orange-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-50/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-700">Scope 2 Emissions</h3>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs font-medium text-gray-600">Location Based</p>
                </div>
                <p className="text-lg font-bold text-primary-500">
                  {formatNumber(purchasedElectricity?.totalLocationTCo2e || 0)}
                  <span className="text-xs font-normal text-gray-500"> tCO₂e</span>
                </p>
              </div>

              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs font-medium text-gray-600">Market Based</p>
                </div>
                <p className="text-lg font-bold text-primary-500">
                  {formatNumber(purchasedElectricity?.totalMarketTCo2e || 0)}
                  <span className="text-xs font-normal text-gray-500"> tCO₂e</span>
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-50/20 text-primary-500">
                Indirect Emissions
              </span>
            </div>
          </div>

          {/* Scope 3 Emissions */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 transition-all hover:shadow-lg hover:border-teal-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-700">Scope 3 Emissions</h3>
                </div>
                <p className="text-2xl font-bold text-primary-500">
                  {formatNumber(scope3Emission)}
                  <span className="text-sm font-normal text-gray-500 ml-1">tCO₂e</span>
                </p>
                <p className="text-xs text-gray-500 mt-2">Other Indirect Emissions</p>
              </div>
            </div>

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
              key={appliedBuilding}
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
