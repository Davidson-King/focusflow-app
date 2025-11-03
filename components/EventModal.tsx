
import React, { useState, useEffect } from 'react';
import Modal from './Modal.tsx';
import ButtonSpinner from './ButtonSpinner.tsx';
import type { TimelineEvent } from '../types.ts';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Omit<TimelineEvent, 'id'>) => Promise<void>;
    eventToEdit?: TimelineEvent | null;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, eventToEdit }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if(isOpen) {
            setTitle(eventToEdit?.title || '');
            setDate(eventToEdit?.date || new Date().toISOString().split('T')[0]);
            setDescription(eventToEdit?.description || '');
            setIsSaving(false);
        }
    }, [isOpen, eventToEdit]);
    
    const handleSave = async () => {
        if(!title.trim() || !date || isSaving) return;
        setIsSaving(true);
        try {
            await onSave({ title, date, description });
            onClose();
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={eventToEdit ? 'Edit Event' : 'Add Event'}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg" />
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg" />
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg resize-none" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-dark-border">Cancel</button>
                    <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 rounded-lg bg-primary text-white w-24 h-10 flex justify-center items-center">
                        {isSaving ? <ButtonSpinner /> : 'Save'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default EventModal;