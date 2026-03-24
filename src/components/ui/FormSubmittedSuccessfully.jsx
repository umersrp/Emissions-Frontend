import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const FormSubmittedSuccessfully = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2">
            <div className="max-w-md w-full">
                <Card className="shadow-xl">
                    <div className="text-center ">
                        
                        {/* Success Icon */}
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-2">
                            <svg 
                                className="h-10 w-10 text-green-600" 
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
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Submission Successful!
                        </h1>
                        <p className="text-lg text-gray-700 mb-2">
                            Your form has been successfully submitted.
                        </p>
                        {/* Confirmation Details */}
                        <div className="p-2 mb-4 ">
                               <h1 className='text-black-500 text-2xl'>Thank You</h1>
                        </div>                   
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default FormSubmittedSuccessfully;