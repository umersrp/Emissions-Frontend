import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Feedbackedit = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        rating: "",
        email: "",
        message: "",
    });

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const user = useSelector((state) => state.auth.user) || {};

    useEffect(() => {
        const fetchData = async () => {
            try {
                const baseURL = process.env.REACT_APP_BASE_URL;
                const userType = user.type;
                
                if (!baseURL || !userType) {
                    throw new Error("Base URL or User Type is not defined");
                }

                const configUrl = `${baseURL}/${userType}/feedback/get-feedback`;
                console.log(`Fetching data from: ${configUrl}`);

                const userResponse = await axios.get(configUrl, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });

                // Assuming the data is an array with at least one item
                if (userResponse.data && userResponse.data.length > 0) {
                    const feedbackData = userResponse.data[0]; // Access the first element of the array
                    setFormData(feedbackData);
                }

                setIsLoading(false);
            } catch (error) {
                console.error("Failed to fetch data: ", error);
                setError("Failed to fetch Config");
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user.type]);

    const handleSubmit = async () => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/${user.type}/feedback/create-feedback`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            console.log("Submit Response: ", response);

            if (response.status === 200) {
                toast.success("Feedback updated successfully");
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("Error while updating: ", error);
            toast.error("Failed to update Feedback");
        }
    };

    const handleCancel = () => {
        navigate("/dashboard");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    console.log("Form Data: ", formData);

    return (
        <div>
            <Card title="Edit Feedback">
                {isLoading ? (
                    <div>Loading...</div>
                ) : error ? (
                    <div>{error}</div>
                ) : (
                    <div className="grid lg:grid-cols-1 grid-cols-1 gap-5 mb-5">
                        <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
                            <div>
                                <label htmlFor="rating" className="form-label">
                                    Rating
                                </label>
                                <input
                                    type="text"
                                    name="rating"
                                    className="border-[3px] h-10 w-[100%] mb-3 p-2"
                                    value={formData.rating}
                                    placeholder="Enter Rating"
                                    onChange={handleChange}
                                />

                                <label htmlFor="email" className="form-label">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter Email"
                                    className="border-[3px] h-10 w-[100%] mb-3 p-2"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="form-label">
                                    Message
                                </label>
                                <input
                                    type="text"
                                    name="message"
                                    placeholder="Enter Message"
                                    className="border-[3px] h-10 w-[100%] mb-3 p-2"
                                    value={formData.message}
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

export default Feedbackedit;
