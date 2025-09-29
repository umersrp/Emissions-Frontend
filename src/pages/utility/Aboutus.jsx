import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Aboutus = () => {
    const navigate = useNavigate();
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("id");

    const [formData, setFormData] = useState({
        WhoWeAre: "",
        OurVision: "",
        OurMission: "uu",
        image:null
    });

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    // Use a default value for user
    const user = useSelector((state) => state.auth.user) || {};

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
            const configUrl = `${baseURL}/${userType}/aboutus/get-aboutus`;
            console.log(`Fetching data from: ${configUrl}`);
    
            const userResponse = await axios.get(configUrl, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
              }
            });
    
            setFormData(userResponse.data);
            console.log("Fetched data: ", userResponse.data);
            setIsLoading(false);
          } catch (error) {
            console.error("Failed to fetch data: ", error);
            toast.error("Failed to fetch Config");
          }
        };
    
        fetchData();
      }, [user.type]); // Include user.type and userId in the dependency array
    
      if (isLoading) {
        return <div>Loading...</div>;
      }
    const handleSubmit = async () => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/${user.type}/aboutus/create-aboutus`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            console.log("Submit Response: ", response);

            if (response.status === 200) {
                toast.success("About Us updated successfully");
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("Error while updating: ", error);
            toast.error("Failed to update About Us");
        }
    };

    const handleCancel = () => {
        navigate("/dashboard");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    const handleFileChange = (e) => {
        setFormData({ ...formData, image: e.target.files[0] });
      };

    return (
        <div>
            <Card title="About us CMS">
                {isLoading ? (
                    <div>Loading...</div>
                ) : error ? (
                    <div>{error}</div>
                ) : (
                    <div className="grid lg:grid-cols-1 grid-cols-1 gap-5 mb-5">
                        <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
                            <div>
                                <label htmlFor="WhoWeAre" className="form-label">
                                    Who We Are
                                </label>
                                <input
                                    type="text"
                                    name="WhoWeAre"
                                    className="border-[3px] h-10 w-[100%] mb-3 p-2"
                                    value={formData.WhoWeAre}
                                    placeholder="Add Who We Are"
                                    onChange={handleChange}
                                />
                                  <div>
                                <label htmlFor="OurVision" className="form-label">
                                    Our Vision
                                </label>
                                <input
                                    type="text"
                                    name="OurVision"
                                    placeholder="Add Our Vision"
                                    className="border-[3px] h-10 w-[100%] mb-3 p-2"
                                    value={formData.OurVision}
                                    onChange={handleChange}
                                />
                            </div>

                                {/* <label htmlFor="OurMission" className="form-label">
                                    Our Mission
                                </label>
                                <input
                                    type="text"
                                    name="OurMission"
                                    placeholder="Add Our Mission"
                                    className="border-[3px] h-10 w-[100%] mb-3 p-2"
                                    value={formData.OurMission}
                                    onChange={handleChange}
                                /> */}
    
                            </div>
                          
                            <div>
                                <label htmlFor="image" className="form-label">
                  Image URL
                </label>
                <input
                  id="image"
                  type="text"
                  className="border-[3px] h-10 w-[100%] mb-3 p-2"
                  placeholder="Image URL"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
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

export default Aboutus;
