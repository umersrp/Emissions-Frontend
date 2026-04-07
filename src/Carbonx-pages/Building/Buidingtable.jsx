import React, { useState, useEffect, useMemo } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Tippy from "@tippyjs/react";
import { useTable, useRowSelect, useSortBy, usePagination } from "react-table";
import GlobalFilter from "@/pages/table/react-tables/GlobalFilter";
import Logo from "../../assets/images/logo/SrpLogo.png";
import Modal from "@/components/ui/Modal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Icons from "@/components/ui/Icon";

const IndeterminateCheckbox = React.forwardRef(({ indeterminate, ...rest }, ref) => {
  const defaultRef = React.useRef();
  const resolvedRef = ref || defaultRef;
  React.useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);
  return <input type="checkbox" ref={resolvedRef} {...rest} className="table-checkbox" />;
});

const BuildingTable = () => {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);

  // **Controlled page index & size**
  const [controlledPageIndex, setControlledPageIndex] = useState(0);
  const [controlledPageSize, setControlledPageSize] = useState(10);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [selectedBuildingName, setSelectedBuildingName] = useState("");

  // **Reusable fetch function**
  const fetchBuildings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/building/Get-All-Buildings`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: { page: controlledPageIndex + 1, limit: controlledPageSize, search: globalFilterValue },
      });
      const data = res.data.data?.buildings || [];
      const pagination = res.data.data?.pagination || {};
      setBuildings(data);
      setPageCount(pagination.totalPages || 1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch buildings");
    } finally {
      setLoading(false);
      setIsPaginationLoading(false);
    }
  };

  const capitalizeLabel = (text) => {
    if (!text) return "N/A";

    const exceptions = [
      "and", "or", "in", "of", "from", "at", "to", "the", "a", "an", "for", "on", "with",
      "but", "by", "is", "it", "as", "be", "this", "that", "these", "those", "such",
      "if", "e.g.,", "i.e.", "kg", "via", "etc.", "vs.", "per", "e.g.", "on-site", "can", "will", "not", "cause", "onsite",
      "n.e.c.", "cc", "cc+",
    ];

    // Special handling for "a" and other special cases
    return text
      .split(" ")
      .map((word, index) => {
        const hasOpenParen = word.startsWith("(");
        const hasCloseParen = word.endsWith(")");

        let coreWord = word;
        if (hasOpenParen) coreWord = coreWord.slice(1);
        if (hasCloseParen) coreWord = coreWord.slice(0, -1);

        const lowerCore = coreWord.toLowerCase();
        let result;

        // SPECIAL RULE: If word is "a" or "A", preserve original case
        if (coreWord === "a" || coreWord === "A" || coreWord === "it" || coreWord === "IT" || coreWord === "if") {
          result = coreWord; // Keep as-is: "a" stays "a", "A" stays "A"
        }
        // Single letters (except "a" already handled)
        else if (coreWord.length === 1 && /^[A-Za-z]$/.test(coreWord)) {
          result = coreWord.toUpperCase();
        }
        // First word OR word after opening parenthesis should be capitalized
        else if (index === 0 || (index > 0 && text.split(" ")[index - 1]?.endsWith("("))) {
          result = coreWord.charAt(0).toUpperCase() + coreWord.slice(1);
        }
        // Exception words (excluding "a" which we already handled)
        else if (exceptions.includes(lowerCore) && lowerCore !== "a") {
          result = lowerCore;
        }
        // Normal capitalization
        else {
          result = coreWord.charAt(0).toUpperCase() + coreWord.slice(1);
        }

        // Reattach parentheses
        if (hasOpenParen) result = "(" + result;
        if (hasCloseParen) result = result + ")";

        return result;
      })
      .join(" ");
  };

  // **Fetch data when page, size, or filter changes**
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchBuildings();
    }, 300);

    return () => clearTimeout(delay);
  }, [controlledPageIndex, controlledPageSize, globalFilterValue]);

  // **Delete building**
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BASE_URL}/building/building/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Building deleted successfully");

      // Remove building from local state immediately
      setBuildings((prev) => prev.filter((b) => b._id !== id));

      // Adjust pagination if last item on the page was deleted
      if (buildings.length === 1 && controlledPageIndex > 0) {
        setControlledPageIndex((prev) => prev - 1);
      } else {
        // Refetch current page to update pagination properly
        fetchBuildings();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete building");
    }
  };


  const COLUMNS = useMemo(() => [
    { Header: "Sr.No", id: "serialNo", Cell: ({ row }) => <span>{row.index + 1 + controlledPageIndex * controlledPageSize}</span> },
    { Header: "Building Code", accessor: "buildingCode", Cell: ({ cell }) => cell.value || "N/A", },
    { Header: "Name", accessor: "buildingName" },
    { Header: "Country", accessor: "country", Cell: ({ cell }) => cell.value || "N/A", },
    { Header: "Location", accessor: "buildingLocation", Cell: ({ value }) => capitalizeLabel(value), },
    { Header: "Type", accessor: "buildingType", Cell: ({ value }) => capitalizeLabel(value), },
    { Header: "Area (m²)", accessor: "buildingArea", Cell: ({ cell }) => cell.value || "N/A", },
    { Header: "Employees", accessor: "numberOfEmployees", Cell: ({ cell }) => cell.value || "N/A", },
    { Header: "Cooling Type", accessor: "coolingType", Cell: ({ cell }) => cell.value || "N/A", },
    { Header: "Cooling Used", accessor: "coolingUsed", Cell: ({ cell }) => (cell.value ? "Yes" : "No") },
    { Header: "Electricity Consumption", accessor: "electricityConsumption", Cell: ({ cell }) => cell.value || "N/A", },
    { Header: "Heating Type", accessor: "heatingType", Cell: ({ cell }) => cell.value || "N/A", },
    { Header: "Heating Used", accessor: "heatingUsed", Cell: ({ cell }) => (cell.value ? "Yes" : "No") },
    { Header: "Steam Used", accessor: "steamUsed", Cell: ({ cell }) => (cell.value ? "Yes" : "No") },
    { Header: "Operating Hours", accessor: "operatingHours", Cell: ({ cell }) => cell.value || "N/A", },
    { Header: "Created At", accessor: "createdAt", Cell: ({ cell }) => (cell.value ? new Date(cell.value).toLocaleDateString() : "-") },
    { Header: "Updated At", accessor: "updatedAt", Cell: ({ cell }) => (cell.value ? new Date(cell.value).toLocaleDateString() : "-") },
    {
      Header: "Actions",
      accessor: "_id",
      Cell: ({ cell }) => (
        <div className="flex space-x-3 rtl:space-x-reverse">
          <Tippy content="View">
            <button className="action-btn" onClick={() => navigate(`/Building-Form/${cell.value}`, { state: { mode: "view" } })}>
              <Icon icon="heroicons:eye" className="text-green-600" />
            </button>
          </Tippy>
          <Tippy content="Edit">
            <button className="action-btn" onClick={() => navigate(`/Building-Form/${cell.value}`, { state: { mode: "edit" } })}>
              <Icon icon="heroicons:pencil-square" className="text-blue-600" />
            </button>
          </Tippy>
          <Tippy content="Delete">
            <button className="action-btn" onClick={() => {
              setSelectedBuildingId(cell.row.original._id);
              setSelectedBuildingName(cell.row.original.buildingName); // ✅ MUST
              setDeleteModalOpen(true);
            }}>
              <Icon icon="heroicons:trash" className="text-red-600" />
            </button>
          </Tippy>
        </div>
      ),
    },
  ], [navigate, controlledPageIndex, controlledPageSize]);

  const tableInstance = useTable(
    {
      columns: COLUMNS,
      data: buildings,
      manualPagination: true,
      pageCount,
      initialState: { pageIndex: controlledPageIndex, pageSize: controlledPageSize },
    },
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        { id: "selection", Header: ({ getToggleAllRowsSelectedProps }) => (<IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />), Cell: ({ row }) => <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} /> },
        ...columns,
      ]);
    }
  );

  const { getTableProps, getTableBodyProps, headerGroups, page, prepareRow } = tableInstance;

  // **Pagination handlers**
  const handlePageChange = (newPageIndex) => {
    setIsPaginationLoading(true);
    setControlledPageIndex(newPageIndex);
  };

  const handlePageSizeChange = (newSize) => {
    setIsPaginationLoading(true);
    setControlledPageSize(newSize);
    setControlledPageIndex(0); // Reset to first page
  };


  const exportToExcel = (data, fileName = "data") => {
    console.log("Export Data:", data); // 👈 DEBUG

    if (!data.length) {
      alert("No data to export");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Data");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    saveAs(new Blob([buffer]), `${fileName}.xlsx`);
  };



  const handleExportBeforeDelete = async (buildingId, buildingName, type) => {
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };

      let res;
      let data = [];

      if (type === "stationary") {
        res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/stationary/Get-All`,
          {
            headers,
            params: { buildingId, limit: 1000000 }
          }
        );
        data = res.data.data || [];
      }



      if (type === "automobile") {
        res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/AutoMobile/Get-All`,
          {
            headers,
            params: { buildingId, limit: 1000000 }
          }
        );
        data = res.data.data || [];
      }




      if (type === "fugitive") {
        res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/Fugitive/get-All`,
          {
            headers,
            params: { buildingId, limit: 1000000 }
          }
        );
        data = res.data.data || [];
      }

      if (type === "process-emission") {
        res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/Process-Emissions/Get-All`,
          {
            headers,
            params: { buildingId, limit: 1000000 }
          }
        );
        data = res.data.data || [];
      }

      if (type === "purchased-goods") {
        res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/Purchased-Goods-Services/get-All`,
          {
            headers,
            params: { buildingId, limit: 1000000 }
          }
        );
        data = res.data.data || [];
      }

      if (type === "capital-goods-services") {
        try {
          const res = await axios.get(
            `${process.env.REACT_APP_BASE_URL}/Purchased-Goods-Services/get-All-isCaptialGoods`,
            {
              headers,
              params: {
                buildingId: buildingId || undefined,
                limit: 1000000,
              },
            }
          );

          data = res.data?.data || [];

          console.log("Capital Goods Export Data:", data);

          if (!data.length) {
            console.warn("No capital goods data found");
          }
        } catch (error) {
          console.error("Capital Goods API Error:", error);
          data = [];
        }
      }

      if (type === "fuelandenergy") {
        res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/Fuel-And-Energy/get-All`,
          {
            headers,
            params: { buildingId, limit: 1000000 }
          }
        );
        data = res.data.data || [];
      }

      if (type === "waste-generate") {
        res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/Waste-Generate/List`,
          {
            headers,
            params: { buildingId, limit: 1000000 }
          }
        );
        data = res.data.data || [];
      }

      if (type === "business-travel") {
        res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/Business-Travel/List`,
          {
            headers,
            params: { buildingId, limit: 1000000 }
          }
        );
        data = res.data.data || [];
      }
     

       if (type === "employee-commute") {
        res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/employee-commute/List`,
          {
            headers,
            params: { buildingId, limit: 1000000 }
          }
        );
        data = res.data.data || [];
      }

      if (type === "upstream") {
        res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/upstream/Get-All`,
          {
            headers,
            params: { buildingId, limit: 1000000 }
          }
        );
        data = res.data.data || [];
      }


      if (type === "downstream") {
        res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/downstream/Get-All`,
          {
            headers,
            params: { buildingId, limit: 1000000 }
          }
        );
        data = res.data.data || [];
      }


      console.log("EXPORTED DATA:", data);

      // ✅ DIRECT EXPORT (NO FILTER)
      exportToExcel(data, `${type}_${buildingName}`);

    } catch (err) {
      console.error(err);
      alert("Export failed");
    }
  };

  return (
    <>
      <Card noborder>
        <div className="md:flex pb-6 items-center">
          <h6 className="flex-1 md:mb-0 ">Buildings</h6>
          <div className="md:flex md:space-x-3 items-center flex-none rtl:space-x-reverse">
            <GlobalFilter filter={globalFilterValue} setFilter={setGlobalFilterValue} />
            <Button
              icon="heroicons-outline:plus-sm"
              text="Add Building"
              className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
              iconClass="text-lg"
              onClick={() => navigate("/Building-Form/Add")}
            />
          </div>
        </div>

        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle">
            {/* Set fixed height for vertical scroll */}
            <div className="overflow-y-auto max-h-[calc(100vh-300px)] overflow-x-auto">
              {loading || isPaginationLoading ? (
                <div className="flex justify-center items-center py-8">
                  <img src={Logo} alt="Loading..." className="w-52 h-24" />
                </div>
              ) : (
                <table
                  className="min-w-full divide-y divide-slate-100 table-fixed"
                  {...getTableProps()}
                >
                  <thead className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] sticky top-0 z-10">
                    {headerGroups.map((headerGroup, idx) => (
                      <tr {...headerGroup.getHeaderGroupProps()} key={idx}>
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
                    {page.length === 0 ? (
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
                      page.map((row) => {
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
                max={pageCount}
                value={controlledPageIndex + 1}
                onChange={(e) => {
                  const pg = Number(e.target.value);
                  if (pg >= 1 && pg <= pageCount) handlePageChange(pg - 1);
                }}
                style={{ width: "70px" }}
              />
            </span>
            <span className="text-sm font-medium text-slate-600">
              Page {controlledPageIndex + 1} of {pageCount}
            </span>
          </div>

          <ul className="flex items-center space-x-3">
            <li>
              <button onClick={() => handlePageChange(0)} disabled={controlledPageIndex === 0}>
                <Icon icon="heroicons:chevron-double-left-solid" />
              </button>
            </li>
            <li>
              <button onClick={() => controlledPageIndex > 0 && handlePageChange(controlledPageIndex - 1)} disabled={controlledPageIndex === 0}>
                Prev
              </button>
            </li>
            {Array.from({ length: pageCount }, (_, i) => (
              <li key={i}>
                <button
                  className={`${i === controlledPageIndex ? "bg-slate-900 text-white font-medium" : "bg-slate-100 text-slate-900"} text-sm rounded h-6 w-6 flex items-center justify-center`}
                  onClick={() => handlePageChange(i)}
                >
                  {i + 1}
                </button>
              </li>
            ))}
            <li>
              <button onClick={() => controlledPageIndex < pageCount - 1 && handlePageChange(controlledPageIndex + 1)} disabled={controlledPageIndex === pageCount - 1}>
                Next
              </button>
            </li>
            <li>
              <button onClick={() => handlePageChange(pageCount - 1)} disabled={controlledPageIndex === pageCount - 1}>
                <Icon icon="heroicons:chevron-double-right-solid" />
              </button>
            </li>
          </ul>

          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-slate-600">Show</span>
            <select
              value={controlledPageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="form-select py-2"
            >
              {[10, 20, 30, 50].map((size) => (
                <option key={size} value={size}>{size}</option>
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
            {/* <Button
              text="Export Data"
              className="btn-success"
              onClick={() =>
                handleExportBeforeDelete(
                  selectedBuildingId,
                  selectedBuildingName
                )
              }
            /> */}

            <Button
              text="Cancel"
              className="btn-light"
              onClick={() => setDeleteModalOpen(false)}
            />

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
        <div className="space-y-5 w-full">

          {/* Header Warning Card */}
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center shadow-sm">
            <div className="text-red-600 text-lg font-bold mb-1">
              ⚠️ Delete Building Confirmation
            </div>
            <p className="text-sm text-red-500">
              This action will permanently remove all associated data.
            </p>

            <div className="mt-3 text-gray-700">
              <span className="font-semibold">Building:</span>{" "}
              <span className="text-gray-900">{selectedBuildingName}</span>
            </div>
          </div>

          {/* Export Section Title */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-700">
              Export Data Before Deletion
            </h3>
            <p className="text-xs text-slate-500">
              Download all related records for backup
            </p>
          </div>

          {/* Export Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Stationary */}
            <div className="rounded-xl border bg-white shadow hover:shadow-lg transition p-4 text-center">
              <div className="text-slate-700 font-semibold mb-3 text-sm">
                Stationary
              </div>
              <button
                onClick={() =>
                  handleExportBeforeDelete(
                    selectedBuildingId,
                    selectedBuildingName,
                    "stationary"
                  )
                }
                className="group w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-white-500 to-white-600 text-white font-medium hover:scale-105 transition"
              >
                <Icon
                  icon="vscode-icons:file-type-excel"
                  className="w-10 h-10 group-hover:scale-110 transition"
                />
              </button>
            </div>

            {/* Automobile */}
            <div className="rounded-xl border bg-white shadow hover:shadow-lg transition p-3 text-center">
              <div className="text-slate-700 font-semibold mb-3 text-sm">
                Mobile
              </div>
              <button
                onClick={() =>
                  handleExportBeforeDelete(selectedBuildingId, selectedBuildingName, "automobile")
                }
                className="group w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-white-500 to-white-600 text-white font-medium hover:scale-105 transition"
              >
                <Icon
                  icon="vscode-icons:file-type-excel"
                  className="w-10 h-10 group-hover:scale-110 transition"
                />
              </button>
            </div>

            {/* Fugitive */}
            <div className="rounded-xl border bg-white shadow hover:shadow-lg transition p-4 text-center">
              <div className="text-slate-700 font-semibold mb-3 text-sm">
                Fugitive
              </div>
              <button
                onClick={() =>
                  handleExportBeforeDelete(selectedBuildingId, selectedBuildingName, "fugitive")
                }
                className="group w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-white-500 to-white-600 text-white font-medium hover:scale-105 transition"
              >
                <Icon
                  icon="vscode-icons:file-type-excel"
                  className="w-10 h-10 group-hover:scale-110 transition"
                />
              </button>
            </div>
            <div className="rounded-xl border bg-white shadow hover:shadow-lg transition p-4 text-center">
              <div className="text-slate-700 font-semibold mb-3 text-sm">
                Process-Emission
              </div>
              <button
                onClick={() =>
                  handleExportBeforeDelete(selectedBuildingId, selectedBuildingName, "process-emission")
                }
                className="group w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-white-500 to-white-600 text-white font-medium hover:scale-105 transition"
              >
                <Icon
                  icon="vscode-icons:file-type-excel"
                  className="w-10 h-10 group-hover:scale-110 transition"
                />
              </button>
            </div>
            <div className="rounded-xl border bg-white shadow hover:shadow-lg transition p-3 text-center">
              <div className="text-slate-700 font-semibold mb-3 text-sm">
                Purchased Goods Service
              </div>
              <button
                onClick={() =>
                  handleExportBeforeDelete(selectedBuildingId, selectedBuildingName, "purchased-goods")
                }
                className="group w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-white-500 to-white-600 text-white font-medium hover:scale-105 transition"
              >
                <Icon
                  icon="vscode-icons:file-type-excel"
                  className="w-10 h-10 group-hover:scale-110 transition"
                />
              </button>
            </div>
            <div className="rounded-xl border bg-white shadow hover:shadow-lg transition p-3 text-center">
              <div className="text-slate-700 font-semibold mb-3 text-sm">
                Capital Goods Service
              </div>
              <button
                onClick={() =>
                  handleExportBeforeDelete(selectedBuildingId, selectedBuildingName, "capital-goods-services")
                }
                className="group w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-white-500 to-white-600 text-white font-medium hover:scale-105 transition"
              >
                <Icon
                  icon="vscode-icons:file-type-excel"
                  className="w-10 h-10 group-hover:scale-110 transition"
                />
              </button>
            </div>
            <div className="rounded-xl border bg-white shadow hover:shadow-lg transition p-3 text-center">
              <div className="text-slate-700 font-semibold mb-3 text-sm">
                Fuel and Energy
              </div>
              <button
                onClick={() =>
                  handleExportBeforeDelete(selectedBuildingId, selectedBuildingName, "fuelandenergy")
                }
                className="group w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-white-500 to-white-600 text-white font-medium hover:scale-105 transition"
              >
                <Icon
                  icon="vscode-icons:file-type-excel"
                  className="w-10 h-10 group-hover:scale-110 transition"
                />
              </button>
            </div>
            <div className="rounded-xl border bg-white shadow hover:shadow-lg transition p-3 text-center">
              <div className="text-slate-700 font-semibold mb-3 text-sm">
                Waste Generate
              </div>
              <button
                onClick={() =>
                  handleExportBeforeDelete(selectedBuildingId, selectedBuildingName, "waste-generate")
                }
                className="group w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-white-500 to-white-600 text-white font-medium hover:scale-105 transition"
              >
                <Icon
                  icon="vscode-icons:file-type-excel"
                  className="w-10 h-10 group-hover:scale-110 transition"
                />
              </button>
            </div>
            <div className="rounded-xl border bg-white shadow hover:shadow-lg transition p-3 text-center">
              <div className="text-slate-700 font-semibold mb-3 text-sm">
                Business Travel
              </div>
              <button
                onClick={() =>
                  handleExportBeforeDelete(selectedBuildingId, selectedBuildingName, "business-travel")
                }
                className="group w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-white-500 to-white-600 text-white font-medium hover:scale-105 transition"
              >
                <Icon
                  icon="vscode-icons:file-type-excel"
                  className="w-10 h-10 group-hover:scale-110 transition"
                />
              </button>
            </div>
            <div className="rounded-xl border bg-white shadow hover:shadow-lg transition p-3 text-center">
              <div className="text-slate-700 font-semibold mb-3 text-sm">
                Upstream
              </div>
              <button
                onClick={() =>
                  handleExportBeforeDelete(selectedBuildingId, selectedBuildingName, "upstream")
                }
                className="group w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-white-500 to-white-600 text-white font-medium hover:scale-105 transition"
              >
                <Icon
                  icon="vscode-icons:file-type-excel"
                  className="w-10 h-10 group-hover:scale-110 transition"
                />
              </button>
            </div>
            <div className="rounded-xl border bg-white shadow hover:shadow-lg transition p-3 text-center">
              <div className="text-slate-700 font-semibold mb-3 text-sm">
                Downstream
              </div>
              <button
                onClick={() =>
                  handleExportBeforeDelete(selectedBuildingId, selectedBuildingName, "downstream")
                }
                className="group w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-white-500 to-white-600 text-white font-medium hover:scale-105 transition"
              >
                <Icon
                  icon="vscode-icons:file-type-excel"
                  className="w-10 h-10 group-hover:scale-110 transition"
                />
              </button>
            </div>
             <div className="rounded-xl border bg-white shadow hover:shadow-lg transition p-3 text-center">
              <div className="text-slate-700 font-semibold mb-3 text-sm">
                Employee Commute
              </div>
              <button
                onClick={() =>
                  handleExportBeforeDelete(selectedBuildingId, selectedBuildingName, "employee-commute")
                }
                className="group w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-white-500 to-white-600 text-white font-medium hover:scale-105 transition"
              >
                <Icon
                  icon="vscode-icons:file-type-excel"
                  className="w-10 h-10 group-hover:scale-110 transition"
                />
              </button>
            </div>





          </div>
        </div>
      </Modal>
    </>
  );
};
export default BuildingTable;
