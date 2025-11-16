import React from 'react';
import Modal from './Modal.tsx';
import { SparklesIcon, AwardIcon, BookOpenIcon, RocketLaunchIcon, TrophyIcon, ShieldCheckIcon, CheckCircleIcon } from './Icons.tsx';

interface WhatsNewModalProps {
    isOpen: boolean;
    onClose: () => void;
    version: string;
}

const newFeatures = [
    {
        icon: <AwardIcon className="w-6 h-6 text-yellow-400" />,
        title: "All-New Milestones System",
        description: "Automatically unlock achievements for completing tasks, maintaining streaks, and more! View and share them from the new Milestones page."
    },
    {
        icon: <BookOpenIcon className="w-6 h-6 text-blue-400" />,
        title: "Internal Note Linking & Public Sharing",
        description: "Create your own personal wiki by linking notes together using [[...]]. You can also now share a public, read-only link to any of your notes."
    },
     {
        icon: <TrophyIcon className="w-6 h-6 text-green-400" />,
        title: "Manual Achievements Log",
        description: "We've brought back a dedicated space for you to manually log personal and professional accomplishments from any time."
    },
    {
        icon: <RocketLaunchIcon className="w-6 h-6 text-purple-400" />,
        title: "Major Performance Boost",
        description: "Tasks, Notes, and Journal pages have been rebuilt to handle thousands of items instantly, providing a much smoother experience."
    },
];

const improvements = [
     {
        icon: <ShieldCheckIcon className="w-6 h-6 text-indigo-400" />,
        title: "Increased Stability & Safer Imports",
        description: "Resolved numerous underlying bugs for a more stable experience and added better validation to prevent importing corrupted backup files."
    },
    {
        icon: <CheckCircleIcon className="w-6 h-6 text-green-400" />,
        title: "Smarter App Updates & Backups",
        description: "The app now notifies you when a new version is ready and reminds you to back up your data to keep it safe."
    }
];

const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ isOpen, onClose, version }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`What's New in v${version}`}>
            <div className="text-center mb-6">
                <SparklesIcon className="w-16 h-16 mx-auto text-primary" />
                <p className="mt-2 text-dark-text-secondary">We've been busy making FocusFlow even better for you!</p>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-dark-text">✨ New Features & Major Enhancements</h3>
                    <div className="space-y-4">
                        {newFeatures.map((update, index) => (
                            <div key={index} className="flex items-start gap-4 p-3 bg-light-bg dark:bg-dark-bg rounded-lg">
                                <div className="flex-shrink-0 mt-1">{update.icon}</div>
                                <div>
                                    <h4 className="font-semibold">{update.title}</h4>
                                    <p className="text-sm text-dark-text-secondary">{update.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-dark-text">🚀 Bug Fixes & Refinements</h3>
                     <div className="space-y-4">
                        {improvements.map((update, index) => (
                            <div key={index} className="flex items-start gap-4 p-3 bg-light-bg dark:bg-dark-bg rounded-lg">
                                <div className="flex-shrink-0 mt-1">{update.icon}</div>
                                <div>
                                    <h4 className="font-semibold">{update.title}</h4>
                                    <p className="text-sm text-dark-text-secondary">{update.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={onClose}
                    className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover"
                >
                    Got it!
                </button>
            </div>
        </Modal>
    );
};

export default WhatsNewModal;
