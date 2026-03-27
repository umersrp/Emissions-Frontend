// import React, { useState, useEffect, useMemo } from "react";
// import Card from "@/components/ui/Card";
// import Button from "@/components/ui/Button";
// import Icon from "@/components/ui/Icon";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import Tippy from "@tippyjs/react";
// import { useTable, useRowSelect, useSortBy, usePagination } from "react-table";
// import GlobalFilter from "@/pages/table/react-tables/GlobalFilter";
// import Logo from "../../assets/images/logo/SrpLogo.png";
// import Modal from "@/components/ui/Modal";

// const IndeterminateCheckbox = React.forwardRef(({ indeterminate, ...rest }, ref) => {
//     const defaultRef = React.useRef();
//     const resolvedRef = ref || defaultRef;
//     React.useEffect(() => {
//         resolvedRef.current.indeterminate = indeterminate;
//     }, [resolvedRef, indeterminate]);
//     return <input type="checkbox" ref={resolvedRef} {...rest} className="table-checkbox" />;
// });

// // UK Government GHG Conversion Factors (2025)
// const EMISSION_FACTORS = {
//     // Cars by size and fuel type
//     cars: {
//         "Small car - Petrol/LPG/CNG - up to 1.4-litre engine. Diesel - up to a 1.7-litre engine. Others - vehicles models of a similar size (i.e. market segment A or B)": {
//             Diesel: 0.14340,
//             Petrol: 0.14308,
//             Hybrid: 0.11413,
//             CNG: 0.18800,
//             LPG: 0.21260,
//             Unknown: 0.14322,
//             "Plug-in Hybrid Electric Vehicle": 0.05669,
//             "Battery Electric Vehicle": 0.03688
//         },
//         "Medium car - Petrol/LPG/CNG - from 1.4-litre to 2.0-litre engine. Diesel - from 1.7-litre to 2.0-litre engine. Others - vehicles models of a similar size (i.e. generally market segment C)": {
//             Diesel: 0.17174,
//             Petrol: 0.17474,
//             Hybrid: 0.11724,
//             CNG: 0.15504,
//             LPG: 0.17427,
//             Unknown: 0.17322,
//             "Plug-in Hybrid Electric Vehicle": 0.08820,
//             "Battery Electric Vehicle": 0.03882
//         },
//         "Large car - Petrol/LPG/CNG - 2.0-litre engine (+) . Diesel - 2.0-litre engine (+). Others - vehicles models of a similar size (i.e. generally market segment D and above)": {
//             Diesel: 0.21007,
//             Petrol: 0.26828,
//             Hybrid: 0.15650,
//             CNG: 0.23722,
//             LPG: 0.26771,
//             Unknown: 0.22678,
//             "Plug-in Hybrid Electric Vehicle": 0.11430,
//             "Battery Electric Vehicle": 0.04205
//         },
//         "Average car - Unknown engine size.": {
//             Diesel: 0.17304,
//             Petrol: 0.16272,
//             Hybrid: 0.12825,
//             CNG: 0.17414,
//             LPG: 0.19599,
//             Unknown: 0.16725,
//             "Plug-in Hybrid Electric Vehicle": 0.10461,
//             "Battery Electric Vehicle": 0.04047
//         },
//         // Executive/Luxury/Sports categories
//         "Executive - Large Executive or E-Segment Passenger Cars (2000 cc - 3500+ cc)": {
//             Diesel: 0.17088,
//             Petrol: 0.20073,
//             Unknown: 0.17846,
//             "Plug-in Hybrid Electric Vehicle": 0.09133,
//             "Battery Electric Vehicle": 0.03702
//         },
//         "Luxury - Full size Luxury or F-Segment Premium Passenger Cars (3000 cc - 6000 cc)": {
//             Diesel: 0.20632,
//             Petrol: 0.30752,
//             Unknown: 0.25196,
//             "Plug-in Hybrid Electric Vehicle": 0.12510,
//             "Battery Electric Vehicle": 0.04902
//         },
//         "Sports - High Performance - High Speed Vehicles ( 2000 cc - 4000 cc+)": {
//             Diesel: 0.17323,
//             Petrol: 0.23396,
//             Unknown: 0.22400,
//             "Plug-in Hybrid Electric Vehicle": 0.14904,
//             "Battery Electric Vehicle": 0.06260
//         },
//         "Dual purpose 4X4 - SUVs 4 wheel Drive or All Wheel Drive (1500 cc - 6000 cc)": {
//             Diesel: 0.19973,
//             Petrol: 0.19219,
//             Unknown: 0.19690,
//             "Plug-in Hybrid Electric Vehicle": 0.11663,
//             "Battery Electric Vehicle": 0.04228
//         },
//         "MPV - Multi-Purpose Vehicles / People Carriers (Highroof, Hiace,Suzuki APV, Vans etc.)  - Passenger or Transport Vehicle (1200 cc - 2000 cc)": {
//             Diesel: 0.18072,
//             Petrol: 0.17903,
//             Unknown: 0.18030,
//             "Plug-in Hybrid Electric Vehicle": 0.10193,
//             "Battery Electric Vehicle": 0.05202
//         }
//     },

//     // Motorbikes
//     motorbikes: {
//         "Small": 0.08319,
//         "Medium": 0.10108,
//         "Large": 0.13252,
//         "Average": 0.11367,
//         "Small (<125cc)": 0.08319,
//         "Medium (125-500cc)": 0.10108,
//         "Large (>500cc)": 0.13252,
//         "Electric Motorbike": 0.03688 // Using Small car BEV as proxy
//     },

//     // Taxis
//     taxis: {
//         "Regular taxi": 0.14861,
//         "Premium taxi": 0.20402, // Using Business Class Taxi factor
//         "Electric taxi": 0.03688, // Using Small car BEV as proxy
//         "Shared taxi": 0.14861, // Same as regular taxi
//         "Regular Taxi": 0.14861,
//         "Premium Taxi": 0.20402,
//         "Electric Taxi": 0.03688,
//         "Shared Taxi/Pool": 0.14861
//     },

//     // Buses
//     buses: {
//         "Green Line Bus": 0.02776,
//         "Local bus": 0.12525,
//         "Express bus": 0.06875, // Using Intercity Bus (Non A.C)
//         "Electric bus": 0.03688, // Using Small car BEV as proxy
//         "Private bus": 0.12525, // Using Local Bus as proxy
//         "Local Bus": 0.12525,
//         "Electric Bus": 0.03688,
//         "Private Company Bus": 0.12525
//     },

//     // Trains
//     trains: {
//         "National Rail": 0.03546,
//         "Subway/Metro": 0.02860,
//         "Light Rail": 0.02860,
//         "Commuter Rail": 0.03546,
//         "High Speed Rail": 0.03546
//     }
// };

// // Helper function to calculate emissions
// // const calculateEmissions = (data) => {
// //     let distance = 0;
// //     let passengers = 1;
// //     let factor = 0;

// //     // Determine commute type and get appropriate values
// //     if (data.commuteByMotorbike) {
// //         distance = Number(data.motorbikeDistance) || 0;
// //         passengers = 1; // Motorbike typically carries 1 person
// //         const motorbikeType = data.motorbikeType || "Average";
// //         factor = EMISSION_FACTORS.motorbikes[motorbikeType] || EMISSION_FACTORS.motorbikes["Average"];
// //     }
// //     else if (data.commuteByCar) {
// //         distance = Number(data.carDistance) || 0;
// //         passengers = Number(data.personsCarriedCar || 0) + 1; // Including driver
// //         const carType = data.carType || "Average car - Unknown engine size";
// //         const fuelType = data.carFuelType || "Unknown";

// //         // Find the correct emission factor based on car type and fuel
// //         if (EMISSION_FACTORS.cars[carType]) {
// //             factor = EMISSION_FACTORS.cars[carType][fuelType] || EMISSION_FACTORS.cars[carType]["Unknown"];
// //         } else {
// //             // Default to average car
// //             factor = EMISSION_FACTORS.cars["Average car - Unknown engine size"][fuelType] ||
// //                 EMISSION_FACTORS.cars["Average car - Unknown engine size"]["Unknown"];
// //         }

// //         // For carpooling, emissions are allocated per passenger
// //         factor = factor / passengers;
// //     }
// //     else if (data.commuteByTaxi) {
// //         distance = Number(data.taxiDistance) || 0;
// //         passengers = Number(data.taxiPassengers || 1);
// //         const taxiType = data.taxiType || "Regular taxi";
// //         factor = EMISSION_FACTORS.taxis[taxiType] || EMISSION_FACTORS.taxis["Regular taxi"];

// //         // For shared taxi, emissions are allocated per passenger
// //         factor = factor / passengers;
// //     }
// //     else if (data.commuteByBus) {
// //         distance = Number(data.busDistance) || 0;
// //         passengers = 1; // Individual passenger
// //         const busType = data.busType || "Green Line Bus";
// //         factor = EMISSION_FACTORS.buses[busType] || EMISSION_FACTORS.buses["Green Line Bus"];
// //     }
// //     else if (data.commuteByTrain) {
// //         distance = Number(data.trainDistance) || 0;
// //         passengers = 1; // Individual passenger
// //         const trainType = data.trainType || "National rail";
// //         factor = EMISSION_FACTORS.trains[trainType] || EMISSION_FACTORS.trains["National rail"];
// //     }

// //     // Calculate total emissions
// //     const totalEmissionsKg = distance * passengers * factor;
// //     const totalEmissionsTonnes = totalEmissionsKg / 1000;

// //     return {
// //         distance,
// //         passengers,
// //         factor,
// //         totalEmissionsKg,
// //         totalEmissionsTonnes
// //     };
// // };
// // Helper function to calculate emissions
// const calculateEmissions = (data) => {
//     console.log("Calculating emissions for:", data); // Debug

//     let distance = 0;
//     let passengers = 1;
//     let factor = 0;

//     // Determine commute type and get appropriate values
//     if (data.commuteByMotorbike) {
//         distance = Number(data.motorbikeDistance) || 0;
//         passengers = 1; // Motorbike typically carries 1 person
//         const motorbikeType = data.motorbikeType || "Average";
//         factor = EMISSION_FACTORS.motorbikes[motorbikeType] || EMISSION_FACTORS.motorbikes["Average"];
//     }
//     else if (data.commuteByCar) {
//         distance = Number(data.carDistance) || 0;
//         // Check if carpooling
//         if (data.carryOthersCar) {
//             passengers = Number(data.personsCarriedCar || 0) + 1; // Including driver
//         } else {
//             passengers = 1; // Only driver
//         }
//         const carType = data.carType || "Average car - Unknown engine size";
//         const fuelType = data.carFuelType || "Unknown";

//         // Find the correct emission factor based on car type and fuel
//         if (EMISSION_FACTORS.cars[carType]) {
//             factor = EMISSION_FACTORS.cars[carType][fuelType] || EMISSION_FACTORS.cars[carType]["Unknown"];
//         } else {
//             // Default to average car
//             factor = EMISSION_FACTORS.cars["Average car - Unknown engine size"][fuelType] ||
//                 EMISSION_FACTORS.cars["Average car - Unknown engine size"]["Unknown"];
//         }

//         // For carpooling, emissions are allocated per passenger
//         factor = factor / passengers;
//     }
//     else if (data.commuteByTaxi) {
//         distance = Number(data.taxiDistance) || 0;
//         // Check if shared taxi
//         if (data.travelWithOthersTaxi) {
//             passengers = Number(data.personsTravelWithTaxi || 1);
//         } else {
//             passengers = Number(data.taxiPassengers || 1);
//         }
//         const taxiType = data.taxiType || "Regular taxi";
//         factor = EMISSION_FACTORS.taxis[taxiType] || EMISSION_FACTORS.taxis["Regular taxi"];

//         // For shared taxi, emissions are allocated per passenger
//         factor = factor / passengers;
//     }
//     else if (data.commuteByBus) {
//         distance = Number(data.busDistance) || 0;
//         passengers = 1; // Individual passenger
//         const busType = data.busType || "Green Line Bus";
//         factor = EMISSION_FACTORS.buses[busType] || EMISSION_FACTORS.buses["Green Line Bus"];
//     }
//     else if (data.commuteByTrain) {
//         distance = Number(data.trainDistance) || 0;
//         passengers = 1; // Individual passenger
//         const trainType = data.trainType || "National rail";
//         factor = EMISSION_FACTORS.trains[trainType] || EMISSION_FACTORS.trains["National rail"];
//     }

//     // Calculate total emissions
//     const totalEmissionsKg = distance * passengers * factor;
//     const totalEmissionsTonnes = totalEmissionsKg / 1000;

//     return {
//         distance,
//         passengers,
//         factor,
//         totalEmissionsKg,
//         totalEmissionsTonnes
//     };
// };
// const CommutingTable = () => {
//     const navigate = useNavigate();
//     const [commutingData, setCommutingData] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [pageCount, setPageCount] = useState(0);
//     const [globalFilterValue, setGlobalFilterValue] = useState("");
//     const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//     const [selectedRecordId, setSelectedRecordId] = useState(null);
    

//     // **Controlled page index & size**
//     const [controlledPageIndex, setControlledPageIndex] = useState(0);
//     const [controlledPageSize, setControlledPageSize] = useState(10);
//     const [isPaginationLoading, setIsPaginationLoading] = useState(false);


//     // **Reusable fetch function**
//     const fetchCommutingData = async () => {
//         setLoading(true);
//         try {
//             const search = globalFilterValue.trim();
//             const token = localStorage.getItem("token");

//             if (!token) {
//                 toast.error("Authentication token missing. Please login again.");
//                 navigate("/login");
//                 return;
//             }

//             // UPDATE THIS SECTION TO MATCH YOUR POSTMAN:
//             const params = {
//                 page: controlledPageIndex + 1,
//                 limit: controlledPageSize,
//                 //  ADD THIS LINE - exact same parameter as Postman
//                 ...(search && { search: search })
//             };

//             const res = await axios.get(
//                 `${process.env.REACT_APP_BASE_URL}/employee-commute/List`,
//                 {
//                     params,  //  This sends ?page=1&limit=10&search=Assembly
//                     headers: {
//                         Authorization: `Bearer ${token}`
//                     }
//                 }
//             );
//             console.log("API Response:", res.data); // Debug log

//             // CORRECTED: Access the response data directly
//             const data = res.data.data || [];
//             const meta = res.data.meta || {};

//             const total = meta.total || 0;
//             const totalPages = meta.totalPages || Math.ceil(total / controlledPageSize);

//             // Calculate emissions for each record
//             const dataWithEmissions = data.map(item => {
//                 // Ensure building object has buildingName property
//                 const buildingData = item.building || {};
//                 return {
//                     ...item,
//                     building: {
//                         ...buildingData,
//                         // Map buildingName correctly (some records might have different field names)
//                         buildingName: buildingData.buildingName || buildingData.name || "Unknown Building"
//                     },
//                     emissions: calculateEmissions(item)
//                 };
//             });

//             setCommutingData(dataWithEmissions);
//             setPageCount(totalPages || 1);

//         } catch (err) {
//             console.error("Error fetching commuting data:", err);

//             // Handle specific error cases
//             if (err.response?.status === 401) {
//                 toast.error("Session expired. Please login again.");
//                 localStorage.removeItem("token");
//                 navigate("/login");
//             } else if (err.response?.status === 403) {
//                 toast.error("You don't have permission to access this resource.");
//             } else {
//                 toast.error("Failed to fetch employee commuting data");
//             }

//             // Set empty data on error
//             setCommutingData([]);
//             setPageCount(1);
//         } finally {
//             setLoading(false);
//             setIsPaginationLoading(false);
//         }
//     };

//     // **Fetch data when page, size, or filter changes**
//     useEffect(() => {
//         const delay = setTimeout(() => {
//             fetchCommutingData();
//         }, 500); // Increased debounce for better UX

//         return () => clearTimeout(delay);
//     }, [controlledPageIndex, controlledPageSize, globalFilterValue]);

//     // **Delete record**
//     const handleDelete = async (id) => {
//         try {
//             await axios.delete(`${process.env.REACT_APP_BASE_URL}/employee-commute/${id}`, {
//                 headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//             });
//             toast.success("Record deleted successfully");

//             // Remove record from local state immediately
//             setCommutingData((prev) => prev.filter((item) => item._id !== id));

//             // Adjust pagination if last item on the page was deleted
//             if (commutingData.length === 1 && controlledPageIndex > 0) {
//                 setControlledPageIndex((prev) => prev - 1);
//             } else {
//                 // Refetch current page to update pagination properly
//                 fetchCommutingData();
//             }
//         } catch (err) {
//             console.error("Error deleting record:", err);
//             toast.error("Failed to delete record");
//         }
//     };

//     // const COLUMNS = useMemo(() => [
//     //     {
//     //         Header: "Sr.No",
//     //         id: "serialNo",
//     //         Cell: ({ row }) => (
//     //             <span>{row.index + 1 + controlledPageIndex * controlledPageSize}</span>
//     //         ),
//     //     },
//     //     {
//     //         Header: "Building",
//     //         accessor: "building.buildingName",
//     //         Cell: ({ cell }) => cell.value || "N/A",
//     //     },
//     //     {
//     //         Header: "Reporting Year",
//     //         accessor: "reportingYear",
//     //         Cell: ({ cell }) => cell.value || "N/A",
//     //     },
//     //     {
//     //         Header: "Commute Mode",
//     //         Cell: ({ row }) => {
//     //             const d = row.original;
//     //             if (d.commuteByMotorbike) return "Motorbike";
//     //             if (d.commuteByCar) return "Car";
//     //             if (d.commuteByBus) return "Bus";
//     //             if (d.commuteByTaxi) return "Taxi";
//     //             if (d.commuteByTrain) return "Train";
//     //             if (d.workFromHome) return "Work From Home";
//     //             return "No Commute";
//     //         },
//     //     },
//     //     {
//     //         Header: "Vehicle Type",
//     //         Cell: ({ row }) => {
//     //             const d = row.original;

//     //             // Helper function to format text to Title Case
//     //             const toTitleCase = (str) => {
//     //                 if (!str) return "N/A";
//     //                 return str
//     //                     .toLowerCase()
//     //                     .split(' ')
//     //                     .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//     //                     .join(' ');
//     //             };

//     //             if (d.commuteByMotorbike) return toTitleCase(d.motorbikeType);
//     //             if (d.commuteByCar) return toTitleCase(d.carType);
//     //             if (d.commuteByBus) return toTitleCase(d.busType);
//     //             if (d.commuteByTaxi) return toTitleCase(d.taxiType);
//     //             if (d.commuteByTrain) return toTitleCase(d.trainType);
//     //             return "N/A";
//     //         },
//     //     },
//     //     {
//     //         Header: "Fuel Type",
//     //         Cell: ({ row }) => {
//     //             const d = row.original;
//     //             if (d.commuteByCar) return d.carFuelType || "N/A";
//     //             return "N/A";
//     //         },
//     //     },
//     //     {
//     //         Header: "Number of Passengers",
//     //         Cell: ({ row }) => {
//     //             const d = row.original;
//     //             if (d.commuteByMotorbike) return d.personsCarriedMotorbike || 0;
//     //             if (d.commuteByCar) return (d.personsCarriedCar || 0) + 1; // Including driver
//     //             if (d.commuteByTaxi) return d.taxiPassengers || 1;
//     //             if (d.commuteByBus || d.commuteByTrain) return 1;
//     //             return 0;
//     //         },
//     //     },
//     //     {
//     //         Header: "Distance Travelled",
//     //         Cell: ({ row }) => {
//     //             const d = row.original;
//     //             if (d.commuteByMotorbike) return Number(d.motorbikeDistance || 0).toFixed(2);
//     //             if (d.commuteByCar) return Number(d.carDistance || 0).toFixed(2);
//     //             if (d.commuteByBus) return Number(d.busDistance || 0).toFixed(2);
//     //             if (d.commuteByTaxi) return Number(d.taxiDistance || 0).toFixed(2);
//     //             if (d.commuteByTrain) return Number(d.trainDistance || 0).toFixed(2);
//     //             return "0.00";
//     //         },
//     //     },
//     //     {
//     //         Header: "Calculate Emission (kgCO₂e)",
//     //         Cell: ({ row }) => {
//     //             const emissions = row.original.emissions;
//     //             if (!emissions) return "N/A";
//     //             return emissions.totalEmissionsKg.toFixed(2);
//     //         },
//     //     },
//     //     {
//     //         Header: "Calculate Emissions (tCO₂e)",
//     //         Cell: ({ row }) => {
//     //             const emissions = row.original.emissions;
//     //             if (!emissions) return "N/A";
//     //             return emissions.totalEmissionsTonnes.toFixed(2);
//     //         },
//     //     },
//     //     {
//     //         Header: "Submitted By",
//     //         accessor: "submittedByEmail",
//     //         Cell: ({ cell }) => cell.value || "N/A",
//     //     },
//     //     {
//     //         Header: "Department",
//     //         Cell: ({ row }) => {
//     //             const d = row.original;
//     //             return d.stakeholderDepartment || "N/A";
//     //         },
//     //     },
//     //     {
//     //         Header: "Date Range",
//     //         Cell: ({ row }) => {
//     //             const d = row.original;
//     //             let dateRange = null;

//     //             if (d.commuteByMotorbike && d.motorbikeDateRange) {
//     //                 dateRange = d.motorbikeDateRange;
//     //             } else if (d.commuteByCar && d.carDateRange) {
//     //                 dateRange = d.carDateRange;
//     //             } else if (d.commuteByBus && d.busDateRange) {
//     //                 dateRange = d.busDateRange;
//     //             } else if (d.commuteByTaxi && d.taxiDateRange) {
//     //                 dateRange = d.taxiDateRange;
//     //             } else if (d.commuteByTrain && d.trainDateRange) {
//     //                 dateRange = d.trainDateRange;
//     //             } else if (d.workFromHome && d.workFromHomeDateRange) {
//     //                 dateRange = d.workFromHomeDateRange;
//     //             }

//     //             if (dateRange && dateRange.startDate && dateRange.endDate) {
//     //                 const start = new Date(dateRange.startDate).toLocaleDateString();
//     //                 const end = new Date(dateRange.endDate).toLocaleDateString();
//     //                 return `${start} to ${end}`;
//     //             }
//     //             return "N/A";
//     //         },
//     //     },
//     //     {
//     //         Header: "Actions",
//     //         accessor: "_id",
//     //         Cell: ({ cell }) => (
//     //             <div className="flex space-x-3 rtl:space-x-reverse">
//     //                 {/* <Tippy content="View Details">
//     //                     <button
//     //                         className="action-btn"
//     //                         onClick={() => {
//     //                             navigate(`/employee-commuting/view/${cell.value}`);
//     //                         }}
//     //                     >
//     //                         <Icon icon="heroicons:eye" className="text-green-600" />
//     //                     </button>
//     //                 </Tippy> */}

//     //                 <Tippy content="Delete">
//     //                     <button
//     //                         className="action-btn"
//     //                         onClick={() => {
//     //                             setSelectedRecordId(cell.value);
//     //                             setDeleteModalOpen(true);
//     //                         }}
//     //                     >
//     //                         <Icon icon="heroicons:trash" className="text-red-600" />
//     //                     </button>
//     //                 </Tippy>
//     //             </div>
//     //         ),
//     //     },
//     // ], [navigate, controlledPageIndex, controlledPageSize]);
// const COLUMNS = useMemo(() => [
//     {
//         Header: "Sr.No",
//         id: "serialNo",
//         Cell: ({ row }) => (
//             <span>{row.index + 1 + controlledPageIndex * controlledPageSize}</span>
//         ),
//     },
//      {
//         Header: "Email Subject ",
//         accessor: "emailDoc.subject",
//         Cell: ({ cell }) => cell.value || "N/A",
//     },
//     // {
//     //     Header: "Building Code",
//     //     accessor: "building.buildingCode",
//     //     Cell: ({ cell }) => cell.value || "N/A",
//     // },
//     {
//         Header: "Building",
//         accessor: "building.buildingName",
//         Cell: ({ cell }) => cell.value || "N/A",
//     },
//     {
//         Header: "Reporting Year",
//         accessor: "reportingYear",
//         Cell: ({ cell }) => cell.value || "N/A",
//     },
//     // Motor Bike Section
//     {
//         Header: "Commute Mode",
//         id: "motorbikeMode",
//         Cell: ({ row }) => {
//             const d = row.original;
//             return d.commuteByMotorbike ? "Motor Bike" : "N/A";
//         },
//     },
//     {
//         Header: "Motor Bike Type",
//         id: "motorbikeType",
//         Cell: ({ row }) => {
//             const d = row.original;
//             if (!d.commuteByMotorbike) return "N/A";
//             const toTitleCase = (str) => {
//                 if (!str) return "N/A";
//                 return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
//             };
//             return toTitleCase(d.motorbikeType);
//         },
//     },
//     {
//         Header: "Distance Travelled (k.m)",
//         id: "motorbikeDistance",
//         Cell: ({ row }) => {
//             const d = row.original;
//             if (!d.commuteByMotorbike) return "N/A";
            
//             let distanceText = "";
//             if (d.motorbikeMode === "individual") {
//                 distanceText = `${Number(d.motorbikeDistance || 0).toFixed(2)} km (individual)`;
//             } else if (d.motorbikeMode === "carpool") {
//                 distanceText = `${Number(d.motorbikeDistanceCarpool || 0).toFixed(2)} km (carpool)`;
//             } else if (d.motorbikeMode === "both") {
//                 distanceText = `${Number(d.motorbikeDistance || 0).toFixed(2)} km (individual) + ${Number(d.motorbikeDistanceCarpool || 0).toFixed(2)} km (carpool) = ${(Number(d.motorbikeDistance || 0) + Number(d.motorbikeDistanceCarpool || 0)).toFixed(2)} km`;
//             }
//             return distanceText;
//         },
//     },
//     {
//         Header: "Car Pool",
//         id: "motorbikeCarPool",
//         Cell: ({ row }) => {
//             const d = row.original;
//             if (!d.commuteByMotorbike) return "N/A";
            
//             if (d.motorbikeMode === "individual") return "No";
//             if (d.motorbikeMode === "carpool") return "Yes (Carpool)";
//             if (d.motorbikeMode === "both") return "Both";
//             return "N/A";
//         },
//     },
//     {
//         Header: "Date Range",
//         id: "motorbikeDateRange",
//         Cell: ({ row }) => {
//             const d = row.original;
//             if (!d.commuteByMotorbike || !d.motorbikeDateRange) return "N/A";
            
//             const formatDateRange = (dateRange) => {
//                 if (!dateRange || !dateRange.startDate || !dateRange.endDate) return null;
//                 const start = new Date(dateRange.startDate).toLocaleDateString();
//                 const end = new Date(dateRange.endDate).toLocaleDateString();
//                 return `${start} to ${end}`;
//             };
            
//             const individualRange = d.motorbikeDateRange;
//             const carpoolRange = d.motorbikeCarpoolDateRange;
            
//             if (d.motorbikeMode === "both" && carpoolRange) {
//                 return `${formatDateRange(individualRange)} (Individual) | ${formatDateRange(carpoolRange)} (Carpool)`;
//             }
//             return formatDateRange(individualRange) || "N/A";
//         },
//     },
    
//     // Taxi Section
//     {
//         Header: "Commute Mode",
//         id: "taxiMode",
//         Cell: ({ row }) => {
//             const d = row.original;
//             return d.commuteByTaxi ? "Taxi" : "N/A";
//         },
//     },
//     {
//         Header: "Taxi Type",
//         id: "taxiType",
//         Cell: ({ row }) => {
//             const d = row.original;
//             if (!d.commuteByTaxi) return "N/A";
//             const toTitleCase = (str) => {
//                 if (!str) return "N/A";
//                 return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
//             };
//             return toTitleCase(d.taxiType);
//         },
//     },
//     {
//         Header: "Distance Travelled (k.m)",
//         id: "taxiDistance",
//         Cell: ({ row }) => {
//             const d = row.original;
//             if (!d.commuteByTaxi) return "N/A";
            
//             let distanceText = "";
//             if (d.taxiMode === "individual") {
//                 distanceText = `${Number(d.taxiDistance || 0).toFixed(2)} km (individual)`;
//             } else if (d.taxiMode === "carpool") {
//                 distanceText = `${Number(d.taxiDistanceCarpool || 0).toFixed(2)} km (carpool)`;
//             } else if (d.taxiMode === "both") {
//                 distanceText = `${Number(d.taxiDistance || 0).toFixed(2)} km (individual) + ${Number(d.taxiDistanceCarpool || 0).toFixed(2)} km (carpool) = ${(Number(d.taxiDistance || 0) + Number(d.taxiDistanceCarpool || 0)).toFixed(2)} km`;
//             }
//             return distanceText;
//         },
//     },
//     {
//         Header: "Car Pool",
//         id: "taxiCarPool",
//         Cell: ({ row }) => {
//             const d = row.original;
//             if (!d.commuteByTaxi) return "N/A";
            
//             if (d.taxiMode === "individual") return "No";
//             if (d.taxiMode === "carpool") return "Yes (Carpool)";
//             if (d.taxiMode === "both") return "Both";
//             return "N/A";
//         },
//     },
//     {
//         Header: "Date Range",
//         id: "taxiDateRange",
//         Cell: ({ row }) => {
//             const d = row.original;
//             if (!d.commuteByTaxi || !d.taxiDateRange) return "N/A";
            
//             const formatDateRange = (dateRange) => {
//                 if (!dateRange || !dateRange.startDate || !dateRange.endDate) return null;
//                 const start = new Date(dateRange.startDate).toLocaleDateString();
//                 const end = new Date(dateRange.endDate).toLocaleDateString();
//                 return `${start} to ${end}`;
//             };
            
//             const individualRange = d.taxiDateRange;
//             const carpoolRange = d.taxiCarpoolDateRange;
            
//             if (d.taxiMode === "both" && carpoolRange) {
//                 return `${formatDateRange(individualRange)} (Individual) | ${formatDateRange(carpoolRange)} (Carpool)`;
//             }
//             return formatDateRange(individualRange) || "N/A";
//         },
//     },
    
//     // Bus Section
//     {
//         Header: "Commute Mode",
//         id: "busMode",
//         Cell: ({ row }) => {
//             const d = row.original;
//             return d.commuteByBus ? "Bus" : "N/A";
//         },
//     },
//     {
//         Header: "Bus Type",
//         id: "busType",
//         Cell: ({ row }) => {
//             const d = row.original;
//             if (!d.commuteByBus) return "N/A";
//             const toTitleCase = (str) => {
//                 if (!str) return "N/A";
//                 return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
//             };
//             return toTitleCase(d.busType);
//         },
//     },
//     {
//         Header: "Distance Travelled (k.m)",
//         id: "busDistance",
//         Cell: ({ row }) => {
//             const d = row.original;
//             if (!d.commuteByBus) return "N/A";
//             return `${Number(d.busDistance || 0).toFixed(2)} km`;
//         },
//     },
   
//     {
//         Header: "Date Range",
//         id: "busDateRange",
//         Cell: ({ row }) => {
//             const d = row.original;
//             if (!d.commuteByBus || !d.busDateRange) return "N/A";
//             const start = new Date(d.busDateRange.startDate).toLocaleDateString();
//             const end = new Date(d.busDateRange.endDate).toLocaleDateString();
//             return `${start} to ${end}`;
//         },
//     },
    
//     // Train Section
//     {
//         Header: "Commute Mode",
//         id: "trainMode",
//         Cell: ({ row }) => {
//             const d = row.original;
//             return d.commuteByTrain ? "Train" : "N/A";
//         },
//     },
//     {
//         Header: "Train Type",
//         id: "trainType",
//         Cell: ({ row }) => {
//             const d = row.original;
//             if (!d.commuteByTrain) return "N/A";
//             const toTitleCase = (str) => {
//                 if (!str) return "N/A";
//                 return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
//             };
//             return toTitleCase(d.trainType);
//         },
//     },
//     {
//         Header: "Distance Travelled (k.m)",
//         id: "trainDistance",
//         Cell: ({ row }) => {
//             const d = row.original;
//             if (!d.commuteByTrain) return "N/A";
//             return `${Number(d.trainDistance || 0).toFixed(2)} km`;
//         },
//     },
    
//     {
//         Header: "Date Range",
//         id: "trainDateRange",
//         Cell: ({ row }) => {
//             const d = row.original;
//             if (!d.commuteByTrain || !d.trainDateRange) return "N/A";
//             const start = new Date(d.trainDateRange.startDate).toLocaleDateString();
//             const end = new Date(d.trainDateRange.endDate).toLocaleDateString();
//             return `${start} to ${end}`;
//         },
//     },
    
//     // Car Section
//     {
//         Header: "Commute Mode",
//         id: "carMode",
//         Cell: ({ row }) => {
//             const d = row.original;
//             return d.commuteByCar ? "Car" : "N/A";
//         },
//     },
//     {
//         Header: "Car Type",
//         id: "carType",
//         Cell: ({ row }) => {
//             const d = row.original;
//             if (!d.commuteByCar) return "N/A";
//             const toTitleCase = (str) => {
//                 if (!str) return "N/A";
//                 return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
//             };
//             return toTitleCase(d.carType);
//         },
//     },
//     {
//         Header: "Car Fuel Type",
//         id: "carFuelType",
//         Cell: ({ row }) => {
//             const d = row.original;
//             if (!d.commuteByCar) return "N/A";
//             return d.carFuelType || "N/A";
//         },
//     },
//     {
//         Header: "Distance Travelled (k.m)",
//         id: "carDistance",
//         Cell: ({ row }) => {
//             const d = row.original;
//             if (!d.commuteByCar) return "N/A";
            
//             let distanceText = "";
//             if (d.carMode === "individual") {
//                 distanceText = `${Number(d.carDistance || 0).toFixed(2)} km (individual)`;
//             } else if (d.carMode === "carpool") {
//                 distanceText = `${Number(d.carDistanceCarpool || 0).toFixed(2)} km (carpool)`;
//             } else if (d.carMode === "both") {
//                 distanceText = `${Number(d.carDistance || 0).toFixed(2)} km (individual) + ${Number(d.carDistanceCarpool || 0).toFixed(2)} km (carpool) = ${(Number(d.carDistance || 0) + Number(d.carDistanceCarpool || 0)).toFixed(2)} km`;
//             }
//             return distanceText;
//         },
//     },
//     {
//         Header: "Car Pool",
//         id: "carCarPool",
//         Cell: ({ row }) => {
//             const d = row.original;
//             if (!d.commuteByCar) return "N/A";
            
//             if (d.carMode === "individual") return "No";
//             if (d.carMode === "carpool") return "Yes (Carpool)";
//             if (d.carMode === "both") return "Both";
//             return "N/A";
//         },
//     },
//     {
//         Header: "Date Range",
//         id: "carDateRange",
//         Cell: ({ row }) => {
//             const d = row.original;
//             if (!d.commuteByCar || !d.carDateRange) return "N/A";
            
//             const formatDateRange = (dateRange) => {
//                 if (!dateRange || !dateRange.startDate || !dateRange.endDate) return null;
//                 const start = new Date(dateRange.startDate).toLocaleDateString();
//                 const end = new Date(dateRange.endDate).toLocaleDateString();
//                 return `${start} to ${end}`;
//             };
            
//             const individualRange = d.carDateRange;
//             const carpoolRange = d.carCarpoolDateRange;
            
//             if (d.carMode === "both" && carpoolRange) {
//                 return `${formatDateRange(individualRange)} (Individual) | ${formatDateRange(carpoolRange)} (Carpool)`;
//             }
//             return formatDateRange(individualRange) || "N/A";
//         },
//     },
    
//     // Work From Home Section
//     {
//         Header: "Work from Home",
//         id: "workFromHome",
//         Cell: ({ row }) => {
//             const d = row.original;
//             return d.workFromHome ? "Yes" : "No";
//         },
//     },
//     {
//         Header: "FTE Working Hours",
//         id: "fteWorkingHours",
//         Cell: ({ row }) => {
//             const d = row.original;
//             if (!d.workFromHome) return "N/A";
//             return d.fteWorkingHours || "N/A";
//         },
//     },
//     {
//         Header: "Date Range",
//         id: "wfhDateRange",
//         Cell: ({ row }) => {
//             const d = row.original;
//             if (!d.workFromHome || !d.workFromHomeDateRange) return "N/A";
//             const start = new Date(d.workFromHomeDateRange.startDate).toLocaleDateString();
//             const end = new Date(d.workFromHomeDateRange.endDate).toLocaleDateString();
//             return `${start} to ${end}`;
//         },
//     },
    
//     // Quality Control and Remarks
//     {
//         Header: "Quality Control",
//         id: "qualityControl",
//         Cell: ({ row }) => {
//             const d = row.original;
//             return d.qualityControlRemarks ? "Reviewed" : "Not Reviewed";
//         },
//     },
//     {
//         Header: "Remarks",
//         id: "remarks",
//         Cell: ({ row }) => {
//             const d = row.original;
//             return d.qualityControlRemarks || "N/A";
//         },
//     },
    
//     // Emissions and Submission
//     {
//         Header: "Calculate Emission (kgCO₂e)",
//         id: "emissionsKg",
//         Cell: ({ row }) => {
//             const emissions = row.original.calculatedEmissionKgCo2e;
//             if (!emissions && emissions !== 0) return "N/A";
//             return emissions.toFixed(2);
//         },
//     },
//     {
//         Header: "Calculate Emissions (tCO₂e)",
//         id: "emissionsTonnes",
//         Cell: ({ row }) => {
//             const emissions = row.original.calculatedEmissionTCo2e;
//             if (!emissions && emissions !== 0) return "N/A";
//             return emissions.toFixed(6);
//         },
//     },
//     {
//         Header: "Submitted By",
//         accessor: "submittedByEmail",
//         Cell: ({ cell }) => cell.value || "N/A",
//     },
//     {
//         Header: "Department",
//         accessor: "stakeholderDepartment",
//         Cell: ({ cell }) => cell.value || "N/A",
//     },
//     {
//         Header: "Actions",
//         accessor: "_id",
//         Cell: ({ cell }) => (
//             <div className="flex space-x-3 rtl:space-x-reverse">
//                 <Tippy content="Delete">
//                     <button
//                         className="action-btn"
//                         onClick={() => {
//                             setSelectedRecordId(cell.value);
//                             setDeleteModalOpen(true);
//                         }}
//                     >
//                         <Icon icon="heroicons:trash" className="text-red-600" />
//                     </button>
//                 </Tippy>
//             </div>
//         ),
//     },
// ], [navigate, controlledPageIndex, controlledPageSize]);

//     const tableInstance = useTable(
//         {
//             columns: COLUMNS,
//             data: commutingData,
//             manualPagination: true,
//             pageCount,
//             initialState: { pageIndex: controlledPageIndex, pageSize: controlledPageSize },
//         },
//         useSortBy,
//         usePagination,
//         useRowSelect,
//         (hooks) => {
//             hooks.visibleColumns.push((columns) => [
//                 {
//                     id: "selection",
//                     Header: ({ getToggleAllRowsSelectedProps }) => (
//                         <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
//                     ),
//                     Cell: ({ row }) => <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
//                 },
//                 ...columns,
//             ]);
//         }
//     );

//     const { getTableProps, getTableBodyProps, headerGroups, page, prepareRow } = tableInstance;

//     // **Pagination handlers**
//     const handlePageChange = (newPageIndex) => {
//         setIsPaginationLoading(true);
//         setControlledPageIndex(newPageIndex);
//     };

//     const handlePageSizeChange = (newSize) => {
//         setIsPaginationLoading(true);
//         setControlledPageSize(newSize);
//         setControlledPageIndex(0); // Reset to first page
//     };

//     // Calculate totals for selected rows
//     const calculateTotals = () => {
//         const selectedRows = commutingData.filter((_, index) => {
//             const row = page.find(r => r.index === index);
//             return row && row.isSelected;
//         });

//         let totalDistance = 0;
//         let totalEmissionsKg = 0;
//         let totalEmissionsTonnes = 0;

//         selectedRows.forEach(row => {
//             if (row.emissions) {
//                 totalDistance += row.emissions.distance;
//                 totalEmissionsKg += row.emissions.totalEmissionsKg;
//                 totalEmissionsTonnes += row.emissions.totalEmissionsTonnes;
//             }
//         });

//         return {
//             totalDistance: totalDistance.toFixed(2),
//             totalEmissionsKg: totalEmissionsKg.toFixed(2),
//             totalEmissionsTonnes: totalEmissionsTonnes.toFixed(4),
//             count: selectedRows.length
//         };
//     };

//     const totals = calculateTotals();

//     return (
//         <>
//             <Card noborder>
//                 <div className="md:flex pb-6 items-center">
//                     <div className="flex-1">
//                         <h6 className="mb-2">Employee Commuting</h6>                    
//                     </div>
//                     <div className="md:flex md:space-x-3 items-center flex-none rtl:space-x-reverse">
//                         <GlobalFilter filter={globalFilterValue} setFilter={setGlobalFilterValue} />
//                         <Button
//                             icon="heroicons-outline:plus-sm"
//                             text="Send Email"
//                             className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90 h-9"
//                             iconClass="text-lg"
//                             onClick={() => navigate("/EmailSent")}
//                         />
//                     </div>
//                 </div>

//                 {/* Totals Summary */}
//                 {totals.count > 0 && (
//                     <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                         <h4 className="font-medium text-blue-800 mb-2">
//                             Selected Items Summary ({totals.count} records)
//                         </h4>
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                             <div className="bg-white p-3 rounded border">
//                                 <p className="text-sm text-gray-600">Total Distance</p>
//                                 <p className="text-lg font-semibold">{totals.totalDistance} km</p>
//                             </div>
//                             <div className="bg-white p-3 rounded border">
//                                 <p className="text-sm text-gray-600">Total Emissions (kgCO₂e)</p>
//                                 <p className="text-lg font-semibold">{totals.totalEmissionsKg} kg</p>
//                             </div>
//                             <div className="bg-white p-3 rounded border">
//                                 <p className="text-sm text-gray-600">Total Emissions (tCO₂e)</p>
//                                 <p className="text-lg font-semibold">{totals.totalEmissionsTonnes} tonnes</p>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 <div className="overflow-x-auto -mx-6">
//                     <div className="inline-block min-w-full align-middle">
//                         {/* Set fixed height for vertical scroll */}
//                         <div className="overflow-y-auto max-h-[calc(100vh-300px)] overflow-x-auto">
//                             {loading || isPaginationLoading ? (
//                                 <div className="flex justify-center items-center py-8">
//                                     <img src={Logo} alt="Loading..." className="w-52 h-24" />
//                                 </div>
//                             ) : (
//                                 <table
//                                     className="min-w-full divide-y divide-slate-100 table-fixed"
//                                     {...getTableProps()}
//                                 >
//                                     <thead className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] sticky top-0 z-10">
//                                         {headerGroups.map((headerGroup, idx) => (
//                                             <tr {...headerGroup.getHeaderGroupProps()} key={idx}>
//                                                 {headerGroup.headers.map((column) => (
//                                                     <th
//                                                         {...column.getHeaderProps(column.getSortByToggleProps())}
//                                                         className="table-th text-white whitespace-nowrap"
//                                                         key={column.id}
//                                                     >
//                                                         {column.render("Header")}
//                                                         <span>
//                                                             {column.isSorted
//                                                                 ? column.isSortedDesc
//                                                                     ? " 🔽"
//                                                                     : " 🔼"
//                                                                 : ""}
//                                                         </span>
//                                                     </th>
//                                                 ))}
//                                             </tr>
//                                         ))}
//                                     </thead>
//                                     <tbody {...getTableBodyProps()}>
//                                         {page.length === 0 ? (
//                                             <tr>
//                                                 <td colSpan={COLUMNS.length + 1}>
//                                                     <div className="flex justify-center items-center py-16">
//                                                         <span className="text-gray-500 text-lg font-medium">
//                                                             {globalFilterValue
//                                                                 ? `No results found for "${globalFilterValue}"`
//                                                                 : "No employee commuting data available."
//                                                             }
//                                                         </span>
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         ) : (
//                                             page.map((row) => {
//                                                 prepareRow(row);
//                                                 return (
//                                                     <tr {...row.getRowProps()} className="even:bg-gray-50">
//                                                         {row.cells.map((cell) => (
//                                                             <td
//                                                                 {...cell.getCellProps()}
//                                                                 className="px-6 py-4 whitespace-nowrap"
//                                                             >
//                                                                 {cell.render("Cell")}
//                                                             </td>
//                                                         ))}
//                                                     </tr>
//                                                 );
//                                             })
//                                         )}
//                                     </tbody>
//                                 </table>
//                             )}
//                         </div>
//                     </div>
//                 </div>

//                 {/* Pagination */}
                // <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
                //     <div className="flex items-center space-x-3">
                //         <span className="flex space-x-2 items-center">
                //             <span className="text-sm font-medium text-slate-600">Go</span>
                //             <input
                //                 type="number"
                //                 className="form-control py-2"
                //                 min="1"
                //                 max={pageCount}
                //                 value={controlledPageIndex + 1}
                //                 onChange={(e) => {
                //                     const pg = Number(e.target.value);
                //                     if (pg >= 1 && pg <= pageCount) handlePageChange(pg - 1);
                //                 }}
                //                 style={{ width: "70px" }}
                //             />
                //         </span>
                //         <span className="text-sm font-medium text-slate-600">
                //             Page {controlledPageIndex + 1} of {pageCount}
                //             {globalFilterValue && (
                //                 <span className="text-xs text-gray-500 ml-2">
                //                     (Filtered results)
                //                 </span>
                //             )}
                //         </span>
                //     </div>

                //     <ul className="flex items-center space-x-3">
                //         <li>
                //             <button onClick={() => handlePageChange(0)} disabled={controlledPageIndex === 0}>
                //                 <Icon icon="heroicons:chevron-double-left-solid" />
                //             </button>
                //         </li>
                //         <li>
                //             <button onClick={() => controlledPageIndex > 0 && handlePageChange(controlledPageIndex - 1)} disabled={controlledPageIndex === 0}>
                //                 Prev
                //             </button>
                //         </li>
                //         {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
                //             // Show limited page numbers for better UX
                //             let pageNum;
                //             if (pageCount <= 5) {
                //                 pageNum = i;
                //             } else if (controlledPageIndex < 2) {
                //                 pageNum = i;
                //             } else if (controlledPageIndex > pageCount - 3) {
                //                 pageNum = pageCount - 5 + i;
                //             } else {
                //                 pageNum = controlledPageIndex - 2 + i;
                //             }
                //             return (
                //                 <li key={pageNum}>
                //                     <button
                //                         className={`${pageNum === controlledPageIndex ? "bg-slate-900 text-white font-medium" : "bg-slate-100 text-slate-900"} text-sm rounded h-6 w-6 flex items-center justify-center`}
                //                         onClick={() => handlePageChange(pageNum)}
                //                     >
                //                         {pageNum + 1}
                //                     </button>
                //                 </li>
                //             );
                //         })}
                //         <li>
                //             <button onClick={() => controlledPageIndex < pageCount - 1 && handlePageChange(controlledPageIndex + 1)} disabled={controlledPageIndex === pageCount - 1}>
                //                 Next
                //             </button>
                //         </li>
                //         <li>
                //             <button onClick={() => handlePageChange(pageCount - 1)} disabled={controlledPageIndex === pageCount - 1}>
                //                 <Icon icon="heroicons:chevron-double-right-solid" />
                //             </button>
                //         </li>
                //     </ul>

                //     <div className="flex items-center space-x-3">
                //         <span className="text-sm font-medium text-slate-600">Show</span>
                //         <select
                //             value={controlledPageSize}
                //             onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                //             className="form-select py-2"
                //         >
                //             {[10, 20, 30, 50].map((size) => (
                //                 <option key={size} value={size}>{size}</option>
                //             ))}
                //         </select>
                //     </div>
                // </div>
//             </Card>

//             <Modal
//                 activeModal={deleteModalOpen}
//                 onClose={() => setDeleteModalOpen(false)}
//                 title="Confirm Delete"
//                 themeClass="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]"
//                 centered
//                 footerContent={
//                     <>
//                         <Button text="Cancel" className="btn-light" onClick={() => setDeleteModalOpen(false)} />
//                         <Button text="Delete" className="btn-danger" onClick={async () => {
//                             await handleDelete(selectedRecordId);
//                             setDeleteModalOpen(false);
//                         }} />
//                     </>
//                 }
//             >
//                 <p className="text-gray-700 text-center">
//                     Are you sure you want to delete this commuting record? This action cannot be undone.
//                 </p>
//             </Modal>
//         </>
//     );
// };

// export default CommutingTable;



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

const calculateEmissions = (data) => {
    let distance = 0;
    let passengers = 1;
    let factor = 0;

    if (data.commuteByMotorbike) {
        distance = Number(data.motorbikeDistance) || 0;
        passengers = 1;
        const motorbikeType = data.motorbikeType || "Average";
        factor = EMISSION_FACTORS.motorbikes[motorbikeType] || EMISSION_FACTORS.motorbikes["Average"];
    }
    else if (data.commuteByCar) {
        distance = Number(data.carDistance) || 0;
        if (data.carryOthersCar) {
            passengers = Number(data.personsCarriedCar || 0) + 1;
        } else {
            passengers = 1;
        }
        const carType = data.carType || "Average car - Unknown engine size";
        const fuelType = data.carFuelType || "Unknown";

        if (EMISSION_FACTORS.cars[carType]) {
            factor = EMISSION_FACTORS.cars[carType][fuelType] || EMISSION_FACTORS.cars[carType]["Unknown"];
        } else {
            factor = EMISSION_FACTORS.cars["Average car - Unknown engine size"][fuelType] ||
                EMISSION_FACTORS.cars["Average car - Unknown engine size"]["Unknown"];
        }
        factor = factor / passengers;
    }
    else if (data.commuteByTaxi) {
        distance = Number(data.taxiDistance) || 0;
        if (data.travelWithOthersTaxi) {
            passengers = Number(data.personsTravelWithTaxi || 1);
        } else {
            passengers = Number(data.taxiPassengers || 1);
        }
        const taxiType = data.taxiType || "Regular taxi";
        factor = EMISSION_FACTORS.taxis[taxiType] || EMISSION_FACTORS.taxis["Regular taxi"];
        factor = factor / passengers;
    }
    else if (data.commuteByBus) {
        distance = Number(data.busDistance) || 0;
        passengers = 1;
        const busType = data.busType || "Green Line Bus";
        factor = EMISSION_FACTORS.buses[busType] || EMISSION_FACTORS.buses["Green Line Bus"];
    }
    else if (data.commuteByTrain) {
        distance = Number(data.trainDistance) || 0;
        passengers = 1;
        const trainType = data.trainType || "National rail";
        factor = EMISSION_FACTORS.trains[trainType] || EMISSION_FACTORS.trains["National rail"];
    }

    const totalEmissionsKg = distance * passengers * factor;
    const totalEmissionsTonnes = totalEmissionsKg / 1000;

    return {
        distance,
        passengers,
        factor,
        totalEmissionsKg,
        totalEmissionsTonnes
    };
};

// Group Row Component for Email Subject
const GroupRow = ({ subject, recordCount, isExpanded, onToggle, groupTotals }) => {
    return (
        <tr className="bg-white cursor-pointer hover:opacity-90" onClick={onToggle}>
            <td className="px-6 py-3 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                    <Icon 
                        icon={isExpanded ? "heroicons:chevron-down" : "heroicons:chevron-right"} 
                        className="text-black-500 text-lg"
                    />
                    <span className="font-semibold text-black-500">{subject || "No Subject"}</span>
                </div>
            </td>
            <td className="px-6 py-3 whitespace-nowrap text-white" colSpan="12">
                <div className="flex justify-between items-center">
                    <span>{recordCount} record{recordCount !== 1 ? 's' : ''}</span>
                    <div className="flex space-x-4">
                        <span>Total Distance: {groupTotals.totalDistance} km</span>
                        <span>Total Emissions: {groupTotals.totalEmissionsKg} kgCO₂e</span>
                        <span>Total: {groupTotals.totalEmissionsTonnes} tCO₂e</span>
                    </div>
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

    return (
        <tr className="even:bg-gray-50 hover:bg-gray-100">
            <td className="px-6 py-4 whitespace-nowrap">{index}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.building?.buildingName || "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.reportingYear || "N/A"}</td>
            <td className="px-6 py-4 whitespace-nowrap">
                {record.commuteByMotorbike ? "Motorbike" : 
                 record.commuteByCar ? "Car" : 
                 record.commuteByBus ? "Bus" : 
                 record.commuteByTaxi ? "Taxi" : 
                 record.commuteByTrain ? "Train" : 
                 record.workFromHome ? "Work From Home" : "No Commute"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                {record.commuteByMotorbike && toTitleCase(record.motorbikeType)}
                {record.commuteByCar && toTitleCase(record.carType)}
                {record.commuteByBus && toTitleCase(record.busType)}
                {record.commuteByTaxi && toTitleCase(record.taxiType)}
                {record.commuteByTrain && toTitleCase(record.trainType)}
                {!record.commuteByMotorbike && !record.commuteByCar && 
                 !record.commuteByBus && !record.commuteByTaxi && 
                 !record.commuteByTrain && "N/A"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                {record.commuteByCar ? (record.carFuelType || "N/A") : "N/A"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                {record.commuteByMotorbike && record.personsCarriedMotorbike}
                {record.commuteByCar && (Number(record.personsCarriedCar || 0) + 1)}
                {record.commuteByTaxi && record.taxiPassengers}
                {(record.commuteByBus || record.commuteByTrain) && 1}
                {!record.commuteByMotorbike && !record.commuteByCar && 
                 !record.commuteByBus && !record.commuteByTaxi && 
                 !record.commuteByTrain && 0}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                {record.commuteByMotorbike && Number(record.motorbikeDistance || 0).toFixed(2)}
                {record.commuteByCar && Number(record.carDistance || 0).toFixed(2)}
                {record.commuteByBus && Number(record.busDistance || 0).toFixed(2)}
                {record.commuteByTaxi && Number(record.taxiDistance || 0).toFixed(2)}
                {record.commuteByTrain && Number(record.trainDistance || 0).toFixed(2)}
                {!record.commuteByMotorbike && !record.commuteByCar && 
                 !record.commuteByBus && !record.commuteByTaxi && 
                 !record.commuteByTrain && "0.00"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                {record.calculatedEmissionKgCo2e?.toFixed(2) || "N/A"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                {record.calculatedEmissionTCo2e?.toFixed(6) || "N/A"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                {record.submittedByEmail || "N/A"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                {record.stakeholderDepartment || "N/A"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex space-x-3 rtl:space-x-reverse">
                    <Tippy content="Delete">
                        <button
                            className="action-btn"
                            onClick={() => onDelete(record._id)}
                        >
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
    const [pageCount, setPageCount] = useState(0);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedRecordId, setSelectedRecordId] = useState(null);
    
    const [controlledPageIndex, setControlledPageIndex] = useState(0);
    const [controlledPageSize, setControlledPageSize] = useState(10);
    const [isPaginationLoading, setIsPaginationLoading] = useState(false);
    
    // Track expanded groups
    const [expandedGroups, setExpandedGroups] = useState({});

    // Group records by email subject
    const groupedData = useMemo(() => {
        const groups = {};
        
        commutingData.forEach(record => {
            const subject = record.emailDoc?.subject || "No Subject";
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

    const toggleGroup = (subject) => {
        setExpandedGroups(prev => ({
            ...prev,
            [subject]: !prev[subject]
        }));
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
                page: controlledPageIndex + 1,
                limit: controlledPageSize,
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
            
            console.log("API Response:", res.data);

            const data = res.data.data || [];
            const meta = res.data.meta || {};

            const total = meta.total || 0;
            const totalPages = meta.totalPages || Math.ceil(total / controlledPageSize);

            const dataWithBuilding = data.map(item => ({
                ...item,
                building: item.building || {},
                calculatedEmissionKgCo2e: item.calculatedEmissionKgCo2e || 0,
                calculatedEmissionTCo2e: item.calculatedEmissionTCo2e || 0
            }));

            setCommutingData(dataWithBuilding);
            setPageCount(totalPages || 1);

            // Auto-expand first group
            const subjects = [...new Set(dataWithBuilding.map(item => item.emailDoc?.subject || "No Subject"))];
            if (subjects.length > 0 && Object.keys(expandedGroups).length === 0) {
                setExpandedGroups({ [subjects[0]]: true });
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
            setPageCount(1);
        } finally {
            setLoading(false);
            setIsPaginationLoading(false);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => {
            fetchCommutingData();
        }, 500);
        return () => clearTimeout(delay);
    }, [controlledPageIndex, controlledPageSize, globalFilterValue]);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${process.env.REACT_APP_BASE_URL}/employee-commute/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            toast.success("Record deleted successfully");
            
            setCommutingData((prev) => prev.filter((item) => item._id !== id));
            
            if (commutingData.length === 1 && controlledPageIndex > 0) {
                setControlledPageIndex((prev) => prev - 1);
            } else {
                fetchCommutingData();
            }
        } catch (err) {
            console.error("Error deleting record:", err);
            toast.error("Failed to delete record");
        }
    };

    const handlePageChange = (newPageIndex) => {
        setIsPaginationLoading(true);
        setControlledPageIndex(newPageIndex);
        // Reset expanded groups when changing page
        setExpandedGroups({});
    };

    const handlePageSizeChange = (newSize) => {
        setIsPaginationLoading(true);
        setControlledPageSize(newSize);
        setControlledPageIndex(0);
        setExpandedGroups({});
    };

    // Calculate global serial number
    let globalSerialNumber = 0;

    return (
        <>
            <Card noborder>
                <div className="md:flex pb-6 items-center">
                    <div className="flex-1">
                        <h6 className="mb-2">Employee Commuting</h6>                    
                    </div>
                    <div className="md:flex md:space-x-3 items-center flex-none rtl:space-x-reverse">
                        {/* <input
                            type="text"
                            placeholder="Search..."
                            className="form-control py-2 px-3 border rounded-md"
                            value={globalFilterValue}
                            onChange={(e) => setGlobalFilterValue(e.target.value)}
                        /> */}
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
                            {loading || isPaginationLoading ? (
                                <div className="flex justify-center items-center py-8">
                                    <img src={Logo} alt="Loading..." className="w-52 h-24" />
                                </div>
                            ) : Object.keys(groupedData).length === 0 ? (
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
                                    {/* Fixed Header - Only One Header */}
                                    <thead className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] sticky top-0 z-10">
                                        <tr>
                                            <th className="table-th text-white whitespace-nowrap">Sr.No</th>
                                            <th className="table-th text-white whitespace-nowrap">Building</th>
                                            <th className="table-th text-white whitespace-nowrap">Reporting Year</th>
                                            <th className="table-th text-white whitespace-nowrap">Commute Mode</th>
                                            <th className="table-th text-white whitespace-nowrap">Vehicle Type</th>
                                            <th className="table-th text-white whitespace-nowrap">Fuel Type</th>
                                            <th className="table-th text-white whitespace-nowrap">Passengers</th>
                                            <th className="table-th text-white whitespace-nowrap">Distance (km)</th>
                                            <th className="table-th text-white whitespace-nowrap">Emissions (kgCO₂e)</th>
                                            <th className="table-th text-white whitespace-nowrap">Emissions (tCO₂e)</th>
                                            <th className="table-th text-white whitespace-nowrap">Submitted By</th>
                                            <th className="table-th text-white whitespace-nowrap">Department</th>
                                            <th className="table-th text-white whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {Object.entries(groupedData).map(([subject, { records, totals }]) => (
                                            <React.Fragment key={subject}>
                                                {/* Group Header Row */}
                                                <GroupRow
                                                    subject={subject}
                                                    recordCount={totals.recordCount}
                                                    isExpanded={expandedGroups[subject] || false}
                                                    onToggle={() => toggleGroup(subject)}
                                                    groupTotals={totals}
                                                />
                                                
                                                {/* Records in this group - only show if expanded */}
                                                {expandedGroups[subject] && records.map((record, idx) => {
                                                    globalSerialNumber++;
                                                    return (
                                                        <RecordRow
                                                            key={record._id}
                                                            record={record}
                                                            index={globalSerialNumber}
                                                            onDelete={(id) => {
                                                                setSelectedRecordId(id);
                                                                setDeleteModalOpen(true);
                                                            }}
                                                        />
                                                    );
                                                })}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pagination */}
                {/* <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
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
                            {globalFilterValue && (
                                <span className="text-xs text-gray-500 ml-2">
                                    (Filtered results)
                                </span>
                            )}
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
                        {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
                            let pageNum;
                            if (pageCount <= 5) {
                                pageNum = i;
                            } else if (controlledPageIndex < 2) {
                                pageNum = i;
                            } else if (controlledPageIndex > pageCount - 3) {
                                pageNum = pageCount - 5 + i;
                            } else {
                                pageNum = controlledPageIndex - 2 + i;
                            }
                            return (
                                <li key={pageNum}>
                                    <button
                                        className={`${pageNum === controlledPageIndex ? "bg-slate-900 text-white font-medium" : "bg-slate-100 text-slate-900"} text-sm rounded h-6 w-6 flex items-center justify-center`}
                                        onClick={() => handlePageChange(pageNum)}
                                    >
                                        {pageNum + 1}
                                    </button>
                                </li>
                            );
                        })}
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
                </div> */}

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
                            {globalFilterValue && (
                                <span className="text-xs text-gray-500 ml-2">
                                    (Filtered results)
                                </span>
                            )}
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
                        {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
                            // Show limited page numbers for better UX
                            let pageNum;
                            if (pageCount <= 5) {
                                pageNum = i;
                            } else if (controlledPageIndex < 2) {
                                pageNum = i;
                            } else if (controlledPageIndex > pageCount - 3) {
                                pageNum = pageCount - 5 + i;
                            } else {
                                pageNum = controlledPageIndex - 2 + i;
                            }
                            return (
                                <li key={pageNum}>
                                    <button
                                        className={`${pageNum === controlledPageIndex ? "bg-slate-900 text-white font-medium" : "bg-slate-100 text-slate-900"} text-sm rounded h-6 w-6 flex items-center justify-center`}
                                        onClick={() => handlePageChange(pageNum)}
                                    >
                                        {pageNum + 1}
                                    </button>
                                </li>
                            );
                        })}
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
