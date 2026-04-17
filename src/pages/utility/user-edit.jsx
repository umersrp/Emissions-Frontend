
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import CustomSelect from "@/components/ui/Select";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

const UserEditPage = () => {
  const navigate = useNavigate();
  const { id: userId } = useParams();
  const user = useSelector((state) => state.auth.user);

  const [buildingOptions, setBuildingOptions] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    employeeID: "",
    companyId: "",
    companyName: "",
    buildingId: "",
    isActive: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingData, setUploadingData] = useState(false);

  // Fetch buildings list
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

        const formatted = res.data?.data?.buildings?.map((b) => ({
          value: b._id,
          label: b.buildingName,
        })) || [];

        setBuildingOptions(formatted);
      } catch (error) {
        console.error("Error fetching buildings", error);
        toast.error("Failed to load buildings");
      }
    };

    fetchBuildings();
  }, []);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/auth/GetUsers/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = response.data.data;

        // Set selected building if building exists
        if (data.buildingId?._id) {
          setSelectedBuilding({
            value: data.buildingId._id,
            label: data.buildingId.buildingName || "Building"
          });
        }

        setFormData({
          name: data.name || "",
          email: data.email || "",
          employeeID: data.employeeID || "",
          companyId: data.companyId?._id || "",
          companyName: data.companyId?.companyName || "",
          buildingId: data.buildingId?._id || "",
          isActive: data.isActive || false,
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch user");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const validate = () => {
    const errors = {};
    if (!formData.name) errors.name = "Name is required";
    if (!formData.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Email address is invalid";
    if (!formData.companyId) errors.companyId = "Company ID is required";
    if (!selectedBuilding) {
      errors.buildingId = "Building is required";
    }
    return errors;
  };

  // Clear error for specific field when user starts typing
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear the error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Clear building error when building is selected
  const handleBuildingChange = (option) => {
    setSelectedBuilding(option);
    if (errors.buildingId) {
      setErrors(prev => ({ ...prev, buildingId: "" }));
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setUploadingData(true);

      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/auth/UpdateUser/${userId}`,
        {
          name: formData.name,
          email: formData.email.toLowerCase(),
          employeeID: formData.employeeID,
          companyId: formData.companyId,
          buildingId: selectedBuilding?.value,
          type: "user",
          isActive: formData.isActive,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.status === 200) {
        toast.success("User updated successfully");
        navigate("/Employee");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update user");
    } finally {
      setUploadingData(false);
    }
  };

  const handleCancel = () => navigate("/Employee");

  if (isLoading) {
    return (
      <Card title="Edit Employee">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employee data...</p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card title="Edit Employee">
        <div className="space-y-6">
          {/* Row 1: Name and Email */}
          <div className="grid lg:grid-cols-3 grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee Email<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-gray-50"

                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value.toLowerCase())}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-gray-50"

                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-gray-50"

                value={formData.employeeID}
                onChange={(e) => handleInputChange('employeeID', e.target.value)}
              />
            </div>
          </div>

          {/* Row 2: Company and Building */}
          <div className="grid lg:grid-cols-3 grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-gray-50"
                value={formData.companyName}
                disabled
              />
              {errors.companyId && (
                <p className="text-red-500 text-sm mt-1">{errors.companyId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Building<span className="text-red-500">*</span>
              </label>
              <CustomSelect
                options={buildingOptions}
                value={selectedBuilding}
                onChange={handleBuildingChange}
                placeholder="Select Building"
                className={errors.buildingId ? "border-red-500" : ""}
                visibleOptions={3}
                menuPlacement="auto"
              />
              {errors.buildingId && (
                <p className="text-red-500 text-sm mt-1">{errors.buildingId}</p>
              )}
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div> */}
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
          <button
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            onClick={handleCancel}
            type="button"
          >
            Cancel
          </button>
          <Button
            text={uploadingData ? "Updating..." : "Update Employee"}
            className="btn-primary"
            onClick={handleSubmit}
            isLoading={uploadingData}
          />
        </div>
      </Card>
    </div>
  );
};

export default UserEditPage;

