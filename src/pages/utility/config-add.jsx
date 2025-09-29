import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Configadd = () => {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("id");

  const [formData, setFormData] = useState({
    image: "",
    header: "",
    aboutus: "",
    termsandconditions: "",
  });

  const [isLoading, setIsLoading] = useState(true);

  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verify the base URL and user type
        const baseURL = process.env.REACT_APP_BASE_URL;
        const userType = user.type;

        if (!baseURL || !userType) {
          throw new Error("Base URL or User Type is not defined");
        }

        // Log the constructed URL for debugging
        const configUrl = `${baseURL}/${userType}/homepage/get-homepage`;
        console.log(`Fetching data from: ${configUrl}`);

        const userResponse = await axios.get(configUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        // Extract data from the response, assuming it's an array
        const homepageData = userResponse.data[0]; // Get the first object from the array
        setFormData({
          image: homepageData.image || "",
          header: homepageData.header || "",
          aboutus: homepageData.aboutus || "",
          termsandconditions: homepageData.termsandconditions || "",
        });

        console.log("Fetched data: ", homepageData);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch data: ", error);
        toast.error("Failed to fetch Config");
      }
    };

    fetchData();
  }, [user.type]); // Include user.type in the dependency array

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/${user.type}/homepage/create-homepage`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      console.log(response)
      if (response.status === 200) {
        toast.success("User updated successfully")
        navigate('/dashboard')
      }
    } catch (error) {
      console.log(error)
      toast.error("Failed to update  ")
    }
  }
  
  const handleCancel = () => {
    navigate("/dashboard");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFormData({ ...formData, logo: e.target.files[0] });
    }
  };
  

  return (
    <div>
      <Card title="Homepage CMS">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid lg:grid-cols-1 grid-cols-1 gap-5 mb-5">
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
              <div>
                <div>
                  <label htmlFor="logo" className="form-label">
                    Logo
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    placeholder="Add logo"
                    onChange={handleFileChange} // File change handler
                  />

                  <label htmlFor="header" className="form-label">
                    Header
                  </label>
                  <input
                    type="text"
                    name="header"
                    className="border-[3px] h-10 w-[100%] mb-3 p-2"
                    value={formData.header}
                    placeholder="Add header"
                    onChange={handleChange} // General change handler
                  />

                  <label htmlFor="aboutus" className="form-label">
                    About Us
                  </label>
                  <input
                    type="text"
                    name="aboutus"
                    placeholder="Add About us"
                    className="border-[3px] h-10 w-[100%] mb-3 p-2"
                    value={formData.aboutus}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="termsandconditions" className="form-label">
                  Terms and Conditions
                </label>
                <input
                  type="text"
                  name="termsandconditions"
                  placeholder="Add Terms and Conditions"
                  className="border-[3px] h-10 w-[100%] mb-3 p-2"
                  value={formData.termsandconditions}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        <div className="ltr:text-right rtl:text-left space-x-3 rtl:space-x-reverse">
          <button
            className="btn btn-light text-center"
            onClick={handleCancel}
            type="button"
          >
            Cancel
          </button>

          <Button text="Save" className="btn-dark" onClick={handleSubmit} />
        </div>
      </Card>
    </div>
  );
};

export default Configadd;
