// import React, { useState, useMemo, useEffect } from "react";
// import Card from "@/components/ui/Card";
// import Icon from "@/components/ui/Icon";
// import Dropdown from "@/components/ui/Dropdown";
// import Button from "@/components/ui/Button";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import {
//   useTable,
//   useRowSelect,
//   useSortBy,
//   useGlobalFilter,
//   usePagination,
// } from "react-table";
// import GlobalFilter from "../table/react-tables/GlobalFilter";
// import { Menu } from "@headlessui/react";
// import { useSelector } from "react-redux";
// import Icons from "@/components/ui/Icon";
// import Tippy from "@tippyjs/react";

// const IndeterminateCheckbox = React.forwardRef(
//   ({ indeterminate, ...rest }, ref) => {
//     const defaultRef = React.useRef();
//     const resolvedRef = ref || defaultRef;

//     React.useEffect(() => {
//       resolvedRef.current.indeterminate = indeterminate;
//     }, [resolvedRef, indeterminate]);

//     return (
//       <>
//         <input
//           type="checkbox"
//           ref={resolvedRef}
//           {...rest}
//           className="table-checkbox"
//         />
//       </>
//     );
//   }
// );

// const UserPage = () => {
//   const navigate = useNavigate();
//   const [userData, setUserData] = useState([]);
//   const [pageIndex, setPageIndex] = useState(0);
//   const [pageSize, setPageSize] = useState(10);
//   const [total, setTotal] = useState(0);
//   const [totalPages, setTotalPages] = useState(1);
//   const [hasNextPage, setHasNextPage] = useState(false);
//   const user = useSelector((state) => state.auth.user);
//   const [loading, setLoading] = useState(true);

//   const fetchData = async (pageIndex, pageSize) => {
//     try {
//       setLoading(true);

//       const response = await axios.get(
//         `${process.env.REACT_APP_BASE_URL}/auth/GetCompanyUsers`,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//           params: {
//             page: pageIndex + 1, // Convert to 1-based for API
//             limit: pageSize,
//           },
//         }
//       );

//       console.log("API RESPONSE:", response.data);

//       // Set data from API response
//       const users = response.data.data.users || [];
//       const pagination = response.data.pagination || {};

//       setUserData(users);
//       setTotal(pagination.total || 0);
//       setTotalPages(pagination.totalPages || 1);
//       setHasNextPage(pagination.hasNextPage || false);

//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to fetch users");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch data when page or page size changes
//   useEffect(() => {
//     fetchData(pageIndex, pageSize);
//   }, [pageIndex, pageSize]);

//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`${process.env.REACT_APP_BASE_URL}/${user.type}/user/delete-user/${id}`, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });
//       toast.success("User deleted successfully");
//       fetchData(pageIndex, pageSize); // Refresh current page
//     } catch (error) {
//       console.log(error);
//       toast.error("Failed to delete user");
//     }
//   };

//   const handleChangeStatus = async (id, newStatus) => {
//     try {
//       const response = await fetch(`${process.env.REACT_APP_BASE_URL}/admin/user/change-status/${id}`, {
//         method: 'PUT',
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//         body: JSON.stringify({ status: newStatus }),
//       });
//       if (response.ok) {
//         setUserData(prevUsers =>
//           prevUsers.map(user =>
//             user._id === id ? { ...user, status: newStatus } : user
//           )
//         );
//         toast.success("User status updated");
//       } else {
//         console.error('Failed to update user status');
//         toast.error('Failed to update user status');
//       }
//     } catch (error) {
//       console.error('Error updating user status:', error);
//       toast.error('Error updating user status');
//     }
//   };

//   const COLUMNS = [
//     {
//       Header: "Sr.No",
//       accessor: "id",
//       Cell: ({ row }) => <span>{pageIndex * pageSize + row.index + 1}</span>, // Fixed serial number calculation
//     },
//     {
//       Header: "Name",
//       accessor: "name",
//       Cell: (row) => <span>{row?.cell?.value || "N/A"}</span>,
//     },
//     {
//       Header: "Employee ID",
//       accessor: "employeeID",
//       Cell: (row) => <span>{row?.cell?.value || "N/A"}</span>,
//     },
//     {
//       Header: "Email",
//       accessor: "email",
//       Cell: (row) => <span className="lowercase">{row?.cell?.value}</span>,
//     },
//     {
//       Header: "Active",
//       accessor: "isActive",
//       Cell: (row) => (
//         <span className={`inline-block px-3 py-1 rounded-[999px] text-center ${row?.cell?.value ? "bg-success-500 text-white" : "bg-warning-500 text-white"
//           }`}>
//           {row?.cell?.value ? "Active" : "Inactive"}
//         </span>
//       ),
//     },
//     {
//       Header: "Email Verified",
//       accessor: "isEmailValid",
//       Cell: (row) => (
//         <span className={`inline-block px-3 py-1 rounded-[999px] text-center ${row?.cell?.value ? "bg-success-500 text-white" : "bg-warning-500 text-white"
//           }`}>
//           {row?.cell?.value ? "Verified" : "Not Verified"}
//         </span>
//       ),
//     },
//     {
//       Header: "Company",
//       accessor: "companyId.companyName",
//       Cell: (row) => <span>{row?.cell?.value || "-"}</span>,
//     },
//     { 
//       Header: "Created At", 
//       accessor: "createdAt", 
//       Cell: ({ cell }) => (cell.value ? new Date(cell.value).toLocaleDateString() : "N/A") 
//     },
//     {
//       Header: "Updated At",
//       accessor: "updatedAt",
//       Cell: ({ cell }) => (cell.value ? new Date(cell.value).toLocaleDateString() : "N/A")
//     },
//     {
//       Header: "Action",
//       accessor: "_id",
//       Cell: ({ cell }) => (
//         <div className="flex space-x-3 rtl:space-x-reverse">
//           <Tippy content="View">
//             <button className="action-btn" onClick={() => navigate(`/Employee-View/${cell.value}`)}>
//               <Icon className="text-green-600" icon="heroicons:eye" />
//             </button>
//           </Tippy>
//           <Tippy content="Edit">
//             <button className="action-btn" onClick={() => navigate(`/Employee-edit/${cell.value}`)}>
//               <Icon className="text-blue-600" icon="heroicons:pencil-square" />
//             </button>
//           </Tippy>
//         </div>
//       ),
//     },
//   ];

//   const columns = useMemo(() => COLUMNS, [pageIndex, pageSize]);
//   const data = useMemo(() => userData, [userData]);

//   const tableInstance = useTable(
//     {
//       columns,
//       data,
//       manualPagination: true,
//       pageCount: totalPages, // Use totalPages from API
//       initialState: {
//         pageIndex,
//         pageSize,
//       },
//     },
//     useGlobalFilter,
//     useSortBy,
//     useRowSelect,
//     (hooks) => {
//       hooks.visibleColumns.push((columns) => [
//         {
//           id: "selection",
//           Header: ({ getToggleAllRowsSelectedProps }) => (
//             <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
//           ),
//           Cell: ({ row }) => (
//             <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
//           ),
//         },
//         ...columns,
//       ]);
//     }
//   );

//   const {
//     getTableProps,
//     getTableBodyProps,
//     headerGroups,
//     pageOptions,
//     canPreviousPage,
//     pageCount: tablePageCount,
//     rows,
//     state,
//     gotoPage,
//     setGlobalFilter,
//     prepareRow,
//   } = tableInstance;

//   const { globalFilter, pageIndex: currentPageIndex, pageSize: currentPageSize } = state;

//   // Sync React Table's page index with our state
//   useEffect(() => {
//     if (currentPageIndex !== pageIndex) {
//       setPageIndex(currentPageIndex);
//     }
//   }, [currentPageIndex]);

//   // Sync React Table's page size with our state
//   useEffect(() => {
//     if (currentPageSize !== pageSize) {
//       setPageSize(currentPageSize);
//     }
//   }, [currentPageSize]);

//   const handlePageChange = (newPageIndex) => {
//     gotoPage(newPageIndex);
//     setPageIndex(newPageIndex);
//   };

//   const handlePageSizeChange = (newPageSize) => {
//     setPageSize(newPageSize);
//     setPageIndex(0);
//     gotoPage(0);
//   };

//   if (loading && pageIndex === 0) {
//     return <div>Loading Employee...</div>;
//   }

//   return (
//     <>
//       <Card noborder>
//         <div className="md:flex pb-6 items-center">
//           <h6 className="flex-1 md:mb-0">Employee</h6>
//           <div className="md:flex md:space-x-3 items-center flex-none rtl:space-x-reverse">
//             <Button
//               text="Employee Email Record"
//               className="btn-dark font-normal btn-sm h-9"
//               iconClass="text-lg"
//               onClick={() => {
//                 navigate("/Email-Reporting");
//               }}
//             />
//             <Button
//               icon="heroicons:plus"
//               text="Add Employee"
//               className="btn-dark font-normal btn-sm"
//               iconClass="text-lg"
//               onClick={() => {
//                 navigate("/Employee-add");
//               }}
//             />
//           </div>
//         </div>

//         <div className="overflow-x-auto -mx-6">
//           <div className="inline-block min-w-full align-middle">
//             <div className="overflow-y-auto max-h-[calc(100vh-300px)] overflow-x-auto">
//               {loading ? (
//                 <div className="flex justify-center items-center py-8">
//                   <div className="text-gray-500">Loading...</div>
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
//                               No data available.
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

//         <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
//           <div className="flex items-center space-x-3 rtl:space-x-reverse">
//             <span className="flex space-x-2 rtl:space-x-reverse items-center">
//               <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Go</span>
//               <span>
//                 <input
//                   type="number"
//                   className="form-control py-2"
//                   defaultValue={pageIndex + 1}
//                   onChange={(e) => {
//                     const pageNumber = e.target.value ? Number(e.target.value) - 1 : 0;
//                     if (pageNumber >= 0 && pageNumber < totalPages) {
//                       handlePageChange(pageNumber);
//                     }
//                   }}
//                   style={{ width: "70px" }}
//                 />
//               </span>
//             </span>
//             <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
//               Page <span>{pageIndex + 1} of {totalPages}</span>
//             </span>
//             <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
//               Total Records: {total}
//             </span>
//           </div>
//           <ul className="flex items-center space-x-3 rtl:space-x-reverse">
//             <li className="text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180">
//               <button
//                 className={`${!canPreviousPage ? "opacity-50 cursor-not-allowed" : ""}`}
//                 onClick={() => handlePageChange(0)}
//                 disabled={!canPreviousPage}
//               >
//                 <Icons icon="heroicons:chevron-double-left-solid" />
//               </button>
//             </li>
//             <li className="text-sm leading-4 text-slate-900 dark:text-white rtl:rotate-180">
//               <button
//                 className={`${!canPreviousPage ? "opacity-50 cursor-not-allowed" : ""}`}
//                 onClick={() => handlePageChange(pageIndex - 1)}
//                 disabled={!canPreviousPage}
//               >
//                 Prev
//               </button>
//             </li>

//             {/* Show page numbers with ellipsis for better UX */}
//             {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//               let pageNum;
//               if (totalPages <= 5) {
//                 pageNum = i;
//               } else if (pageIndex < 3) {
//                 pageNum = i;
//               } else if (pageIndex > totalPages - 4) {
//                 pageNum = totalPages - 5 + i;
//               } else {
//                 pageNum = pageIndex - 2 + i;
//               }

//               return (
//                 <li key={pageNum}>
//                   <button
//                     className={`${pageNum === pageIndex
//                       ? "bg-slate-900 text-white"
//                       : "bg-slate-100 text-slate-900"
//                       } text-sm rounded h-6 w-6 flex items-center justify-center`}
//                     onClick={() => handlePageChange(pageNum)}
//                   >
//                     {pageNum + 1}
//                   </button>
//                 </li>
//               );
//             })}

//             <li className="text-sm leading-4 text-slate-900 dark:text-white rtl:rotate-180">
//               <button
//                 className={`${!hasNextPage ? "opacity-50 cursor-not-allowed" : ""}`}
//                 onClick={() => handlePageChange(pageIndex + 1)}
//                 disabled={!hasNextPage}
//               >
//                 Next
//               </button>
//             </li>
//             <li className="text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180">
//               <button
//                 onClick={() => handlePageChange(totalPages - 1)}
//                 disabled={!hasNextPage}
//                 className={`${!hasNextPage ? "opacity-50 cursor-not-allowed" : ""}`}
//               >
//                 <Icon icon="heroicons:chevron-double-right-solid" />
//               </button>
//             </li>
//           </ul>
//           <div className="flex items-center space-x-3 rtl:space-x-reverse">
//             <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Show</span>
//             <select
//               value={pageSize}
//               onChange={(e) => handlePageSizeChange(Number(e.target.value))}
//               className="form-select py-2"
//             >
//               {[10, 20, 30, 40, 50].map((size) => (
//                 <option key={size} value={size}>
//                   {size}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </Card>
//     </>
//   );
// };

// export default UserPage;


import React, { useState, useMemo, useEffect, useRef } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import axios from "axios";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  useTable,
  useRowSelect,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import { useSelector } from "react-redux";
import Icons from "@/components/ui/Icon";
import Tippy from "@tippyjs/react";

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <>
        <input
          type="checkbox"
          ref={resolvedRef}
          {...rest}
          className="table-checkbox"
        />
      </>
    );
  }
);

const BulkImportModal = ({ isOpen, onClose, onImportComplete }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, errors: [] });
  const [step, setStep] = useState("upload"); // upload | preview | result
  const fileInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const companyId = user?.companyId;

  const REQUIRED_COLUMNS = ["name", "email", "password", "employeeID", "companyId", "buildingCode"];

  const resetModal = () => {
    setFile(null);
    setPreview([]);
    setProgress({ done: 0, total: 0, errors: [] });
    setStep("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  // Download sample template
  const downloadTemplate = () => {
    const sampleData = [
      {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "SecurePass123",
        employeeID: "EMP001",
        // companyId: "COMPANY_MONGO_ID",
        buildingCode: "BLD-001",
      },
      {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        password: "SecurePass456",
        employeeID: "EMP002",
        // companyId: "COMPANY_MONGO_ID",
        buildingCode: "BLD-002",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);

    // Style the header row
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "3AB89D" } },
      alignment: { horizontal: "center" },
    };
    ["A1", "B1", "C1", "D1", "E1", "F1"].forEach((cell) => {
      if (ws[cell]) ws[cell].s = headerStyle;
    });

    // Column widths
    ws["!cols"] = [
      { wch: 20 }, { wch: 30 }, { wch: 20 },
      { wch: 15 }, { wch: 30 }, { wch: 15 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.writeFile(wb, "Employee_Import_Template.xlsx");
    toast.success("Template downloaded!");
  };

  // Parse uploaded file
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    const ext = selectedFile.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext)) {
      toast.error("Please upload a valid Excel (.xlsx, .xls) or CSV file");
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (jsonData.length === 0) {
          toast.error("The file is empty or has no data rows.");
          return;
        }

        // Validate columns
        const fileColumns = Object.keys(jsonData[0]).map((c) => c.trim().toLowerCase());
        const missing = REQUIRED_COLUMNS.filter(
          (col) => !fileColumns.includes(col.toLowerCase())
        );
        if (missing.length > 0) {
          toast.error(`Missing required columns: ${missing.join(", ")}`);
          return;
        }

        // Normalize keys
        const normalized = jsonData.map((row) => {
          const newRow = {};
          Object.keys(row).forEach((key) => {
            newRow[key.trim()] = row[key];
          });
          return newRow;
        });

        setPreview(normalized);
        setStep("preview");
      } catch (err) {
        console.error(err);
        toast.error("Failed to parse file. Please use the provided template.");
      }
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  // Import rows one-by-one
  const handleImport = async () => {
    setImporting(true);
    const errors = [];
    let done = 0;
    const total = preview.length;
    setProgress({ done: 0, total, errors: [] });

    for (const row of preview) {
      try {
        // Encrypt password (simple base64 — replace with your actual encryption)
        const encryptedPassword = btoa(String(row.password));

        await axios.post(
          `${process.env.REACT_APP_BASE_URL}/auth/register`,
          {
            name: row.name,
            email: String(row.email).toLowerCase().trim(),
            password: encryptedPassword,
            companyId: companyId,
            buildingCode: row.buildingCode, // send building code; backend resolves to buildingId
            employeeID: row.employeeID,
            type: "user",
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        done++;
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unknown error";
        errors.push({ row: row.email || row.employeeID, error: msg });
        done++;
      }
      setProgress({ done, total, errors: [...errors] });
    }

    setImporting(false);
    setStep("result");
    const successCount = total - errors.length;
    if (successCount > 0) {
      toast.success(`${successCount} employee(s) imported successfully!`);
      onImportComplete();
    }
    if (errors.length > 0) {
      toast.error(`${errors.length} row(s) failed. Check the report below.`);
    }
  };

  // Export error report
  const downloadErrorReport = () => {
    const ws = XLSX.utils.json_to_sheet(
      progress.errors.map((e) => ({ Employee: e.row, Error: e.error }))
    );
    ws["!cols"] = [{ wch: 30 }, { wch: 60 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Errors");
    XLSX.writeFile(wb, "Import_Errors.xlsx");
  };

  if (!isOpen) return null;

  const successCount = progress.total - progress.errors.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]">
          <div className="flex items-center space-x-3">
            <Icon icon="heroicons:arrow-up-tray" className="text-white text-2xl" />
            <div>
              <h3 className="text-white font-semibold text-lg">Bulk Import Employees</h3>
              <p className="text-white/80 text-xs">Upload Excel or CSV to add multiple employees at once</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-white/80 hover:text-white transition-colors">
            <Icon icon="heroicons:x-mark" className="text-2xl" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ── Step 1: Upload ── */}
          {step === "upload" && (
            <div className="space-y-6">
              {/* Required columns info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-blue-800 font-medium text-sm mb-2 flex items-center gap-2">
                  <Icon icon="heroicons:information-circle" className="text-lg" />
                  Required Columns
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {REQUIRED_COLUMNS.map((col) => (
                    <span
                      key={col}
                      className="bg-blue-100 text-blue-700 text-xs font-mono px-2 py-1 rounded-md"
                    >
                      {col}
                    </span>
                  ))}
                </div>
                <p className="text-blue-600 text-xs mt-2">
                  <strong>buildingCode</strong> — use your building's unique code (e.g. BLD-001). The system will resolve it to the correct building automatically.
                </p>
              </div>

              {/* Download template */}
              <button
                onClick={downloadTemplate}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#3AB89D] rounded-xl py-3 text-[#3AB89D] font-medium hover:bg-[#3AB89D]/5 transition-colors"
              >
                <Icon icon="heroicons:arrow-down-tray" className="text-lg" />
                Download Sample Template (.xlsx)
              </button>

              {/* Drop zone */}
              <div
                className="relative border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:border-[#3AB89D] hover:bg-slate-50 transition-all cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dt = e.dataTransfer.files[0];
                  if (dt) {
                    fileInputRef.current.files = e.dataTransfer.files;
                    handleFileChange({ target: { files: [dt] } });
                  }
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                />
                <Icon icon="heroicons:cloud-arrow-up" className="text-5xl text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">Drag & drop your file here</p>
                <p className="text-slate-400 text-sm mt-1">or click to browse</p>
                <p className="text-slate-400 text-xs mt-3">.xlsx, .xls, .csv supported</p>
              </div>
            </div>
          )}

          {/* ── Step 2: Preview ── */}
          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-slate-700 font-semibold">
                  Preview — {preview.length} row(s) found
                </p>
                <button
                  onClick={() => { setStep("upload"); setPreview([]); setFile(null); }}
                  className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                >
                  <Icon icon="heroicons:arrow-left" /> Change file
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-slate-600 font-medium">#</th>
                      {REQUIRED_COLUMNS.map((col) => (
                        <th key={col} className="px-3 py-2 text-left text-slate-600 font-medium capitalize">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {preview.slice(0, 10).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                        {REQUIRED_COLUMNS.map((col) => (
                          <td key={col} className="px-3 py-2 text-slate-700 max-w-[150px] truncate">
                            {col === "password" ? "••••••••" : (row[col] || "-")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 10 && (
                  <p className="text-center text-slate-400 text-xs py-2 border-t border-slate-100">
                    ... and {preview.length - 10} more row(s)
                  </p>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 text-amber-700 text-sm">
                <Icon icon="heroicons:exclamation-triangle" className="text-lg flex-shrink-0 mt-0.5" />
                <span>
                  Review the data carefully before importing. This action will create {preview.length} new employee account(s).
                </span>
              </div>
            </div>
          )}

          {/* ── Step 3: Importing / Result ── */}
          {step === "result" && (
            <div className="space-y-6">
              {importing && (
                <div className="text-center py-6">
                  <div className="inline-block w-12 h-12 border-4 border-[#3AB89D] border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-slate-600 font-medium">
                    Importing {progress.done} / {progress.total}...
                  </p>
                  <div className="mt-3 w-full bg-slate-100 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${(progress.done / progress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {!importing && (
                <>
                  {/* Summary cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-green-600">{successCount}</p>
                      <p className="text-green-700 text-sm mt-1">Imported Successfully</p>
                    </div>
                    <div className={`border rounded-xl p-4 text-center ${progress.errors.length > 0 ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}>
                      <p className={`text-3xl font-bold ${progress.errors.length > 0 ? "text-red-500" : "text-slate-400"}`}>
                        {progress.errors.length}
                      </p>
                      <p className={`text-sm mt-1 ${progress.errors.length > 0 ? "text-red-600" : "text-slate-500"}`}>Failed</p>
                    </div>
                  </div>

                  {/* Error list */}
                  {progress.errors.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-700 font-medium text-sm">Failed Rows</p>
                        <button
                          onClick={downloadErrorReport}
                          className="text-xs text-[#3AB89D] hover:underline flex items-center gap-1"
                        >
                          <Icon icon="heroicons:arrow-down-tray" /> Download Error Report
                        </button>
                      </div>
                      <div className="rounded-xl border border-red-200 overflow-hidden max-h-52 overflow-y-auto">
                        {progress.errors.map((e, i) => (
                          <div key={i} className="flex gap-3 px-4 py-2.5 border-b border-red-100 last:border-0 bg-red-50/40 text-sm">
                            <span className="text-slate-600 font-medium min-w-[140px] truncate">{e.row}</span>
                            <span className="text-red-600">{e.error}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
          >
            {step === "result" ? "Close" : "Cancel"}
          </button>

          <div className="flex gap-3">
            {step === "preview" && (
              <button
                onClick={handleImport}
                disabled={importing}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                <Icon icon="heroicons:arrow-up-tray" />
                Import {preview.length} Employee(s)
              </button>
            )}

            {step === "result" && progress.errors.length > 0 && successCount === 0 && (
              <button
                onClick={resetModal}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                <Icon icon="heroicons:arrow-path" />
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main UserPage ────────────────────────────────────────────────────────────
const UserPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showImportModal, setShowImportModal] = useState(false);
  const user = useSelector((state) => state.auth.user);

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [canNextPage, setCanNextPage] = useState(false);
  const [canPreviousPage, setCanPreviousPage] = useState(false);

  // Fetch data from server
  const fetchData = async (page, size) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/auth/GetCompanyUsers`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params: {
            page: page + 1,
            limit: size,
          },
        }
      );

      const users = response.data?.data?.users || [];
      const pagination =
        response.data?.data?.pagination || response.data?.pagination || {};

      setUserData(users);
      setTotalRecords(pagination.total || 0);
      setPageCount(pagination.totalPages || 1);
      setCanNextPage(pagination.hasNextPage || false);
      setCanPreviousPage(pagination.hasPreviousPage || false);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
      setUserData([]);
      setTotalRecords(0);
      setPageCount(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(pageIndex, pageSize);
  }, [pageIndex, pageSize]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_BASE_URL}/auth/DeleteUser/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("User deleted successfully");
      fetchData(pageIndex, pageSize);
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete user");
    }
  };

  const COLUMNS = [
    {
      Header: "Sr.No",
      accessor: "id",
      Cell: ({ row }) => <span>{pageIndex * pageSize + row.index + 1}</span>,
    },
    {
      Header: "Name",
      accessor: "name",
      Cell: (row) => <span>{row?.cell?.value || "N/A"}</span>,
    },
    {
      Header: "Employee ID",
      accessor: "employeeID",
      Cell: (row) => <span>{row?.cell?.value || "N/A"}</span>,
    },
    {
      Header: "Email",
      accessor: "email",
      Cell: (row) => (
        <span className="lowercase">{row?.cell?.value}</span>
      ),
    },
    {
      Header: "Active",
      accessor: "isActive",
      Cell: (row) => (
        <span
          className={`inline-block px-3 py-1 rounded-[999px] text-center ${row?.cell?.value
            ? "bg-success-500 text-white"
            : "bg-warning-500 text-white"
            }`}
        >
          {row?.cell?.value ? "Active" : "Inactive"}
        </span>
      ),
    },
    // {
    //   Header: "Email Verified",
    //   accessor: "isEmailValid",
    //   Cell: (row) => (
    //     <span
    //       className={`inline-block px-3 py-1 rounded-[999px] text-center ${row?.cell?.value
    //         ? "bg-success-500 text-white"
    //         : "bg-warning-500 text-white"
    //         }`}
    //     >
    //       {row?.cell?.value ? "Verified" : "Not Verified"}
    //     </span>
    //   ),
    // },
    {
      Header: "Company",
      accessor: "companyId.companyName",
      Cell: (row) => <span>{row?.cell?.value || "-"}</span>,
    },
    {
      Header: "Created At",
      accessor: "createdAt",
      Cell: ({ cell }) =>
        cell.value ? new Date(cell.value).toLocaleDateString() : "N/A",
    },
    {
      Header: "Updated At",
      accessor: "updatedAt",
      Cell: ({ cell }) =>
        cell.value ? new Date(cell.value).toLocaleDateString() : "N/A",
    },
    {
      Header: "Action",
      accessor: "_id",
      Cell: ({ cell }) => (
        <div className="flex space-x-3 rtl:space-x-reverse">
          <Tippy content="View">
            <button
              className="action-btn"
              onClick={() => navigate(`/Employee-View/${cell.value}`)}
            >
              <Icon className="text-green-600" icon="heroicons:eye" />
            </button>
          </Tippy>
          <Tippy content="Edit">
            <button
              className="action-btn"
              onClick={() => navigate(`/Employee-edit/${cell.value}`)}
            >
              <Icon className="text-blue-600" icon="heroicons:pencil-square" />
            </button>
          </Tippy>
          <Tippy content="Delete">
            <button
              className="action-btn"
              onClick={() => handleDelete(cell.value)}
            >
              <Icon className="text-red-300" icon="heroicons:trash-solid" />
            </button>
          </Tippy>
        </div>
      ),
    },
  ];

  const columns = useMemo(() => COLUMNS, [pageIndex, pageSize]);
  const data = useMemo(() => userData, [userData]);

  const tableInstance = useTable(
    {
      columns,
      data,
      manualPagination: true,
      pageCount: pageCount,
      initialState: { pageIndex, pageSize },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: "selection",
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
          ),
          Cell: ({ row }) => (
            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
          ),
        },
        ...columns,
      ]);
    }
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize: setTablePageSize,
    state,
    rows,
    prepareRow,
  } = tableInstance;

  const { pageIndex: currentPageIndex, pageSize: currentPageSize } = state;

  useEffect(() => {
    if (currentPageIndex !== pageIndex) setPageIndex(currentPageIndex);
  }, [currentPageIndex]);

  useEffect(() => {
    if (currentPageSize !== pageSize) setPageSize(currentPageSize);
  }, [currentPageSize]);

  const handlePageChange = (newPage) => {
    gotoPage(newPage);
    setPageIndex(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    const n = Number(newSize);
    setPageSize(n);
    setTablePageSize(n);
    setPageIndex(0);
    gotoPage(0);
  };

  const handleNextPage = () => {
    if (canNextPage) {
      const newPage = pageIndex + 1;
      gotoPage(newPage);
      setPageIndex(newPage);
    }
  };

  const handlePreviousPage = () => {
    if (pageIndex > 0) {
      const newPage = pageIndex - 1;
      gotoPage(newPage);
      setPageIndex(newPage);
    }
  };

  const startRecord = totalRecords > 0 ? pageIndex * pageSize + 1 : 0;
  const endRecord = Math.min((pageIndex + 1) * pageSize, totalRecords);

  if (loading && pageIndex === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading Employee Data...</div>
      </div>
    );
  }

  return (
    <>
      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={() => {
          fetchData(0, pageSize);
          setPageIndex(0);
        }}
      />

      <Card noborder>
        <div className="md:flex pb-6 items-center">
          <h6 className="flex-1 md:mb-0">Employees</h6>
          <div className="md:flex md:space-x-3 items-center flex-none rtl:space-x-reverse">
            <Button
              text="Employee Email Record"
              className="btn-dark font-normal btn-sm h-9"
              iconClass="text-lg"
              onClick={() => navigate("/Email-Reporting")}
            />
            {/* ── Bulk Import Button ── */}

            <Button
              icon="heroicons:plus"
              text="Add Employee"
              className="btn-dark font-normal btn-sm"
              iconClass="text-lg"
              onClick={() => navigate("/Employee-add")}
            />

            <Button
              icon="heroicons:arrow-up-tray"
              text="Import"
              className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white border-0 hover:opacity-90 btn-sm"
              iconClass="text-lg"
              onClick={() => setShowImportModal(true)}
            />


          </div>
        </div>

        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-y-auto max-h-[calc(100vh-300px)] overflow-x-auto">
              <table
                className="min-w-full divide-y divide-slate-100 table-fixed"
                {...getTableProps()}
              >
                <thead className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] sticky top-0 z-10">
                  {headerGroups.map((headerGroup, index) => (
                    <tr {...headerGroup.getHeaderGroupProps()} key={index}>
                      {headerGroup.headers.map((column) => (
                        <th
                          {...column.getHeaderProps(
                            column.getSortByToggleProps()
                          )}
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
                  {loading ? (
                    <tr>
                      <td colSpan={COLUMNS.length + 1}>
                        <div className="flex justify-center items-center py-16">
                          <div className="text-gray-500">Loading...</div>
                        </div>
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={COLUMNS.length + 1}>
                        <div className="flex justify-center items-center py-16">
                          <span className="text-gray-500 text-lg font-medium">
                            No data available.
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
            </div>
          </div>
        </div>

        {/* Pagination Controls */}
        {totalRecords > 0 && (
          <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <span className="flex space-x-2 items-center">
                <span className="text-sm font-medium text-slate-600">Go</span>
                <input
                  type="number"
                  className="form-control py-2"
                  min="1"
                  max={pageCount}
                  value={pageIndex + 1}
                  onChange={(e) => {
                    const page = Number(e.target.value);
                    if (
                      page >= 1 &&
                      page <= pageCount &&
                      page !== pageIndex + 1
                    ) {
                      handlePageChange(page - 1);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const page = Number(e.target.value);
                      if (
                        page >= 1 &&
                        page <= pageCount &&
                        page !== pageIndex + 1
                      ) {
                        handlePageChange(page - 1);
                      }
                    }
                  }}
                  style={{ width: "70px" }}
                />
              </span>
              <span className="text-sm font-medium text-slate-600">
                Page {pageIndex + 1} of {pageCount}
              </span>
            </div>

            <ul className="flex items-center space-x-3 rtl:space-x-reverse">
              <li>
                <button
                  onClick={() => handlePageChange(0)}
                  disabled={pageIndex === 0}
                  className={`${pageIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  <Icon icon="heroicons:chevron-double-left-solid" />
                </button>
              </li>

              <li>
                <button
                  onClick={handlePreviousPage}
                  disabled={pageIndex === 0}
                  className={`${pageIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  Prev
                </button>
              </li>

              {(() => {
                const total = pageCount;
                const current = pageIndex + 1;
                const showPages = [];

                if (total > 0) showPages.push(1);
                if (total > 1) showPages.push(2);
                if (current > 4) showPages.push("left-ellipsis");
                if (current > 2 && current < total - 1)
                  showPages.push(current);
                if (current < total - 3) showPages.push("right-ellipsis");
                if (total > 2) showPages.push(total - 1);
                if (total > 1) showPages.push(total);

                const finalPages = [
                  ...new Set(
                    showPages.filter(
                      (p) =>
                        (p >= 1 && p <= total) || typeof p === "string"
                    )
                  ),
                ];

                return finalPages.map((p, idx) => (
                  <li key={idx}>
                    {typeof p === "string" ? (
                      <span className="text-slate-500 px-1">...</span>
                    ) : (
                      <button
                        className={`${p === current
                          ? "bg-slate-900 text-white font-medium"
                          : "bg-slate-100 text-slate-900 font-normal"
                          } text-sm rounded h-6 w-6 flex items-center justify-center`}
                        onClick={() => handlePageChange(p - 1)}
                      >
                        {p}
                      </button>
                    )}
                  </li>
                ));
              })()}

              <li>
                <button
                  onClick={handleNextPage}
                  disabled={!canNextPage}
                  className={`${!canNextPage ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  Next
                </button>
              </li>

              <li>
                <button
                  onClick={() => handlePageChange(pageCount - 1)}
                  disabled={!canNextPage}
                  className={`${!canNextPage ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  <Icon icon="heroicons:chevron-double-right-solid" />
                </button>
              </li>
            </ul>

            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-slate-600">Show</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(e.target.value)}
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
        )}
      </Card>
    </>
  );
};


export default UserPage;

