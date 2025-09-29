import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const RoleAddPage = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedules, setSelectedSchedules] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    parentname: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    courses: "no",
    dacc: "",
    dob: "",
    gender: "",
    clubmembership: "no",
    scheduleIds: [],
    clubcardcopy: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const user = useSelector((state) => state.auth.user);
  const [uploadingData, setUploadingData] = useState(false);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/${user.type}/schedule/get-schedule`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setSchedules(response.data.schedule || []);
      } catch (error) {
        console.log("Error fetching schedules:", error);
      }
    };
    fetchSchedules();
  }, [user.type]);

  const validate = () => {
    const errors = {};
    if (!formData.name) errors.name = "Name is required";
    if (!formData.lastname) errors.lastname = "Last name is required";
    if (!formData.parentname) errors.parentname = "Parent name is required";
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email address is invalid";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (!/[!@#$%^&*]/.test(formData.password)) {
      errors.password = "Password must contain at least one special character";
    }
    if (!formData.phone) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{11}$/.test(formData.phone)) {
      errors.phone = "Phone number is invalid";
    }
    if (!formData.dob) errors.dob = "Date of Birth is required";
    if (!formData.gender) errors.gender = "Gender is required";
    return errors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    try {
      setUploadingData(true);
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/${user.type}/user/create-user`,
        {
          ...formData,
          password: formData.password,
          email: formData.email.toLowerCase(),
          courses: [formData.courses],
          scheduleIds: selectedSchedules,  // Send selected schedules as an array
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
  
      if (response.status === 201) {
        toast.success("User created successfully");
        navigate("/player");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setUploadingData(false);
    }
  };
  

  const handleCancel = () => {
    navigate("/player");
  };

  const handleScheduleChange = (e) => {
    const { options } = e.target;
    const selectedValues = Array.from(options)
      .filter((option) => option.selected)
      .map((option) => option.value);

    setSelectedSchedules(selectedValues);
    setFormData({ ...formData, scheduleIds: selectedValues });
  };

  const handleMembershipChange = (e) => {
    const value = e.target.value;
    if (value === "no") {
      setFormData({ ...formData, clubcardcopy: "no",  });
    } else {
      setFormData({ ...formData, clubcardcopy: "", });
    }
  };


  const handledaccMembershipChange = (e) => {
    const value = e.target.value;
    if (value === "no") {
      setFormData({ ...formData, dacc: "no", });
    } else {
      setFormData({ ...formData, dacc: "", });
    }
  };
 

  return (
    <div>
      <Card title="Create new player-record">
        <div className="grid lg:grid-cols-1 grid-cols-1 gap-5">
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
            <div>
              <Textinput
                label="Name"
                type="text"
                className="mb-3"
                placeholder="Add Name"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <p className="text-red-500">{errors.name}</p>}
              <Textinput
                label="Last Name"
                type="text"
                className="mb-3"
                placeholder="Enter Last Name"
                onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
              />
              {errors.lastname && <p className="text-red-500">{errors.lastname}</p>}
              <Textinput
                label="Parent Name"
                type="text"
                className="mb-3"
                placeholder="Add Parent Name"
                onChange={(e) => setFormData({ ...formData, parentname: e.target.value })}
              />
              {errors.parentname && <p className="text-red-500">{errors.parentname}</p>}
              <div className="relative">
                <Textinput
                  label="Password"
                  className="mb-3"
                  type={showPassword ? "text" : "password"}
                  placeholder="Add Password"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <FontAwesomeIcon
                  icon={showPassword ? faEye : faEyeSlash}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[70%] transform -translate-y-1/2 cursor-pointer"
                />
              </div>
              {errors.password && <p className="text-red-500">{errors.password}</p>}
              <Textinput
                label="Gender"
                type="text"
                placeholder="Add Gender"
                className="mb-3"
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              />
              {errors.gender && <p className="text-red-500">{errors.gender}</p>}
              <label htmlFor="membershipSelect">Club Card copy?</label>
              <select
                className="form-select py-2 mb-3"
                name="clubcardcopy"
                id="clubcardcopySelect"
                onChange={handleMembershipChange}
                value={formData.clubcardcopy === "no" ? "no" : "yes"}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              {formData.clubcardcopy !== "no" && (
                <Textinput
                  label="Club Card copy"
                  className="mb-3"
                  placeholder="Add Club Membership"
                  onChange={(e) => setFormData({ ...formData, clubcardcopy: e.target.value })}
                  value={formData.clubcardcopy}
                />
              )}
            </div>
            <div>
              <Textinput
                label="Email"
                type="email"
                className="mb-3"
                placeholder="Add email"
                onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
              />
              {errors.email && <p className="text-red-500">{errors.email}</p>}
              <Textinput
                label="Phone"
                type="number"
                className="mb-3"
                placeholder="Add phone"
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              {errors.phone && <p className="text-red-500">{errors.phone}</p>}
              <Textinput
                label="Address"
                type="text"
                className="mb-3"
                placeholder="Add Address"
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <Textinput
                label="Date of Birth"
                type="date"
                className="mb-3"
                placeholder="Add Date of Birth"
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
              {errors.dob && <p className="text-red-500">{errors.dob}</p>}
              {/* <Textinput
                label="DACC Member"
                className="mb-3"
                placeholder="Add Membership"
                onChange={(e) => setFormData({ ...formData, dacc: e.target.value })}
                value={formData.dacc}
              /> */}
              <div>
              <label htmlFor="membershipSelect">Dacc Member</label>

               <select
                className="form-select py-2 mb-3"
                name="dacc"
                id="dacc"
                onChange={handledaccMembershipChange}
                value={formData.dacc === "no" ? "no" : "yes"}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>

              {formData.dacc !== "no" && (
                <Textinput
                  label="Dacc"
                  className="mb-3"
                  placeholder="Add Dacc Membership"
                  onChange={(e) => setFormData({ ...formData, dacc: e.target.value })}
                  value={formData.dacc}
                />
              )}
              </div>
              <div className="mt-4">
                <label htmlFor="membershipSelect">Group</label>
                <select
                  name="selectedSchedules"
                  id="selectedSchedules"
                  value={selectedSchedules}
                  onChange={handleScheduleChange}
                  className="form-select py-2"
                >
                  {schedules.map((schedule) => (
                    <option key={schedule._id} value={schedule._id}>
                      {schedule.group}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="ltr:text-right rtl:text-left space-x-3 rtl:space-x-reverse mt-4">
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
    </div>
  );
};

export default RoleAddPage;
