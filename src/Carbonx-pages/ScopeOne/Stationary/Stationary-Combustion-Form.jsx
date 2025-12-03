import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  stakeholderOptions,
  equipmentTypeOptions,
  fuelNameOptionsByType,
  fuelTypeOptions,
  qualityControlOptions,
  fuelUnitOptionsByName,
} from "@/constant/scope1/stationary-data";
import { calculateStationaryEmissions } from "@/utils/scope1/calculate-stationary-emissions";

const StationaryCombustionFormPage = () => {
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
    equipmentType: null,
    fuelType: null,
    fuelName: null,
    fuelConsumption: "",
    qualityControl: null,
    consumptionUnit: null,
    remarks: "",
    calculatedEmissionKgCo2e: "",
    calculatedEmissionTCo2e: "",
    calculatedBioEmissionKgCo2e: "",
    calculatedBioEmissionTCo2e: "",
  });
  console.log("StationaryCombustionFormPage re-rendered");
  const [buildingOptions, setBuildingOptions] = useState([]);
  const [errors, setErrors] = useState({});


  const formatNumber = (num) => {
    if (!num || isNaN(num)) return "0";
    if (Math.abs(num) < 0.001 && num !== 0) {
      return num.toExponential(5);
    }
    // For normal numbers, show up to 5 decimals without trailing zeros
    return parseFloat(num.toFixed(5)).toString();
  };
  const capitalizeFirstLetter = (text) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };


  // --- Fetch Buildings ---
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/building/Get-All-Buildings`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        const formatted =
          (res.data?.data?.buildings || []).map((b) => ({
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

  // --- Fetch Record by ID (for edit/view) ---
  useEffect(() => {
    if (!id || isAdd) return;

    const fetchRecord = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/stationary/stationary/${id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        const data = res.data?.data;
        if (!data) return;

        const buildingOption = data.buildingId
          ? {
            value: data.buildingId._id,
            label: data.buildingId.buildingName || "Unnamed Building",
          }
          : null;

        setFormData({
          buildingId: buildingOption,
          stakeholder: stakeholderOptions.find((s) => s.value === data.stakeholder) || null,
          equipmentType: equipmentTypeOptions.find((e) => e.value === data.equipmentType) || null,
          fuelType: fuelTypeOptions.find((f) => f.value === data.fuelType) || null,
          fuelName:
            fuelNameOptionsByType[data.fuelType]?.find(
              (fn) => fn.value === data.fuelName
            ) || null,
          qualityControl:
            qualityControlOptions.find((q) => q.value === data.qualityControl) || null,
          consumptionUnit: data.consumptionUnit
            ? { value: data.consumptionUnit, label: data.consumptionUnit }
            : null,
          fuelConsumption: data.fuelConsumption || "",
          remarks: data.remarks || "",
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch record details");
      }
    };

    fetchRecord();
  }, [id, isAdd]);

  // --- Handle Input Change ---
  const handleInputChange = (e) => {
    if (isView) return;
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  // --- Handle Select Change with Dependency Logic ---
  const handleSelectChange = (value, { name }) => {
    if (isView) return;

    setFormData((prev) => {
      let updated = { ...prev, [name]: value };

      // Reset dependent fields
      if (name === "fuelType") {
        updated = { ...updated, fuelName: null, consumptionUnit: null };
      } else if (name === "fuelName") {
        updated = { ...updated, consumptionUnit: null };
      }

      return updated;
    });

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // --- Dynamic Dropdown Options ---
  const fuelNameOptions =
    formData.fuelType?.value && fuelNameOptionsByType[formData.fuelType.value]
      ? fuelNameOptionsByType[formData.fuelType.value]
      : [];

  const unitOptions =
    formData.fuelName?.value && fuelUnitOptionsByName[formData.fuelName.value]
      ? [
        ...new Set([
          ...fuelUnitOptionsByName.default,
          ...fuelUnitOptionsByName[formData.fuelName.value],
        ]),
      ].map((u) => ({ value: u, label: u }))
      : fuelUnitOptionsByName.default.map((u) => ({ value: u, label: u }));

  // --- Validation ---
  const validate = () => {
    const newErrors = {};
    const requiredFields = [
      "buildingId",
      "stakeholder",
      "equipmentType",
      "fuelType",
      "fuelName",
      "fuelConsumption",
      "qualityControl",
      "consumptionUnit",
    ];

    requiredFields.forEach((f) => {
      if (!formData[f] || (typeof formData[f] === "string" && !formData[f].trim())) {
        newErrors[f] = "This field is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView) return;

    if (!validate()) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      buildingId: formData.buildingId?.value,
      stakeholder: formData.stakeholder?.value,
      equipmentType: formData.equipmentType?.value,
      fuelType: formData.fuelType?.value,
      fuelName: formData.fuelName?.value,
      qualityControl: formData.qualityControl?.value,
      consumptionUnit: formData.consumptionUnit?.value,
      fuelConsumption: formData.fuelConsumption,
      remarks: capitalizeFirstLetter(formData.remarks),
      calculatedEmissionKgCo2e: formData.calculatedEmissionKgCo2e,
      calculatedEmissionTCo2e: formData.calculatedEmissionTCo2e,
      calculatedBioEmissionKgCo2e: formData.calculatedBioEmissionKgCo2e,
      calculatedBioEmissionTCo2e: formData.calculatedBioEmissionTCo2e,
    };

    try {
      if (isEdit) {
        await axios.put(
          `${process.env.REACT_APP_BASE_URL}/stationary/update/${id}`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success("Record updated successfully!");
      } else {
        await axios.post(
          `${process.env.REACT_APP_BASE_URL}/stationary/create`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success("Record added successfully!");
      }
      navigate("/Stationary-Combustion");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (
      formData.fuelName?.value &&
      formData.fuelConsumption &&
      formData.consumptionUnit?.value
    ) {
      const result = calculateStationaryEmissions(
        formData.fuelName.value,
        Number(formData.fuelConsumption),
        formData.consumptionUnit.value
      );

      if (result) {
        setFormData((prev) => ({
          ...prev,
          calculatedEmissionKgCo2e: result.totalEmissionInScope
            ? formatNumber(result.totalEmissionInScope)
            : "",
          calculatedEmissionTCo2e: result.totalEmissionInScope
            ? formatNumber(result.totalEmissionInScope / 1000)
            : "",
          calculatedBioEmissionKgCo2e: result.totalEmissionOutScope
            ? formatNumber(result.totalEmissionOutScope)
            : "",
          calculatedBioEmissionTCo2e: result.totalEmissionOutScope
            ? formatNumber(result.totalEmissionOutScope / 1000)
            : "",
        }));
      }
    }
  }, [formData.fuelName, formData.fuelConsumption, formData.consumptionUnit]);


  return (
    <div>
      <Card
        title={
          isView
            ? "View Stationary Combustion Record"
            : isEdit
              ? "Edit Stationary Combustion Record"
              : "Add Stationary Combustion Record"
        }
      >
        <div className="text-slate-700 leading-relaxed mb-6 bg-gray-100 rounded-lg border-l-4 border-primary-400 p-2 pl-4 m-4 justify-center">
          <p className="text-gray-700 items-center ">
            Stationary Combustion refers to the direct greenhouse gas (GHG) emissions from burning of fuels in stationary equipment at a facility, such as boilers, furnaces, or generators that are owned or controlled by the organization.</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="p-6 grid gap-6"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* --- Building --- */}
            <div>
              <label className="block font-semibold mb-1">Site / Building Name</label>
              <Select
                name="buildingId"
                options={buildingOptions}
                value={formData.buildingId}
                onChange={handleSelectChange}
                placeholder="Select Building"
                className={`w-full ${errors.buildingId ? "border border-red-500 rounded" : ""}`}
                isDisabled={isView}
              />
              {errors.buildingId && <p className="text-red-500 text-sm mt-1">{errors.buildingId}</p>}
            </div>

            {/* --- Stakeholder --- */}
            <div>
              <label className="block font-semibold mb-1">Stakeholder / Department</label>
              <Select
                name="stakeholder"
                options={stakeholderOptions}
                value={formData.stakeholder}
                onChange={handleSelectChange}
                placeholder="Select or Type department"
                className={`w-full ${errors.stakeholder ? "border border-red-500 rounded" : ""}`}
                isDisabled={isView}
                allowCustomInput
              />
              {errors.stakeholder && <p className="text-red-500 text-sm mt-1">{errors.stakeholder}</p>}
            </div>

            {/* --- Equipment Type --- */}
            <div>
              <label className="block font-semibold mb-1">Equipment Type</label>
              <Select
                name="equipmentType"
                options={equipmentTypeOptions}
                value={formData.equipmentType}
                // onChange={handleSelectChange}
                allowCustomInput
                onChange={(newValue) => handleSelectChange(newValue, { name: "equipmentType" })}
                placeholder="Select or type equipment"
                className={`w-full ${errors.equipmentType ? "border border-red-500 rounded" : ""}`}
                isDisabled={isView}
              />
              {errors.equipmentType && (
                <p className="text-red-500 text-sm mt-1">{errors.equipmentType}</p>
              )}
            </div>

            {/* --- Fuel Type --- */}
            <div>
              <label className="block font-semibold mb-1">Fuel Type</label>
              <Select
                name="fuelType"
                options={fuelTypeOptions}
                value={formData.fuelType}
                onChange={handleSelectChange}
                placeholder="Select fuel type"
                className={`w-full ${errors.fuelType ? "border border-red-500 rounded" : ""}`}
                isDisabled={isView}
              />
              {errors.fuelType && <p className="text-red-500 text-sm mt-1">{errors.fuelType}</p>}
            </div>

            {/* --- Fuel Name --- */}
            <div>
              <label className="block font-semibold mb-1">Fuel Name</label>
              <Select
                name="fuelName"
                options={fuelNameOptions}
                value={formData.fuelName}
                onChange={handleSelectChange}
                placeholder="Select fuel name"
                className={`w-full ${errors.fuelName ? "border border-red-500 rounded" : ""}`}
                isDisabled={isView}
              />
              {errors.fuelName && <p className="text-red-500 text-sm mt-1">{errors.fuelName}</p>}
            </div>

            {/* --- Fuel Consumption --- */}
            <div>
              <label className="block font-semibold mb-1">Fuel Consumption Value</label>
              <input
                type="number"
                name="fuelConsumption"
                value={formData.fuelConsumption}
                onChange={handleInputChange}
                placeholder="Enter value"
                className={"border-[2px] w-full h-10 p-2 rounded-md"}
                disabled={isView}
              />
              {errors.fuelConsumption && (
                <p className="text-red-500 text-sm mt-1">{errors.fuelConsumption}</p>
              )}
            </div>

            {/* --- Quality Control --- */}
            <div>
              <label className="block font-semibold mb-1">Quality Control</label>
              <Select
                name="qualityControl"
                options={qualityControlOptions}
                value={formData.qualityControl}
                onChange={handleSelectChange}
                placeholder="Select Quality"
                className={`w-full ${errors.qualityControl ? "border border-red-500 rounded" : ""}`}
                isDisabled={isView}
              />
              {errors.qualityControl && (
                <p className="text-red-500 text-sm mt-1">{errors.qualityControl}</p>
              )}
            </div>

            {/* --- Consumption Unit --- */}
            <div>
              <label className="block font-semibold mb-1">Consumption Unit</label>
              <Select
                name="consumptionUnit"
                options={unitOptions}
                value={formData.consumptionUnit}
                onChange={handleSelectChange}
                placeholder="Select unit"
                className={`w-full ${errors.consumptionUnit ? "border border-red-500 rounded" : ""}`}
                isDisabled={isView}
              />
              {errors.consumptionUnit && (
                <p className="text-red-500 text-sm mt-1">{errors.consumptionUnit}</p>
              )}
            </div>
          </div>
          {/* --- Remarks --- */}
          <div className="col-span-full">
            <label className="block font-semibold mb-1">Remarks (Optional)</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              placeholder="Any remarks..."
              rows={3}
              className="border-[2px] w-full p-2 rounded-md"
              disabled={isView}
            />
          </div>

          {/* --- Buttons --- */}
          <div className="col-span-full flex justify-end gap-4 pt-6">
            <Button
              text={isView ? "Back" : "Cancel"}
              className={isView ? "btn-primary" : "btn-light"}
              type="button"
              onClick={() => navigate("/Stationary-Combustion")}
            />
            {!isView && (
              <Button text={isEdit ? "Update" : "Add"} className="btn-primary" type="submit" />
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default StationaryCombustionFormPage;
