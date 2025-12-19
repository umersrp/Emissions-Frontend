// import React, { useEffect, useState, useMemo } from "react";
// import axios from "axios";
// import { motion } from "framer-motion";
// import { toast } from "react-toastify";
// import Card from "@/components/ui/Card";
// import Select from "@/components/ui/Select";
// import { Icon } from "@iconify/react";
// import { NON_KYOTO_GASES } from "@/constant/scope1/calculate-fugitive-emission";
// import {
//   NON_KYOTO_ACTIVITIES,
//   VO_ACTIVITIES,
//   BIOGENIC_ACTIVITIES,
// } from "@/constant/scope1/calculate-process-emission";

// const formatNumber = (num) => {
//   const value = Number(num);
//   if (!num || value === 0) return "N/A";
//   if (Math.abs(value) < 0.01) {
//     return value.toExponential(2);
//   }
//   return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
// };


// const AirEmissionReportPage = () => {
//   const [fugitiveData, setFugitiveData] = useState([]);
//   const [bioData, setBioData] = useState([]);
//   const [processData, setProcessData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [pagination, setPagination] = useState({ currentPage: 1, limit: 5 });
//   const [tableFilter, setTableFilter] = useState("all"); // dropdown for table

//   const emissionOptions = [
//     { value: "all", label: "All Out-of-Scope" },
//     // { value: "nonKyoto", label: "Non Kyoto Gases" },
//     { value: "nonKyotoCombined", label: "Non Kyoto protocol / Other Gases Emissions" },
//     { value: "vocs", label: "VOCs" },
//     { value: "biogenic", label: "Biogenic CO₂ Emissions" },
//   ];


//   // Fetch Fugitive (Non-Kyoto)
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

//   // Fetch Stationary (Biogenic)
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
//           calculatedBioEmissiontCo2e:
//             Number(item.calculatedBioEmissionKgCo2e || 0) / 1000,
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

//   // Fetch Process Emissions (to classify into NON_KYOTO, VO, BIOGENIC)
//   useEffect(() => {
//     const fetchProcess = async () => {
//       try {
//         setLoading(true);
//         const token = localStorage.getItem("token");
//         const res = await axios.get(
//           `${process.env.REACT_APP_BASE_URL}/Process-Emissions/Get-All?limit=1000`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         const items = (res.data.data || []).map((it) => ({
//           ...it,
//           calculatedEmissionKgCo2e: Number(it.calculatedEmissionKgCo2e || 0),
//         }));
//         setProcessData(items);
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to fetch Process emissions data");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProcess();
//   }, []);

//   // Summary Cards
//   const summaryCards = useMemo(() => {
//     // Non-Kyoto from Fugitive (materialRefrigerant mapping)
//     const totalsFugitive = {};
//     NON_KYOTO_GASES.forEach((gas) => {
//       totalsFugitive[gas] = fugitiveData
//         .filter((item) => item.materialRefrigerant === gas)
//         .reduce((sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0), 0);
//     });
//     const nonKyotoFromFugitive = Object.values(totalsFugitive).reduce((a, b) => a + b, 0);

//     // Process-based classification totals
//     let nonKyotoFromProcess = 0;
//     let vocsFromProcess = 0;
//     let biogenicFromProcess = 0;

//     processData.forEach((item) => {
//       const activity = (item.activityType || "").trim();
//       const value = Number(item.calculatedEmissionKgCo2e || 0);

//       if (NON_KYOTO_ACTIVITIES.includes(activity)) {
//         nonKyotoFromProcess += value;
//       } else if (VO_ACTIVITIES.includes(activity)) {
//         vocsFromProcess += value;
//       } else if (BIOGENIC_ACTIVITIES.includes(activity)) {
//         biogenicFromProcess += value;
//       }
//       // else: activity not in lists -> ignore for these cards
//     });

//     // Biogenic from stationary (bioData) + process
//     const biogenicFromStationary = bioData.reduce(
//       (sum, item) => sum + Number(item.calculatedBioEmissionKgCo2e || 0),
//       0
//     );

//     const nonKyotoTotal = nonKyotoFromFugitive + nonKyotoFromProcess;
//     const vocsTotal = vocsFromProcess; // currently only from process
//     const noxTotal = 0; // keep NOx = 0 as requested
//     const biogenicTotal = biogenicFromStationary + biogenicFromProcess;

//     return [
//       {
//         key: "nonKyoto",
//         name: "Non Kyoto Protocol /Other Gases Emission",
//         kg: nonKyotoTotal,
//         t: nonKyotoTotal / 1000,
//         bg: "bg-cyan-50",
//       },
//       {
//         key: "vocs",
//         name: "VOCs",
//         kg: vocsTotal,
//         t: vocsTotal / 1000,
//         bg: "bg-red-50",
//       },
//       {
//         key: "nox",
//         name: "NOx",
//         kg: noxTotal,
//         t: noxTotal / 1000,
//         bg: "bg-purple-50",
//       },
//       {
//         key: "biogenic",
//         name: "Biogenic CO₂ Emissions",
//         kg: biogenicTotal,
//         t: biogenicTotal / 1000,
//         bg: "bg-green-50",
//       },
//     ];
//   }, [fugitiveData, bioData, processData]);

//   // const totalEmission = useMemo(() => {
//   //   const kg = summaryCards.reduce((sum, c) => sum + Number(c.kg || 0), 0);
//   //   const t = summaryCards.reduce((sum, c) => sum + Number(c.t || 0), 0);
//   //   return { kg, t };
//   // }, [summaryCards]);

//   // --- Building-wise data filtered for dropdown ---
//   const buildingData = useMemo(() => {
//     const map = {};

//     const addToMap = (buildingName, kg, t = null) => {
//       if (!map[buildingName]) map[buildingName] = { kg: 0, t: 0 };
//       map[buildingName].kg += Number(kg || 0);
//       if (t !== null) map[buildingName].t += Number(t || 0);
//     };

//     // Fugitive (Non Kyoto) - included when tableFilter === all or nonKyoto*
//     if (tableFilter === "all" || tableFilter === "nonKyoto" || tableFilter === "nonKyotoCombined") {
//       fugitiveData.forEach((item) => {
//         const name = item.buildingId?.buildingName || "Unknown";
//         // Only include fugitive in nonKyoto totals (their gas must be in NON_KYOTO_GASES)
//         // but earlier summary aggregated only for known gases; for building-wise show everything that belongs to Non-Kyoto by materialRefrigerant
//         if (NON_KYOTO_GASES.includes(item.materialRefrigerant)) {
//           addToMap(name, Number(item.calculatedEmissionKgCo2e || 0), Number(item.calculatedEmissionTCo2e || (Number(item.calculatedEmissionKgCo2e || 0) / 1000)));
//         }
//       });
//     }

//     // Stationary (Biogenic) - included for all or biogenic
//     if (tableFilter === "all" || tableFilter === "biogenic") {
//       bioData.forEach((item) => {
//         const name = item.buildingId?.buildingName || "Unknown";
//         addToMap(name, Number(item.calculatedBioEmissionKgCo2e || 0), Number(item.calculatedBioEmissiontCo2e || 0));
//       });
//     }

//     // Process data: classify per activity lists and include based on tableFilter
//     processData.forEach((item) => {
//       const name = item.buildingId?.buildingName || "Unknown";
//       const activity = (item.activityType || "").trim();
//       const kg = Number(item.calculatedEmissionKgCo2e || 0);
//       const t = kg / 1000;

//       if (NON_KYOTO_ACTIVITIES.includes(activity)) {
//         // Non Kyoto from process
//         if (tableFilter === "all" || tableFilter === "nonKyoto" || tableFilter === "nonKyotoCombined") {
//           addToMap(name, kg, t);
//         }
//       } else if (VO_ACTIVITIES.includes(activity)) {
//         // VOCs
//         if (tableFilter === "all" || tableFilter === "vocs") {
//           addToMap(name, kg, t);
//         }
//       } else if (BIOGENIC_ACTIVITIES.includes(activity)) {
//         // Biogenic from process
//         if (tableFilter === "all" || tableFilter === "biogenic") {
//           addToMap(name, kg, t);
//         }
//       }
//     });

//     // Convert map to array
//     return Object.entries(map).map(([buildingName, val]) => ({
//       buildingName,
//       totalKg: val.kg,
//       totalT: val.t,
//     }));
//   }, [fugitiveData, bioData, processData, tableFilter]);

  
//   const paginatedData = useMemo(() => {
//     const totalPages = Math.max(1, Math.ceil(buildingData.length / pagination.limit));

//     // Fix invalid page when filter changes
//     const safePage = Math.min(pagination.currentPage, totalPages);

//     const startIndex = (safePage - 1) * pagination.limit;
//     const endIndex = startIndex + pagination.limit;

//     return {
//       data: buildingData.slice(startIndex, endIndex),
//       totalPages,
//       safePage,
//     };
//   }, [buildingData, pagination.currentPage, pagination.limit]);

//   return (
//     <Card>
//       {/* Total Emission Card */}
//       <motion.div
//         className="bg-gradient-to-r from-[#6fceba] to-[#6ca0b9] shadow-md rounded-2xl p-6 mb-8"
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//       >
//         <h2 className="text-2xl font-semibold mb-2 text-white">Total Out of Scope/ Other Air Emission</h2>
//         {/* <p className="text-xl font-bold text-white">
//           {loading ? "Loading..." : `${formatNumber(totalEmission.kg)} kg CO₂e | ${formatNumber(totalEmission.t)} t CO₂e`}
//         </p> */}
//       </motion.div>

//       {/* Individual Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
//         {summaryCards.map((item, idx) => (
//           <div key={idx} className={`${item.bg} rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-3`}>
//             {/* <div className="flex  gap-2 mb-1 ">
//               <Icon icon="heroicons:cloud" className="text-gray-700 text-2xl pr-2 " />
//               <h2 className="text-xl font-semibold mb-1 text-gray-700">{item.name}</h2>
//             </div> */}
//             <div className="flex gap-2 mb-1">
//               <Icon
//                 icon="heroicons:cloud"
//                 className="text-gray-700 text-2xl flex-none"
//               />

//               <h2 className="text-xl font-semibold text-gray-700 leading-tight">
//                 {item.name}
//               </h2>
//             </div>

//             <p className="text-[13px] font-medium text-gray-600 flex flex-col pl-8">
//               {/* <span>{formatNumber(item.kg)} kg CO₂e</span> */}
//               <span>{formatNumber(item.kg)} {item.key === "vocs" ? "kg" : "kg CO₂e"}</span>
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
//               onChange={(selected) => {
//                 setTableFilter(selected.value);
//                 setPagination((p) => ({ ...p, currentPage: 1 }));
//               }}
//               placeholder="Select Gas Type"
//               classNamePrefix="react-select"
//             />
//           </div>
//         </div>

//         {/* Table & Pagination */}
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-white  tracking-wider">Sr.No</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-white  tracking-wider">Building</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider whitespace-nowrap">
//                   Total Emissions ({tableFilter === "vocs" ? "kg" : "kgCO₂e"})
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider whitespace-nowrap">Total Emissions (tCO₂e)</th>
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
//           {/* Go to Page */}
//           <div className="flex items-center space-x-3">
//             <span className="flex space-x-2 items-center">
//               <span className="text-sm font-medium text-slate-600">Go</span>
//               <input
//                 type="number"
//                 min="1"
//                 max={paginatedData.totalPages}
//                 className="form-control py-2"
//                 value={pagination.currentPage}
//                 onChange={(e) => {
//                   let page = Number(e.target.value);
//                   if (page < 1) page = 1;
//                   if (page > paginatedData.totalPages) page = paginatedData.totalPages;
//                   setPagination((p) => ({ ...p, currentPage: page }));
//                 }}
//                 style={{ width: "60px" }}
//               />
//             </span>

//             <span className="text-sm font-medium text-slate-600">
//               Page {paginatedData.safePage} of {paginatedData.totalPages}
//             </span>
//           </div>

//           {/* Pagination Buttons */}
//           <ul className="flex items-center space-x-3">
//             <li>
//               <button
//                 onClick={() => setPagination((p) => ({ ...p, currentPage: 1 }))}
//                 disabled={paginatedData.safePage === 1}
//               >
//                 <Icon icon="heroicons:chevron-double-left-solid" />
//               </button>
//             </li>

//             <li>
//               <button
//                 onClick={() =>
//                   setPagination((p) => ({ ...p, currentPage: p.currentPage - 1 }))
//                 }
//                 disabled={paginatedData.safePage === 1}
//               >
//                 Prev
//               </button>
//             </li>

//             {Array.from({ length: paginatedData.totalPages }, (_, idx) => (
//               <li key={idx}>
//                 <button
//                   className={`${idx + 1 === paginatedData.safePage
//                       ? "bg-slate-900 text-white"
//                       : "bg-slate-100 text-slate-900"
//                     } text-sm rounded h-6 w-6 flex items-center justify-center`}
//                   onClick={() =>
//                     setPagination((p) => ({ ...p, currentPage: idx + 1 }))
//                   }
//                 >
//                   {idx + 1}
//                 </button>
//               </li>
//             ))}

//             <li>
//               <button
//                 onClick={() =>
//                   setPagination((p) => ({ ...p, currentPage: p.currentPage + 1 }))
//                 }
//                 disabled={paginatedData.safePage === paginatedData.totalPages}
//               >
//                 Next
//               </button>
//             </li>

//             <li>
//               <button
//                 onClick={() =>
//                   setPagination((p) => ({
//                     ...p,
//                     currentPage: paginatedData.totalPages,
//                   }))
//                 }
//                 disabled={paginatedData.safePage === paginatedData.totalPages}
//               >
//                 <Icon icon="heroicons:chevron-double-right-solid" />
//               </button>
//             </li>
//           </ul>

//           {/* Limit Selector */}
//           <div className="flex items-center space-x-3">
//             <span className="text-sm font-medium text-slate-600">Show</span>
//             <select
//               value={pagination.limit}
//               onChange={(e) =>
//                 setPagination({ currentPage: 1, limit: Number(e.target.value) })
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
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import { Icon } from "@iconify/react";
import { NON_KYOTO_GASES } from "@/constant/scope1/calculate-fugitive-emission";
import {
  NON_KYOTO_ACTIVITIES,
  VO_ACTIVITIES,
  BIOGENIC_ACTIVITIES,
} from "@/constant/scope1/calculate-process-emission";

const formatNumber = (num) => {
  const value = Number(num);
  if (!num || value === 0) return "N/A";
  if (Math.abs(value) < 0.01) {
    return value.toExponential(2);
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const AirEmissionReportPage = () => {
  const [fugitiveData, setFugitiveData] = useState([]);
  const [bioData, setBioData] = useState([]);
  const [processData, setProcessData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 5 });
  const [tableFilter, setTableFilter] = useState("all"); // dropdown for table

  const emissionOptions = [
    { value: "all", label: "All Out-of-Scope" },
    // { value: "nonKyoto", label: "Non Kyoto Gases" },
    { value: "nonKyotoCombined", label: "Non Kyoto protocol / Other Gases Emissions" },
    { value: "vocs", label: "VOCs" },
    { value: "biogenic", label: "Biogenic CO₂ Emissions" },
  ];

  // Function to analyze biogenic data
  const analyzeBiogenicData = () => {
    console.group("🔍 BIOGENIC EMISSIONS ANALYSIS");
    
    // 1. Stationary (BioData) Analysis
    console.group("📊 STATIONARY EMISSIONS (BioData):");
    console.log(`Total records: ${bioData.length}`);
    
    const stationaryByBuilding = {};
    bioData.forEach((item, idx) => {
      const buildingName = item.buildingId?.buildingName || "Unknown";
      const emissionKg = Number(item.calculatedBioEmissionKgCo2e || 0);
      const emissionT = emissionKg / 1000;
      
      if (!stationaryByBuilding[buildingName]) {
        stationaryByBuilding[buildingName] = {
          records: [],
          totalKg: 0,
          totalT: 0
        };
      }
      
      stationaryByBuilding[buildingName].records.push({
        id: item._id || idx,
        emissionKg,
        emissionT,
        rawData: item
      });
      stationaryByBuilding[buildingName].totalKg += emissionKg;
      stationaryByBuilding[buildingName].totalT += emissionT;
    });
    
    console.log(`Buildings with stationary emissions: ${Object.keys(stationaryByBuilding).length}`);
    Object.entries(stationaryByBuilding).forEach(([building, data]) => {
      console.log(`🏢 ${building}: ${data.records.length} records, ${formatNumber(data.totalKg)} kg, ${formatNumber(data.totalT)} t`);
      console.log("Records:", data.records);
    });
    
    const stationaryTotalKg = bioData.reduce(
      (sum, item) => sum + Number(item.calculatedBioEmissionKgCo2e || 0), 0
    );
    console.log(`Stationary Total: ${formatNumber(stationaryTotalKg)} kg, ${formatNumber(stationaryTotalKg/1000)} t`);
    console.groupEnd();
    
    // 2. Process Emissions Analysis (Biogenic Activities)
    console.group("📊 PROCESS EMISSIONS (Biogenic Activities):");
    const biogenicProcessRecords = processData.filter(item => 
      BIOGENIC_ACTIVITIES.includes((item.activityType || "").trim())
    );
    
    console.log(`Total biogenic process records: ${biogenicProcessRecords.length}`);
    console.log("Biogenic activity types:", BIOGENIC_ACTIVITIES);
    
    const processByBuilding = {};
    biogenicProcessRecords.forEach((item, idx) => {
      const buildingName = item.buildingId?.buildingName || "Unknown";
      const emissionKg = Number(item.calculatedEmissionKgCo2e || 0);
      const emissionT = emissionKg / 1000;
      const activityType = (item.activityType || "").trim();
      
      if (!processByBuilding[buildingName]) {
        processByBuilding[buildingName] = {
          records: [],
          totalKg: 0,
          totalT: 0
        };
      }
      
      processByBuilding[buildingName].records.push({
        id: item._id || idx,
        activityType,
        emissionKg,
        emissionT,
        rawData: item
      });
      processByBuilding[buildingName].totalKg += emissionKg;
      processByBuilding[buildingName].totalT += emissionT;
    });
    
    console.log(`Buildings with biogenic process emissions: ${Object.keys(processByBuilding).length}`);
    Object.entries(processByBuilding).forEach(([building, data]) => {
      console.log(`🏢 ${building}: ${data.records.length} records, ${formatNumber(data.totalKg)} kg, ${formatNumber(data.totalT)} t`);
      console.log("Records by activity:", data.records.map(r => ({
        activity: r.activityType,
        kg: formatNumber(r.emissionKg),
        t: formatNumber(r.emissionT)
      })));
    });
    
    const processTotalKg = biogenicProcessRecords.reduce(
      (sum, item) => sum + Number(item.calculatedEmissionKgCo2e || 0), 0
    );
    console.log(`Process Total: ${formatNumber(processTotalKg)} kg, ${formatNumber(processTotalKg/1000)} t`);
    console.groupEnd();
    
    // 3. Combined Biogenic Analysis
    console.group("🔗 COMBINED BIOGENIC ANALYSIS:");
    
    // Get all unique buildings from both sources
    const allBuildings = new Set([
      ...Object.keys(stationaryByBuilding),
      ...Object.keys(processByBuilding)
    ]);
    
    console.log(`Total unique buildings with biogenic emissions: ${allBuildings.size}`);
    console.log("Building list:", Array.from(allBuildings));
    
    // Calculate combined totals
    let combinedRecords = 0;
    let combinedTotalKg = 0;
    let combinedTotalT = 0;
    
    Array.from(allBuildings).forEach(building => {
      const stationary = stationaryByBuilding[building] || { totalKg: 0, totalT: 0, records: [] };
      const process = processByBuilding[building] || { totalKg: 0, totalT: 0, records: [] };
      
      const buildingTotalKg = stationary.totalKg + process.totalKg;
      const buildingTotalT = stationary.totalT + process.totalT;
      const buildingRecords = stationary.records.length + process.records.length;
      
      combinedRecords += buildingRecords;
      combinedTotalKg += buildingTotalKg;
      combinedTotalT += buildingTotalT;
      
      console.log(`🏢 ${building}:`);
      console.log(`   Stationary: ${stationary.records.length} records, ${formatNumber(stationary.totalKg)} kg`);
      console.log(`   Process: ${process.records.length} records, ${formatNumber(process.totalKg)} kg`);
      console.log(`   Total: ${buildingRecords} records, ${formatNumber(buildingTotalKg)} kg, ${formatNumber(buildingTotalT)} t`);
    });
    
    console.log(`📈 GRAND TOTALS:`);
    console.log(`   Total Records: ${combinedRecords}`);
    console.log(`   Stationary Contribution: ${formatNumber(stationaryTotalKg)} kg (${stationaryTotalKg > 0 ? ((stationaryTotalKg/combinedTotalKg)*100).toFixed(1) : 0}%)`);
    console.log(`   Process Contribution: ${formatNumber(processTotalKg)} kg (${processTotalKg > 0 ? ((processTotalKg/combinedTotalKg)*100).toFixed(1) : 0}%)`);
    console.log(`   Combined Total: ${formatNumber(combinedTotalKg)} kg CO₂e`);
    console.log(`   Combined Total: ${formatNumber(combinedTotalT)} t CO₂e`);
    
    console.groupEnd();
    
    // 4. Summary Card Verification
    const biogenicCard = summaryCards.find(card => card.key === "biogenic");
    if (biogenicCard) {
      console.group("✅ SUMMARY CARD VERIFICATION:");
      console.log(`Card shows: ${formatNumber(biogenicCard.kg)} kg`);
      console.log(`Calculated: ${formatNumber(combinedTotalKg)} kg`);
      console.log(`Match: ${Math.abs(biogenicCard.kg - combinedTotalKg) < 0.01 ? "✓" : "✗"}`);
      console.groupEnd();
    }
    
    console.groupEnd();
  };

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
        
        // Log biogenic analysis after state update
        setTimeout(() => {
          analyzeBiogenicData();
        }, 100);
        
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
        
        // Log biogenic analysis after state update
        setTimeout(() => {
          analyzeBiogenicData();
        }, 100);
        
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch Process emissions data");
      } finally {
        setLoading(false);
      }
    };
    fetchProcess();
  }, []);

  // Call the analysis function whenever relevant data changes
  useEffect(() => {
    if (bioData.length > 0 || processData.length > 0) {
      analyzeBiogenicData();
    }
  }, [bioData, processData]);

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

    // Log biogenic breakdown
    console.log("📋 Biogenic Breakdown:");
    console.log(`  From Stationary: ${formatNumber(biogenicFromStationary)} kg`);
    console.log(`  From Process: ${formatNumber(biogenicFromProcess)} kg`);
    console.log(`  Total: ${formatNumber(biogenicTotal)} kg`);

    return [
      {
        key: "nonKyoto",
        name: "Non Kyoto Protocol /Other Gases Emission",
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

  // const totalEmission = useMemo(() => {
  //   const kg = summaryCards.reduce((sum, c) => sum + Number(c.kg || 0), 0);
  //   const t = summaryCards.reduce((sum, c) => sum + Number(c.t || 0), 0);
  //   return { kg, t };
  // }, [summaryCards]);

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
            {/* <div className="flex  gap-2 mb-1 ">
              <Icon icon="heroicons:cloud" className="text-gray-700 text-2xl pr-2 " />
              <h2 className="text-xl font-semibold mb-1 text-gray-700">{item.name}</h2>
            </div> */}
            <div className="flex gap-2 mb-1">
              <Icon
                icon="heroicons:cloud"
                className="text-gray-700 text-2xl flex-none"
              />

              <h2 className="text-xl font-semibold text-gray-700 leading-tight">
                {item.name}
              </h2>
            </div>

            <p className="text-[13px] font-medium text-gray-600 flex flex-col pl-8">
              {/* <span>{formatNumber(item.kg)} kg CO₂e</span> */}
              <span>{formatNumber(item.kg)} {item.key === "vocs" ? "kg" : "kg CO₂e"}</span>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-white  tracking-wider">Building</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider whitespace-nowrap">
                  Total Emissions ({tableFilter === "vocs" ? "kg" : "kgCO₂e"})
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider whitespace-nowrap">Total Emissions (tCO₂e)</th>
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

export default AirEmissionReportPage;