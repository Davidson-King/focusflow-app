import React, { useState } from 'react';
import Modal from './Modal.tsx';
import ButtonSpinner from './ButtonSpinner.tsx';

interface ImportConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isImporting: boolean;
}

const ImportConfirmationModal: React.FC<ImportConfirmationModalProps> = ({ isOpen, onClose, onConfirm, isImporting }) => {
    const [confirmText, setConfirmText] = useState('');

    // Reset text when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setConfirmText('');
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Confirm Data Merge">
            <p className="mb-4">Are you sure you want to import this file? <strong>This will merge the imported data with your current data.</strong></p>
            <p className="mb-4 p-3 bg-yellow-500/10 text-yellow-400 rounded-lg">Existing items will be updated if they exist in the backup file. This action cannot be undone. It's recommended to export your current data first.</p>
            <div className="mt-4">
                <label htmlFor="import-confirm" className="block text-sm font-medium mb-1">
                    To confirm, please type <strong className="text-dark-text">MERGE</strong> below.
                </label>
                <input 
                    id="import-confirm"
                    type="text" 
                    value={confirmText}
                    onChange={e => setConfirmText(e.target.value)}
                    className="w-full p-2 bg-dark-bg border border-dark-border rounded-lg"
                    autoFocus
                />
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={onClose} className="px-4 py-2 rounded-lg bg-light-bg dark:bg-dark-border">Cancel</button>
                <button 
                    onClick={onConfirm} 
                    disabled={isImporting || confirmText !== 'MERGE'} 
                    className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed w-48 h-10 flex justify-center items-center"
                >
                    {isImporting ? <ButtonSpinner /> : 'Merge and Import'}
                </button>
            </div>
        </Modal>
    );
};

export default ImportConfirmationModal;