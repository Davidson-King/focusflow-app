import React from 'react';
import Modal from './Modal';
import { CloudArrowDownIcon } from './Icons';

interface BackupReminderModalProps {
    isOpen: boolean;
    onClose: () => void; // Handles "Remind Me Later"
    onExport: () => void; // Handles "Back Up Now"
}

const BackupReminderModal: React.FC<BackupReminderModalProps> = ({ isOpen, onClose, onExport }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Data Backup Reminder">
            <div className="text-center">
                <CloudArrowDownIcon className="w-16 h-16 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">It's time for a backup!</h3>
                <p className="text-dark-text-secondary mb-4">
                    To keep your data safe, it's a good practice to create regular backups. Your last backup was a while ago.
                </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                    onClick={onClose}
                    className="w-full px-4 py-3 rounded-lg bg-light-bg dark:bg-dark-border font-semibold hover:bg-opacity-80"
                >
                    Remind Me Later
                </button>
                <button
                    onClick={onExport}
                    className="w-full px-4 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover"
                >
                    Back Up Now
                </button>
            </div>
        </Modal>
    );
};

export default BackupReminderModal;
