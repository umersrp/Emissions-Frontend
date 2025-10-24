import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Select from "react-select";
import Button from "@/components/ui/Button";

const SectorEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formdata, setFormData] = useState({
        name: "",
        description: "",
    });
    const [sports, setSports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const user = useSelector((state) => state.auth.user);
    useEffect(() => {
        const fetchLocationById = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/sector/sector/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                if (response.data) {
                    setFormData({
                        name: response.data.data.name || "",         // ✅ add name
                        description: response.data.data.description || "", // ✅ add description
                    });

                } else {
                    setError("Sector not found");
                }
            } catch (err) {
                setError("Failed to fetch sector data");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLocationById();
    }, [id]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            await axios.put(
                `${process.env.REACT_APP_BASE_URL}/sector/update/${id}`,
                {
                    name: formdata.name,
                    description: formdata.description, // ✅ Sending array of selected sports
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            toast.success("Sector updated successfully");
            navigate("/Sector-table");
        } catch (err) {
            toast.error("Failed to update Sector");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/Sector-table");
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                {/* Location input */}
                <div>
                    <label className="form-label">Name</label>

                    <input
                        type="text"
                        className="border-[3px] h-10 w-[100%] mb-3 p-2"
                        placeholder="Add Name"
                        onChange={(e) =>
                            setFormData({ ...formdata, name: e.target.value })
                        }
                        value={formdata.name}
                    />
                </div>

                <div>
                    <label className="form-label">Description</label>
                    <input
                        type="text"
                        className="border-[3px] h-10 w-[100%] mb-3 p-2"
                        placeholder="Add Description"
                        onChange={(e) =>
                            setFormData({ ...formdata, description: e.target.value })
                        }
                        value={formdata.description}
                    />
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
                        isLoading={loading}
                    />
                </div>
            </form>
        </Card>
    );
};

export default SectorEdit;
