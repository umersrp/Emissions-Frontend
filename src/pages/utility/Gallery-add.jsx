


import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Flatpickr from "react-flatpickr";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Fileinput from "@/components/ui/Fileinput";

const Galleryadd = () => {
  const navigate = useNavigate();

  const [picker, setPicker] = useState(new Date());
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
   title:"",
    image: "",

  
  });
  const [errors, setErrors] = useState({});
  const user = useSelector((state) => state.auth.user);
  const [vendor, setVendor] = useState([]);

  const [uploadingData, setUploadingData] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/${user.type}/gallery/get-gallery`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setRoles(response.data);
        console.log(response);
      } catch (error) {
        console.log(error);
      }
    }
   
    fetchRoles();
  }, [user.type]);

  const validate = () => {
    const errors = {};

    if (!formData.title) {
      errors.title = "title is required";
    }

   

    if (!formData.image) {
      errors.image = "Image URL is required";
    }

   
    return errors;
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async () => {
      console.log("here 1") 
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setUploadingData(true);


      const formDataToSubmit = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSubmit.append(key, formData[key]);
      });

      console.log("here 2")

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/${user.type}/gallery/create-gallery`,
        formDataToSubmit,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(response);
      if (response.status === 201) {
        toast.success("Venue created successfully");
        navigate("/gallery");
      }
    } catch (error) {
      if (error.response) {
        console.error("Server Error:", error.response.data);
        toast.error(error.response.data.message || "Venue not created");
      } else if (error.request) {
        console.error("Network Error:", error.request);
        toast.error("Network error, please try again");
      } else {
        console.error("Error:", error.message);
        toast.error("An error occurred, please try again");
      }
    } finally {
      setUploadingData(false);
    }
  };

  const handleCancel = () => {
    navigate("/gallery");
};

  return (
    <div>
      <Card title="Create new gallery">
        <div className="grid lg:grid-cols-1 grid-cols-1 gap-5">
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
            <div>
              <Textinput
                label="Name"
                type="text"
                className="mb-3"
                placeholder="Venue Name"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
              {errors.title && <p className="text-red-500">{errors.title}</p>}
             
              
             
            </div>
            <div>
             
              <label className="small mb-1" htmlFor="">Image</label>
              <input
                label="Images"
                className="form-control mb-3"
                type="file"
                onChange={handleFileChange}

              />
              {errors.images && <p className="text-red-500">{errors.image}</p>}

             
              

            </div>
          </div>
        </div>
        

        <div className="ltr:text-right rtl:text-left space-x-3 rtl:space-x-reverse">
          <Button
            className="btn btn-light text-center"
            onClick={handleCancel}
            type="button"
            text="Cancel"
          />
            
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

export default Galleryadd;
