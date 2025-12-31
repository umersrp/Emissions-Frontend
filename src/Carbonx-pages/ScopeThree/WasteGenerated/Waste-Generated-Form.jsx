import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CustomSelect from "@/components/ui/Select";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  qualityControlOptions,
  FugitiveAndMobileStakeholderOptions
} from "@/constant/scope1/options"
import {
  wasteCategoryOptions,
  wasteTypeOptions,
  wasteTreatmentOptions
} from "@/constant/scope3/wasteGenerated";
import { calculateWasteEmission } from "@/utils/Scope3/calculateWasteGenerated";
import { formatEmission } from "@/components/ui/FormateEmission";
import InputGroup from "@/components/ui/InputGroup";

const WasteGeneratedFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const mode = location.state?.mode || "add";
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const [calculatedEmissionKgCo2e, setCalculatedEmissionKgCo2e] = useState(0);
  const [calculatedEmissionTCo2e, setCalculatedEmissionTCo2e] = useState(0);

  const [formData, setFormData] = useState({
    buildingId: null,
    stakeholder: null,
    wasteCategory: null,
    wasteType: null,
    wasteTreatmentMethod: null,
    unit: { value: "Tonnes", label: "Tonnes" },
    totalWasteQty: "",
    qualityControl: null,
    remarks: ""
  });

  const [buildingOptions, setBuildingOptions] = useState([]);
  const [errors, setErrors] = useState({});


  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/building/Get-All-Buildings?limit=1000`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        const formatted =
          res.data?.data?.buildings?.map((b) => ({
            value: b._id,
            label: b.buildingName
          })) || [];

        setBuildingOptions(formatted);
      } catch {
        toast.error("Failed to load buildings");
      }
    };

    fetchBuildings();
  }, []);
  useEffect(() => {
    const qty = formData.totalWasteQty;
    const wasteType = formData.wasteType?.value;
    const treatment = formData.wasteTreatmentMethod?.value;
    if (!qty || !wasteType || !treatment) {
      setCalculatedEmissionKgCo2e(0);
      setCalculatedEmissionTCo2e(0);
      return;
    }
    const emissionKg = calculateWasteEmission(qty, wasteType, treatment);
    if (emissionKg !== null) {
      const formattedKg = formatEmission(emissionKg);
      const formattedT = formatEmission(emissionKg / 1000);
      setCalculatedEmissionKgCo2e(formattedKg);
      setCalculatedEmissionTCo2e(formattedT);
      // toast.info(
      //   `Emission: ${formattedKg} kg CO₂e (${formattedT} t CO₂e)`,
      //   { autoClose: 2000 }
      // );
    }
  }, [
    formData.totalWasteQty,
    formData.wasteType,
    formData.wasteTreatmentMethod
  ]);

  useEffect(() => {
    if (!isEdit && !isView) return;
    const fetchRecord = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/Waste-Generate/Detail/${id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        const data = res.data?.data;
        if (!data) return;
        setFormData({
          buildingId: {
            value: data.buildingId?._id,
            label: data.buildingId?.buildingName
          },
          stakeholder: data.stakeholder
            ? { value: data.stakeholder, label: data.stakeholder }
            : null,
          wasteCategory: data.wasteCategory
            ? { value: data.wasteCategory, label: data.wasteCategory }
            : null,
          wasteType: data.wasteType
            ? { value: data.wasteType, label: data.wasteType }
            : null,
          wasteTreatmentMethod: data.wasteTreatmentMethod
            ? { value: data.wasteTreatmentMethod, label: data.wasteTreatmentMethod }
            : null,
          unit: { value: "Tonnes", label: "Tonnes" },
          totalWasteQty: data.totalWasteQty,
          qualityControl: data.qualityControl
            ? { value: data.qualityControl, label: data.qualityControl }
            : null,
          remarks: data.remarks || ""
        });

      } catch {
        toast.error("Failed to load waste record");
      }
    };

    fetchRecord();
  }, [id, isEdit, isView]);


  const handleSelectChange = (name, value) => {
    if (isView) return;

    setFormData((prev) => {
      let updated = { ...prev, [name]: value };

      if (name === "wasteCategory") {
        updated.wasteType = null;
        updated.wasteTreatmentMethod = null;
      }

      if (name === "wasteType") {
        updated.wasteTreatmentMethod = null;
      }

      return updated;
    });

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleInputChange = (e) => {
    if (isView) return;

    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.buildingId) newErrors.buildingId = "Building is required";
    if (!formData.stakeholder) newErrors.stakeholder = "Stakeholder is required";
    if (!formData.wasteCategory) newErrors.wasteCategory = "Waste Category is required";
    if (!formData.wasteType) newErrors.wasteType = "Waste Type is required";
    if (!formData.wasteTreatmentMethod) newErrors.wasteTreatmentMethod = "Waste Treatment is required";
    if (!formData.totalWasteQty) newErrors.totalWasteQty = "Quantity is required";
    if (!formData.qualityControl) newErrors.qualityControl = "Quality control is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView) return;

    if (!validate()) return toast.error("Please fill all required fields");

    const userId = localStorage.getItem("userId");

    const payload = {
      buildingId: formData.buildingId.value,
      stakeholder: formData.stakeholder.value,
      wasteCategory: formData.wasteCategory.value,
      wasteType: formData.wasteType.value,
      wasteTreatmentMethod: formData.wasteTreatmentMethod.value,
      unit: "Tonnes",
      totalWasteQty: Number(formData.totalWasteQty),
      qualityControl: formData.qualityControl.value,
      calculatedEmissionKgCo2e,
      calculatedEmissionTCo2e,
      remarks: formData.remarks,
      createdBy: userId,
      updatedBy: userId
    };

    try {
      if (isEdit) {
        await axios.put(
          `${process.env.REACT_APP_BASE_URL}/Waste-Generate/Update/${id}`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success("Record updated successfully!");
      } else {
        await axios.post(
          `${process.env.REACT_APP_BASE_URL}/Waste-Generate/Create`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success("Record added successfully!");
      }

      navigate("/Waste-Generated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit");
    }
  };

  const availableWasteTypes =
    formData.wasteCategory ? wasteTypeOptions[formData.wasteCategory.value] : [];

  const availableTreatmentMethods =
    formData.wasteType ? wasteTreatmentOptions[formData.wasteType.value] : [];

  return (
    <div>
      <Card title={`${isView ? "View" : isEdit ? "Edit" : "Add"} Waste Generated in Operations`}>
        <div className="text-slate-700 leading-relaxed mb-2 bg-gray-100 rounded-lg border-l-4 border-primary-400 p-2 pl-4 m-4">
          <p className="text-gray-700">
            This Category includes emissions from third-party disposal and treatment of waste generated in the reporting company’s owned or controlled operations in the reporting year. This category includes emissions from disposal of both solid waste and wastewater.           </p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid gap-6">

          {/* Building & Stakeholder */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <label className="field-label">Site / Building Name <span className="text-red-500">*</span></label>
              <CustomSelect
                value={formData.buildingId}
                placeholder="Select Building Name"
                options={buildingOptions}
                onChange={(v) => handleSelectChange("buildingId", v)}
                isDisabled={isView}
              />
              {errors.buildingId && <p className="text-red-500 text-sm">{errors.buildingId}</p>}
            </div>

            <div>
              <label className="field-label">Stakeholder / Department <span className="text-red-500">*</span></label>
              <CustomSelect
                value={formData.stakeholder}
                placeholder="Select Stakeholder / Department"
                options={FugitiveAndMobileStakeholderOptions}
                onChange={(v) => handleSelectChange("stakeholder", v)}
                isDisabled={isView}
              />
              {errors.stakeholder && <p className="text-red-500 text-sm">{errors.stakeholder}</p>}
            </div>
            {/* Waste Category & Type */}
            <div>
              <label className="field-label">Waste Category <span className="text-red-500">*</span></label>
              <CustomSelect
                value={formData.wasteCategory}
                placeholder="Select Category"
                options={wasteCategoryOptions}
                onChange={(v) => handleSelectChange("wasteCategory", v)}
                isDisabled={isView}
              />
              {errors.wasteCategory && <p className="text-red-500 text-sm">{errors.wasteCategory}</p>}
            </div>
          </div>


          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="">
              <label className="field-label">Waste Type <span className="text-red-500">*</span></label>
              <CustomSelect
                value={formData.wasteType}
                placeholder="Select Waste Type"
                options={availableWasteTypes}
                onChange={(v) => handleSelectChange("wasteType", v)}
                isDisabled={isView || !formData.wasteCategory}
              />
              {errors.wasteType && <p className="text-red-500 text-sm">{errors.wasteType}</p>}
            </div>
            {/* Treatment */}
            <div>
              <label className="field-label">Waste Treatment Method<span className="text-red-500">*</span></label>
              <CustomSelect
                value={formData.wasteTreatmentMethod}
                placeholder="Select Waste Treatment Method"
                options={availableTreatmentMethods}
                onChange={(v) => handleSelectChange("wasteTreatmentMethod", v)}
                isDisabled={isView || !formData.wasteType}
              />
              {errors.wasteTreatmentMethod && (
                <p className="text-red-500 text-sm">{errors.wasteTreatmentMethod}</p>
              )}
            </div>
            <div>
              <label className="field-label">Unit <span className="text-red-500">*</span></label>
              <CustomSelect value={formData.unit} isDisabled />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {/* Quantity */}
            <div>
              <label className="field-label">Total Waste Quantity <span className="text-red-500">*</span></label>
              <InputGroup
                type="number"
                name="totalWasteQty"
                placeholder="Enter Quantity"
                value={formData.totalWasteQty}
                onChange={handleInputChange}
                className="border w-full p-2 rounded"
                disabled={isView}
              />
              {errors.totalWasteQty && (
                <p className="text-red-500 text-sm">{errors.totalWasteQty}</p>
              )}
            </div>

            {/* Quality Control */}
            <div>
              <label className="field-label">Quality Control <span className="text-red-500">*</span></label>
              <CustomSelect
                value={formData.qualityControl}
                placeholder="Select Quality"
                options={qualityControlOptions}
                onChange={(v) => handleSelectChange("qualityControl", v)}
                isDisabled={isView}
              />
              {errors.qualityControl && (
                <p className="text-red-500 text-sm">{errors.qualityControl}</p>
              )}
            </div>

          </div>

          {/* Remarks */}
          <div>
            <label className="field-label">Remarks</label>
            <InputGroup
     type="textarea"          name="remarks"
              placeholder="Enter Remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
              rows={3}
              disabled={isView}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              text={isView ? "Back" : "Cancel"}
              className={isView ? "btn-primary" : "btn-light"}
              type="button"
              onClick={() => navigate("/Waste-Generated")}
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

export default WasteGeneratedFormPage;
