import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import axios from "axios";
import { toast } from "react-toastify";
import Switch from "@/components/ui/Switch";
import Select from "@/components/ui/Select";
import InputGroup from "@/components/ui/InputGroup";

const buildingTypeOptions = [
  { value: "office", label: "Office" },
  { value: "warehouse", label: "Warehouse" },
  { value: "cold storage facility", label: "Cold Storage Facility" },
  { value: "data center", label: "Data Center" },
  { value: "hospital", label: "Hospital" },
  { value: "retail", label: "Retail" },
  { value: "mixed-use", label: "Mixed Use" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "commercial", label: "Commercial" },
  { value: "finishing", label: "Finishing" },
  { value: "processing", label: "Processing" },
  { value: "service building", label: "Service Building" },
  { value: "public/institutional", label: "Public/Institutional" },
  { value: "utility & infrastructure", label: "Utility & Infrastructure" },
  { value: "residential building", label: "Residential Building" },
];

const ownershipOptions = [
  { value: "owned", label: "Owned" },
  { value: "partially owned", label: "Partially Owned" },
  { value: "rented", label: "Rented" },
  { value: "partially rented", label: "Partially (Some Part) Rented" },

];

const BuildingFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = useState({});
  const mode = location.state?.mode || "add";
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const [countryOptions, setCountryOptions] = useState([]);

  const [formData, setFormData] = useState({
    buildingName: "",
    country: null,
    buildingLocation: "",
    buildingType: null,
    numberOfEmployees: "",
    operatingHours: "",
    buildingArea: "",
    ownership: null,
    electricityConsumption: "",
    heatingUsed: false,
    heatingType: "",
    coolingUsed: false,
    coolingType: "",
    steamUsed: false,
  });

  const capitalizeFirstLetter = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const [loading, setLoading] = useState(isViewMode || isEditMode);
  const capitalizeLabel = (value) =>
    value
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  // --- Fetch country list ---
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await axios.get("https://restcountries.com/v3.1/all?fields=name");
        const formatted = res.data
          .map((country) => ({
            value: country.name.common,
            label: country.name.common,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setCountryOptions(formatted);
      } catch (error) {
        toast.error("Failed to load countries");
        console.error(error);
      }
    };
    fetchCountries();
  }, []);

  // --- Fetch data for view/edit mode ---
  useEffect(() => {
    const fetchBuilding = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/building/building/${id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        const data = res.data.data;
        setFormData((prev) => ({
          ...prev,
          ...data,
          country: data.country
            ? { value: data.country, label: data.country }
            : null,
          buildingType: data.buildingType
            ? { value: data.buildingType, label: capitalizeLabel(data.buildingType) }
            : null,
          ownership: data.ownership
            ? { value: data.ownership, label: capitalizeLabel(data.ownership) }
            : null,
          operatingHours: data.operatingHours || "",
        }));

      } catch (error) {
        toast.error("Error fetching building data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if ((isViewMode || isEditMode) && id) fetchBuilding();
  }, [id, isViewMode, isEditMode]);

  // --- Handle Input Changes ---
  const handleInputChange = (e) => {
    if (isViewMode) return;
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // --- Handle Switch Change ---
  const handleSwitchChange = (field) => {
    if (isViewMode) return;

    setFormData((prev) => {
      const updated = { ...prev, [field]: !prev[field] };

      // Handle each switch separately
      if (field === "heatingUsed" && !updated.heatingUsed) {
        updated.heatingType = "";
      }

      if (field === "coolingUsed" && !updated.coolingUsed) {
        updated.coolingType = "";
      }

      return updated;
    });
  };


  const handleNumberInputWheel = (e) => {
    e.target.blur();
    e.preventDefault(); // Add this to prevent scroll changing value
  };// onWheel={handleNumberInputWheel}
  // --- Handle Country Change ---
  const handleCountryChange = (selectedOption) => {
    if (isViewMode) return;
    setFormData((prev) => ({ ...prev, country: selectedOption }));
    if (errors.country) {
      setErrors((prev) => ({ ...prev, country: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return;
    if (!validateFields()) return;

    try {
      const trimmedData = {
        ...formData,
        buildingName: capitalizeFirstLetter(formData.buildingName.trim()),
        country: formData.country?.value || "",
        buildingLocation: capitalizeFirstLetter(formData.buildingLocation.trim()),
        buildingType: capitalizeFirstLetter(formData.buildingType.trim()),
        ownership: formData.ownership?.value || "",
        heatingType: capitalizeFirstLetter(formData.heatingType.trim()),
        coolingType: capitalizeFirstLetter(formData.coolingType.trim()),
        operatingHours: formData.operatingHours.trim(),
      };

      const numericData = {
        buildingArea: Number(trimmedData.buildingArea),
        numberOfEmployees: Number(trimmedData.numberOfEmployees),
        electricityConsumption: Number(trimmedData.electricityConsumption),
      };

      if (trimmedData.heatingUsed && !trimmedData.heatingType)
        return toast.error("Please enter heating type");
      if (trimmedData.coolingUsed && !trimmedData.coolingType)
        return toast.error("Please enter cooling type");

      //  Safely get userId from localStorage or token decode fallback
      const userId = localStorage.getItem("userId");

      if (!userId) {
        toast.error("User not found. Please log in again.");
        return;
      }

      const payload = {
        ...trimmedData,
        ...numericData,
        createdBy: userId,
        updatedBy: userId,
      };

      console.log("Payload before submit:", payload);
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      if (isEditMode) {
        await axios.put(
          `${process.env.REACT_APP_BASE_URL}/building/building/${id}`,
          payload,
          config
        );
        toast.success("Building updated successfully!");
      } else {
        await axios.post(
          `${process.env.REACT_APP_BASE_URL}/building/building`,
          payload,
          config
        );
        toast.success("Building created successfully!");
      }

      setTimeout(() => navigate("/building"), 1200);
    } catch (error) {
      console.error("Error creating/updating building:", error);
      toast.error(error.response?.data?.message || "All fields are required");
    }
  };


  const validateFields = () => {
    const newErrors = {};

    // Required field validations
    if (!formData.buildingName.trim()) newErrors.buildingName = "Building Name is required";
    if (!formData.country) newErrors.country = "Country is required";
    if (!formData.buildingLocation.trim()) newErrors.buildingLocation = "Location is required";
    if (!formData.buildingType) newErrors.buildingType = "Building Type is required";
    if (!formData.ownership) newErrors.ownership = "Ownership is required";
    if (!formData.operatingHours) newErrors.operatingHours = "Operating Hours is required";
    if (!formData.numberOfEmployees) newErrors.numberOfEmployees = "Number of Employees is required";
    if (!formData.buildingArea) newErrors.buildingArea = "Building Area is required";
    if (!formData.electricityConsumption) newErrors.electricityConsumption = "Electricity Consumption is required";
    if (formData.heatingUsed && !formData.heatingType.trim()) newErrors.heatingType = "Heating Type is required";
    if (formData.coolingUsed && !formData.coolingType.trim()) newErrors.coolingType = "Cooling Type is required";

    // Validate for negative values (only if field has a value)
    const numberFields = ['operatingHours', 'numberOfEmployees', 'buildingArea', 'electricityConsumption'];

    numberFields.forEach(field => {
      if (formData[field] && Number(formData[field]) < 0) {
        newErrors[field] = "Value cannot be negative.";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (loading) return <p>Loading building data...</p>;

  return (
    <div>
      <Card
        title={
          isViewMode ? "View Building" : isEditMode ? "Edit Building" : "Add Building"
        }
      >
        <form onSubmit={handleSubmit} className="p-4">
          <div className="lg:grid-cols-3 grid gap-8 grid-cols-1 mb-4">
            {/* --- Building Name --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Building Name</label>
              <InputGroup
                type="text"
                name="buildingName"
                placeholder="Building Name"
                value={formData.buildingName}
                onChange={handleInputChange}
                className={`border-[2px] w-full h-10 p-2 rounded-md ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                readOnly={isViewMode}
              />
              {errors.buildingName && <p className="text-red-500 text-sm mt-1">{errors.buildingName}</p>}
            </div>

            {/* --- Country --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <Select
                options={countryOptions}
                value={formData.country}
                onChange={handleCountryChange}
                placeholder="Select Country"
                isDisabled={isViewMode}
              />
              {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
            </div>

            {/* --- Location --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <InputGroup
                type="text"
                name="buildingLocation"
                placeholder="Building Location"
                value={formData.buildingLocation}
                onChange={handleInputChange}
                className={`border-[2px] w-full h-10 p-2 rounded-md ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                readOnly={isViewMode}
              />
              {errors.buildingLocation && <p className="text-red-500 text-sm mt-1">{errors.buildingLocation}</p>}
            </div>

            {/* --- Building Type --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Building Type
              </label>
              <Select
                options={buildingTypeOptions}
                value={formData.buildingType}
                onChange={(selectedOption) => {
                  setFormData((prev) => ({ ...prev, buildingType: selectedOption }));
                  if (errors.buildingType) {
                    setErrors((prev) => ({ ...prev, buildingType: "" }));
                  }
                }}
                placeholder="Select Building Type"
                isDisabled={isViewMode}
              />
              {errors.buildingType && <p className="text-red-500 text-sm mt-1">{errors.buildingType}</p>}
            </div>

            {/* --- Ownership --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ownership
              </label>
              <Select
                options={ownershipOptions}
                value={formData.ownership}
                onChange={(selectedOption) => {
                  setFormData((prev) => ({ ...prev, ownership: selectedOption }));
                  if (errors.ownership) {
                    setErrors((prev) => ({ ...prev, ownership: "" }));
                  }
                }}
                placeholder="Select Ownership"
                isDisabled={isViewMode}
              />
              {errors.ownership && <p className="text-red-500 text-sm mt-1">{errors.ownership}</p>}
            </div>

            {/* --- Number of Employees --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Employees</label>
              <InputGroup
                type="number"
                name="numberOfEmployees"
                onWheel={handleNumberInputWheel}
                placeholder="Number of Employees"
                value={formData.numberOfEmployees}
                onChange={handleInputChange}
                className={`border-[2px] w-full h-10 p-2 rounded-md ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                readOnly={isViewMode}
              />
              {errors.numberOfEmployees && <p className="text-red-500 text-sm mt-1">{errors.numberOfEmployees}</p>}
            </div>

            {/* --- Operating Hours --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operating Hours</label>
              <InputGroup
                type="Number"
                name="operatingHours"

                onWheel={handleNumberInputWheel}
                value={formData.operatingHours}
                onChange={handleInputChange}
                placeholder="Enter Operating Hours"
                className={`border-[2px] w-full h-10 p-2 rounded-md ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                readOnly={isViewMode}
              />
              {errors.operatingHours && <p className="text-red-500 text-sm mt-1">{errors.operatingHours}</p>}
            </div>

            {/* --- Building Area --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Building Area (m2)</label>
              <InputGroup
                type="number"
                name="buildingArea"

                onWheel={handleNumberInputWheel}
                placeholder="Building Area"
                value={formData.buildingArea}
                onChange={handleInputChange}
                className={`border-[2px] w-full h-10 p-2 rounded-md ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                readOnly={isViewMode}
              />
              {errors.buildingArea && <p className="text-red-500 text-sm mt-1">{errors.buildingArea}</p>}
            </div>

            {/* --- Electricity Consumption --- */}
            <div>
              <label className="field-label">Electricity Consumption (kWh)</label>
              <InputGroup
                type="number"

                onWheel={handleNumberInputWheel}
                name="electricityConsumption"
                placeholder="Electricity Consumption (kWh)"
                value={formData.electricityConsumption}
                onChange={handleInputChange}
                className={`border-[2px] w-full h-10 p-2 rounded-md ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                readOnly={isViewMode}
              />
              {errors.electricityConsumption && <p className="text-red-500 text-sm mt-1">{errors.electricityConsumption}</p>}
            </div>
          </div>
          <p className="field-label text-black-500">
            Are The Following Used In This Building?
          </p>
          <div className="lg:grid-cols-3 grid gap-8 grid-cols-1 mt-2">
            {/* --- Heating --- */}
            <div>
              <label className="field-label">Heating</label>
              <Switch
                value={formData.heatingUsed}
                onChange={() => handleSwitchChange("heatingUsed")}
                disabled={isViewMode}
              />
              {formData.heatingUsed && (
                <InputGroup
                  type="text"
                  name="heatingType"
                  value={formData.heatingType}
                  onChange={handleInputChange}
                  placeholder="Heating Type"
                  className={`border-[2px] w-full h-10 p-2 mt-2 rounded-md ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  readOnly={isViewMode}
                />
              )}
              {errors.heatingType && <p className="text-red-500 text-sm mt-1">{errors.heatingType}</p>}
            </div>

            {/* --- Cooling --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cooling</label>
              <Switch
                value={formData.coolingUsed}
                onChange={() => handleSwitchChange("coolingUsed")}
                disabled={isViewMode}
              />
              {formData.coolingUsed && (
                <InputGroup
                  type="text"
                  name="coolingType"
                  value={formData.coolingType}
                  onChange={handleInputChange}
                  placeholder="Cooling Type"
                  className={`border-[2px] w-full h-10 p-2 mt-2 rounded-md ${isViewMode ? "bg-gray-100 cursor-not-allowed " : ""
                    }`}
                  readOnly={isViewMode}
                />
              )}
              {errors.coolingType && <p className="text-red-500 text-sm mt-1">{errors.coolingType}</p>}
            </div>

            {/* --- Steam Used --- */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Steam Used</label>
              {/* <input
                type="checkbox"
                name="steamUsed"
                checked={formData.steamUsed}
                onChange={handleInputChange}
                disabled={isViewMode}
                className="h-5 w-5"
              /> */}
              <Switch
                value={formData.steamUsed}
                onChange={() => handleSwitchChange("steamUsed")}
                disabled={isViewMode}
              />

            </div>
          </div>


          {/* --- Buttons --- */}
          <div className="flex justify-end gap-4 pt-6">
            <Button
              text={isViewMode ? "Back" : "Cancel"}
              className={isViewMode ? "btn-primary" : "btn-light"}
              type="button"
              onClick={() => navigate("/Building")}
            />
            {!isViewMode && (
              <Button
                text={isEditMode ? "Update Building" : "Add Building"}
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

export default BuildingFormPage;
