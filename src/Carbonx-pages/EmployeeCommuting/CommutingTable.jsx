import React, { useState, useEffect, useMemo } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Tippy from "@tippyjs/react";
import Logo from "../../assets/images/logo/SrpLogo.png";
import Modal from "@/components/ui/Modal";


// Group Row Component for Email Subject
const GroupRow = ({ subject, recordCount, isExpanded, onToggle, groupTotals, displayIndex }) => {
    const totalColumns = 51; // Total number of columns in the table

    return (
        <tr className="bg-gray-100 cursor-pointer hover:bg-gray-200" onClick={onToggle}>
            <td colSpan={totalColumns} className="px-6 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Icon
                            icon={isExpanded ? "heroicons:chevron-down" : "heroicons:chevron-right"}
                            className="text-gray-600 text-lg"
                        />
                        <span className="font-semibold text-gray-700">
                            {displayIndex !== undefined && `${displayIndex}. `}{subject || "N/A"}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                            ({recordCount} record{recordCount !== 1 ? 's' : ''})
                        </span>
                    </div>
                    {/* <div className="flex space-x-6">
                        <span className="text-sm">Total Distance: {groupTotals.totalDistance} km</span>
                        <span className="text-sm">Total Emissions: {groupTotals.totalEmissionsKg} kgCO₂e</span>
                        <span className="text-sm">Total: {groupTotals.totalEmissionsTonnes} tCO₂e</span>
                    </div> */}
                </div>
            </td>
        </tr>
    );
};

// const RecordRow = ({ record, index, onDelete }) => {
//     const toTitleCase = (str) => {
//         if (!str) return "N/A";
//         return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
//     };

//     const formatDateRange = (dateRange) => {
//         if (!dateRange?.startDate && !dateRange?.endDate) return "N/A";
//         const start = dateRange?.startDate ? new Date(dateRange.startDate).toLocaleDateString() : "";
//         const end = dateRange?.endDate ? new Date(dateRange.endDate).toLocaleDateString() : "";
//         return start && end ? `${start} - ${end}` : start || end || "N/A";
//     };

//     // Helper function to get year from any available date range
//     const getReportingYear = (record) => {
//         // Check each commute mode's date range in priority order
//         const dateRanges = [
//             record.motorbikeDateRange,
//             record.taxiDateRange,
//             record.busDateRange,
//             record.trainDateRange,
//             record.carDateRange,
//             record.workFromHomeDateRange
//         ];

//         // Find the first date range that has a startDate
//         for (const dateRange of dateRanges) {
//             if (dateRange?.startDate) {
//                 return new Date(dateRange.startDate).getFullYear();
//             }
//         }

//         // Fallback to createdAt if no date range found
//         return record.createdAt ? new Date(record.createdAt).getFullYear() : "N/A";
//     };

//     // Helper function to format passenger emails
//     const formatPassengerEmails = (emails) => {
//         if (!emails || emails.length === 0) return "N/A";
//         return emails.join(", ");
//     };

//     return (
//         <tr className="even:bg-gray-50 hover:bg-gray-100">
//             <td className="px-6 py-4 whitespace-nowrap">{index}</td>
//             <td className="px-6 py-4 whitespace-nowrap">{record.emailDoc?.subject || "N/A"}</td>
//             <td className="px-6 py-4 whitespace-nowrap">{record.building?.buildingCode || "N/A"}</td>
//             <td className="px-6 py-4 whitespace-nowrap">{record.building?.buildingName || "N/A"}</td>
//             <td className="px-6 py-4 whitespace-nowrap">{getReportingYear(record)}</td>

//             {/* Motorbike Section */}
//             <td className="px-6 py-4 whitespace-nowrap">{record.commuteByMotorbike ? "Motorbike" : "N/A"}</td>
//             <td className="px-6 py-4 whitespace-nowrap">{record.commuteByMotorbike ? toTitleCase(record.motorbikeType) : "N/A"}</td>
//             <td className="px-6 py-4 whitespace-nowrap">{record.commuteByMotorbike ? Number(record.motorbikeDistance || 0).toFixed(2) : "N/A"}</td>
//             <td className="px-6 py-4 whitespace-nowrap">{record.commuteByMotorbike && record.motorbikeMode === "carpool" ? "Yes" : "N/A"}</td>
//             <td className="px-6 py-4 whitespace-nowrap">{record.commuteByMotorbike ? formatDateRange(record.motorbikeDateRange) : "N/A"}</td>
//             {/* New: Motorbike Carpool Partners */}
//             <td className="px-6 py-4 whitespace-nowrap">
//                 {record.commuteByMotorbike && (record.motorbikeMode === "carpool" || record.motorbikeMode === "both")
//                     ? formatPassengerEmails(record.motorbikePassengerEmails)
//                     : "N/A"}
//             </td>

//             {/* Taxi Section */}
//             <td className="px-6 py-4 whitespace-nowrap">{record.commuteByTaxi ? "Taxi" : "N/A"}</td>
//             <td className="px-6 py-4 whitespace-nowrap">{record.commuteByTaxi ? toTitleCase(record.taxiType) : "N/A"}</td>
//             <td className="px-6 py-4 whitespace-nowrap">{record.commuteByTaxi ? Number(record.taxiDistance || 0).toFixed(2) : "N/A"}</td>
//             <td className="px-6 py-4 whitespace-nowrap">{record.commuteByTaxi && record.taxiMode === "carpool" ? "Yes" : "N/A"}</td>
//             <td className="px-6 py-4 whitespace-nowrap">{record.commuteByTaxi ? formatDateRange(record.taxiDateRange) : "N/A"}</td>
//             {/* New: Taxi Carpool Partners */}
//             <td className="px-6 py-4 whitespace-nowrap">
//                 {record.commuteByTaxi && (record.taxiMode === "carpool" || record.taxiMode === "both")
//                     ? formatPassengerEmails(record.taxiPassengerEmails)
//                     : "N/A"}
//             </td>

//             {/* Bus Section */}
//             <td className="px-6 py-4 whitespace-nowrap">{record.commuteByBus ? "Bus" : "N/A"}</td>
//             <td className="px-6 py-4 whitespace-nowrap">{record.commuteByBus ? toTitleCase(record.busType) : "N/A"}</td>
//             <td className="px-6 py-4 whitespace-nowrap">{record.commuteByBus ? Number(record.busDistance || 0).toFixed(2) : "N/A"}</td>
//             <td className="px-6 py-4 whitespace-nowrap">{formatDateRange(record.busDateRange)}</td>

//             {/* Train Section */}
//             <td className="px-6 py-4 whitespace-nowrap">{record.commuteByTrain ? "Train" : "N/A"}</td>
//             <td className="px-6 py-4 whitespace-nowrap">{record.commuteByTrain ? toTitleCase(record.trainType) : "N/A"}</td>
//             <td className="px-6 py-4 whitespace-nowrap">{record.commuteByTrain ? Number(record.trainDistance || 0).toFixed(2) : "N/A"}</td>
//             <td className="px-6 py-4 whitespace-nowrap">{formatDateRange(record.trainDateRange)}</td>

//             {/* Car Section */}
//             <td className="px-6 py-4 whitespace-nowrap">{record.commuteByCar ? "Car" : "N/A"}</td>
//             <td className="px-6 py-4 whitespace-nowrap">{record.commuteByCar ? toTitleCase(record.carType) : "N/A"}</td>
//             <td className="px-6 py-4 whitespace-nowrap">{record.commuteByCar ? (record.carFuelType || "N/A") : "N/A"}</td>
//             <td className="px-6 py-4 whitespace-nowrap">{record.commuteByCar ? Number(record.carDistance || 0).toFixed(2) : "N/A"}</td>
//             <td className="px-6 py-4 whitespace-nowrap">{record.commuteByCar && record.carMode === "carpool" ? "Yes" : "N/A"}</td>
//             <td className="px-6 py-4 whitespace-nowrap">{record.commuteByCar ? formatDateRange(record.carDateRange) : "N/A"}</td>
//             {/* New: Car Carpool Partners */}
//             <td className="px-6 py-4 whitespace-nowrap">
//                 {record.commuteByCar && (record.carMode === "carpool" || record.carMode === "both")
//                     ? formatPassengerEmails(record.carPassengerEmails)
//                     : "N/A"}
//             </td>

//             {/* Work From Home Section */}
//             <td className="px-6 py-4 whitespace-nowrap">{record.workFromHome ? "Yes" : "N/A"}</td>
//             <td className="px-6 py-4 whitespace-nowrap">{record.fteWorkingHours || "N/A"}</td>
//             <td className="px-6 py-4 whitespace-nowrap">{formatDateRange(record.workFromHomeDateRange)}</td>

//             {/* Quality Control & Remarks */}
//             <td className="px-6 py-4 whitespace-nowrap">{record.qualityControlRemarks ? "Good" : "N/A"}</td>
//             <td className="px-6 py-4 whitespace-nowrap">{record.qualityControlRemarks || "N/A"}</td>

//             {/* Emissions */}
//             <td className="px-6 py-4 whitespace-nowrap">{record.calculatedEmissionKgCo2e?.toFixed(2) || "0"}</td>
//             <td className="px-6 py-4 whitespace-nowrap">{record.calculatedEmissionTCo2e?.toFixed(6) || "0"}</td>

//             {/* Submitted By & Department */}
//             <td className="px-6 py-4 whitespace-nowrap">{record.submittedByEmail || "N/A"}</td>
//             <td className="px-6 py-4 whitespace-nowrap">{record.stakeholderDepartment || "N/A"}</td>

//             {/* Actions */}
//             <td className="px-6 py-4 whitespace-nowrap">
//                 <div className="flex space-x-3 rtl:space-x-reverse">
//                     <Tippy content="Delete">
//                         <button className="action-btn" onClick={() => onDelete(record._id)}>
//                             <Icon icon="heroicons:trash" className="text-red-600" />
//                         </button>
//                     </Tippy>
//                 </div>
//             </td>
//         </tr>
//     );
// };
// Record Row Component
const RecordRow = ({ record, index, selected, onSelect, onDelete }) => {
    const toTitleCase = (str) => {
        if (!str) return "N/A";
        return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const formatDateRange = (dateRange) => {
        if (!dateRange?.startDate && !dateRange?.endDate) return "N/A";
        const start = dateRange?.startDate ? new Date(dateRange.startDate).toLocaleDateString() : "";
        const end = dateRange?.endDate ? new Date(dateRange.endDate).toLocaleDateString() : "";
        return start && end ? `${start} - ${end}` : start || end || "N/A";
    };

    // Helper function to get year from any available date range
    const getReportingYear = (record) => {
        // Check each commute mode's date range in priority order
        const dateRanges = [
            record.motorbikeDateRange,
            record.taxiDateRange,
            record.busDateRange,
            record.trainDateRange,
            record.carDateRange,
            record.workFromHomeDateRange
        ];

        // Find the first date range that has a startDate
        for (const dateRange of dateRanges) {
            if (dateRange?.startDate) {
                return new Date(dateRange.startDate).getFullYear();
            }
        }

        // Fallback to createdAt if no date range found
        return record.createdAt ? new Date(record.createdAt).getFullYear() : "N/A";
    };

    // Helper function to format passenger emails
    const formatPassengerEmails = (emails) => {
        if (!emails || emails.length === 0) return "N/A";
        return emails.join(", ");
    };

    // Helper function to get "Both" indicator
    const getBothIndicator = (mode) => {
        return mode === "both" ? "Yes" : "N/A";
    };

    // Helper function to get individual distance
    const getIndividualDistance = (record, mode) => {
        if (mode === "both") {
            if (record.commuteByMotorbike) return Number(record.motorbikeDistance || 0).toFixed(2);
            if (record.commuteByTaxi) return Number(record.taxiDistance || 0).toFixed(2);
            if (record.commuteByCar) return Number(record.carDistance || 0).toFixed(2);
        }
        return "N/A";
    };

    // Helper function to get carpool distance
    const getCarpoolDistance = (record, mode, type) => {
        if (mode === "both") {
            if (type === "motorbike") return record.motorbikeDistanceCarpool ? Number(record.motorbikeDistanceCarpool).toFixed(2) : "N/A";
            if (type === "taxi") return record.taxiDistanceCarpool ? Number(record.taxiDistanceCarpool).toFixed(2) : "N/A";
            if (type === "car") return record.carDistanceCarpool ? Number(record.carDistanceCarpool).toFixed(2) : "N/A";
        }
        return "N/A";
    };

    return (
        <tr className="even:bg-gray-50 hover:bg-gray-100">
            <td className="px-6 py-4 whitespace-nowrap">
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onSelect(record._id)}
                    className="form-checkbox h-4 w-4 text-[#3AB89D] border-gray-300 rounded"
                />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">{index}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.emailDoc?.subject || "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.building?.buildingCode || "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.building?.buildingName || "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{getReportingYear(record)}</td>

            {/* Motorbike Section */}
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByMotorbike ? "Motorbike" : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByMotorbike ? toTitleCase(record.motorbikeType) : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByMotorbike ? Number(record.motorbikeDistance || 0).toFixed(2) : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByMotorbike && record.motorbikeMode === "carpool" ? "Yes" : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByMotorbike ? formatDateRange(record.motorbikeDateRange) : "N/A"}</td>
            {/* Motorbike Carpool Partners */}
            <td className="px-6 py-4 whitespace-nowrap">
                {record.commuteByMotorbike && (record.motorbikeMode === "carpool" || record.motorbikeMode === "both")
                    ? formatPassengerEmails(record.motorbikePassengerEmails)
                    : "N/A"}
            </td>
            {/* NEW: Motorbike Both Section */}
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByMotorbike ? getBothIndicator(record.motorbikeMode) : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByMotorbike ? getIndividualDistance(record, record.motorbikeMode) : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByMotorbike ? getCarpoolDistance(record, record.motorbikeMode, "motorbike") : "N/A"}</td>

            {/* Taxi Section */}
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByTaxi ? "Taxi" : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByTaxi ? toTitleCase(record.taxiType) : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByTaxi ? Number(record.taxiDistance || 0).toFixed(2) : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByTaxi && record.taxiMode === "carpool" ? "Yes" : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByTaxi ? formatDateRange(record.taxiDateRange) : "N/A"}</td>
            {/* Taxi Carpool Partners */}
            <td className="px-6 py-4 whitespace-nowrap">
                {record.commuteByTaxi && (record.taxiMode === "carpool" || record.taxiMode === "both")
                    ? formatPassengerEmails(record.taxiPassengerEmails)
                    : "N/A"}
            </td>
            {/* NEW: Taxi Both Section */}
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByTaxi ? getBothIndicator(record.taxiMode) : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByTaxi ? getIndividualDistance(record, record.taxiMode) : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByTaxi ? getCarpoolDistance(record, record.taxiMode, "taxi") : "N/A"}</td>

            {/* Bus Section */}
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByBus ? "Bus" : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByBus ? toTitleCase(record.busType) : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByBus ? Number(record.busDistance || 0).toFixed(2) : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{formatDateRange(record.busDateRange)}</td>

            {/* Train Section */}
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByTrain ? "Train" : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByTrain ? toTitleCase(record.trainType) : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByTrain ? Number(record.trainDistance || 0).toFixed(2) : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{formatDateRange(record.trainDateRange)}</td>

            {/* Car Section */}
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByCar ? "Car" : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByCar ? toTitleCase(record.carType) : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByCar ? (record.carFuelType || "N/A") : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByCar ? Number(record.carDistance || 0).toFixed(2) : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByCar && record.carMode === "carpool" ? "Yes" : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByCar ? formatDateRange(record.carDateRange) : "N/A"}</td>
            {/* Car Carpool Partners */}
            <td className="px-6 py-4 whitespace-nowrap">
                {record.commuteByCar && (record.carMode === "carpool" || record.carMode === "both")
                    ? formatPassengerEmails(record.carPassengerEmails)
                    : "N/A"}
            </td>
            {/* NEW: Car Both Section */}
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByCar ? getBothIndicator(record.carMode) : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByCar ? getIndividualDistance(record, record.carMode) : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByCar ? getCarpoolDistance(record, record.carMode, "car") : "N/A"}</td>

            {/* Work From Home Section */}
            <td className="px-6 py-4 whitespace-nowrap">{record.workFromHome ? "Yes" : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.fteWorkingHours || "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{formatDateRange(record.workFromHomeDateRange)}</td>

            {/* Quality Control & Remarks */}
            <td className="px-6 py-4 whitespace-nowrap">{record.qualityControlRemarks ? "Good" : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.qualityControlRemarks || "N/A"}</td>

            {/* Emissions */}
            <td className="px-6 py-4 whitespace-nowrap">{record.calculatedEmissionKgCo2e?.toFixed(2) || "0"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.calculatedEmissionTCo2e?.toFixed(6) || "0"}</td>

            {/* Submitted By & Department */}
            <td className="px-6 py-4 whitespace-nowrap">{record.submittedByEmail || "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.stakeholderDepartment || "N/A"}</td>

            {/* Actions */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex space-x-3 rtl:space-x-reverse">
                    <Tippy content="Delete">
                        <button className="action-btn" onClick={() => onDelete(record._id)}>
                            <Icon icon="heroicons:trash" className="text-red-600" />
                        </button>
                    </Tippy>
                </div>
            </td>
        </tr>
    );
};

const CommutingTable = () => {
    const navigate = useNavigate();
    const [commutingData, setCommutingData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteTargetIds, setDeleteTargetIds] = useState([]);
    const [selectedRecordIds, setSelectedRecordIds] = useState([]);

    // Manual pagination states - each page shows max 10 TOTAL rows (group headers + record rows)
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    // Track expanded groups
    const [expandedGroups, setExpandedGroups] = useState({});

    // Group records by email ID (not subject)
    const groupedData = useMemo(() => {
        const groups = {};

        commutingData.forEach(record => {
            // Group by emailDoc._id instead of subject
            const emailId = record.emailDoc?._id || "N/A";
            if (!groups[emailId]) {
                groups[emailId] = [];
            }
            groups[emailId].push(record);
        });

        // Calculate group totals and store email subject for display
        const groupsWithTotals = {};
        Object.entries(groups).forEach(([emailId, records]) => {
            let totalDistance = 0;
            let totalEmissionsKg = 0;
            let totalEmissionsTonnes = 0;

            records.forEach(record => {
                const distance = record.commuteByMotorbike ? Number(record.motorbikeDistance || 0) :
                    record.commuteByCar ? Number(record.carDistance || 0) :
                        record.commuteByBus ? Number(record.busDistance || 0) :
                            record.commuteByTaxi ? Number(record.taxiDistance || 0) :
                                record.commuteByTrain ? Number(record.trainDistance || 0) : 0;

                totalDistance += distance;
                totalEmissionsKg += record.calculatedEmissionKgCo2e || 0;
                totalEmissionsTonnes += record.calculatedEmissionTCo2e || 0;
            });

            // Get the subject from the first record (all records in same email group will have same subject)
            const emailSubject = records[0]?.emailDoc?.subject || "N/A";

            groupsWithTotals[emailId] = {
                records,
                emailSubject, // Store subject for display
                totals: {
                    totalDistance: totalDistance.toFixed(2),
                    totalEmissionsKg: totalEmissionsKg.toFixed(2),
                    totalEmissionsTonnes: totalEmissionsTonnes.toFixed(6),
                    recordCount: records.length
                }
            };
        });

        return groupsWithTotals;
    }, [commutingData]);

    // Build a flat array of ALL visible rows based on expanded/collapsed state
    const allVisibleRows = useMemo(() => {
        const rows = [];
        let groupIndex = 0;

        Object.entries(groupedData).forEach(([emailId, { records, emailSubject, totals }]) => {
            groupIndex++;
            // Add group header row - now using emailSubject for display
            rows.push({
                type: 'group',
                id: emailId,        // Store email ID for expansion tracking
                subject: emailSubject, // Show subject on frontend
                totals,
                recordCount: records.length,
                records,
                groupIndex
            });

            // If group is expanded, add all its record rows
            if (expandedGroups[emailId]) { // Use emailId for expansion state
                records.forEach((record, idx) => {
                    rows.push({
                        type: 'record',
                        emailId,
                        record,
                        recordIndex: idx + 1
                    });
                });
            }
        });

        return rows;
    }, [groupedData, expandedGroups]);

    // Get current page rows
    const currentRows = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return allVisibleRows.slice(startIndex, endIndex);
    }, [allVisibleRows, currentPage, rowsPerPage]);

    const totalVisibleRows = allVisibleRows.length;
    const totalPages = Math.ceil(totalVisibleRows / rowsPerPage);

    const toggleGroup = (emailId) => {
        setExpandedGroups(prev => {
            const newExpanded = {
                ...prev,
                [emailId]: !prev[emailId]
            };
            // Reset to page 1 when expanding/collapsing to avoid empty pages
            setCurrentPage(1);
            return newExpanded;
        });
    };

    const fetchCommutingData = async () => {
        setLoading(true);
        try {
            const search = globalFilterValue.trim();
            const token = localStorage.getItem("token");

            if (!token) {
                toast.error("Authentication token missing. Please login again.");
                navigate("/login");
                return;
            }

            const params = {
                page: 1,
                limit: 10000,
                ...(search && { search: search })
            };

            const res = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/employee-commute/List`,
                {
                    params,
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            const data = res.data.data || [];
            // FILTER: Only keep records with entryStatus === "Parent"
            const filteredData = data.filter(item => item.entryStatus === "Parent");
            const dataWithBuilding = filteredData.map(item => ({
                ...item,
                building: item.building || {},
                calculatedEmissionKgCo2e: item.calculatedEmissionKgCo2e || 0,
                calculatedEmissionTCo2e: item.calculatedEmissionTCo2e || 0
            }));

            setCommutingData(dataWithBuilding);
            setCurrentPage(1);
            setExpandedGroups({});

            // Optional: Show message if no Parent records found
            if (filteredData.length === 0 && data.length > 0) {
                toast.info("No Parent records found. Only showing Parent entries.");
            }

        } catch (err) {
            console.error("Error fetching commuting data:", err);
            if (err.response?.status === 401) {
                toast.error("Session expired. Please login again.");
                localStorage.removeItem("token");
                navigate("/login");
            } else if (err.response?.status === 403) {
                toast.error("You don't have permission to access this resource.");
            } else {
                toast.error("Failed to fetch employee commuting data");
            }
            setCommutingData([]);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const delay = setTimeout(() => {
            fetchCommutingData();
        }, 500);
        return () => clearTimeout(delay);
    }, [globalFilterValue]);

    const handleDelete = async (ids) => {
        const targetIds = Array.isArray(ids) ? ids : [ids];
        if (targetIds.length === 0) return;

        try {
            await Promise.all(targetIds.map(id =>
                axios.delete(`${process.env.REACT_APP_BASE_URL}/employee-commute/Delete/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                })
            ));
            toast.success(targetIds.length === 1 ? "Record deleted successfully" : "Selected records deleted successfully");
            setSelectedRecordIds(prev => prev.filter(id => !targetIds.includes(id)));
            setDeleteTargetIds([]);
            fetchCommutingData();
        } catch (err) {
            console.error("Error deleting record:", err);
            toast.error("Failed to delete record(s)");
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    // Calculate serial numbers for records on current page
    let recordSerialNumber = 0;
    let previousRecordsCount = (currentPage - 1) * rowsPerPage;

    // Count how many records came before current page
    const getRecordSerialNumber = (currentRowIndex) => {
        // Count records in all rows before this one
        let recordCount = 0;
        for (let i = 0; i < currentRowIndex; i++) {
            if (allVisibleRows[i]?.type === 'record') {
                recordCount++;
            }
        }
        return recordCount + 1;
    };

    return (
        <>
            <Card noborder>
                <div className="md:flex pb-6 items-center">
                    <div className="flex-1">
                        <h6 className="mb-2">Employee Commuting</h6>
                    </div>
                    <div className="md:flex md:space-x-3 items-center flex-none rtl:space-x-reverse">
                        <Button
                            icon="heroicons-outline:plus-sm"
                            text="Send Email"
                            className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90 h-9"
                            iconClass="text-lg"
                            onClick={() => navigate("/EmailSent")}
                        />
                        <Button
                            text={selectedRecordIds.length > 0 ? `Delete Selected (${selectedRecordIds.length})` : "Delete Selected"}
                            className="btn font-normal btn-sm btn-danger text-white border-0 hover:opacity-90 h-9"
                            disabled={selectedRecordIds.length === 0}
                            onClick={() => {
                                if (selectedRecordIds.length > 0) {
                                    setDeleteTargetIds(selectedRecordIds);
                                    setDeleteModalOpen(true);
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto -mx-6">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-y-auto max-h-[calc(100vh-300px)] overflow-x-auto">
                            {loading ? (
                                <div className="flex justify-center items-center py-8">
                                    <img src={Logo} alt="Loading..." className="w-52 h-24" />
                                </div>
                            ) : currentRows.length === 0 ? (
                                <div className="flex justify-center items-center py-16">
                                    <span className="text-gray-500 text-lg font-medium">
                                        {globalFilterValue
                                            ? `No results found for "${globalFilterValue}"`
                                            : "No employee commuting data available."
                                        }
                                    </span>
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-slate-100">
                                    {/* <thead className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] sticky top-0 z-10">
                                        <tr>
                                            <th className="table-th text-white whitespace-nowrap">Sr.No</th>
                                            <th className="table-th text-white whitespace-nowrap">Email Subject</th>
                                            <th className="table-th text-white whitespace-nowrap">Building Code</th>
                                            <th className="table-th text-white whitespace-nowrap">Building</th>
                                            <th className="table-th text-white whitespace-nowrap">Reporting Year</th>

                                            <th className="table-th text-white whitespace-nowrap">Commute Mode</th>
                                            <th className="table-th text-white whitespace-nowrap">Motor Bike Type</th>
                                            <th className="table-th text-white whitespace-nowrap">Distance Travelled (km)</th>
                                            <th className="table-th text-white whitespace-nowrap">Car Pool</th>
                                            <th className="table-th text-white whitespace-nowrap">Date Range</th>
                                            <th className="table-th text-white whitespace-nowrap">Carpool Partners</th>

                                            <th className="table-th text-white whitespace-nowrap">Commute Mode</th>
                                            <th className="table-th text-white whitespace-nowrap">Taxi Type</th>
                                            <th className="table-th text-white whitespace-nowrap">Distance Travelled (km)</th>
                                            <th className="table-th text-white whitespace-nowrap">Car Pool</th>
                                            <th className="table-th text-white whitespace-nowrap">Date Range</th>
                                            <th className="table-th text-white whitespace-nowrap">Carpool Partners</th>

                                            <th className="table-th text-white whitespace-nowrap">Commute Mode</th>
                                            <th className="table-th text-white whitespace-nowrap">Bus Type</th>
                                            <th className="table-th text-white whitespace-nowrap">Distance Travelled (km)</th>
                                            <th className="table-th text-white whitespace-nowrap">Date Range</th>

                                            <th className="table-th text-white whitespace-nowrap">Commute Mode</th>
                                            <th className="table-th text-white whitespace-nowrap">Train Type</th>
                                            <th className="table-th text-white whitespace-nowrap">Distance Travelled (km)</th>
                                            <th className="table-th text-white whitespace-nowrap">Date Range</th>

                                            <th className="table-th text-white whitespace-nowrap">Commute Mode</th>
                                            <th className="table-th text-white whitespace-nowrap">Car Type</th>
                                            <th className="table-th text-white whitespace-nowrap">Car Fuel Type</th>
                                            <th className="table-th text-white whitespace-nowrap">Distance Travelled (km)</th>
                                            <th className="table-th text-white whitespace-nowrap">Car Pool</th>
                                            <th className="table-th text-white whitespace-nowrap">Date Range</th>
                                            <th className="table-th text-white whitespace-nowrap">Carpool Partners</th>

                                            <th className="table-th text-white whitespace-nowrap">Work from Home</th>
                                            <th className="table-th text-white whitespace-nowrap">FTE Working Hours</th>
                                            <th className="table-th text-white whitespace-nowrap">Date Range</th>

                                            <th className="table-th text-white whitespace-nowrap">Quality Control</th>
                                            <th className="table-th text-white whitespace-nowrap">Remarks</th>

                                            <th className="table-th text-white whitespace-nowrap">Calculate Emission (kgCO₂e)</th>
                                            <th className="table-th text-white whitespace-nowrap">Calculate Emissions (tCO₂e)</th>

                                            <th className="table-th text-white whitespace-nowrap">Submitted By</th>
                                            <th className="table-th text-white whitespace-nowrap">Department</th>

                                            <th className="table-th text-white whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead> */}
                                    <thead className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] sticky top-0 z-10">
                                        <tr>
                                            <th className="table-th text-white whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={currentRows.filter(row => row.type === 'record').every(row => selectedRecordIds.includes(row.record._id)) && currentRows.some(row => row.type === 'record')}
                                                    onChange={() => {
                                                        const currentPageRecordIds = currentRows
                                                            .filter(row => row.type === 'record')
                                                            .map(row => row.record._id);
                                                        const allSelected = currentPageRecordIds.every(id => selectedRecordIds.includes(id));
                                                        if (allSelected) {
                                                            setSelectedRecordIds(prev => prev.filter(id => !currentPageRecordIds.includes(id)));
                                                        } else {
                                                            setSelectedRecordIds(prev => Array.from(new Set([...prev, ...currentPageRecordIds])));
                                                        }
                                                    }}
                                                    className="form-checkbox h-4 w-4 text-white border-white rounded"
                                                />
                                            </th>
                                            <th className="table-th text-white whitespace-nowrap">Sr.No</th>
                                            <th className="table-th text-white whitespace-nowrap">Email Subject</th>
                                            <th className="table-th text-white whitespace-nowrap">Building Code</th>
                                            <th className="table-th text-white whitespace-nowrap">Building</th>
                                            <th className="table-th text-white whitespace-nowrap">Reporting Year</th>

                                            {/* Motorbike Section */}
                                            <th className="table-th text-white whitespace-nowrap">Commute Mode</th>
                                            <th className="table-th text-white whitespace-nowrap">Motor Bike Type</th>
                                            <th className="table-th text-white whitespace-nowrap">Distance Travelled (km)</th>
                                            <th className="table-th text-white whitespace-nowrap">Car Pool</th>
                                            <th className="table-th text-white whitespace-nowrap">Date Range</th>
                                            <th className="table-th text-white whitespace-nowrap">Carpool Partners</th>
                                            {/* NEW: Motorbike Both Columns */}
                                            <th className="table-th text-white whitespace-nowrap">Both (Individual + Carpool)</th>
                                            <th className="table-th text-white whitespace-nowrap">Individual Distance (km)</th>
                                            <th className="table-th text-white whitespace-nowrap">Carpool Distance (km)</th>

                                            {/* Taxi Section */}
                                            <th className="table-th text-white whitespace-nowrap">Commute Mode</th>
                                            <th className="table-th text-white whitespace-nowrap">Taxi Type</th>
                                            <th className="table-th text-white whitespace-nowrap">Distance Travelled (km)</th>
                                            <th className="table-th text-white whitespace-nowrap">Car Pool</th>
                                            <th className="table-th text-white whitespace-nowrap">Date Range</th>
                                            <th className="table-th text-white whitespace-nowrap">Carpool Partners</th>
                                            {/* NEW: Taxi Both Columns */}
                                            <th className="table-th text-white whitespace-nowrap">Both (Individual + Carpool)</th>
                                            <th className="table-th text-white whitespace-nowrap">Individual Distance (km)</th>
                                            <th className="table-th text-white whitespace-nowrap">Carpool Distance (km)</th>

                                            {/* Bus Section */}
                                            <th className="table-th text-white whitespace-nowrap">Commute Mode</th>
                                            <th className="table-th text-white whitespace-nowrap">Bus Type</th>
                                            <th className="table-th text-white whitespace-nowrap">Distance Travelled (km)</th>
                                            <th className="table-th text-white whitespace-nowrap">Date Range</th>

                                            {/* Train Section */}
                                            <th className="table-th text-white whitespace-nowrap">Commute Mode</th>
                                            <th className="table-th text-white whitespace-nowrap">Train Type</th>
                                            <th className="table-th text-white whitespace-nowrap">Distance Travelled (km)</th>
                                            <th className="table-th text-white whitespace-nowrap">Date Range</th>

                                            {/* Car Section */}
                                            <th className="table-th text-white whitespace-nowrap">Commute Mode</th>
                                            <th className="table-th text-white whitespace-nowrap">Car Type</th>
                                            <th className="table-th text-white whitespace-nowrap">Car Fuel Type</th>
                                            <th className="table-th text-white whitespace-nowrap">Distance Travelled (km)</th>
                                            <th className="table-th text-white whitespace-nowrap">Car Pool</th>
                                            <th className="table-th text-white whitespace-nowrap">Date Range</th>
                                            <th className="table-th text-white whitespace-nowrap">Carpool Partners</th>
                                            {/* NEW: Car Both Columns */}
                                            <th className="table-th text-white whitespace-nowrap">Both (Individual + Carpool)</th>
                                            <th className="table-th text-white whitespace-nowrap">Individual Distance (km)</th>
                                            <th className="table-th text-white whitespace-nowrap">Carpool Distance (km)</th>

                                            {/* Work From Home Section */}
                                            <th className="table-th text-white whitespace-nowrap">Work from Home</th>
                                            <th className="table-th text-white whitespace-nowrap">FTE Working Hours</th>
                                            <th className="table-th text-white whitespace-nowrap">Date Range</th>

                                            {/* Quality Control & Remarks */}
                                            <th className="table-th text-white whitespace-nowrap">Quality Control</th>
                                            <th className="table-th text-white whitespace-nowrap">Remarks</th>

                                            {/* Emissions */}
                                            <th className="table-th text-white whitespace-nowrap">Calculate Emission (kgCO₂e)</th>
                                            <th className="table-th text-white whitespace-nowrap">Calculate Emissions (tCO₂e)</th>

                                            {/* Submitted By & Department */}
                                            <th className="table-th text-white whitespace-nowrap">Submitted By</th>
                                            <th className="table-th text-white whitespace-nowrap">Department</th>

                                            {/* Actions */}
                                            <th className="table-th text-white whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentRows.map((row, idx) => {
                                            if (row.type === 'group') {
                                                return (
                                                    <GroupRow
                                                        key={`group-${row.id}`}
                                                        subject={row.subject}  // This now shows the email subject
                                                        recordCount={row.recordCount}
                                                        isExpanded={expandedGroups[row.id] || false}
                                                        onToggle={() => toggleGroup(row.id)}
                                                        groupTotals={row.totals}
                                                        displayIndex={row.groupIndex}
                                                    />
                                                );
                                            } else {
                                                return (
                                                    <RecordRow
                                                        key={`record-${row.record._id}`}
                                                        record={row.record}
                                                        index={row.recordIndex}
                                                        selected={selectedRecordIds.includes(row.record._id)}
                                                        onSelect={(id) => {
                                                            setSelectedRecordIds(prev =>
                                                                prev.includes(id)
                                                                    ? prev.filter(item => item !== id)
                                                                    : [...prev, id]
                                                            );
                                                        }}
                                                        onDelete={(id) => {
                                                            setDeleteTargetIds([id]);
                                                            setDeleteModalOpen(true);
                                                        }}
                                                    />
                                                );
                                            }
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pagination */}
                {totalVisibleRows > 0 && (
                    <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
                        <div className="flex items-center space-x-3">
                            <span className="flex space-x-2 items-center">
                                <span className="text-sm font-medium text-slate-600">Go</span>
                                <input
                                    type="number"
                                    className="form-control py-2"
                                    min="1"
                                    max={totalPages}
                                    value={currentPage}
                                    onChange={(e) => {
                                        const pg = Number(e.target.value);
                                        if (pg >= 1 && pg <= totalPages) handlePageChange(pg);
                                    }}
                                    style={{ width: "70px" }}
                                />
                            </span>
                            <span className="text-sm font-medium text-slate-600">
                                Page {currentPage} of {totalPages}

                                {globalFilterValue && (
                                    <span className="text-xs text-gray-500 ml-2">
                                        (Filtered results)
                                    </span>
                                )}
                            </span>
                        </div>

                        <ul className="flex items-center space-x-3">
                            <li>
                                <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
                                    <Icon icon="heroicons:chevron-double-left-solid" />
                                </button>
                            </li>
                            <li>
                                <button onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                                    Prev
                                </button>
                            </li>

                            {(() => {
                                const pages = [];

                                if (totalPages <= 7) {
                                    // Show all pages if total is small
                                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                                } else {
                                    pages.push(1);

                                    if (currentPage > 3) pages.push("...");

                                    const start = Math.max(2, currentPage - 1);
                                    const end = Math.min(totalPages - 1, currentPage + 1);

                                    for (let i = start; i <= end; i++) pages.push(i);

                                    if (currentPage < totalPages - 2) pages.push("...");

                                    pages.push(totalPages);
                                }

                                return pages.map((page, idx) =>
                                    page === "..." ? (
                                        <li key={`ellipsis-${idx}`}>
                                            <span className="text-sm text-slate-500 px-1">...</span>
                                        </li>
                                    ) : (
                                        <li key={page}>
                                            <button
                                                className={`${page === currentPage ? "bg-slate-900 text-white font-medium" : "bg-slate-100 text-slate-900"} text-sm rounded h-6 w-6 flex items-center justify-center`}
                                                onClick={() => handlePageChange(page)}
                                            >
                                                {page}
                                            </button>
                                        </li>
                                    )
                                );
                            })()}

                            <li>
                                <button onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                                    Next
                                </button>
                            </li>
                            <li>
                                <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
                                    <Icon icon="heroicons:chevron-double-right-solid" />
                                </button>
                            </li>
                        </ul>

                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-slate-600">Show</span>
                                <select
                                    value={rowsPerPage}
                                    onChange={(e) => {
                                        setRowsPerPage(Number(e.target.value));
                                        setCurrentPage(1); // Reset to first page when changing rows per page
                                    }}
                                    className="form-select py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#527dd2]"
                                    style={{ width: "70px" }}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            <Modal
                activeModal={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Confirm Delete"
                themeClass="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]"
                centered
                footerContent={
                    <>
                        <Button text="Cancel" className="btn-light" onClick={() => setDeleteModalOpen(false)} />
                        <Button text="Delete" className="btn-danger" onClick={async () => {
                            await handleDelete(deleteTargetIds);
                            setDeleteModalOpen(false);
                        }} />
                    </>
                }
            >
                <p className="text-gray-700 text-center">
                    {deleteTargetIds.length > 1
                        ? `Are you sure you want to delete these ${deleteTargetIds.length} commuting records? This action cannot be undone.`
                        : "Are you sure you want to delete this commuting record? This action cannot be undone."
                    }
                </p>
            </Modal>
        </>
    );
};

export default CommutingTable;