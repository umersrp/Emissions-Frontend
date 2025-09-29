import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Flatpickr from "react-flatpickr";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Fileinput from "@/components/ui/Fileinput";
import Select from 'react-select'; // Import React Select

const VenueAddPage = () => {
  const navigate = useNavigate();
  const [selectedSports, setSelectedSports] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);


  const [formData, setFormData] = useState({
    name: "",
    address: { address: "", city: "" },
    days: [],
    capacity: "",
    location: "",
    sports: [],
    timings: [],
    price: "0",
    vendorId: "",
    numberOfPitches: "",
    pitches: [],
    amenities: [],
    image: []

  });
  const [errors, setErrors] = useState({});
  const [uploadingData, setUploadingData] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const [previews, setPreviews] = useState([]);
  const [sports, setSports] = useState([]);
  const [vendor, setVendor] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/${user.type}/vendor/get-vendors`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        setVendor(response.data.vendors);
      } catch (error) {
        console.error("Failed to fetch vendors:", error);
      }
    };
    const fetchAmenities = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/${user.type}/amenities/get-amenities`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setAmenities(response.data);
      } catch (error) {
        console.error("Failed to fetch amenities:", error);
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
    fetchAmenities();
    fetchVendors();
    fetchSports();
  }, [user.type]);

  // const validate = () => {
  //     const errors = {};
  //     if (!formData.name) errors.name = "Name is required";
  //     // if (!formData.address || !formData.city) errors.address = "Address and City are required";
  //     if (!formData.capacity || isNaN(formData.capacity)) errors.capacity = "Valid capacity is required";
  //     if (!formData.sports) errors.sports = "Sports type is required";
  //     if (formData.timings.length === 0) errors.timings = "At least one timing is required";
  //     if (!formData.price || isNaN(formData.price)) errors.price = "Valid price is required";
  //     if (!formData.numberOfPitches || isNaN(formData.numberOfPitches)) errors.numberOfPitches = "Valid number of pitches is required";
  //     if (!formData.vendorId) errors.vendorId = "Vendor is required";
  //     if (formData.pitches.length === 0) errors.pitches = "At least one pitch is required";
  //     if (!formData.location) errors.location = "Location is required";

  //     formData.pitches.forEach((pitch, index) => {
  //         if (!pitch.pitchName) errors[`pitchName-${index}`] = "Pitch Name is required";
  //         if (!pitch.size) errors[`size-${index}`] = "Pitch Size is required";
  //         if (!pitch.sportType) errors[`sportType-${index}`] = "Pitch Sport Type is required";
  //         if (pitch.availability.length === 0) errors[`availability-${index}`] = "At least one availability is required";
  //         pitch.availability.forEach((avail, availIndex) => {
  //             if (!avail.day) errors[`day-${index}-${availIndex}`] = "Day is required";
  //             if (!avail.startTime) errors[`startTime-${index}-${availIndex}`] = "Start Time is required";
  //             if (!avail.endTime) errors[`endTime-${index}-${availIndex}`] = "End Time is required";
  //         });
  //     });

  //     return errors;
  // };

  // const handleFileChange = (e) => {
  //     if (e.target.files[0]) {
  //         setFormData({ ...formData, image: e.target.files[0] });
  //     }
  // };

  // const handleSubmit = async () => {
  //   // const validationErrors = validate();
  //   // if (Object.keys(validationErrors).length > 0) {
  //   //     setErrors(validationErrors);
  //   //     return;
  //   // }

  //   try {
  //     setUploadingData(true);



  //     const payload = {
  //       name: formData.name,
  //       amenities: selectedAmenities.map(option => option.value),
  //       location: formData.location,  // Add this line
  //       address: formData.address,
  //       days: formData.days,
  //       capacity: formData.capacity,
  //       sports: formData.sports,
  //       timings: formData.timings,
  //       vendorId: formData.vendorId,
  //       numberOfPitches: formData.numberOfPitches,
  //       pitches: formData.pitches.map((pitch) => ({
  //         ...pitch,
  //         availability: pitch.availability.map((avail) => ({
  //           ...avail,
  //           startTime: new Date(avail.startTime).toISOString(),
  //           endTime: new Date(avail.endTime).toISOString(),
  //         })),
  //       })),
  //     };

  //     const response = await axios.post(
  //       `${process.env.REACT_APP_BASE_URL}/${user.type}/venue/create-venue`,
  //       payload,
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //         },
  //       }
  //     );

  //     if (response.status === 201) {
  //       toast.success("Venue created successfully");
  //       navigate("/venue");
  //     }
  //   } catch (error) {
  //     console.error("Submission error:", error);
  //     if (error.response) {
  //       toast.error(error.response.data.message || "Venue not created");
  //     } else {
  //       toast.error("An error occurred, please try again");
  //     }
  //   } finally {
  //     setUploadingData(false);
  //   }
  // };


  const validate = () => {
    const errors = {};
    if (!formData.name) errors.name = "Name is required";
    if (!formData.capacity || isNaN(formData.capacity)) errors.capacity = "Valid capacity is required";
    if (!formData.sports) errors.sports = "Sports type is required";
    if (formData.timings.length === 0) errors.timings = "At least one timing is required";
    if (!formData.price || isNaN(formData.price)) errors.price = "Valid price is required";
    if (!formData.numberOfPitches || isNaN(formData.numberOfPitches)) errors.numberOfPitches = "Valid number of pitches is required";
    if (formData.pitches.length === 0) errors.pitches = "At least one pitch is required";
    if (!formData.location) errors.location = "Location is required";

    formData.pitches.forEach((pitch, index) => {
      if (!pitch.pitchName) errors[`pitchName-${index}`] = "Pitch Name is required";
      if (!pitch.size) errors[`size-${index}`] = "Pitch Size is required";
      if (!pitch.sportType) errors[`sportType-${index}`] = "Pitch Sport Type is required";
      if (!pitch.pitchprice) errors[`pitchprice-${index}`] = "pitchprice is required";

      if (pitch.availability.length === 0) errors[`availability-${index}`] = "At least one availability is required";
      pitch.availability.forEach((avail, availIndex) => {
        if (!avail.day) errors[`day-${index}-${availIndex}`] = "Day is required";
        if (!avail.startTime) errors[`startTime-${index}-${availIndex}`] = "Start Time is required";
        if (!avail.endTime) errors[`endTime-${index}-${availIndex}`] = "End Time is required";
      });
    });

    return errors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (!formData.sports) {
      toast.error("Please select a sport.");
      return;
    }
    try {
      setUploadingData(true);


      const formDataTOSubmit = new FormData();
      if (selectedImage) {
        formDataTOSubmit.append("image", selectedImage); // ✅ attach image
      }

      formDataTOSubmit.append("name", formData.name);
      formDataTOSubmit.append("location", formData.location);
      formDataTOSubmit.append("address[address]", formData.address.address);
      formDataTOSubmit.append("address[city]", formData.address.city); // Assuming you have city in formData
      formDataTOSubmit.append("days", formData.days);
      formDataTOSubmit.append("capacity", formData.capacity);
      formDataTOSubmit.append("sports", formData.sports);
      formDataTOSubmit.append("timings", formData.timings); // Assuming it's an array
      formDataTOSubmit.append("price", formData.price); // Assuming you have price in formData
      formDataTOSubmit.append("numberOfPitches", formData.numberOfPitches);
      formDataTOSubmit.append("vendorId", formData.vendorId);
      selectedAmenities.forEach((option, index) => {
        formDataTOSubmit.append(`amenities[${index}]`, option.value);
      });



      // Instead of: if (formData.image)




      formData.pitches.forEach((pitch, pitchIndex) => {
        formDataTOSubmit.append(`pitches[${pitchIndex}][pitchName]`, pitch.pitchName);
        formDataTOSubmit.append(`pitches[${pitchIndex}][sportType]`, pitch.sportType);
        formDataTOSubmit.append(`pitches[${pitchIndex}][pitchprice]`, pitch.pitchprice);
        formDataTOSubmit.append(`pitches[${pitchIndex}][size]`, pitch.size);
        formDataTOSubmit.append(`pitches[${pitchIndex}][slotduration]`, pitch.slotduration);

        pitch.availability.forEach((avail, availIndex) => {
          formDataTOSubmit.append(`pitches[${pitchIndex}][availability][${availIndex}][day]`, avail.day);
          formDataTOSubmit.append(`pitches[${pitchIndex}][availability][${availIndex}][startTime]`, new Date(avail.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
          formDataTOSubmit.append(`pitches[${pitchIndex}][availability][${availIndex}][endTime]`, new Date(avail.endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
        });
      });

      console.log('Form Data to Submit:', Array.from(formDataTOSubmit.entries()));

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/${user.type}/venue/create-venue`,
        formDataTOSubmit,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success("Venue created successfully");
        navigate("/venue");
      }
    } catch (error) {
      console.error("Submission error:", error);
      if (error.response) {
        console.error("Server response:", error.response.data);
        toast.error(error.response.data.message || "Venue not created");
      } else if (error.request) {
        console.error("Request made but no response received:", error.request);
      } else {
        console.error("Error in setting up request:", error.message);
        toast.error("An error occurred, please try again");
      }
    } finally {
      setUploadingData(false);
    }
  };



  const updatePitchField = (index, field, value) => {
    const updatedPitches = [...formData.pitches];
    if (!updatedPitches[index]) {
      updatedPitches[index] = { availability: [] };
    }
    updatedPitches[index][field] = value;
    setFormData({ ...formData, pitches: updatedPitches });
  };

  const updateAvailabilityField = (pitchIndex, availabilityIndex, field, value) => {
    const updatedPitches = [...formData.pitches];
    if (!updatedPitches[pitchIndex]) {
      updatedPitches[pitchIndex] = { availability: [] };
    }
    if (!updatedPitches[pitchIndex].availability[availabilityIndex]) {
      updatedPitches[pitchIndex].availability[availabilityIndex] = {};
    }
    updatedPitches[pitchIndex].availability[availabilityIndex][field] = value;
    setFormData({ ...formData, pitches: updatedPitches });
  };
  const handleCancel = () => {
    navigate("/venue");
  };

  const renderPitchForms = () => {
    const pitchForms = [];
    const numberOfPitches = parseInt(formData.numberOfPitches) || 0;
    for (let i = 1; i <= numberOfPitches; i++) {
      pitchForms.push(
        <Card key={i} title={`Pitch-${i}`}>
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
            <div>
              <Textinput
                label={`Pitch-${i} Name`}
                type="text"
                className="mb-3"
                placeholder={`Pitch-${i} Name`}
                value={formData.pitches?.[i - 1]?.pitchName || ""}
                onChange={(e) =>
                  updatePitchField(i - 1, 'pitchName', e.target.value)
                }
              />
            </div>
            <div className="flex flex-col  gap-2 mb-3">

              <label htmlFor="">Pitch-Size</label>
              <input
                type="number"
                className="form-control py-2"
                placeholder="Size"
                value={formData.pitches?.[i - 1]?.size || ""}
                onChange={(e) => updatePitchField(i - 1, "size", e.target.value)}
              />
              <select
                className="form-select py-2"
              >
                <option value="sq.ft">sq.ft</option>
                <option value="sq.yards">sq.yards</option>
                <option value="sq.meter">sq.meter</option>
              </select>
            </div>

            <div>
              <Textinput
                label={`Pitch-${i} slotduration`}
                type="number"
                className="mb-3"
                placeholder="slot enter in hours"
                value={formData.pitches?.[i - 1]?.slotduration || ""}
                onChange={(e) =>
                  updatePitchField(i - 1, 'slotduration', e.target.value)
                }
              />
            </div>
            <div>
              <Textinput
                label={`Pitch-${i} pitch price`}
                type="number"
                className="mb-3"
                placeholder="pitch price"
                value={formData.pitches?.[i - 1]?.slotduration || ""}
                onChange={(e) =>
                  updatePitchField(i - 1, 'pitchprice', e.target.value)
                }
              />
            </div>
            <div>
              {/* <Textinput
                label={`Pitch-${i} Sport Type`}
                type="text"
                className="mb-3"
                placeholder="Sport Type"
                value={formData.pitches?.[i - 1]?.sportType || ""}
                onChange={(e) =>
                  updatePitchField(i - 1, 'sportType', e.target.value)
                }
              /> */}
              <label className="small mb-1">Sports</label>
              {/* <select
                name="sports"
                id="sports"
                value={formData.pitches?.[i - 1]?.sportType || ""}

                className="form-control py-2 mb-3"
                onChange={(e) =>
                  updatePitchField(i - 1, 'sportType', e.target.value)
                }            >
                <option value="">Select Sport</option>
                <option value="cricket">Cricket</option>
                <option value="football">Football</option>
              </select> */}
              <select
                name="sports"
                id="sports"
                className="form-control py-2 mb-3"
                value={formData.pitches?.[i - 1]?.sportType || ""}

                onChange={(e) =>
                  updatePitchField(i - 1, 'sportType', e.target.value)
                }>
                <option value="">Select Sport</option>
                {sports.map((sport) => (
                  <option key={sport._id} value={sport._id}>
                    {sport.name}
                  </option>
                ))}
              </select>
            </div>

          </div>
          <Card title="Availability">
            <div className="flex flex-col justify-center gap-2">
              {formData.pitches?.[i - 1]?.availability?.map((avail, availIndex) => (
                <div key={availIndex} className="flex gap-2 justify-center items-center">
                  <div>
                    <label className="small mb-1" htmlFor={`pitch${i}Day${availIndex}`}>
                      Day
                    </label>
                    <select
                      name="day"
                      id="sports"
                      placeholder="Day"

                      className="border px-4 py-2 w-full"
                      value={avail.day || ""}

                      onChange={(e) =>
                        updateAvailabilityField(i - 1, availIndex, 'day', e.target.value)
                      }
                    >
                      <option value="">Select day</option>
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>




                    </select>
                    {/* <input
                      type="text"
                      className="border px-4 py-2 w-full"
                      placeholder="Day"
                      value={avail.day || ""}
                      onChange={(e) =>
                        updateAvailabilityField(i - 1, availIndex, 'day', e.target.value)
                      }
                    /> */}
                  </div>
                  <div>
                    <label className="small mb-1" htmlFor={`pitch${i}StartTime${availIndex}`}>
                      Start-Time
                    </label>
                    <Flatpickr
                      data-enable-time
                      value={avail.startTime || ""}
                      onChange={(date) =>
                        updateAvailabilityField(i - 1, availIndex, 'startTime', date[0].toISOString())
                      }
                      options={{
                        enableTime: true,
                        noCalendar: true,
                        dateFormat: "H:i",
                        time_24hr: true,
                      }}
                      placeholder="Select Start-Time"
                      className="border px-4 py-2 w-full"
                    />
                  </div>
                  <div>
                    <label className="small mb-1" htmlFor={`pitch${i}EndTime${availIndex}`}>
                      End-Time
                    </label>
                    <Flatpickr
                      data-enable-time
                      value={avail.endTime || ""}
                      onChange={(date) =>
                        updateAvailabilityField(i - 1, availIndex, 'endTime', date[0].toISOString())
                      }
                      options={{
                        enableTime: true,
                        noCalendar: true,
                        dateFormat: "H:i",
                        time_24hr: true,
                      }}
                      placeholder="Select End-Time"
                      className="border px-4 py-2 w-full"
                    />
                  </div>

                </div>
              ))}
              <div className="flex justify-center">
                <button
                  type="button"
                  className="btn btn-dark w-[30%]"
                  onClick={() => updatePitchField(i - 1, 'availability', [...(formData.pitches?.[i - 1]?.availability || []), {}])}
                >
                  Add Availability
                </button>
              </div>

            </div>
          </Card>
        </Card>
      );
    }
    return pitchForms;
  };
  const amenitiesOptions = amenities.map(amenity => ({
    value: amenity._id,
    label: amenity.name,
  }));

  const sportsOptions = sports.map((sport) => ({
    value: sport._id,
    label: sport.name,
  }));


  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validTypes = ["image/jpeg", "image/png"];
    const minSize = 5 * 1024 * 1024; // 5MB

    const validFiles = [];
    const errorMessages = [];

    files.forEach((file) => {
      if (!validTypes.includes(file.type)) {
        errorMessages.push(`${file.name} is not a PNG or JPG.`);
      } else if (file.size < minSize) {
        errorMessages.push(`${file.name} is smaller than 5MB.`);
      } else {
        validFiles.push(file);
      }
    });

    if (errorMessages.length > 0) {
      setErrors(errorMessages.join(" "));
      setFormData((prev) => ({ ...prev, images: [] }));
      setPreviews([]);
    } else {
      setErrors("");
      setFormData((prev) => ({ ...prev, images: validFiles }));

      const previewsArray = validFiles.map((file) => URL.createObjectURL(file));
      setPreviews(previewsArray);
    }
  };

  return (
    <div>
      <Card title="Add Venue">
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
          <div>
            <Textinput
              label="Venue Name"
              type="text"
              className="mb-3"
              placeholder="Venue Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            {errors.name && <p className="text-red-500">{errors.name}</p>}
            <Textinput
              label="Days"
              type="text"
              className="mb-3"
              placeholder="Enter-Days"
              value={formData.days}
              onChange={(e) =>
                setFormData({ ...formData, days: e.target.value })
              }
            />
            <Textinput
              label="Street Address"
              type="text"
              className="mb-3"
              placeholder="Venue Address"
              value={formData.address.address} // Accessing address directly
              onChange={(e) =>
                setFormData({ ...formData, address: { ...formData.address, address: e.target.value } }) // Updating nested state
              }
            />
            <Textinput
              label="City"
              type="text"
              className="mb-3"
              placeholder="City"
              value={formData.address.city} // Accessing city directly
              onChange={(e) =>
                setFormData({ ...formData, address: { ...formData.address, city: e.target.value } }) // Updating nested state
              }
            />
            <Textinput
              label="Capacity"
              type="number"
              className="mb-3"
              placeholder="Capacity"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: e.target.value })
              }
            />
            {errors.capacity && <p className="text-red-500">{errors.capacity}</p>}
            <Textinput
              label="Number of Pitches"
              type="number"
              className="mb-3"
              placeholder="Number of Pitches"
              value={formData.numberOfPitches}
              onChange={(e) =>
                setFormData({ ...formData, numberOfPitches: e.target.value })
              }
            />
            {errors.numberOfPitches && <p className="text-red-500">{errors.numberOfPitches}</p>}
            <Textinput
              label="Timing"
              type="text"
              className="mb-3"
              placeholder="Timing"
              value={formData.timings}
              onChange={(e) =>
                setFormData({ ...formData, timings: e.target.value })
              }
            />
            {errors.timings && <p className="text-red-500">{errors.timings}</p>}
          </div>
          <div>
            {/* <Textinput
              label="Price"
              type="number"
              className="mb-3"
              placeholder="Price"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
            />
            {errors.price && <p className="text-red-500">{errors.price}</p>} */}
            {/* <label className="small mb-1">Image</label> */}
            {/* <input
              label="Image"
              className="form-control mb-3"
              type="file"
              onChange={handleFileChange}
            />
            {errors.image && <p className="text-red-500">{errors.image}</p>} */}
            <label className="small mb-1">Sports</label>
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

            <label className="small mb-1">Vendor Name</label>
            {user?.type === "admin" ? ( // Show dropdown only for admin
              <select
                name="vendor"
                id="vendor"
                className="form-control py-2 mb-3"
                onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
              >
                <option value="">Select Vendor</option>
                {vendor.map((vendor) => (
                  <option key={vendor._id} value={vendor._id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            ) : (
              // Show vendor name for logged-in vendor
              <p className="form-control py-2 mb-3">{user.name}</p>
            )}


            <div>
              <Textinput
                label="location"
                type="text"
                className="mb-3"
                placeholder="Location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>
            <label className="small mb-1">Amenities</label>

            <Select
              isMulti
              options={amenitiesOptions}
              value={selectedAmenities}
              onChange={(selectedOptions) => {
                setSelectedAmenities(selectedOptions);
                setFormData({
                  ...formData,
                  amenities: selectedOptions.map(option => option.value),
                });
              }}
              className="mb-4"
            />
            <div>
              <label className="block mb-3 text-sm font-medium text-gray-700">
                Upload Images (PNG/JPG, Min 5MB)
              </label>
              <input
                type="file"
                accept="image/png, image/jpeg"
                className="form-control py-2 mb-3"
                onChange={(e) => {
                  setSelectedImage(e.target.files[0]);
                }} multiple
              />


              {errors?.image && <p className="text-red-500 mb-3">{errors.image}</p>}

              {/* Preview */}
              <div className="flex flex-wrap gap-4">
                {previews.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`preview-${idx}`}
                    className="h-24 w-24 object-cover rounded border"
                  />
                ))}
              </div>
            </div>

          </div>

        </div>
        <br />
        <br />

        {renderPitchForms()}
        <br />
        <br />
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
            isLoading={uploadingData}
          />
        </div>
      </Card>

      {/* <div className="ltr:text-right rtl:text-left space-x-3 rtl:space-x-reverse">
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
          isLoading={uploadingData}
        />
      </div> */}
    </div>
  );
};

export default VenueAddPage;