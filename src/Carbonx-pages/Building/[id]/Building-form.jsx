import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import axios from "axios";
import { toast } from "react-toastify";

const BuildingFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const mode = location.state?.mode || "add";
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  const [formData, setFormData] = useState({
    buildingName: "",
    country: "",
    buildingLocation: "",
    buildingType: "",
    numberOfEmployees: "",
    opening: "07:30",
    closing: "19:00",
    buildingArea: "",
    ownership: "",
    electricityConsumption: "",
    heatingUsed: false,
    heatingType: "",
    coolingUsed: false,
    coolingType: "",
    steamUsed: false,
  });

  const [loading, setLoading] = useState(isViewMode || isEditMode);

  // fetch building data if edit/view
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
          opening: data.operatingHours?.opening || prev.opening,
          closing: data.operatingHours?.closing || prev.closing,
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

  const handleInputChange = (e) => {
    if (isViewMode) return;
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return;

    try {
      // Trim all string fields
      const trimmedData = {
        ...formData,
        buildingName: formData.buildingName.trim(),
        country: formData.country.trim(),
        buildingLocation: formData.buildingLocation.trim(),
        buildingType: formData.buildingType.trim(),
        ownership: formData.ownership.trim(),
        heatingType: formData.heatingType.trim(),
        coolingType: formData.coolingType.trim(),
      };

      // Convert numeric fields
      const numericData = {
        buildingArea: Number(trimmedData.buildingArea),
        numberOfEmployees: Number(trimmedData.numberOfEmployees),
        electricityConsumption: Number(trimmedData.electricityConsumption),
      };

      // Conditional required fields
      if (trimmedData.heatingUsed && !trimmedData.heatingType) {
        return toast.error("Please enter heating type");
      }
      if (trimmedData.coolingUsed && !trimmedData.coolingType) {
        return toast.error("Please enter cooling type");
      }

      const payload = {
        ...trimmedData,
        ...numericData,
        operatingHours: {
          opening: trimmedData.opening,
          closing: trimmedData.closing,
        },
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
          <div className="lg:grid-cols-3 grid gap-8 grid-cols-1">
            <div>
              <label className="block font-semibold mb-1">Building Name</label>
              <input
                type="text"
                name="buildingName"
                value={formData.buildingName}
                onChange={handleInputChange}
                className={`border-[3px] h-10 w-[100%] mb-3 p-2 ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                readOnly={isViewMode}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className={`border-[3px] h-10 w-[100%] mb-3 p-2 ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                readOnly={isViewMode}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Location</label>
              <input
                type="text"
                name="buildingLocation"
                value={formData.buildingLocation}
                onChange={handleInputChange}
                className={`border-[3px] h-10 w-[100%] mb-3 p-2 ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                readOnly={isViewMode}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Building Type</label>
              <input
                type="text"
                name="buildingType"
                value={formData.buildingType}
                onChange={handleInputChange}
                className={`border-[3px] h-10 w-[100%] mb-3 p-2 ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                readOnly={isViewMode}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Number of Employees</label>
              <input
                type="number"
                name="numberOfEmployees"
                value={formData.numberOfEmployees}
                onChange={handleInputChange}
                className={`border-[3px] h-10 w-[100%] mb-3 p-2 ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                readOnly={isViewMode}
              />
            </div>
            <div className="flex gap-2">
              <div>
                <label className="block font-semibold mb-1">Opening Time</label>
                <input
                  type="time"
                  name="opening"
                  value={formData.opening}
                  onChange={handleInputChange}
                  className={`border-[3px] h-10 w-[100%] mb-3 p-2 ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  readOnly={isViewMode}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Closing Time</label>
                <input
                  type="time"
                  name="closing"
                  value={formData.closing}
                  onChange={handleInputChange}
                  className={`border-[3px] h-10 w-[100%] mb-3 p-2 ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  readOnly={isViewMode}
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Building Area (sq ft)</label>
              <input
                type="number"
                name="buildingArea"
                value={formData.buildingArea}
                onChange={handleInputChange}
                className={`border-[3px] h-10 w-[100%] mb-3 p-2 ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                readOnly={isViewMode}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Ownership</label>
              <input
                type="text"
                name="ownership"
                value={formData.ownership}
                onChange={handleInputChange}
                className={`border-[3px] h-10 w-[100%] mb-3 p-2 ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                readOnly={isViewMode}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Electricity Consumption</label>
              <input
                type="number"
                name="electricityConsumption"
                value={formData.electricityConsumption}
                onChange={handleInputChange}
                className={`border-[3px] h-10 w-[100%] mb-3 p-2 ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                readOnly={isViewMode}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="block font-semibold mb-1">Heating</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="heatingUsed"
                  checked={formData.heatingUsed}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  className="h-5 w-5 mb-3"
                />
                <input
                  type="text"
                  name="heatingType"
                  value={formData.heatingType}
                  onChange={handleInputChange}
                  className={`border-[3px] h-10 w-[100%] mb-3 p-2 ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  placeholder="Heating Type"
                  readOnly={isViewMode || !formData.heatingUsed}
                />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="block font-semibold mb-1">Cooling</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="coolingUsed"
                  checked={formData.coolingUsed}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  className="h-5 w-5 mb-3"
                />
                <input
                  type="text"
                  name="coolingType"
                  value={formData.coolingType}
                  onChange={handleInputChange}
                  className={`border-[3px] h-10 w-[100%] mb-3 p-2 ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  placeholder="Cooling Type"
                  readOnly={isViewMode || !formData.coolingUsed}
                />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="block font-semibold mb-1">Steam Used</label>
              <input
                type="checkbox"
                name="steamUsed"
                checked={formData.steamUsed}
                onChange={handleInputChange}
                disabled={isViewMode}
                className="h-5 w-5 mt-3"
              />
            </div>
          </div>

          {/* Buttons */}
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
