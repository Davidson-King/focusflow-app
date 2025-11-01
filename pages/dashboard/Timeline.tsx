import React, { useState, useMemo, useContext, useEffect } from 'react';
import { useIndexedDB } from '../../hooks/useIndexedDB';
import type { Timeline, TimelineEvent } from '../../types';
import { PlusIcon, TrashIcon, PencilIcon, MapIcon, CalendarIcon } from '../../components/Icons';
import EmptyState from '../../components/EmptyState.tsx';
import Spinner from '../../components/Spinner.tsx';
import Modal from '../../components/Modal.tsx';
import { AuthContext } from '../../contexts/AuthContext';
import { useNotifier } from '../../contexts/NotificationContext';
import ButtonSpinner from '../../components/ButtonSpinner.tsx';
import { generateUUID } from '../../utils/uuid.ts';

const EventModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Omit<TimelineEvent, 'id'>) => Promise<void>;
    eventToEdit?: TimelineEvent | null;
}> = ({ isOpen, onClose, onSave, eventToEdit }) => {
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
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border rounded-lg" />
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border rounded-lg" />
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-2 bg-light-bg dark:bg-dark-bg border rounded-lg resize-none" />
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

const TimelineView: React.FC = () => {
    const { user } = useContext(AuthContext);
    const { items: timelines, isLoading, addItem, updateItem, deleteItem } = useIndexedDB<Timeline>('timelines');
    const { addNotification } = useNotifier();

    const [selectedTimelineId, setSelectedTimelineId] = useState<string | null>(null);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [eventToEdit, setEventToEdit] = useState<TimelineEvent | null>(null);
    const [newTimelineName, setNewTimelineName] = useState('');

    const sortedTimelines = useMemo(() => [...timelines].sort((a, b) => a.createdAt - b.createdAt), [timelines]);

    useEffect(() => {
        if (!selectedTimelineId && sortedTimelines.length > 0) {
            setSelectedTimelineId(sortedTimelines[0].id);
        }
    }, [selectedTimelineId, sortedTimelines]);

    const handleAddTimeline = async () => {
        if (newTimelineName.trim() && user) {
            try {
                const newTimeline = await addItem({ 
                    user_id: user.id, 
                    name: newTimelineName.trim(), 
                    events: [],
                    createdAt: Date.now()
                });
                setSelectedTimelineId(newTimeline.id);
                setNewTimelineName('');
            } catch (error) {
                addNotification('Failed to create timeline. Please try again.', 'error');
            }
        }
    };

    const handleDeleteTimeline = async (id: string) => {
        try {
            await deleteItem(id);
            addNotification('Timeline deleted.', 'success');
            if (selectedTimelineId === id) {
                 setSelectedTimelineId(sortedTimelines.length > 1 ? sortedTimelines.filter(t => t.id !== id)[0]?.id : null);
            }
        } catch (error) {
            addNotification('Failed to delete timeline. Please try again.', 'error');
        }
    };
    
    const selectedTimeline = useMemo(() => timelines.find(t => t.id === selectedTimelineId), [timelines, selectedTimelineId]);
    const sortedEvents = useMemo(() => selectedTimeline?.events.sort((a,b) => a.date.localeCompare(b.date)) || [], [selectedTimeline]);
    
    const handleSaveEvent = async (eventData: Omit<TimelineEvent, 'id'>) => {
        if (!selectedTimeline) return;

        try {
            let updatedEvents: TimelineEvent[];
            if (eventToEdit) {
                updatedEvents = selectedTimeline.events.map(e => e.id === eventToEdit.id ? { ...e, ...eventData } : e);
            } else {
                updatedEvents = [...selectedTimeline.events, { ...eventData, id: generateUUID() }];
            }
            await updateItem(selectedTimeline.id, { events: updatedEvents });
        } catch (error) {
            addNotification('Failed to save event. Please try again.', 'error');
        } finally {
            setEventToEdit(null);
        }
    };

    const handleDeleteEvent = async (eventId: string) => {
        if (!selectedTimeline) return;
        try {
            const updatedEvents = selectedTimeline.events.filter(e => e.id !== eventId);
            await updateItem(selectedTimeline.id, { events: updatedEvents });
            addNotification('Event deleted.', 'success');
        } catch (error) {
            addNotification('Failed to delete event. Please try again.', 'error');
        }
    };
    
    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold">Timeline</h1>
                <div className="flex items-center gap-2">
                    <select value={selectedTimelineId || ''} onChange={e => setSelectedTimelineId(e.target.value)} aria-label="Select a timeline" className="p-2 bg-light-card dark:bg-dark-card border dark:border-dark-border rounded-lg">
                        {sortedTimelines.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <input id="new-timeline-input" type="text" value={newTimelineName} onChange={e => setNewTimelineName(e.target.value)} placeholder="New timeline name..." aria-label="New timeline name" className="p-2 bg-light-card dark:bg-dark-card border dark:border-dark-border rounded-lg"/>
                    <button onClick={handleAddTimeline} aria-label="Create new timeline" className="p-2 bg-primary text-white rounded-lg"><PlusIcon className="w-5 h-5"/></button>
                </div>
            </div>

             {isLoading ? <Spinner /> : sortedTimelines.length === 0 ? (
                 <EmptyState 
                    title="Visualize Your Story"
                    message="Create your first timeline to map out project milestones or personal journeys."
                    icon={<MapIcon className="w-16 h-16" />} 
                    actionText="Create a New Timeline"
                    onAction={() => {
                        const input = document.getElementById('new-timeline-input');
                        if (input) {
                            input.focus();
                            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }}
                 />
             ) : !selectedTimeline ? (
                 <div className="flex items-center justify-center h-64">
                    <p>Select a timeline to view its events.</p>
                 </div>
             ) : (
                <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold">{selectedTimeline.name}</h2>
                        <div>
                            <button onClick={() => handleDeleteTimeline(selectedTimeline.id)} aria-label={`Delete timeline: ${selectedTimeline.name}`} className="p-2 text-dark-text-secondary hover:text-red-500 mr-2"><TrashIcon className="w-5 h-5"/></button>
                            <button onClick={() => { setEventToEdit(null); setIsEventModalOpen(true); }} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm">
                                <PlusIcon className="w-5 h-5" />
                                <span>Add Event</span>
                            </button>
                        </div>
                    </div>
                    
                    {sortedEvents.length > 0 ? (
                        <div className="relative border-l-2 border-primary pl-8 space-y-10">
                            {sortedEvents.map(event => (
                                <div key={event.id} className="relative group">
                                    <div className="absolute -left-[38px] top-1 w-4 h-4 bg-primary rounded-full border-4 border-dark-card"></div>
                                    <div className="p-4 bg-light-bg dark:bg-dark-bg rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="flex items-center gap-2 text-sm text-dark-text-secondary"><CalendarIcon className="w-4 h-4"/> {new Date(`${event.date}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                <h3 className="font-semibold text-lg my-1">{event.title}</h3>
                                                <p className="text-dark-text-secondary">{event.description}</p>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setEventToEdit(event); setIsEventModalOpen(true); }} aria-label={`Edit event: ${event.title}`} className="p-1"><PencilIcon className="w-4 h-4" /></button>
                                                <button onClick={() => handleDeleteEvent(event.id)} aria-label={`Delete event: ${event.title}`} className="p-1"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ): (
                        <p className="text-center text-dark-text-secondary py-8">This timeline has no events yet. Add your first one!</p>
                    )}
                </div>
             )}
            <EventModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} onSave={handleSaveEvent} eventToEdit={eventToEdit} />
        </div>
    );
};

export default TimelineView;
