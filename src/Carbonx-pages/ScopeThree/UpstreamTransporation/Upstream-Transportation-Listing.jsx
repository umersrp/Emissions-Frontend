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
import CSVUploadModal from "@/components/ui/CSVUploadModal";
import ExcelExportButton from "@/components/ui/ExcelExportButton";
import useUpstreamCSVUpload from "@/hooks/scope1/useUpstreamCSVUpload";

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
      onChange={onChange}
      className="table-checkbox w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
      {...rest}
    />
  );
});

const UpstreamTransportationListing = () => {
  const navigate = useNavigate();

  // Server-side states
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bulkUploadModalOpen, setBulkUploadModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [goToValue, setGoToValue] = useState(pageIndex);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [buildings, setBuildings] = useState([]);
  const [selectedRows, setSelectedRows] = useState({});
const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);

  // CSV Upload hook
  const {
    csvState,
    handleFileSelect,
    processUpload,
    resetUpload,
    downloadTemplate
  } = useUpstreamCSVUpload(buildings);

  // Fetch buildings for validation
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

  const capitalizeLabel = (text) => {
    if (!text) return "N/A";

    const exceptions = [
      "and", "or", "in", "of", "from", "at", "to", "the", "a", "an", "for", "on", "with",
      "but", "by", "is", "it", "as", "be", "this", "that", "these", "those", "such",
      "if", "e.g.,", "i.e.", "kg", "via", "etc.", "vs.", "per", "e.g.", "on-site", "can", "will", "not", "cause", "onsite",
      "n.e.c.", "cc", "cc+", "up"
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
    const delayDebounce = setTimeout(() => {
      setDebouncedSearch(globalFilterValue);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [globalFilterValue]);

  // Fetch all records for export
  const fetchAllRecords = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/upstream/Get-All?limit=1000000`,
        {
          params: { search: debouncedSearch || "" },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );
      return res.data?.data || [];
    } catch (err) {
      console.error("Error fetching records for export:", err);
      toast.error("Failed to fetch records for export");
      return [];
    }
  };

  // Fetch data from server
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/upstream/Get-All`,
        {
          params: {
            page: pageIndex,
            limit: pageSize,
            search: debouncedSearch || "",
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
    setSelectedRows({});
  }, [pageIndex, pageSize, debouncedSearch]);

  // CSV Upload handlers
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
          fetchData();
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

  // Custom formatter for export
  const customFormatter = (value, column, row, index) => {
    // Handle Sr.No specially
    if (column.Header === "Sr.No" || column.id === "serialNo") {
      return index + 1;
    }

    // Handle unit display
    if (column.accessor === "unit") {
      if (value === "USD") return "$";
      if (!value) return "N/A";
      return value;
    }

    // Handle transportation category display
    if (column.accessor === "transportationCategory") {
      if (!value) return "N/A";
      if (value === "purchasedGoods") return "Purchased Goods";
      if (value === "purchasedServices") return "Purchased Third-party Transportation and Distribution Services";
      return capitalizeLabel(value);
    }

    // Handle activity type display
    if (column.accessor === "activityType") {
      if (!value) return "N/A";
      if (value === "vehicles") return "Vehicles";
      if (value === "rawMaterials") return "Raw Materials";
      if (value === "waterTransport") return "Water Transport Services";
      if (value === "warehousingSupport") return "Warehousing Support Services";
      return capitalizeLabel(value);
    }

    // Handle vehicle category display
    if (column.accessor === "vehicleCategory") {
      if (!value) return "N/A";
      if (value === "vans") return "Vans";
      if (value === "hqv") return "Heavy Good Vehicles";
      if (value === "hqvRefrigerated") return "Heavy Good Vehicles (Refrigerated)";
      if (value === "freightFlights") return "Freight Flights";
      if (value === "rail") return "Rail";
      if (value === "seaTanker") return "Sea Tanker";
      if (value === "cargoShip") return "Cargo Ship";
      return capitalizeLabel(value);
    }

    // Handle numeric emissions
    if (column.accessor === "calculatedEmissionKgCo2e" || column.accessor === "calculatedEmissionTCo2e") {
      if (!value && value !== 0) return "N/A";
      const numValue = Number(value);
      if (isNaN(numValue)) return "N/A";
      return numValue.toFixed(2);
    }

    // Handle posting date
    if (column.accessor === "postingDate") {
      if (!value) return "N/A";
      try {
        return new Date(value).toLocaleDateString('en-GB');
      } catch {
        return "Invalid Date";
      }
    }

    // Handle all other fields
    if (value === null || value === undefined || value === "") {
      return "N/A";
    }

    // Apply capitalizeLabel to certain fields
    const fieldsToCapitalize = [
      "stakeholderDepartment",
      "purchasedGoodsType",
      "vehicleType",
      "qualityControl"
    ];

    if (fieldsToCapitalize.includes(column.accessor)) {
      return capitalizeLabel(value);
    }

    return value;
  };
// Delete multiple selected records
const handleDeleteMultiple = async () => {
  const selectedIds = Object.keys(selectedRows).filter(id => selectedRows[id]);
  if (selectedIds.length === 0) {
    toast.warning("Please select records to delete");
    return;
  }
  setIsDeletingMultiple(true);
  try {
    await Promise.all(
      selectedIds.map(id =>
        axios.delete(`${process.env.REACT_APP_BASE_URL}/upstream/Delete/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
      )
    );
    toast.success(`${selectedIds.length} record(s) deleted successfully`);
    setSelectedRows({});
    fetchData();
  } catch (err) {
    console.error("Error deleting records:", err);
    toast.error("Failed to delete some records");
  } finally {
    setIsDeletingMultiple(false);
    setDeleteModalOpen(false);
  }
};
const selectedCount = Object.values(selectedRows).filter(Boolean).length;
  // Delete Record
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BASE_URL}/upstream/Delete/${id}`, {
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
     { Header: "Building Code", accessor: "buildingId.buildingCode", Cell: ({ cell }) => cell.value || "N/A", },
      {
        Header: "Building",
        accessor: "buildingId.buildingName",
        Cell: ({ cell }) => cell.value || "N/A"
      },
      {
        Header: "Stakeholder",
        accessor: "stakeholderDepartment",
        Cell: ({ value }) => capitalizeLabel(value)
      },
      {
        Header: "Transportation and Distribution Category",
        accessor: "transportationCategory",
        Cell: ({ value }) => {
          if (!value) return "N/A";
          return value === "purchasedGoods" ? "Purchased Goods" :
            value === "purchasedServices" ? "Purchased Third-party Transportation and Distribution Services" :
              capitalizeLabel(value);
        }
      },
      {
        Header: "Purchased Product Activity Type",
        accessor: "activityType",
        Cell: ({ value }) => {
          if (!value) return "N/A";
          return value === "vehicles" ? "Vehicles" :
            value === "rawMaterials" ? "Raw Materials" :
              value === "waterTransport" ? "Water Transport Services" :
                value === "warehousingSupport" ? "Warehousing Support Services" :
                  capitalizeLabel(value);
        }
      },
      {
        Header: "Purchased Goods Type",
        accessor: "purchasedGoodsType",
        Cell: ({ value }) => capitalizeLabel(value)
      },
      {
        Header: "Transportation Vehicle Category",
        accessor: "vehicleCategory",
        Cell: ({ value }) => {
          if (!value) return "N/A";
          return value === "vans" ? "Vans" :
            value === "hqv" ? "Heavy Good Vehicles" :
              value === "hqvRefrigerated" ? "Heavy Good Vehicles (Refrigerated)" :
                value === "freightFlights" ? "Freight Flights" :
                  value === "rail" ? "Rail" :
                    value === "seaTanker" ? "Sea Tanker" :
                      value === "cargoShip" ? "Cargo Ship" :
                        capitalizeLabel(value);
        }
      },
      {
        Header: "Transportation Vehicle Type",
        accessor: "vehicleType",
        Cell: ({ value }) => capitalizeLabel(value)
      },
      {
        Header: "Weight Loaded (tonnes)",
        accessor: "weightLoaded",
        Cell: ({ value }) => value || "N/A"
      },
      {
        Header: "Distance Travelled (km)",
        accessor: "distanceTravelled",
        Cell: ({ value }) => value || "N/A"
      },
      {
        Header: "Amount Spent ($)",
        accessor: "amountSpent",
        Cell: ({ value }) => value || "N/A"
      },
      {
        Header: "Unit",
        accessor: "unit",
        Cell: ({ value }) => {
          if (!value) return "N/A";
          if (value === "USD") return "$";
          return value;
        }
      },
      {
        Header: "Quality Control",
        accessor: "qualityControl",
        Cell: ({ value }) => capitalizeLabel(value)
      },
      {
        Header: "Calculated Emissions (kgCO₂e)",
        accessor: "calculatedEmissionKgCo2e",
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
      {
        Header: "Remarks",
        accessor: "remarks",
        Cell: ({ value }) => value || "N/A"
      },
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
        Header: "Posting Date",
        accessor: "postingDate",
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
                  navigate(`/Upstream-Transportation-Form/${cell.value}`, {
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
                  navigate(`/Upstream-Transportation-Form/${cell.value}`, {
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
    [pageIndex, pageSize,selectedRows]
  );

  const columns = useMemo(() => COLUMNS, [COLUMNS]);
  const data = useMemo(() => records, [records]);

const tableInstance = useTable(
  {
    columns,
    data,
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
                const newSelection = {};
                if (e.target.checked) {
                  rows.forEach(row => { newSelection[row.original._id] = true; });
                }
                setSelectedRows(newSelection);
              }}
            />
          );
        },
        Cell: ({ row }) => (
          <IndeterminateCheckbox
            checked={selectedRows[row.original._id] || false}
            indeterminate={false}
            onChange={(e) => {
              e.stopPropagation();
              setSelectedRows(prev => {
                const newState = { ...prev };
                if (e.target.checked) {
                  newState[row.original._id] = true;
                } else {
                  delete newState[row.original._id];
                }
                return newState;
              });
            }}
          />
        ),
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
    setGoToValue(page);
  };

  const handlePrevPage = () => handleGoToPage(pageIndex - 1);
  const handleNextPage = () => handleGoToPage(pageIndex + 1);

  return (
    <>
      <Card noborder>
        <div className="md:flex pb-6 items-center">
         
          <h6 className="flex-1 md:mb-0">Upstream Transportation and Distribution Records</h6>
          
          <div className="md:flex md:space-x-1 space-x-3 items-center flex-none rtl:space-x-reverse">
            <GlobalFilter filter={globalFilterValue} setFilter={setGlobalFilterValue} />
            {selectedCount > 0 && (
  <Tippy content={`Delete ${selectedCount} selected record(s)`}>
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
            {/* Export Current Page Button */}
            {records.length > 0 && (
              <ExcelExportButton
                data={records}
                columns={COLUMNS}
                exportFields={[
                  "stakeholderDepartment",           
                  "transportationCategory",           
                  "activityType",                      
                  "purchasedGoodsType",                 
                  "vehicleCategory",                     
                  "vehicleType",                   
                  "weightLoaded",                         
                  "distanceTravelled",                      
                  "amountSpent",                             
                  "unit",                                    
                  "qualityControl",                            
                  "remarks",                                    
                  "calculatedEmissionKgCo2e",                    
                  "calculatedEmissionTCo2e",                       
                  "postingDate",                                   
                  "createdBy.name"                               
                ]}
                fileName={`upstream_page_${pageIndex}`}  
                sheetName={`Page ${pageIndex}`}         
                buttonText="Export Page"
                buttonClassName="btn font-normal btn-sm bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white border-0 hover:opacity-90"
                iconClass="text-lg"
                customFormatter={customFormatter}
                exportFormat="current"
                pageInfo={{ currentPage: pageIndex, limit: pageSize }}  // FIX: Use pageIndex and pageSize
              />
            )}

            {/* Export All Button */}
            <ExcelExportButton
              data={records}
              fetchAllData={fetchAllRecords}
              columns={COLUMNS}
              exportFields={[
                "stakeholderDepartment",           
                "transportationCategory",           
                "activityType",                      
                "purchasedGoodsType",                 
                "vehicleCategory",                    
                "vehicleType",                         
                "weightLoaded",                         
                "amountSpent",                           
                "unit",                                     
                "qualityControl",                           
                "remarks",                                   
                "calculatedEmissionKgCo2e",                    
                "calculatedEmissionTCo2e",                      
                "postingDate",                                    
                "createdBy.name"                              
              ]}
              fileName="upstream_transportation_records"
              sheetName="Upstream Transportation"
              buttonText="Export All Entries"
              buttonClassName="btn font-normal btn-sm bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white border-0 hover:opacity-90"
              iconClass="text-lg"
              successMessage="Upstream records exported successfully!"
              customFormatter={customFormatter}
              exportFormat="all"
              pageInfo={{
                currentPage: pageIndex,
                totalPages: totalPages,
                totalCount: totalRecords,
                limit: pageSize
              }}
            />

            {/* Import Button */}
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
                onClick={() => navigate("/Upstream-Transportation-Form/Add")}
              />
            </div>
            <div className="hidden 2xl:block">
              <Button
                icon="heroicons-outline:plus-sm"
                text="Add Record"
                className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
                iconClass="text-lg"
                onClick={() => navigate("/Upstream-Transportation-Form/Add")}
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
          {/* Go To Page Section */}
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

          {/* Pagination Controls */}
          <ul className="flex items-center space-x-3">
            {/* First Page */}
            <li>
              <button
                onClick={() => handleGoToPage(1)}
                disabled={pageIndex === 1}
                className={pageIndex === 1 ? "opacity-50 cursor-not-allowed" : ""}
              >
                <Icon icon="heroicons:chevron-double-left-solid" />
              </button>
            </li>

            {/* Prev */}
            <li>
              <button
                onClick={handlePrevPage}
                disabled={pageIndex === 1}
                className={pageIndex === 1 ? "opacity-50 cursor-not-allowed" : ""}
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

            {/* Next */}
            <li>
              <button
                onClick={handleNextPage}
                disabled={pageIndex === totalPages}
                className={pageIndex === totalPages ? "opacity-50 cursor-not-allowed" : ""}
              >
                Next
              </button>
            </li>

            {/* Last Page */}
            <li>
              <button
                onClick={() => handleGoToPage(totalPages)}
                disabled={pageIndex === totalPages}
                className={pageIndex === totalPages ? "opacity-50 cursor-not-allowed" : ""}
              >
                <Icon icon="heroicons:chevron-double-right-solid" />
              </button>
            </li>
          </ul>

          {/* Page Size Selector with Export Current Page */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-slate-600">Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageIndex(1);
              }}
              className="form-select py-2"
            >
              {[10, 20, 50, 100].map((size) => (
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
      text="Delete"
      className="btn-danger"
      onClick={async () => {
        if (selectedCount > 1) {
          await handleDeleteMultiple();
        } else if (selectedId) {
          await handleDelete(selectedId);
          setDeleteModalOpen(false);
        }
      }}
    />
  </>
}
      >
        <p className="text-gray-700 text-center">
  {selectedCount > 1
    ? `Are you sure you want to delete ${selectedCount} selected records? This action cannot be undone.`
    : "Are you sure you want to delete this record? This action cannot be undone."
  }
</p>
      </Modal>

      {/* CSV Upload Modal */}
      <CSVUploadModal
        activeModal={bulkUploadModalOpen}
        onClose={handleModalClose}
        title="Bulk Upload Upstream Transportation Records"
        csvState={csvState}
        onFileSelect={handleCSVFileSelect}
        onUpload={handleCSVUpload}
        onReset={resetUpload}
        onDownloadTemplate={downloadTemplate}
        templateInstructions={templateInstructions}
        isLoading={csvState.uploading}
        maxSizeMB={10}
      />
    </>
  );
};

export default UpstreamTransportationListing;