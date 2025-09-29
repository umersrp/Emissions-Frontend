import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Select from "react-select";


const Scheduleadd = () => {
    const navigate = useNavigate();
    const [coaches, setCoaches] = useState([]);
    const [formData, setFormData] = useState({
        location: "",
        group: "",
        days: [],
        start_time: "",
        end_time: "",
        ages: "",
        coach: [],  // 👈 Add this
        users: [], // Add users field to form data
    });
    const [userList, setUserList] = useState([]); // State to manage users
    const [filteredUsers, setFilteredUsers] = useState([]); // State for filtered users
    const [searchTerm, setSearchTerm] = useState(""); // State for search term
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const user = useSelector((state) => state.auth.user) || {};
    const [locations, setLocations] = useState([]); // State to store locations
    const [uploadingData, setUploadingData] = useState(false);


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
                const baseURL = process.env.REACT_APP_BASE_URL;
                const userType = user.type;

                if (!baseURL || !userType) {
                    throw new Error("Base URL or User Type is not defined");
                }

                // Fetch user list
                const userResponse = await axios.get(`${baseURL}/${userType}/user/get-users`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });

                setUserList(userResponse.data.users || []);
                setFilteredUsers(userResponse.data.users || []);
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to fetch data: ", error);
                setError("Failed to fetch user data");
                setIsLoading(false);
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
    }, [user.type]);



    // Filter users based on search term
    useEffect(() => {
        const result = userList.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(result);
    }, [searchTerm, userList]);

    const handleSubmit = async () => {
        try {
            setUploadingData(true);

            console.log("Form Data to submit: ", formData);  // Log to check data before submission
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/${user.type}/schedule/create-schedule`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (response.status === 201) {
                toast.success("Group created successfully");
                navigate('/Group-table');
            }
        } catch (error) {
            console.error("Error while creating Group: ", error);
            toast.error("Failed to create Group");
        } finally {
            setUploadingData(false);

        }
    };

    const handleCancel = () => {
        navigate("/Group-table");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "location") {
            const selectedLocation = locations.find(location => location._id === value);
            setFormData({ ...formData, [name]: selectedLocation._id });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };



    const handleUserSelection = (e) => {
        const options = e.target.options;
        const selectedUsers = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedUsers.push(options[i].value);
            }
        }
        setFormData({ ...formData, users: selectedUsers });
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };



    console.log("Form Data: ", formData);

    return (
        <div>
            <Card title="Create Group">
                {isLoading ? (
                    <div>Loading...</div>
                ) : error ? (
                    <div>{error}</div>
                ) : (
                    <div className="grid lg:grid-cols-1 grid-cols-1 gap-5 mb-5">
                        <div className="grid lg:grid-cols-2 grid-cols-2 gap-3">
                            {/* Location Field */}
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
                            </div>
                            {/* Coach Field */}
                            <div>
                                <label htmlFor="coach" className="form-label">
                                    Coach
                                </label>
                                <Select
                                    isMulti
                                    className="mb-3"
                                    options={coaches?.map((coach) => ({
                                        value: coach._id,
                                        label: coach.name,
                                    }))}
                                    value={
                                        Array.isArray(formData.coach)
                                            ? coaches
                                                .filter((c) => formData.coach.includes(c._id))
                                                .map((coach) => ({
                                                    value: coach._id,
                                                    label: coach.name,
                                                }))
                                            : []
                                    }
                                    onChange={(selectedOptions) =>
                                        setFormData({
                                            ...formData,
                                            coach: selectedOptions ? selectedOptions.map((option) => option.value) : [],
                                        })
                                    }
                                    placeholder="Select Coaches"
                                />

                            </div>


                            {/* Group Field */}
                            <div>
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
                            </div>

                            {/* Days Field */}
                            <div>
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

                            {/* Start Time Field */}
                            <div>
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
                            </div>

                            {/* End Time Field */}
                            <div>
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
                            </div>

                            {/* Ages Field */}
                            <div>
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

                            {/* Users Field */}

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

                    <Button text="Save"
                        className="btn-dark"
                        onClick={handleSubmit}
                        isLoading={uploadingData}
                    />
                </div>
            </Card>
        </div>

    );
};

export default Scheduleadd;
