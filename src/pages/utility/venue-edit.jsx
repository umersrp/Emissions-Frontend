import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Select from 'react-select'; // Import React Select


const VenueEditPage = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSports, setSelectedSports] = useState([]);

  const [sports, setSports] = useState([]);


  const [formData, setFormData] = useState({
    name: "",
    address: { address: "", city: "" },
    capacity: "",
    sports: [""],
    timings: [""],
    price: "1",
    numberOfPitches: 0,
    pitches: [
      {
        pitchName: "",
        sportType: [""],
        size: "",
        slotduration: "",
        availability: [{ day: "", startTime: "", endTime: "" }],
      },
    ],
    vendorId: "",
    images: [""],
    days: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const urlParams = new URLSearchParams(window.location.search);
  const [uploadingData, setUploadingData] = useState(false);

  const userId = urlParams.get("id");
  const user = useSelector((state) => state.auth.user);
  const sportsOptions = sports.map((sport) => ({
    value: sport._id,
    label: sport.name,
  }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rolesResponse = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/${user.type}/venue/get-venues`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setRoles(rolesResponse.data.venues);

        const userResponse = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/${user.type}/venue/get-venues/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setFormData(userResponse.data);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch venue details");
      }
    };

    const fetchSports = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/${user.type}/sport/get-sports`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setSports(response.data); // Assuming response.data.sports is an array of sport objects with id and 
        console.log(response.data, "spoirts");
      } catch (error) {
        console.error("Failed to fetch sports:", error);
      }
    };

    fetchData();
    fetchSports();
  }, [userId, user.type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      try {
        setUploadingData(true);

        const updatedForm = new FormData();
        updatedForm.append("data", JSON.stringify(formData)); // ✅ send structured data
        if (selectedImage) {
          updatedForm.append("image", selectedImage); // ✅ attach image
        }

        const response = await axios.put(
          `${process.env.REACT_APP_BASE_URL}/${user.type}/venue/update-venue/${userId}`,
          updatedForm, // ✅ send FormData, not plain object
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.status === 200) {
          toast.success("Venue updated successfully");
          navigate("/venue");
        }
      } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || "Error updating venue");
      } finally {
        setUploadingData(false);
      }
    }
  };


  const validate = () => {
    const errors = {};

    if (!formData.name) errors.name = "Name is required";
    if (!formData.address.address) errors["address.address"] = "Address is required";
    if (!formData.address.city) errors["address.city"] = "City is required";
    if (!formData.capacity || isNaN(formData.capacity)) errors.capacity = "Valid capacity is required";
    if (!formData.sports) errors.sports = "Sports type is required";
    if (formData.timings.length === 0 || !formData.timings[0]) errors.timings = "At least one timing is required";
    // if (!formData.price || isNaN(formData.price)) errors.price = "Valid price is required";
    if (!formData.numberOfPitches || isNaN(formData.numberOfPitches)) errors.numberOfPitches = "Valid number of pitches is required";
    if (!formData.vendorId) errors.vendorId = "Vendor ID is required";
    if (!formData.images[0]) errors.images = "At least one image URL is required";
    if (!formData.days) errors.days = "Days field is required";

    formData.pitches.forEach((pitch, index) => {
      if (!pitch.pitchName) errors[`pitches[${index}].pitchName`] = "Pitch name is required";
      if (!pitch.sportType) errors[`pitches[${index}].sportType`] = "Sport type is required";
      if (!pitch.size) errors[`pitches[${index}].size`] = "Size is required";
      if (!pitch.slotduration || isNaN(pitch.slotduration)) errors[`pitches[${index}].slotduration`] = "Valid slot duration is required";
    });

    return errors;
  };

  const handleCancel = () => {
    navigate("/venue");
  };

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData({ ...formData, [name]: value });
  // };

  const handleNestedChange = (e, index, key) => {
    const updatedPitches = [...formData.pitches];
    updatedPitches[index][key] = e.target.value;
    setFormData({ ...formData, pitches: updatedPitches });
  };
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "numberOfPitches") {
      const number = parseInt(value, 10) || 0;
      const updatedPitches = [...formData.pitches];

      // Only add new pitches if needed
      if (number > updatedPitches.length) {
        for (let i = updatedPitches.length; i < number; i++) {
          updatedPitches.push({
            pitchName: "",
            pitchprice: "",
            sportType: [""],
            size: "",
            slotduration: "",
            availability: [
              {
                day: "",
                startTime: "",
                endTime: ""
              }
            ]
          });
        }
      }

      setFormData({
        ...formData,
        numberOfPitches: number,
        pitches: updatedPitches, // keep all pitches
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };



  return (
    <div>
      <Card title="Edit Venue">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="form-label">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="border-[3px] h-10 w-full mb-3 p-2"
                  placeholder="Venue Name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="form-label">Address</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  className="border-[3px] h-10 w-full mb-3 p-2"
                  placeholder="Venue Address"
                  value={formData.address.address}
                  onChange={(e) =>
                    handleChange({
                      target: {
                        name: "address",
                        value: { ...formData.address, address: e.target.value },
                      },
                    })
                  }
                />
                {errors["address.address"] && <p className="text-red-500 text-xs mt-1">{errors["address.address"]}</p>}
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className="form-label">City</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  className="border-[3px] h-10 w-full mb-3 p-2"
                  placeholder="City"
                  value={formData.address.city}
                  onChange={(e) =>
                    handleChange({
                      target: {
                        name: "city",
                        value: { ...formData.address, city: e.target.value },
                      },
                    })
                  }
                />
                {errors["address.city"] && <p className="text-red-500 text-xs mt-1">{errors["address.city"]}</p>}
              </div>

              {/* Capacity */}
              <div>
                <label htmlFor="capacity" className="form-label">Capacity</label>
                <input
                  id="capacity"
                  name="capacity"
                  type="number"
                  className="border-[3px] h-10 w-full mb-3 p-2"
                  placeholder="Venue Capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                />
                {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>}
              </div>

              {/* Sports */}
              <div>
                <label htmlFor="sports" className="form-label">Sports</label>
                {/* <input
                  id="sports"
                  name="sports"
                  type="text"
                  className="border-[3px] h-10 w-full mb-3 p-2"
                  placeholder="Sport Type"
                  value={formData.sports[0]?.name || ""}
                  onChange={handleChange}
                /> */}
                <Select
                  isMulti
                  options={sportsOptions}
                  value={selectedSports}
                  onChange={(selectedOptions) => {
                    setSelectedSports(selectedOptions); // Store selected sport objects
                    setFormData({
                      ...formData,
                      sports: selectedOptions.map((option) => option.value), // Store only IDs
                    });
                  }}
                  className="mb-3"
                />
                {errors.sports && <p className="text-red-500 text-xs mt-1">{errors.sports}</p>}
              </div>

              {/* Price */}
              {/* <div>
                <label htmlFor="price" className="form-label">Price</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  className="border-[3px] h-10 w-full mb-3 p-2"
                  placeholder="Price"
                  value={formData.price}
                  onChange={handleChange}
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div> */}

              {/* Number of Pitches */}
              <div>
                <label htmlFor="numberOfPitches" className="form-label">Number of Pitches</label>
                <input
                  id="numberOfPitches"
                  name="numberOfPitches"
                  type="number"
                  className="border-[3px] h-10 w-full mb-3 p-2"
                  placeholder="Number of Pitches"
                  value={formData.numberOfPitches}
                  onChange={handleChange}
                />
                {errors.numberOfPitches && <p className="text-red-500 text-xs mt-1">{errors.numberOfPitches}</p>}
              </div>
              <div className="mb-5">
                <label className="form-label">Current Image</label>
                {formData.images[0] && (
                  <div className="mb-3">
                    <img
                      src={formData.images[0]}
                      alt="Venue"
                      className="w-40 h-40 object-cover rounded-md border"
                    />
                  </div>
                )}

                <label className="form-label">Change Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="border-[3px] h-10 w-full mb-3 p-2"
                  onChange={(e) => {
                    setSelectedImage(e.target.files[0]);
                  }}
                />
              </div>

            </div>

            {/* Timings - can remain full width */}
            <div className="mb-5">
              <label htmlFor="timings" className="form-label">Timings</label>
              {formData.timings.map((timing, index) => (
                <input
                  key={index}
                  name={`timing-${index}`}
                  type="text"
                  className="border-[3px] h-10 w-full mb-3 p-2"
                  placeholder={`Timing ${index + 1}`}
                  value={timing}
                  onChange={(e) => {
                    const updatedTimings = [...formData.timings];
                    updatedTimings[index] = e.target.value;
                    setFormData({ ...formData, timings: updatedTimings });
                  }}
                />
              ))}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, timings: [...formData.timings, ""] })}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Add Timing
              </button>
              {errors.timings && <p className="text-red-500 text-xs mt-1">{errors.timings}</p>}
            </div>


            <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
              {formData.pitches.slice(0, formData.numberOfPitches).map((pitch, index) => (
                <div key={index}>
                  <h3>Pitch {index + 1}</h3>
                  <label htmlFor={`pitchName-${index}`} className="form-label">Pitch Name</label>
                  <input
                    id={`pitchName-${index}`}
                    name={`pitchName-${index}`}
                    type="text"
                    className="border-[3px] h-10 w-[100%] mb-3 p-2"
                    placeholder="Pitch Name"
                    value={pitch.pitchName}
                    onChange={(e) => handleNestedChange(e, index, 'pitchName')}
                  />
                  {errors[`pitches[${index}].pitchName`] && <p className="text-red-500 text-xs mt-1">{errors[`pitches[${index}].pitchName`]}</p>}
                  <label htmlFor={`pitchprice-${index}`} className="form-label">Pitch Price</label>
                  <input
                    id={`pitchprice-${index}`}
                    name={`pitchprice-${index}`}
                    type="number"
                    className="border-[3px] h-10 w-full mb-3 p-2"
                    placeholder="Pitch Price"
                    value={pitch.pitchprice}
                    onChange={(e) => handleNestedChange(e, index, 'pitchprice')}
                  />
                  {errors[`pitches[${index}].pitchprice`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[`pitches[${index}].pitchprice`]}
                    </p>
                  )}


                  <label htmlFor={`sportType-${index}`} className="form-label">Sport Type</label>
                  {/* <input
                    id={`sportType-${index}`}
                    name={`sportType-${index}`}
                    type="text"
                    className="border-[3px] h-10 w-[100%] mb-3 p-2"
                    placeholder="Sport Type"
                    value={pitch.sportType[0].name}
                    onChange={(e) => handleNestedChange(e, index, 'sportType')}
                  /> */}
                  <select
                    id={`sportType-${index}`}
                    name={`sportType-${index}`}
                    className="form-control py-2 mb-3"
                    value={pitch.sportType[0].name}

                    onChange={(e) => handleNestedChange(e, index, 'sportType')}
                  >
                    <option value="">Select Sport</option>
                    {sports.map((sport) => (
                      <option key={sport._id} value={sport._id}>
                        {sport.name}
                      </option>
                    ))}
                  </select>
                  {errors[`pitches[${index}].sportType`] && <p className="text-red-500 text-xs mt-1">{errors[`pitches[${index}].sportType`]}</p>}

                  <label htmlFor={`size-${index}`} className="form-label">Size</label>
                  <input
                    id={`size-${index}`}
                    name={`size-${index}`}
                    type="text"
                    className="border-[3px] h-10 w-[100%] mb-3 p-2"
                    placeholder="Size"
                    value={pitch.size}
                    onChange={(e) => handleNestedChange(e, index, 'size')}
                  />
                  {errors[`pitches[${index}].size`] && <p className="text-red-500 text-xs mt-1">{errors[`pitches[${index}].size`]}</p>}

                  <label htmlFor={`slotduration-${index}`} className="form-label">Slot Duration</label>
                  <input
                    id={`slotduration-${index}`}
                    name={`slotduration-${index}`}
                    type="number" // Changed to number
                    className="border-[3px] h-10 w-[100%] mb-3 p-2"
                    placeholder="Slot Duration"
                    value={pitch.slotduration}
                    onChange={(e) => handleNestedChange(e, index, 'slotduration')}
                  />
                  {errors[`pitches[${index}].slotduration`] && <p className="text-red-500 text-xs mt-1">{errors[`pitches[${index}].slotduration`]}</p>}

                  {pitch.availability.map((availability, availIndex) => (
                    <div key={availIndex}>
                      <label htmlFor={`day-${index}-${availIndex}`} className="form-label">Day</label>
                      <input
                        id={`day-${index}-${availIndex}`}
                        name={`day-${index}-${availIndex}`}
                        type="text"
                        className="border-[3px] h-10 w-[100%] mb-3 p-2"
                        placeholder="Day"
                        value={availability.day}
                        onChange={(e) => {
                          const updatedAvailability = [...pitch.availability];
                          updatedAvailability[availIndex].day = e.target.value;
                          const updatedPitches = [...formData.pitches];
                          updatedPitches[index].availability = updatedAvailability;
                          setFormData({ ...formData, pitches: updatedPitches });
                        }}
                      />
                      <label htmlFor={`startTime-${index}-${availIndex}`} className="form-label">Start Time</label>
                      <input
                        id={`startTime-${index}-${availIndex}`}
                        name={`startTime-${index}-${availIndex}`}
                        type="text"
                        className="border-[3px] h-10 w-[100%] mb-3 p-2"
                        placeholder="Start Time"
                        value={availability.startTime}
                        onChange={(e) => {
                          const updatedAvailability = [...pitch.availability];
                          updatedAvailability[availIndex].startTime = e.target.value;
                          const updatedPitches = [...formData.pitches];
                          updatedPitches[index].availability = updatedAvailability;
                          setFormData({ ...formData, pitches: updatedPitches });
                        }}
                      />
                      <label htmlFor={`endTime-${index}-${availIndex}`} className="form-label">End Time</label>
                      <input
                        id={`endTime-${index}-${availIndex}`}
                        name={`endTime-${index}-${availIndex}`}
                        type="text"
                        className="border-[3px] h-10 w-[100%] mb-3 p-2"
                        placeholder="End Time"
                        value={availability.endTime}
                        onChange={(e) => {
                          const updatedAvailability = [...pitch.availability];
                          updatedAvailability[availIndex].endTime = e.target.value;
                          const updatedPitches = [...formData.pitches];
                          updatedPitches[index].availability = updatedAvailability;
                          setFormData({ ...formData, pitches: updatedPitches });
                        }}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                className="btn btn-light text-center"

                onClick={handleCancel} type="button">Cancel</Button>
              <Button loading={uploadingData} className="btn-dark"
                type="submit">Update Venue</Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default VenueEditPage;
