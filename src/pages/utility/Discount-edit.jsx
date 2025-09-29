import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Discountedit = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        WhoWeAre: "",
        OurVision: "",
        OurMission: "ooo",
        _v: "", // Optional, based on actual use,
        image: "",
        currentImage: null, // to store the current image URL
    });
    const [isLoading, setIsLoading] = useState(true);
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("id");
    const user = useSelector((state) => state.auth.user);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const baseURL = process.env.REACT_APP_BASE_URL;
                const userType = user.type;

                if (!baseURL || !userType) {
                    throw new Error("Base URL or User Type is not defined");
                }

                const configUrl = `${baseURL}/${userType}/aboutus/get-aboutus`;
                console.log(`Fetching data from: ${configUrl}`);

                const userResponse = await axios.get(configUrl, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                console.log("Fetched data: ", userResponse);
                const homepageData = userResponse.data[0]; // Get the first object from the array
                setFormData({
                    WhoWeAre: homepageData.WhoWeAre || "",
                    OurMission: homepageData.OurMission || "",
                    OurVision: homepageData.OurVision || "",
                    currentImage: homepageData.image || "", // get the current image URL
                });
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to fetch data: ", error);
                toast.error("Failed to fetch Config");
            }
        };

        fetchData();
    }, [user.type]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const handleSubmit = async () => {
        try {
            const formDataToSend = new FormData();
            formDataToSend.append("WhoWeAre", formData.WhoWeAre);
            formDataToSend.append("OurMission", formData.OurMission);
            formDataToSend.append("OurVision", formData.OurVision);

            // Only append image if a new file is selected
            if (formData.image) {
                formDataToSend.append("image", formData.image);
            }

            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/${user.type}/aboutus/create-aboutus`,
                formDataToSend,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.status === 200) {
                toast.success("User updated successfully");
                navigate("/dashboard");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update user");
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
            <Card title="Edit About Us">
                <div className="grid lg:grid-cols-1 grid-cols-1 gap-5 mb-5">
                    <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
                        <div>

                        <label htmlFor="WhoWeAre" className="form-label">
                                Who We Are
                            </label>
                            <input
                                id="WhoWeAre"
                                name="WhoWeAre"
                                type="text"
                                className="border-[3px] h-10 w-[100%] mb-3 p-2"
                                placeholder="Add Who We Are"
                                value={formData.WhoWeAre}
                                onChange={handleChange}
                            />
                            <label htmlFor="OurVision" className="form-label">
                                Our Vision
                            </label>
                            <input
                                id="OurVision"
                                name="OurVision"
                                type="text"
                                className="border-[3px] h-10 w-[100%] mb-3 p-2"
                                placeholder="Add Our Vision"
                                value={formData.OurVision}
                                onChange={handleChange}
                            />
                          
                        </div>

                        <div>
                            {/* <label htmlFor="OurMission" className="form-label">
                                Our Mission
                            </label>
                            <input
                                id="OurMission"
                                name="OurMission"
                                type="text"
                                className="border-[3px] h-10 w-[100%] mb-3 p-2"
                                placeholder="Add Our Mission"
                                value={formData.OurMission}
                                onChange={handleChange}
                            /> */}

                            <div>
                                {formData.currentImage && (
                                    <div>
                                        <img
                                            src={formData.currentImage}
                                            alt="Current Image"
                                            className="h-32 w-32 mb-3"
                                        />
                                    </div>
                                )}
                                <label htmlFor="image" className="form-label">
                                    Upload New Image
                                </label>
                                <input
                                    id="image"
                                    type="file"
                                    className="border-[3px] h-9 w-[100%] mb-3 p-0"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>
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

export default Discountedit;
