import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textinput from '@/components/ui/Textinput';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import Textarea from '@/components/ui/Textarea';
import { toast } from 'react-toastify';
import axios from 'axios';
import Datepicker from "react-tailwindcss-datepicker";

const EmployeeCommutingForm = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const urlToken = queryParams.get('token');
    const urlUserId = queryParams.get('userId');

    // Current year for reporting
    const currentYear = new Date().getFullYear();
    const [reportingYear, setReportingYear] = useState(currentYear);

    // Form state - store objects for select values
    const [formData, setFormData] = useState({
        // Basic Information
        siteBuildingName: null,
        stakeholderDepartment: null,

        // Motorbike Commute
        commuteByMotorbike: false,
        motorbikeMode: 'individual',
        motorbikeDistance: '',
        motorbikeType: { value: 'Small', label: 'Small (<125cc)' },
        carryOthersMotorbike: false,
        personsCarriedMotorbike: null,
        motorbikePassengerEmails: [''],
        motorbikePassengerUserIds: [''],
        travelWithOthersMotorbike: false,
        personsTravelWithMotorbike: null,
        motorbikeTravelPassengerEmails: [''],
        motorbikeTravelPassengerUserIds: [''],
        motorbikeDateRange: null,

        // Taxi Commute
        commuteByTaxi: false,
        taxiMode: 'individual',
        taxiPassengers: { value: '1', label: '1 passenger' },
        taxiDistance: '',
        taxiType: { value: 'Regular taxi', label: 'Regular Taxi' },
        travelWithOthersTaxi: false,
        personsTravelWithTaxi: null,
        taxiPassengerEmails: [''],
        taxiPassengerUserIds: [''],
        taxiDateRange: null,

        // Bus Commute
        commuteByBus: false,
        busDistance: '',
        busType: { value: 'Green Line Bus', label: 'Green Line Bus' },
        busDateRange: null,

        // Train Commute
        commuteByTrain: false,
        trainDistance: '',
        trainType: { value: 'National rail', label: 'National Rail' },
        trainDateRange: null,

        // Car Commute
        commuteByCar: false,
        carMode: 'individual',
        carDistance: '',
        carType: { value: 'Average car', label: 'Average car - Unknown engine size' },
        carFuelType: { value: 'Diesel', label: 'Diesel' },
        carryOthersCar: false,
        personsCarriedCar: null,
        carPassengerEmails: [''],
        carPassengerUserIds: [''],
        travelWithOthersCar: false,
        personsTravelWithCar: null,
        carTravelPassengerEmails: [''],
        carTravelPassengerUserIds: [''],
        carDateRange: null,

        // Work From Home
        workFromHome: false,
        fteWorkingHours: '',
        workFromHomeDateRange: null,

        // Quality Control
        qualityControlRemarks: '',

        // Submitted By
        submittedByEmail: '',
    });

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [pooledEmailWarnings, setPooledEmailWarnings] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [buildingsLoading, setBuildingsLoading] = useState(true);

    // User data states
    const [userInfo, setUserInfo] = useState(null); // Form user data (target or company)
    const [userLoading, setUserLoading] = useState(true);
    const [companyData, setCompanyData] = useState(null); // Company user data (from token)
    const [targetUserData, setTargetUserData] = useState(null); // Target user data (from URL)

    const [companyUsers, setCompanyUsers] = useState([]);
    const [companyUsersLoading, setCompanyUsersLoading] = useState(false);
    const [token, setToken] = useState('');

    // Year selection dropdown options
    const yearOptions = [
        { value: currentYear - 1, label: `${currentYear - 1}` },
        { value: currentYear, label: `${currentYear}` },
        { value: currentYear + 1, label: `${currentYear + 1}` }
    ];

    // Helper function to convert date range to individual dates
    const dateRangeToDates = (dateRange) => {
        if (!dateRange || !dateRange.startDate || !dateRange.endDate) return [];

        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        const dates = [];

        // Reset hours to avoid timezone issues
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    };

    // Department options
    const departmentOptions = [
        { value: 'Assembly', label: 'Assembly' },
        { value: 'Asset Integrity / Technical Integrity', label: 'Asset Integrity / Technical Integrity' },
        { value: 'Batching Plant', label: 'Batching Plant' },
        { value: 'Boiler', label: 'Boiler' },
        { value: 'Civil Construction', label: 'Civil Construction' },
        { value: 'Commissioning', label: 'Commissioning' },
        { value: 'Commercial', label: 'Commercial' },
        { value: 'Compressor', label: 'Compressor' },
        { value: 'Construction', label: 'Construction' },
        { value: 'Contracts', label: 'Contracts' },
        { value: 'Control Systems', label: 'Control Systems' },
        { value: 'Crane', label: 'Crane' },
        { value: 'Cyber Security', label: 'Cyber Security' },
        { value: 'Deaerator', label: 'Deaerator' },
        { value: 'Design', label: 'Design' },
        { value: 'Dewatering', label: 'Dewatering' },
        { value: 'Drilling', label: 'Drilling' },
        { value: 'Dust Collection / Handling', label: 'Dust Collection / Handling' },
        { value: 'Earthworks', label: 'Earthworks' },
        { value: 'EHS', label: 'EHS' },
        { value: 'Electrical', label: 'Electrical' },
        { value: 'Engineering', label: 'Engineering' },
        { value: 'Environment', label: 'Environment' },
        { value: 'Excavation', label: 'Excavation' },
        { value: 'Expansion', label: 'Expansion' },
        { value: 'Fabrication', label: 'Fabrication' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Fire Protection', label: 'Fire Protection' },
        { value: 'Fuel Handling', label: 'Fuel Handling' },
        { value: 'General Services', label: 'General Services' },
        { value: 'Geotechnical', label: 'Geotechnical' },
        { value: 'GGBS Handling', label: 'GGBS Handling' },
        { value: 'Grouting', label: 'Grouting' },
        { value: 'Health', label: 'Health' },
        { value: 'Heavy Lift', label: 'Heavy Lift' },
        { value: 'HEMP', label: 'HEMP' },
        { value: 'High Voltage', label: 'High Voltage' },
        { value: 'HR', label: 'HR' },
        { value: 'HVAC', label: 'HVAC' },
        { value: 'Industrial Gases', label: 'Industrial Gases' },
        { value: 'Infrastructure', label: 'Infrastructure' },
        { value: 'Installation', label: 'Installation' },
        { value: 'Instrumentation', label: 'Instrumentation' },
        { value: 'Insulation', label: 'Insulation' },
        { value: 'IT', label: 'IT' },
        { value: 'Legal', label: 'Legal' },
        { value: 'Lighting', label: 'Lighting' },
        { value: 'Logistics', label: 'Logistics' },
        { value: 'Low Voltage', label: 'Low Voltage' },
        { value: 'Maintenance', label: 'Maintenance' },
        { value: 'Management', label: 'Management' },
        { value: 'Manufacturing', label: 'Manufacturing' },
        { value: 'Material Handling', label: 'Material Handling' },
        { value: 'Materials', label: 'Materials' },
        { value: 'Mechanical', label: 'Mechanical' },
        { value: 'MEP', label: 'MEP' },
        { value: 'Mining', label: 'Mining' },
        { value: 'Motor Control Centre', label: 'Motor Control Centre' },
        { value: 'Operations', label: 'Operations' },
        { value: 'Piling', label: 'Piling' },
        { value: 'Planning', label: 'Planning' },
        { value: 'Power Distribution', label: 'Power Distribution' },
        { value: 'Process', label: 'Process' },
        { value: 'Procurement', label: 'Procurement' },
        { value: 'Production', label: 'Production' },
        { value: 'Project Controls', label: 'Project Controls' },
        { value: 'Project Management', label: 'Project Management' },
        { value: 'QA/QC', label: 'QA/QC' },
        { value: 'Quantity Surveying', label: 'Quantity Surveying' },
        { value: 'Quarry', label: 'Quarry' },
        { value: 'Reinforcement', label: 'Reinforcement' },
        { value: 'Risk', label: 'Risk' },
        { value: 'Safety', label: 'Safety' },
        { value: 'Scaffolding', label: 'Scaffolding' },
        { value: 'Security', label: 'Security' },
        { value: 'Sewage Treatment', label: 'Sewage Treatment' },
        { value: 'Site Infrastructure', label: 'Site Infrastructure' },
        { value: 'Stacker / Reclaimer', label: 'Stacker / Reclaimer' },
        { value: 'Static', label: 'Static' },
        { value: 'Steel', label: 'Steel' },
        { value: 'Structural', label: 'Structural' },
        { value: 'Supply Chain', label: 'Supply Chain' },
        { value: 'Survey', label: 'Survey' },
        { value: 'Switchgear', label: 'Switchgear' },
        { value: 'Telecom', label: 'Telecom' },
        { value: 'Temporary Works', label: 'Temporary Works' },
        { value: 'Training', label: 'Training' },
        { value: 'Transportation', label: 'Transportation' },
        { value: 'Utilities', label: 'Utilities' },
        { value: 'Warehouse', label: 'Warehouse' },
        { value: 'Water Treatment', label: 'Water Treatment' },
        { value: 'Welding', label: 'Welding' },
        { value: 'Workshop', label: 'Workshop' },
        { value: 'Other', label: 'Other' },
    ];

    // Transportation type options
    const transportationOptions = {
        motorbikeTypes: [
            { value: 'Small', label: 'Small (<125cc)' },
            { value: 'Medium', label: 'Medium (125-500cc)' },
            { value: 'Large', label: 'Large (>500cc)' },
            { value: 'Electric', label: 'Electric Motorbike' },
        ],

        taxiTypes: [
            { value: 'Regular taxi', label: 'Regular Taxi' },
            { value: 'Business class taxi', label: 'Business class taxi' },
        ],

        busTypes: [
            { value: 'Green Line Bus', label: 'Green Line Bus' },
            { value: 'Local bus', label: 'Local Bus' },
            { value: 'Intercity Bus (Non A.C)', label: 'Intercity Bus (Non A.C)' },
            { value: 'Intercity Bus (A.C)', label: 'Intercity Bus (A.C)' },
        ],

        trainTypes: [
            { value: 'National rail', label: 'National Rail' },
            { value: 'Subway/Metro', label: 'Subway/Metro' },
            { value: 'Green Line Train', label: 'Green Line Train' },
            { value: 'Metro', label: 'Metro' },
        ],

        carTypes: [
            {
                value: 'Small car - Petrol/LPG/CNG - up to 1.4-litre engine',
                label: 'Small car - Petrol/LPG/CNG - up to 1.4-litre engine'
            },
            {
                value: 'Small car - Diesel - up to a 1.7-litre engine',
                label: 'Small car - Diesel - up to a 1.7-litre engine'
            },
            {
                value: 'Medium car - Petrol/LPG/CNG - from 1.4-litre to 2.0-litre engine',
                label: 'Medium car - Petrol/LPG/CNG - from 1.4-litre to 2.0-litre engine'
            },
            {
                value: 'Medium car - Diesel - from 1.7-litre to 2.0-litre engine',
                label: 'Medium car - Diesel - from 1.7-litre to 2.0-litre engine'
            },
            {
                value: 'Large car - Petrol/LPG/CNG - 2.0-litre engine (+)',
                label: 'Large car - Petrol/LPG/CNG - 2.0-litre engine (+)'
            },
            {
                value: 'Large car - Diesel - 2.0-litre engine (+)',
                label: 'Large car - Diesel - 2.0-litre engine (+)'
            },
            {
                value: 'Average car - Unknown engine size',
                label: 'Average car - Unknown engine size'
            },
            {
                value: 'Executive - Large Executive or E-Segment Passenger Cars (2000 cc - 3500+ cc)',
                label: 'Executive - Large Executive or E-Segment Passenger Cars (2000 cc - 3500+ cc)'
            },
            {
                value: 'Luxury - Full size Luxury or F-Segment Premium Passenger Cars (3000 cc - 6000 cc)',
                label: 'Luxury - Full size Luxury or F-Segment Premium Passenger Cars (3000 cc - 6000 cc)'
            },
            {
                value: 'Sports - High Performance - High Speed Vehicles (2000 cc - 4000 cc+)',
                label: 'Sports - High Performance - High Speed Vehicles (2000 cc - 4000 cc+)'
            },
            {
                value: 'Dual purpose 4X4 - SUVs 4 wheel Drive or All Wheel Drive (1500 cc - 6000 cc)',
                label: 'Dual purpose 4X4 - SUVs 4 wheel Drive or All Wheel Drive (1500 cc - 6000 cc)'
            },
            {
                value: 'MPV - Multi-Purpose Vehicles / People Carriers (Highroof, Hiace, Suzuki APV, Vans etc.)',
                label: 'MPV - Multi-Purpose Vehicles / People Carriers (Highroof, Hiace, Suzuki APV, Vans etc.)'
            },
        ],

        fuelTypes: [
            { value: 'Petrol', label: 'Petrol' },
            { value: 'Diesel', label: 'Diesel' },
            { value: 'CNG', label: 'CNG' },
            { value: 'LPG', label: 'LPG' },
            { value: 'Electric', label: 'Electric' },
            { value: 'Hybrid', label: 'Hybrid (Petrol/Electric)' },
        ],

        personOptions: [
            { value: '0', label: '0 persons' },
            { value: '1', label: '1 person' },
            { value: '2', label: '2 persons' },
            { value: '3', label: '3 persons' },
            { value: '4', label: '4 persons' },
            { value: '5', label: '5+ persons' },
        ],

        taxiPassengerOptions: [
            { value: '1', label: '1 passenger' },
            { value: '2', label: '2 passengers' },
            { value: '3', label: '3 passengers' },
            { value: '4', label: '4 passengers' },
            { value: '5', label: '5+ passengers' },
        ]
    };

    // Get the token from URL or localStorage
    const getToken = () => {
        if (urlToken) {
            localStorage.setItem('token', urlToken);
            return urlToken;
        } else {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                return storedToken;
            }
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

    // Fetch user data from API - Updated to handle both company and target user
    const fetchUserData = async (authToken) => {
        try {
            setUserLoading(true);

            // 1. Get company user ID from token
            const companyUserId = getUserIdFromToken(authToken);

            // 2. Get target user ID from URL parameter
            const targetUserId = urlUserId;

            if (!companyUserId && !targetUserId) {
                toast.error('Unable to identify user from token or URL');
                return;
            }

            console.log('Debug - User IDs:', {
                companyUserId,
                targetUserId,
                hasToken: !!authToken
            });

            // 3. Fetch company user data (from token)
            let companyUserData = null;
            if (companyUserId) {
                try {
                    const companyResponse = await axios.get(
                        `${process.env.REACT_APP_BASE_URL}/auth/GetUsers/${companyUserId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${authToken}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    );

                    if (companyResponse.data && companyResponse.data.data) {
                        companyUserData = companyResponse.data.data;
                        setCompanyData(companyUserData);
                        console.log('Company user data fetched:', companyUserData);
                    }
                } catch (companyError) {
                    console.warn('Failed to fetch company user data:', companyError);
                    // Continue execution without company data
                }
            }

            // 4. Fetch target user data (from URL)
            let targetUserData = null;
            let formUserData = null; // Data to use for form filling

            if (targetUserId) {
                try {
                    const targetResponse = await axios.get(
                        `${process.env.REACT_APP_BASE_URL}/auth/GetUsers/${targetUserId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${authToken}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    );

                    if (targetResponse.data && targetResponse.data.data) {
                        targetUserData = targetResponse.data.data;
                        setTargetUserData(targetUserData);
                        formUserData = targetUserData; // Use target user data for form
                        console.log('Target user data fetched:', targetUserData);

                        // Show admin mode message
                        toast.info(`Admin mode: Filling form for ${targetUserData.name || targetUserData.email}`);
                    }
                } catch (targetError) {
                    console.error('Failed to fetch target user data:', targetError);
                    toast.error(`Failed to fetch employee data with ID: ${targetUserId}`);

                    // Fallback to company data if target fetch fails
                    if (companyUserData) {
                        formUserData = companyUserData;
                        toast.info('Using your company data instead');
                    }
                }
            } else if (companyUserData) {
                // No target user ID, use company data
                formUserData = companyUserData;
                console.log('Using company user data for form');
            }

            // 5. Fill form with user data
            if (formUserData) {
                setUserInfo(formUserData);

                // Auto-fill email field
                if (formUserData.email) {
                    setFormData(prev => ({
                        ...prev,
                        submittedByEmail: formUserData.email
                    }));
                }

                // Auto-fill department field
                if (formUserData.department) {
                    const userDept = departmentOptions.find(
                        dept => dept.value === formUserData.department ||
                            dept.label === formUserData.department
                    );

                    if (userDept) {
                        setFormData(prev => ({
                            ...prev,
                            stakeholderDepartment: userDept
                        }));
                    }
                }

                // Handle building auto-selection
                if (formUserData.buildingId && formUserData.buildingId._id) {
                    // Create building option from user's building data
                    const userBuildingOption = {
                        value: formUserData.buildingId._id,
                        label: formUserData.buildingId.buildingName || 'Unnamed Building',
                        buildingData: formUserData.buildingId
                    };

                    // Set the building in form data
                    setFormData(prev => ({
                        ...prev,
                        siteBuildingName: userBuildingOption
                    }));

                    // Add to buildings list if not already present
                    setBuildings(prev => {
                        const buildingExists = prev.some(
                            building => building.value === formUserData.buildingId._id
                        );

                        if (!buildingExists) {
                            return [...prev, userBuildingOption];
                        }
                        return prev;
                    });

                    // Show success message
                    if (targetUserId) {
                        toast.success(`Building auto-selected for employee: ${formUserData.buildingId.buildingName}`);
                    } else {
                        toast.success(`Building auto-selected from your profile: ${formUserData.buildingId.buildingName}`);
                    }
                } else {
                    toast.warning('No building information found for this user');
                }
            } else {
                toast.error('No user data available to fill the form');
            }

        } catch (error) {
            console.error('Error in fetchUserData:', error);

            if (error.response) {
                if (error.response.status === 404) {
                    toast.error('User not found. Please check the user ID or authentication.');
                } else if (error.response.status === 401) {
                    toast.error('Authentication failed. Token may be invalid or expired.');
                } else {
                    toast.error(`Server error: ${error.response.status}`);
                }
            } else if (error.request) {
                toast.error('Network error. Please check your connection.');
            } else {
                toast.error('Error: ' + error.message);
            }
        } finally {
            setUserLoading(false);
        }
    };

    // Function to handle building auto-selection after buildings are loaded
    const autoSelectUserBuilding = (userData, buildingsList) => {
        if (!userData || !userData.buildingId || !userData.buildingId._id || buildingsList.length === 0) return;

        const userBuilding = buildingsList.find(
            building => building.value === userData.buildingId._id
        );

        if (userBuilding) {
            setFormData(prev => ({
                ...prev,
                siteBuildingName: userBuilding
            }));
        } else if (userData.buildingId && userData.buildingId._id) {
            // Create a building option from user data
            const buildingOption = {
                value: userData.buildingId._id,
                label: userData.buildingId.buildingName || `Building (${userData.buildingId._id.substring(0, 8)}...)`,
                buildingData: userData.buildingId
            };

            setFormData(prev => ({
                ...prev,
                siteBuildingName: buildingOption
            }));

            // Add to buildings list
            setBuildings(prev => [...prev, buildingOption]);
        }
    };

    // Fetch company users from API
    const fetchCompanyUsers = async (authToken) => {
        try {
            setCompanyUsersLoading(true);

            const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/auth/GetCompanyUsers`,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data && response.data.data) {
                // Get current user ID from token
                const currentUserId = getUserIdFromToken(authToken);
                // Get target user ID from URL
                const targetUserId = urlUserId;

                // Filter users - exclude current user and target user
                const filteredUsers = response.data.data.users.filter(user => {
                    // Exclude current logged-in user
                    if (user._id === currentUserId) return false;
                    // Exclude target user if they're different
                    if (targetUserId && user._id === targetUserId) return false;
                    return user.email; // Only include users with email
                }).map(user => ({
                    value: user._id, // Store userId as value
                    label: user.name ? `${user.name} (${user.email})` : user.email,
                    email: user.email,
                    userData: user
                }));

                setCompanyUsers(filteredUsers);
                return filteredUsers;
            } else {
                toast.error('No company users data received from server');
                return [];
            }
        } catch (error) {
            console.error('Error fetching company users:', error);
            toast.error('Failed to load company users');
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

            // Fetch user data (both company and target)
            fetchUserData(currentToken).then(() => {
                // After user data is loaded, fetch buildings
                fetchBuildings(currentToken).then((buildingOptions) => {
                    // Try to auto-select building based on user info
                    if (userInfo && userInfo.buildingId && userInfo.buildingId._id) {
                        autoSelectUserBuilding(userInfo, buildingOptions);
                    }
                });
            });

            // Fetch company users (for passenger selection)
            fetchCompanyUsers(currentToken);
        } else {
            toast.error('No authentication token found. Please access this page with a valid token.');
            setBuildingsLoading(false);
            setUserLoading(false);
            setCompanyUsersLoading(false);
        }
    }, [urlToken, urlUserId]);

    // Additional effect to handle building auto-selection when buildings are loaded
    useEffect(() => {
        if (userInfo && userInfo.buildingId && userInfo.buildingId._id && buildings.length > 0) {
            autoSelectUserBuilding(userInfo, buildings);
        }
    }, [buildings, userInfo]);

    // Handle reporting year change
    const handleReportingYearChange = (selectedOption) => {
        setReportingYear(selectedOption.value);

        // Clear all date ranges when year changes
        setFormData(prev => ({
            ...prev,
            motorbikeDateRange: null,
            taxiDateRange: null,
            busDateRange: null,
            trainDateRange: null,
            carDateRange: null,
            workFromHomeDateRange: null
        }));
    };

    // Handle checkbox changes
    const handleCheckboxChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    // Handle input changes for Textinput
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handle select changes - store the entire option object
    const handleSelectChange = (field, selectedOption) => {
        setFormData(prev => ({ ...prev, [field]: selectedOption }));
    };

    // Handle passenger emails (for manual input)
    const handlePassengerEmailsChange = (transportType, index, value) => {
        setFormData(prev => {
            let newEmails, newUserIds, personCountField;

            // Determine which fields to use based on transport type
            if (transportType === 'motorbikeTravel') {
                newEmails = [...prev.motorbikeTravelPassengerEmails];
                newUserIds = [...prev.motorbikeTravelPassengerUserIds];
                personCountField = 'personsTravelWithMotorbike';
            } else if (transportType === 'carTravel') {
                newEmails = [...prev.carTravelPassengerEmails];
                newUserIds = [...prev.carTravelPassengerUserIds];
                personCountField = 'personsTravelWithCar';
            } else {
                newEmails = [...prev[`${transportType}PassengerEmails`]];
                newUserIds = [...prev[`${transportType}PassengerUserIds`]];
                personCountField = transportType === 'car' ? 'personsCarriedCar' :
                    transportType === 'motorbike' ? 'personsCarriedMotorbike' :
                        'personsTravelWithTaxi';
            }

            newEmails[index] = value;
            newUserIds[index] = ''; // Clear userId when email is manually entered

            const maxPersons = parseInt(prev[personCountField]?.value || 0);

            if (index === newEmails.length - 1 && value.trim() !== '' && newEmails.length < maxPersons) {
                newEmails.push('');
                newUserIds.push('');
            }

            const updatedData = { ...prev };

            if (transportType === 'motorbikeTravel') {
                updatedData.motorbikeTravelPassengerEmails = newEmails;
                updatedData.motorbikeTravelPassengerUserIds = newUserIds;
            } else if (transportType === 'carTravel') {
                updatedData.carTravelPassengerEmails = newEmails;
                updatedData.carTravelPassengerUserIds = newUserIds;
            } else {
                updatedData[`${transportType}PassengerEmails`] = newEmails;
                updatedData[`${transportType}PassengerUserIds`] = newUserIds;
            }

            return updatedData;
        });
    };

    // Handle passenger selection from dropdown
    const handlePassengerSelect = (transportType, index, selectedOption) => {
        setFormData(prev => {
            let newEmails, newUserIds, personCountField;

            // Determine which fields to use based on transport type
            if (transportType === 'motorbikeTravel') {
                newEmails = [...prev.motorbikeTravelPassengerEmails];
                newUserIds = [...prev.motorbikeTravelPassengerUserIds];
                personCountField = 'personsTravelWithMotorbike';
            } else if (transportType === 'carTravel') {
                newEmails = [...prev.carTravelPassengerEmails];
                newUserIds = [...prev.carTravelPassengerUserIds];
                personCountField = 'personsTravelWithCar';
            } else {
                newEmails = [...prev[`${transportType}PassengerEmails`]];
                newUserIds = [...prev[`${transportType}PassengerUserIds`]];
                personCountField = transportType === 'car' ? 'personsCarriedCar' :
                    transportType === 'motorbike' ? 'personsCarriedMotorbike' :
                        'personsTravelWithTaxi';
            }

            if (selectedOption) {
                newEmails[index] = selectedOption.email || '';
                newUserIds[index] = selectedOption.value || '';
            } else {
                newEmails[index] = '';
                newUserIds[index] = '';
            }

            const maxPersons = parseInt(prev[personCountField]?.value || 0);

            if (index === newEmails.length - 1 && selectedOption?.value && newEmails.length < maxPersons) {
                newEmails.push('');
                newUserIds.push('');
            }

            const updatedData = { ...prev };

            if (transportType === 'motorbikeTravel') {
                updatedData.motorbikeTravelPassengerEmails = newEmails;
                updatedData.motorbikeTravelPassengerUserIds = newUserIds;
            } else if (transportType === 'carTravel') {
                updatedData.carTravelPassengerEmails = newEmails;
                updatedData.carTravelPassengerUserIds = newUserIds;
            } else {
                updatedData[`${transportType}PassengerEmails`] = newEmails;
                updatedData[`${transportType}PassengerUserIds`] = newUserIds;
            }

            return updatedData;
        });
    };

    // Handle number of persons change
    const handlePersonsChange = (field, selectedOption) => {
        setFormData(prev => {
            // Determine transport type based on field name
            let transportType = '';
            let emailField = '';
            let userIdField = '';

            if (field.includes('Motorbike')) {
                if (field.includes('Travel')) {
                    transportType = 'motorbikeTravel';
                    emailField = 'motorbikeTravelPassengerEmails';
                    userIdField = 'motorbikeTravelPassengerUserIds';
                } else {
                    transportType = 'motorbike';
                    emailField = 'motorbikePassengerEmails';
                    userIdField = 'motorbikePassengerUserIds';
                }
            } else if (field.includes('Taxi')) {
                transportType = 'taxi';
                emailField = 'taxiPassengerEmails';
                userIdField = 'taxiPassengerUserIds';
            } else if (field.includes('Car')) {
                if (field.includes('Travel')) {
                    transportType = 'carTravel';
                    emailField = 'carTravelPassengerEmails';
                    userIdField = 'carTravelPassengerUserIds';
                } else {
                    transportType = 'car';
                    emailField = 'carPassengerEmails';
                    userIdField = 'carPassengerUserIds';
                }
            }

            const currentEmails = prev[emailField] || [''];
            const currentUserIds = prev[userIdField] || [''];
            const maxPersons = parseInt(selectedOption?.value || 0);

            const newEmails = Array(Math.max(maxPersons, 1)).fill('').map((_, i) =>
                i < currentEmails.length ? currentEmails[i] : ''
            );

            const newUserIds = Array(Math.max(maxPersons, 1)).fill('').map((_, i) =>
                i < currentUserIds.length ? currentUserIds[i] : ''
            );

            return {
                ...prev,
                [field]: selectedOption,
                [emailField]: newEmails,
                [userIdField]: newUserIds,
            };
        });
    };

    // Add this helper function to calculate remaining months
    const calculateRemainingMonths = (startDate, endDate, reportingYear) => {
        if (!startDate || !endDate) return 0;

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Adjust dates to cover full months
        const startMonth = start.getMonth();
        const endMonth = end.getMonth();
        const startYear = start.getFullYear();
        const endYear = end.getFullYear();

        // Calculate total months in the date range (inclusive)
        const totalMonths = ((endYear - startYear) * 12) + (endMonth - startMonth) + 1;

        // If range spans partial months, consider them as full months for reporting
        return Math.max(1, Math.min(12, totalMonths));
    };

    // Update the handleDateRangeChange function
    const handleDateRangeChange = (transportType, value) => {
        if (value && value.startDate && value.endDate) {
            const startDate = new Date(value.startDate);
            const endDate = new Date(value.endDate);

            // Check if dates are within reporting year
            if (startDate.getFullYear() !== reportingYear || endDate.getFullYear() !== reportingYear) {
                toast.warning(`Selected date range is outside ${reportingYear}. Please select dates within the reporting year.`);
                return; // Don't update if outside reporting year
            }

            // Calculate how many months are covered
            const monthsCovered = calculateRemainingMonths(value.startDate, value.endDate, reportingYear);
            const remainingMonths = 12 - monthsCovered;

            // If less than 12 months are covered, show a warning toast
            if (remainingMonths > 0) {
                // Prepare a detailed message based on how many months remain
                let message = '';

                if (monthsCovered === 1) {
                    message = `You've selected only ${monthsCovered} month. You should select dates to cover the entire year (${remainingMonths} more months needed). Use the "Full Year" shortcut or select manually.`;
                } else {
                    message = `You've selected ${monthsCovered} month${monthsCovered > 1 ? 's' : ''}. ${remainingMonths} month${remainingMonths > 1 ? 's' : ''} remain${remainingMonths > 1 ? '' : 's'} unselected. Consider selecting the full year for accurate reporting.`;
                }

                // Create a more prominent toast with action
                toast.warning(
                    <div>
                        <div className="font-semibold mb-1">Incomplete Year Coverage</div>
                        <div className="text-sm mb-2">{message}</div>
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={() => {
                                    // Set to full year
                                    handleDateRangeChange(transportType, {
                                        startDate: new Date(`${reportingYear}-01-01`),
                                        endDate: new Date(`${reportingYear}-12-31`),
                                    });
                                    toast.dismiss();
                                }}
                                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                            >
                                Select Full Year
                            </button>
                            <button
                                onClick={() => toast.dismiss()}
                                className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
                            >
                                Keep Selection
                            </button>
                        </div>
                    </div>,
                    {
                        autoClose: 8000,
                        closeButton: true,
                    }
                );
            } else if (monthsCovered === 12) {
                toast.success("✓ Full year selected for accurate reporting!");
            }
        }

        // Update the form data with the selected date range
        setFormData(prev => ({
            ...prev,
            [`${transportType}DateRange`]: value
        }));
    };

    // Update the renderDateRangePicker function to include a progress indicator
    const renderDateRangePicker = (transportType, label) => {
        // Calculate coverage for current selection
        const currentRange = formData[`${transportType}DateRange`];
        let monthsCovered = 0;
        let progressPercentage = 0;

        if (currentRange && currentRange.startDate && currentRange.endDate) {
            monthsCovered = calculateRemainingMonths(currentRange.startDate, currentRange.endDate, reportingYear);
            progressPercentage = Math.round((monthsCovered / 12) * 100);
        }

        return (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {label} - Select Date Range for {reportingYear}
                        </label>
                        <p className="text-xs text-gray-500">
                            Select dates that cover the entire year for accurate reporting
                        </p>
                    </div>

                    {/* Progress indicator */}
                    {currentRange && currentRange.startDate && currentRange.endDate && (
                        <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-[120px]">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Year Coverage</span>
                                    <span>{monthsCovered}/12 months</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${progressPercentage === 100 ? 'bg-green-500' :
                                            progressPercentage >= 50 ? 'bg-yellow-500' :
                                                'bg-red-500'
                                            }`}
                                        style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                            {progressPercentage === 100 && (
                                <span className="text-xs font-medium text-green-600 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Complete
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <Datepicker
                        value={formData[`${transportType}DateRange`] || null}
                        onChange={(value) => handleDateRangeChange(transportType, value)}
                        showShortcuts={true}
                        showFooter={true}
                        primaryColor="blue"
                        minDate={new Date(`${reportingYear}-01-01`)}
                        maxDate={new Date(`${reportingYear}-12-31`)}
                        configs={{
                            shortcuts: {
                                today: {
                                    text: "Today",
                                    period: {
                                        start: new Date(),
                                        end: new Date()
                                    }
                                },
                                yesterday: {
                                    text: "Yesterday",
                                    period: {
                                        start: new Date(new Date().setDate(new Date().getDate() - 1)),
                                        end: new Date(new Date().setDate(new Date().getDate() - 1))
                                    }
                                },
                                thisWeek: {
                                    text: "This Week",
                                    period: {
                                        start: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())),
                                        end: new Date(new Date().setDate(new Date().getDate() + (6 - new Date().getDay())))
                                    }
                                },
                                thisMonth: {
                                    text: "This Month",
                                    period: {
                                        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                                        end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
                                    }
                                },
                                lastMonth: {
                                    text: "Last Month",
                                    period: {
                                        start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
                                        end: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
                                    }
                                },
                                firstQuarter: {
                                    text: "Q1",
                                    period: {
                                        start: new Date(`${reportingYear}-01-01`),
                                        end: new Date(`${reportingYear}-03-31`)
                                    }
                                },
                                secondQuarter: {
                                    text: "Q2",
                                    period: {
                                        start: new Date(`${reportingYear}-04-01`),
                                        end: new Date(`${reportingYear}-06-30`)
                                    }
                                },
                                thirdQuarter: {
                                    text: "Q3",
                                    period: {
                                        start: new Date(`${reportingYear}-07-01`),
                                        end: new Date(`${reportingYear}-09-30`)
                                    }
                                },
                                fourthQuarter: {
                                    text: "Q4",
                                    period: {
                                        start: new Date(`${reportingYear}-10-01`),
                                        end: new Date(`${reportingYear}-12-31`)
                                    }
                                },
                                fullYear: {
                                    text: "Full Year ✓",
                                    period: {
                                        start: new Date(`${reportingYear}-01-01`),
                                        end: new Date(`${reportingYear}-12-31`)
                                    }
                                }
                            }
                        }}
                        displayFormat="DD MMM YYYY"
                        startFrom={new Date(`${reportingYear}-01-01`)}
                        popoverDirection="down"
                        containerClassName="relative w-full"
                        inputClassName="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        toggleClassName="absolute right-0 h-full px-3 text-gray-400 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                    />

                    {/* Selected date range summary with month coverage */}
                    {currentRange && currentRange.startDate && currentRange.endDate && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-blue-800">Start Date</p>
                                    <p className="text-sm text-blue-600">
                                        {new Date(currentRange.startDate).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-blue-800">End Date</p>
                                    <p className="text-sm text-blue-600">
                                        {new Date(currentRange.endDate).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-blue-800">Month Coverage</p>
                                    <p className="text-sm text-blue-600">
                                        {monthsCovered} of 12 months
                                        {monthsCovered < 12 && (
                                            <span className="block text-xs text-red-600 mt-1">
                                                {12 - monthsCovered} month{12 - monthsCovered > 1 ? 's' : ''} remain
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Calculate duration */}
                            {currentRange.startDate && currentRange.endDate && (
                                <div className="mt-3 pt-3 border-t border-blue-200">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-blue-800">Duration</p>
                                            <p className="text-sm text-blue-600">
                                                {(() => {
                                                    const start = new Date(currentRange.startDate);
                                                    const end = new Date(currentRange.endDate);
                                                    const diffTime = Math.abs(end - start);
                                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                                                    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
                                                })()}
                                            </p>
                                        </div>
                                        {monthsCovered < 12 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleDateRangeChange(transportType, {
                                                        startDate: new Date(`${reportingYear}-01-01`),
                                                        endDate: new Date(`${reportingYear}-12-31`),
                                                    });
                                                }}
                                                className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                            >
                                                Select Full Year
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Clear button */}
                            <div className="mt-3">
                                <button
                                    type="button"
                                    onClick={() => handleDateRangeChange(transportType, null)}
                                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                                >
                                    Clear Date Range
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Information message with emphasis on full year */}
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                        <div className="flex items-start">
                            <svg className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div className="text-sm text-blue-700">
                                <p className="font-medium mb-1">Important for accurate reporting:</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li><strong>Select dates covering the full year</strong> for accurate emissions calculations</li>
                                    <li>Use the <strong>"Full Year ✓" shortcut</strong> to quickly select all 12 months</li>
                                    <li>If you select less than 12 months, the system will prompt you to consider the full year</li>
                                    <li>For discontinuous periods, submit multiple forms or select the largest continuous range</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Render passenger email inputs with dropdown
    const renderPassengerEmails = (transportType, countField, emailsField, userIdsField, label) => {
        const count = parseInt(formData[countField]?.value || 0);

        if (count <= 0) return null;

        // Handle special cases for travel fields
        let actualEmailsField = emailsField;
        let actualUserIdsField = userIdsField;

        if (transportType === 'motorbikeTravel') {
            actualEmailsField = 'motorbikeTravelPassengerEmails';
            actualUserIdsField = 'motorbikeTravelPassengerUserIds';
        } else if (transportType === 'carTravel') {
            actualEmailsField = 'carTravelPassengerEmails';
            actualUserIdsField = 'carTravelPassengerUserIds';
        }

        return (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    {label} ({count} {count === 1 ? 'person' : 'persons'})
                </label>
                <div className="space-y-3">
                    {Array.from({ length: count }).map((_, index) => {
                        const currentEmail = formData[actualEmailsField][index] || '';
                        const currentUserId = formData[actualUserIdsField][index] || '';

                        // Find the user in companyUsers by userId or email
                        const selectedUser = companyUsers.find(user =>
                            user.value === currentUserId || user.email === currentEmail
                        );

                        return (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-gray-600">
                                        Colleague {index + 1}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        Select from list or type manually
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <Select
                                            placeholder="Select colleague from list"
                                            options={companyUsers}
                                            value={selectedUser || null}
                                            onChange={(selectedOption) => handlePassengerSelect(transportType, index, selectedOption)}
                                            isLoading={companyUsersLoading}
                                            isClearable
                                            isSearchable
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Select a colleague from the company directory
                                        </p>
                                        {selectedUser && (
                                            <p className="text-xs text-green-600 mt-1">
                                                User ID: {selectedUser.value}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Textinput
                                            type="email"
                                            placeholder="Or enter email address manually"
                                            value={currentEmail}
                                            onChange={(e) => handlePassengerEmailsChange(transportType, index, e.target.value)}
                                            className="w-full"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Type email if colleague not in list
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-start">
                        <svg className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div className="text-sm text-blue-700">
                            <p className="font-medium mb-1">Note about carpool notifications:</p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>When selecting from dropdown, the colleague's User ID will be recorded</li>
                                <li>If you enter an email manually, the system will try to match it with existing users</li>
                                <li>Colleagues will receive notifications about carpool partnerships</li>
                                <li>Each person should only report their portion of the commute distance</li>
                            </ul>
                        </div>
                    </div>
                </div>
                {companyUsersLoading && (
                    <div className="mt-2 text-sm text-gray-500">
                        Loading company directory...
                    </div>
                )}
                {!companyUsersLoading && companyUsers.length === 0 && (
                    <div className="mt-2 text-sm text-yellow-600">
                        Company directory not available. Please enter email addresses manually.
                    </div>
                )}
                {!companyUsersLoading && companyUsers.length > 0 && (
                    <div className="mt-2 text-sm text-green-600">
                        Found {companyUsers.length} colleagues in company directory
                    </div>
                )}
            </div>
        );
    };

    // Render a fallback building input if API fails
    const renderBuildingInput = () => {
        if (userLoading) {
            return (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Site / Building Name *
                    </label>
                    <div className="text-sm text-gray-500">Loading your building information...</div>
                </div>
            );
        }

        if (buildings.length === 0 && !buildingsLoading) {
            return (
                <Textinput
                    label="Site / Building Name *"
                    placeholder="e.g., Main Office, Building A"
                    value={formData.siteBuildingName?.label || formData.siteBuildingName || ''}
                    onChange={(e) => handleInputChange('siteBuildingName', { value: e.target.value, label: e.target.value })}
                    required
                    helperText="Building list could not be loaded. Please enter building name manually."
                />
            );
        }

        return (
            <Select
                label="Site / Building Name *"
                placeholder="Select a building"
                options={buildings}
                value={formData.siteBuildingName}
                onChange={(selectedOption) => handleSelectChange('siteBuildingName', selectedOption)}
                required
                isLoading={buildingsLoading}
                disabled={buildingsLoading}
                helperText={
                    buildingsLoading ? "Loading buildings..." :
                        userInfo && userInfo.buildingId && formData.siteBuildingName ?
                            `Auto-selected building: ${userInfo.buildingId.buildingName || formData.siteBuildingName.label}` :
                            userInfo && userInfo.buildingId ?
                                `Your building: ${userInfo.buildingId.buildingName || userInfo.buildingId._id.substring(0, 8)}...` :
                                "Select your work location"
                }
            />
        );
    };

    // Validate email format
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Function to validate 12-month coverage across all selected commute methods
    const validateMonthCoverage = () => {
        // Create a set to track all covered months across all transport methods
        const coveredMonths = new Set();

        // Helper function to add months from a date range
        const addMonthsFromRange = (dateRange) => {
            if (!dateRange || !dateRange.startDate || !dateRange.endDate) return;

            const startDate = new Date(dateRange.startDate);
            const endDate = new Date(dateRange.endDate);

            // Reset to first day of month for consistent month tracking
            const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
            const endDateMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

            while (currentDate <= endDateMonth) {
                const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
                coveredMonths.add(monthKey);
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
        };

        // Add months from all selected commute methods
        if (formData.commuteByMotorbike && formData.motorbikeDateRange) {
            addMonthsFromRange(formData.motorbikeDateRange);
        }
        if (formData.commuteByTaxi && formData.taxiDateRange) {
            addMonthsFromRange(formData.taxiDateRange);
        }
        if (formData.commuteByBus && formData.busDateRange) {
            addMonthsFromRange(formData.busDateRange);
        }
        if (formData.commuteByTrain && formData.trainDateRange) {
            addMonthsFromRange(formData.trainDateRange);
        }
        if (formData.commuteByCar && formData.carDateRange) {
            addMonthsFromRange(formData.carDateRange);
        }
        if (formData.workFromHome && formData.workFromHomeDateRange) {
            addMonthsFromRange(formData.workFromHomeDateRange);
        }

        // Check which months are covered
        const allMonths = Array.from({ length: 12 }, (_, i) =>
            `${reportingYear}-${String(i + 1).padStart(2, '0')}`
        );

        const uncoveredMonths = allMonths.filter(month => !coveredMonths.has(month));

        return {
            totalCovered: coveredMonths.size,
            totalRequired: 12,
            coveredMonths: Array.from(coveredMonths).sort(),
            uncoveredMonths,
            isComplete: coveredMonths.size === 12
        };
    };

    // Validate form
    const validateForm = () => {
        const errors = [];

        // Basic Information validation
        if (!formData.siteBuildingName) {
            errors.push('Site / Building Name is required');
        }
        if (!formData.stakeholderDepartment) {
            errors.push('Stakeholder / Department is required');
        }

        // Check if at least one commute method is selected
        const commuteMethods = [
            formData.commuteByMotorbike,
            formData.commuteByTaxi,
            formData.commuteByBus,
            formData.commuteByTrain,
            formData.commuteByCar,
            formData.workFromHome,
        ];

        if (!commuteMethods.some(method => method)) {
            errors.push('Please select at least one commute method or work from home option');
        }

        // Validate distance fields for selected commute methods
        if (formData.commuteByMotorbike && !formData.motorbikeDistance) {
            errors.push('Motorbike distance is required');
        }
        if (formData.commuteByTaxi && !formData.taxiDistance) {
            errors.push('Taxi distance is required');
        }
        if (formData.commuteByBus && !formData.busDistance) {
            errors.push('Bus distance is required');
        }
        if (formData.commuteByTrain && !formData.trainDistance) {
            errors.push('Train distance is required');
        }
        if (formData.commuteByCar && !formData.carDistance) {
            errors.push('Car distance is required');
        }

        // Validate date range for each selected commute method
        const validateDateRange = (dateRange, methodName) => {
            if (!dateRange || !dateRange.startDate || !dateRange.endDate) {
                errors.push(`${methodName}: Please select a date range`);
                return false;
            }

            const startDate = new Date(dateRange.startDate);
            const endDate = new Date(dateRange.endDate);

            if (startDate > endDate) {
                errors.push(`${methodName}: Start date must be before end date`);
                return false;
            }

            if (startDate.getFullYear() !== reportingYear || endDate.getFullYear() !== reportingYear) {
                errors.push(`${methodName}: Date range must be within ${reportingYear}`);
                return false;
            }

            return true;
        };

        if (formData.commuteByMotorbike) {
            validateDateRange(formData.motorbikeDateRange, 'Motorbike commute');
        }
        if (formData.commuteByTaxi) {
            validateDateRange(formData.taxiDateRange, 'Taxi commute');
        }
        if (formData.commuteByBus) {
            validateDateRange(formData.busDateRange, 'Bus commute');
        }
        if (formData.commuteByTrain) {
            validateDateRange(formData.trainDateRange, 'Train commute');
        }
        if (formData.commuteByCar) {
            validateDateRange(formData.carDateRange, 'Car commute');
        }
        if (formData.workFromHome) {
            validateDateRange(formData.workFromHomeDateRange, 'Work from home');
        }

        // Validate FTE hours for work from home
        if (formData.workFromHome && !formData.fteWorkingHours) {
            errors.push('FTE Working Hours are required for work from home');
        }

        // Validate mode selections
        if (formData.commuteByMotorbike && !formData.motorbikeMode) {
            errors.push('Please select Individual or Carpool for motorbike commute');
        }
        if (formData.commuteByTaxi && !formData.taxiMode) {
            errors.push('Please select Individual or Carpool for taxi commute');
        }
        if (formData.commuteByCar && !formData.carMode) {
            errors.push('Please select Individual or Carpool for car commute');
        }

        // Validate 12-month coverage
        const monthCoverage = validateMonthCoverage();
        if (!monthCoverage.isComplete) {
            errors.push(`You have only covered ${monthCoverage.totalCovered} out of 12 months. Please ensure your date ranges cover all 12 months of ${reportingYear}.`);

            // Add detailed information about uncovered months
            if (monthCoverage.uncoveredMonths.length > 0) {
                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
                const uncoveredMonthNames = monthCoverage.uncoveredMonths.map(month => {
                    const monthNum = parseInt(month.split('-')[1]);
                    return monthNames[monthNum - 1];
                });

                errors.push(`Missing months: ${uncoveredMonthNames.join(', ')}`);
            }
        }

        // Validate passenger emails
        const validatePassengerEmails = (emails, transportType) => {
            emails.forEach((email, index) => {
                if (email.trim() && !isValidEmail(email)) {
                    errors.push(`Invalid email address for ${transportType} passenger ${index + 1}`);
                }
            });
        };

        // Motorbike carpool validation
        if (formData.commuteByMotorbike && formData.motorbikeMode === 'carpool') {
            if (formData.carryOthersMotorbike) {
                validatePassengerEmails(formData.motorbikePassengerEmails, 'motorbike (carrying others)');
            }
            if (formData.travelWithOthersMotorbike) {
                validatePassengerEmails(formData.motorbikeTravelPassengerEmails, 'motorbike (traveling with others)');
            }
        }

        // Car carpool validation
        if (formData.commuteByCar && formData.carMode === 'carpool') {
            if (formData.carryOthersCar) {
                validatePassengerEmails(formData.carPassengerEmails, 'car (carrying others)');
            }
            if (formData.travelWithOthersCar) {
                validatePassengerEmails(formData.carTravelPassengerEmails, 'car (traveling with others)');
            }
        }

        // Taxi carpool validation
        if (formData.commuteByTaxi && formData.taxiMode === 'carpool' && formData.travelWithOthersTaxi) {
            validatePassengerEmails(formData.taxiPassengerEmails, 'taxi');
        }

        // Validate submitted by email
        if (!formData.submittedByEmail.trim()) {
            errors.push('Your email address is required');
        } else if (!isValidEmail(formData.submittedByEmail)) {
            errors.push('Please enter a valid email address for submission');
        }

        return errors;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validateForm();
        if (errors.length > 0) {
            errors.forEach(error => toast.error(error));
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

            // Convert date ranges to arrays of dates
            const motorbikeDates = formData.motorbikeDateRange ? dateRangeToDates(formData.motorbikeDateRange) : [];
            const taxiDates = formData.taxiDateRange ? dateRangeToDates(formData.taxiDateRange) : [];
            const busDates = formData.busDateRange ? dateRangeToDates(formData.busDateRange) : [];
            const trainDates = formData.trainDateRange ? dateRangeToDates(formData.trainDateRange) : [];
            const carDates = formData.carDateRange ? dateRangeToDates(formData.carDateRange) : [];
            const workFromHomeDates = formData.workFromHomeDateRange ? dateRangeToDates(formData.workFromHomeDateRange) : [];

            // Prepare submission data - extract values from option objects
            const submissionData = {
                // Basic Information
                siteBuildingName: formData.siteBuildingName?.value || '',
                stakeholderDepartment: formData.stakeholderDepartment?.value || '',
                submittedByEmail: String(formData.submittedByEmail || ''),
                reportingYear: reportingYear,

                // Mode information (for tracking)
                submissionMode: targetUserData ? 'admin' : 'self',
                targetUserId: urlUserId || null,
                companyUserId: companyData?._id || null,

                // Motorbike Commute
                commuteByMotorbike: formData.commuteByMotorbike,
                motorbikeMode: formData.motorbikeMode || 'individual',
                ...(formData.commuteByMotorbike && {
                    motorbikeDistance: Number(formData.motorbikeDistance) || 0,
                    motorbikeType: formData.motorbikeType?.value || '',
                    motorbikeDates: motorbikeDates.map(date => date.toISOString()),
                    motorbikeDateRange: formData.motorbikeDateRange,
                    ...(formData.motorbikeMode === 'carpool' && {
                        carryOthersMotorbike: formData.carryOthersMotorbike,
                        travelWithOthersMotorbike: formData.travelWithOthersMotorbike,
                        ...(formData.carryOthersMotorbike && {
                            personsCarriedMotorbike: Number(formData.personsCarriedMotorbike?.value || 0) || 0,
                            motorbikePassengerEmails: (Array.isArray(formData.motorbikePassengerEmails)
                                ? formData.motorbikePassengerEmails.map(e => String(e || '')).filter(e => e.trim())
                                : []),
                            motorbikePassengerUserIds: (Array.isArray(formData.motorbikePassengerUserIds)
                                ? formData.motorbikePassengerUserIds.map(id => String(id || '')).filter(id => id.trim())
                                : []),
                        }),
                        ...(formData.travelWithOthersMotorbike && {
                            personsTravelWithMotorbike: Number(formData.personsTravelWithMotorbike?.value || 0) || 0,
                            motorbikeTravelPassengerEmails: (Array.isArray(formData.motorbikeTravelPassengerEmails)
                                ? formData.motorbikeTravelPassengerEmails.map(e => String(e || '')).filter(e => e.trim())
                                : []),
                            motorbikeTravelPassengerUserIds: (Array.isArray(formData.motorbikeTravelPassengerUserIds)
                                ? formData.motorbikeTravelPassengerUserIds.map(id => String(id || '')).filter(id => id.trim())
                                : []),
                        }),
                    }),
                }),

                // Taxi Commute
                commuteByTaxi: formData.commuteByTaxi,
                taxiMode: formData.taxiMode || 'individual',
                ...(formData.commuteByTaxi && {
                    taxiPassengers: Number(formData.taxiPassengers?.value || 1) || 1,
                    taxiDistance: Number(formData.taxiDistance) || 0,
                    taxiType: formData.taxiType?.value || '',
                    taxiDates: taxiDates.map(date => date.toISOString()),
                    taxiDateRange: formData.taxiDateRange,
                    ...(formData.taxiMode === 'carpool' && {
                        travelWithOthersTaxi: formData.travelWithOthersTaxi,
                        ...(formData.travelWithOthersTaxi && {
                            personsTravelWithTaxi: Number(formData.personsTravelWithTaxi?.value || 0) || 0,
                            taxiPassengerEmails: (Array.isArray(formData.taxiPassengerEmails)
                                ? formData.taxiPassengerEmails.map(e => String(e || '')).filter(e => e.trim())
                                : []),
                            taxiPassengerUserIds: (Array.isArray(formData.taxiPassengerUserIds)
                                ? formData.taxiPassengerUserIds.map(id => String(id || '')).filter(id => id.trim())
                                : []),
                        }),
                    }),
                }),

                // Bus Commute
                commuteByBus: formData.commuteByBus,
                ...(formData.commuteByBus && {
                    busDistance: Number(formData.busDistance) || 0,
                    busType: formData.busType?.value || '',
                    busDates: busDates.map(date => date.toISOString()),
                    busDateRange: formData.busDateRange,
                }),

                // Train Commute
                commuteByTrain: formData.commuteByTrain,
                ...(formData.commuteByTrain && {
                    trainDistance: Number(formData.trainDistance) || 0,
                    trainType: formData.trainType?.value || '',
                    trainDates: trainDates.map(date => date.toISOString()),
                    trainDateRange: formData.trainDateRange,
                }),

                // Car Commute
                commuteByCar: formData.commuteByCar,
                carMode: formData.carMode || 'individual',
                ...(formData.commuteByCar && {
                    carDistance: Number(formData.carDistance) || 0,
                    carType: formData.carType?.value || '',
                    carFuelType: formData.carFuelType?.value || '',
                    carDates: carDates.map(date => date.toISOString()),
                    carDateRange: formData.carDateRange,
                    ...(formData.carMode === 'carpool' && {
                        carryOthersCar: formData.carryOthersCar,
                        travelWithOthersCar: formData.travelWithOthersCar,
                        ...(formData.carryOthersCar && {
                            personsCarriedCar: Number(formData.personsCarriedCar?.value || 0) || 0,
                            carPassengerEmails: (Array.isArray(formData.carPassengerEmails)
                                ? formData.carPassengerEmails.map(e => String(e || '')).filter(e => e.trim())
                                : []),
                            carPassengerUserIds: (Array.isArray(formData.carPassengerUserIds)
                                ? formData.carPassengerUserIds.map(id => String(id || '')).filter(id => id.trim())
                                : []),
                        }),
                        ...(formData.travelWithOthersCar && {
                            personsTravelWithCar: Number(formData.personsTravelWithCar?.value || 0) || 0,
                            carTravelPassengerEmails: (Array.isArray(formData.carTravelPassengerEmails)
                                ? formData.carTravelPassengerEmails.map(e => String(e || '')).filter(e => e.trim())
                                : []),
                            carTravelPassengerUserIds: (Array.isArray(formData.carTravelPassengerUserIds)
                                ? formData.carTravelPassengerUserIds.map(id => String(id || '')).filter(id => id.trim())
                                : []),
                        }),
                    }),
                }),

                // Work From Home
                workFromHome: formData.workFromHome,
                ...(formData.workFromHome && {
                    fteWorkingHours: Number(formData.fteWorkingHours) || 0,
                    workFromHomeDates: workFromHomeDates.map(date => date.toISOString()),
                    workFromHomeDateRange: formData.workFromHomeDateRange,
                }),

                // Quality Control
                qualityControlRemarks: String(formData.qualityControlRemarks || ''),

                submittedAt: new Date().toISOString(),
            };

            // Submit to backend
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/employee-commute/Create`,
                submissionData,
                {
                    headers: {
                        Authorization: `Bearer ${currentToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.warnings && response.data.warnings.length > 0) {
                setPooledEmailWarnings(response.data.warnings);
                toast.warning('Some colleagues have been marked as carpool partners. Please review.');
            } else {
                toast.success('Employee commuting data submitted successfully!');
                setSubmitted(true);

                // Reset form after 3 seconds
                setTimeout(() => {
                    setFormData({
                        siteBuildingName: null,
                        stakeholderDepartment: null,

                        // Motorbike Commute
                        commuteByMotorbike: false,
                        motorbikeMode: 'individual',
                        motorbikeDistance: '',
                        motorbikeType: { value: 'Small', label: 'Small (<125cc)' },
                        carryOthersMotorbike: false,
                        personsCarriedMotorbike: null,
                        motorbikePassengerEmails: [''],
                        motorbikePassengerUserIds: [''],
                        travelWithOthersMotorbike: false,
                        personsTravelWithMotorbike: null,
                        motorbikeTravelPassengerEmails: [''],
                        motorbikeTravelPassengerUserIds: [''],
                        motorbikeDateRange: null,

                        // Taxi Commute
                        commuteByTaxi: false,
                        taxiMode: 'individual',
                        taxiPassengers: { value: '1', label: '1 passenger' },
                        taxiDistance: '',
                        taxiType: { value: 'Regular taxi', label: 'Regular Taxi' },
                        travelWithOthersTaxi: false,
                        personsTravelWithTaxi: null,
                        taxiPassengerEmails: [''],
                        taxiPassengerUserIds: [''],
                        taxiDateRange: null,

                        // Bus Commute
                        commuteByBus: false,
                        busDistance: '',
                        busType: { value: 'Green Line Bus', label: 'Green Line Bus' },
                        busDateRange: null,

                        // Train Commute
                        commuteByTrain: false,
                        trainDistance: '',
                        trainType: { value: 'National rail', label: 'National Rail' },
                        trainDateRange: null,

                        // Car Commute
                        commuteByCar: false,
                        carMode: 'individual',
                        carDistance: '',
                        carType: { value: 'Average car', label: 'Average car - Unknown engine size' },
                        carFuelType: { value: 'Diesel', label: 'Diesel' },
                        carryOthersCar: false,
                        personsCarriedCar: null,
                        carPassengerEmails: [''],
                        carPassengerUserIds: [''],
                        travelWithOthersCar: false,
                        personsTravelWithCar: null,
                        carTravelPassengerEmails: [''],
                        carTravelPassengerUserIds: [''],
                        carDateRange: null,

                        // Work From Home
                        workFromHome: false,
                        fteWorkingHours: '',
                        workFromHomeDateRange: null,

                        // Quality Control
                        qualityControlRemarks: '',

                        // Submitted By
                        submittedByEmail: '',
                    });
                    setSubmitted(false);
                }, 3000);
            }

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

    if (submitted) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <Card>
                    <div className="text-center py-12">
                        <div className="text-green-500 text-5xl mb-4">✓</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Thank You for Your Submission!
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Your employee commuting data for {reportingYear} has been successfully submitted.
                        </p>
                        <Button
                            text="Submit Another Response"
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                            onClick={() => setSubmitted(false)}
                        />
                    </div>
                </Card>
            </div>
        );
    }

    if (!token && !urlToken && !getToken()) {
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
            <Card>
                <form onSubmit={handleSubmit}>
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                            <h1 className="text-2xl font-bold text-gray-800">
                                Employee Commuting Data Collection
                            </h1>
                            <div className="w-full md:w-48">
                                <Select
                                    label="Reporting Year"
                                    options={yearOptions}
                                    value={yearOptions.find(option => option.value === reportingYear)}
                                    onChange={handleReportingYearChange}
                                    helperText="Select the year you're reporting for"
                                />
                            </div>
                        </div>
                        <p className="text-gray-600">
                            Please provide accurate information about your commuting methods for {reportingYear} sustainability reporting.
                            Select date ranges for each commute method to indicate when you used that transportation.
                        </p>

                        {/* User welcome message */}
                        {userInfo && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-blue-800">
                                            {targetUserData ? `Admin Mode: Filling for ${targetUserData.name || targetUserData.email}` : `Welcome, ${userInfo.name || userInfo.email || 'User'}!`}
                                        </h3>
                                        <div className="mt-1 text-sm text-blue-700">
                                            {userInfo.buildingId && userInfo.buildingId.buildingName && (
                                                <p>Selected building: <span className="font-semibold">{userInfo.buildingId.buildingName}</span></p>
                                            )}
                                            {userInfo.department && (
                                                <p>Department: <span className="font-semibold">{userInfo.department}</span></p>
                                            )}
                                            {userInfo.email && (
                                                <p>Email: <span className="font-semibold">{userInfo.email}</span></p>
                                            )}
                                            {companyData && targetUserData && (
                                                <p className="text-xs text-gray-600 mt-1">
                                                    You are submitting on behalf of {targetUserData.name || targetUserData.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {pooledEmailWarnings.length > 0 && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h3 className="text-lg font-medium text-yellow-800 mb-2">
                                ⚠ Carpool Partner Notifications Sent
                            </h3>
                            <ul className="list-disc pl-5 text-yellow-700">
                                {pooledEmailWarnings.map((warning, index) => (
                                    <li key={index} className="mb-1">{warning}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Basic Information Section */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                            Basic Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {renderBuildingInput()}

                            <Select
                                label="Stakeholder / Department *"
                                placeholder="Select your department"
                                options={departmentOptions}
                                value={formData.stakeholderDepartment}
                                onChange={(selectedOption) => handleSelectChange('stakeholderDepartment', selectedOption)}
                                required
                                helperText={userInfo && userInfo.department ? `Auto-selected: ${userInfo.department}` : "Select your department"}
                            />
                        </div>

                        {!buildingsLoading && buildings.length === 0 && (
                            <div className="mt-4">
                                <Button
                                    text="Retry Loading Buildings"
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm"
                                    onClick={() => fetchBuildings(getToken())}
                                    disabled={buildingsLoading}
                                />
                            </div>
                        )}
                    </div>

                    {/* Month Coverage Summary */}
                    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Month Coverage Summary</h3>

                        {(() => {
                            const coverage = validateMonthCoverage();
                            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                                'July', 'August', 'September', 'October', 'November', 'December'];

                            return (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Coverage Progress:</span>
                                            <span className={`ml-2 text-sm font-semibold ${coverage.isComplete ? 'text-green-600' : 'text-yellow-600'}`}>
                                                {coverage.totalCovered} / 12 months
                                            </span>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${coverage.isComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {coverage.isComplete ? '✓ Complete Coverage' : '⚠ Incomplete'}
                                        </div>
                                    </div>

                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full ${coverage.isComplete ? 'bg-green-500' : 'bg-yellow-500'}`}
                                            style={{ width: `${(coverage.totalCovered / 12) * 100}%` }}
                                        ></div>
                                    </div>

                                    {!coverage.isComplete && (
                                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                                            <p className="text-sm text-blue-700 font-medium mb-1">To complete your submission:</p>
                                            <ul className="text-sm text-blue-600 list-disc pl-4 space-y-1">
                                                <li>Ensure your date ranges cover all 12 months of {reportingYear}</li>
                                                <li>Use the "Full Year ✓" shortcut in each date picker</li>
                                                <li>If you commute by different methods in different months, select appropriate date ranges for each method</li>
                                                <li>You can combine methods (e.g., Car for 6 months, Bus for 6 months) to cover all 12 months</li>
                                            </ul>
                                        </div>
                                    )}

                                    {/* Month-by-month breakdown */}
                                    <div className="mt-4">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Month-by-Month Breakdown:</p>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
                                            {monthNames.map((month, index) => {
                                                const monthKey = `${reportingYear}-${String(index + 1).padStart(2, '0')}`;
                                                const isCovered = coverage.coveredMonths.includes(monthKey);

                                                return (
                                                    <div
                                                        key={month}
                                                        className={`p-2 rounded border text-center ${isCovered ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                                                    >
                                                        <div className="text-xs font-medium">{month.substring(0, 3)}</div>
                                                        <div className={`text-xs ${isCovered ? 'text-green-600' : 'text-red-600'}`}>
                                                            {isCovered ? '✓' : '✗'}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Methods coverage summary */}
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Methods Used by Month:</p>
                                        <div className="space-y-2">
                                            {formData.commuteByMotorbike && formData.motorbikeDateRange && (
                                                <div className="flex items-center text-sm">
                                                    <span className="w-24 text-gray-600">Motorbike:</span>
                                                    <span className="text-gray-800">
                                                        {calculateRemainingMonths(formData.motorbikeDateRange.startDate, formData.motorbikeDateRange.endDate, reportingYear)} months
                                                    </span>
                                                </div>
                                            )}
                                            {formData.commuteByTaxi && formData.taxiDateRange && (
                                                <div className="flex items-center text-sm">
                                                    <span className="w-24 text-gray-600">Taxi:</span>
                                                    <span className="text-gray-800">
                                                        {calculateRemainingMonths(formData.taxiDateRange.startDate, formData.taxiDateRange.endDate, reportingYear)} months
                                                    </span>
                                                </div>
                                            )}
                                            {formData.commuteByBus && formData.busDateRange && (
                                                <div className="flex items-center text-sm">
                                                    <span className="w-24 text-gray-600">Bus:</span>
                                                    <span className="text-gray-800">
                                                        {calculateRemainingMonths(formData.busDateRange.startDate, formData.busDateRange.endDate, reportingYear)} months
                                                    </span>
                                                </div>
                                            )}
                                            {formData.commuteByTrain && formData.trainDateRange && (
                                                <div className="flex items-center text-sm">
                                                    <span className="w-24 text-gray-600">Train:</span>
                                                    <span className="text-gray-800">
                                                        {calculateRemainingMonths(formData.trainDateRange.startDate, formData.trainDateRange.endDate, reportingYear)} months
                                                    </span>
                                                </div>
                                            )}
                                            {formData.commuteByCar && formData.carDateRange && (
                                                <div className="flex items-center text-sm">
                                                    <span className="w-24 text-gray-600">Car:</span>
                                                    <span className="text-gray-800">
                                                        {calculateRemainingMonths(formData.carDateRange.startDate, formData.carDateRange.endDate, reportingYear)} months
                                                    </span>
                                                </div>
                                            )}
                                            {formData.workFromHome && formData.workFromHomeDateRange && (
                                                <div className="flex items-center text-sm">
                                                    <span className="w-24 text-gray-600">Work From Home:</span>
                                                    <span className="text-gray-800">
                                                        {calculateRemainingMonths(formData.workFromHomeDateRange.startDate, formData.workFromHomeDateRange.endDate, reportingYear)} months
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Motorbike Commute Section */}
                    <div className="mb-8 p-4 border rounded-lg">
                        <div className="flex items-center mb-4">
                            <Checkbox
                                label="Do you commute to the office by motorbike during the reporting year?"
                                checked={formData.commuteByMotorbike}
                                onChange={(e) => handleCheckboxChange('commuteByMotorbike', e.target.checked)}
                            />
                        </div>

                        {formData.commuteByMotorbike && (
                            <div className="ml-6 space-y-4">
                                {/* New: Individual vs Carpool selection */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        How do you commute by motorbike? *
                                    </label>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                id="motorbike-individual"
                                                name="motorbikeMode"
                                                value="individual"
                                                checked={formData.motorbikeMode === 'individual'}
                                                onChange={(e) => handleInputChange('motorbikeMode', e.target.value)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <label htmlFor="motorbike-individual" className="ml-2 block text-sm text-gray-700">
                                                Individual
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                id="motorbike-carpool"
                                                name="motorbikeMode"
                                                value="carpool"
                                                checked={formData.motorbikeMode === 'carpool'}
                                                onChange={(e) => handleInputChange('motorbikeMode', e.target.value)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <label htmlFor="motorbike-carpool" className="ml-2 block text-sm text-gray-700">
                                                Carpool
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Textinput
                                        label="Distance Travelled (km) *"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        placeholder="e.g., 15.5"
                                        value={formData.motorbikeDistance}
                                        onChange={(e) => handleInputChange('motorbikeDistance', e.target.value)}
                                        required
                                        helperText="One-way distance for each trip"
                                    />
                                    <Select
                                        label="Motorbike Type"
                                        options={transportationOptions.motorbikeTypes}
                                        value={formData.motorbikeType}
                                        onChange={(selectedOption) => handleSelectChange('motorbikeType', selectedOption)}
                                    />
                                </div>

                                {/* Date range picker for motorbike */}
                                {renderDateRangePicker('motorbike', 'Motorbike Commute Date Range')}

                                {/* Show additional questions only when Carpool is selected */}
                                {formData.motorbikeMode === 'carpool' && (
                                    <>
                                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="mb-4">
                                                <Checkbox
                                                    label="Do you carry any other employee to this organization?"
                                                    checked={formData.carryOthersMotorbike}
                                                    onChange={(e) => handleCheckboxChange('carryOthersMotorbike', e.target.checked)}
                                                />
                                            </div>

                                            {formData.carryOthersMotorbike && (
                                                <>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <Select
                                                            label="How many persons do you carry?"
                                                            options={transportationOptions.personOptions}
                                                            value={formData.personsCarriedMotorbike}
                                                            onChange={(selectedOption) => handlePersonsChange('personsCarriedMotorbike', selectedOption)}
                                                        />
                                                        <Textinput
                                                            label="Distance Travelled (km) *"
                                                            type="number"
                                                            step="0.1"
                                                            min="0"
                                                            placeholder="e.g., 15.5"
                                                            value={formData.motorbikeDistanceCarpool}
                                                            onChange={(e) => handleInputChange('motorbikeDistanceCarpool', e.target.value)}
                                                            required
                                                            helperText="One-way distance for each trip"
                                                        />
                                                    </div>

                                                    {renderPassengerEmails(
                                                        'motorbike',
                                                        'personsCarriedMotorbike',
                                                        'motorbikePassengerEmails',
                                                        'motorbikePassengerUserIds',
                                                        'List down all email addresses of colleagues you carry'
                                                    )}
                                                </>
                                            )}

                                            {/* <div className="mt-4">
                                                <Checkbox
                                                    label="Do you travel with any other employee to this organization?"
                                                    checked={formData.travelWithOthersMotorbike}
                                                    onChange={(e) => handleCheckboxChange('travelWithOthersMotorbike', e.target.checked)}
                                                />
                                            </div> */}

                                            {/* {formData.travelWithOthersMotorbike && (
                                                <>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <Select
                                                            label="How many persons do you travel with?"
                                                            options={transportationOptions.personOptions}
                                                            value={formData.personsTravelWithMotorbike}
                                                            onChange={(selectedOption) => handlePersonsChange('personsTravelWithMotorbike', selectedOption)}
                                                        />
                                                    </div>

                                                    {renderPassengerEmails(
                                                        'motorbikeTravel',
                                                        'personsTravelWithMotorbike',
                                                        'motorbikeTravelPassengerEmails',
                                                        'motorbikeTravelPassengerUserIds',
                                                        'List down all email addresses of colleagues you travel with'
                                                    )}
                                                </>
                                            )} */}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Taxi Commute Section */}
                    <div className="mb-8 p-4 border rounded-lg">
                        <div className="flex items-center mb-4">
                            <Checkbox
                                label="Do you commute to the office by taxi during the reporting year?"
                                checked={formData.commuteByTaxi}
                                onChange={(e) => handleCheckboxChange('commuteByTaxi', e.target.checked)}
                            />
                        </div>

                        {formData.commuteByTaxi && (
                            <div className="ml-6 space-y-4">
                                {/* Individual/Carpool selection for taxi */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        How do you commute by taxi? *
                                    </label>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                id="taxi-individual"
                                                name="taxiMode"
                                                value="individual"
                                                checked={formData.taxiMode === 'individual'}
                                                onChange={(e) => handleInputChange('taxiMode', e.target.value)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <label htmlFor="taxi-individual" className="ml-2 block text-sm text-gray-700">
                                                Individual
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                id="taxi-carpool"
                                                name="taxiMode"
                                                value="carpool"
                                                checked={formData.taxiMode === 'carpool'}
                                                onChange={(e) => handleInputChange('taxiMode', e.target.value)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <label htmlFor="taxi-carpool" className="ml-2 block text-sm text-gray-700">
                                                Carpool
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Select
                                        label="Number of Passengers (including yourself)"
                                        options={transportationOptions.taxiPassengerOptions}
                                        value={formData.taxiPassengers}
                                        onChange={(selectedOption) => handleSelectChange('taxiPassengers', selectedOption)}
                                    />
                                    <Textinput
                                        label="Distance Travelled (km) *"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        placeholder="e.g., 20.0"
                                        value={formData.taxiDistance}
                                        onChange={(e) => handleInputChange('taxiDistance', e.target.value)}
                                        required
                                        helperText="One-way distance for each trip"
                                    />
                                    <Select
                                        label="Taxi Type"
                                        options={transportationOptions.taxiTypes}
                                        value={formData.taxiType}
                                        onChange={(selectedOption) => handleSelectChange('taxiType', selectedOption)}
                                    />
                                </div>

                                {/* Date range picker for taxi */}
                                {renderDateRangePicker('taxi', 'Taxi Commute Date Range')}

                                {/* Show travel with others only when Carpool is selected */}
                                {formData.taxiMode === 'carpool' && (
                                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="mt-4">
                                            <Checkbox
                                                label="Do you travel with any other employee to this organization?"
                                                checked={formData.travelWithOthersTaxi}
                                                onChange={(e) => handleCheckboxChange('travelWithOthersTaxi', e.target.checked)}
                                            />
                                        </div>

                                        {formData.travelWithOthersTaxi && (
                                            <>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <Select
                                                        label="How many persons do you travel with?"
                                                        options={transportationOptions.personOptions}
                                                        value={formData.personsTravelWithTaxi}
                                                        onChange={(selectedOption) => handlePersonsChange('personsTravelWithTaxi', selectedOption)}
                                                    />

                                                    <div>
                                                        <Textinput
                                                            label="Distance Travelled (km) *"
                                                            type="number"
                                                            step="0.1"
                                                            min="0"
                                                            placeholder="e.g., 15.5"
                                                            value={formData.taxiDistanceCarpool}
                                                            onChange={(e) => handleInputChange('taxiDistanceCarpool', e.target.value)}
                                                            required
                                                            helperText="One-way distance for each trip"
                                                        />
                                                    </div>
                                                </div>

                                                {renderPassengerEmails(
                                                    'taxi',
                                                    'personsTravelWithTaxi',
                                                    'taxiPassengerEmails',
                                                    'taxiPassengerUserIds',
                                                    'List down all email addresses of colleagues you travel with'
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Bus Commute Section */}
                    <div className="mb-8 p-4 border rounded-lg">
                        <div className="flex items-center mb-4">
                            <Checkbox
                                label="Do you commute to the office by bus during the reporting year?"
                                checked={formData.commuteByBus}
                                onChange={(e) => handleCheckboxChange('commuteByBus', e.target.checked)}
                            />
                        </div>

                        {formData.commuteByBus && (
                            <div className="ml-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Textinput
                                        label="Distance Travelled (km) *"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        placeholder="e.g., 25.0"
                                        value={formData.busDistance}
                                        onChange={(e) => handleInputChange('busDistance', e.target.value)}
                                        required
                                        helperText="One-way distance for each trip"
                                    />
                                    <Select
                                        label="Bus Type"
                                        options={transportationOptions.busTypes}
                                        value={formData.busType}
                                        onChange={(selectedOption) => handleSelectChange('busType', selectedOption)}
                                    />
                                </div>

                                {/* Date range picker for bus */}
                                {renderDateRangePicker('bus', 'Bus Commute Date Range')}
                            </div>
                        )}
                    </div>

                    {/* Train Commute Section */}
                    <div className="mb-8 p-4 border rounded-lg">
                        <div className="flex items-center mb-4">
                            <Checkbox
                                label="Do you commute to the office by train during the reporting year?"
                                checked={formData.commuteByTrain}
                                onChange={(e) => handleCheckboxChange('commuteByTrain', e.target.checked)}
                            />
                        </div>

                        {formData.commuteByTrain && (
                            <div className="ml-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Textinput
                                        label="Distance Travelled (km) *"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        placeholder="e.g., 30.0"
                                        value={formData.trainDistance}
                                        onChange={(e) => handleInputChange('trainDistance', e.target.value)}
                                        required
                                        helperText="One-way distance for each trip"
                                    />
                                    <Select
                                        label="Train Type"
                                        options={transportationOptions.trainTypes}
                                        value={formData.trainType}
                                        onChange={(selectedOption) => handleSelectChange('trainType', selectedOption)}
                                    />
                                </div>

                                {/* Date range picker for train */}
                                {renderDateRangePicker('train', 'Train Commute Date Range')}
                            </div>
                        )}
                    </div>

                    {/* Car Commute Section */}
                    <div className="mb-8 p-4 border rounded-lg">
                        <div className="flex items-center mb-4">
                            <Checkbox
                                label="Do you commute to the office by car during the reporting year?"
                                checked={formData.commuteByCar}
                                onChange={(e) => handleCheckboxChange('commuteByCar', e.target.checked)}
                            />
                        </div>

                        {formData.commuteByCar && (
                            <div className="ml-6 space-y-4">
                                {/* New: Individual vs Carpool selection for car */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        How do you commute by car? *
                                    </label>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                id="car-individual"
                                                name="carMode"
                                                value="individual"
                                                checked={formData.carMode === 'individual'}
                                                onChange={(e) => handleInputChange('carMode', e.target.value)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <label htmlFor="car-individual" className="ml-2 block text-sm text-gray-700">
                                                Individual
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                id="car-carpool"
                                                name="carMode"
                                                value="carpool"
                                                checked={formData.carMode === 'carpool'}
                                                onChange={(e) => handleInputChange('carMode', e.target.value)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <label htmlFor="car-carpool" className="ml-2 block text-sm text-gray-700">
                                                Carpool
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Textinput
                                        label="Distance Travelled (km) *"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        placeholder="e.g., 18.5"
                                        value={formData.carDistance}
                                        onChange={(e) => handleInputChange('carDistance', e.target.value)}
                                        required
                                        helperText="One-way distance for each trip"
                                    />
                                    <Select
                                        label="Car Type"
                                        options={transportationOptions.carTypes}
                                        value={formData.carType}
                                        onChange={(selectedOption) => handleSelectChange('carType', selectedOption)}
                                    />
                                    <Select
                                        label="Car Fuel Type"
                                        options={transportationOptions.fuelTypes}
                                        value={formData.carFuelType}
                                        onChange={(selectedOption) => handleSelectChange('carFuelType', selectedOption)}
                                    />
                                </div>

                                {/* Date range picker for car */}
                                {renderDateRangePicker('car', 'Car Commute Date Range')}

                                {/* Show additional questions only when Carpool is selected */}
                                {formData.carMode === 'carpool' && (
                                    <>
                                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="mb-4">
                                                <Checkbox
                                                    label="Do you carry any other employee to this organization?"
                                                    checked={formData.carryOthersCar}
                                                    onChange={(e) => handleCheckboxChange('carryOthersCar', e.target.checked)}
                                                />
                                            </div>

                                            {formData.carryOthersCar && (
                                                <>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <Select
                                                            label="How many persons do you carry?"
                                                            options={transportationOptions.personOptions}
                                                            value={formData.personsCarriedCar}
                                                            onChange={(selectedOption) => handlePersonsChange('personsCarriedCar', selectedOption)}
                                                        />
                                                        <div>
                                                            <Textinput
                                                                label="Distance Travelled (km) *"
                                                                type="number"
                                                                step="0.1"
                                                                min="0"
                                                                placeholder="e.g., 18.5"
                                                                value={formData.carDistanceCarpool}
                                                                onChange={(e) => handleInputChange('carDistanceCarpool', e.target.value)}
                                                                required
                                                                helperText="One-way distance for each trip"
                                                            />
                                                        </div>
                                                    </div>

                                                    {renderPassengerEmails(
                                                        'car',
                                                        'personsCarriedCar',
                                                        'carPassengerEmails',
                                                        'carPassengerUserIds',
                                                        'List down all email addresses of colleagues you carry'
                                                    )}
                                                </>
                                            )}

                                            {/* <div className="mt-4">
                                                <Checkbox
                                                    label="Do you travel with any other employee to this organization?"
                                                    checked={formData.travelWithOthersCar}
                                                    onChange={(e) => handleCheckboxChange('travelWithOthersCar', e.target.checked)}
                                                />
                                            </div>

                                            {formData.travelWithOthersCar && (
                                                <>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <Select
                                                            label="How many persons do you travel with?"
                                                            options={transportationOptions.personOptions}
                                                            value={formData.personsTravelWithCar}
                                                            onChange={(selectedOption) => handlePersonsChange('personsTravelWithCar', selectedOption)}
                                                        />
                                                    </div>

                                                    {renderPassengerEmails(
                                                        'carTravel',
                                                        'personsTravelWithCar',
                                                        'carTravelPassengerEmails',
                                                        'carTravelPassengerUserIds',
                                                        'List down all email addresses of colleagues you travel with'
                                                    )}
                                                </>
                                            )} */}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Work From Home Section */}
                    <div className="mb-8 p-4 border rounded-lg">
                        <div className="flex items-center mb-4">
                            <Checkbox
                                label="Do you work from home during the reporting year?"
                                checked={formData.workFromHome}
                                onChange={(e) => handleCheckboxChange('workFromHome', e.target.checked)}
                            />
                        </div>

                        {formData.workFromHome && (
                            <div className="ml-6 space-y-4">
                                <div className="max-w-xs">
                                    <Textinput
                                        label="FTE Working Hours per employee *"
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        max="40"
                                        placeholder="e.g., 8, 20, 40"
                                        value={formData.fteWorkingHours}
                                        onChange={(e) => handleInputChange('fteWorkingHours', e.target.value)}
                                        required
                                        helperText="Full-Time Equivalent working hours (typically 8 hours per day)"
                                    />
                                </div>

                                {/* Date range picker for work from home */}
                                {renderDateRangePicker('workFromHome', 'Work From Home Date Range')}
                            </div>
                        )}
                    </div>

                    {/* Quality Control Section */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                            Quality Control & Remarks
                        </h2>
                        <Textarea
                            label="Remarks (Optional)"
                            placeholder="Any additional comments, clarifications, or special circumstances regarding your commute..."
                            rows={4}
                            value={formData.qualityControlRemarks}
                            onChange={(e) => handleInputChange('qualityControlRemarks', e.target.value)}
                        />
                    </div>

                    {/* Submission Information */}
                    <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                        <h3 className="text-lg font-medium text-blue-800 mb-3">
                            Submission Information
                        </h3>
                        <Textinput
                            label="Your Email Address *"
                            type="email"
                            placeholder="your.email@company.com"
                            value={formData.submittedByEmail}
                            onChange={(e) => handleInputChange('submittedByEmail', e.target.value)}
                            required
                            helperText="This email will be used for confirmation and communication regarding your submission"
                        />
                        {userInfo && userInfo.email && (
                            <p className="text-sm text-blue-600 mt-2">
                                {targetUserData ? `Employee's registered email: ${userInfo.email}` : `Your registered email: ${userInfo.email}`}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-6 border-t">
                        <Button
                            type="submit"
                            text={loading ? 'Submitting...' : `Submit ${reportingYear} Commuting Data`}
                            className="btn-dark"
                            disabled={loading}
                        />
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default EmployeeCommutingForm;