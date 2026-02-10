// @/utils/ExcelExportUtility.js
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * Utility class for Excel export operations
 */
class ExcelExportUtility {
  /**
   * Export data to Excel
   * @param {Array} data - Data to export
   * @param {Object} options - Export options
   */
  static async exportToExcel(data, options = {}) {
    const {
      fileName = "export",
      sheetName = "Data",
      columns = [],
      customFormatter,
      onProgress,
      onComplete,
      onError
    } = options;

    try {
      if (onProgress) onProgress(0);

      // Process data
      const processedData = this.processData(data, columns, customFormatter);

      if (onProgress) onProgress(50);

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(processedData);
      
      // Auto-size columns
      this.autoSizeColumns(worksheet, processedData);

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      if (onProgress) onProgress(80);

      // Create blob and download
      const fileData = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const date = new Date().toISOString().split('T')[0];
      const finalFileName = `${fileName}_${date}.xlsx`;
      
      saveAs(fileData, finalFileName);

      if (onProgress) onProgress(100);
      if (onComplete) onComplete(finalFileName);

      return finalFileName;

    } catch (error) {
      console.error("Excel export error:", error);
      if (onError) onError(error);
      throw error;
    }
  }

  /**
   * Process data for export
   */
  static processData(data, columns, customFormatter) {
    if (!columns || columns.length === 0) {
      return data.map((item, index) => ({
        "Sr.No": index + 1,
        ...item
      }));
    }

    return data.map((item, index) => {
      const exportRow = { "Sr.No": index + 1 };
      
      columns.forEach(column => {
        if (!column) return;
        
        let value = this.getValueFromItem(item, column);
        const header = this.getHeaderFromColumn(column);
        
        if (header && header !== "selection" && header !== "Actions" && header !== "actions") {
          if (customFormatter) {
            value = customFormatter(value, column, item);
          } else {
            value = this.formatValue(value, column);
          }
          exportRow[header] = value;
        }
      });
      
      return exportRow;
    });
  }

  /**
   * Get value from item based on column configuration
   */
  static getValueFromItem(item, column) {
    if (column.accessor && typeof column.accessor === "function") {
      return column.accessor(item);
    } else if (column.accessor && typeof column.accessor === "string" && column.accessor.includes(".")) {
      const keys = column.accessor.split(".");
      return keys.reduce((obj, key) => obj?.[key], item);
    } else if (column.accessor) {
      return item[column.accessor];
    } else if (column.id) {
      return item[column.id];
    }
    return undefined;
  }

  /**
   * Get header from column configuration
   */
  static getHeaderFromColumn(column) {
    if (column.Header && typeof column.Header === "string") {
      return column.Header;
    } else if (column.accessor && typeof column.accessor === "string") {
      return column.accessor.split('.').pop();
    } else if (column.id) {
      return column.id;
    }
    return undefined;
  }

  /**
   * Format value based on column type
   */
  static formatValue(value, column) {
    if (value === null || value === undefined || value === "") {
      return "N/A";
    }

    // Date formatting
    if (column.type === "date" || 
        column.accessor?.toLowerCase().includes("date") || 
        column.Header?.toLowerCase().includes("date")) {
      try {
        return new Date(value).toLocaleDateString('en-GB');
      } catch {
        return "Invalid Date";
      }
    }

    // Number formatting
    if (column.type === "number" || 
        (!isNaN(Number(value)) && typeof value !== "boolean")) {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        if (column.decimalPlaces !== undefined) {
          return numValue.toFixed(column.decimalPlaces);
        }
        return numValue.toFixed(2);
      }
    }

    // Boolean formatting
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    return value.toString();
  }

  /**
   * Auto-size columns in worksheet
   */
  static autoSizeColumns(worksheet, data) {
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
  }

  /**
   * Export multiple sheets to single Excel file
   */
  static async exportMultipleSheets(sheets, fileName = "export") {
    try {
      const workbook = XLSX.utils.book_new();
      
      sheets.forEach((sheet, index) => {
        const { data, sheetName = `Sheet${index + 1}`, columns } = sheet;
        const processedData = this.processData(data, columns);
        const worksheet = XLSX.utils.json_to_sheet(processedData);
        this.autoSizeColumns(worksheet, processedData);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });

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
      return finalFileName;

    } catch (error) {
      console.error("Multiple sheets export error:", error);
      throw error;
    }
  }
}

export default ExcelExportUtility;