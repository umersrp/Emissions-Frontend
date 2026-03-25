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
  exportFields = [], // New prop: array of field names to export
  buttonText = "Export to Excel",
  buttonClassName = "btn-dark font-normal btn-sm",
  icon = "heroicons-outline:document-arrow-up",
  loadingText = "Exporting...",
  successMessage = "Excel file exported successfully!",
  errorMessage = "Failed to export Excel file",
  disabled = false,
  exportFormat = "all",
  pageInfo = { currentPage: 1, limit: 10 },
  customFormatter = null,
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
  // const processExportData = (dataToExport, isAllData = false) => {
  //   if (!dataToExport || dataToExport.length === 0) return [];

  //   // Determine which fields to export
  //   let fieldsToExport = [];
    
  //   if (exportFields && exportFields.length > 0) {
  //     // Use explicitly provided export fields
  //     fieldsToExport = exportFields;
  //   } else if (columns && columns.length > 0) {
  //     // Fall back to filtering columns
  //     fieldsToExport = columns
  //       .filter(col => 
  //         col.id !== "serialNo" && 
  //         col.Header !== "Actions" && 
  //         col.accessor !== "__v" &&
  //         col.id !== "selection"
  //       )
  //       .map(col => col.accessor || col.id);
  //   }

  //   return dataToExport.map((item, index) => {
  //     const exportRow = {};
      
  //     // Calculate Sr.No
  //     let srNo = index + 1;
  //     if (!isAllData && pageInfo?.currentPage && pageInfo?.limit) {
  //       srNo = ((pageInfo.currentPage - 1) * pageInfo.limit) + index + 1;
  //     }
      
  //     exportRow["Sr.No"] = srNo;
      
  //     // Process each field to export
  //     fieldsToExport.forEach(field => {
  //       let value;
  //       let column = columns.find(col => col.accessor === field || col.id === field) || {};
        
  //       // Handle nested accessors (e.g., "buildingId.buildingName")
  //       if (typeof field === "string" && field.includes(".")) {
  //         const keys = field.split(".");
  //         value = keys.reduce((obj, key) => obj?.[key], item);
  //       } else {
  //         value = item[field];
  //       }
        
  //       // Special handling for buildingId to show building name
  //       if (field === "buildingId" || field === "buildingId.buildingName") {
  //         value = item.buildingId?.buildingName || "N/A";
  //       }
        
  //       // Use customFormatter if provided
  //       if (customFormatter && typeof customFormatter === 'function') {
  //         value = customFormatter(value, column, item, index);
  //         if (value === null) return;
  //       } else {
  //         value = formatValue(value, column);
  //       }
        
  //       // Ensure empty values become "N/A"
  //       if (value === null || value === undefined || value === "") {
  //         value = "N/A";
  //       }
        
  //       // Use column header as the key if available, otherwise use the field name
  //       const header = column.Header || field;
  //       exportRow[header] = value;
  //     });
      
  //     return exportRow;
  //   });
  // };
  // Process data for export
const processExportData = (dataToExport, isAllData = false) => {
  if (!dataToExport || dataToExport.length === 0) return [];

  // Debug logs
  console.log('exportFields:', exportFields);
  console.log('columns:', columns);
  console.log('dataToExport sample:', dataToExport[0]);

  // Determine which fields to export
  let fieldsToExport = [];
  
  if (exportFields && exportFields.length > 0) {
    // Use explicitly provided export fields
    fieldsToExport = exportFields;
    console.log('Using exportFields:', fieldsToExport);
  } else if (columns && columns.length > 0) {
    // Fall back to filtering columns
    fieldsToExport = columns
      .filter(col => 
        col.id !== "serialNo" && 
        col.Header !== "Actions" && 
        col.accessor !== "__v" &&
        col.id !== "selection"
      )
      .map(col => col.accessor || col.id);
    console.log('Using filtered columns:', fieldsToExport);
  }

  return dataToExport.map((item, index) => {
    const exportRow = {};
    
    // Calculate Sr.No
    let srNo = index + 1;
    if (!isAllData && pageInfo?.currentPage && pageInfo?.limit) {
      srNo = ((pageInfo.currentPage - 1) * pageInfo.limit) + index + 1;
    }
    
    exportRow["Sr.No"] = srNo;
    
    // Process each field to export
    fieldsToExport.forEach(field => {
      let value;
      let column = columns.find(col => col.accessor === field || col.id === field) || {};
      
      // Handle nested accessors (e.g., "buildingId.buildingName")
      if (typeof field === "string" && field.includes(".")) {
        const keys = field.split(".");
        value = keys.reduce((obj, key) => obj?.[key], item);
      } else {
        value = item[field];
      }
      
      // Special handling for buildingId to show building name
      if (field === "buildingId" || field === "buildingId.buildingName") {
        value = item.buildingId?.buildingName || "N/A";
      }
      
      // Use customFormatter if provided
      if (customFormatter && typeof customFormatter === 'function') {
        value = customFormatter(value, column, item, index);
        if (value === null) return;
      } else {
        value = formatValue(value, column);
      }
      
      // Ensure empty values become "N/A"
      if (value === null || value === undefined || value === "") {
        value = "N/A";
      }
      
      // Use column header as the key if available, otherwise use the field name
      const header = column.Header || field;
      exportRow[header] = value;
      
      // Debug log for first row
      if (index === 0) {
        console.log(`Field: ${field}, Header: ${header}, Value:`, value);
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