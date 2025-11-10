// import React, { useEffect, useState, useMemo } from "react";
// import axios from "axios";
// import { motion } from "framer-motion";
// import { toast } from "react-toastify";
// import Card from "@/components/ui/Card";
// import Select from "@/components/ui/Select";
// import { useTable, useSortBy, usePagination } from "react-table";
// import { Icon } from "@iconify/react";

// // Utility for formatting numbers
// const formatNumber = (num) => {
//   if (!num && num !== 0) return "-";
//   const value = Number(num);
//   if (Math.abs(value) < 0.01 && value !== 0) {
//     return value.toExponential(5);
//   }
//   return value.toLocaleString(undefined, { maximumFractionDigits: 5 });
// };

// const ScopeOneReport = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [emissionType, setEmissionType] = useState("stationary");

//   // Fetch all data
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const token = localStorage.getItem("token");
//         const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/stationary/Get-All?limit=1000`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setData(res.data.data || []);
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to fetch emissions data");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   // Filter data based on emission type
//   const filteredData = useMemo(() => {
//     return data.filter((item) => {
//       switch (emissionType) {
//         case "stationary":
//           return item.stakeholder;
//         case "mobile":
//           return item.stakeholder === "mobile";
//         case "fugitive":
//           return item.stakeholder === "fugitive";
//         case "process":
//           return item.stakeholder === "process";
//         default:
//           return true;
//       }
//     });
//   }, [data, emissionType]);

//   // Totals
//   const totalKg = useMemo(
//     () => filteredData.reduce((sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0), 0),
//     [filteredData]
//   );
//   const totalT = totalKg / 1000;

//   // Individual Summary Cards
//   const summaryCards = useMemo(() => {
//     const stationaryKg = data.reduce((sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0), 0);
//     return [
//       { name: "Stationary Combustion", kg: stationaryKg, t: stationaryKg / 1000, bg: "bg-cyan-50" },
//       { name: "Mobile Combustion", kg: 0, t: 0, bg: "bg-red-50" },
//       { name: "Fugitive Emissions", kg: 0, t: 0, bg: "bg-purple-50" },
//       { name: "Process Emissions", kg: 0, t: 0, bg: "bg-green-50" },
//     ];
//   }, [data]);

//   // Building-wise summary
//   const buildingData = useMemo(() => {
//     const map = {};
//     filteredData.forEach((item) => {
//       const name = item.buildingId?.buildingName || "Unknown";
//       if (!map[name]) map[name] = 0;
//       map[name] += Number(item.calculatedEmissionKgCo2e || 0);
//     });
//     return Object.entries(map).map(([buildingName, kg]) => ({
//       buildingName,
//       totalKg: kg,
//       totalT: kg / 1000,
//     }));
//   }, [filteredData]);

//   // Table setup
//   const columns = useMemo(
//     () => [
//       { Header: "Sr No", id: "sr", Cell: ({ row }) => row.index + 1 },
//       { Header: "Building", accessor: "buildingName" },
//       {
//         Header: "Total Emission (kg CO₂e)",
//         accessor: "totalKg",
//         Cell: ({ value }) => formatNumber(value),
//       },
//       {
//         Header: "Total Emission (t CO₂e)",
//         accessor: "totalT",
//         Cell: ({ value }) => formatNumber(value),
//       },
//     ],
//     []
//   );

//   const tableInstance = useTable(
//     { columns, data: buildingData, initialState: { pageSize: 10 } },
//     useSortBy,
//     usePagination
//   );

//   const { getTableProps, getTableBodyProps, headerGroups, page, prepareRow } = tableInstance;

//   // React Select options
//   const emissionOptions = [
//     { value: "stationary", label: "Stationary Combustion" },
//     { value: "mobile", label: "Mobile Combustion" },
//     { value: "fugitive", label: "Fugitive Emission" },
//     { value: "process", label: "Process Emission" },
//   ];

//   return (
//     <Card  >
//       <h2 className="text-2xl font-semibold mb-4 text-gray-700">GHG TOOL</h2>
//       {/* Total Scope 1 */}
//       <motion.div
//         className="bg-gradient-to-r from-[#6fceba] to-[#6ca0b9] shadow-md rounded-2xl p-6 mb-8"
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//       >
//         <h2 className="text-2xl font-semibold mb-2 text-white">Total Scope One Emissions</h2>
//         <p className="text-xl font-bold text-white">
//           {loading ? "Loading..." : `${formatNumber(totalKg)} kg CO₂e | ${formatNumber(totalT)} t CO₂e`}
//         </p>
//       </motion.div>


//       {/* Individual Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
//         {summaryCards.map((item, idx) => {
//           // Match icons to emission types
//           const iconMap = {
//             "Stationary Combustion": "heroicons:fire",
//             "Mobile Combustion": "heroicons:truck",
//             "Fugitive Emissions": "heroicons:cloud",
//             "Process Emissions": "heroicons:cog-6-tooth",
//           };

//           return (
//             <div
//               key={idx}
//               className={`${item.bg} rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-3`}
//             >
//               <div className="flex items-center gap-2 mb-1">
//                 <Icon
//                   icon={iconMap[item.name] || "heroicons:circle-stack"}
//                   className="text-gray-700 text-2xl" //text-[#3AB89D]
//                 />
//                 <h2 className="text-xl font-semibold mb-1 text-gray-700">{item.name}</h2>
//               </div>
//                <p className="text-[13px] font-medium text-gray-600 flex flex-col pl-8">
//                 <span>{formatNumber(item.kg)} <span className="text-black-500">kg CO₂e</span></span>
//                 <span> {formatNumber(item.t)} <span className="text-black-500">t CO₂e</span></span>
//               </p>
//             </div>
//           );
//         })}
//       </div>


//       {/* Building-wise Table + Filter */}
//       <Card >
//         <div className="flex justify-between items-center mb-4">
//           <h6 className="text-gray-800 font-semibold">
//             Building Emissions ({emissionType.charAt(0).toUpperCase() + emissionType.slice(1)})
//           </h6>

//           <div className="w-56">
//             <Select
//               options={emissionOptions}
//               value={emissionOptions.find((opt) => opt.value === emissionType)}
//               onChange={(selected) => setEmissionType(selected.value)}
//               classNamePrefix="react-select"
//               placeholder="Select Emission Type"
//               styles={{
//                 control: (base) => ({
//                   ...base,
//                   borderColor: "#ccc",
//                   boxShadow: "none",
//                   "&:hover": { borderColor: "#3AB89D" },
//                 }),
//               }}
//             />
//           </div>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200" {...getTableProps()}>
//             <thead className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]">
//               {headerGroups.map((headerGroup, idx) => (
//                 <tr key={idx} {...headerGroup.getHeaderGroupProps()}>
//                   {headerGroup.headers.map((column) => (
//                     <th
//                       key={column.id}
//                       {...column.getHeaderProps(column.getSortByToggleProps())}
//                       className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
//                     >
//                       {column.render("Header")}
//                       <span>{column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}</span>
//                     </th>
//                   ))}
//                 </tr>
//               ))}
//             </thead>
//             <tbody {...getTableBodyProps()}>
//               {page.length === 0 ? (
//                 <tr>
//                   <td colSpan={columns.length} className="text-center py-4">
//                     No data available
//                   </td>
//                 </tr>
//               ) : (
//                 page.map((row) => {
//                   prepareRow(row);
//                   return (
//                     <tr {...row.getRowProps()} className="even:bg-gray-50" key={row.id}>
//                       {row.cells.map((cell) => (
//                         <td
//                           key={cell.column.id}
//                           {...cell.getCellProps()}
//                           className="px-6 py-4 whitespace-nowrap"
//                         >
//                           {cell.render("Cell")}
//                         </td>
//                       ))}
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//       </Card>
//     </Card>
//   );
// };

// export default ScopeOneReport;
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import { Icon } from "@iconify/react";

// Utility for formatting numbers
const formatNumber = (num) => {
  if (!num && num !== 0) return "-";
  const value = Number(num);
  if (Math.abs(value) < 0.01 && value !== 0) {
    return value.toExponential(5);
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 5 });
};

const ScopeOneReport = () => {
  const [data, setData] = useState({ stationary: [], mobile: [] });
  const [loading, setLoading] = useState(false);
  const [emissionType, setEmissionType] = useState("all");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Filter data based on dropdown
  const filteredData = useMemo(() => {
    if (!data) return [];
    switch (emissionType) {
      case "stationary":
        return data.stationary;
      case "mobile":
        return data.mobile;
      case "all":
        return [...(data.stationary || []), ...(data.mobile || [])];
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
      map[name] += Number(item.calculatedEmissionKgCo2e || 0);
    });
    return Object.entries(map).map(([buildingName, kg]) => ({
      buildingName,
      totalKg: kg,
      totalT: kg / 1000,
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

  // Fetch stationary + mobile data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const [stationaryRes, mobileRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_BASE_URL}/stationary/Get-All?limit=1000`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_BASE_URL}/AutoMobile/Get-All?limit=1000`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setData({
          stationary: stationaryRes.data.data || [],
          mobile: mobileRes.data.data || [],
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

  //  Always total of ALL (stationary + mobile) for top card
  const allTotalKg = useMemo(() => {
    const stationaryKg = (data.stationary || []).reduce(
      (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
      0
    );
    const mobileKg = (data.mobile || []).reduce(
      (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
      0
    );
    return stationaryKg + mobileKg;
  }, [data]);

  const allTotalT = allTotalKg / 1000;

  // Individual Summary Cards
  const summaryCards = useMemo(() => {
    const stationaryKg = (data.stationary || []).reduce(
      (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
      0
    );
    const mobileKg = (data.mobile || []).reduce(
      (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0),
      0
    );

    return [
      { name: "Stationary Combustion", kg: stationaryKg, t: stationaryKg / 1000, bg: "bg-cyan-50" },
      { name: "Mobile Combustion", kg: mobileKg, t: mobileKg / 1000, bg: "bg-red-50" },
      { name: "Fugitive Emissions", kg: 0, t: 0, bg: "bg-purple-50" },
      { name: "Process Emissions", kg: 0, t: 0, bg: "bg-green-50" },
    ];
  }, [data]);

  // React Select options
  const emissionOptions = [
    { value: "all", label: "All Scope One (Building-wise)" },
    { value: "stationary", label: "Stationary Combustion" },
    { value: "mobile", label: "Mobile Combustion" },
    { value: "fugitive", label: "Fugitive Emission" },
    { value: "process", label: "Process Emission" },
  ];

  return (
    <Card>
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">GHG TOOL</h2>

      {/* Total Scope One */}
      <motion.div
        className="bg-gradient-to-r from-[#6fceba] to-[#6ca0b9] shadow-md rounded-2xl p-6 mb-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h2 className="text-2xl font-semibold mb-2 text-white">Total Scope One Emissions</h2>
        <p className="text-xl font-bold text-white">
          {loading
            ? "Loading..."
            : `${formatNumber(allTotalKg)} kg CO₂e | ${formatNumber(allTotalT)} t CO₂e`}
        </p>
      </motion.div>

      {/* Individual Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
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
                  icon={iconMap[item.name] || "heroicons:circle-stack"}
                  className="text-gray-700 text-2xl"
                />
                <h2 className="text-xl font-semibold mb-1 text-gray-700">{item.name}</h2>
              </div>
              <p className="text-[13px] font-medium text-gray-600 flex flex-col pl-8">
                <span>
                  {formatNumber(item.kg)} <span className="text-black-500">kg CO₂e</span>
                </span>
                <span>
                  {formatNumber(item.t)} <span className="text-black-500">t CO₂e</span>
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
            Building Emissions (
            {emissionType === "all"
              ? "All Scope One"
              : emissionType.charAt(0).toUpperCase() + emissionType.slice(1)}
            )
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
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Sr No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Building
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Total Emission (kg CO₂e)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Total Emission (t CO₂e)
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
                    <td className="px-6 py-4">{index + 1 + (pagination.currentPage - 1) * pagination.limit}</td>
                    <td className="px-6 py-4">{row.buildingName}</td>
                    <td className="px-6 py-4">{formatNumber(row.totalKg)}</td>
                    <td className="px-6 py-4">{formatNumber(row.totalT)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {/* Pagination */}
        <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
          {/* Left side: Go to page + Page info */}
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

          {/* Middle: Pagination buttons */}
          <ul className="flex items-center space-x-3 rtl:space-x-reverse">
            {/* First Page */}
            <li>
              <button
                onClick={() => setPagination((p) => ({ ...p, currentPage: 1 }))}
                disabled={pagination.currentPage === 1}
                className={`${pagination.currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Icon icon="heroicons:chevron-double-left-solid" />
              </button>
            </li>

            {/* Prev */}
            <li>
              <button
                onClick={() =>
                  setPagination((p) => ({
                    ...p,
                    currentPage: Math.max(1, p.currentPage - 1),
                  }))
                }
                disabled={pagination.currentPage === 1}
                className={`${pagination.currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Prev
              </button>
            </li>

            {/* Page numbers */}
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

            {/* Next */}
            <li>
              <button
                onClick={() =>
                  setPagination((p) => ({
                    ...p,
                    currentPage: Math.min(paginatedData.totalPages, p.currentPage + 1),
                  }))
                }
                disabled={pagination.currentPage === paginatedData.totalPages}
                className={`${pagination.currentPage === paginatedData.totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Next
              </button>
            </li>

            {/* Last Page */}
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

          {/* Right side: Page size selector */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-slate-600">Show</span>
            <select
              value={pagination.limit}
              onChange={(e) =>
                setPagination((p) => ({ ...p, limit: Number(e.target.value), currentPage: 1 }))
              }
              className="form-select py-2"
            >
              {[5,10, 20, 50].map((size) => (
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

export default ScopeOneReport;
