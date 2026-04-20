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


import React, { useState, useMemo, useEffect } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import axios from "axios";
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

const UserPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
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
            page: page + 1, // API expects 1-based page number
            limit: size,
          },
        }
      );

      console.log("API Response:", response.data);

      // Extract data from response - FIX: Access the correct path
      const users = response.data?.data?.users || [];
      const pagination = response.data?.data?.pagination || response.data?.pagination || {};

      console.log("Users:", users);
      console.log("Pagination:", pagination);

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

  // Fetch data when page or page size changes
  useEffect(() => {
    fetchData(pageIndex, pageSize);
  }, [pageIndex, pageSize]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BASE_URL}/auth/DeleteUser/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("User deleted successfully");
      // Refresh current page after deletion
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
      Cell: (row) => <span className="lowercase">{row?.cell?.value}</span>,
    },
    {
      Header: "Active",
      accessor: "isActive",
      Cell: (row) => (
        <span className={`inline-block px-3 py-1 rounded-[999px] text-center ${row?.cell?.value ? "bg-success-500 text-white" : "bg-warning-500 text-white"
          }`}>
          {row?.cell?.value ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      Header: "Email Verified",
      accessor: "isEmailValid",
      Cell: (row) => (
        <span className={`inline-block px-3 py-1 rounded-[999px] text-center ${row?.cell?.value ? "bg-success-500 text-white" : "bg-warning-500 text-white"
          }`}>
          {row?.cell?.value ? "Verified" : "Not Verified"}
        </span>
      ),
    },
    {
      Header: "Company",
      accessor: "companyId.companyName",
      Cell: (row) => <span>{row?.cell?.value || "-"}</span>,
    },
    {
      Header: "Created At",
      accessor: "createdAt",
      Cell: ({ cell }) => (cell.value ? new Date(cell.value).toLocaleDateString() : "N/A")
    },
    {
      Header: "Updated At",
      accessor: "updatedAt",
      Cell: ({ cell }) => (cell.value ? new Date(cell.value).toLocaleDateString() : "N/A")
    },
    {
      Header: "Action",
      accessor: "_id",
      Cell: ({ cell }) => (
        <div className="flex space-x-3 rtl:space-x-reverse">
          <Tippy content="View">
            <button className="action-btn" onClick={() => navigate(`/Employee-View/${cell.value}`)}>
              <Icon className="text-green-600" icon="heroicons:eye" />
            </button>
          </Tippy>
          <Tippy content="Edit">
            <button className="action-btn" onClick={() => navigate(`/Employee-edit/${cell.value}`)}>
              <Icon className="text-blue-600" icon="heroicons:pencil-square" />
            </button>
          </Tippy>
          <Tippy content="Delete">
            <button className="action-btn" onClick={() => handleDelete(cell.value)}>
              <Icon className="text-red-300" icon="heroicons:trash-solid" />
            </button>
          </Tippy>
        </div>
      ),
    },
  ];

  const columns = useMemo(() => COLUMNS, [pageIndex, pageSize]);
  const data = useMemo(() => userData, [userData]);

  // Table instance with manual pagination
  const tableInstance = useTable(
    {
      columns,
      data,
      manualPagination: true,
      pageCount: pageCount,
      initialState: {
        pageIndex,
        pageSize,
      },
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

  // Sync page index and size with local state
  useEffect(() => {
    if (currentPageIndex !== pageIndex) {
      setPageIndex(currentPageIndex);
    }
  }, [currentPageIndex]);

  useEffect(() => {
    if (currentPageSize !== pageSize) {
      setPageSize(currentPageSize);
    }
  }, [currentPageSize]);

  // Handle page change
  const handlePageChange = (newPage) => {
    gotoPage(newPage);
    setPageIndex(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    const newSizeNum = Number(newSize);
    setPageSize(newSizeNum);
    setTablePageSize(newSizeNum);
    setPageIndex(0);
    gotoPage(0);
  };

  // Handle next page
  const handleNextPage = () => {
    if (canNextPage) {
      const newPage = pageIndex + 1;
      gotoPage(newPage);
      setPageIndex(newPage);
    }
  };

  // Handle previous page
  const handlePreviousPage = () => {
    if (pageIndex > 0) {
      const newPage = pageIndex - 1;
      gotoPage(newPage);
      setPageIndex(newPage);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (pageCount <= maxPagesToShow) {
      for (let i = 0; i < pageCount; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (pageIndex < 3) {
        for (let i = 0; i < 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(pageCount - 1);
      } else if (pageIndex > pageCount - 4) {
        pageNumbers.push(0);
        pageNumbers.push('...');
        for (let i = pageCount - 4; i < pageCount; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(0);
        pageNumbers.push('...');
        for (let i = pageIndex - 1; i <= pageIndex + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(pageCount - 1);
      }
    }

    return pageNumbers;
  };

  // Calculate start and end records
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
            <Button
              icon="heroicons:plus"
              text="Add Employee"
              className="btn-dark font-normal btn-sm"
              iconClass="text-lg"
              onClick={() => navigate("/Employee-add")}
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
                    if (page >= 1 && page <= pageCount && page !== pageIndex + 1) {
                      handlePageChange(page - 1);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const page = Number(e.target.value);
                      if (page >= 1 && page <= pageCount && page !== pageIndex + 1) {
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
                  className={`${pageIndex === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Icon icon="heroicons:chevron-double-left-solid" />
                </button>
              </li>

              <li>
                <button
                  onClick={handlePreviousPage}
                  disabled={pageIndex === 0}
                  className={`${pageIndex === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
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
                if (current > 2 && current < total - 1) showPages.push(current);
                if (current < total - 3) showPages.push("right-ellipsis");
                if (total > 2) showPages.push(total - 1);
                if (total > 1) showPages.push(total);

                const finalPages = [...new Set(showPages.filter((p) => p >= 1 && p <= total || typeof p === "string"))];

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
                  className={`${!canNextPage ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Next
                </button>
              </li>

              <li>
                <button
                  onClick={() => handlePageChange(pageCount - 1)}
                  disabled={!canNextPage}
                  className={`${!canNextPage ? "opacity-50 cursor-not-allowed" : ""}`}
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

