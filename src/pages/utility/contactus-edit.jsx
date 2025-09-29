import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaAddressBook, FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa"; // Importing social media icons

const Contactedit = () => {
    const navigate = useNavigate();
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("id");

    const [formData, setFormData] = useState({
        title: "",
        contact: {
            email: "",
            phone: "",
        },
        socials: {
            facebook: "",
            instagram: "",
            youtube: "",
            website: ""
        },
    });

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    
    const user = useSelector((state) => state.auth.user);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const baseURL = process.env.REACT_APP_BASE_URL;
                const userType = user.type;

                if (!baseURL || !userType) {
                    throw new Error("Base URL or User Type is not defined");
                }

                // Fetch contact information
                const contactUrl = `${baseURL}/${userType}/contactus/get-contactus`;
                const contactResponse = await axios.get(contactUrl, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                // Fetch social links
                const socialsUrl = `${baseURL}/${userType}/socials/get-socials`;
                const socialsResponse = await axios.get(socialsUrl, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                const contactData = contactResponse.data[0] || {};
                const socialsData = socialsResponse.data[0] || {};

                setFormData({
                    contact: contactData.contact || { email: "", phone: "" },
                    title: contactData.title || "",
                    socials: {
                        facebook: socialsData.facebook?.link || "",
                        instagram: socialsData.instagram?.link || "",
                        youtube: socialsData.youtube?.link || "",
                        website: socialsData.website?.link || ""
                    },
                });

                setIsLoading(false);
            } catch (error) {
                toast.error("Failed to fetch contact data");
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user.type]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const handleSubmit = async () => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/${user.type}/contactus/create-contactus`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (response.status === 200) {
                toast.success("Contact information updated successfully");
                navigate("/dashboard");
            }
        } catch (error) {
            toast.error("Failed to update contact information");
        }
    };

    const handleCancel = () => {
        navigate("/dashboard");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "title") {
            setFormData((prevState) => ({
                ...prevState,
                title: value,
            }));
        } else if (name === "email" || name === "phone") {
            setFormData((prevState) => ({
                ...prevState,
                contact: {
                    ...prevState.contact,
                    [name]: value,
                },
            }));
        } else if (name === "facebook" || name === "instagram" || name === "youtube" || name === "website") {
            setFormData((prevState) => ({
                ...prevState,
                socials: {
                    ...prevState.socials,
                    [name]: value,
                },
            }));
        }
    };

    return (
        <div>
            <Card title="Edit Contact Information">
                <div className="grid lg:grid-cols-1 grid-cols-1 gap-5 mb-5">
                    <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
                        <div>
                            <label htmlFor="title" className="form-label">
                                Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                className="border-[3px] h-10 w-[100%] mb-3 p-2"
                                value={formData.title}
                                placeholder="Add Title"
                                onChange={handleChange}
                            />
                            <label htmlFor="email" className="form-label">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Add Email"
                                className="border-[3px] h-10 w-[100%] mb-3 p-2"
                                value={formData.contact.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="form-label">
                                Phone
                            </label>
                            <input
                                type="text"
                                name="phone"
                                placeholder="Add Phone"
                                className="border-[3px] h-10 w-[100%] mb-3 p-2"
                                value={formData.contact.phone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 grid-cols-1 gap-5 mb-5">
                        <div>
                            <label htmlFor="facebook" className="form-label">
                                <FaFacebook className="inline mr-2" /> Facebook
                            </label>
                            <input
                                type="text"
                                name="facebook"
                                placeholder="Add Facebook Link"
                                className="border-[3px] h-10 w-[100%] mb-3 p-2"
                                value={formData.socials.facebook}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="instagram" className="form-label">
                                <FaInstagram className="inline mr-2" /> Instagram
                            </label>
                            <input
                                type="text"
                                name="instagram"
                                placeholder="Add Instagram Link"
                                className="border-[3px] h-10 w-[100%] mb-3 p-2"
                                value={formData.socials.instagram}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="youtube" className="form-label">
                                <FaYoutube className="inline mr-2" /> YouTube
                            </label>
                            <input
                                type="text"
                                name="youtube"
                                placeholder="Add YouTube Link"
                                className="border-[3px] h-10 w-[100%] mb-3 p-2"
                                value={formData.socials.youtube}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="website" className="form-label">
                                <FaAddressBook className="inline mr-2" /> Website
                            </label>
                            <input
                                type="text"
                                name="website"
                                placeholder="Add Website Link"
                                className="border-[3px] h-10 w-[100%] mb-3 p-2"
                                value={formData.socials.website}
                                onChange={handleChange}
                            />
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

export default Contactedit;
