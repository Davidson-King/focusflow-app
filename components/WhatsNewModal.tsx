import React from 'react';
import Modal from './Modal.tsx';
import { SparklesIcon, AwardIcon, BookOpenIcon, CheckCircleIcon } from './Icons.tsx';

interface WhatsNewModalProps {
    isOpen: boolean;
    onClose: () => void;
    version: string;
}

const updates = [
    {
        icon: <AwardIcon className="w-6 h-6 text-yellow-400" />,
        title: "Log Your Achievements",
        description: "Introducing the new Achievements tracker! Log your daily and weekly wins to build momentum and celebrate your progress. Find it in the sidebar."
    },
    {
        icon: <BookOpenIcon className="w-6 h-6 text-blue-400" />,
        title: "Expanded Help & Guides",
        description: "Master every feature with our new in-depth Help section. Get tips and tricks to maximize your productivity. Find it in the sidebar."
    },
    {
        icon: <CheckCircleIcon className="w-6 h-6 text-green-400" />,
        title: "General Improvements",
        description: "We've squashed some bugs and made various UI tweaks for a smoother, more reliable experience across the app."
    }
];

const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ isOpen, onClose, version }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`What's New in v${version}`}>
            <div className="text-center mb-6">
                <SparklesIcon className="w-16 h-16 mx-auto text-primary" />
                <p className="mt-2 text-dark-text-secondary">We've been busy making FocusFlow even better for you!</p>
            </div>

            <div className="space-y-4">
                {updates.map((update, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 bg-light-bg dark:bg-dark-bg rounded-lg">
                        <div className="flex-shrink-0 mt-1">{update.icon}</div>
                        <div>
                            <h4 className="font-semibold">{update.title}</h4>
                            <p className="text-sm text-dark-text-secondary">{update.description}</p>
                        </div>
                    </div>
                ))}
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
