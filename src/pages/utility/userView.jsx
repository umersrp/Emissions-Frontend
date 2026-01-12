import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

const UserViewPage = () => {
  const navigate = useNavigate();
  const { id: userId } = useParams();
  const user = useSelector((state) => state.auth.user);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    companyId: "",
    companyName: "",
    type: "",
    isActive: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingData, setUploadingData] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/auth/GetUsers/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = response.data.data || response.data;

        setFormData({
          name: data.name || "",
          username: data.username || "",
          email: data.email || "",
          phone: data.phone || "",
          companyId: data.companyId?._id || "",
          companyName: data.companyId?.companyName || "",
          type: data.type || "",
          isActive: data.isActive || false,
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch user");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const validate = () => {
    const errors = {};
    if (!formData.name) errors.name = "Name is required";
    if (!formData.username) errors.username = "Username is required";
    if (!formData.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email address is invalid";
    if (!formData.phone) errors.phone = "Phone number is required";
    else if (!/^\d{11}$/.test(formData.phone)) errors.phone = "Phone number is invalid";
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

      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/auth/UpdateUser/${userId}`,
        {
          name: formData.name,
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          companyId: formData.companyId,
          type: formData.type,
          isActive: formData.isActive,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.status === 200) {
        toast.success("User updated successfully");
        navigate("/Employee");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update user");
    } finally {
      setUploadingData(false);
    }
  };

  const handleCancel = () => navigate("/Employee");

  return (
    <div>
      <Card title="View User">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid lg:grid-cols-1 grid-cols-1 gap-5 mb-5">
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
              <div>
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="border-[3px] h-10 w-full mb-3 p-2"
                  readOnly
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}

                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="border-[3px] h-10 w-full mb-3 p-2"
                  readOnly
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}

                {/* <label className="form-label">Phone</label>
                <input
                  type="number"
                  className="border-[3px] h-10 w-full mb-3 p-2"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                /> */}
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}

                <label className="form-label">Active</label>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              </div>

              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  readOnly
                  className="border-[3px] h-10 w-full mb-3 p-2"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}

                <label className="form-label">Company</label>
                <input
                  type="text"
                  className="border-[3px] h-10 w-full mb-3 p-2"
                  value={formData.companyName}
                  disabled
                />

                <label className="form-label">Type</label>
                <input
                  type="text"
                  className="border-[3px] h-10 w-full mb-3 p-2"
                  value={formData.type}
                  disabled
                />
              </div>
            </div>
          </div>
        )}

        <div className="ltr:text-right rtl:text-left space-x-3 rtl:space-x-reverse">
          <button className="btn btn-light" onClick={handleCancel} type="button">
            Cancel
          </button>
          {/* <Button
            text="Save"
            className="btn-dark"
            onClick={handleSubmit}
            isLoading={uploadingData}
          /> */}
        </div>
      </Card>
    </div>
  );
};

export default UserViewPage;
