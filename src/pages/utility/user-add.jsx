import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";

const UserAddPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    companyId: "",
    companyName: "",
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
            {errors.username && <p className="text-red-500">{errors.username}</p>}
            <br />

            <Textinput
              label="Name"
              type="text"
              placeholder="Enter Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            {errors.name && <p className="text-red-500">{errors.name}</p>}
            <br />

            <Textinput
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            {errors.password && <p className="text-red-500">{errors.password}</p>}
            <br />

            <div>
              <label>Company</label>
              <input
                type="text"
                className="border-[3px] h-10 w-[100%] mb-3 p-2"
                value={formData.companyName}
                disabled
              />
              {errors.companyId && (
                <p className="text-red-500">{errors.companyId}</p>
              )}
            </div>
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
            {errors.email && <p className="text-red-500">{errors.email}</p>}
          </div>
        </div>

        <div className="ltr:text-right rtl:text-left space-x-3 rtl:space-x-reverse mt-5">
          <button
            className="btn btn-light text-center"
            onClick={handleCancel}
            type="button"
          >
            Cancel
          </button>
          <Button
            text="Save"
            className="btn-dark"
            onClick={handleSubmit}
            isLoading={uploadingData}
          />
        </div>
      </Card>
    </div>
  );
};

export default UserAddPage;
