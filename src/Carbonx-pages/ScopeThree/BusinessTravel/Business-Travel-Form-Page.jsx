// import React, { useState, useEffect } from "react";
// import Card from "@/components/ui/Card";
// import Button from "@/components/ui/Button";
// import Select from "@/components/ui/Select";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { useNavigate, useParams, useLocation } from "react-router-dom";
// import {
//   travelClassOptions,
//   flightTypeOptions,
//   motorbikeTypeOptions,
//   taxiTypeOptions,
//   busTypeOptions,
//   trainTypeOptions,
//   carTypeOptions,
//   carFuelTypeOptions,
// } from "@/constant/scope3/businessTravel";
// import {
//   stakeholderDepartmentOptions,
//   processQualityControlOptions,
// } from "@/constant/scope1/options";
// import ToggleButton from "@/components/ui/ToggleButton";
// import { calculateBusinessTravel } from "@/utils/Scope3/calculateBusinessTravel";


// const BusinessTravelFormPage = () => {
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const location = useLocation();

//   const mode = location.state?.mode || "add";
//   const isView = mode === "view";
//   const isEdit = mode === "edit";
//   const isAdd = mode === "add";

//   const [buildingOptions, setBuildingOptions] = useState([]);

//   const [calculatedEmissionKgCo2e, setCalculatedEmissionKgCo2e] = useState(0);
//   const [calculatedEmissionTCo2e, setCalculatedEmissionTCo2e] = useState(0);

//   const [formData, setFormData] = useState({
//     buildingId: null,
//     stakeholder: null,
//     qualityControl: null,

//     travelByAir: false,
//     travelByMotorbike: false,
//     travelByTaxi: false,
//     travelByBus: false,
//     travelByTrain: false,
//     travelByCar: false,
//     hotelStay: false,

//     airPassengers: "",
//     airDistanceKm: "",
//     airTravelClass: null,
//     airFlightType: null,

//     motorbikeDistanceKm: "",
//     motorbikeType: null,

//     taxiPassengers: "",
//     taxiDistanceKm: "",
//     taxiType: null,

//     busPassengers: "",
//     busDistanceKm: "",
//     busType: null,

//     trainPassengers: "",
//     trainDistanceKm: "",
//     trainType: null,

//     carDistanceKm: "",
//     carType: null,
//     carFuelType: null,

//     hotelRooms: "",
//     hotelNights: "",

//     remarks: "",
//   });

//   /* 
//       CALCULATION WRAPPER
//    */
//  const recalculateEmissions = (data) => {
//   try {
//     const result = calculateBusinessTravel(data);

//     // Use the correct property names from the calculation result
//     setCalculatedEmissionKgCo2e(result?.totalEmissions_KgCo2e || 0);
//     setCalculatedEmissionTCo2e(result?.totalEmissions_TCo2e || 0);
//   } catch (err) {
//     console.error("Calculation error", err);
//   }
// };
//   useEffect(() => {
//     recalculateEmissions(formData);
//   }, [formData]);
//   /* 
//      INPUT HANDLERS
//    */
//   const handleChange = (e) => {
//     if (isView) return;

//     const { name, value } = e.target;

//     if (Number(value) < 0) {
//       toast.error("Negative values are not allowed");
//       return;
//     }

//     const updated = { ...formData, [name]: value };
//     setFormData(updated);
//     recalculateEmissions(updated);
//   };

//   const handleSelectChange = (value, { name }) => {
//     if (isView) return;

//     // Store only the string value
//     const stringValue = value?.value || null;

//     const updated = { ...formData, [name]: stringValue };
//     setFormData(updated);
//     recalculateEmissions(updated);
//   };
//   const selectedCarType = formData.carType?.value;

//   const fuelOptions =
//     carFuelTypeOptions?.[selectedCarType]?.map((fuel) => ({
//       value: fuel,
//       label: fuel,
//     })) || [];

//   const handleToggle = (name) => {
//     if (isView) return;

//     setFormData((prev) => {
//       const updated = { ...prev, [name]: !prev[name] };

//       if (prev[name]) {
//         if (name === "travelByAir") {
//           updated.airPassengers = "";
//           updated.airDistanceKm = "";
//           updated.airTravelClass = null;
//           updated.airFlightType = null;
//         }
//         if (name === "travelByMotorbike") {
//           updated.motorbikeDistanceKm = "";
//           updated.motorbikeType = null;
//         }
//         if (name === "travelByTaxi") {
//           updated.taxiPassengers = "";
//           updated.taxiDistanceKm = "";
//           updated.taxiType = null;
//         }
//         if (name === "travelByBus") {
//           updated.busPassengers = "";
//           updated.busDistanceKm = "";
//           updated.busType = null;
//         }
//         if (name === "travelByTrain") {
//           updated.trainPassengers = "";
//           updated.trainDistanceKm = "";
//           updated.trainType = null;
//         }
//         if (name === "travelByCar") {
//           updated.carDistanceKm = "";
//           updated.carType = null;
//           updated.carFuelType = null;
//         }
//         if (name === "hotelStay") {
//           updated.hotelRooms = "";
//           updated.hotelNights = "";
//         }
//       }

//       recalculateEmissions(updated);
//       return updated;
//     });
//   };

//   /* 
//      FETCH BUILDINGS
//    */

//   useEffect(() => {
//     const fetchBuildings = async () => {
//       try {
//         const res = await axios.get(
//           `${process.env.REACT_APP_BASE_URL}/building/Get-All-Buildings?limit=1000`,
//           { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
//         );

//         setBuildingOptions(
//           res.data?.data?.buildings?.map((b) => ({
//             value: b._id,
//             label: b.buildingName,
//           }))
//         );
//       } catch {
//         toast.error("Failed to load buildings");
//       }
//     };

//     fetchBuildings();
//   }, []);
// useEffect(() => {
//   const fetchBusinessTravelById = async () => {
//     if (!isEdit) return; // Only fetch in edit mode

//     try {
//       const res = await axios.get(
//         `${process.env.REACT_APP_BASE_URL}/Business-Travel/Detail/${id}`,
//         { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
//       );

//       const data = res.data?.data;
//       if (!data) return;

//       // Transform API data to match your formData structure
//       const updatedFormData = {
//         buildingId: data.buildingId
//           ? { value: data.buildingId._id, label: data.buildingId.buildingName }
//           : null,
//         stakeholder: data.stakeholder
//           ? { value: data.stakeholder, label: data.stakeholder }
//           : null,
//         qualityControl: data.qualityControl
//           ? { value: data.qualityControl, label: data.qualityControl }
//           : null,

//         travelByAir: data.travelByAir || false,
//         travelByMotorbike: data.travelByMotorbike || false,
//         travelByTaxi: data.travelByTaxi || false,
//         travelByBus: data.travelByBus || false,
//         travelByTrain: data.travelByTrain || false,
//         travelByCar: data.travelByCar || false,
//         hotelStay: data.hotelStay || false,

//         airPassengers: data.airPassengers || "",
//         airDistanceKm: data.airDistanceKm || "",
//         airTravelClass: data.airTravelClass
//           ? { value: data.airTravelClass, label: data.airTravelClass }
//           : null,
//         airFlightType: data.airFlightType
//           ? { value: data.airFlightType, label: data.airFlightType }
//           : null,

//         motorbikeDistanceKm: data.motorbikeDistanceKm || "",
//         motorbikeType: data.motorbikeType
//           ? { value: data.motorbikeType, label: data.motorbikeType }
//           : null,

//         taxiPassengers: data.taxiPassengers || "",
//         taxiDistanceKm: data.taxiDistanceKm || "",
//         taxiType: data.taxiType
//           ? { value: data.taxiType, label: data.taxiType }
//           : null,

//         busPassengers: data.busPassengers || "",
//         busDistanceKm: data.busDistanceKm || "",
//         busType: data.busType
//           ? { value: data.busType, label: data.busType }
//           : null,

//         trainPassengers: data.trainPassengers || "",
//         trainDistanceKm: data.trainDistanceKm || "",
//         trainType: data.trainType
//           ? { value: data.trainType, label: data.trainType }
//           : null,

//         carDistanceKm: data.carDistanceKm || "",
//         carType: data.carType
//           ? { value: data.carType, label: data.carType }
//           : null,
//         carFuelType: data.carFuelType
//           ? { value: data.carFuelType, label: data.carFuelType }
//           : null,

//         hotelRooms: data.hotelRooms || "",
//         hotelNights: data.hotelNights || "",

//         remarks: data.remarks || "",
//       };

//       setFormData(updatedFormData);
//       recalculateEmissions(updatedFormData);
//     } catch (err) {
//       toast.error("Failed to fetch record");
//       console.error(err);
//     }
//   };

//   fetchBusinessTravelById();
// }, [id, isEdit]);

//   /* 
//      VALIDATION
//    */
//   const validate = () => {
//     if (!formData.buildingId || !formData.stakeholder || !formData.qualityControl) {
//       toast.error("Please fill all required fields");
//       return false;
//     }

//     const anyToggle =
//       formData.travelByAir ||
//       formData.travelByMotorbike ||
//       formData.travelByTaxi ||
//       formData.travelByBus ||
//       formData.travelByTrain ||
//       formData.travelByCar ||
//       formData.hotelStay;

//     if (!anyToggle) {
//       toast.error("Please select at least one travel option");
//       return false;
//     }

//     return true;
//   };

//   /* 
//      SUBMIT
//    */
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validate()) return;

//     recalculateEmissions(formData);

//     toast.success(
//       `Total Emissions: ${calculatedEmissionKgCo2e.toFixed(2)} Kg CO₂e`
//     );

//     const payload = {
//       ...formData,
//       buildingId: formData.buildingId.value,
//       stakeholder: formData.stakeholder.value,
//       qualityControl: formData.qualityControl.value,

//       carType: formData.carType?.value || null,
//       carFuelType: formData.carFuelType?.value || null,
//       airTravelClass: formData.airTravelClass?.value || null,
//       airFlightType: formData.airFlightType?.value || null,

//       totalEmissions_KgCo2e: calculatedEmissionKgCo2e,
//       totalEmissions_TCo2e: calculatedEmissionTCo2e,
//     };

//     try {
//       if (isEdit) {
//         await axios.put(
//           `${process.env.REACT_APP_BASE_URL}/Business-Travel/Update/${id}`,
//           payload,
//           { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
//         );
//         toast.success("Record updated successfully");
//       } else {
//         await axios.post(
//           `${process.env.REACT_APP_BASE_URL}/Business-Travel/Create`,
//           payload,
//           { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
//         );
//         toast.success("Record added successfully");
//       }
//       navigate("/Business-Travel");
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Error saving record");
//     }
//   };
//   return (
//     <div>
//       <Card title={`${isView ? "View" : isEdit ? "Edit" : "Add"} Business Travel Record`}>
//         <form onSubmit={handleSubmit} className="p-6 grid gap-6">
//           <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-4">
//             {/* 1. Building */}
//             <div>
//               <label className="field-label">Site / Building</label>
//               <Select
//                 name="buildingId"
//                 value={buildingOptions.find(opt => opt.value === formData.buildingId) || null}
//                 options={buildingOptions}
//                 onChange={handleSelectChange}
//                 placeholder="Select Building"
//                 isDisabled={isView}
//               />
//             </div>

//             {/* 2. Stakeholder */}
//             <div>
//               <label className="field-label">Stakeholder</label>
//               <Select
//                 name="stakeholder"
//                 value={stakeholderDepartmentOptions.find(opt => opt.value === formData.stakeholder) || null}
//                 options={stakeholderDepartmentOptions}
//                 onChange={handleSelectChange}
//                 isDisabled={isView}
//               />
//             </div>

//             {/* Quality Control */}
//             <div>
//               <label className="field-label">Quality Control</label>
//               <Select
//                 name="qualityControl"
//                 value={processQualityControlOptions.find(opt => opt.value === formData.qualityControl) || null}
//                 options={processQualityControlOptions}
//                 onChange={handleSelectChange}
//                 isDisabled={isView}
//               />
//             </div>
//           </div>
//           {/* 3. Air Travel Toggle & Fields */}
//           <div className="border-b pb-4">
//             <ToggleButton
//               label="Did you travel by Air?"
//               checked={formData.travelByAir}
//               onChange={() => handleToggle("travelByAir")}
//               disabled={isView}
//             />

//             {formData.travelByAir && (
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
//                 <input
//                   type="number"
//                   name="airPassengers"
//                   value={formData.airPassengers}
//                   onChange={handleChange}
//                   placeholder="Number of Passengers"
//                   className="input-field"
//                 />

//                 <input
//                   type="number"
//                   name="airDistanceKm"
//                   value={formData.airDistanceKm}
//                   onChange={handleChange}
//                   placeholder="Distance (km)"
//                   className="input-field"
//                 />

//                 <Select
//                   name="airTravelClass"
//                   value={travelClassOptions.find(opt => opt.value === formData.airTravelClass) || null}
//                   options={travelClassOptions}
//                   onChange={handleSelectChange}
//                   placeholder="Travel Class"
//                 />

//                 <Select
//                   name="airFlightType"
//                   value={flightTypeOptions.find(opt => opt.value === formData.airFlightType) || null}
//                   options={flightTypeOptions}
//                   onChange={handleSelectChange}
//                   placeholder="Flight Type"
//                 />
//               </div>
//             )}
//           </div>

//           {/* 4. Motorbike */}
//           <div className="border-b pb-4">
//             <ToggleButton
//               label="Business travel by Motorbike?"
//               checked={formData.travelByMotorbike}
//               onChange={() => handleToggle("travelByMotorbike")}
//               disabled={isView}
//             />

//             {formData.travelByMotorbike && (
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
//                 <input
//                   type="number"
//                   name="motorbikeDistanceKm"
//                   value={formData.motorbikeDistanceKm}
//                   onChange={handleChange}
//                   placeholder="Distance (km)"
//                   className="input-field"
//                 />

//                 <Select
//                   name="motorbikeType"
//                   value={motorbikeTypeOptions.find(opt => opt.value === formData.motorbikeType) || null}
//                   options={motorbikeTypeOptions}
//                   onChange={handleSelectChange}
//                   placeholder="Motorbike Type"
//                 />
//               </div>
//             )}
//           </div>

//           {/* 5. Taxi */}
//           <div className="border-b pb-4">
//             <ToggleButton
//               label="Business travel by Taxi?"
//               checked={formData.travelByTaxi}
//               onChange={() => handleToggle("travelByTaxi")}
//               disabled={isView}
//             />
//             {formData.travelByTaxi && (
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
//                 <input
//                   type="number"
//                   name="taxiPassengers"
//                   value={formData.taxiPassengers}
//                   onChange={handleChange}
//                   placeholder="Number of Passengers"
//                   className="input-field"
//                 />

//                 <input
//                   type="number"
//                   name="taxiDistanceKm"
//                   value={formData.taxiDistanceKm}
//                   onChange={handleChange}
//                   placeholder="Distance (km)"
//                   className="input-field"
//                 />

//                 <Select
//                   name="taxiType"
//                   value={
//                     formData.taxiType
//                       ? { value: formData.taxiType, label: formData.taxiType }
//                       : null
//                   }
//                   options={taxiTypeOptions}
//                   onChange={handleSelectChange}
//                   placeholder="Taxi Type"
//                 />
//               </div>
//             )}
//           </div>

//           {/* 6. Bus */}
//           <div className="border-b pb-4">
//             <ToggleButton
//               label="Business travel by Bus?"
//               checked={formData.travelByBus}
//               onChange={() => handleToggle("travelByBus")}
//               disabled={isView}
//             />
//             {formData.travelByBus && (
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
//                 <input
//                   type="number"
//                   name="busPassengers"
//                   value={formData.busPassengers}
//                   onChange={handleChange}
//                   placeholder="Passengers"
//                   className="input-field"
//                 />

//                 <input
//                   type="number"
//                   name="busDistanceKm"
//                   value={formData.busDistanceKm}
//                   onChange={handleChange}
//                   placeholder="Distance (km)"
//                   className="input-field"
//                 />

//                 <Select
//                   name="busType"
//                   value={
//                     formData.busType
//                       ? { value: formData.busType, label: formData.busType }
//                       : null
//                   }
//                   options={busTypeOptions}
//                   onChange={handleSelectChange}
//                   placeholder="Bus Type"
//                 />
//               </div>
//             )}
//           </div>

//           {/* 7. Train */}
//           <div className="border-b pb-4">
//             <ToggleButton
//               label="Business travel by train?"
//               checked={formData.travelByTrain}
//               onChange={() => handleToggle("travelByTrain")}
//               disabled={isView}
//             />

//             {formData.travelByTrain && (
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
//                 <input
//                   type="number"
//                   name="trainPassengers"
//                   value={formData.trainPassengers}
//                   onChange={handleChange}
//                   placeholder="Passengers"
//                   className="input-field"
//                 />

//                 <input
//                   type="number"
//                   name="trainDistanceKm"
//                   value={formData.trainDistanceKm}
//                   onChange={handleChange}
//                   placeholder="Distance (km)"
//                   className="input-field"
//                 />

//                 <Select
//                   name="trainType"
//                   value={
//                     formData.trainType
//                       ? { value: formData.trainType, label: formData.trainType }
//                       : null
//                   }
//                   options={trainTypeOptions}
//                   onChange={handleSelectChange}
//                   placeholder="Train Type"
//                 />
//               </div>
//             )}
//           </div>

//           {/* 8. Car */}

//   <div className="border-b pb-4">
//             <ToggleButton
//               label="Business travel by car?"
//               checked={formData.travelByCar}
//               onChange={() => handleToggle("travelByCar")}
//               disabled={isView}
//             />

//             {formData.travelByCar && (
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">

//                 <input
//                   type="number"
//                   name="carDistanceKm"
//                   value={formData.carDistanceKm}
//                   onChange={handleChange}
//                   placeholder="Distance (km)"
//                   className="input-field"
//                 />
//                 <div className="col-span-2">
//                   <Select
//                     label="Car Type"
//                     options={carTypeOptions}
//                     value={formData.carType}
//                     onChange={(value) => {
//                       setFormData({
//                         ...formData,
//                         carType: value,
//                         carFuelType: null, // reset fuel type
//                       });
//                     }}
//                   />
//                 </div>
//                 <Select
//                   label="Fuel Type"
//                   options={fuelOptions ?? []}
//                   value={formData.carFuelType}
//                   disabled={!formData.carType}
//                   placeholder={
//                     formData.carType ? "Select fuel type" : "Select car type first"
//                   }
//                   onChange={(value) =>
//                     setFormData({
//                       ...formData,
//                       carFuelType: value,
//                     })
//                   }
//                 />

//               </div>
//             )}
//           </div>
//           {/* 9. Hotel Stay */}
//           <div className="border-b pb-4">
//             <ToggleButton
//               label="Any Hotel stay?"
//               checked={formData.hotelStay}
//               onChange={() => handleToggle("hotelStay")}
//               disabled={isView}
//             />

//             {formData.hotelStay && (
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
//                 <input
//                   type="number"
//                   name="hotelRooms"
//                   value={formData.hotelRooms}
//                   onChange={handleChange}
//                   placeholder="Number of Rooms"
//                   className="input-field"
//                 />

//                 <input
//                   type="number"
//                   name="hotelNights"
//                   value={formData.hotelNights}
//                   onChange={handleChange}
//                   placeholder="Nights Stayed"
//                   className="input-field"
//                 />
//               </div>
//             )}
//           </div>

//           {/* Remarks */}
//           <div>
//             <label className="field-label">Remarks</label>
//             <textarea
//               name="remarks"
//               value={formData.remarks}
//               onChange={handleChange}
//               rows={3}
//               className="input-field"
//               disabled={isView}
//             />
//           </div>

//           <div className="flex justify-end gap-4">
//             <Button text="Cancel" className="btn-light" onClick={() => navigate("/Business-Travel")} />
//             {!isView && <Button text={isEdit ? "Update" : "Add"} className="btn-primary" type="submit" />}
//           </div>
//         </form>
//       </Card>
//     </div>
//   );
// };

// export default BusinessTravelFormPage;

import React, { useState, useEffect, useCallback } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  travelClassOptions,
  flightTypeOptions,
  motorbikeTypeOptions,
  taxiTypeOptions,
  busTypeOptions,
  trainTypeOptions,
  carTypeOptions,
  carFuelTypeOptions,
} from "@/constant/scope3/businessTravel";
import {
  stakeholderDepartmentOptions,
  processQualityControlOptions,
} from "@/constant/scope1/options";
import ToggleButton from "@/components/ui/ToggleButton";
import { calculateBusinessTravel } from "@/utils/Scope3/calculateBusinessTravel";

const BusinessTravelFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const mode = location.state?.mode || "add";
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const [buildingOptions, setBuildingOptions] = useState([]);

  const [calculatedEmissionKgCo2e, setCalculatedEmissionKgCo2e] = useState(0);
  const [calculatedEmissionTCo2e, setCalculatedEmissionTCo2e] = useState(0);

  const [formData, setFormData] = useState({
    buildingId: "",
    stakeholder: "",
    qualityControl: "",

    travelByAir: false,
    travelByMotorbike: false,
    travelByTaxi: false,
    travelByBus: false,
    travelByTrain: false,
    travelByCar: false,
    hotelStay: false,

    airPassengers: "",
    airDistanceKm: "",
    airTravelClass: "",
    airFlightType: "",

    motorbikeDistanceKm: "",
    motorbikeType: "",

    taxiPassengers: "",
    taxiDistanceKm: "",
    taxiType: "",

    busPassengers: "",
    busDistanceKm: "",
    busType: "",

    trainPassengers: "",
    trainDistanceKm: "",
    trainType: "",

    carDistanceKm: "",
    carType: "",
    carFuelType: "",

    hotelRooms: "",
    hotelNights: "",

    remarks: "",
  });

  /* 
      CALCULATION WRAPPER
   */
const recalculateEmissions = useCallback((data) => {
  try {
    const result = calculateBusinessTravel(data);

    // Use the correct property names from the calculation result
    setCalculatedEmissionKgCo2e(result?.totalEmissions_KgCo2e || 0);
    setCalculatedEmissionTCo2e(result?.totalEmissions_TCo2e || 0);
    
    return result; // Return the result so we can use it immediately
  } catch (err) {
    console.error("Calculation error", err);
    return null;
  }
}, []);

  useEffect(() => {
    recalculateEmissions(formData);
  }, [formData]);


  const handleChange = (e) => {
    if (isView) return;

    const { name, value } = e.target;

    if (Number(value) < 0) {
      toast.error("Negative values are not allowed");
      return;
    }

    const updated = { ...formData, [name]: value };
    setFormData(updated);
    recalculateEmissions(updated);
  };

  const handleSelectChange = (selectedOption, { name }) => {
    if (isView) return;

    // Store only the string value from the selected option
    const stringValue = selectedOption ? selectedOption.value : "";

    const updated = { ...formData, [name]: stringValue };
    setFormData(updated);
    recalculateEmissions(updated);
  };

  // Special handler for carType since it affects carFuelType
  const handleCarTypeChange = (selectedOption) => {
    if (isView) return;
    const stringValue = selectedOption ? selectedOption.value : "";
    setFormData(prev => ({
      ...prev,
      carType: stringValue,
      carFuelType: "" 
    }));
    
    setTimeout(() => {
      recalculateEmissions({
        ...formData,
        carType: stringValue,
        carFuelType: ""
      });
    }, 0);
  };

  const handleCarFuelTypeChange = (selectedOption) => {
    if (isView) return;

    const stringValue = selectedOption ? selectedOption.value : "";
    const updated = { ...formData, carFuelType: stringValue };
    setFormData(updated);
    recalculateEmissions(updated);
  };

  const handleToggle = (name) => {
    if (isView) return;

    setFormData((prev) => {
      const updated = { ...prev, [name]: !prev[name] };

      if (prev[name]) {
        if (name === "travelByAir") {
          updated.airPassengers = "";
          updated.airDistanceKm = "";
          updated.airTravelClass = "";
          updated.airFlightType = "";
        }
        if (name === "travelByMotorbike") {
          updated.motorbikeDistanceKm = "";
          updated.motorbikeType = "";
        }
        if (name === "travelByTaxi") {
          updated.taxiPassengers = "";
          updated.taxiDistanceKm = "";
          updated.taxiType = "";
        }
        if (name === "travelByBus") {
          updated.busPassengers = "";
          updated.busDistanceKm = "";
          updated.busType = "";
        }
        if (name === "travelByTrain") {
          updated.trainPassengers = "";
          updated.trainDistanceKm = "";
          updated.trainType = "";
        }
        if (name === "travelByCar") {
          updated.carDistanceKm = "";
          updated.carType = "";
          updated.carFuelType = "";
        }
        if (name === "hotelStay") {
          updated.hotelRooms = "";
          updated.hotelNights = "";
        }
      }

      recalculateEmissions(updated);
      return updated;
    });
  };

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/building/Get-All-Buildings?limit=1000`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        setBuildingOptions(
          res.data?.data?.buildings?.map((b) => ({
            value: b._id,
            label: b.buildingName,
          }))
        );
      } catch {
        toast.error("Failed to load buildings");
      }
    };

    fetchBuildings();
  }, []);

  useEffect(() => {
    const fetchBusinessTravelById = async () => {
      if (!isEdit && !isView) return; 
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/Business-Travel/Detail/${id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        const data = res.data?.data;
        if (!data) return;
        // Transform API data to match your formData structure - store only string values
        const updatedFormData = {
          buildingId: data.buildingId?._id || data.buildingId || "",
          stakeholder: data.stakeholder || "",
          qualityControl: data.qualityControl || "",

          travelByAir: data.travelByAir || false,
          travelByMotorbike: data.travelByMotorbike || false,
          travelByTaxi: data.travelByTaxi || false,
          travelByBus: data.travelByBus || false,
          travelByTrain: data.travelByTrain || false,
          travelByCar: data.travelByCar || false,
          hotelStay: data.hotelStay || false,

          airPassengers: data.airPassengers || "",
          airDistanceKm: data.airDistanceKm || "",
          airTravelClass: data.airTravelClass || "",
          airFlightType: data.airFlightType || "",

          motorbikeDistanceKm: data.motorbikeDistanceKm || "",
          motorbikeType: data.motorbikeType || "",

          taxiPassengers: data.taxiPassengers || "",
          taxiDistanceKm: data.taxiDistanceKm || "",
          taxiType: data.taxiType || "",

          busPassengers: data.busPassengers || "",
          busDistanceKm: data.busDistanceKm || "",
          busType: data.busType || "",

          trainPassengers: data.trainPassengers || "",
          trainDistanceKm: data.trainDistanceKm || "",
          trainType: data.trainType || "",

          carDistanceKm: data.carDistanceKm || "",
          carType: data.carType || "",
          carFuelType: data.carFuelType || "",

          hotelRooms: data.hotelRooms || "",
          hotelNights: data.hotelNights || "",

          remarks: data.remarks || "",
        };

        setFormData(updatedFormData);
        recalculateEmissions(updatedFormData);
      } catch (err) {
        toast.error("Failed to fetch record");
        console.error(err);
      }
    };

    if (id) {
      fetchBusinessTravelById();
    }
  }, [id, isEdit, isView]);

  const validate = () => {
    if (!formData.buildingId || !formData.stakeholder || !formData.qualityControl) {
      toast.error("Please fill all required fields");
      return false;
    }

    const anyToggle =
      formData.travelByAir ||
      formData.travelByMotorbike ||
      formData.travelByTaxi ||
      formData.travelByBus ||
      formData.travelByTrain ||
      formData.travelByCar ||
      formData.hotelStay;

    if (!anyToggle) {
      toast.error("Please select at least one travel option");
      return false;
    }

    return true;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  // First, recalculate emissions to get the latest values
  const latestResult = calculateBusinessTravel(formData);
  const latestKgCo2e = latestResult?.totalEmissions_KgCo2e || 0;
  const latestTCo2e = latestResult?.totalEmissions_TCo2e || 0;

  // Update state immediately
  setCalculatedEmissionKgCo2e(latestKgCo2e);
  setCalculatedEmissionTCo2e(latestTCo2e);

  const payload = {
    ...formData,
     calculatedEmissionKgCo2e: latestKgCo2e,  // CHANGED HERE
    calculatedEmissionTCo2e: latestTCo2e,
  };

  console.log("Submitting payload:", payload);

  try {
    if (isEdit) {
      await axios.put(
        `${process.env.REACT_APP_BASE_URL}/Business-Travel/Update/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success("Record updated successfully");
    } else {
      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/Business-Travel/Create`,
        payload,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success("Record added successfully");
    }
    navigate("/Business-Travel");
  } catch (err) {
    toast.error(err.response?.data?.message || "Error saving record");
    console.error("Submission error:", err);
  }
};

  // Helper function to find the current option for Select components
  const findOptionByValue = (options, value) => {
    return options.find(option => option.value === value) || null;
  };

  // Get fuel options based on selected car type
  const fuelOptions = formData.carType && carFuelTypeOptions[formData.carType] 
    ? carFuelTypeOptions[formData.carType].map(fuel => ({ value: fuel, label: fuel }))
    : [];

  return (
    <div>
      <Card title={`${isView ? "View" : isEdit ? "Edit" : "Add"} Business Travel Record`}>
        <form onSubmit={handleSubmit} className="p-6 grid gap-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-4">
            {/* 1. Building */}
            <div>
              <label className="field-label">Site / Building</label>
              <Select
                name="buildingId"
                value={findOptionByValue(buildingOptions, formData.buildingId)}
                options={buildingOptions}
                onChange={handleSelectChange}
                placeholder="Select Building"
                isDisabled={isView}
              />
            </div>

            {/* 2. Stakeholder */}
            <div>
              <label className="field-label">Stakeholder</label>
              <Select
                name="stakeholder"
                value={findOptionByValue(stakeholderDepartmentOptions, formData.stakeholder)}
                options={stakeholderDepartmentOptions}
                onChange={handleSelectChange}
                isDisabled={isView}
              />
            </div>

            {/* Quality Control */}
            <div>
              <label className="field-label">Quality Control</label>
              <Select
                name="qualityControl"
                value={findOptionByValue(processQualityControlOptions, formData.qualityControl)}
                options={processQualityControlOptions}
                onChange={handleSelectChange}
                isDisabled={isView}
              />
            </div>
          </div>

          {/* 3. Air Travel Toggle & Fields */}
          <div className="border-b pb-4">
            <ToggleButton
              label="Did you have any business travel by air during the reporting period?"
              checked={formData.travelByAir}
              onChange={() => handleToggle("travelByAir")}
              disabled={isView}
            />

            {formData.travelByAir && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <input
                  type="number"
                  name="airPassengers"
                  value={formData.airPassengers}
                  onChange={handleChange}
                  placeholder="Number of Passengers"
                  className="input-field"
                  disabled={isView}
                />

                <input
                  type="number"
                  name="airDistanceKm"
                  value={formData.airDistanceKm}
                  onChange={handleChange}
                  placeholder="Distance (km)"
                  className="input-field"
                  disabled={isView}
                />

                <Select
                  name="airTravelClass"
                  value={findOptionByValue(travelClassOptions, formData.airTravelClass)}
                  options={travelClassOptions}
                  onChange={handleSelectChange}
                  placeholder="Travel Class"
                  isDisabled={isView}
                />

                <Select
                  name="airFlightType"
                  value={findOptionByValue(flightTypeOptions, formData.airFlightType)}
                  options={flightTypeOptions}
                  onChange={handleSelectChange}
                  placeholder="Flight Type"
                  isDisabled={isView}
                />
              </div>
            )}
          </div>

          {/* 4. Motorbike */}
          <div className="border-b pb-4">
            <ToggleButton
              label="Did you have any business travel by motorbike during the reporting period?"
              checked={formData.travelByMotorbike}
              onChange={() => handleToggle("travelByMotorbike")}
              disabled={isView}
            />

            {formData.travelByMotorbike && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <input
                  type="number"
                  name="motorbikeDistanceKm"
                  value={formData.motorbikeDistanceKm}
                  onChange={handleChange}
                  placeholder="Distance (km)"
                  className="input-field"
                  disabled={isView}
                />

                <Select
                  name="motorbikeType"
                  value={findOptionByValue(motorbikeTypeOptions, formData.motorbikeType)}
                  options={motorbikeTypeOptions}
                  onChange={handleSelectChange}
                  placeholder="Motorbike Type"
                  isDisabled={isView}
                />
              </div>
            )}
          </div>

          {/* 5. Taxi */}
          <div className="border-b pb-4">
            <ToggleButton
              label="Did you have any business travel by taxi during the reporting period?"
              checked={formData.travelByTaxi}
              onChange={() => handleToggle("travelByTaxi")}
              disabled={isView}
            />
            {formData.travelByTaxi && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <input
                  type="number"
                  name="taxiPassengers"
                  value={formData.taxiPassengers}
                  onChange={handleChange}
                  placeholder="Number of Passengers"
                  className="input-field"
                  disabled={isView}
                />

                <input
                  type="number"
                  name="taxiDistanceKm"
                  value={formData.taxiDistanceKm}
                  onChange={handleChange}
                  placeholder="Distance (km)"
                  className="input-field"
                  disabled={isView}
                />

                <Select
                  name="taxiType"
                  value={findOptionByValue(taxiTypeOptions, formData.taxiType)}
                  options={taxiTypeOptions}
                  onChange={handleSelectChange}
                  placeholder="Taxi Type"
                  isDisabled={isView}
                />
              </div>
            )}
          </div>

          {/* 6. Bus */}
          <div className="border-b pb-4">
            <ToggleButton
              label="Did you have any business travel by bus during the reporting period?"
              checked={formData.travelByBus}
              onChange={() => handleToggle("travelByBus")}
              disabled={isView}
            />
            {formData.travelByBus && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <input
                  type="number"
                  name="busPassengers"
                  value={formData.busPassengers}
                  onChange={handleChange}
                  placeholder="Passengers"
                  className="input-field"
                  disabled={isView}
                />

                <input
                  type="number"
                  name="busDistanceKm"
                  value={formData.busDistanceKm}
                  onChange={handleChange}
                  placeholder="Distance (km)"
                  className="input-field"
                  disabled={isView}
                />

                <Select
                  name="busType"
                  value={findOptionByValue(busTypeOptions, formData.busType)}
                  options={busTypeOptions}
                  onChange={handleSelectChange}
                  placeholder="Bus Type"
                  isDisabled={isView}
                />
              </div>
            )}
          </div>

          {/* 7. Train */}
          <div className="border-b pb-4">
            <ToggleButton
              label="Did you have any business travel by train during the reporting period?"
              checked={formData.travelByTrain}
              onChange={() => handleToggle("travelByTrain")}
              disabled={isView}
            />

            {formData.travelByTrain && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <input
                  type="number"
                  name="trainPassengers"
                  value={formData.trainPassengers}
                  onChange={handleChange}
                  placeholder="Passengers"
                  className="input-field"
                  disabled={isView}
                />

                <input
                  type="number"
                  name="trainDistanceKm"
                  value={formData.trainDistanceKm}
                  onChange={handleChange}
                  placeholder="Distance (km)"
                  className="input-field"
                  disabled={isView}
                />

                <Select
                  name="trainType"
                  value={findOptionByValue(trainTypeOptions, formData.trainType)}
                  options={trainTypeOptions}
                  onChange={handleSelectChange}
                  placeholder="Train Type"
                  isDisabled={isView}
                />
              </div>
            )}
          </div>

          {/* 8. Car */}
          <div className="border-b pb-4">
            <ToggleButton
              label="Did you have any business travel by car during the reporting period?"
              checked={formData.travelByCar}
              onChange={() => handleToggle("travelByCar")}
              disabled={isView}
            />

            {formData.travelByCar && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <input
                  type="number"
                  name="carDistanceKm"
                  value={formData.carDistanceKm}
                  onChange={handleChange}
                  placeholder="Distance (km)"
                  className="input-field"
                  disabled={isView}
                />
                <div className="col-span-2">
                <Select
                  name="carType"
                  value={findOptionByValue(carTypeOptions, formData.carType)}
                  options={carTypeOptions}
                  onChange={handleCarTypeChange}
                  placeholder="Car Type"
                  isDisabled={isView}
                />
                </div>
                <Select
                  name="carFuelType"
                  value={findOptionByValue(fuelOptions, formData.carFuelType)}
                  options={fuelOptions}
                  onChange={handleCarFuelTypeChange}
                  placeholder={formData.carType ? "Select fuel type" : "Select car type first"}
                  isDisabled={!formData.carType || isView}
                />
              </div>
            )}
          </div>

          {/* 9. Hotel Stay */}
          <div className="border-b pb-4">
            <ToggleButton
              label="Did you have any hotel stays during business travel in the reporting period?"
              checked={formData.hotelStay}
              onChange={() => handleToggle("hotelStay")}
              disabled={isView}
            />

            {formData.hotelStay && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <input
                  type="number"
                  name="hotelRooms"
                  value={formData.hotelRooms}
                  onChange={handleChange}
                  placeholder="Number of Rooms"
                  className="input-field"
                  disabled={isView}
                />

                <input
                  type="number"
                  name="hotelNights"
                  value={formData.hotelNights}
                  onChange={handleChange}
                  placeholder="Nights Stayed"
                  className="input-field"
                  disabled={isView}
                />
              </div>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="field-label">Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows={3}
              className="input-field h-auto min-h-[80px]"
              disabled={isView}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button 
              text="Cancel" 
              className="btn-light" 
              onClick={() => navigate("/Business-Travel")} 
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

export default BusinessTravelFormPage;