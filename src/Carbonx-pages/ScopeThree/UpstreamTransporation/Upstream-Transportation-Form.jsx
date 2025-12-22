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
// import { calculateUpstreamTransportationEmission } from "@/utils/scope1/calculate-upstream-transportation-emission";

const UpstreamTransportationFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const mode = location.state?.mode || "add";
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  // Transportation and Distribution Category Options
  const transportationCategoryOptions = [
    { value: "purchasedGoods", label: "Purchased Goods" },
    { value: "purchasedServices", label: "Purchased Third-party Transportation and Distribution Services" },
  ];

  // Purchased Goods Activity Type Options
  const purchasedGoodsActivityOptions = [
    { value: "vehicles", label: "Vehicles" },
    { value: "rawMaterials", label: "Raw Materials" },
  ];

  // Purchased Services Activity Type Options
  const purchasedServicesActivityOptions = [
    { value: "waterTransport", label: "Water transport services" },
    { value: "warehousingSupport", label: "Warehousing and support services for transportation" },
  ];

  // Purchased Goods Type Options
  const purchasedGoodsTypeOptions = [
    { value: "motorVehicles", label: "Motor vehicles, trailers and semi-trailers" },
    { value: "pharmaceutical", label: "Basic pharmaceutical products and pharmaceutical preparations" },
    { value: "otherGoods", label: "Other Goods" },
  ];

  // Transportation Vehicle Category Options
  const vehicleCategoryOptions = [
    { value: "vans", label: "Vans" },
    { value: "hqv", label: "Heavy Good Vehicles" },
    { value: "hqvRefrigerated", label: "Heavy Good Vehicles (Refrigerated)" },
    { value: "freightFlights", label: "Freight flights" },
    { value: "rail", label: "Rail" },
    { value: "seaTanker", label: "Sea tanker" },
    { value: "cargoShip", label: "Cargo Ship" },
  ];

  // Vehicle Type Options based on Category
  const vehicleTypeOptions = {
    freightFlights: [
      { value: "domestic", label: "Domestic" },
      { value: "international", label: "International" },
    ],
    seaTanker: [
      { value: "crudeTanker", label: "Crude tanker" },
      { value: "productsTanker", label: "Products tanker" },
      { value: "chemicalTanker", label: "Chemical tanker" },
      { value: "lngTanker", label: "LNG tanker" },
      { value: "lpgTanker", label: "LPG Tanker" },
    ],
    cargoShip: [
      { value: "bulkCarrier", label: "Bulk carrier" },
      { value: "generalCargo", label: "General cargo" },
      { value: "containerShip", label: "Container ship" },
      { value: "vehicleTransport", label: "Vehicle transport" },
      { value: "roroFerry", label: "RoRo-Ferry" },
      { value: "largeRoPax", label: "Large RoPax ferry" },
      { value: "refrigeratedCargo", label: "Refrigerated cargo" },
    ],
  };

  const [formData, setFormData] = useState({
    buildingId: null,
    stakeholderDepartment: null,
    transportationCategory: null, 
    activityType: null,
    purchasedGoodsType: null, 
    vehicleCategory: null, 
    vehicleType: null, 
    weightLoaded: "", 
    distanceTravelled: "", 
    amountSpent: "", 
    unit: "USD", 
    qualityControl: null,
    remarks: "",
    calculatedEmissionKgCo2e: "",
    calculatedEmissionTCo2e: "",
  });

  const [errors, setErrors] = useState({});
  const [buildingOptions, setBuildingOptions] = useState([]);
  const [activityTypeOptions, setActivityTypeOptions] = useState([]);

  // Calculate emissions whenever relevant fields change
  // useEffect(() => {
  //   if (isView) return;

  //   let result = null;
  //   const { transportationCategory } = formData;

  //   if (transportationCategory?.value === "purchasedGoods") {
  //     const { weightLoaded, distanceTravelled, vehicleCategory, vehicleType } = formData;
  //     if (weightLoaded && distanceTravelled && vehicleCategory) {
  //       result = calculateUpstreamTransportationEmission({
  //         transportationCategory: "purchasedGoods",
  //         weightLoaded: parseFloat(weightLoaded),
  //         distanceTravelled: parseFloat(distanceTravelled),
  //         vehicleCategory: vehicleCategory.value,
  //         vehicleType: vehicleType?.value,
  //       });
  //     }
  //   } else if (transportationCategory?.value === "purchasedServices") {
  //     const { amountSpent, activityType } = formData;
  //     if (amountSpent && activityType) {
  //       result = calculateUpstreamTransportationEmission({
  //         transportationCategory: "purchasedServices",
  //         amountSpent: parseFloat(amountSpent),
  //         activityType: activityType.value,
  //       });
  //     }
  //   }

  //   if (result) {
  //     const formatEmission = (num) => {
  //       const rounded = Number(num.toFixed(5));
  //       if (rounded !== 0 && (Math.abs(rounded) < 0.0001 || Math.abs(rounded) >= 1e6)) {
  //         return rounded.toExponential(5);
  //       }
  //       return rounded;
  //     };

  //     setFormData(prev => ({
  //       ...prev,
  //       calculatedEmissionKgCo2e: formatEmission(result.calculatedEmissionKgCo2e),
  //       calculatedEmissionTCo2e: formatEmission(result.calculatedEmissionTCo2e),
  //     }));
  //   }
  // }, [
  //   formData.transportationCategory,
  //   formData.weightLoaded,
  //   formData.distanceTravelled,
  //   formData.vehicleCategory,
  //   formData.vehicleType,
  //   formData.amountSpent,
  //   formData.activityType,
  //   isView
  // ]);

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
          `${process.env.REACT_APP_BASE_URL}/Upstream-Transportation/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = res.data?.data;

        // Set activity type options based on transportation category
        if (data.transportationCategory === "purchasedGoods") {
          setActivityTypeOptions(purchasedGoodsActivityOptions);
        } else if (data.transportationCategory === "purchasedServices") {
          setActivityTypeOptions(purchasedServicesActivityOptions);
        }

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
          transportationCategory:
            transportationCategoryOptions.find(
              (t) => t.value === data.transportationCategory
            ) || {
              label: data.transportationCategory,
              value: data.transportationCategory,
            },
          activityType:
            activityTypeOptions.find((a) => a.value === data.activityType) || {
              label: data.activityType,
              value: data.activityType,
            },
          purchasedGoodsType:
            purchasedGoodsTypeOptions.find((g) => g.value === data.purchasedGoodsType) || {
              label: data.purchasedGoodsType,
              value: data.purchasedGoodsType,
            },
          vehicleCategory:
            vehicleCategoryOptions.find((v) => v.value === data.vehicleCategory) || {
              label: data.vehicleCategory,
              value: data.vehicleCategory,
            },
          vehicleType: data.vehicleType
            ? vehicleTypeOptions[data.vehicleCategory]?.find(v => v.value === data.vehicleType) || null
            : null,
          weightLoaded: data.weightLoaded || "",
          distanceTravelled: data.distanceTravelled || "",
          amountSpent: data.amountSpent || "",
          unit: data.unit || "USD",
          qualityControl:
            processQualityControlOptions.find(
              (q) => q.value === data.qualityControl
            ) || { label: data.qualityControl, value: data.qualityControl },
          remarks: data.remarks || "",
          calculatedEmissionKgCo2e: data.calculatedEmissionKgCo2e || "",
          calculatedEmissionTCo2e: data.calculatedEmissionTCo2e || "",
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch record details");
      }
    };
    fetchById();
  }, [id, isAdd, buildingOptions]);

  // Handle dropdown changes
  const handleSelectChange = (value, { name }) => {
    if (isView) return;

    let updated = { ...formData, [name]: value };

    if (name === "transportationCategory") {
      // Reset dependent fields when category changes
      updated.activityType = null;
      updated.purchasedGoodsType = null;
      updated.vehicleCategory = null;
      updated.vehicleType = null;
      updated.weightLoaded = "";
      updated.distanceTravelled = "";
      updated.amountSpent = "";
      
      // Set activity type options based on category
      if (value?.value === "purchasedGoods") {
        setActivityTypeOptions(purchasedGoodsActivityOptions);
      } else if (value?.value === "purchasedServices") {
        setActivityTypeOptions(purchasedServicesActivityOptions);
      }
    }

    if (name === "vehicleCategory") {
      // Reset vehicle type when category changes
      updated.vehicleType = null;
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
    if (!formData.buildingId) newErrors.buildingId = "Building is required";
    if (!formData.stakeholderDepartment)
      newErrors.stakeholderDepartment = "Department is required";
    if (!formData.transportationCategory)
      newErrors.transportationCategory = "Transportation Category is required";
    if (!formData.activityType)
      newErrors.activityType = "Activity Type is required";

    // Validate based on category
    if (formData.transportationCategory?.value === "purchasedGoods") {
      if (!formData.purchasedGoodsType) newErrors.purchasedGoodsType = "Purchased Goods Type is required";
      if (!formData.vehicleCategory) newErrors.vehicleCategory = "Vehicle Category is required";
      if (!formData.weightLoaded) newErrors.weightLoaded = "Weight Loaded is required";
      if (!formData.distanceTravelled) newErrors.distanceTravelled = "Distance Travelled is required";
    } else if (formData.transportationCategory?.value === "purchasedServices") {
      if (!formData.amountSpent) newErrors.amountSpent = "Amount Spent is required";
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
      stakeholderDepartment: formData.stakeholderDepartment?.value,
      transportationCategory: formData.transportationCategory?.value,
      activityType: formData.activityType?.value,
      purchasedGoodsType: formData.purchasedGoodsType?.value,
      vehicleCategory: formData.vehicleCategory?.value,
      vehicleType: formData.vehicleType?.value,
      weightLoaded: formData.weightLoaded,
      distanceTravelled: formData.distanceTravelled,
      amountSpent: formData.amountSpent,
      unit: formData.unit,
      qualityControl: formData.qualityControl?.value,
      remarks: capitalizeFirstLetter(formData.remarks),
      calculatedEmissionKgCo2e: formData.calculatedEmissionKgCo2e,
      calculatedEmissionTCo2e: formData.calculatedEmissionTCo2e,
    };

    try {
      if (isEdit) {
        await axios.put(
          `${process.env.REACT_APP_BASE_URL}/Upstream-Transportation/${id}`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success("Record updated successfully!");
      } else {
        await axios.post(
          `${process.env.REACT_APP_BASE_URL}/Upstream-Transportation/Create`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success("Record added successfully!");
      }
      navigate("/Upstream-Transportation");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error saving record");
    }
  };

  // Helper to determine if vehicle type should be shown
  const shouldShowVehicleType = () => {
    const category = formData.vehicleCategory?.value;
    return category && ["freightFlights", "seaTanker", "cargoShip"].includes(category);
  };

  return (
    <div>
      <Card
        title={`${isView ? "View" : isEdit ? "Edit" : "Add"} Upstream Transportation Record`}
      >
        <div className="text-slate-700 leading-relaxed mb-2 bg-gray-100 rounded-lg border-l-4 border-primary-400 p-2 pl-4 m-4 justify-center">
          <p className="text-gray-700">
            This category includes emissions from the transportation and distribution of products purchased by the reporting company, in vehicles and facilities not owned or controlled by the company. It also covers third-party transportation and distribution services purchased by the reporting company in the reporting year, including inbound logistics, outbound logistics (e.g., of sold products) and transportation between the company's own facilities when performed by third-party logistics providers.
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
                placeholder="Select or Type Department"
                isDisabled={isView}
                allowCustomInput
              />
              {errors.stakeholderDepartment && (
                <p className="text-red-500 text-sm mt-1">{errors.stakeholderDepartment}</p>
              )}
            </div>

            {/* Transportation Category */}
            <div>
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
            </div>

            {/* Activity Type */}
            <div>
              <label className="field-label">Purchased Product Activity Type</label>
              <Select
                name="activityType"
                value={formData.activityType}
                options={activityTypeOptions}
                onChange={handleSelectChange}
                placeholder="Select Activity Type"
                isDisabled={isView}
              />
              {errors.activityType && (
                <p className="text-red-500 text-sm mt-1">{errors.activityType}</p>
              )}
            </div>

            {/* Purchased Goods Type (only for purchasedGoods category) */}
            {formData.transportationCategory?.value === "purchasedGoods" && (
              <div>
                <label className="field-label">Purchased Goods Type</label>
                <Select
                  name="purchasedGoodsType"
                  value={formData.purchasedGoodsType}
                  options={purchasedGoodsTypeOptions}
                  onChange={handleSelectChange}
                  placeholder="Select Goods Type"
                  isDisabled={isView}
                />
                {errors.purchasedGoodsType && (
                  <p className="text-red-500 text-sm mt-1">{errors.purchasedGoodsType}</p>
                )}
              </div>
            )}

            {/* Vehicle Category (only for purchasedGoods category) */}
            {formData.transportationCategory?.value === "purchasedGoods" && (
              <div>
                <label className="field-label">Transportation Vehicle Category</label>
                <Select
                  name="vehicleCategory"
                  value={formData.vehicleCategory}
                  options={vehicleCategoryOptions}
                  onChange={handleSelectChange}
                  placeholder="Select Vehicle Category"
                  isDisabled={isView}
                />
                {errors.vehicleCategory && (
                  <p className="text-red-500 text-sm mt-1">{errors.vehicleCategory}</p>
                )}
              </div>
            )}

            {/* Vehicle Type (only for specific categories) */}
            {formData.transportationCategory?.value === "purchasedGoods" && shouldShowVehicleType() && (
              <div>
                <label className="field-label">Transportation Vehicle Type</label>
                <Select
                  name="vehicleType"
                  value={formData.vehicleType}
                  options={vehicleTypeOptions[formData.vehicleCategory?.value] || []}
                  onChange={handleSelectChange}
                  placeholder="Select Vehicle Type"
                  isDisabled={isView}
                />
              </div>
            )}

            {/* Weight Loaded (only for purchasedGoods category) */}
            {formData.transportationCategory?.value === "purchasedGoods" && (
              <div>
                <label className="field-label">Weight Loaded</label>
                <div className="flex">
                  <input
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
            )}

            {/* Distance Travelled (only for purchasedGoods category) */}
            {formData.transportationCategory?.value === "purchasedGoods" && (
              <div>
                <label className="field-label">Distance Travelled</label>
                <div className="flex">
                  <input
                    type="number"
                    name="distanceTravelled"
                    value={formData.distanceTravelled}
                    onChange={handleInputChange}
                    placeholder="Enter Value"
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
            )}

            {/* Amount Spent (only for purchasedServices category) */}
            {formData.transportationCategory?.value === "purchasedServices" && (
              <div>
                <label className="field-label">Amount Spent</label>
                <div className="flex">
                  <input
                    type="number"
                    name="amountSpent"
                    value={formData.amountSpent}
                    onChange={handleInputChange}
                    placeholder="Enter Value"
                    className="input-field rounded-r-none"
                    disabled={isView}
                  />
                  <div className="flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-100">
                    {formData.unit}
                  </div>
                </div>
                {errors.amountSpent && (
                  <p className="text-red-500 text-sm mt-1">{errors.amountSpent}</p>
                )}
              </div>
            )}

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

            {/* Calculated Emissions (Display only) */}
            {formData.calculatedEmissionKgCo2e && (
              <>
                <div>
                  <label className="field-label">Calculated Emission (kg CO₂e)</label>
                  <input
                    type="text"
                    value={formData.calculatedEmissionKgCo2e}
                    readOnly
                    className="input-field bg-gray-100"
                  />
                </div>
                <div>
                  <label className="field-label">Calculated Emission (t CO₂e)</label>
                  <input
                    type="text"
                    value={formData.calculatedEmissionTCo2e}
                    readOnly
                    className="input-field bg-gray-100"
                  />
                </div>
              </>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="field-label">Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter remarks..."
              className="border p-2 rounded-md w-full"
              disabled={isView}
            />
          </div>

          {/* Buttons */}
          <div className="col-span-full flex justify-end gap-4 pt-6">
            <Button
              text={isView ? "Back" : "Cancel"}
              className={isView ? "btn-primary" : "btn-light"}
              type="button"
              onClick={() => navigate("/Upstream-Transportation")}
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

export default UpstreamTransportationFormPage;