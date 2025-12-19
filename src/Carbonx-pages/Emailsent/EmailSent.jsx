import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import axios from "axios";
import { toast } from "react-toastify";
import Select from "react-select"; // Install via `npm i react-select`

const EmailSent = () => {
    const [formData, setFormData] = useState({
        userName: "",
        userEmailId: "",
        totalEmployees: "",
        minEmployeesRequired: 40,
        selectedEmployees: [], // Store selected employee objects { value, label }
        startDateTime: "",
        endDateTime: "",
        subject: "Employee Commuting Data – Action Required",
        formLink: "http://localhost:5173/AddfromEmployee",
        totalReminders: 3,
        reminderDates: "",
        reminderSubject: "Reminder – Employee Commuting Data Form Submission",
        reminderMessageBody:
            "This is a kind reminder to please complete the Employee Commuting Data Form if you have not yet submitted your response. Your participation is important for our sustainability reporting.",
    });

    const [loading, setLoading] = useState(false);
    const [employeesOptions, setEmployeesOptions] = useState([]); // All employees options
    const [emailCount, setEmailCount] = useState(0);

    // Fetch company users on component mount
    useEffect(() => {
        const fetchCompanyUsers = async () => {
            try {
                const token = localStorage.getItem("token");

                // Use minEmployeesRequired as limit
                const response = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/auth/getCompanyUsers`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { page: 1, limit: formData.minEmployeesRequired },
                    }
                );

                const users = response.data.data.users || [];
                const options = users.map((u) => ({
                    value: u.email,
                    label: `${u.name} (${u.email})`,
                }));

                setEmployeesOptions(options);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load company employees");
            }
        };

        fetchCompanyUsers();
    }, [formData.minEmployeesRequired]); // Re-run whenever minEmployeesRequired changes


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
        if (errors.length > 0) {
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
                emails: formData.selectedEmployees.map((e) => e.value),
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
            const errorMessage =
                error.response?.data?.message || error.response?.data?.error || "Failed to send email";
            toast.error(errorMessage);
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
                        <Textinput
                            label="User Name *"
                            placeholder="Enter your name"
                            value={formData.userName}
                            onChange={(e) => handleInputChange("userName", e.target.value)}
                            required
                        />
                        <Textinput
                            label="User Email ID *"
                            type="email"
                            placeholder="your.email@company.com"
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
                        <Textinput
                            label="Total Number of Employees"
                            type="number"
                            placeholder="Auto-calculated"
                            value={formData.selectedEmployees.length}
                        />
                        <Textinput
                            label="Minimum Employees Required *"
                            type="number"
                            value={formData.minEmployeesRequired}
                            onChange={(e) =>
                                handleInputChange("minEmployeesRequired", Number(e.target.value))
                            }
                            min="1"
                            required
                        />

                    </div>

                    <Select
                        isMulti
                        options={employeesOptions}
                        value={formData.selectedEmployees}
                        onChange={(selected) => handleInputChange("selectedEmployees", selected)}
                        placeholder="Select Employees..."
                        isOptionDisabled={() =>
                            formData.selectedEmployees.length >= Number(formData.minEmployeesRequired)
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

                    <Textinput
                        label="Email Subject *"
                        placeholder="Employee Commuting Data – Action Required"
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        className="mb-4"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Textinput
                            label="Data Collection Start Date & Time *"
                            type="datetime-local"
                            value={formData.startDateTime}
                            onChange={(e) => handleInputChange("startDateTime", e.target.value)}
                        />

                        <Textinput
                            label="Data Collection End Date & Time *"
                            type="datetime-local"
                            value={formData.endDateTime}
                            onChange={(e) => handleInputChange("endDateTime", e.target.value)}
                        />
                    </div>

                    <Textinput
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Textinput
                            label="Total Reminders"
                            type="number"
                            min="0"
                            max="10"
                            value={formData.totalReminders}
                            onChange={(e) => handleInputChange("totalReminders", e.target.value)}
                        />

                        <Textinput
                            label="Reminder Dates (comma separated, optional)"
                            placeholder="2025-12-05T10:00, 2025-12-10T10:00"
                            value={formData.reminderDates}
                            onChange={(e) => handleInputChange("reminderDates", e.target.value)}
                            helperText="Leave empty for automatic interval scheduling"
                        />
                    </div>

                    <Textinput
                        label="Reminder Subject"
                        placeholder="Reminder – Employee Commuting Data Form Submission"
                        value={formData.reminderSubject}
                        onChange={(e) => handleInputChange("reminderSubject", e.target.value)}
                        className="mb-4"
                    />

                    <label className="block text-sm font-medium mb-2">Reminder Message Body</label>
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
