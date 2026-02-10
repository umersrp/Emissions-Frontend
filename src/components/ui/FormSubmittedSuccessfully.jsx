import React, { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';

const FormSubmittedSuccessfully = () => {
    const location = useLocation();
    const [formData, setFormData] = useState(null);
    // Removed: const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        // Get data passed from the form
        if (location.state) {
            setFormData(location.state);
        }

    }, [location.state]); // Removed 'navigate' from dependencies



    const getFormTypeText = () => {
        if (!formData?.formType) return 'Form';
        
        const formTypes = {
            'employee-commuting': 'Employee Commuting Data',
            'business-travel': 'Business Travel Data',
            'purchased-goods': 'Purchased Goods Data',
            'fuel-energy': 'Fuel and Energy Data'
        };
        
        return formTypes[formData.formType] || 'Form';
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <Card className="shadow-xl">
                    <div className="text-center py-10 px-4">
                        
                        {/* Success Icon */}
                        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                            <svg 
                                className="h-12 w-12 text-green-600" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth="2" 
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>

                        {/* Success Message */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Submission Successful!
                        </h1>
                        
                        <p className="text-lg text-gray-700 mb-2">
                            Your {getFormTypeText()} has been successfully submitted.
                        </p>
                        
                        {formData?.reportingYear && (
                            <p className="text-gray-600 mb-6">
                                Reporting Year: <span className="font-semibold">{formData.reportingYear}</span>
                            </p>
                        )}

                        {/* Confirmation Details */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Status:</span>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                        <svg className="mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                                            <circle cx="4" cy="4" r="3" />
                                        </svg>
                                        Submitted Successfully
                                    </span>
                                </div>
                                
                                {formData?.submissionTime && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Submission Time:</span>
                                        <span className="font-medium text-gray-800">
                                            {new Date(formData.submissionTime).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                
                                {formData?.userInfo?.name && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Submitted By:</span>
                                        <span className="font-medium text-gray-800">
                                            {formData.userInfo.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>


                    </div>
                </Card>
            </div>
        </div>
    );
};

export default FormSubmittedSuccessfully;