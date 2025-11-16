import React, { useState, useMemo, useContext, useEffect } from 'react';
import { useIndexedDB } from '../../hooks/useIndexedDB';
import type { Achievement } from '../../types';
import { PlusIcon, TrashIcon, PencilIcon, TrophyIcon, CalendarIcon } from '../../components/Icons';
import EmptyState from '../../components/EmptyState';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import { AuthContext } from '../../contexts/AuthContext';
import { useNotifier } from '../../contexts/NotificationContext';
import ButtonSpinner from '../../components/ButtonSpinner';

const AchievementModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (achievement: Omit<Achievement, 'id' | 'user_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    achievementToEdit?: Achievement | null;
}> = ({ isOpen, onClose, onSave, achievementToEdit }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if(isOpen) {
            setTitle(achievementToEdit?.title || '');
            setDate(achievementToEdit?.date || new Date().toISOString().split('T')[0]);
            setDescription(achievementToEdit?.description || '');
            setIsSaving(false);
        }
    }, [isOpen, achievementToEdit]);
    
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
        <Modal isOpen={isOpen} onClose={onClose} title={achievementToEdit ? 'Edit Achievement' : 'Add Achievement'}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Ran a marathon" className="w-full p-2 bg-light-bg dark:bg-dark-bg border rounded-lg" />
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border rounded-lg" />
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Add some details about your achievement..." className="w-full p-2 bg-light-bg dark:bg-dark-bg border rounded-lg resize-none" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-dark-border">Cancel</button>
                    <button onClick={handleSave} disabled={isSaving || !title.trim()} className="px-4 py-2 rounded-lg bg-primary text-white w-24 h-10 flex justify-center items-center disabled:opacity-50">
                        {isSaving ? <ButtonSpinner /> : 'Save'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const Achievements: React.FC = () => {
    const { user } = useContext(AuthContext);
    const { items: achievements, isLoading, addItem, updateItem, deleteItem } = useIndexedDB<Achievement>('achievements');
    const { addNotification } = useNotifier();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [achievementToEdit, setAchievementToEdit] = useState<Achievement | null>(null);
    const [achievementToDelete, setAchievementToDelete] = useState<Achievement | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const sortedAchievements = useMemo(() => [...achievements].sort((a,b) => b.date.localeCompare(a.date)), [achievements]);
    
    const handleSave = async (data: Omit<Achievement, 'id' | 'user_id' | 'createdAt' | 'updatedAt'>) => {
        if (!user) return;
        try {
            if (achievementToEdit) {
                await updateItem(achievementToEdit.id, data);
                addNotification('Achievement updated!', 'success');
            } else {
                await addItem({ ...data, user_id: user.id, createdAt: Date.now() });
                addNotification('Achievement added!', 'success');
            }
        } catch (error) {
            addNotification('Failed to save achievement.', 'error');
        } finally {
            setAchievementToEdit(null);
        }
    };
    
    const confirmDelete = async () => {
        if (!achievementToDelete || isDeleting) return;
        setIsDeleting(true);

        const element = document.getElementById(`achievement-${achievementToDelete.id}`);
        if(element) element.classList.add('animate-item-out');

        setTimeout(async () => {
            try {
                await deleteItem(achievementToDelete.id);
                addNotification('Achievement deleted.', 'success');
            } catch (error) {
                addNotification('Failed to delete achievement.', 'error');
            } finally {
                setIsDeleting(false);
                setAchievementToDelete(null);
            }
        }, 300);
    };
    
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold">Your Achievements</h1>
                <button onClick={() => { setAchievementToEdit(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm">
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Achievement</span>
                </button>
            </div>

             {isLoading ? <Spinner /> : achievements.length === 0 ? (
                 <EmptyState 
                    title="Log Your First Achievement"
                    message="Record your personal and professional accomplishments, big or small."
                    icon={<TrophyIcon className="w-16 h-16" />} 
                    actionText="Add an Achievement"
                    onAction={() => setIsModalOpen(true)}
                 />
             ) : (
                <div className="space-y-4">
                    {sortedAchievements.map(item => (
                        <div key={item.id} id={`achievement-${item.id}`} className="bg-light-card dark:bg-dark-card p-4 rounded-xl group transition-all duration-300">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="flex items-center gap-2 text-sm text-dark-text-secondary"><CalendarIcon className="w-4 h-4"/> {new Date(`${item.date}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <h3 className="font-semibold text-lg my-1">{item.title}</h3>
                                    {item.description && <p className="text-dark-text-secondary text-sm">{item.description}</p>}
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 flex-shrink-0">
                                    <button onClick={() => { setAchievementToEdit(item); setIsModalOpen(true); }} aria-label={`Edit achievement: ${item.title}`} className="p-2 hover:bg-dark-border rounded-md"><PencilIcon className="w-4 h-4" /></button>
                                    <button onClick={() => setAchievementToDelete(item)} aria-label={`Delete achievement: ${item.title}`} className="p-2 hover:bg-dark-border rounded-md"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
             )}
            <AchievementModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} achievementToEdit={achievementToEdit} />
            
            <Modal isOpen={!!achievementToDelete} onClose={() => setAchievementToDelete(null)} title="Delete Achievement?">
                <p>Are you sure you want to delete the achievement "{achievementToDelete?.title}"?</p>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={() => setAchievementToDelete(null)} className="px-4 py-2 rounded-lg bg-dark-border">Cancel</button>
                    <button onClick={confirmDelete} disabled={isDeleting} className="px-4 py-2 rounded-lg bg-red-600 text-white w-32 h-10 flex items-center justify-center">
                        {isDeleting ? <ButtonSpinner /> : 'Delete'}
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default Achievements;
