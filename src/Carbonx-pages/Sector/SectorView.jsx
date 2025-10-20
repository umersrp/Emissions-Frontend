import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaMapMarkedAlt, FaInfoCircle } from "react-icons/fa";
import { MdArrowBack } from "react-icons/md";
import Card from "@/components/ui/Card";

const SectorView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formdata, setFormData] = useState({
    name: "",
    description: "",
    createdBy: "",
    updatedBy: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSectorById = async () => {
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

        if (response?.data?.data) {
          setFormData(response.data.data);
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

    fetchSectorById();
  }, [id]);

  const handleBack = () => {
    navigate("/Sector-table");
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (error) return <div className="text-center text-red-600">{error}</div>;

  return (
    <Card>
    <div className="max-w-2xl mx-auto p-6 mt-10 bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaMapMarkedAlt className="text-green-600" />
          Sector Details
        </h2>
        <button
          onClick={handleBack}
          className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200 transition"
        >
          <MdArrowBack />
          Back
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-gray-500 text-sm mb-1">Sector Name</p>
          <div className="bg-gray-50 border px-4 py-2 rounded text-gray-800 font-medium">
            {formdata.name || "—"}
          </div>
        </div>

        <div>
          <p className="text-gray-500 text-sm mb-1">Description</p>
          <div className="bg-gray-50 border px-4 py-2 rounded text-gray-800">
            {formdata.description || "—"}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <p className="text-gray-500 text-sm mb-1">Created By</p>
            <div className="bg-gray-50 border px-4 py-2 rounded text-gray-700 text-sm">
              {formdata?.createdBy?.name || "N/A"}
            </div>
          </div>

          <div>
            <p className="text-gray-500 text-sm mb-1">Updated By</p>
            <div className="bg-gray-50 border px-4 py-2 rounded text-gray-700 text-sm">
              {formdata?.updatedBy?.name || "N/A"}
            </div>
          </div>
        </div>
      </div>
    </div>
    </Card>
  );
};

export default SectorView;
