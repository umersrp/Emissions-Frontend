import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import Select from "@/components/ui/Select";
import CustomSelect from "@/components/ui/Select";


const UserAddPage = () => {
  const navigate = useNavigate();
  const [buildingOptions, setBuildingOptions] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    companyId: "",
    companyName: "",
    buildingId: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadingData, setUploadingData] = useState(false);

  // Populate company info from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);

      if (userData.type === "company") {
        setFormData((prev) => ({
          ...prev,
          companyId: userData.companyId || userData._id, // Use companyId if exists
          companyName: userData.name || "",
        }));
      }
    }
  }, []);

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


  const validate = () => {
    const errors = {};
    if (!formData.username) errors.username = "Username is required";
    if (!formData.name) errors.name = "Name is required";
    if (!formData.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Email address is invalid";
    if (!formData.password) errors.password = "Password is required";
    else if (!/[!@#$%^&*]/.test(formData.password))
      errors.password = "Password must contain at least one special character";
    if (!formData.companyId) errors.companyId = "Company ID is required";
    if (!selectedBuilding) {
      errors.buildingId = "Building is required";
    }

    return errors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const encryptedPassword = CryptoJS.AES.encrypt(
      formData.password,
      "your-secret-key"
    ).toString();

    try {
      setUploadingData(true);

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/auth/register`,
        {
          username: formData.username,
          name: formData.name,
          email: formData.email.toLowerCase(),
          password: encryptedPassword,
          companyId: formData.companyId,
          buildingId: selectedBuilding?.value, // IMPORTANT
          type: "user",
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.status === 201 || response.status === 200) {
        toast.success("User created successfully");
        navigate("/Employee");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setUploadingData(false);
    }
  };

  const handleCancel = () => navigate("/Employee");

  return (
    <div>
      <Card title="Create New Employee">
        <div className="space-y-6">
          {/* Row 1: Username and Email */}
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
            <div>
              <Textinput
                label="Username"
                type="text"
                placeholder="Enter Username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
              {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
            </div>

            <div>
              <Textinput
                label="Email"
                type="email"
                placeholder="Enter Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value.toLowerCase() })
                }
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Row 2: Name and Password */}
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
            <div>
              <Textinput
                label="Name"
                type="text"
                placeholder="Enter Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-primary hover:text-primary-dark transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <Textinput
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}

              {/* Optional: Password strength indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Password strength:</span>
                    <span className={`font-medium ${formData.password.length >= 8 && /[!@#$%^&*]/.test(formData.password)
                      ? 'text-green-600'
                      : 'text-yellow-600'
                      }`}>
                      {formData.password.length >= 8 && /[!@#$%^&*]/.test(formData.password)
                        ? 'Strong'
                        : 'Weak'}
                    </span>
                  </div>
                  <div className="h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full ${formData.password.length >= 8 && /[!@#$%^&*]/.test(formData.password)
                        ? 'bg-green-500 w-full'
                        : 'bg-yellow-500 w-2/3'
                        }`}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Company and Building */}
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company
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
                Building
              </label>
              <CustomSelect
                options={buildingOptions}
                value={selectedBuilding}
                onChange={(option) => setSelectedBuilding(option)}
                placeholder="Select Building"
                className="w-full"
                maxMenuHeight={150}  // Add this
                menuHeight={150}
              />
              {selectedBuilding && (
                <p className="text-xs text-gray-600 mt-1">
                  Selected: <span className="font-medium">{selectedBuilding.label}</span>
                </p>
              )}
              {errors.buildingId && (
                <p className="text-red-500 text-sm mt-1">{errors.buildingId}</p>
              )}
            </div>
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
            text={uploadingData ? "Creating..." : "Create Employee"}
            className="btn-primary"
            onClick={handleSubmit}
            isLoading={uploadingData}
          />
        </div>
      </Card>
    </div>
  );
};

export default UserAddPage;
