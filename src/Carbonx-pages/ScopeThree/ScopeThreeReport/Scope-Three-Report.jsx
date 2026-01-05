import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { map } from "leaflet";
import { Business } from "@mui/icons-material";

// Utility for formatting numbers
const formatNumber = (num) => {
  const value = Number(num);
  if (!num || value === 0) return "N/A";
  if (Math.abs(value) < 0.01) {
    return value.toExponential(2);
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const ScopeThreeReport = () => {
  const [data, setData] = useState({ goodsAndServices: [], capitalGoods: [], fuelAndEnergy: [], wasteGenerated: [], Business: [], upstreamTransportation: [], downstreamTransportation: [], });
  const [loading, setLoading] = useState(false);
  const [emissionType, setEmissionType] = useState("all");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 5,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const navigate = useNavigate();

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const [goodsAndServicesRes, capitalGoodsRes, fuelAndEnergyRes, wasteGeneratedRes, businessRes, upstreamTransportationRes, downstreamTransportationRes, employeeCommuteRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_BASE_URL}/Purchased-Goods-Services/get-All?limit=1000`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_BASE_URL}/Purchased-Goods-Services/get-All-isCaptialGoods?limit=1000`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_BASE_URL}/Fuel-And-Energy/get-All?limit=1000`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_BASE_URL}/Waste-Generate/List?limit=1000`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_BASE_URL}/Business-Travel/List?limit=1000`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_BASE_URL}/upstream/Get-All?limit=1000`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_BASE_URL}/downstream/Get-All?limit=1000`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
           axios.get(`${process.env.REACT_APP_BASE_URL}/employee-commute/List?limit=1000`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setData({
          goodsAndServices: goodsAndServicesRes.data.data || [],
          capitalGoods: capitalGoodsRes.data.data || [],
          fuelAndEnergy: fuelAndEnergyRes.data.data || [],
          wasteGenerated: wasteGeneratedRes.data.data || [],
          Business: businessRes.data.data || [],
          upstreamTransportation: upstreamTransportationRes.data.data || [],
          downstreamTransportation: downstreamTransportationRes.data.data || [],
          employeeCommute: employeeCommuteRes.data.data || [],
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch emissions data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data based on dropdown
  const filteredData = useMemo(() => {
    if (!data) return [];
    switch (emissionType) {
      case "Purchased Goods and Services":
        return data.goodsAndServices;
      case "Capital Goods":
        return data.capitalGoods;
      case "Fuel and Energy Related Activities":
        return data.fuelAndEnergy;
      case "Waste Generated in Operation":
        return data.wasteGenerated;
      case "Business Travel":
        return data.Business;
      case "Upstream Transportation":
        return data.upstreamTransportation;
      case "Downstream Transportation":
        return data.downstreamTransportation;
      case "Employee Commuting":
        return data.employeeCommute;
      case "all":
        return [
          ...(data.goodsAndServices || []),
          ...(data.capitalGoods || []),
          ...(data.fuelAndEnergy || []),
          ...(data.wasteGenerated || []),
          ...(data.Business || []),
          ...(data.upstreamTransportation || []),
          ...(data.downstreamTransportation || []),
          ...(data.employeeCommute || []),
        ];
      default:
        return [];
    }
  }, [data, emissionType]);

  // Building-wise summary
  const buildingData = useMemo(() => {
    const map = {};
    filteredData.forEach((item) => {
      const name = item.buildingId?.buildingName || "N/A";
      if (!map[name]) map[name] = { totalKg: 0, count: 0 };
      map[name].totalKg += Number(item.calculatedEmissionKgCo2e || 0);
      map[name].count += 1; // increment record count
    });

    const entries = Object.entries(map).map(([buildingName, data]) => ({
      buildingName,
      totalKg: data.totalKg,
      totalT: data.totalKg / 1000,
      recordCount: data.count, // number of records for this building
    }));

    console.log("Building Data with record count:", entries);

    return entries;
  }, [filteredData]);

  console.log("Building Data:", buildingData);
  // console.log("Building Count:",totalBuildings)

  const paginatedData = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(buildingData.length / pagination.limit));

    // Fix invalid page when filter changes
    const safePage = Math.min(pagination.currentPage, totalPages);

    const startIndex = (safePage - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;

    return {
      data: buildingData.slice(startIndex, endIndex),
      totalPages,
      safePage,
    };
  }, [buildingData, pagination.currentPage, pagination.limit]);


  // Total Scope 3 including process
  const allTotalKg = useMemo(() => {
    const goodsAndServicesKg = (data.goodsAndServices || []).reduce(
      (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
      0
    );
    const capitalGoodsKg = (data.capitalGoods || []).reduce(
      (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
      0
    );
    const fuelAndEnergyKg = (data.fuelAndEnergy || []).reduce(
      (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
      0
    );
    const wasteGeneratedKg = (data.wasteGenerated || []).reduce(
      (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
      0
    );
    const businessKg = (data.Business || []).reduce(
      (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
      0
    );
      const upstreamTransportationKg = (data.upstreamTransportation || []).reduce(
      (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
      0
    );
    const downstreamTransportationKg = (data.downstreamTransportation || []).reduce(
      (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
      0
    );
     const employeeCommuteKg = (data.employeeCommute || []).reduce(
      (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
      0
    );

    // console.log("Process Kg:", processKg);
    return goodsAndServicesKg + capitalGoodsKg + fuelAndEnergyKg + wasteGeneratedKg + businessKg + upstreamTransportationKg + downstreamTransportationKg + employeeCommuteKg;
  }, [data]);

  const allTotalT = allTotalKg / 1000;

  // Individual Summary Cards
  // const summaryCards = useMemo(() => {
  //   const goodsAndServicesKg = (data.goodsAndServices || []).reduce(
  //     (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
  //     0
  //   );
  //   const capitalGoodsKg = (data.capitalGoods || []).reduce(
  //     (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
  //     0
  //   );
  //   const fuelAndEnergyKg = (data.fuelAndEnergy || []).reduce(
  //     (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
  //     0
  //   );
  //   const wasteGeneratedKg = (data.wasteGenerated || []).reduce(
  //     (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
  //     0
  //   );
  //   const businessKg = (data.Business || []).reduce(
  //     (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
  //     0
  //   );
  //   const upstreamTransportationKg = (data.upstreamTransportation || []).reduce(
  //     (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
  //     0
  //   );
  //   const downstreamTransportationKg = (data.downstreamTransportation || []).reduce(
  //     (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
  //     0
  //   );

  //   return [
  //     { name: "Purchased Goods and Services", kg: goodsAndServicesKg, t: goodsAndServicesKg / 1000, bg: "bg-cyan-50" },
  //     { name: "Capital Goods", kg: capitalGoodsKg, t: capitalGoodsKg / 1000, bg: "bg-red-50" },
  //     { name: "Fuel and Energy Related Activities", kg: fuelAndEnergyKg, t: fuelAndEnergyKg / 1000, bg: "bg-purple-50" },
  //     { name: "Waste Generated in Operation", kg: wasteGeneratedKg, t: wasteGeneratedKg / 1000, bg: "bg-green-50" },
  //     { name: "Business Travel", kg: businessKg, t: businessKg / 1000, bg: "bg-green-50" },
  //     { name: "Upstream Transportation", kg: upstreamTransportationKg, t: upstreamTransportationKg / 1000, bg: "bg-yellow-50" },
  //     { name: "Downstream Transportation", kg: downstreamTransportationKg, t: downstreamTransportationKg / 1000, bg: "bg-blue-50" },
  //   ];
  // }, [data]);
  const summaryCards = useMemo(() => {
    console.log(" STARTING SUMMARY CALCULATION FOR ALL CATEGORIES");
    console.log(" Full data structure:", JSON.stringify(data, null, 2));

    // Helper function to log building-wise emissions for a category
    const logBuildingEmissions = (categoryName, items) => {
      console.log(` ${categoryName.toUpperCase()} - Building-wise emissions:`);
      if (!items || items.length === 0) {
        console.log("   No items found");
        return;
      }
      
      items.forEach((item, index) => {
        const buildingName = item.buildingId?.buildingName || "Unknown Building";
        const emissionKg = Number(item.calculatedEmissionKgCo2e || 0);
        console.log(`   ${index + 1}. ${buildingName}: ${emissionKg.toFixed(2)} kg CO2e`);
      });
    };

    // Goods and Services
    const goodsAndServicesItems = data.goodsAndServices || [];
    logBuildingEmissions("Purchased Goods and Services", goodsAndServicesItems);
    const goodsAndServicesKg = goodsAndServicesItems.reduce(
      (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
      0
    );
    console.log(`    TOTAL: ${goodsAndServicesKg.toFixed(2)} kg CO2e`);

    // Capital Goods
    const capitalGoodsItems = data.capitalGoods || [];
    logBuildingEmissions("Capital Goods", capitalGoodsItems);
    const capitalGoodsKg = capitalGoodsItems.reduce(
      (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
      0
    );
    console.log(`    TOTAL: ${capitalGoodsKg.toFixed(2)} kg CO2e`);

    // Fuel and Energy
    const fuelAndEnergyItems = data.fuelAndEnergy || [];
    logBuildingEmissions("Fuel and Energy Related Activities", fuelAndEnergyItems);
    const fuelAndEnergyKg = fuelAndEnergyItems.reduce(
      (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
      0
    );
    console.log(`    TOTAL: ${fuelAndEnergyKg.toFixed(2)} kg CO2e`);

    // Waste Generated
    const wasteGeneratedItems = data.wasteGenerated || [];
    logBuildingEmissions("Waste Generated in Operation", wasteGeneratedItems);
    const wasteGeneratedKg = wasteGeneratedItems.reduce(
      (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
      0
    );
    console.log(`    TOTAL: ${wasteGeneratedKg.toFixed(2)} kg CO2e`);

    // Business Travel
    const businessItems = data.Business || [];
    logBuildingEmissions("Business Travel", businessItems);
    const businessKg = businessItems.reduce(
      (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
      0
    );
    console.log(`    TOTAL: ${businessKg.toFixed(2)} kg CO2e`);

    // Upstream Transportation
    const upstreamTransportationItems = data.upstreamTransportation || [];
    logBuildingEmissions("Upstream Transportation", upstreamTransportationItems);
    const upstreamTransportationKg = upstreamTransportationItems.reduce(
      (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
      0
    );
    console.log(`    TOTAL: ${upstreamTransportationKg.toFixed(2)} kg CO2e`);

    // Downstream Transportation
    const downstreamTransportationItems = data.downstreamTransportation || [];
    logBuildingEmissions("Downstream Transportation", downstreamTransportationItems);
    const downstreamTransportationKg = downstreamTransportationItems.reduce(
      (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
      0
    );
    console.log(`    TOTAL: ${downstreamTransportationKg.toFixed(2)} kg CO2e`);

    //Employee commute
       const employeeCommuteItems = data.employeeCommute || [];
    logBuildingEmissions("Employee Commuting", employeeCommuteItems);
    const employeeCommuteKg = employeeCommuteItems.reduce(
      (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
      0
    );
    console.log(`    TOTAL: ${employeeCommuteKg.toFixed(2)} kg CO2e`);

    // Calculate totals
    const totalKg = goodsAndServicesKg + capitalGoodsKg + fuelAndEnergyKg + 
                   wasteGeneratedKg + businessKg + upstreamTransportationKg + 
                   downstreamTransportationKg + employeeCommuteKg;
    
    console.log("\n FINAL TOTALS BY CATEGORY:");
    console.log("1. Purchased Goods and Services:", goodsAndServicesKg.toFixed(2), "kg CO2e");
    console.log("2. Capital Goods:", capitalGoodsKg.toFixed(2), "kg CO2e");
    console.log("3. Fuel and Energy:", fuelAndEnergyKg.toFixed(2), "kg CO2e");
    console.log("4. Waste Generated:", wasteGeneratedKg.toFixed(2), "kg CO2e");
    console.log("5. Business Travel:", businessKg.toFixed(2), "kg CO2e");
    console.log("6. Upstream Transportation:", upstreamTransportationKg.toFixed(2), "kg CO2e");
    console.log("7. Downstream Transportation:", downstreamTransportationKg.toFixed(2), "kg CO2e");
    console.log("8. Employee Commuting:", employeeCommuteKg.toFixed(2), "kg CO2e");
    console.log(" GRAND TOTAL:", totalKg.toFixed(2), "kg CO2e", `(${(totalKg/1000).toFixed(3)} t CO2e)`);

    return [
      { 
        name: "Purchased Goods and Services", 
        kg: goodsAndServicesKg, 
        t: goodsAndServicesKg / 1000, 
        bg: "bg-cyan-50",
        count: goodsAndServicesItems.length,
        items: goodsAndServicesItems
      },
      { 
        name: "Capital Goods", 
        kg: capitalGoodsKg, 
        t: capitalGoodsKg / 1000, 
        bg: "bg-red-50",
        count: capitalGoodsItems.length,
        items: capitalGoodsItems
      },
      { 
        name: "Fuel and Energy Related Activities", 
        kg: fuelAndEnergyKg, 
        t: fuelAndEnergyKg / 1000, 
        bg: "bg-purple-50",
        count: fuelAndEnergyItems.length,
        items: fuelAndEnergyItems
      },
      { 
        name: "Waste Generated in Operation", 
        kg: wasteGeneratedKg, 
        t: wasteGeneratedKg / 1000, 
        bg: "bg-green-50",
        count: wasteGeneratedItems.length,
        items: wasteGeneratedItems
      },
      { 
        name: "Business Travel", 
        kg: businessKg, 
        t: businessKg / 1000, 
        bg: "bg-green-50",
        count: businessItems.length,
        items: businessItems
      },
      { 
        name: "Upstream Transportation", 
        kg: upstreamTransportationKg, 
        t: upstreamTransportationKg / 1000, 
        bg: "bg-yellow-50",
        count: upstreamTransportationItems.length,
        items: upstreamTransportationItems
      },
      { 
        name: "Downstream Transportation", 
        kg: downstreamTransportationKg, 
        t: downstreamTransportationKg / 1000, 
        bg: "bg-blue-50",
        count: downstreamTransportationItems.length,
        items: downstreamTransportationItems
      },
        { 
        name: "Employee Commuting", 
        kg: employeeCommuteKg, 
        t: employeeCommuteKg / 1000, 
        bg: "bg-red-50",
        count: employeeCommuteItems.length,
        items: employeeCommuteItems
      },
    ];
  }, [data]);

  // React Select options
  const emissionOptions = [
    { value: "all", label: "All Scope 3 (Building-wise)" },
    { value: "Purchased Goods and Services", label: "Purchased Goods and Services" },
    { value: "Capital Goods", label: "Capital Goods" },
    { value: "Fuel and Energy Related Activities", label: "Fuel and Energy Related Activities" },
    { value: "Waste Generated in Operation", label: "Waste Generated in Operation"},
    { value: "Business Travel", label: "Business Travel" },
    { value: "Upstream Transportation", label: "Upstream Transportation" },
    { value: "Downstream Transportation", label: "Downstream Transportation" },
    { value: "Employee Commuting", label: "Employee Commuting" },
  ];

  return (
    <Card>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">GHG Emissions</h2>
      {/* Total Scope One */}
      <motion.div
        className="bg-gradient-to-r from-[#6fceba] to-[#6ca0b9] shadow-md rounded-2xl p-6 mb-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h2 className="text-2xl font-semibold mb-2 text-white">Total Scope 3 Emissions</h2>
        <p className="text-xl font-bold text-white">
          {loading
            ? "Loading..."
            : `${formatNumber(allTotalKg)} KgCO₂e | ${formatNumber(allTotalT)} tCO₂e`}
        </p>
      </motion.div>
      {/* Individual Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        {summaryCards.map((item, idx) => {
          const iconMap = {
            "Purchased Goods and Services": "heroicons:shopping-bag",
            "Capital Goods": "heroicons:building-office",
            "Fuel and Energy Related Activities": "heroicons:bolt",
            "Waste Generated in Operation": "heroicons:trash",
            "Business Travel": "heroicons:briefcase",
            "Upstream Transportation": "heroicons:arrow-up-tray",
            "Downstream Transportation": "heroicons:arrow-down-tray",
            "Employee Commuting": "heroicons:user-group",
          };
          return (
            <div
              key={idx}
              className={`${item.bg} rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-3`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon
                  icon={iconMap[item.name] || "heroicons:circle-stack"}
                  className="text-gray-700 text-2xl"
                />
                <h2 className="text-xl font-semibold mb-1 text-gray-700">{item.name}</h2>
              </div>
              <p className="text-[14px] font-medium text-gray-600 flex flex-col pl-8">
                <span>
                  {formatNumber(item.kg)}<span className="text-black-500"> KgCO₂e</span>
                </span>
                <span>
                  {formatNumber(item.t)}<span className="text-black-500"> tCO₂e</span>
                </span>
              </p>
            </div>
          );
        })}
      </div>
      {/* Building-wise Table + Filter */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h6 className="text-gray-800 font-semibold">

            {emissionType === "all"
              ? "All Scope 3"
              : emissionType.charAt(0).toUpperCase() + emissionType.slice(1)}
            {" "} Emissions (Building-Wise)
          </h6>
          <div className="w-64">
            <Select
              options={emissionOptions}
              value={emissionOptions.find((opt) => opt.value === emissionType)}
              onChange={(selected) => setEmissionType(selected.value)}
              classNamePrefix="react-select"
              placeholder="Select Emission Type"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#ccc",
                  boxShadow: "none",
                  "&:hover": { borderColor: "#3AB89D" },
                }),
              }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider">
                  Sr.No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider">
                  Building
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider whitespace-nowrap">
                  Total Emissions (KgCO₂e)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider whitespace-nowrap">
                  Total Emissions (tCO₂e)
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    No data available
                  </td>
                </tr>
              ) : (
                paginatedData.data.map((row, index) => (
                  <tr key={index} className="even:bg-gray-50">
                    <td className="px-6 py-4">
                      {index + 1 + (pagination.currentPage - 1) * pagination.limit}
                    </td>
                    <td className="px-6 py-4">{row.buildingName}</td>
                    <td className="px-6 py-4">{formatNumber(row.totalKg)}</td>
                    <td className="px-6 py-4">{formatNumber(row.totalT)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
          {/* Go to Page */}
          <div className="flex items-center space-x-3">
            <span className="flex space-x-2 items-center">
              <span className="text-sm font-medium text-slate-600">Go</span>
              <input
                type="number"
                min="1"
                max={paginatedData.totalPages}
                className="form-control py-2"
                value={pagination.currentPage}
                onChange={(e) => {
                  let page = Number(e.target.value);
                  if (page < 1) page = 1;
                  if (page > paginatedData.totalPages) page = paginatedData.totalPages;
                  setPagination((p) => ({ ...p, currentPage: page }));
                }}
                style={{ width: "60px" }}
              />
            </span>

            <span className="text-sm font-medium text-slate-600">
              Page {paginatedData.safePage} of {paginatedData.totalPages}
            </span>
          </div>

          {/* Pagination Buttons */}
          <ul className="flex items-center space-x-3">
            <li>
              <button
                onClick={() => setPagination((p) => ({ ...p, currentPage: 1 }))}
                disabled={paginatedData.safePage === 1}
              >
                <Icon icon="heroicons:chevron-double-left-solid" />
              </button>
            </li>

            <li>
              <button
                onClick={() =>
                  setPagination((p) => ({ ...p, currentPage: p.currentPage - 1 }))
                }
                disabled={paginatedData.safePage === 1}
              >
                Prev
              </button>
            </li>

            {Array.from({ length: paginatedData.totalPages }, (_, idx) => (
              <li key={idx}>
                <button
                  className={`${idx + 1 === paginatedData.safePage
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-900"
                    } text-sm rounded h-6 w-6 flex items-center justify-center`}
                  onClick={() =>
                    setPagination((p) => ({ ...p, currentPage: idx + 1 }))
                  }
                >
                  {idx + 1}
                </button>
              </li>
            ))}

            <li>
              <button
                onClick={() =>
                  setPagination((p) => ({ ...p, currentPage: p.currentPage + 1 }))
                }
                disabled={paginatedData.safePage === paginatedData.totalPages}
              >
                Next
              </button>
            </li>

            <li>
              <button
                onClick={() =>
                  setPagination((p) => ({
                    ...p,
                    currentPage: paginatedData.totalPages,
                  }))
                }
                disabled={paginatedData.safePage === paginatedData.totalPages}
              >
                <Icon icon="heroicons:chevron-double-right-solid" />
              </button>
            </li>
          </ul>

          {/* Limit Selector */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-slate-600">Show</span>
            <select
              value={pagination.limit}
              onChange={(e) =>
                setPagination({ currentPage: 1, limit: Number(e.target.value) })
              }
              className="form-select py-2"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

      </Card>
    </Card>
  );
};

export default ScopeThreeReport;
