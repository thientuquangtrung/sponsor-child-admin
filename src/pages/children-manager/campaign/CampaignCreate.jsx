import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ChildProfile from '@/pages/children-manager/campaign/ChildProfile';
import CampaignInfo from '@/pages/children-manager/campaign/CampaignInfo';

const steps = [
    'Hồ Sơ Trẻ Em',
    'Thông Tin Chiến Dịch',
];

const CampaignCreate = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [childID, setChildID] = useState(null);
    const [isChildProfileCreated, setIsChildProfileCreated] = useState(false);

    const nextStep = () => {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const handleChildProfileSuccess = (createdChildID) => {
        console.log('Child profile created with ID:', createdChildID);
        setChildID(createdChildID);
        setIsChildProfileCreated(true);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return <ChildProfile
                    onSuccess={handleChildProfileSuccess}
                    nextStep={nextStep}
                />;
            case 1:
                return childID ? <CampaignInfo childID={childID} /> : null;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto my-4 p-4 md:p-8 bg-[#c3e2da] rounded-lg font-sans">
            <div className="w-full mb-4 md:mb-8 overflow-x-auto">
                <ol className="flex items-center w-full p-2 md:p-3 space-x-2 text-xs md:text-sm font-medium text-center text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm dark:text-gray-400 sm:text-base dark:bg-gray-800 dark:border-gray-700 sm:p-4 sm:space-x-4">
                    {steps.map((step, index) => (
                        <li key={index} className={`flex items-center font-bold ${currentStep === index ? 'text-green-500 dark:text-green-500' : ''}`}>
                            <span className={`flex items-center justify-center w-5 h-5 mr-2 border ${currentStep === index ? 'border-green-600 dark:border-green-500' : 'border-gray-500 dark:border-gray-400'} rounded-full shrink-0`}>
                                {index + 1}
                            </span>
                            <span className="hidden sm:inline">{step}</span>
                            {index < steps.length - 1 && (
                                <ArrowRight className="w-5 h-5 ml-2 sm:ml-4" />
                            )}
                        </li>
                    ))}
                </ol>
            </div>

            <div className="w-full mb-4 md:mb-8">
                {renderStep()}
            </div>

            <div className="w-full flex justify-between">
                <div>
                    {currentStep > 0 && (
                        <Button
                            className="bg-gradient-to-b from-teal-400 to-teal-600 text-white px-3 py-1 md:px-6 md:py-2 rounded-lg shadow text-xs md:text-sm"
                            onClick={prevStep}
                        >
                            <ArrowLeft className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" /> Quay lại
                        </Button>
                    )}
                </div>
                <div>
                    {currentStep < steps.length - 1 && (
                        <Button
                            className="bg-gradient-to-b from-teal-400 to-teal-600 text-white px-3 py-1 md:px-6 md:py-2 rounded-lg shadow text-xs md:text-sm"
                            onClick={nextStep}
                            disabled={!isChildProfileCreated}
                        >
                            Tiếp theo <ArrowRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CampaignCreate;