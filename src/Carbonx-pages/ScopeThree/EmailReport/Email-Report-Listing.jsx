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

// const EmailReportListing = () => {
//   const navigate = useNavigate();

//   // Server-side states
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [pageIndex, setPageIndex] = useState(1); // server-based pages start at 1
//   const [pageSize, setPageSize] = useState(10);

//   const [totalPages, setTotalPages] = useState(1);
//   const [totalRecords, setTotalRecords] = useState(0);

//   const [globalFilterValue, setGlobalFilterValue] = useState("");
//   const [debouncedSearch, setDebouncedSearch] = useState("");

//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [selectedId, setSelectedId] = useState(null);
//   const [goToValue, setGoToValue] = useState(pageIndex);

//   // Helper function to format recipients emails
//   const formatRecipients = (recipients) => {
//     if (!recipients || recipients.length === 0) return "N/A";

//     // Extract emails from recipients array
//     const emails = recipients.map(recipient => recipient.email);
//     return emails.join(", ");
//   };

//   // Helper function to get recipient status summary
//   const getRecipientStatusSummary = (recipients) => {
//     if (!recipients || recipients.length === 0) return "No recipients";

//     const filledCount = recipients.filter(r => r.filledstatus === "FILLED").length;
//     const notFilledCount = recipients.filter(r => r.filledstatus === "NOTFILLED").length;
//     const totalCount = recipients.length;

//     return `${filledCount} filled, ${notFilledCount} not filled of ${totalCount}`;
//   };

//   // Helper function to get overall status color
//   const getStatusColor = (status) => {
//     switch (status) {
//       case "COMPLETED":
//         return "bg-green-100 text-green-800";
//       case "SENT":
//         return "bg-blue-100 text-blue-800";
//       case "PENDING":
//         return "bg-yellow-100 text-yellow-800";
//       case "FAILED":
//         return "bg-red-100 text-red-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   // Helper function to format date
//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     try {
//       return new Date(dateString).toLocaleDateString('en-GB');
//     } catch {
//       return "Invalid Date";
//     }
//   };

//   // Helper function to format date with time
//   const formatDateTime = (dateString) => {
//     if (!dateString) return "N/A";
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-GB', {
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     } catch {
//       return "Invalid Date";
//     }
//   };

//   // Debounce search
//   useEffect(() => {
//     const delayDebounce = setTimeout(() => {
//       setDebouncedSearch(globalFilterValue);
//     }, 500);

//     return () => clearTimeout(delayDebounce);
//   }, [globalFilterValue]);

//   // Fetch data from server with pagination
//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(
//         `${process.env.REACT_APP_BASE_URL}/email/employee-commuting/user`,
//         {
//           params: {
//             page: pageIndex,
//             limit: pageSize,
//             search: debouncedSearch || "",
//           },
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       const data = res.data?.data || [];
//       const meta = res.data?.meta || {};

//       setRecords(data);
//       setTotalPages(meta.totalPages || 1);
//       setTotalRecords(meta.totalRecords || 0);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to fetch email records");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [pageIndex, pageSize, debouncedSearch]);

//   // Delete Record
//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`${process.env.REACT_APP_BASE_URL}/email/${id}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//       });
//       toast.success("Email record deleted successfully");
//       fetchData();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to delete email record");
//     }
//   };

//   // Columns
//   const COLUMNS = useMemo(
//     () => [
//       {
//         Header: "Sr.No",
//         id: "serialNo",
//         Cell: ({ row }) => <span>{(pageIndex - 1) * pageSize + row.index + 1}</span>,
//       },
//       {
//         Header: "Subject",
//         accessor: "subject",
//         Cell: ({ cell }) => cell.value || "N/A",
//       },
//       {
//         Header: "Recipients",
//         id: "recipientsEmails", // Add unique id
//         accessor: "recipients",
//         Cell: ({ cell }) => {
//           const recipients = cell.value;
//           if (!recipients || recipients.length === 0) return "N/A";

//           return (
//             <div className="flex flex-col space-y-1">
//               {recipients.map((recipient, index) => (
//                 <span key={index} className="text-sm">
//                   {recipient.email}
//                 </span>
//               ))}
//             </div>
//           );
//         },
//       },
//      {
//   Header: "Email Status",
//   id: "emailStatus",
//   accessor: "recipients",
//   Cell: ({ cell }) => {
//     const recipients = cell.value;
//     if (!recipients || recipients.length === 0) return "N/A";
    
//     const getEmailStatusConfig = (status) => {
//       switch (status) {
//         case "SENT":
//           return {
//              color: "bg-blue-100 text-blue-800 border-blue-200",
//              icon: "heroicons-outline:paper-airplane",
//              iconColor: "text-blue-600"
//           };
//         case "FAILED":
//           return {
//            color: "bg-red-100 text-red-800 border-red-200",
//           icon: "heroicons-outline:exclamation-circle",
//           iconColor: "text-red-600"
//           };
//         case "PENDING":
//           return {
//             color: "bg-amber-100 text-amber-800 border-amber-200",
//           icon: "heroicons-outline:clock",
//           iconColor: "text-amber-600"
//           };
//         default:
//           return {
//              color: "bg-slate-100 text-slate-800 border-slate-200",
//           icon: "heroicons-outline:information-circle",
//           iconColor: "text-slate-600"
//           };
//       }
//     };
    
//     return (
//       <div className="flex flex-col space-y-1">
//         {recipients.map((recipient, index) => {
//           const config = getEmailStatusConfig(recipient.status);
//           return (
//             <span 
//               key={index} 
//               className={`px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1 ${config.color}`}
//             >
//               <Icon icon={config.icon} className="w-4 h-4" />
//               {recipient.status}
//             </span>
//           );
//         })}
//       </div>
//     );
//   },
// },
//       {
//         Header: "Start Date & Time",
//         accessor: "startDateTime",
//         Cell: ({ cell }) => formatDateTime(cell.value),
//       },
//       {
//         Header: "End Date & Time",
//         accessor: "endDateTime",
//         Cell: ({ cell }) => formatDateTime(cell.value),
//       },
//       {
//         Header: "Min Employees Required",
//         accessor: "minEmployeesRequired",
//         Cell: ({ cell }) => cell.value || "N/A",
//       },
//       {
//         Header: "Total Employees",
//         accessor: "totalEmployees",
//         Cell: ({ cell }) => cell.value || "N/A",
//       },
//       {
//         Header: "Status",
//         accessor: "status",
//         Cell: ({ cell }) => (
//           <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cell.value)}`}>
//             {cell.value || "N/A"}
//           </span>
//         ),
//       },
//       {
//   Header: "Response Status",
//   id: "responseStatus",
//   accessor: "recipients",
//   Cell: ({ cell }) => {
//     const recipients = cell.value;
//     if (!recipients || recipients.length === 0) return "N/A";
    
//     const getFilledStatusConfig = (status) => {
//       switch (status) {
//         case "FILLED":
//           return {
//             color: "bg-green-100 text-green-800",
//             icon: "heroicons:check-circle"
//           };
//         case "NOTFILLED":
//           return {
//             color: "bg-orange-100 text-orange-800",
//             icon: "heroicons:exclamation-circle"
//           };
//         default:
//           return {
//             color: "bg-gray-100 text-gray-800",
//             icon: "heroicons:minus-circle"
//           };
//       }
//     };
    
//     return (
//       <div className="flex flex-col space-y-1">
//         {recipients.map((recipient, index) => {
//           const config = getFilledStatusConfig(recipient.filledstatus);
//           return (
//             <span 
//               key={index} 
//               className={`px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1 ${config.color}`}
//             >
//               <Icon icon={config.icon} className="w-4 h-4" />
//               {recipient.filledstatus}
//             </span>
//           );
//         })}
//       </div>
//     );
//   },
// },
//       {
//         Header: "Sent By",
//         accessor: "sentBy.name",
//         Cell: ({ cell }) => cell.value || "N/A",
//       },
//       {
//         Header: "Created At",
//         accessor: "createdAt",
//         Cell: ({ cell }) => formatDate(cell.value),
//       },
//       {
//         Header: "Updated At",
//         accessor: "updatedAt",
//         Cell: ({ cell }) => formatDate(cell.value),
//       },
//       // {
//       //   Header: "Actions",
//       //   accessor: "_id",
//       //   Cell: ({ cell }) => (
//       //     <div className="flex space-x-3 rtl:space-x-reverse">
//       //       <Tippy content="View">
//       //         <button
//       //           className="action-btn"
//       //           onClick={() =>
//       //             navigate(`/email-details/${cell.value}`, {
//       //               state: { mode: "view" },
//       //             })
//       //           }
//       //         >
//       //           <Icon icon="heroicons:eye" className="text-green-600" />
//       //         </button>
//       //       </Tippy>

//       //       <Tippy content="Resend">
//       //         <button
//       //           className="action-btn"
//       //           onClick={() => {
//       //             toast.info("Resend functionality to be implemented");
//       //           }}
//       //         >
//       //           <Icon icon="heroicons:paper-airplane" className="text-blue-600" />
//       //         </button>
//       //       </Tippy>

//       //       <Tippy content="Delete">
//       //         <button
//       //           className="action-btn"
//       //           onClick={() => {
//       //             setSelectedId(cell.value);
//       //             setDeleteModalOpen(true);
//       //           }}
//       //         >
//       //           <Icon icon="heroicons:trash" className="text-red-600" />
//       //         </button>
//       //       </Tippy>
//       //     </div>
//       //   ),
//       // },
//     ],
//     [pageIndex, pageSize]
//   );

//   const columns = useMemo(() => COLUMNS, [COLUMNS]);
//   const data = useMemo(() => records, [records]);

//   const tableInstance = useTable(
//     {
//       columns,
//       data,
//     },
//     useSortBy,
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

//   const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
//     tableInstance;

//   // Pagination handlers
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
//           <h6 className="flex-1 md:mb-0 ">Email Records</h6>

//           <div className="md:flex md:space-x-3 items-center">
//             <GlobalFilter filter={globalFilterValue} setFilter={setGlobalFilterValue} />

//             <Button
//               icon="heroicons-outline:paper-airplane"
//               text="Send New Email"
//               className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
//               onClick={() => navigate("/send-email")} // Update this path as needed
//             />
//           </div>
//         </div>

//         <div className="overflow-x-auto -mx-6">
//           <div className="inline-block min-w-full align-middle">
//             <div className="overflow-y-auto max-h-[calc(100vh-300px)] overflow-x-auto">
//               {loading ? (
//                 <div className="flex justify-center items-center py-8">
//                   <img src={Logo} alt="Loading..." className="w-52 h-24" />
//                 </div>
//               ) : (
//                 <table
//                   className="min-w-full divide-y divide-slate-100 table-fixed"
//                   {...getTableProps()}
//                 >
//                   <thead className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] sticky top-0 z-10">
//                     {headerGroups.map((headerGroup, index) => (
//                       <tr {...headerGroup.getHeaderGroupProps()} key={index}>
//                         {headerGroup.headers.map((column) => (
//                           <th
//                             {...column.getHeaderProps(column.getSortByToggleProps())}
//                             className="table-th text-white whitespace-nowrap"
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
//                     {rows.length === 0 ? (
//                       <tr>
//                         <td colSpan={COLUMNS.length + 1}>
//                           <div className="flex justify-center items-center py-16">
//                             <span className="text-gray-500 text-lg font-medium">
//                               No email records available.
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

//               // Always show first 2 pages
//               if (total > 0) showPages.push(1);
//               if (total > 1) showPages.push(2);
//               // Left ellipsis (... before current page)
//               if (current > 4) showPages.push("left-ellipsis");
//               // Current page
//               if (current > 2 && current < total - 1) showPages.push(current);
//               // Right ellipsis (... after current page)
//               if (current < total - 3) showPages.push("right-ellipsis");
//               // Always show last 2 pages
//               if (total > 2) showPages.push(total - 1);
//               if (total > 1) showPages.push(total);
//               // Remove duplicates + keep valid entries
//               const finalPages = [...new Set(
//                 showPages.filter(
//                   (p) => (typeof p === "number" && p >= 1 && p <= total) || typeof p === "string"
//                 )
//               )];

//               // Render pages
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
//               <button onClick={handleNextPage} disabled={pageIndex === totalPages}>
//                 Next
//               </button>
//             </li>

//             {/* Last Page */}
//             <li>
//               <button onClick={() => handleGoToPage(totalPages)} disabled={pageIndex === totalPages}>
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
//           Are you sure you want to delete this email record? This action cannot be undone.
//         </p>
//       </Modal>
//     </>
//   );
// };

// export default EmailReportListing;


import React, { useState, useEffect, useMemo } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Tippy from "@tippyjs/react";
import {
  useTable,
  useRowSelect,
  useSortBy,
} from "react-table";
import GlobalFilter from "@/pages/table/react-tables/GlobalFilter";
import Logo from "@/assets/images/logo/SrpLogo.png";
import Modal from "@/components/ui/Modal";

const IndeterminateCheckbox = React.forwardRef(({ indeterminate, ...rest }, ref) => {
  const defaultRef = React.useRef();
  const resolvedRef = ref || defaultRef;

  React.useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);

  return <input type="checkbox" ref={resolvedRef} {...rest} className="table-checkbox" />;
});

const EmailReportListing = () => {
  const navigate = useNavigate();

  // Server-side states
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pageIndex, setPageIndex] = useState(1); // server-based pages start at 1
  const [pageSize, setPageSize] = useState(10);

  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [goToValue, setGoToValue] = useState(pageIndex);

  // New states for recipients modal
  const [recipientsModalOpen, setRecipientsModalOpen] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [selectedEmailSubject, setSelectedEmailSubject] = useState("");

  // Helper function to format recipients emails
  const formatRecipients = (recipients) => {
    if (!recipients || recipients.length === 0) return "N/A";

    // Extract emails from recipients array
    const emails = recipients.map(recipient => recipient.email);
    if (emails.length <= 3) {
      return emails.join(", ");
    }
    return `${emails.length} recipients`;
  };

  // Helper function to get recipient status summary
  const getRecipientStatusSummary = (recipients) => {
    if (!recipients || recipients.length === 0) return "No recipients";

    const filledCount = recipients.filter(r => r.filledstatus === "FILLED").length;
    const notFilledCount = recipients.filter(r => r.filledstatus === "NOTFILLED").length;
    const totalCount = recipients.length;

    return `${filledCount} filled, ${notFilledCount} not filled of ${totalCount}`;
  };

  // Helper function to get overall status color
  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "SENT":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-GB');
    } catch {
      return "Invalid Date";
    }
  };

  // Helper function to format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Invalid Date";
    }
  };

  // Helper function to get filled status config
  const getFilledStatusConfig = (status) => {
    switch (status) {
      case "FILLED":
        return {
          color: "bg-green-100 text-green-800 border border-green-200",
          icon: "heroicons:check-circle",
          label: "FILLED"
        };
      case "NOTFILLED":
        return {
          color: "bg-orange-100 text-orange-800 border border-orange-200",
          icon: "heroicons:exclamation-circle",
          label: "NOT FILLED"
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border border-gray-200",
          icon: "heroicons:minus-circle",
          label: "UNKNOWN"
        };
    }
  };

  // Open recipients modal
  const openRecipientsModal = (recipients, subject) => {
    setSelectedRecipients(recipients || []);
    setSelectedEmailSubject(subject || "Recipients");
    setRecipientsModalOpen(true);
  };

  // Debounce search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearch(globalFilterValue);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [globalFilterValue]);

  // Fetch data from server with pagination
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/email/employee-commuting/user`,
        {
          params: {
            page: pageIndex,
            limit: pageSize,
            search: debouncedSearch || "",
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = res.data?.data || [];
      const meta = res.data?.meta || {};

      setRecords(data);
      setTotalPages(meta.totalPages || 1);
      setTotalRecords(meta.totalRecords || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch email records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize, debouncedSearch]);

  // Delete Record
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BASE_URL}/email/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Email record deleted successfully");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete email record");
    }
  };

  // Columns
  const COLUMNS = useMemo(
    () => [
      {
        Header: "Sr.No",
        id: "serialNo",
        Cell: ({ row }) => <span>{(pageIndex - 1) * pageSize + row.index + 1}</span>,
      },
      {
        Header: "Subject",
        accessor: "subject",
        Cell: ({ cell }) => cell.value || "N/A",
      },
      // {
      //   Header: "Recipients",
      //   id: "recipientsEmails",
      //   accessor: "recipients",
      //   Cell: ({ cell, row }) => {
      //     const recipients = cell.value;
      //     if (!recipients || recipients.length === 0) return "N/A";

      //     return (
      //       <div className="flex flex-col">
      //         <span className="text-sm">{formatRecipients(recipients)}</span>
      //         <span className="text-xs text-gray-500 mt-1">
      //           {getRecipientStatusSummary(recipients)}
      //         </span>
      //       </div>
      //     );
      //   },
      // },
      {
        Header: "Email Status",
        id: "emailStatus",
        accessor: "recipients",
        Cell: ({ cell }) => {
          const recipients = cell.value;
          if (!recipients || recipients.length === 0) return "N/A";

          const sentCount = recipients.filter(r => r.status === "SENT").length;
          const failedCount = recipients.filter(r => r.status === "FAILED").length;
          const pendingCount = recipients.filter(r => r.status === "PENDING").length;
          const totalCount = recipients.length;

          return (
            <div className="flex flex-col space-y-1">
              <span className="text-sm">
                {sentCount > 0 && <span className="text-blue-600">✓ {sentCount} sent</span>}
                {failedCount > 0 && <span className="text-red-600 ml-2">✗ {failedCount} failed</span>}
                {pendingCount > 0 && <span className="text-amber-600 ml-2">⏳ {pendingCount} pending</span>}
              </span>
              <span className="text-xs text-gray-500">{totalCount} total</span>
            </div>
          );
        },
      },
      {
        Header: "Start Date & Time",
        accessor: "startDateTime",
        Cell: ({ cell }) => formatDateTime(cell.value),
      },
      {
        Header: "End Date & Time",
        accessor: "endDateTime",
        Cell: ({ cell }) => formatDateTime(cell.value),
      },
      {
        Header: "Min Employees Required",
        accessor: "minEmployeesRequired",
        Cell: ({ cell }) => cell.value || "N/A",
      },
      {
        Header: "Total Employees",
        accessor: "totalEmployees",
        Cell: ({ cell }) => cell.value || "N/A",
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ cell }) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cell.value)}`}>
            {cell.value || "N/A"}
          </span>
        ),
      },
      {
        Header: "Response Status",
        id: "responseStatus",
        accessor: "recipients",
        Cell: ({ cell }) => {
          const recipients = cell.value;
          if (!recipients || recipients.length === 0) return "N/A";

          const filledCount = recipients.filter(r => r.filledstatus === "FILLED").length;
          const notFilledCount = recipients.filter(r => r.filledstatus === "NOTFILLED").length;
          const totalCount = recipients.length;

          return (
            <div className="flex flex-col space-y-1">
              <span className="text-sm">
                {filledCount > 0 && <span className="text-green-600">✓ {filledCount} filled</span>}
                {notFilledCount > 0 && <span className="text-orange-600 ml-2">✗ {notFilledCount} not filled</span>}
              </span>
              <span className="text-xs text-gray-500">{totalCount} total</span>
            </div>
          );
        },
      },
      {
        Header: "Sent By",
        accessor: "sentBy.name",
        Cell: ({ cell }) => cell.value || "N/A",
      },
      {
        Header: "Created At",
        accessor: "createdAt",
        Cell: ({ cell }) => formatDate(cell.value),
      },
      {
        Header: "Updated At",
        accessor: "updatedAt",
        Cell: ({ cell }) => formatDate(cell.value),
      },
      {
        Header: "Actions",
        accessor: "_id",
        Cell: ({ cell, row }) => {
          const recipients = row.original.recipients || [];
          const subject = row.original.subject || "Recipients";
          
          return (
            <div className="flex space-x-3 rtl:space-x-reverse">
              {/* View Recipients Button */}
              <Tippy content="View Recipients">
                <button
                  className="action-btn"
                  onClick={() => openRecipientsModal(recipients, subject)}
                  disabled={!recipients || recipients.length === 0}
                >
                  <Icon icon="heroicons:user-group" className="text-purple-600" />
                </button>
              </Tippy>

              <Tippy content="View Email">
                <button
                  className="action-btn"
                  onClick={() =>
                    navigate(`/email-details/${cell.value}`, {
                      state: { mode: "view" },
                    })
                  }
                >
                  <Icon icon="heroicons:eye" className="text-green-600" />
                </button>
              </Tippy>

              <Tippy content="Resend">
                <button
                  className="action-btn"
                  onClick={() => {
                    toast.info("Resend functionality to be implemented");
                  }}
                >
                  <Icon icon="heroicons:paper-airplane" className="text-blue-600" />
                </button>
              </Tippy>

              <Tippy content="Delete">
                <button
                  className="action-btn"
                  onClick={() => {
                    setSelectedId(cell.value);
                    setDeleteModalOpen(true);
                  }}
                >
                  <Icon icon="heroicons:trash" className="text-red-600" />
                </button>
              </Tippy>
            </div>
          );
        },
      },
    ],
    [pageIndex, pageSize, navigate]
  );

  const columns = useMemo(() => COLUMNS, [COLUMNS]);
  const data = useMemo(() => records, [records]);

  const tableInstance = useTable(
    {
      columns,
      data,
    },
    useSortBy,
    useRowSelect,
    (hooks) => {
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
    }
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  // Pagination handlers
  const handleGoToPage = (page) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setPageIndex(page);
  };

  const handlePrevPage = () => handleGoToPage(pageIndex - 1);
  const handleNextPage = () => handleGoToPage(pageIndex + 1);

  return (
    <>
      <Card noborder>
        <div className="md:flex pb-6 items-center">
          <h6 className="flex-1 md:mb-0 ">Email Records</h6>

          <div className="md:flex md:space-x-3 items-center">
            {/* <GlobalFilter filter={globalFilterValue} setFilter={setGlobalFilterValue} /> */}
            {/* <Button
              icon="heroicons-outline:paper-airplane"
              text="Send New Email"
              className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
              onClick={() => navigate("/send-email")}
            /> */}
          </div>
        </div>

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
                  <tbody {...getTableBodyProps()}>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={COLUMNS.length + 1}>
                          <div className="flex justify-center items-center py-16">
                            <span className="text-gray-500 text-lg font-medium">
                              No email records available.
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

        {/* CUSTOM PAGINATION UI (SERVER SIDE) */}
        <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
          {/* LEFT SECTION – Go To Page */}
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

          {/* MIDDLE SECTION – Full Pagination */}
          <ul className="flex items-center space-x-3">

            {/* First Page */}
            <li>
              <button
                onClick={() => handleGoToPage(1)}
                disabled={pageIndex === 1}
              >
                <Icon icon="heroicons:chevron-double-left-solid" />
              </button>
            </li>

            {/* Prev */}
            <li>
              <button
                onClick={handlePrevPage}
                disabled={pageIndex === 1}
              >
                Prev
              </button>
            </li>

            {/* Truncated Pagination */}
            {(() => {
              const showPages = [];
              const total = totalPages;
              const current = pageIndex;

              // Always show first 2 pages
              if (total > 0) showPages.push(1);
              if (total > 1) showPages.push(2);
              // Left ellipsis (... before current page)
              if (current > 4) showPages.push("left-ellipsis");
              // Current page
              if (current > 2 && current < total - 1) showPages.push(current);
              // Right ellipsis (... after current page)
              if (current < total - 3) showPages.push("right-ellipsis");
              // Always show last 2 pages
              if (total > 2) showPages.push(total - 1);
              if (total > 1) showPages.push(total);
              // Remove duplicates + keep valid entries
              const finalPages = [...new Set(
                showPages.filter(
                  (p) => (typeof p === "number" && p >= 1 && p <= total) || typeof p === "string"
                )
              )];

              // Render pages
              return finalPages.map((p, idx) => (
                <li key={idx}>
                  {p === "left-ellipsis" || p === "right-ellipsis" ? (
                    <span className="text-slate-500 px-1">...</span>
                  ) : (
                    <button
                      className={`${p === current
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

            {/* Next */}
            <li>
              <button onClick={handleNextPage} disabled={pageIndex === totalPages}>
                Next
              </button>
            </li>

            {/* Last Page */}
            <li>
              <button onClick={() => handleGoToPage(totalPages)} disabled={pageIndex === totalPages}>
                <Icon icon="heroicons:chevron-double-right-solid" />
              </button>
            </li>
          </ul>

          {/* RIGHT SECTION – Show page size */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-slate-600">Show</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
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

      {/* DELETE MODAL */}
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
          Are you sure you want to delete this email record? This action cannot be undone.
        </p>
      </Modal>

      {/* RECIPIENTS MODAL */}
      <Modal
        activeModal={recipientsModalOpen}
        onClose={() => setRecipientsModalOpen(false)}
        title={`Recipients - ${selectedEmailSubject}`}
        themeClass="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]"
        centered
        size="lg"
        footerContent={
          <Button 
            text="Close" 
            className="btn-dark" 
            onClick={() => setRecipientsModalOpen(false)} 
          />
        }
      >
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
            <div>
              <span className="text-sm font-medium text-gray-700">
                Total Recipients: {selectedRecipients.length}
              </span>
            </div>
            <div className="flex space-x-4">
              <div className="text-center">
                <div className="text-green-600 font-semibold">
                  {selectedRecipients.filter(r => r.filledstatus === "FILLED").length}
                </div>
                <div className="text-xs text-gray-500">Filled</div>
              </div>
              <div className="text-center">
                <div className="text-orange-600 font-semibold">
                  {selectedRecipients.filter(r => r.filledstatus === "NOTFILLED").length}
                </div>
                <div className="text-xs text-gray-500">Not Filled</div>
              </div>
            </div>
          </div>

          {/* Recipients Table */}
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sr. No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedRecipients.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                      No recipients available
                    </td>
                  </tr>
                ) : (
                  selectedRecipients.map((recipient, index) => {
                    const filledConfig = getFilledStatusConfig(recipient.filledstatus);
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {recipient.email || "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span 
                            className={`px-3 py-1.5 rounded text-xs font-medium inline-flex items-center gap-2 ${filledConfig.color}`}
                          >
                            <Icon icon={filledConfig.icon} className="w-4 h-4" />
                            {filledConfig.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Simple Summary */}
          {selectedRecipients.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon icon="heroicons:information-circle" className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Showing {selectedRecipients.length} recipient(s)
                </span>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default EmailReportListing;