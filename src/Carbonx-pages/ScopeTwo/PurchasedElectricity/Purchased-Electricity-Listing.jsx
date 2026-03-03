// import React, { useState, useEffect, useMemo } from "react";
// import Card from "@/components/ui/Card";
// import Button from "@/components/ui/Button";
// import Icon from "@/components/ui/Icon";
// import axios from "axios";
// import { toast } from "react-toastify";
// import Tippy from "@tippyjs/react";
// import { useTable, useRowSelect, useSortBy } from "react-table";
// import GlobalFilter from "@/pages/table/react-tables/GlobalFilter";
// import Logo from "@/assets/images/logo/SrpLogo.png";
// import Modal from "@/components/ui/Modal";
// import { useNavigate, useLocation } from "react-router-dom";
// import Select from "@/components/ui/Select";

// const IndeterminateCheckbox = React.forwardRef(({ indeterminate, ...rest }, ref) => {
//   const defaultRef = React.useRef();
//   const resolvedRef = ref || defaultRef;

//   React.useEffect(() => {
//     resolvedRef.current.indeterminate = indeterminate;
//   }, [resolvedRef, indeterminate]);

//   return <input type="checkbox" ref={resolvedRef} {...rest} className="table-checkbox" />;
// });

// const PurchasedElectricityListing = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [pageIndex, setPageIndex] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalRecords, setTotalRecords] = useState(0);
//   const [globalFilterValue, setGlobalFilterValue] = useState("");
//   const [emissionFilter, setEmissionFilter] = useState("");
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [selectedId, setSelectedId] = useState(null);
//   const [goToValue, setGoToValue] = useState(pageIndex);

//   const formatSnakeCase = (value) => {
//     if (!value) return "";
//     return value
//       .split("_")
//       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(" ");
//   };


//   const renderNA = (value) => {
//     return value === null || value === undefined || value === "" ? "N/A" : value;
//   };

//   useEffect(() => {
//     if (location.state?.selectedMethod) {
//       setEmissionFilter(location.state.selectedMethod);
//       // Clear the state to prevent persistence on refresh
//       navigate(location.pathname, { replace: true, state: {} });
//     }
//   }, [location.state, navigate, location.pathname]);

//   // Fetch data from Purchased-Electricity API
//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const params = {
//         page: pageIndex,
//         limit: pageSize,
//       };

//       // Add search parameter if globalFilterValue exists
//       if (globalFilterValue) {
//         params.search = globalFilterValue;
//       }

//       // Add filter parameter if not "all"
//       if (emissionFilter !== "all") {
//         params.method = emissionFilter;
//       }

//       const res = await axios.get(
//         `${process.env.REACT_APP_BASE_URL}/Purchased-Electricity/get-All`,
//         {
//           params,
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         }
//       );

//       const data = res.data?.data || [];
//       const meta = res.data?.meta || {};

//       setRecords(data);
//       setTotalPages(meta.totalPages || 1);
//       setTotalRecords(meta.totalRecords || 0);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to fetch records");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [pageIndex, pageSize, globalFilterValue, emissionFilter]); // Added both dependencies

//   // Delete Record
//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(
//         `${process.env.REACT_APP_BASE_URL}/Purchased-Electricity/delete/${id}`,
//         { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
//       );
//       toast.success("Record deleted successfully");
//       fetchData();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to delete record");
//     }
//   };

//   // Common columns that appear in both views
//   const COMMON_COLUMNS = [
//     { Header: "Sr.No", id: "serialNo", Cell: ({ row }) => (pageIndex - 1) * pageSize + row.index + 1 },
//     { Header: "Building", accessor: "buildingId.buildingName" },
//     {
//       Header: "Method",
//       accessor: "method",
//       Cell: ({ cell }) => formatSnakeCase(cell.value) || "-",
//     },];

//   // Location-based specific columns
//   const LOCATION_BASED_COLUMNS = [
//     { Header: "Total Gross Electricity Purchased (Grid)", accessor: "totalGrossElectricityGrid", Cell: ({ cell }) => renderNA(cell.value) },
//     { Header: "Unit", accessor: "unit", Cell: ({ cell }) => renderNA(cell.value) },
//     { Header: "Grid Station", accessor: "gridStation", Cell: ({ cell }) => renderNA(cell.value) },
//     { Header: "Total Other Supplier Specific Electricity Purchased", accessor: "totalOtherSupplierElectricity", Cell: ({ cell }) => renderNA(cell.value) },
//     {
//       Header: "Calculated Location Based Emissions (kgCO₂e)", accessor: "calculatedEmissionKgCo2e", Cell: ({ cell }) => {
//         const rawValue = cell.value;
//         if (rawValue === null || rawValue === undefined || rawValue === "") {
//           return "N/A";
//         }
//         const numValue = Number(rawValue);
//         if (isNaN(numValue)) {
//           return "N/A";
//         }

//         return numValue.toFixed(2);
//       }
//     },
//     {
//       Header: "Calculated Location Based Emissions (tCO₂e)", accessor: "calculatedEmissionTCo2e", Cell: ({ cell }) => {
//         const rawValue = cell.value;
//         if (rawValue === null || rawValue === undefined || rawValue === "") {
//           return "N/A";
//         }
//         const numValue = Number(rawValue);
//         if (isNaN(numValue)) {
//           return "N/A";
//         }
//         if ((numValue !== 0 && Math.abs(numValue) < 0.01) || Math.abs(numValue) >= 1e6) {
//           return numValue.toExponential(2);
//         }
//         return numValue.toFixed(2);
//       }
//     },
//   ];

//   // Market-based specific columns
//   const MARKET_BASED_COLUMNS = [
//     { Header: "Total Purchased Electricity (Grid / Supplier Specific / PPA)", accessor: "totalPurchasedElectricity", Cell: ({ cell }) => renderNA(cell.value) },
//     { Header: "Total Gross Electricity Purchased (Grid)", accessor: "totalGrossElectricityGrid", Cell: ({ cell }) => renderNA(cell.value) },
//     { Header: "Unit", accessor: "unit" },
//     { Header: "Grid Station", accessor: "gridStation" },
//     { Header: "On-Site Solar / Renewable Electricity Generation", accessor: "hasSolarPanels", Cell: ({ cell }) => cell.value ? "Yes" : "No" },
//     { Header: "Solar Consumption with Sold Attributes", accessor: "solarConsumedButSold", Cell: ({ cell }) => renderNA(cell.value) },

//     { Header: "Supplier-Specific Electricity", accessor: "purchasesSupplierSpecific", Cell: ({ cell }) => cell.value ? "Yes" : "No" },
//     { Header: "Purchased Supplier Specific Electricity", accessor: "supplierSpecificElectricity", Cell: ({ cell }) => renderNA(cell.value) },//

//     { Header: "Power Purchase Agreements (PPAs)", accessor: "hasPPA", Cell: ({ cell }) => cell.value ? "Yes" : "No" },
//     { Header: "Electricity Purchased / Covered Under PPAs", accessor: "ppaElectricity", Cell: ({ cell }) => renderNA(cell.value) },

//     { Header: "Renewable Energy Attributes / Certificates", accessor: "hasRenewableAttributes", Cell: ({ cell }) => cell.value ? "Yes" : "No" },
//     { Header: "Electricity Covered by Renewable Attributes", accessor: "renewableAttributesElectricity", Cell: ({ cell }) => renderNA(cell.value) },

//     //{ Header: "Total Onsite Solar Consumption", accessor: "totalOnsiteSolarConsumption" },
//     //{ Header: "Solar Retained Under RECs", accessor: "solarRetainedUnderRECs" },
//     {
//       Header: "Calculated Location Based Emissions (kgCO₂e)", accessor: "calculatedEmissionKgCo2e", Cell: ({ cell }) => {
//         const value = Number(cell.value);
//         if (isNaN(value) || value === 0) { return "N/A"; }
//         return value.toFixed(2);
//       }
//     },
//     {
//       Header: "Calculated Location Based Emissions (tCO₂e)", accessor: "calculatedEmissionTCo2e", Cell: ({ cell }) => {
//         const value = Number(cell.value);
//         if (isNaN(value) || value === 0) { return "N/A"; }
//         if (Math.abs(value) < 0.01 || Math.abs(value) >= 1e6) { return value.toExponential(2); }
//         return value.toFixed(2);
//       }
//     },

//     {
//       Header: "Calculated Market Based Emissions (kgCO₂e)", accessor: "calculatedEmissionMarketKgCo2e", Cell: ({ cell }) => {
//         const value = Number(cell.value);
//         if (isNaN(value) || value === 0) { return "N/A"; }
//         return value.toFixed(2);
//       }
//     },
//     {
//       Header: "Calculated Market Based Emissions (tCO₂e)", accessor: "calculatedEmissionMarketTCo2e", Cell: ({ cell }) => {
//         const value = Number(cell.value);
//         if (isNaN(value) || value === 0) { return "N/A"; }
//         if (Math.abs(value) < 0.01 || Math.abs(value) >= 1e6) { return value.toExponential(2); }
//         return value.toFixed(2);
//       }
//     },
//   ];

//   // Additional common columns after emission columns
//   const FINAL_COLUMNS = [
//     { Header: "Quality Control", accessor: "qualityControl", Cell: ({ cell }) => renderNA(cell.value) },
//     { Header: "Remarks", accessor: "remarks", Cell: ({ cell }) => renderNA(cell.value) },
//     {
//       Header: "Created By",
//       accessor: "createdBy.name",
//       Cell: ({ cell }) => cell.value || "N/A",
//     },
//     {
//       Header: "Updated By",
//       accessor: "updatedBy.name",
//       Cell: ({ cell }) => cell.value || "N/A",
//     },
//     {
//       Header: "Posting Date", accessor: "postingDate",
//         Cell: ({ cell }) => {
//           if (!cell.value) return "N/A";
//           try {
//             return new Date(cell.value).toLocaleDateString('en-GB');
//           } catch {
//             return "Invalid Date";
//           }
//         }
//     },
//     {
//       Header: "Created At",
//       accessor: "createdAt",
//       Cell: ({ cell }) => (cell.value ? new Date(cell.value).toLocaleDateString() : "-"),
//     },
//     {
//       Header: "Actions",
//       accessor: "_id",
//       Cell: ({ cell }) => (
//         <div className="flex space-x-3 rtl:space-x-reverse">
//           <Tippy content="View">
//             <button
//               className="action-btn"
//               onClick={() => navigate(`/Purchased-Electricity-Form/${cell.value}`, { state: { mode: "view" } })}
//             >
//               <Icon icon="heroicons:eye" className="text-green-600" />
//             </button>
//           </Tippy>
//           <Tippy content="Edit">
//             <button
//               className="action-btn"
//               onClick={() => navigate(`/Purchased-Electricity-Form/${cell.value}`, { state: { mode: "edit" } })}
//             >
//               <Icon icon="heroicons:pencil-square" className="text-blue-600" />
//             </button>
//           </Tippy>
//           <Tippy content="Delete">
//             <button
//               className="action-btn"
//               onClick={() => {
//                 setSelectedId(cell.value);
//                 setDeleteModalOpen(true);
//               }}
//             >
//               <Icon icon="heroicons:trash" className="text-red-600" />
//             </button>
//           </Tippy>
//         </div>
//       ),
//     },
//   ];

//   // Build columns based on current filter
//   const COLUMNS = useMemo(() => {
//     if (!emissionFilter) return []; // no filter selected → no columns

//     let emissionColumns = [];

//     if (emissionFilter === "location_based") {
//       emissionColumns = LOCATION_BASED_COLUMNS;
//     } else if (emissionFilter === "market_based") {
//       emissionColumns = MARKET_BASED_COLUMNS;
//     }

//     return [...COMMON_COLUMNS, ...emissionColumns, ...FINAL_COLUMNS];
//   }, [emissionFilter, pageIndex, pageSize]);


//   const columns = useMemo(() => COLUMNS, [COLUMNS]);
//   const data = useMemo(() => records, [records]);

//   const tableInstance = useTable({ columns, data }, useSortBy, useRowSelect, (hooks) => {
//     hooks.visibleColumns.push((columns) => [
//       {
//         id: "selection",
//         Header: ({ getToggleAllRowsSelectedProps }) => (
//           <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
//         ),
//         Cell: ({ row }) => <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />,
//       },
//       ...columns,
//     ]);
//   });

//   const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

//   const handleGoToPage = (page) => {
//     if (page < 1) page = 1;
//     if (page > totalPages) page = totalPages;
//     setPageIndex(page);
//   };
//   const handlePrevPage = () => handleGoToPage(pageIndex - 1);
//   const handleNextPage = () => handleGoToPage(pageIndex + 1);

//   return (
//     <>
//       <Card noborder>
//         <div className="md:flex pb-6 items-center">
//           <h6 className="flex-1 md:mb-0">Purchased Electricity Records</h6>
//           <div className="md:flex md:space-x-3 items-center flex-wrap gap-2">
//             {/* Emission Filter Dropdown */}
//             <div className="flex items-center space-x-2">
//               <label className="text-sm font-medium text-slate-600">Filter:</label>
//               {/* <select
//                 value={emissionFilter}
//                 onChange={(e) => {
//                   setEmissionFilter(e.target.value);
//                   setPageIndex(1); 
//                 }}
//                 className="form-select py-2 w-44 rounded"
//               >
//                 <option value="">Select Method</option>
//                 <option value="location_based">Location Based</option>
//                 <option value="market_based">Market Based</option>
//               </select> */}
//               <Select
//                 options={[
//                   { value: "", label: "Select Method" },
//                   { value: "location_based", label: "Location Based" },
//                   { value: "market_based", label: "Market Based" },
//                 ]}
//                 value={
//                   emissionFilter
//                     ? {
//                       value: emissionFilter,
//                       label: emissionFilter === "location_based"
//                         ? "Location Based"
//                         : emissionFilter === "market_based"
//                           ? "Market Based"
//                           : "Select Method"
//                     }
//                     : { value: "", label: "Select Method" }
//                 }
//                 onChange={(selected) => {
//                   setEmissionFilter(selected ? selected.value : "");
//                   setPageIndex(1);
//                 }}
//                 className="w-44"
//                 classNamePrefix="react-select"
//                 styles={{
//                   control: (base) => ({
//                     ...base,
//                     minHeight: "38px", // Match your original height
//                     borderColor: "#d1d5db", // gray-300
//                     borderRadius: "0.375rem", // rounded
//                     "&:hover": {
//                       borderColor: "#9ca3af", // gray-400
//                     },
//                   }),
//                   option: (base, state) => ({
//                     ...base,
//                     backgroundColor: state.isSelected ? "#3b82f6" : "white", // blue-500 when selected
//                     color: state.isSelected ? "white" : "#374151", // gray-700
//                     "&:hover": {
//                       backgroundColor: "#f3f4f6", // gray-100
//                     },
//                   }),
//                 }}
//               />
//             </div>

//             {/* Global Search */}
//             <GlobalFilter filter={globalFilterValue} setFilter={setGlobalFilterValue} />

//             <Button
//               icon="heroicons-outline:plus-sm"
//               text="Add Record"
//               className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
//               onClick={() => navigate("/Purchased-Electricity-Form/Add")}
//             />
//           </div>
//         </div>

//         {/* TABLE */}
//         <div className="overflow-x-auto -mx-6">
//           <div className="inline-block min-w-full align-middle">
//             <div className="overflow-y-auto max-h-[calc(100vh-300px)] overflow-x-auto">
//               {loading ? (
//                 <div className="flex justify-center items-center py-8">
//                   <img src={Logo} alt="Loading..." className="w-52 h-24" />
//                 </div>
//               ) : (
//                 // <table
//                 //   className="min-w-full divide-y divide-slate-100 table-fixed"
//                 //   {...getTableProps()}
//                 // >
//                 //   <thead className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] sticky top-0 z-10">
//                 //     {headerGroups.map((headerGroup, index) => (
//                 //       <tr {...headerGroup.getHeaderGroupProps()} key={index}>
//                 //         {headerGroup.headers.map((column) => (
//                 //           <th
//                 //             {...column.getHeaderProps(column.getSortByToggleProps())}
//                 //             className="table-th text-white whitespace-nowrap"
//                 //             key={column.id}
//                 //           >
//                 //             {column.render("Header")}
//                 //             <span>
//                 //               {column.isSorted
//                 //                 ? column.isSortedDesc
//                 //                   ? " 🔽"
//                 //                   : " 🔼"
//                 //                 : ""}
//                 //             </span>
//                 //           </th>
//                 //         ))}
//                 //       </tr>
//                 //     ))}
//                 //   </thead>
//                 //   {/* <tbody {...getTableBodyProps()}>
//                 //     {rows.length === 0 ? (
//                 //       <tr>
//                 //         <td colSpan={COLUMNS.length + 1}>
//                 //           <div className="flex justify-center items-center py-16">
//                 //             <span className="text-gray-500 text-lg font-medium">
//                 //               No data available.
//                 //             </span>
//                 //           </div>
//                 //         </td>
//                 //       </tr>
//                 //     ) : (
//                 //       rows.map((row) => {
//                 //         prepareRow(row);
//                 //         return (
//                 //           <tr {...row.getRowProps()} className="even:bg-gray-50">
//                 //             {row.cells.map((cell) => (
//                 //               <td
//                 //                 {...cell.getCellProps()}
//                 //                 className="px-6 py-4 whitespace-nowrap"
//                 //               >
//                 //                 {cell.render("Cell")}
//                 //               </td>
//                 //             ))}
//                 //           </tr>
//                 //         );
//                 //       })
//                 //     )}
//                 //   </tbody> */}
//                 //   <tbody {...getTableBodyProps()}>
//                 //     {rows.length === 0 ? (
//                 //       <tr>
//                 //         <td colSpan={COLUMNS.length + 1}>
//                 //           <div className="flex justify-center items-center py-16">
//                 //             <span className="text-gray-500 text-lg font-medium">
//                 //               {emissionFilter === "all"
//                 //                 ? "Select Method"
//                 //                 : "No data available."}
//                 //             </span>
//                 //           </div>
//                 //         </td>
//                 //       </tr>
//                 //     ) : (
//                 //       rows.map((row) => {
//                 //         prepareRow(row);
//                 //         return (
//                 //           <tr {...row.getRowProps()} className="even:bg-gray-50">
//                 //             {row.cells.map((cell) => (
//                 //               <td
//                 //                 {...cell.getCellProps()}
//                 //                 className="px-6 py-4 whitespace-nowrap"
//                 //               >
//                 //                 {cell.render("Cell")}
//                 //               </td>
//                 //             ))}
//                 //           </tr>
//                 //         );
//                 //       })
//                 //     )}
//                 //   </tbody>

//                 // </table>
//                 <table
//                   className="min-w-full divide-y divide-slate-100 table-fixed"
//                   {...getTableProps()}
//                 >
//                   {emissionFilter && (
//                     <thead className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] sticky top-0 z-10">
//                       {headerGroups.map((headerGroup, index) => (
//                         <tr {...headerGroup.getHeaderGroupProps()} key={index}>
//                           {headerGroup.headers.map((column) => (
//                             <th
//                               {...column.getHeaderProps(column.getSortByToggleProps())}
//                               className="table-th text-white whitespace-nowrap"
//                               key={column.id}
//                             >
//                               {column.render("Header")}
//                               <span>
//                                 {column.isSorted
//                                   ? column.isSortedDesc
//                                     ? " 🔽"
//                                     : " 🔼"
//                                   : ""}
//                               </span>
//                             </th>
//                           ))}
//                         </tr>
//                       ))}
//                     </thead>
//                   )}

//                   <tbody {...getTableBodyProps()}>
//                     {!emissionFilter ? (
//                       <tr>
//                         <td colSpan={COLUMNS.length || 3}>
//                           <div className="flex justify-center items-center py-16">
//                             <span className="text-gray-500 text-lg font-medium">
//                               Select Method to See Records
//                             </span>
//                           </div>
//                         </td>
//                       </tr>
//                     ) : rows.length === 0 ? (
//                       <tr>
//                         <td colSpan={COLUMNS.length}>
//                           <div className="flex justify-center items-center py-16">
//                             <span className="text-gray-500 text-lg font-medium">
//                               No data available
//                             </span>
//                           </div>
//                         </td>
//                       </tr>
//                     ) : (
//                       rows.map((row) => {
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

//         {/* CUSTOM PAGINATION UI (SERVER SIDE) */}
//         <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
//           {/* LEFT SECTION – Go To Page */}
//           <div className="flex items-center space-x-3">
//             <span className="flex space-x-2 items-center">
//               <span className="text-sm font-medium text-slate-600">Go</span>
//               <input
//                 type="number"
//                 className="form-control py-2"
//                 min="1"
//                 max={totalPages}
//                 value={goToValue}
//                 onChange={(e) => setGoToValue(e.target.value)}
//                 onBlur={() => {
//                   const page = Number(goToValue);
//                   if (page >= 1 && page <= totalPages && page !== pageIndex) {
//                     handleGoToPage(page);
//                   } else {
//                     setGoToValue(pageIndex);
//                   }
//                 }}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") {
//                     const page = Number(goToValue);
//                     if (page >= 1 && page <= totalPages && page !== pageIndex) {
//                       handleGoToPage(page);
//                     } else {
//                       setGoToValue(pageIndex);
//                     }
//                   }
//                 }}
//                 style={{ width: "70px" }}
//               />
//             </span>
//             <span className="text-sm font-medium text-slate-600">
//               Page {pageIndex} of {totalPages}
//             </span>
//           </div>

//           {/* MIDDLE SECTION – Full Pagination */}
//           <ul className="flex items-center space-x-3">

//             {/* First Page */}
//             <li>
//               <button
//                 onClick={() => handleGoToPage(1)}
//                 disabled={pageIndex === 1}
//               >
//                 <Icon icon="heroicons:chevron-double-left-solid" />
//               </button>
//             </li>

//             {/* Prev */}
//             <li>
//               <button
//                 onClick={handlePrevPage}
//                 disabled={pageIndex === 1}
//               >
//                 Prev
//               </button>
//             </li>

//             {/* Truncated Pagination */}
//             {(() => {
//               const showPages = [];
//               const total = totalPages;
//               const current = pageIndex;

//               if (total > 0) showPages.push(1);
//               if (total > 1) showPages.push(2);
//               if (current > 4) showPages.push("left-ellipsis");
//               if (current > 2 && current < total - 1) showPages.push(current);
//               if (current < total - 3) showPages.push("right-ellipsis");
//               if (total > 2) showPages.push(total - 1);
//               if (total > 1) showPages.push(total);

//               const finalPages = [...new Set(
//                 showPages.filter(
//                   (p) => (typeof p === "number" && p >= 1 && p <= total) || typeof p === "string"
//                 )
//               )];

//               return finalPages.map((p, idx) => (
//                 <li key={idx}>
//                   {p === "left-ellipsis" || p === "right-ellipsis" ? (
//                     <span className="text-slate-500 px-1">...</span>
//                   ) : (
//                     <button
//                       className={`${p === current
//                         ? "bg-slate-900 text-white font-medium"
//                         : "bg-slate-100 text-slate-900"
//                         } text-sm rounded h-6 w-6 flex items-center justify-center`}
//                       onClick={() => handleGoToPage(p)}
//                     >
//                       {p}
//                     </button>
//                   )}
//                 </li>
//               ));
//             })()}

//             {/* Next */}
//             <li>
//               <button
//                 onClick={handleNextPage}
//                 disabled={pageIndex === totalPages}
//               >
//                 Next
//               </button>
//             </li>
//             <li>
//               <button
//                 onClick={() => handleGoToPage(totalPages)}
//                 disabled={pageIndex === totalPages}
//               >
//                 <Icon icon="heroicons:chevron-double-right-solid" />
//               </button>
//             </li>

//           </ul>

//           {/* RIGHT SECTION – Show page size */}
//           <div className="flex items-center space-x-3">
//             <span className="text-sm font-medium text-slate-600">Show</span>
//             <select
//               value={pageSize}
//               onChange={(e) => setPageSize(Number(e.target.value))}
//               className="form-select py-2"
//             >
//               {[10, 20, 50].map((size) => (
//                 <option key={size} value={size}>
//                   {size}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//       </Card>

//       {/* DELETE MODAL */}
//       <Modal
//         activeModal={deleteModalOpen}
//         onClose={() => setDeleteModalOpen(false)}
//         title="Confirm Delete"
//         themeClass="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]"
//         centered
//         footerContent={
//           <>
//             <Button text="Cancel" className="btn-light" onClick={() => setDeleteModalOpen(false)} />
//             <Button
//               text="Delete"
//               className="btn-danger"
//               onClick={async () => {
//                 await handleDelete(selectedId);
//                 setDeleteModalOpen(false);
//               }}
//             />
//           </>
//         }
//       >
//         <p className="text-gray-700 text-center">
//           Are you sure you want to delete this record? This action cannot be undone.
//         </p>
//       </Modal>
//     </>
//   );
// };

// export default PurchasedElectricityListing;


// src/pages/scope2/PurchasedElectricityListing.js
import React, { useState, useEffect, useMemo, useRef } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import axios from "axios";
import { toast } from "react-toastify";
import Tippy from "@tippyjs/react";
import { useTable, useRowSelect, useSortBy } from "react-table";
import GlobalFilter from "@/pages/table/react-tables/GlobalFilter";
import Logo from "@/assets/images/logo/SrpLogo.png";
import Modal from "@/components/ui/Modal";
import { useNavigate, useLocation } from "react-router-dom";
import Select from "@/components/ui/Select";
import CSVUploadModal from "@/components/ui/CSVUploadModal";
import ExcelExportButton from "@/components/ui/ExcelExportButton";
import usePurchasedElectricityCSVUpload from "@/hooks/scope2/usePurchasedElectricityCSVUpload";

const IndeterminateCheckbox = React.forwardRef(({ indeterminate, ...rest }, ref) => {
  const defaultRef = React.useRef();
  const resolvedRef = ref || defaultRef;

  React.useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);

  return <input type="checkbox" ref={resolvedRef} {...rest} className="table-checkbox" />;
});

const PurchasedElectricityListing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [emissionFilter, setEmissionFilter] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bulkUploadModalOpen, setBulkUploadModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [goToValue, setGoToValue] = useState(pageIndex);
  const [buildings, setBuildings] = useState([]);

  // CSV Upload using custom hook
  const {
    csvState,
    handleFileSelect,
    processUpload,
    resetUpload,
    downloadPurchasedElectricityTemplate
  } = usePurchasedElectricityCSVUpload(buildings);

  const formatSnakeCase = (value) => {
    if (!value) return "";
    return value
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const renderNA = (value) => {
    return value === null || value === undefined || value === "" ? "N/A" : value;
  };

  // Fetch all records for export
  const fetchAllPurchasedElectricityRecords = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/Purchased-Electricity/get-All?limit=1000000`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      return res.data?.data || [];
    } catch (err) {
      console.error("Error fetching records for export:", err);
      toast.error("Failed to fetch records for export");
      return [];
    }
  };

  // Custom formatter for export
  const customFormatter = (value, column, row, index) => {
    if (value === "N/A") return "N/A";

    if (column.Header === "Sr.No" || column.id === "serialNo") {
      return index + 1;
    }

    if (column.accessor === "buildingId.buildingName") {
      return value || "N/A";
    }

    if (column.accessor === "method") {
      return formatSnakeCase(value) || "N/A";
    }

    if (column.accessor === "postingDate") {
      if (!value) return "N/A";
      try {
        return new Date(value).toLocaleDateString('en-GB');
      } catch {
        return "Invalid Date";
      }
    }

    if (column.accessor === "calculatedEmissionKgCo2e" || 
        column.accessor === "calculatedEmissionTCo2e" ||
        column.accessor === "calculatedEmissionMarketKgCo2e" ||
        column.accessor === "calculatedEmissionMarketTCo2e") {
      if (!value || value === "N/A") return "N/A";
      const numValue = Number(value);
      if (isNaN(numValue)) return "N/A";
      return numValue.toFixed(2);
    }

    return value || "N/A";
  };

  useEffect(() => {
    if (location.state?.selectedMethod) {
      setEmissionFilter(location.state.selectedMethod);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const fetchBuildings = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/building/Get-All-Buildings?limit=1000`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );
      setBuildings(res.data?.data?.buildings || []);
    } catch {
      console.error("Failed to load buildings");
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  // Fetch data from Purchased-Electricity API
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        page: pageIndex,
        limit: pageSize,
      };

      if (globalFilterValue) {
        params.search = globalFilterValue;
      }

      if (emissionFilter) {
        params.method = emissionFilter;
      }

      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/Purchased-Electricity/get-All`,
        {
          params,
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const data = res.data?.data || [];
      const meta = res.data?.meta || {};

      setRecords(data);
      setTotalPages(meta.totalPages || 1);
      setTotalRecords(meta.totalRecords || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize, globalFilterValue, emissionFilter]);

  // Delete Record
  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_BASE_URL}/Purchased-Electricity/delete/${id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success("Record deleted successfully");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete record");
    }
  };

  // CSV Upload handlers
  const handleCSVFileSelect = async (selectedFile) => {
    if (!selectedFile) {
      toast.error('No file selected');
      return;
    }
    try {
      await handleFileSelect(selectedFile);
    } catch (error) {
      console.error('Error handling file select:', error);
      toast.error('Failed to process file');
    }
  };

  const handleCSVUpload = async () => {
    if (csvState.uploading) return;

    try {
      const results = await processUpload();

      if (results && results.failed === 0) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setBulkUploadModalOpen(false);
        resetUpload();
        setTimeout(() => {
          fetchData();
        }, 100);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    }
  };

  const handleModalClose = () => {
    if (csvState.uploading) {
      toast.warning('Please wait for upload to complete');
      return;
    }
    resetUpload();
    setBulkUploadModalOpen(false);
  };

  const templateInstructions = (
    <ol className="text-sm text-black-700 space-y-1 list-decimal pl-4">
      <li>Download the template below</li>
      <li>Fill in your data (keep column headers as is)</li>
      <li>Save as CSV file</li>
      <li>Upload using the form below</li>
      <li>Review validation results and submit</li>
    </ol>
  );

  // Common columns that appear in both views
  const COMMON_COLUMNS = [
    { 
      Header: "Sr.No", 
      id: "serialNo", 
      Cell: ({ row }) => (pageIndex - 1) * pageSize + row.index + 1 
    },
    { 
      Header: "Building", 
      accessor: "buildingId.buildingName",
      Cell: ({ value }) => value || "N/A"
    },
    {
      Header: "Method",
      accessor: "method",
      Cell: ({ value }) => formatSnakeCase(value) || "-",
    },
  ];

  // Location-based specific columns
  const LOCATION_BASED_COLUMNS = [
    { 
      Header: "Total Gross Electricity Purchased (Grid)", 
      accessor: "totalGrossElectricityGrid", 
      Cell: ({ value }) => renderNA(value) 
    },
    { 
      Header: "Unit", 
      accessor: "unit", 
      Cell: ({ value }) => renderNA(value) 
    },
    { 
      Header: "Grid Station", 
      accessor: "gridStation", 
      Cell: ({ value }) => renderNA(value) 
    },
    { 
      Header: "Total Other Supplier Specific Electricity Purchased", 
      accessor: "totalOtherSupplierElectricity", 
      Cell: ({ value }) => renderNA(value) 
    },
    {
      Header: "Calculated Location Based Emissions (kgCO₂e)", 
      accessor: "calculatedEmissionKgCo2e", 
      Cell: ({ value }) => {
        if (value === null || value === undefined || value === "") return "N/A";
        const numValue = Number(value);
        if (isNaN(numValue)) return "N/A";
        return numValue.toFixed(2);
      }
    },
    {
      Header: "Calculated Location Based Emissions (tCO₂e)", 
      accessor: "calculatedEmissionTCo2e", 
      Cell: ({ value }) => {
        if (value === null || value === undefined || value === "") return "N/A";
        const numValue = Number(value);
        if (isNaN(numValue)) return "N/A";
        if ((numValue !== 0 && Math.abs(numValue) < 0.01) || Math.abs(numValue) >= 1e6) {
          return numValue.toExponential(2);
        }
        return numValue.toFixed(2);
      }
    },
  ];

  // Market-based specific columns
  const MARKET_BASED_COLUMNS = [
    { 
      Header: "Total Purchased Electricity", 
      accessor: "totalPurchasedElectricity", 
      Cell: ({ value }) => renderNA(value) 
    },
    { 
      Header: "Total Gross Electricity Purchased (Grid)", 
      accessor: "totalGrossElectricityGrid", 
      Cell: ({ value }) => renderNA(value) 
    },
    { 
      Header: "Unit", 
      accessor: "unit" 
    },
    { 
      Header: "Grid Station", 
      accessor: "gridStation" 
    },
    { 
      Header: "On-Site Solar / Renewable Electricity Generation", 
      accessor: "hasSolarPanels", 
      Cell: ({ value }) => value ? "Yes" : "No" 
    },
    { 
      Header: "Solar Consumption with Sold Attributes", 
      accessor: "solarConsumedButSold", 
      Cell: ({ value }) => renderNA(value) 
    },
    { 
      Header: "Supplier-Specific Electricity", 
      accessor: "purchasesSupplierSpecific", 
      Cell: ({ value }) => value ? "Yes" : "No" 
    },
    { 
      Header: "Purchased Supplier Specific Electricity", 
      accessor: "supplierSpecificElectricity", 
      Cell: ({ value }) => renderNA(value) 
    },
    { 
      Header: "Power Purchase Agreements (PPAs)", 
      accessor: "hasPPA", 
      Cell: ({ value }) => value ? "Yes" : "No" 
    },
    { 
      Header: "Electricity Purchased / Covered Under PPAs", 
      accessor: "ppaElectricity", 
      Cell: ({ value }) => renderNA(value) 
    },
    { 
      Header: "Renewable Energy Attributes", 
      accessor: "hasRenewableAttributes", 
      Cell: ({ value }) => value ? "Yes" : "No" 
    },
    { 
      Header: "Electricity Covered by Renewable Attributes", 
      accessor: "renewableAttributesElectricity", 
      Cell: ({ value }) => renderNA(value) 
    },
    {
      Header: "Calculated Location Based Emissions (kgCO₂e)", 
      accessor: "calculatedEmissionKgCo2e", 
      Cell: ({ value }) => {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue === 0) return "N/A";
        return numValue.toFixed(2);
      }
    },
    {
      Header: "Calculated Location Based Emissions (tCO₂e)", 
      accessor: "calculatedEmissionTCo2e", 
      Cell: ({ value }) => {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue === 0) return "N/A";
        if (Math.abs(numValue) < 0.01 || Math.abs(numValue) >= 1e6) {
          return numValue.toExponential(2);
        }
        return numValue.toFixed(2);
      }
    },
    {
      Header: "Calculated Market Based Emissions (kgCO₂e)", 
      accessor: "calculatedEmissionMarketKgCo2e", 
      Cell: ({ value }) => {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue === 0) return "N/A";
        return numValue.toFixed(2);
      }
    },
    {
      Header: "Calculated Market Based Emissions (tCO₂e)", 
      accessor: "calculatedEmissionMarketTCo2e", 
      Cell: ({ value }) => {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue === 0) return "N/A";
        if (Math.abs(numValue) < 0.01 || Math.abs(numValue) >= 1e6) {
          return numValue.toExponential(2);
        }
        return numValue.toFixed(2);
      }
    },
  ];

  // Additional common columns after emission columns
  const FINAL_COLUMNS = [
    { 
      Header: "Quality Control", 
      accessor: "qualityControl", 
      Cell: ({ value }) => renderNA(value) 
    },
    { 
      Header: "Remarks", 
      accessor: "remarks", 
      Cell: ({ value }) => renderNA(value) 
    },
    {
      Header: "Created By",
      accessor: "createdBy.name",
      Cell: ({ value }) => value || "N/A",
    },
    {
      Header: "Updated By",
      accessor: "updatedBy.name",
      Cell: ({ value }) => value || "N/A",
    },
    {
      Header: "Posting Date", 
      accessor: "postingDate",
      Cell: ({ value }) => {
        if (!value) return "N/A";
        try {
          return new Date(value).toLocaleDateString('en-GB');
        } catch {
          return "Invalid Date";
        }
      }
    },
    {
      Header: "Actions",
      accessor: "_id",
      Cell: ({ value, row }) => (
        <div className="flex space-x-3 rtl:space-x-reverse">
          <Tippy content="View">
            <button
              className="action-btn"
              onClick={() => navigate(`/Purchased-Electricity-Form/${value}`, { state: { mode: "view" } })}
            >
              <Icon icon="heroicons:eye" className="text-green-600" />
            </button>
          </Tippy>
          <Tippy content="Edit">
            <button
              className="action-btn"
              onClick={() => navigate(`/Purchased-Electricity-Form/${value}`, { state: { mode: "edit" } })}
            >
              <Icon icon="heroicons:pencil-square" className="text-blue-600" />
            </button>
          </Tippy>
          <Tippy content="Delete">
            <button
              className="action-btn"
              onClick={() => {
                setSelectedId(value);
                setDeleteModalOpen(true);
              }}
            >
              <Icon icon="heroicons:trash" className="text-red-600" />
            </button>
          </Tippy>
        </div>
      ),
    },
  ];

  // Build columns based on current filter
  const COLUMNS = useMemo(() => {
    if (!emissionFilter) return [];

    let emissionColumns = [];

    if (emissionFilter === "location_based") {
      emissionColumns = LOCATION_BASED_COLUMNS;
    } else if (emissionFilter === "market_based") {
      emissionColumns = MARKET_BASED_COLUMNS;
    }

    return [...COMMON_COLUMNS, ...emissionColumns, ...FINAL_COLUMNS];
  }, [emissionFilter]);

  const columns = useMemo(() => COLUMNS, [COLUMNS]);
  const data = useMemo(() => records, [records]);

  const tableInstance = useTable({ columns, data }, useSortBy, useRowSelect, (hooks) => {
    hooks.visibleColumns.push((columns) => [
      {
        id: "selection",
        Header: ({ getToggleAllRowsSelectedProps }) => (
          <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
        ),
        Cell: ({ row }) => <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />,
      },
      ...columns,
    ]);
  });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  const handleGoToPage = (page) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setPageIndex(page);
  };

  useEffect(() => {
    setGoToValue(pageIndex);
  }, [pageIndex]);

  return (
    <>
      <Card noborder>
        <div className="md:flex pb-6 items-center">
          <h6 className="flex-1 md:mb-0">Purchased Electricity Records</h6>
          <div className="md:flex md:space-x-3 items-center flex-wrap gap-2">
            {/* Emission Filter Dropdown */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-slate-600">Filter:</label>
              <Select
                options={[
                  { value: "", label: "Select Method" },
                  { value: "location_based", label: "Location Based" },
                  { value: "market_based", label: "Market Based" },
                ]}
                value={
                  emissionFilter
                    ? {
                        value: emissionFilter,
                        label: emissionFilter === "location_based"
                          ? "Location Based"
                          : "Market Based"
                      }
                    : { value: "", label: "Select Method" }
                }
                onChange={(selected) => {
                  setEmissionFilter(selected ? selected.value : "");
                  setPageIndex(1);
                }}
                className="w-44"
                classNamePrefix="react-select"
              />
            </div>

            {/* Global Search */}
            <GlobalFilter filter={globalFilterValue} setFilter={setGlobalFilterValue} />

            {/* Export Buttons */}
            {records.length > 0 && (
              <ExcelExportButton
                data={records}
                columns={COLUMNS}
                exportFields={[
                  "buildingId.buildingName",
                  "method",
                  "unit",
                  "totalGrossElectricityGrid",
                  "gridStation",
                  "totalOtherSupplierElectricity",
                  "qualityControl",
                  "calculatedEmissionKgCo2e",
                  "calculatedEmissionTCo2e",
                  "calculatedEmissionMarketKgCo2e",
                  "calculatedEmissionMarketTCo2e",
                  "remarks",
                  "postingDate",
                  "createdBy.name",
                  "updatedBy.name"
                ]}
                fileName="purchased_electricity_current_page"
                sheetName="Current Page"
                buttonText="Export Page"
                buttonClassName="btn font-normal btn-sm bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white border-0 hover:opacity-90"
                exportFormat="current"
                customFormatter={customFormatter}
                pageInfo={{ currentPage: pageIndex, limit: pageSize }}
              />
            )}

            <ExcelExportButton
              data={records}
              fetchAllData={fetchAllPurchasedElectricityRecords}
              columns={COLUMNS}
              exportFields={[
                "buildingId.buildingName",
                "method",
                "unit",
                "totalGrossElectricityGrid",
                "gridStation",
                "totalOtherSupplierElectricity",
                "qualityControl",
                "calculatedEmissionKgCo2e",
                "calculatedEmissionTCo2e",
                "calculatedEmissionMarketKgCo2e",
                "calculatedEmissionMarketTCo2e",
                "remarks",
                "postingDate",
                "createdBy.name",
                "updatedBy.name"
              ]}
              fileName="purchased_electricity_records"
              sheetName="Purchased Electricity"
              buttonText="Export All"
              buttonClassName="btn font-normal btn-sm bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white border-0 hover:opacity-90"
              successMessage="Purchased electricity records exported successfully!"
              customFormatter={customFormatter}
              exportFormat="all"
              pageInfo={{ currentPage: pageIndex, totalPages }}
            />

            {/* Import Button */}
            <Button
              icon={csvState.uploading ? "heroicons:arrow-path" : "heroicons:document-arrow-up"}
              text={csvState.uploading ? "Uploading..." : "Import"}
              className="btn font-normal btn-sm bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white border-0 hover:opacity-90"
              iconClass={csvState.uploading ? "text-lg animate-spin" : "text-lg"}
              onClick={() => setBulkUploadModalOpen(true)}
              disabled={csvState.uploading}
            />

            {/* Add Record Button */}
            <Button
              icon="heroicons-outline:plus-sm"
              text="Add Record"
              className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
              onClick={() => navigate("/Purchased-Electricity-Form/Add")}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-y-auto max-h-[calc(100vh-300px)] overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <img src={Logo} alt="Loading..." className="w-52 h-24" />
                </div>
              ) : (
                <table
                  className="min-w-full divide-y divide-slate-100 table-fixed"
                  {...getTableProps()}
                >
                  {emissionFilter && (
                    <thead className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] sticky top-0 z-10">
                      {headerGroups.map((headerGroup, index) => (
                        <tr {...headerGroup.getHeaderGroupProps()} key={index}>
                          {headerGroup.headers.map((column) => (
                            <th
                              {...column.getHeaderProps(column.getSortByToggleProps())}
                              className="table-th text-white whitespace-nowrap"
                              key={column.id}
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
                  )}

                  <tbody {...getTableBodyProps()}>
                    {!emissionFilter ? (
                      <tr>
                        <td colSpan={COLUMNS.length || 3}>
                          <div className="flex justify-center items-center py-16">
                            <span className="text-gray-500 text-lg font-medium">
                              Select Method to See Records
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : rows.length === 0 ? (
                      <tr>
                        <td colSpan={COLUMNS.length}>
                          <div className="flex justify-center items-center py-16">
                            <span className="text-gray-500 text-lg font-medium">
                              No data available
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      rows.map((row) => {
                        prepareRow(row);
                        return (
                          <tr {...row.getRowProps()} className="even:bg-gray-50">
                            {row.cells.map((cell) => (
                              <td
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
              )}
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
          <div className="flex items-center space-x-3">
            <span className="flex space-x-2 items-center">
              <span className="text-sm font-medium text-slate-600">Go</span>
              <input
                type="number"
                className="form-control py-2"
                min="1"
                max={totalPages}
                value={goToValue}
                onChange={(e) => setGoToValue(e.target.value)}
                onBlur={() => {
                  const page = Number(goToValue);
                  if (page >= 1 && page <= totalPages && page !== pageIndex) {
                    handleGoToPage(page);
                  } else {
                    setGoToValue(pageIndex);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const page = Number(goToValue);
                    if (page >= 1 && page <= totalPages && page !== pageIndex) {
                      handleGoToPage(page);
                    } else {
                      setGoToValue(pageIndex);
                    }
                  }
                }}
                style={{ width: "70px" }}
              />
            </span>
            <span className="text-sm font-medium text-slate-600">
              Page {pageIndex} of {totalPages}
            </span>
          </div>

          <ul className="flex items-center space-x-3">
            <li>
              <button
                onClick={() => handleGoToPage(1)}
                disabled={pageIndex === 1}
                className={pageIndex === 1 ? "opacity-50 cursor-not-allowed" : ""}
              >
                <Icon icon="heroicons:chevron-double-left-solid" />
              </button>
            </li>

            <li>
              <button
                onClick={() => handleGoToPage(pageIndex - 1)}
                disabled={pageIndex === 1}
                className={pageIndex === 1 ? "opacity-50 cursor-not-allowed" : ""}
              >
                Prev
              </button>
            </li>

            {(() => {
              const showPages = [];
              const total = totalPages;
              const current = pageIndex;

              if (total > 0) showPages.push(1);
              if (total > 1) showPages.push(2);
              if (current > 4) showPages.push("left-ellipsis");
              if (current > 2 && current < total - 1) showPages.push(current);
              if (current < total - 3) showPages.push("right-ellipsis");
              if (total > 2) showPages.push(total - 1);
              if (total > 1) showPages.push(total);

              const finalPages = [...new Set(
                showPages.filter(
                  (p) => (typeof p === "number" && p >= 1 && p <= total) || typeof p === "string"
                )
              )];

              return finalPages.map((p, idx) => (
                <li key={idx}>
                  {p === "left-ellipsis" || p === "right-ellipsis" ? (
                    <span className="text-slate-500 px-1">...</span>
                  ) : (
                    <button
                      className={`${
                        p === current
                          ? "bg-slate-900 text-white font-medium"
                          : "bg-slate-100 text-slate-900"
                      } text-sm rounded h-6 w-6 flex items-center justify-center`}
                      onClick={() => handleGoToPage(p)}
                    >
                      {p}
                    </button>
                  )}
                </li>
              ));
            })()}

            <li>
              <button
                onClick={() => handleGoToPage(pageIndex + 1)}
                disabled={pageIndex === totalPages}
                className={pageIndex === totalPages ? "opacity-50 cursor-not-allowed" : ""}
              >
                Next
              </button>
            </li>
            <li>
              <button
                onClick={() => handleGoToPage(totalPages)}
                disabled={pageIndex === totalPages}
                className={pageIndex === totalPages ? "opacity-50 cursor-not-allowed" : ""}
              >
                <Icon icon="heroicons:chevron-double-right-solid" />
              </button>
            </li>
          </ul>

          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-slate-600">Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageIndex(1);
              }}
              className="form-select py-2"
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Delete Modal */}
      <Modal
        activeModal={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Delete"
        themeClass="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]"
        centered
        footerContent={
          <>
            <Button text="Cancel" className="btn-light" onClick={() => setDeleteModalOpen(false)} />
            <Button
              text="Delete"
              className="btn-danger"
              onClick={async () => {
                await handleDelete(selectedId);
                setDeleteModalOpen(false);
              }}
            />
          </>
        }
      >
        <p className="text-gray-700 text-center">
          Are you sure you want to delete this record? This action cannot be undone.
        </p>
      </Modal>

      {/* CSV Upload Modal */}
      <CSVUploadModal
        activeModal={bulkUploadModalOpen}
        onClose={handleModalClose}
        title="Bulk Upload Purchased Electricity Records"
        csvState={csvState}
        onFileSelect={handleCSVFileSelect}
        onUpload={handleCSVUpload}
        onReset={resetUpload}
        onDownloadTemplate={downloadPurchasedElectricityTemplate}
        templateInstructions={templateInstructions}
        isLoading={csvState.uploading}
      />
    </>
  );
};

export default PurchasedElectricityListing;

