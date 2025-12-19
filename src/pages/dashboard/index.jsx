import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "@/components/ui/Card";
import GroupChart1 from "@/components/partials/widget/chart/group-chart-1"; // Pie/donut chart
import RevenueBarChart from "@/components/partials/widget/chart/revenue-bar-chart"; // Bar chart

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
          `${process.env.REACT_APP_BASE_URL}/building/Get-All-Buildings`,
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

  // Bar chart data
  const barChartData = [
    { name: "Stationary Combustion", value: dashboardData?.scope1?.stationaryCombustion?.totalEmissionTCo2e || 0 },
    { name: "Transport", value: dashboardData?.scope1?.transport?.totalEmissionTCo2e || 0 },
    { name: "Fugitive", value: dashboardData?.scope1?.fugitive?.totalEmissionTCo2e || 0 },
    { name: "Emission Activity", value: dashboardData?.scope1?.emissionActivity?.totalEmissionTCo2e || 0 },
    {
      name: "Purchased Electricity",
      value:
        (dashboardData?.scope2?.purchasedElectricity?.totalLocationTCo2e || 0) +
        (dashboardData?.scope2?.purchasedElectricity?.totalMarketTCo2e || 0),
    },
  ];

  // Format numbers helper
  const formatNumber = (num) => {
    if (!num && num !== 0) return "0";
    return num.toLocaleString();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar: Building filter */}
      <aside className="w-64 p-4 bg-white shadow-lg overflow-auto rounded-xl">
        <h2 className="font-bold text-xl mb-6 text-gray-800 dark:text-gray-200">
          Filters
        </h2>

        {/* ---------------- BUILDING FILTER (DROPDOWN) ---------------- */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg text-gray-700 mb-3">Building</h3>
          <select
            value={selectedBuilding[0] || ""}
            onChange={(e) => setSelectedBuilding(e.target.value ? [e.target.value] : [])}
            className="w-full border rounded-md px-3 py-2 text-sm"
          >
            <option value="">Select a building</option>
            {buildings.map((b) => (
              <option key={b._id} value={b._id}>
                {b.buildingName || b.name}
              </option>
            ))}
          </select>
        </div>

        {/* ---------------- DEPARTMENT FILTER ---------------- */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg text-gray-700 mb-3">Department</h3>
          <div className="space-y-2 text-sm">
            {["Operations", "Finance", "HR", "IT", "Maintenance"].map((dept) => (
              <label key={dept} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedDepartments((prev) => [...prev, dept]);
                    } else {
                      setSelectedDepartments((prev) =>
                        prev.filter((d) => d !== dept)
                      );
                    }
                  }}
                />
                {dept}
              </label>
            ))}
          </div>
        </div>

        {/* ---------------- DATE RANGE FILTER ---------------- */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg text-gray-700 mb-3">Date Range</h3>
          <div className="space-y-2">
            <input
              type="date"
              className="w-full border rounded-md px-3 py-2 text-sm"
              onChange={(e) => setFromDate(e.target.value)}
            />
            <input
              type="date"
              className="w-full border rounded-md px-3 py-2 text-sm"
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        {/* ---------------- FILTER BUTTONS ---------------- */}
        <div className="space-y-2">
          <button
            onClick={applyFilters}
            className="w-full btn-dark py-2 rounded-lg font-semibold"

          >
            Apply Filters
          </button>

          <button
            onClick={clearFilters}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold"
          >
            Clear Filters
          </button>
        </div>
      </aside>



      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
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
            <h3 className="font-semibold mb-4">GHG Emissions by Scope</h3>
            <GroupChart1 chartData={pieData} loading={loading} />
          </Card>


          <Card className="flex-1 p-4 min-w-[320px]">
            <h3 className="font-semibold mb-4">Building-wise GHG Emissions</h3>
            <RevenueBarChart chartData={barChartData} loading={loading} />
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
