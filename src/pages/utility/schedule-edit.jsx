import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Scheduleedit = () => {
    const navigate = useNavigate();
    const [coaches, setCoaches] = useState([]);

    const [formData, setFormData] = useState({
        location: "",
        group: "",
        coach: "", // Add coach field to form data
        days: [],
        start_time: "",
        end_time: "",
        ages: ""
    });

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [locations, setLocations] = useState([]); // State to store locations


    const user = useSelector((state) => state.auth.user) || {};
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("id");


    useEffect(() => {
        const fetchCoaches = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/${user.type}/coach/get-coaches`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                if (response?.data?.coaches) {
                    setCoaches(response.data.coaches);
                }

            } catch (err) {
                console.error("Failed to fetch coaches", err);
                toast.error("Failed to load coaches");
            }
        };

        if (user.type) {
            fetchCoaches();
        }
    }, [user.type]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch coach details by ID
                const userResponse = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/${user.type}/schedule/get-schedule/${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                // Set form data with the fetched coach data
                setFormData(userResponse.data);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching Group data:", error);
                toast.error("Failed to fetch Group data");
            }
        };

        const fetchLocations = async () => {
            try {
                const locationResponse = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/${user.type}/location/get-locations`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                setLocations(locationResponse.data); // Store fetched locations
            } catch (error) {
                console.log(error);
                toast.error("Failed to fetch locations");
            }
        };


        fetchData();
        fetchLocations()
    }, [userId, user.type]);


    const handleSubmit = async () => {
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BASE_URL}/${user.type}/schedule/update-schedule/${formData._id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            console.log("Submit Response: ", response);

            if (response.status === 200) {
                toast.success("Group updated successfully");
                navigate('/Group-table');
            }
        } catch (error) {
            console.error("Error while updating: ", error);
            toast.error("Failed to update Group");
        }
    };

    const handleCancel = () => {
        navigate("/Group-table");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // For location, store the ID instead of the name
        if (name === "location") {
            const selectedLocation = locations.find(location => location._id === value);
            setFormData({ ...formData, [name]: selectedLocation._id });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    console.log("Form Data: ", formData);


    return (
        <div>
            <Card title="Edit Group">
                {isLoading ? (
                    <div>Loading...</div>
                ) : error ? (
                    <div>{error}</div>
                ) : (
                    <div className="grid lg:grid-cols-1 grid-cols-1 gap-5 mb-5">
                        <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
                            <div>
                                <label htmlFor="location" className="form-label">
                                    Location
                                </label>
                                <select
                                    name="location"
                                    className="border-[3px] h-10 w-[100%] mb-2 p-2"
                                    value={formData.location}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Location</option>
                                    {locations.map((location) => (
                                        <option key={location._id} value={location._id}>
                                            {location.location}
                                        </option>
                                    ))}
                                </select>
                                <div>
                                    <label htmlFor="coach" className="form-label">
                                        Coach
                                    </label>
                                    <select
                                        name="coach"
                                        className="border-[3px] h-10 w-[100%] mb-3 p-2"
                                        value={formData.coach || ""}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Coach</option>
                                        {coaches?.map((coach) => (
                                            <option key={coach._id} value={coach._id}>
                                                {coach.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <label htmlFor="group" className="form-label">
                                    Group
                                </label>
                                <input
                                    type="text"
                                    name="group"
                                    placeholder="Enter Group"
                                    className="border-[3px] h-10 w-[100%] mb-3 p-2"
                                    value={formData.group}
                                    onChange={handleChange}
                                />

                                <label htmlFor="days" className="form-label">
                                    Days
                                </label>
                                <input
                                    type="text"
                                    name="days"
                                    placeholder="Enter Days (e.g., mon,fri,wed)"
                                    className="border-[3px] h-10 w-[100%] mb-3 p-2"
                                    value={formData.days}
                                    onChange={handleChange}
                                />



                            </div>
                            <div>
                                {/* <label htmlFor="days" className="form-label">
                                    Days
                                </label>
                                <input
                                    type="text"
                                    name="days"
                                    placeholder="Enter Days (e.g., mon,fri,wed)"
                                    className="border-[3px] h-10 w-[100%] mb-3 p-2"
                                    value={formData.days}
                                    onChange={handleChange}
                                /> */}

                                <label htmlFor="start_time" className="form-label">
                                    Start Time
                                </label>
                                <input
                                    type="text"
                                    name="start_time"
                                    placeholder="Enter Start Time"
                                    className="border-[3px] h-10 w-[100%] mb-3 p-2"
                                    value={formData.start_time}
                                    onChange={handleChange}
                                />

                                <label htmlFor="end_time" className="form-label">
                                    End Time
                                </label>
                                <input
                                    type="text"
                                    name="end_time"
                                    placeholder="Enter End Time"
                                    className="border-[3px] h-10 w-[100%] mb-3 p-2"
                                    value={formData.end_time}
                                    onChange={handleChange}
                                />

                                <label htmlFor="ages" className="form-label">
                                    Age
                                </label>
                                <input
                                    type="text"
                                    name="ages"
                                    placeholder="Enter Ages"
                                    className="border-[3px] h-10 w-[100%] mb-3 p-2"
                                    value={formData.ages}
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

export default Scheduleedit;
