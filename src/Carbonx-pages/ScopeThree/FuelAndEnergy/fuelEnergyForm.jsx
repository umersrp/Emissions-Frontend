import React, { useState, useEffect, useMemo } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CustomSelect from "@/components/ui/Select";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { qualityControlOptions } from "@/constant/scope1/options";
import {
    fuelUnitOptionsByName, fuelEnergyTypes, fuelEnergyTypesChildTypes, travelFields, AIR_TRAVEL_OPTIONS, AIR_FLIGHT_TYPES, TAXI_TYPES, BUS_TYPES, TRAIN_TYPES,
} from "@/constant/scope3/fuelAndEnergy";
import { stakeholderOptions, units, } from "@/constant/scope3/options";
import Spinner from "@/components/ui/spinner";
import Swicth from "@/components/ui/Switch";
import { calculateFuelAndEnergy } from "@/utils/Scope3/calculateFuelAndEnergy";
import InputGroup from "@/components/ui/InputGroup";

const FuelEnergyForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const mode = location.state?.mode || "add";
    const isView = mode === "view";
    const isEdit = mode === "edit";
    const isAdd = mode === "add";
    const [showToggleError, setShowToggleError] = useState(false);
    const [formData, setFormData] = useState({
        buildingId: null,
        stakeholder: null,
        fuelType: null,
        fuel: null,
        totalFuelConsumption: "",
        fuelConsumptionUnit: null,
        totalGrossElectricityPurchased: "",
        unit: null,
        qualityControl: null,
        remarks: "",
        // Travel fields
        airPassengers: "",
        airDistanceKm: "",
        airTravelClass: "",
        airFlightType: "",
        taxiPassengers: "",
        taxiDistanceKm: "",
        taxiType: "",
        busPassengers: "",
        busDistanceKm: "",
        busTyope: "",
        trainPassengers: "",
        trainDistanceKm: "",
        trainType: "",

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

    // Real-time emission calculation & toast
    useEffect(() => {
        if (!isView) {
            const fuelType = formData.fuelType?.value;
            const fuelName = formData.fuel?.value;
            const inputValue = Number(formData.totalFuelConsumption);
            const inputUnit = formData.fuelConsumptionUnit?.value;
            const electricityValue = Number(formData.totalGrossElectricityPurchased);
            const electricityUnit = formData.unit?.value;

            // Only calculate if any required value exists
            if ((inputValue && fuelName && inputUnit) || (electricityValue && electricityUnit)) {
                const emission = calculateFuelAndEnergy({
                    fuelType,
                    fuel: fuelName,
                    totalFuelConsumption: inputValue,
                    fuelConsumptionUnit: inputUnit,
                    totalGrossElectricityPurchased: electricityValue,
                    unit: electricityUnit,
                    airPassengers: Number(formData.airPassengers),
                    airDistanceKm: Number(formData.airDistanceKm),
                    airTravelClass: formData.airTravelClass,
                    airFlightType: formData.airFlightType,
                    taxiPassengers: Number(formData.taxiPassengers),
                    taxiDistanceKm: Number(formData.taxiDistanceKm),
                    taxiType: formData.taxiType,
                    busPassengers: Number(formData.busPassengers),
                    busDistanceKm: Number(formData.busDistanceKm),
                    busType: formData.busType,
                    trainPassengers: Number(formData.trainPassengers),
                    trainDistanceKm: Number(formData.trainDistanceKm),
                    trainType: formData.trainType,
                });

                // toast.info(
                //     `Emission: ${emission.totalEmissions_KgCo2e.toFixed(2)} kg CO2e (${emission.totalEmissions_TCo2e.toFixed(2)} t CO2e)`,
                //     { autoClose: 2000 }
                // );
            }
        }
    }, [
        formData.fuelType,
        formData.fuel,
        formData.totalFuelConsumption,
        formData.fuelConsumptionUnit,
        formData.totalGrossElectricityPurchased,
        formData.unit,
        formData.airPassengers,
        formData.airDistanceKm,
        formData.airTravelClass,
        formData.airFlightType,
        formData.taxiPassengers,
        formData.taxiDistanceKm,
        formData.taxiType,
        formData.busPassengers,
        formData.busDistanceKm,
        formData.busType,
        formData.trainPassengers,
        formData.trainDistanceKm,
        formData.trainType
    ]);
    const capitalizeFirstLetter = (text) => {
        if (!text) return "";
        return text.charAt(0).toUpperCase() + text.slice(1);
    };
    const formatEmission = (num) => {
        const rounded = Number(num.toFixed(2));
        if (rounded !== 0 && (Math.abs(rounded) < 0.0001 || Math.abs(rounded) >= 1e6)) {
            return rounded.toExponential(5);
        }
        return rounded;
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
                setIsFetching(true);
                try {
                    const res = await axios.get(
                        `${process.env.REACT_APP_BASE_URL}/Fuel-And-Energy/get/${id}`,
                        {
                            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                        }
                    );
                    const data = res.data?.data;
                    if (data) {
                        setFormData((prev) => ({
                            ...prev,

                            // Air
                            airPassengers: data.airPassengers ?? "",
                            airDistanceKm: data.airDistanceKm ?? "",
                            airTravelClass: data.airTravelClass
                                ? { value: data.airTravelClass, label: data.airTravelClass }
                                : null,
                            airFlightType: data.airFlightType
                                ? { value: data.airFlightType, label: data.airFlightType }
                                : null,

                            // Taxi
                            taxiPassengers: data.taxiPassengers ?? "",
                            taxiDistanceKm: data.taxiDistanceKm ?? "",
                            taxiType: data.taxiType
                                ? { value: data.taxiType, label: data.taxiType }
                                : null,

                            // Bus
                            busPassengers: data.busPassengers ?? "",
                            busDistanceKm: data.busDistanceKm ?? "",
                            busType: data.busType
                                ? { value: data.busType, label: data.busType }
                                : null,

                            // Train
                            trainPassengers: data.trainPassengers ?? "",
                            trainDistanceKm: data.trainDistanceKm ?? "",
                            trainType: data.trainType
                                ? { value: data.trainType, label: data.trainType }
                                : null,

                            // New fields
                            buildingId: data.buildingId
                                ? { value: data.buildingId._id, label: data.buildingId.buildingName }
                                : null,
                            stakeholder: data.stakeholder
                                ? { value: data.stakeholder, label: data.stakeholder }
                                : null,
                            fuelType: data.fuelType
                                ? { value: data.fuelType, label: data.fuelType }
                                : null,
                            fuel: data.fuel
                                ? { value: data.fuel, label: data.fuel }
                                : null,
                            totalFuelConsumption: data.totalFuelConsumption ?? "",
                            fuelConsumptionUnit: data.fuelConsumptionUnit
                                ? { value: data.fuelConsumptionUnit, label: data.fuelConsumptionUnit }
                                : null,
                            totalGrossElectricityPurchased: data.totalGrossElectricityPurchased ?? "",
                            unit: data.unit
                                ? { value: data.unit, label: data.unit }
                                : null,
                            qualityControl: data.qualityControl
                                ? { value: data.qualityControl, label: data.qualityControl }
                                : null,
                            remarks: data.remarks || "",
                        }));

                        setToggleOptions({
                            didTravelByAir: !!data.didTravelByAir,
                            didTravelByTaxi: !!data.didTravelByTaxi,
                            didTravelByBus: !!data.didTravelByBus,
                            didTravelByTrain: !!data.didTravelByTrain,
                        });

                        setIsFetching(false);
                    }
                } catch (err) {
                    setIsFetching(false);
                    toast.error("Failed to fetch record details");
                }
            };
            fetchRecord();
        }
    }, [id, isEdit, isView]);

    const handleToggleChange = (toggleName) => {
        const newToggleValue = !toggleOptions[toggleName];

        // Map toggle names to their corresponding form fields
        const toggleFieldMap = {
            didTravelByAir: {
                errors: ['airPassengers', 'airDistanceKm', 'airFlightType', 'airTravelClass'],
                formFields: {
                    airPassengers: "",
                    airDistanceKm: "",
                    airFlightType: null,
                    airTravelClass: null,
                }
            },
            didTravelByTaxi: {
                errors: ['taxiPassengers', 'taxiDistanceKm', 'taxiType'],
                formFields: {
                    taxiPassengers: "",
                    taxiDistanceKm: "",
                    taxiType: null,
                }
            },
            didTravelByBus: {
                errors: ['busPassengers', 'busDistanceKm', 'busType'],
                formFields: {
                    busPassengers: "",
                    busDistanceKm: "",
                    busType: null,
                }
            },
            didTravelByTrain: {
                errors: ['trainPassengers', 'trainDistanceKm', 'trainType'],
                formFields: {
                    trainPassengers: "",
                    trainDistanceKm: "",
                    trainType: null,
                }
            }
        };

        setToggleOptions((prev) => ({ ...prev, [toggleName]: newToggleValue }));

        // Clear errors and reset form fields when toggle is turned off
        if (!newToggleValue && toggleFieldMap[toggleName]) {
            const { errors: errorFields, formFields } = toggleFieldMap[toggleName];

            // Clear errors
            setErrors((prev) => {
                const newErrors = { ...prev };
                errorFields.forEach(field => {
                    newErrors[field] = "";
                });
                return newErrors;
            });

            // Reset form fields
            setFormData((prev) => ({
                ...prev,
                ...formFields
            }));
        }
    };

    const handleInputChange = (e) => {
        if (isView) return;
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };
    const handleSelectChange = (name, value) => {
        if (isView) return;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error when value is selected
        if (value) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
        // If value is cleared and toggle is active, set error
        else if (
            (name === "airFlightType" && toggleOptions.didTravelByAir) ||
            (name === "airTravelClass" && toggleOptions.didTravelByAir) ||
            (name === "taxiType" && toggleOptions.didTravelByTaxi) ||
            (name === "busType" && toggleOptions.didTravelByBus) ||
            (name === "trainType" && toggleOptions.didTravelByTrain)
        ) {
            // Format field name for error message
            const fieldName = name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            setErrors((prev) => ({ ...prev, [name]: `${fieldName} is required` }));
        }
    };
    const handleNumberInputWheel = (e) => {
        e.target.blur();
    };// onWheel={handleNumberInputWheel}

    const getFuelUnitOptions = (fuelName) => {
        const defaultUnits = fuelUnitOptionsByName.default || [];
        const extraUnits = fuelName
            ? fuelUnitOptionsByName[fuelName] || []
            : [];
        return [...new Set([...defaultUnits, ...extraUnits])];
    };

    const fuelUnitOptions = useMemo(() => {
        const fuelName = formData.fuel?.value;

        return getFuelUnitOptions(fuelName).map((unit) => ({
            value: unit,
            label: unit,
        }));
    }, [formData.fuel]);

    // Clear toggle error when any travel option is selected
    useEffect(() => {
        const anyTravelSelected = Object.values(toggleOptions).some(value => value === true);
        if (anyTravelSelected && showToggleError) {
            setShowToggleError(false);
        }
    }, [toggleOptions]);

    // Validation
    // const validate = () => {
    //     const newErrors = {};

    //     // Basic field validations
    //     if (!formData.buildingId) newErrors.buildingId = "Building is required";
    //     if (!formData.stakeholder) newErrors.stakeholder = "Stakeholder/Department is required";
    //     if (!formData.fuel) newErrors.fuel = "Fuel is required";
    //     if (!formData.fuelConsumptionUnit) newErrors.fuelConsumptionUnit = "Fuel consumption unit is required";
    //     if (!formData.fuelType) newErrors.fuelType = "Fuel type is required";
    //     if (!formData.totalFuelConsumption) newErrors.totalFuelConsumption = "Total fuel consumption is required";
    //     if (!formData.totalGrossElectricityPurchased) newErrors.totalGrossElectricityPurchased = "Total gross electricity purchased is required";
    //     if (!formData.unit) newErrors.unit = "Unit is required";
    //     if (!formData.qualityControl) newErrors.qualityControl = "Quality control is required";

    //     // Validate for negative values (only if field has a value)
    //     const numberFields = ['totalFuelConsumption', 'totalGrossElectricityPurchased', 'airPassengers',
    //         'airDistanceKm', 'taxiPassengers', 'taxiDistanceKm', 'busPassengers',
    //         'busDistanceKm', 'trainPassengers', 'trainDistanceKm'];

    //     numberFields.forEach(field => {
    //         if (formData[field] && Number(formData[field]) < 0) {
    //             newErrors[field] = "Value cannot be negative.";
    //         }
    //     });

    //     // Check if at least one travel toggle is selected
    //     const anyTravelSelected = Object.values(toggleOptions).some(value => value === true);

    //     // Show/hide toggle error
    //     if (!anyTravelSelected) {
    //         setShowToggleError(true);
    //     } else {
    //         setShowToggleError(false);
    //     }

    //     // Validate opened toggle fields
    //     if (toggleOptions.didTravelByAir) {
    //         if (!formData.airPassengers) newErrors.airPassengers = "Number of passengers is required";
    //         if (!formData.airDistanceKm) newErrors.airDistanceKm = "Distance is required";
    //         if (!formData.airFlightType) newErrors.airFlightType = "Flight type is required";
    //         if (!formData.airTravelClass) newErrors.airTravelClass = "Travel class is required";
    //     }

    //     if (toggleOptions.didTravelByTaxi) {
    //         if (!formData.taxiPassengers) newErrors.taxiPassengers = "Number of passengers is required";
    //         if (!formData.taxiDistanceKm) newErrors.taxiDistanceKm = "Distance is required";
    //         if (!formData.taxiType) newErrors.taxiType = "Taxi type is required";
    //     }

    //     if (toggleOptions.didTravelByBus) {
    //         if (!formData.busPassengers) newErrors.busPassengers = "Number of passengers is required";
    //         if (!formData.busDistanceKm) newErrors.busDistanceKm = "Distance is required";
    //         if (!formData.busType) newErrors.busType = "Bus type is required";
    //     }

    //     if (toggleOptions.didTravelByTrain) {
    //         if (!formData.trainPassengers) newErrors.trainPassengers = "Number of passengers is required";
    //         if (!formData.trainDistanceKm) newErrors.trainDistanceKm = "Distance is required";
    //         if (!formData.trainType) newErrors.trainType = "Train type is required";
    //     }

    //     setErrors(newErrors);

    //     // Form is valid only if:
    //     // 1. No field errors
    //     // 2. At least one travel toggle is selected
    //     // 3. All opened toggle fields are filled
    //     return Object.keys(newErrors).length === 0 && anyTravelSelected;
    // };
    const validate = () => {
        const newErrors = {};

        // Basic field validations
        if (!formData.buildingId) newErrors.buildingId = "Building is required";
        if (!formData.stakeholder) newErrors.stakeholder = "Stakeholder/Department is required";
        if (!formData.fuel) newErrors.fuel = "Fuel is required";
        // if (!formData.fuelConsumptionUnit) newErrors.fuelConsumptionUnit = "Fuel consumption unit is required";
        if (!formData.fuelType) newErrors.fuelType = "Fuel type is required";
        // if (!formData.unit) newErrors.unit = "Unit is required";
        if (!formData.qualityControl) newErrors.qualityControl = "Quality control is required";

        // Validate totalFuelConsumption and totalGrossElectricityPurchased
        // Show error only if BOTH are empty
        // const isFuelConsumptionEmpty = !formData.totalFuelConsumption || formData.totalFuelConsumption === '';
        // const isElectricityPurchasedEmpty = !formData.totalGrossElectricityPurchased || formData.totalGrossElectricityPurchased === '';

        // if (isFuelConsumptionEmpty && isElectricityPurchasedEmpty) {
        //     newErrors.totalFuelConsumption = "Either total fuel consumption or total gross electricity purchased is required";
        //     newErrors.totalGrossElectricityPurchased = "Either total fuel consumption or total gross electricity purchased is required";
        // }
        // NEW LOGIC: Conditionally validate fuel consumption unit
        const isFuelConsumptionFilled = formData.totalFuelConsumption && formData.totalFuelConsumption !== '';
        const isElectricityPurchasedFilled = formData.totalGrossElectricityPurchased && formData.totalGrossElectricityPurchased !== '';

        // Rule 1: If fuel consumption is filled, its unit is required
        if (isFuelConsumptionFilled && !formData.fuelConsumptionUnit) {
            newErrors.fuelConsumptionUnit = "Fuel consumption unit is required";
        }

        // Rule 2: If electricity purchased is filled, its unit is required
        if (isElectricityPurchasedFilled && !formData.unit) {
            newErrors.unit = "Unit is required";
        }

        // Rule 3: At least one of fuel consumption OR electricity purchased must be filled
        if (!isFuelConsumptionFilled && !isElectricityPurchasedFilled) {
            // Show error on both fields when both are empty
            newErrors.totalFuelConsumption = "Either total fuel consumption or total purchased electricity is required";
            newErrors.totalGrossElectricityPurchased = "Either total fuel consumption or total purchased electricity is required";
        } else {
            // If at least one is filled, ensure we DON'T show errors on these fields
            // This is the key fix: explicitly remove the errors when condition is satisfied
            delete newErrors.totalFuelConsumption;
            delete newErrors.totalGrossElectricityPurchased;
        }

        // Validate for negative values (only if field has a value)
        const numberFields = ['totalFuelConsumption', 'totalGrossElectricityPurchased', 'airPassengers',
            'airDistanceKm', 'taxiPassengers', 'taxiDistanceKm', 'busPassengers',
            'busDistanceKm', 'trainPassengers', 'trainDistanceKm'];

        numberFields.forEach(field => {
            // Only validate if field has a value (not empty string)
            if (formData[field] !== undefined && formData[field] !== '' && Number(formData[field]) < 0) {
                newErrors[field] = "Value cannot be negative.";
            }
        });

        // Toggles are now optional, so remove the toggle error logic
        setShowToggleError(false);

        // Validate opened toggle fields only if the toggle is selected
        if (toggleOptions.didTravelByAir) {
            if (!formData.airPassengers) newErrors.airPassengers = "Number of passengers is required";
            if (!formData.airDistanceKm) newErrors.airDistanceKm = "Distance is required";
            if (!formData.airFlightType) newErrors.airFlightType = "Flight type is required";
            if (!formData.airTravelClass) newErrors.airTravelClass = "Travel class is required";
        }

        if (toggleOptions.didTravelByTaxi) {
            if (!formData.taxiPassengers) newErrors.taxiPassengers = "Number of passengers is required";
            if (!formData.taxiDistanceKm) newErrors.taxiDistanceKm = "Distance is required";
            if (!formData.taxiType) newErrors.taxiType = "Taxi type is required";
        }

        if (toggleOptions.didTravelByBus) {
            if (!formData.busPassengers) newErrors.busPassengers = "Number of passengers is required";
            if (!formData.busDistanceKm) newErrors.busDistanceKm = "Distance is required";
            if (!formData.busType) newErrors.busType = "Bus type is required";
        }

        if (toggleOptions.didTravelByTrain) {
            if (!formData.trainPassengers) newErrors.trainPassengers = "Number of passengers is required";
            if (!formData.trainDistanceKm) newErrors.trainDistanceKm = "Distance is required";
            if (!formData.trainType) newErrors.trainType = "Train type is required";
        }

        setErrors(newErrors);

        // Form is valid only if there are no field errors
        // Note: At least one travel toggle is no longer required
        return Object.keys(newErrors).length === 0;
    };
    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isView) return;

        // Validate form
        const isValid = validate();
        if (!isValid) {
            // Scroll to error for better UX
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Rest of your submit logic...
        const userId = localStorage.getItem("userId");
        if (!userId) {
            toast.error("User not found. Please log in again.");
            return;
        }

        const fuelType = formData.fuelType?.value;
        const fuelName = formData.fuel?.value;
        const inputValue = Number(formData.totalFuelConsumption);
        const inputUnit = formData.fuelConsumptionUnit?.value;
        const electricityValue = Number(formData.totalGrossElectricityPurchased);
        const electricityUnit = formData.unit?.value;

        const emission = calculateFuelAndEnergy({
            fuelType,
            fuel: fuelName,
            totalFuelConsumption: inputValue,
            fuelConsumptionUnit: inputUnit,
            totalGrossElectricityPurchased: electricityValue,
            unit: electricityUnit,
            airPassengers: Number(formData.airPassengers),
            airDistanceKm: Number(formData.airDistanceKm),
            airTravelClass: formData.airTravelClass,
            airFlightType: formData.airFlightType,
            taxiPassengers: Number(formData.taxiPassengers),
            taxiDistanceKm: Number(formData.taxiDistanceKm),
            taxiType: formData.taxiType,
            busPassengers: Number(formData.busPassengers),
            busDistanceKm: Number(formData.busDistanceKm),
            busType: formData.busType,
            trainPassengers: Number(formData.trainPassengers),
            trainDistanceKm: Number(formData.trainDistanceKm),
            trainType: formData.trainType,
        });
        const handleEmptyValue = (value) => {
            // If value is empty string, return empty string instead of null
            if (value === "" || value === null || value === undefined) {
                return ""; // Send empty string instead of null
            }
            // If value is 0 (as string or number), return 0
            if (value === 0 || value === "0") {
                return 0;
            }
            // Try to convert to number, but only if it's a valid number
            const num = Number(value);
            return isNaN(num) ? "" : num; // Return empty string for invalid numbers
        };

        // Prepare payload
        const payload = {
            buildingId: formData.buildingId?.value,
            stakeholder: formData.stakeholder?.value,
            fuelType,
            fuel: fuelName,
            // totalFuelConsumption: inputValue,
            totalFuelConsumption: formData.totalFuelConsumption === "" ? null : Number(formData.totalFuelConsumption),
            fuelConsumptionUnit: inputUnit,
            // totalGrossElectricityPurchased: electricityValue,
            totalGrossElectricityPurchased: formData.totalGrossElectricityPurchased === "" ? null : handleEmptyValue(formData.totalGrossElectricityPurchased),
            unit: electricityUnit,
            qualityControl: formData.qualityControl?.value,
            remarks: capitalizeFirstLetter(formData.remarks),
            calculatedEmissionKgCo2e: formatEmission(emission.totalEmissions_KgCo2e),
            calculatedEmissionTCo2e: formatEmission(emission.totalEmissions_TCo2e),
            didTravelByAir: toggleOptions.didTravelByAir,
            didTravelByTaxi: toggleOptions.didTravelByTaxi,
            didTravelByBus: toggleOptions.didTravelByBus,
            didTravelByTrain: toggleOptions.didTravelByTrain,
        };
        Object.keys(toggleOptions).forEach((key) => {
            if (!toggleOptions[key]) return;

            travelFields[key].forEach((field) => {
                const value = formData[field];
                if (value && typeof value === "object" && "value" in value) {
                    payload[field] = value.value; // select value
                } else {
                    payload[field] = value !== "" ? value : null; // numbers
                }
            });
        });
        // Include travel fields if toggled
        Object.keys(toggleOptions).forEach((key) => {
            if (!toggleOptions[key]) return;

            travelFields[key].forEach((field) => {
                const value = formData[field];
                if (value && typeof value === "object" && "value" in value) {
                    payload[field] = value.value; // keep select values
                } else {
                    payload[field] = value !== "" ? value : null; // keep numbers
                }
            });
        });
        try {
            setLoading(true);
            if (isEdit) {
                await axios.put(
                    `${process.env.REACT_APP_BASE_URL}/Fuel-And-Energy/update/${id}`,
                    payload,
                    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
                );
                toast.success("Record updated successfully!");
            } else {
                await axios.post(
                    `${process.env.REACT_APP_BASE_URL}/Fuel-And-Energy/Create`,
                    payload,
                    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
                );
                toast.success("Record added successfully!");
            }
            navigate(-1);
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div>
            <Card title={`${isView ? "View" : isEdit ? "Edit" : "Add"} Fuel and Energy Related Activity Record`}>
                <div className="text-slate-700 leading-relaxed mb-2 bg-gray-100 rounded-lg border-l-4 border-primary-400 p-2 pl-4 m-4">
                    <p className="text-gray-700">
                        This category includes emissions related to the production of fuels and energy purchased and consumed by the reporting company in the reporting year that are not included in scope 1 or scope 2.</p>
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
                                <label className="field-label">Site / Building Name <span className="text-red-500">*</span></label>
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
                                <label className="field-label">Stakeholder / Department <span className="text-red-500">*</span></label>
                                <CustomSelect
                                    name="stakeholder"
                                    options={stakeholderOptions}
                                    value={formData.stakeholder}
                                    onChange={(value) => handleSelectChange("stakeholder", value)}
                                    placeholder="Select Stakeholder / Department"
                                    isDisabled={isView}
                                />
                                {errors.stakeholder && <p className="text-red-500 text-sm mt-2">{errors.stakeholder}</p>}
                            </div>
                        </div>
                        {/* Purchase Category and Fuel */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="field-label">Fuel Types <span className="text-red-500">*</span></label>
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
                                <label className="field-label">Fuel Name <span className="text-red-500">*</span></label>
                                <CustomSelect
                                    name="fuel"
                                    options={fuel}
                                    value={formData.fuel}
                                    onChange={(value) => handleSelectChange("fuel", value)}
                                    placeholder="Select Fuel Name"
                                    isDisabled={isView}
                                />
                                {errors.fuel && <p className="text-red-500 text-sm mt-2">{errors.fuel}</p>}
                            </div>
                        </div>
                        {/* Amount Spent and Unit */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="field-label">Total Fuel Consumption </label>
                                <InputGroup
                                    type="number"
                                    name="totalFuelConsumption"
                                    onWheel={handleNumberInputWheel}
                                    value={formData.totalFuelConsumption ?? ""}
                                    onChange={(e) => {
                                        handleInputChange(e)
                                        handleSelectChange("totalFuelConsumption", e.target.value)
                                    }}
                                    placeholder="Enter Value"
                                    className="border-[2px] w-full h-10 p-2 rounded-md"
                                    disabled={isView}
                                />
                                {errors.totalFuelConsumption && <p className="text-red-500 text-sm mt-2">{errors.totalFuelConsumption}</p>}
                            </div>

                            <div>
                                <label className="field-label">Fuel Consumption Unit </label>
                                <CustomSelect
                                    name="fuelConsumptionUnit"
                                    options={fuelUnitOptions}
                                    value={formData.fuelConsumptionUnit}
                                    onChange={(value) => handleSelectChange("fuelConsumptionUnit", value)}
                                    isDisabled={!formData.fuel || isView}
                                    disableCapitalize={true}
                                    placeholder="Select Unit"
                                />
                                {errors.fuelConsumptionUnit && <p className="text-red-500 text-sm mt-2">{errors.fuelConsumptionUnit}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="field-label">Total Purchased Electricity (Grid / Supplier Specific / PPA) </label>
                                <InputGroup
                                    type="number"
                                    name="totalGrossElectricityPurchased"
                                    onWheel={handleNumberInputWheel}
                                    value={formData.totalGrossElectricityPurchased ?? ""}
                                    onChange={handleInputChange}
                                    placeholder="Enter Value"
                                    className="border-[2px] w-full h-10 p-2 rounded-md"
                                    disabled={isView}
                                />
                                {errors.totalGrossElectricityPurchased && <p className="text-red-500 text-sm mt-2">{errors.totalGrossElectricityPurchased}</p>}
                            </div>

                            <div>
                                <label className="field-label">Unit</label>
                                <CustomSelect
                                    name="unit"
                                    options={units}
                                    value={formData.unit}
                                    onChange={(value) => handleSelectChange("unit", value)}
                                    isDisabled={isView}
                                    disableCapitalize={true}
                                    placeholder="Select Unit"
                                />
                                {errors.unit && <p className="text-red-500 text-sm mt-2">{errors.unit}</p>}
                            </div>
                        </div>
                        {/* Quality Control */}
                        <div>
                            <label className="field-label">Quality Control <span className="text-red-500">*</span></label>
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
                            <label className="field-label">Remarks</label>
                            <InputGroup
                                type="textarea"
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="Enter Remarks"
                                className="border-[2px] border-gray-400 rounded-md"
                                disabled={isView}
                            />
                        </div>
                        {/* 
                        {showToggleError && !isView && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm text-red-700">
                                            Please select at least one travel option below.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="ml-auto pl-3 -mx-1.5 -my-1.5"
                                        onClick={() => setShowToggleError(false)}
                                    >
                                        <span className="sr-only">Dismiss</span>
                                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )} */}

                        {/* Business Travel Section */}
                        <div className="col-span-full border-t pt-6">
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Business Travel Details</h3>

                            {/* Air Travel */}
                            <div className="border-t pt-6 pb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={toggleOptions.didTravelByAir}
                                            onChange={() => handleToggleChange("didTravelByAir")}
                                            className="sr-only peer"
                                            disabled={isView}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-900 rounded-full
                    peer peer-checked:after:translate-x-[100%] peer-checked:after:border-white
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white
                    after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                    peer-checked:bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]"></div>
                                    </label>
                                    <span className="text-sm font-medium">
                                        Did you have any business travel by air during the reporting period?
                                    </span>
                                </div>

                                {toggleOptions.didTravelByAir && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-8 mt-4">
                                        <div>
                                            <label className="field-label">Number of Passengers <span className="text-red-500">*</span></label>
                                            <InputGroup
                                                type="number"
                                                name="airPassengers"
                                                onWheel={handleNumberInputWheel}
                                                value={formData.airPassengers ?? ""}
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
                                            <label className="field-label">Distance Travelled (km) <span className="text-red-500">*</span></label>
                                            <InputGroup
                                                type="number"
                                                name="airDistanceKm"
                                                onWheel={handleNumberInputWheel}
                                                value={formData.airDistanceKm ?? ""}
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
                                            <label className="field-label">Flight Type <span className="text-red-500">*</span></label>
                                            <CustomSelect
                                                name="airFlightType"
                                                options={AIR_FLIGHT_TYPES}
                                                value={formData.airFlightType}
                                                onChange={(value) => {
                                                    handleSelectChange("airFlightType", value);
                                                    handleSelectChange("airTravelClass", null); // reset class on type change
                                                }}
                                                placeholder="Select Flight Type"
                                                isDisabled={isView}
                                            />
                                            {errors.airFlightType && (
                                                <p className="text-red-500 text-sm mt-1">{errors.airFlightType}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="field-label">Travel Class <span className="text-red-500">*</span></label>
                                            <CustomSelect
                                                name="airTravelClass"
                                                options={
                                                    formData.airFlightType?.value
                                                        ? AIR_TRAVEL_OPTIONS[formData.airFlightType.value]
                                                        : []
                                                }
                                                value={formData.airTravelClass}
                                                onChange={(value) => handleSelectChange("airTravelClass", value)}
                                                placeholder={
                                                    formData.airFlightType
                                                        ? "Select Travel Class"
                                                        : "Select Flight Type First"
                                                }
                                                isDisabled={isView || !formData.airFlightType}
                                            />
                                            {errors.airTravelClass && (
                                                <p className="text-red-500 text-sm mt-1">{errors.airTravelClass}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Taxi Travel */}
                            <div className="border-t pt-6 pb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={toggleOptions.didTravelByTaxi}
                                            onChange={() => handleToggleChange("didTravelByTaxi")}
                                            className="sr-only peer"
                                            disabled={isView}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-900 rounded-full
                    peer peer-checked:after:translate-x-[100%] peer-checked:after:border-white
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white
                    after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                    peer-checked:bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]"></div>
                                    </label>
                                    <span className="text-sm font-medium">
                                        Did you have any business travel by taxi during the reporting period?
                                    </span>
                                </div>

                                {toggleOptions.didTravelByTaxi && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-8 mt-4">
                                        <div>
                                            <label className="field-label">Number of Passengers <span className="text-red-500">*</span></label>
                                            <InputGroup
                                                type="number"
                                                name="taxiPassengers"
                                                onWheel={handleNumberInputWheel}
                                                value={formData.taxiPassengers ?? ""}
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
                                            <label className="field-label">Distance Travelled (km) <span className="text-red-500">*</span></label>
                                            <InputGroup
                                                type="number"
                                                name="taxiDistanceKm"
                                                onWheel={handleNumberInputWheel}
                                                value={formData.taxiDistanceKm ?? ""}
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
                                            <label className="field-label">Taxi Type <span className="text-red-500">*</span></label>
                                            <CustomSelect
                                                name="taxiType"
                                                options={TAXI_TYPES}
                                                value={formData.taxiType}
                                                onChange={(value) => handleSelectChange("taxiType", value)}
                                                placeholder="Select Taxi type"
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
                            <div className="border-t pt-6 pb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={toggleOptions.didTravelByBus}
                                            onChange={() => handleToggleChange("didTravelByBus")}
                                            className="sr-only peer"
                                            disabled={isView}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-900 rounded-full
                    peer peer-checked:after:translate-x-[100%] peer-checked:after:border-white
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white
                    after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                    peer-checked:bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]"></div>
                                    </label>
                                    <span className="text-sm font-medium">
                                        Did you have any business travel by bus during the reporting period?
                                    </span>
                                </div>

                                {toggleOptions.didTravelByBus && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-8 mt-4">
                                        <div>
                                            <label className="field-label">Number of Passengers <span className="text-red-500">*</span></label>
                                            <InputGroup
                                                type="number"
                                                name="busPassengers"
                                                onWheel={handleNumberInputWheel}
                                                value={formData.busPassengers ?? ""}
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
                                            <label className="field-label">Distance Travelled (km) <span className="text-red-500">*</span></label>
                                            <InputGroup
                                                type="number"
                                                name="busDistanceKm"
                                                onWheel={handleNumberInputWheel}
                                                value={formData.busDistanceKm ?? ""}
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
                                            <label className="field-label">Bus Type <span className="text-red-500">*</span></label>
                                            <CustomSelect
                                                name="busType"
                                                options={BUS_TYPES}
                                                value={formData.busType}
                                                onChange={(value) => handleSelectChange("busType", value)}
                                                placeholder="Select Bus Type"
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
                            <div className="border-t pt-6 pb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={toggleOptions.didTravelByTrain}
                                            onChange={() => handleToggleChange("didTravelByTrain")}
                                            className="sr-only peer"
                                            disabled={isView}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-900 rounded-full
                    peer peer-checked:after:translate-x-[100%] peer-checked:after:border-white
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white
                    after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                    peer-checked:bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]"></div>
                                    </label>
                                    <span className="text-sm font-medium">
                                        Did you have any business travel by train during the reporting period?
                                    </span>
                                </div>

                                {toggleOptions.didTravelByTrain && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-8 mt-4">
                                        <div>
                                            <label className="field-label">Number of Passengers <span className="text-red-500">*</span></label>
                                            <InputGroup
                                                type="number"
                                                name="trainPassengers"
                                                onWheel={handleNumberInputWheel}
                                                value={formData.trainPassengers ?? ""}
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
                                            <label className="field-label">Distance Travelled (km) <span className="text-red-500">*</span></label>
                                            <InputGroup
                                                type="number"
                                                name="trainDistanceKm"
                                                onWheel={handleNumberInputWheel}
                                                value={formData.trainDistanceKm ?? ""}
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
                                            <label className="field-label">Train Type <span className="text-red-500">*</span></label>
                                            <CustomSelect
                                                name="trainType"
                                                options={TRAIN_TYPES}
                                                value={formData.trainType}
                                                onChange={(value) => handleSelectChange("trainType", value)}
                                                placeholder="Select Train Type"
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