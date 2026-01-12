import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CustomSelect from "@/components/ui/Select";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  FugitiveAndMobileStakeholderOptions,
  FugitiveEquipmentTypeOptions,
  materialRefrigerantOptions,
  qualityControlOptions,
  consumptionUnitOptions,
} from "@/constant/scope1/options";
import { calculateFugitiveEmission } from "@/utils/scope1/calculate-fugitive-emission";
import InputGroup from "@/components/ui/InputGroup";

const FugitiveCombustionFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [globalFilterValue, setGlobalFilterValue] = useState("");
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
    postingDate: "",
  });

  const [buildingOptions, setBuildingOptions] = useState([]);
  const [errors, setErrors] = useState({});

  const capitalizeFirstLetter = (text) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  // --- Fetch Buildings ---
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
              postingDate: data.postingDate
                ? new Date(data.postingDate).toISOString().split('T')[0]
                : "",
            });
          }
        } catch (err) {
          toast.error("Failed to fetch record details");
        }
      };
      fetchRecord();
    }
  }, [id, isEdit, isView]);


  const handleInputChange = (e) => {
    if (isView) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    // --- Calculate emission on leakageValue input ---
    if (name === "leakageValue" && formData.materialRefrigerant?.value) {
      const kgEmission = calculateFugitiveEmission(formData.materialRefrigerant.value, value);
      const tEmission = kgEmission / 1000;

      if (kgEmission !== null) {
        // toast.info(
        //   `Calculated Emission: ${kgEmission.toFixed(2)} kg CO₂e (${tEmission.toFixed(4)} tCO₂e)`
        // );
        setFormData((prev) => ({
          ...prev,
          calculatedEmissionKgCo2e: kgEmission,
          calculatedEmissionTCo2e: tEmission,
        }));
      }
    }
  };

  const handleSelectChange = (name, value) => {
    if (isView) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    // --- Calculate emission when refrigerant changes ---
    if (name === "materialRefrigerant" && formData.leakageValue) {
      const kgEmission = calculateFugitiveEmission(value.value, formData.leakageValue);
      const tEmission = kgEmission / 1000;

      if (kgEmission !== null) {
        // toast.info(
        //   `Calculated Emission: ${kgEmission.toFixed(2)} kg CO₂e (${tEmission.toFixed(4)} tCO₂e)`
        // );
        setFormData((prev) => ({
          ...prev,
          calculatedEmissionKgCo2e: kgEmission,
          calculatedEmissionTCo2e: tEmission,
        }));
      }
    }
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
      "postingDate",
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

    const userId = localStorage.getItem("userId");

    if (!userId) {
      toast.error("User not found. Please log in again.");
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
      calculatedEmissionKgCo2e: formData.calculatedEmissionKgCo2e || 0,
      calculatedEmissionTCo2e: formData.calculatedEmissionTCo2e || 0,
      remarks: capitalizeFirstLetter(formData.remarks),
      createdBy: userId,
      updatedBy: userId,
      postingDate: formData.postingDate,
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
      navigate("/Fugitive-Emissions");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div>
      <Card title={`${isView ? "View" : isEdit ? "Edit" : "Add"} Fugitive Emissions Record`}>
        <div className="text-slate-700 leading-relaxed mb-2 bg-gray-100 rounded-lg border-l-4 border-primary-400 p-2 pl-4 m-4 justify-center">
          <p className="text-gray-700 items-center ">
            Fugitive emissions are unintended greenhouse gas (GHG) releases from equipment or systems owned or controlled by an organization, such as leaks from refrigeration units, gas pipelines, or storage tanks.          </p>
        </div>
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
                options={FugitiveAndMobileStakeholderOptions}
                value={formData.stakeholder}
                onChange={(value) => handleSelectChange("stakeholder", value)}
                placeholder="Select Stakeholder / Department"
                allowCustomInput
                isDisabled={isView}
              />
              {errors.stakeholder && <p className="text-red-500 text-sm">{errors.stakeholder}</p>}
            </div>

            {/* --- Select or Type Equipment Name --- */}
            <div>
              <label className="field-label">Equipment Type</label>
              <CustomSelect
                name="equipmentType"
                options={FugitiveEquipmentTypeOptions}
                value={formData.equipmentType}
                onChange={(value) => handleSelectChange("equipmentType", value)}
                placeholder="Select or Type Equipment Name"
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

            {/* --- Leakage Value --- */}
            <div>
              <label className="field-label">Leakage Value / Recharge Value</label>
              <InputGroup
                type="number"
                name="leakageValue"
                value={formData.leakageValue}
                onChange={handleInputChange}
                placeholder="Enter Value"
                className="border-[2px] w-full h-10 p-2 rounded-md"
                disabled={isView}
              />
              {errors.leakageValue && (
                <p className="text-red-500 text-sm">{errors.leakageValue}</p>
              )}
            </div>

            {/* --- Consumption Unit --- */}
            <div>
              <label className="field-label">Unit</label>
              <CustomSelect
                name="consumptionUnit"
                options={consumptionUnitOptions}
                value={formData.consumptionUnit}
                onChange={(value) => handleSelectChange("consumptionUnit", value)}
                isDisabled={isView}
                placeholder={"Select Unit"}
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
            {/* posting Date */}
            <div>
              <label className="field-label">Posting Date</label>
              <InputGroup
                type="date"
                name="postingDate"
                value={formData.postingDate}
                onChange={handleInputChange}
                className="border-[2px] w-full h-10 p-2 rounded-md"
                disabled={isView}
              />
              {errors.postingDate && <p className="text-red-500 text-sm mt-1">{errors.postingDate}</p>}
            </div>
          </div>

        {/* --- Remarks --- */}
        <div className="col-span-full">
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

        {/* --- Buttons --- */}
        <div className="col-span-full flex justify-end gap-4 pt-6">
          <Button
            text={isView ? "Back" : "Cancel"}
            className={isView ? "btn-primary" : "btn-light"}
            type="button"
            onClick={() => navigate("/Fugitive-Emissions")}
          />
          {!isView && (
            <Button text={isEdit ? "Update" : "Add"} className="btn-primary" type="submit" />
          )}
        </div>
      </form>
    </Card>
    </div >
  );
};

export default FugitiveCombustionFormPage;
