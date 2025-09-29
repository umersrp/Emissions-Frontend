import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CryptoJS from "crypto-js";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const VendorAddPage = () => {
  const navigate = useNavigate();

  const [uploadingData, setUploadingData] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    // Fetch roles if necessary
    const fetchRoles = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/${user.type}/vendor/get-vendors`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log("Roles fetched:", response.data);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };
    fetchRoles();
  }, [user.type]);

  const validate = () => {
    const errors = {};

    if (!formData.name) {
      errors.name = "Name is required";
    }

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (!/[!@#$%^&*]/.test(formData.password)) {
      errors.password = "Password must contain at least one special character";
    }

    if (!formData.phone) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{11}$/.test(formData.phone)) {
      errors.phone = "Phone number is invalid";
    }

    return errors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // const encryptedPassword = CryptoJS.AES.encrypt(
    //   formData.password,
    //   "your-secret-key"
    // ).toString();

    try {
      setUploadingData(true);

      // Use JSON payload instead of FormData for simple fields
      const data = {
        name: formData.name,
        email: formData.email.toLowerCase(), // Convert email to lowercase
        password: formData.password, // Send the encrypted password
        phone: formData.phone,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/${user.type}/vendor/create-vendors`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("API response:", response);

      if (response.status === 201) {
        toast.success("Vendor created successfully");
        navigate("/vendor");
      }
    } catch (error) {
      console.error("Error creating vendor:", error);
      toast.error(error.response?.data?.message || "Failed to create vendor");
    } finally {
      setUploadingData(false);
    }
  };

  const handleCancel = () => {
    navigate("/vendor");
  };

  return (
    <div>
      <Card title="Create new Vendor">
        <div className="grid lg:grid-cols-1 grid-cols-1 gap-5">
          <form className="lg:grid-cols-2 grid gap-8 grid-cols-1" onSubmit={e => e.preventDefault()}>
            <div>
              <Textinput
                label="Vendor Name"
                type="text"
                placeholder="Add Vendor Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              {errors.name && <p className="text-red-500">{errors.name}</p>}
              <br />
              <div className="relative">
                <Textinput
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Add Vendor Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <FontAwesomeIcon
                  icon={showPassword ? faEye : faEyeSlash}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[70%] transform -translate-y-1/2 cursor-pointer"
                />
              </div>
              {errors.password && (
                <p className="text-red-500">{errors.password}</p>
              )}

              <br />
            </div>
            <div>
              <Textinput
                label="Email"
                type="email"
                className=""
                placeholder="Add Vendor email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              {errors.email && <p className="text-red-500">{errors.email}</p>}
              <br />
              <Textinput
                label="Phone"
                type="number"
                placeholder="Add Vendor phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
              {errors.phone && <p className="text-red-500">{errors.phone}</p>}
              <br />
            </div>
          </form>
        </div>

        <div className="ltr:text-right rtl:text-left space-x-3 rtl:space-x-reverse">
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

export default VendorAddPage;
