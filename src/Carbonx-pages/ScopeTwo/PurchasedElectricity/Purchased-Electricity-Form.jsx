import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CustomSelect from "@/components/ui/Select";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { qualityControlOptions } from "@/constant/scope1/options";
import { gridStationOptions, unitOptions } from "@/constant/scope2/options";
import { calculatePurchasedElectricity } from "@/utils/scope2/calculate-purchased-electricity";
import { GridStationEmissionFactors } from "@/constant/scope2/purchased-electricity"

const PurchasedElectricityFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const mode = location.state?.mode || "add";
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const methodOptions = [
    { value: "location_based", label: "Location Based Method" },
    { value: "market_based", label: "Market Based Method" },
  ];

  const [formData, setFormData] = useState({
    method: null,
    buildingId: null,
    unit: { value: "kWh", label: "kWh" },
    totalElectricity: "",
    totalGrossElectricityGrid: "",
    gridStation: null,
    totalOtherSupplierElectricity: "",
    qualityControl: null,
    remarks: "",
    totalPurchasedElectricity: "",
    totalGrossElectricityGridMarket: "",
    gridStationMarket: null,
    hasSolarPanels: false,
    purchasesSupplierSpecific: false,
    hasPPA: false,
    hasRenewableAttributes: false,
    totalOnsiteSolarConsumption: "",
    solarRetainedUnderRECs: "",
    solarConsumedButSold: "",
    supplierSpecificElectricity: "",
    hasSupplierEmissionFactor: false,
    dontHaveSupplierEmissionFactor: false,
    supplierEmissionFactor: "",
    ppaElectricity: "",
    hasPPAEmissionFactor: false,
    hasPPAValidInstruments: false,
    ppaEmissionFactor: "",
    renewableAttributesElectricity: "",
    calculatedEmissionKgCo2e: "",
    calculatedEmissionTCo2e: "",
    calculatedEmissionMarketKgCo2e: "",
    calculatedEmissionMarketTCo2e: "",
  });

  const [buildingOptions, setBuildingOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const formatEmission = (num) => {
    const rounded = Number(num.toFixed(5));
    if (rounded !== 0 && (Math.abs(rounded) < 0.0001 || Math.abs(rounded) >= 1e6)) {
      return rounded.toExponential(5);
    }
    return rounded;
  };


  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/building/Get-All-Buildings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setBuildingOptions(res.data?.data?.buildings?.map((b) => ({ value: b._id, label: b.buildingName })) || []);
      } catch {
        toast.error("Failed to load buildings");
      }
    };
    fetchBuildings();
  }, []);

  useEffect(() => {
    if (isEdit || isView) {
      const fetchRecord = async () => {
        try {
          const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/Purchased-Electricity/get/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });
          const data = res.data?.data;
          if (data) {
            setFormData({
              method: data.method ? { value: data.method, label: data.method } : null,
              buildingId: data.buildingId ? { value: data.buildingId._id, label: data.buildingId.buildingName } : null,
              unit: { value: data.unit || "kWh", label: data.unit || "kWh" },
              totalElectricity: data.totalElectricity || "",
              totalGrossElectricityGrid: data.totalGrossElectricityGrid || "",
              gridStation: data.gridStation ? { value: data.gridStation, label: data.gridStation } : null,
              totalOtherSupplierElectricity: data.totalOtherSupplierElectricity || "",
              qualityControl: data.qualityControl ? { value: data.qualityControl, label: data.qualityControl } : null,
              remarks: data.remarks || "",
              totalPurchasedElectricity: data.totalPurchasedElectricity || "",
              totalGrossElectricityGridMarket: data.totalGrossElectricityGridMarket || "",
              gridStationMarket: data.gridStationMarket ? { value: data.gridStationMarket, label: data.gridStationMarket } : null,
              hasSolarPanels: data.hasSolarPanels || false,
              purchasesSupplierSpecific: data.purchasesSupplierSpecific || false,
              hasPPA: data.hasPPA || false,
              hasRenewableAttributes: data.hasRenewableAttributes || false,
              totalOnsiteSolarConsumption: data.totalOnsiteSolarConsumption || "",
              solarRetainedUnderRECs: data.solarRetainedUnderRECs || "",
              solarConsumedButSold: data.solarConsumedButSold || "",
              supplierSpecificElectricity: data.supplierSpecificElectricity || "",
              hasSupplierEmissionFactor: data.hasSupplierEmissionFactor || false,
              dontHaveSupplierEmissionFactor: data.dontHaveSupplierEmissionFactor || false,
              supplierEmissionFactor: data.supplierEmissionFactor || "",
              ppaElectricity: data.ppaElectricity || "",
              hasPPAEmissionFactor: data.hasPPAEmissionFactor || false,
              hasPPAValidInstruments: data.hasPPAValidInstruments || false,
              ppaEmissionFactor: data.ppaEmissionFactor || "",
              renewableAttributesElectricity: data.renewableAttributesElectricity || "",
              calculatedEmissionKgCo2e: data.calculatedEmissionKgCo2e || "",
              calculatedEmissionTCo2e: data.calculatedEmissionTCo2e || "",
              calculatedEmissionMarketKgCo2e: data.calculatedEmissionMarketKgCo2e || "",
              calculatedEmissionMarketTCo2e: data.calculatedEmissionMarketTCo2e || "",
            });
          }
        } catch {
          toast.error("Failed to fetch record details");
        }
      };
      fetchRecord();
    }
  }, [id, isEdit, isView]);
  // Add this useEffect after your existing useEffects
  useEffect(() => {
    // Only calculate if we have the minimum required data
    if (formData.method) {
      triggerCalculation();
    }
  }, [
    formData.method,
    formData.unit,
    formData.totalElectricity,
    formData.totalGrossElectricityGrid,
    formData.totalOtherSupplierElectricity,
    formData.gridStation,
    formData.totalPurchasedElectricity,
    formData.totalGrossElectricityGridMarket,
    formData.gridStationMarket,
    formData.solarRetainedUnderRECs,
    formData.solarConsumedButSold,
    formData.supplierSpecificElectricity,
    formData.supplierEmissionFactor,
    formData.hasSupplierEmissionFactor,
    formData.ppaElectricity,
    formData.ppaEmissionFactor,
    formData.hasPPAEmissionFactor,
    formData.renewableAttributesElectricity,
  ]);

  const triggerCalculation = () => {
    // Pass the actual method value, not the object
    const calculationData = {
      ...formData,
      method: formData.method?.value,
      unit: formData.unit?.value || "kWh",
      gridStation: formData.gridStation?.value,
      // gridStationMarket: formData.gridStationMarket?.value,
    };

    const result = calculatePurchasedElectricity(calculationData, GridStationEmissionFactors);

    if (result) {
      const formattedKg = formatEmission(result.calculatedEmissionKgCo2e);
      const formattedT = formatEmission(result.calculatedEmissionTCo2e);
      const formattedMarketKg = result.calculatedEmissionMarketKgCo2e
        ? formatEmission(result.calculatedEmissionMarketKgCo2e)
        : null;
       const formattedMarketT = result.calculatedEmissionMarketTCo2e
        ? formatEmission(result.calculatedEmissionMarketTCo2e)
        : null;

      setFormData((prev) => ({
        ...prev,
        calculatedEmissionKgCo2e: formattedKg,
        calculatedEmissionTCo2e: formattedT,
        calculatedEmissionMarketKgCo2e: formattedMarketKg,
         calculatedEmissionMarketTCo2e: formattedMarketT,
      }));

      toast.info(`Calculated Emissions (location_based): ${formattedKg} kg CO₂e (${formattedT} t CO₂e)
                  Calculated Emissions (Market_based): ${formattedMarketKg} kg CO₂e (${formattedMarketT} t CO₂e)`);
    }
  };
  const handleInputChange = (e) => {
    if (isView) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (name, value) => {
    if (isView) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  const handleToggleChange = (name) => {
    if (isView) return;
    setFormData((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleCheckboxChange = (name, exclusiveGroup = []) => {
    if (isView) return;
    setFormData((prev) => {
      const newState = { ...prev, [name]: !prev[name] };
      exclusiveGroup.forEach((field) => {
        if (field !== name) newState[field] = false;
      });
      return newState;
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.method) newErrors.method = "Please select a method";
    if (!formData.buildingId) newErrors.buildingId = "Building is required";

    if (formData.method?.value === "location_based") {
      if (!formData.totalElectricity) newErrors.totalElectricity = "Required";
      if (!formData.totalGrossElectricityGrid) newErrors.totalGrossElectricityGrid = "Required";
      if (!formData.gridStation) newErrors.gridStation = "Required";
      if (!formData.totalOtherSupplierElectricity) newErrors.totalOtherSupplierElectricity = "Required";
      if (!formData.qualityControl) newErrors.qualityControl = "Required";
    }

    if (formData.method?.value === "market_based") {
      if (!formData.totalPurchasedElectricity) newErrors.totalPurchasedElectricity = "Required";
      if (!formData.totalGrossElectricityGrid) newErrors.totalGrossElectricityGrid = "Required";
      if (!formData.gridStation) newErrors.gridStation = "Required";

      if (formData.hasSolarPanels) {
        if (!formData.totalOnsiteSolarConsumption) newErrors.totalOnsiteSolarConsumption = "Required";
        if (!formData.solarRetainedUnderRECs) newErrors.solarRetainedUnderRECs = "Required";
        if (!formData.solarConsumedButSold) newErrors.solarConsumedButSold = "Required";
      }
      if (formData.purchasesSupplierSpecific) {
        if (!formData.supplierSpecificElectricity) newErrors.supplierSpecificElectricity = "Required";
        if (formData.hasSupplierEmissionFactor && !formData.supplierEmissionFactor) newErrors.supplierEmissionFactor = "Required";
      }
      if (formData.hasPPA) {
        if (!formData.ppaElectricity) newErrors.ppaElectricity = "Required";
        if (formData.hasPPAEmissionFactor && !formData.ppaEmissionFactor) newErrors.ppaEmissionFactor = "Required";
      }
      if (formData.hasRenewableAttributes && !formData.renewableAttributesElectricity) newErrors.renewableAttributesElectricity = "Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView || !validate()) {
      if (!isView) toast.error("Please fill all required fields");
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast.error("User not found. Please log in again.");
      return;
    }

    const payload = {
      method: formData.method?.value || null,
      buildingId: formData.buildingId?.value || null,
      unit: formData.unit?.value || null,
      totalElectricity: formData.totalElectricity || null,
      totalGrossElectricityGrid: formData.totalGrossElectricityGrid || null,
      gridStation: formData.gridStation?.value || null,
      totalOtherSupplierElectricity: formData.totalOtherSupplierElectricity || null,
      qualityControl: formData.qualityControl?.value || null,
      remarks: formData.remarks || null,
      totalPurchasedElectricity: formData.totalPurchasedElectricity || null,
      totalGrossElectricityGridMarket: formData.totalGrossElectricityGridMarket || null,
      gridStationMarket: formData.gridStationMarket?.value || null,
      hasSolarPanels: formData.hasSolarPanels || false,
      purchasesSupplierSpecific: formData.purchasesSupplierSpecific || false,
      hasPPA: formData.hasPPA || false,
      hasRenewableAttributes: formData.hasRenewableAttributes || false,
      totalOnsiteSolarConsumption: formData.totalOnsiteSolarConsumption || null,
      solarRetainedUnderRECs: formData.solarRetainedUnderRECs || null,
      solarConsumedButSold: formData.solarConsumedButSold || null,
      supplierSpecificElectricity: formData.supplierSpecificElectricity || null,
      hasSupplierEmissionFactor: formData.hasSupplierEmissionFactor || false,
      dontHaveSupplierEmissionFactor: formData.dontHaveSupplierEmissionFactor || false,
      supplierEmissionFactor: formData.supplierEmissionFactor || null,
      ppaElectricity: formData.ppaElectricity || null,
      hasPPAEmissionFactor: formData.hasPPAEmissionFactor || false,
      hasPPAValidInstruments: formData.hasPPAValidInstruments || false,
      ppaEmissionFactor: formData.ppaEmissionFactor || null,
      renewableAttributesElectricity: formData.renewableAttributesElectricity || null,
      createdBy: userId,
      updatedBy: userId,
      calculatedEmissionKgCo2e: formData.calculatedEmissionKgCo2e || null,
      calculatedEmissionTCo2e: formData.calculatedEmissionTCo2e || null,
      calculatedEmissionMarketKgCo2e: formData.calculatedEmissionMarketKgCo2e || null,
      calculatedEmissionMarketTCo2e: formData.calculatedEmissionMarketTCo2e || null,

    };

    try {
      const url = isEdit
        ? `${process.env.REACT_APP_BASE_URL}/Purchased-Electricity/update/${id}`
        : `${process.env.REACT_APP_BASE_URL}/Purchased-Electricity/Create`;

      await axios[isEdit ? 'put' : 'post'](url, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      toast.success(`Record ${isEdit ? 'updated' : 'added'} successfully!`);
      navigate("/Purchased-Electricity");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const selectedMethod = formData.method?.value;
  const selectedUnit = formData.unit?.label || "kWh";


  return (
    <div>
      <Card title={`${isView ? "View" : isEdit ? "Edit" : "Add"} Purchased Electricity Record`}>
        <div className="text-slate-700 leading-relaxed mb-2 bg-gray-100 rounded-lg border-l-4 border-primary-400 p-2 pl-4 m-4">
          <p className="text-gray-700">
            Purchased electricity refers to electrical energy bought from external sources such as grid stations, suppliers, or under power purchase agreements (PPAs) for organizational use.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid gap-6">
          {/* Method Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="field-label">Method *</label>
              <CustomSelect
                name="method"
                options={methodOptions}
                value={formData.method}
                onChange={(value) => handleSelectChange("method", value)}
                placeholder="Select Method"
                isDisabled={isView}
              />
              {errors.method && <p className="text-red-500 text-sm">{errors.method}</p>}
            </div>

            <div>
              <label className="field-label">Site / Building Name *</label>
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
          </div>

          {/* LOCATION BASED METHOD FIELDS */}
          {selectedMethod === "location_based" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="field-label">Total Electricity Consumption *</label>
                  <input
                    type="number"
                    name="totalElectricity"
                    value={formData.totalElectricity}
                    onChange={handleInputChange}
                    placeholder="Enter value"
                    className="border-[2px] w-full h-10 p-2 rounded-md"
                    disabled={isView}
                  />
                  {errors.totalElectricity && (
                    <p className="text-red-500 text-sm">{errors.totalElectricity}</p>
                  )}
                </div>

                <div>
                  <label className="field-label">Unit *</label>
                  <CustomSelect
                    name="unit"
                    options={unitOptions}
                    value={formData.unit}
                    onChange={(value) => handleSelectChange("unit", value)}
                    isDisabled={isView}
                  />
                </div>

                <div>
                  <label className="field-label">Total Gross Electricity Purchased from Grid Station ({selectedUnit}) *</label>
                  <input
                    type="number"
                    name="totalGrossElectricityGrid"
                    value={formData.totalGrossElectricityGrid}
                    onChange={handleInputChange}
                    placeholder="Enter value"
                    className="border-[2px] w-full h-10 p-2 rounded-md"
                    disabled={isView}
                  />
                  {errors.totalGrossElectricityGrid && (
                    <p className="text-red-500 text-sm">{errors.totalGrossElectricityGrid}</p>
                  )}
                </div>

                <div>
                  <label className="field-label">Grid Station *</label>
                  <CustomSelect
                    name="gridStation"
                    options={gridStationOptions}
                    value={formData.gridStation}
                    onChange={(value) => handleSelectChange("gridStation", value)}
                    placeholder="Select Grid Station"
                    isDisabled={isView}
                  />
                  {errors.gridStation && <p className="text-red-500 text-sm">{errors.gridStation}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="field-label">Total Other Supplier Specific Electricity Purchased or Under PPA ({selectedUnit}) *</label>
                  <input
                    type="number"
                    name="totalOtherSupplierElectricity"
                    value={formData.totalOtherSupplierElectricity}
                    onChange={handleInputChange}
                    placeholder="Enter value"
                    className="border-[2px] w-full h-10 p-2 rounded-md"
                    disabled={isView}
                  />
                  {errors.totalOtherSupplierElectricity && (
                    <p className="text-red-500 text-sm">{errors.totalOtherSupplierElectricity}</p>
                  )}
                </div>

                <div>
                  <label className="field-label">Quality Control *</label>
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
            </>
          )}

          {/* MARKET BASED METHOD FIELDS */}
          {selectedMethod === "market_based" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="field-label">Total Purchased Electricity (Grid / Supplier Specific / PPA) *</label>
                  <input
                    type="number"
                    name="totalPurchasedElectricity"
                    value={formData.totalPurchasedElectricity}
                    onChange={handleInputChange}
                    placeholder="Enter value"
                    className="border-[2px] w-full h-10 p-2 rounded-md"
                    disabled={isView}
                  />
                  {errors.totalPurchasedElectricity && (
                    <p className="text-red-500 text-sm">{errors.totalPurchasedElectricity}</p>
                  )}
                </div>

                <div>
                  <label className="field-label">Unit *</label>
                  <CustomSelect
                    name="unit"
                    options={unitOptions}
                    value={formData.unit}
                    onChange={(value) => handleSelectChange("unit", value)}
                    isDisabled={isView}
                  />
                </div>

                <div>
                  <label className="field-label">Total Gross Electricity Purchased from Grid Station ({selectedUnit}) *</label>
                  <input
                    type="number"
                    name="totalGrossElectricityGrid"
                    value={formData.totalGrossElectricityGrid}
                    onChange={handleInputChange}
                    placeholder="Enter value"
                    className="border-[2px] w-full h-10 p-2 rounded-md"
                    disabled={isView}
                  />
                  {errors.totalGrossElectricityGrid && (
                    <p className="text-red-500 text-sm">{errors.totalGrossElectricityGrid}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="field-label">Grid Station *</label>
                  <CustomSelect
                    name="gridStation"
                    options={gridStationOptions}
                    value={formData.gridStation}
                    onChange={(value) => handleSelectChange("gridStation", value)}
                    placeholder="Select Grid Station"
                    isDisabled={isView}
                  />
                  {errors.gridStation && <p className="text-red-500 text-sm">{errors.gridStation}</p>}
                </div>
              </div>

              {/* TOGGLE 1: Solar Panels */}
              <div className="border-t pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasSolarPanels}
                      onChange={() => handleToggleChange("hasSolarPanels")}
                      className="sr-only peer"
                      disabled={isView}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <span className="text-sm font-medium">
                    Do you have your own solar panels or any other renewable electricity generation plant installed at your facility that is retained by you under valid renewable energy instruments?
                  </span>
                </div>

                {formData.hasSolarPanels && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ml-8 mt-4">
                    <div>
                      <label className="field-label">What is the total onsite solar electricity consumption? ({selectedUnit}) *</label>
                      <input
                        type="number"
                        name="totalOnsiteSolarConsumption"
                        value={formData.totalOnsiteSolarConsumption}
                        onChange={handleInputChange}
                        placeholder="Enter value"
                        className="border-[2px] w-full h-10 p-2 rounded-md"
                        disabled={isView}
                      />
                      {errors.totalOnsiteSolarConsumption && (
                        <p className="text-red-500 text-sm">{errors.totalOnsiteSolarConsumption}</p>
                      )}
                    </div>

                    <div>
                      <label className="field-label">How much solar electricity is retained by you under valid RECs or any other energy attributes? ({selectedUnit}) *</label>
                      <input
                        type="number"
                        name="solarRetainedUnderRECs"
                        value={formData.solarRetainedUnderRECs}
                        onChange={handleInputChange}
                        placeholder="Enter value"
                        className="border-[2px] w-full h-10 p-2 rounded-md"
                        disabled={isView}
                      />
                      {errors.solarRetainedUnderRECs && (
                        <p className="text-red-500 text-sm">{errors.solarRetainedUnderRECs}</p>
                      )}
                    </div>

                    <div>
                      <label className="field-label">How much solar electricity is consumed by you but its renewable instruments or attributes is sold by you to another entity? ({selectedUnit}) *</label>
                      <input
                        type="number"
                        name="solarConsumedButSold"
                        value={formData.solarConsumedButSold}
                        onChange={handleInputChange}
                        placeholder="Enter value"
                        className="border-[2px] w-full h-10 p-2 rounded-md"
                        disabled={isView}
                      />
                      {errors.solarConsumedButSold && (
                        <p className="text-red-500 text-sm">{errors.solarConsumedButSold}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* TOGGLE 2: Supplier Specific */}
              <div className="border-t pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.purchasesSupplierSpecific}
                      onChange={() => handleToggleChange("purchasesSupplierSpecific")}
                      className="sr-only peer"
                      disabled={isView}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <span className="text-sm font-medium">
                    Do you purchase supplier specific electricity?
                  </span>
                </div>

                {formData.purchasesSupplierSpecific && (
                  <div className="ml-8 mt-4 space-y-4">
                    <div>
                      <label className="field-label">How much electricity from total electricity consumption is purchased from specific supplier under contractual instrument? ({selectedUnit}) *</label>
                      <input
                        type="number"
                        name="supplierSpecificElectricity"
                        value={formData.supplierSpecificElectricity}
                        onChange={handleInputChange}
                        placeholder="Enter value"
                        className="border-[2px] w-full h-10 p-2 rounded-md"
                        disabled={isView}
                      />
                      {errors.supplierSpecificElectricity && (
                        <p className="text-red-500 text-sm">{errors.supplierSpecificElectricity}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.hasSupplierEmissionFactor}
                          onChange={() => handleCheckboxChange("hasSupplierEmissionFactor", ["hasSupplierEmissionFactor", "dontHaveSupplierEmissionFactor"])}
                          className="w-4 h-4"
                          disabled={isView}
                        />
                        <span className="text-sm">Do you have the supplier specific emission factor in kgCO₂e/kWh for purchased supplier specific electricity under contractual instrument?</span>
                      </div>

                      {formData.hasSupplierEmissionFactor && (
                        <div className="ml-7">
                          <label className="field-label">Emission Factor (kgCO₂e/kWh) *</label>
                          <input
                            type="number"
                            name="supplierEmissionFactor"
                            value={formData.supplierEmissionFactor}
                            onChange={handleInputChange}
                            placeholder="Enter emission factor"
                            className="border-[2px] w-full h-10 p-2 rounded-md"
                            disabled={isView}
                          />
                          {errors.supplierEmissionFactor && (
                            <p className="text-red-500 text-sm">{errors.supplierEmissionFactor}</p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.dontHaveSupplierEmissionFactor}
                          onChange={() => handleCheckboxChange("dontHaveSupplierEmissionFactor", ["hasSupplierEmissionFactor", "dontHaveSupplierEmissionFactor"])}
                          className="w-4 h-4"
                          disabled={isView}
                        />
                        <span className="text-sm">I don't have supplier specific emission factor</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* TOGGLE 3: PPA */}
              <div className="border-t pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasPPA}
                      onChange={() => handleToggleChange("hasPPA")}
                      className="sr-only peer"
                      disabled={isView}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <span className="text-sm font-medium">
                    Do you purchase electricity under power purchase agreements (PPA)?
                  </span>
                </div>

                {formData.hasPPA && (
                  <div className="ml-8 mt-4 space-y-4">
                    <div>
                      <label className="field-label">How much electricity from total electricity consumption is purchased or covered under power purchase agreement (PPA)? ({selectedUnit}) *</label>
                      <input
                        type="number"
                        name="ppaElectricity"
                        value={formData.ppaElectricity}
                        onChange={handleInputChange}
                        placeholder="Enter value"
                        className="border-[2px] w-full h-10 p-2 rounded-md"
                        disabled={isView}
                      />
                      {errors.ppaElectricity && (
                        <p className="text-red-500 text-sm">{errors.ppaElectricity}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.hasPPAEmissionFactor}
                          onChange={() => handleCheckboxChange("hasPPAEmissionFactor", ["hasPPAEmissionFactor", "hasPPAValidInstruments"])}
                          className="w-4 h-4"
                          disabled={isView}
                        />
                        <span className="text-sm">Do you have the supplier specific emission factor in kgCO₂e/kWh for purchased electricity under power purchased agreement (PPA)?</span>
                      </div>

                      {formData.hasPPAEmissionFactor && (
                        <div className="ml-7">
                          <label className="field-label">PPA Emission Factor (kgCO₂e/kWh) *</label>
                          <input
                            type="number"
                            name="ppaEmissionFactor"
                            value={formData.ppaEmissionFactor}
                            onChange={handleInputChange}
                            placeholder="Enter emission factor"
                            className="border-[2px] w-full h-10 p-2 rounded-md"
                            disabled={isView}
                          />
                          {errors.ppaEmissionFactor && (
                            <p className="text-red-500 text-sm">{errors.ppaEmissionFactor}</p>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.hasPPAValidInstruments}
                          onChange={() => handleCheckboxChange("hasPPAValidInstruments", ["hasPPAEmissionFactor", "hasPPAValidInstruments"])}
                          className="w-4 h-4"
                          disabled={isView}
                        />
                        <span className="text-sm">Or do you have the valid energy instruments or renewable energy attributes (REC, REC-I) etc. under power purchased agreements (PPA)?</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* TOGGLE 4: Renewable Attributes */}
              <div className="border-t pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasRenewableAttributes}
                      onChange={() => handleToggleChange("hasRenewableAttributes")}
                      className="sr-only peer"
                      disabled={isView}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <span className="text-sm font-medium">
                    Do you have any other types of renewable energy attributes, market-based instruments or renewable energy certificates (RECs) that are separate from power purchase agreements (PPA) and from those covering on-site renewable electricity generation?
                  </span>
                </div>
                {formData.hasRenewableAttributes && (
                  <div className="ml-8 mt-4">
                    <div>
                      <label className="field-label">How much electricity from total electricity consumption (separated from that which is covered in Solar generation and PPA) is covered under valid renewable energy attributes or market based instruments? ({selectedUnit}) *</label>
                      <input
                        type="number"
                        name="renewableAttributesElectricity"
                        value={formData.renewableAttributesElectricity}
                        onChange={handleInputChange}
                        placeholder="Enter value"
                        className="border-[2px] w-full h-10 p-2 rounded-md"
                        disabled={isView}
                      />
                      {errors.renewableAttributesElectricity && (
                        <p className="text-red-500 text-sm">{errors.renewableAttributesElectricity}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          {/* Buttons */}
          <div className="col-span-full flex justify-end gap-4 pt-6 border-t">
            <Button
              text={isView ? "Back" : "Cancel"}
              className={isView ? "btn-primary" : "btn-light"}
              type="button"
              onClick={() => navigate("/Purchased-Electricity")}
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
export default PurchasedElectricityFormPage;
