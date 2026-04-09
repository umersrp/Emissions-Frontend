import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import Textarea from '@/components/ui/Textarea';
import { toast } from 'react-toastify';
import axios from 'axios';
import Datepicker from "react-tailwindcss-datepicker";
import { departmentOptions, transportationOptions, modeOptions } from '@/constant/scope3/options';
import InputGroup from '@/components/ui/InputGroup';
import CustomSelect from '@/components/ui/Select';
import ToggleButton from '@/components/ui/ToggleButton';
import { qualityControlOptions } from '@/constant/scope1/options';
import { carTypeOptions, STANDARD_CAR_TYPES, PREMIUM_CAR_TYPES, STANDARD_FUEL_TYPES, PREMIUM_FUEL_TYPES } from '@/constant/scope3/employeeCommuting'

// UK Government GHG Conversion Factors (2025)
const EMISSION_FACTORS = {
    cars: {
        "Small car - Petrol/LPG/CNG - up to 1.4-litre engine. Diesel - up to a 1.7-litre engine. Others - vehicles models of a similar size (i.e. market segment A or B)": {
            Diesel: 0.14340, Petrol: 0.14308, Hybrid: 0.11413, CNG: 0.18800, LPG: 0.21260, Unknown: 0.14322, "Plug-in Hybrid Electric Vehicle": 0.05669, "Battery Electric Vehicle": 0.03688
        },
        "Medium car - Petrol/LPG/CNG - from 1.4-litre to 2.0-litre engine. Diesel - from 1.7-litre to 2.0-litre engine. Others - vehicles models of a similar size (i.e. generally market segment C)": {
            Diesel: 0.17174, Petrol: 0.17474, Hybrid: 0.11724, CNG: 0.15504, LPG: 0.17427, Unknown: 0.17322, "Plug-in Hybrid Electric Vehicle": 0.08820, "Battery Electric Vehicle": 0.03882
        },
        "Large car - Petrol/LPG/CNG - 2.0-litre engine (+) . Diesel - 2.0-litre engine (+). Others - vehicles models of a similar size (i.e. generally market segment D and above)": {
            Diesel: 0.21007, Petrol: 0.26828, Hybrid: 0.15650, CNG: 0.23722, LPG: 0.26771, Unknown: 0.22678, "Plug-in Hybrid Electric Vehicle": 0.11430, "Battery Electric Vehicle": 0.04205
        },
        "Average car - Unknown engine size.": {
            Diesel: 0.17304, Petrol: 0.16272, Hybrid: 0.12825, CNG: 0.17414, LPG: 0.19599, Unknown: 0.16725, "Plug-in Hybrid Electric Vehicle": 0.10461, "Battery Electric Vehicle": 0.04047
        },
        "Executive - Large Executive or E-Segment Passenger Cars (2000 cc - 3500+ cc)": {
            Diesel: 0.17088, Petrol: 0.20073, Unknown: 0.17846, "Plug-in Hybrid Electric Vehicle": 0.09133, "Battery Electric Vehicle": 0.03702
        },
        "Luxury - Full size Luxury or F-Segment Premium Passenger Cars (3000 cc - 6000 cc)": {
            Diesel: 0.20632, Petrol: 0.30752, Unknown: 0.25196, "Plug-in Hybrid Electric Vehicle": 0.12510, "Battery Electric Vehicle": 0.04902
        },
        "Sports - High Performance - High Speed Vehicles ( 2000 cc - 4000 cc+)": {
            Diesel: 0.17323, Petrol: 0.23396, Unknown: 0.22400, "Plug-in Hybrid Electric Vehicle": 0.14904, "Battery Electric Vehicle": 0.06260
        },
        "Dual purpose 4X4 - SUVs 4 wheel Drive or All Wheel Drive (1500 cc - 6000 cc)": {
            Diesel: 0.19973, Petrol: 0.19219, Unknown: 0.19690, "Plug-in Hybrid Electric Vehicle": 0.11663, "Battery Electric Vehicle": 0.04228
        },
        "MPV - Multi-Purpose Vehicles / People Carriers (Highroof, Hiace,Suzuki APV, Vans etc.)  - Passenger or Transport Vehicle (1200 cc - 2000 cc)": {
            Diesel: 0.18072, Petrol: 0.17903, Unknown: 0.18030, "Plug-in Hybrid Electric Vehicle": 0.10193, "Battery Electric Vehicle": 0.05202
        }
    },
    motorbikes: {
        "Small": 0.08319, "Medium": 0.10108, "Large": 0.13252, "Average": 0.11367
    },
    taxis: {
        "Regular taxi": 0.14861, "Business class taxi": 0.20402
    },
    buses: {
        "Green Line Bus": 0.02776, "Local bus": 0.12525, "Intercity Bus (Non A.C)": 0.06875, "Intercity Bus (A.C)": 0.10385
    },
    trains: {
        "National Rail": 0.03546, "Subway (underground)": 0.02780, "Metro": 0.02860, "Green Line Train": 0.00446
    }
};
const WFH_EMISSION_FACTOR = 0.33378;

const calculateEmissions = (data) => {
    let totalEmissionsKg = 0;
    let totalDistance = 0;
    let totalPassengers = 0;
    const emissionDetails = [];

    console.log('=== STARTING EMISSION CALCULATION FOR ALL MODES ===');

    // Calculate Motorbike emissions
    if (data.commuteByMotorbike) {
        let individualDistance = Number(data.motorbikeDistance) || 0;
        let carpoolDistance = 0;
        let passengers = 1;
        const motorbikeType = data.motorbikeType || "Average";
        let factor = EMISSION_FACTORS.motorbikes[motorbikeType] || EMISSION_FACTORS.motorbikes["Average"];
        
        let individualEmissions = individualDistance * factor;
        let totalMotorbikeEmissions = individualEmissions;
        let motorbikeTotalDistance = individualDistance;
        
        console.log('=== EMISSION CALCULATION - MOTORBIKE ===');
        console.log('Motorbike Type:', motorbikeType);
        console.log('Emission Factor:', factor, 'kg CO2e/km');
        console.log('Individual Distance:', individualDistance, 'km');
        console.log('Individual Emissions:', individualEmissions, 'kg CO2e');
        
        // Check if mode is 'both' and carpool distance exists
        if (data.motorbikeMode === 'both' && data.motorbikeDistanceCarpool) {
            carpoolDistance = Number(data.motorbikeDistanceCarpool) || 0;
            let carpoolEmissions = carpoolDistance * factor;
            totalMotorbikeEmissions += carpoolEmissions;
            motorbikeTotalDistance += carpoolDistance;
            
            console.log('Carpool Distance:', carpoolDistance, 'km');
            console.log('Carpool Emissions:', carpoolEmissions, 'kg CO2e');
            console.log('Total Motorbike Emissions (Individual + Carpool):', totalMotorbikeEmissions, 'kg CO2e');
        }
        
        console.log('Total Motorbike Distance:', motorbikeTotalDistance, 'km');
        
        totalEmissionsKg += totalMotorbikeEmissions;
        totalDistance += motorbikeTotalDistance;
        totalPassengers += passengers;
        emissionDetails.push({
            mode: 'Motorbike',
            modeType: data.motorbikeMode === 'both' ? 'Individual + Carpool' : 'Individual',
            individualDistance,
            carpoolDistance,
            totalDistance: motorbikeTotalDistance,
            factor,
            emissions: totalMotorbikeEmissions
        });
    }

    // Calculate Car emissions
    if (data.commuteByCar) {
        let individualDistance = Number(data.carDistance) || 0;
        let carpoolDistance = 0;
        let passengers = data.carryOthersCar ? (Number(data.personsCarriedCar || 0) + 1) : 1;
        const carType = data.carType;
        const fuelType = data.carFuelType || "Unknown";
        let baseFactor = EMISSION_FACTORS.cars[carType]?.[fuelType];
        let factor = baseFactor;
        
        let individualEmissions = individualDistance * factor;
        let totalCarEmissions = individualEmissions;
        let carTotalDistance = individualDistance;
        
        console.log('=== EMISSION CALCULATION - CAR ===');
        console.log('Car Type:', carType);
        console.log('Fuel Type:', fuelType);
        console.log('Emission Factor:', factor, 'kg CO2e/km');
        console.log('Carrying Others:', data.carryOthersCar);
        console.log('Persons Carried:', data.personsCarriedCar || 0);
        console.log('Total Passengers (including driver):', passengers);
        console.log('Individual Distance:', individualDistance, 'km');
        console.log('Individual Emissions:', individualEmissions, 'kg CO2e');
        
        // Check if mode is 'both' and carpool distance exists
        if (data.carMode === 'both' && data.carDistanceCarpool) {
            carpoolDistance = Number(data.carDistanceCarpool) || 0;
            let carpoolEmissions = carpoolDistance * factor;
            totalCarEmissions += carpoolEmissions;
            carTotalDistance += carpoolDistance;
            
            console.log('Carpool Distance:', carpoolDistance, 'km');
            console.log('Carpool Emissions:', carpoolEmissions, 'kg CO2e');
            console.log('Total Car Emissions (Individual + Carpool):', totalCarEmissions, 'kg CO2e');
        }
        
        console.log('Total Car Distance:', carTotalDistance, 'km');
        
        totalEmissionsKg += totalCarEmissions;
        totalDistance += carTotalDistance;
        totalPassengers += passengers;
        emissionDetails.push({
            mode: 'Car',
            modeType: data.carMode === 'both' ? 'Individual + Carpool' : 'Individual',
            individualDistance,
            carpoolDistance,
            totalDistance: carTotalDistance,
            passengers,
            factor,
            emissions: totalCarEmissions
        });
    }

    // Calculate Taxi emissions
    if (data.commuteByTaxi) {
        let individualDistance = Number(data.taxiDistance) || 0;
        let carpoolDistance = 0;
        let passengers = data.travelWithOthersTaxi ? Number(data.personsTravelWithTaxi || 1) : 1;
        const taxiType = data.taxiType;
        let baseFactor = EMISSION_FACTORS.taxis[taxiType];
        let factor = baseFactor;
        
        let individualEmissions = individualDistance * factor;
        let totalTaxiEmissions = individualEmissions;
        let taxiTotalDistance = individualDistance;
        
        console.log('=== EMISSION CALCULATION - TAXI ===');
        console.log('Taxi Type:', taxiType);
        console.log('Emission Factor:', factor, 'kg CO2e/km');
        console.log('Traveling With Others:', data.travelWithOthersTaxi);
        console.log('Persons Traveling With:', data.personsTravelWithTaxi || 0);
        console.log('Total Passengers (including self):', passengers);
        console.log('Individual Distance:', individualDistance, 'km');
        console.log('Individual Emissions:', individualEmissions, 'kg CO2e');
        
        // Check if mode is 'both' and carpool distance exists
        if (data.taxiMode === 'both' && data.taxiDistanceCarpool) {
            carpoolDistance = Number(data.taxiDistanceCarpool) || 0;
            let carpoolEmissions = carpoolDistance * factor;
            totalTaxiEmissions += carpoolEmissions;
            taxiTotalDistance += carpoolDistance;
            
            console.log('Carpool Distance:', carpoolDistance, 'km');
            console.log('Carpool Emissions:', carpoolEmissions, 'kg CO2e');
            console.log('Total Taxi Emissions (Individual + Carpool):', totalTaxiEmissions, 'kg CO2e');
        }
        
        console.log('Total Taxi Distance:', taxiTotalDistance, 'km');
        
        totalEmissionsKg += totalTaxiEmissions;
        totalDistance += taxiTotalDistance;
        totalPassengers += passengers;
        emissionDetails.push({
            mode: 'Taxi',
            modeType: data.taxiMode === 'both' ? 'Individual + Carpool' : 'Individual',
            individualDistance,
            carpoolDistance,
            totalDistance: taxiTotalDistance,
            passengers,
            factor,
            emissions: totalTaxiEmissions
        });
    }

    // Calculate Bus emissions
    if (data.commuteByBus) {
        let distance = Number(data.busDistance) || 0;
        let passengers = 1;
        const busType = data.busType;
        let factor = EMISSION_FACTORS.buses[busType];
        let emissions = distance * factor;
        
        console.log('=== EMISSION CALCULATION - BUS ===');
        console.log('Bus Type:', busType);
        console.log('Distance:', distance, 'km');
        console.log('Passengers:', passengers);
        console.log('Emission Factor:', factor, 'kg CO2e/km');
        console.log('Emissions:', emissions, 'kg CO2e');
        
        totalEmissionsKg += emissions;
        totalDistance += distance;
        totalPassengers += passengers;
        emissionDetails.push({
            mode: 'Bus',
            modeType: 'Individual',
            totalDistance: distance,
            passengers,
            factor,
            emissions
        });
    }

    // Calculate Train emissions
    if (data.commuteByTrain) {
        let distance = Number(data.trainDistance) || 0;
        let passengers = 1;
        const trainType = data.trainType;
        let factor = EMISSION_FACTORS.trains[trainType];
        let emissions = distance * factor;
        
        console.log('=== EMISSION CALCULATION - TRAIN ===');
        console.log('Train Type:', trainType);
        console.log('Distance:', distance, 'km');
        console.log('Passengers:', passengers);
        console.log('Emission Factor:', factor, 'kg CO2e/km');
        console.log('Emissions:', emissions, 'kg CO2e');
        
        totalEmissionsKg += emissions;
        totalDistance += distance;
        totalPassengers += passengers;
        emissionDetails.push({
            mode: 'Train',
            modeType: 'Individual',
            totalDistance: distance,
            passengers,
            factor,
            emissions
        });
    }

    // Calculate Work From Home emissions
    if (data.workFromHome) {
        let fteWorkingHours = Number(data.fteWorkingHours) || 0;
        let factor = WFH_EMISSION_FACTOR;
        
        // Calculate emissions: FTE hours * emission factor
        let emissions = fteWorkingHours * factor;
        
        console.log('=== EMISSION CALCULATION - WORK FROM HOME ===');
        console.log('FTE Working Hours:', fteWorkingHours, 'hours');
        console.log('Emission Factor:', factor, 'kg CO2e per FTE hour');
        console.log('Emissions:', emissions, 'kg CO2e');
        
        totalEmissionsKg += emissions;
        // No distance added for Work From Home
        // No passengers added for Work From Home
        emissionDetails.push({
            mode: 'Work From Home',
            modeType: 'Individual',
            fteWorkingHours,
            factor,
            emissions
        });
    }

    const totalEmissionsTonnes = totalEmissionsKg / 1000;
    
    console.log('=== FINAL EMISSION CALCULATION SUMMARY ===');
    console.log('All Modes Calculated:', emissionDetails.map(d => `${d.mode} (${d.modeType})`).join(', '));
    console.log('Emissions Breakdown:');
    emissionDetails.forEach(detail => {
        if (detail.mode === 'Work From Home') {
            console.log(`  - Work From Home: ${detail.fteWorkingHours} FTE hours = ${detail.emissions.toFixed(4)} kg CO2e`);
        } else if (detail.carpoolDistance) {
            console.log(`  - ${detail.mode}: ${detail.individualDistance}km (individual) + ${detail.carpoolDistance}km (carpool) = ${detail.emissions.toFixed(4)} kg CO2e`);
        } else {
            console.log(`  - ${detail.mode}: ${detail.totalDistance}km = ${detail.emissions.toFixed(4)} kg CO2e`);
        }
    });
    console.log('Total Emissions:', totalEmissionsKg.toFixed(4), 'kg CO2e');
    console.log('Total Emissions:', totalEmissionsTonnes.toFixed(6), 'tonnes CO2e');
    console.log('===================================\n');
    
    return { 
        distance: totalDistance, 
        passengers: totalPassengers, 
        factor: totalEmissionsKg / (totalDistance || 1), 
        totalEmissionsKg, 
        totalEmissionsTonnes,
        emissionDetails 
    };
};
const ErrorMessage = ({ message }) => {
    if (!message) return null;

    return (
        <div className="mt-1 text-sm text-red-600">
            {message}
        </div>
    );
};

const EmployeeCommutingFormCarpool = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const urlFormId = queryParams.get('formId');
    const urlParticipantId = queryParams.get('participantId');
    const urlAdminToken = queryParams.get('adminToken');
    const [checkingSubmission, setCheckingSubmission] = useState(true);
    const navigate = useNavigate();

    // Current year for reporting
    const currentYear = new Date().getFullYear();
    const [reportingYear, setReportingYear] = useState(currentYear);
    const [errors, setErrors] = useState({});

    // Original form data from API
    const [originalFormData, setOriginalFormData] = useState(null);
    const [loadingForm, setLoadingForm] = useState(true);

    // Track which commute types the user is a passenger in
    const [userPassengerDetails, setUserPassengerDetails] = useState({
        transportTypes: [],
        details: {}
    });

    // Track when passenger details are loaded
    const [passengerDetailsLoaded, setPassengerDetailsLoaded] = useState(false);

    // Track all selected date ranges for validation
    const [selectedDateRanges, setSelectedDateRanges] = useState({
        motorbike: null,
        motorbikeCarpool: null,
        taxi: null,
        taxiCarpool: null,
        bus: null,
        train: null,
        car: null,
        carCarpool: null,
        workFromHome: null
    });

    // Form state - store objects for select values
    const [formData, setFormData] = useState({
        employeeName: '',
        employeeID: '',
        emailDocId: '',
        parentId:'',
        // Basic Information
        siteBuildingName: null,
        stakeholderDepartment: null,
        // Motorbike Commute
        commuteByMotorbike: false,
        motorbikeMode: '',
        motorbikeDistance: '',
        motorbikeType: null,
        carryOthersMotorbike: true,
        personsCarriedMotorbike: null,
        motorbikePassengerEmails: [''],
        motorbikePassengerUserIds: [''],
        travelWithOthersMotorbike: true,
        personsTravelWithMotorbike: null,
        motorbikeTravelPassengerEmails: [''],
        motorbikeTravelPassengerUserIds: [''],
        motorbikeDateRange: null,
        motorbikeCarpoolDateRange: null,
        // Taxi Commute
        commuteByTaxi: false,
        taxiMode: '',
        taxiPassengers: null,
        taxiDistance: '',
        taxiType: null,
        travelWithOthersTaxi: true,
        personsTravelWithTaxi: null,
        taxiPassengerEmails: [''],
        taxiPassengerUserIds: [''],
        taxiDateRange: null,
        taxiCarpoolDateRange: null,
        // Bus Commute
        commuteByBus: false,
        busDistance: '',
        busType: null,
        busDateRange: null,
        // Train Commute
        commuteByTrain: false,
        trainDistance: '',
        trainType: null,
        trainDateRange: null,
        // Car Commute
        commuteByCar: false,
        carMode: '',
        carDistance: '',
        carType: null,
        carFuelType: null,
        carryOthersCar: true,
        personsCarriedCar: null,
        carPassengerEmails: [''],
        carPassengerUserIds: [''],
        travelWithOthersCar: false,
        personsTravelWithCar: null,
        carTravelPassengerEmails: [''],
        carTravelPassengerUserIds: [''],
        carDateRange: null,
        carCarpoolDateRange: null,
        // Work From Home
        workFromHome: false,
        fteWorkingHours: '',
        workFromHomeDateRange: null,
        qualityControlRemarks: '',
        qualityControl: '',
        submittedByEmail: '',
    });

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [pooledEmailWarnings, setPooledEmailWarnings] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [buildingsLoading, setBuildingsLoading] = useState(true);

    // User data states
    const [userInfo, setUserInfo] = useState(null);
    const [userLoading, setUserLoading] = useState(true);
    const [companyData, setCompanyData] = useState(null);
    const [targetUserData, setTargetUserData] = useState(null);
    const [companyUsers, setCompanyUsers] = useState([]);
    const [companyUsersLoading, setCompanyUsersLoading] = useState(false);
    const [token, setToken] = useState('');

    // Year selection dropdown options
    const yearOptions = [
        { value: currentYear - 1, label: `${currentYear - 1}` },
        { value: currentYear, label: `${currentYear}` },
    ];

    // Helper function to convert date range to individual dates
    const dateRangeToDates = (dateRange) => {
        if (!dateRange || !dateRange.startDate || !dateRange.endDate) return [];
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        const dates = [];
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    };

    // Get the token from URL
    const getToken = () => {
        if (urlAdminToken) {
            localStorage.setItem('token', urlAdminToken);
            return urlAdminToken;
        } else {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                return storedToken;
            }
        }
        return null;
    };

    // Helper function to parse date range from various formats
    const parseDateRange = (dateRangeData) => {
        if (!dateRangeData) return null;
        
        // If it's already in the correct format with startDate and endDate
        if (dateRangeData.startDate && dateRangeData.endDate) {
            return {
                startDate: new Date(dateRangeData.startDate),
                endDate: new Date(dateRangeData.endDate)
            };
        }
        
        // If it's a string or other format, try to parse it
        try {
            // Check if it's a string representation of dates
            if (typeof dateRangeData === 'string') {
                // Try to parse as JSON first
                try {
                    const parsed = JSON.parse(dateRangeData);
                    if (parsed.startDate && parsed.endDate) {
                        return {
                            startDate: new Date(parsed.startDate),
                            endDate: new Date(parsed.endDate)
                        };
                    }
                } catch {
                    // Not JSON, continue to next check
                }
            }
            
            // If it's an array of dates
            if (Array.isArray(dateRangeData) && dateRangeData.length >= 2) {
                return {
                    startDate: new Date(dateRangeData[0]),
                    endDate: new Date(dateRangeData[dateRangeData.length - 1])
                };
            }
            
            // If it's a single date object with from/to
            if (dateRangeData.from && dateRangeData.to) {
                return {
                    startDate: new Date(dateRangeData.from),
                    endDate: new Date(dateRangeData.to)
                };
            }
            
            // If it's a string in format "YYYY-MM-DD to YYYY-MM-DD"
            if (typeof dateRangeData === 'string' && dateRangeData.includes('to')) {
                const parts = dateRangeData.split('to');
                if (parts.length === 2) {
                    return {
                        startDate: new Date(parts[0].trim()),
                        endDate: new Date(parts[1].trim())
                    };
                }
            }
        } catch (error) {
            console.error('Error parsing date range:', error);
        }
        
        return null;
    };

    // Function to decode JWT token and get user ID
    const getUserIdFromToken = (token) => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.id || payload.userId || payload.sub || payload._id;
        } catch (error) {
            console.error('Failed to decode token:', error);
            return null;
        }
    };

   // Fetch the original form data by ID
const fetchOriginalFormData = async (authToken) => {
    try {
        setLoadingForm(true);
        
        if (!urlFormId) {
            toast.error('Form ID is missing from URL');
            return;
        }

        const response = await axios.get(
            `${process.env.REACT_APP_BASE_URL}/employee-commute/Detail/${urlFormId}`,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        
        console.log('Original form data:', response.data);
        console.log('Motorbike date range:', response.data.data?.motorbikeDateRange);
        console.log('Car date range:', response.data.data?.carDateRange);
        console.log('Taxi date range:', response.data.data?.taxiDateRange);
        console.log('Motorbike passenger IDs:', response.data.data?.motorbikePassengerUserIds);
        console.log('Car passenger IDs:', response.data.data?.carPassengerUserIds);
        console.log('Taxi passenger IDs:', response.data.data?.taxiPassengerUserIds);

        if (response.data && response.data.data) {
            const formDataFromApi = response.data.data;
            setOriginalFormData(formDataFromApi);
            
            // ✅ SET emailDocId FROM API RESPONSE
            if (formDataFromApi.emailDocId) {
                setFormData(prev => ({
                    ...prev,
                    emailDocId: formDataFromApi.emailDocId
                }));
                console.log('Email Doc ID set from API:', formDataFromApi.emailDocId);
            }
            
            // Find which commute types the participant is a passenger in
            findUserAsPassenger(formDataFromApi, urlParticipantId);
            
            // Set reporting year from form data
            if (formDataFromApi.reportingYear) {
                setReportingYear(formDataFromApi.reportingYear);
            }
            
            return formDataFromApi;
        } else {
            toast.error('No form data received from server');
            return null;
        }
    } catch (error) {
        console.error('Error fetching form data:', error);
        toast.error('Failed to load form data. Please try again later.');
        return null;
    } finally {
        setLoadingForm(false);
    }
};

    // Function to find where the participant is a passenger
    const findUserAsPassenger = (formData, participantId) => {
        if (!formData || !participantId) return;

        const transportTypes = [];
        const details = {};

        // Check in motorbike carpool (carryOthers)
        if (formData.commuteByMotorbike && 
            (formData.motorbikeMode === 'carpool' || formData.motorbikeMode === 'both') && 
            formData.carryOthersMotorbike) {
            
            const passengerIds = formData.motorbikePassengerUserIds || [];
            const passengerIndex = passengerIds.findIndex(id => id === participantId);
            
            if (passengerIndex !== -1) {
                transportTypes.push('motorbike');
                details.motorbike = {
                    transportType: 'motorbike',
                    mode: 'carpool',
                    passengerIndex,
                    isDriverCarrying: true,
                    isTravelWith: false,
                    distanceField: 'motorbikeDistance',
                    dateRangeField: 'motorbikeDateRange'
                };
            }
        }

        // Check in motorbike travel (travelWithOthers)
        if (formData.commuteByMotorbike && 
            (formData.motorbikeMode === 'carpool' || formData.motorbikeMode === 'both') && 
            formData.travelWithOthersMotorbike) {
            
            const passengerIds = formData.motorbikeTravelPassengerUserIds || [];
            const passengerIndex = passengerIds.findIndex(id => id === participantId);
            
            if (passengerIndex !== -1 && !transportTypes.includes('motorbike')) {
                transportTypes.push('motorbike');
                details.motorbike = {
                    transportType: 'motorbike',
                    mode: 'carpool',
                    passengerIndex,
                    isDriverCarrying: false,
                    isTravelWith: true,
                    distanceField: 'motorbikeDistance',
                    dateRangeField: 'motorbikeDateRange'
                };
            }
        }

        // Check in car carpool (carryOthers)
        if (formData.commuteByCar && 
            (formData.carMode === 'carpool' || formData.carMode === 'both') && 
            formData.carryOthersCar) {
            
            const passengerIds = formData.carPassengerUserIds || [];
            const passengerIndex = passengerIds.findIndex(id => id === participantId);
            
            if (passengerIndex !== -1) {
                transportTypes.push('car');
                details.car = {
                    transportType: 'car',
                    mode: 'carpool',
                    passengerIndex,
                    isDriverCarrying: true,
                    isTravelWith: false,
                    distanceField: 'carDistance',
                    dateRangeField: 'carDateRange'
                };
            }
        }

        // Check in car travel (travelWithOthers)
        if (formData.commuteByCar && 
            (formData.carMode === 'carpool' || formData.carMode === 'both') && 
            formData.travelWithOthersCar) {
            
            const passengerIds = formData.carTravelPassengerUserIds || [];
            const passengerIndex = passengerIds.findIndex(id => id === participantId);
            
            if (passengerIndex !== -1 && !transportTypes.includes('car')) {
                transportTypes.push('car');
                details.car = {
                    transportType: 'car',
                    mode: 'carpool',
                    passengerIndex,
                    isDriverCarrying: false,
                    isTravelWith: true,
                    distanceField: 'carDistance',
                    dateRangeField: 'carDateRange'
                };
            }
        }

        // Check in taxi carpool
        if (formData.commuteByTaxi && 
            (formData.taxiMode === 'carpool' || formData.taxiMode === 'both') && 
            formData.travelWithOthersTaxi) {
            
            const passengerIds = formData.taxiPassengerUserIds || [];
            const passengerIndex = passengerIds.findIndex(id => id === participantId);
            
            if (passengerIndex !== -1) {
                transportTypes.push('taxi');
                details.taxi = {
                    transportType: 'taxi',
                    mode: 'carpool',
                    passengerIndex,
                    isDriverCarrying: false,
                    isTravelWith: true,
                    distanceField: 'taxiDistance',
                    dateRangeField: 'taxiDateRange'
                };
            }
        }

        if (transportTypes.length > 0) {
            setUserPassengerDetails({
                transportTypes,
                details
            });
            setPassengerDetailsLoaded(true);
            console.log('User is passenger in:', transportTypes);
            console.log('Passenger details:', details);
        } else {
            // If no match found, show error
            setPassengerDetailsLoaded(true);
            toast.warning('You are not listed as a passenger in any commute for this form.');
        }
    };

    // Initialize form with data from original form
    const initializeFormWithOriginalData = (originalData) => {
        if (!originalData) return;

        console.log('Initializing form with data:', originalData);
        console.log('User passenger details:', userPassengerDetails);

        // Parse all date ranges first
        const motorbikeDateRange = parseDateRange(originalData.motorbikeDateRange);
        const motorbikeCarpoolDateRange = parseDateRange(originalData.motorbikeCarpoolDateRange);
        const carDateRange = parseDateRange(originalData.carDateRange);
        const carCarpoolDateRange = parseDateRange(originalData.carCarpoolDateRange);
        const taxiDateRange = parseDateRange(originalData.taxiDateRange);
        const taxiCarpoolDateRange = parseDateRange(originalData.taxiCarpoolDateRange);
        const busDateRange = parseDateRange(originalData.busDateRange);
        const trainDateRange = parseDateRange(originalData.trainDateRange);
        const workFromHomeDateRange = parseDateRange(originalData.workFromHomeDateRange);

        const newFormData = {
            ...formData,
            employeeName: originalData.employeeName || '',
            employeeID: originalData.employeeID || '',
            siteBuildingName: originalData.siteBuildingName ? {
                value: originalData.siteBuildingName,
                label: originalData.siteBuildingName
            } : null,
            stakeholderDepartment: originalData.stakeholderDepartment ? {
                value: originalData.stakeholderDepartment,
                label: originalData.stakeholderDepartment
            } : null,
            
            // Set all parsed date ranges
            motorbikeDateRange: motorbikeDateRange,
            motorbikeCarpoolDateRange: motorbikeCarpoolDateRange,
            carDateRange: carDateRange,
            carCarpoolDateRange: carCarpoolDateRange,
            taxiDateRange: taxiDateRange,
            taxiCarpoolDateRange: taxiCarpoolDateRange,
            busDateRange: busDateRange,
            trainDateRange: trainDateRange,
            workFromHomeDateRange: workFromHomeDateRange,
        };

        // Enable all commute types where user is a passenger
        if (userPassengerDetails.transportTypes && userPassengerDetails.transportTypes.length > 0) {
            
            // Enable motorbike if user is passenger
            if (userPassengerDetails.transportTypes.includes('motorbike')) {
                const motorbikeDetails = userPassengerDetails.details.motorbike;
                newFormData.commuteByMotorbike = true;
                newFormData.motorbikeMode = motorbikeDetails.mode;
                
                // Copy motorbike type from original
                if (originalData.motorbikeType) {
                    newFormData.motorbikeType = {
                        value: originalData.motorbikeType,
                        label: originalData.motorbikeType
                    };
                }

                // Set the appropriate passenger fields based on whether user is in carry or travel
                if (motorbikeDetails.isDriverCarrying) {
                    newFormData.carryOthersMotorbike = true;
                    if (originalData.personsCarriedMotorbike) {
                        newFormData.personsCarriedMotorbike = {
                            value: originalData.personsCarriedMotorbike.toString(),
                            label: originalData.personsCarriedMotorbike.toString()
                        };
                    }
                } else if (motorbikeDetails.isTravelWith) {
                    newFormData.travelWithOthersMotorbike = true;
                    if (originalData.personsTravelWithMotorbike) {
                        newFormData.personsTravelWithMotorbike = {
                            value: originalData.personsTravelWithMotorbike.toString(),
                            label: originalData.personsTravelWithMotorbike.toString()
                        };
                    }
                }
            }
            
            // Enable car if user is passenger
            if (userPassengerDetails.transportTypes.includes('car')) {
                const carDetails = userPassengerDetails.details.car;
                newFormData.commuteByCar = true;
                newFormData.carMode = carDetails.mode;
                
                // Copy car type and fuel type from original
                if (originalData.carType) {
                    newFormData.carType = {
                        value: originalData.carType,
                        label: originalData.carType
                    };
                }
                
                if (originalData.carFuelType) {
                    newFormData.carFuelType = {
                        value: originalData.carFuelType,
                        label: originalData.carFuelType
                    };
                }

                // Set the appropriate passenger fields
                if (carDetails.isDriverCarrying) {
                    newFormData.carryOthersCar = true;
                    if (originalData.personsCarriedCar) {
                        newFormData.personsCarriedCar = {
                            value: originalData.personsCarriedCar.toString(),
                            label: originalData.personsCarriedCar.toString()
                        };
                    }
                } else if (carDetails.isTravelWith) {
                    newFormData.travelWithOthersCar = true;
                    if (originalData.personsTravelWithCar) {
                        newFormData.personsTravelWithCar = {
                            value: originalData.personsTravelWithCar.toString(),
                            label: originalData.personsTravelWithCar.toString()
                        };
                    }
                }
            }
            
            // Enable taxi if user is passenger
            if (userPassengerDetails.transportTypes.includes('taxi')) {
                const taxiDetails = userPassengerDetails.details.taxi;
                newFormData.commuteByTaxi = true;
                newFormData.taxiMode = taxiDetails.mode;
                
                // Copy taxi type from original
                if (originalData.taxiType) {
                    newFormData.taxiType = {
                        value: originalData.taxiType,
                        label: originalData.taxiType
                    };
                }

                if (originalData.taxiPassengers) {
                    newFormData.taxiPassengers = {
                        value: originalData.taxiPassengers.toString(),
                        label: originalData.taxiPassengers.toString()
                    };
                }

                // Set passenger fields
                newFormData.travelWithOthersTaxi = true;
                if (originalData.personsTravelWithTaxi) {
                    newFormData.personsTravelWithTaxi = {
                        value: originalData.personsTravelWithTaxi.toString(),
                        label: originalData.personsTravelWithTaxi.toString()
                    };
                }
            }
        }

        console.log('Setting new form data:', newFormData);
        setFormData(newFormData);
        
        // Update selected date ranges state
        setSelectedDateRanges({
            motorbike: motorbikeDateRange,
            motorbikeCarpool: motorbikeCarpoolDateRange,
            taxi: taxiDateRange,
            taxiCarpool: taxiCarpoolDateRange,
            bus: busDateRange,
            train: trainDateRange,
            car: carDateRange,
            carCarpool: carCarpoolDateRange,
            workFromHome: workFromHomeDateRange
        });
    };

    // Fetch buildings from API
    const fetchBuildings = async (authToken) => {
        try {
            setBuildingsLoading(true);

            if (!authToken) {
                toast.error('Authentication token is missing');
                setBuildingsLoading(false);
                return;
            }

            const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/building/Get-All-Buildings`,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data && response.data.data.buildings) {
                const buildingOptions = response.data.data.buildings.map(building => ({
                    value: building._id,
                    label: building.buildingName || building.name || 'Unnamed Building',
                    buildingData: building
                }));
                setBuildings(buildingOptions);
                return buildingOptions;
            } else {
                toast.error('No buildings data received from server');
                return [];
            }
        } catch (error) {
            console.error('Error fetching buildings:', error);
            toast.error('Failed to load buildings. Please try again later.');
            setBuildings([]);
            return [];
        } finally {
            setBuildingsLoading(false);
        }
    };

    // Fetch user data from API using participantId from URL
    const fetchUserData = async (authToken) => {
        try {
            setUserLoading(true);
            
            // Use urlParticipantId directly from the URL params
            if (!urlParticipantId) {
                toast.error('Participant ID is missing from URL');
                return;
            }

            // Fetch user data using the participantId from URL
            const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/auth/GetUsers/${urlParticipantId}`,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data && response.data.data) {
                const userData = response.data.data;
                setUserInfo(userData);
                setCompanyData(userData);

                // Auto-fill email field
                if (userData.email) {
                    setFormData(prev => ({
                        ...prev,
                        submittedByEmail: userData.email
                    }));
                }
                
                // Auto-fill department field
                if (userData.department) {
                    const userDept = departmentOptions.find(
                        dept => dept.value === userData.department || dept.label === userData.department
                    );
                    if (userDept) {
                        setFormData(prev => ({
                            ...prev,
                            stakeholderDepartment: userDept
                        }));
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            toast.error('Failed to load user data');
        } finally {
            setUserLoading(false);
        }
    };

    // Fetch company users from API
    const fetchCompanyUsers = async (authToken) => {
        try {
            setCompanyUsersLoading(true);

            const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/auth/GetCompanyUsers?limit=1000`,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data && response.data.data) {
                const currentUserId = getUserIdFromToken(authToken);

                const filteredUsers = response.data.data.users.filter(user => {
                    if (user._id === currentUserId) return false;
                    return user.email;
                }).map(user => ({
                    value: user._id,
                    label: user.name ? `${user.name} (${user.email})` : user.email,
                    email: user.email,
                    userData: user
                }));

                setCompanyUsers(filteredUsers);
                return filteredUsers;
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error fetching company users:', error);
            return [];
        } finally {
            setCompanyUsersLoading(false);
        }
    };

    // Fetch all data on component mount
    useEffect(() => {
        const currentToken = getToken();
        if (currentToken) {
            setToken(currentToken);
            
            // First fetch the original form data
            fetchOriginalFormData(currentToken).then((originalData) => {
                if (originalData) {
                    setOriginalFormData(originalData);
                }
            });

            // Fetch user data
            fetchUserData(currentToken);
            
            // Fetch buildings
            fetchBuildings(currentToken);
            
            // Fetch company users
            fetchCompanyUsers(currentToken);
        } else {
            toast.error('No authentication token found. Please access this page with a valid token.');
            setLoadingForm(false);
            setBuildingsLoading(false);
            setUserLoading(false);
            setCompanyUsersLoading(false);
        }
    }, [urlFormId, urlParticipantId, urlAdminToken]);

    // Initialize form after passenger details are loaded
    useEffect(() => {
        if (passengerDetailsLoaded && originalFormData) {
            console.log('Passenger details loaded, initializing form with:', userPassengerDetails);
            initializeFormWithOriginalData(originalFormData);
        }
    }, [passengerDetailsLoaded, originalFormData]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSelectChange = (field, selectedOption) => {
        if (selectedOption && selectedOption.target) {
            setFormData(prev => ({ ...prev, [field]: selectedOption.target.value }));
        } else {
            setFormData(prev => ({ ...prev, [field]: selectedOption }));
        }

        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleDateRangeChange = (transportType, value) => {
        const dateRangeField = `${transportType}DateRange`;
        if (errors[dateRangeField]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[dateRangeField];
                return newErrors;
            });
        }

        setFormData(prev => ({
            ...prev,
            [`${transportType}DateRange`]: value
        }));

        setSelectedDateRanges(prev => ({
            ...prev,
            [transportType]: value
        }));
    };

    const validateForm = () => {
        const errors = {};

        // Basic Information validation
        // if (!formData.stakeholderDepartment) errors.stakeholderDepartment = 'Stakeholder / Department is required';
        // if (!formData.qualityControl) errors.qualityControl = 'Quality Control is required';

        // Check if the user is a passenger in any commute
        if (!userPassengerDetails.transportTypes || userPassengerDetails.transportTypes.length === 0) {
            errors.noCommuteFound = 'No commute found where you are listed as a passenger';
            return errors;
        }

        // Validate each commute where user is a passenger
        if (userPassengerDetails.transportTypes.includes('motorbike')) {
            if (!formData.motorbikeDistance || formData.motorbikeDistance.trim() === '') {
                errors.motorbikeDistance = 'Your motorbike distance is required';
            }
            if (!formData.motorbikeDateRange || !formData.motorbikeDateRange.startDate || !formData.motorbikeDateRange.endDate) {
                errors.motorbikeDateRange = 'Please confirm the date range for motorbike commute';
            }
        }

        if (userPassengerDetails.transportTypes.includes('car')) {
            if (!formData.carDistance || formData.carDistance.trim() === '') {
                errors.carDistance = 'Your car distance is required';
            }
            if (!formData.carDateRange || !formData.carDateRange.startDate || !formData.carDateRange.endDate) {
                errors.carDateRange = 'Please confirm the date range for car commute';
            }
        }

        if (userPassengerDetails.transportTypes.includes('taxi')) {
            if (!formData.taxiDistance || formData.taxiDistance.trim() === '') {
                errors.taxiDistance = 'Your taxi distance is required';
            }
            if (!formData.taxiDateRange || !formData.taxiDateRange.startDate || !formData.taxiDateRange.endDate) {
                errors.taxiDateRange = 'Please confirm the date range for taxi commute';
            }
        }

        // Validate submitted by email
        if (!formData.submittedByEmail.trim()) {
            errors.submittedByEmail = 'Your email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.submittedByEmail)) {
            errors.submittedByEmail = 'Please enter a valid email address';
        }

        return errors;
    };

    const scrollToFirstError = (validationErrors) => {
        const errorKeyToSelector = {
            stakeholderDepartment: '#stakeholderDepartment',
            qualityControl: '#qualityControl',
            motorbikeDistance: '#motorbikeDistance',
            motorbikeDateRange: '#motorbikeDateRange',
            carDistance: '#carDistance',
            carDateRange: '#carDateRange',
            taxiDistance: '#taxiDistance',
            taxiDateRange: '#taxiDateRange',
            submittedByEmail: '#submittedByEmail',
        };

        const errorKeys = Object.keys(validationErrors);
        if (errorKeys.length === 0) return;

        let firstErrorSelector = null;
        for (let errorKey of errorKeys) {
            if (errorKeyToSelector[errorKey]) {
                firstErrorSelector = errorKeyToSelector[errorKey];
                break;
            }
        }

        if (firstErrorSelector) {
            const element = document.querySelector(firstErrorSelector);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
        }

        const formContainer = document.querySelector('.max-w-6xl');
        if (formContainer) {
            formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        toast.error('Please fill all required fields');
        setTimeout(() => scrollToFirstError(validationErrors), 100);
        return;
    }

    setLoading(true);

    try {
        const currentToken = getToken();
        if (!currentToken) {
            toast.error('Authentication token is missing. Please refresh the page.');
            setLoading(false);
            return;
        }

        // ============ STEP 1: CREATE PASSENGER SUBMISSION ============
        const passengerSubmissionData = {
            originalFormId: urlFormId,
            emailDocId: formData.emailDocId || originalFormData?.emailDocId || null,
            parentId: urlFormId, 
            participantId: urlParticipantId,
            employeeName: formData.employeeName || userInfo?.name || '',
            employeeID: formData.employeeID || userInfo?.employeeId || '',
            usersubmittedId: userInfo?._id || null,
            siteBuildingName: formData.siteBuildingName?.value || '',
            stakeholderDepartment: formData.stakeholderDepartment?.value || '',
            submittedByEmail: formData.submittedByEmail || '',
            reportingYear: reportingYear,
            qualityControlRemarks: formData.qualityControlRemarks || '',
            qualityControl: formData.qualityControl || '',
            submittedAt: new Date().toISOString(),
            commuteTypes: userPassengerDetails.transportTypes
            
        };

        // Add passenger's distance data
        if (userPassengerDetails.transportTypes.includes('motorbike')) {
            const motorbikeDetails = userPassengerDetails.details.motorbike;
            passengerSubmissionData.commuteByMotorbike = true;
            passengerSubmissionData.motorbikeMode = formData.motorbikeMode || 'carpool';
            passengerSubmissionData.motorbikeDistance = Number(formData.motorbikeDistance) || 0;
            passengerSubmissionData.motorbikeType = formData.motorbikeType?.value || originalFormData?.motorbikeType || '';
            
            if (formData.motorbikeDateRange) {
                passengerSubmissionData.motorbikeDates = dateRangeToDates(formData.motorbikeDateRange).map(date => date.toISOString());
                passengerSubmissionData.motorbikeDateRange = formData.motorbikeDateRange;
            }

            passengerSubmissionData.motorbikePassengerIndex = motorbikeDetails.passengerIndex;
            passengerSubmissionData.motorbikeIsDriverCarrying = motorbikeDetails.isDriverCarrying;
            passengerSubmissionData.motorbikeIsTravelWith = motorbikeDetails.isTravelWith;
        }

        if (userPassengerDetails.transportTypes.includes('car')) {
            const carDetails = userPassengerDetails.details.car;
            passengerSubmissionData.commuteByCar = true;
            passengerSubmissionData.carMode = formData.carMode || 'carpool';
            passengerSubmissionData.carDistance = Number(formData.carDistance) || 0;
            passengerSubmissionData.carType = formData.carType?.value || originalFormData?.carType || '';
            passengerSubmissionData.carFuelType = formData.carFuelType?.value || originalFormData?.carFuelType || '';
            
            if (formData.carDateRange) {
                passengerSubmissionData.carDates = dateRangeToDates(formData.carDateRange).map(date => date.toISOString());
                passengerSubmissionData.carDateRange = formData.carDateRange;
            }

            passengerSubmissionData.carPassengerIndex = carDetails.passengerIndex;
            passengerSubmissionData.carIsDriverCarrying = carDetails.isDriverCarrying;
            passengerSubmissionData.carIsTravelWith = carDetails.isTravelWith;
        }

        if (userPassengerDetails.transportTypes.includes('taxi')) {
            const taxiDetails = userPassengerDetails.details.taxi;
            passengerSubmissionData.commuteByTaxi = true;
            passengerSubmissionData.taxiMode = formData.taxiMode || 'carpool';
            passengerSubmissionData.taxiDistance = Number(formData.taxiDistance) || 0;
            passengerSubmissionData.taxiType = formData.taxiType?.value || originalFormData?.taxiType || '';
            
            if (formData.taxiDateRange) {
                passengerSubmissionData.taxiDates = dateRangeToDates(formData.taxiDateRange).map(date => date.toISOString());
                passengerSubmissionData.taxiDateRange = formData.taxiDateRange;
            }

            passengerSubmissionData.taxiPassengerIndex = taxiDetails.passengerIndex;
        }

        // Calculate emissions for passenger submission
        const passengerEmissions = calculateEmissions(passengerSubmissionData);
        passengerSubmissionData.calculatedEmissionKgCo2e = passengerEmissions.totalEmissionsKg;
        passengerSubmissionData.calculatedEmissionTCo2e = passengerEmissions.totalEmissionsTonnes;

        console.log('=== STEP 1: Creating passenger submission ===');
        console.log('Passenger submission data:', passengerSubmissionData);

        const passengerResponse = await axios.post(
            `${process.env.REACT_APP_BASE_URL}/employee-commute/Create`,
            passengerSubmissionData,
            {
                headers: {
                    Authorization: `Bearer ${currentToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (passengerResponse.status !== 200 && passengerResponse.status !== 201) {
            throw new Error('Failed to create passenger submission');
        }

        console.log('Passenger submission created successfully:', passengerResponse.data);

        // ============ STEP 2: UPDATE ORIGINAL DRIVER FORM ============
        
        // Get the current driver form data
        const driverFormResponse = await axios.get(
            `${process.env.REACT_APP_BASE_URL}/employee-commute/Detail/${urlFormId}`,
            {
                headers: {
                    Authorization: `Bearer ${currentToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const currentDriverData = driverFormResponse.data.data;
        console.log('Current driver data:', currentDriverData);
        console.log('Passenger entered distances:', {
            motorbikeDistance: Number(formData.motorbikeDistance) || 0,
            carDistance: Number(formData.carDistance) || 0,
            taxiDistance: Number(formData.taxiDistance) || 0
        });

        // Prepare update payload - handle both individual and carpool distances
        const updatePayload = {};
        const distancesToUpdate = [];

        const getNumericValue = (value) => Number(value) || 0;

        // ============ HANDLE MOTORBIKE ============
        if (userPassengerDetails.transportTypes.includes('motorbike')) {
            const passengerMotorbikeDistance = getNumericValue(formData.motorbikeDistance);
            const driverMotorbikeDistance = getNumericValue(currentDriverData.motorbikeDistance);
            const driverMotorbikeCarpoolDistance = getNumericValue(currentDriverData.motorbikeDistanceCarpool);
            
            // Check what mode the driver originally selected
            const driverMotorbikeMode = currentDriverData.motorbikeMode || 'individual';
            
            if (driverMotorbikeMode === 'both') {
                // Driver is in "both" mode - compare with carpool distance
                if (passengerMotorbikeDistance > driverMotorbikeCarpoolDistance) {
                    updatePayload.motorbikeDistanceCarpool = passengerMotorbikeDistance;
                    distancesToUpdate.push('Motorbike Carpool');
                    console.log(`✓ Motorbike carpool distance will be updated: ${driverMotorbikeCarpoolDistance} → ${passengerMotorbikeDistance}`);
                } else {
                    console.log(`✗ Motorbike carpool distance NOT updated: ${passengerMotorbikeDistance} is not higher than ${driverMotorbikeCarpoolDistance}`);
                }
            } else {
                // Driver is in "carpool" or "individual" mode - compare with regular distance
                if (passengerMotorbikeDistance > driverMotorbikeDistance) {
                    updatePayload.motorbikeDistance = passengerMotorbikeDistance;
                    distancesToUpdate.push('Motorbike');
                    console.log(`✓ Motorbike distance will be updated: ${driverMotorbikeDistance} → ${passengerMotorbikeDistance}`);
                } else {
                    console.log(`✗ Motorbike distance NOT updated: ${passengerMotorbikeDistance} is not higher than ${driverMotorbikeDistance}`);
                }
            }
        }

        // ============ HANDLE CAR ============
        if (userPassengerDetails.transportTypes.includes('car')) {
            const passengerCarDistance = getNumericValue(formData.carDistance);
            const driverCarDistance = getNumericValue(currentDriverData.carDistance);
            const driverCarCarpoolDistance = getNumericValue(currentDriverData.carDistanceCarpool);
            
            // Check what mode the driver originally selected
            const driverCarMode = currentDriverData.carMode || 'individual';
            
            if (driverCarMode === 'both') {
                // Driver is in "both" mode - compare with carpool distance
                if (passengerCarDistance > driverCarCarpoolDistance) {
                    updatePayload.carDistanceCarpool = passengerCarDistance;
                    distancesToUpdate.push('Car Carpool');
                    console.log(`✓ Car carpool distance will be updated: ${driverCarCarpoolDistance} → ${passengerCarDistance}`);
                } else {
                    console.log(`✗ Car carpool distance NOT updated: ${passengerCarDistance} is not higher than ${driverCarCarpoolDistance}`);
                }
            } else {
                // Driver is in "carpool" or "individual" mode - compare with regular distance
                if (passengerCarDistance > driverCarDistance) {
                    updatePayload.carDistance = passengerCarDistance;
                    distancesToUpdate.push('Car');
                    console.log(`✓ Car distance will be updated: ${driverCarDistance} → ${passengerCarDistance}`);
                } else {
                    console.log(`✗ Car distance NOT updated: ${passengerCarDistance} is not higher than ${driverCarDistance}`);
                }
            }
        }

        // ============ HANDLE TAXI ============
        if (userPassengerDetails.transportTypes.includes('taxi')) {
            const passengerTaxiDistance = getNumericValue(formData.taxiDistance);
            const driverTaxiDistance = getNumericValue(currentDriverData.taxiDistance);
            const driverTaxiCarpoolDistance = getNumericValue(currentDriverData.taxiDistanceCarpool);
            
            // Check what mode the driver originally selected
            const driverTaxiMode = currentDriverData.taxiMode || 'individual';
            
            if (driverTaxiMode === 'both') {
                // Driver is in "both" mode - compare with carpool distance
                if (passengerTaxiDistance > driverTaxiCarpoolDistance) {
                    updatePayload.taxiDistanceCarpool = passengerTaxiDistance;
                    distancesToUpdate.push('Taxi Carpool');
                    console.log(`✓ Taxi carpool distance will be updated: ${driverTaxiCarpoolDistance} → ${passengerTaxiDistance}`);
                } else {
                    console.log(`✗ Taxi carpool distance NOT updated: ${passengerTaxiDistance} is not higher than ${driverTaxiCarpoolDistance}`);
                }
            } else {
                // Driver is in "carpool" or "individual" mode - compare with regular distance
                if (passengerTaxiDistance > driverTaxiDistance) {
                    updatePayload.taxiDistance = passengerTaxiDistance;
                    distancesToUpdate.push('Taxi');
                    console.log(`✓ Taxi distance will be updated: ${driverTaxiDistance} → ${passengerTaxiDistance}`);
                } else {
                    console.log(`✗ Taxi distance NOT updated: ${passengerTaxiDistance} is not higher than ${driverTaxiDistance}`);
                }
            }
        }

        // If no distances were updated, skip update
        if (Object.keys(updatePayload).length === 0) {
            console.log('No distances were higher than current driver distances. Skipping driver form update.');
            toast.info('No distances were updated as all entered distances are lower than or equal to current values.');
        } else {
            console.log('Distances to update:', updatePayload);
            console.log('Updating:', distancesToUpdate.join(', '));
            
            // Calculate final distances for emission recalculation
            // For each mode, use updated value if available, otherwise keep current
            const finalMotorbikeDistance = updatePayload.motorbikeDistance !== undefined 
                ? updatePayload.motorbikeDistance 
                : getNumericValue(currentDriverData.motorbikeDistance);
            
            const finalMotorbikeCarpoolDistance = updatePayload.motorbikeDistanceCarpool !== undefined 
                ? updatePayload.motorbikeDistanceCarpool 
                : getNumericValue(currentDriverData.motorbikeDistanceCarpool);
            
            const finalCarDistance = updatePayload.carDistance !== undefined 
                ? updatePayload.carDistance 
                : getNumericValue(currentDriverData.carDistance);
            
            const finalCarCarpoolDistance = updatePayload.carDistanceCarpool !== undefined 
                ? updatePayload.carDistanceCarpool 
                : getNumericValue(currentDriverData.carDistanceCarpool);
            
            const finalTaxiDistance = updatePayload.taxiDistance !== undefined 
                ? updatePayload.taxiDistance 
                : getNumericValue(currentDriverData.taxiDistance);
            
            const finalTaxiCarpoolDistance = updatePayload.taxiDistanceCarpool !== undefined 
                ? updatePayload.taxiDistanceCarpool 
                : getNumericValue(currentDriverData.taxiDistanceCarpool);
            
            console.log('Final distances for emission calculation:', {
                motorbikeDistance: finalMotorbikeDistance,
                motorbikeDistanceCarpool: finalMotorbikeCarpoolDistance,
                carDistance: finalCarDistance,
                carDistanceCarpool: finalCarCarpoolDistance,
                taxiDistance: finalTaxiDistance,
                taxiDistanceCarpool: finalTaxiCarpoolDistance
            });
            
            // Create merged data object for emission calculation
            const emissionCalculationData = {
                ...currentDriverData,
                motorbikeDistance: finalMotorbikeDistance,
                motorbikeDistanceCarpool: finalMotorbikeCarpoolDistance,
                carDistance: finalCarDistance,
                carDistanceCarpool: finalCarCarpoolDistance,
                taxiDistance: finalTaxiDistance,
                taxiDistanceCarpool: finalTaxiCarpoolDistance,
                carryOthersCar: currentDriverData.carryOthersCar,
                personsCarriedCar: currentDriverData.personsCarriedCar,
                travelWithOthersTaxi: currentDriverData.travelWithOthersTaxi,
                personsTravelWithTaxi: currentDriverData.personsTravelWithTaxi,
            };
            
            console.log('=== RECALCULATING EMISSIONS FOR DRIVER ===');
            
            // Recalculate emissions with final distances
            const recalculatedEmissions = calculateEmissions(emissionCalculationData);
            
            // Add recalculated emissions to update payload
            updatePayload.calculatedEmissionKgCo2e = recalculatedEmissions.totalEmissionsKg;
            updatePayload.calculatedEmissionTCo2e = recalculatedEmissions.totalEmissionsTonnes;
            
            console.log('=== UPDATE SUMMARY ===');
            console.log('Updated distances:', distancesToUpdate.join(', '));
            console.log('Old Emissions (kg):', currentDriverData.calculatedEmissionKgCo2e);
            console.log('New Emissions (kg):', recalculatedEmissions.totalEmissionsKg);
            console.log('=====================');
            
            // Update driver form
            try {
                const updateResponse = await axios.put(
                    `${process.env.REACT_APP_BASE_URL}/employee-commute/Update/${urlFormId}`,
                    updatePayload,
                    {
                        headers: {
                            Authorization: `Bearer ${currentToken}`,
                            'Content-Type': 'application/json',
                        },
                        timeout: 30000,
                    }
                );
                console.log('Driver form updated successfully:', updateResponse.data);
                toast.success(`Updated ${distancesToUpdate.join(', ')} distance(s) (higher values) and recalculated emissions!`);
            } catch (updateError) {
                console.warn('Driver form update failed:', updateError.message);
                toast.warning('Passenger submission created, but driver form update failed');
            }
        }

        setSubmitted(true);
        toast.success('Your commute distances submitted successfully!');

        navigate('/formSubmittedSuccessfully', {
            state: {
                formType: 'employee-commuting-carpool',
                reportingYear: reportingYear,
                userInfo: userInfo,
                submissionTime: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Submission error:', error);
        if (error.response) {
            toast.error(`Server error: ${error.response.data?.message || error.response.status}`);
        } else if (error.request) {
            toast.error('Network error. Please check your connection.');
        } else {
            toast.error(`Error: ${error.message}`);
        }
    } finally {
        setLoading(false);
    }
};

    const renderCommuteSections = () => {
        if (!userPassengerDetails.transportTypes || userPassengerDetails.transportTypes.length === 0) {
            return (
                <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                    <p className="text-yellow-700">You are not listed as a passenger in any commute for this form.</p>
                </div>
            );
        }

        let commuteCounter = 1;

        return (
            <div className="space-y-6">
                {userPassengerDetails.transportTypes.includes('motorbike') && (
                    <div className="border rounded-lg p-6 bg-white shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">
                                Commute {commuteCounter++}
                            </span>
                            Motorbike Commute (You are a passenger)
                        </h3>
                        
                        <div className="space-y-6">
                            {/* Distance input */}
                            <div className="max-w-md" id="motorbikeDistance">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Distance Travelled*
                                </label>
                                <div className="grid grid-cols-[14fr_1fr]">
                                    <InputGroup
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        placeholder="e.g., 15.5"
                                        value={formData.motorbikeDistance}
                                        onChange={(e) => handleInputChange('motorbikeDistance', e.target.value)}
                                        className="input-field rounded-r-none w-full"
                                    />
                                    <div className="flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-100">
                                        km
                                    </div>
                                </div>
                                <ErrorMessage message={errors.motorbikeDistance} />
                                <p className="text-xs text-gray-500 mt-1">
                                    Please enter your portion of the commute distance
                                </p>
                            </div>

                            {/* Motorbike type (read-only from original) */}
                            {originalFormData?.motorbikeType && (
                                <div className="max-w-md">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Motorbike Type
                                    </label>
                                    <InputGroup
                                        type="text"
                                        value={originalFormData.motorbikeType}
                                        disabled
                                        className="input-field w-full bg-gray-50"
                                    />
                                </div>
                            )}

                            {/* Date range */}
                            <div className="mt-4" id="motorbikeDateRange">
                                {originalFormData?.motorbikeDateRange ? (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Commute Period
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Start Date</p>
                                                <p className="font-medium">
                                                    {new Date(originalFormData.motorbikeDateRange.startDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">End Date</p>
                                                <p className="font-medium">
                                                    {new Date(originalFormData.motorbikeDateRange.endDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Date Range *
                                        </label>
                                        <Datepicker
                                            value={formData.motorbikeDateRange}
                                            onChange={(value) => handleDateRangeChange('motorbike', value)}
                                            showShortcuts={true}
                                            primaryColor="blue"
                                            minDate={new Date(reportingYear, 0, 1)}
                                            maxDate={new Date(reportingYear, 11, 31)}
                                            configs={{
                                                shortcuts: {
                                                    fullYear: {
                                                        text: "Full Year ✓",
                                                        period: {
                                                            start: new Date(`${reportingYear}-01-01`),
                                                            end: new Date(`${reportingYear}-12-31`)
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                        <ErrorMessage message={errors.motorbikeDateRange} />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {userPassengerDetails.transportTypes.includes('car') && (
                    <div className="border rounded-lg p-6 bg-white shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">
                                Commute {commuteCounter++}
                            </span>
                            Car Commute (You are a passenger)
                        </h3>
                        
                        <div className="space-y-6">
                            {/* Distance input */}
                            <div className="max-w-md" id="carDistance">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Distance Travelled*
                                </label>
                                <div className="grid grid-cols-[14fr_1fr]">
                                    <InputGroup
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        placeholder="e.g., 18.5"
                                        value={formData.carDistance}
                                        onChange={(e) => handleInputChange('carDistance', e.target.value)}
                                        className="input-field rounded-r-none w-full"
                                    />
                                    <div className="flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-100">
                                        km
                                    </div>
                                </div>
                                <ErrorMessage message={errors.carDistance} />
                                <p className="text-xs text-gray-500 mt-1">
                                    Please enter your portion of the commute distance
                                </p>
                            </div>

                            {/* Car and fuel type (read-only from original) */}
                            {originalFormData?.carType && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Car Type
                                        </label>
                                        <InputGroup
                                            type="text"
                                            value={originalFormData.carType}
                                            disabled
                                            className="input-field w-full bg-gray-50"
                                        />
                                    </div>
                                    {originalFormData?.carFuelType && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Fuel Type
                                            </label>
                                            <InputGroup
                                                type="text"
                                                value={originalFormData.carFuelType}
                                                disabled
                                                className="input-field w-full bg-gray-50"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Date range */}
                            <div className="mt-4" id="carDateRange">
                                {originalFormData?.carDateRange ? (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Commute Period
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Start Date</p>
                                                <p className="font-medium">
                                                    {new Date(originalFormData.carDateRange.startDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">End Date</p>
                                                <p className="font-medium">
                                                    {new Date(originalFormData.carDateRange.endDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Date Range *
                                        </label>
                                        <Datepicker
                                            value={formData.carDateRange}
                                            onChange={(value) => handleDateRangeChange('car', value)}
                                            showShortcuts={true}
                                            primaryColor="blue"
                                            minDate={new Date(reportingYear, 0, 1)}
                                            maxDate={new Date(reportingYear, 11, 31)}
                                            configs={{
                                                shortcuts: {
                                                    fullYear: {
                                                        text: "Full Year ✓",
                                                        period: {
                                                            start: new Date(`${reportingYear}-01-01`),
                                                            end: new Date(`${reportingYear}-12-31`)
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                        <ErrorMessage message={errors.carDateRange} />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {userPassengerDetails.transportTypes.includes('taxi') && (
                    <div className="border rounded-lg p-6 bg-white shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">
                                Commute {commuteCounter++}
                            </span>
                            Taxi Commute (You are a passenger)
                        </h3>
                        
                        <div className="space-y-6">
                            {/* Distance input */}
                            <div className="max-w-md" id="taxiDistance">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Distance Travelled*
                                </label>
                                <div className="grid grid-cols-[14fr_1fr]">
                                    <InputGroup
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        placeholder="e.g., 20.0"
                                        value={formData.taxiDistance}
                                        onChange={(e) => handleInputChange('taxiDistance', e.target.value)}
                                        className="input-field rounded-r-none w-full"
                                    />
                                    <div className="flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-100">
                                        km
                                    </div>
                                </div>
                                <ErrorMessage message={errors.taxiDistance} />
                                <p className="text-xs text-gray-500 mt-1">
                                    Please enter your portion of the commute distance
                                </p>
                            </div>

                            {/* Taxi type (read-only from original) */}
                            {originalFormData?.taxiType && (
                                <div className="max-w-md">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Taxi Type
                                    </label>
                                    <InputGroup
                                        type="text"
                                        value={originalFormData.taxiType}
                                        disabled
                                        className="input-field w-full bg-gray-50"
                                    />
                                </div>
                            )}

                            {/* Date range */}
                            <div className="mt-4" id="taxiDateRange">
                                {originalFormData?.taxiDateRange ? (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Commute Period
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Start Date</p>
                                                <p className="font-medium">
                                                    {new Date(originalFormData.taxiDateRange.startDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">End Date</p>
                                                <p className="font-medium">
                                                    {new Date(originalFormData.taxiDateRange.endDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Date Range *
                                        </label>
                                        <Datepicker
                                            value={formData.taxiDateRange}
                                            onChange={(value) => handleDateRangeChange('taxi', value)}
                                            showShortcuts={true}
                                            primaryColor="blue"
                                            minDate={new Date(reportingYear, 0, 1)}
                                            maxDate={new Date(reportingYear, 11, 31)}
                                            configs={{
                                                shortcuts: {
                                                    fullYear: {
                                                        text: "Full Year ✓",
                                                        period: {
                                                            start: new Date(`${reportingYear}-01-01`),
                                                            end: new Date(`${reportingYear}-12-31`)
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                        <ErrorMessage message={errors.taxiDateRange} />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (loadingForm) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <Card>
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading form data...</p>
                    </div>
                </Card>
            </div>
        );
    }

    if (!token && !urlAdminToken && !getToken()) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <Card>
                    <div className="text-center py-12">
                        <div className="text-red-500 text-5xl mb-4">⚠</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Authentication Required
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Please access this form with a valid token in the URL.
                        </p>
                        <Button
                            text="Retry Authentication"
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                            onClick={() => window.location.reload()}
                        />
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <Card title={"Carpool Partner Commute Distance Form"}>
                <div className="mb-8">
                    <div className="text-slate-700 leading-relaxed mb-4 bg-blue-50 rounded-lg border-l-4 border-blue-400 p-4">
                        <p className="text-gray-700">
                            You have been invited to provide your commute distance as part of a carpool arrangement. 
                            Please confirm your portion of the commute distance for each period indicated below.
                        </p>
                        {userPassengerDetails.transportTypes && userPassengerDetails.transportTypes.length > 0 && (
                            <p className="text-sm text-blue-600 mt-2 font-semibold">
                                You are a passenger in {userPassengerDetails.transportTypes.length} commute type(s): {userPassengerDetails.transportTypes.join(', ')}.
                                Please fill in your distance for each.
                            </p>
                        )}
                    </div>

                    {/* No commute found error */}
                    {errors.noCommuteFound && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600">{errors.noCommuteFound}</p>
                        </div>
                    )}
                </div>

                {/* Render all commute sections where user is a passenger */}
                {renderCommuteSections()}

                {/* Quality Control Section */}
                <div className="mb-8 mt-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2 pb-2">
                        Quality Control & Remarks
                    </h2>
                    <div className='mb-3' id="qualityControl">
                        <label className="field-label">Quality Control</label>
                        <CustomSelect
                            name="qualityControl"
                            options={qualityControlOptions}
                            value={formData.qualityControl}
                            onChange={(selectedOption) => handleSelectChange('qualityControl', selectedOption)}
                            placeholder="Select Quality"
                        />
                        <ErrorMessage message={errors.qualityControl} />
                    </div>
                    <div>
                        <Textarea
                            label="Remarks"
                            placeholder="Enter any additional remarks"
                            rows={4}
                            value={formData.qualityControlRemarks}
                            onChange={(e) => handleInputChange('qualityControlRemarks', e.target.value)}
                        />
                    </div>
                </div>

                {/* Submission Information */}
                <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-medium text-blue-800 mb-3">
                        Submission Information
                    </h3>
                    <div id="submittedByEmail">
                        <InputGroup
                            label="Your Email Address *"
                            type="email"
                            placeholder="your.email@company.com"
                            value={formData.submittedByEmail}
                            onChange={(e) => handleInputChange('submittedByEmail', e.target.value)}
                            required
                            disabled
                            helperText="This email will be used for confirmation"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t">
                    <Button
                        onClick={handleSubmit}
                        text={loading ? 'Submitting...' : 'Submit Your Distances'}
                        className="btn-dark"
                        disabled={loading || !userPassengerDetails.transportTypes || userPassengerDetails.transportTypes.length === 0}
                    />
                </div>
            </Card>
        </div>
    );
};

export default EmployeeCommutingFormCarpool;
