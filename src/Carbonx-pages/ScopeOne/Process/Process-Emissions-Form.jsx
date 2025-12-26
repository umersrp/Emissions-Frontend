import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  stakeholderDepartmentOptions,
  activityTypeOptions,
  activityMetadata,
  processQualityControlOptions,
} from "@/constant/scope1/options";
import { calculateProcessEmission } from "@/utils/scope1/calculate-process-emission"
import InputGroup from "@/components/ui/InputGroup";

const ProcessEmissionsFormPage = () => {
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
    activityType: null,
    gasEmitted: "",
    amountOfEmissions: "",
    qualityControl: null,
    remarks: "",
    calculatedEmissionKgCo2e: "",      // new
    calculatedEmissionTCo2e: "",
  });

  const [amountLabel, setAmountLabel] = useState("Amount of Emissions"); // dynamic label
  const [errors, setErrors] = useState({});
  const [buildingOptions, setBuildingOptions] = useState([]);

  const capitalizeFirstLetter = (text) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  // Fetch all buildings for dropdown
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/building/Get-All-Buildings?limit=1000`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
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

  // Fetch record by ID (Edit / View)
  useEffect(() => {
    const fetchById = async () => {
      if (!id || isAdd) return;
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/Process-Emissions/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = res.data?.data;
        const activityMeta = activityMetadata[data.activityType] || {};
        setAmountLabel(activityMeta.amountLabel || "Amount of Emissions");

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
          activityType:
            activityTypeOptions.find((a) => a.value === data.activityType) || {
              label: data.activityType,
              value: data.activityType,
            },
          gasEmitted: data.gasEmitted || "",
          amountOfEmissions: data.amountOfEmissions || "",
          qualityControl:
            processQualityControlOptions.find(
              (q) => q.value === data.qualityControl
            ) || { label: data.qualityControl, value: data.qualityControl },
          remarks: data.remarks || "",
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch record details");
      }
    };
    fetchById();
  }, [id, isAdd, buildingOptions]);

  // Handle dropdowns
  // const handleSelectChange = (value, { name }) => {
  //   if (isView) return;
  //   let updated = { ...formData, [name]: value };
  //   if (name === "activityType") {
  //     const meta = activityMetadata[value?.value] || {};
  //     updated.gasEmitted = meta.gasEmitted || "";
  //     setAmountLabel(meta.amountLabel || "Amount of Emissions");
  //   }
  //   setFormData(updated);
  //   setErrors((prev) => ({ ...prev, [name]: "" }));
  // };
  const handleSelectChange = (value, { name }) => {
    if (isView) return;

    let updated = { ...formData, [name]: value };

    if (name === "activityType") {
      const meta = activityMetadata[value?.value] || {};

      updated.gasEmitted = meta.gasEmitted || "";
      setAmountLabel(meta.amountLabel || "Amount of Emissions");

      // **Trigger emission calculation when activityType changes**
      if (updated.amountOfEmissions) {
        const result = calculateProcessEmission({
          activityType: value?.value,
          amountOfEmissions: updated.amountOfEmissions,
        });

        if (result) {
          const formatEmission = (num) => {
            const rounded = Number(num.toFixed(5));
            if (
              rounded !== 0 &&
              (Math.abs(rounded) < 0.0001 || Math.abs(rounded) >= 1e6)
            ) {
              return rounded.toExponential(5);
            }
            return rounded;
          };

          updated.calculatedEmissionKgCo2e = formatEmission(result.calculatedEmissionKgCo2e);
          updated.calculatedEmissionTCo2e = formatEmission(result.calculatedEmissionTCo2e);
        }
      }
    }

    setFormData(updated);
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };


  const handleInputChange = (e) => {
    if (isView) return;
    const { name, value } = e.target;

    // Update local state
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      const formatEmission = (num) => {
        const rounded = Number(num.toFixed(5));
        if (rounded !== 0 && (Math.abs(rounded) < 0.0001 || Math.abs(rounded) >= 1e6)) {
          return rounded.toExponential(5);
        }
        return rounded;
      };

      // Trigger calculation when amountOfEmissions changes
      if (name === "amountOfEmissions" && updated.activityType?.value) {
        const result = calculateProcessEmission({
          activityType: updated.activityType.value,
          amountOfEmissions: value,
        });

        if (result) {
          const kg = result.calculatedEmissionKgCo2e;
          const t = kg / 1000;

          updated.calculatedEmissionKgCo2e = formatEmission(kg);
          updated.calculatedEmissionTCo2e = formatEmission(t);

        }
        //     toast.info(
        //   `Emissions Calculated: ${updated.calculatedEmissionKgCo2e} kg CO2e / ${updated.calculatedEmissionTCo2e} t CO2e`
        // );
      }

      return updated;
    });

    // Clear validation error
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!formData.buildingId) newErrors.buildingId = "Building is required";
    if (!formData.stakeholderDepartment)
      newErrors.stakeholderDepartment = "Department is required";
    if (!formData.activityType)
      newErrors.activityType = "Activity Type is required";
    if (!formData.amountOfEmissions)
      newErrors.amountOfEmissions = "Amount of Emissions is required";
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

    const payload = {
      buildingId: formData.buildingId?.value,
      stakeholderDepartment: formData.stakeholderDepartment?.value,
      activityType: formData.activityType?.value,
      gasEmitted: formData.gasEmitted,
      amountOfEmissions: formData.amountOfEmissions,
      qualityControl: formData.qualityControl?.value,
      remarks: capitalizeFirstLetter(formData.remarks),
      calculatedEmissionKgCo2e: formData.calculatedEmissionKgCo2e,  // added
      calculatedEmissionTCo2e: formData.calculatedEmissionTCo2e,
    };

    try {
      if (isEdit) {
        await axios.put(
          `${process.env.REACT_APP_BASE_URL}/Process-Emissions/${id}`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success("Record updated successfully!");
      } else {
        await axios.post(
          `${process.env.REACT_APP_BASE_URL}/Process-Emissions/Create`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success("Record added successfully!");
      }
      navigate("/Process-Emissions");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error saving record");
    }
  };

  return (
    <div>
      <Card
        title={`${isView ? "View" : isEdit ? "Edit" : "Add"} Process Emission Record`}
      >
        <div className="text-slate-700 leading-relaxed mb-2 bg-gray-100 rounded-lg border-l-4 border-primary-400 p-2 pl-4 m-4 justify-center">
          <p className="text-gray-700">
            Process Emissions are direct greenhouse gas (GHG) emissions that result from chemical or physical processes occurring within an organization’s owned or controlled operations, not related to fuel combustion or fugitive leaks.
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
            <div>
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

            {/* Activity Type */}
            <div>
              <label className="field-label">Type of Activity / Process</label>
              <Select
                name="activityType"
                value={formData.activityType}
                options={activityTypeOptions}
                onChange={handleSelectChange}
                placeholder="Select Activity"
                isDisabled={isView}
              />
              {errors.activityType && (
                <p className="text-red-500 text-sm mt-1">{errors.activityType}</p>
              )}
            </div>

            {/* Gas Emitted */}
            <div className="overflow-x-auto">
              <label className="field-label">Gas Emitted</label>
              <InputGroup
                type="text"
                name="gasEmitted"
                value={formData.gasEmitted}
                readOnly
                className="input-field bg-gray-100 whitespace-nowrap overflow-visible block leading-[1.4] "
              />
            </div>

            {/* Amount of Emissions */}
            <div className="col-span-2">
              <label className="field-label">{amountLabel}</label>
              <InputGroup
                type="number"
                name="amountOfEmissions"
                value={formData.amountOfEmissions}
                onChange={handleInputChange}
                placeholder="Enter Value"
                className="input-field"
                disabled={isView}
              />
              {errors.amountOfEmissions && (
                <p className="text-red-500 text-sm mt-1">{errors.amountOfEmissions}</p>
              )}
            </div>

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
            {/* <InputGroup
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter Remarks"
              className="border-[2px] border-gray-400 rounded-md"
              disabled={isView}
            /> */}
            <InputGroup
              type="textarea"
              name="remarks"
              placeholder="Enter Remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              rows={3}
              className="border-[2px] border-gray-300 rounded-md"
              disabled={isView}
            />
          </div>

          {/* Buttons */}
          <div className="col-span-full flex justify-end gap-4 pt-6">
            <Button
              text={isView ? "Back" : "Cancel"}
              className={isView ? "btn-primary" : "btn-light"}
              type="button"
              onClick={() => navigate("/Process-Emissions")}
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

export default ProcessEmissionsFormPage;
