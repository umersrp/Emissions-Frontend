import React, { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const AmenitiesAddPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
  });

  const [errors, setErrors] = useState({});
  const [uploadingData, setUploadingData] = useState(false);

  const validate = () => {
    const errors = {};

    if (!formData.name) {
      errors.name = "Name is required";
    }
    if (!formData.description) {
      errors.description = "Description is required";
    }
    if (!formData.image) {
      errors.image = "Image is required";
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

      // Prepare FormData for file upload
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("name", formData.name);
      formDataToSubmit.append("description", formData.description);
      formDataToSubmit.append("image", formData.image);

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/${user.type}/amenities/create-amenities`,
        formDataToSubmit,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Amenity created successfully");
        navigate("/amenities");
      }
    } catch (error) {
      console.error("Error creating amenity:", error);
      toast.error(error.response?.data?.message || "Failed to create amenity");
    } finally {
      setUploadingData(false);
    }
  };

  const handleCancel = () => {
    navigate("/amenities");
  };

  

  return (
    <div>
      <Card title="Create New Amenity">
        <form
          className="lg:grid-cols-2 grid gap-8 grid-cols-1"
          onSubmit={(e) => e.preventDefault()}
        >
          <div>
            <Textinput
              label="Amenity Name"
              type="text"
              placeholder="Add Amenity Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            {errors.name && <p className="text-red-500">{errors.name}</p>}
            <br />

            <Textinput
              label="Description"
              type="text"
              placeholder="Add Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            {errors.description && (
              <p className="text-red-500">{errors.description}</p>
            )}
            <br />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload Image
            </label>
            <input
              type="file"
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              className="mt-2"
            />
            {errors.image && <p className="text-red-500">{errors.image}</p>}
            <br />
          </div>
        </form>

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

export default AmenitiesAddPage;
