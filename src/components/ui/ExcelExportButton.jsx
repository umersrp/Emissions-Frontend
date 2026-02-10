// // @/components/ui/ExcelExportButton.js
// import React, { useState } from "react";
// import Button from "@/components/ui/Button";
// import Icon from "@/components/ui/Icon";
// import { toast } from "react-toastify";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";

// const ExcelExportButton = ({
//   data = [],
//   fetchAllData,
//   fileName = "export",
//   sheetName = "Data",
//   columns = [],
//   buttonText = "Export to Excel",
//   buttonClassName = "btn-dark font-normal btn-sm",
//   icon = "heroicons-outline:document-arrow-down",
//   loadingText = "Exporting...",
//   successMessage = "Excel file exported successfully!",
//   errorMessage = "Failed to export Excel file",
//   disabled = false,
//   exportFormat = "all", // 'all' or 'current'
//   onExportStart,
//   onExportComplete,
//   pageInfo = { currentPage: 1, limit: 10 },
//   ...props
// }) => {
//   const [exportLoading, setExportLoading] = useState(false);

//   // Format value based on column definition
//   const formatValue = (value, column) => {
//     if (value === null || value === undefined || value === "") {
//       return "N/A";
//     }

//     // Check if column has a custom Cell formatter
//     if (column.Cell) {
//       // For simple formatters, we'll handle common cases
//       const cellValue = { value };
      
//       // Date formatting
//       if (column.accessor?.includes("Date") || column.Header?.includes("Date")) {
//         try {
//           return new Date(value).toLocaleDateString('en-GB');
//         } catch {
//           return "Invalid Date";
//         }
//       }
      
//       // Number formatting with 2 decimal places
//       if (typeof value === "number" || !isNaN(Number(value))) {
//         const numValue = Number(value);
//         if (!isNaN(numValue)) {
//           return numValue.toFixed(2);
//         }
//       }
      
//       return value.toString();
//     }
    
//     return value;
//   };

//   // Process data for export
// // In ExcelExportButton.js, update the processExportData function:
// // In ExcelExportButton.js, update the processExportData function:
// const processExportData = (dataToExport, isAllData = false) => {
//   if (!columns || columns.length === 0) {
//     return dataToExport.map((item, index) => ({
//       "Sr.No": index + 1,
//       ...item
//     }));
//   }

//   return dataToExport.map((item, index) => {
//     const exportRow = {};
    
//     // Calculate Sr.No - safely handle missing pageInfo
//     let srNo = index + 1;
//     if (!isAllData && pageInfo?.currentPage && pageInfo?.limit) {
//       srNo = ((pageInfo.currentPage - 1) * pageInfo.limit) + index + 1;
//     }
    
//     // Always add Sr.No as first column
//     exportRow["Sr.No"] = srNo;
    
//     // Filter out columns that shouldn't be exported
//     const exportColumns = columns.filter(col => 
//       col.id !== "serialNo" && 
//       col.Header !== "Actions" && 
//       col.accessor !== "_id" &&
//       col.id !== "selection"
//     );
    
//     exportColumns.forEach(column => {
//       let value;
      
//       // Handle nested accessors
//       if (column.accessor && typeof column.accessor === "string" && column.accessor.includes(".")) {
//         const keys = column.accessor.split(".");
//         value = keys.reduce((obj, key) => obj?.[key], item);
//       } else if (column.accessor) {
//         value = item[column.accessor];
//       } else if (column.id) {
//         value = item[column.id];
//       } else if (column.Cell) {
//         // For columns with only Cell renderer, try to get value from row
//         const cellProps = { row: { original: item } };
//         try {
//           value = column.Cell(cellProps);
//         } catch (e) {
//           value = "";
//         }
//       }
      
//       const header = column.Header || column.accessor || column.id;
//       if (header && value !== undefined) {
//         if (customFormatter) {
//           value = customFormatter(value, column, item, index);
//         } else {
//           value = formatValue(value, column);
//         }
//         exportRow[header] = value;
//       }
//     });
    
//     return exportRow;
//   });
// };

//   // Auto-size columns
//   const autoSizeColumns = (worksheet, data) => {
//     if (!data || data.length === 0) return;

//     const colWidths = {};
    
//     // Calculate max width for each column
//     data.forEach(row => {
//       Object.keys(row).forEach(key => {
//         const valueLength = row[key] ? row[key].toString().length : 0;
//         const headerLength = key.length;
//         const maxLength = Math.max(valueLength, headerLength);
        
//         colWidths[key] = Math.max(colWidths[key] || 0, maxLength);
//       });
//     });

//     worksheet['!cols'] = Object.keys(colWidths).map(key => ({
//       width: Math.min(Math.max(colWidths[key] + 2, 10), 50) // Min 10, Max 50
//     }));
//   };

//   // Export function
//   const handleExport = async () => {
//     if (disabled) return;
    
//     if (exportFormat === "current" && (!data || data.length === 0)) {
//       toast.error("No data to export");
//       return;
//     }

//     setExportLoading(true);
//     if (onExportStart) onExportStart();

//     try {
//       let exportData;
      
//       if (exportFormat === "all" && fetchAllData) {
//         // Fetch all data for export
//         exportData = await fetchAllData();
//       } else {
//         // Use current page data
//         exportData = data;
//       }

//       if (!exportData || exportData.length === 0) {
//         toast.error("No data to export");
//         return;
//       }

//       // Process data for export
//       const processedData = processExportData(exportData);

//       // Create worksheet
//       const worksheet = XLSX.utils.json_to_sheet(processedData);
      
//       // Auto-size columns
//       autoSizeColumns(worksheet, processedData);

//       // Create workbook
//       const workbook = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

//       // Generate Excel file
//       const excelBuffer = XLSX.write(workbook, {
//         bookType: "xlsx",
//         type: "array",
//       });

//       // Create blob and download
//       const fileData = new Blob([excelBuffer], {
//         type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       });

//       // Generate filename with current date
//       const date = new Date().toISOString().split('T')[0];
//       const finalFileName = `${fileName}_${date}.xlsx`;
      
//       saveAs(fileData, finalFileName);
//       toast.success(successMessage);

//       if (onExportComplete) onExportComplete(exportData);

//     } catch (error) {
//       console.error("Error exporting to Excel:", error);
//       toast.error(errorMessage);
//     } finally {
//       setExportLoading(false);
//     }
//   };

//   return (
//     <Button
//       icon={exportLoading ? "heroicons:arrow-path" : icon}
//       text={exportLoading ? loadingText : buttonText}
//       className={`${buttonClassName} ${exportLoading ? "opacity-80" : ""}`}
//       iconClass={exportLoading ? "text-lg animate-spin" : "text-lg"}
//       onClick={handleExport}
//       disabled={exportLoading || disabled}
//       {...props}
//     />
//   );
// };

// // Helper HOC for common export configurations
// export const withExportConfig = (Component, defaultConfig = {}) => {
//   return (props) => <Component {...defaultConfig} {...props} />;
// };

// export default ExcelExportButton;
// @/components/ui/ExcelExportButton.js
import React, { useState } from "react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ExcelExportButton = ({
  data = [],
  fetchAllData,
  fileName = "export",
  sheetName = "Data",
  columns = [],
  buttonText = "Export to Excel",
  buttonClassName = "btn-dark font-normal btn-sm",
  icon = "heroicons-outline:document-arrow-down",
  loadingText = "Exporting...",
  successMessage = "Excel file exported successfully!",
  errorMessage = "Failed to export Excel file",
  disabled = false,
  exportFormat = "all",
  pageInfo = { currentPage: 1, limit: 10 },
  customFormatter = null, // Add customFormatter prop with default null
  onExportStart,
  onExportComplete,
  ...props
}) => {
  const [exportLoading, setExportLoading] = useState(false);

  // Format value based on column definition
  const formatValue = (value, column) => {
    // Handle empty values for ALL columns
  if (value === null || value === undefined || value === "" || value === " ") {
    return "N/A";
  }

    // Date formatting
    if (column.accessor?.includes("Date") || column.Header?.includes("Date")) {
      try {
        return new Date(value).toLocaleDateString('en-GB');
      } catch {
        return "Invalid Date";
      }
    }
    
    // Number formatting with 2 decimal places
    if (typeof value === "number" || !isNaN(Number(value))) {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        return numValue.toFixed(2);
      }
    }
    
    return value.toString();
  };

  // Process data for export
// In ExcelExportButton.js, update the processExportData function:
const processExportData = (dataToExport, isAllData = false) => {
  if (!columns || columns.length === 0) {
    return dataToExport.map((item, index) => ({
      "Sr.No": index + 1,
      ...item
    }));
  }

  return dataToExport.map((item, index) => {
    const exportRow = {};
    
    // Calculate Sr.No
    let srNo = index + 1;
    if (!isAllData && pageInfo?.currentPage && pageInfo?.limit) {
      srNo = ((pageInfo.currentPage - 1) * pageInfo.limit) + index + 1;
    }
    
    // Always add Sr.No as first column
    exportRow["Sr.No"] = srNo;
    
    // Filter out columns that shouldn't be exported
    const exportColumns = columns.filter(col => 
      col.id !== "serialNo" && 
      col.Header !== "Actions" && 
      col.accessor !== "_id" &&
      col.id !== "selection"
    );
    
    exportColumns.forEach(column => {
      let value;
      
      // Handle nested accessors (e.g., "buildingId.buildingCode")
      if (column.accessor && typeof column.accessor === "string" && column.accessor.includes(".")) {
        const keys = column.accessor.split(".");
        value = keys.reduce((obj, key) => {
          if (obj === null || obj === undefined || obj === "") {
            return undefined; // Stop if any level is null/undefined
          }
          return obj[key];
        }, item);
      } else if (column.accessor) {
        value = item[column.accessor];
      } else if (column.id) {
        value = item[column.id];
      }
      
      // Get the header name
      const header = column.Header || column.accessor || column.id;
      
      if (header) {
        // Handle empty/undefined values BEFORE passing to formatter
        if (value === null || value === undefined || value === "") {
          value = "N/A";
        }
        
        // Use customFormatter if provided
        if (customFormatter && typeof customFormatter === 'function') {
          value = customFormatter(value, column, item, index);
        } else {
          value = formatValue(value, column);
        }
        
        // Final safety check - if value is still empty, set to "N/A"
        if (value === null || value === undefined || value === "") {
          value = "N/A";
        }
        
        exportRow[header] = value;
      }
    });
    
    return exportRow;
  });
};

  // Auto-size columns
  const autoSizeColumns = (worksheet, data) => {
    if (!data || data.length === 0) return;

    const colWidths = {};
    
    data.forEach(row => {
      Object.keys(row).forEach(key => {
        const valueLength = row[key] ? row[key].toString().length : 0;
        const headerLength = key.length;
        const maxLength = Math.max(valueLength, headerLength);
        
        colWidths[key] = Math.max(colWidths[key] || 0, maxLength);
      });
    });

    worksheet['!cols'] = Object.keys(colWidths).map(key => ({
      width: Math.min(Math.max(colWidths[key] + 2, 10), 50)
    }));
  };

  // Export function
  const handleExport = async () => {
    if (disabled) return;
    
    if (exportFormat === "current" && (!data || data.length === 0)) {
      toast.error("No data to export");
      return;
    }

    setExportLoading(true);
    if (onExportStart) onExportStart();

    try {
      let exportData;
      let isAllData = false;
      
      if (exportFormat === "all" && fetchAllData) {
        exportData = await fetchAllData();
        isAllData = true;
      } else {
        exportData = data;
      }

      if (!exportData || exportData.length === 0) {
        toast.error("No data to export");
        return;
      }

      const processedData = processExportData(exportData, isAllData);

      const worksheet = XLSX.utils.json_to_sheet(processedData);
      autoSizeColumns(worksheet, processedData);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const fileData = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const date = new Date().toISOString().split('T')[0];
      const finalFileName = `${fileName}_${date}.xlsx`;
      
      saveAs(fileData, finalFileName);
      toast.success(successMessage);

      if (onExportComplete) onExportComplete(exportData);

    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error(errorMessage);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <Button
      icon={exportLoading ? "heroicons:arrow-path" : icon}
      text={exportLoading ? loadingText : buttonText}
      className={`${buttonClassName} ${exportLoading ? "opacity-80" : ""}`}
      iconClass={exportLoading ? "text-lg animate-spin" : "text-lg"}
      onClick={handleExport}
      disabled={exportLoading || disabled}
      {...props}
    />
  );
};

export default ExcelExportButton;