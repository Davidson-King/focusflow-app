import React from 'react';
import Modal from './Modal';

interface ProfilePictureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    imageSrc: string | null;
}

const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({ isOpen, onClose, onSave, imageSrc }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Preview Profile Picture">
            {imageSrc && <img src={imageSrc} alt="Preview" className="w-48 h-48 rounded-full mx-auto object-cover border-4 border-dark-border" />}
            <p className="text-center text-sm text-dark-text-secondary mt-4">This preview is a cropped square. The final image will be resized to fit.</p>
            <p className="text-center text-xs text-dark-text-secondary mt-1">Max file size: 2MB.</p>
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={onClose} className="px-4 py-2 rounded-lg bg-light-bg dark:bg-dark-border">Cancel</button>
                <button onClick={onSave} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover">Save Picture</button>
            </div>
        </Modal>
    );
};

export default ProfilePictureModal;
