
import React, { useState, useMemo, useEffect, useRef } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import axios from "axios";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  useTable,
  useRowSelect,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import { useSelector } from "react-redux";
import Icons from "@/components/ui/Icon";
import Tippy from "@tippyjs/react";
import { formatDateDMY } from "@/hooks/dateFormateDMY";


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

// const BulkImportModal = ({ isOpen, onClose, onImportComplete }) => {
//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState([]);
//   const [importing, setImporting] = useState(false);
//   const [progress, setProgress] = useState({ done: 0, total: 0, errors: [] });
//   const [step, setStep] = useState("upload"); // upload | preview | result
//   const fileInputRef = useRef(null);
//   const user = JSON.parse(localStorage.getItem("user"));
//   const companyId = user?.companyId;

//   const REQUIRED_COLUMNS = ["name", "email", "password", "employeeID", "companyId", "buildingCode"];

//   const resetModal = () => {
//     setFile(null);
//     setPreview([]);
//     setProgress({ done: 0, total: 0, errors: [] });
//     setStep("upload");
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   const handleClose = () => {
//     resetModal();
//     onClose();
//   };

//   // Download sample template
//   const downloadTemplate = () => {
//     const sampleData = [
//       {
//         Name: "John Doe",
//         Email: "john.doe@example.com",
//         Password: "SecurePass123",
//         EmployeeID: "EMP001",
//         BuildingCode: "BLD-001",
//       },
//       {
//         Name: "Jane Smith",
//         Email: "jane.smith@example.com",
//         Password: "SecurePass456",
//         EmployeeID: "EMP002",
//         BuildingCode: "BLD-002",
//       },
//     ];

//     const ws = XLSX.utils.json_to_sheet(sampleData);

//     const headerStyle = {
//       font: { bold: true, color: { rgb: "FFFFFF" } },
//       fill: { fgColor: { rgb: "3AB89D" } },
//       alignment: { horizontal: "center" },
//     };
//     ["A1", "B1", "C1", "D1", "E1"].forEach((cell) => {
//       if (ws[cell]) ws[cell].s = headerStyle;
//     });

//     ws["!cols"] = [
//       { wch: 20 }, { wch: 30 }, { wch: 20 },
//       { wch: 15 }, { wch: 15 },
//     ];

//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Employees");
//     XLSX.writeFile(wb, "Employee_Import_Template.xlsx");
//     toast.success("Template downloaded!");
//   };

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (!selectedFile) return;

//     const ext = selectedFile.name.split(".").pop().toLowerCase();
//     if (!["xlsx", "xls", "csv"].includes(ext)) {
//       toast.error("Please upload a valid Excel (.xlsx, .xls) or CSV file");
//       return;
//     }

//     setFile(selectedFile);
//     const reader = new FileReader();

//     reader.onload = (evt) => {
//       try {
//         const data = new Uint8Array(evt.target.result);
//         const workbook = XLSX.read(data, { type: "array" });
//         const sheetName = workbook.SheetNames[0];
//         const worksheet = workbook.Sheets[sheetName];
//         const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

//         if (jsonData.length === 0) {
//           toast.error("The file is empty or has no data rows.");
//           return;
//         }

//         // Map capitalized headers to lowercase field names (without companyId)
//         const headerMap = {
//           "Name": "name",
//           "Email": "email",
//           "Password": "password",
//           "EmployeeID": "employeeID",
//           "BuildingCode": "buildingCode",
//         };

//         const normalized = jsonData.map((row) => {
//           const newRow = {};
//           Object.keys(row).forEach((key) => {
//             const trimmedKey = key.trim();
//             const fieldName = headerMap[trimmedKey] || trimmedKey.toLowerCase();
//             newRow[fieldName] = row[key];
//           });
//           return newRow;
//         });

//         // Update REQUIRED_COLUMNS filter
//         const requiredCols = ["name", "email", "password", "employeeID", "buildingCode"];
//         const fileColumns = Object.keys(normalized[0] || {});
//         const missing = requiredCols.filter(
//           (col) => !fileColumns.includes(col)
//         );
//         if (missing.length > 0) {
//           toast.error(`Missing required columns: ${missing.join(", ")}`);
//           return;
//         }

//         setPreview(normalized);
//         setStep("preview");
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to parse file. Please use the provided template.");
//       }
//     };

//     reader.readAsArrayBuffer(selectedFile);
//   };

//   const handleImport = async () => {
//     setImporting(true);
//     const errors = [];
//     let done = 0;
//     const total = preview.length;
//     setProgress({ done: 0, total, errors: [] });

//     for (const row of preview) {
//       try {
//         const encryptedPassword = btoa(String(row.password));

//         await axios.post(
//           `${process.env.REACT_APP_BASE_URL}/auth/register`,
//           {
//             name: row.name,
//             email: String(row.email).toLowerCase().trim(),
//             password: encryptedPassword,
//             companyId: companyId, // From localStorage, not from file
//             buildingCode: row.buildingCode,
//             employeeID: row.employeeID,
//             type: "user",
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("token")}`,
//             },
//           }
//         );
//         done++;
//       } catch (err) {
//         const msg =
//           err?.response?.data?.message ||
//           err?.response?.data?.error ||
//           "Unknown error";
//         errors.push({ row: row.email || row.employeeID, error: msg });
//         done++;
//       }
//       setProgress({ done, total, errors: [...errors] });
//     }

//     setImporting(false);
//     setStep("result");
//     const successCount = total - errors.length;
//     if (successCount > 0) {
//       toast.success(`${successCount} employee(s) imported successfully!`);
//       onImportComplete();
//     }
//     if (errors.length > 0) {
//       toast.error(`${errors.length} row(s) failed. Check the report below.`);
//     }
//   };

//   const downloadErrorReport = () => {
//     const ws = XLSX.utils.json_to_sheet(
//       progress.errors.map((e) => ({ Employee: e.row, Error: e.error }))
//     );
//     ws["!cols"] = [{ wch: 30 }, { wch: 60 }];
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Errors");
//     XLSX.writeFile(wb, "Import_Errors.xlsx");
//   };

//   if (!isOpen) return null;

//   const successCount = progress.total - progress.errors.length;

//   return (
//     <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden pl-4 pr-4 ">
//         {/* Header */}
//         <div className="flex items-center justify-between mt-3 ">
//           <div className="flex items-center ">
//             <h3 className="text-black font-semibold text-lg">Bulk Import Employees</h3>
//           </div>
//           <button onClick={handleClose} className="text-white/80 hover:text-white transition-colors">
//             <Icon icon="heroicons:x-mark" className="text-2xl" />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="flex-1 overflow-y-auto pl-4 pr-4">
//           {/* ── Step 1: Upload ── */}
//           {step === "upload" && (
//             <div className="space-y-6">
//               {/* Required columns info */}
//               <div className="text-slate-700 leading-relaxed mb-3 bg-gray-100 rounded-lg border-l-4 border-primary-400 p-2 pl-4 m-4 mt-2  justify-center">
//                 <div className="flex items-center justify-center mb-2">
//                   <div className="flex items-start">
//                     <Icon icon="heroicons:information-circle" className="w-5 h-5 sm:w-6 sm:h-6 text-black-500 flex-shrink-0 mr-2" />
//                     <div className="flex-1 min-w-0">
//                       <h4 className="font-semibold text-sm sm:text-base text-black-800 mb-0.5 sm:mb-1">
//                         How to upload:
//                       </h4>
//                       <div className="text-xs sm:text-sm ">
//                         <ol className="text-sm text-black-700 space-y-1 list-decimal pl-4">
//                           <li>Download the template below</li>
//                           <li>Fill in your data (keep column headers as is)</li>
//                           <li>Save as xlsx file</li>
//                           <li>Upload using the form below</li>
//                           <li>Review validation results and submit</li>
//                         </ol>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex items-center justify-center">
//                 <Button
//                   text="Download Sample Template (.xlsx)"
//                   className="btn-dark w-full sm:w-auto text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
//                   iconClass="text-lg"
//                   icon="heroicons:document-arrow-down"
//                   onClick={downloadTemplate}
//                 />
//               </div>

//               {/* Drop zone */}
//               <div
//                 className="relative border-2 border-dashed border-slate-300 rounded-xl text-center hover:border-[#a1d9c3] hover:bg-slate-50 transition-all cursor-pointer pb-3 p-3"
//                 onClick={() => fileInputRef.current?.click()}
//                 onDragOver={(e) => e.preventDefault()}
//                 onDrop={(e) => {
//                   e.preventDefault();
//                   const dt = e.dataTransfer.files[0];
//                   if (dt) {
//                     fileInputRef.current.files = e.dataTransfer.files;
//                     handleFileChange({ target: { files: [dt] } });
//                   }
//                 }}
//               >
//                 <input
//                   type="file"
//                   ref={fileInputRef}
//                   className="hidden"
//                   accept=".xlsx,.xls,.csv"
//                   onChange={handleFileChange}
//                 />
//                 <Icon icon="heroicons:cloud-arrow-up" className="text-5xl text-slate-400 mx-auto mb-1" />
//                 <p className="text-slate-600 font-medium mb-2">Choose file or drag & drop</p>
//                 <p className="text-slate-400 text-xs mb-2">xlsx, xls, and csv files only (max 10MB)</p>
//                 <Button
//                   text="Browse Files"
//                   className="btn font-normal btn-sm bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white border-0 hover:opacity-90"
//                   onClick={handleFileChange}
//                   size="sm"
//                 />
//               </div>
//             </div>
//           )}

//         {/* ── Step 2: Preview ── */}
//         {step === "preview" && (
//           <div className="space-y-4">
//             <div className="flex items-center justify-between">
//               <p className="text-slate-700 font-semibold">
//                 Preview — {preview.length} row(s) found
//               </p>
//               <button
//                 onClick={() => { setStep("upload"); setPreview([]); setFile(null); }}
//                 className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
//               >
//                 <Icon icon="heroicons:arrow-left" /> Change file
//               </button>
//             </div>

//             <div className="overflow-x-auto rounded-xl border border-slate-200">
//               <table className="min-w-full text-sm">
//                 <thead className="bg-slate-100">
//                   <tr>
//                     <th className="px-3 py-2 text-left text-slate-600 font-medium">#</th>
//                     {REQUIRED_COLUMNS.map((col) => (
//                       <th key={col} className="px-3 py-2 text-left text-slate-600 font-medium capitalize">
//                         {col}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100">
//                   {preview.slice(0, 10).map((row, i) => (
//                     <tr key={i} className="hover:bg-slate-50">
//                       <td className="px-3 py-2 text-slate-400">{i + 1}</td>
//                       {REQUIRED_COLUMNS.map((col) => (
//                         <td key={col} className="px-3 py-2 text-slate-700 max-w-[150px] truncate">
//                           {col === "password" ? "••••••••" : (row[col] || "-")}
//                         </td>
//                       ))}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//               {preview.length > 10 && (
//                 <p className="text-center text-slate-400 text-xs py-2 border-t border-slate-100">
//                   ... and {preview.length - 10} more row(s)
//                 </p>
//               )}
//             </div>

//             <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 text-amber-700 text-sm">
//               <Icon icon="heroicons:exclamation-triangle" className="text-lg flex-shrink-0 mt-0.5" />
//               <span>
//                 Review the data carefully before importing. This action will create {preview.length} new employee account(s).
//               </span>
//             </div>
//           </div>
//         )}

//         {/* ── Step 3: Importing / Result ── */}
//         {step === "result" && (
//           <div className="space-y-6">
//             {importing && (
//               <div className="text-center py-6">
//                 <div className="inline-block w-12 h-12 border-4 border-[#3AB89D] border-t-transparent rounded-full animate-spin mb-4" />
//                 <p className="text-slate-600 font-medium">
//                   Importing {progress.done} / {progress.total}...
//                 </p>
//                 <div className="mt-3 w-full bg-slate-100 rounded-full h-2.5">
//                   <div
//                     className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] h-2.5 rounded-full transition-all duration-300"
//                     style={{ width: `${(progress.done / progress.total) * 100}%` }}
//                   />
//                 </div>
//               </div>
//             )}

//             {!importing && (
//               <>
//                 {/* Summary cards */}
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
//                     <p className="text-3xl font-bold text-green-600">{successCount}</p>
//                     <p className="text-green-700 text-sm mt-1">Imported Successfully</p>
//                   </div>
//                   <div className={`border rounded-xl p-4 text-center ${progress.errors.length > 0 ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}>
//                     <p className={`text-3xl font-bold ${progress.errors.length > 0 ? "text-red-500" : "text-slate-400"}`}>
//                       {progress.errors.length}
//                     </p>
//                     <p className={`text-sm mt-1 ${progress.errors.length > 0 ? "text-red-600" : "text-slate-500"}`}>Failed</p>
//                   </div>
//                 </div>

//                 {/* Error list */}
//                 {progress.errors.length > 0 && (
//                   <div>
//                     <div className="flex items-center justify-between mb-2">
//                       <p className="text-slate-700 font-medium text-sm">Failed Rows</p>
//                       <button
//                         onClick={downloadErrorReport}
//                         className="text-xs text-[#3AB89D] hover:underline flex items-center gap-1"
//                       >
//                         <Icon icon="heroicons:arrow-down-tray" /> Download Error Report
//                       </button>
//                     </div>
//                     <div className="rounded-xl border border-red-200 overflow-hidden max-h-52 overflow-y-auto">
//                       {progress.errors.map((e, i) => (
//                         <div key={i} className="flex gap-3 px-4 py-2.5 border-b border-red-100 last:border-0 bg-red-50/40 text-sm">
//                           <span className="text-slate-600 font-medium min-w-[140px] truncate">{e.row}</span>
//                           <span className="text-red-600">{e.error}</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Footer */}
//       <div className="px-3 py-2 mb-2 border-t border-slate-100 flex items-center justify-end bg-slate-50">
//         <button
//           onClick={handleClose}
//           className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium btn-danger bg-slate-200 hover:bg-slate-300 transition-colors rounded-sm"
//         >
//           {step === "result" ? "Close" : "Cancel"}
//         </button>

//         <div className="flex gap-3">
//           {step === "preview" && (
//             <button
//               onClick={handleImport}
//               disabled={importing}
//               className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
//             >
//               <Icon icon="heroicons:arrow-up-tray" />
//               Import {preview.length} Employee(s)
//             </button>
//           )}

//           {step === "result" && progress.errors.length > 0 && successCount === 0 && (
//             <button
//               onClick={resetModal}
//               className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
//             >
//               <Icon icon="heroicons:arrow-path" />
//               Try Again
//             </button>
//           )}
//         </div>
//       </div>

//     </div>
//     </div >
//   );
// };

// ─── Main UserPage ────────────────────────────────────────────────────────────

const BulkImportModal = ({ isOpen, onClose, onImportComplete, buildings, userData }) => {

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, errors: [] });
  const [step, setStep] = useState("upload");
  const fileInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const companyId = user?.companyId;
  const errorSectionRef = useRef(null); // Add this ref for the error section

  const REQUIRED_COLUMNS = ["name", "email", "password", "employeeID", "companyId", "buildingCode"];

  useEffect(() => {
    if (progress.errors.length > 0) {
      setTimeout(() => {
        errorSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end"
        });
      }, 100);
    }
  }, [progress.errors])

  const resetModal = () => {
    setFile(null);
    setPreview([]);
    setProgress({ done: 0, total: 0, errors: [] });
    setStep("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const downloadTemplate = () => {
    const sampleData = [
      {
        Name: "John Doe",
        Email: "john.doe@example.com",
        Password: "SecurePass123",
        EmployeeID: "EMP001",
        BuildingCode: "BLD-001",
      },
      {
        Name: "Jane Smith",
        Email: "jane.smith@example.com",
        Password: "SecurePass456",
        EmployeeID: "EMP002",
        BuildingCode: "BLD-002",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "3AB89D" } },
      alignment: { horizontal: "center" },
    };
    ["A1", "B1", "C1", "D1", "E1"].forEach((cell) => {
      if (ws[cell]) ws[cell].s = headerStyle;
    });
    ws["!cols"] = [
      { wch: 20 }, { wch: 30 }, { wch: 20 },
      { wch: 15 }, { wch: 15 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.writeFile(wb, "Employee_Import_Template.xlsx");
    toast.success("Template downloaded!");
  };

  // const handleFileChange = (e) => {
  //   const selectedFile = e.target.files[0];
  //   if (!selectedFile) return;

  //   const ext = selectedFile.name.split(".").pop().toLowerCase();
  //   if (!["xlsx", "xls", "csv"].includes(ext)) {
  //     toast.error("Please upload a valid Excel (.xlsx, .xls) or CSV file");
  //     return;
  //   }

  //   setFile(selectedFile);
  //   const reader = new FileReader();

  //   reader.onload = (evt) => {
  //     try {
  //       const data = new Uint8Array(evt.target.result);
  //       const workbook = XLSX.read(data, { type: "array" });
  //       const sheetName = workbook.SheetNames[0];
  //       const worksheet = workbook.Sheets[sheetName];
  //       const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

  //       if (jsonData.length === 0) {
  //         toast.error("The file is empty or has no data rows.");
  //         return;
  //       }

  //       const headerMap = {
  //         "Name": "name",
  //         "Email": "email",
  //         "Password": "password",
  //         "EmployeeID": "employeeID",
  //         "BuildingCode": "buildingCode",
  //       };

  //       const normalized = jsonData.map((row) => {
  //         const newRow = {};
  //         Object.keys(row).forEach((key) => {
  //           const trimmedKey = key.trim();
  //           const fieldName = headerMap[trimmedKey] || trimmedKey.toLowerCase();
  //           newRow[fieldName] = row[key];
  //         });
  //         return newRow;
  //       });

  //       const requiredCols = ["name", "email", "password", "employeeID", "buildingCode"];
  //       const fileColumns = Object.keys(normalized[0] || {});
  //       const missing = requiredCols.filter((col) => !fileColumns.includes(col));
  //       if (missing.length > 0) {
  //         toast.error(`Missing required columns: ${missing.join(", ")}`);
  //         return;
  //       }

  //       setPreview(normalized);
  //       // ── NO setStep("preview") here ──
  //     } catch (err) {
  //       console.error(err);
  //       toast.error("Failed to parse file. Please use the provided template.");
  //     }
  //   };

  //   reader.readAsArrayBuffer(selectedFile);
  // };

  // const handleFileChange = (e) => {
  //   const selectedFile = e.target.files[0];
  //   if (!selectedFile) return;
  //   const ext = selectedFile.name.split(".").pop().toLowerCase();
  //   if (!["xlsx", "xls", "csv"].includes(ext)) {
  //     toast.error("Please upload a valid Excel (.xlsx, .xls) or CSV file");
  //     return;
  //   }
  //   setFile(selectedFile);
  //   const reader = new FileReader();
  //   reader.onload = (evt) => {
  //     try {
  //       const data = new Uint8Array(evt.target.result);
  //       const workbook = XLSX.read(data, { type: "array" });
  //       const sheetName = workbook.SheetNames[0];
  //       const worksheet = workbook.Sheets[sheetName];
  //       const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

  //       if (jsonData.length === 0) {
  //         toast.error("The file is empty or has no data rows.");
  //         return;
  //       }

  //       const headerMap = {
  //         "Name": "name",
  //         "Email": "email",
  //         "Password": "password",
  //         "EmployeeID": "employeeID",
  //         "BuildingCode": "buildingCode",
  //       };

  //       const normalized = jsonData.map((row) => {
  //         const newRow = {};
  //         Object.keys(row).forEach((key) => {
  //           const trimmedKey = key.trim();
  //           const fieldName = headerMap[trimmedKey] || trimmedKey.toLowerCase();
  //           newRow[fieldName] = row[key];
  //         });
  //         return newRow;
  //       });

  //       const requiredCols = ["name", "email", "password", "employeeID", "buildingCode"];
  //       const fileColumns = Object.keys(normalized[0] || {});
  //       const missing = requiredCols.filter((col) => !fileColumns.includes(col));
  //       if (missing.length > 0) {
  //         toast.error(`Missing required columns: ${missing.join(", ")}`);
  //         return;
  //       }

  //       // Validate each row and collect errors
  //       const validationErrorsList = [];
  //       normalized.forEach((row, index) => {
  //         const rowNumber = index + 2; // +2 because index 0 is row 2 (accounting for header)

  //         // Check required fields
  //         if (!row.name || row.name.trim() === '') {
  //           validationErrorsList.push({
  //             row: `Row ${rowNumber}`,
  //             error: `Name is required`
  //           });
  //         }

  //         if (!row.email || row.email.trim() === '') {
  //           validationErrorsList.push({
  //             row: `Row ${rowNumber}`,
  //             error: `Email is required`
  //           });
  //         } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
  //           validationErrorsList.push({
  //             row: `Row ${rowNumber}`,
  //             error: `Invalid email format: ${row.email}`
  //           });
  //         }

  //         if (!row.password || row.password.trim() === '') {
  //           validationErrorsList.push({
  //             row: `Row ${rowNumber}`,
  //             error: `Password is required`
  //           });
  //         } else if (row.password.length < 6) {
  //           validationErrorsList.push({
  //             row: `Row ${rowNumber}`,
  //             error: `Password must be at least 6 characters`
  //           });
  //         }

  //         if (!row.employeeID || row.employeeID.trim() === '') {
  //           validationErrorsList.push({
  //             row: `Row ${rowNumber}`,
  //             error: `Employee ID is required`
  //           });
  //         }

  //         if (!row.buildingCode || row.buildingCode.trim() === '') {
  //           validationErrorsList.push({
  //             row: `Row ${rowNumber}`,
  //             error: `Building code is required`
  //           });
  //         }
  //       });

  //       // If there are validation errors, show them and don't proceed to preview
  //       if (validationErrorsList.length > 0) {
  //         setProgress({
  //           done: 0,
  //           total: normalized.length,
  //           errors: validationErrorsList
  //         });
  //         setStep("result");
  //         toast.warning(`Found ${validationErrorsList.length} validation error(s). Please fix them before uploading.`);
  //         return;
  //       }

  //       // If no validation errors, set preview and continue
  //       setPreview(normalized);
  //       setProgress({ done: 0, total: normalized.length, errors: [] });
  //       setStep("preview");
  //       toast.success(`File validated successfully! ${normalized.length} row(s) ready to import.`);

  //     } catch (err) {
  //       console.error(err);
  //       toast.error("Failed to parse file. Please use the provided template.");
  //     }
  //   };
  //   reader.readAsArrayBuffer(selectedFile);
  // };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const ext = selectedFile.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext)) {
      toast.error("Please upload a valid Excel (.xlsx, .xls) or CSV file");
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (jsonData.length === 0) {
          toast.error("The file is empty or has no data rows.");
          return;
        }

        const headerMap = {
          "Name": "name",
          "Email": "email",
          "Password": "password",
          "EmployeeID": "employeeID",
          "BuildingCode": "buildingCode",
        };

        const normalized = jsonData.map((row) => {
          const newRow = {};
          Object.keys(row).forEach((key) => {
            const trimmedKey = key.trim();
            const fieldName = headerMap[trimmedKey] || trimmedKey.toLowerCase();
            newRow[fieldName] = row[key];
          });
          return newRow;
        });

        const requiredCols = ["name", "email", "password", "employeeID", "buildingCode"];
        const fileColumns = Object.keys(normalized[0] || {});
        const missing = requiredCols.filter((col) => !fileColumns.includes(col));
        if (missing.length > 0) {
          toast.error(`Missing required columns: ${missing.join(", ")}`);
          return;
        }

        // Validate each row and collect errors
        const validationErrorsList = [];
        normalized.forEach((row, index) => {
          const rowNumber = index + 2; // +2 because index 0 is row 2 (accounting for header)
          const emailExist = userData.some((user) => user.email.toLowerCase() === row.email.toLowerCase());
          // Check required fields
          if (!row.name || row.name.trim() === '') {
            validationErrorsList.push({
              row: `Row ${rowNumber}`,
              error: `Name is required`
            });
          }

          if (!row.email || row.email.trim() === '') {
            validationErrorsList.push({
              row: `Row ${rowNumber}`,
              error: `Email is required`
            });
          } 
          // else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
          //   validationErrorsList.push({
          //     row: `Row ${rowNumber}`,
          //     error: `Invalid email format: ${row.email}`
          //   });
          // } 
          else if (emailExist) {
            validationErrorsList.push({
              row: `Row ${rowNumber}`,
              error: `${row.email} already exists.`
            });
          }

          if (!row.password || row.password.trim() === '') {
            validationErrorsList.push({
              row: `Row ${rowNumber}`,
              error: `Password is required`
            });
          }

          // else if (row.password.length < 6) {
          //   validationErrorsList.push({
          //     row: `Row ${rowNumber}`,
          //     error: `Password must be at least 6 characters`
          //   });
          // }

          // if (!row.employeeID || row.employeeID.trim() === '') {
          //   validationErrorsList.push({
          //     row: `Row ${rowNumber}`,
          //     error: `Employee ID is required`
          //   });
          // }

          if (!row.buildingCode || row.buildingCode.trim() === '') {
            validationErrorsList.push({
              row: `Row ${rowNumber}`,
              error: `Building code is required`
            });
          } else {
            // Validate building exists
            const buildingExists = buildings.some(b =>
              b.buildingCode && b.buildingCode.toLowerCase() === row.buildingCode.toLowerCase()
            );
            if (!buildingExists) {
              validationErrorsList.push({
                row: `Row ${rowNumber}`,
                error: `Invalid Building code "${row.buildingCode}".`
              });
            }
          }
        });

        // If there are validation errors, show them and don't proceed to preview
        if (validationErrorsList.length > 0) {
          setProgress({
            done: 0,
            total: normalized.length,
            errors: validationErrorsList
          });
          setStep("result");
          toast.warning(`Found ${validationErrorsList.length} validation error(s). Please fix and re-upload.`);
          return;
        }

        // If no validation errors, set preview and continue
        setPreview(normalized);
        setProgress({ done: 0, total: normalized.length, errors: [] });
        setStep("preview");
        toast.success(`File validated successfully! ${normalized.length} row(s) ready to import.`);

      } catch (err) {
        console.error(err);
        toast.error("Failed to parse file. Please use the provided template.");
      }
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  const handleImport = async () => {
    setImporting(true);
    const errors = [];
    let done = 0;
    const total = preview.length;
    setProgress({ done: 0, total, errors: [] });
    setStep("result");

    for (const row of preview) {
      try {
        const encryptedPassword = btoa(String(row.password));
        await axios.post(
          `${process.env.REACT_APP_BASE_URL}/auth/register`,
          {
            name: row.name,
            email: String(row.email).toLowerCase().trim(),
            password: encryptedPassword,
            companyId: companyId,
            buildingCode: row.buildingCode,
            employeeID: row.employeeID,
            type: "user",
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        done++;
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unknown error";
        errors.push({ row: row.email || row.employeeID, error: msg });
        done++;
      }
      setProgress({ done, total, errors: [...errors] });
    }

    setImporting(false);
    const successCount = total - errors.length;
    if (successCount > 0) {
      toast.success(`${successCount} employee(s) imported successfully!`);
      onClose();
      onImportComplete();
    }
    if (errors.length > 0) {
      toast.error(`${errors.length} row(s) failed. Check the report below.`);
    }
  };

  const downloadErrorReport = () => {
    const ws = XLSX.utils.json_to_sheet(
      progress.errors.map((e) => ({ Employee: e.row, Error: e.error }))
    );
    ws["!cols"] = [{ wch: 30 }, { wch: 60 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Errors");
    XLSX.writeFile(wb, "Import_Errors.xlsx");
  };

  const [showAllErrors, setShowAllErrors] = useState(false);

  if (!isOpen) return null;

  const successCount = progress.total - progress.errors.length;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden pl-4 pr-4">

        {/* Header */}
        <div className="flex items-center justify-between mt-3">
          <h3 className="text-black font-semibold text-lg">Bulk Import Employees</h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <Icon icon="heroicons:x-mark" className="text-2xl" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto pl-4 pr-4">

          {/* {step === "upload" && (
            <div className="space-y-6">
              <div className="text-slate-700 leading-relaxed mb-3 bg-gray-100 rounded-lg border-l-4 border-primary-400 p-2 pl-4 m-4 mt-2 justify-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="flex items-start">
                    <Icon icon="heroicons:information-circle" className="w-5 h-5 sm:w-6 sm:h-6 text-black-500 flex-shrink-0 mr-2" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base text-black-800 mb-0.5 sm:mb-1">
                        How to upload:
                      </h4>
                      <ol className="text-sm text-black-700 space-y-1 list-decimal pl-4">
                        <li>Download the template below</li>
                        <li>Fill in your data (keep column headers as is)</li>
                        <li>Save as xlsx file</li>
                        <li>Upload using the form below</li>
                        <li>Review validation results and submit</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <Button
                  text="Download Sample Template (.xlsx)"
                  className="btn-dark w-full sm:w-auto text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
                  iconClass="text-lg"
                  icon="heroicons:document-arrow-down"
                  onClick={downloadTemplate}
                />
              </div>

              <div
                className={`relative border-2 border-dashed rounded-xl text-center transition-all pb-3 p-3  border-slate-300 hover:border-[#a1d9c3] hover:bg-slate-50 cursor-pointer`}
                onClick={() => !file && fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dt = e.dataTransfer.files[0];
                  if (dt) {
                    fileInputRef.current.files = e.dataTransfer.files;
                    handleFileChange({ target: { files: [dt] } });
                  }
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                />

                {file ? (
                  <>
                    <Icon icon="heroicons:check-circle" className="text-5xl text-green-500 mx-auto mb-1" />
                    <p className="text-green-700 font-medium text-sm truncate px-4">{file.name}</p>
                    <p className="text-slate-400 text-xs mb-3">File ready to import</p>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        className="text-xs px-4 py-2 rounded border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors"
                      >
                        Change File
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); resetModal(); }}
                        className="text-xs px-4 py-2 rounded border border-red-200 hover:bg-red-50 text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Icon icon="heroicons:cloud-arrow-up" className="text-5xl text-slate-400 mx-auto mb-1" />
                    <p className="text-slate-600 font-medium mb-2">Choose file or drag & drop</p>
                    <p className="text-slate-400 text-xs mb-2">xlsx, xls, and csv files only (max 10MB)</p>
                    <Button
                      text="Browse Files"
                      className="btn font-normal btn-sm bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white border-0 hover:opacity-90"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      size="sm"
                    />
                  </>
                )}
              </div>
            </div>
          )}
          {step === "result" && (
            <div className="space-y-6 py-4">

              {importing && (
                <div className="text-center py-6">
                  <div className="inline-block w-12 h-12 border-4 border-[#3AB89D] border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-slate-600 font-medium">
                    Importing {progress.done} / {progress.total}...
                  </p>
                  <div className="mt-3 w-full bg-slate-100 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}

              {!importing && (
                <>
                  {progress.errors.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-700 font-medium text-sm">Failed Rows</p>
                        <button
                          onClick={downloadErrorReport}
                          className="text-xs text-[#3AB89D] hover:underline flex items-center gap-1"
                        >
                          <Icon icon="heroicons:arrow-down-tray" /> Download Error Report
                        </button>
                      </div>
                      <div className="rounded-xl border border-red-200 overflow-hidden max-h-52 overflow-y-auto">
                        {progress.errors.map((e, i) => (
                          <div key={i} className="flex gap-3 px-4 py-2.5 border-b border-red-100 last:border-0 bg-red-50/40 text-sm">
                            <span className="text-slate-600 font-medium min-w-[140px] truncate">{e.row}</span>
                            <span className="text-red-600">{e.error}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              )}

            </div>
          )} */}

          <div className="space-y-6">

            {/* Instructions */}
            <div className="text-slate-700 leading-relaxed mb-3 bg-gray-100 rounded-lg border-l-4 border-primary-400 p-2 pl-4 m-4 mt-2 justify-center">
              <div className="flex items-center justify-center mb-2">
                <div className="flex items-start">
                  <Icon icon="heroicons:information-circle" className="w-5 h-5 sm:w-6 sm:h-6 text-black-500 flex-shrink-0 mr-2" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm sm:text-base text-black-800 mb-0.5 sm:mb-1">
                      How to upload:
                    </h4>
                    <ol className="text-sm text-black-700 space-y-1 list-decimal pl-4">
                      <li>Download the template below</li>
                      <li>Fill in your data (keep column headers as is)</li>
                      <li>Save as xlsx file</li>
                      <li>Upload using the form below</li>
                      <li>Review validation results and submit</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Template */}
            <div className="flex items-center justify-center">
              <Button
                text="Download Template with Example Data"
                className="btn-dark w-full sm:w-auto text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
                iconClass="text-lg"
                icon="heroicons:document-arrow-down"
                onClick={downloadTemplate}
              />
            </div>

            {/* Drop zone */}

            {/* ── Step 2: Result ── */}
            <div className="space-y-6 py-0">
              {importing && (
                <div className="text-center py-6">
                  <div className="inline-block w-12 h-12 border-4 border-[#3AB89D] border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-slate-600 font-medium">
                    Importing {progress.done} / {progress.total}...
                  </p>
                  <div className="mt-3 w-full bg-slate-100 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}

              {!importing && <div
                className={`relative border-2 border-dashed rounded-xl text-center transition-all pb-3 p-3  border-slate-300 hover:border-[#a1d9c3] hover:bg-slate-50 cursor-pointer`}
                onClick={() => !file && fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dt = e.dataTransfer.files[0];
                  if (dt) {
                    fileInputRef.current.files = e.dataTransfer.files;
                    handleFileChange({ target: { files: [dt] } });
                  }
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                />

                {file ? (
                  <>
                    <Icon icon="heroicons:check-circle" className="text-5xl text-green-500 mx-auto mb-1" />
                    <p className="text-green-700 font-medium text-sm truncate px-4">{file.name}</p>
                    <p className="text-slate-400 text-xs mb-3">File ready to import</p>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        className="text-xs px-4 py-2 rounded border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors"
                      >
                        Change File
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); resetModal(); }}
                        className="text-xs px-4 py-2 rounded border border-red-200 hover:bg-red-50 text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Icon icon="heroicons:cloud-arrow-up" className="text-5xl text-slate-400 mx-auto mb-1" />
                    <p className="text-slate-600 font-medium mb-2">Choose file or drag & drop</p>
                    <p className="text-slate-400 text-xs mb-2">xlsx, xls, and csv files only (max 10MB)</p>
                    <Button
                      text="Browse Files"
                      className="btn font-normal btn-sm bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white border-0 hover:opacity-90"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      size="sm"
                    />
                  </>
                )}
              </div>}

              <div ref={errorSectionRef}>
                {progress.errors.length > 0 && !importing ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <h4 className="font-semibold text-xs sm:text-sm text-yellow-800 flex items-center">
                        <Icon icon="heroicons:exclamation-triangle" className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 flex-shrink-0" />
                        <span>Validation Errors ({progress.errors.length})</span>
                      </h4>
                      <div className="flex flex-col sm:flex-row gap-2">
                        {/* Expand/Collapse button */}
                        {progress.errors.length > 10 && (
                          <button
                            onClick={() => setShowAllErrors(!showAllErrors)}
                            className="text-xs text-yellow-700 hover:text-yellow-900 font-medium flex items-center gap-1 px-2 py-1 rounded border border-yellow-300 hover:bg-yellow-100 transition-colors"
                          >
                            <Icon icon={showAllErrors ? "heroicons:chevron-up" : "heroicons:chevron-down"} className="w-3 h-3" />
                            {showAllErrors ? "Collapse" : `Show All (${progress.errors.length})`}
                          </button>
                        )}
                      </div>
                    </div>
                    {/* Error list */}
                    <div className={`overflow-y-auto text-xs sm:text-sm transition-all duration-300 ${showAllErrors ? 'max-h-96' : 'max-h-32 sm:max-h-40'}`}>
                      {progress.errors.map((error, index) => (
                        <div key={index} className="flex gap-3 px-2 py-2 border-b border-yellow-100 last:border-0 bg-yellow-50/40 text-sm hover:bg-yellow-100 transition-colors">
                          <div>
                            <span className="font-mono text-xs text-yellow-600 min-w-[30px] inline-block">#{index + 1}</span>
                            <span className="text-yellow-700 font-medium min-w-[140px] truncate">{error.row}: </span>
                            <span className="text-yellow-700 flex-1">{error.error}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Show more button for collapsed view */}
                    {!showAllErrors && progress.errors.length > 10 && (
                      <div className="mt-3 text-center pt-2 border-t border-yellow-200">
                        <button
                          onClick={() => setShowAllErrors(true)}
                          className="text-xs text-yellow-600 hover:text-yellow-800 font-medium flex items-center justify-center gap-1 w-full"
                        >
                          <Icon icon="heroicons:chevron-down" className="w-3 h-3" />
                          Show {progress.errors.length - 10} more errors
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-red-200 overflow-hidden max-h-52 overflow-y-auto">
                    {progress.errors.map((e, i) => (
                      <div key={i} className="flex gap-3 px-4 py-2.5 border-b border-red-100 last:border-0 bg-red-50/40 text-sm">
                        <span className="text-slate-600 font-medium min-w-[140px] truncate">{e.row}</span>
                        <span className="text-red-600">{e.error}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

        <div className="py-2 mb-2 flex items-center justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium bg-slate-200 hover:bg-slate-300 transition-colors rounded-sm"
          >
            {step === "result" ? "Close" : "Cancel"}
          </button>

          <div className="flex gap-3 pl-4">
            {progress.errors.length === 0 && file && preview.length > 0 && (
              <button
                onClick={handleImport}
                disabled={importing}
                className="flex items-center px-3 py-2 bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white text-sm font-semibold rounded-sm hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                Upload
              </button>
            )}

            {/* {step === "result" && !importing && progress.errors.length > 0 && successCount === 0 && (
              <button
                onClick={resetModal}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                <Icon icon="heroicons:arrow-path" />
                Try Again
              </button>
            )} */}
          </div>
        </div>

      </div>
    </div>
  );
};

const UserPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showImportModal, setShowImportModal] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [canNextPage, setCanNextPage] = useState(false);
  const [canPreviousPage, setCanPreviousPage] = useState(false);
  const [selectedRows, setSelectedRows] = useState({});
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [buildings, setBuildings] = useState([]);
  const selectedRowsRef = useRef(selectedRows);

  // Fetch data from server
  const fetchData = async (page, size) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/auth/GetCompanyUsers`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params: {
            page: page + 1,
            limit: size,
          },
        }
      );

      const users = response.data?.data?.users || [];
      const pagination =
        response.data?.data?.pagination || response.data?.pagination || {};

      setUserData(users);
      setTotalRecords(pagination.total || 0);
      setPageCount(pagination.totalPages || 1);
      setCanNextPage(pagination.hasNextPage || false);
      setCanPreviousPage(pagination.hasPreviousPage || false);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
      setUserData([]);
      setTotalRecords(0);
      setPageCount(1);
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

  useEffect(() => {
    fetchData(pageIndex, pageSize);
  }, [pageIndex, pageSize]);

  const handleDeleteMultiple = async () => {
    const selectedIds = Object.keys(selectedRows).filter(id => selectedRows[id]);

    if (selectedIds.length === 0) {
      toast.warning("Please select records to delete");
      setDeleteModalOpen(false);
      return;
    }

    setDeleteModalOpen(false); //
    setIsDeletingMultiple(true);

    try {
      await Promise.all(
        selectedIds.map(id =>
          axios.delete(`${process.env.REACT_APP_BASE_URL}/auth/DeleteUser/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          })
        )
      );

      toast.success(`${selectedIds.length} record${selectedIds.length > 1 ? "s" : ""} deleted successfully`);
      setSelectedRows({});
      setSelectedBuildingId(null);
      await fetchData(pageIndex, pageSize);

    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setIsDeletingMultiple(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleteModalOpen(false); // Close modal first

    try {
      await axios.delete(
        `${process.env.REACT_APP_BASE_URL}/auth/DeleteUser/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("User deleted successfully");
      setSelectedBuildingId(null); // Clear selected ID
      await fetchData(pageIndex, pageSize); // Refresh after deletion
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete user");
    }
  };

  useEffect(() => {
    setSelectedRows({});
  }, [pageIndex, pageSize]);


  const COLUMNS = [
    {
      Header: "Sr.No",
      accessor: "id",
      Cell: ({ row }) => <span>{pageIndex * pageSize + row.index + 1}</span>,
    },
    {
      Header: "Name",
      accessor: "name",
      Cell: (row) => <span>{row?.cell?.value || "N/A"}</span>,
    },
    {
      Header: "Employee ID",
      accessor: "employeeID",
      Cell: (row) => <span>{row?.cell?.value || "N/A"}</span>,
    },
    {
      Header: "Email",
      accessor: "email",
      Cell: (row) => (
        <span className="lowercase">{row?.cell?.value}</span>
      ),
    },
    {
      Header: "Active",
      accessor: "isActive",
      Cell: (row) => (
        <span
          className={`inline-block px-3 py-1 rounded-[999px] text-center ${row?.cell?.value
            ? "bg-success-500 text-white"
            : "bg-warning-500 text-white"
            }`}
        >
          {row?.cell?.value ? "Active" : "Inactive"}
        </span>
      ),
    },

    {
      Header: "Company",
      accessor: "companyId.companyName",
      Cell: (row) => <span>{row?.cell?.value || "-"}</span>,
    },
    {
      Header: "Created At",
      accessor: "createdAt",
      Cell: ({ cell }) => formatDateDMY(cell.value),
    },
    {
      Header: "Updated At",
      accessor: "updatedAt",
      Cell: ({ cell }) => formatDateDMY(cell.value),
    },
    {
      Header: "Action",
      accessor: "_id",
      Cell: ({ cell }) => (
        <div className="flex space-x-3 rtl:space-x-reverse">
          <Tippy content="View">
            <button
              className="action-btn"
              onClick={() => navigate(`/Employee-View/${cell.value}`)}
            >
              <Icon className="text-green-600" icon="heroicons:eye" />
            </button>
          </Tippy>
          <Tippy content="Edit">
            <button
              className="action-btn"
              onClick={() => navigate(`/Employee-edit/${cell.value}`)}
            >
              <Icon className="text-blue-600" icon="heroicons:pencil-square" />
            </button>
          </Tippy>
          <Tippy content="Delete">
            <button
              className="action-btn"
              onClick={() => {
                setSelectedRows({}); // Clear multi selection
                setSelectedBuildingId(cell.value);
                setDeleteModalOpen(true);
              }}
            >
              <Icon className="text-red-600" icon="heroicons:trash" />
            </button>
          </Tippy>
        </div>
      ),
    },
  ];

  const columns = useMemo(() => COLUMNS, [pageIndex, pageSize, selectedRows]);
  const data = useMemo(() => userData, [userData]);

  const tableInstance = useTable(
    {
      columns,
      data,
      manualPagination: true,
      pageCount: pageCount,
      initialState: { pageIndex, pageSize },
      autoResetSelectedRows: false, // Add this
      getRowId: (row) => row._id, // Add this for proper row identification
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
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
                  forceUpdate(n => n + 1);
                }}
              />
            );
          },
        },
        ...columns,
      ]);
    }
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize: setTablePageSize,
    state,
    rows,
    prepareRow,
  } = tableInstance;

  const { pageIndex: currentPageIndex, pageSize: currentPageSize } = state;

  useEffect(() => {
    if (currentPageIndex !== pageIndex) setPageIndex(currentPageIndex);
  }, [currentPageIndex]);

  useEffect(() => {
    if (currentPageSize !== pageSize) setPageSize(currentPageSize);
  }, [currentPageSize]);
  useEffect(() => {
    selectedRowsRef.current = selectedRows;
  }, [selectedRows]);
  const handlePageChange = (newPage) => {
    gotoPage(newPage);
    setPageIndex(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    const n = Number(newSize);
    setPageSize(n);
    setTablePageSize(n);
    setPageIndex(0);
    gotoPage(0);
  };

  const handleNextPage = () => {
    if (canNextPage) {
      const newPage = pageIndex + 1;
      gotoPage(newPage);
      setPageIndex(newPage);
    }
  };

  const handlePreviousPage = () => {
    if (pageIndex > 0) {
      const newPage = pageIndex - 1;
      gotoPage(newPage);
      setPageIndex(newPage);
    }
  };

  const startRecord = totalRecords > 0 ? pageIndex * pageSize + 1 : 0;
  const endRecord = Math.min((pageIndex + 1) * pageSize, totalRecords);
  const selectedCount = Object.values(selectedRows).filter(Boolean).length;

  if (loading && pageIndex === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading Employee Data...</div>
      </div>
    );
  }

  return (
    <>

      <Modal
        activeModal={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
        }}
        title="Confirm Delete"
        themeClass="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]"
        centered
        footerContent={
          <>
            <Button
              text="Cancel"
              className="btn-light"
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedBuildingId(null);
              }}
            />
            <Button
              text={isDeletingMultiple ? "Deleting..." : "Delete"}
              className="btn-danger"
              onClick={async () => {
                if (selectedCount > 0 && !selectedBuildingId) {
                  await handleDeleteMultiple();
                } else if (selectedBuildingId) {
                  await handleDelete(selectedBuildingId);
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
            : "Are you sure you want to delete this record? This action cannot be undone."
          }
        </p>
      </Modal>

      {/* Bulk Import Modal */}
      <BulkImportModal
        userData={userData}
        buildings={buildings}
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={() => {
          fetchData(0, pageSize);
          setPageIndex(0);
        }}
      />

      <Card noborder>
        <div className="md:flex pb-6 items-center">
          <h6 className="flex-1 md:mb-0">Employees</h6>
          <div className="md:flex md:space-x-3 items-center flex-none rtl:space-x-reverse">

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

            <Button
              text="Employee Email Record"
              className="btn-dark font-normal btn-sm h-9"
              iconClass="text-lg"
              onClick={() => navigate("/Email-Reporting")}
            />
            {/* ── Bulk Import Button ── */}

            <Button
              icon="heroicons:plus"
              text="Add Employee"
              className="btn-dark font-normal btn-sm"
              iconClass="text-lg"
              onClick={() => navigate("/Employee-add")}
            />

            <Button
              icon={"heroicons:document-arrow-down"}
              text="Import"
              className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white border-0 hover:opacity-90 btn-sm"
              iconClass="text-lg"
              onClick={() => setShowImportModal(true)}
            />


          </div>
        </div>

        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-y-auto max-h-[calc(100vh-300px)] overflow-x-auto">
              <table
                className="min-w-full divide-y divide-slate-100 table-fixed"
                {...getTableProps()}
              >
                <thead className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] sticky top-0 z-10">
                  {headerGroups.map((headerGroup, index) => (
                    <tr {...headerGroup.getHeaderGroupProps()} key={index}>
                      {headerGroup.headers.map((column) => (
                        <th
                          {...column.getHeaderProps(
                            column.getSortByToggleProps()
                          )}
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
                  {loading ? (
                    <tr>
                      <td colSpan={COLUMNS.length + 1}>
                        <div className="flex justify-center items-center py-16">
                          <div className="text-gray-500">Loading...</div>
                        </div>
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
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
            </div>
          </div>
        </div>

        {/* Pagination Controls */}
        {totalRecords > 0 && (
          <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <span className="flex space-x-2 items-center">
                <span className="text-sm font-medium text-slate-600">Go</span>
                <input
                  type="number"
                  className="form-control py-2"
                  min="1"
                  max={pageCount}
                  value={pageIndex + 1}
                  onChange={(e) => {
                    const page = Number(e.target.value);
                    if (
                      page >= 1 &&
                      page <= pageCount &&
                      page !== pageIndex + 1
                    ) {
                      handlePageChange(page - 1);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const page = Number(e.target.value);
                      if (
                        page >= 1 &&
                        page <= pageCount &&
                        page !== pageIndex + 1
                      ) {
                        handlePageChange(page - 1);
                      }
                    }
                  }}
                  style={{ width: "70px" }}
                />
              </span>
              <span className="text-sm font-medium text-slate-600">
                Page {pageIndex + 1} of {pageCount}
              </span>
            </div>

            <ul className="flex items-center space-x-3 rtl:space-x-reverse">
              <li>
                <button
                  onClick={() => handlePageChange(0)}
                  disabled={pageIndex === 0}
                  className={`${pageIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  <Icon icon="heroicons:chevron-double-left-solid" />
                </button>
              </li>

              <li>
                <button
                  onClick={handlePreviousPage}
                  disabled={pageIndex === 0}
                  className={`${pageIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  Prev
                </button>
              </li>

              {(() => {
                const total = pageCount;
                const current = pageIndex + 1;
                const showPages = [];

                if (total > 0) showPages.push(1);
                if (total > 1) showPages.push(2);
                if (current > 4) showPages.push("left-ellipsis");
                if (current > 2 && current < total - 1)
                  showPages.push(current);
                if (current < total - 3) showPages.push("right-ellipsis");
                if (total > 2) showPages.push(total - 1);
                if (total > 1) showPages.push(total);

                const finalPages = [
                  ...new Set(
                    showPages.filter(
                      (p) =>
                        (p >= 1 && p <= total) || typeof p === "string"
                    )
                  ),
                ];

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
                        onClick={() => handlePageChange(p - 1)}
                      >
                        {p}
                      </button>
                    )}
                  </li>
                ));
              })()}

              <li>
                <button
                  onClick={handleNextPage}
                  disabled={!canNextPage}
                  className={`${!canNextPage ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  Next
                </button>
              </li>

              <li>
                <button
                  onClick={() => handlePageChange(pageCount - 1)}
                  disabled={!canNextPage}
                  className={`${!canNextPage ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  <Icon icon="heroicons:chevron-double-right-solid" />
                </button>
              </li>
            </ul>

            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-slate-600">Show</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(e.target.value)}
                className="form-select py-2"
              >
                {[10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Card>
    </>
  );
};

export default UserPage;