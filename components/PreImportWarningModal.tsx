import React from 'react';
import Modal from './Modal.tsx';
import { ShieldCheckIcon } from './Icons.tsx';

interface PreImportWarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProceed: () => void;
    onExport: () => void;
}

const PreImportWarningModal: React.FC<PreImportWarningModalProps> = ({ isOpen, onClose, onProceed, onExport }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Import Data Safeguard">
            <div className="text-center">
                <ShieldCheckIcon className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Important: Back Up First!</h3>
                <p className="text-dark-text-secondary mb-4">
                    Importing will merge data from a file with your current data. To prevent any accidental data loss, it is <strong>highly recommended</strong> to back up your current data before proceeding.
                </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                    onClick={onExport}
                    className="w-full px-4 py-3 rounded-lg bg-light-bg dark:bg-dark-border font-semibold hover:bg-opacity-80"
                >
                    Export Current Data
                </button>
                <button
                    onClick={onProceed}
                    className="w-full px-4 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover"
                >
                    Proceed to Import
                </button>
            </div>
             <div className="mt-4 text-center">
                <button onClick={onClose} className="text-sm text-dark-text-secondary hover:underline">
                    Cancel
                </button>
            </div>
        </Modal>
    );
};

export default PreImportWarningModal;