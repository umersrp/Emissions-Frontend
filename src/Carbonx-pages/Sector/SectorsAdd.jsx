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

const SectorAddForm = () => {
  const navigate = useNavigate();

  const [uploadingData, setUploadingData] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    // Fetch roles if necessary
    const fetchRoles = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/${user.type}/coach/get-coaches`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log("Roles fetched:", response.data);
      } catch (error) {
        console.error("Error fetching Coach:", error);
      }
    };
    fetchRoles();
  }, [user.type]);

  const validate = () => {
    const errors = {};

    if (!formData.name) {
      errors.name = "Name is required";
    }

    if (!formData.description) 
    {
        errors.description="description is required"
    }

    return errors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    

    try {
      setUploadingData(true);

      // Use JSON payload instead of FormData for simple fields
      const data = {
        name: formData.name,
        description: formData.description // Convert email to lowercase
       
      };

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/sector/Create-sector`,
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
        toast.success(" created successfully");
        navigate("/Sector-table");
      }
    } catch (error) {
      console.error("Error creating Coach:", error);
      toast.error(error.response?.data?.message || "Failed to create Coach");
    } finally {
      setUploadingData(false);
    }
  };

  const handleCancel = () => {
    navigate("/Sector-table");
  };

  return (
    <div>
      <Card title="Create New Sector">
        <div className="grid lg:grid-cols-1 grid-cols-1 gap-5">
          <form className="lg:grid-cols-2 grid gap-8 grid-cols-1" onSubmit={e => e.preventDefault()}>
            <div>
              <Textinput
                label="Sector Name"
                type="text"
                placeholder="Add Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              {errors.name && <p className="text-red-500">{errors.name}</p>}
              <br />
             
             

              <br />
            </div>
            <div>
              <Textinput
                label="description"
                type="description"
                className=""
                placeholder="Add description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              {errors.description && <p className="text-red-500">{errors.description}</p>}
              <br />
              
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

export default SectorAddForm;
