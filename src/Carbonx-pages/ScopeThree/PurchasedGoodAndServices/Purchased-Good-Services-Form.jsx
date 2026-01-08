import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CustomSelect from "@/components/ui/Select";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { qualityControlOptions } from "@/constant/scope1/options";
import {
  stakeholderOptions,
  purchaseCategoryOptions,
  purchasedGoodsActivityTypes,
  purchasedServicesActivityTypes,
  purchasedGoodsServicesTypes,
  currencyUnitOptions
} from "@/constant/scope3/options";
import { calculatePurchasedGoodsEmission } from "@/utils/Scope3/calculatePurchasedGoodsEmission"; // adjust path
import InputGroup from "@/components/ui/InputGroup";

const PurchasedGoodServicesFormPage = () => {
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
    purchaseCategory: null,
    purchasedActivityType: null,
    isCapitalGoods: false,
    purchasedGoodsServicesType: null,
    amountSpent: "",
    unit: { value: "USD", label: "$" },
    qualityControl: null,
    remarks: "",
  });

  const [buildingOptions, setBuildingOptions] = useState([]);
  const [activityTypeOptions, setActivityTypeOptions] = useState([]);
  const [goodsServicesTypeOptions, setGoodsServicesTypeOptions] = useState([]);
  const [errors, setErrors] = useState({});

  const capitalizeFirstLetter = (text) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };


  // Fetch Buildings
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

  // Fetch record for Edit/View mode
  useEffect(() => {
    if (isEdit || isView) {
      const fetchRecord = async () => {
        try {
          const res = await axios.get(
            `${process.env.REACT_APP_BASE_URL}/purchased-goods-services/get/${id}`,
            {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            }
          );
          const data = res.data?.data;
          if (data) {
            setFormData({
              buildingId: { value: data.buildingId?._id, label: data.buildingId?.buildingName },
              stakeholder: data.stakeholder
                ? { value: data.stakeholder, label: data.stakeholder }
                : null,
              purchaseCategory: { value: data.purchaseCategory, label: data.purchaseCategory },
              purchasedActivityType: { value: data.purchasedActivityType, label: data.purchasedActivityType },
              purchasedGoodsServicesType: { value: data.purchasedGoodsServicesType, label: data.purchasedGoodsServicesType },
              isCapitalGoods: data.isCapitalGoods ?? false,
              amountSpent: data.amountSpent || "",
              unit: { value: data.unit, label: data.unit },
              qualityControl: data.qualityControl ? { value: data.qualityControl, label: data.qualityControl } : null,
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

  // Update activity type options when purchase category changes
  useEffect(() => {
    if (formData.purchaseCategory) {
      if (formData.purchaseCategory.value === "Purchased Goods") {
        setActivityTypeOptions(purchasedGoodsActivityTypes);
      } else if (formData.purchaseCategory.value === "Purchased Services") {
        setActivityTypeOptions(purchasedServicesActivityTypes);
      }

      // Reset dependent fields when category changes
      if (!isView && !isEdit) {
        setFormData(prev => ({
          ...prev,
          purchasedActivityType: null,
          purchasedGoodsServicesType: null,
        }));
        setGoodsServicesTypeOptions([]);
      }
    } else {
      setActivityTypeOptions([]);
      setGoodsServicesTypeOptions([]);
    }
  }, [formData.purchaseCategory, isView, isEdit]);

  // Update goods/services type options when activity type changes
  useEffect(() => {
    if (formData.purchasedActivityType) {
      const typeOptions = purchasedGoodsServicesTypes[formData.purchasedActivityType.value] || [];
      setGoodsServicesTypeOptions(typeOptions);

      // Reset goods/services type when activity type changes
      if (!isView && !isEdit) {
        setFormData(prev => ({
          ...prev,
          purchasedGoodsServicesType: null,
        }));
      }
    } else {
      setGoodsServicesTypeOptions([]);
    }
  }, [formData.purchasedActivityType, isView, isEdit]);


  const handleInputChange = (e) => {
    if (isView) return;
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };

      // Calculate emissions if amountSpent or type changes
      if ((name === "amountSpent" || name === "purchasedGoodsServicesType")
        && updatedData.amountSpent && updatedData.purchasedGoodsServicesType) {
        const result = calculatePurchasedGoodsEmission({
          amountSpent: updatedData.amountSpent,
          purchasedGoodsServicesType: updatedData.purchasedGoodsServicesType.value,
        });

        if (result) {
          const formattedKg = result.calculatedEmissionKgCo2e;
          const formattedT = result.calculatedEmissionTCo2e;

          updatedData.calculatedEmissionKgCo2e = formattedKg;
          updatedData.calculatedEmissionTCo2e = formattedT;

          // Show toast
          // toast.info(`Emissions Calculated: ${formattedKg} kgCO2e / ${formattedT} tCO2e`);
        }
      }

      return updatedData;
    });

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  useEffect(() => {
    if (formData.purchaseCategory?.value === "Purchased Services") {
      setFormData(prev => ({
        ...prev,
        isCapitalGoods: false
      }));
    }
  }, [formData.purchaseCategory]);

  const handleSelectChange = (name, value) => {
    if (isView) return;
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };
      // Calculate emissions
      if (updatedData.amountSpent && updatedData.purchasedGoodsServicesType) {
        const result = calculatePurchasedGoodsEmission({
          amountSpent: updatedData.amountSpent,
          purchasedGoodsServicesType: updatedData.purchasedGoodsServicesType.value,
        });

        if (result) {
          const formattedKg = result.calculatedEmissionKgCo2e;
          const formattedT = result.calculatedEmissionTCo2e;
          updatedData.calculatedEmissionKgCo2e = formattedKg;
          updatedData.calculatedEmissionTCo2e = formattedT;
          // toast.info(`Emissions Calculated: ${formattedKg} kgCO2e / ${formattedT} tCO2e`);
        }
      }
      return updatedData;
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  // Validation
  const validate = () => {
    const newErrors = {};
    if (!formData.buildingId) newErrors.buildingId = "Building is required";
    if (!formData.stakeholder) newErrors.stakeholder = "Stakeholder/Department is required";
    if (!formData.purchaseCategory) newErrors.purchaseCategory = "Purchase Category is required";
    if (!formData.purchasedActivityType) newErrors.purchasedActivityType = "Purchased Activity Type is required";
    if (!formData.purchasedGoodsServicesType) newErrors.purchasedGoodsServicesType = "Purchased Goods or Services Type is required";
    if (!formData.amountSpent) newErrors.amountSpent = "Amount Spent is required";
    if (!formData.qualityControl) newErrors.qualityControl = "Quality Control is required";
    if (formData.amountSpent && Number(formData.amountSpent) < 0) {
      newErrors.amountSpent = "Value cannot be negative.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleNumberInputWheel = (e) => {
    e.target.blur();
    e.preventDefault(); // Add this to prevent scroll changing value
  };// onWheel={handleNumberInputWheel}

  // Submit
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
      stakeholder: formData.stakeholder?.value,
      purchaseCategory: formData.purchaseCategory?.value,
      purchasedActivityType: formData.purchasedActivityType?.value,
      purchasedGoodsServicesType: formData.purchasedGoodsServicesType?.value,
      isCapitalGoods: formData.isCapitalGoods,
      amountSpent: formData.amountSpent,
      unit: formData.unit?.value,
      qualityControl: formData.qualityControl?.value,
      remarks: capitalizeFirstLetter(formData.remarks),
      createdBy: userId,
      updatedBy: userId,
      calculatedEmissionKgCo2e: formData.calculatedEmissionKgCo2e || 0,
      calculatedEmissionTCo2e: formData.calculatedEmissionTCo2e || 0,
    };
    try {
      if (isEdit) {
        await axios.put(
          `${process.env.REACT_APP_BASE_URL}/purchased-goods-services/update/${id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          }
        );
        toast.success("Record updated successfully!");
      } else {
        await axios.post(
          `${process.env.REACT_APP_BASE_URL}/purchased-goods-services/create`,
          payload,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          }
        );
        toast.success("Record added successfully!");
      }
      navigate("/Purchased-Good-Services");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div>
      <Card title={`${isView ? "View" : isEdit ? "Edit" : "Add"} Purchased Goods and Services Record`}>
        <div className="text-slate-700 leading-relaxed mb-2 bg-gray-100 rounded-lg border-l-4 border-primary-400 p-2 pl-4 m-4">
          <p className="text-gray-700">
            This category includes all upstream (i.e., cradle-to-gate) emissions from the production of products purchased or acquired by the reporting company in the reporting year. Products include both goods (tangible products) and services (intangible products).           </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid gap-6">
          {/* Building and Stakeholder */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div>
              <label className="field-label">Stakeholder / Department *</label>
              <CustomSelect
                name="stakeholder"
                options={stakeholderOptions}
                value={formData.stakeholder}
                onChange={(value) => handleSelectChange("stakeholder", value)}
                placeholder="Select Stakeholder / Department"
                isDisabled={isView}
              />
              {errors.stakeholder && <p className="text-red-500 text-sm">{errors.stakeholder}</p>}
            </div>
          </div>

          {/* Purchase Category and Activity Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="field-label">Purchase Category *</label>
              <CustomSelect
                name="purchaseCategory"
                options={purchaseCategoryOptions}
                value={formData.purchaseCategory}
                onChange={(value) => handleSelectChange("purchaseCategory", value)}
                placeholder="Select Purchase Category"
                isDisabled={isView}
              />
              {errors.purchaseCategory && <p className="text-red-500 text-sm">{errors.purchaseCategory}</p>}
            </div>

            <div>
              <label className="field-label">Purchased Activity Type *</label>
              <CustomSelect
                name="purchasedActivityType"
                options={activityTypeOptions}
                value={formData.purchasedActivityType}
                onChange={(value) => handleSelectChange("purchasedActivityType", value)}
                placeholder="Select Activity Type"
                isDisabled={isView || !formData.purchaseCategory}
              />
              {errors.purchasedActivityType && <p className="text-red-500 text-sm">{errors.purchasedActivityType}</p>}
            </div>
          </div>

          {/* Goods/Services Type */}
          <div>
            <label className="field-label">
              {formData.purchaseCategory?.value === "Purchased Goods"
                ? "Purchased Goods Type *"
                : formData.purchaseCategory?.value === "Purchased Services"
                  ? "Purchased Services Type *"
                  : "Purchased Goods or Services Type *"}
            </label>
            <CustomSelect
              name="purchasedGoodsServicesType"
              options={goodsServicesTypeOptions}
              value={formData.purchasedGoodsServicesType}
              onChange={(value) => handleSelectChange("purchasedGoodsServicesType", value)}
              placeholder="Select Type"
              isDisabled={isView || !formData.purchasedActivityType}
            />
            {errors.purchasedGoodsServicesType && <p className="text-red-500 text-sm">{errors.purchasedGoodsServicesType}</p>}
          </div>

          {/* Capital Goods Toggle */}
          {formData.purchaseCategory?.value === "Purchased Goods" && (
            <div>
              <label className="field-label">
                Please specify whether the selected item is a capital good.
              </label>
              <div className="flex items-center gap-4 mt-2">
                <label className="inline-flex items-center cursor-pointer">
                  <InputGroup
                    type="checkbox"
                    checked={formData.isCapitalGoods}
                    onChange={(e) =>
                      !isView &&
                      setFormData((prev) => ({
                        ...prev,
                        isCapitalGoods: e.target.checked,
                      }))
                    }
                    className="sr-only peer"
                  />

                  <div className="relative w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-primary-300 
          rounded-full peer dark:bg-gray-700 peer-checked:bg-primary-600 after:content-[''] 
          after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 
          after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
          peer-checked:after:translate-x-full">
                  </div>
                </label>

                <span className="text-sm text-gray-700">
                  {formData.isCapitalGoods ? "Yes" : "No"}
                </span>
              </div>
            </div>
          )}

          {/* Amount Spent and Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="field-label">Amount Spent *</label>
              <InputGroup
                type="number"
                name="amountSpent"
                onWheel={handleNumberInputWheel}
                value={formData.amountSpent}
                onChange={handleInputChange}
                placeholder="Enter Amount"
                className="border-[2px] w-full h-10 p-2 rounded-md"
                disabled={isView}
              />
              {errors.amountSpent && <p className="text-red-500 text-sm">{errors.amountSpent}</p>}
            </div>

            <div>
              <label className="field-label">Unit *</label>
              <CustomSelect
                name="unit"
                options={currencyUnitOptions}
                placeholder={"Select Unit"}
                value={formData.unit}
                onChange={(value) => handleSelectChange("unit", value)}
                isDisabled={isView}
              />
            </div>
          </div>

          {/* Quality Control */}
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
            {errors.qualityControl && <p className="text-red-500 text-sm">{errors.qualityControl}</p>}
          </div>

          {/* Remarks */}
          <div>
            <label className="field-label">Remarks</label>
            <InputGroup
     type="textarea"          name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter Remarks"
              className="border-[2px] border-gray-400 rounded-md"
              disabled={isView}
            />
          </div>

          {/* Buttons */}
          <div className="col-span-full flex justify-end gap-4 pt-6 border-t">
            <Button
              text={isView ? "Back" : "Cancel"}
              className={isView ? "btn-primary" : "btn-light"}
              type="button"
              onClick={() => navigate("/Purchased-Good-Services")}
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

export default PurchasedGoodServicesFormPage;