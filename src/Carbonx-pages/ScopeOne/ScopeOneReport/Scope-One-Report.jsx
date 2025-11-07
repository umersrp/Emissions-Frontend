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
//         const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/stationary/Get-All`, {
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
// import React, { useState, useEffect, useMemo } from "react";
// import Card from "@/components/ui/Card";
// import Button from "@/components/ui/Button";
// import Icon from "@/components/ui/Icon";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import Tippy from "@tippyjs/react";
// import {
//   useTable,
//   useRowSelect,
//   useSortBy,
//   usePagination,
// } from "react-table";
// import GlobalFilter from "@/pages/table/react-tables/GlobalFilter";
// import Logo from "@/assets/images/logo/SrpLogo.png";
// import Modal from "@/components/ui/Modal";

// const IndeterminateCheckbox = React.forwardRef(({ indeterminate, ...rest }, ref) => {
//   const defaultRef = React.useRef();
//   const resolvedRef = ref || defaultRef;

//   React.useEffect(() => {
//     resolvedRef.current.indeterminate = indeterminate;
//   }, [resolvedRef, indeterminate]);

//   return <input type="checkbox" ref={resolvedRef} {...rest} className="table-checkbox" />;
// });

// const MobileCombustionListing = () => {
//   const navigate = useNavigate();
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [pageIndex, setPageIndex] = useState(0);
//   const [pageSize, setPageSize] = useState(10);
//   const [pageCount, setPageCount] = useState(0);
//   const [globalFilterValue, setGlobalFilterValue] = useState("");
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [selectedBuildingId, setSelectedBuildingId] = useState(null);
//   // Fetch Stationary Combustion Data
//   const fetchStationaryRecords = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(
//         `${process.env.REACT_APP_BASE_URL}/AutoMobile/Get-All`,
//         {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         }
//       );

//       const data = res.data?.data?.records || res.data?.data || [];
//       setRecords(data);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to fetch records");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchStationaryRecords();
//   }, []);

//   //  Delete Record
//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`${process.env.REACT_APP_BASE_URL}/AutoMobile/Delete/${id}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//       });
//       toast.success("Record deleted successfully");
//       fetchStationaryRecords();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to delete record");
//     }
//   };

//   //  Table Columns
//   const COLUMNS = useMemo(
//     () => [
//       {
//         Header: "Sr No",
//         id: "serialNo",
//         Cell: ({ row }) => <span>{row.index + 1 + pageIndex * pageSize}</span>,
//       },
//       {
//         Header: "Building",
//         accessor: (row) => row.buildingId?.buildingName || "-",
//       },
//       { Header: "Stakeholder", accessor: "stakeholder" },
//       { Header: "Vehicle Classification", accessor: "vehicleClassification" },
//       {
//         Header: "Vehicle Type",
//         accessor: "vehicleType",
//         Cell: ({ value }) => (
//           <span title={value}>
//             {value?.length > 50 ? value.slice(0, 50) + "..." : value || "-"}
//           </span>
//         ),
//       },
//       { Header: "Fuel Name", accessor: "fuelName" },
//       { Header: "Distance Traveled", accessor: "distanceTraveled" },
//       { Header: "Distance Unit", accessor: "distanceUnit" },
//       { Header: "Quality Control", accessor: "qualityControl" },
//       { Header: "Weight Loaded (kg)", accessor: "weightLoaded" },
//       { Header: "Calculated Emission (kg CO₂e)", accessor: "calculatedEmissionKgCo2e" },
//       { Header: "Calculated Emission (t CO₂e)", accessor: "calculatedEmissionTCo2e" },

//       {
//         Header: "Created By",
//         accessor: "createdBy.name",
//         Cell: ({ cell }) => cell.value || "-",
//       },
//       {
//         Header: "Updated By",
//         accessor: "updatedBy.name",
//         Cell: ({ cell }) => cell.value || "-",
//       },
//       {
//         Header: "Remarks",
//         accessor: "remarks",
//         Cell: ({ value }) => (
//           <span title={value}>
//             {value?.length > 20 ? value.slice(0, 20) + "..." : value || "-"}
//           </span>
//         ),
//       }, {
//         Header: "Created At",
//         accessor: "createdAt",
//         Cell: ({ cell }) =>
//           cell.value ? new Date(cell.value).toLocaleDateString() : "-",
//       },
//       {
//         Header: "Actions",
//         accessor: "_id",
//         Cell: ({ cell }) => (
//           <div className="flex space-x-3 rtl:space-x-reverse">
//             <Tippy content="View">
//               <button
//                 className="action-btn"
//                 onClick={() =>
//                   navigate(`/Mobile-Combustion-Form/${cell.value}`, {
//                     state: { mode: "view" },
//                   })
//                 }
//               >
//                 <Icon icon="heroicons:eye" className="text-green-600" />
//               </button>
//             </Tippy>

//             <Tippy content="Edit">
//               <button
//                 className="action-btn"
//                 onClick={() =>
//                   navigate(`/Mobile-Combustion-Form/${cell.value}`, {
//                     state: { mode: "edit" },
//                   })
//                 }
//               >
//                 <Icon icon="heroicons:pencil-square" className="text-blue-600" />
//               </button>
//             </Tippy>

//             <Tippy content="Delete">
//               <button
//                 className="action-btn"
//                 onClick={() => {
//                   setSelectedBuildingId(cell.value);
//                   setDeleteModalOpen(true);
//                 }}
//               >
//                 <Icon icon="heroicons:trash" className="text-red-600" />
//               </button>
//             </Tippy>
//           </div>
//         ),
//       },
//     ],
//     [pageIndex, pageSize]
//   );



//   const columns = useMemo(() => COLUMNS, [COLUMNS]);
//   const data = useMemo(() => {
//     if (!globalFilterValue) return records;
//     return records.filter((item) => {
//       const search = globalFilterValue.toLowerCase();
//       return (
//         item.buildingId?.buildingName?.toLowerCase().includes(search) ||
//         item.stakeholder?.toLowerCase().includes(search) ||
//         item.vehicleClassification?.toLowerCase().includes(search) ||
//         item.vehicleType?.toLowerCase().includes(search) ||
//         item.fuelName?.toLowerCase().includes(search) ||
//         item.remarks?.toLowerCase().includes(search)
//       );
//     });
//   }, [records, globalFilterValue]);


//   const tableInstance = useTable(
//     {
//       columns,
//       data,
//       initialState: { pageIndex: 0, pageSize: 10 },
//     },
//     useSortBy,
//     usePagination,
//     useRowSelect,
//     (hooks) => {
//       hooks.visibleColumns.push((columns) => [
//         {
//           id: "selection",
//           Header: ({ getToggleAllRowsSelectedProps }) => (
//             <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
//           ),
//           Cell: ({ row }) => <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />,
//         },
//         ...columns,
//       ]);
//     }
//   );


//   const {
//     getTableProps,
//     getTableBodyProps,
//     headerGroups,
//     page,
//     prepareRow,
//     nextPage,
//     previousPage,
//     canNextPage,
//     canPreviousPage,
//     pageOptions,
//     state,
//   } = tableInstance;

//   const { pageIndex: currentPageIndex } = state;

//   return (
//     <>
//       <Card noborder>
//         <div className="md:flex pb-6 items-center">
//           <h6 className="flex-1 md:mb-0 ">Mobile Combustion Records</h6>
//           <div className="md:flex md:space-x-3 items-center flex-none rtl:space-x-reverse">
//             <GlobalFilter filter={globalFilterValue} setFilter={setGlobalFilterValue} />
//             <Button
//               icon="heroicons-outline:plus-sm"
//               text="Add Record"
//               className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
//               iconClass="text-lg"
//               onClick={() => navigate("/Mobile-Combustion-Form/Add")}
//             />
//           </div>
//         </div>

//         <div className="overflow-x-auto -mx-6">
//           <div className="inline-block min-w-full align-middle">
//             <div className="overflow-hidden">
//               {loading ? (
//                 <div className="flex justify-center items-center py-8">
//                   <img src={Logo} alt="Loading..." className="w-52 h-24" />
//                 </div>
//               ) : (
//                 <table
//                   className="min-w-full divide-y divide-slate-100 table-fixed"
//                   {...getTableProps()}
//                 >
//                   <thead className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]">
//                     {headerGroups.map((headerGroup, index) => (
//                       <tr {...headerGroup.getHeaderGroupProps()} key={index}>
//                         {headerGroup.headers.map((column) => (
//                           <th
//                             {...column.getHeaderProps(column.getSortByToggleProps())}
//                             className="table-th text-white"
//                             key={column.id}
//                           >
//                             {column.render("Header")}
//                             <span>
//                               {column.isSorted
//                                 ? column.isSortedDesc
//                                   ? " 🔽"
//                                   : " 🔼"
//                                 : ""}
//                             </span>
//                           </th>
//                         ))}
//                       </tr>
//                     ))}
//                   </thead>
//                   <tbody {...getTableBodyProps()}>
//                     {page.length === 0 ? (
//                       <tr>
//                         <td colSpan={columns.length + 1} className="text-center py-4">
//                           No data available.
//                         </td>
//                       </tr>
//                     ) : (
//                       page.map((row) => {
//                         prepareRow(row);
//                         return (
//                           <tr {...row.getRowProps()} className="even:bg-gray-50">
//                             {row.cells.map((cell) => (
//                               <td
//                                 {...cell.getCellProps()}
//                                 className="px-6 py-4 whitespace-nowrap"
//                               >
//                                 {cell.render("Cell")}
//                               </td>
//                             ))}
//                           </tr>
//                         );
//                       })
//                     )}
//                   </tbody>
//                 </table>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Pagination */}
//         {/* <div className="md:flex justify-between items-center mt-6">
//           <div className="flex items-center space-x-3">
//             <span className="text-sm font-medium text-slate-600">
//               Page <span>{currentPageIndex + 1} of {pageOptions.length}</span>
//             </span>
//           </div>
//           <ul className="flex items-center space-x-3">
//             <li>
//               <button
//                 onClick={() => previousPage()}
//                 disabled={!canPreviousPage}
//                 className={`${!canPreviousPage ? "opacity-50 cursor-not-allowed" : ""}`}
//               >
//                 Prev
//               </button>
//             </li>
//             <li>
//               <button
//                 onClick={() => nextPage()}
//                 disabled={!canNextPage}
//                 className={`${!canNextPage ? "opacity-50 cursor-not-allowed" : ""}`}
//               >
//                 Next
//               </button>
//             </li>
//           </ul>
//           <div className="flex items-center space-x-3">
//             <span className="text-sm font-medium text-slate-600">Show</span>
//             <select
//               value={pageSize}
//               onChange={(e) => setPageSize(Number(e.target.value))}
//               className="form-select py-2"
//             >
//               {[10, 20, 30, 50].map((size) => (
//                 <option key={size} value={size}>
//                   {size}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div> */}
//         {/* Enhanced Pagination (same as CompanyTable) */}
//         <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
//           {/* Go to page + current info */}
//           <div className="flex items-center space-x-3 rtl:space-x-reverse">
//             <span className="flex space-x-2 rtl:space-x-reverse items-center">
//               <span className="text-sm font-medium text-slate-600">Go</span>
//               <span>
//                 <input
//                   type="number"
//                   className="form-control py-2"
//                   defaultValue={pageIndex + 1}
//                   onChange={(e) => {
//                     const pageNumber = e.target.value ? Number(e.target.value) - 1 : 0;
//                     if (pageNumber >= 0 && pageNumber < pageOptions.length) {
//                       tableInstance.gotoPage(pageNumber);
//                       setPageIndex(pageNumber);
//                     }
//                   }}
//                   style={{ width: "50px" }}
//                 />
//               </span>
//             </span>
//             <span className="text-sm font-medium text-slate-600">
//               Page <span>{pageIndex + 1} of {pageOptions.length || 1}</span>
//             </span>
//           </div>

//           {/* Pagination buttons */}
//           <ul className="flex items-center space-x-3 rtl:space-x-reverse">
//             <li className="text-xl leading-4 text-slate-900">
//               <button
//                 className={`${!tableInstance.canPreviousPage ? "opacity-50 cursor-not-allowed" : ""}`}
//                 onClick={() => tableInstance.gotoPage(0)}
//                 disabled={!tableInstance.canPreviousPage}
//               >
//                 <Icon icon="heroicons:chevron-double-left-solid" />
//               </button>
//             </li>
//             <li className="text-sm">
//               <button
//                 className={`${!tableInstance.canPreviousPage ? "opacity-50 cursor-not-allowed" : ""}`}
//                 onClick={() => tableInstance.previousPage()}
//                 disabled={!tableInstance.canPreviousPage}
//               >
//                 Prev
//               </button>
//             </li>

//             {pageOptions.map((pageNum, idx) => (
//               <li key={idx}>
//                 <button
//                   className={`${idx === pageIndex
//                     ? "bg-slate-900 text-white font-medium"
//                     : "bg-slate-100 text-slate-900 font-normal"
//                     } text-sm rounded h-6 w-6 flex items-center justify-center`}
//                   onClick={() => {
//                     tableInstance.gotoPage(idx);
//                     setPageIndex(idx);
//                   }}
//                 >
//                   {pageNum + 1}
//                 </button>
//               </li>
//             ))}

//             <li className="text-sm">
//               <button
//                 className={`${!tableInstance.canNextPage ? "opacity-50 cursor-not-allowed" : ""}`}
//                 onClick={() => tableInstance.nextPage()}
//                 disabled={!tableInstance.canNextPage}
//               >
//                 Next
//               </button>
//             </li>
//             <li className="text-xl leading-4 text-slate-900">
//               <button
//                 onClick={() => tableInstance.gotoPage(pageCount - 1)}
//                 disabled={!tableInstance.canNextPage}
//                 className={`${!tableInstance.canNextPage ? "opacity-50 cursor-not-allowed" : ""}`}
//               >
//                 <Icon icon="heroicons:chevron-double-right-solid" />
//               </button>
//             </li>
//           </ul>

//           {/* Show entries dropdown */}
//           <div className="flex items-center space-x-3">
//             <span className="text-sm font-medium text-slate-600">Show</span>
//             <select
//               value={pageSize}
//               onChange={(e) => setPageSize(Number(e.target.value))}
//               className="form-select py-2"
//             >
//               {[10].map((size) => (
//                 <option key={size} value={size}>
//                   {size}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </Card>
//       <Modal
//         activeModal={deleteModalOpen}
//         onClose={() => setDeleteModalOpen(false)}
//         title="Confirm Delete"
//         themeClass="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]"
//         centered
//         footerContent={
//           <>
//             <Button
//               text="Cancel"
//               className="btn-light"
//               onClick={() => setDeleteModalOpen(false)}
//             />
//             <Button
//               text="Delete"
//               className="btn-danger"
//               onClick={async () => {
//                 await handleDelete(selectedBuildingId);
//                 setDeleteModalOpen(false);
//               }}
//             />
//           </>
//         }
//       >
//         <p className="text-gray-700 text-center">
//           Are you sure you want to delete this Mobile? This action cannot be undone.
//         </p>
//       </Modal>
//     </>
//   );
// };

// export default MobileCombustionListing;
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import { useTable, useSortBy, usePagination } from "react-table";
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
  const [stationary, setStationary] = useState([]);
  const [mobile, setMobile] = useState([]);
  const [loading, setLoading] = useState(false);
  const [emissionType, setEmissionType] = useState("all");

  // Fetch data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const [stationaryRes, mobileRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_BASE_URL}/stationary/Get-All`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_BASE_URL}/AutoMobile/Get-All`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const stationaryData = stationaryRes.data?.data || [];
        const mobileData = mobileRes.data?.data || [];

        setStationary(stationaryData);
        setMobile(mobileData);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch emission data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Merge and tag data
  const mergedData = useMemo(() => {
    const s = stationary.map((item) => ({
      ...item,
      type: "stationary",
    }));
    const m = mobile.map((item) => ({
      ...item,
      type: "mobile",
    }));
    return [...s, ...m];
  }, [stationary, mobile]);

  // Filter based on selection
  const filteredData = useMemo(() => {
    if (emissionType === "all") return mergedData;
    return mergedData.filter((item) => item.type === emissionType);
  }, [mergedData, emissionType]);

  // Calculate totals
  const stationaryKg = stationary.reduce(
    (sum, i) => sum + Number(i.calculatedEmissionKgCo2e || 0),
    0
  );
  const mobileKg = mobile.reduce(
    (sum, i) => sum + Number(i.calculatedEmissionKgCo2e || 0),
    0
  );
  const totalKg = stationaryKg + mobileKg;
  const totalT = totalKg / 1000;

  // Summary Cards
  const summaryCards = [
    {
      name: "Stationary Combustion",
      kg: stationaryKg,
      t: stationaryKg / 1000,
      bg: "bg-cyan-50",
    },
    {
      name: "Mobile Combustion",
      kg: mobileKg,
      t: mobileKg / 1000,
      bg: "bg-red-50",
    },
    { name: "Fugitive Emissions", kg: 0, t: 0, bg: "bg-purple-50" },
    { name: "Process Emissions", kg: 0, t: 0, bg: "bg-green-50" },
  ];

  // Building-wise aggregation
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

  // Table setup
  const columns = useMemo(
    () => [
      { Header: "Sr No", id: "sr", Cell: ({ row }) => row.index + 1 },
      { Header: "Building", accessor: "buildingName" },
      {
        Header: "Total Emission (kg CO₂e)",
        accessor: "totalKg",
        Cell: ({ value }) => formatNumber(value),
      },
      {
        Header: "Total Emission (t CO₂e)",
        accessor: "totalT",
        Cell: ({ value }) => formatNumber(value),
      },
    ],
    []
  );

  const tableInstance = useTable(
    { columns, data: buildingData, initialState: { pageSize: 10 } },
    useSortBy,
    usePagination
  );

  const { getTableProps, getTableBodyProps, headerGroups, page, prepareRow } =
    tableInstance;

  const emissionOptions = [
    { value: "all", label: "All Scope 1 Sources" },
    { value: "stationary", label: "Stationary Combustion" },
    { value: "mobile", label: "Mobile Combustion" },
  ];

  return (
    <Card>
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">GHG TOOL</h2>
 
      <div>
      {/* Total Scope 1 */}
      <motion.div
        className="bg-gradient-to-r from-[#6fceba] to-[#6ca0b9] shadow-md rounded-2xl p-6 mb-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h2 className="text-2xl font-semibold mb-2 text-white">
          Total Scope One Emissions
        </h2>
        <p className="text-xl font-bold text-white">
          {loading
            ? "Loading..."
            : `${formatNumber(totalKg)} kg CO₂e | ${formatNumber(
                totalT
              )} t CO₂e`}
        </p>
      </motion.div>

      {/* Summary Cards */}
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
                <h2 className="text-xl font-semibold mb-1 text-gray-700">
                  {item.name}
                </h2>
              </div>
              <p className="text-[15px] font-bold text-gray-700 flex flex-col pl-8">
                <span>
                  {formatNumber(item.kg)}{" "}
                  <span className="text-black-500">kg CO₂e</span>
                </span>
                <span>
                  {formatNumber(item.t)}{" "}
                  <span className="text-black-500">t CO₂e</span>
                </span>
              </p>
            </div>
          );
        })}
      </div>
     </div>
      {/* Building-wise Table */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h6 className="text-gray-800 font-semibold">
            Building Emissions (
            {emissionType === "all"
              ? "All Scope 1"
              : emissionType.charAt(0).toUpperCase() + emissionType.slice(1)})
          </h6>

          <div className="w-56">
            <Select
              options={emissionOptions}
              value={emissionOptions.find(
                (opt) => opt.value === emissionType
              )}
              onChange={(selected) => setEmissionType(selected.value)}
              placeholder="Select Emission Type"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" {...getTableProps()}>
            <thead className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]">
              {headerGroups.map((headerGroup, idx) => (
                <tr key={idx} {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th
                      key={column.id}
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      {column.render("Header")}
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? " 🔽"
                            : " 🔼"
                          : ""}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-4">
                    No data available
                  </td>
                </tr>
              ) : (
                page.map((row) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()} className="even:bg-gray-50" key={row.id}>
                      {row.cells.map((cell) => (
                        <td
                          key={cell.column.id}
                          {...cell.getCellProps()}
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          {cell.render("Cell")}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </Card>
  );
};

export default ScopeOneReport;
