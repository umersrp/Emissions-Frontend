import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  stakeholderOptions,
  qualityControlOptions,
} from "@/constant/options";
import {
  vehicleClassificationOptions,
  vehicleTypeOptionsByClassification,
  fuelNameOptionsByClassification,
  distanceUnitOptions,
  weightLoadedOptions,
} from "@/constant/options";

const MobileCombustionFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const mode = location.state?.mode || "add";
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const [formData, setFormData] = useState({
    buildingId: null,
    stakeholder: null,
    vehicleClassification: null,
    vehicleType: null,
    fuelName: null,
    distanceTraveled: "",
    distanceUnit: null,
    qualityControl: null,
    weightLoaded: null,
    remarks: "",
  });
  const [errors, setErrors] = useState({});
  const [buildingOptions, setBuildingOptions] = useState([]);

  // Fetch all buildings for dropdown
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/building/Get-All-Buildings`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        const formatted =
          res.data?.data?.buildings?.map((b) => ({
            value: b._id,
            label: b.buildingName,
          })) || [];
        setBuildingOptions(formatted);
      } catch {
        toast.error("Failed to load buildings");
      }
    };
    fetchBuildings();
  }, []);

  // Fetch record by ID when Edit or View
  useEffect(() => {
    const fetchDataById = async () => {
      if (!id || isAdd) return;
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/AutoMobile/Get/${id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        const data = res.data?.data;

        // Set dropdown compatible values
        setFormData({
          buildingId: buildingOptions.find((b) => b.value === data.buildingId) || null,
          stakeholder: stakeholderOptions.find((s) => s.value === data.stakeholder) || { label: data.stakeholder, value: data.stakeholder },
          vehicleClassification: vehicleClassificationOptions.find((v) => v.value === data.vehicleClassification) || { label: data.vehicleClassification, value: data.vehicleClassification },
          vehicleType: { label: data.vehicleType, value: data.vehicleType },
          fuelName: { label: data.fuelName, value: data.fuelName },
          distanceTraveled: data.distanceTraveled || "",
          distanceUnit: distanceUnitOptions.find((u) => u.value === data.distanceUnit) || { label: data.distanceUnit, value: data.distanceUnit },
          qualityControl: qualityControlOptions.find((q) => q.value === data.qualityControl) || { label: data.qualityControl, value: data.qualityControl },
          weightLoaded: data.weightLoaded || null,
          remarks: data.remarks || "",
        });
      } catch (err) {
        toast.error("Failed to fetch record details");
        console.error(err);
      }
    };

    fetchDataById();
  }, [id, isAdd, buildingOptions]);

  // Dynamic dependent dropdowns
  const vehicleTypeOptions =
    formData.vehicleClassification?.value &&
    vehicleTypeOptionsByClassification[formData.vehicleClassification.value]
      ? vehicleTypeOptionsByClassification[formData.vehicleClassification.value]
      : [];

  const fuelNameOptions =
    formData.vehicleClassification?.value &&
    fuelNameOptionsByClassification[formData.vehicleClassification.value]
      ? fuelNameOptionsByClassification[formData.vehicleClassification.value]
      : [];

  //  Handle Select changes
  const handleSelectChange = (value, { name }) => {
    if (isView) return;

    setFormData((prev) => {
      let updated = { ...prev, [name]: value };

      if (name === "vehicleClassification") {
        updated = { ...updated, vehicleType: null, fuelName: null };
      } else if (name === "vehicleType") {
        updated = { ...updated, fuelName: null };
      }

      return updated;
    });

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle text input
  const handleInputChange = (e) => {
    if (isView) return;
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  // Handle submit for Add / Edit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.buildingId) newErrors.buildingId = "Building is required";
    if (!formData.stakeholder) newErrors.stakeholder = "Stakeholder is required";
    if (!formData.vehicleClassification) newErrors.vehicleClassification = "Vehicle Classification is required";
    if (!formData.vehicleType) newErrors.vehicleType = "Vehicle Type is required";
    if (!formData.fuelName) newErrors.fuelName = "Fuel Name is required";
    if (!formData.distanceTraveled) newErrors.distanceTraveled = "Distance Traveled is required";
    if (!formData.distanceUnit) newErrors.distanceUnit = "Distance Unit is required";
    if (!formData.qualityControl) newErrors.qualityControl = "Quality Control is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill all required fields");
      return;
    }

    // Prepare API-ready payload
    const payload = {
      buildingId: formData.buildingId?.value || formData.buildingId,
      stakeholder: formData.stakeholder?.value || formData.stakeholder,
      vehicleClassification: formData.vehicleClassification?.value || formData.vehicleClassification,
      vehicleType: formData.vehicleType?.value || formData.vehicleType,
      fuelName: formData.fuelName?.value || formData.fuelName,
      distanceTraveled: formData.distanceTraveled,
      distanceUnit: formData.distanceUnit?.value || formData.distanceUnit,
      qualityControl: formData.qualityControl?.value || formData.qualityControl,
      weightLoaded: formData.weightLoaded ? Number(formData.weightLoaded.value || formData.weightLoaded) : null,
      remarks: formData.remarks,
    };

    try {
      if (isEdit) {
        await axios.put(
          `${process.env.REACT_APP_BASE_URL}/AutoMobile/update/${id}`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success("Record updated successfully");
      } else {
        await axios.post(
          `${process.env.REACT_APP_BASE_URL}/AutoMobile/Create`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success("Record added successfully");
      }
      navigate("/Mobile-Combustion");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
      console.error(err);
    }
  };

  return (
    <div>
      <Card title={`${isView ? "View" : isEdit ? "Edit" : "Add"} Mobile Combustion Record`}>
        <div className="text-slate-700 leading-relaxed mb-2 bg-gray-100 rounded-lg border-l-4 border-primary-400 p-2 pl-4 m-4 justify-center">
          <p className="text-gray-700 items-center ">
            Mobile Combustion refers to direct greenhouse gas (GHG) emissions from the combustion of fuels in mobile equipment or vehicles that are owned or controlled by an organization.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Building */}
            <div>
              <label className="field-label">Site / Building Name</label>
              <Select name="buildingId" value={formData.buildingId} options={buildingOptions} onChange={handleSelectChange} placeholder="Select Building" isDisabled={isView} />
              {errors.buildingId && <p className="text-red-500 text-sm mt-1">{errors.buildingId}</p>}
            </div>

            {/* Stakeholder */}
            <div>
              <label className="field-label">Stakeholder / Department</label>
              <Select name="stakeholder" value={formData.stakeholder} options={stakeholderOptions} onChange={handleSelectChange} placeholder="Select or Type Department" isDisabled={isView} allowCustomInput />
              {errors.stakeholder && <p className="text-red-500 text-sm mt-1">{errors.stakeholder}</p>}
            </div>

            {/* Vehicle Classification */}
            <div>
              <label className="field-label">Vehicle Classification</label>
              <Select name="vehicleClassification" value={formData.vehicleClassification} options={vehicleClassificationOptions} onChange={handleSelectChange} placeholder="Select Vehicle Classification" isDisabled={isView} />
              {errors.vehicleClassification && <p className="text-red-500 text-sm mt-1">{errors.vehicleClassification}</p>}
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="field-label">Vehicle Type</label>
              <Select name="vehicleType" value={formData.vehicleType} options={vehicleTypeOptions} onChange={handleSelectChange} placeholder="Select Vehicle Type" isDisabled={isView} />
              {errors.vehicleType && <p className="text-red-500 text-sm mt-1">{errors.vehicleType}</p>}
            </div>

            {/* Fuel Name */}
            <div>
              <label className="field-label">Fuel Name</label>
              <Select name="fuelName" value={formData.fuelName} options={fuelNameOptions} onChange={handleSelectChange} placeholder="Select Fuel Name" isDisabled={isView} />
              {errors.fuelName && <p className="text-red-500 text-sm mt-1">{errors.fuelName}</p>}
            </div>

            {/* Distance Traveled */}
            <div>
              <label className="field-label">Distance Travelled</label>
              <input type="number" name="distanceTraveled" value={formData.distanceTraveled} onChange={handleInputChange} placeholder="Enter distance travelled" className="input-field" disabled={isView} />
              {errors.distanceTraveled && <p className="text-red-500 text-sm mt-1">{errors.distanceTraveled}</p>}
            </div>

            {/* Distance Unit */}
            <div>
              <label className="field-label">Distance Unit</label>
              <Select name="distanceUnit" value={formData.distanceUnit} options={distanceUnitOptions} onChange={handleSelectChange} placeholder="Select Unit" isDisabled={isView} />
              {errors.distanceUnit && <p className="text-red-500 text-sm mt-1">{errors.distanceUnit}</p>}
            </div>

            {/* Quality Control */}
            <div>
              <label className="field-label">Quality Control</label>
              <Select name="qualityControl" value={formData.qualityControl} options={qualityControlOptions} onChange={handleSelectChange} placeholder="Select Quality" isDisabled={isView} />
              {errors.qualityControl && <p className="text-red-500 text-sm mt-1">{errors.qualityControl}</p>}
            </div>

            {/* Weight Loaded (conditional) */}
            {["Heavy Good Vehicles (HGVs All Diesel)", "Heavy Good Vehicles (Refrigerated HGVs All Diesel)"].includes(formData.vehicleClassification?.value) && (
              <div>
                <label className="field-label">Weight Loaded</label>
                <Select
                  name="weightLoaded"
                  value={formData.weightLoaded}
                  options={weightLoadedOptions}
                  onChange={handleSelectChange}
                  placeholder="Select Weight"
                  isDisabled={isView}
                />
                {errors.weightLoaded && <p className="text-red-500 text-sm mt-1">{errors.weightLoaded}</p>}
              </div>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="field-label">Remark</label>
            <textarea name="remarks" value={formData.remarks} onChange={handleInputChange} rows={3} placeholder="Remarks..." className="border p-2 rounded-md w-full" disabled={isView} />
          </div>

          {/* Buttons */}
          <div className="col-span-full flex justify-end gap-4 pt-6">
            <Button
              text={isView ? "Back" : "Cancel"}
              className={isView ? "btn-primary" : "btn-light"}
              type="button"
              onClick={() => navigate("/Mobile-Combustion")}
            />
            {!isView && (
              <Button text={isEdit ? "Update" : "Add"} className="btn-primary" type="submit" />
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default MobileCombustionFormPage;
