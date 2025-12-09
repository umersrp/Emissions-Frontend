import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CustomSelect from "@/components/ui/Select";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { qualityControlOptions } from "@/constant/scope1/options";
import {
    stakeholderOptions,
    fuelConsumptionUnits,
    fuelEnergyTypes,
    fuelEnergyTypesChildTypes,
    units,
    emissionFactors,
    unitConversion
} from "@/constant/scope3/options";
import Spinner from "@/components/ui/spinner";
import Swicth from "@/components/ui/Switch";  

const FuelEnergyForm = () => {

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
        fuelType: null,
        fuel: null,
        totalFuelConsumption: null,
        fuelConsumptionUnit: null,
        totalGrossElectricityPurchased: null,
        unit: null,
        qualityControl: null,
        remarks: "",
    });

    const [buildingOptions, setBuildingOptions] = useState([]);
    const [fuel, setFuel] = useState([]);
    const [goodsServicesTypeOptions, setGoodsServicesTypeOptions] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    const [toggleOptions, setToggleOptions] = useState({
        didTravelByAir: false,
        didTravelByTaxi: false,
        didTravelByTrain: false,
        didTravelByBus: false,
    });

    const travelFields = {
        didTravelByAir: [
            "airPassengers",
            "airDistanceKm",
            "airTravelClass",
            "airFlightType",
        ],
        didTravelByTaxi: [
            "taxiPassengers",
            "taxiDistanceKm",
            "taxiType",
        ],
        didTravelByTrain: [
            "trainPassengers",
            "trainDistanceKm",
            "trainType",
        ],
        didTravelByBus: [
            "busPassengers",
            "busDistanceKm",
            "busType",
        ],
    };


    const calculateEmission = (fuelType, fuelName, value, unit) => {
        const ef = emissionFactors[fuelType]?.[fuelName] || emissionFactors["Electricity"]?.[unit] || 0;
        const convert = unitConversion[unit] || (v => v);
        const standardizedValue = convert(Number(value));
        const kg = standardizedValue * ef;
        const tons = kg / 1000;
        return {
            calculatedEmissionKgCo2e: Number(kg.toFixed(4)),
            calculatedEmissionTCo2e: Number(tons.toFixed(6)),
        };
    };

    // Fetch Buildings
    useEffect(() => {
        const fetchBuildings = async () => {
            try {
                const res = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/building/Get-All-Buildings?limit=1000`,
                    {
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                    }
                );
                const formatted = res.data?.data?.buildings?.map((b) => ({
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

    // Fetch record for Edit/View mode
    useEffect(() => {
        if (isEdit || isView) {
            const fetchRecord = async () => {
                setIsFetching(true)
                try {
                    const res = await axios.get(
                        `${process.env.REACT_APP_BASE_URL}/Fuel-And-Energy/get/${id}`,
                        {
                            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                        }
                    );
                    const data = res.data?.data;
                    if (data) {
                        setFormData({
                            buildingId: { value: data.buildingId?._id, label: data.buildingId?.buildingName },
                            stakeholder: { value: data.stakeholder, label: data.stakeholder },
                            fuelType: { value: data.fuelType, label: data.fuelType },
                            fuel: { value: data.fuel, label: data.fuel },
                            totalFuelConsumption: data.totalFuelConsumption,
                            fuelConsumptionUnit: { value: data.fuelConsumptionUnit, label: data.fuelConsumptionUnit },
                            totalGrossElectricityPurchased: data.totalGrossElectricityPurchased,
                            unit: { value: data.unit, label: data.unit },
                            qualityControl: data.qualityControl ? { value: data.qualityControl, label: data.qualityControl } : null,
                            remarks: data.remarks || "",
                        });
                        setIsFetching(false)
                    }
                } catch (err) {
                    setIsFetching(false)
                    toast.error("Failed to fetch record details");
                }
            };
            fetchRecord();
        }
    }, [id, isEdit, isView]);

    // Update activity type options when purchase category changes
    // useEffect(() => {
    //     if (formData.fuelType) {
    //         if (formData.fuelType.value === "Purchased Goods") {
    //             setFuel(purchasedGoodsActivityTypes);
    //         } else if (formData.fuelType.value === "Purchased Services") {
    //             setFuel(purchasedServicesActivityTypes);
    //         }
    //         if (!isView && !isEdit) {
    //             setFormData(prev => ({
    //                 ...prev,
    //                 purchasedActivityType: null,
    //                 purchasedGoodsServicesType: null,
    //             }));
    //             setGoodsServicesTypeOptions([]);
    //         }
    //     } else {
    //         setFuel([]);
    //         setGoodsServicesTypeOptions([]);
    //     }
    // }, [formData.fuelType, isView, isEdit]);

    // Update goods/services type options when activity type changes
    // useEffect(() => {
    //     if (formData.purchasedActivityType) {
    //         const typeOptions = purchasedGoodsServicesTypes[formData.purchasedActivityType.value] || [];
    //         setGoodsServicesTypeOptions(typeOptions);

    //         // Reset goods/services type when activity type changes
    //         if (!isView && !isEdit) {
    //             setFormData(prev => ({
    //                 ...prev,
    //                 purchasedGoodsServicesType: null,
    //             }));
    //         }
    //     } else {
    //         setGoodsServicesTypeOptions([]);
    //     }
    // }, [formData.purchasedActivityType, isView, isEdit]);

    const handleInputChange = (e) => {
        if (isView) return;
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleSelectChange = (name, value) => {
        if (isView) return;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    // Validation
    const validate = () => {
        const newErrors = {};
        if (!formData.buildingId) newErrors.buildingId = "Building is required";
        if (!formData.stakeholder) newErrors.stakeholder = "Stakeholder/Department is required";
        if (!formData.fuel) newErrors.fuel = "Fuel is required";
        if (!formData.fuelConsumptionUnit) newErrors.fuelConsumptionUnit = "Fuel consumption is required";
        if (!formData.fuelType) newErrors.fuelType = "Fuel type is required";
        if (!formData.totalFuelConsumption) newErrors.totalFuelConsumption = "Total fuel consumption is required";
        if (!formData.totalGrossElectricityPurchased) newErrors.totalGrossElectricityPurchased = "TotalGross electricity purchased is required";
        if (!formData.unit) newErrors.unit = "Unit is required";
        if (!formData.qualityControl) newErrors.qualityControl = "Quality control is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isView) return;

        if (!validate()) {
            // toast.error("Please fill all required fields");
            return;
        }

        const userId = localStorage.getItem("userId");
        if (!userId) {
            toast.error("User not found. Please log in again.");
            return;
        }

        const fuelType = formData.fuelType?.value;
        const fuelName = formData.fuel?.value;
        const inputValue = formData.totalFuelConsumption;
        const inputUnit = formData.fuelConsumptionUnit?.value;
        const electricityValue = formData.totalGrossElectricityPurchased;
        const electricityUnit = formData.unit?.value;

        let emission = { calculatedEmissionKgCo2e: 0, calculatedEmissionTCo2e: 0 };

        // Fuel-based emissions
        if (fuelType && fuelName && inputValue) {
            emission = calculateEmission(fuelType, fuelName, inputValue, inputUnit);
        }

        // Electricity-based emissions (Scope 2)
        if (electricityValue) {
            const elecEmission = calculateEmission("Electricity", electricityUnit, electricityValue, electricityUnit);
            emission.calculatedEmissionKgCo2e += elecEmission.calculatedEmissionKgCo2e;
            emission.calculatedEmissionTCo2e += elecEmission.calculatedEmissionTCo2e;
        }

        const payload = {
            buildingId: formData.buildingId?.value,
            stakeholder: formData.stakeholder?.value,
            fuelType,
            fuel: fuelName,
            totalFuelConsumption: Number(inputValue),
            fuelConsumptionUnit: inputUnit,
            totalGrossElectricityPurchased: Number(electricityValue),
            unit: electricityUnit,
            qualityControl: formData.qualityControl?.value,
            remarks: formData.remarks,
            calculatedEmissionKgCo2e: emission.calculatedEmissionKgCo2e,
            calculatedEmissionTCo2e: emission.calculatedEmissionTCo2e,
        };

        Object.keys(toggleOptions).forEach((key) => {
            if (toggleOptions[key]) {
                travelFields[key].forEach((field) => {
                    if (field === "airFlightType" || field === "airTravelClass") {
                        payload[field] = formData[field].value ?? null;
                    } else {
                        payload[field] = formData[field] ?? null;
                    }
                });
            }
        });

        console.log("Payload to send:", payload);

        try {
            setLoading(true);
            if (isEdit) {
                await axios.put(
                    `${process.env.REACT_APP_BASE_URL}/Fuel-And-Energy/update/${id}`,
                    payload,
                    {
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                    }
                );
                setLoading(false);
                toast.success("Record updated successfully!");
            } else {
                await axios.post(
                    `${process.env.REACT_APP_BASE_URL}/Fuel-And-Energy/Create`,
                    payload,
                    {
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                    }
                );
                setLoading(false);
                toast.success("Record added successfully!");
            }
            navigate(-1);
        } catch (err) {
            setLoading(false);
            toast.error(err.response?.data?.message || "Something went wrong");
        }

    };

    // useEffect(() => {
    //     setFormData((prev) => {
    //         let updated = { ...prev };
    //         Object.keys(toggleOptions).forEach((key) => {
    //             if (toggleOptions[key]) {
    //                 updated = { ...updated, ...travelFields[key] };
    //             } else {
    //                 Object.keys(obj[key]).forEach((field) => {
    //                     delete updated[field];
    //                 });
    //             }
    //         });
    //         return updated;
    //     });
    // }, [toggleOptions]);

    console.log(formData);

    return (
        <div>
            <Card title={`${isView ? "View" : isEdit ? "Edit" : "Add"} Fuel & Energy Record`}>
                <div className="text-slate-700 leading-relaxed mb-2 bg-gray-100 rounded-lg border-l-4 border-primary-400 p-2 pl-4 m-4">
                    <p className="text-gray-700">
This category includes emissions related to the production of fuels and energy purchased and consumed by the reporting company in the reporting year that ar that are not included in scope 1 or scope 2.</p>
                </div>
                {isFetching ? (
                    <div className="flex justify-center items-center h-64">
                        <Spinner />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 grid gap-6">

                        {/* Building and Stakeholder */}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="field-label">Site / Building Name *</label>
                                <CustomSelect
                                    name="buildingId"
                                    options={buildingOptions}
                                    value={formData.buildingId}
                                    onChange={(value) => handleSelectChange("buildingId", value)}
                                    placeholder="Select Building"
                                    isDisabled={isView}
                                />
                                {errors.buildingId && <p className="text-red-500 text-sm mt-2">{errors.buildingId}</p>}
                            </div>
                            <div>
                                <label className="field-label">Stakeholder / Department *</label>
                                <CustomSelect
                                    name="stakeholder"
                                    options={stakeholderOptions}
                                    value={formData.stakeholder}
                                    onChange={(value) => handleSelectChange("stakeholder", value)}
                                    placeholder="Select Stakeholder/Department"
                                    isDisabled={isView}
                                />
                                {errors.stakeholder && <p className="text-red-500 text-sm mt-2">{errors.stakeholder}</p>}
                            </div>
                        </div>

                        {/* Purchase Category and Activity Type */}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="field-label">Fuel Types *</label>
                                <CustomSelect
                                    name="fuelType"
                                    options={fuelEnergyTypes}
                                    value={formData.fuelType}
                                    onChange={(value) => {
                                        handleSelectChange("fuelType", value)
                                        if (value === null) {
                                            setFuel([]);
                                            setFormData((prevData) => {
                                                return {
                                                    ...prevData,
                                                    fuel: null,
                                                }
                                            })
                                        } else {
                                            handleSelectChange("fuel", value.value)
                                            setFuel(fuelEnergyTypesChildTypes[value.value] || []);
                                        }
                                    }}
                                    placeholder="Select Fuel Type"
                                    isDisabled={isView}
                                />
                                {errors.fuelType && <p className="text-red-500 text-sm mt-2">{errors.fuelType}</p>}
                            </div>

                            <div>
                                <label className="field-label">Fuel *</label>
                                <CustomSelect
                                    name="fuel"
                                    options={fuel}
                                    value={formData.fuel}
                                    onChange={(value) => handleSelectChange("fuel", value)}
                                    placeholder="Select Activity Type"
                                    isDisabled={isView}
                                />
                                {errors.fuel && <p className="text-red-500 text-sm mt-2">{errors.fuel}</p>}
                            </div>
                        </div>

                        {/* Goods/Services Type */}

                        {/* <div>
            <label className="field-label">Purchased Goods or Services Type *</label>
            <CustomSelect
              name="purchasedGoodsServicesType"
              options={goodsServicesTypeOptions}
              value={formData.purchasedGoodsServicesType}
              onChange={(value) => handleSelectChange("purchasedGoodsServicesType", value)}
              placeholder="Select Type"
              isDisabled={isView || !formData.purchasedActivityType}
            />
            {errors.purchasedGoodsServicesType && <p className="text-red-500 text-sm mt-2">{errors.purchasedGoodsServicesType}</p>}
          </div> */}

                        {/* Amount Spent and Unit */}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="field-label">Total Fuel Consumption *</label>
                                <input
                                    type="totalFuelConsumption"
                                    name="totalFuelConsumption"
                                    value={formData.totalFuelConsumption}
                                    onChange={(e) => {
                                        handleInputChange(e)
                                        handleSelectChange("totalFuelConsumption", e.target.value)
                                    }}
                                    placeholder="Enter consumption amount"
                                    className="border-[2px] w-full h-10 p-2 rounded-md"
                                    disabled={isView}
                                />
                                {errors.totalFuelConsumption && <p className="text-red-500 text-sm mt-2">{errors.totalFuelConsumption}</p>}
                            </div>

                            <div>
                                <label className="field-label">Fuel Consumption Unit *</label>
                                <CustomSelect
                                    name="fuelConsumptionUnit"
                                    options={fuelConsumptionUnits}
                                    value={formData.fuelConsumptionUnit}
                                    onChange={(value) => handleSelectChange("fuelConsumptionUnit", value)}
                                    isDisabled={isView}
                                />
                                {errors.fuelConsumptionUnit && <p className="text-red-500 text-sm mt-2">{errors.fuelConsumptionUnit}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="field-label">Total Gross Electricity Purchased *</label>
                                <input
                                    type="totalGrossElectricityPurchased"
                                    name="totalGrossElectricityPurchased"
                                    value={formData.totalGrossElectricityPurchased}
                                    onChange={handleInputChange}
                                    placeholder="Enter gross electricity amount"
                                    className="border-[2px] w-full h-10 p-2 rounded-md"
                                    disabled={isView}
                                />
                                {errors.totalGrossElectricityPurchased && <p className="text-red-500 text-sm mt-2">{errors.totalGrossElectricityPurchased}</p>}
                            </div>

                            <div>
                                <label className="field-label">Unit *</label>
                                <CustomSelect
                                    name="unit"
                                    options={units}
                                    value={formData.unit}
                                    onChange={(value) => handleSelectChange("unit", value)}
                                    isDisabled={isView}
                                />
                                {errors.unit && <p className="text-red-500 text-sm mt-2">{errors.unit}</p>}
                            </div>
                        </div>

                        {/* Quality Control */}

                        <div>
                            <label className="field-label">Quality Control *</label>
                            <CustomSelect
                                name="qualityControl"
                                options={qualityControlOptions}
                                value={formData.qualityControl}
                                onChange={(value) => handleSelectChange("qualityControl", value)}
                                placeholder="Select Quality"
                                isDisabled={isView}
                            />
                            {errors.qualityControl && <p className="text-red-500 text-sm mt-2">{errors.qualityControl}</p>}
                        </div>

                        {/* Remarks */}

                        <div>
                            <label className="field-label">Remarks (Optional)</label>
                            <textarea
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="Any remarks..."
                                className="border-[2px] w-full p-2 rounded-md"
                                disabled={isView}
                            />
                        </div>

                        {/* Business Travel Section */}
                        <div className="col-span-full border-t pt-6">
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Business Travel Details (Optional)</h3>

                            {/* Air Travel */}
                            <div className="mb-4">
                                <label className="flex items-center gap-2">
                                    {/* <input
                                        type="checkbox"
                                        checked={formData.didTravelByAir}
                                        onChange={(e) => setToggleOptions((prev) => ({ ...prev, didTravelByAir: e.target.checked }))}
                                        disabled={isView}
                                    /> */}
                                    <Swicth
                                        value={toggleOptions.didTravelByAir}
                                        onChange={(e) => setToggleOptions((prev) => ({ ...prev, didTravelByAir: e.target.checked }))}
                                        disabled={isView}
                                    />
                                    Did you have any business travel by air during the reporting period?
                                </label>
                                {toggleOptions.didTravelByAir && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                        <div>
                                            <label className="field-label">Number of Passengers *</label>
                                            <input
                                                type="number"
                                                name="airPassengers"
                                                value={formData.airPassengers}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 1, 2, 3"
                                                className="border-[2px] w-full h-10 p-2 rounded-md"
                                                disabled={isView}
                                            />
                                            {errors.airPassengers && (
                                                <p className="text-red-500 text-sm mt-1">{errors.airPassengers}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="field-label">Distance Travelled (km) *</label>
                                            <input
                                                type="number"
                                                name="airDistanceKm"
                                                value={formData.airDistanceKm}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 1000"
                                                className="border-[2px] w-full h-10 p-2 rounded-md"
                                                disabled={isView}
                                            />
                                            {errors.airDistanceKm && (
                                                <p className="text-red-500 text-sm mt-1">{errors.airDistanceKm}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="field-label">Travel Class *</label>
                                            <CustomSelect
                                                name="airTravelClass"
                                                options={[
                                                    { value: "Economy", label: "Economy" },
                                                    { value: "Business", label: "Business" },
                                                    { value: "First", label: "First" },
                                                ]}
                                                value={formData.airTravelClass}
                                                onChange={(value) => handleSelectChange("airTravelClass", value)}
                                                placeholder="Select class"
                                                isDisabled={isView}
                                            />
                                            {errors.airTravelClass && (
                                                <p className="text-red-500 text-sm mt-1">{errors.airTravelClass}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="field-label">Flight Type *</label>
                                            <CustomSelect
                                                name="airFlightType"
                                                options={[
                                                    { value: "Domestic", label: "Domestic" },
                                                    { value: "International", label: "International" },
                                                ]}
                                                value={formData.airFlightType}
                                                onChange={(value) => handleSelectChange("airFlightType", value)}
                                                placeholder="Select flight type"
                                                isDisabled={isView}
                                            />
                                            {errors.airFlightType && (
                                                <p className="text-red-500 text-sm mt-1">{errors.airFlightType}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Taxi Travel */}
                            <div className="mb-4">
                                <label className="flex items-center gap-2">
                                    {/* <input
                                        type="checkbox"
                                        checked={formData.didTravelByTaxi}
                                        onChange={(e) => setToggleOptions((prev) => ({ ...prev, didTravelByTaxi: e.target.checked }))}
                                        disabled={isView}
                                    /> */}
                                    <Swicth
                                        value={toggleOptions.didTravelByTaxi}
                                        onChange={(e) => setToggleOptions((prev) => ({ ...prev, didTravelByTaxi: e.target.checked }))}
                                        disabled={isView}
                                    />
                                    Did you have any business travel by taxi during the reporting period?
                                </label>
                                {toggleOptions.didTravelByTaxi && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                        <div>
                                            <label className="field-label">Number of Passengers *</label>
                                            <input
                                                type="number"
                                                name="taxiPassengers"
                                                value={formData.taxiPassengers}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 1, 2, 3"
                                                className="border-[2px] w-full h-10 p-2 rounded-md"
                                                disabled={isView}
                                            />
                                            {errors.taxiPassengers && (
                                                <p className="text-red-500 text-sm mt-1">{errors.taxiPassengers}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="field-label">Distance Travelled (km) *</label>
                                            <input
                                                type="number"
                                                name="taxiDistanceKm"
                                                value={formData.taxiDistanceKm}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 50"
                                                className="border-[2px] w-full h-10 p-2 rounded-md"
                                                disabled={isView}
                                            />
                                            {errors.taxiDistanceKm && (
                                                <p className="text-red-500 text-sm mt-1">{errors.taxiDistanceKm}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="field-label">Taxi Type *</label>
                                            <CustomSelect
                                                name="taxiType"
                                                options={[
                                                    { value: "Regular", label: "Regular" },
                                                    { value: "Luxury", label: "Luxury" },
                                                    { value: "Shared", label: "Shared" },
                                                ]}
                                                value={formData.taxiType}
                                                onChange={(value) => handleSelectChange("taxiType", value)}
                                                placeholder="Select taxi type"
                                                isDisabled={isView}
                                            />
                                            {errors.taxiType && (
                                                <p className="text-red-500 text-sm mt-1">{errors.taxiType}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Bus Travel */}
                            <div className="mb-4">
                                <label className="flex items-center gap-2">
                                    {/* <input
                                        type="checkbox"
                                        checked={formData.didTravelByBus}
                                        onChange={(e) => setToggleOptions((prev) => ({ ...prev, didTravelByBus: e.target.checked }))}
                                        disabled={isView}
                                    /> */}
                                    <Swicth
                                        value={toggleOptions.didTravelByBus}
                                        onChange={(e) => setToggleOptions((prev) => ({ ...prev, didTravelByBus: e.target.checked }))}
                                        disabled={isView}
                                    />
                                    Did you have any business travel by bus during the reporting period?
                                </label>
                                {toggleOptions.didTravelByBus && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                        <div>
                                            <label className="field-label">Number of Passengers *</label>
                                            <input
                                                type="number"
                                                name="busPassengers"
                                                value={formData.busPassengers}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 1, 2, 3"
                                                className="border-[2px] w-full h-10 p-2 rounded-md"
                                                disabled={isView}
                                            />
                                            {errors.busPassengers && (
                                                <p className="text-red-500 text-sm mt-1">{errors.busPassengers}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="field-label">Distance Travelled (km) *</label>
                                            <input
                                                type="number"
                                                name="busDistanceKm"
                                                value={formData.busDistanceKm}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 100"
                                                className="border-[2px] w-full h-10 p-2 rounded-md"
                                                disabled={isView}
                                            />
                                            {errors.busDistanceKm && (
                                                <p className="text-red-500 text-sm mt-1">{errors.busDistanceKm}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="field-label">Bus Type *</label>
                                            <CustomSelect
                                                name="busType"
                                                options={[
                                                    { value: "City", label: "City" },
                                                    { value: "Intercity", label: "Intercity" },
                                                    { value: "Shuttle", label: "Shuttle" },
                                                ]}
                                                value={formData.busType}
                                                onChange={(value) => handleSelectChange("busType", value)}
                                                placeholder="Select bus type"
                                                isDisabled={isView}
                                            />
                                            {errors.busType && (
                                                <p className="text-red-500 text-sm mt-1">{errors.busType}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Train Travel */}
                            <div className="mb-4">
                                <label className="flex items-center gap-2">
                                    {/* <input
                                        type="checkbox"
                                        checked={formData.didTravelByTrain}
                                        onChange={(e) => setToggleOptions((prev) => ({ ...prev, didTravelByTrain: e.target.checked }))}
                                        disabled={isView}
                                    /> */}
                                    <Swicth
                                        value={toggleOptions.didTravelByTrain}
                                        onChange={(e) => setToggleOptions((prev) => ({ ...prev, didTravelByTrain: e.target.checked }))}
                                        disabled={isView}
                                    />
                                    Did you have any business travel by train during the reporting period?
                                </label>
                                {toggleOptions.didTravelByTrain && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                        <div>
                                            <label className="field-label">Number of Passengers *</label>
                                            <input
                                                type="number"
                                                name="trainPassengers"
                                                value={formData.trainPassengers}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 1, 2, 3"
                                                className="border-[2px] w-full h-10 p-2 rounded-md"
                                                disabled={isView}
                                            />
                                            {errors.trainPassengers && (
                                                <p className="text-red-500 text-sm mt-1">{errors.trainPassengers}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="field-label">Distance Travelled (km) *</label>
                                            <input
                                                type="number"
                                                name="trainDistanceKm"
                                                value={formData.trainDistanceKm}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 200"
                                                className="border-[2px] w-full h-10 p-2 rounded-md"
                                                disabled={isView}
                                            />
                                            {errors.trainDistanceKm && (
                                                <p className="text-red-500 text-sm mt-1">{errors.trainDistanceKm}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="field-label">Train Type *</label>
                                            <CustomSelect
                                                name="trainType"
                                                options={[
                                                    { value: "Local", label: "Local" },
                                                    { value: "Express", label: "Express" },
                                                    { value: "Intercity", label: "Intercity" },
                                                ]}
                                                value={formData.trainType}
                                                onChange={(value) => handleSelectChange("trainType", value)}
                                                placeholder="Select train type"
                                                isDisabled={isView}
                                            />
                                            {errors.trainType && (
                                                <p className="text-red-500 text-sm mt-1">{errors.trainType}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Buttons */}

                        <div className="col-span-full flex justify-end gap-4 pt-6 border-t">
                            <Button
                                text={isView ? "Back" : "Cancel"}
                                className={isView ? "btn-primary" : "btn-light"}
                                type="button"
                                onClick={() => navigate(-1)}
                            />
                            {!isView && (
                                <Button
                                    text={isEdit ? "Update" : "Add"}
                                    className="btn-primary"
                                    type="submit"
                                    isLoading={loading}
                                />
                            )}
                        </div>

                    </form>
                )}
            </Card>
        </div>
    );
};

export default FuelEnergyForm;