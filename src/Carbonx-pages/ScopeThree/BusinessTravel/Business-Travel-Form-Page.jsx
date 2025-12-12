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

const BusinessTravelFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const mode = location.state?.mode || "add";
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const [buildingOptions, setBuildingOptions] = useState([]);
  const [selectedCarType, setSelectedCarType] = useState(null);
  const [selectedFuelType, setSelectedFuelType] = useState(null);

  const [formData, setFormData] = useState({
    buildingId: null,
    stakeholder: null,

    // Toggles
    travelByAir: false,
    travelByMotorbike: false,
    travelByTaxi: false,
    travelByBus: false,
    travelByTrain: false,
    travelByCar: false,
    hotelStay: false,

    // Air Fields
    airPassengers: "",
    airDistanceKm: "",
    airTravelClass: null,
    airFlightType: null,

    // Motorbike
    motorbikeDistanceKm: "",
    motorbikeType: null,

    // Taxi
    taxiPassengers: "",
    taxiDistanceKm: "",
    taxiType: null,

    // Bus
    busPassengers: "",
    busDistanceKm: "",
    busType: null,

    // Train
    trainPassengers: "",
    trainDistanceKm: "",
    trainType: null,

    // Car
    carDistanceKm: "",
    carType: null,
    carFuelType: null,


    // Hotel
    hotelRooms: "",
    hotelNights: "",

    qualityControl: null,
    remarks: "",
  });

  // Get fuel options based on selected car type
  const fuelOptions = selectedCarType
    ? carFuelTypeOptions[selectedCarType.value].map((fuel) => ({
      value: fuel,
      label: fuel,
    }))
    : [];

  const handleToggle = (name) => {
    if (isView) return;
    setFormData((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleChange = (e) => {
    if (isView) return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value, { name }) => {
    if (isView) return;
    setFormData({ ...formData, [name]: value });
  };

  // Fetch buildings
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

  // TODO: Fetch by ID for edit/view (You can add same logic you had earlier)

  const validate = () => {
    const errors = {};
    if (!formData.buildingId) errors.buildingId = "Building is required";
    if (!formData.stakeholder) errors.stakeholder = "Stakeholder is required";
    if (!formData.qualityControl) errors.qualityControl = "Quality Control is required";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView) return;

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      ...formData,
      buildingId: formData.buildingId?.value,
      stakeholder: formData.stakeholder?.value,
      qualityControl: formData.qualityControl?.value,
      carType: formData.carType?.value || null,
      carFuelType: formData.carFuelType?.value || null,
    };

    try {
      if (isEdit) {
        await axios.put(
          `${process.env.REACT_APP_BASE_URL}/Business-Travel/${id}`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success("Record updated successfully!");
      } else {
        await axios.post(
          `${process.env.REACT_APP_BASE_URL}/Business-Travel/Create`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success("Record added successfully!");
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
