import React, { useState, useEffect, useMemo } from "react";
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
  const [selectedId, setSelectedId] = useState(null);
  const [goToValue, setGoToValue] = useState(pageIndex);

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

 useEffect(() => {
    if (location.state?.selectedMethod) {
      setEmissionFilter(location.state.selectedMethod);
      // Clear the state to prevent persistence on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Fetch data from Purchased-Electricity API
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        page: pageIndex,
        limit: pageSize,
      };

      // Add search parameter if globalFilterValue exists
      if (globalFilterValue) {
        params.search = globalFilterValue;
      }

      // Add filter parameter if not "all"
      if (emissionFilter !== "all") {
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
  }, [pageIndex, pageSize, globalFilterValue, emissionFilter]); // Added both dependencies

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

  // Common columns that appear in both views
  const COMMON_COLUMNS = [
    { Header: "Sr.No", id: "serialNo", Cell: ({ row }) => (pageIndex - 1) * pageSize + row.index + 1 },
    { Header: "Building", accessor: "buildingId.buildingName" },
    {
      Header: "Method",
      accessor: "method",
      Cell: ({ cell }) => formatSnakeCase(cell.value) || "-",
    },];

  // Location-based specific columns
  const LOCATION_BASED_COLUMNS = [
    { Header: "Total Gross Electricity Purchased (Grid)", accessor: "totalGrossElectricityGrid", Cell: ({ cell }) => renderNA(cell.value) },
    { Header: "Unit", accessor: "unit",Cell: ({ cell }) => renderNA(cell.value) },
    { Header: "Grid Station", accessor: "gridStation",Cell: ({ cell }) => renderNA(cell.value) },
    { Header: "Total Other Supplier Specific Electricity Purchased", accessor: "totalOtherSupplierElectricity", Cell: ({ cell }) => renderNA(cell.value) },
    { Header: "Calculated Location Based Emissions (kgCO₂e)", accessor: "calculatedEmissionKgCo2e", Cell: ({ cell }) => {
          const rawValue = cell.value;
          if (rawValue === null || rawValue === undefined || rawValue === "") {
            return "N/A";
          }
          const numValue = Number(rawValue);
          if (isNaN(numValue)) {
            return "N/A";
          }
          if ((numValue !== 0 && Math.abs(numValue) < 0.01) || Math.abs(numValue) >= 1e6) {
            return numValue.toExponential(2);
          }
          return numValue.toFixed(2);
        }  },
    { Header: "Calculated Location Based Emissions (tCO₂e)", accessor: "calculatedEmissionTCo2e",  Cell: ({ cell }) => {
          const rawValue = cell.value;
          if (rawValue === null || rawValue === undefined || rawValue === "") {
            return "N/A";
          }
          const numValue = Number(rawValue);
          if (isNaN(numValue)) {
            return "N/A";
          }
          if ((numValue !== 0 && Math.abs(numValue) < 0.01) || Math.abs(numValue) >= 1e6) {
            return numValue.toExponential(2);
          }
          return numValue.toFixed(2);
        }  },
  ];

  // Market-based specific columns
  const MARKET_BASED_COLUMNS = [
    { Header: "Total Purchased Electricity (Grid / Supplier Specific / PPA)", accessor: "totalPurchasedElectricity",Cell: ({ cell }) => renderNA(cell.value) },
    { Header: "Total Gross Electricity Purchased (Grid)", accessor: "totalGrossElectricityGrid",Cell: ({ cell }) => renderNA(cell.value) },
    { Header: "Unit", accessor: "unit" },
    { Header: "Grid Station", accessor: "gridStation" },
    { Header: "On-Site Solar / Renewable Electricity Generation", accessor: "hasSolarPanels", Cell: ({ cell }) => cell.value ? "Yes" : "No" },
    { Header: "Solar Consumption with Sold Attributes", accessor: "solarConsumedButSold", Cell: ({ cell }) => renderNA(cell.value) },

    { Header: "Supplier-Specific Electricity", accessor: "purchasesSupplierSpecific", Cell: ({ cell }) => cell.value ? "Yes" : "No" },
    { Header: "Purchased Supplier Specific Electricity", accessor: "supplierSpecificElectricity", Cell: ({ cell }) => renderNA(cell.value) },//

    { Header: "Power Purchase Agreements (PPAs)", accessor: "hasPPA", Cell: ({ cell }) => cell.value ? "Yes" : "No" },
    { Header: "Electricity Purchased / Covered Under PPAs", accessor: "ppaElectricity", Cell: ({ cell }) => renderNA(cell.value) },

    { Header: "Renewable Energy Attributes/Certificates", accessor: "hasRenewableAttributes", Cell: ({ cell }) => cell.value ? "Yes" : "No" },
    { Header: "Electricity Covered by Renewable Attributes", accessor: "renewableAttributesElectricity", Cell: ({ cell }) => renderNA(cell.value) },

    //{ Header: "Total Onsite Solar Consumption", accessor: "totalOnsiteSolarConsumption" },
    //{ Header: "Solar Retained Under RECs", accessor: "solarRetainedUnderRECs" },
    { Header: "Calculated Location Based Emissions (kgCO₂e)", accessor: "calculatedEmissionKgCo2e",  Cell: ({ cell }) => {
    const value = Number(cell.value);
    if (isNaN(value) || value === 0) { return "N/A"; }
    if (Math.abs(value) < 0.01 || Math.abs(value) >= 1e6) { return value.toExponential(2); }
    return value.toFixed(2);} },
    { Header: "Calculated Location Based Emissions (tCO₂e)", accessor: "calculatedEmissionTCo2e",  Cell: ({ cell }) => {
    const value = Number(cell.value);
    if (isNaN(value) || value === 0) { return "N/A"; }
    if (Math.abs(value) < 0.01 || Math.abs(value) >= 1e6) { return value.toExponential(2); }
    return value.toFixed(2);} },

    { Header: "Calculated Market Based Emissions (kgCO₂e)", accessor: "calculatedEmissionMarketKgCo2e",  Cell: ({ cell }) => {
    const value = Number(cell.value);
    if (isNaN(value) || value === 0) { return "N/A"; }
    if (Math.abs(value) < 0.01 || Math.abs(value) >= 1e6) { return value.toExponential(2); }
    return value.toFixed(2);} },
    { Header: "Calculated Market Based Emissions (tCO₂e)", accessor: "calculatedEmissionMarketTCo2e",  Cell: ({ cell }) => {
    const value = Number(cell.value);
    if (isNaN(value) || value === 0) { return "N/A"; }
    if (Math.abs(value) < 0.01 || Math.abs(value) >= 1e6) { return value.toExponential(2); }
    return value.toFixed(2);} },
  ];

  // Additional common columns after emission columns
  const FINAL_COLUMNS = [
    { Header: "Quality Control", accessor: "qualityControl", Cell: ({ cell }) => renderNA(cell.value) },
    { Header: "Remarks", accessor: "remarks", Cell: ({ cell }) => renderNA(cell.value) },
    {
      Header: "Created By",
      accessor: "createdBy.name",
      Cell: ({ cell }) => cell.value || "N/A",
    },
    {
      Header: "Updated By",
      accessor: "updatedBy.name",
      Cell: ({ cell }) => cell.value || "N/A",
    },
    {
      Header: "Created At",
      accessor: "createdAt",
      Cell: ({ cell }) => (cell.value ? new Date(cell.value).toLocaleDateString() : "-"),
    },
    {
      Header: "Actions",
      accessor: "_id",
      Cell: ({ cell }) => (
        <div className="flex space-x-3 rtl:space-x-reverse">
          <Tippy content="View">
            <button
              className="action-btn"
              onClick={() => navigate(`/Purchased-Electricity-Form/${cell.value}`, { state: { mode: "view" } })}
            >
              <Icon icon="heroicons:eye" className="text-green-600" />
            </button>
          </Tippy>
          <Tippy content="Edit">
            <button
              className="action-btn"
              onClick={() => navigate(`/Purchased-Electricity-Form/${cell.value}`, { state: { mode: "edit" } })}
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
  ];

  // Build columns based on current filter
  const COLUMNS = useMemo(() => {
    if (!emissionFilter) return []; // no filter selected → no columns

    let emissionColumns = [];

    if (emissionFilter === "location_based") {
      emissionColumns = LOCATION_BASED_COLUMNS;
    } else if (emissionFilter === "market_based") {
      emissionColumns = MARKET_BASED_COLUMNS;
    }

    return [...COMMON_COLUMNS, ...emissionColumns, ...FINAL_COLUMNS];
  }, [emissionFilter, pageIndex, pageSize]);


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
  const handlePrevPage = () => handleGoToPage(pageIndex - 1);
  const handleNextPage = () => handleGoToPage(pageIndex + 1);

  return (
    <>
      <Card noborder>
        <div className="md:flex pb-6 items-center">
          <h6 className="flex-1 md:mb-0">Purchased Electricity Records</h6>
          <div className="md:flex md:space-x-3 items-center flex-wrap gap-2">
            {/* Emission Filter Dropdown */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-slate-600">Filter:</label>
              <select
                value={emissionFilter}
                onChange={(e) => {
                  setEmissionFilter(e.target.value);
                  setPageIndex(1); // Reset to first page when filter changes
                }}
                className="form-select py-2 w-44 rounded"
              >
                <option value="">Select Method</option>
                <option value="location_based">Location Based</option>
                <option value="market_based">Market Based</option>
              </select>
            </div>

            {/* Global Search */}
            <GlobalFilter filter={globalFilterValue} setFilter={setGlobalFilterValue} />

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
                // <table
                //   className="min-w-full divide-y divide-slate-100 table-fixed"
                //   {...getTableProps()}
                // >
                //   <thead className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] sticky top-0 z-10">
                //     {headerGroups.map((headerGroup, index) => (
                //       <tr {...headerGroup.getHeaderGroupProps()} key={index}>
                //         {headerGroup.headers.map((column) => (
                //           <th
                //             {...column.getHeaderProps(column.getSortByToggleProps())}
                //             className="table-th text-white whitespace-nowrap"
                //             key={column.id}
                //           >
                //             {column.render("Header")}
                //             <span>
                //               {column.isSorted
                //                 ? column.isSortedDesc
                //                   ? " 🔽"
                //                   : " 🔼"
                //                 : ""}
                //             </span>
                //           </th>
                //         ))}
                //       </tr>
                //     ))}
                //   </thead>
                //   {/* <tbody {...getTableBodyProps()}>
                //     {rows.length === 0 ? (
                //       <tr>
                //         <td colSpan={COLUMNS.length + 1}>
                //           <div className="flex justify-center items-center py-16">
                //             <span className="text-gray-500 text-lg font-medium">
                //               No data available.
                //             </span>
                //           </div>
                //         </td>
                //       </tr>
                //     ) : (
                //       rows.map((row) => {
                //         prepareRow(row);
                //         return (
                //           <tr {...row.getRowProps()} className="even:bg-gray-50">
                //             {row.cells.map((cell) => (
                //               <td
                //                 {...cell.getCellProps()}
                //                 className="px-6 py-4 whitespace-nowrap"
                //               >
                //                 {cell.render("Cell")}
                //               </td>
                //             ))}
                //           </tr>
                //         );
                //       })
                //     )}
                //   </tbody> */}
                //   <tbody {...getTableBodyProps()}>
                //     {rows.length === 0 ? (
                //       <tr>
                //         <td colSpan={COLUMNS.length + 1}>
                //           <div className="flex justify-center items-center py-16">
                //             <span className="text-gray-500 text-lg font-medium">
                //               {emissionFilter === "all"
                //                 ? "Select Method"
                //                 : "No data available."}
                //             </span>
                //           </div>
                //         </td>
                //       </tr>
                //     ) : (
                //       rows.map((row) => {
                //         prepareRow(row);
                //         return (
                //           <tr {...row.getRowProps()} className="even:bg-gray-50">
                //             {row.cells.map((cell) => (
                //               <td
                //                 {...cell.getCellProps()}
                //                 className="px-6 py-4 whitespace-nowrap"
                //               >
                //                 {cell.render("Cell")}
                //               </td>
                //             ))}
                //           </tr>
                //         );
                //       })
                //     )}
                //   </tbody>

                // </table>
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
          Are you sure you want to delete this record? This action cannot be undone.
        </p>
      </Modal>
    </>
  );
};

export default PurchasedElectricityListing;