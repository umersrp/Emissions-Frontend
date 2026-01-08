import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  stakeholderDepartmentOptions,
  processQualityControlOptions,
} from "@/constant/scope1/options";
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import Tippy from "@tippyjs/react";
import {
  transportationCategoryOptions,
  soldProductActivityOptions,
  soldGoodsTypeMapping,
  transportationVehicleCategoryOptions,
  transportationVehicleTypeOptions
} from '@/constant/scope3/downstreamTransportation';
import { calculateDownstreamTransportationEmission } from '@/utils/Scope3/calculateDownstreamTransportation';
import InputGroup from "@/components/ui/InputGroup";

const DownstreamTransportationFormPage = () => {
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
    // transportationCategory: null,
    transportationCategory: { value: "Sold Goods", label: "Sold Goods" },
    soldProductActivityType: null,
    soldGoodsType: null,
    transportationVehicleCategory: null,
    transportationVehicleType: null,
    weightLoaded: "",
    distanceTravelled: "",
    qualityControl: null,
    remarks: "",
    calculatedEmissionKgCo2e: "",
    calculatedEmissionTCo2e: "",
  });

  const [errors, setErrors] = useState({});
  const [buildingOptions, setBuildingOptions] = useState([]);
  const [activityTypeOptions, setActivityTypeOptions] = useState([]);
  const [soldGoodsTypeOptions, setSoldGoodsTypeOptions] = useState([]);

  const capitalizeFirstLetter = (text) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };
  useEffect(() => {
    if (isView) return;

    const { transportationCategory } = formData;

    // Clear calculations first
    setFormData(prev => ({
      ...prev,
      calculatedEmissionKgCo2e: "",
      calculatedEmissionTCo2e: "",
    }));

    // Only calculate for "Sold Goods" category
    if (transportationCategory?.value === "Sold Goods") {
      const { weightLoaded, distanceTravelled, transportationVehicleCategory, transportationVehicleType } = formData;

      // Check if we have all required fields for calculation
      const hasAllRequired = weightLoaded &&
        distanceTravelled &&
        transportationVehicleCategory?.value;

      if (hasAllRequired) {
        console.log("🔍 All required fields present, calculating...");

        const result = calculateDownstreamTransportationEmission({
          transportationCategory: "Sold Goods",
          weightLoaded: parseFloat(weightLoaded),
          distanceTravelled: parseFloat(distanceTravelled),
          transportationVehicleCategory: transportationVehicleCategory.value,
          transportationVehicleType: transportationVehicleType?.value,
        });

        if (result) {
          console.log(" Calculation successful:", {
            kgCO2e: result.calculatedEmissionKgCo2e,
            tCO2e: result.calculatedEmissionTCo2e
          });

          setFormData(prev => ({
            ...prev,
            calculatedEmissionKgCo2e: result.calculatedEmissionKgCo2e.toString(),
            calculatedEmissionTCo2e: result.calculatedEmissionTCo2e.toString(),
          }));
        } else {
          console.log("⚠️ Calculation returned null - check input values");
        }
      } else {
        console.log("⚠️ Missing required fields for calculation");
      }
    } else {
      console.log("ℹ️ Not 'Sold Goods' category or no category selected");
    }
  }, [
    formData.transportationCategory,
    formData.weightLoaded,
    formData.distanceTravelled,
    formData.transportationVehicleCategory,
    formData.transportationVehicleType,
    isView
  ]);
  // Fetch all buildings for dropdown
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

  // Fetch record by ID (Edit / View)
  useEffect(() => {
    const fetchById = async () => {
      if (!id || isAdd) return;
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/downstream/downstream/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = res.data?.data;

        // Set sold goods type options based on activity type
        if (data.soldProductActivityType) {
          const goodsOptions = soldGoodsTypeMapping[data.soldProductActivityType] || [];
          setSoldGoodsTypeOptions(goodsOptions);
        }

        // Find the matching stakeholder option
        const stakeholderOption = stakeholderDepartmentOptions.find(
          option => option.value === data.stakeholder
        ) || { label: data.stakeholder || "", value: data.stakeholder || "" };

        setFormData({
          buildingId:
            buildingOptions.find((b) => b.value === data.buildingId?._id) || {
              label: data.buildingId?.buildingName || "",
              value: data.buildingId?._id || "",
            },
          stakeholder: stakeholderOption, // Use the option object
          transportationCategory:
            transportationCategoryOptions.find(
              (t) => t.value === data.transportationCategory
            ) || {
              label: data.transportationCategory,
              value: data.transportationCategory,
            },
          soldProductActivityType:
            soldProductActivityOptions.find((a) => a.value === data.soldProductActivityType) || {
              label: data.soldProductActivityType,
              value: data.soldProductActivityType,
            },
          soldGoodsType: data.soldGoodsType
            ? soldGoodsTypeMapping[data.soldProductActivityType]?.find(g => g.value === data.soldGoodsType) || {
              label: data.soldGoodsType,
              value: data.soldGoodsType,
            }
            : null,
          transportationVehicleCategory:
            transportationVehicleCategoryOptions.find((v) => v.value === data.transportationVehicleCategory) || {
              label: data.transportationVehicleCategory,
              value: data.transportationVehicleCategory,
            },
          transportationVehicleType: data.transportationVehicleType
            ? transportationVehicleTypeOptions[data.transportationVehicleCategory]?.find(v => v.value === data.transportationVehicleType) || null
            : null,
          weightLoaded: data.weightLoaded || "",
          distanceTravelled: data.distanceTravelled || "",
          qualityControl: data.qualityControl !== undefined ?
            processQualityControlOptions.find(q => q.value === (data.qualityControl ? "Certain" : "Uncertain")) || null
            : null,
          remarks: data.remarks || "",
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch record details");
      }
    };
    fetchById();
  }, [id, isAdd, buildingOptions]);
  // Handle dropdown changes
  // Handle dropdown changes
  const handleSelectChange = (value, { name }) => {
    if (isView) return;

    let updated = { ...formData, [name]: value };

    if (name === "soldProductActivityType") {
      // Reset sold goods type when activity type changes
      updated.soldGoodsType = null;

      // Set sold goods type options based on selected activity type
      if (value?.value) {
        const goodsOptions = soldGoodsTypeMapping[value.value] || [];
        setSoldGoodsTypeOptions(goodsOptions);
      } else {
        setSoldGoodsTypeOptions([]);
      }
    }

    if (name === "transportationVehicleCategory") {
      // Reset vehicle type when category changes
      updated.transportationVehicleType = null;
    }

    setFormData(updated);
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  const handleInputChange = (e) => {
    if (isView) return;
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!formData.stakeholder) newErrors.stakeholder = "Stakeholder is required";
    if (!formData.buildingId) newErrors.buildingId = "Building is required";
    if (!formData.stakeholder) newErrors.stakeholder = "Stakeholder is required";
    if (!formData.transportationCategory)
      newErrors.transportationCategory = "Transportation Category is required";
    if (!formData.soldProductActivityType)
      newErrors.soldProductActivityType = "Sold Product Activity Type is required";

    // Validate sold goods type
    if (formData.soldProductActivityType) {
      const goodsOptions = soldGoodsTypeMapping[formData.soldProductActivityType.value] || [];
      if (goodsOptions.length > 0 && !formData.soldGoodsType) {
        newErrors.soldGoodsType = "Sold Goods Type is required";
      }
    }

    if (!formData.transportationVehicleCategory)
      newErrors.transportationVehicleCategory = "Transportation Vehicle Category is required";

    // Validate numeric fields
    if (!formData.weightLoaded) {
      newErrors.weightLoaded = "Weight Loaded is required";
    } else if (isNaN(parseFloat(formData.weightLoaded)) || parseFloat(formData.weightLoaded) <= 0) {
      newErrors.weightLoaded = "Weight Loaded must be a positive number";
    }

    if (!formData.distanceTravelled) {
      newErrors.distanceTravelled = "Distance Travelled is required";
    } else if (isNaN(parseFloat(formData.distanceTravelled)) || parseFloat(formData.distanceTravelled) <= 0) {
      newErrors.distanceTravelled = "Distance Travelled must be a positive number";
    }

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
      stakeholder: formData.stakeholder?.value,
      // transportationCategory: formData.transportationCategory?.value,
      transportationCategory: "Sold Goods",
      soldProductActivityType: formData.soldProductActivityType?.value,
      soldGoodsType: formData.soldGoodsType?.value,
      transportationVehicleCategory: formData.transportationVehicleCategory?.value,
      transportationVehicleType: formData.transportationVehicleType?.value,
      weightLoaded: parseFloat(formData.weightLoaded),
      distanceTravelled: parseFloat(formData.distanceTravelled),
      qualityControl: formData.qualityControl?.value === "Certain",
      remarks: capitalizeFirstLetter(formData.remarks),
      // Ensure these are numbers, not strings
      calculatedEmissionKgCo2e: formData.calculatedEmissionKgCo2e,
      calculatedEmissionTCo2e: formData.calculatedEmissionTCo2e,
    };
    console.log("Form data before sending:", {
      kgCO2e: formData.calculatedEmissionKgCo2e,
      tCO2e: formData.calculatedEmissionTCo2e,
      parsedKgCO2e: formData.calculatedEmissionKgCo2e ? parseFloat(formData.calculatedEmissionKgCo2e) : 0,
      parsedTCO2e: formData.calculatedEmissionTCo2e ? parseFloat(formData.calculatedEmissionTCo2e) : 0,
    });
    console.log("Sending payload:", payload); // Debug log

    try {
      if (isEdit) {
        await axios.put(
          `${process.env.REACT_APP_BASE_URL}/downstream/Update/${id}`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success("Record updated successfully!");
      } else {
        await axios.post(
          `${process.env.REACT_APP_BASE_URL}/downstream/Create`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success("Record added successfully!");
      }
      navigate("/Downstream-Transportation");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error saving record");
    }
  };

  // Helper to determine if vehicle type should be shown
  const shouldShowVehicleType = () => {
    const category = formData.transportationVehicleCategory?.value;
    return category && ["freightFlights", "seaTanker", "cargoShip"].includes(category);
  };

  return (
    <div>
      <Card
        title={`${isView ? "View" : isEdit ? "Edit" : "Add"} Downstream Transportation and Distribution Records`}
      >
        <div className="text-slate-700 leading-relaxed mb-2 bg-gray-100 rounded-lg border-l-4 border-primary-400 p-2 pl-4 m-4 justify-center">
          <p className="text-gray-700">
            This category includes emissions from transportation and distribution of products sold by the reporting company in the reporting year between the reporting company's operations and the end consumer (<span className="font-semibold">if not paid for by the reporting company</span>),<span className="font-semibold"> in vehicles and facilities not owned or controlled by the reporting company</span>. Outbound transportation and distribution services that are <span className="font-semibold">purchased by the reporting company</span> are excluded from this category and included in the category (Upstream transportation and distribution) because the reporting company <span className="font-semibold">purchases the service</span>.
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


            {/* Stakeholder */}
            <div className="lg:col-span-2">
              <label className="field-label">Stakeholder / Department</label>
              <Select
                name="stakeholder"
                value={formData.stakeholder}
                options={stakeholderDepartmentOptions}
                onChange={handleSelectChange}
                placeholder="Select Stakeholder / Department"
                isDisabled={isView}
                allowCustomInput
              />
              {errors.stakeholder && (
                <p className="text-red-500 text-sm mt-1">{errors.stakeholder}</p>
              )}
            </div>
            {/* Transportation Category */}
            {/* <div className="col-span-2">
              <label className="field-label">Transportation and Distribution Category</label>
              <Select
                name="transportationCategory"
                value={formData.transportationCategory}
                options={transportationCategoryOptions}
                onChange={handleSelectChange}
                placeholder="Select Category"
                isDisabled={isView}
              />
              {errors.transportationCategory && (
                <p className="text-red-500 text-sm mt-1">{errors.transportationCategory}</p>
              )}
            </div> */}
            <div className="col-span-2">
              <label className="field-label">Transportation and Distribution Category</label>
              <div className="flex items-center h-10 px-3 border border-gray-300 rounded-md bg-gray-100">
                Sold Goods
              </div>
              <input
                type="hidden"
                name="transportationCategory"
                value="Sold Goods"
              />
            </div>

            {/* Sold Product Activity Type */}
            <div>
              <label className="field-label">Sold Product Activity Type</label>
              <Select
                name="soldProductActivityType"
                value={formData.soldProductActivityType}
                options={soldProductActivityOptions}
                onChange={handleSelectChange}
                placeholder="Select Activity Type"
                isDisabled={isView}
              />
              {errors.soldProductActivityType && (
                <p className="text-red-500 text-sm mt-1">{errors.soldProductActivityType}</p>
              )}
            </div>

            {/* Sold Goods Type */}
            <div>
              <div className="flex items-center gap-2 ">
                <label className="field-label">Sold Goods Type</label>
                <Tippy
                  content="Select the specific type of goods based on the chosen activity type."
                  placement="top"
                >
                  <button
                    type="button"
                    className="w-5 h-5 mb-1 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium hover:bg-blue-200 transition-colors"
                    aria-label="Information about sold goods type"
                  >
                    i
                  </button>
                </Tippy>
              </div>
              <Select
                name="soldGoodsType"
                value={formData.soldGoodsType}
                options={soldGoodsTypeOptions}
                onChange={handleSelectChange}
                placeholder={formData.soldProductActivityType ? `Select ${formData.soldProductActivityType.label} Type` : "Select Goods Type"}
                isDisabled={isView || !formData.soldProductActivityType}
                isClearable={true}
              />
              {errors.soldGoodsType && (
                <p className="text-red-500 text-sm mt-1">{errors.soldGoodsType}</p>
              )}
              {formData.soldProductActivityType && soldGoodsTypeOptions.length === 0 && (
                <p className="text-gray-500 text-sm mt-1">No options available for this activity type</p>
              )}
            </div>

            {/* Transportation Vehicle Category */}
            <div>
              <div className="flex items-center gap-2 ">
                <label className="field-label">Transportation Vehicle Category</label>
                <Tippy content="Please specify the vehicle category in which the sold goods were transported / distributed."
                  placement="top">
                  <button
                    type="button"
                    className="w-5 h-5 mb-1 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium hover:bg-blue-200 transition-colors"
                    aria-label="Information about vehicle category">
                    i
                  </button>
                </Tippy>
              </div>
              <Select
                name="transportationVehicleCategory"
                value={formData.transportationVehicleCategory}
                options={transportationVehicleCategoryOptions}
                onChange={handleSelectChange}
                placeholder="Select Vehicle Category"
                isDisabled={isView}
              />
              {errors.transportationVehicleCategory && (
                <p className="text-red-500 text-sm mt-1">{errors.transportationVehicleCategory}</p>
              )}
            </div>

            {/* Transportation Vehicle Type */}
            {shouldShowVehicleType() && (
              <div>
                <div className="flex items-center gap-2 ">
                  <label className="field-label">Transportation Vehicle Type</label>
                  <Tippy content="Please specify the type of transportation vehicle used to deliver the sold goods."
                    placement="top">
                    <button
                      type="button"
                      className="w-5 h-5 mb-1 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium hover:bg-blue-200 transition-colors"
                      aria-label="Information about vehicle type">
                      i
                    </button>
                  </Tippy>
                </div>
                <Select
                  name="transportationVehicleType"
                  value={formData.transportationVehicleType}
                  options={transportationVehicleTypeOptions[formData.transportationVehicleCategory?.value] || []}
                  onChange={handleSelectChange}
                  placeholder="Select Vehicle Type"
                  isDisabled={isView}
                />
                {errors.transportationVehicleType && (
                  <p className="text-red-500 text-sm mt-1">{errors.transportationVehicleType}</p>
                )}
              </div>
            )}

            {/* Weight Loaded */}
            <div>
              <div className="flex items-center gap-2 ">
                <label className="field-label">Weight Loaded</label>
                <Tippy content="Please specify the total weight of the sold goods."
                  placement="top">
                  <button
                    type="button"
                    className="w-5 h-5 mb-1 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium hover:bg-blue-200 transition-colors"
                    aria-label="Information about weight">
                    i
                  </button>
                </Tippy>
              </div>
              <div className="grid grid-cols-[14fr_1fr]">
                <InputGroup
                  type="number"
                  name="weightLoaded"
                  value={formData.weightLoaded}
                  onChange={handleInputChange}
                  placeholder="Enter Value"
                  className="input-field rounded-r-none"
                  disabled={isView}
                />
                <div className="flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-100">
                  tonnes
                </div>
              </div>
              {errors.weightLoaded && (
                <p className="text-red-500 text-sm mt-1">{errors.weightLoaded}</p>
              )}
            </div>

            {/* Distance Travelled */}
            <div>
              <div className="flex items-center gap-2 ">
                <label className="field-label">Distance Travelled </label>
                <Tippy content="Please specify the distance travelled by the vehicle to transport / distribute the sold goods."
                  placement="top">
                  <button
                    type="button"
                    className="w-5 h-5 mb-1 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium hover:bg-blue-200 transition-colors"
                    aria-label="Information about distance">
                    i
                  </button>
                </Tippy>
              </div>
              <div className="grid grid-cols-[14fr_1fr]">
                <InputGroup
                  type="number"
                  name="distanceTravelled"
                  value={formData.distanceTravelled}
                  onChange={handleInputChange}
                  placeholder="e.g., 1000"
                  className="input-field rounded-r-none"
                  disabled={isView}
                />
                <div className="flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-100">
                  km
                </div>
              </div>
              {errors.distanceTravelled && (
                <p className="text-red-500 text-sm mt-1">{errors.distanceTravelled}</p>
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
            <InputGroup
              type="textarea" name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter Remarks"
              className="border-[2px] border-gray-400 rounded-md"
              disabled={isView}
            />
          </div>

          {/* Buttons */}
          <div className="col-span-full flex justify-end gap-4 pt-6">
            <Button
              text={isView ? "Back" : "Cancel"}
              className={isView ? "btn-primary" : "btn-light"}
              type="button"
              onClick={() => navigate("/Downstream-Transportation")}
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

export default DownstreamTransportationFormPage;