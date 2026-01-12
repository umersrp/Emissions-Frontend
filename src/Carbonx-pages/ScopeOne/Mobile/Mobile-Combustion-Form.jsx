
import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  FugitiveAndMobileStakeholderOptions,
  qualityControlOptions,
  vehicleClassificationOptions,
  vehicleTypeOptionsByClassification,
  fuelNameOptionsByClassification,
  distanceUnitOptions,
  weightLoadedOptions,
} from "@/constant/scope1/options";
import { calculateMobileCombustion } from "@/utils/scope1/calculate-mobile-combuction";
import InputGroup from "@/components/ui/InputGroup";


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
    calculatedEmissionKgCo2e: "",
    calculatedEmissionTCo2e: "",
    remarks: "",
    postingDate: "",
  });
  const [errors, setErrors] = useState({});
  const [buildingOptions, setBuildingOptions] = useState([]);

  const capitalizeFirstLetter = (text) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };


  // Fetch all buildings for dropdown  
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/building/Get-All-Buildings?limit=1000`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          }
        );

        // Get buildings from response
        const buildings = res.data?.data?.buildings || [];

        // Sort buildings alphabetically by buildingName
        const sortedBuildings = [...buildings].sort((a, b) => {
          const nameA = (a.buildingName || '').toUpperCase();
          const nameB = (b.buildingName || '').toUpperCase();

          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
          return 0;
        });

        // Format sorted buildings for dropdown
        const formatted = sortedBuildings.map((b) => ({
          value: b._id,
          label: b.buildingName || 'Unnamed Building',
        }));

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
          buildingId:
            data.buildingId && typeof data.buildingId === "object"
              ? {
                label: data.buildingId.buildingName,
                value: data.buildingId._id,
              }
              : buildingOptions.find((b) => b.value === data.buildingId) ||
              { label: "Unknown", value: data.buildingId },
          stakeholder: FugitiveAndMobileStakeholderOptions.find((s) => s.value === data.stakeholder) || { label: data.stakeholder, value: data.stakeholder },
          vehicleClassification: vehicleClassificationOptions.find((v) => v.value === data.vehicleClassification) || { label: data.vehicleClassification, value: data.vehicleClassification },
          vehicleType: { label: data.vehicleType, value: data.vehicleType },
          fuelName: { label: data.fuelName, value: data.fuelName },
          distanceTraveled: data.distanceTraveled || "",
          distanceUnit: distanceUnitOptions.find((u) => u.value === data.distanceUnit) || { label: data.distanceUnit, value: data.distanceUnit },
          qualityControl: qualityControlOptions.find((q) => q.value === data.qualityControl) || { label: data.qualityControl, value: data.qualityControl },
          weightLoaded: data.weightLoaded
            ? weightLoadedOptions.find((w) => w.value === data.weightLoaded) || null
            : null,
          remarks: data.remarks || "",
          postingDate: data.postingDate
            ? new Date(data.postingDate).toISOString().split('T')[0]
            : "",
        });
      } catch (err) {
        toast.error("Failed to fetch record details");
        console.error(err);
      }
    };

    fetchDataById();
  }, [id, isAdd, buildingOptions]);

  const handleNumberInputWheel = (e) => {
    e.target.blur();
    e.preventDefault(); // Add this to prevent scroll changing value
  };// 


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

    // Recalculate emission when relevant dropdown changes
    const updatedForm = { ...formData, [name]: value };
    const {
      vehicleClassification,
      vehicleType,
      fuelName,
      distanceTraveled,
      distanceUnit,
      weightLoaded,
    } = updatedForm;

    if (vehicleClassification && vehicleType && distanceTraveled && distanceUnit) {
      const isHGV =
        vehicleClassification.value === "Heavy Good Vehicles (HGVs All Diesel)" ||
        vehicleClassification.value === "Heavy Good Vehicles (Refrigerated HGVs All Diesel)";

      const result = calculateMobileCombustion(
        isHGV ? null : fuelName?.value || fuelName,
        distanceTraveled,
        distanceUnit?.value || distanceUnit,
        vehicleType?.value || vehicleType,
        vehicleClassification?.value || vehicleClassification,
        isHGV ? weightLoaded?.value || weightLoaded : null
      );

      // if (result) {
      //   toast.info(
      //     `Emission = ${result.totalEmissionKg.toFixed(5)} kgCO₂e (${result.totalEmissionTonnes.toFixed(5)} tCO₂e)`
      //   );
      // }
    }

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle text input
  const handleInputChange = (e) => {
    if (isView) return;
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.buildingId) newErrors.buildingId = "Building is required";
    if (!formData.stakeholder) newErrors.stakeholder = "Stakeholder is required";
    if (!formData.vehicleClassification) newErrors.vehicleClassification = "Vehicle Classification is required";
    if (!formData.vehicleType) newErrors.vehicleType = "Vehicle Type is required";
    if (!formData.fuelName) newErrors.fuelName = "Fuel Name is required";
    if (!formData.distanceTraveled) newErrors.distanceTraveled = "Distance Travelled is required";
    if (!formData.distanceUnit) newErrors.distanceUnit = "Distance Unit is required";
    if (!formData.qualityControl) newErrors.qualityControl = "Quality Control is required";
    if (!formData.postingDate) newErrors.postingDate = "Posting Date is required";
    if (formData.distanceTraveled && Number(formData.distanceTraveled) < 0) {
      newErrors.distanceTraveled = "Value cannot be negative.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill all required fields");
      return;
    }

    //   Always recalculate before submission
    const isHGV =
      formData.vehicleClassification?.value === "Heavy Good Vehicles (HGVs All Diesel)" ||
      formData.vehicleClassification?.value === "Heavy Good Vehicles (Refrigerated HGVs All Diesel)";

    const result = calculateMobileCombustion(
      isHGV ? null : formData.fuelName?.value || formData.fuelName,
      formData.distanceTraveled,
      formData.distanceUnit?.value || formData.distanceUnit,
      formData.vehicleType?.value || formData.vehicleType,
      formData.vehicleClassification?.value || formData.vehicleClassification,
      isHGV ? formData.weightLoaded?.value || formData.weightLoaded : null
    );
    const calculatedEmissionKgCo2e = result ? result.totalEmissionKg : "0";
    const calculatedEmissionTCo2e = result ? result.totalEmissionTonnes : "0";

    //   Merge updated values into formData before sending
    const payload = {
      buildingId: formData.buildingId?.value || formData.buildingId,
      stakeholder: formData.stakeholder?.value || formData.stakeholder,
      vehicleClassification: formData.vehicleClassification?.value || formData.vehicleClassification,
      vehicleType: formData.vehicleType?.value || formData.vehicleType,
      fuelName: formData.fuelName?.value || formData.fuelName,
      distanceTraveled: formData.distanceTraveled,
      distanceUnit: formData.distanceUnit?.value || formData.distanceUnit,
      qualityControl: formData.qualityControl?.value || formData.qualityControl,
      weightLoaded: formData.weightLoaded ? formData.weightLoaded.value || formData.weightLoaded : null,
      calculatedEmissionKgCo2e,
      calculatedEmissionTCo2e,
      remarks: capitalizeFirstLetter(formData.remarks),
      postingDate: formData.postingDate,
    };

    try {
      const url = isEdit
        ? `${process.env.REACT_APP_BASE_URL}/AutoMobile/update/${id}`
        : `${process.env.REACT_APP_BASE_URL}/AutoMobile/Create`;

      const method = isEdit ? axios.put : axios.post;

      await method(url, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      toast.success(
        `${isEdit ? "Record updated" : "Record added"} successfully)`
      );

      navigate("/Mobile-Combustion");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    const {
      vehicleClassification,
      vehicleType,
      fuelName,
      distanceTraveled,
      distanceUnit,
      weightLoaded,
    } = formData;

    if (
      !vehicleClassification ||
      !vehicleType ||
      !distanceTraveled ||
      !distanceUnit ||
      (!fuelName && vehicleClassification?.value !== "Heavy Good Vehicles (HGVs All Diesel)" &&
        vehicleClassification?.value !== "Heavy Good Vehicles (Refrigerated HGVs All Diesel)")
    ) return;


    const isHGV =
      vehicleClassification?.value === "Heavy Good Vehicles (HGVs All Diesel)" ||
      vehicleClassification?.value === "Heavy Good Vehicles (Refrigerated HGVs All Diesel)";

    const result = calculateMobileCombustion(
      isHGV ? null : fuelName?.value || fuelName,
      distanceTraveled,
      distanceUnit?.value || distanceUnit,
      vehicleType?.value || vehicleType,
      vehicleClassification?.value || vehicleClassification,
      isHGV ? weightLoaded?.value || weightLoaded : null
    );


    if (result) {
      //  Update formData with calculated emissions
      setFormData((prev) => ({
        ...prev,
        calculatedEmissionKgCo2e: parseFloat(result.totalEmissionKg),
        calculatedEmissionTCo2e: parseFloat(result.totalEmissionTonnes),
      }));

      //  Show formatted toast
      // toast.info(
      //   `Total Emission: ${result.totalEmissionKg.toFixed(5)} KgCO₂e (${result.totalEmissionTonnes.toFixed(4)} tCO₂e)`,
      //   { position: "top-right", autoClose: 4000 }
      // );
    }
  }, [formData.vehicleClassification, formData.vehicleType, formData.fuelName, formData.distanceTraveled, formData.distanceUnit, formData.weightLoaded]);

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
              <Select name="stakeholder" value={formData.stakeholder} options={FugitiveAndMobileStakeholderOptions} onChange={handleSelectChange} placeholder="Select Stakeholder / Department" isDisabled={isView} allowCustomInput />
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

            {/* Distance travelled */}
            <div>
              <label className="field-label">Distance Travelled</label>
              <InputGroup type="number" name="distanceTraveled" onWheel={handleNumberInputWheel} value={formData.distanceTraveled} onChange={handleInputChange} placeholder="e.g., 1000" className="input-field" disabled={isView} />
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
            {/* posting Date */}
            <div>
              <label className="field-label">Posting Date</label>
              <InputGroup
                type="date"
                name="postingDate"
                value={formData.postingDate}
                onChange={handleInputChange}
                className="border-[2px] w-full h-10 p-2 rounded-md"
                disabled={isView}
              />
              {errors.postingDate && <p className="text-red-500 text-sm mt-1">{errors.postingDate}</p>}
            </div>
          </div>
          {/* Remarks */}
          <div>
            <label className="field-label">Remarks</label>
            <InputGroup type="textarea" name="remarks" value={formData.remarks} onChange={handleInputChange} rows={3} placeholder="Enter Remarks" className="border-[2px] border-gray-400 rounded-md" disabled={isView} />
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
