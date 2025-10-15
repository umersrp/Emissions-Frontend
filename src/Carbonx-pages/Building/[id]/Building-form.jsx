import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import axios from "axios";
import { toast } from "react-toastify";
import Switch from "@/components/ui/Switch";
import Select from "@/components/ui/Select";

const buildingTypeOptions = [
  { value: "office", label: "Office" },
  { value: "warehouse", label: "Warehouse" },
  { value: "cold_storage_facility", label: "Cold Storage Facility" },
  { value: "data_center", label: "Data Center" },
  { value: "hospital", label: "Hospital" },
  { value: "retail", label: "Retail" },
  { value: "mixed_use", label: "Mixed-Use" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "commercial", label: "Commercial" },
  { value: "finishing", label: "Finishing" },
  { value: "processing", label: "Processing" },
  { value: "service_building", label: "Service Building" },
  { value: "public_institutional", label: "Public/Institutional" },
  { value: "utility_infrastructure", label: "Utility & Infrastructure" },
  { value: "residential_building", label: "Residential Building" },
];

const ownershipOptions = [
  { value: "owned", label: "Owned" },
  { value: "partially Owned", label: "Partially Owned" },
  { value: "rented", label: "Rented" },
  { value: "partially (Some Part) rented", label: "Partially (Some Part) Rented" },

];

const BuildingFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

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


  // --- Handle Country Change ---
  const handleCountryChange = (selectedOption) => {
    if (isViewMode) return;
    setFormData((prev) => ({ ...prev, country: selectedOption }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return;

    try {
      const trimmedData = {
        ...formData,
        buildingName: formData.buildingName.trim(),
        country: formData.country?.value || "",
        buildingLocation: formData.buildingLocation.trim(),
        buildingType: formData.buildingType?.value || "",
        ownership: formData.ownership?.value || "",
        heatingType: formData.heatingType.trim(),
        coolingType: formData.coolingType.trim(),
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

      const payload = {
        ...trimmedData,
        ...numericData,
      };

      if (isEditMode) {
        await axios.put(
          `${process.env.REACT_APP_BASE_URL}/building/building/${id}`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success("Building updated successfully!");
      } else {
        await axios.post(
          `${process.env.REACT_APP_BASE_URL}/building/building`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success("Building created successfully!");
      }

      setTimeout(() => navigate("/building"), 1200);
    } catch (error) {
      toast.error(error.response?.data?.message || "All fields are required");
    }
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
              <input
                type="text"
                name="buildingName"
                placeholder="Building Name"
                value={formData.buildingName}
                onChange={handleInputChange}
                className={`border-[2px] w-full h-10 p-2 rounded-md ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                readOnly={isViewMode}
              />
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
            </div>

            {/* --- Location --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                name="buildingLocation"
                placeholder="Building Location"
                value={formData.buildingLocation}
                onChange={handleInputChange}
                className={`border-[2px] w-full h-10 p-2 rounded-md ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                readOnly={isViewMode}
              />
            </div>

            {/* --- Building Type --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Building Type
              </label>
              <Select
                options={buildingTypeOptions}
                value={formData.buildingType}
                onChange={(selectedOption) =>
                  setFormData((prev) => ({ ...prev, buildingType: selectedOption }))
                }
                placeholder="Select Building Type"
                isDisabled={isViewMode}
              />

            </div>

            {/* --- Ownership --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ownership
              </label>
              <Select
                options={ownershipOptions}
                value={formData.ownership}
                onChange={(selectedOption) =>
                  setFormData((prev) => ({ ...prev, ownership: selectedOption }))
                }
                placeholder="Select Ownership"
                isDisabled={isViewMode}
              />

            </div>

            {/* --- Number of Employees --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Employees</label>
              <input
                type="number"
                name="numberOfEmployees"
                placeholder="Number of Employees"
                value={formData.numberOfEmployees}
                onChange={handleInputChange}
                className={`border-[2px] w-full h-10 p-2 rounded-md ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                readOnly={isViewMode}
              />
            </div>

            {/* --- Operating Hours --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operating Hours</label>
              <input
                type="text"
                name="operatingHours"
                value={formData.operatingHours}
                onChange={handleInputChange}
                placeholder="Enter Operating Hours"
                className={`border-[2px] w-full h-10 p-2 rounded-md ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                readOnly={isViewMode}
              />
            </div>
           
            {/* --- Building Area --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Building Area (sq ft)</label>
              <input
                type="number"
                name="buildingArea"
                placeholder="Building Area"
                value={formData.buildingArea}
                onChange={handleInputChange}
                className={`border-[2px] w-full h-10 p-2 rounded-md ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                readOnly={isViewMode}
              />
            </div>

            {/* --- Electricity Consumption --- */}
            <div>
              <label className="field-label">Electricity Consumption (kWh)</label>
              <input
                type="number"
                name="electricityConsumption"
                placeholder="Electricity Consumption (kWh)"
                value={formData.electricityConsumption}
                onChange={handleInputChange}
                className={`border-[2px] w-full h-10 p-2 rounded-md ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                readOnly={isViewMode}
              />
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
                <input
                  type="text"
                  name="heatingType"
                  value={formData.heatingType}
                  onChange={handleInputChange}
                  placeholder="Heating Type"
                  className={`border-[2px] w-full h-10 p-2 rounded-md mt-2${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  readOnly={isViewMode}
                />
              )}
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
                <input
                  type="text"
                  name="coolingType"
                  value={formData.coolingType}
                  onChange={handleInputChange}
                  placeholder="Cooling Type"
                  className={`border-[2px] w-full h-10 p-2 rounded-md mt-2 ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  readOnly={isViewMode}
                />
              )}
            </div>

            {/* --- Steam Used --- */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Steam Used</label>
              <input
                type="checkbox"
                name="steamUsed"
                checked={formData.steamUsed}
                onChange={handleInputChange}
                disabled={isViewMode}
                className="h-5 w-5"
              />
            </div>
          </div>
          

          {/* --- Buttons --- */}
          <div className="flex justify-end gap-4 pt-6">
            <Button
              text="Cancel"
              className="btn-light"
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
