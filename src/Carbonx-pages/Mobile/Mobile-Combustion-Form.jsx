import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  stakeholderOptions,
  qualityControlOptions,
} from "@/constant/options";
import {
  vehicleClassificationOptions,
  vehicleTypeOptionsByClassification,
  fuelNameOptionsByClassification,
  distanceUnitOptions,
  weightLoadedOptions,
} from "@/constant/options";

const MobileCombustionFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const mode = location.state?.mode || "add";
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const [formData, setFormData] = useState({
    buildingId: null,
    stakeholder: null,
    vehicleClassification: null,
    vehicleType: null,
    fuelName: null,
    distanceTraveled: "",
    distanceUnit: null,
    qualityControl: null,
    weightLoaded: null,
    remarks: "",
  });
  const [errors, setErrors] = useState({});
  const [buildingOptions, setBuildingOptions] = useState([]);

  // Fetch Buildings
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/building/Get-All-Buildings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const formatted = res.data?.data?.buildings?.map((b) => ({
          value: b._id,
          label: b.buildingName,
        })) || [];
        setBuildingOptions(formatted);
      } catch {
        toast.error("Failed to load buildings");
      }
    };
    fetchBuildings();
  }, []);

  // Dependent options
  const vehicleTypeOptions =
    formData.vehicleClassification?.value &&
    vehicleTypeOptionsByClassification[formData.vehicleClassification.value]
      ? vehicleTypeOptionsByClassification[formData.vehicleClassification.value]
      : [];

  const fuelNameOptions =
  formData.vehicleClassification?.value &&
  fuelNameOptionsByClassification[formData.vehicleClassification.value]
    ? fuelNameOptionsByClassification[formData.vehicleClassification.value]
    : [];

  const handleSelectChange = (value, { name }) => {
    if (isView) return;

    setFormData((prev) => {
      let updated = { ...prev, [name]: value };

      // dependency logic
      if (name === "vehicleClassification") {
        updated = { ...updated, vehicleType: null, fuelName: null };
      } else if (name === "vehicleType") {
        updated = { ...updated, fuelName: null };
      }

      return updated;
    });

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleInputChange = (e) => {
    if (isView) return;
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

const handleSubmit = async (e) => {
  e.preventDefault(); // prevent page reload

  // Simple validation example
  const newErrors = {};
  if (!formData.buildingId) newErrors.buildingId = "Building is required";
  if (!formData.stakeholder) newErrors.stakeholder = "Stakeholder is required";
  // ... add other required validations

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    toast.error("Please fill all required fields");
    return;
  }

  try {
    if (isEdit) {
      await axios.put(`${process.env.REACT_APP_BASE_URL}/mobile-combustion/${id}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Record updated successfully");
    } else {
      await axios.post(`${process.env.REACT_APP_BASE_URL}/mobile-combustion`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Record added successfully");
    }
    navigate("/Mobile-Combustion"); // go back to list
  } catch (err) {
    toast.error("Something went wrong");
    console.error(err);
  }
};


  return (
    <div>
      <Card title="Add / Edit Mobile Combustion Record">
        <form onSubmit={handleSubmit} className="p-6 grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* 1. Building */}
            <Select name="buildingId" value={formData.buildingId} options={buildingOptions} onChange={handleSelectChange} placeholder="Select Building" isDisabled={isView} />

            {/* 2. Stakeholder */}
            <Select name="stakeholder" value={formData.stakeholder} options={stakeholderOptions} onChange={handleSelectChange} placeholder="Select Department" isDisabled={isView} />

            {/* 3. Vehicle Classification */}
            <Select name="vehicleClassification" value={formData.vehicleClassification} options={vehicleClassificationOptions} onChange={handleSelectChange} placeholder="Select Vehicle Classification" isDisabled={isView} />

            {/* 4. Vehicle Type */}
            <Select name="vehicleType" value={formData.vehicleType} options={vehicleTypeOptions} onChange={handleSelectChange} placeholder="Select Vehicle Type" isDisabled={isView} />

            {/* 5. Fuel Name */}
            <Select name="fuelName" value={formData.fuelName} options={fuelNameOptions} onChange={handleSelectChange} placeholder="Select Fuel Name" isDisabled={isView} />

            {/* 6. Distance Traveled */}
            <input type="number" name="distanceTraveled" value={formData.distanceTraveled} onChange={handleInputChange} placeholder="Enter distance" className="input-field" disabled={isView} />

            {/* 7. Units */}
            <Select name="distanceUnit" value={formData.distanceUnit} options={distanceUnitOptions} onChange={handleSelectChange} placeholder="Select Unit" isDisabled={isView} />

            {/* 8. Quality Control */}
            <Select name="qualityControl" value={formData.qualityControl} options={qualityControlOptions} onChange={handleSelectChange} placeholder="Select Quality" isDisabled={isView} />

            {/* 9. Weight Loaded */}
            <Select name="weightLoaded" value={formData.weightLoaded} options={weightLoadedOptions} onChange={handleSelectChange} placeholder="Select Weight" isDisabled={isView} />
          </div>

          {/* 10. Remarks */}
          <textarea name="remarks" value={formData.remarks} onChange={handleInputChange} rows={3} placeholder="Remarks..." className="border p-2 rounded-md" disabled={isView} />

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Button text={isView ? "Back" : "Cancel"} type="button" onClick={() => navigate("/Mobile-Combustion")} />
            {!isView && <Button text={isEdit ? "Update" : "Add"} type="submit" />}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default MobileCombustionFormPage;
