// import React, { useState, useEffect } from "react";
// import Card from "@/components/ui/Card";
// import Button from "@/components/ui/Button";
// import Select from "@/components/ui/Select";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { useNavigate, useParams, useLocation } from "react-router-dom";
// import {
//   stakeholderDepartmentOptions,
//   processQualityControlOptions,
// } from "@/constant/scope1/options";
// import 'tippy.js/dist/tippy.css'; // Essential base styles
// import 'tippy.js/themes/light.css';
// import Tippy from "@tippyjs/react";
// import {
//   transportationCategoryOptions,
//   purchasedGoodsActivityOptions,
//   purchasedServicesActivityOptions,
//   purchasedGoodsTypeMapping,
//   vehicleCategoryOptions,
//   vehicleTypeOptions
// } from '@/constant/scope3/upstreamTransportation';
// import { calculateUpstreamTransportationEmission } from '@/utils/Scope3/calculateUpstreamTransportation';
// import InputGroup from "@/components/ui/InputGroup";

// const UpstreamTransportationFormPage = () => {
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const location = useLocation();

//   const mode = location.state?.mode || "add";
//   const isView = mode === "view";
//   const isEdit = mode === "edit";
//   const isAdd = mode === "add";

//   const [formData, setFormData] = useState({
//     buildingId: null,
//     stakeholderDepartment: null,
//     transportationCategory: null,
//     activityType: null,
//     purchasedGoodsType: null,
//     vehicleCategory: null,
//     vehicleType: null,
//     weightLoaded: "",
//     distanceTravelled: "",
//     amountSpent: "",
//     unit: "",
//     qualityControl: null,
//     remarks: "",
//     calculatedEmissionKgCo2e: "",
//     calculatedEmissionTCo2e: "",
//   });

//   const [errors, setErrors] = useState({});
//   const [buildingOptions, setBuildingOptions] = useState([]);
//   const [activityTypeOptions, setActivityTypeOptions] = useState([]);
//   const [purchasedGoodsTypeOptions, setPurchasedGoodsTypeOptions] = useState([]);
//   const unitOptions = [
//     { value: "USD", label: "$" },

//   ];

//   const capitalizeFirstLetter = (text) => {
//     if (!text) return "";
//     return text.charAt(0).toUpperCase() + text.slice(1);
//   };

//   useEffect(() => {
//     if (isView) return;

//     const { transportationCategory } = formData;

//     let result = null;

//     if (transportationCategory?.value === "purchasedGoods") {
//       const { weightLoaded, distanceTravelled, vehicleCategory, vehicleType } = formData;
//       if (weightLoaded && distanceTravelled && vehicleCategory?.value) {
//         result = calculateUpstreamTransportationEmission({
//           transportationCategory: "purchasedGoods",
//           weightLoaded: parseFloat(weightLoaded),
//           distanceTravelled: parseFloat(distanceTravelled),
//           vehicleCategory: vehicleCategory.value,
//           vehicleType: vehicleType?.value,
//         });
//       }
//     } else if (transportationCategory?.value === "purchasedServices") {
//       const { amountSpent, activityType, unit } = formData;
//       if (amountSpent && activityType?.value) {
//         result = calculateUpstreamTransportationEmission({
//           transportationCategory: "purchasedServices",
//           amountSpent: parseFloat(amountSpent),
//           activityType: activityType.value,
//           unit: unit,
//         });
//       }
//     }

//     if (result) {
//       setFormData(prev => ({
//         ...prev,
//         calculatedEmissionKgCo2e: result.calculatedEmissionKgCo2e,
//         calculatedEmissionTCo2e: result.calculatedEmissionTCo2e,
//       }));
//     }
//   }, [
//     formData.transportationCategory,
//     formData.weightLoaded,
//     formData.distanceTravelled,
//     formData.vehicleCategory,
//     formData.vehicleType,
//     formData.amountSpent,
//     formData.activityType,
//     formData.unit,
//     isView
//   ]);

//   const formatEmission = (num) => {
//     try {
//       if (num === null || num === undefined || num === "") {
//         return 0;
//       }
//       const number = Number(num);
//       if (isNaN(number) || !isFinite(number)) {
//         return 0;
//       }
//       const rounded = Number(number.toFixed(2));
//       const integerPart = Math.floor(Math.abs(rounded));
//       if (
//         rounded !== 0 &&
//         (Math.abs(rounded) < 0.0001 ||
//           (Math.abs(rounded) >= 1e6 && integerPart === 0))
//       ) {
//         return rounded.toExponential(5);
//       }
//       return rounded;
//     } catch (error) {
//       console.error("Error in formatEmission:", error, "num:", num);
//       return 0;
//     }
//   };
//   // Fetch all buildings for dropdown
//   useEffect(() => {
//     const fetchBuildings = async () => {
//       try {
//         const res = await axios.get(
//           `${process.env.REACT_APP_BASE_URL}/building/Get-All-Buildings?limit=1000`,
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("token")}`,
//             },
//           }
//         );
//         const formatted =
//           res.data?.data?.buildings?.map((b) => ({
//             value: b._id,
//             label: b.buildingName,
//           })) || [];
//         setBuildingOptions(formatted);
//       } catch {
//         toast.error("Failed to load buildings");
//       }
//     };
//     fetchBuildings();
//   }, []);

//   // Fetch record by ID (Edit / View)
//   useEffect(() => {
//     const fetchById = async () => {
//       if (!id || isAdd) return;
//       try {
//         const res = await axios.get(
//           `${process.env.REACT_APP_BASE_URL}/upstream/upstream/${id}`,
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("token")}`,
//             },
//           }
//         );

//         const data = res.data?.data;

//         // Set activity type options based on transportation category
//         if (data.transportationCategory === "purchasedGoods") {
//           setActivityTypeOptions(purchasedGoodsActivityOptions);

//           // Set purchased goods type options based on activity type
//           if (data.activityType) {
//             const goodsOptions = purchasedGoodsTypeMapping[data.activityType] || [];
//             setPurchasedGoodsTypeOptions(goodsOptions);
//           }
//         } else if (data.transportationCategory === "purchasedServices") {
//           setActivityTypeOptions(purchasedServicesActivityOptions);
//         }

//         // Find the purchased goods type from the mapping
//         let purchasedGoodsTypeValue = null;
//         if (data.activityType && data.purchasedGoodsType) {
//           const goodsOptions = purchasedGoodsTypeMapping[data.activityType] || [];
//           purchasedGoodsTypeValue = goodsOptions.find(
//             (option) => option.value === data.purchasedGoodsType
//           ) || {
//             label: data.purchasedGoodsType,
//             value: data.purchasedGoodsType,
//           };
//         }

//         setFormData({
//           buildingId:
//             buildingOptions.find((b) => b.value === data.buildingId?._id) || {
//               label: data.buildingId?.buildingName || "",
//               value: data.buildingId?._id || "",
//             },
//           stakeholderDepartment:
//             stakeholderDepartmentOptions.find(
//               (s) => s.value === data.stakeholderDepartment
//             ) || {
//               label: data.stakeholderDepartment,
//               value: data.stakeholderDepartment,
//             },
//           transportationCategory:
//             transportationCategoryOptions.find(
//               (t) => t.value === data.transportationCategory
//             ) || {
//               label: data.transportationCategory,
//               value: data.transportationCategory,
//             },
//           activityType:
//             purchasedGoodsActivityOptions.find((a) => a.value === data.activityType) || {
//               label: data.activityType,
//               value: data.activityType,
//             },
//           purchasedGoodsType: purchasedGoodsTypeValue,
//           vehicleCategory:
//             vehicleCategoryOptions.find((v) => v.value === data.vehicleCategory) || {
//               label: data.vehicleCategory,
//               value: data.vehicleCategory,
//             },
//           vehicleType: data.vehicleType
//             ? vehicleTypeOptions[data.vehicleCategory]?.find(v => v.value === data.vehicleType) || null
//             : null,
//           weightLoaded: data.weightLoaded || "",
//           distanceTravelled: data.distanceTravelled || "",
//           amountSpent: data.amountSpent || "",
//           unit: data.transportationCategory === "purchasedServices" ? (data.unit || "USD") : "", qualityControl:
//             processQualityControlOptions.find(
//               (q) => q.value === data.qualityControl
//             ) || { label: data.qualityControl, value: data.qualityControl },
//           remarks: data.remarks || "",
//           calculatedEmissionKgCo2e: data.calculatedEmissionKgCo2e || "",
//           calculatedEmissionTCo2e: data.calculatedEmissionTCo2e || "",
//         });
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to fetch record details");
//       }
//     };
//     fetchById();
//   }, [id, isAdd, buildingOptions]);
//   // Handle dropdown changes
//   const handleSelectChange = (value, { name }) => {
//     if (isView) return;

//     let updated = { ...formData, [name]: value };
//     if (name === "unit") {
//       updated[name] = value?.value || "USD";
//     } else {
//       updated[name] = value;
//     }


//     if (name === "transportationCategory") {
//       // Reset dependent fields when category changes
//       updated.activityType = null;
//       updated.purchasedGoodsType = null;
//       updated.vehicleCategory = null;
//       updated.vehicleType = null;
//       updated.weightLoaded = "";
//       updated.distanceTravelled = "";
//       updated.amountSpent = "";
//       if (value?.value !== "purchasedServices") {
//         updated.unit = "USD"; // Reset to default or empty string
//       }


//       setPurchasedGoodsTypeOptions([]); // Clear purchased goods options

//       // Set activity type options based on category
//       if (value?.value === "purchasedGoods") {
//         setActivityTypeOptions(purchasedGoodsActivityOptions);
//       } else if (value?.value === "purchasedServices") {
//         setActivityTypeOptions(purchasedServicesActivityOptions);
//       }
//     }

//     if (name === "activityType") {
//       // Reset purchased goods type when activity type changes
//       updated.purchasedGoodsType = null;

//       // Set purchased goods type options based on selected activity type
//       if (value?.value) {
//         const goodsOptions = purchasedGoodsTypeMapping[value.value] || [];
//         setPurchasedGoodsTypeOptions(goodsOptions);
//       } else {
//         setPurchasedGoodsTypeOptions([]);
//       }
//     }

//     if (name === "vehicleCategory") {
//       // Reset vehicle type when category changes
//       updated.vehicleType = null;
//     }

//     setFormData(updated);
//     setErrors((prev) => ({ ...prev, [name]: "" }));
//   };

//   const handleInputChange = (e) => {
//     if (isView) return;
//     const { name, value } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));

//     setErrors((prev) => ({ ...prev, [name]: "" }));
//   };

//   // Validation
//   const validate = () => {
//     const newErrors = {};
//     if (!formData.buildingId) newErrors.buildingId = "Building is required";
//     if (!formData.stakeholderDepartment)
//       newErrors.stakeholderDepartment = "Department is required";
//     if (!formData.transportationCategory)
//       newErrors.transportationCategory = "Transportation Category is required";
//     if (!formData.activityType)
//       newErrors.activityType = "Activity Type is required";

//     // Validate based on category
//     if (formData.transportationCategory?.value === "purchasedGoods") {
//       // Only require purchasedGoodsType if activityType is selected AND there are options available
//       if (formData.activityType) {
//         const goodsOptions = purchasedGoodsTypeMapping[formData.activityType.value] || [];
//         if (goodsOptions.length > 0 && !formData.purchasedGoodsType) {
//           newErrors.purchasedGoodsType = "Purchased Goods Type is required";
//         }
//       }

//       if (!formData.vehicleCategory) newErrors.vehicleCategory = "Vehicle Category is required";

//       // Validate numeric fields
//       if (!formData.weightLoaded) {
//         newErrors.weightLoaded = "Weight Loaded is required";
//       } else if (isNaN(parseFloat(formData.weightLoaded)) || parseFloat(formData.weightLoaded) <= 0) {
//         newErrors.weightLoaded = "Weight Loaded must be a positive number";
//       }

//       if (!formData.distanceTravelled) {
//         newErrors.distanceTravelled = "Distance Travelled is required";
//       } else if (isNaN(parseFloat(formData.distanceTravelled)) || parseFloat(formData.distanceTravelled) <= 0) {
//         newErrors.distanceTravelled = "Distance Travelled must be a positive number";
//       }

//     } else if (formData.transportationCategory?.value === "purchasedServices") {
//       if (!formData.amountSpent) {
//         newErrors.amountSpent = "Amount Spent is required";
//       } else if (isNaN(parseFloat(formData.amountSpent)) || parseFloat(formData.amountSpent) <= 0) {
//         newErrors.amountSpent = "Amount Spent must be a positive number";
//       }
//     }

//     if (!formData.qualityControl)
//       newErrors.qualityControl = "Quality Control is required";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // Submit form
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (isView) return;
//     if (!validate()) {
//       toast.error("Please fill all required fields");
//       return;
//     }
//     // Calculate emissions before submitting
//     let calculatedEmissions = {};
//     if (formData.transportationCategory?.value === "purchasedGoods") {
//       calculatedEmissions = calculateUpstreamTransportationEmission({
//         transportationCategory: "purchasedGoods",
//         weightLoaded: parseFloat(formData.weightLoaded),
//         distanceTravelled: parseFloat(formData.distanceTravelled),
//         vehicleCategory: formData.vehicleCategory?.value,
//         vehicleType: formData.vehicleType?.value,
//       }) || {};
//     } else if (formData.transportationCategory?.value === "purchasedServices") {
//       calculatedEmissions = calculateUpstreamTransportationEmission({
//         transportationCategory: "purchasedServices",
//         amountSpent: parseFloat(formData.amountSpent),
//         activityType: formData.activityType?.value,
//         unit: formData.unit,
//       }) || {};
//     }

//     // Create payload with all fields
//     const payload = {
//       buildingId: formData.buildingId?.value,
//       stakeholderDepartment: formData.stakeholderDepartment?.value,
//       transportationCategory: formData.transportationCategory?.value,
//       activityType: formData.activityType?.value,
//       purchasedGoodsType: formData.purchasedGoodsType?.value,
//       vehicleCategory: formData.vehicleCategory?.value,
//       vehicleType: formData.vehicleType?.value,
//       weightLoaded: formData.weightLoaded,
//       distanceTravelled: formData.distanceTravelled,
//       amountSpent: formData.amountSpent,
//       // Send empty string for purchasedGoods, "USD" for purchasedServices
//       unit: formData.transportationCategory?.value === "purchasedServices" ? formData.unit : "",
//       qualityControl: formData.qualityControl?.value,
//       remarks: capitalizeFirstLetter(formData.remarks),
//       calculatedEmissionKgCo2e: formatEmission(
//         calculatedEmissions.calculatedEmissionKgCo2e
//       ),
//       calculatedEmissionTCo2e: formatEmission(
//         calculatedEmissions.calculatedEmissionTCo2e
//       ),
//     };

//     try {
//       if (isEdit) {
//         await axios.put(
//           `${process.env.REACT_APP_BASE_URL}/upstream/Update/${id}`,
//           payload,
//           { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
//         );
//         toast.success("Record updated successfully!");
//       } else {
//         await axios.post(
//           `${process.env.REACT_APP_BASE_URL}/upstream/Create`,
//           payload,
//           { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
//         );
//         toast.success("Record added successfully!");
//       }
//       navigate("/Upstream-Transportation");
//     } catch (err) {
//       console.error(err);
//       toast.error(err.response?.data?.message || "Error saving record");
//     }
//   };
//   // Helper to determine if vehicle type should be shown
//   const shouldShowVehicleType = () => {
//     const category = formData.vehicleCategory?.value;
//     return category && ["freightFlights", "seaTanker", "cargoShip"].includes(category);
//   };

//   return (
//     <div>
//       <Card
//         title={`${isView ? "View" : isEdit ? "Edit" : "Add"} Upstream Transportation and Distribution Records`}
//       >
//         <div className="text-slate-700 leading-relaxed mb-2 bg-gray-100 rounded-lg border-l-4 border-primary-400 p-2 pl-4 m-4 justify-center">
//           <p className="text-gray-700">
//             This category includes emissions from the transportation and distribution of products purchased by the reporting company, in <span className="font-semibold">vehicles and facilities not owned or controlled by the company.</span> It also covers <span className="font-semibold">third-party transportation and distribution</span> services <span className="font-semibold">purchased</span> by the reporting company in the reporting year, including inbound logistics, outbound logistics (e.g., of sold products) and transportation between the company’s own facilities when performed by third-party logistics providers.          </p>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 grid gap-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {/* Building */}
//             <div>
//               <label className="field-label">Site / Building Name</label>
//               <Select
//                 name="buildingId"
//                 value={formData.buildingId}
//                 options={buildingOptions}
//                 onChange={handleSelectChange}
//                 placeholder="Select Building"
//                 isDisabled={isView}
//               />
//               {errors.buildingId && (
//                 <p className="text-red-500 text-sm mt-1">{errors.buildingId}</p>
//               )}
//             </div>

//             {/* Department */}
//             <div className="lg:col-span-2">
//               <label className="field-label">Stakeholder / Department</label>
//               <Select
//                 name="stakeholderDepartment"
//                 value={formData.stakeholderDepartment}
//                 options={stakeholderDepartmentOptions}
//                 onChange={handleSelectChange}
//                 placeholder="Select Stakeholder / Department"
//                 isDisabled={isView}
//                 allowCustomInput
//               />
//               {errors.stakeholderDepartment && (
//                 <p className="text-red-500 text-sm mt-1">{errors.stakeholderDepartment}</p>
//               )}
//             </div>

//             {/* Transportation Category */}
//             <div className="col-span-2">
//               <label className="field-label">Transportation and Distribution Category</label>
//               <Select
//                 name="transportationCategory"
//                 value={formData.transportationCategory}
//                 options={transportationCategoryOptions}
//                 onChange={handleSelectChange}
//                 placeholder="Select Category"
//                 isDisabled={isView}
//               />
//               {errors.transportationCategory && (
//                 <p className="text-red-500 text-sm mt-1">{errors.transportationCategory}</p>
//               )}
//             </div>

//             {/* Activity Type */}
//             <div>
//               <label className="field-label">Purchased Product Activity Type</label>
//               <Select
//                 name="activityType"
//                 value={formData.activityType}
//                 options={activityTypeOptions}
//                 onChange={handleSelectChange}
//                 placeholder="Select Activity Type"
//                 isDisabled={isView}
//               />
//               {errors.activityType && (
//                 <p className="text-red-500 text-sm mt-1">{errors.activityType}</p>
//               )}
//             </div>

//             {/* Purchased Goods Type (only for purchasedGoods category) */}
//             {formData.transportationCategory?.value === "purchasedGoods" && (
//               <div>
//                 <div className="flex items-center gap-2 ">
//                   <label className="field-label">Purchased Goods Type</label>
//                   <Tippy
//                     content="Select the specific type of goods based on the chosen activity type."
//                     placement="top"
//                   >
//                     <button
//                       type="button"
//                       className="w-5 h-5 mb-1 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium hover:bg-blue-200 transition-colors"
//                       aria-label="Information about purchased goods type"
//                     >
//                       i
//                     </button>
//                   </Tippy>
//                 </div>
//                 <Select
//                   name="purchasedGoodsType"
//                   value={formData.purchasedGoodsType}
//                   options={purchasedGoodsTypeOptions}
//                   onChange={handleSelectChange}
//                   placeholder={formData.activityType ? `Select ${formData.activityType.label} Type` : "Select Goods Type"}
//                   isDisabled={isView || !formData.activityType}
//                   isClearable={true}
//                 />
//                 {errors.purchasedGoodsType && (
//                   <p className="text-red-500 text-sm mt-1">{errors.purchasedGoodsType}</p>
//                 )}
//                 {formData.activityType && purchasedGoodsTypeOptions.length === 0 && (
//                   <p className="text-gray-500 text-sm mt-1">No options available for this activity type</p>
//                 )}
//               </div>
//             )}

//             {/* Vehicle Category (only for purchasedGoods category) */}
//             {formData.transportationCategory?.value === "purchasedGoods" && (
//               <div>
//                 <div className="flex items-center gap-2 ">
//                   <label className="field-label">Transportation Vehicle Category</label>
//                   <Tippy content="Please specify the vehicle category in which your purchased goods were transported / distributed."
//                     placement="top">
//                     <button
//                       type="button"
//                       className="w-5 h-5 mb-1 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium hover:bg-blue-200 transition-colors"
//                       aria-label="Information about vehicle category">
//                       i
//                     </button>
//                   </Tippy>
//                 </div>
//                 <Select
//                   name="vehicleCategory"
//                   value={formData.vehicleCategory}
//                   options={vehicleCategoryOptions}
//                   onChange={handleSelectChange}
//                   placeholder="Select Vehicle Category"
//                   isDisabled={isView}
//                 />
//                 {errors.vehicleCategory && (
//                   <p className="text-red-500 text-sm mt-1">{errors.vehicleCategory}</p>
//                 )}
//               </div>

//             )}

//             {/* Vehicle Type (only for specific categories) */}
//             {formData.transportationCategory?.value === "purchasedGoods" && shouldShowVehicleType() && (
//               <div>
//                 <div className="flex items-center gap-2 ">
//                   <label className="field-label">Transportation Vehicle Type</label>
//                   <Tippy content="Please specify the type of transportation vehicle used to deliver your purchased goods."
//                     placement="top">
//                     <button
//                       type="button"
//                       className="w-5 h-5 mb-1 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium hover:bg-blue-200 transition-colors"
//                       aria-label="Information about vehicle category">
//                       i
//                     </button>
//                   </Tippy>
//                 </div>
//                 <Select
//                   name="vehicleType"
//                   value={formData.vehicleType}
//                   options={vehicleTypeOptions[formData.vehicleCategory?.value] || []}
//                   onChange={handleSelectChange}
//                   placeholder="Select Vehicle Type"
//                   isDisabled={isView}
//                 />
//                 {errors.vehicleType && (
//                   <p className="text-red-500 text-sm mt-1">{errors.vehicleType}</p>
//                 )}

//               </div>
//             )}

//             {/* Weight Loaded (only for purchasedGoods category) */}
//             {formData.transportationCategory?.value === "purchasedGoods" && (
//               <div>
//                 <div className="flex items-center gap-2 ">
//                   <label className="field-label">Wieght Loaded</label>
//                   <Tippy content="Please specify the total weight of the purchased goods."
//                     placement="top">
//                     <button
//                       type="button"
//                       className="w-5 h-5 mb-1 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium hover:bg-blue-200 transition-colors"
//                       aria-label="Information about vehicle category">
//                       i
//                     </button>
//                   </Tippy>
//                 </div>
//                 <div className="flex">
//                   <InputGroup
//                     type="number"
//                     name="weightLoaded"
//                     value={formData.weightLoaded}
//                     onChange={handleInputChange}
//                     placeholder="Enter Value"
//                     className="input-field rounded-r-none"
//                     disabled={isView}
//                   />
//                   <div className="flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-100">
//                     tonnes
//                   </div>
//                 </div>
//                 {errors.weightLoaded && (
//                   <p className="text-red-500 text-sm mt-1">{errors.weightLoaded}</p>
//                 )}
//               </div>
//             )}

//             {/* Distance Travelled (only for purchasedGoods category) */}
//             {formData.transportationCategory?.value === "purchasedGoods" && (
//               <div>
//                 <div className="flex items-center gap-2 ">
//                   <label className="field-label">Distance Travelled </label>
//                   <Tippy content="Please specify the distance travelled by the vehicle to transport / distribute your purchased goods."
//                     placement="top">
//                     <button
//                       type="button"
//                       className="w-5 h-5 mb-1 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium hover:bg-blue-200 transition-colors"
//                       aria-label="Information about vehicle category">
//                       i
//                     </button>
//                   </Tippy>
//                 </div>
//                 <div className="flex">
//                   <InputGroup
//                     type="number"
//                     name="distanceTravelled"
//                     value={formData.distanceTravelled}
//                     onChange={handleInputChange}
//                     placeholder="Enter Value"
//                     className="input-field rounded-r-none"
//                     disabled={isView}
//                   />
//                   <div className="flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-100">
//                     km
//                   </div>
//                 </div>
//                 {errors.distanceTravelled && (
//                   <p className="text-red-500 text-sm mt-1">{errors.distanceTravelled}</p>
//                 )}
//               </div>
//             )}

//             {/* Amount Spent (only for purchasedServices category) */}
//             {formData.transportationCategory?.value === "purchasedServices" && (
//               <div >
//                 {/* Amount Input */}
//                 <div >
//                   <div className="flex items-center gap-2 ">
//                     <label className="field-label">Amount Spent</label>
//                     <Tippy content="Please specify the amount spent on third-party transportation and distribution services."
//                       placement="top">
//                       <button
//                         type="button"
//                         className="w-5 h-5 mb-1 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium hover:bg-blue-200 transition-colors"
//                         aria-label="Information about vehicle category">
//                         i
//                       </button>
//                     </Tippy>
//                   </div>
//                   <InputGroup
//                     type="number"
//                     name="amountSpent"
//                     value={formData.amountSpent}
//                     onChange={handleInputChange}
//                     placeholder="Enter Value"
//                     className="input-field"
//                     disabled={isView}
//                   />
//                   {errors.amountSpent && (
//                     <p className="text-red-500 text-sm mt-1">{errors.amountSpent}</p>
//                   )}
//                 </div>
//               </div>
//             )}

//             {formData.transportationCategory?.value === "purchasedServices" && (
//               <div>
//                 {/* Unit Selection */}
//                 <div>
//                   <label className="field-label">Unit</label>
//                   <Select
//                     name="unit"
//                     value={unitOptions.find(option => option.value === formData.unit) || unitOptions[0]}
//                     options={unitOptions}
//                     onChange={handleSelectChange}
//                     placeholder="Select Unit"
//                     isDisabled={isView}
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Quality Control */}
//             <div>
//               <label className="field-label">Quality Control</label>
//               <Select
//                 name="qualityControl"
//                 value={formData.qualityControl}
//                 options={processQualityControlOptions}
//                 onChange={handleSelectChange}
//                 placeholder="Select Quality"
//                 isDisabled={isView}
//               />
//               {errors.qualityControl && (
//                 <p className="text-red-500 text-sm mt-1">{errors.qualityControl}</p>
//               )}
//             </div>

//           </div>

//           {/* Remarks */}
//           <div>
//             <label className="field-label">Remarks</label>
//             <InputGroup
//      type="textarea"          name="remarks"
//               value={formData.remarks}
//               onChange={handleInputChange}
//               rows={3}
//               placeholder="Enter Remarks"
//               className="border-[2px] border-gray-400 rounded-md"
//               disabled={isView}
//             />
//           </div>

//           {/* Buttons */}
//           <div className="col-span-full flex justify-end gap-4 pt-6">
//             <Button
//               text={isView ? "Back" : "Cancel"}
//               className={isView ? "btn-primary" : "btn-light"}
//               type="button"
//               onClick={() => navigate("/Upstream-Transportation")}
//             />
//             {!isView && (
//               <Button
//                 text={isEdit ? "Update" : "Add"}
//                 className="btn-primary"
//                 type="submit"
//               />
//             )}
//           </div>
//         </form>
//       </Card>
//     </div>
//   );
// };

// export default UpstreamTransportationFormPage;
import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  stakeholderDepartmentOptions,
  processQualityControlOptions,
} from "@/constant/scope1/options";
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import Tippy from "@tippyjs/react";
import {
  transportationCategoryOptions,
  purchasedGoodsActivityOptions,
  purchasedServicesActivityOptions,
  purchasedGoodsTypeMapping,
  vehicleCategoryOptions,
  vehicleTypeOptions
} from '@/constant/scope3/upstreamTransportation';
import { calculateUpstreamTransportationEmission } from '@/utils/Scope3/calculateUpstreamTransportation';
import InputGroup from "@/components/ui/InputGroup";

const UpstreamTransportationFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const mode = location.state?.mode || "add";
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const [formData, setFormData] = useState({
    buildingId: null,
    stakeholderDepartment: null,
    transportationCategory: null,
    activityType: null,
    purchasedGoodsType: null,
    vehicleCategory: null,
    vehicleType: null,
    weightLoaded: "",
    distanceTravelled: "",
    amountSpent: "",
    unit: "USD", // Default to "USD"
    qualityControl: null,
    remarks: "",
    calculatedEmissionKgCo2e: "",
    calculatedEmissionTCo2e: "",
  });

  const [errors, setErrors] = useState({});
  const [buildingOptions, setBuildingOptions] = useState([]);
  const [activityTypeOptions, setActivityTypeOptions] = useState([]);
  const [purchasedGoodsTypeOptions, setPurchasedGoodsTypeOptions] = useState([]);

  const capitalizeFirstLetter = (text) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  useEffect(() => {
    if (isView) return;

    const { transportationCategory } = formData;

    let result = null;

    if (transportationCategory?.value === "purchasedGoods") {
      const { weightLoaded, distanceTravelled, vehicleCategory, vehicleType } = formData;
      if (weightLoaded && distanceTravelled && vehicleCategory?.value) {
        result = calculateUpstreamTransportationEmission({
          transportationCategory: "purchasedGoods",
          weightLoaded: parseFloat(weightLoaded),
          distanceTravelled: parseFloat(distanceTravelled),
          vehicleCategory: vehicleCategory.value,
          vehicleType: vehicleType?.value,
        });
      }
    } else if (transportationCategory?.value === "purchasedServices") {
      const { amountSpent, activityType } = formData;
      if (amountSpent && activityType?.value) {
        result = calculateUpstreamTransportationEmission({
          transportationCategory: "purchasedServices",
          amountSpent: parseFloat(amountSpent),
          activityType: activityType.value,
          unit: "USD", // Always use "USD" for calculation
        });
      }
    }

    if (result) {
      setFormData(prev => ({
        ...prev,
        calculatedEmissionKgCo2e: result.calculatedEmissionKgCo2e,
        calculatedEmissionTCo2e: result.calculatedEmissionTCo2e,
      }));
    }
  }, [
    formData.transportationCategory,
    formData.weightLoaded,
    formData.distanceTravelled,
    formData.vehicleCategory,
    formData.vehicleType,
    formData.amountSpent,
    formData.activityType,
    isView
  ]);

  const formatEmission = (num) => {
    try {
      if (num === null || num === undefined || num === "") {
        return 0;
      }
      const number = Number(num);
      if (isNaN(number) || !isFinite(number)) {
        return 0;
      }
      const rounded = Number(number.toFixed(2));
      const integerPart = Math.floor(Math.abs(rounded));
      if (
        rounded !== 0 &&
        (Math.abs(rounded) < 0.0001 ||
          (Math.abs(rounded) >= 1e6 && integerPart === 0))
      ) {
        return rounded.toExponential(5);
      }
      return rounded;
    } catch (error) {
      console.error("Error in formatEmission:", error, "num:", num);
      return 0;
    }
  };

  // Fetch all buildings for dropdown
useEffect(() => {
    const fetchBuildings = async () => {
        try {
            const res = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/building/Get-All-Buildings?limit=1000`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                }
            );
            
            // Get buildings from response
            const buildings = res.data?.data?.buildings || [];
            
            // Sort buildings alphabetically by buildingName
            const sortedBuildings = [...buildings].sort((a, b) => {
                const nameA = (a.buildingName || '').toUpperCase();
                const nameB = (b.buildingName || '').toUpperCase();
                
                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
                return 0;
            });
            
            // Format sorted buildings for dropdown
            const formatted = sortedBuildings.map((b) => ({
                value: b._id,
                label: b.buildingName || 'Unnamed Building',
            }));
            
            setBuildingOptions(formatted);
        } catch {
            toast.error("Failed to load buildings");
        }
    };
    fetchBuildings();
}, []);

  // Fetch record by ID (Edit / View)
  useEffect(() => {
    const fetchById = async () => {
      if (!id || isAdd) return;
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/upstream/upstream/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = res.data?.data;

        // Set activity type options based on transportation category
        if (data.transportationCategory === "purchasedGoods") {
          setActivityTypeOptions(purchasedGoodsActivityOptions);

          // Set purchased goods type options based on activity type
          if (data.activityType) {
            const goodsOptions = purchasedGoodsTypeMapping[data.activityType] || [];
            setPurchasedGoodsTypeOptions(goodsOptions);
          }
        } else if (data.transportationCategory === "purchasedServices") {
          setActivityTypeOptions(purchasedServicesActivityOptions);
        }

        // Find the purchased goods type from the mapping
        let purchasedGoodsTypeValue = null;
        if (data.activityType && data.purchasedGoodsType) {
          const goodsOptions = purchasedGoodsTypeMapping[data.activityType] || [];
          purchasedGoodsTypeValue = goodsOptions.find(
            (option) => option.value === data.purchasedGoodsType
          ) || {
            label: data.purchasedGoodsType,
            value: data.purchasedGoodsType,
          };
        }

        setFormData({
          buildingId:
            buildingOptions.find((b) => b.value === data.buildingId?._id) || {
              label: data.buildingId?.buildingName || "",
              value: data.buildingId?._id || "",
            },
          stakeholderDepartment:
            stakeholderDepartmentOptions.find(
              (s) => s.value === data.stakeholderDepartment
            ) || {
              label: data.stakeholderDepartment,
              value: data.stakeholderDepartment,
            },
          transportationCategory:
            transportationCategoryOptions.find(
              (t) => t.value === data.transportationCategory
            ) || {
              label: data.transportationCategory,
              value: data.transportationCategory,
            },
          activityType:
            purchasedGoodsActivityOptions.find((a) => a.value === data.activityType) || {
              label: data.activityType,
              value: data.activityType,
            },
          purchasedGoodsType: purchasedGoodsTypeValue,
          vehicleCategory:
            vehicleCategoryOptions.find((v) => v.value === data.vehicleCategory) || {
              label: data.vehicleCategory,
              value: data.vehicleCategory,
            },
          vehicleType: data.vehicleType
            ? vehicleTypeOptions[data.vehicleCategory]?.find(v => v.value === data.vehicleType) || null
            : null,
          weightLoaded: data.weightLoaded || "",
          distanceTravelled: data.distanceTravelled || "",
          amountSpent: data.amountSpent || "",
          unit: "USD", // Always set to "USD" in form state
          qualityControl:
            processQualityControlOptions.find(
              (q) => q.value === data.qualityControl
            ) || { label: data.qualityControl, value: data.qualityControl },
          remarks: data.remarks || "",
          calculatedEmissionKgCo2e: data.calculatedEmissionKgCo2e || "",
          calculatedEmissionTCo2e: data.calculatedEmissionTCo2e || "",
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch record details");
      }
    };
    fetchById();
  }, [id, isAdd, buildingOptions]);

  // Handle dropdown changes
  const handleSelectChange = (value, { name }) => {
    if (isView) return;

    let updated = { ...formData, [name]: value };

    if (name === "transportationCategory") {
      // Reset dependent fields when category changes
      updated.activityType = null;
      updated.purchasedGoodsType = null;
      updated.vehicleCategory = null;
      updated.vehicleType = null;
      updated.weightLoaded = "";
      updated.distanceTravelled = "";
      updated.amountSpent = "";
      // Unit always remains "USD" in form state

      setPurchasedGoodsTypeOptions([]); // Clear purchased goods options

      // Set activity type options based on category
      if (value?.value === "purchasedGoods") {
        setActivityTypeOptions(purchasedGoodsActivityOptions);
      } else if (value?.value === "purchasedServices") {
        setActivityTypeOptions(purchasedServicesActivityOptions);
      }
    }

    if (name === "activityType") {
      // Reset purchased goods type when activity type changes
      updated.purchasedGoodsType = null;

      // Set purchased goods type options based on selected activity type
      if (value?.value) {
        const goodsOptions = purchasedGoodsTypeMapping[value.value] || [];
        setPurchasedGoodsTypeOptions(goodsOptions);
      } else {
        setPurchasedGoodsTypeOptions([]);
      }
    }

    if (name === "vehicleCategory") {
      // Reset vehicle type when category changes
      updated.vehicleType = null;
    }

    setFormData(updated);
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleInputChange = (e) => {
    if (isView) return;
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!formData.buildingId) newErrors.buildingId = "Building is required";
    if (!formData.stakeholderDepartment)
      newErrors.stakeholderDepartment = "Department is required";
    if (!formData.transportationCategory)
      newErrors.transportationCategory = "Transportation Category is required";
    if (!formData.activityType)
      newErrors.activityType = "Activity Type is required";

    // Validate based on category
    if (formData.transportationCategory?.value === "purchasedGoods") {
      // Only require purchasedGoodsType if activityType is selected AND there are options available
      if (formData.activityType) {
        const goodsOptions = purchasedGoodsTypeMapping[formData.activityType.value] || [];
        if (goodsOptions.length > 0 && !formData.purchasedGoodsType) {
          newErrors.purchasedGoodsType = "Purchased Goods Type is required";
        }
      }

      if (!formData.vehicleCategory) newErrors.vehicleCategory = "Vehicle Category is required";

      // Validate numeric fields
      if (!formData.weightLoaded) {
        newErrors.weightLoaded = "Weight Loaded is required";
      } else if (isNaN(parseFloat(formData.weightLoaded)) || parseFloat(formData.weightLoaded) <= 0) {
        newErrors.weightLoaded = "Weight Loaded must be a positive number";
      }

      if (!formData.distanceTravelled) {
        newErrors.distanceTravelled = "Distance Travelled is required";
      } else if (isNaN(parseFloat(formData.distanceTravelled)) || parseFloat(formData.distanceTravelled) <= 0) {
        newErrors.distanceTravelled = "Distance Travelled must be a positive number";
      }

    } else if (formData.transportationCategory?.value === "purchasedServices") {
      if (!formData.amountSpent) {
        newErrors.amountSpent = "Amount Spent is required";
      } else if (isNaN(parseFloat(formData.amountSpent)) || parseFloat(formData.amountSpent) <= 0) {
        newErrors.amountSpent = "Amount Spent must be a positive number";
      }
    }

    if (!formData.qualityControl)
      newErrors.qualityControl = "Quality Control is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView) return;
    if (!validate()) {
      toast.error("Please fill all required fields");
      return;
    }
    
    // Calculate emissions before submitting
    let calculatedEmissions = {};
    if (formData.transportationCategory?.value === "purchasedGoods") {
      calculatedEmissions = calculateUpstreamTransportationEmission({
        transportationCategory: "purchasedGoods",
        weightLoaded: parseFloat(formData.weightLoaded),
        distanceTravelled: parseFloat(formData.distanceTravelled),
        vehicleCategory: formData.vehicleCategory?.value,
        vehicleType: formData.vehicleType?.value,
      }) || {};
    } else if (formData.transportationCategory?.value === "purchasedServices") {
      calculatedEmissions = calculateUpstreamTransportationEmission({
        transportationCategory: "purchasedServices",
        amountSpent: parseFloat(formData.amountSpent),
        activityType: formData.activityType?.value,
        unit: "USD", // Always use "USD" for calculation
      }) || {};
    }

    // Create payload with all fields
    const payload = {
      buildingId: formData.buildingId?.value,
      stakeholderDepartment: formData.stakeholderDepartment?.value,
      transportationCategory: formData.transportationCategory?.value,
      activityType: formData.activityType?.value,
      purchasedGoodsType: formData.purchasedGoodsType?.value,
      vehicleCategory: formData.vehicleCategory?.value,
      vehicleType: formData.vehicleType?.value,
      weightLoaded: formData.weightLoaded,
      distanceTravelled: formData.distanceTravelled,
      amountSpent: formData.amountSpent,
      // Send "USD" only for purchasedServices, empty string for purchasedGoods
      unit: formData.transportationCategory?.value === "purchasedServices" ? "USD" : "",
      qualityControl: formData.qualityControl?.value,
      remarks: capitalizeFirstLetter(formData.remarks),
      calculatedEmissionKgCo2e: formatEmission(
        calculatedEmissions.calculatedEmissionKgCo2e
      ),
      calculatedEmissionTCo2e: formatEmission(
        calculatedEmissions.calculatedEmissionTCo2e
      ),
    };

    // Debug log to see what's being sent
    console.log("Payload being sent:", payload);

    try {
      if (isEdit) {
        await axios.put(
          `${process.env.REACT_APP_BASE_URL}/upstream/Update/${id}`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success("Record updated successfully!");
      } else {
        await axios.post(
          `${process.env.REACT_APP_BASE_URL}/upstream/Create`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success("Record added successfully!");
      }
      navigate("/Upstream-Transportation");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error saving record");
    }
  };

  // Helper to determine if vehicle type should be shown
  const shouldShowVehicleType = () => {
    const category = formData.vehicleCategory?.value;
    return category && ["freightFlights", "seaTanker", "cargoShip"].includes(category);
  };

  return (
    <div>
      <Card
        title={`${isView ? "View" : isEdit ? "Edit" : "Add"} Upstream Transportation and Distribution Records`}
      >
        <div className="text-slate-700 leading-relaxed mb-2 bg-gray-100 rounded-lg border-l-4 border-primary-400 p-2 pl-4 m-4 justify-center">
          <p className="text-gray-700">
            This category includes emissions from the transportation and distribution of products purchased by the reporting company, in <span className="font-semibold">vehicles and facilities not owned or controlled by the company.</span> It also covers <span className="font-semibold">third-party transportation and distribution</span> services <span className="font-semibold">purchased</span> by the reporting company in the reporting year, including inbound logistics, outbound logistics (e.g., of sold products) and transportation between the company's own facilities when performed by third-party logistics providers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Building */}
            <div>
              <label className="field-label">Site / Building Name</label>
              <Select
                name="buildingId"
                value={formData.buildingId}
                options={buildingOptions}
                onChange={handleSelectChange}
                placeholder="Select Building"
                isDisabled={isView}
              />
              {errors.buildingId && (
                <p className="text-red-500 text-sm mt-1">{errors.buildingId}</p>
              )}
            </div>

            {/* Department */}
            <div className="lg:col-span-2">
              <label className="field-label">Stakeholder / Department</label>
              <Select
                name="stakeholderDepartment"
                value={formData.stakeholderDepartment}
                options={stakeholderDepartmentOptions}
                onChange={handleSelectChange}
                placeholder="Select Stakeholder / Department"
                isDisabled={isView}
                allowCustomInput
              />
              {errors.stakeholderDepartment && (
                <p className="text-red-500 text-sm mt-1">{errors.stakeholderDepartment}</p>
              )}
            </div>

            {/* Transportation Category */}
            <div className="col-span-2">
              <label className="field-label">Transportation and Distribution Category</label>
              <Select
                name="transportationCategory"
                value={formData.transportationCategory}
                options={transportationCategoryOptions}
                onChange={handleSelectChange}
                placeholder="Select Category"
                isDisabled={isView}
              />
              {errors.transportationCategory && (
                <p className="text-red-500 text-sm mt-1">{errors.transportationCategory}</p>
              )}
            </div>

            {/* Activity Type */}
            <div>
              <label className="field-label">Purchased Product Activity Type</label>
              <Select
                name="activityType"
                value={formData.activityType}
                options={activityTypeOptions}
                onChange={handleSelectChange}
                placeholder="Select Activity Type"
                isDisabled={isView}
              />
              {errors.activityType && (
                <p className="text-red-500 text-sm mt-1">{errors.activityType}</p>
              )}
            </div>

            {/* Purchased Goods Type (only for purchasedGoods category) */}
            {formData.transportationCategory?.value === "purchasedGoods" && (
              <div>
                <div className="flex items-center gap-2">
                  <label className="field-label">Purchased Goods Type</label>
                  <Tippy
                    content="Select the specific type of goods based on the chosen activity type."
                    placement="top"
                  >
                    <button
                      type="button"
                      className="w-5 h-5 mb-1 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium hover:bg-blue-200 transition-colors"
                      aria-label="Information about purchased goods type"
                    >
                      i
                    </button>
                  </Tippy>
                </div>
                <Select
                  name="purchasedGoodsType"
                  value={formData.purchasedGoodsType}
                  options={purchasedGoodsTypeOptions}
                  onChange={handleSelectChange}
                  placeholder={formData.activityType ? `Select ${formData.activityType.label} Type` : "Select Goods Type"}
                  isDisabled={isView || !formData.activityType}
                  isClearable={true}
                />
                {errors.purchasedGoodsType && (
                  <p className="text-red-500 text-sm mt-1">{errors.purchasedGoodsType}</p>
                )}
                {formData.activityType && purchasedGoodsTypeOptions.length === 0 && (
                  <p className="text-gray-500 text-sm mt-1">No options available for this activity type</p>
                )}
              </div>
            )}

            {/* Vehicle Category (only for purchasedGoods category) */}
            {formData.transportationCategory?.value === "purchasedGoods" && (
              <div>
                <div className="flex items-center gap-2">
                  <label className="field-label">Transportation Vehicle Category</label>
                  <Tippy content="Please specify the vehicle category in which your purchased goods were transported / distributed."
                    placement="top">
                    <button
                      type="button"
                      className="w-5 h-5 mb-1 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium hover:bg-blue-200 transition-colors"
                      aria-label="Information about vehicle category">
                      i
                    </button>
                  </Tippy>
                </div>
                <Select
                  name="vehicleCategory"
                  value={formData.vehicleCategory}
                  options={vehicleCategoryOptions}
                  onChange={handleSelectChange}
                  placeholder="Select Vehicle Category"
                  isDisabled={isView}
                />
                {errors.vehicleCategory && (
                  <p className="text-red-500 text-sm mt-1">{errors.vehicleCategory}</p>
                )}
              </div>
            )}

            {/* Vehicle Type (only for specific categories) */}
            {formData.transportationCategory?.value === "purchasedGoods" && shouldShowVehicleType() && (
              <div>
                <div className="flex items-center gap-2">
                  <label className="field-label">Transportation Vehicle Type</label>
                  <Tippy content="Please specify the type of transportation vehicle used to deliver your purchased goods."
                    placement="top">
                    <button
                      type="button"
                      className="w-5 h-5 mb-1 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium hover:bg-blue-200 transition-colors"
                      aria-label="Information about vehicle category">
                      i
                    </button>
                  </Tippy>
                </div>
                <Select
                  name="vehicleType"
                  value={formData.vehicleType}
                  options={vehicleTypeOptions[formData.vehicleCategory?.value] || []}
                  onChange={handleSelectChange}
                  placeholder="Select Vehicle Type"
                  isDisabled={isView}
                />
                {errors.vehicleType && (
                  <p className="text-red-500 text-sm mt-1">{errors.vehicleType}</p>
                )}
              </div>
            )}

            {/* Weight Loaded (only for purchasedGoods category) */}
            {formData.transportationCategory?.value === "purchasedGoods" && (
              <div>
                <div className="flex items-center gap-2">
                  <label className="field-label">Weight Loaded</label>
                  <Tippy content="Please specify the total weight of the purchased goods."
                    placement="top">
                    <button
                      type="button"
                      className="w-5 h-5 mb-1 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium hover:bg-blue-200 transition-colors"
                      aria-label="Information about vehicle category">
                      i
                    </button>
                  </Tippy>
                </div>
                <div className="flex">
                  <InputGroup
                    type="number"
                    name="weightLoaded"
                    value={formData.weightLoaded}
                    onChange={handleInputChange}
                    placeholder="Enter Value"
                    className="input-field rounded-r-none"
                    disabled={isView}
                  />
                  <div className="flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-100">
                    tonnes
                  </div>
                </div>
                {errors.weightLoaded && (
                  <p className="text-red-500 text-sm mt-1">{errors.weightLoaded}</p>
                )}
              </div>
            )}

            {/* Distance Travelled (only for purchasedGoods category) */}
            {formData.transportationCategory?.value === "purchasedGoods" && (
              <div>
                <div className="flex items-center gap-2">
                  <label className="field-label">Distance Travelled</label>
                  <Tippy content="Please specify the distance travelled by the vehicle to transport / distribute your purchased goods."
                    placement="top">
                    <button
                      type="button"
                      className="w-5 h-5 mb-1 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium hover:bg-blue-200 transition-colors"
                      aria-label="Information about vehicle category">
                      i
                    </button>
                  </Tippy>
                </div>
                <div className="flex">
                  <InputGroup
                    type="number"
                    name="distanceTravelled"
                    value={formData.distanceTravelled}
                    onChange={handleInputChange}
                    placeholder="e.g., 1000"
                    className="input-field rounded-r-none"
                    disabled={isView}
                  />
                  <div className="flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-100">
                    km
                  </div>
                </div>
                {errors.distanceTravelled && (
                  <p className="text-red-500 text-sm mt-1">{errors.distanceTravelled}</p>
                )}
              </div>
            )}

            {/* Amount Spent (only for purchasedServices category) - WITH $ SUFFIX */}
            {formData.transportationCategory?.value === "purchasedServices" && (
              <div>
                <div className="flex items-center gap-2">
                  <label className="field-label">Amount Spent</label>
                  <Tippy content="Please specify the amount spent on third-party transportation and distribution services."
                    placement="top">
                    <button
                      type="button"
                      className="w-5 h-5 mb-1 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium hover:bg-blue-200 transition-colors"
                      aria-label="Information about vehicle category">
                      i
                    </button>
                  </Tippy>
                </div>
                <div className="flex">
                  <InputGroup
                    type="number"
                    name="amountSpent"
                    value={formData.amountSpent}
                    onChange={handleInputChange}
                    placeholder="Enter Value"
                    className="input-field rounded-r-none"
                    disabled={isView}
                  />
                  <div className="flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-100">
                    $
                  </div>
                </div>
                {errors.amountSpent && (
                  <p className="text-red-500 text-sm mt-1">{errors.amountSpent}</p>
                )}
                {/* Hidden field to store unit - always USD */}
                <input type="hidden" name="unit" value="USD" />
              </div>
            )}

            {/* Quality Control */}
            <div>
              <label className="field-label">Quality Control</label>
              <Select
                name="qualityControl"
                value={formData.qualityControl}
                options={processQualityControlOptions}
                onChange={handleSelectChange}
                placeholder="Select Quality"
                isDisabled={isView}
              />
              {errors.qualityControl && (
                <p className="text-red-500 text-sm mt-1">{errors.qualityControl}</p>
              )}
            </div>

          </div>

          {/* Remarks */}
          <div>
            <label className="field-label">Remarks</label>
            <InputGroup
              type="textarea"
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter Remarks"
              className="border-[2px] border-gray-400 rounded-md"
              disabled={isView}
            />
          </div>

          {/* Buttons */}
          <div className="col-span-full flex justify-end gap-4 pt-6">
            <Button
              text={isView ? "Back" : "Cancel"}
              className={isView ? "btn-primary" : "btn-light"}
              type="button"
              onClick={() => navigate("/Upstream-Transportation")}
            />
            {!isView && (
              <Button
                text={isEdit ? "Update" : "Add"}
                className="btn-primary"
                type="submit"
              />
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UpstreamTransportationFormPage;