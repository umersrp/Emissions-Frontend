import React, { useState, useEffect } from "react";
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



const Dashboard = () => {
  const [buildings, setBuildings] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState([]);

  const [loading, setLoading] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");


  // Fetch buildings list on mount
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/building/Get-All-Buildings?page=1&limit=100000`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBuildings(res.data?.data?.buildings || []);
      } catch (error) {
        console.error("Error fetching buildings:", error);
      }
    };
    fetchBuildings();
  }, []);

  // Fetch dashboard data when selected building changes
  useEffect(() => {
    if (!selectedBuilding) {
      setDashboardData(null);
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/dashboard/dashboard-data`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { buildingId: selectedBuilding },
          }
        );
        setDashboardData(response.data.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedBuilding]);

  const applyFilters = async () => {
    if (!selectedBuilding) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/dashboard/dashboard-data`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            buildingId: selectedBuilding,
            departments: selectedDepartments,
            fromDate,
            toDate,
          },
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
  };


  // --- Calculate emissions ---

  // Scope 1: sum of stationary, transport, fugitive, emissionActivity
  const scope1Emission =
    (dashboardData?.scope1?.stationaryCombustion?.totalEmissionTCo2e || 0) +
    (dashboardData?.scope1?.fugitive?.totalEmissionTCo2e || 0) +
    (dashboardData?.scope1?.emissionActivity?.totalEmissionTCo2e || 0) +
    (dashboardData?.scope1?.transport?.totalEmissionTCo2e || 0);

  // Scope 2: sum of purchased electricity (location + market)
  const scope2Emission =
    (dashboardData?.scope2?.purchasedElectricity?.totalLocationTCo2e || 0) +
    (dashboardData?.scope2?.purchasedElectricity?.totalMarketTCo2e || 0);

  // Scope 3: default 0 if not available
  const scope3Emission = dashboardData?.scope3
    ? Object.values(dashboardData.scope3).reduce(
      (sum, item) => sum + (item?.totalEmissionTCo2e || 0),
      0
    )
    : 0;

  const totalEmission = scope1Emission + scope2Emission + scope3Emission;

  // Pie chart data
  const pieData = [
    { name: "Scope 1", value: scope1Emission },
    { name: "Scope 2", value: scope2Emission },
    { name: "Scope 3", value: scope3Emission },
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







  // Format numbers helper
  const formatNumber = (num) => {
    if (!num && num !== 0) return "0";
    return num.toLocaleString();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar: Building filter */}



      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex flex-wrap gap-4 mb-6 items-end bg-white p-4 rounded-xl shadow-lg">
          {/* Building filter */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Building</label>
            <Select
              value={selectedBuilding[0] ? { value: selectedBuilding[0], label: buildingMap[selectedBuilding[0]] } : null}
              onChange={(option) => setSelectedBuilding(option ? [option.value] : [])}
              options={buildings.map((b) => ({
                value: b._id,
                label: b.buildingName || b.name,
              }))}
              isClearable
              placeholder="Select a building"
              className="w-48"
            />
          </div>

          {/* Department filter */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Departments</label>
            <select

              value={selectedDepartments}
              onChange={(e) => {
                const options = Array.from(e.target.selectedOptions, (option) => option.value);
                setSelectedDepartments(options);
              }}
              className="border rounded-md px-3 py-2 text-sm w-48"
            >
              {["Operations", "Finance", "HR", "IT", "Maintenance"].map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>


          {/* Date range filter */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              className="border rounded-md px-3 py-2 text-sm"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              className="border rounded-md px-3 py-2 text-sm"
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
        <div className="flex gap-4 mb-6 flex-wrap">
          <Card className="flex-1 text-black p-6 rounded-lg shadow-lg min-w-[220px]">
            <h3 className="text-lg font-semibold">Total GHG Emissions</h3>
            <p className="text-2xl text-red-500 font-bold mt-2">
              {formatNumber(totalEmission)} <span className="text-base font-normal">tCO₂e</span>
            </p>
          </Card>

          <Card className="flex-1 p-6 rounded-lg shadow-lg min-w-[220px]">
            <h3 className="text-lg font-semibold">Scope 1 Emissions</h3>
            <p className="text-2xl text-green-500 font-bold mt-2">{formatNumber(scope1Emission)} tCO₂e</p>
            <p className="text-sm text-gray-600">Direct emissions</p>
          </Card>

          <Card className="flex-1 p-6 rounded-lg shadow-lg min-w-[220px]">
            <h3 className="text-lg font-semibold">Scope 2 Emissions</h3>
            <p className="text-2xl text-orange-500 font-bold mt-2">{formatNumber(scope2Emission)} tCO₂e</p>
            <p className="text-sm text-gray-600">Indirect from energy</p>
          </Card>

          <Card className="flex-1 p-6 rounded-lg shadow-lg min-w-[220px]">
            <h3 className="text-lg font-semibold">Scope 3 Emissions</h3>
            <p className="text-2xl text-purple-500 font-bold mt-2">{formatNumber(scope3Emission)} tCO₂e</p>
            <p className="text-sm text-gray-600">Other indirect emissions</p>
          </Card>
        </div>

        {/* Charts */}
        <div className="flex gap-6 flex-wrap">
          <Card className="flex-1 p-4 min-w-[320px]">
             <h3 className="font-semibold mb-4 text-xl flex items-center gap-2">
             GHG Emissions by Scopes
              <Tooltip title="This chart shows total GHG emissions for each building in tCO₂e.">
                <InfoOutlinedIcon className="text-red-400 cursor-pointer" fontSize="small" />
              </Tooltip>
            </h3>
            <GroupChart1 chartData={pieData} loading={loading} />
          </Card>


          <Card className="flex-1 p-4 min-w-[320px]">

            <h3 className="font-semibold mb-4 text-xl flex items-center gap-2">
              Building-wise GHG Emissions
              <Tooltip title="This chart shows total GHG emissions for each building in tCO₂e.">
                <InfoOutlinedIcon className="text-red-400 cursor-pointer" fontSize="small" />
              </Tooltip>
            </h3>

            <RevenueBarChart
              chartData={barChartData}
              onBarClick={(building) => {
                console.log("Clicked building:", building);
                // navigate(`/dashboard?buildingId=${building.buildingId}`);
              }}
            />

          </Card>
        </div>
        <div>
          <Card className="flex-1 p-4 min-w-[320px]">
            <Scope1EmissionsSection dashboardData={dashboardData} loading={loading} />
          </Card>
        </div>
        <div>
          <Card className="flex-1 p-4 min-w-[320px]">
            <Scope2EmissionsSection dashboardData={dashboardData} loading={loading} />
          </Card>
        </div>
        <div>
          <Card className="flex-1 p-4 min-w-[320px]">
            <Scope3EmissionsSection dashboardData={dashboardData} loading={loading} />
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
