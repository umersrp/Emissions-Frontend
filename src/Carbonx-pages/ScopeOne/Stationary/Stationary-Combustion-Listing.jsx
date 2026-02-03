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
import { formatUnitDisplay } from "@/constant/scope1/stationary-data";

// Import reusable components and hooks
import CSVUploadModal from "@/components/ui/CSVUploadModal";
import useStationaryCSVUpload from "@/hooks/scope1/useStationaryCSVUpload";

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
  const [bulkUploadModalOpen, setBulkUploadModalOpen] = useState(false);
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

  // CSV Upload using custom hook
  const [buildings, setBuildings] = useState([]);
  const {
    csvState,
    handleFileSelect,
    processUpload,
    resetUpload,
    downloadStationaryTemplate,
  } = useStationaryCSVUpload(buildings);

  const capitalizeLabel = (text) => {
    if (!text) return "N/A";

    const exceptions = [
      "and", "or", "in", "of", "from", "at", "to", "the", "a", "an", "for", "on", "with",
      "but", "by", "is", "it", "as", "be", "this", "that", "these", "those", "such",
      "if", "e.g.,", "i.e.", "kg", "via", "etc.", "vs.", "per", "e.g.", "on-site", "can", "will", "not", "cause", "onsite",
      "n.e.c.", "cc", "cc+",
    ];

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

        if (coreWord === "a" || coreWord === "A" || coreWord === "it" || coreWord === "IT") {
          result = coreWord;
        }
        else if (coreWord.length === 1 && /^[A-Za-z]$/.test(coreWord)) {
          result = coreWord.toUpperCase();
        }
        else if (index === 0 || (index > 0 && text.split(" ")[index - 1]?.endsWith("("))) {
          result = coreWord.charAt(0).toUpperCase() + coreWord.slice(1);
        }
        else if (exceptions.includes(lowerCore) && lowerCore !== "a") {
          result = lowerCore;
        }
        else {
          result = coreWord.charAt(0).toUpperCase() + coreWord.slice(1);
        }

        if (hasOpenParen) result = "(" + result;
        if (hasCloseParen) result = result + ")";

        return result;
      })
      .join(" ");
  };

  const fetchStationaryRecords = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/stationary/Get-All?page=${page}&limit=${pagination.limit}&search=${search}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setRecords(res.data.data || []);

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

  const [goToValue, setGoToValue] = useState(pagination.currentPage);

  useEffect(() => {
    setGoToValue(pagination.currentPage);
  }, [pagination.currentPage]);

  useEffect(() => {
    fetchStationaryRecords(pagination.currentPage, globalFilterValue);
  }, [pagination.currentPage, pagination.limit]);

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

  // FIXED: Handle file selection properly
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

  // FIXED: Add error handling for upload
  const handleCSVUpload = async () => {
    try {
      const results = await processUpload();
      if (results && results.failed === 0) {
        fetchStationaryRecords(pagination.currentPage);
        setBulkUploadModalOpen(false);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    }
  };

  const COLUMNS = useMemo(
    () => [
      {
        Header: "Sr.No",
        id: "serialNo",
        Cell: ({ row }) => (
          <span>{(pagination.currentPage - 1) * pagination.limit + row.index + 1}</span>
        ),
      },
      { Header: "Building", accessor: "buildingId.buildingName", Cell: ({ value }) => capitalizeLabel(value) },
      { Header: "Stakeholder", accessor: "stakeholder", Cell: ({ value }) => capitalizeLabel(value) },
      { Header: "Equipment Type", accessor: "equipmentType", Cell: ({ value }) => capitalizeLabel(value) },
      { Header: "Fuel Type", accessor: "fuelType" },
      { Header: "Fuel Name", accessor: "fuelName", Cell: ({ value }) => capitalizeLabel(value) },
      { Header: "Fuel Consumption", accessor: "fuelConsumption" },
      {
        Header: "Consumption Unit",
        accessor: "consumptionUnit",
        Cell: ({ value }) => formatUnitDisplay(value)
      },
      { Header: "Quality Control", accessor: "qualityControl" },
      {
        Header: "Calculated Emissions (kgCO₂e)", accessor: "calculatedEmissionKgCo2e",
        Cell: ({ cell }) => {
          const rawValue = cell.value;
          if (rawValue === null || rawValue === undefined || rawValue === "") {
            return "N/A";
          }
          const numValue = Number(rawValue);
          if (isNaN(numValue)) {
            return "N/A";
          }
          return numValue.toFixed(2);
        }
      },
      {
        Header: "Calculated Emissions (tCO₂e)",
        accessor: "calculatedEmissionTCo2e",
        Cell: ({ cell }) => {
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
        }
      },
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
        Header: "Posting Date", accessor: "postingDate",
        Cell: ({ cell }) => {
          if (!cell.value) return "N/A";
          try {
            return new Date(cell.value).toLocaleDateString('en-GB');
          } catch {
            return "Invalid Date";
          }
        }
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
              icon="heroicons:document-arrow-up"
              text="Bulk Upload CSV"
              className="btn font-normal btn-sm bg-gradient-to-r from-[#8A3AB8] to-[#3A90B8] text-white border-0 hover:opacity-90"
              iconClass="text-lg"
              onClick={() => setBulkUploadModalOpen(true)}
            />

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

        {/* Pagination */}
        <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
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

          <ul className="flex items-center space-x-3 rtl:space-x-reverse">
            <li>
              <button
                onClick={() => setPagination((p) => ({ ...p, currentPage: 1 }))}
                disabled={pagination.currentPage === 1}
                className={`${pagination.currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Icon icon="heroicons:chevron-double-left-solid" />
              </button>
            </li>

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

      {/* Delete Confirmation Modal */}
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

      {/* Reusable CSV Upload Modal */}
      <CSVUploadModal
        activeModal={bulkUploadModalOpen}
        onClose={() => setBulkUploadModalOpen(false)}
        title="Bulk Upload Stationary Records"
        csvState={csvState}
        onFileSelect={handleCSVFileSelect}
        onUpload={handleCSVUpload}
        onReset={resetUpload}
        onDownloadTemplate={downloadStationaryTemplate}
        templateInstructions={(
          <ol className="text-sm text-blue-700 space-y-1 list-decimal pl-4">
            <li>Download the template below</li>
            <li>Fill in your data (keep column headers as is)</li>
            <li>Save as CSV file</li>
            <li>Upload using the form below</li>
            <li>Review validation results and submit</li>
          </ol>
        )}
      />
    </>
  );
};

export default StationaryCombustionListing;
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
// import { formatUnitDisplay } from "@/constant/scope1/stationary-data";
// import {
//   stakeholderOptions,
//   equipmentTypeOptions,
//   fuelTypeOptions,
//   fuelNameOptionsByType,
//   qualityControlOptions,
//   fuelUnitOptionsByName,
// } from "@/constant/scope1/stationary-data";
// import { calculateStationaryEmissions } from "@/utils/scope1/calculate-stationary-emissions";

// const IndeterminateCheckbox = React.forwardRef(({ indeterminate, ...rest }, ref) => {
//   const defaultRef = React.useRef();
//   const resolvedRef = ref || defaultRef;
//   React.useEffect(() => {
//     resolvedRef.current.indeterminate = indeterminate;
//   }, [resolvedRef, indeterminate]);
//   return <input type="checkbox" ref={resolvedRef} {...rest} className="table-checkbox" />;
// });

// const StationaryCombustionListing = () => {
//   const navigate = useNavigate();

//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [globalFilterValue, setGlobalFilterValue] = useState("");
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [bulkUploadModalOpen, setBulkUploadModalOpen] = useState(false);
//   const [selectedBuildingId, setSelectedBuildingId] = useState(null);
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     totalCount: 0,
//     limit: 10,
//     hasNextPage: false,
//     hasPrevPage: false,
//     nextPage: null,
//     prevPage: null,
//   });

//   // CSV Upload States
//   const [csvFile, setCsvFile] = useState(null);
//   const [csvUploading, setCsvUploading] = useState(false);
//   const [csvProgress, setCsvProgress] = useState(0);
//   const [csvResults, setCsvResults] = useState(null);
//   const [csvValidationErrors, setCsvValidationErrors] = useState([]);
//   const [buildings, setBuildings] = useState([]);

//   const capitalizeLabel = (text) => {
//     if (!text) return "N/A";

//     const exceptions = [
//       "and", "or", "in", "of", "from", "at", "to", "the", "a", "an", "for", "on", "with",
//       "but", "by", "is", "it", "as", "be", "this", "that", "these", "those", "such",
//       "if", "e.g.,", "i.e.", "kg", "via", "etc.", "vs.", "per", "e.g.", "on-site", "can", "will", "not", "cause", "onsite",
//       "n.e.c.", "cc", "cc+",
//     ];

//     // Special handling for "a" and other special cases
//     return text
//       .split(" ")
//       .map((word, index) => {
//         const hasOpenParen = word.startsWith("(");
//         const hasCloseParen = word.endsWith(")");

//         let coreWord = word;
//         if (hasOpenParen) coreWord = coreWord.slice(1);
//         if (hasCloseParen) coreWord = coreWord.slice(0, -1);

//         const lowerCore = coreWord.toLowerCase();
//         let result;

//         // SPECIAL RULE: If word is "a" or "A", preserve original case
//         if (coreWord === "a" || coreWord === "A" || coreWord === "it" || coreWord === "IT") {
//           result = coreWord; // Keep as-is: "a" stays "a", "A" stays "A"
//         }
//         // Single letters (except "a" already handled)
//         else if (coreWord.length === 1 && /^[A-Za-z]$/.test(coreWord)) {
//           result = coreWord.toUpperCase();
//         }
//         // First word OR word after opening parenthesis should be capitalized
//         else if (index === 0 || (index > 0 && text.split(" ")[index - 1]?.endsWith("("))) {
//           result = coreWord.charAt(0).toUpperCase() + coreWord.slice(1);
//         }
//         // Exception words (excluding "a" which we already handled)
//         else if (exceptions.includes(lowerCore) && lowerCore !== "a") {
//           result = lowerCore;
//         }
//         // Normal capitalization
//         else {
//           result = coreWord.charAt(0).toUpperCase() + coreWord.slice(1);
//         }

//         // Reattach parentheses
//         if (hasOpenParen) result = "(" + result;
//         if (hasCloseParen) result = result + ")";

//         return result;
//       })
//       .join(" ");
//   };

//   const fetchStationaryRecords = async (page = 1, search = "") => {
//     setLoading(true);
//     try {
//       const res = await axios.get(
//         `${process.env.REACT_APP_BASE_URL}/stationary/Get-All?page=${page}&limit=${pagination.limit}&search=${search}`,
//         {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         }
//       );

//       setRecords(res.data.data || []);

//       const meta = res.data.meta || {};

//       setPagination({
//         currentPage: meta.currentPage || 1,
//         totalPages: meta.totalPages || 1,
//         totalCount: meta.totalRecords || 0,
//         limit: meta.limit || 10,
//         hasNextPage: meta.currentPage < meta.totalPages,
//         hasPrevPage: meta.currentPage > 1,
//         nextPage: meta.currentPage < meta.totalPages ? meta.currentPage + 1 : null,
//         prevPage: meta.currentPage > 1 ? meta.currentPage - 1 : null,
//       });
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to fetch records");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch buildings for CSV validation
//   const fetchBuildings = async () => {
//     try {
//       const res = await axios.get(
//         `${process.env.REACT_APP_BASE_URL}/building/Get-All-Buildings?limit=1000`,
//         {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
//         }
//       );
//       setBuildings(res.data?.data?.buildings || []);
//     } catch {
//       console.error("Failed to load buildings");
//     }
//   };

//   useEffect(() => {
//     fetchBuildings();
//   }, []);

//   const [goToValue, setGoToValue] = useState(pagination.currentPage);

//   useEffect(() => {
//     setGoToValue(pagination.currentPage);
//   }, [pagination.currentPage]);

//   useEffect(() => {
//     fetchStationaryRecords(pagination.currentPage, globalFilterValue);
//   }, [pagination.currentPage, pagination.limit]);

//   useEffect(() => {
//     const delayDebounce = setTimeout(() => {
//       fetchStationaryRecords(1, globalFilterValue);
//     }, 600);
//     return () => clearTimeout(delayDebounce);
//   }, [globalFilterValue]);

//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`${process.env.REACT_APP_BASE_URL}/stationary/Delete/${id}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//       });
//       toast.success("Record deleted successfully");
//       fetchStationaryRecords(pagination.currentPage);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to delete record");
//     }
//   };

//   // ==================== CSV UPLOAD FUNCTIONS ====================
//   const cleanCSVValue = (value) => {
//     if (typeof value !== 'string') return value;
//     // Remove ALL quotes (single and double) from the string
//     let cleaned = value.replace(/["']/g, '');
//     // Remove Excel/Google Sheets formatting
//     cleaned = cleaned.replace(/^=/, ''); // Remove = sign if formula
//     // Clean date format - remove time part
//     if (cleaned.includes('T00:00:00.000Z')) {
//       cleaned = cleaned.replace('T00:00:00.000Z', '');
//     }
//     // Also handle other date formats
//     if (cleaned.includes('T')) {
//       cleaned = cleaned.split('T')[0];
//     }
//     return cleaned.trim();
//   };

//   const downloadCSVTemplate = () => {
//     // Take first few buildings for example
//     const exampleBuildings = buildings.slice(0, 3);
//     const buildingList = exampleBuildings.map(b => `${b._id},${b.buildingName || 'Unnamed'}`).join('\n');

//     // Get some example values
//     const exampleStakeholder = stakeholderOptions[0]?.value || 'Assembly';
//     const exampleEquipment = equipmentTypeOptions.find(e => e.value === 'Amine Reboilers')?.value || 'Amine Reboilers';
//     const exampleFuelType = 'Liquid Fuel';
//     const exampleFuelName = 'Diesel';
//     const exampleUnit = 'kg';
//     const exampleQC = 'Good';

//     const template = `=== IMPORTANT: DO NOT USE QUOTES ===
// Fill data WITHOUT quotes around values

// === SAMPLE DATA FORMAT ===
// buildingId,stakeholder,equipmentType,fuelType,fuelName,fuelConsumption,consumptionUnit,qualityControl,remarks,postingDate
// 64f8a1b2c3d4e5f6a7b8c9d0,${exampleStakeholder},${exampleEquipment},${exampleFuelType},${exampleFuelName},100,${exampleUnit},${exampleQC},record 1,2024-01-15
// 64f8a1b2c3d4e5f6a7b8c9d1,Commercial,Generator,Gaseous Fuel,Natural Gas,50,m³,Fair,,2024-01-16

// === BUILDING REFERENCE (first 3) ===
// ${buildingList}

// === QUICK REFERENCE ===
// - Stakeholder options start with: ${stakeholderOptions.slice(0, 3).map(s => s.value).join(', ')}...
// - Equipment includes: Amine Reboilers, Boiler, Generator, etc.
// - Fuel Types: Gaseous Fuel, Liquid Fuel, Solid Fuel, Bio Liquid Fuel, Bio Gaseous Fuel, Biomass Fuel
// - Fuel Names: For Liquid Fuel: Diesel, Gasoline, Kerosene, Fuel Oil
// - Units: kg, L, m³, etc.
// - Quality: Highly Uncertain, Uncertain, Fair, Good, Exact
// - Date: YYYY-MM-DD (e.g., 2024-01-15)`;

//     const blob = new Blob([template], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'stationary_template_NO_QUOTES.txt';
//     document.body.appendChild(a);
//     a.click();
//     URL.revokeObjectURL(url);
//     document.body.removeChild(a);

//     toast.success('Template downloaded! DO NOT use quotes around values');
//   };

//   // Enhanced CSV parsing to handle triple quotes and quoted values with commas
//   const parseCSV = (file) => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         try {
//           const csvText = event.target.result;
//           const lines = csvText.split('\n');

//           // Skip empty lines
//           const dataLines = lines.filter(line => line.trim() !== '');

//           if (dataLines.length === 0) {
//             reject(new Error('CSV file is empty'));
//             return;
//           }

//           // Debug: Log what we're getting
//           console.log('First few lines:', dataLines.slice(0, 3));

//           // Find header row - look for line containing buildingId
//           // Find the header row - look for line containing buildingId
//           let headerRowIndex = -1;
//           for (let i = 0; i < dataLines.length; i++) {
//             const line = dataLines[i];
//             const cleanLine = line.replace(/"/g, ''); // Remove quotes for matching
//             // Check if this line contains the header keywords (case-insensitive)
//             if (cleanLine.toLowerCase().includes('buildingid') &&
//               cleanLine.toLowerCase().includes('stakeholder')) {
//               headerRowIndex = i;
//               break;
//             }
//           }

//           console.log('Header row index found at:', headerRowIndex);

//           if (headerRowIndex === -1) {
//             reject(new Error('CSV must contain header row with: buildingId, stakeholder, equipmentType, fuelType, fuelName, fuelConsumption, consumptionUnit, qualityControl, remarks, postingDate'));
//             return;
//           }

//           // Parse header row with better quote handling
//           const headerLine = dataLines[headerRowIndex];
//           console.log('Header line:', headerLine);

//           // Clean and parse headers
//           const headers = headerLine.split(',').map(h =>
//             cleanCSVValue(h).toLowerCase().replace(/\s+/g, '')
//           );

//           console.log('Parsed headers:', headers);

//           const expectedHeaders = [
//             'buildingid', 'stakeholder', 'equipmenttype', 'fueltype',
//             'fuelname', 'fuelconsumption', 'consumptionunit', 'qualitycontrol', 'remarks', 'postingdate'
//           ];

//           // Check if all required headers are present
//           const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
//           if (missingHeaders.length > 0) {
//             reject(new Error(`Missing required columns: ${missingHeaders.join(', ')}`));
//             return;
//           }

//           const data = [];

//           // Process data rows (start after header row)
//           for (let i = headerRowIndex + 1; i < dataLines.length; i++) {
//             const line = dataLines[i].trim();
//             if (!line) continue;

//             console.log('Processing line:', line);

//             // Parse CSV line with improved quote handling
//             const values = [];
//             let inQuotes = false;
//             let currentValue = '';
//             let quoteCount = 0;

//             for (let j = 0; j < line.length; j++) {
//               const char = line[j];

//               if (char === '"') {
//                 quoteCount++;
//                 if (j + 2 < line.length && line[j + 1] === '"' && line[j + 2] === '"') {
//                   // Triple quotes - skip all three
//                   j += 2;
//                   // Don't add quotes to value
//                 } else if (j + 1 < line.length && line[j + 1] === '"') {
//                   // Escaped quote inside quotes
//                   currentValue += '"';
//                   j++;
//                 } else {
//                   // Single quote - toggle inQuotes
//                   inQuotes = !inQuotes;
//                 }
//               } else if (char === ',' && !inQuotes) {
//                 values.push(currentValue);
//                 currentValue = '';
//               } else {
//                 currentValue += char;
//               }
//             }

//             // Add the last value
//             values.push(currentValue);

//             console.log('Parsed values:', values);

//             // Clean and map values to headers
//             const row = {};
//             headers.forEach((header, index) => {
//               if (index < values.length) {
//                 row[header] = cleanCSVValue(values[index]);
//               } else {
//                 row[header] = '';
//               }
//             });

//             console.log('Row object:', row);

//             // Only add row if it has at least some data
//             const hasData = Object.values(row).some(val => val && val.trim() !== '');
//             if (hasData) {
//               data.push(row);
//             }
//           }

//           console.log('Final parsed data:', data);
//           resolve(data);
//         } catch (error) {
//           console.error('Detailed parsing error:', error);
//           reject(new Error(`Error parsing CSV: ${error.message}`));
//         }
//       };
//       reader.onerror = () => reject(new Error('Failed to read file'));
//       reader.readAsText(file);
//     });
//   };
//   const validateCSVRow = (row, index) => {
//     const errors = [];
//     const rowNum = index + 1;

//     // Clean the row values first
//     const cleanedRow = {};
//     Object.keys(row).forEach(key => {
//       cleanedRow[key] = cleanCSVValue(row[key]);
//     });

//     const requiredFields = [
//       'buildingid', 'stakeholder', 'equipmenttype', 'fueltype',
//       'fuelname', 'fuelconsumption', 'consumptionunit', 'qualitycontrol'
//     ];

//     // Check required fields
//     requiredFields.forEach(field => {
//       if (!cleanedRow[field] || cleanedRow[field].toString().trim() === '') {
//         errors.push(`${field} is required`);
//       }
//     });

//     // Validate building ID
//     if (cleanedRow.buildingid) {
//       const cleanBuildingId = cleanedRow.buildingid.replace(/"/g, '');
//       const buildingExists = buildings.some(b => b._id === cleanBuildingId);
//       if (!buildingExists && buildings.length > 0) {
//         errors.push(`Invalid building ID "${cleanedRow.buildingid}"`);
//       }
//     }

//     // Validate stakeholder with case-insensitive matching
//     if (cleanedRow.stakeholder) {
//       const validStakeholders = stakeholderOptions.map(s => s.value);
//       const matchedStakeholder = validStakeholders.find(s =>
//         s.toLowerCase() === cleanedRow.stakeholder.toLowerCase()
//       );
//       if (!matchedStakeholder) {
//         errors.push(`Invalid stakeholder "${cleanedRow.stakeholder}". Valid options: ${validStakeholders.slice(0, 5).join(', ')}...`);
//       } else {
//         cleanedRow.stakeholder = matchedStakeholder;
//       }
//     }

//     // Validate equipment type with case-insensitive matching
//     if (cleanedRow.equipmenttype) {
//       const validEquipment = equipmentTypeOptions.map(e => e.value);
//       const matchedEquipment = validEquipment.find(e =>
//         e.toLowerCase() === cleanedRow.equipmenttype.toLowerCase()
//       );
//       if (!matchedEquipment) {
//         errors.push(`Invalid equipment type "${cleanedRow.equipmenttype}"`);
//       } else {
//         cleanedRow.equipmenttype = matchedEquipment;
//       }
//     }

//     // Validate fuel type with case-insensitive matching
//     if (cleanedRow.fueltype) {
//       const validFuelTypes = fuelTypeOptions.map(f => f.value);
//       const matchedFuelType = validFuelTypes.find(f =>
//         f.toLowerCase() === cleanedRow.fueltype.toLowerCase()
//       );
//       if (!matchedFuelType) {
//         errors.push(`Invalid fuel type "${cleanedRow.fueltype}". Valid: ${validFuelTypes.join(', ')}`);
//       } else {
//         cleanedRow.fueltype = matchedFuelType;
//       }
//     }

//     // Validate fuel name based on fuel type
//     if (cleanedRow.fueltype && cleanedRow.fuelname) {
//       const validFuelNames = fuelNameOptionsByType[cleanedRow.fueltype]?.map(f => f.value) || [];
//       const matchedFuelName = validFuelNames.find(f =>
//         f.toLowerCase() === cleanedRow.fuelname.toLowerCase()
//       );
//       if (!matchedFuelName) {
//         errors.push(`Invalid fuel name "${cleanedRow.fuelname}" for type "${cleanedRow.fueltype}"`);
//       } else {
//         cleanedRow.fuelname = matchedFuelName;
//       }
//     }

//     // Validate fuel consumption - handle quoted numbers
//     if (cleanedRow.fuelconsumption) {
//       // Remove any non-numeric characters except decimal point and minus sign
//       const cleanNum = cleanedRow.fuelconsumption.toString()
//         .replace(/[^0-9.-]/g, '')
//         .replace(/^"+|"+$/g, ''); // Remove any remaining quotes

//       const num = Number(cleanNum);
//       if (isNaN(num)) {
//         errors.push(`Fuel consumption must be a number, got "${cleanedRow.fuelconsumption}"`);
//       } else if (num < 0) {
//         errors.push('Fuel consumption cannot be negative');
//       } else {
//         cleanedRow.fuelconsumption = num.toString();
//       }
//     }

//     // Validate consumption unit
//     if (cleanedRow.consumptionunit) {
//       // Get all possible units
//       const allUnits = [
//         ...fuelUnitOptionsByName.default,
//         ...(cleanedRow.fuelname ? fuelUnitOptionsByName[cleanedRow.fuelname] || [] : [])
//       ];

//       // Clean the unit
//       const cleanUnit = cleanedRow.consumptionunit.replace(/"/g, '').toLowerCase();
//       const matchedUnit = allUnits.find(u => u.toLowerCase() === cleanUnit);

//       if (!matchedUnit) {
//         errors.push(`Invalid consumption unit "${cleanedRow.consumptionunit}". Valid options include: ${allUnits.slice(0, 5).join(', ')}...`);
//       } else {
//         cleanedRow.consumptionunit = matchedUnit;
//       }
//     }

//     // Validate quality control
//     if (cleanedRow.qualitycontrol) {
//       const validQC = qualityControlOptions.map(q => q.value);
//       const matchedQC = validQC.find(q =>
//         q.toLowerCase() === cleanedRow.qualitycontrol.toLowerCase()
//       );
//       if (!matchedQC) {
//         errors.push(`Invalid quality control "${cleanedRow.qualitycontrol}". Valid: ${validQC.join(', ')}`);
//       } else {
//         cleanedRow.qualitycontrol = matchedQC;
//       }
//     }

//     // Validate date format
//     if (cleanedRow.postingdate) {
//       let dateStr = cleanedRow.postingdate;
//       // Remove time part if present
//       if (dateStr.includes('T')) {
//         dateStr = dateStr.split('T')[0];
//       }
//       // Remove any quotes
//       dateStr = dateStr.replace(/"/g, '');

//       const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
//       if (!dateRegex.test(dateStr)) {
//         errors.push(`Date must be YYYY-MM-DD format, got "${cleanedRow.postingdate}"`);
//       } else {
//         // Validate it's a valid date
//         const date = new Date(dateStr);
//         if (isNaN(date.getTime())) {
//           errors.push(`Invalid date "${dateStr}"`);
//         } else {
//           cleanedRow.postingdate = dateStr;
//         }
//       }
//     }

//     // If no errors, update the original row with cleaned values
//     if (errors.length === 0) {
//       Object.keys(cleanedRow).forEach(key => {
//         row[key] = cleanedRow[key];
//       });
//     }

//     return errors;
//   };

//   const handleCSVFileSelect = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (!file.name.endsWith('.csv')) {
//       toast.error('Please select a CSV file');
//       return;
//     }

//     if (file.size > 10 * 1024 * 1024) {
//       toast.error('File size must be less than 10MB');
//       return;
//     }

//     setCsvFile(file);
//     setCsvValidationErrors([]);
//     setCsvResults(null);

//     try {
//       const data = await parseCSV(file);

//       const errors = [];
//       data.forEach((row, index) => {
//         const rowErrors = validateCSVRow(row, index);
//         if (rowErrors.length > 0) {
//           errors.push(`Row ${index + 1}: ${rowErrors.join(', ')}`);
//         }
//       });

//       setCsvValidationErrors(errors);

//       if (errors.length === 0) {
//         toast.success(`CSV validated: ${data.length} rows ready for upload`);
//       } else {
//         toast.warning(`Found ${errors.length} validation errors. Please fix them before uploading.`);
//       }
//     } catch (error) {
//       toast.error(`Error parsing CSV: ${error.message}`);
//       console.error('CSV parsing error:', error);
//     }
//   };

//   const processCSVUpload = async () => {
//     if (!csvFile || csvValidationErrors.length > 0) {
//       toast.error('Please fix validation errors first');
//       return;
//     }

//     setCsvUploading(true);
//     setCsvProgress(0);

//     try {
//       const data = await parseCSV(csvFile);
//       const totalRows = data.length;
//       const results = {
//         success: 0,
//         failed: 0,
//         errors: []
//       };

//       for (let i = 0; i < totalRows; i++) {
//         const row = data[i];

//         try {
//           // Calculate emissions using the same function as your form
//           const emissions = calculateStationaryEmissions(
//             row.fuelname,
//             Number(row.fuelconsumption),
//             row.consumptionunit
//           );

//           const payload = {
//             buildingId: row.buildingid.trim(),
//             stakeholder: row.stakeholder,
//             equipmentType: row.equipmenttype,
//             fuelType: row.fueltype,
//             fuelName: row.fuelname,
//             fuelConsumption: parseFloat(row.fuelconsumption),
//             consumptionUnit: row.consumptionunit,
//             qualityControl: row.qualitycontrol,
//             remarks: row.remarks || '',
//             postingDate: row.postingdate || new Date().toISOString().split('T')[0],
//             calculatedEmissionKgCo2e: emissions?.totalEmissionInScope || 0,
//             calculatedEmissionTCo2e: emissions?.totalEmissionInScope ? emissions.totalEmissionInScope / 1000 : 0,
//             calculatedBioEmissionKgCo2e: emissions?.totalEmissionOutScope || 0,
//             calculatedBioEmissionTCo2e: emissions?.totalEmissionOutScope ? emissions.totalEmissionOutScope / 1000 : 0,
//           };

//           await axios.post(
//             `${process.env.REACT_APP_BASE_URL}/stationary/create`,
//             payload,
//             {
//               headers: {
//                 Authorization: `Bearer ${localStorage.getItem('token')}`,
//                 'Content-Type': 'application/json'
//               }
//             }
//           );

//           results.success++;
//         } catch (error) {
//           results.failed++;
//           const errorMessage = error.response?.data?.message || error.message;
//           results.errors.push({
//             row: i + 1,
//             error: errorMessage
//           });
//           console.error(`Error uploading row ${i + 1}:`, error);
//         }

//         setCsvProgress(Math.round(((i + 1) / totalRows) * 100));
//       }

//       setCsvResults(results);
//       setCsvUploading(false);

//       if (results.failed === 0) {
//         toast.success(`Successfully uploaded ${results.success} records!`);
//         fetchStationaryRecords(pagination.currentPage);
//         setBulkUploadModalOpen(false);
//         resetCSVUpload();
//       } else {
//         toast.warning(`Uploaded ${results.success} records, ${results.failed} failed. Check error details.`);
//       }
//     } catch (error) {
//       toast.error(`Upload failed: ${error.message}`);
//       setCsvUploading(false);
//     }
//   };

//   const resetCSVUpload = () => {
//     setCsvFile(null);
//     setCsvResults(null);
//     setCsvValidationErrors([]);
//     setCsvProgress(0);
//     const fileInput = document.getElementById('csvUploadInput');
//     if (fileInput) fileInput.value = '';
//   };

//   // ==================== END CSV FUNCTIONS ====================
//   const COLUMNS = useMemo(
//     () => [
//       {
//         Header: "Sr.No",
//         id: "serialNo",
//         Cell: ({ row }) => (
//           <span>{(pagination.currentPage - 1) * pagination.limit + row.index + 1}</span>
//         ),
//       },
//       { Header: "Building", accessor: "buildingId.buildingName", Cell: ({ value }) => capitalizeLabel(value) },
//       { Header: "Stakeholder", accessor: "stakeholder", Cell: ({ value }) => capitalizeLabel(value) },
//       { Header: "Equipment Type", accessor: "equipmentType", Cell: ({ value }) => capitalizeLabel(value) },
//       { Header: "Fuel Type", accessor: "fuelType" },
//       { Header: "Fuel Name", accessor: "fuelName", Cell: ({ value }) => capitalizeLabel(value) },
//       { Header: "Fuel Consumption", accessor: "fuelConsumption" },
//       {
//         Header: "Consumption Unit",
//         accessor: "consumptionUnit",
//         Cell: ({ value }) => formatUnitDisplay(value)
//       },
//       { Header: "Quality Control", accessor: "qualityControl" },
//       {
//         Header: "Calculated Emissions (kgCO₂e)", accessor: "calculatedEmissionKgCo2e",
//         Cell: ({ cell }) => {
//           const rawValue = cell.value;
//           if (rawValue === null || rawValue === undefined || rawValue === "") {
//             return "N/A";
//           }
//           const numValue = Number(rawValue);
//           if (isNaN(numValue)) {
//             return "N/A";
//           }
//           return numValue.toFixed(2);
//         }
//       },
//       {
//         Header: "Calculated Emissions (tCO₂e)",
//         accessor: "calculatedEmissionTCo2e",
//         Cell: ({ cell }) => {
//           const rawValue = cell.value;
//           if (rawValue === null || rawValue === undefined || rawValue === "") {
//             return "N/A";
//           }
//           const numValue = Number(rawValue);
//           if (isNaN(numValue)) {
//             return "N/A";
//           }
//           if ((numValue !== 0 && Math.abs(numValue) < 0.01) || Math.abs(numValue) >= 1e6) {
//             return numValue.toExponential(2);
//           }
//           return numValue.toFixed(2);
//         }
//       },
//       { Header: "Remarks", accessor: "remarks", Cell: ({ cell }) => cell.value || "N/A" },
//       {
//         Header: "Created By",
//         accessor: "createdBy.name",
//         Cell: ({ cell }) => cell.value || "N/A",
//       },
//       {
//         Header: "Updated By",
//         accessor: "updatedBy.name",
//         Cell: ({ cell }) => cell.value || "N/A",
//       },
//       {
//         Header: "Posting Date", accessor: "postingDate",
//         Cell: ({ cell }) => {
//           if (!cell.value) return "N/A";
//           try {
//             return new Date(cell.value).toLocaleDateString('en-GB');
//           } catch {
//             return "Invalid Date";
//           }
//         }
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
//                   navigate(`/Stationary-Combustion-Form/${cell.value}`, {
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
//                   navigate(`/Stationary-Combustion-Form/${cell.value}`, {
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
//     [pagination.currentPage, pagination.limit]
//   );
//   const tableInstance = useTable(
//     {
//       columns: COLUMNS,
//       data: records,
//       manualPagination: true,
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

//   const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

//   return (
//     <>
//       <Card noborder>
//         <div className="md:flex pb-6 items-center">
//           <h6 className="flex-1 md:mb-0">Stationary Combustion Records</h6>
//           <div className="md:flex md:space-x-3 items-center flex-none rtl:space-x-reverse">
//             <GlobalFilter filter={globalFilterValue} setFilter={setGlobalFilterValue} />

//             {/* Add CSV Upload Button */}
//             <Button
//               icon="heroicons:document-arrow-up"
//               text="Bulk Upload CSV"
//               className="btn font-normal btn-sm bg-gradient-to-r from-[#8A3AB8] to-[#3A90B8] text-white border-0 hover:opacity-90"
//               iconClass="text-lg"
//               onClick={() => setBulkUploadModalOpen(true)}
//             />

//             <Button
//               icon="heroicons-outline:plus-sm"
//               text="Add Record"
//               className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
//               iconClass="text-lg"
//               onClick={() => navigate("/Stationary-Combustion-Form/Add")}
//             />
//           </div>
//         </div>

//         {/* Table */}
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

//         {/* Pagination */}
//         <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
//           <div className="flex items-center space-x-3 rtl:space-x-reverse">
//             <span className="flex space-x-2 items-center">
//               <span className="text-sm font-medium text-slate-600">Go</span>
//               <input
//                 type="number"
//                 className="form-control py-2"
//                 min="1"
//                 max={pagination.totalPages}
//                 value={goToValue}
//                 onChange={(e) => setGoToValue(e.target.value)}
//                 onBlur={() => {
//                   const page = Number(goToValue);
//                   if (page >= 1 && page <= pagination.totalPages && page !== pagination.currentPage) {
//                     setPagination((prev) => ({ ...prev, currentPage: page }));
//                   } else {
//                     setGoToValue(pagination.currentPage);
//                   }
//                 }}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") {
//                     const page = Number(goToValue);
//                     if (page >= 1 && page <= pagination.totalPages && page !== pagination.currentPage) {
//                       setPagination((prev) => ({ ...prev, currentPage: page }));
//                     } else {
//                       setGoToValue(pagination.currentPage);
//                     }
//                   }
//                 }}
//                 style={{ width: "50px" }}
//               />
//             </span>
//             <span className="text-sm font-medium text-slate-600">
//               Page {pagination.currentPage} of {pagination.totalPages}
//             </span>
//           </div>

//           <ul className="flex items-center space-x-3 rtl:space-x-reverse">
//             <li>
//               <button
//                 onClick={() => setPagination((p) => ({ ...p, currentPage: 1 }))}
//                 disabled={pagination.currentPage === 1}
//                 className={`${pagination.currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
//               >
//                 <Icon icon="heroicons:chevron-double-left-solid" />
//               </button>
//             </li>

//             <li>
//               <button
//                 onClick={() =>
//                   pagination.hasPrevPage &&
//                   setPagination((p) => ({ ...p, currentPage: p.prevPage }))
//                 }
//                 disabled={!pagination.hasPrevPage}
//                 className={`${!pagination.hasPrevPage ? "opacity-50 cursor-not-allowed" : ""}`}
//               >
//                 Prev
//               </button>
//             </li>

//             {(() => {
//               const total = pagination.totalPages;
//               const current = pagination.currentPage;
//               const showPages = [];

//               if (total > 0) showPages.push(1);
//               if (total > 1) showPages.push(2);
//               if (current > 4) showPages.push("left-ellipsis");
//               if (current > 2 && current < total - 1) showPages.push(current);
//               if (current < total - 3) showPages.push("right-ellipsis");
//               if (total > 2) showPages.push(total - 1);
//               if (total > 1) showPages.push(total);

//               const finalPages = [...new Set(showPages.filter((p) => p >= 1 && p <= total || typeof p === "string"))];

//               return finalPages.map((p, idx) => (
//                 <li key={idx}>
//                   {typeof p === "string" ? (
//                     <span className="text-slate-500 px-1">...</span>
//                   ) : (
//                     <button
//                       className={`${p === current
//                         ? "bg-slate-900 text-white font-medium"
//                         : "bg-slate-100 text-slate-900 font-normal"
//                         } text-sm rounded h-6 w-6 flex items-center justify-center`}
//                       onClick={() =>
//                         setPagination((prev) => ({ ...prev, currentPage: p }))
//                       }
//                     >
//                       {p}
//                     </button>
//                   )}
//                 </li>
//               ));
//             })()}

//             <li>
//               <button
//                 onClick={() =>
//                   pagination.hasNextPage &&
//                   setPagination((p) => ({ ...p, currentPage: p.nextPage }))
//                 }
//                 disabled={!pagination.hasNextPage}
//                 className={`${!pagination.hasNextPage ? "opacity-50 cursor-not-allowed" : ""}`}
//               >
//                 Next
//               </button>
//             </li>

//             <li>
//               <button
//                 onClick={() => setPagination((p) => ({ ...p, currentPage: pagination.totalPages }))}
//                 disabled={pagination.currentPage === pagination.totalPages}
//                 className={`${pagination.currentPage === pagination.totalPages
//                   ? "opacity-50 cursor-not-allowed"
//                   : ""
//                   }`}
//               >
//                 <Icon icon="heroicons:chevron-double-right-solid" />
//               </button>
//             </li>
//           </ul>

//           <div className="flex items-center space-x-3">
//             <span className="text-sm font-medium text-slate-600">Show</span>
//             <select
//               value={pagination.limit}
//               onChange={(e) =>
//                 setPagination((p) => ({ ...p, limit: Number(e.target.value), currentPage: 1 }))
//               }
//               className="form-select py-2"
//             >
//               {[5, 10, 20, 50].map((size) => (
//                 <option key={size} value={size}>
//                   {size}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </Card>

//       {/* Delete Confirmation Modal */}
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
//                 await handleDelete(selectedBuildingId);
//                 setDeleteModalOpen(false);
//               }}
//             />
//           </>
//         }
//       >
//         <p className="text-gray-700 text-center">
//           Are you sure you want to delete this Stationary? This action cannot be undone.
//         </p>
//       </Modal>

//       {/* Bulk Upload CSV Modal */}
//       <Modal
//         activeModal={bulkUploadModalOpen}
//         onClose={() => {
//           resetCSVUpload();
//           setBulkUploadModalOpen(false);
//         }}
//         title="Bulk Upload Stationary Records"
//         themeClass="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]"
//         centered
//         sizeClass="max-w-3xl"
//       >
//         <div className="p-6 space-y-6">
//           {/* Instructions */}
//           <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
//             <div className="flex items-start">
//               <Icon icon="heroicons:information-circle" className="w-5 h-5 text-blue-500 mt-0.5 mr-2" />
//               <div>
//                 <h4 className="font-semibold text-blue-800 mb-1">How to upload:</h4>
//                 <ol className="text-sm text-blue-700 space-y-1 list-decimal pl-4">
//                   <li>Download the template below</li>
//                   <li>Fill in your data (keep column headers as is)</li>
//                   <li>Save as CSV file</li>
//                   <li>Upload using the form below</li>
//                   <li>Review validation results and submit</li>
//                 </ol>
//               </div>
//             </div>
//           </div>

//           {/* Download Template Button */}
//           <div className="flex justify-center">
//             <Button
//               text="Download Template & Instructions"
//               className="btn-primary"
//               onClick={downloadCSVTemplate}
//               icon="heroicons:document-arrow-down"
//             />
//           </div>

//           {/* File Upload Area */}
//           <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
//             <input
//               type="file"
//               id="csvUploadInput"
//               accept=".csv"
//               onChange={handleCSVFileSelect}
//               className="hidden"
//             />

//             <label htmlFor="csvUploadInput" className="cursor-pointer block">
//               <Icon icon="heroicons:cloud-arrow-up" className="w-12 h-12 text-slate-400 mx-auto mb-3" />
//               {csvFile ? (
//                 <div className="space-y-2">
//                   <div className="flex items-center justify-center text-green-600">
//                     <Icon icon="heroicons:check-circle" className="w-5 h-5 mr-2" />
//                     <span className="font-medium">{csvFile.name}</span>
//                   </div>
//                   <p className="text-sm text-slate-500">
//                     Click to change file or drag & drop new CSV
//                   </p>
//                 </div>
//               ) : (
//                 <div className="space-y-2">
//                   <p className="text-lg font-medium text-slate-700">
//                     Choose CSV file or drag & drop
//                   </p>
//                   <p className="text-sm text-slate-500">
//                     CSV files only (max 10MB)
//                   </p>
//                 </div>
//               )}
//             </label>

//             <div className="mt-4">
//               <Button
//                 text="Browse Files"
//                 className="btn-outline-primary"
//                 onClick={() => document.getElementById('csvUploadInput').click()}
//               />
//             </div>
//           </div>

//           {/* Validation Errors */}
//           {csvValidationErrors.length > 0 && (
//             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//               <div className="flex items-center justify-between mb-2">
//                 <h4 className="font-semibold text-yellow-800 flex items-center">
//                   <Icon icon="heroicons:exclamation-triangle" className="w-5 h-5 mr-2" />
//                   Validation Errors ({csvValidationErrors.length})
//                 </h4>
//                 <Button
//                   text="Download Errors"
//                   className="btn-outline-yellow btn-xs"
//                   onClick={() => {
//                     const errorText = csvValidationErrors.join('\n');
//                     const blob = new Blob([errorText], { type: 'text/plain' });
//                     const url = URL.createObjectURL(blob);
//                     const a = document.createElement('a');
//                     a.href = url;
//                     a.download = 'validation_errors.txt';
//                     a.click();
//                     URL.revokeObjectURL(url);
//                   }}
//                 />
//               </div>
//               <div className="max-h-40 overflow-y-auto text-sm">
//                 {csvValidationErrors.map((error, index) => (
//                   <p key={index} className="text-yellow-700 py-1 border-b border-yellow-100 last:border-0">
//                     {error}
//                   </p>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Upload Progress */}
//           {csvUploading && (
//             <div className="space-y-2">
//               <div className="flex justify-between text-sm">
//                 <span className="font-medium">Uploading...</span>
//                 <span>{csvProgress}%</span>
//               </div>
//               <div className="w-full bg-slate-200 rounded-full h-2">
//                 <div
//                   className="bg-primary-500 h-2 rounded-full transition-all duration-300"
//                   style={{ width: `${csvProgress}%` }}
//                 ></div>
//               </div>
//             </div>
//           )}

//           {/* Upload Results */}
//           {csvResults && (
//             <div className={`p-4 rounded-lg ${csvResults.failed === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
//               <h4 className="font-semibold mb-3">Upload Results</h4>

//               <div className="grid grid-cols-3 gap-4 mb-3">
//                 <div className="text-center p-3 bg-green-100 rounded-lg">
//                   <div className="text-2xl font-bold text-green-700">{csvResults.success}</div>
//                   <div className="text-sm text-green-600">Successful</div>
//                 </div>

//                 <div className="text-center p-3 bg-red-100 rounded-lg">
//                   <div className="text-2xl font-bold text-red-700">{csvResults.failed}</div>
//                   <div className="text-sm text-red-600">Failed</div>
//                 </div>

//                 <div className="text-center p-3 bg-blue-100 rounded-lg">
//                   <div className="text-2xl font-bold text-blue-700">{csvResults.success + csvResults.failed}</div>
//                   <div className="text-sm text-blue-600">Total</div>
//                 </div>
//               </div>

//               {csvResults.errors.length > 0 && (
//                 <div className="mt-3">
//                   <h5 className="font-medium text-red-700 mb-2">Error Details:</h5>
//                   <div className="max-h-32 overflow-y-auto text-sm">
//                     {csvResults.errors.map((err, idx) => (
//                       <div key={idx} className="text-red-600 py-1 border-b border-red-100 last:border-0">
//                         <span className="font-medium">Row {err.row}:</span> {err.error}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Action Buttons */}
//           <div className="flex justify-end space-x-3 pt-4 border-t">
//             <Button
//               text="Cancel"
//               className="btn-light"
//               onClick={() => {
//                 resetCSVUpload();
//                 setBulkUploadModalOpen(false);
//               }}
//               disabled={csvUploading}
//             />

//             <Button
//               text={csvUploading ? 'Uploading...' : 'Upload CSV'}
//               className="btn-primary"
//               onClick={processCSVUpload}
//               disabled={!csvFile || csvValidationErrors.length > 0 || csvUploading}
//               loading={csvUploading}
//             />
//           </div>
//         </div>
//       </Modal>
//     </>
//   );
// };

// export default StationaryCombustionListing;