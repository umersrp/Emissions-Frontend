import React, { useState, useEffect, useMemo, Fragment, useRef } from "react";
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
import { Dialog, Transition } from "@headlessui/react";

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
  const [isUploading, setIsUploading] = useState(false);
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
  const [forceModalOpen, setForceModalOpen] = useState(false);

  // CSV Upload using custom hook
  const [buildings, setBuildings] = useState([]);
  const {
    csvState,
    handleFileSelect,
    processUpload,
    resetUpload,
    downloadStationaryTemplate
  } = useStationaryCSVUpload(buildings);

  React.useEffect(() => {
    console.log('  bulkUploadModalOpen changed to:', bulkUploadModalOpen);
    console.trace('Stack trace:');
  }, [bulkUploadModalOpen]);

  useEffect(() => {
    // If upload finished but forceModalOpen is still true, reset it
    if (!isUploading && forceModalOpen) {
      setForceModalOpen(false);
    }
  }, [isUploading, forceModalOpen]);

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

  const handleBulkUploadClick = () => {
    setBulkUploadModalOpen(true);
  };

  // ✅ FIX: Don't set isUploading during file selection
  const handleCSVFileSelect = async (selectedFile) => {
    if (!selectedFile) {
      toast.error('No file selected');
      return;
    }

    try {
      // Remove setIsUploading - file selection is not uploading!
      await handleFileSelect(selectedFile);
    } catch (error) {
      console.error('Error handling file select:', error);
      toast.error('Failed to process file');
    }
  };

  // ✅ FIX: Simplified upload handler
  const handleCSVUpload = async () => {
    // Only check csvState.uploading (single source of truth)
    if (csvState.uploading) return;

    try {
      const results = await processUpload();

      if (results && results.failed === 0) {
        // Wait to show completion
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Close modal and cleanup
        setBulkUploadModalOpen(false);
        resetUpload();

        // Fetch in background
        setTimeout(() => {
          fetchStationaryRecords(pagination.currentPage);
        }, 100);
      }
      // If there are failures, processUpload already set uploading to false
      // Modal stays open automatically
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    }
  };

  // ✅ FIX: Simplified close handler
  const handleModalClose = () => {
    // Use csvState.uploading as single source of truth
    if (csvState.uploading) {
      toast.warning('Please wait for upload to complete');
      return;
    }

    resetUpload();
    setBulkUploadModalOpen(false);
  };


  // Modal new code start

  const { file, uploading, progress, validationErrors, results } = csvState;
  const fileInputRef = useRef(null);

  // Memoize handlers to prevent recreation on every render
  const handleFileInputChange = useMemo(() => (e) => {
    const selectedFile = e?.target?.files?.[0];
    if (selectedFile && handleCSVFileSelect) {
      handleCSVFileSelect(selectedFile);
    }
  }, [handleCSVFileSelect]);

  const handleBrowseClick = useMemo(() => () => {
    if (fileInputRef.current && !uploading) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  }, [uploading]);

  const handleReset = useMemo(() => () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (!uploading && resetUpload) {
      resetUpload();
    }
  }, [uploading, resetUpload]);

  const handleClose = useMemo(() => () => {
    if (uploading) {
      return; // Silently prevent close during upload
    }
    handleReset();
    if (handleModalClose) {
      handleModalClose();
    }
  }, [uploading, handleModalClose, handleReset]);

  // Modal new code end

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
              icon={isUploading ? "heroicons:arrow-path" : "heroicons:document-arrow-up"}
              text={isUploading ? "Uploading..." : "Bulk Upload CSV"}
              className="btn font-normal btn-sm bg-gradient-to-r from-[#8A3AB8] to-[#3A90B8] text-white border-0 hover:opacity-90"
              iconClass={isUploading ? "text-lg animate-spin" : "text-lg"}
              onClick={handleBulkUploadClick}  // Use new handler
              disabled={isUploading}
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
      {/* <CSVUploadModal
        activeModal={bulkUploadModalOpen}
        onClose={handleModalClose}
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
      /> */}

      <Transition appear={bulkUploadModalOpen} show={bulkUploadModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[99999]"
          onClose={handleModalClose}
        >


          {/*  Modal Content */}
          <div className="fixed inset-0 overflow-y-auto">
            <div
              className={`flex min-h-full justify-center items-center text-center p-4`}
            >
              <Transition.Child
                as={Fragment}
                enter={"duration-300 ease-out"}
                enterFrom={"opacity-0 scale-95"}
                enterTo={"opacity-100 scale-100"}
                leave={"duration-200 ease-in"}
                leaveFrom={"opacity-100 scale-100"}
                leaveTo={"opacity-0 scale-95"}
              >
                <Dialog.Panel
                  className={`w-full transform overflow-hidden rounded-xl bg-white dark:bg-slate-800 text-left align-middle shadow-2xl transition-all`}
                >
                  {/*  Header */}
                  <div
                    className={`relative py-3 px-4 text-white flex justify-between`}
                  >
                    <h2 className="capitalize leading-6 tracking-wider font-medium text-base text-white">
                      {'title'}
                    </h2>
                    <button onClick={handleModalClose} className="text-[22px]">
                      <Icon icon="heroicons-outline:x" />
                    </button>
                  </div>

                  {/*  Body */}
                  <div
                    className={`px-6 py-6 flex flex-col items-center text-center overflow-y-auto max-h-[400px]`}
                  >
                    <div className="p-6 space-y-6">
                      {/* Instructions */}
                      {/* <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-start">
                          <Icon icon="heroicons:information-circle" className="w-5 h-5 text-blue-500 mt-0.5 mr-2" />
                          <div>
                            <h4 className="font-semibold text-blue-800 mb-1">How to upload:</h4>
                            {templateInstructions}
                          </div>
                        </div>
                      </div> */}

                      {/* Template Download */}
                      {/* {onDownloadTemplate && (
                        <div className="flex justify-center">
                          <Button
                            text="Download Template & Instructions"
                            className="btn-primary"
                            onClick={onDownloadTemplate}
                            icon="heroicons:document-arrow-down"
                            disabled={uploading}
                          />
                        </div>
                      )} */}

                      {/* File Upload Area */}
                      <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${uploading
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-slate-300 hover:border-primary-500'
                        }`}>
                        <input
                          ref={fileInputRef}
                          type="file"
                          id="csvUploadInput"
                          accept={'.csv'}
                          onChange={handleFileInputChange}
                          className="hidden"
                          disabled={uploading}
                        />

                        <div className={uploading ? 'pointer-events-none opacity-70' : ''}>
                          <Icon
                            icon={uploading ? "heroicons:arrow-path" : file ? "heroicons:check-circle" : "heroicons:cloud-arrow-up"}
                            className={`w-12 h-12 mx-auto mb-3 ${uploading
                              ? 'text-primary-500 animate-spin'
                              : file
                                ? 'text-green-500'
                                : 'text-slate-400'
                              }`}
                          />
                          {file ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-center text-green-600">
                                <Icon icon="heroicons:check-circle" className="w-5 h-5 mr-2" />
                                <span className="font-medium truncate max-w-xs">{file.name}</span>
                              </div>
                              <p className="text-sm text-slate-500">
                                {uploading ? 'Upload in progress...' : 'Click to change file'}
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-lg font-medium text-slate-700">
                                Choose CSV file or drag & drop
                              </p>
                              <p className="text-sm text-slate-500">
                                {'.csv'.toUpperCase()} files only (max {10}MB)
                              </p>
                            </div>
                          )}
                        </div>

                        {!uploading && (
                          <div className="mt-4">
                            <Button
                              text="Browse Files"
                              className="btn-outline-primary"
                              onClick={handleBrowseClick}
                            />
                          </div>
                        )}
                      </div>

                      {/* Validation Errors */}
                      {validationErrors.length > 0 && !uploading && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-yellow-800 flex items-center">
                              <Icon icon="heroicons:exclamation-triangle" className="w-5 h-5 mr-2" />
                              Validation Errors ({validationErrors.length})
                            </h4>
                          </div>
                          <div className="max-h-40 overflow-y-auto text-sm">
                            {validationErrors.slice(0, 10).map((error, index) => (
                              <p key={index} className="text-yellow-700 py-1 border-b border-yellow-100 last:border-0">
                                {error}
                              </p>
                            ))}
                            {validationErrors.length > 10 && (
                              <p className="text-yellow-600 py-2 text-center font-medium">
                                ... and {validationErrors.length - 10} more errors
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Upload Progress */}
                      {uploading && (
                        <div className="space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="flex justify-between text-sm font-medium">
                            <span>Uploading records...</span>
                            <span className="text-primary-600">{progress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-primary-500 h-3 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-slate-600 text-center mt-2">
                            Please wait, do not close this window
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button
                          text="Cancel"
                          className="btn-light"
                          onClick={handleClose}
                          disabled={uploading}
                        />
                        <Button
                          text={uploading ? `Uploading... ${progress}%` : 'Upload CSV'}
                          className="btn-primary"
                          onClick={handleCSVUpload}
                          disabled={!file || validationErrors.length > 0 || uploading}
                          loading={uploading}
                        />
                      </div>
                    </div>
                  </div>

                  {/*  Footer */}
                  {/* {footerContent && (
                    <div className="px-4 py-3 flex justify-between items-center border-t border-slate-100 dark:border-slate-700">
                      {footerContent}
                    </div>
                  )} */}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

    </>
  );
};

export default StationaryCombustionListing;
