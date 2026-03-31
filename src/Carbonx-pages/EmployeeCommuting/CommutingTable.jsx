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

// UK Government GHG Conversion Factors (2025)
const EMISSION_FACTORS = {
    // Cars by size and fuel type
    cars: {
        "Small car - Petrol/LPG/CNG - up to 1.4-litre engine. Diesel - up to a 1.7-litre engine. Others - vehicles models of a similar size (i.e. market segment A or B)": {
            Diesel: 0.14340,
            Petrol: 0.14308,
            Hybrid: 0.11413,
            CNG: 0.18800,
            LPG: 0.21260,
            Unknown: 0.14322,
            "Plug-in Hybrid Electric Vehicle": 0.05669,
            "Battery Electric Vehicle": 0.03688
        },
        "Medium car - Petrol/LPG/CNG - from 1.4-litre to 2.0-litre engine. Diesel - from 1.7-litre to 2.0-litre engine. Others - vehicles models of a similar size (i.e. generally market segment C)": {
            Diesel: 0.17174,
            Petrol: 0.17474,
            Hybrid: 0.11724,
            CNG: 0.15504,
            LPG: 0.17427,
            Unknown: 0.17322,
            "Plug-in Hybrid Electric Vehicle": 0.08820,
            "Battery Electric Vehicle": 0.03882
        },
        "Large car - Petrol/LPG/CNG - 2.0-litre engine (+) . Diesel - 2.0-litre engine (+). Others - vehicles models of a similar size (i.e. generally market segment D and above)": {
            Diesel: 0.21007,
            Petrol: 0.26828,
            Hybrid: 0.15650,
            CNG: 0.23722,
            LPG: 0.26771,
            Unknown: 0.22678,
            "Plug-in Hybrid Electric Vehicle": 0.11430,
            "Battery Electric Vehicle": 0.04205
        },
        "Average car - Unknown engine size.": {
            Diesel: 0.17304,
            Petrol: 0.16272,
            Hybrid: 0.12825,
            CNG: 0.17414,
            LPG: 0.19599,
            Unknown: 0.16725,
            "Plug-in Hybrid Electric Vehicle": 0.10461,
            "Battery Electric Vehicle": 0.04047
        },
        "Executive - Large Executive or E-Segment Passenger Cars (2000 cc - 3500+ cc)": {
            Diesel: 0.17088,
            Petrol: 0.20073,
            Unknown: 0.17846,
            "Plug-in Hybrid Electric Vehicle": 0.09133,
            "Battery Electric Vehicle": 0.03702
        },
        "Luxury - Full size Luxury or F-Segment Premium Passenger Cars (3000 cc - 6000 cc)": {
            Diesel: 0.20632,
            Petrol: 0.30752,
            Unknown: 0.25196,
            "Plug-in Hybrid Electric Vehicle": 0.12510,
            "Battery Electric Vehicle": 0.04902
        },
        "Sports - High Performance - High Speed Vehicles ( 2000 cc - 4000 cc+)": {
            Diesel: 0.17323,
            Petrol: 0.23396,
            Unknown: 0.22400,
            "Plug-in Hybrid Electric Vehicle": 0.14904,
            "Battery Electric Vehicle": 0.06260
        },
        "Dual purpose 4X4 - SUVs 4 wheel Drive or All Wheel Drive (1500 cc - 6000 cc)": {
            Diesel: 0.19973,
            Petrol: 0.19219,
            Unknown: 0.19690,
            "Plug-in Hybrid Electric Vehicle": 0.11663,
            "Battery Electric Vehicle": 0.04228
        },
        "MPV - Multi-Purpose Vehicles / People Carriers (Highroof, Hiace,Suzuki APV, Vans etc.)  - Passenger or Transport Vehicle (1200 cc - 2000 cc)": {
            Diesel: 0.18072,
            Petrol: 0.17903,
            Unknown: 0.18030,
            "Plug-in Hybrid Electric Vehicle": 0.10193,
            "Battery Electric Vehicle": 0.05202
        }
    },
    motorbikes: {
        "Small": 0.08319,
        "Medium": 0.10108,
        "Large": 0.13252,
        "Average": 0.11367,
        "Small (<125cc)": 0.08319,
        "Medium (125-500cc)": 0.10108,
        "Large (>500cc)": 0.13252,
        "Electric Motorbike": 0.03688
    },
    taxis: {
        "Regular taxi": 0.14861,
        "Premium taxi": 0.20402,
        "Electric taxi": 0.03688,
        "Shared taxi": 0.14861,
        "Regular Taxi": 0.14861,
        "Premium Taxi": 0.20402,
        "Electric Taxi": 0.03688,
        "Shared Taxi/Pool": 0.14861
    },
    buses: {
        "Green Line Bus": 0.02776,
        "Local bus": 0.12525,
        "Express bus": 0.06875,
        "Electric bus": 0.03688,
        "Private bus": 0.12525,
        "Local Bus": 0.12525,
        "Electric Bus": 0.03688,
        "Private Company Bus": 0.12525
    },
    trains: {
        "National Rail": 0.03546,
        "Subway/Metro": 0.02860,
        "Light Rail": 0.02860,
        "Commuter Rail": 0.03546,
        "High Speed Rail": 0.03546
    }
};

// Group Row Component for Email Subject
const GroupRow = ({ subject, recordCount, isExpanded, onToggle, groupTotals, displayIndex }) => {
    const totalColumns = 38; // Total number of columns in the table

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

// Record Row Component
const RecordRow = ({ record, index, onDelete }) => {
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

    return (
        <tr className="even:bg-gray-50 hover:bg-gray-100">
            <td className="px-6 py-4 whitespace-nowrap">{index}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.emailDoc?.subject || "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.building?.buildingCode || "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.building?.buildingName || "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.createdAt ? new Date(record.createdAt).getFullYear() : "N/A"}</td>

            {/* Motorbike Section */}
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByMotorbike ? "Motorbike" : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByMotorbike ? toTitleCase(record.motorbikeType) : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByMotorbike ? Number(record.motorbikeDistance || 0).toFixed(2) : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByMotorbike && record.motorbikeMode === "carpool" ? "Yes" : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByMotorbike ? formatDateRange(record.motorbikeDateRange) : "N/A"}</td>

            {/* Taxi Section */}
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByTaxi ? "Taxi" : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByTaxi ? toTitleCase(record.taxiType) : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByTaxi ? Number(record.taxiDistance || 0).toFixed(2) : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByTaxi && record.taxiMode === "carpool" ? "Yes" : "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.commuteByTaxi ? formatDateRange(record.taxiDateRange) : "N/A"}</td>

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
    const [selectedRecordId, setSelectedRecordId] = useState(null);

    // Manual pagination states - each page shows max 10 TOTAL rows (group headers + record rows)
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);

    // Track expanded groups
    const [expandedGroups, setExpandedGroups] = useState({});

    // Group records by email subject
    const groupedData = useMemo(() => {
        const groups = {};

        commutingData.forEach(record => {
            const subject = record.emailDoc?.subject || "N/A";
            if (!groups[subject]) {
                groups[subject] = [];
            }
            groups[subject].push(record);
        });

        // Calculate group totals
        const groupsWithTotals = {};
        Object.entries(groups).forEach(([subject, records]) => {
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

            groupsWithTotals[subject] = {
                records,
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

        Object.entries(groupedData).forEach(([subject, { records, totals }]) => {
            groupIndex++;
            // Add group header row
            rows.push({
                type: 'group',
                subject,
                totals,
                recordCount: records.length,
                records,
                groupIndex
            });

            // If group is expanded, add all its record rows
            if (expandedGroups[subject]) {
                records.forEach((record, idx) => {
                    rows.push({
                        type: 'record',
                        subject,
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

    const toggleGroup = (subject) => {
        setExpandedGroups(prev => {
            const newExpanded = {
                ...prev,
                [subject]: !prev[subject]
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

            const dataWithBuilding = data.map(item => ({
                ...item,
                building: item.building || {},
                calculatedEmissionKgCo2e: item.calculatedEmissionKgCo2e || 0,
                calculatedEmissionTCo2e: item.calculatedEmissionTCo2e || 0
            }));

            setCommutingData(dataWithBuilding);
            setCurrentPage(1);
            setExpandedGroups({});

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

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${process.env.REACT_APP_BASE_URL}/employee-commute/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            toast.success("Record deleted successfully");
            fetchCommutingData();
        } catch (err) {
            console.error("Error deleting record:", err);
            toast.error("Failed to delete record");
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
                                    <thead className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] sticky top-0 z-10">
                                        <tr>
                                            <th className="table-th text-white whitespace-nowrap">Sr.No</th>
                                            <th className="table-th text-white whitespace-nowrap">Email Subject</th>
                                            <th className="table-th text-white whitespace-nowrap">Building Code</th>
                                            <th className="table-th text-white whitespace-nowrap">Building</th>
                                            <th className="table-th text-white whitespace-nowrap">Reporting Year</th>
                                            <th className="table-th text-white whitespace-nowrap">Commute Mode</th>
                                            <th className="table-th text-white whitespace-nowrap">Motor Bike Type</th>
                                            <th className="table-th text-white whitespace-nowrap">Distance Travelled (k.m)</th>
                                            <th className="table-th text-white whitespace-nowrap">Car Pool</th>
                                            <th className="table-th text-white whitespace-nowrap">Date Range</th>
                                            <th className="table-th text-white whitespace-nowrap">Commute Mode</th>
                                            <th className="table-th text-white whitespace-nowrap">Taxi Type</th>
                                            <th className="table-th text-white whitespace-nowrap">Distance Travelled (k.m)</th>
                                            <th className="table-th text-white whitespace-nowrap">Car Pool</th>
                                            <th className="table-th text-white whitespace-nowrap">Date Range</th>
                                            <th className="table-th text-white whitespace-nowrap">Commute Mode</th>
                                            <th className="table-th text-white whitespace-nowrap">Bus Type</th>
                                            <th className="table-th text-white whitespace-nowrap">Distance Travelled (k.m)</th>
                                            <th className="table-th text-white whitespace-nowrap">Date Range</th>
                                            <th className="table-th text-white whitespace-nowrap">Commute Mode</th>
                                            <th className="table-th text-white whitespace-nowrap">Train Type</th>
                                            <th className="table-th text-white whitespace-nowrap">Distance Travelled (k.m)</th>
                                            <th className="table-th text-white whitespace-nowrap">Date Range</th>
                                            <th className="table-th text-white whitespace-nowrap">Commute Mode</th>
                                            <th className="table-th text-white whitespace-nowrap">Car Type</th>
                                            <th className="table-th text-white whitespace-nowrap">Car Fuel Type</th>
                                            <th className="table-th text-white whitespace-nowrap">Distance Travelled (k.m)</th>
                                            <th className="table-th text-white whitespace-nowrap">Car Pool</th>
                                            <th className="table-th text-white whitespace-nowrap">Date Range</th>
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
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentRows.map((row, idx) => {
                                            if (row.type === 'group') {
                                                return (
                                                    <GroupRow
                                                        key={`group-${row.subject}`}
                                                        subject={row.subject}
                                                        recordCount={row.recordCount}
                                                        isExpanded={expandedGroups[row.subject] || false}
                                                        onToggle={() => toggleGroup(row.subject)}
                                                        groupTotals={row.totals}
                                                        displayIndex={row.groupIndex}
                                                    />
                                                );
                                            } else {
                                                // Calculate serial number for this record
                                              
                                                return (
                                                    <RecordRow
                                                        key={`record-${row.record._id}`}
                                                        record={row.record}
                                                         index={row.recordIndex}
                                                        onDelete={(id) => {
                                                            setSelectedRecordId(id);
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
                            <span className="text-sm font-medium text-slate-600">
                                Rows per page: {rowsPerPage}
                            </span>
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
                            await handleDelete(selectedRecordId);
                            setDeleteModalOpen(false);
                        }} />
                    </>
                }
            >
                <p className="text-gray-700 text-center">
                    Are you sure you want to delete this commuting record? This action cannot be undone.
                </p>
            </Modal>
        </>
    );
};

export default CommutingTable;