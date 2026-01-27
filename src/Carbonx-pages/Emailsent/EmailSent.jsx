import React, { useState, useEffect, } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import axios from "axios";
import { toast } from "react-toastify";
import InputGroup from "@/components/ui/InputGroup";
import CustomSelect from "@/components/ui/Select";
import ToggleButton from "@/components/ui/ToggleButton";

// Helper function to get ordinal suffix
const getOrdinalSuffix = (num) => {
    if (num > 3 && num < 21) return 'th';
    switch (num % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
};

const ErrorMessage = ({ message }) => {
    if (!message) return null;
    return (
        <p className="text-red-500 text-xs mt-1 flex items-center">
            {message}
        </p>
    );
};

const EmailSent = () => {
    const [formData, setFormData] = useState({
        userName: "",
        userEmailId: "",
        totalEmployees: "",
        minEmployeesRequired: 0,
        selectedEmployees: [], // Store selected employee objects { value, label }
        startDateTime: "",
        endDateTime: "",
        subject: "",
        //subject: "Employee Commuting Data – Action Required",
        // formLink: "https://ksvvmxbk-5173.inc1.devtunnels.ms/AddfromEmployee",
        formLink: "http://carbonx.srptechs.com/AddfromEmployee",
        totalReminders: "",
        reminderDates: "",
        reminderSubject: "",
        // reminderSubject: "Reminder Employee Commuting Data Form Submission",
        reminderMessageBody: "",
        intervalType: "hours", // "hours" or "days"
        intervalValue: "", // number value
        // reminderMessageBody:
        //     "This is a kind reminder to please complete the Employee Commuting Data Form if you have not yet submitted your response. Your participation is important for our sustainability reporting.",
    });

    const [loading, setLoading] = useState(false);
    const [employeesOptions, setEmployeesOptions] = useState([]); // All employees options
    const [emailCount, setEmailCount] = useState(0);
    const [showReminderDates, setShowReminderDates] = useState(false);
    const [displayText, setDisplayText] = useState("");
    const [errors, setErrors] = useState({});



    // Fetch company users on component mount
    useEffect(() => {
        const fetchCompanyUsers = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/auth/getCompanyUsers?limit=1000`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                const users = response.data.data.users || [];

                //  CHANGED: include userId
                const options = users.map((u) => ({
                    value: u.email,
                    label: `${u.name} (${u.email})`,
                    userId: u._id, //  ADDED
                }));

                setEmployeesOptions(options);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load company employees");
            }
        };

        fetchCompanyUsers();
    }, [formData.minEmployeesRequired]);

    // Update email count whenever selectedEmployees change
    useEffect(() => {
        setEmailCount(formData.selectedEmployees.length);
    }, [formData.selectedEmployees]);

    const handleInputChange = (field, value) => {
        if (field === 'totalEmployees') {
            const newTotal = Number(value);
            const currentSelected = formData.selectedEmployees;
            const currentMinRequired = Number(formData.minEmployeesRequired);

            // Clear any existing errors
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.selectedEmployees;
                delete newErrors.totalEmployees;
                if (prev.minEmployeesRequired?.includes('cannot exceed total')) {
                    delete newErrors.minEmployeesRequired;
                }
                return newErrors;
            });

            // If reducing total below current selection, auto-trim the emails
            if (newTotal > 0 && currentSelected.length > newTotal) {
                // Trim selected employees to match new total
                const trimmedSelection = currentSelected.slice(0, newTotal);

                setFormData(prev => ({
                    ...prev,
                    [field]: value,
                    selectedEmployees: trimmedSelection
                }));

                // Show toast notification
                setTimeout(() => {
                    toast.warning(`Automatically trimmed selection from ${currentSelected.length} to ${newTotal} employees to match total limit.`, {
                        autoClose: 4000,
                        position: "top-right"
                    });
                }, 100);
            } else {
                setFormData(prev => ({
                    ...prev,
                    [field]: value
                }));
            }

            // Validate minEmployeesRequired doesn't exceed new total
            if (currentMinRequired > newTotal) {
                setErrors(prev => ({
                    ...prev,
                    minEmployeesRequired: `Minimum required (${currentMinRequired}) cannot exceed total employees (${newTotal})`
                }));
            }
        }

        else if (field === 'minEmployeesRequired') {
            const newMin = Number(value);
            const total = Number(formData.totalEmployees);

            setFormData(prev => ({
                ...prev,
                [field]: value
            }));

            // Clear existing minEmployeesRequired error
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.minEmployeesRequired;
                return newErrors;
            });

            setTimeout(() => {
                if (total > 0 && newMin > total) {
                    setErrors(prev => ({
                        ...prev,
                        minEmployeesRequired: `Minimum required (${newMin}) cannot exceed total employees (${total})`
                    }));
                }
            }, 0);
        }

        else if (field === 'selectedEmployees') {
            const selectedCount = value.length;
            const total = Number(formData.totalEmployees);
            const minRequired = Number(formData.minEmployeesRequired);

            setFormData(prev => ({
                ...prev,
                [field]: value
            }));

            // Clear existing selectedEmployees error
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.selectedEmployees;
                return newErrors;
            });

            setTimeout(() => {
                if (total > 0 && selectedCount > total) {
                    setErrors(prev => ({
                        ...prev,
                        selectedEmployees: `Cannot select more than ${total} employees (Currently: ${selectedCount})`
                    }));
                } else if (minRequired > 0 && selectedCount < minRequired) {
                    setErrors(prev => ({
                        ...prev,
                        selectedEmployees: `Minimum ${minRequired} employees required. Currently selected ${selectedCount}.`
                    }));
                }
            }, 0);
        }

        else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));

            // Clear error for this specific field when user starts typing
            if (errors[field]) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[field];
                    return newErrors;
                });
            }
        }
    };
    useEffect(() => {
        // Clear errors when conditions become valid
        const total = Number(formData.totalEmployees);
        const selectedCount = formData.selectedEmployees.length;
        const minRequired = Number(formData.minEmployeesRequired);

        setErrors(prev => {
            const newErrors = { ...prev };
            let changed = false;

            // Clear selectedEmployees error if it's now valid
            if (prev.selectedEmployees) {
                if (total > 0 && selectedCount <= total && selectedCount >= minRequired) {
                    delete newErrors.selectedEmployees;
                    changed = true;
                }
            }

            // Clear totalEmployees error if it's now valid
            if (prev.totalEmployees?.includes('must be at least')) {
                if (selectedCount <= total || total >= selectedCount) {
                    delete newErrors.totalEmployees;
                    changed = true;
                }
            }

            // Clear minEmployeesRequired error if it's now valid
            if (prev.minEmployeesRequired?.includes('cannot exceed total')) {
                if (minRequired <= total) {
                    delete newErrors.minEmployeesRequired;
                    changed = true;
                }
            }

            return changed ? newErrors : prev;
        });
    }, [formData.selectedEmployees, formData.totalEmployees, formData.minEmployeesRequired]);
    useEffect(() => {
        // Show toast when MORE than minimum requirement is selected
        if (
            emailCount > 0 &&
            emailCount > Number(formData.minEmployeesRequired) &&
            formData.minEmployeesRequired > 0
        ) {
            toast.success(`✓ Exceeded minimum requirement by ${emailCount - Number(formData.minEmployeesRequired)} employees!`);
        }
    }, [emailCount, formData.minEmployeesRequired]);
    const validateForm = () => {
        const newErrors = {};

        // Employee Information
        if (!formData.totalEmployees || Number(formData.totalEmployees) <= 0) {
            newErrors.totalEmployees = "Total number of employees must be greater than 0";
        }

        if (!formData.minEmployeesRequired || Number(formData.minEmployeesRequired) <= 0) {
            newErrors.minEmployeesRequired = "Minimum employees required must be greater than 0";
        }

        // Validate that Minimum Employees Required is not greater than Total Employees
        if (formData.totalEmployees && formData.minEmployeesRequired) {
            const total = Number(formData.totalEmployees);
            const minRequired = Number(formData.minEmployeesRequired);

            if (minRequired > total) {
                newErrors.minEmployeesRequired = `Minimum required cannot exceed total employees`;
            }
        }

        // Validate selected employees count
        if (formData.selectedEmployees.length === 0) {
            newErrors.selectedEmployees = "At least one employee must be selected";
        } else {
            const selectedCount = formData.selectedEmployees.length;
            const total = Number(formData.totalEmployees);
            const minRequired = Number(formData.minEmployeesRequired);

            // Validate selected count is at least minimum required
            if (selectedCount < minRequired) {
                newErrors.selectedEmployees = `Minimum ${minRequired} employees required. Currently selected ${selectedCount}.`;
            }

            // Validate selected count does not exceed total employees
            if (total > 0 && selectedCount > total) {
                newErrors.selectedEmployees = `Cannot select more than ${total} employees (Currently: ${selectedCount})`;
            }
        }

        // Dates
        if (!formData.startDateTime) newErrors.startDateTime = "Start date and time is required";
        if (!formData.endDateTime) newErrors.endDateTime = "End date and time is required";

        if (formData.startDateTime && formData.endDateTime && new Date(formData.endDateTime) <= new Date(formData.startDateTime)) {
            newErrors.endDateTime = "End date must be after start date";
        }

        // Form Link
        if (!formData.formLink.trim()) newErrors.formLink = "Form link is required";
        else if (!formData.formLink.startsWith('http')) newErrors.formLink = "Please enter a valid URL";

        // Email Subject
        if (!formData.subject.trim()) newErrors.subject = "Email subject is required";

        // Total Reminders validation
        const totalReminders = Number(formData.totalReminders);
        if (isNaN(totalReminders) || totalReminders <= 0) {
            newErrors.totalReminders = "Total number of reminders must be greater than 0";
        } else if (totalReminders > 3) {
            newErrors.totalReminders = "Maximum 3 reminders allowed";
        }

        // NEW: Interval validation when toggle is ON
        if (showReminderDates && totalReminders > 0 && totalReminders <= 3) {
            if (!formData.intervalType) {
                newErrors.intervalType = "Please select interval type (hours or days)";
            }

            if (!formData.intervalValue || Number(formData.intervalValue) <= 0) {
                newErrors.intervalValue = `Please enter a valid ${formData.intervalType || ''} interval`;
            }

            // Validate that all reminders fit within the collection period
            if (formData.startDateTime && formData.endDateTime && formData.intervalValue) {
                const interval = Number(formData.intervalValue);
                const startDate = new Date(formData.startDateTime);
                const endDate = new Date(formData.endDateTime);

                if (formData.intervalType === "hours") {
                    const totalHoursNeeded = totalReminders * interval;
                    const maxHours = (endDate - startDate) / (1000 * 60 * 60);
                    if (totalHoursNeeded > maxHours) {
                        newErrors.intervalValue = `Interval too large. With ${totalReminders} reminders, maximum interval is ${Math.floor(maxHours / totalReminders)} hours`;
                    }
                } else {
                    const totalDaysNeeded = totalReminders * interval;
                    const maxDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
                    if (totalDaysNeeded > maxDays) {
                        newErrors.intervalValue = `Interval too large. With ${totalReminders} reminders, maximum interval is ${Math.floor(maxDays / totalReminders)} days`;
                    }
                }
            }
        }

        // Reminder Subject
        if (!formData.reminderSubject.trim()) {
            newErrors.reminderSubject = "Reminder subject is required";
        }

        // Reminder Message Body
        if (!formData.reminderMessageBody.trim()) {
            newErrors.reminderMessageBody = "Reminder message body is required";
        }

        return newErrors;
    };
    const parseReminderDates = (datesString) => {
        // If using interval-based reminders
        if (showReminderDates && formData.totalReminders > 0 && formData.totalReminders <= 3 &&
            formData.intervalValue && formData.intervalType && formData.startDateTime) {

            const dates = [];
            const interval = Number(formData.intervalValue);
            const startDate = new Date(formData.startDateTime);

            for (let i = 1; i <= formData.totalReminders; i++) {
                let reminderDate;
                if (formData.intervalType === "hours") {
                    reminderDate = new Date(startDate.getTime() + (i * interval * 60 * 60 * 1000));
                } else {
                    reminderDate = new Date(startDate.getTime() + (i * interval * 24 * 60 * 60 * 1000));
                }
                dates.push(reminderDate.toISOString());
            }
            return dates;
        }

        // Fallback to old method (individual date fields)
        if (showReminderDates && formData.totalReminders > 0 && formData.totalReminders <= 3) {
            const dates = [];
            for (let i = 1; i <= formData.totalReminders; i++) {
                const dateValue = formData[`reminderDate${i}`];
                if (dateValue && dateValue.trim()) {
                    dates.push(new Date(dateValue).toISOString());
                }
            }
            return dates;
        }

        // Fallback to string parsing
        if (!datesString) return [];
        return datesString
            .split(",")
            .map((d) => d.trim())
            .filter(Boolean)
            .map((dateStr) => new Date(dateStr).toISOString());
    };

    // Send Email Handler
    const handleSendEmail = async () => {
        // Validate form and get field-specific errors
        const newErrors = validateForm();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);

            // Show a general error toast
            toast.error("Please fix the errors in the form");

            // Scroll to top of the form
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            // Alternatively, scroll to the form container
            const formContainer = document.querySelector('.max-w-6xl');
            if (formContainer) {
                formContainer.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }

            return;
        }


        // Clear errors if validation passes
        setErrors({});

        setLoading(true);
        try {
            const token = localStorage.getItem("token");

            const payload = {
                userName: formData.userName,
                userEmailId: formData.userEmailId,
                totalEmployees: Number(formData.totalEmployees),
                minEmployeesRequired: Number(formData.minEmployeesRequired),

                //  CHANGED: send email + userId
                emails: formData.selectedEmployees.map((e) => ({
                    email: e.value,
                    userId: e.userId,
                })),

                startDateTime: formData.startDateTime,
                endDateTime: formData.endDateTime,
                subject: formData.subject,
                formLink: formData.formLink,
                totalReminders: Number(formData.totalReminders),
                reminderDates: parseReminderDates(formData.reminderDates),
                reminderSubject: formData.reminderSubject,
                reminderMessageBody: formData.reminderMessageBody,
            };

            await axios.post(
                `${process.env.REACT_APP_BASE_URL}/email/employee-commuting`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Emails sent and configuration saved successfully!");

            // Optional: Clear form after successful submission
            setFormData({
                userName: "",
                userEmailId: "",
                totalEmployees: "",
                minEmployeesRequired: 0,
                selectedEmployees: [],
                startDateTime: "",
                startDate: "", // Add this
                startTime: "", // Add this
                endDateTime: "",
                endDate: "", // Add this
                endTime: "",
                subject: "",
                formLink: "httpshttps://carbonx.srptechs.com/AddfromEmployee",
                totalReminders: "",
                reminderDates: "",
                reminderSubject: "",
                reminderMessageBody: "",

            });
            setShowReminderDates(false);

            // Reset the display text for subject line
            setDisplayText("");

        } catch (error) {
            console.error(error);
            toast.error(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Failed to send email"
            );
        } finally {
            setLoading(false);
        }
    };
    // Schedule Reminders Handler
    const handleScheduleReminders = async () => {
        if (!formData.selectedEmployees.length || !formData.endDateTime || !formData.formLink) {
            toast.error("Please fill in employees, end date, and form link to schedule reminders");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const reminderPayload = {
                emails: formData.selectedEmployees.map((e) => e.value),
                endDateTime: formData.endDateTime,
                formLink: formData.formLink,
                totalReminders: Number(formData.totalReminders),
                reminderDates: parseReminderDates(formData.reminderDates),
                reminderSubject: formData.reminderSubject,
                reminderMessageBody: formData.reminderMessageBody,
            };

            await axios.post(
                `${process.env.REACT_APP_BASE_URL}/email/employee-commuting/reminder`,
                reminderPayload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Reminders scheduled successfully!");
        } catch (error) {
            console.error(error);
            const errorMessage =
                error.response?.data?.message || error.response?.data?.error || "Failed to schedule reminders";
            toast.error(errorMessage);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6 ">
            <Card title="Employee Commuting – Email Configuration" >
                <div className="text-slate-700 leading-relaxed mb-4 bg-gray-100 rounded-lg border-l-4 border-primary-400 p-2 pl-4  justify-center">
                    <p className="text-gray-700 items-center">
                        This category includes emissions from the transportation of employees between their homes and their worksites in<span className="font-semibold"> vehicles not owned or operated by the reporting company</span>. Companies may also include emissions from teleworking (i.e., employees working remotely) in this category.
                        <br />
                        Emissions from employee commuting may arise from:
                        <br />• Automobile travel
                        <br />• Bus travel
                        <br />• Rail travel
                        <br />• Air travel
                        <br />• Other modes of transportation (e.g., subway, bicycling, walking).
                    </p>
                </div>

                {/* User Info */}
                <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">User Information</h3>
                </div>

                {/* Employee Info */}
                <div className="mb-4">
                    {/* <h3 className="text-lg font-medium text-gray-700 mb-4">Employee Information</h3> */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="field-label">Total Number of Employees</label>
                            <InputGroup
                                type="number"
                                placeholder="e.g., 50, 100, 200"
                                value={formData.totalEmployees}
                                onChange={(e) =>
                                    handleInputChange("totalEmployees", e.target.value)
                                }
                            />
                            <ErrorMessage message={errors.totalEmployees} />
                        </div>
                        <div>
                            <label className="field-label">Minimum Number of Employees Required to Submit Data <span className="text-red-500">*</span></label>
                            <InputGroup
                                type="number"
                                placeholder="e.g., 1, 2, 3"
                                value={formData.minEmployeesRequired}
                                onChange={(e) =>
                                    handleInputChange("minEmployeesRequired", Number(e.target.value))
                                }
                                min="1"
                                required
                                disabled={!formData.totalEmployees || Number(formData.totalEmployees) <= 0} // NEW
                            />
                            {!formData.totalEmployees && (
                                <p className="text-xs text-amber-600 mt-1">
                                    Please fill "Total Number of Employees" first
                                </p>
                            )}
                            <ErrorMessage message={errors.minEmployeesRequired} />
                        </div>
                    </div>
                    <div>
                        <label className="field-label">Employees Email List</label>
                        <CustomSelect
                            className="mt-2"
                            isMulti
                            showSelectAll={true}
                            options={employeesOptions.filter(option =>
                                !formData.selectedEmployees.some(
                                    selected => selected.value === option.value
                                )
                            )}
                            value={formData.selectedEmployees}
                            onChange={(selected) => {
                                const maxLimit = Number(formData.totalEmployees);
                                const minLimit = Number(formData.minEmployeesRequired);

                                if (maxLimit > 0 && selected.length > maxLimit) {
                                    // Show error toast
                                    toast.error(`Cannot select more than ${maxLimit} employees (total employees limit).`, {
                                        autoClose: 3000,
                                        position: "top-right"
                                    });

                                    // Instead of returning, keep the selection but limit to max
                                    const limitedSelection = selected.slice(0, maxLimit);
                                    handleInputChange("selectedEmployees", limitedSelection);


                                    return;
                                }

                                handleInputChange("selectedEmployees", selected);
                            }}
                            placeholder={`Select Employees (Min: ${formData.minEmployeesRequired || 0})`}
                            noOptionsMessage={() =>
                                employeesOptions.length === 0
                                    ? "No employees available"
                                    : "All available employees have been selected"
                            }
                            isDisabled={!formData.minEmployeesRequired || Number(formData.minEmployeesRequired) <= 0}
                        />
                        {!formData.minEmployeesRequired && (
                            <p className="text-xs text-amber-600 mt-1">
                                Please fill "Minimum Number of Employees Required to Submit Data" first
                            </p>
                        )}
                    </div>

                    <p className="text-xs text-gray-500 mt-1 mb-4">
                        {formData.selectedEmployees.length > 0 ? (
                            formData.totalEmployees > 0 && formData.selectedEmployees.length > Number(formData.totalEmployees) ? (
                                <span className="text-red-600 font-semibold">
                                    ⚠ Exceeds limit: {formData.selectedEmployees.length} selected but total is {formData.totalEmployees}
                                </span>
                            ) : formData.selectedEmployees.length >= Number(formData.minEmployeesRequired) ? (
                                <span className="text-green-600">
                                    ✓ {formData.selectedEmployees.length} of {formData.totalEmployees || '?'} employees selected
                                    {formData.selectedEmployees.length > Number(formData.minEmployeesRequired) &&
                                        ` (exceeds minimum by ${formData.selectedEmployees.length - Number(formData.minEmployeesRequired)})`}
                                </span>
                            ) : (
                                <span className="text-yellow-600">
                                    ⚠ Need {Number(formData.minEmployeesRequired) - formData.selectedEmployees.length} more to reach minimum
                                </span>
                            )
                        ) : (
                            <span className="text-gray-500">
                                No employees selected
                            </span>
                        )}
                    </p>
                    <div className="grid grid-rows-1 md:grid-rows-2 gap-4 mb-4">
                        <div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="field-label">Data Collection Start Date<span className="text-red-500">*</span></label>

                                    <InputGroup
                                        type="date"
                                        value={formData.startDate || ""}
                                        onChange={(e) => {
                                            const date = e.target.value;
                                            const time = formData.startTime || "00:00";
                                            const dateTime = date && time ? `${date}T${time}` : "";
                                            if (errors.startDate) {
                                                setErrors(prev => ({ ...prev, startDate: undefined }));
                                            }
                                            handleInputChange("startDate", date);
                                        }}
                                        required
                                    />
                                    <ErrorMessage message={errors.startDateTime} />
                                </div>
                                <div>
                                    <label className="field-label">Data Collection Start Time <span className="text-red-500">*</span></label>

                                    <InputGroup
                                        type="time"
                                        value={formData.startTime || ""}
                                        onChange={(e) => {
                                            const time = e.target.value;
                                            const date = formData.startDate || new Date().toISOString().split('T')[0]; // Fixed
                                            const dateTime = date && time ? `${date}T${time}` : "";
                                            if (errors.startDateTime) {
                                                setErrors(prev => ({ ...prev, startDateTime: undefined }));
                                            }
                                            handleInputChange("startDateTime", dateTime);
                                            handleInputChange("startTime", time);
                                        }}
                                        required
                                    />
                                    <ErrorMessage message={errors.startDateTime} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="field-label">Data Collection End Date <span className="text-red-500">*</span></label>

                                    <InputGroup
                                        type="date"
                                        value={formData.endDate || ""}
                                        onChange={(e) => {
                                            const date = e.target.value;
                                            const time = formData.endTime || "00:00";
                                            const dateTime = date && time ? `${date}T${time}` : "";
                                            if (errors.endDate) {
                                                setErrors(prev => ({ ...prev, startDate: undefined }));
                                            }
                                            handleInputChange("endDateTime", dateTime);
                                            handleInputChange("endDate", date);
                                        }}
                                        required
                                    />
                                    <ErrorMessage message={errors.endDateTime} />
                                </div>
                                <div>
                                    <label className="field-label">Data Collection End Time <span className="text-red-500">*</span></label>

                                    <InputGroup
                                        type="time"
                                        value={formData.endTime || ""}
                                        onChange={(e) => {
                                            const time = e.target.value;
                                            const date = formData.endDate || new Date().toISOString().split('T')[0]; // Fixed
                                            const dateTime = date && time ? `${date}T${time}` : "";
                                            if (errors.endTime) {
                                                setErrors(prev => ({ ...prev, startDate: undefined }));
                                            }
                                            handleInputChange("endDateTime", dateTime);
                                            handleInputChange("endTime", time);
                                        }}
                                        required
                                    />
                                    <ErrorMessage message={errors.endDateTime} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Email Configuration */}
                <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Email Configuration</h3>
                    <div className="mb-4">
                        <label className="field-label">Email Subject Line</label>
                        <InputGroup
                            placeholder="Employee Commuting Data Form Submission"
                            value={displayText}
                            onChange={(e) => {
                                setDisplayText(e.target.value);
                                // Clear error when user types
                                if (errors.displayText) {
                                    setErrors(prev => ({ ...prev, displayText: undefined }));
                                }
                            }}
                        />
                        <ErrorMessage message={errors.displayText} />
                    </div>


                    <div className="mb-4">
                        <label className="field-label">Email Message Body<span className="text-red-500">*</span></label>
                        {/* Container with relative positioning for sticky elements */}
                        <div className="relative border border-gray-300 rounded-lg ">
                            {/* Sticky "Dear Employee," at the top */}
                            <div className="top-0  border-gray-300 px-3 py-2 text-sm font-small">
                                {/* Dear Employee, */}
                            </div>

                            {/* Main textarea */}
                            <textarea
                                placeholder="Dear Employee,
As part of our sustainability reporting, you are requested to complete the Employee Commuting Data Form provided below.
Please submit your response within the data collection period mentioned.  
Thank you for your cooperation."
                                value={formData.subject}
                                onChange={(e) => handleInputChange("subject", e.target.value)}
                                onClick={(e) => {
                                    // Only set initial value if textarea is empty
                                    if (!formData.subject.trim()) {
                                        handleInputChange("subject", "As part of our sustainability reporting, you are requested to complete the Employee Commuting Data Form provided below.\nPlease submit your response within the data collection period mentioned.\nThank you for your cooperation.");

                                        // Set cursor to end of text after state updates
                                        setTimeout(() => {
                                            e.target.setSelectionRange(e.target.value.length, e.target.value.length);
                                        }, 0);
                                    }
                                }}
                                className="w-full px-3 py-2 text-sm min-h-[100px] resize-none focus:outline-none placeholder:text-gray-400 text-gray-900"
                            />


                            {/* Auto-filled information at the bottom */}
                            <div className=" bottom-0  border-gray-300 px-3 py-2 text-sm text-gray-900">
                                <div className="mb-1 text-sm font-small">
                                    Data Collection Start Date and Time: {formData.startDateTime ?
                                        new Date(formData.startDateTime).toLocaleDateString('en-US', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                        }).replace(',', '') +
                                        ' ' +
                                        new Date(formData.startDateTime).toLocaleTimeString('en-US', {
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                        }).replace(':', '.').toLowerCase()
                                        : "Not set"}
                                </div>
                                <div className="mb-1 text-sm font-small">
                                    Data Collection End Date and Time: {formData.endDateTime ?
                                        new Date(formData.endDateTime).toLocaleDateString('en-US', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                        }).replace(',', '') +
                                        ' ' +
                                        new Date(formData.endDateTime).toLocaleTimeString('en-US', {
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                        }).replace(':', '.').toLowerCase()
                                        : "Not set"}
                                </div>
                                <div className="text-sm font-small">
                                    Form Link: {formData.formLink || "Not set"}
                                </div>
                            </div>
                        </div>
                        <ErrorMessage message={errors.subject} />
                    </div>


                </div>

                {/* Reminder Configuration */}
                <div className="mb-4">
                    {/* <h3 className="text-lg font-medium text-gray-700 mb-4">Reminder Configuration</h3> */}
                    {/* Reminder Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
                        <div>
                            <label className="field-label">Total Number of Reminders You Want</label>
                            <InputGroup
                                type="number"
                                placeholder="e.g., 1, 2, 3"
                                value={formData.totalReminders}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (!isNaN(value)) {
                                        handleInputChange("totalReminders", value);
                                    } else {
                                        handleInputChange("totalReminders", "");
                                    }
                                }}
                                helperText="Enter the number of reminders you want to schedule"
                            />
                            <ErrorMessage message={errors.totalReminders} />
                        </div>

                        {/* Toggle Row - UPDATED */}
                        <div className="mt-7">
                            <ToggleButton
                                label="Set Reminder Interval"
                                checked={showReminderDates}
                                onChange={() => setShowReminderDates(!showReminderDates)}
                                disabled={false}
                            />
                            <ErrorMessage message={errors.reminderDates} />
                        </div>
                    </div>
                    {/* Dynamic reminder interval fields when toggle is ON */}
                    {showReminderDates  && (
                        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <h4 className="text-md font-medium text-gray-700 mb-3">Reminder Interval Configuration</h4>

                            {/* Interval Type Radio Buttons */}
                            <div className="mb-4">
                                <label className="field-label mb-2">Interval Type</label>
                                <div className="flex gap-6">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="intervalType"
                                            value="hours"
                                            checked={formData.intervalType === "hours"}
                                            onChange={(e) => handleInputChange("intervalType", e.target.value)}
                                            className="mr-2"
                                        />
                                        <span>Hours</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="intervalType"
                                            value="days"
                                            checked={formData.intervalType === "days"}
                                            onChange={(e) => handleInputChange("intervalType", e.target.value)}
                                            className="mr-2"
                                        />
                                        <span>Days</span>
                                    </label>
                                </div>
                                <ErrorMessage message={errors.intervalType} />
                            </div>

                            {/* Interval Value Input */}
                            <div>
                                <label className="field-label">
                                    Interval Between Reminders
                                    {formData.intervalType === "hours" ? " (in hours)" : " (in days)"}
                                </label>
                                <InputGroup
                                    type="number"
                                    placeholder={formData.intervalType === "hours" ? "e.g., 2, 4, 6" : "e.g., 1, 2, 3"}
                                    value={formData.intervalValue || ""}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        if (!isNaN(value) && value > 0) {
                                            handleInputChange("intervalValue", value);
                                        } else {
                                            handleInputChange("intervalValue", "");
                                        }
                                    }}
                                    helperText={`Enter number of ${formData.intervalType === "hours" ? "hours" : "days"} between each reminder`}
                                    min="1"
                                />
                                <ErrorMessage message={errors.intervalValue} />
                            </div>

                            {/* Preview of reminder schedule */}
                            {formData.intervalValue && formData.startDateTime && (
                                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                                    <h5 className="text-sm font-medium text-blue-800 mb-2">Reminder Schedule Preview:</h5>
                                    {Array.from({ length: formData.totalReminders }, (_, index) => {
                                        const reminderNumber = index + 1;
                                        const interval = parseInt(formData.intervalValue);
                                        const startDate = new Date(formData.startDateTime);
                                        let reminderDate;

                                        if (formData.intervalType === "hours") {
                                            reminderDate = new Date(startDate.getTime() + (reminderNumber * interval * 60 * 60 * 1000));
                                        } else {
                                            reminderDate = new Date(startDate.getTime() + (reminderNumber * interval * 24 * 60 * 60 * 1000));
                                        }

                                        return (
                                            <div key={index} className="text-sm text-blue-700">
                                                {reminderNumber}{getOrdinalSuffix(reminderNumber)} reminder: {reminderDate.toLocaleString()}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    <h3 className="text-lg font-medium text-gray-700 mb-4">Reminder Email Configuration</h3>
                    <div className="mb-4">
                        <label className="field-label">Email Subject Line</label>
                        <InputGroup
                            placeholder="Reminder Employee Commuting Data Form Submission"
                            value={formData.reminderSubject}
                            onChange={(e) => handleInputChange("reminderSubject", e.target.value)}

                        />
                        <ErrorMessage message={errors.reminderSubject} />
                    </div>
                    <div className="mt-4">
                        <label className="field-label">Email Message Body</label>

                        {/* Container with relative positioning for sticky elements */}
                        <div className="relative border border-gray-300 rounded-lg ">
                            {/* Sticky "Dear Employee," at the top */}
                            <div className="top-0 border-gray-300 px-3 py-2 text-sm font-small">

                            </div>

                            {/* Main textarea */}
                            <textarea
                                placeholder="Dear Employee,
This is a kind reminder to please complete the Employee Commuting Data Form if you have not yet submitted your response.
Your participation is important for our sustainability reporting.
Kindly ensure that you submit the form before the closing date. "
                                value={formData.reminderMessageBody}
                                onChange={(e) => handleInputChange("reminderMessageBody", e.target.value)}
                                onClick={(e) => {
                                    // Only set initial value if textarea is empty
                                    if (!formData.reminderMessageBody.trim()) {
                                        handleInputChange("reminderMessageBody", "This is a kind reminder to please complete the Employee Commuting Data Form if you have not yet submitted your response.\nYour participation is important for our sustainability reporting.\nKindly ensure that you submit the form before the closing date. ");

                                        // Set cursor to end of text after state updates
                                        setTimeout(() => {
                                            e.target.setSelectionRange(e.target.value.length, e.target.value.length);
                                        }, 0);
                                    }
                                }}
                                className="w-full px-3 py-2 text-sm min-h-[100px] resize-none focus:outline-none placeholder:text-gray-400 text-gray-900"
                            />

                            {/* Auto-filled information at the bottom */}
                            <div className="bottom-0 border-gray-300 px-3 py-2 text-sm text-gray-900">
                                <div className="mb-1 text-sm font-small">
                                    Data Collection End Date and Time: {formData.endDateTime ?
                                        new Date(formData.endDateTime).toLocaleDateString('en-US', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                        }).replace(',', '') +
                                        ' ' +
                                        new Date(formData.endDateTime).toLocaleTimeString('en-US', {
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                        }).replace(':', '.').toLowerCase()
                                        : "Not set"}
                                </div>
                                <div className="text-sm font-small mb-2">
                                    Form Link: {formData.formLink || "Not set"}
                                </div>
                                <span className="sticky bottom-0 border-gray-300 text-sm text-gray-900">Thank you for your cooperation.</span>
                            </div>
                        </div>
                        <ErrorMessage message={errors.reminderMessageBody} />
                    </div>

                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4 border-t">
                    <Button
                        text="Schedule Reminders Only"
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-6"
                        onClick={handleScheduleReminders}
                        disabled={loading}
                    />

                    <Button
                        text={loading ? "Sending..." : "Send Email & Schedule Reminders"}
                        className="btn-dark"
                        disabled={loading}
                        onClick={handleSendEmail}
                    />
                </div>
            </Card>
        </div>
    );
};

export default EmailSent;
