import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

function Locatedadd() {
  const [formData, setFormData] = useState({ location: "", sports: [] });
  const [sports, setSports] = useState([]);
  const [errors, setErrors] = useState({});
  const [uploadingData, setUploadingData] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  // ✅ Fetch sports list
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/${user.type}/sport/get-sports`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (Array.isArray(response.data)) {
          setSports(response.data);
        } else if (response.data.sports) {
          setSports(response.data.sports);
        } else {
          console.error("Unexpected response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching sports:", error);
        toast.error("Failed to fetch sports");
      }
    };

    fetchSports();
  }, [user.type]);

  // ✅ Validation
  const validate = () => {
    const errors = {};
    if (!formData.location) errors.location = "Location is required";
    if (!formData.sports.length) errors.sports = "At least one sport is required";
    return errors;
  };

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setUploadingData(true);

      const dataToSend = {
        location: formData.location,
        sports: formData.sports, // ✅ send array
      };

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/${user.type}/location/create-locations`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        toast.success("Location created successfully");
        navigate("/Location");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Location not created");
    } finally {
      setUploadingData(false);
    }
  };

  const handleCancel = () => {
    navigate("/location");
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        {/* Location input */}
        <div>
          <Textinput
            label="Location"
            type="text"
            className="mb-3"
            placeholder="Add Location"
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            value={formData.location}
          />
          {errors.location && <div className="error">{errors.location}</div>}
        </div>

        {/* ✅ Multi-Select Sports Dropdown */}
        <div>
          <label className="form-label">Select Sports</label>
          <Select
            isMulti
            className="mb-3"
            options={sports.map((sport) => ({
              value: sport._id,
              label: sport.name,
            }))}
            value={sports
              .filter((sport) => formData.sports.includes(sport._id))
              .map((sport) => ({ value: sport._id, label: sport.name }))}
            onChange={(selectedOptions) =>
              setFormData({
                ...formData,
                sports: selectedOptions
                  ? selectedOptions.map((option) => option.value)
                  : [],
              })
            }
          />
          {errors.sports && <div className="error">{errors.sports}</div>}
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
      </form>
    </Card>
  );
}

export default Locatedadd;
