import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useSelector } from 'react-redux';

const SportAdd = () => {
    const [name, setName] = useState('');
    const [locations, setLocations] = useState([]);
    const [locationId, setLocationId] = useState('');
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);


    // Fetch locations on component mount
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/${user.type}/location/get-locations`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                setLocations(response.data);
            } catch (error) {
                console.error('Error fetching locations:', error);
            }
        };

        fetchLocations();
    }, [user.type]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/admin/sport/create-sports`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    name, location: locationId,
                }),
            });

            if (response.ok) {
                toast.success('Sport added successfully');
                navigate('/sportlist');
            } else {
                toast.error('Failed to add sport');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('An error occurred');
        }
    };

    const handleCancel = () => {
        navigate('/sportlist');
    };

    return (
        <div>
            <Card title="Create Sport">
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="name">Sport Name:</label>
                        <input
                            type="text"
                            id="name"
                            className="border-[3px] h-10 w-[100%] mb-3 p-2"
                            placeholder="Add Sport Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    {/* <div>
                        <label htmlFor="location">Select Location:</label>
                        <select
                            id="location"
                            className="border-[3px] h-10 w-[100%] mb-3 p-2"
                            value={locationId}
                            onChange={(e) => setLocationId(e.target.value)}
                            required
                        >
                            <option value="">Select Location</option>
                            {locations.map((loc) => (
                                <option key={loc._id} value={loc._id}>
                                    {loc.location}
                                </option>
                            ))}
                        </select>
                    </div> */}

                    <div className="ltr:text-right rtl:text-left space-x-3 rtl:space-x-reverse">
                        <button className="btn btn-light text-center" onClick={handleCancel} type="button">
                            Cancel
                        </button>
                        <Button type="submit" text="Save" className="btn-dark" />
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default SportAdd;
