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

// Import reusable components
import CSVUploadModal from "@/components/ui/CSVUploadModal";
import ExcelExportButton from "@/components/ui/ExcelExportButton";
import useStationaryCSVUpload from "@/hooks/scope1/useStationaryCSVUpload";

const IndeterminateCheckbox = React.forwardRef(({ indeterminate, checked, onChange, ...rest }, ref) => {
  const defaultRef = React.useRef();
  const resolvedRef = ref || defaultRef;

  React.useEffect(() => {
    if (resolvedRef.current) {
      resolvedRef.current.indeterminate = indeterminate;
    }
  }, [resolvedRef, indeterminate]);

  return (
    <input
      type="checkbox"
      ref={resolvedRef}
      checked={checked}
      className="table-checkbox"
      onChange={onChange}
      {...rest}

    />
  );
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
  const [selectedRows, setSelectedRows] = useState({});
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);
  const selectedRowsRef = useRef(selectedRows);
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

  // Delete multiple records
  const handleDeleteMultiple = async () => {
    const selectedIds = Object.keys(selectedRows).filter(id => selectedRows[id]);

    if (selectedIds.length === 0) {
      toast.warning("Please select records to delete");
      return;
    }

    setIsDeletingMultiple(true);

    try {
      const deletePromises = selectedIds.map(id =>
        axios.delete(`${process.env.REACT_APP_BASE_URL}/stationary/Delete/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
      );

      await Promise.all(deletePromises);

      toast.success(`${selectedIds.length} record(s) deleted successfully`);
      setSelectedRows({});
      fetchStationaryRecords(pagination.currentPage, globalFilterValue);
    } catch (err) {
      console.error("Error deleting records:", err);
      toast.error("Failed to delete some records");
    } finally {
      setIsDeletingMultiple(false);
      setDeleteModalOpen(false);
    }
  };

  // Fetch all records for export
  const fetchAllStationaryRecords = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/stationary/Get-All?limit=1000000`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      return res.data.data || [];
    } catch (err) {
      console.error("Error fetching records for export:", err);
      toast.error("Failed to fetch records for export");
      return [];
    }
  };

  React.useEffect(() => {
    console.log('bulkUploadModalOpen changed to:', bulkUploadModalOpen);
  }, [bulkUploadModalOpen]);

  useEffect(() => {
    if (!isUploading && forceModalOpen) {
      setForceModalOpen(false);
    }
  }, [isUploading, forceModalOpen]);

  useEffect(() => {
    setSelectedRows({});
  }, [pagination.currentPage, globalFilterValue]);

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

  useEffect(() => {
    setSelectedRows({});
  }, [pagination.currentPage, globalFilterValue, pagination.limit]);
  // Custom formatter for export
  const customFormatter = (value, column, row, index) => {
    if (value === "N/A") {
      return "N/A";
    }

    if (column.Header === "Sr.No" || column.id === "serialNo") {
      return index + 1;
    }

    if (column.accessor === "buildingId.buildingName" ||
      column.accessor === "buildingId.buildingCode") {
      if (!value || value === "N/A") {
        return "N/A";
      }
      if (column.accessor === "buildingId.buildingName") {
        return capitalizeLabel(value);
      }
      return value;
    }

    if (column.accessor === "stakeholder" ||
      column.accessor === "equipmentType" ||
      column.accessor === "fuelName") {
      if (!value || value === "N/A") {
        return "N/A";
      }
      return capitalizeLabel(value);
    }

    if (column.accessor === "consumptionUnit") {
      if (!value || value === "N/A") {
        return "N/A";
      }
      return formatUnitDisplay(value);
    }

    if (column.accessor === "postingDate") {
      if (!value || value === "N/A") {
        return "N/A";
      }
      try {
        return new Date(value).toLocaleDateString('en-GB');
      } catch {
        return "Invalid Date";
      }
    }

    if (column.accessor === "calculatedEmissionKgCo2e" ||
      column.accessor === "calculatedEmissionTCo2e") {
      if (!value || value === "N/A") {
        return "N/A";
      }
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return "N/A";
      }
      return numValue.toFixed(2);
    }

    return value || "N/A";
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

  useEffect(() => {
    selectedRowsRef.current = selectedRows;
  }, [selectedRows]);

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

  const handleCSVUpload = async () => {
    if (csvState.uploading) return;

    try {
      const results = await processUpload();

      if (results && results.failed === 0) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setBulkUploadModalOpen(false);
        resetUpload();
        setTimeout(() => {
          fetchStationaryRecords(pagination.currentPage);
        }, 100);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    }
  };

  const handleModalClose = () => {
    if (csvState.uploading) {
      toast.warning('Please wait for upload to complete');
      return;
    }

    resetUpload();
    setBulkUploadModalOpen(false);
  };

  const templateInstructions = (
    <ol className="text-sm text-black-700 space-y-1 list-decimal pl-4">
      <li>Download the template below</li>
      <li>Fill in your data (keep column headers as is)</li>
      <li>Save as xlsx file</li>
      <li>Upload using the form below</li>
      <li>Review validation results and submit</li>
    </ol>
  );

  const { file, uploading, progress, validationErrors, results } = csvState;
  const fileInputRef = useRef(null);

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
      return;
    }
    handleReset();
    if (handleModalClose) {
      handleModalClose();
    }
  }, [uploading, handleModalClose, handleReset]);

  const COLUMNS = useMemo(
    () => [
      {
        Header: "Sr.No",
        id: "serialNo",
        Cell: ({ row }) => (
          <span>{(pagination.currentPage - 1) * pagination.limit + row.index + 1}</span>
        ),
      },
      { Header: "Building Code", accessor: "buildingId.buildingCode", Cell: ({ cell }) => cell.value || "N/A" },
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
    [pagination.currentPage, pagination.limit, selectedRows]
  );

  const tableInstance = useTable(
    {
      columns: COLUMNS,
      data: records,
      manualPagination: true,
      autoResetSelectedRows: false,
      // Add this to help with selection
      getRowId: (row) => row._id,
    },
    useSortBy,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: "selection",
          width: 50,
          Header: ({ rows }) => {
            const allSelected = rows.length > 0 && rows.every(row => selectedRows[row.original._id]);
            const someSelected = rows.some(row => selectedRows[row.original._id]);

            return (
              <IndeterminateCheckbox
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  const newSelection = {};
                  if (isChecked) {
                    rows.forEach(row => {
                      newSelection[row.original._id] = true;
                    });
                  }
                  setSelectedRows(newSelection);
                }}
              />
            );
          },
          Cell: ({ row }) => {
            const [, forceUpdate] = useState(0);
            const isChecked = selectedRowsRef.current[row.original._id] || false;

            return (
              <IndeterminateCheckbox
                checked={isChecked}
                onChange={(e) => {
                  e.stopPropagation();
                  if (e.target.checked) {
                    setSelectedRows(prev => ({ ...prev, [row.original._id]: true }));
                  } else {
                    setSelectedRows(prev => {
                      const newState = { ...prev };
                      delete newState[row.original._id];
                      return newState;
                    });
                  }
                  forceUpdate(n => n + 1); // force this cell to re-render
                }}
              />
            );
          },
        },
        ...columns,
      ]);
    }
  );
  const selectedCount = Object.values(selectedRows).filter(Boolean).length;
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  return (
    <>
      <Card noborder>
        <div className="md:flex pb-6 items-center">
          <div className="flex-1 md:mb-0 flex items-center space-x-3">
            <h6>Stationary Combustion Records</h6>
          </div>

          <div className="md:flex 2xl:space-x-3 space-x-1 items-center flex-none rtl:space-x-reverse">
            <GlobalFilter filter={globalFilterValue} setFilter={setGlobalFilterValue} />

            {selectedCount > 0 && (
              <Tippy content={`Delete ${selectedCount} selected record`}>
                <Button
                  icon="heroicons:trash"
                  text={`Delete Selected (${selectedCount})`}
                  className="btn font-normal btn-sm bg-gradient-to-r from-red-500 to-red-700 text-white border-0 hover:opacity-90"
                  iconClass="text-lg"
                  onClick={() => setDeleteModalOpen(true)}
                  disabled={isDeletingMultiple}
                />
              </Tippy>
            )}

            {records.length > 0 && (
              <ExcelExportButton
                data={records}
                columns={COLUMNS}
                exportFields={[
                  "buildingId.buildingCode",
                  "buildingId.buildingName",
                  "stakeholder",
                  "equipmentType",
                  "fuelType",
                  "fuelName",
                  "fuelConsumption",
                  "consumptionUnit",
                  "qualityControl",
                  "calculatedEmissionKgCo2e",
                  "calculatedEmissionTCo2e",
                  "remarks",
                  "postingDate",
                  "createdBy.name",
                  "updatedBy.name"
                ]}
                fileName="stationary_combustion_current_page"
                sheetName="Current Page"
                buttonText="Export Page"
                buttonClassName="btn font-normal btn-sm bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white border-0 hover:opacity-90"
                exportFormat="current"
                customFormatter={customFormatter}
                pageInfo={{ currentPage: pagination.currentPage, limit: pagination.limit }}
              />
            )}

            <ExcelExportButton
              data={records}
              fetchAllData={fetchAllStationaryRecords}
              columns={COLUMNS}
              exportFields={[
                "buildingId.buildingCode",
                "buildingId.buildingName",
                "stakeholder",
                "equipmentType",
                "fuelType",
                "fuelName",
                "fuelConsumption",
                "consumptionUnit",
                "qualityControl",
                "calculatedEmissionKgCo2e",
                "calculatedEmissionTCo2e",
                "remarks",
                "postingDate",
                "createdBy.name",
                "updatedBy.name"
              ]}
              fileName="stationary_combustion_records"
              sheetName="Stationary Combustion"
              buttonText="Export All Entries"
              buttonClassName="btn font-normal btn-sm bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white border-0 hover:opacity-90"
              successMessage="Stationary records exported successfully!"
              customFormatter={customFormatter}
              exportFormat="all"
              pageInfo={pagination}
            />

            <Button
              icon={csvState.uploading ? "heroicons:arrow-path" : "heroicons:document-arrow-down"}
              text={csvState.uploading ? "Uploading..." : "Import"}
              className="btn font-normal btn-sm bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white border-0 hover:opacity-90"
              iconClass={csvState.uploading ? "text-lg animate-spin" : "text-lg"}
              onClick={() => setBulkUploadModalOpen(true)}
              disabled={csvState.uploading}
            />

            <div className="2xl:hidden">
              <Button
                icon="heroicons-outline:plus-sm"
                text="Add"
                className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
                iconClass="text-lg"
                onClick={() => navigate("/Stationary-Combustion-Form/Add")}
              />
            </div>
            <div className="hidden 2xl:block">
              <Button
                icon="heroicons-outline:plus-sm"
                text="Add Record"
                className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
                iconClass="text-lg"
                onClick={() => navigate("/Stationary-Combustion-Form/Add")}
              />
            </div>
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
                            style={{
                              width: column.id === 'selection' ? '50px' : 'auto',
                              textAlign: column.id === 'selection' ? 'center' : 'left'
                            }}
                          >
                            {column.render("Header")}
                            {column.id !== 'selection' && (
                              <span>
                                {column.isSorted
                                  ? column.isSortedDesc
                                    ? " 🔽"
                                    : " 🔼"
                                  : ""}
                              </span>
                            )}
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
                                style={{
                                  textAlign: cell.column.id === 'selection' ? 'center' : 'left'
                                }}
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

        {/* Clear Selection Button */}
        {/* {selectedCount > 0 && (
          <div className="mb-4 mt-4 flex justify-end">
            <Button
              text="Clear Selection"
              className="btn-sm btn-light"
              onClick={() => setSelectedRows({})}
              icon="heroicons:x-mark"
            />
          </div>
        )} */}

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
            <Button
              text="Cancel"
              className="btn-light"
              onClick={() => setDeleteModalOpen(false)}
            />
            <Button
              text={isDeletingMultiple ? "Deleting..." : "Delete"}
              className="btn-danger"
              onClick={async () => {
                if (selectedCount > 1) {
                  await handleDeleteMultiple();
                } else if (selectedBuildingId) {
                  await handleDelete(selectedBuildingId);
                  setDeleteModalOpen(false);
                }
              }}
              disabled={isDeletingMultiple}
            />
          </>
        }
      >
        <p className="text-gray-700 text-center">
          {selectedCount > 1
            ? `Are you sure you want to delete ${selectedCount} selected records? This action cannot be undone.`
            : "Are you sure you want to delete this Stationary? This action cannot be undone."
          }
        </p>
      </Modal>

      <CSVUploadModal
        activeModal={bulkUploadModalOpen}
        onClose={handleModalClose}
        title="Bulk Upload Stationary Records"
        csvState={csvState}
        onFileSelect={handleCSVFileSelect}
        onUpload={handleCSVUpload}
        onReset={resetUpload}
        onDownloadTemplate={downloadStationaryTemplate}
        templateInstructions={templateInstructions}
        isLoading={isUploading}
      />
    </>
  );
};

export default StationaryCombustionListing;

