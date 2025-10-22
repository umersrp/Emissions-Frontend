import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CustomSelect from "@/components/ui/Select";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  stakeholderOptions,
  FugitiveEquipmentTypeOptions,
  materialRefrigerantOptions,
  qualityControlOptions,
  consumptionUnitOptions,
} from "@/constant/options";

const FugitiveCombustionFormPage = () => {
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
    materialRefrigerant: null,
    leakageValue: "",
    consumptionUnit: { value: "kg", label: "kg" },
    qualityControl: null,
    remarks: "",
  });

  const [buildingOptions, setBuildingOptions] = useState([]);
  const [errors, setErrors] = useState({});

  // --- Fetch Buildings ---
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/building/Get-All-Buildings`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        const formatted =
          res.data?.data?.buildings?.map((b) => ({
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

  // --- If in Edit/View mode, fetch record by ID ---
  useEffect(() => {
    if (isEdit || isView) {
      const fetchRecord = async () => {
        try {
          const res = await axios.get(
            `${process.env.REACT_APP_BASE_URL}/Fugitive/get/${id}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
          const data = res.data?.data;
          if (data) {
            setFormData({
              buildingId: { value: data.buildingId?._id, label: data.buildingId?.buildingName },
              stakeholder: { value: data.stakeholder, label: data.stakeholder },
              equipmentType: { value: data.equipmentType, label: data.equipmentType },
              materialRefrigerant: { value: data.materialRefrigerant, label: data.materialRefrigerant },
              leakageValue: data.leakageValue || "",
              consumptionUnit: { value: data.consumptionUnit, label: data.consumptionUnit },
              qualityControl: { value: data.qualityControl, label: data.qualityControl },
              remarks: data.remarks || "",
            });
          }
        } catch (err) {
          toast.error("Failed to fetch record details");
        }
      };
      fetchRecord();
    }
  }, [id, isEdit, isView]);

  // --- Handle Input Change ---
  const handleInputChange = (e) => {
    if (isView) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // --- Handle Select Change ---
  const handleSelectChange = (name, value) => {
    if (isView) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // --- Validation ---
  const validate = () => {
    const newErrors = {};
    const requiredFields = [
      "buildingId",
      "stakeholder",
      "equipmentType",
      "materialRefrigerant",
      "leakageValue",
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
      stakeholder: formData.stakeholder?.value || formData.stakeholder?.label,
      equipmentType: formData.equipmentType?.value || formData.equipmentType?.label,
      materialRefrigerant: formData.materialRefrigerant?.value,
      leakageValue: formData.leakageValue,
      consumptionUnit: formData.consumptionUnit?.value,
      qualityControl: formData.qualityControl?.value,
      remarks: formData.remarks,
    };

    try {
      if (isEdit) {
        await axios.put(
          `${process.env.REACT_APP_BASE_URL}/Fugitive/update/${id}`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success("Record updated successfully!");
      } else {
        await axios.post(
          `${process.env.REACT_APP_BASE_URL}/Fugitive/Create`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success("Record added successfully!");
      }
      navigate("/Fugitive-Combustion");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div>
      <Card title={`${isView ? "View" : isEdit ? "Edit" : "Add"} Fugitive Combustion Record`}>
        <form onSubmit={handleSubmit} className="p-6 grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* --- Building --- */}
            <div>
              <label className="field-label">Site / Building Name</label>
              <CustomSelect
                name="buildingId"
                options={buildingOptions}
                value={formData.buildingId}
                onChange={(value) => handleSelectChange("buildingId", value)}
                placeholder="Select Building"
                isDisabled={isView}
              />
              {errors.buildingId && <p className="text-red-500 text-sm">{errors.buildingId}</p>}
            </div>

            {/* --- Stakeholder / Department --- */}
            <div>
              <label className="field-label">Stakeholder / Department</label>
              <CustomSelect
                name="stakeholder"
                options={stakeholderOptions}
                value={formData.stakeholder}
                onChange={(value) => handleSelectChange("stakeholder", value)}
                placeholder="Select or type department"
                allowCustomInput
                isDisabled={isView}
              />
              {errors.stakeholder && <p className="text-red-500 text-sm">{errors.stakeholder}</p>}
            </div>

            {/* --- Equipment Type --- */}
            <div>
              <label className="field-label">Equipment Type</label>
              <CustomSelect
                name="equipmentType"
                options={FugitiveEquipmentTypeOptions}
                value={formData.equipmentType}
                onChange={(value) => handleSelectChange("equipmentType", value)}
                placeholder="Select or type equipment"
                allowCustomInput
                isDisabled={isView}
              />
              {errors.equipmentType && <p className="text-red-500 text-sm">{errors.equipmentType}</p>}
            </div>

            {/* --- Material / Refrigerant --- */}
            <div>
              <label className="field-label">Material / Refrigerant</label>
              <CustomSelect
                name="materialRefrigerant"
                options={materialRefrigerantOptions}
                value={formData.materialRefrigerant}
                onChange={(value) => handleSelectChange("materialRefrigerant", value)}
                placeholder="Select Material / Refrigerant"
                isDisabled={isView}
              />
              {errors.materialRefrigerant && (
                <p className="text-red-500 text-sm">{errors.materialRefrigerant}</p>
              )}
            </div>

            {/* --- Consumption Value --- */}
            <div>
              <label className="field-label">Leakage Value</label>
              <input
                type="number"
                name="leakageValue"
                value={formData.leakageValue}
                onChange={handleInputChange}
                placeholder="Enter value"
                className="border-[2px] w-full h-10 p-2 rounded-md"
                disabled={isView}
              />
              {errors.leakageValue && (
                <p className="text-red-500 text-sm">{errors.leakageValue}</p>
              )}
            </div>

            {/* --- Consumption Unit --- */}
            <div>
              <label className="field-label">Consumption Unit</label>
              <CustomSelect
                name="consumptionUnit"
                options={consumptionUnitOptions}
                value={formData.consumptionUnit}
                onChange={(value) => handleSelectChange("consumptionUnit", value)}
                isDisabled={isView}
              />
            </div>

            {/* --- Quality Control --- */}
            <div>
              <label className="field-label">Quality Control</label>
              <CustomSelect
                name="qualityControl"
                options={qualityControlOptions}
                value={formData.qualityControl}
                onChange={(value) => handleSelectChange("qualityControl", value)}
                placeholder="Select Quality"
                isDisabled={isView}
              />
              {errors.qualityControl && (
                <p className="text-red-500 text-sm">{errors.qualityControl}</p>
              )}
            </div>
          </div>

          {/* --- Remarks --- */}
          <div className="col-span-full">
            <label className="field-label">Remarks (Optional)</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              rows={3}
              placeholder="Any remarks..."
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
              onClick={() => navigate("/Fugitive-Combustion")}
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

export default FugitiveCombustionFormPage;
