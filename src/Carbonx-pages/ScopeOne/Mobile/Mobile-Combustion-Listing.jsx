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

const MobileCombustionListing = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(1); // server-side starts at 1
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [goToValue, setGoToValue] = useState(pageIndex);


  //  Fetch records with server-side pagination
  // const fetchRecords = async (page = 1, limit = 10) => {
  //   setLoading(true);
  //   try {
  //     const res = await axios.get(
  //       `${process.env.REACT_APP_BASE_URL}/AutoMobile/Get-All?page=${page}&limit=${limit}`,
  //       {
  //         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //       }
  //     );

  //     const data = res.data?.data || [];
  //     const meta = res.data?.meta || {};

  //     setRecords(data);
  //     setTotalRecords(meta.totalRecords || 0);
  //     setTotalPages(meta.totalPages || 1);
  //     setPageIndex(meta.currentPage || 1);
  //     setPageSize(meta.limit || 10);
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Failed to fetch records");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchRecords = async (page = 1, limit = 10, search = "") => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/AutoMobile/Get-All?page=${page}&limit=${limit}&search=${search}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const data = res.data?.data || [];
      const meta = res.data?.meta || {};

      setRecords(data);
      setTotalRecords(meta.totalRecords || 0);
      setTotalPages(meta.totalPages || 1);
      setPageIndex(meta.currentPage || 1);
      setPageSize(meta.limit || 10);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };


  // useEffect(() => {
  //   fetchRecords(pageIndex, pageSize);
  // }, [pageIndex, pageSize]);
  useEffect(() => {
    fetchRecords(pageIndex, pageSize, globalFilterValue);
  }, [pageIndex, pageSize, globalFilterValue]);


  //  Delete Record
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BASE_URL}/AutoMobile/Delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Record deleted successfully");
      fetchRecords(pageIndex, pageSize);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete record");
    }
  };

  //  Table Columns
  const COLUMNS = useMemo(
    () => [
      {
        Header: "Sr.No",
        id: "serialNo",
        Cell: ({ row }) => (
          <span>{(pageIndex - 1) * pageSize + row.index + 1}</span>
        ),
      },
      {
        Header: "Building",
        accessor: (row) => row.buildingId?.buildingName || "-",
      },
      { Header: "Stakeholder", accessor: "stakeholder" },
      { Header: "Vehicle Classification", accessor: "vehicleClassification" },
      {
        Header: "Vehicle Type",
        accessor: "vehicleType",
        Cell: ({ value }) => (
          <span title={value}>
            {value?.length > 50 ? value.slice(0, 50) + "..." : value || "-"}
          </span>
        ),
      },
      { Header: "Fuel Name", accessor: "fuelName" },
      { Header: "Distance Traveled", accessor: "distanceTraveled" },
      { Header: "Distance Unit", accessor: "distanceUnit" },
      { Header: "Quality Control", accessor: "qualityControl" },
      { Header: "Weight Loaded (kg)", accessor: "weightLoaded" },
      { Header: "Calculated Emissions (kgCO₂e)", accessor: "calculatedEmissionKgCo2e", },
      { Header: "Calculated Emissions (tCO₂e)", accessor: "calculatedEmissionTCo2e", },
      // {
      //   Header: "Created By",
      //   accessor: "createdBy.name",
      //   Cell: ({ cell }) => cell.value || "-",
      // },
      // {
      //   Header: "Updated By",
      //   accessor: "updatedBy.name",
      //   Cell: ({ cell }) => cell.value || "-",
      // },
      {
        Header: "Remarks",
        accessor: "remarks",
        Cell: ({ value }) => (
          <span title={value}>
            {value?.length > 20 ? value.slice(0, 20) + "..." : value || "-"}
          </span>
        ),
      },
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
                  navigate(`/Mobile-Combustion-Form/${cell.value}`, {
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
                  navigate(`/Mobile-Combustion-Form/${cell.value}`, {
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
                  setSelectedBuildingId(cell.value);
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
  const tableInstance = useTable(
    { columns, data: records },
    useSortBy,
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

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  //  Handle Pagination
  const handleNextPage = () => {
    if (pageIndex < totalPages) setPageIndex((prev) => prev + 1);
  };
  const handlePrevPage = () => {
    if (pageIndex > 1) setPageIndex((prev) => prev - 1);
  };
  const handleGoToPage = (num) => {
    if (num >= 1 && num <= totalPages) setPageIndex(num);
  };

  return (
    <>
      <Card noborder>
        <div className="md:flex pb-6 items-center">
          <h6 className="flex-1 md:mb-0 ">Mobile Combustion Records</h6>
          <div className="md:flex md:space-x-3 items-center flex-none rtl:space-x-reverse">
            <GlobalFilter filter={globalFilterValue} setFilter={setGlobalFilterValue} />
            <Button
              icon="heroicons-outline:plus-sm"
              text="Add Record"
              className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
              iconClass="text-lg"
              onClick={() => navigate("/Mobile-Combustion-Form/Add")}
            />
          </div>
        </div>

        {/* table */}
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle">
            {/*  Set fixed height for vertical scroll */}
            <div className="overflow-y-auto max-h-[calc(100vh-300px)] overflow-x-auto">
              {/* <div className="overflow-hidden"> */}
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
              )}
            </div>
          </div>
        </div>

        {/*   Server-side Pagination */}
        <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="flex space-x-2 items-center">
              <span className="text-sm font-medium text-slate-600">Go</span>
              <input
                type="number"
                className="form-control py-2"
                value={goToValue}
                onChange={(e) => setGoToValue(e.target.value)}
                onBlur={() => {
                  const value = Number(goToValue);
                  if (value >= 1 && value <= totalPages && value !== pageIndex) {
                    handleGoToPage(value);
                  } else {
                    // reset input if invalid
                    setGoToValue(pageIndex);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const value = Number(goToValue);
                    if (value >= 1 && value <= totalPages && value !== pageIndex) {
                      handleGoToPage(value);
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

          <ul className="flex items-center space-x-3 rtl:space-x-reverse">
            <li>
              <button
                onClick={() => handleGoToPage(1)}
                disabled={pageIndex === 1}
                className={`${pageIndex === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Icon icon="heroicons:chevron-double-left-solid" />
              </button>
            </li>
            <li>
              <button
                onClick={handlePrevPage}
                disabled={pageIndex === 1}
                className={`${pageIndex === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Prev
              </button>
            </li>

            {/* {[...Array(totalPages)].map((_, idx) => (
              <li key={idx}>
                <button
                  className={`${idx + 1 === pageIndex
                    ? "bg-slate-900 text-white font-medium"
                    : "bg-slate-100 text-slate-900 font-normal"
                    } text-sm rounded h-6 w-6 flex items-center justify-center`}
                  onClick={() => handleGoToPage(idx + 1)}
                >
                  {idx + 1}
                </button>
              </li>
            ))} */}
            {(() => {
              const pages = [];
              const showPages = [];

              const total = totalPages;
              const current = pageIndex;

              // Always show first 2 pages
              if (total > 0) showPages.push(1);
              if (total > 1) showPages.push(2);

              // Determine when to show left ellipsis (... before current)
              if (current > 4) showPages.push("left-ellipsis");

              // Always show current page (if not near start or end)
              if (current > 2 && current < total - 1) showPages.push(current);

              // Determine when to show right ellipsis (... after current)
              if (current < total - 3) showPages.push("right-ellipsis");

              // Always show last 2 pages
              if (total > 2) showPages.push(total - 1);
              if (total > 1) showPages.push(total);

              // Remove duplicates & invalid numbers
              const finalPages = [...new Set(showPages.filter((p) => p >= 1 && p <= total || typeof p === "string"))];

              return finalPages.map((p, idx) => (
                <li key={idx}>
                  {p === "left-ellipsis" || p === "right-ellipsis" ? (
                    <span className="text-slate-500 px-1">...</span>
                  ) : (
                    <button
                      className={`${p === current
                        ? "bg-slate-900 text-white font-medium"
                        : "bg-slate-100 text-slate-900 font-normal"
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
                onClick={handleNextPage}
                disabled={pageIndex === totalPages}
                className={`${pageIndex === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Next
              </button>
            </li>
            <li>
              <button
                onClick={() => handleGoToPage(totalPages)}
                disabled={pageIndex === totalPages}
                className={`${pageIndex === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
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
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

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
                await handleDelete(selectedBuildingId);
                setDeleteModalOpen(false);
              }}
            />
          </>
        }
      >
        <p className="text-gray-700 text-center">
          Are you sure you want to delete this Mobile? This action cannot be undone.
        </p>
      </Modal>
    </>
  );
};

export default MobileCombustionListing;
