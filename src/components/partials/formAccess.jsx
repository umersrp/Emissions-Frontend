import React from 'react';
import { useNavigate } from 'react-router-dom';

const FormStatusModal = ({ isOpen, onClose, status, message, startDate, endDate }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    // Format dates nicely
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Determine the configuration based on status
    const getConfig = () => {
        if (status === 'not-started') {
            return {
                title: "Form Not Yet Available",
                icon: (
                    <svg className="h-10 w-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
                bgColor: "bg-yellow-100",
                iconBgColor: "bg-yellow-100",
                buttonClass: "bg-yellow-600 hover:bg-yellow-700",
                defaultMessage: "This form has not started yet."
            };
        } else if (status === 'expired') {
            return {
                title: "Form Expired",
                icon: (
                    <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
                bgColor: "bg-red-100",
                iconBgColor: "bg-red-100",
                buttonClass: "bg-red-600 hover:bg-red-700",
                defaultMessage: "This form has expired and can no longer be submitted."
            };
        } else if (status === 'already-submitted') {
            return {
                title: "Form Already Submitted",
                icon: (
                    <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
                bgColor: "bg-green-100",
                iconBgColor: "bg-green-100",
                buttonClass: "bg-green-600 hover:bg-green-700",
                defaultMessage: "You have already submitted this form. Thank you for your response!"
            };
        } else {
            // Fallback for unknown status - check message text
            const msg = message || '';
            if (msg.toLowerCase().includes('not started')) {
                return {
                    title: "Form Not Yet Available",
                    icon: (
                        <svg className="h-10 w-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ),
                    bgColor: "bg-yellow-100",
                    iconBgColor: "bg-yellow-100",
                    buttonClass: "bg-yellow-600 hover:bg-yellow-700",
                    defaultMessage: msg
                };
            } else if (msg.toLowerCase().includes('expired')) {
                return {
                    title: "Form Expired",
                    icon: (
                        <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ),
                    bgColor: "bg-red-100",
                    iconBgColor: "bg-red-100",
                    buttonClass: "bg-red-600 hover:bg-red-700",
                    defaultMessage: msg
                };
            } else {
                return {
                    title: "Form Already Submitted",
                    icon: (
                        <svg className="h-10 w-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ),
                    bgColor: "bg-blue-100",
                    iconBgColor: "bg-blue-100",
                    buttonClass: "bg-blue-600 hover:bg-blue-700",
                    defaultMessage: msg || "This form has already been submitted."
                };
            }
        }
    };

    const config = getConfig();

    // Get detailed message based on status
    const getDetailedMessage = () => {
        if (status === 'not-started') {
            return (
                <div className="space-y-3">
                    <p className="text-gray-700 text-center">
                        {message || config.defaultMessage}
                    </p>
                    {startDate && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-sm font-medium text-yellow-800 mb-1">
                                📅 Submission Opens:
                            </p>
                            <p className="text-sm text-yellow-700">
                                {formatDate(startDate)}
                            </p>
                            <p className="text-xs text-yellow-600 mt-2">
                                Please check back on this date to submit your commuting data.
                            </p>
                        </div>
                    )}
                    <div className="mt-2 text-center text-sm text-gray-500">
                        You'll be able to submit your employee commuting information once the form becomes available.
                    </div>
                </div>
            );
        } else if (status === 'expired') {
            return (
                <div className="space-y-3">
                    <p className="text-gray-700 text-center">
                        {message || config.defaultMessage}
                    </p>
                    {endDate && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-sm font-medium text-red-800 mb-1">
                                ⏰ Deadline Passed:
                            </p>
                            <p className="text-sm text-red-700">
                                {formatDate(endDate)}
                            </p>
                            <p className="text-xs text-red-600 mt-2">
                                Late submissions are not accepted for this reporting period.
                            </p>
                        </div>
                    )}
                    <div className="mt-2 text-center text-sm text-gray-500">
                        Please contact your administrator if you need assistance.
                    </div>
                </div>
            );
        } else {
            return (
                <div className="space-y-3">
                    <p className="text-gray-700 text-center">
                        {message || config.defaultMessage}
                    </p>
                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-green-800 mb-1">
                            ✓ Submission Confirmed
                        </p>
                        <p className="text-sm text-green-700">
                            Thank you for completing the employee commuting data collection form.
                        </p>
                        <p className="text-xs text-green-600 mt-2">
                            Your response has been recorded and will be included in the emissions calculation.
                        </p>
                    </div>
                    <div className="mt-2 text-center text-sm text-gray-500">
                        If you need to update your submission, please contact your administrator.
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex items-center justify-center mb-4">
                        <div className={`${config.iconBgColor} rounded-full p-3`}>
                            {config.icon}
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
                        {config.title}
                    </h3>

                    {getDetailedMessage()}

                    <div className="flex justify-center space-x-3 mt-6">
                        {status === 'already-submitted' && (
                            <button
                                onClick={() => {
                                    if (onClose) onClose();
                                    navigate('/my-submissions');
                                }}
                                className={`px-4 py-2 text-white rounded-md transition-colors ${config.buttonClass}`}
                            >
                                View My Submission
                            </button>
                        )}
                        <button
                            onClick={() => {
                                if (onClose) onClose();
                                window.location.reload();
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormStatusModal;