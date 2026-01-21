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
        formLink: "https://drksmd8t-5173.asse.devtunnels.ms/",
        totalReminders: "",
        reminderDates: "",
        reminderSubject: "",
        // reminderSubject: "Reminder Employee Commuting Data Form Submission",
        reminderMessageBody: ""
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
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };
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
    // Validation
    // const validateForm = () => {
    //     const errors = [];

    //     if (!formData.userName.trim()) errors.push("User Name is required");
    //     if (!formData.userEmailId.trim()) errors.push("User Email ID is required");
    //     if (formData.selectedEmployees.length === 0)
    //         errors.push("At least one employee must be selected");

    //     if (!formData.startDateTime) errors.push("Start date and time is required");
    //     if (!formData.endDateTime) errors.push("End date and time is required");

    //     if (
    //         formData.startDateTime &&
    //         formData.endDateTime &&
    //         new Date(formData.endDateTime) <= new Date(formData.startDateTime)
    //     )
    //         errors.push("End date must be after start date");

    //     if (!formData.formLink.trim()) errors.push("Form link is required");

    //     const minRequired = Number(formData.minEmployeesRequired) || 0;
    //     if (emailCount < minRequired)
    //         errors.push(
    //             `Minimum ${minRequired} employees required. Currently selected ${emailCount}.`
    //         );


    //     const totalReminders = Number(formData.totalReminders);
    //     if (isNaN(totalReminders) || totalReminders <= 0) {
    //         errors.push("Total number of reminders must be greater than 0");
    //     }
    //     if (totalReminders > 3) {
    //         errors.push("Maximum 3 reminders allowed");
    //     }

    //     // ADDED: Validation for reminder dates when they are shown AND totalReminders is valid (1-3)
    //     if (showReminderDates && totalReminders > 0 && totalReminders <= 3) {
    //         for (let i = 1; i <= totalReminders; i++) {
    //             const reminderDate = formData[`reminderDate${i}`];

    //             if (!reminderDate || !reminderDate.trim()) {
    //                 errors.push(`${i}${getOrdinalSuffix(i)} reminder date is required`);
    //             } else {
    //                 // Validate that reminder date is after start date
    //                 if (formData.startDateTime && new Date(reminderDate) <= new Date(formData.startDateTime)) {
    //                     errors.push(`${i}${getOrdinalSuffix(i)} reminder date must be after the start date`);
    //                 }

    //                 // Validate that reminder date is before end date
    //                 if (formData.endDateTime && new Date(reminderDate) >= new Date(formData.endDateTime)) {
    //                     errors.push(`${i}${getOrdinalSuffix(i)} reminder date must be before the end date`);
    //                 }
    //             }
    //         }

    //         // Additional validation: Ensure reminder dates are in chronological order
    //         for (let i = 1; i < totalReminders; i++) {
    //             const currentReminder = formData[`reminderDate${i}`];
    //             const nextReminder = formData[`reminderDate${i + 1}`];

    //             if (currentReminder && nextReminder && new Date(nextReminder) <= new Date(currentReminder)) {
    //                 errors.push(`${i + 1}${getOrdinalSuffix(i + 1)} reminder date must be after ${i}${getOrdinalSuffix(i)} reminder date`);
    //             }
    //         }
    //     }
    //     return errors;
    // };
    // Validation - returns object with field errors
    const validateForm = () => {
        const newErrors = {};

        // User Information
        if (!formData.userName.trim()) newErrors.userName = "User Name is required";
        if (!formData.userEmailId.trim()) newErrors.userEmailId = "User Email ID is required";
        else if (!/\S+@\S+\.\S+/.test(formData.userEmailId)) newErrors.userEmailId = "Please enter a valid email";

        // Employee Information
        if (!formData.minEmployeesRequired || Number(formData.minEmployeesRequired) <= 0) {
            newErrors.minEmployeesRequired = "Minimum employees required must be greater than 0";
        }

        if (formData.selectedEmployees.length === 0) {
            newErrors.selectedEmployees = "At least one employee must be selected";
        } else if (formData.selectedEmployees.length < Number(formData.minEmployeesRequired)) {
            newErrors.selectedEmployees = `Minimum ${formData.minEmployeesRequired} employees required. Currently selected ${formData.selectedEmployees.length}.`;
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

        // Total Reminders
        const totalReminders = Number(formData.totalReminders);
        if (isNaN(totalReminders) || totalReminders <= 0) {
            newErrors.totalReminders = "Total number of reminders must be greater than 0";
        } else if (totalReminders > 3) {
            newErrors.totalReminders = "Maximum 3 reminders allowed";
        }

        // Reminder dates validation
        if (showReminderDates && totalReminders > 0 && totalReminders <= 3) {
            for (let i = 1; i <= totalReminders; i++) {
                const reminderDate = formData[`reminderDate${i}`];
                const fieldKey = `reminderDate${i}`;

                if (!reminderDate || !reminderDate.trim()) {
                    newErrors[fieldKey] = `${i}${getOrdinalSuffix(i)} reminder date is required`;
                } else {
                    // Validate that reminder date is after start date
                    if (formData.startDateTime && new Date(reminderDate) <= new Date(formData.startDateTime)) {
                        newErrors[fieldKey] = `${i}${getOrdinalSuffix(i)} reminder date must be after the start date`;
                    }

                    // Validate that reminder date is before end date
                    if (formData.endDateTime && new Date(reminderDate) >= new Date(formData.endDateTime)) {
                        newErrors[fieldKey] = `${i}${getOrdinalSuffix(i)} reminder date must be before the end date`;
                    }
                }
            }

            // Additional validation: Ensure reminder dates are in chronological order
            for (let i = 1; i < totalReminders; i++) {
                const currentReminder = formData[`reminderDate${i}`];
                const nextReminder = formData[`reminderDate${i + 1}`];

                if (currentReminder && nextReminder && new Date(nextReminder) <= new Date(currentReminder)) {
                    newErrors[`reminderDate${i + 1}`] = `${i + 1}${getOrdinalSuffix(i + 1)} reminder date must be after ${i}${getOrdinalSuffix(i)} reminder date`;
                }
            }
        }

        // Reminder Subject
        if (totalReminders > 0 && !formData.reminderSubject.trim()) {
            newErrors.reminderSubject = "Reminder subject is required";
        }

        // Reminder Message Body
        if (totalReminders > 0 && !formData.reminderMessageBody.trim()) {
            newErrors.reminderMessageBody = "Reminder message body is required";
        }

        return newErrors;
    };

    // Parse reminder dates
    // Parse reminder dates
    const parseReminderDates = (datesString) => {
        // If reminder dates are shown and totalReminders is valid (1-3), use individual fields
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

        // Fallback to old method if datesString is provided
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

        // If there are errors, set them in state and show toast
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);

            // Show a general error toast
            toast.error("Please fix the errors in the form");

            // Scroll to first error field
            const firstErrorField = Object.keys(newErrors)[0];
            const element = document.querySelector(`[data-field="${firstErrorField}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
                totalEmployees: formData.selectedEmployees.length,
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
                endDateTime: "",
                subject: "",
                formLink: "https://drksmd8t-5173.asse.devtunnels.ms/",
                totalReminders: "",
                reminderDates: "",
                reminderSubject: "",
                reminderMessageBody: ""
            });

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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="field-label">User Name <span className="text-red-500">*</span></label>
                            <InputGroup
                                placeholder="Enter Name"
                                value={formData.userName}
                                onChange={(e) => handleInputChange("userName", e.target.value)}
                                required
                            />
                            <ErrorMessage message={errors.userName} />
                        </div>
                        <div>
                            <label className="field-label">User Email ID<span className="text-red-500">*</span></label>
                            <InputGroup
                                type="email"
                                placeholder="Enter Email"
                                value={formData.userEmailId}
                                onChange={(e) => handleInputChange("userEmailId", e.target.value)}
                                required
                            />
                            <ErrorMessage message={errors.userEmailId} />
                        </div>
                    </div>
                </div>

                {/* Employee Info */}
                <div className="mb-4">
                    {/* <h3 className="text-lg font-medium text-gray-700 mb-4">Employee Information</h3> */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="field-label">Total Number of Employees</label>
                            <InputGroup
                                type="number"
                                placeholder="Auto Calculated"
                                value={formData.selectedEmployees.length}
                                disabled
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
                            />
                            <ErrorMessage message={errors.minEmployeesRequired} />
                        </div>
                    </div>
                     <div>
                            <label className="field-label">Employees Email List</label>
                    <CustomSelect className="mt-2"
                        isMulti
                        options={employeesOptions.filter(option =>
                            // Hide options that are already selected
                            !formData.selectedEmployees.some(
                                selected => selected.value === option.value
                            )
                        )}
                        value={formData.selectedEmployees}
                        onChange={(selected) => {
                            const maxLimit = Number(formData.minEmployeesRequired);
                            if (selected.length > maxLimit) {
                                // Show error toast
                                toast.error(`Cannot select more than ${maxLimit} employees.`, {
                                    autoClose: 3000,
                                    position: "top-right"
                                });
                                // Don't update the selection
                                return;
                            }
                            handleInputChange("selectedEmployees", selected);
                        }}
                        onClick={(e) => {
                            // Only set initial value if textarea is empty
                            if (!formData.subject.trim()) {
                                handleInputChange("subject", "As part of our sustainability reporting...");

                                // Clear error if it exists
                                if (errors.subject) {
                                    setErrors(prev => ({ ...prev, subject: undefined }));
                                }

                                setTimeout(() => {
                                    e.target.setSelectionRange(e.target.value.length, e.target.value.length);
                                }, 0);
                            }
                        }}
                        placeholder={`Select Employees (Max: ${formData.minEmployeesRequired})`}
                        noOptionsMessage={() =>
                            employeesOptions.length === 0
                                ? "No employees available"
                                : "All available employees have been selected"
                        }
                    />
                          </div>


                    <p className="text-xs text-gray-500 mt-1 mb-4">
                        {emailCount >= Number(formData.minEmployeesRequired) ? (
                            <span className="text-green-600">✓ Minimum requirement met</span>

                        ) : (
                            <span className="text-red-600">
                                ⚠ Need {Number(formData.minEmployeesRequired) - emailCount} more employees
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
                                            const date = formData.startTime || new Date().toISOString().split('T')[0];
                                            const dateTime = date && time ? `${date}T${time}` : "";
                                            if (errors.startDate) {
                                                setErrors(prev => ({ ...prev, startDate: undefined }));
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
                                            const date = formData.endDate || new Date().toISOString().split('T')[0];
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
                            onChange={(e) => setDisplayText(e.target.value)}
                        />
                        <ErrorMessage message={"Email Subject line is required"} />
                    </div>

                    <div className="mb-4">
                        <label className="field-label">Email Message Body<span className="text-red-500">*</span></label>
                        {/* Container with relative positioning for sticky elements */}
                        <div className="relative border border-gray-300 rounded-lg ">
                            {/* Sticky "Dear Employee," at the top */}
                            <div className="top-0  border-gray-300 px-3 py-2 text-sm font-small">
                                Dear Employee,
                            </div>

                            {/* Main textarea */}
                            <textarea
                                placeholder="As part of our sustainability reporting, you are requested to complete the Employee Commuting Data Form provided below.
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
                                className="w-full px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none placeholder:text-gray-400 text-gray-900"
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
                                        // Show toast error immediately if value is greater than 3
                                        if (value > 3) {
                                            toast.error("Maximum 3 reminders allowed");
                                            // Still update the value so user can see what they typed
                                            handleInputChange("totalReminders", value);

                                            // Clear the field after 1 second
                                            setTimeout(() => {
                                                handleInputChange("totalReminders", "");
                                            }, 6000);

                                            return;
                                        }
                                        handleInputChange("totalReminders", value);
                                    } else {
                                        handleInputChange("totalReminders", "");
                                    }
                                }}
                                helperText="Enter a number between 1 and 3"
                            />
                            <ErrorMessage message={errors.totalReminders} />
                        </div>

                        {/* Toggle Row */}
                        <div className="mt-7">
                            <ToggleButton
                                label="Reminder Interval (Days or Time)"
                                checked={showReminderDates}
                                onChange={() => setShowReminderDates(!showReminderDates)}
                                disabled={false}
                            />
                            <ErrorMessage message={errors.reminderDates} />
                        </div>
                    </div>

                    {/* Dynamic reminder date fields based on totalReminders */}
                    {showReminderDates && formData.totalReminders > 0 && formData.totalReminders <= 3 && (
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Array.from({ length: formData.totalReminders }, (_, index) => (
                                <div key={index}>
                                    <label className="field-label">
                                        {index === 0 && "1st"}
                                        {index === 1 && "2nd"}
                                        {index === 2 && "3rd"}
                                        {" Reminder Date & Time"}
                                    </label>
                                    <InputGroup
                                        type="datetime-local"
                                        placeholder={`Enter ${index + 1}${getOrdinalSuffix(index + 1)} reminder date`}
                                        value={formData[`reminderDate${index + 1}`] || ""}
                                        onChange={(e) => handleInputChange(`reminderDate${index + 1}`, e.target.value)}
                                        helperText={`${index + 1}${getOrdinalSuffix(index + 1)} reminder`}
                                    />
                                    <ErrorMessage message={errors[`reminderDate${index + 1}`]} />
                                </div>
                            ))}
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
                        <label className="field-label">Reminder Email Message Body</label>

                        {/* Container with relative positioning for sticky elements */}
                        <div className="relative border border-gray-300 rounded-lg ">
                            {/* Sticky "Dear Employee," at the top */}
                            <div className="top-0 border-gray-300 px-3 py-2 text-sm font-small">
                                Dear Employee,
                            </div>

                            {/* Main textarea */}
                            <textarea
                                placeholder="This is a kind reminder to please complete the Employee Commuting Data Form if you have not yet submitted your response.
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
                                className="w-full px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none placeholder:text-gray-400 text-gray-900"
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
