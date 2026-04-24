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
import { formatDateDMY } from "@/hooks/dateFormateDMY";

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
  const [loading2, setLoading2] = useState(false);
  const [selectedBuildingName, setSelectedBuildingName] = useState("");
  const [excelResults, setExcelResults] = useState([]);

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
    { Header: "Created At", accessor: "createdAt",  Cell: ({ cell }) => formatDateDMY(cell.value), },
    { Header: "Updated At", accessor: "updatedAt",  Cell: ({ cell }) => formatDateDMY(cell.value), },
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


  // ✅ CLEAN + FORMAT DATA




  const exportToExcel = (data, fileName = "data") => {
    console.log("Export Data:", data);

    if (!data.length) {
      toast.error("No data to export");
      return;
    }

    // Function to format string values (for method field)
    const formatMethodValue = (value) => {
      if (typeof value === 'string') {
        return value
          .replace(/[_-]/g, ' ')  // Replace underscores/hyphens with spaces
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
      return value;
    };

    // Transform all method values in the data
    const formattedData = data.map(row => {
      const newRow = { ...row };
      if (newRow.method) {
        newRow.method = formatMethodValue(newRow.method);
      }
      return newRow;
    });

    // Extract keys from first object
    const originalKeys = Object.keys(formattedData[0]);

    // Transform keys: camelCase/snake_case to Title Case with spaces
    const transformedHeaders = originalKeys.map(key => {
      // Special handling for 'method' key
      if (key === 'method') {
        return 'Method';
      }

      // Convert camelCase/snake_case to words
      return key
        .replace(/([A-Z])/g, ' $1')  // Add space before capital letters
        .replace(/[_-]/g, ' ')        // Replace underscores/hyphens with spaces
        .replace(/^./, str => str.toUpperCase())  // Capitalize first letter
        .trim();
    });

    // Create new data array with transformed headers
    const transformedData = formattedData.map(row => {
      const newRow = {};
      originalKeys.forEach((key, index) => {
        newRow[transformedHeaders[index]] = row[key];
      });
      return newRow;
    });

    const ws = XLSX.utils.json_to_sheet(transformedData);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Data");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    saveAs(new Blob([buffer]), `${fileName}.xlsx`);
  };



  // const handleExportBeforeDelete = async (buildingId, buildingName, type) => {
  //   try {
  //     const headers = {
  //       Authorization: `Bearer ${localStorage.getItem("token")}`,
  //     };

  //     let res;
  //     let data = [];

  //     if (type === "stationary-combustion") {
  //       res = await axios.get(
  //         `${process.env.REACT_APP_BASE_URL}/stationary/Get-All`,
  //         {
  //           headers,
  //           params: { buildingId, limit: 1000000 }
  //         }
  //       );
  //       data = res.data.data || [];
  //     }



  //     if (type === "mobile-combustion") {
  //       res = await axios.get(
  //         `${process.env.REACT_APP_BASE_URL}/AutoMobile/Get-All`,
  //         {
  //           headers,
  //           params: { buildingId, limit: 1000000 }
  //         }
  //       );
  //       data = res.data.data || [];
  //     }




  //     if (type === "fugitive-emissions") {
  //       res = await axios.get(
  //         `${process.env.REACT_APP_BASE_URL}/Fugitive/get-All`,
  //         {
  //           headers,
  //           params: { buildingId, limit: 1000000 }
  //         }
  //       );
  //       data = res.data.data || [];
  //     }



  //     if (type === "process-emissions") {
  //       res = await axios.get(
  //         `${process.env.REACT_APP_BASE_URL}/Process-Emissions/Get-All`,
  //         {
  //           headers,
  //           params: { buildingId, limit: 1000000 }
  //         }
  //       );
  //       data = res.data.data || [];
  //     }

  //     if (type === "purchased-electricity") {
  //       res = await axios.get(
  //         `${process.env.REACT_APP_BASE_URL}/Purchased-Electricity/get-All`,
  //         {
  //           headers,
  //           params: { buildingId, limit: 1000000 }
  //         }
  //       );
  //       data = res.data.data || [];
  //     }

  //     if (type === "purchased-goods") {
  //       res = await axios.get(
  //         `${process.env.REACT_APP_BASE_URL}/Purchased-Goods-Services/get-All`,
  //         {
  //           headers,
  //           params: { buildingId, limit: 1000000 }
  //         }
  //       );
  //       data = res.data.data || [];
  //     }

  //     if (type === "capital-goods-services") {
  //       try {
  //         const res = await axios.get(
  //           `${process.env.REACT_APP_BASE_URL}/Purchased-Goods-Services/get-All-isCaptialGoods`,
  //           {
  //             headers,
  //             params: {
  //               buildingId: buildingId || undefined,
  //               limit: 1000000,
  //             },
  //           }
  //         );

  //         data = res.data?.data || [];

  //         console.log("Capital Goods Export Data:", data);

  //         if (!data.length) {
  //           console.warn("No capital goods data found");
  //         }
  //       } catch (error) {
  //         console.error("Capital Goods API Error:", error);
  //         data = [];
  //       }
  //     }

  //     if (type === "fuelandenergy") {
  //       res = await axios.get(
  //         `${process.env.REACT_APP_BASE_URL}/Fuel-And-Energy/get-All`,
  //         {
  //           headers,
  //           params: { buildingId, limit: 1000000 }
  //         }
  //       );
  //       data = res.data.data || [];
  //     }

  //     if (type === "waste-generate") {
  //       res = await axios.get(
  //         `${process.env.REACT_APP_BASE_URL}/Waste-Generate/List`,
  //         {
  //           headers,
  //           params: { buildingId, limit: 1000000 }
  //         }
  //       );
  //       data = res.data.data || [];
  //     }

  //     if (type === "business-travel") {
  //       res = await axios.get(
  //         `${process.env.REACT_APP_BASE_URL}/Business-Travel/List`,
  //         {
  //           headers,
  //           params: { buildingId, limit: 1000000 }
  //         }
  //       );
  //       data = res.data.data || [];
  //     }


  //     if (type === "employee-commute") {
  //       res = await axios.get(
  //         `${process.env.REACT_APP_BASE_URL}/employee-commute/List`,
  //         {
  //           headers,
  //           params: { buildingId, limit: 1000000 }
  //         }
  //       );
  //       data = res.data.data || [];
  //     }

  //     if (type === "upstream") {
  //       res = await axios.get(
  //         `${process.env.REACT_APP_BASE_URL}/upstream/Get-All`,
  //         {
  //           headers,
  //           params: { buildingId, limit: 1000000 }
  //         }
  //       );
  //       data = res.data.data || [];
  //     }


  //     if (type === "downstream") {
  //       res = await axios.get(
  //         `${process.env.REACT_APP_BASE_URL}/downstream/Get-All`,
  //         {
  //           headers,
  //           params: { buildingId, limit: 1000000 }
  //         }
  //       );
  //       data = res.data.data || [];
  //     }

  //     if (type === "location_based" || type === "market_based") {
  //       res = await axios.get(
  //         `${process.env.REACT_APP_BASE_URL}/Purchased-Electricity/get-All`,
  //         {
  //           headers,
  //           params: {
  //             buildingId,
  //             page: 1,
  //             limit: 1000000,
  //             method: type
  //           }
  //         }
  //       );
  //       data = res.data.data || [];
  //     }

  //     const formattedData = data.map((item, index) => {
  //       const {
  //         _id,
  //         isDeleted,
  //         createdBy,
  //         updatedBy,
  //         createdAt,
  //         updatedAt,
  //         siteBuildingName,
  //         __v,
  //         building,
  //         buildingId,
  //         ...rest
  //       } = item;

  //       // ✅ Pick whichever exists
  //       const buildingObj =
  //         (typeof building === "object" && building) ||
  //         (typeof buildingId === "object" && buildingId) ||
  //         {};

  //       return {
  //         "Sr.No": index + 1,

  //         "Building Code": buildingObj?.buildingCode || "N/A",
  //         "Building Name": buildingObj?.buildingName || "N/A",

  //         ...rest,
  //       };
  //     });
  //     console.log("EXPORTED DATA:", data);

  //     // ✅ DIRECT EXPORT (NO FILTER)
  //     exportToExcel(formattedData, `${type}_${buildingName}`);

  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Export failed");
  //   }
  // };


  const handleExportBeforeDelete = async (data, type, buildingName) => {

    console.log(data);

    // try {
    //   const headers = {
    //     Authorization: `Bearer ${localStorage.getItem("token")}`,
    //   };

    //   let res;
    //   let data = [];

    //   // Stationary Combustion
    //   if (type === "stationary") {
    //     res = await axios.get(
    //       `${process.env.REACT_APP_BASE_URL}/stationary/Get-All`,
    //       {
    //         headers,
    //         params: { buildingId, limit: 1000000 }
    //       }
    //     );
    //     data = res.data.data || [];
    //   }

    //   // Mobile Combustion
    //   else if (type === "mobile-combustion") {
    //     res = await axios.get(
    //       `${process.env.REACT_APP_BASE_URL}/AutoMobile/Get-All`,
    //       {
    //         headers,
    //         params: { buildingId, limit: 1000000 }
    //       }
    //     );
    //     data = res.data.data || [];
    //   }

    //   // Fugitive Emissions
    //   else if (type === "fugitive") {
    //     res = await axios.get(
    //       `${process.env.REACT_APP_BASE_URL}/Fugitive/get-All`,
    //       {
    //         headers,
    //         params: { buildingId, limit: 1000000 }
    //       }
    //     );
    //     data = res.data.data || [];
    //   }

    //   // Process Emissions
    //   else if (type === "process-emission") {
    //     res = await axios.get(
    //       `${process.env.REACT_APP_BASE_URL}/Process-Emissions/Get-All`,
    //       {
    //         headers,
    //         params: { buildingId, limit: 1000000 }
    //       }
    //     );
    //     data = res.data.data || [];
    //   }

    //   // Purchased Electricity
    //   else if (type === "purchased-electricity") {
    //     res = await axios.get(
    //       `${process.env.REACT_APP_BASE_URL}/Purchased-Electricity/get-All`,
    //       {
    //         headers,
    //         params: { buildingId, limit: 1000000 }
    //       }
    //     );
    //     data = res.data.data || [];
    //   }

    //   // Purchased Goods and Services
    //   else if (type === "purchased-goods") {
    //     res = await axios.get(
    //       `${process.env.REACT_APP_BASE_URL}/Purchased-Goods-Services/get-All`,
    //       {
    //         headers,
    //         params: { buildingId, limit: 1000000 }
    //       }
    //     );
    //     data = res.data.data || [];
    //   }

    //   // Capital Goods
    //   else if (type === "capital-goods-services") {
    //     try {
    //       res = await axios.get(
    //         `${process.env.REACT_APP_BASE_URL}/Purchased-Goods-Services/get-All-isCaptialGoods`,
    //         {
    //           headers,
    //           params: {
    //             buildingId: buildingId || undefined,
    //             limit: 1000000,
    //           },
    //         }
    //       );
    //       data = res.data?.data || [];
    //       console.log("Capital Goods Export Data:", data);

    //       if (!data.length) {
    //         console.warn("No capital goods data found");
    //       }
    //     } catch (error) {
    //       console.error("Capital Goods API Error:", error);
    //       data = [];
    //     }
    //   }

    //   // Fuel & Energy Related Activities
    //   else if (type === "fuelandenergy") {
    //     res = await axios.get(
    //       `${process.env.REACT_APP_BASE_URL}/Fuel-And-Energy/get-All`,
    //       {
    //         headers,
    //         params: { buildingId, limit: 1000000 }
    //       }
    //     );
    //     data = res.data.data || [];
    //   }

    //   // Waste Generated in Operations
    //   else if (type === "waste-generate") {
    //     res = await axios.get(
    //       `${process.env.REACT_APP_BASE_URL}/Waste-Generate/List`,
    //       {
    //         headers,
    //         params: { buildingId, limit: 1000000 }
    //       }
    //     );
    //     data = res.data.data || [];
    //   }

    //   // Business Travel
    //   else if (type === "business-travel") {
    //     res = await axios.get(
    //       `${process.env.REACT_APP_BASE_URL}/Business-Travel/List`,
    //       {
    //         headers,
    //         params: { buildingId, limit: 1000000 }
    //       }
    //     );
    //     data = res.data.data || [];
    //   }

    //   // Employee Commuting
    //   else if (type === "employee-commute") {
    //     res = await axios.get(
    //       `${process.env.REACT_APP_BASE_URL}/employee-commute/List`,
    //       {
    //         headers,
    //         params: { buildingId, limit: 1000000 }
    //       }
    //     );
    //     data = res.data.data || [];
    //   }

    //   // Upstream Transportation
    //   else if (type === "upstreamTransportations") {
    //     res = await axios.get(
    //       `${process.env.REACT_APP_BASE_URL}/upstream/Get-All`,
    //       {
    //         headers,
    //         params: { buildingId, limit: 1000000 }
    //       }
    //     );
    //     data = res.data.data || [];
    //   }

    //   // Downstream Transportation
    //   else if (type === "downstream") {
    //     res = await axios.get(
    //       `${process.env.REACT_APP_BASE_URL}/downstream/Get-All`,
    //       {
    //         headers,
    //         params: { buildingId, limit: 1000000 }
    //       }
    //     );
    //     data = res.data.data || [];
    //   }

    //   // Location Based & Market Based
    //   else if (type === "location_based" || type === "market_based") {
    //     res = await axios.get(
    //       `${process.env.REACT_APP_BASE_URL}/Purchased-Electricity/get-All`,
    //       {
    //         headers,
    //         params: {
    //           buildingId,
    //           page: 1,
    //           limit: 1000000,
    //           method: type
    //         }
    //       }
    //     );
    //     data = res.data.data || [];
    //   }

    //   // If no data found
    //   if (!data || data.length === 0) {
    //     toast.warning(`No data found for ${type}`);
    //     return;
    //   }

    //   // Format data for export
    //   const formattedData = data.map((item, index) => {
    //     const {
    //       _id,
    //       isDeleted,
    //       createdBy,
    //       updatedBy,
    //       createdAt,
    //       updatedAt,
    //       siteBuildingName,
    //       __v,
    //       building,
    //       buildingId: itemBuildingId,
    //       ...rest
    //     } = item;

    //     // Pick whichever exists
    //     const buildingObj =
    //       (typeof building === "object" && building) ||
    //       (typeof itemBuildingId === "object" && itemBuildingId) ||
    //       {};

    //     return {
    //       "Sr.No": index + 1,
    //       "Building Code": buildingObj?.buildingCode || "N/A",
    //       "Building Name": buildingObj?.buildingName || "N/A",
    //       ...rest,
    //     };
    //   });

    //   console.log("EXPORTED DATA:", formattedData);

    //   // Export to Excel
    //   exportToExcel(formattedData, `${type}_${buildingName}`);

    // } catch (err) {
    //   console.error("Export error:", err);
    //   toast.error("Export failed");
    // }
    const formattedData = data.map((item, index) => {
      const {
        _id,
        isDeleted,
        createdBy,
        updatedBy,
        createdAt,
        updatedAt,
        siteBuildingName,
        __v,
        building,
        buildingId: itemBuildingId,
        ...rest
      } = item;

      // Pick whichever exists
      const buildingObj =
        (typeof building === "object" && building) ||
        (typeof itemBuildingId === "object" && itemBuildingId) ||
        {};

      return {
        "Sr.No": index + 1,
        "Building Code": buildingObj?.buildingCode || "N/A",
        "Building Name": buildingObj?.buildingName || "N/A",
        ...rest,
      };
    });

    console.log("EXPORTED DATA:", formattedData);

    // Export to Excel
    exportToExcel(formattedData, `${type}_${buildingName}`);

  };

  const exportItems = [
    // { label: "Electricity", type: "purchased-electricity" },
    { label: "Stationary Combustion", type: "stationary" },
    { label: "Mobile Combustion", type: "mobile-combustion" },
    { label: "Fugitive Emissions", type: "fugitive" },
    { label: "Process Emissions", type: "process-emission" },
    { label: "Purchased Electricity (Market Based)", type: "market_based" },
    { label: "Purchased Electricity (Location Based)", type: "location_based" },
    { label: "Purchased Goods and Services", type: "purchased-goods" },
    { label: "Capital Goods", type: "capital-goods-services" },
    { label: "Fuel & Energy Related Activities", type: "fuelandenergy" },
    { label: "Waste Generated in Operations", type: "waste-generate" },
    { label: "Business Travel", type: "business-travel" },
    { label: "Upstream Transportation and Distribution", type: "upstreamTransportations" },
    { label: "Downstream Transportation and Distribution", type: "downstream" },
    { label: "Employee Commuting", type: "employee-commute" },
  ];

  const typeKeyMap = {
    "stationary": "stationaryCombustions",
    "mobile-combustion": "autoMobiles", // or whatever the correct key is
    "fugitive": "fugitives",
    "process-emission": "emissionActivities", // adjust as needed
    "market_based": "purchasedElectricities",
    "location_based": "purchasedElectricities",
    "purchased-goods": "purchasedGoodsAndServices",
    "capital-goods-services": "capitalGoodsServices", // check your actual key
    "fuelandenergy": "fuelAndEnergies",
    "waste-generate": "wasteGenerates",
    "business-travel": "businessTravels",
    "upstreamTransportations": "upstreamTransportations",
    "downstream": "soldGoodsTransports",
    "employee-commute": "employeeCommuted"
  };

  const fetchData = async () => {
    setLoading2(true);
    try {
      const results = await axios.get(`${process.env.REACT_APP_BASE_URL}/building/Get-All-Buildings-With-Emissions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          buildingId: selectedBuildingId,
          page: 1,
          limit: 1000000,
        }
      });
      setExcelResults(results.data.data || []);
      setLoading2(false);
    }
    catch (error) {
      setLoading2(false);
    }
  };

  useEffect(() => {
    if (deleteModalOpen) {
      fetchData();
    }
  }, [deleteModalOpen])

  console.log(excelResults);

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
                  <img src={Logo} alt="Loading..." className="w-52 h-52" />
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
                try {
                  await handleDelete(selectedBuildingId);
                  setDeleteModalOpen(false);
                } catch (error) {
                  console.error('Export or delete failed:', error);
                  toast.error('Failed to export data or delete building');
                }
              }}
            />
          </>
        }
      >
        <div className="space-y-5 w-full">

          {/* Header Warning Card */}
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center shadow-sm">
            <div className="text-red-600 text-lg font-bold mb-1">
              Delete Building Confirmation
            </div>
            <p className="text-sm text-red-500">
              This action will permanently remove all associated data.
            </p>

            <div className="mt-1 text-gray-700">
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

          {/* <div className="flex items-center space-x-2  xs:w-auto">
            <Button
              text={"Export By Location Based"}
              icon="heroicons-outline:document-arrow-up"
              className='btn font-normal btn-sm bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white border-0 hover:opacity-90 whitespace-nowrap'
              onClick={() => handleExportBeforeDelete(selectedBuildingId, selectedBuildingName, "location_based")}
            />
            <Button
              text={"Export By Market Based"}
              icon="heroicons-outline:document-arrow-up"
              className='btn font-normal btn-sm bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white border-0 hover:opacity-90 whitespace-nowrap'
              onClick={() => handleExportBeforeDelete(selectedBuildingId, selectedBuildingName, "market_based")}
            />
          </div> */}

          {/* Export Cards */}
          <div className="grid grid-cols-3 gap-4">
            {loading2 ? (
              <div className="flex justify-center items-center py-8 w-full col-span-4">
                <div className="relative w-52 h-32 overflow-hidden rounded-md">
                  <img
                    src={Logo}
                    alt="Loading..."
                    className="w-full h-full object-contain opacity-70"
                  />
                  <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                </div>
              </div>
            ) :
              exportItems.map((item, index) => {
                const key = typeKeyMap[item.type];
                const data = excelResults[key];

                // Special handling for market_based and location_based
                const locationBase = item.type === "location_based" ? excelResults["purchasedElectricities"]?.filter(e => e.method === "location_based") : [];
                const marketBase = item.type === "market_based" ? excelResults["purchasedElectricities"]?.filter(e => e.method === "market_based") : [];

                // Check if data exists
                const hasData = item.type === "location_based"
                  ? locationBase?.length > 0
                  : item.type === "market_based"
                    ? marketBase?.length > 0
                    : data?.length > 0;

                if (hasData) {
                  return (
                    <div
                      key={index}
                      className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-200 group"
                    >
                      <div className="p-3">
                        <div className="text-xs font-semibold text-gray-700 mb-1 text-center">
                          {item.label}
                          {item.type === "location_based" && locationBase.length > 0 && (
                            <span className="ml-1 text-xs text-green-600">
                              ({locationBase.length})
                            </span>
                          )}
                          {item.type === "market_based" && marketBase.length > 0 && (
                            <span className="ml-1 text-xs text-green-600">
                              ({marketBase.length})
                            </span>
                          )}
                          {item.type !== "location_based" && item.type !== "market_based" && data?.length > 0 && (
                            <span className="ml-1 text-xs text-green-600">
                              ({data.length})
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleExportBeforeDelete(data, item.type, selectedBuildingName)}
                          className="w-full flex items-center justify-center py-2.5 rounded-lg bg-gray-50 hover:bg-green-50 transition-all duration-200 group/btn"
                        >
                          <Icon
                            icon="vscode-icons:file-type-excel"
                            className="w-7 h-7 transition-transform duration-200 group-hover/btn:scale-110"
                          />
                        </button>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
          </div>

        </div>
      </Modal>
    </>
  );
};

export default BuildingTable;