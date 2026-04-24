// import React, { useState, useEffect } from "react";
// import Button from "@/components/ui/Button";
// import Card from "@/components/ui/Card";
// import { toast } from "react-toastify";
// import axios from "axios";
// import { useNavigate, useParams } from "react-router-dom";
// import { useSelector } from "react-redux";

// const UserViewPage = () => {
//   const navigate = useNavigate();
//   const { id: userId } = useParams();
//   const user = useSelector((state) => state.auth.user);

//   const [formData, setFormData] = useState({
//     name: "",
//     username: "",
//     email: "",
//     phone: "",
//     companyId: "",
//     companyName: "",
//     type: "",
//     isActive: false,
//   });
//   const [errors, setErrors] = useState({});
//   const [isLoading, setIsLoading] = useState(true);
//   const [uploadingData, setUploadingData] = useState(false);

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const response = await axios.get(
//           `${process.env.REACT_APP_BASE_URL}/auth/GetUsers/${userId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("token")}`,
//             },
//           }
//         );

//         const data = response.data.data || response.data;

//         setFormData({
//           name: data.name || "",
//           username: data.username || "",
//           email: data.email || "",
//           phone: data.phone || "",
//           companyId: data.companyId?._id || "",
//           companyName: data.companyId?.companyName || "",
//           type: data.type || "",
//           isActive: data.isActive || false,
//         });
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to fetch user");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchUser();
//   }, [userId]);

//   const validate = () => {
//     const errors = {};
//     if (!formData.name) errors.name = "Name is required";
//     if (!formData.username) errors.username = "Username is required";
//     if (!formData.email) errors.email = "Email is required";
//     else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email address is invalid";
//     if (!formData.phone) errors.phone = "Phone number is required";
//     else if (!/^\d{11}$/.test(formData.phone)) errors.phone = "Phone number is invalid";
//     return errors;
//   };

//   const handleSubmit = async () => {
//     const validationErrors = validate();
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       return;
//     }

//     try {
//       setUploadingData(true);

//       const response = await axios.put(
//         `${process.env.REACT_APP_BASE_URL}/auth/UpdateUser/${userId}`,
//         {
//           name: formData.name,
//           username: formData.username,
//           email: formData.email,
//           phone: formData.phone,
//           companyId: formData.companyId,
//           type: formData.type,
//           isActive: formData.isActive,
//         },
//         {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         }
//       );

//       if (response.status === 200) {
//         toast.success("User updated successfully");
//         navigate("/Employee");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error(err.response?.data?.message || "Failed to update user");
//     } finally {
//       setUploadingData(false);
//     }
//   };

//   const handleCancel = () => navigate("/Employee");

// return (
//   <div>
//     <Card title="View Employee">
//       {isLoading ? (
//         <div className="text-center py-8">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading employee data...</p>
//         </div>
//       ) : (
//         <div className="space-y-6">
          
//           {/* Row 1 */}
//           <div className="grid lg:grid-cols-3 grid-cols-2 gap-5">
            
//             {/* Email */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Employee Email
//               </label>
//               <input
//                 type="email"
//                 value={formData.email}
//                 disabled
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
//               />
//             </div>

//             {/* Name */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Name
//               </label>
//               <input
//                 type="text"
//                 value={formData.name}
//                 disabled
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
//               />
//             </div>

//             {/* Employee ID */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Employee ID
//               </label>
//               <input
//                 type="text"
//                 value={formData.employeeId}
//                 disabled
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
//               />
//             </div>
//           </div>

//           {/* Row 2 */}
//           <div className="grid lg:grid-cols-3 grid-cols-2 gap-5">
            
//             {/* Company */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Company
//               </label>
//               <input
//                 type="text"
//                 value={formData.companyName}
//                 disabled
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
//               />
//             </div>

//              {/* Employee ID */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Building
//               </label>
//               <input
//                 type="text"
//                 value={formData.buildingId.buildingName}
//                 disabled
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
//               />
//             </div>

           

//             {/* Status */}
//             {/* <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Status
//               </label>
//               <div className="flex items-center mt-2">
//                 <input
//                   type="checkbox"
//                   checked={formData.isActive}
//                   disabled
//                   className="h-4 w-4 text-blue-600 border-gray-300 rounded"
//                 />
//                 <label className="ml-2 text-sm text-gray-700">
//                   Active
//                 </label>
//               </div>
//             </div> */}
//           </div>
//         </div>
//       )}

//       {/* Footer */}
//       <div className="flex justify-end mt-8 pt-6 border-t">
//         <button
//           className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
//           onClick={handleCancel}
//           type="button"
//         >
//           Back
//         </button>
//       </div>
//     </Card>
//   </div>
// );
// };

// export default UserViewPage;


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
    _id: "",
    type: "",
    name: "",
    email: "",
    isActive: false,
    image: "",
    isEmailValid: false,
    employeeID: "",
    companyId: "",
    companyName: "",
    buildingId: "",
    buildingName: "",
    isDeleted: false,
    createdAt: "",
    updatedAt: "",
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
          _id: data._id || "",
          type: data.type || "",
          name: data.name || "",
          email: data.email || "",
          isActive: data.isActive || false,
          image: data.image || "",
          isEmailValid: data.isEmailValid || false,
          employeeID: data.employeeID || "",
          companyId: data.companyId?._id || "",
          companyName: data.companyId?.companyName || "",
          buildingId: data.buildingId?._id || "",
          buildingName: data.buildingId?.buildingName || "",
          isDeleted: data.isDeleted || false,
          createdAt: data.createdAt ? new Date(data.createdAt).toLocaleString() : "",
          updatedAt: data.updatedAt ? new Date(data.updatedAt).toLocaleString() : "",
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

  const handleCancel = () => navigate("/Employee");

  return (
    <div>
      <Card title="View Employee">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading employee data...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Row 1 */}
            <div className="grid lg:grid-cols-3 grid-cols-2 gap-5">
                {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
             

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
               {/* Employee ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={formData.employeeID}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

            
            </div>

            {/* Row 2 */}
            <div className="grid lg:grid-cols-3 grid-cols-2 gap-5">
              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              {/* Building */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Building
                </label>
                <input
                  type="text"
                  value={formData.buildingName}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

             
            </div>                    
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end mt-8 pt-6 border-t">
          <button
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            onClick={handleCancel}
            type="button"
          >
            Back
          </button>
        </div>
      </Card>
    </div>
  );
};

export default UserViewPage;
