import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import axios from "axios";
import { toast } from "react-toastify";
import InputGroup from "@/components/ui/InputGroup";
import CustomSelect from "@/components/ui/Select";
import ToggleButton from "@/components/ui/ToggleButton";

const EmailSent = () => {
    const [formData, setFormData] = useState({
        userName: "",
        userEmailId: "",
        totalEmployees: "",
        minEmployeesRequired: 0,
        selectedEmployees: [], // Store selected employee objects { value, label }
        startDateTime: "",
        endDateTime: "",
        subject: "Employee Commuting Data – Action Required",
        formLink: "https://ksvvmxbk-5173.inc1.devtunnels.ms/AddfromEmployee",
        totalReminders: 3,
        reminderDates: "",
        reminderSubject: "Reminder – Employee Commuting Data Form Submission",
        reminderMessageBody:
            "This is a kind reminder to please complete the Employee Commuting Data Form if you have not yet submitted your response. Your participation is important for our sustainability reporting.",
    });

    const [loading, setLoading] = useState(false);
    const [employeesOptions, setEmployeesOptions] = useState([]); // All employees options
    const [emailCount, setEmailCount] = useState(0);
    const [showReminderDates, setShowReminderDates] = useState(false);


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
    };

    // Validation
    const validateForm = () => {
        const errors = [];

        if (!formData.userName.trim()) errors.push("User Name is required");
        if (!formData.userEmailId.trim()) errors.push("User Email ID is required");
        if (formData.selectedEmployees.length === 0)
            errors.push("At least one employee must be selected");

        if (!formData.startDateTime) errors.push("Start date and time is required");
        if (!formData.endDateTime) errors.push("End date and time is required");

        if (
            formData.startDateTime &&
            formData.endDateTime &&
            new Date(formData.endDateTime) <= new Date(formData.startDateTime)
        )
            errors.push("End date must be after start date");

        if (!formData.formLink.trim()) errors.push("Form link is required");

        const minRequired = Number(formData.minEmployeesRequired) || 0;
        if (emailCount < minRequired)
            errors.push(
                `Minimum ${minRequired} employees required. Currently selected ${emailCount}.`
            );

        return errors;
    };

    // Parse reminder dates
    const parseReminderDates = (datesString) => {
        if (!datesString) return [];
        return datesString
            .split(",")
            .map((d) => d.trim())
            .filter(Boolean)
            .map((dateStr) => new Date(dateStr).toISOString());
    };

    // Send Email Handler
    const handleSendEmail = async () => {
        const errors = validateForm();
        if (errors.length) {
            errors.forEach((err) => toast.error(err));
            return;
        }

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
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <Card>
                <h2 className="text-xl font-semibold mb-6 text-gray-800">
                    Employee Commuting – Email Configuration
                </h2>

                {/* User Info */}
                <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">User Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputGroup
                            label="User name *"
                            placeholder="Enter Name"
                            value={formData.userName}
                            onChange={(e) => handleInputChange("userName", e.target.value)}
                            required
                        />
                        <InputGroup
                            label="User Email"
                            type="email"
                            placeholder="Enter Email"
                            value={formData.userEmailId}
                            onChange={(e) => handleInputChange("userEmailId", e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Employee Info */}
                <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Employee Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <InputGroup
                            label="Total Number of Employees"
                            type="number"
                            placeholder="Auto Calculated"
                            value={formData.selectedEmployees.length}
                        />
                        <InputGroup
                            label="Minimum Number of Employees Required *"
                            type="number"
                            placeholder="e.g., 1, 2, 3"
                            value={formData.minEmployeesRequired}
                            onChange={(e) =>
                                handleInputChange("minEmployeesRequired", Number(e.target.value))
                            }
                            min="1"
                            required
                        />

                    </div>

                    {/* <CustomSelect
                        isMulti
                        options={employeesOptions}
                        value={formData.selectedEmployees}
                        onChange={(selected) => handleInputChange("selectedEmployees", selected)}
                        placeholder="Select Employees"
                        // isOptionDisabled={() =>
                        //     formData.selectedEmployees.length >= Number(formData.minEmployeesRequired)
                        // }
                        isOptionDisabled={(option) => {
                            const maxLimit = Number(formData.minEmployeesRequired);   
                            const selectedCount = formData.selectedEmployees.length;

                            // Allow deselection: if option is already selected, don't disable it
                            const isAlreadySelected = formData.selectedEmployees.some(
                                selected => selected.value === option.value
                            );

                            // Disable new selections only if limit reached AND option is not already selected
                            return !isAlreadySelected && selectedCount >= maxLimit;
                        }}
                    /> */}
                    <CustomSelect
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
                            if (selected.length <= maxLimit) {
                                handleInputChange("selectedEmployees", selected);
                            }
                        }}
                        placeholder={`Select Employees`}
                        noOptionsMessage={() =>
                            employeesOptions.length === 0
                                ? "No employees available"
                                : "All available employees have been selected"
                        }
                    />

                    <p className="text-xs text-gray-500 mt-1">
                        {emailCount >= Number(formData.minEmployeesRequired) ? (
                            <span className="text-green-600">✓ Minimum requirement met</span>
                        ) : (
                            <span className="text-red-600">
                                ⚠ Need {Number(formData.minEmployeesRequired) - emailCount} more employees
                            </span>
                        )}
                    </p>
                </div>

                {/* Email Configuration */}
                <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Email Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <InputGroup
                            label="Data Collection Initiation Date & Time *"
                            type="datetime-local"
                            value={formData.startDateTime}
                            onChange={(e) => handleInputChange("startDateTime", e.target.value)}
                        />
                        <InputGroup
                            label="Data Collection End Date & Time *"
                            type="datetime-local"
                            value={formData.endDateTime}
                            onChange={(e) => handleInputChange("endDateTime", e.target.value)}
                        />
                    </div>
                    <InputGroup
                        label="Email Message *"
                        placeholder="Employee Commuting Data – Action Required"
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        className="mb-4"
                    />
                    <InputGroup
                        label="Form Link *"
                        placeholder="https://carbonx4.vercel.app/AddfromEmployee"
                        value={formData.formLink}
                        onChange={(e) => handleInputChange("formLink", e.target.value)}
                        className="mb-6"
                        disabled
                    />
                </div>

                {/* Reminder Configuration */}
                <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Reminder Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
                        <InputGroup
                            label="Total Reminders"
                            type="number"
                            placeholder="e.g., 1, 2, 3"
                            min="0"
                            max="10"
                            value={formData.totalReminders}
                            onChange={(e) => handleInputChange("totalReminders", e.target.value)}
                        />

                        {/* Toggle Row */}
                        <div className="mt-9">
                            {/* <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Reminder Interval (Days or Time)
                                </label>

                            </div> */}
                            {/* <button
                                type="button"
                                onClick={() => setShowReminderDates(!showReminderDates)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showReminderDates ? 'bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]' : 'bg-gray-300'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-3 w-4 transform rounded-full bg-white transition-transform ${showReminderDates ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button> */}
                            <ToggleButton
                                label="Reminder Interval (Days or Time)" // Optional: You can add a label if needed
                                checked={showReminderDates}
                                onChange={() => setShowReminderDates(!showReminderDates)}
                                disabled={false} // Set to true if you want to disable it
                            />
                        </div>
                        {showReminderDates && (
                            <InputGroup
                                label="1st Reminder Date & Time "
                                placeholder="2025-12-05T10:00, 2025-12-10T10:00"
                                value={formData.reminderDates || ""}
                                onChange={(e) => handleInputChange("reminderDates", e.target.value)}
                                helperText="Enter dates in format: YYYY-MM-DDTHH:MM"
                            />
                        )}
                        {/* Conditionally show the input field */}
                    </div>
                    <InputGroup
                        label="Email Subject"
                        placeholder="Reminder – Employee Commuting Data Form Submission"
                        value={formData.reminderSubject}
                        onChange={(e) => handleInputChange("reminderSubject", e.target.value)}
                        className="mb-4"
                    />
                    <label className="block text-sm font-medium mb-2">Reminder Email Message </label>
                    <textarea
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-[80px]"
                        placeholder="This is a kind reminder to please complete the Employee Commuting Data Form..."
                        value={formData.reminderMessageBody}
                        onChange={(e) => handleInputChange("reminderMessageBody", e.target.value)}
                    />
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
