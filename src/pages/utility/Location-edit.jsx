import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Select from "react-select";
import Button from "@/components/ui/Button";

const Locationedit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [location, setLocation] = useState({
    location: "",
    sports: [], // ✅ Changed to array for multi-select
  });
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const user = useSelector((state) => state.auth.user);

  // ✅ Fetch location by ID directly
  useEffect(() => {
    const fetchLocationById = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/${user.type}/location/locations/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data) {
          setLocation({
            location: response.data.location || "",
            sports: response.data.sports || [], // keep objects
          });

        } else {
          setError("Location not found");
        }
      } catch (err) {
        setError("Failed to fetch location data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationById();
  }, [id, user.type]);

  // ✅ Fetch sports list
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/${user.type}/sport/get-sports`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (Array.isArray(response.data)) {
          setSports(response.data);
        } else if (response.data.sports) {
          setSports(response.data.sports);
        }
      } catch (error) {
        console.error("Error fetching sports:", error);
      }
    };

    fetchSports();
  }, [user.type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      await axios.put(
        `${process.env.REACT_APP_BASE_URL}/${user.type}/location/update-locations/${id}`,
        {
          location: location.location,
          sports: location.sports, // ✅ Sending array of selected sports
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Location updated successfully");
      navigate("/location");
    } catch (err) {
      toast.error("Failed to update location");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/location");
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        {/* Location input */}
        <div>
          <label className="form-label">location</label>

          <input
            type="text"
            className="border-[3px] h-10 w-[100%] mb-3 p-2"
            placeholder="Add Location"
            onChange={(e) =>
              setLocation({ ...location, location: e.target.value })
            }
            value={location.location}
          />
        </div>

        {/* ✅ Multi-Select Sports Dropdown */}
        <div>
          <label className="form-label">Select Sports</label>
          <Select
            isMulti
            className="mb-3"
            options={sports.map((sport) => ({
              value: sport._id,
              label: sport.name,
            }))}

            value={location.sports?.map((selected) => ({
              value: selected._id,
              label: selected.name,
            }))}

            onChange={(selectedOptions) =>
              setLocation({
                ...location,
                sports: selectedOptions.map((option) => ({
                  _id: option.value,
                  name: option.label,
                })),
              })
            }
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

export default Locationedit;
