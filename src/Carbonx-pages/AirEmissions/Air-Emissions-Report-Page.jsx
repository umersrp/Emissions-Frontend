// import React, { useEffect, useState, useMemo } from "react";
// import axios from "axios";
// import { motion } from "framer-motion";
// import { toast } from "react-toastify";
// import Card from "@/components/ui/Card";
// import Select from "@/components/ui/Select";
// import { Icon } from "@iconify/react";
// import { NON_KYOTO_GASES } from "@/constant/calculate-fugitive-emission"; // Make sure path is correct
// import { useNavigate } from "react-router-dom";

// // Utility for formatting numbers
// const formatNumber = (num) => {
//   if (!num && num !== 0) return "-";
//   const value = Number(num);
//   if (Math.abs(value) < 0.01 && value !== 0) {
//     return value.toExponential(5);
//   }
//   return value.toLocaleString(undefined, { maximumFractionDigits: 5 });
// };

// const AirEmissionReportPage = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [emissionType, setEmissionType] = useState("all");
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     limit: 10,
//   });
// const navigate = useNavigate();
//   // Fetch Non-Kyoto fugitive gases
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const token = localStorage.getItem("token");
//         const res = await axios.get(
//           `${process.env.REACT_APP_BASE_URL}/Fugitive/get-All?limit=1000`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );

//         // Filter non-Kyoto gases
//         const nonKyotoData = res.data.data?.filter((item) =>
//           NON_KYOTO_GASES.includes(item.materialRefrigerant)
//         ) || [];

//         setData(nonKyotoData);
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to fetch Non-Kyoto emissions data");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   // Filter data by type (VOCs, NOx, Biogenic CO2)
//   const filteredData = useMemo(() => {
//     if (emissionType === "all") return data;
//     return data.filter((item) => item.materialRefrigerant === emissionType);
//   }, [data, emissionType]);

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

//   // Manual pagination
//   const paginatedData = useMemo(() => {
//     const totalPages = Math.ceil(buildingData.length / pagination.limit) || 1;
//     const startIndex = (pagination.currentPage - 1) * pagination.limit;
//     const endIndex = startIndex + pagination.limit;
//     return {
//       data: buildingData.slice(startIndex, endIndex),
//       totalPages,
//     };
//   }, [buildingData, pagination.currentPage, pagination.limit]);

//   // Summary cards totals
//   const summaryCards = useMemo(() => {
//     const totals = {};
//     NON_KYOTO_GASES.forEach((gas) => {
//       totals[gas] = data
//         .filter((item) => item.materialRefrigerant === gas)
//         .reduce((sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0), 0);
//     });
//     return [
//       {
//         name: "Non Kyoto Protocol Gases",
//         kg: Object.values(totals).reduce((a, b) => a + b, 0),
//         t: Object.values(totals).reduce((a, b) => a + b, 0) / 1000,
//         bg: "bg-cyan-50",
//       },
//       {
//         name: "VOCs",
//         kg: totals["VOCs"] || 0,
//         t: (totals["VOCs"] || 0) / 1000,
//         bg: "bg-red-50",
//       },
//       {
//         name: "NOx",
//         kg: totals["NOx"] || 0,
//         t: (totals["NOx"] || 0) / 1000,
//         bg: "bg-purple-50",
//       },
//       {
//         name: "Biogenic CO2 Emissions",
//         kg: totals["Biogenic CO2"] || 0,
//         t: (totals["Biogenic CO2"] || 0) / 1000,
//         bg: "bg-green-50",
//       },
//     ];
//   }, [data]);

//   const emissionOptions = [
//     { value: "all", label: "All Non-Kyoto Gases" },
//     ...NON_KYOTO_GASES.map((g) => ({ value: g, label: g })),
//   ];

//   return (
//     <Card>
//        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Out of Scope/Air Emissions</h2>
       
//       {/* Total Non-Kyoto */}
//       <motion.div
//         className="bg-gradient-to-r from-[#6fceba] to-[#6ca0b9] shadow-md rounded-2xl p-6 mb-8"
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//       >
//         <h2 className="text-2xl font-semibold mb-2 text-white">Total Emissions</h2>
//         <p className="text-xl font-bold text-white">
//           {loading
//             ? "Loading..."
//             : `${formatNumber(summaryCards[0].kg)} kg CO₂e | ${formatNumber(summaryCards[0].t)} t CO₂e`}
//         </p>
//       </motion.div>

//       {/* Individual Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
//         {summaryCards.map((item, idx) => (
//           <div
//             key={idx}
//             className={`${item.bg} rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-3`}
//           >
//             <div className="flex items-center gap-2 mb-1">
//               <Icon icon="heroicons:cloud" className="text-gray-700 text-2xl" />
//               <h2 className="text-xl font-semibold mb-1 text-gray-700">{item.name}</h2>
//             </div>
//             <p className="text-[13px] font-medium text-gray-600 flex flex-col pl-8">
//               <span>
//                 {formatNumber(item.kg)} <span className="text-black-500">kg CO₂e</span>
//               </span>
//               <span>
//                 {formatNumber(item.t)} <span className="text-black-500">t CO₂e</span>
//               </span>
//             </p>
//           </div>
//         ))}
//       </div>

//       {/* Building-wise Table + Filter */}
//       <Card>
//         <div className="flex justify-between items-center mb-4">
//           <h6 className="text-gray-800 font-semibold">
//             Building Emissions{" "} 
//             {emissionType === "all"
//               ? "All Non-Kyoto Gases"
//               : emissionType.charAt(0).toUpperCase() + emissionType.slice(1)}
//           </h6>
//           <div className="w-64">
//             <Select
//               options={emissionOptions}
//               value={emissionOptions.find((opt) => opt.value === emissionType)}
//               onChange={(selected) => setEmissionType(selected.value)}
//               classNamePrefix="react-select"
//               placeholder="Select Gas Type"
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
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider">
//                   Sr.No
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
//                   Building
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-white  tracking-wider">
//                   TOTAL EMISSIONS (kgCO₂e)
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider">
//                   TOTAL EMISSIONS (tCO₂e)
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {paginatedData.data.length === 0 ? (
//                 <tr>
//                   <td colSpan={4} className="text-center py-4">
//                     No data available
//                   </td>
//                 </tr>
//               ) : (
//                 paginatedData.data.map((row, index) => (
//                   <tr key={index} className="even:bg-gray-50">
//                     <td className="px-6 py-4">
//                       {index + 1 + (pagination.currentPage - 1) * pagination.limit}
//                     </td>
//                     <td className="px-6 py-4">{row.buildingName}</td>
//                     <td className="px-6 py-4">{formatNumber(row.totalKg)}</td>
//                     <td className="px-6 py-4">{formatNumber(row.totalT)}</td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination UI */}
//         <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
//           {/* Left side: Go to page + Page info */}
//           <div className="flex items-center space-x-3 rtl:space-x-reverse">
//             <span className="flex space-x-2 items-center">
//               <span className="text-sm font-medium text-slate-600">Go</span>
//               <input
//                 type="number"
//                 className="form-control py-2"
//                 min="1"
//                 max={paginatedData.totalPages}
//                 value={pagination.currentPage}
//                 onChange={(e) => {
//                   const page = Number(e.target.value);
//                   if (page >= 1 && page <= paginatedData.totalPages) {
//                     setPagination((prev) => ({ ...prev, currentPage: page }));
//                   }
//                 }}
//                 style={{ width: "50px" }}
//               />
//             </span>
//             <span className="text-sm font-medium text-slate-600">
//               Page {pagination.currentPage} of {paginatedData.totalPages}
//             </span>
//           </div>

//           {/* Middle: Pagination buttons */}
//           <ul className="flex items-center space-x-3 rtl:space-x-reverse">
//             <li>
//               <button
//                 onClick={() => setPagination((p) => ({ ...p, currentPage: 1 }))}
//                 disabled={pagination.currentPage === 1}
//                 className={`${pagination.currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
//               >
//                 <Icon icon="heroicons:chevron-double-left-solid" />
//               </button>
//             </li>
//             <li>
//               <button
//                 onClick={() =>
//                   setPagination((p) => ({ ...p, currentPage: Math.max(1, p.currentPage - 1) }))
//                 }
//                 disabled={pagination.currentPage === 1}
//                 className={`${pagination.currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
//               >
//                 Prev
//               </button>
//             </li>
//             {Array.from({ length: paginatedData.totalPages }, (_, idx) => (
//               <li key={idx}>
//                 <button
//                   className={`${idx + 1 === pagination.currentPage
//                       ? "bg-slate-900 text-white font-medium"
//                       : "bg-slate-100 text-slate-900 font-normal"
//                     } text-sm rounded h-6 w-6 flex items-center justify-center`}
//                   onClick={() => setPagination((p) => ({ ...p, currentPage: idx + 1 }))}
//                 >
//                   {idx + 1}
//                 </button>
//               </li>
//             ))}
//             <li>
//               <button
//                 onClick={() =>
//                   setPagination((p) => ({
//                     ...p,
//                     currentPage: Math.min(paginatedData.totalPages, p.currentPage + 1),
//                   }))
//                 }
//                 disabled={pagination.currentPage === paginatedData.totalPages}
//                 className={`${pagination.currentPage === paginatedData.totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
//               >
//                 Next
//               </button>
//             </li>
//             <li>
//               <button
//                 onClick={() => setPagination((p) => ({ ...p, currentPage: paginatedData.totalPages }))}
//                 disabled={pagination.currentPage === paginatedData.totalPages}
//                 className={`${pagination.currentPage === paginatedData.totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
//               >
//                 <Icon icon="heroicons:chevron-double-right-solid" />
//               </button>
//             </li>
//           </ul>

//           {/* Right side: Page size selector */}
//           <div className="flex items-center space-x-3">
//             <span className="text-sm font-medium text-slate-600">Show</span>
//             <select
//               value={pagination.limit}
//               onChange={(e) =>
//                 setPagination((p) => ({ ...p, limit: Number(e.target.value), currentPage: 1 }))
//               }
//               className="form-select py-2"
//             >
//               {[5, 10, 20, 50].map((size) => (
//                 <option key={size} value={size}>
//                   {size}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </Card>
//     </Card>
//   );
// };

// export default AirEmissionReportPage;


// import React, { useEffect, useState, useMemo } from "react";
// import axios from "axios";
// import { motion } from "framer-motion";
// import { toast } from "react-toastify";
// import Card from "@/components/ui/Card";
// import Select from "@/components/ui/Select";
// import { Icon } from "@iconify/react";
// import { NON_KYOTO_GASES } from "@/constant/calculate-fugitive-emission";

// const formatNumber = (num) => {
//   if (!num && num !== 0) return "-";
//   const value = Number(num);
//   if (Math.abs(value) < 0.01 && value !== 0) return value.toExponential(5);
//   return value.toLocaleString(undefined, { maximumFractionDigits: 5 });
// };

// const AirEmissionReportPage = () => {
//   const [fugitiveData, setFugitiveData] = useState([]);
//   const [bioData, setBioData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
//   const [tableFilter, setTableFilter] = useState("all"); // dropdown for table

//   const emissionOptions = [
//     { value: "all", label: "All Out-of-Scope" },
//     { value: "nonKyoto", label: "Non Kyoto Gases" },
//     { value: "biogenic", label: "Biogenic CO2 Emissions" },
//   ];

//   useEffect(() => {
//     const fetchFugitive = async () => {
//       try {
//         setLoading(true);
//         const token = localStorage.getItem("token");
//         const res = await axios.get(
//           `${process.env.REACT_APP_BASE_URL}/Fugitive/get-All?limit=1000`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         setFugitiveData(res.data.data || []);
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to fetch Non-Kyoto emissions data");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchFugitive();
//   }, []);

//   useEffect(() => {
//     const fetchBio = async () => {
//       try {
//         setLoading(true);
//         const token = localStorage.getItem("token");
//         const res = await axios.get(
//           `${process.env.REACT_APP_BASE_URL}/stationary/Get-All?limit=1000`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         const bioEmissions = (res.data.data || []).map((item) => ({
//           ...item,
//           calculatedBioEmissionKgCo2e: Number(item.calculatedBioEmissionKgCo2e || 0),
//           calculatedBioEmissiontCo2e: Number(item.calculatedBioEmissionKgCo2e || 0) / 1000,
//         }));
//         setBioData(bioEmissions);
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to fetch Biogenic emissions data");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchBio();
//   }, []);

//   // Summary Cards
//   const summaryCards = useMemo(() => {
//     const totals = {};
//     NON_KYOTO_GASES.forEach((gas) => {
//       totals[gas] = fugitiveData
//         .filter((item) => item.materialRefrigerant === gas)
//         .reduce((sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0), 0);
//     });
//     const nonKyotoTotal = Object.values(totals).reduce((a, b) => a + b, 0);
//     const VOCsTotal = 0;
//     const NOxTotal = 0;
//     const biogenicTotal = bioData.reduce(
//       (sum, item) => sum + Number(item.calculatedBioEmissionKgCo2e || 0),
//       0
//     );
//     return [
//       { name: "Non Kyoto Protocol Gases", kg: nonKyotoTotal, t: nonKyotoTotal / 1000, bg: "bg-cyan-50" },
//       { name: "VOCs", kg: VOCsTotal, t: VOCsTotal / 1000, bg: "bg-red-50" },
//       { name: "NOx", kg: NOxTotal, t: NOxTotal / 1000, bg: "bg-purple-50" },
//       { name: "Biogenic CO2 Emissions", kg: biogenicTotal, t: biogenicTotal / 1000, bg: "bg-green-50" },
//     ];
//   }, [fugitiveData, bioData]);

//   const totalEmission = useMemo(() => {
//     const kg = summaryCards.reduce((sum, c) => sum + c.kg, 0);
//     const t = summaryCards.reduce((sum, c) => sum + c.t, 0);
//     return { kg, t };
//   }, [summaryCards]);

//   // --- Building-wise data filtered for dropdown ---
//   const buildingData = useMemo(() => {
//     const map = {};

//     if (tableFilter === "all" || tableFilter === "nonKyoto") {
//       fugitiveData.forEach((item) => {
//         const name = item.buildingId?.buildingName || "Unknown";
//         if (!map[name]) map[name] = { kg: 0, t: 0 };
//         map[name].kg += Number(item.calculatedEmissionKgCo2e || 0);
//         map[name].t += Number(item.calculatedEmissionKgCo2e || 0) / 1000;
//       });
//     }

//     if (tableFilter === "all" || tableFilter === "biogenic") {
//       bioData.forEach((item) => {
//         const name = item.buildingId?.buildingName || "Unknown";
//         if (!map[name]) map[name] = { kg: 0, t: 0 };
//         map[name].kg += Number(item.calculatedBioEmissionKgCo2e || 0);
//         map[name].t += Number(item.calculatedBioEmissiontCo2e || 0);
//       });
//     }

//     return Object.entries(map).map(([buildingName, val]) => ({
//       buildingName,
//       totalKg: val.kg,
//       totalT: val.t,
//     }));
//   }, [fugitiveData, bioData, tableFilter]);

//   const paginatedData = useMemo(() => {
//     const totalPages = Math.ceil(buildingData.length / pagination.limit) || 1;
//     const startIndex = (pagination.currentPage - 1) * pagination.limit;
//     const endIndex = startIndex + pagination.limit;
//     return {
//       data: buildingData.slice(startIndex, endIndex),
//       totalPages,
//     };
//   }, [buildingData, pagination.currentPage, pagination.limit]);

//   return (
//     <Card>
//       {/* Total Emission Card */}
//       <motion.div className="bg-gradient-to-r from-[#6fceba] to-[#6ca0b9] shadow-md rounded-2xl p-6 mb-8"
//         initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
//         <h2 className="text-2xl font-semibold mb-2 text-white">Total Emissions</h2>
//         <p className="text-xl font-bold text-white">
//           {loading ? "Loading..." : `${formatNumber(totalEmission.kg)} kg CO₂e | ${formatNumber(totalEmission.t)} t CO₂e`}
//         </p>
//       </motion.div>

//       {/* Individual Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
//         {summaryCards.map((item, idx) => (
//           <div key={idx} className={`${item.bg} rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-3`}>
//             <div className="flex items-center gap-2 mb-1">
//               <Icon icon="heroicons:cloud" className="text-gray-700 text-2xl" />
//               <h2 className="text-xl font-semibold mb-1 text-gray-700">{item.name}</h2>
//             </div>
//             <p className="text-[13px] font-medium text-gray-600 flex flex-col pl-8">
//               <span>{formatNumber(item.kg)} kg CO₂e</span>
//               <span>{formatNumber(item.t)} t CO₂e</span>
//             </p>
//           </div>
//         ))}
//       </div>

//       {/* Building-wise Table with Dropdown */}
//       <Card>
//         <div className="flex justify-between items-center mb-4">
//           <h6 className="text-gray-800 font-semibold">Building Emissions (Out-of-Scope)</h6>
//           <div className="w-64">
//             <Select
//               options={emissionOptions}
//               value={emissionOptions.find((opt) => opt.value === tableFilter)}
//               onChange={(selected) => setTableFilter(selected.value)}
//               placeholder="Select Gas Type"
//               classNamePrefix="react-select"
//             />
//           </div>
//         </div>

//         {/* Table & Pagination (same as your old table) */}
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Sr No</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Building</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider">TOTAL EMISSIONS (kg CO₂e)</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider">TOTAL EMISSIONS (t CO₂e)</th>
//               </tr>
//             </thead>
//             <tbody>
//               {paginatedData.data.length === 0 ? (
//                 <tr>
//                   <td colSpan={4} className="text-center py-4">No data available</td>
//                 </tr>
//               ) : (
//                 paginatedData.data.map((row, idx) => (
//                   <tr key={idx} className="even:bg-gray-50">
//                     <td className="px-6 py-4">{idx + 1 + (pagination.currentPage - 1) * pagination.limit}</td>
//                     <td className="px-6 py-4">{row.buildingName}</td>
//                     <td className="px-6 py-4">{formatNumber(row.totalKg)}</td>
//                     <td className="px-6 py-4">{formatNumber(row.totalT)}</td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination Controls */}
//         <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
//           <div className="flex items-center space-x-3 rtl:space-x-reverse">
//             <span className="flex space-x-2 items-center">
//               <span className="text-sm font-medium text-slate-600">Go</span>
//               <input
//                 type="number"
//                 className="form-control py-2"
//                 min="1"
//                 max={paginatedData.totalPages}
//                 value={pagination.currentPage}
//                 onChange={(e) => {
//                   const page = Number(e.target.value);
//                   if (page >= 1 && page <= paginatedData.totalPages)
//                     setPagination((prev) => ({ ...prev, currentPage: page }));
//                 }}
//                 style={{ width: "50px" }}
//               />
//             </span>
//             <span className="text-sm font-medium text-slate-600">
//               Page {pagination.currentPage} of {paginatedData.totalPages}
//             </span>
//           </div>
//           <ul className="flex items-center space-x-3 rtl:space-x-reverse">
//             <li><button onClick={() => setPagination(p => ({ ...p, currentPage: 1 }))} disabled={pagination.currentPage === 1}><Icon icon="heroicons:chevron-double-left-solid" /></button></li>
//             <li><button onClick={() => setPagination(p => ({ ...p, currentPage: Math.max(1, p.currentPage - 1) }))} disabled={pagination.currentPage === 1}>Prev</button></li>
//             {Array.from({ length: paginatedData.totalPages }, (_, idx) => (
//               <li key={idx}>
//                 <button
//                   className={`${idx + 1 === pagination.currentPage ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900"} text-sm rounded h-6 w-6 flex items-center justify-center`}
//                   onClick={() => setPagination(p => ({ ...p, currentPage: idx + 1 }))}
//                 >
//                   {idx + 1}
//                 </button>
//               </li>
//             ))}
//             <li><button onClick={() => setPagination(p => ({ ...p, currentPage: Math.min(paginatedData.totalPages, p.currentPage + 1) }))} disabled={pagination.currentPage === paginatedData.totalPages}>Next</button></li>
//             <li><button onClick={() => setPagination(p => ({ ...p, currentPage: paginatedData.totalPages }))} disabled={pagination.currentPage === paginatedData.totalPages}><Icon icon="heroicons:chevron-double-right-solid" /></button></li>
//           </ul>
//           <div className="flex items-center space-x-3">
//             <span className="text-sm font-medium text-slate-600">Show</span>
//             <select value={pagination.limit} onChange={(e) => setPagination(p => ({ ...p, limit: Number(e.target.value), currentPage: 1 }))} className="form-select py-2">
//               {[5,10,20,50].map(size => <option key={size} value={size}>{size}</option>)}
//             </select>
//           </div>
//         </div>
//       </Card>
//     </Card>
//   );
// };

// export default AirEmissionReportPage;




import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import { Icon } from "@iconify/react";
import { NON_KYOTO_GASES } from "@/constant/calculate-fugitive-emission";
import {
  NON_KYOTO_ACTIVITIES,
  VO_ACTIVITIES,
  BIOGENIC_ACTIVITIES,
} from "@/constant/calculate-process-emission";

const formatNumber = (num) => {
  if (num === null || num === undefined || Number.isNaN(Number(num))) return "-";
  const value = Number(num);
  if (value === 0) return "0";
  if (Math.abs(value) < 0.01 && value !== 0) return value.toExponential(5);
  return value.toLocaleString(undefined, { maximumFractionDigits: 5 });
};

const AirEmissionReportPage = () => {
  const [fugitiveData, setFugitiveData] = useState([]);
  const [bioData, setBioData] = useState([]);
  const [processData, setProcessData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
  const [tableFilter, setTableFilter] = useState("all"); // dropdown for table

  const emissionOptions = [
    { value: "all", label: "All Out-of-Scope" },
    // { value: "nonKyoto", label: "Non Kyoto Gases" },
    { value: "nonKyotoCombined", label: "Non Kyoto protocol / Other Gases Emissions" },
    { value: "vocs", label: "VOCs" },
    { value: "biogenic", label: "Biogenic CO₂ Emissions" },
  ];

  // Fetch Fugitive (Non-Kyoto)
  useEffect(() => {
    const fetchFugitive = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/Fugitive/get-All?limit=1000`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFugitiveData(res.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch Non-Kyoto emissions data");
      } finally {
        setLoading(false);
      }
    };
    fetchFugitive();
  }, []);

  // Fetch Stationary (Biogenic)
  useEffect(() => {
    const fetchBio = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/stationary/Get-All?limit=1000`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const bioEmissions = (res.data.data || []).map((item) => ({
          ...item,
          calculatedBioEmissionKgCo2e: Number(item.calculatedBioEmissionKgCo2e || 0),
          calculatedBioEmissiontCo2e:
            Number(item.calculatedBioEmissionKgCo2e || 0) / 1000,
        }));
        setBioData(bioEmissions);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch Biogenic emissions data");
      } finally {
        setLoading(false);
      }
    };
    fetchBio();
  }, []);

  // Fetch Process Emissions (to classify into NON_KYOTO, VO, BIOGENIC)
  useEffect(() => {
    const fetchProcess = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/Process-Emissions/Get-All?limit=1000`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const items = (res.data.data || []).map((it) => ({
          ...it,
          calculatedEmissionKgCo2e: Number(it.calculatedEmissionKgCo2e || 0),
        }));
        setProcessData(items);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch Process emissions data");
      } finally {
        setLoading(false);
      }
    };
    fetchProcess();
  }, []);

  // Summary Cards
  const summaryCards = useMemo(() => {
    // Non-Kyoto from Fugitive (materialRefrigerant mapping)
    const totalsFugitive = {};
    NON_KYOTO_GASES.forEach((gas) => {
      totalsFugitive[gas] = fugitiveData
        .filter((item) => item.materialRefrigerant === gas)
        .reduce((sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0), 0);
    });
    const nonKyotoFromFugitive = Object.values(totalsFugitive).reduce((a, b) => a + b, 0);

    // Process-based classification totals
    let nonKyotoFromProcess = 0;
    let vocsFromProcess = 0;
    let biogenicFromProcess = 0;

    processData.forEach((item) => {
      const activity = (item.activityType || "").trim();
      const value = Number(item.calculatedEmissionKgCo2e || 0);

      if (NON_KYOTO_ACTIVITIES.includes(activity)) {
        nonKyotoFromProcess += value;
      } else if (VO_ACTIVITIES.includes(activity)) {
        vocsFromProcess += value;
      } else if (BIOGENIC_ACTIVITIES.includes(activity)) {
        biogenicFromProcess += value;
      }
      // else: activity not in lists -> ignore for these cards
    });

    // Biogenic from stationary (bioData) + process
    const biogenicFromStationary = bioData.reduce(
      (sum, item) => sum + Number(item.calculatedBioEmissionKgCo2e || 0),
      0
    );

    const nonKyotoTotal = nonKyotoFromFugitive + nonKyotoFromProcess;
    const vocsTotal = vocsFromProcess; // currently only from process
    const noxTotal = 0; // keep NOx = 0 as requested
    const biogenicTotal = biogenicFromStationary + biogenicFromProcess;

    return [
      {
        key: "nonKyoto",
        name: "Non Kyoto protocol / Other Gases Emissions",
        kg: nonKyotoTotal,
        t: nonKyotoTotal / 1000,
        bg: "bg-cyan-50",
      },
      {
        key: "vocs",
        name: "VOCs",
        kg: vocsTotal,
        t: vocsTotal / 1000,
        bg: "bg-red-50",
      },
      {
        key: "nox",
        name: "NOx",
        kg: noxTotal,
        t: noxTotal / 1000,
        bg: "bg-purple-50",
      },
      {
        key: "biogenic",
        name: "Biogenic CO₂ Emissions",
        kg: biogenicTotal,
        t: biogenicTotal / 1000,
        bg: "bg-green-50",
      },
    ];
  }, [fugitiveData, bioData, processData]);

  const totalEmission = useMemo(() => {
    const kg = summaryCards.reduce((sum, c) => sum + Number(c.kg || 0), 0);
    const t = summaryCards.reduce((sum, c) => sum + Number(c.t || 0), 0);
    return { kg, t };
  }, [summaryCards]);

  // --- Building-wise data filtered for dropdown ---
  const buildingData = useMemo(() => {
    const map = {};

    const addToMap = (buildingName, kg, t = null) => {
      if (!map[buildingName]) map[buildingName] = { kg: 0, t: 0 };
      map[buildingName].kg += Number(kg || 0);
      if (t !== null) map[buildingName].t += Number(t || 0);
    };

    // Fugitive (Non Kyoto) - included when tableFilter === all or nonKyoto*
    if (tableFilter === "all" || tableFilter === "nonKyoto" || tableFilter === "nonKyotoCombined") {
      fugitiveData.forEach((item) => {
        const name = item.buildingId?.buildingName || "Unknown";
        // Only include fugitive in nonKyoto totals (their gas must be in NON_KYOTO_GASES)
        // but earlier summary aggregated only for known gases; for building-wise show everything that belongs to Non-Kyoto by materialRefrigerant
        if (NON_KYOTO_GASES.includes(item.materialRefrigerant)) {
          addToMap(name, Number(item.calculatedEmissionKgCo2e || 0), Number(item.calculatedEmissionTCo2e || (Number(item.calculatedEmissionKgCo2e || 0) / 1000)));
        }
      });
    }

    // Stationary (Biogenic) - included for all or biogenic
    if (tableFilter === "all" || tableFilter === "biogenic") {
      bioData.forEach((item) => {
        const name = item.buildingId?.buildingName || "Unknown";
        addToMap(name, Number(item.calculatedBioEmissionKgCo2e || 0), Number(item.calculatedBioEmissiontCo2e || 0));
      });
    }

    // Process data: classify per activity lists and include based on tableFilter
    processData.forEach((item) => {
      const name = item.buildingId?.buildingName || "Unknown";
      const activity = (item.activityType || "").trim();
      const kg = Number(item.calculatedEmissionKgCo2e || 0);
      const t = kg / 1000;

      if (NON_KYOTO_ACTIVITIES.includes(activity)) {
        // Non Kyoto from process
        if (tableFilter === "all" || tableFilter === "nonKyoto" || tableFilter === "nonKyotoCombined") {
          addToMap(name, kg, t);
        }
      } else if (VO_ACTIVITIES.includes(activity)) {
        // VOCs
        if (tableFilter === "all" || tableFilter === "vocs") {
          addToMap(name, kg, t);
        }
      } else if (BIOGENIC_ACTIVITIES.includes(activity)) {
        // Biogenic from process
        if (tableFilter === "all" || tableFilter === "biogenic") {
          addToMap(name, kg, t);
        }
      }
    });

    // Convert map to array
    return Object.entries(map).map(([buildingName, val]) => ({
      buildingName,
      totalKg: val.kg,
      totalT: val.t,
    }));
  }, [fugitiveData, bioData, processData, tableFilter]);

  const paginatedData = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(buildingData.length / pagination.limit));
    const startIndex = (pagination.currentPage - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return {
      data: buildingData.slice(startIndex, endIndex),
      totalPages,
    };
  }, [buildingData, pagination.currentPage, pagination.limit]);

  return (
    <Card>
      {/* Total Emission Card */}
      <motion.div
        className="bg-gradient-to-r from-[#6fceba] to-[#6ca0b9] shadow-md rounded-2xl p-6 mb-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h2 className="text-2xl font-semibold mb-2 text-white">Total Out of Scope/ Other Air Emission</h2>
        {/* <p className="text-xl font-bold text-white">
          {loading ? "Loading..." : `${formatNumber(totalEmission.kg)} kg CO₂e | ${formatNumber(totalEmission.t)} t CO₂e`}
        </p> */}
      </motion.div>

      {/* Individual Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        {summaryCards.map((item, idx) => (
          <div key={idx} className={`${item.bg} rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-3`}>
            <div className="flex items-center gap-2 mb-1">
              <Icon icon="heroicons:cloud" className="text-gray-700 text-2xl" />
              <h2 className="text-xl font-semibold mb-1 text-gray-700">{item.name}</h2>
            </div>
            <p className="text-[13px] font-medium text-gray-600 flex flex-col pl-8">
              <span>{formatNumber(item.kg)} kg CO₂e</span>
              <span>{formatNumber(item.t)} t CO₂e</span>
            </p>
          </div>
        ))}
      </div>

      {/* Building-wise Table with Dropdown */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h6 className="text-gray-800 font-semibold">Building Emissions (Out-of-Scope)</h6>
          <div className="w-64">
            <Select
              options={emissionOptions}
              value={emissionOptions.find((opt) => opt.value === tableFilter)}
              onChange={(selected) => {
                setTableFilter(selected.value);
                setPagination((p) => ({ ...p, currentPage: 1 }));
              }}
              placeholder="Select Gas Type"
              classNamePrefix="react-select"
            />
          </div>
        </div>

        {/* Table & Pagination */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white  tracking-wider">Sr.No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Building</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider">TOTAL EMISSIONS (kgCO₂e)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider">TOTAL EMISSIONS (tCO₂e)</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">No data available</td>
                </tr>
              ) : (
                paginatedData.data.map((row, idx) => (
                  <tr key={idx} className="even:bg-gray-50">
                    <td className="px-6 py-4">{idx + 1 + (pagination.currentPage - 1) * pagination.limit}</td>
                    <td className="px-6 py-4">{row.buildingName}</td>
                    <td className="px-6 py-4">{formatNumber(row.totalKg)}</td>
                    <td className="px-6 py-4">{formatNumber(row.totalT)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
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
                  if (page >= 1 && page <= paginatedData.totalPages)
                    setPagination((prev) => ({ ...prev, currentPage: page }));
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
              <button onClick={() => setPagination(p => ({ ...p, currentPage: 1 }))} disabled={pagination.currentPage === 1}>
                <Icon icon="heroicons:chevron-double-left-solid" />
              </button>
            </li>
            <li>
              <button onClick={() => setPagination(p => ({ ...p, currentPage: Math.max(1, p.currentPage - 1) }))} disabled={pagination.currentPage === 1}>
                Prev
              </button>
            </li>
            {Array.from({ length: paginatedData.totalPages }, (_, idx) => (
              <li key={idx}>
                <button
                  className={`${idx + 1 === pagination.currentPage ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900"} text-sm rounded h-6 w-6 flex items-center justify-center`}
                  onClick={() => setPagination(p => ({ ...p, currentPage: idx + 1 }))}
                >
                  {idx + 1}
                </button>
              </li>
            ))}
            <li>
              <button onClick={() => setPagination(p => ({ ...p, currentPage: Math.min(paginatedData.totalPages, p.currentPage + 1) }))} disabled={pagination.currentPage === paginatedData.totalPages}>
                Next
              </button>
            </li>
            <li>
              <button onClick={() => setPagination(p => ({ ...p, currentPage: paginatedData.totalPages }))} disabled={pagination.currentPage === paginatedData.totalPages}>
                <Icon icon="heroicons:chevron-double-right-solid" />
              </button>
            </li>
          </ul>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-slate-600">Show</span>
            <select value={pagination.limit} onChange={(e) => setPagination(p => ({ ...p, limit: Number(e.target.value), currentPage: 1 }))} className="form-select py-2">
              {[5,10,20,50].map(size => <option key={size} value={size}>{size}</option>)}
            </select>
          </div>
        </div>
      </Card>
    </Card>
  );
};

export default AirEmissionReportPage;
