import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const RoleEditPage = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    parentname: "",
    email: "",
    phone: "",
    address: "",
    status: "active",
    feestatus: "unpaid",
    dacc: "",
    dob: "",
    gender: "",
    groups: null,
    clubmembership: "",
    clubcardcopy: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingData, setUploadingData] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("id");
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/${user.type}/user/get-users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const userData = userResponse.data;
        setFormData(userData);
        setSelectedGroup(userData.group || "");
        const schedulesResponse = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/${user.type}/schedule/get-schedule`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setSchedules(schedulesResponse.data.schedule || []);

        setIsLoading(false);
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch user or schedules");
      }
    };

    fetchData();
  }, [userId]);

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (await checkEmailExists(formData.email)) {
      setErrors({ email: "Email already exists" });
      return;
    }

    if (!selectedGroup) {
      toast.error("Please select a group");
      return;
    }

    try {
      setUploadingData(true);

      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/${user.type}/user/update-user/${userId}`,
        {
          ...formData,
          groups: selectedGroup // selectedGroup is a single string (ObjectId)
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 200) {
        toast.success("User updated successfully");
        navigate("/Player");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setUploadingData(false);
    }
  };

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
    if (!formData.phone) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{11}$/.test(formData.phone)) {
      errors.phone = "Phone number is invalid";
    }
    return errors;
  };

  const checkEmailExists = async (email) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/${user.type}/user/check-email`,
        { email, userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data.exists;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
  };

  const handleCancel = () => {
    navigate("/Player");
  };

  return (
    <div>
      <Card title="Edit Player">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid lg:grid-cols-1 grid-cols-1 gap-5 mb-5">
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
              <div>
                <Textinput
                  label="Name"
                  type="text"
                  placeholder="Add Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}

                <Textinput
                  label="Last Name"
                  type="text"
                  placeholder="Add Last Name"
                  value={formData.lastname}
                  onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                />
                {errors.lastname && <p className="text-red-500 text-xs mt-1">{errors.lastname}</p>}

                <Textinput
                  label="Parent Name"
                  type="text"
                  placeholder="Add Parent's Name"
                  value={formData.parentname}
                  onChange={(e) => setFormData({ ...formData, parentname: e.target.value })}
                />
                {errors.parentname && <p className="text-red-500 text-xs mt-1">{errors.parentname}</p>}

                <Textinput
                  label="Email"
                  type="email"
                  placeholder="Add Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}

                <Textinput
                  label="Phone"
                  type="text"
                  placeholder="Add Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}

                <div className="mt-4">
                  <label htmlFor="group" className="block mb-2 font-medium">Select Group</label>
                  <select
                    name="group"
                    id="group"
                    className="form-select py-2"
                    value={selectedGroup}
                    onChange={handleGroupChange}
                  >
                    <option value="">Select a group</option>
                    {schedules.map((schedule) => (
                      <option key={schedule._id} value={schedule._id}>
                        {schedule.group}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Textinput
                  label="Address"
                  type="text"
                  placeholder="Add Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />

                <Textinput
                  label="Date of Birth"
                  type="text"
                  placeholder="Add Date of Birth"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                />

                <Textinput
                  label="Gender"
                  type="text"
                  placeholder="Add Gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                />

                <Textinput
                  label="Club Membership"
                  type="text"
                  placeholder="Add Club Membership"
                  value={formData.clubmembership}
                  onChange={(e) => setFormData({ ...formData, clubmembership: e.target.value })}
                />

                <Textinput
                  label="Club Card Copy"
                  type="text"
                  placeholder="Add Club Card Copy"
                  value={formData.clubcardcopy}
                  onChange={(e) => setFormData({ ...formData, clubcardcopy: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

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
            disabled={isLoading}
            isLoading={uploadingData}
          />
        </div>
      </Card>
    </div>
  );
};

const Textinput = ({ label, ...props }) => (
  <div className="mb-3">
    <label className="block text-sm font-medium">{label}</label>
    <input
      className="border-[3px] h-10 w-full p-2"
      {...props}
    />
  </div>
);

export default RoleEditPage;
