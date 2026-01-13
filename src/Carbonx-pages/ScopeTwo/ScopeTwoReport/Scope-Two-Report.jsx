import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

// Utility for formatting numbers
const formatNumber = (num) => {
  const value = Number(num);
  if (!num || value === 0) return "N/A";
  if (Math.abs(value) < 0.01) {
    return value.toExponential(2);
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
};


const ScopeTwoReport = () => {
  const [data, setData] = useState({ electricity: [], steam: [], heating: [], cooling: [] });
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

        const [electricityRes, steamRes, heatingRes, coolingRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_BASE_URL}/Purchased-Electricity/get-All?limit=1000`, {
            headers: { Authorization: `Bearer ${token}` },
          }),

        ]);

        setData({
          electricity: electricityRes.data.data || [],
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
      case "Purchased Electricity":
        return data.electricity;
      case "steam":
        return data.steam;
      case "heating":
        return data.heating;
      case "cooling":
        return data.cooling;
      case "all":
        return [
          ...(data.electricity || []),
          ...(data.steam || []),
          ...(data.heating || []),
          ...(data.cooling || []),
        ];
      default:
        return [];
    }
  }, [data, emissionType]);

  // Building-wise summary
  const buildingData = useMemo(() => {
    const map = {};
    filteredData.forEach((item) => {
      const name = item.buildingId?.buildingName || "Unknown";
      if (!map[name]) map[name] = 0;
      // map[name] += Number(item.calculatedEmissionKgCo2e || 0);
      if (!map[name]) {
        map[name] = { location: 0, market: 0 };
      }

      map[name].location += Number(item.calculatedEmissionKgCo2e || 0);
      map[name].market += Number(item.calculatedEmissionMarketKgCo2e || 0);

    });
    // return Object.entries(map).map(([buildingName, kg]) => ({
    //   buildingName,
    //   totalKg: kg,
    //   totalT: kg / 1000,
    // }));
    return Object.entries(map).map(([buildingName, obj]) => ({
      buildingName,
      totalKg: obj.location,
      totalT: obj.location / 1000,
      marketKg: obj.market,
      marketT: obj.market / 1000,
    }));

  }, [filteredData]);

  // Manual pagination
  const paginatedData = useMemo(() => {
    const totalPages = Math.ceil(buildingData.length / pagination.limit) || 1;
    const startIndex = (pagination.currentPage - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const slicedData = buildingData.slice(startIndex, endIndex);

    return {
      data: slicedData,
      totalPages,
      hasNextPage: pagination.currentPage < totalPages,
      hasPrevPage: pagination.currentPage > 1,
    };
  }, [buildingData, pagination.currentPage, pagination.limit]);

  // Total Scope 1 including cooling
  // const allTotalKg = useMemo(() => {
  //   // const electricityKg = (data.electricity || []).reduce(
  //   //   (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
  //   //   0
  //   // );
  //   const electricityLocationKg = (data.electricity || []).reduce(
  //     (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
  //     0
  //   );

  //   const electricityMarketKg = (data.electricity || []).reduce(
  //     (sum, item) => sum + Number(item.calculatedEmissionMarketKgCo2e || 0),
  //     0
  //   );
  //   const steamKg = (data.steam || []).reduce(
  //     (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
  //     0
  //   );
  //   const heatingKg = (data.heating || []).reduce(
  //     (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
  //     0
  //   );
  //   const coolingKg = (data.cooling || []).reduce(
  //     (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
  //     0
  //   );
  //   return electricityLocationKg + electricityMarketKg + steamKg + heatingKg + coolingKg;
  // }, [data]);

  // const allTotalT = allTotalKg / 1000;

  // Total Scope 2 (Separate Location & Market based)
  const totalLocationKg = useMemo(() => {
    return (data.electricity || []).reduce(
      (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
      0
    );
  }, [data]);

  const totalMarketKg = useMemo(() => {
    return (data.electricity || []).reduce(
      (sum, item) => sum + Number(item.calculatedEmissionMarketKgCo2e || 0),
      0
    );
  }, [data]);

  const totalLocationT = totalLocationKg / 1000;
  const totalMarketT = totalMarketKg / 1000;


  // Individual Summary Cards
  const summaryCards = useMemo(() => {
    // const electricityKg = (data.electricity || []).reduce(
    //   (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
    //   0
    // );
    // Purchased Electricity: Location & Market based
    const electricityLocationKg = (data.electricity || []).reduce(
      (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
      0
    );

    const electricityMarketKg = (data.electricity || []).reduce(
      (sum, item) => sum + Number(item.calculatedEmissionMarketKgCo2e || 0),
      0
    );
    const steamKg = (data.steam || []).reduce(
      (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
      0
    );
    const heatingKg = (data.heating || []).reduce(
      (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
      0
    );
    const coolingKg = (data.cooling || []).reduce(
      (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
      0
    );

    return [
      // { name: "Purchased Electricity", kg: electricityKg, t: electricityKg / 1000, bg: "bg-cyan-50" },
      // {
      //   name: "Purchased Electricity Location-Based",
      //   kg: electricityLocationKg,
      //   t: electricityLocationKg / 1000,
      //   bg: "bg-cyan-50",
      // },
      // {
      //   name: "Purchased Electricity Market-Based",
      //   kg: electricityMarketKg,
      //   t: electricityMarketKg / 1000,
      //   bg: "bg-blue-50",
      // },
      {
        name: "Purchased Electricity",
        locationKg: electricityLocationKg,
        locationT: electricityLocationKg / 1000,
        marketKg: electricityMarketKg,
        marketT: electricityMarketKg / 1000,
        totalKg: electricityLocationKg + electricityMarketKg,
        totalT: (electricityLocationKg + electricityMarketKg) / 1000,
        bg: "bg-cyan-50",
      },
      //  { name: "Purchased Steam", kg: steamKg, t: steamKg / 1000, bg: "bg-red-50" },
      //  { name: "Purchased Heating", kg: heatingKg, t: heatingKg / 1000, bg: "bg-purple-50" },
      //  { name: "Purchased Cooling", kg: coolingKg, t: coolingKg / 1000, bg: "bg-green-50" },
    ];
  }, [data]);

  // React Select options
  const emissionOptions = [
    { value: "all", label: "All Scope 2 (Building-wise)" },
    { value: "Purchased Electricity", label: "Purchased Electricity" },
    // { value: "steam", label: "Purchased Steam" },
    // { value: "heating", label: "Purchased Heating" },
    // { value: "cooling", label: "Purchased Cooling" },
  ];

  return (
    <Card>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">GHG Emissions</h2>

      {/* Total Scope One */}
      {/* <motion.div
        className="bg-gradient-to-r from-[#6fceba] to-[#6ca0b9] shadow-md rounded-2xl p-6 mb-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h2 className="text-2xl font-semibold mb-2 text-white">Total Scope 2 Emissions</h2>
        <p className="text-xl font-bold text-white">
          {loading
            ? "Loading..."
            : `${formatNumber(allTotalKg)} kg CO₂e | ${formatNumber(allTotalT)} t CO₂e`}
        </p>
      </motion.div> */}
      <div className="grid grid-cols-2 gap-6">
        <motion.div
          className="bg-gradient-to-r from-[#6fceba] to-[#6ca0b9] shadow-md rounded-2xl p-6 mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-white">Total Scope 2 Emissions Location Based </h2>

          <div className="space-y-2 text-white">
            <p className="text-lg font-medium">
              {formatNumber(totalLocationKg)} KgCO₂e |{" "} 
              {formatNumber(totalLocationT)} tCO₂e
            </p>
          </div>
        </motion.div>
        <motion.div
          className="bg-gradient-to-r from-[#6fceba] to-[#6ca0b9] shadow-md rounded-2xl p-6 mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-white">Total Scope 2 Emissions Market Based </h2>

          <div className="space-y-2 text-white">
            <p className="text-lg font-medium">
              {formatNumber(totalMarketKg)} KgCO₂e |{" "} 
              {formatNumber(totalMarketT)} tCO₂e
            </p>
          </div>
        </motion.div>
      </div>

      {/* Individual Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {summaryCards.map((item, idx) => {
          const iconMap = {
            "Stationary Combustion": "heroicons:fire",
            "Mobile Combustion": "heroicons:truck",
            "Fugitive Emissions": "heroicons:cloud",
            "Process Emissions": "heroicons:cog-6-tooth",
          };
          return (
            <div
              key={idx}
              className={`${item.bg} rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-3`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon
                  icon={iconMap[item.name] || "mdi:power-plug"}
                  className="text-gray-700 text-2xl"
                />
                <h2 className="text-xl font-semibold mb-1 text-gray-700">{item.name}</h2>
              </div>
              <p className="text-[14px] font-medium text-gray-600 flex flex-col pl-8">
                {item.name === "Purchased Electricity" ? (
                  <>
                    <span className="text-md font-semibold mb-1 text-gray-700">Location Based</span>
                    <span>
                      {formatNumber(item.locationKg)} KgCO₂e, {formatNumber(item.locationT)} tCO₂e
                    </span>
                    <span className="text-md font-semibold mb-1 text-gray-700">Market Based</span>
                    <span>
                      {formatNumber(item.marketKg)} KgCO₂e, {formatNumber(item.marketT)} tCO₂e
                    </span>
                  </>
                ) : (
                  <>
                    <span>{formatNumber(item.kg)} kg CO₂e</span>
                    <span>{formatNumber(item.t)} t CO₂e</span>
                  </>
                )}
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
              ? "All Scope 2"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider whitespace-normal break-words">
                  Building
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider whitespace-nowrap">
                  Total Location Based Emissions (kgCO₂e)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider whitespace-nowrap">
                  Total Location Based Emissions (tCO₂e)
                </th>
                {(emissionType === "all" || emissionType === "electricity") && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider whitespace-nowrap">
                      Total Market Based Emissions (kgCO₂e)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider whitespace-nowrap">
                      Total Market Based Emissions (tCO₂e)
                    </th>
                  </>
                )}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.buildingName}
                    </td>                    <td className="px-6 py-4">{formatNumber(row.totalKg)}</td>
                    <td className="px-6 py-4">{formatNumber(row.totalT)}</td>
                    {(emissionType === "all" || emissionType === "electricity") && (
                      <>
                        <td className="px-6 py-4">{formatNumber(row.marketKg)}</td>
                        <td className="px-6 py-4">{formatNumber(row.marketT)}</td>
                      </>
                    )}

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="flex space-x-2 items-center">
              <span className="text-sm font-medium text-slate-600">Go</span>
              <input
                type="number"
                className="form-control py-2"
                min="1"
                max={paginatedData.totalPages}
                value={pagination.currentPage}
                onChange={(e) => {
                  const page = Number(e.target.value);
                  if (page >= 1 && page <= paginatedData.totalPages) {
                    setPagination((prev) => ({ ...prev, currentPage: page }));
                  }
                }}
                style={{ width: "50px" }}
              />
            </span>
            <span className="text-sm font-medium text-slate-600">
              Page {pagination.currentPage} of {paginatedData.totalPages}
            </span>
          </div>

          <ul className="flex items-center space-x-3 rtl:space-x-reverse">
            <li>
              <button
                onClick={() => setPagination((p) => ({ ...p, currentPage: 1 }))}
                disabled={pagination.currentPage === 1}
                className={`${pagination.currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Icon icon="heroicons:chevron-double-left-solid" />
              </button>
            </li>
            <li>
              <button
                onClick={() =>
                  setPagination((p) => ({ ...p, currentPage: Math.max(1, p.currentPage - 1) }))
                }
                disabled={pagination.currentPage === 1}
                className={`${pagination.currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Prev
              </button>
            </li>
            {Array.from({ length: paginatedData.totalPages }, (_, idx) => (
              <li key={idx}>
                <button
                  className={`${idx + 1 === pagination.currentPage
                    ? "bg-slate-900 text-white font-medium"
                    : "bg-slate-100 text-slate-900 font-normal"
                    } text-sm rounded h-6 w-6 flex items-center justify-center`}
                  onClick={() => setPagination((p) => ({ ...p, currentPage: idx + 1 }))}
                >
                  {idx + 1}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() =>
                  setPagination((p) => ({ ...p, currentPage: Math.min(paginatedData.totalPages, p.currentPage + 1) }))
                }
                disabled={pagination.currentPage === paginatedData.totalPages}
                className={`${pagination.currentPage === paginatedData.totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Next
              </button>
            </li>
            <li>
              <button
                onClick={() => setPagination((p) => ({ ...p, currentPage: paginatedData.totalPages }))}
                disabled={pagination.currentPage === paginatedData.totalPages}
                className={`${pagination.currentPage === paginatedData.totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Icon icon="heroicons:chevron-double-right-solid" />
              </button>
            </li>
          </ul>

          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-slate-600">Show</span>
            <select
              value={pagination.limit}
              onChange={(e) =>
                setPagination((p) => ({ ...p, limit: Number(e.target.value), currentPage: 1 }))
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

export default ScopeTwoReport;
