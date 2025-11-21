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

// const ProcessEmissionsListing = () => {
//   const navigate = useNavigate();
//   const [records, setRecords] = useState([]);
//   const [filteredRecords, setFilteredRecords] = useState([]); //  For client-side search
//   const [loading, setLoading] = useState(false);
//   const [pageIndex, setPageIndex] = useState(0);
//   const [pageSize, setPageSize] = useState(10);
//   const [pageCount, setPageCount] = useState(0);
//   const [globalFilterValue, setGlobalFilterValue] = useState("");
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [selectedBuildingId, setSelectedBuildingId] = useState(null);

//   // Fetch all records once (no server-side search)
//   const fetchStationaryRecords = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(
//         `${process.env.REACT_APP_BASE_URL}/Process-Emissions/Get-All`,
//         {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         }
//       );
//       const data = res.data?.data?.records || res.data?.data || [];
//       setRecords(data);
//       setFilteredRecords(data); //  store both
//       setPageCount(Math.ceil(data.length / pageSize));
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

//   //  Handle client-side search
//   useEffect(() => {
//     if (!globalFilterValue) {
//       setFilteredRecords(records);
//     } else {
//       const search = globalFilterValue.toLowerCase();
//       const filtered = records.filter((item) => {
//         const buildingName = item.buildingId?.buildingName?.toLowerCase() || "";
//         const allValues = Object.values(item).join(" ").toLowerCase();
//         return (
//           buildingName.includes(search) ||
//           allValues.includes(search)
//         );
//       });
//       setFilteredRecords(filtered);
//     }
//     setPageCount(Math.ceil(filteredRecords.length / pageSize));
//     setPageIndex(0);
//   }, [globalFilterValue, records]);

//   // Delete Record
//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`${process.env.REACT_APP_BASE_URL}/Process-Emissions/${id}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//       });
//       toast.success("Record deleted successfully");
//       fetchStationaryRecords();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to delete record");
//     }
//   };

//   // Columns
//   const COLUMNS = useMemo(
//     () => [
//       {
//          Header: "Sr.No",
//         id: "serialNo",
//         Cell: ({ row }) => <span>{row.index + 1 + pageIndex * pageSize}</span>,
//       },
//       { Header: "Building", accessor: "buildingId.buildingName" },
//       { Header: "Stakeholder Department", accessor: "stakeholderDepartment" },
//       { Header: "Activity Type", accessor: "activityType" },
//       { Header: "Gas Emitted", accessor: "gasEmitted" },
//       { Header: "Amount of Emissions", accessor: "amountOfEmissions" },
//       { Header: "Quality Control", accessor: "qualityControl" },
//       // { Header: "Calculated Emissions (kgCO₂e)", accessor: "calculatedEmissionKgCo2e", },
//       // { Header: "Calculated Emissions (tCO₂e)", accessor: "calculatedEmissionTCo2e", },
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
//       { Header: "Remarks", accessor: "remarks" },
//       {
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
//                   navigate(`/Process-Emissions-Form/${cell.value}`, {
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
//                   navigate(`/Process-Emissions-Form/${cell.value}`, {
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

//   //  Apply pagination on filtered data
//   const paginatedData = useMemo(() => {
//     const start = pageIndex * pageSize;
//     return filteredRecords.slice(start, start + pageSize);
//   }, [filteredRecords, pageIndex, pageSize]);

//   const data = useMemo(() => paginatedData, [paginatedData]);

//   const tableInstance = useTable(
//     {
//       columns,
//       data,
//       manualPagination: false,
//       pageCount,
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
//       {/*  No UI change below */}
//       <Card noborder>
//         <div className="md:flex pb-6 items-center">
//           <h6 className="flex-1 md:mb-0 ">Process Emissions Records</h6>
//           <div className="md:flex md:space-x-3 items-center flex-none rtl:space-x-reverse">
//             <GlobalFilter filter={globalFilterValue} setFilter={setGlobalFilterValue} />
//             <Button
//               icon="heroicons-outline:plus-sm"
//               text="Add Record"
//               className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
//               iconClass="text-lg"
//               onClick={() => navigate("/Process-Emissions-Form/Add")}
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

//         {/* Pagination (unchanged) */}
//         {/* Your pagination UI remains identical */}
//       </Card>

//       {/* Delete Modal */}
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
//           Are you sure you want to delete this Process? This action cannot be undone.
//         </p>
//       </Modal>
//     </>
//   );
// };

// export default ProcessEmissionsListing;
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

const ProcessEmissionsListing = () => {
  const navigate = useNavigate();

  // Server-side states
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pageIndex, setPageIndex] = useState(1); // server-based pages start at 1
  const [pageSize, setPageSize] = useState(10);

  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [globalFilterValue, setGlobalFilterValue] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Fetch data from server with pagination
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/Process-Emissions/Get-All`,
        {
          params: {
            page: pageIndex,
            limit: pageSize,
            search: globalFilterValue || "",
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
      toast.error("Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize, globalFilterValue]);

  // Delete Record
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BASE_URL}/Process-Emissions/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Record deleted successfully");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete record");
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
      { Header: "Building", accessor: "buildingId.buildingName" },
      { Header: "Stakeholder", accessor: "stakeholderDepartment" },
      { Header: "Activity Type", accessor: "activityType" },
      { Header: "Gas Emitted", accessor: "gasEmitted" },
      { Header: "Amount Of Emissions", accessor: "amountOfEmissions" },
      { Header: "Quality Control", accessor: "qualityControl" },
      { Header: "Calculated Emissions (kgCO₂e)", accessor: "calculatedEmissionKgCo2e", },
      { Header: "Calculated Emissions (tCO₂e)", accessor: "calculatedEmissionTCo2e", },
      {
        Header: "Created By",
        accessor: "createdBy.name",
        Cell: ({ cell }) => cell.value || "-",
      },
      {
        Header: "Updated By",
        accessor: "updatedBy.name",
        Cell: ({ cell }) => cell.value || "-",
      },
      { Header: "Remarks", accessor: "remarks" },
      {
        Header: "Created At",
        accessor: "createdAt",
        Cell: ({ cell }) =>
          cell.value ? new Date(cell.value).toLocaleDateString() : "-",
      },
      {
        Header: "Actions",
        accessor: "_id",
        Cell: ({ cell }) => (
          <div className="flex space-x-3 rtl:space-x-reverse">
            <Tippy content="View">
              <button
                className="action-btn"
                onClick={() =>
                  navigate(`/Process-Emissions-Form/${cell.value}`, {
                    state: { mode: "view" },
                  })
                }
              >
                <Icon icon="heroicons:eye" className="text-green-600" />
              </button>
            </Tippy>

            <Tippy content="Edit">
              <button
                className="action-btn"
                onClick={() =>
                  navigate(`/Process-Emissions-Form/${cell.value}`, {
                    state: { mode: "edit" },
                  })
                }
              >
                <Icon icon="heroicons:pencil-square" className="text-blue-600" />
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
        ),
      },
    ],
    [pageIndex, pageSize]
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
          <h6 className="flex-1 md:mb-0 ">Process Emissions Records</h6>

          <div className="md:flex md:space-x-3 items-center">
            <GlobalFilter filter={globalFilterValue} setFilter={setGlobalFilterValue} />

            <Button
              icon="heroicons-outline:plus-sm"
              text="Add Record"
              className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
              onClick={() => navigate("/Process-Emissions-Form/Add")}
            />
          </div>
        </div>

        {/* TABLE */}
          <div className="overflow-x-auto -mx-6">
                 <div className="inline-block min-w-full align-middle">
                   <div className="overflow-hidden">
                     {loading ? (
                       <div className="flex justify-center items-center py-8">
                         <img src={Logo} alt="Loading..." className="w-52 h-24" />
                       </div>
                     ) : (
                       <table className="min-w-full divide-y divide-slate-100 table-fixed" {...getTableProps()}>
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
                                     {column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}
                                   </span>
                                 </th>
                               ))}
                             </tr>
                           ))}
                         </thead>
       
                         <tbody {...getTableBodyProps()}>
                           {rows.length === 0 ? (
                             <tr>
                               <td colSpan={columns.length + 1}>
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
                                     <td {...cell.getCellProps()} className="px-6 py-4 whitespace-nowrap">
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
          <div className="flex items-center space-x-3">
            <span className="flex space-x-2 items-center">
              <span className="text-sm font-medium text-slate-600">Go</span>
              <input
                type="number"
                className="form-control py-2"
                value={pageIndex}
                onChange={(e) => handleGoToPage(Number(e.target.value))}
                style={{ width: "50px" }}
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
              >
                <Icon icon="heroicons:chevron-double-left-solid" />
              </button>
            </li>

            <li>
              <button
                onClick={handlePrevPage}
                disabled={pageIndex === 1}
              >
                Prev
              </button>
            </li>

            {[...Array(totalPages)].map((_, idx) => (
              <li key={idx}>
                <button
                  className={`${
                    idx + 1 === pageIndex
                      ? "bg-slate-900 text-white font-medium"
                      : "bg-slate-100 text-slate-900"
                  } text-sm rounded h-6 w-6 flex items-center justify-center`}
                  onClick={() => handleGoToPage(idx + 1)}
                >
                  {idx + 1}
                </button>
              </li>
            ))}

            <li>
              <button
                onClick={handleNextPage}
                disabled={pageIndex === totalPages}
              >
                Next
              </button>
            </li>

            <li>
              <button
                onClick={() => handleGoToPage(totalPages)}
                disabled={pageIndex === totalPages}
              >
                <Icon icon="heroicons:chevron-double-right-solid" />
              </button>
            </li>
          </ul>

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
          Are you sure you want to delete this Process? This action cannot be undone.
        </p>
      </Modal>
    </>
  );
};

export default ProcessEmissionsListing;
