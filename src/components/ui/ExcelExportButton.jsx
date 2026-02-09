import React, { useMemo } from "react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

const ExcelExportButton = ({
  data,
  columns,
  filename = "export",
  sheetName = "Data",
  disabled = false,
  isLoading = false,
  className = "",
  buttonText = "Export to Excel",
  buttonIcon = "heroicons:document-arrow-down",
  // Optional: Customize which columns to export (by accessor or Header)
  includeColumns = [],
  excludeColumns = [],
  // Optional: Transform data before export
  transformData = null,
  // Optional: Add summary/total row
  addSummary = false,
  summaryRow = {},
}) => {
  const exportToExcel = () => {
    try {
      if (!data || data.length === 0) {
        toast.warning("No data to export");
        return;
      }

      // Prepare data for export
      let exportData = [...data];

      // Apply transformation if provided
      if (transformData && typeof transformData === "function") {
        exportData = exportData.map(transformData);
      }

      // Filter and map columns for export
      const exportColumns = columns.filter((col) => {
        // Skip if column doesn't have accessor or Header
        if (!col.accessor && !col.Header) return false;

        // Handle include/exclude filters
        if (includeColumns.length > 0) {
          const colKey = col.accessor || col.Header;
          return includeColumns.includes(colKey);
        }

        if (excludeColumns.length > 0) {
          const colKey = col.accessor || col.Header;
          return !excludeColumns.includes(colKey);
        }

        // Skip selection column by default
        if (col.id === "selection") return false;

        // Skip columns without proper header name
        if (typeof col.Header !== "string" || col.Header === "Actions") return false;

        return true;
      });

      // Create worksheet data
      const worksheetData = exportData.map((row) => {
        const rowData = {};
        
        exportColumns.forEach((col) => {
          let value = "";
          
          if (col.accessor) {
            // Handle nested accessors (e.g., "buildingId.buildingName")
            const accessorParts = col.accessor.split('.');
            value = accessorParts.reduce((obj, key) => obj?.[key], row) || "";
          } else if (col.Cell) {
            // Handle custom cell renderers
            const cellInfo = { value: row[col.id], row: { original: row } };
            try {
              value = col.Cell(cellInfo)?.props?.children || col.Cell(cellInfo);
              // Convert React elements to string
              if (typeof value === 'object') {
                value = String(value);
              }
            } catch (e) {
              value = row[col.id] || "";
            }
          } else {
            value = row[col.id] || row[col.accessor] || "";
          }

          // Apply column-specific formatting
          if (col.formatExport) {
            value = col.formatExport(value, row);
          }

          // Capitalize if needed (similar to your listing)
          if (col.capitalize && typeof value === 'string') {
            value = capitalizeLabel(value);
          }

          rowData[col.Header] = value;
        });

        return rowData;
      });

      // Add summary row if requested
      if (addSummary && Object.keys(summaryRow).length > 0) {
        worksheetData.push({});
        worksheetData.push(summaryRow);
      }

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(worksheetData, {
        header: exportColumns.map(col => col.Header),
      });

      // Auto-size columns
      const colWidths = exportColumns.map(col => ({
        wch: Math.max(
          col.Header.length,
          ...worksheetData.map(row => 
            String(row[col.Header] || "").length
          )
        )
      }));
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      // Generate and download file
      const fileName = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success(`Exported ${exportData.length} records successfully`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    }
  };

  // Capitalize function (same as your listing)
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

  return (
    <Button
      icon={isLoading ? "heroicons:arrow-path" : buttonIcon}
      text={isLoading ? "Exporting..." : buttonText}
      className={`btn font-normal btn-sm bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] text-white border-0 hover:opacity-90 ${className}`}
      iconClass={isLoading ? "text-lg animate-spin" : "text-lg"}
      onClick={exportToExcel}
      disabled={disabled || isLoading || !data || data.length === 0}
    />
  );
};

export default ExcelExportButton;