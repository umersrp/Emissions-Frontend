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
import InputGroup from "@/components/ui/InputGroup";

const BusinessTravelFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const mode = location.state?.mode || "add";
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const [buildingOptions, setBuildingOptions] = useState([]);
  const [showToggleError, setShowToggleError] = useState(false);
  const [calculatedEmissionKgCo2e, setCalculatedEmissionKgCo2e] = useState(0);
  const [calculatedEmissionTCo2e, setCalculatedEmissionTCo2e] = useState(0);
  const [errors, setErrors] = useState({});



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

    // Clear the field error immediately when user starts typing
    setErrors(prev => ({ ...prev, [name]: "" }));

    // Validate for negative values
    if (Number(value) < 0) {
      setErrors(prev => ({ ...prev, [name]: "Value cannot be negative" }));
      return;
    }

    // For car distance, also check if it's 0
    if (name === "carDistanceKm" && Number(value) === 0) {
      setErrors(prev => ({ ...prev, [name]: "Distance must be greater than 0" }));
      return;
    }

    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      recalculateEmissions(updated);
      return updated;
    });
  };

  const handleSelectChange = (selectedOption, { name }) => {
    if (isView) return;

    // Clear the field error when a selection is made
    setErrors(prev => ({ ...prev, [name]: "" }));

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

    // Clear errors for carType and carFuelType when car type changes
    setErrors(prev => ({
      ...prev,
      carType: "",
      carFuelType: ""
    }));

    setFormData(prev => ({
      ...prev,
      carType: stringValue,
      carFuelType: ""
    }));

    // Recalculate emissions with updated formData
    const updated = {
      ...formData,
      carType: stringValue,
      carFuelType: ""
    };
    recalculateEmissions(updated);
  };

  const handleCarFuelTypeChange = (selectedOption) => {
    if (isView) return;

    const stringValue = selectedOption ? selectedOption.value : "";

    // Clear carFuelType error when fuel type is selected
    setErrors(prev => ({
      ...prev,
      carFuelType: ""
    }));

    const updated = {
      ...formData,
      carFuelType: stringValue
    };
    setFormData(updated);
    recalculateEmissions(updated);
  };

  const handleToggle = (name) => {
    if (isView) return;

    setFormData((prev) => {
      const updated = { ...prev, [name]: !prev[name] };

      // Toggle OFF → reset fields + clear errors
      const clearErrors = (keys) => {
        setErrors(prevErr => {
          const copy = { ...prevErr };
          keys.forEach(k => delete copy[k]);
          return copy;
        });
      };

      if (prev[name]) {
        if (name === "travelByAir") {
          updated.airPassengers = "";
          updated.airDistanceKm = "";
          updated.airTravelClass = "";
          updated.airFlightType = "";
          clearErrors(["airPassengers", "airDistanceKm", "airTravelClass", "airFlightType"]);
        }

        if (name === "travelByMotorbike") {
          updated.motorbikeDistanceKm = "";
          updated.motorbikeType = "";
          clearErrors(["motorbikeDistanceKm", "motorbikeType"]);
        }

        if (name === "travelByTaxi") {
          updated.taxiPassengers = "";
          updated.taxiDistanceKm = "";
          updated.taxiType = "";
          clearErrors(["taxiPassengers", "taxiDistanceKm", "taxiType"]);
        }

        if (name === "travelByBus") {
          updated.busPassengers = "";
          updated.busDistanceKm = "";
          updated.busType = "";
          clearErrors(["busPassengers", "busDistanceKm", "busType"]);
        }

        if (name === "travelByTrain") {
          updated.trainPassengers = "";
          updated.trainDistanceKm = "";
          updated.trainType = "";
          clearErrors(["trainPassengers", "trainDistanceKm", "trainType"]);
        }

        if (name === "travelByCar") {
          updated.carDistanceKm = "";
          updated.carType = "";
          updated.carFuelType = "";
          clearErrors(["carDistanceKm", "carType", "carFuelType"]);
        }

        if (name === "hotelStay") {
          updated.hotelRooms = "";
          updated.hotelNights = "";
          clearErrors(["hotelRooms", "hotelNights"]);
        }
      }

      //  Toggle group validation
      const anyToggle =
        updated.travelByAir ||
        updated.travelByMotorbike ||
        updated.travelByTaxi ||
        updated.travelByBus ||
        updated.travelByTrain ||
        updated.travelByCar ||
        updated.hotelStay;

      setShowToggleError(!anyToggle);

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
        const anyToggle =
          updatedFormData.travelByAir ||
          updatedFormData.travelByMotorbike ||
          updatedFormData.travelByTaxi ||
          updatedFormData.travelByBus ||
          updatedFormData.travelByTrain ||
          updatedFormData.travelByCar ||
          updatedFormData.hotelStay;

        setShowToggleError(!anyToggle && !isView);
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
    const newErrors = {};

    // Required base fields with proper messages
    if (!formData.buildingId) newErrors.buildingId = "Building is required";
    if (!formData.stakeholder) newErrors.stakeholder = "Stakeholder/Department is required";
    if (!formData.qualityControl) newErrors.qualityControl = "Quality control is required";

    // Toggle group validation
    const anyToggle =
      formData.travelByAir ||
      formData.travelByMotorbike ||
      formData.travelByTaxi ||
      formData.travelByBus ||
      formData.travelByTrain ||
      formData.travelByCar ||
      formData.hotelStay;

    setShowToggleError(!anyToggle);

    // ✈️ Air Travel validation
    if (formData.travelByAir) {
      if (!formData.airPassengers) newErrors.airPassengers = "Number of passengers is required";
      else if (Number(formData.airPassengers) <= 0) newErrors.airPassengers = "Passengers must be greater than 0";

      if (!formData.airDistanceKm) newErrors.airDistanceKm = "Distance is required";
      else if (Number(formData.airDistanceKm) <= 0) newErrors.airDistanceKm = "Distance must be greater than 0";

      if (!formData.airTravelClass) newErrors.airTravelClass = "Travel class is required";
      if (!formData.airFlightType) newErrors.airFlightType = "Flight type is required";
    }

    // 🏍️ Motorbike Travel validation
    if (formData.travelByMotorbike) {
      if (!formData.motorbikeDistanceKm) newErrors.motorbikeDistanceKm = "Distance is required";
      else if (Number(formData.motorbikeDistanceKm) <= 0) newErrors.motorbikeDistanceKm = "Distance must be greater than 0";

      if (!formData.motorbikeType) newErrors.motorbikeType = "Motorbike type is required";
    }

    // 🚕 Taxi Travel validation
    if (formData.travelByTaxi) {
      if (!formData.taxiPassengers) newErrors.taxiPassengers = "Number of passengers is required";
      else if (Number(formData.taxiPassengers) <= 0) newErrors.taxiPassengers = "Passengers must be greater than 0";

      if (!formData.taxiDistanceKm) newErrors.taxiDistanceKm = "Distance is required";
      else if (Number(formData.taxiDistanceKm) <= 0) newErrors.taxiDistanceKm = "Distance must be greater than 0";

      if (!formData.taxiType) newErrors.taxiType = "Taxi type is required";
    }

    // 🚌 Bus Travel validation
    if (formData.travelByBus) {
      if (!formData.busPassengers) newErrors.busPassengers = "Number of passengers is required";
      else if (Number(formData.busPassengers) <= 0) newErrors.busPassengers = "Passengers must be greater than 0";
      if (!formData.busDistanceKm) newErrors.busDistanceKm = "Distance is required";
      else if (Number(formData.busDistanceKm) <= 0) newErrors.busDistanceKm = "Distance must be greater than 0";
      if (!formData.busType) newErrors.busType = "Bus type is required";
    }

    //  Train Travel validation
    if (formData.travelByTrain) {
      if (!formData.trainPassengers) newErrors.trainPassengers = "Number of passengers is required";
      else if (Number(formData.trainPassengers) <= 0) newErrors.trainPassengers = "Passengers must be greater than 0";
      if (!formData.trainDistanceKm) newErrors.trainDistanceKm = "Distance is required";
      else if (Number(formData.trainDistanceKm) <= 0) newErrors.trainDistanceKm = "Distance must be greater than 0";
      if (!formData.trainType) newErrors.trainType = "Train type is required";
    }

    //  Car Travel validation
    if (formData.travelByCar) {
      if (!formData.carDistanceKm) newErrors.carDistanceKm = "Distance is required";
      else if (Number(formData.carDistanceKm) <= 0) newErrors.carDistanceKm = "Distance must be greater than 0";
      if (!formData.carType) newErrors.carType = "Car type is required";
      if (!formData.carFuelType) newErrors.carFuelType = "Fuel type is required";
    }

    // Hotel Stay validation
    if (formData.hotelStay) {
      if (!formData.hotelRooms) newErrors.hotelRooms = "Number of rooms is required";
      else if (Number(formData.hotelRooms) <= 0) newErrors.hotelRooms = "Rooms must be greater than 0";
      if (!formData.hotelNights) newErrors.hotelNights = "Number of nights is required";
      else if (Number(formData.hotelNights) <= 0) newErrors.hotelNights = "Nights must be greater than 0";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && anyToggle;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Run validation and store the result
  const isValid = validate();
  
  // If validation fails, show error toast
  if (!isValid) {
    // Check what type of error we have
    if (showToggleError) {
      toast.error("Please select at least one travel option.");
    } else {
      toast.error("Please fill all required fields correctly.");
    }
    return;
  }

  // If validation passes, continue with submission
  // First, recalculate emissions to get the latest values
  const latestResult = calculateBusinessTravel(formData);
  const latestKgCo2e = latestResult?.totalEmissions_KgCo2e || 0;
  const latestTCo2e = latestResult?.totalEmissions_TCo2e || 0;

  // Update state immediately
  setCalculatedEmissionKgCo2e(latestKgCo2e);
  setCalculatedEmissionTCo2e(latestTCo2e);

  const payload = {
    ...formData,
    calculatedEmissionKgCo2e: latestKgCo2e,
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
        <div className="text-slate-700 leading-relaxed mb-2 bg-gray-100 rounded-lg border-l-4 border-primary-400 p-2 pl-4 m-4">
          <p className="text-gray-700">
            This category includes emissions from the transportation of employees for <span className="font-semibold">business related activities</span> in vehicles <span className="font-semibold">owned or operated by third parties</span>, such as aircraft, trains, buses, and passenger cars. Also companies may optionally include emissions from business travelers staying in hotels         </p>
        </div>
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
              {errors.buildingId && (
                <p className="text-red-500 text-sm mt-1">{errors.buildingId}</p>
              )}
            </div>

            {/* 2. Stakeholder */}
            <div>
              <label className="field-label">Stakeholder / Department</label>
              <Select
                name="stakeholder"
                placeholder="Select Stakeholder / Department"
                value={findOptionByValue(stakeholderDepartmentOptions, formData.stakeholder)}
                options={stakeholderDepartmentOptions}
                onChange={handleSelectChange}
                isDisabled={isView}
              />
              {errors.stakeholder && (
                <p className="text-red-500 text-sm mt-1">{errors.stakeholder}</p>
              )}
            </div>

            {/* Quality Control */}
            <div>
              <label className="field-label">Quality Control</label>
              <Select
                name="qualityControl"
                placeholder={"Select Quality"}
                value={findOptionByValue(processQualityControlOptions, formData.qualityControl)}
                options={processQualityControlOptions}
                onChange={handleSelectChange}
                isDisabled={isView}
              />
              {errors.qualityControl && (
                <p className="text-red-500 text-sm mt-1">{errors.qualityControl}</p>
              )}
            </div>
          </div>

          {/* NEW: Error message for toggle selection */}
          {showToggleError && !isView && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    Please select at least one travel option below.
                  </p>
                </div>
              </div>
            </div>
          )}

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
                <div>
                  <label className="field-label">Number of Passengers</label>
                  <InputGroup
                    type="number"
                    name="airPassengers"
                    value={formData.airPassengers}
                    onChange={handleChange}
                    placeholder="e.g., 1, 2, 3"
                    className="input-field"
                    disabled={isView}
                  />
                  {errors.airPassengers && (
                    <p className="text-red-500 text-sm mt-1">{errors.airPassengers}</p>
                  )}
                </div>

                <div>
                  <label className="field-label">Distance (km)</label>
                  <InputGroup
                    type="number"
                    name="airDistanceKm"
                    value={formData.airDistanceKm}
                    onChange={handleChange}
                    placeholder="e.g., 1000"
                    className="input-field"
                    disabled={isView}
                  />
                  {errors.airDistanceKm && (
                    <p className="text-red-500 text-sm mt-1">{errors.airDistanceKm}</p>
                  )}
                </div>

                <div>
                  <label className="field-label">Travel Class</label>
                  <Select
                    name="airTravelClass"
                    value={findOptionByValue(travelClassOptions, formData.airTravelClass)}
                    options={travelClassOptions}
                    onChange={handleSelectChange}
                    placeholder="Select Travel Class"
                    isDisabled={isView}
                  />
                  {errors.airTravelClass && (
                    <p className="text-red-500 text-sm mt-1">{errors.airTravelClass}</p>
                  )}
                </div>

                <div>
                  <label className="field-label">Flight Type</label>
                  <Select
                    name="airFlightType"
                    value={findOptionByValue(flightTypeOptions, formData.airFlightType)}
                    options={flightTypeOptions}
                    onChange={handleSelectChange}
                    placeholder="Select Flight Type"
                    isDisabled={isView}
                  />
                  {errors.airFlightType && (
                    <p className="text-red-500 text-sm mt-1">{errors.airFlightType}</p>
                  )}
                </div>
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
                <div>
                  <label className="field-label">Distance (km)</label>
                  <InputGroup
                    type="number"
                    name="motorbikeDistanceKm"
                    value={formData.motorbikeDistanceKm}
                    onChange={handleChange}
                    placeholder="e.g., 1000"
                    className="input-field"
                    disabled={isView}
                  />
                  {errors.motorbikeDistanceKm && (
                    <p className="text-red-500 text-sm mt-1">{errors.motorbikeDistanceKm}</p>
                  )}
                </div>

                <div>
                  <label className="field-label">Motorbike Type</label>
                  <Select
                    name="motorbikeType"
                    value={findOptionByValue(motorbikeTypeOptions, formData.motorbikeType)}
                    options={motorbikeTypeOptions}
                    onChange={handleSelectChange}
                    placeholder=" Select Motorbike Type"
                    isDisabled={isView}
                  />
                  {errors.motorbikeType && (
                    <p className="text-red-500 text-sm mt-1">{errors.motorbikeType}</p>
                  )}
                </div>
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
                <div>
                  <label className="field-label">Number of Passengers</label>
                  <InputGroup
                    type="number"
                    name="taxiPassengers"
                    value={formData.taxiPassengers}
                    onChange={handleChange}
                    placeholder="e.g., 1, 2, 3"
                    className="input-field"
                    disabled={isView}
                  />
                  {errors.taxiPassengers && (
                    <p className="text-red-500 text-sm mt-1">{errors.taxiPassengers}</p>
                  )}
                </div>

                <div>
                  <label className="field-label">Distance (km)</label>
                  <InputGroup
                    type="number"
                    name="taxiDistanceKm"
                    value={formData.taxiDistanceKm}
                    onChange={handleChange}
                    placeholder="e.g., 1000"
                    className="input-field"
                    disabled={isView}
                  />
                  {errors.taxiDistanceKm && (
                    <p className="text-red-500 text-sm mt-1">{errors.taxiDistanceKm}</p>
                  )}
                </div>

                <div>
                  <label className="field-label">Taxi Type</label>
                  <Select
                    name="taxiType"
                    value={findOptionByValue(taxiTypeOptions, formData.taxiType)}
                    options={taxiTypeOptions}
                    onChange={handleSelectChange}
                    placeholder="Select Taxi Type"
                    isDisabled={isView}
                  />
                  {errors.taxiType && (
                    <p className="text-red-500 text-sm mt-1">{errors.taxiType}</p>
                  )}
                </div>
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
                <div>
                  <label className="field-label">Passengers</label>
                  <InputGroup
                    type="number"
                    name="busPassengers"
                    value={formData.busPassengers}
                    onChange={handleChange}
                    placeholder="e.g., 1, 2, 3"
                    className="input-field"
                    disabled={isView}
                  />
                  {errors.busPassengers && (
                    <p className="text-red-500 text-sm mt-1">{errors.busPassengers}</p>
                  )}
                </div>

                <div>
                  <label className="field-label">Distance (km)</label>
                  <InputGroup
                    type="number"
                    name="busDistanceKm"
                    value={formData.busDistanceKm}
                    onChange={handleChange}
                    placeholder="e.g., 1000"
                    className="input-field"
                    disabled={isView}
                  />
                  {errors.busDistanceKm && (
                    <p className="text-red-500 text-sm mt-1">{errors.busDistanceKm}</p>
                  )}
                </div>

                <div>
                  <label className="field-label">Bus Type</label>
                  <Select
                    name="busType"
                    value={findOptionByValue(busTypeOptions, formData.busType)}
                    options={busTypeOptions}
                    onChange={handleSelectChange}
                    placeholder="Select Bus Type"
                    isDisabled={isView}
                    className={errors.busType ? 'border-red-500' : ''}
                  />
                  {errors.busType && (
                    <p className="text-red-500 text-sm mt-1">{errors.busType}</p>
                  )}
                </div>
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
                <div>
                  <label className="field-label">Passengers</label>
                  <InputGroup
                    type="number"
                    name="trainPassengers"
                    value={formData.trainPassengers}
                    onChange={handleChange}
                    placeholder="e.g., 1, 2, 3"
                    className="input-field"
                    disabled={isView}
                  />
                  {errors.trainPassengers && (
                    <p className="text-red-500 text-sm mt-1">{errors.trainPassengers}</p>
                  )}
                </div>

                <div>
                  <label className="field-label">Distance (km)</label>
                  <InputGroup
                    type="number"
                    name="trainDistanceKm"
                    value={formData.trainDistanceKm}
                    onChange={handleChange}
                    placeholder="e.g., 1000"
                    className="input-field"
                    disabled={isView}
                  />
                  {errors.trainDistanceKm && (
                    <p className="text-red-500 text-sm mt-1">{errors.trainDistanceKm}</p>
                  )}
                </div>

                <div>
                  <label className="field-label">Train Type</label>
                  <Select
                    name="trainType"
                    value={findOptionByValue(trainTypeOptions, formData.trainType)}
                    options={trainTypeOptions}
                    onChange={handleSelectChange}
                    placeholder="Select Train Type"
                    isDisabled={isView}
                    className={errors.trainType ? 'border-red-500' : ''}
                  />
                  {errors.trainType && (
                    <p className="text-red-500 text-sm mt-1">{errors.trainType}</p>
                  )}
                </div>
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
                <div>
                  <label className="field-label">Distance (km)</label>
                  <InputGroup
                    type="number"
                    name="carDistanceKm"
                    value={formData.carDistanceKm}
                    onChange={handleChange}
                    placeholder="e.g., 1000"
                    className="input-field"
                    disabled={isView}
                  />
                  {errors.carDistanceKm && (
                    <p className="text-red-500 text-sm mt-1">{errors.carDistanceKm}</p>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="field-label">Car Type</label>
                  <Select
                    name="carType"
                    value={findOptionByValue(carTypeOptions, formData.carType)}
                    options={carTypeOptions}
                    onChange={handleCarTypeChange}
                    placeholder="Select Car Type"
                    isDisabled={isView}
                    className={errors.carType ? 'border-red-500' : ''}
                  />
                  {errors.carType && (
                    <p className="text-red-500 text-sm mt-1">{errors.carType}</p>
                  )}
                </div>

                <div>
                  <label className="field-label">Fuel Type</label>
                  <Select
                    name="carFuelType"
                    value={findOptionByValue(fuelOptions, formData.carFuelType)}
                    options={fuelOptions}
                    onChange={handleCarFuelTypeChange}
                    placeholder={formData.carType ? "Select Fuel Type" : "Select Car Type first"}
                    isDisabled={!formData.carType || isView}
                    className={errors.carFuelType ? 'border-red-500' : ''}
                  />
                  {errors.carFuelType && (
                    <p className="text-red-500 text-sm mt-1">{errors.carFuelType}</p>
                  )}
                </div>
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
                <div>
                  <label className="field-label">Number of Rooms</label>
                  <InputGroup
                    type="number"
                    name="hotelRooms"
                    value={formData.hotelRooms}
                    onChange={handleChange}
                    placeholder="e.g., 1, 2, 3"
                    className="input-field"
                    disabled={isView}
                  />
                  {errors.hotelRooms && (
                    <p className="text-red-500 text-sm mt-1">{errors.hotelRooms}</p>
                  )}
                </div>

                <div>
                  <label className="field-label">Nights Stayed</label>
                  <InputGroup
                    type="number"
                    name="hotelNights"
                    value={formData.hotelNights}
                    onChange={handleChange}
                    placeholder="e.g., 1, 2, 3"
                    className="input-field"
                    disabled={isView}
                  />
                  {errors.hotelNights && (
                    <p className="text-red-500 text-sm mt-1">{errors.hotelNights}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="field-label">Remarks</label>
            <InputGroup
     type="textarea"          name="remarks"
              placeholder="Enter Remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows={3}
              className="border-[2px] border-gray-400 rounded-md"
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