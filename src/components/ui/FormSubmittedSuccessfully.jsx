import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const FormSubmittedSuccessfully = () => {
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
                        
                        <p className="text-lg text-gray-700 mb-6">
                            Your form has been successfully submitted.
                        </p>

                        {/* Confirmation Details */}
                        <div className="bg-green-600 border border-blue-200 rounded-lg p-6 mb-8">
                            <div className="space-y-3">
                               <h1 className='text-white text-2xl'>Thank You</h1>
                            </div>
                        </div>

                       

                    </div>
                </Card>
            </div>
        </div>
    );
};

export default FormSubmittedSuccessfully;