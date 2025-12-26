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

const EmployeeCommutingForm = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const urlToken = queryParams.get('token');

    // Form state
    const [formData, setFormData] = useState({
        // Basic Information
        siteBuildingName: '',
        stakeholderDepartment: '',

        // Motorbike Commute
        commuteByMotorbike: false,
        motorbikeDistance: '',
        motorbikeType: 'Small',
        carryOthersMotorbike: false,
        personsCarriedMotorbike: '0',
        motorbikePassengerEmails: [''],

        // Taxi Commute
        commuteByTaxi: false,
        taxiPassengers: '1',
        taxiDistance: '',
        taxiType: 'Regular taxi',
        travelWithOthersTaxi: false,
        personsTravelWithTaxi: '0',
        taxiPassengerEmails: [''],

        // Bus Commute
        commuteByBus: false,
        busDistance: '',
        busType: 'Green Line Bus',

        // Train Commute
        commuteByTrain: false,
        trainDistance: '',
        trainType: 'National rail',

        // Car Commute
        commuteByCar: false,
        carDistance: '',
        carType: 'Average car - Unknown engine size',
        carFuelType: 'Diesel',
        carryOthersCar: false,
        personsCarriedCar: '0',
        carPassengerEmails: [''],

        // Work From Home
        workFromHome: false,
        fteWorkingHours: '',

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
    const [token, setToken] = useState('');

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

    // Fetch buildings on component mount
    useEffect(() => {
        const currentToken = getToken();
        if (currentToken) {
            setToken(currentToken);
            fetchBuildings(currentToken);
        } else {
            toast.error('No authentication token found. Please access this page with a valid token.');
            setBuildingsLoading(false);
        }
    }, [urlToken]);

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
                }));
                setBuildings(buildingOptions);
            } else {
                toast.error('No buildings data received from server');
            }
        } catch (error) {
            console.error('Error fetching buildings:', error);

            if (error.response) {
                switch (error.response.status) {
                    case 401:
                        toast.error('Authentication failed. Please refresh the page with a valid token.');
                        break;
                    case 403:
                        toast.error('You do not have permission to view buildings.');
                        break;
                    case 404:
                        toast.error('Buildings API endpoint not found.');
                        break;
                    default:
                        toast.error(`Failed to load buildings: ${error.response.data?.message || 'Unknown error'}`);
                }
            } else if (error.request) {
                toast.error('Network error. Please check your connection.');
            } else {
                toast.error('Failed to load buildings. Please try again later.');
            }

            setBuildings([]);
        } finally {
            setBuildingsLoading(false);
        }
    };

    // Refresh buildings
    const refreshBuildings = async () => {
        const currentToken = getToken();
        if (currentToken) {
            await fetchBuildings(currentToken);
        }
    };

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
            { value: 'Premium taxi', label: 'Premium Taxi' },
            { value: 'Electric taxi', label: 'Electric Taxi' },
            { value: 'Shared taxi', label: 'Shared Taxi/Pool' },
        ],

        busTypes: [
            { value: 'Green Line Bus', label: 'Green Line Bus' },
            { value: 'Local bus', label: 'Local Bus' },
            { value: 'Express bus', label: 'Express Bus' },
            { value: 'Electric bus', label: 'Electric Bus' },
            { value: 'Private bus', label: 'Private Company Bus' },
        ],

        trainTypes: [
            { value: 'National rail', label: 'National Rail' },
            { value: 'Subway/Metro', label: 'Subway/Metro' },
            { value: 'Light rail', label: 'Light Rail' },
            { value: 'Commuter rail', label: 'Commuter Rail' },
            { value: 'High speed rail', label: 'High Speed Rail' },
        ],

        carTypes: [
            { value: 'Small car', label: 'Small car (<1.4L)' },
            { value: 'Average car', label: 'Average car - Unknown engine size' },
            { value: 'Large car', label: 'Large car (>2.0L)' },
            { value: 'Luxury car', label: 'Luxury car' },
            { value: 'SUV', label: 'SUV' },
            { value: 'Van', label: 'Van' },
            { value: 'Electric car', label: 'Electric Car' },
            { value: 'Hybrid car', label: 'Hybrid Car' },
        ],

        fuelTypes: [
            { value: 'Petrol', label: 'Petrol' },
            { value: 'Diesel', label: 'Diesel' },
            { value: 'CNG', label: 'CNG' },
            { value: 'LPG', label: 'LPG' },
            { value: 'Electric', label: 'Electric' },
            { value: 'Hybrid', label: 'Hybrid (Petrol/Electric)' },
        ],

        stakeholderDepartments: [
            { value: 'Engineering', label: 'Engineering' },
            { value: 'Marketing', label: 'Marketing' },
            { value: 'Sales', label: 'Sales' },
            { value: 'Human Resources', label: 'Human Resources' },
            { value: 'Finance', label: 'Finance' },
            { value: 'Operations', label: 'Operations' },
            { value: 'IT', label: 'IT' },
            { value: 'Research & Development', label: 'Research & Development' },
            { value: 'Customer Support', label: 'Customer Support' },
            { value: 'Administration', label: 'Administration' },
            { value: 'Other', label: 'Other' },
        ],
    };

    // Handle checkbox changes
    const handleCheckboxChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
            ...(!value && {
                ...(field === 'commuteByMotorbike' && {
                    motorbikeDistance: '',
                    motorbikeType: 'Small',
                    carryOthersMotorbike: false,
                    personsCarriedMotorbike: '0',
                    motorbikePassengerEmails: [''],
                }),
                ...(field === 'carryOthersMotorbike' && {
                    personsCarriedMotorbike: '0',
                    motorbikePassengerEmails: [''],
                }),
                ...(field === 'commuteByTaxi' && {
                    taxiPassengers: '1',
                    taxiDistance: '',
                    taxiType: 'Regular taxi',
                    travelWithOthersTaxi: false,
                    personsTravelWithTaxi: '0',
                    taxiPassengerEmails: [''],
                }),
                ...(field === 'travelWithOthersTaxi' && {
                    personsTravelWithTaxi: '0',
                    taxiPassengerEmails: [''],
                }),
                ...(field === 'commuteByBus' && {
                    busDistance: '',
                    busType: 'Green Line Bus',
                }),
                ...(field === 'commuteByTrain' && {
                    trainDistance: '',
                    trainType: 'National rail',
                }),
                ...(field === 'commuteByCar' && {
                    carDistance: '',
                    carType: 'Average car - Unknown engine size',
                    carFuelType: 'Diesel',
                    carryOthersCar: false,
                    personsCarriedCar: '0',
                    carPassengerEmails: [''],
                }),
                ...(field === 'carryOthersCar' && {
                    personsCarriedCar: '0',
                    carPassengerEmails: [''],
                }),
                ...(field === 'workFromHome' && {
                    fteWorkingHours: '',
                }),
            }),
        }));
    };

    // Handle input changes for Textinput
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handle select changes - extract value from object
    const handleSelectChange = (field, selectedOption) => {
        // If selectedOption is an object with value property, extract it
        // Otherwise use the value directly
        const value = selectedOption?.value !== undefined ? selectedOption.value : selectedOption;
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handle passenger emails
    const handlePassengerEmailsChange = (transportType, index, value) => {
        setFormData(prev => {
            const newEmails = [...prev[`${transportType}PassengerEmails`]];
            newEmails[index] = value;

            const personCountField = transportType === 'car' ? 'personsCarriedCar' :
                transportType === 'motorbike' ? 'personsCarriedMotorbike' :
                    'personsTravelWithTaxi';
            const maxPersons = parseInt(prev[personCountField] || 0);

            if (index === newEmails.length - 1 && value.trim() !== '' && newEmails.length < maxPersons) {
                newEmails.push('');
            }

            return {
                ...prev,
                [`${transportType}PassengerEmails`]: newEmails,
            };
        });
    };

    // Handle number of persons change
    const handlePersonsChange = (field, selectedOption) => {
        // Extract value from select option
        const value = selectedOption?.value !== undefined ? selectedOption.value : selectedOption;
        const intValue = parseInt(value) || 0;

        setFormData(prev => {
            const transportType = field.includes('Motorbike') ? 'motorbike' :
                field.includes('Taxi') ? 'taxi' : 'car';
            const emailField = `${transportType}PassengerEmails`;

            const currentEmails = prev[emailField] || [''];
            const newEmails = Array(Math.max(intValue, 1)).fill('').map((_, i) =>
                i < currentEmails.length ? currentEmails[i] : ''
            );

            return {
                ...prev,
                [field]: value,
                [emailField]: newEmails,
            };
        });
    };

    // Validate email format
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
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

        // Validate FTE hours for work from home
        if (formData.workFromHome && !formData.fteWorkingHours) {
            errors.push('FTE Working Hours are required for work from home');
        }

        // Validate passenger emails
        const validatePassengerEmails = (emails, transportType) => {
            emails.forEach((email, index) => {
                if (email.trim() && !isValidEmail(email)) {
                    errors.push(`Invalid email address for ${transportType} passenger ${index + 1}`);
                }
            });
        };

        if (formData.commuteByMotorbike && formData.carryOthersMotorbike) {
            validatePassengerEmails(formData.motorbikePassengerEmails, 'motorbike');
        }
        if (formData.commuteByTaxi && formData.travelWithOthersTaxi) {
            validatePassengerEmails(formData.taxiPassengerEmails, 'taxi');
        }
        if (formData.commuteByCar && formData.carryOthersCar) {
            validatePassengerEmails(formData.carPassengerEmails, 'car');
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
    // Handle form submission - MINIMAL APPROACH
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

            // Create a completely new object with only primitive values
            const submissionData = {
                // Basic Information
                siteBuildingName: formData.siteBuildingName?.value || formData.siteBuildingName || '',
                stakeholderDepartment: formData.stakeholderDepartment?.value || formData.stakeholderDepartment || '',
                submittedByEmail: String(formData.submittedByEmail || ''),

                // Motorbike Commute
                commuteByMotorbike: !!formData.commuteByMotorbike,
                ...(formData.commuteByMotorbike && {
                    motorbikeDistance: Number(formData.motorbikeDistance) || 0,
                    motorbikeType: formData.motorbikeType?.value || formData.motorbikeType || '',
                    carryOthersMotorbike: !!formData.carryOthersMotorbike,
                    ...(formData.carryOthersMotorbike && {
                        personsCarriedMotorbike: Number(formData.personsCarriedMotorbike?.value || formData.personsCarriedMotorbike) || 0,
                        motorbikePassengerEmails: (Array.isArray(formData.motorbikePassengerEmails)
                            ? formData.motorbikePassengerEmails.map(e => String(e || '')).filter(e => e.trim())
                            : []),
                    }),
                }),

                // Taxi Commute
                commuteByTaxi: !!formData.commuteByTaxi,
                ...(formData.commuteByTaxi && {
                    taxiPassengers: Number(formData.taxiPassengers?.value || formData.taxiPassengers) || 1,
                    taxiDistance: Number(formData.taxiDistance) || 0,
                    taxiType: formData.taxiType?.value || formData.taxiType || '',
                    travelWithOthersTaxi: !!formData.travelWithOthersTaxi,
                    ...(formData.travelWithOthersTaxi && {
                        personsTravelWithTaxi: Number(formData.personsTravelWithTaxi?.value || formData.personsTravelWithTaxi) || 0,
                        taxiPassengerEmails: (Array.isArray(formData.taxiPassengerEmails)
                            ? formData.taxiPassengerEmails.map(e => String(e || '')).filter(e => e.trim())
                            : []),
                    }),
                }),

                // Bus Commute
                commuteByBus: !!formData.commuteByBus,
                ...(formData.commuteByBus && {
                    busDistance: Number(formData.busDistance) || 0,
                    busType: formData.busType?.value || formData.busType || '',
                }),

                // Train Commute
                commuteByTrain: !!formData.commuteByTrain,
                ...(formData.commuteByTrain && {
                    trainDistance: Number(formData.trainDistance) || 0,
                    trainType: formData.trainType?.value || formData.trainType || '',
                }),

                // Car Commute
                commuteByCar: !!formData.commuteByCar,
                ...(formData.commuteByCar && {
                    carDistance: Number(formData.carDistance) || 0,
                    carType: formData.carType?.value || formData.carType || '',
                    carFuelType: formData.carFuelType?.value || formData.carFuelType || '',
                    carryOthersCar: !!formData.carryOthersCar,
                    ...(formData.carryOthersCar && {
                        personsCarriedCar: Number(formData.personsCarriedCar?.value || formData.personsCarriedCar) || 0,
                        carPassengerEmails: (Array.isArray(formData.carPassengerEmails)
                            ? formData.carPassengerEmails.map(e => String(e || '')).filter(e => e.trim())
                            : []),
                    }),
                }),

                // Work From Home
                workFromHome: !!formData.workFromHome,
                ...(formData.workFromHome && {
                    fteWorkingHours: Number(formData.fteWorkingHours) || 0,
                }),

                // Quality Control
                qualityControlRemarks: String(formData.qualityControlRemarks || ''),

                submittedAt: new Date().toISOString(),
            };

            // TEST: Verify it can be stringified
            console.log('Testing JSON.stringify...');
            JSON.stringify(submissionData);
            console.log('JSON.stringify test passed!');

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

            // Handle response...
            if (response.data.warnings && response.data.warnings.length > 0) {
                setPooledEmailWarnings(response.data.warnings);
                toast.warning('Some colleagues have been marked as carpool partners. Please review.');
            } else {
                toast.success('Employee commuting data submitted successfully!');
                setSubmitted(true);

                setTimeout(() => {
                    setFormData({
                        siteBuildingName: '',
                        stakeholderDepartment: '',
                        commuteByMotorbike: false,
                        motorbikeDistance: '',
                        motorbikeType: 'Small',
                        carryOthersMotorbike: false,
                        personsCarriedMotorbike: '0',
                        motorbikePassengerEmails: [''],
                        commuteByTaxi: false,
                        taxiPassengers: '1',
                        taxiDistance: '',
                        taxiType: 'Regular taxi',
                        travelWithOthersTaxi: false,
                        personsTravelWithTaxi: '0',
                        taxiPassengerEmails: [''],
                        commuteByBus: false,
                        busDistance: '',
                        busType: 'Green Line Bus',
                        commuteByTrain: false,
                        trainDistance: '',
                        trainType: 'National rail',
                        commuteByCar: false,
                        carDistance: '',
                        carType: 'Average car - Unknown engine size',
                        carFuelType: 'Diesel',
                        carryOthersCar: false,
                        personsCarriedCar: '0',
                        carPassengerEmails: [''],
                        workFromHome: false,
                        fteWorkingHours: '',
                        qualityControlRemarks: '',
                        submittedByEmail: '',
                    });
                    setSubmitted(false);
                }, 3000);
            }

        } catch (error) {
            console.error('Full submission error:', error);

            // More detailed error logging
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);

            if (error.message && error.message.includes('circular structure')) {
                console.error('CIRCULAR REFERENCE DETECTED!');
                // Log formData to find the culprit
                console.error('FormData structure:', formData);

                // Check each property
                Object.keys(formData).forEach(key => {
                    try {
                        JSON.stringify(formData[key]);
                    } catch (err) {
                        console.error(`Circular reference found in: ${key}`, formData[key]);
                    }
                });
            }

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

    // Render passenger email inputs
    const renderPassengerEmails = (transportType, countField, emailsField, label) => {
        const count = parseInt(formData[countField]) || 0;

        if (count <= 0) return null;

        return (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    {label} ({count} {count === 1 ? 'person' : 'persons'})
                </label>
                <div className="space-y-3">
                    {formData[emailsField].slice(0, count).map((email, index) => (
                        <Textinput
                            key={index}
                            type="email"
                            placeholder={`Colleague ${index + 1} email address`}
                            value={email}
                            onChange={(e) => handlePassengerEmailsChange(transportType, index, e.target.value)}
                            className="w-full"
                        />
                    ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Note: If a colleague's email is listed here, they will receive a notification
                    that they've been marked as a carpool partner.
                </p>
            </div>
        );
    };

    // Render a fallback building input if API fails
    const renderBuildingInput = () => {
        if (buildings.length === 0 && !buildingsLoading) {
            return (
                <Textinput
                    label="Site / Building Name *"
                    placeholder="e.g., Main Office, Building A"
                    value={formData.siteBuildingName}
                    onChange={(e) => handleInputChange('siteBuildingName', e.target.value)}
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
                helperText={buildingsLoading ? "Loading buildings..." : "Select your work location"}
            />
        );
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
                            Your employee commuting data has been successfully submitted.
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
                        <p className="text-sm text-gray-500 mb-4">
                            Example URL: /AddfromEmployee?token=eyJhbGciOiJIUzI1NiIs...
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
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Employee Commuting Data Collection
                        </h1>
                        <p className="text-gray-600">
                            Please provide accurate information about your commuting methods for sustainability reporting.
                        </p>
                        <div className="mt-2 text-xs text-gray-500">
                            {urlToken ? (
                                <span className="text-green-600">✓ Authenticated via URL token</span>
                            ) : token ? (
                                <span className="text-blue-600">✓ Using stored authentication</span>
                            ) : null}
                        </div>
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
                            <p className="text-sm text-yellow-600 mt-2">
                                These colleagues have been notified that they've been marked as carpool partners.
                                They may need to revise their forms to avoid duplicate reporting.
                            </p>
                            <Button
                                text="Continue Anyway"
                                className="mt-3 bg-yellow-500 hover:bg-yellow-600 text-white"
                                onClick={() => {
                                    setPooledEmailWarnings([]);
                                    toast.success('Form submitted successfully!');
                                    setSubmitted(true);
                                }}
                            />
                        </div>
                    )}

                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                            Basic Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {renderBuildingInput()}

                            <Select
                                label="Stakeholder / Department *"
                                placeholder="Select your department"
                                options={transportationOptions.stakeholderDepartments}
                                value={formData.stakeholderDepartment}
                                onChange={(selectedOption) => handleSelectChange('stakeholderDepartment', selectedOption)}
                                required
                            />
                        </div>

                        {!buildingsLoading && buildings.length === 0 && (
                            <div className="mt-4">
                                <Button
                                    text="Retry Loading Buildings"
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm"
                                    onClick={refreshBuildings}
                                    disabled={buildingsLoading}
                                />
                            </div>
                        )}
                    </div>

                    {/* All other form sections remain the same, just update the onChange handlers */}
                    {/* Motorbike Commute Section */}
                    <div className="mb-8 p-4 border rounded-lg">
                        <div className="flex items-center mb-4">
                            <Checkbox
                                label="Do you commute to the office by motorbike during the reporting year?"
                                checked={formData.commuteByMotorbike}
                                onChange={(checked) => handleCheckboxChange('commuteByMotorbike', checked)}
                            />
                        </div>

                        {formData.commuteByMotorbike && (
                            <div className="ml-6 space-y-4">
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
                                    />
                                    <Select
                                        label="Motorbike Type"
                                        options={transportationOptions.motorbikeTypes}
                                        value={formData.motorbikeType}
                                        onChange={(selectedOption) => handleSelectChange('motorbikeType', selectedOption)}
                                    />
                                </div>

                                <div className="mt-4">
                                    <Checkbox
                                        label="Do you carry any other employee to this organization?"
                                        checked={formData.carryOthersMotorbike}
                                        onChange={(checked) => handleCheckboxChange('carryOthersMotorbike', checked)}
                                    />
                                </div>

                                {formData.carryOthersMotorbike && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Select
                                                label="How many persons do you carry?"
                                                options={[
                                                    { value: '1', label: '1 person' },
                                                    { value: '2', label: '2 persons' },
                                                ]}
                                                value={formData.personsCarriedMotorbike}
                                                onChange={(selectedOption) => handlePersonsChange('personsCarriedMotorbike', selectedOption)}
                                            />
                                        </div>

                                        {renderPassengerEmails(
                                            'motorbike',
                                            'personsCarriedMotorbike',
                                            'motorbikePassengerEmails',
                                            'List down all email addresses of colleagues you carry'
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Taxi Commute Section - update other sections similarly */}
                    <div className="mb-8 p-4 border rounded-lg">
                        <div className="flex items-center mb-4">
                            <Checkbox
                                label="Do you commute to the office by taxi during the reporting year?"
                                checked={formData.commuteByTaxi}
                                onChange={(checked) => handleCheckboxChange('commuteByTaxi', checked)}
                            />
                        </div>

                        {formData.commuteByTaxi && (
                            <div className="ml-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Select
                                        label="Number of Passengers (including yourself)"
                                        options={[
                                            { value: '1', label: '1 passenger' },
                                            { value: '2', label: '2 passengers' },
                                            { value: '3', label: '3 passengers' },
                                            { value: '4', label: '4 passengers' },
                                            { value: '5', label: '5+ passengers' },
                                        ]}
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
                                    />
                                    <Select
                                        label="Taxi Type"
                                        options={transportationOptions.taxiTypes}
                                        value={formData.taxiType}
                                        onChange={(selectedOption) => handleSelectChange('taxiType', selectedOption)}
                                    />
                                </div>

                                <div className="mt-4">
                                    <Checkbox
                                        label="Do you travel with any other employee to this organization?"
                                        checked={formData.travelWithOthersTaxi}
                                        onChange={(checked) => handleCheckboxChange('travelWithOthersTaxi', checked)}
                                    />
                                </div>

                                {formData.travelWithOthersTaxi && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Select
                                                label="How many persons do you travel with?"
                                                options={[
                                                    { value: '1', label: '1 person' },
                                                    { value: '2', label: '2 persons' },
                                                    { value: '3', label: '3 persons' },
                                                    { value: '4', label: '4 persons' },
                                                ]}
                                                value={formData.personsTravelWithTaxi}
                                                onChange={(selectedOption) => handlePersonsChange('personsTravelWithTaxi', selectedOption)}
                                            />
                                        </div>

                                        {renderPassengerEmails(
                                            'taxi',
                                            'personsTravelWithTaxi',
                                            'taxiPassengerEmails',
                                            'List down all email addresses of colleagues you travel with'
                                        )}
                                    </>
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
                                onChange={(checked) => handleCheckboxChange('commuteByBus', checked)}
                            />
                        </div>

                        {formData.commuteByBus && (
                            <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Textinput
                                    label="Distance Travelled (km) *"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    placeholder="e.g., 25.0"
                                    value={formData.busDistance}
                                    onChange={(e) => handleInputChange('busDistance', e.target.value)}
                                    required
                                />
                                <Select
                                    label="Bus Type"
                                    options={transportationOptions.busTypes}
                                    value={formData.busType}
                                    onChange={(selectedOption) => handleSelectChange('busType', selectedOption)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Train Commute Section */}
                    <div className="mb-8 p-4 border rounded-lg">
                        <div className="flex items-center mb-4">
                            <Checkbox
                                label="Do you commute to the office by train during the reporting year?"
                                checked={formData.commuteByTrain}
                                onChange={(checked) => handleCheckboxChange('commuteByTrain', checked)}
                            />
                        </div>

                        {formData.commuteByTrain && (
                            <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Textinput
                                    label="Distance Travelled (km) *"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    placeholder="e.g., 30.0"
                                    value={formData.trainDistance}
                                    onChange={(e) => handleInputChange('trainDistance', e.target.value)}
                                    required
                                />
                                <Select
                                    label="Train Type"
                                    options={transportationOptions.trainTypes}
                                    value={formData.trainType}
                                    onChange={(selectedOption) => handleSelectChange('trainType', selectedOption)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Car Commute Section */}
                    <div className="mb-8 p-4 border rounded-lg">
                        <div className="flex items-center mb-4">
                            <Checkbox
                                label="Do you commute to the office by car during the reporting year?"
                                checked={formData.commuteByCar}
                                onChange={(checked) => handleCheckboxChange('commuteByCar', checked)}
                            />
                        </div>

                        {formData.commuteByCar && (
                            <div className="ml-6 space-y-4">
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

                                <div className="mt-4">
                                    <Checkbox
                                        label="Do you carry any other employee to this organization?"
                                        checked={formData.carryOthersCar}
                                        onChange={(checked) => handleCheckboxChange('carryOthersCar', checked)}
                                    />
                                </div>

                                {formData.carryOthersCar && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Select
                                                label="How many persons do you carry?"
                                                options={[
                                                    { value: '1', label: '1 person' },
                                                    { value: '2', label: '2 persons' },
                                                    { value: '3', label: '3 persons' },
                                                    { value: '4', label: '4 persons' },
                                                    { value: '5', label: '5+ persons' },
                                                ]}
                                                value={formData.personsCarriedCar}
                                                onChange={(selectedOption) => handlePersonsChange('personsCarriedCar', selectedOption)}
                                            />
                                        </div>

                                        {renderPassengerEmails(
                                            'car',
                                            'personsCarriedCar',
                                            'carPassengerEmails',
                                            'List down all email addresses of colleagues you carry'
                                        )}
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
                                onChange={(checked) => handleCheckboxChange('workFromHome', checked)}
                            />
                        </div>

                        {formData.workFromHome && (
                            <div className="ml-6">
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
                            </div>
                        )}
                    </div>

                    {/* Quality Control Section */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                            Quality Control & Remarks
                        </h2>
                        <Textarea
                            label="Remarks"
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
                    </div>

                    {/* Form Validation Summary */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">Form Summary</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>✓ Building Selected: {formData.siteBuildingName ? 'Complete' : 'Required'}</li>
                            <li>✓ Department Selected: {formData.stakeholderDepartment ? 'Complete' : 'Required'}</li>
                            <li>✓ Commute Methods Selected: {[
                                formData.commuteByMotorbike && 'Motorbike',
                                formData.commuteByTaxi && 'Taxi',
                                formData.commuteByBus && 'Bus',
                                formData.commuteByTrain && 'Train',
                                formData.commuteByCar && 'Car',
                                formData.workFromHome && 'Work From Home',
                            ].filter(Boolean).join(', ') || 'None selected'}</li>
                            <li>✓ Email for Submission: {formData.submittedByEmail ? 'Provided' : 'Required'}</li>
                        </ul>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-between items-center pt-6 border-t">
                        <div className="text-sm text-gray-500">
                            <p>All fields marked with * are required.</p>
                            <p className="mt-1">Your data will be used for sustainability reporting purposes only.</p>
                        </div>
                        <Button
                            type="submit"
                            text={loading ? 'Submitting...' : 'Submit Commuting Data'}
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