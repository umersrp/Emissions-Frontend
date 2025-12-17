import React, { useState, useEffect } from "react";
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
    buildingId: null,
    stakeholder: null,
    qualityControl: null,

    travelByAir: false,
    travelByMotorbike: false,
    travelByTaxi: false,
    travelByBus: false,
    travelByTrain: false,
    travelByCar: false,
    hotelStay: false,

    airPassengers: "",
    airDistanceKm: "",
    airTravelClass: null,
    airFlightType: null,

    motorbikeDistanceKm: "",
    motorbikeType: null,

    taxiPassengers: "",
    taxiDistanceKm: "",
    taxiType: null,

    busPassengers: "",
    busDistanceKm: "",
    busType: null,

    trainPassengers: "",
    trainDistanceKm: "",
    trainType: null,

    carDistanceKm: "",
    carType: null,
    carFuelType: null,

    hotelRooms: "",
    hotelNights: "",

    remarks: "",
  });

  /* ===============================
     🔁 CALCULATION WRAPPER
  =============================== */
  const recalculateEmissions = (data) => {
    try {
      const result = calculateBusinessTravel(data);

      setCalculatedEmissionKgCo2e(result?.calculatedEmissionKgCo2e || 0);
      setCalculatedEmissionTCo2e(result?.calculatedEmissionTCo2e || 0);
    } catch (err) {
      console.error("Calculation error", err);
    }
  };

  /* ===============================
     📝 INPUT HANDLERS
  =============================== */
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

  const handleSelectChange = (value, { name }) => {
    if (isView) return;

    const updated = { ...formData, [name]: value };
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
          updated.airTravelClass = null;
          updated.airFlightType = null;
        }
        if (name === "travelByMotorbike") {
          updated.motorbikeDistanceKm = "";
          updated.motorbikeType = null;
        }
        if (name === "travelByTaxi") {
          updated.taxiPassengers = "";
          updated.taxiDistanceKm = "";
          updated.taxiType = null;
        }
        if (name === "travelByBus") {
          updated.busPassengers = "";
          updated.busDistanceKm = "";
          updated.busType = null;
        }
        if (name === "travelByTrain") {
          updated.trainPassengers = "";
          updated.trainDistanceKm = "";
          updated.trainType = null;
        }
        if (name === "travelByCar") {
          updated.carDistanceKm = "";
          updated.carType = null;
          updated.carFuelType = null;
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

  /* ===============================
     🏢 FETCH BUILDINGS
  =============================== */
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

  /* ===============================
     📌 VALIDATION
  =============================== */
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

  /* ===============================
     🚀 SUBMIT
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    recalculateEmissions(formData);

    toast.success(
      `Total Emissions: ${calculatedEmissionKgCo2e.toFixed(2)} Kg CO₂e`
    );

    const payload = {
      ...formData,
      buildingId: formData.buildingId.value,
      stakeholder: formData.stakeholder.value,
      qualityControl: formData.qualityControl.value,

      carType: formData.carType?.value || null,
      carFuelType: formData.carFuelType?.value || null,
      airTravelClass: formData.airTravelClass?.value || null,
      airFlightType: formData.airFlightType?.value || null,

      totalEmissions_KgCo2e: calculatedEmissionKgCo2e,
      totalEmissions_TCo2e: calculatedEmissionTCo2e,
    };

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
    }
  };
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
                value={formData.buildingId}
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
                value={formData.stakeholder}
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
                value={formData.qualityControl}
                options={processQualityControlOptions}
                onChange={handleSelectChange}
                isDisabled={isView}
              />
            </div>
          </div>

          {/* 3. Air Travel Toggle & Fields */}
          <div className="border-b pb-4">
            <ToggleButton
              label="Did you travel by Air?"
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
                />

                <input
                  type="number"
                  name="airDistanceKm"
                  value={formData.airDistanceKm}
                  onChange={handleChange}
                  placeholder="Distance (km)"
                  className="input-field"
                />

                <Select
                  name="airTravelClass"
                  value={formData.airTravelClass}
                  options={travelClassOptions}
                  onChange={handleSelectChange}
                  placeholder="Travel Class"
                />

                <Select
                  name="airFlightType"
                  value={formData.airFlightType}
                  options={flightTypeOptions}
                  onChange={handleSelectChange}
                  placeholder="Flight Type"
                />
              </div>
            )}
          </div>

          {/* 4. Motorbike */}
          <div className="border-b pb-4">
            <ToggleButton
              label="Business travel by Motorbike?"
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
                />

                <Select
                  name="motorbikeType"
                  value={formData.motorbikeType}
                  options={motorbikeTypeOptions}
                  onChange={handleSelectChange}
                  placeholder="Motorbike Type"
                />
              </div>
            )}
          </div>

          {/* 5. Taxi */}
          <div className="border-b pb-4">
            <ToggleButton
              label="Business travel by Taxi?"
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
                />

                <input
                  type="number"
                  name="taxiDistanceKm"
                  value={formData.taxiDistanceKm}
                  onChange={handleChange}
                  placeholder="Distance (km)"
                  className="input-field"
                />

                <Select
                  name="taxiType"
                  value={formData.taxiType}
                  options={taxiTypeOptions}
                  onChange={handleSelectChange}
                  placeholder="Taxi Type"
                />
              </div>
            )}
          </div>

          {/* 6. Bus */}
          <div className="border-b pb-4">
            <ToggleButton
              label="Business travel by Bus?"
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
                />

                <input
                  type="number"
                  name="busDistanceKm"
                  value={formData.busDistanceKm}
                  onChange={handleChange}
                  placeholder="Distance (km)"
                  className="input-field"
                />

                <Select
                  name="busType"
                  value={formData.busType}
                  options={busTypeOptions}
                  onChange={handleSelectChange}
                  placeholder="Bus Type"
                />
              </div>
            )}
          </div>

          {/* 7. Train */}
          <div className="border-b pb-4">
            <ToggleButton
              label="Business travel by train?"
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
                />

                <input
                  type="number"
                  name="trainDistanceKm"
                  value={formData.trainDistanceKm}
                  onChange={handleChange}
                  placeholder="Distance (km)"
                  className="input-field"
                />

                <Select
                  name="trainType"
                  value={formData.trainType}
                  options={trainTypeOptions}
                  onChange={handleSelectChange}
                  placeholder="Train Type"
                />
              </div>
            )}
          </div>

          {/* 8. Car */}
          <div className="border-b pb-4">
            <ToggleButton
              label="Business travel by car?"
              checked={formData.travelByCar}
              onChange={() => handleToggle("travelByCar")}
              disabled={isView}
            />

            {formData.travelByCar && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <input
                  type="number"
                  name="carDistanceKm"
                  value={formData.carDistanceKm}
                  onChange={handleChange}
                  placeholder="Distance (km)"
                  className="input-field"
                />

                {/* <Select
                  name="carType"
                  value={formData.carType}
                  options={carTypeOptions}
                  onChange={handleSelectChange}
                  placeholder="Car Type"
                />

                <Select
                  name="carFuelType"
                  value={formData.carFuelType}
                  options={carFuelTypeOptions}
                  onChange={handleSelectChange}
                  placeholder="Fuel Type"
                /> */}
                <Select
                  label="Car Type"
                  options={carTypeOptions}
                  value={formData.carType}
                  onChange={(value) => {
                    setFormData({
                      ...formData,
                      carType: value,       // store full object in formData
                      carFuelType: null,    // reset fuel type
                    });
                  }}
                />

                {formData.carType && (
                  <Select
                    label="Fuel Type"
                    options={carFuelTypeOptions[formData.carType.value].map((fuel) => ({
                      value: fuel,
                      label: fuel,
                    }))}
                    value={formData.carFuelType}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        carFuelType: value,  // store fuel in formData
                      })
                    }
                  />
                )}

              </div>
            )}
          </div>

          {/* 9. Hotel Stay */}
          <div className="border-b pb-4">
            <ToggleButton
              label="Any Hotel stay?"
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
                />

                <input
                  type="number"
                  name="hotelNights"
                  value={formData.hotelNights}
                  onChange={handleChange}
                  placeholder="Nights Stayed"
                  className="input-field"
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
              className="input-field"
              disabled={isView}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button text="Cancel" className="btn-light" onClick={() => navigate("/Business-Travel")} />
            {!isView && <Button text={isEdit ? "Update" : "Add"} className="btn-primary" type="submit" />}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default BusinessTravelFormPage;
