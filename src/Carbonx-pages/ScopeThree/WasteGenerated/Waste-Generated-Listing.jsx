
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

const WasteGeneratedListing = () => {
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
  const [goToValue, setGoToValue] = useState(pageIndex);

  const capitalizeLabel = (text) => {
    if (!text) return "N/A";

    const exceptions = ["and", "or", "in", "of", "from", "at", "to", "the", "a", "an", "for", "on", "with",
      "but", "by", "is", "it", "as", "be", "this", "that", "these", "those", "such",
      "if", "e.g.,", "i.e.", "kg", "via", "etc.", "vs.", "per", "e.g.", "on-site", "can", "will", "not", "cause", "onsite",
      "n.e.c."];
    return text
      .split(" ")
      .map((word, index) => {
        // Always capitalize the first word
        if (index === 0) return word.charAt(0).toUpperCase() + word.slice(1);
        // Don't capitalize exceptions
        if (exceptions.includes(word.toLowerCase())) return word.toLowerCase();
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  };

  // Fetch data from server with pagination
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/Waste-Generate/List`,
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
      await axios.delete(`${process.env.REACT_APP_BASE_URL}/Waste-Generate/Delete/${id}`, {
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
        Cell: ({ row }) => (
          <span>{(pageIndex - 1) * pageSize + row.index + 1}</span>
        ),
      },

      { Header: "Building", accessor: "buildingId.buildingName", Cell: ({ cell }) => cell.value || "N/A" },
      { Header: "Stakeholder", accessor: "stakeholder", Cell: ({ value }) => capitalizeLabel(value) },
      { Header: "Waste Category", accessor: "wasteCategory", Cell: ({ value }) => capitalizeLabel(value) },
      { Header: "Waste Type", accessor: "wasteType", Cell: ({ value }) => capitalizeLabel(value) },
      { Header: "Waste Treatment Method", accessor: "wasteTreatmentMethod", Cell: ({ value }) => capitalizeLabel(value) },
      { Header: "Unit", accessor: "unit", Cell: ({ cell }) => cell.value || "N/A" },
      { Header: "Total Waste Quantity", accessor: "totalWasteQty", Cell: ({ cell }) => cell.value || "N/A" },
      { Header: "Calculated Emissions (kgCO₂e)", accessor: "calculatedEmissionKgCo2e", Cell: ({ cell }) => cell.value || "N/A" },
      { Header: "Calculated Emissions (tCO₂e)", accessor: "calculatedEmissionTCo2e", Cell: ({ cell }) => cell.value || "N/A" },
      { Header: "Quality Control", accessor: "qualityControl", Cell: ({ cell }) => cell.value || "N/A" },
      { Header: "Remarks", accessor: "remarks", Cell: ({ cell }) => cell.value || "N/A" },
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
        Cell: ({ cell }) =>
          cell.value ? new Date(cell.value).toLocaleDateString() : "N/A",
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
                  navigate(`/Waste-Generated-Form/${cell.value}`, {
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
                  navigate(`/Waste-Generated-Form/${cell.value}`, {
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
          <h6 className="flex-1 md:mb-0 ">Waste Generated In Operation Records</h6>

          <div className="md:flex md:space-x-3 items-center">
            <GlobalFilter filter={globalFilterValue} setFilter={setGlobalFilterValue} />

            <Button
              icon="heroicons-outline:plus-sm"
              text="Add Record"
              className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
              onClick={() => navigate("/Waste-Generated-Form/add")}
            />
          </div>
        </div>

        {/* TABLE */}
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
              <button
                onClick={handleNextPage}
                disabled={pageIndex === totalPages}
              >
                Next
              </button>
            </li>

            {/* Last Page */}
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
          Are you sure you want to delete this Recorde? This action cannot be undone.
        </p>
      </Modal>
    </>
  );
};

export default WasteGeneratedListing;