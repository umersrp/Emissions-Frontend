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

const StationaryCombustionListing = () => {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    prevPage: null,
  });

  const fetchStationaryRecords = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/stationary/Get-All?page=${page}&limit=${pagination.limit}&search=${search}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      //   your data is inside res.data.data
      setRecords(res.data.data || []);

      //   pagination info is inside res.data.meta
      const meta = res.data.meta || {};

      setPagination({
        currentPage: meta.currentPage || 1,
        totalPages: meta.totalPages || 1,
        totalCount: meta.totalRecords || 0,
        limit: meta.limit || 10,
        hasNextPage: meta.currentPage < meta.totalPages,
        hasPrevPage: meta.currentPage > 1,
        nextPage: meta.currentPage < meta.totalPages ? meta.currentPage + 1 : null,
        prevPage: meta.currentPage > 1 ? meta.currentPage - 1 : null,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  const [goToValue, setGoToValue] = useState(pagination.currentPage);

  useEffect(() => {
    setGoToValue(pagination.currentPage); // keep input in sync with current page
  }, [pagination.currentPage]);

  // initial load
  useEffect(() => {
    fetchStationaryRecords(pagination.currentPage, globalFilterValue);
  }, [pagination.currentPage, pagination.limit]);

  // handle search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchStationaryRecords(1, globalFilterValue);
    }, 600);
    return () => clearTimeout(delayDebounce);
  }, [globalFilterValue]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BASE_URL}/stationary/Delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Record deleted successfully");
      fetchStationaryRecords(pagination.currentPage);
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
        Cell: ({ row }) => (
          <span>{(pagination.currentPage - 1) * pagination.limit + row.index + 1}</span>
        ),
      },
      { Header: "Building", accessor: "buildingId.buildingName" },
      { Header: "Stakeholder", accessor: "stakeholder" },
      { Header: "Equipment Type", accessor: "equipmentType" },
      { Header: "Fuel Type", accessor: "fuelType" },
      { Header: "Fuel Name", accessor: "fuelName" },
      { Header: "Fuel Consumption", accessor: "fuelConsumption" },
      { Header: "Consumption Unit", accessor: "consumptionUnit" },
      { Header: "Quality Control", accessor: "qualityControl" },
      { Header: "Calculated Emissions (kgCO₂e)", accessor: "calculatedEmissionKgCo2e" },
      { Header: "Calculated Emissions (tCO₂e)", accessor: "calculatedEmissionTCo2e" },
      // { Header: "Calculated Bio Emissions (kgCO₂e)", accessor: "calculatedBioEmissionKgCo2e" },
      // { Header: "Calculated Bio Emissions (tCO₂e)", accessor: "calculatedBioEmissionTCo2e" },
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
                  navigate(`/Stationary-Combustion-Form/${cell.value}`, {
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
                  navigate(`/Stationary-Combustion-Form/${cell.value}`, {
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
    [pagination.currentPage, pagination.limit]
  );

  const tableInstance = useTable(
    {
      columns: COLUMNS,
      data: records,
      manualPagination: true,
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

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  return (
    <>
      <Card noborder>
        <div className="md:flex pb-6 items-center">
          <h6 className="flex-1 md:mb-0">Stationary Combustion Records</h6>
          <div className="md:flex md:space-x-3 items-center flex-none rtl:space-x-reverse">
            <GlobalFilter filter={globalFilterValue} setFilter={setGlobalFilterValue} />
            <Button
              icon="heroicons-outline:plus-sm"
              text="Add Record"
              className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
              iconClass="text-lg"
              onClick={() => navigate("/Stationary-Combustion-Form/Add")}
            />
          </div>
        </div>
        {/* Table */}
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

        {/*   Pagination */}
        <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
          {/* Left side: Go to page + Page info */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="flex space-x-2 items-center">
              <span className="text-sm font-medium text-slate-600">Go</span>
              <input
                type="number"
                className="form-control py-2"
                min="1"
                max={pagination.totalPages}
                value={goToValue}
                onChange={(e) => setGoToValue(e.target.value)}
                onBlur={() => {
                  const page = Number(goToValue);
                  if (page >= 1 && page <= pagination.totalPages && page !== pagination.currentPage) {
                    setPagination((prev) => ({ ...prev, currentPage: page }));
                  } else {
                    setGoToValue(pagination.currentPage);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const page = Number(goToValue);
                    if (page >= 1 && page <= pagination.totalPages && page !== pagination.currentPage) {
                      setPagination((prev) => ({ ...prev, currentPage: page }));
                    } else {
                      setGoToValue(pagination.currentPage);
                    }
                  }
                }}
                style={{ width: "50px" }}
              />
            </span>
            <span className="text-sm font-medium text-slate-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
          </div>

          {/* Middle: Pagination buttons */}
          <ul className="flex items-center space-x-3 rtl:space-x-reverse">
            {/* First Page */}
            <li>
              <button
                onClick={() => setPagination((p) => ({ ...p, currentPage: 1 }))}
                disabled={pagination.currentPage === 1}
                className={`${pagination.currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Icon icon="heroicons:chevron-double-left-solid" />
              </button>
            </li>

            {/* Prev */}
            <li>
              <button
                onClick={() =>
                  pagination.hasPrevPage &&
                  setPagination((p) => ({ ...p, currentPage: p.prevPage }))
                }
                disabled={!pagination.hasPrevPage}
                className={`${!pagination.hasPrevPage ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Prev
              </button>
            </li>

            {/* Smart pagination numbers */}
            {(() => {
              const total = pagination.totalPages;
              const current = pagination.currentPage;
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
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, currentPage: p }))
                      }
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
                onClick={() =>
                  pagination.hasNextPage &&
                  setPagination((p) => ({ ...p, currentPage: p.nextPage }))
                }
                disabled={!pagination.hasNextPage}
                className={`${!pagination.hasNextPage ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Next
              </button>
            </li>

            {/* Last Page */}
            <li>
              <button
                onClick={() => setPagination((p) => ({ ...p, currentPage: pagination.totalPages }))}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`${pagination.currentPage === pagination.totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : ""
                  }`}
              >
                <Icon icon="heroicons:chevron-double-right-solid" />
              </button>
            </li>
          </ul>

          {/* Right side: Page size selector */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-slate-600">Show</span>
            <select
              value={pagination.limit}
              onChange={(e) =>
                setPagination((p) => ({ ...p, limit: Number(e.target.value), currentPage: 1 }))
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
          Are you sure you want to delete this Stationary? This action cannot be undone.
        </p>
      </Modal>
    </>
  );
};

export default StationaryCombustionListing;
