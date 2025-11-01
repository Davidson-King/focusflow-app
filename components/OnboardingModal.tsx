import React, { useState } from 'react';
import Modal from './Modal.tsx';
import { RocketLaunchIcon, Bars3Icon, SearchIcon, PencilSquareIcon, CheckCircleIcon } from './Icons.tsx';

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const steps = [
    {
        icon: <RocketLaunchIcon className="w-12 h-12 mx-auto text-primary" />,
        title: "Welcome to your Dashboard!",
        content: "This quick tour will show you the main features to get you started."
    },
    {
        icon: <Bars3Icon className="w-12 h-12 mx-auto text-primary" />,
        title: "Navigation Sidebar",
        content: "Use the sidebar on the left to navigate between different modules like Tasks, Notes, and Goals."
    },
    {
        icon: <SearchIcon className="w-12 h-12 mx-auto text-primary" />,
        title: "Global Search",
        content: "Quickly find anything across your entire dashboard using the search button in the top header."
    },
    {
        icon: <PencilSquareIcon className="w-12 h-12 mx-auto text-primary" />,
        title: "Customize Your Home",
        content: "On the Home screen, you can click 'Edit Layout' to rearrange, hide, or show different widgets to create your perfect dashboard."
    },
    {
        icon: <CheckCircleIcon className="w-12 h-12 mx-auto text-primary" />,
        title: "You're All Set!",
        content: "You're ready to start organizing your life. Enjoy your new focused workspace!"
    }
];

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(s => s + 1);
        } else {
            onClose();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(s => s - 1);
        }
    };

    const step = steps[currentStep];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Dashboard Tour">
            <div className="text-center p-4 space-y-4">
                <div>{step.icon}</div>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="text-dark-text-secondary">{step.content}</p>
                
                <div className="flex justify-center gap-2 pt-4">
                    {Array.from({ length: steps.length }).map((_, index) => (
                        <div key={index} className={`w-3 h-3 rounded-full transition-colors ${currentStep === index ? 'bg-primary' : 'bg-dark-border'}`}></div>
                    ))}
                </div>

                <div className="flex justify-between items-center pt-6">
                    <button onClick={handleBack} className={`px-4 py-2 rounded-lg font-semibold hover:bg-dark-border ${currentStep === 0 ? 'opacity-0 pointer-events-none' : ''}`}>
                        Back
                    </button>

                    <button onClick={handleNext} className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover">
                        {currentStep === steps.length - 1 ? 'Finish Tour' : 'Next'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default OnboardingModal;