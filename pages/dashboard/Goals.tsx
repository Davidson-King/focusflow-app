import React, { useState, useMemo, useContext, useEffect } from 'react';
import { useIndexedDB } from '../../hooks/useIndexedDB.ts';
import type { Goal } from '../../types.ts';
import { PlusIcon, TrashIcon, PencilIcon, TrophyIcon, FireIcon, CheckIcon, ArrowPathIcon, ChevronDownIcon } from '../../components/Icons.tsx';
import EmptyState from '../../components/EmptyState.tsx';
import Spinner from '../../components/Spinner.tsx';
import Modal from '../../components/Modal.tsx';
import { AuthContext } from '../../contexts/AuthContext.tsx';
import { useNotifier } from '../../contexts/NotificationContext.tsx';
import ButtonSpinner from '../../components/ButtonSpinner.tsx';
import HabitCalendarGrid from '../../components/HabitCalendarGrid.tsx';
import { getLocalISODateString } from '../../utils/date.ts';
import { useLocalStorage } from '../../hooks/useLocalStorage.ts';

const GoalModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (goal: Omit<Goal, 'id' | 'user_id' | 'createdAt'>) => Promise<void>;
    goalToEdit?: Goal | null;
}> = ({ isOpen, onClose, onSave, goalToEdit }) => {
    const [text, setText] = useState('');
    const [type, setType] = useState<'habit' | 'target'>('habit');
    const [targetValue, setTargetValue] = useState(100);
    const [currentValue, setCurrentValue] = useState(0);
    const [unit, setUnit] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    // FIX: Added state for targetType to align with Goal interface and form logic.
    const [targetType, setTargetType] = useState<'completions' | 'streak'>('completions');

    React.useEffect(() => {
        if (isOpen) {
            setText(goalToEdit?.text || '');
            setType(goalToEdit?.type || 'habit');
            setTargetValue(goalToEdit?.targetValue ?? 100);
            // FIX: Check goal type before accessing type-specific properties.
            setCurrentValue(goalToEdit?.type === 'target' ? goalToEdit.currentValue : 0);
            // FIX: Check goal type before accessing type-specific properties.
            setUnit(goalToEdit?.type === 'target' ? goalToEdit.unit || '' : '');
            // FIX: Check goal type before accessing type-specific properties.
            setTargetType(goalToEdit?.type === 'habit' ? goalToEdit.targetType || 'completions' : 'completions');
        }
    }, [isOpen, goalToEdit]);

    const handleSave = async () => {
        if (!text.trim() || isSaving) return;
        setIsSaving(true);
        try {
            const goalData = {
                text: text.trim(),
                type,
                ...(type === 'habit' ? { 
                    // FIX: Check goal type before accessing type-specific properties.
                    completedDates: (goalToEdit?.type === 'habit' && goalToEdit.completedDates) || [],
                    // FIX: Check goal type before accessing type-specific properties.
                    currentStreak: (goalToEdit?.type === 'habit' && goalToEdit.currentStreak) || 0,
                    // FIX: Check goal type before accessing type-specific properties.
                    longestStreak: (goalToEdit?.type === 'habit' && goalToEdit.longestStreak) || 0,
                    targetType,
                    targetValue: type === 'habit' ? targetValue : undefined,
                } : {}),
                ...(type === 'target' ? { targetValue, currentValue, unit } : {})
            };
            await onSave(goalData as Omit<Goal, 'id' | 'user_id' | 'createdAt'>);
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={goalToEdit ? 'Edit Goal' : 'New Goal'}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Goal / Habit</label>
                    <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="e.g., Read 10 pages daily" className="w-full p-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select value={type} onChange={e => setType(e.target.value as any)} className="w-full p-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg">
                        <option value="habit">Daily Habit</option>
                        <option value="target">Measurable Goal</option>
                    </select>
                </div>

                {type === 'habit' && (
                    <div className="p-3 bg-dark-bg rounded-lg">
                        <label className="block text-sm font-medium mb-2">Optional Target</label>
                        <div className="grid grid-cols-2 gap-4">
                             <select value={targetType} onChange={e => setTargetType(e.target.value as any)} className="w-full p-2 bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border rounded-lg">
                                <option value="completions">Total Completions</option>
                                <option value="streak">Streak</option>
                            </select>
                             <input type="number" value={targetValue} onChange={e => setTargetValue(Number(e.target.value))} className="w-full p-2 bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border rounded-lg" />
                        </div>
                    </div>
                )}
                
                {type === 'target' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Current</label>
                            <input type="number" value={currentValue} onChange={e => setCurrentValue(Number(e.target.value))} className="w-full p-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Target</label>
                            <input type="number" value={targetValue} onChange={e => setTargetValue(Number(e.target.value))} className="w-full p-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Unit (optional)</label>
                            <input type="text" value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g., $, books, kg" className="w-full p-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg" />
                        </div>
                    </div>
                )}
                <div className="flex justify-end gap-3 pt-4">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-dark-border">Cancel</button>
                    <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 rounded-lg bg-primary text-white w-28 h-10 flex items-center justify-center">
                        {isSaving ? <ButtonSpinner /> : 'Save Goal'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const Goals: React.FC = () => {
    const { user } = useContext(AuthContext);
    const { addNotification } = useNotifier();
    const { items: goals, isLoading, addItem, updateItem, deleteItem } = useIndexedDB<Goal>('goals');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
    const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [habitToReset, setHabitToReset] = useState<Goal | null>(null);
    const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
    const [calendarDays, setCalendarDays] = useLocalStorage('focusflow-habit-calendar-days', 30);


    const { habits, targets } = useMemo(() => {
        // FIX: Use filter with a type predicate to ensure TypeScript correctly narrows the types for habits and targets.
        const h = goals
            .filter((g): g is Goal & { type: 'habit' } => g.type === 'habit')
            .sort((a,b) => a.createdAt - b.createdAt);
        const t = goals
            .filter((g): g is Goal & { type: 'target' } => g.type === 'target')
            .sort((a,b) => a.createdAt - b.createdAt);
        return { habits: h, targets: t };
    }, [goals]);

    const selectedHabit = useMemo(() => habits.find(h => h.id === selectedHabitId), [habits, selectedHabitId]);

    useEffect(() => {
        // If there's no selection but there are habits, select the first one.
        if (!selectedHabitId && habits.length > 0) {
            setSelectedHabitId(habits[0].id);
        }
        // If the selected habit is deleted/gone, update selection
        if (selectedHabitId && !habits.some(h => h.id === selectedHabitId)) {
            setSelectedHabitId(habits.length > 0 ? habits[0].id : null);
        }
        // If there are no habits, clear selection
        if (habits.length === 0) {
            setSelectedHabitId(null);
        }
    }, [habits, selectedHabitId]);

    const handleSaveGoal = async (goalData: Omit<Goal, 'id' | 'user_id' | 'createdAt'>) => {
        if (!user) return;
        try {
            if (goalToEdit) {
                await updateItem(goalToEdit.id, goalData);
                addNotification('Goal updated!', 'success');
            } else {
                const newGoal = await addItem({ ...goalData, user_id: user.id, createdAt: Date.now() });
                addNotification('Goal added!', 'success');
                if(newGoal.type === 'habit') {
                    setSelectedHabitId(newGoal.id);
                }
            }
        } catch (error) {
            addNotification('Failed to save goal.', 'error');
        } finally {
            setGoalToEdit(null);
        }
    };
    
    const confirmDelete = async () => {
        if (!goalToDelete || isDeleting) return;
        setIsDeleting(true);

        const elementId = `goal-${goalToDelete.id}`;
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('animate-item-out');
        }
        
        setTimeout(async () => {
            try {
                await deleteItem(goalToDelete.id);
                addNotification('Goal deleted.', 'success');
            } catch (error) {
                addNotification('Failed to delete goal.', 'error');
            } finally {
                setIsDeleting(false);
                setGoalToDelete(null);
            }
        }, 300);
    };

    const confirmReset = async () => {
        if (!habitToReset) return;
        try {
            await updateItem(habitToReset.id, {
                completedDates: [],
                currentStreak: 0,
            });
            addNotification(`Progress for "${habitToReset.text}" has been reset.`, 'success');
        } catch (error) {
            addNotification('Failed to reset progress.', 'error');
        } finally {
            setHabitToReset(null);
        }
    }
    
    const calculateStreak = (dates: string[]): { current: number; longest: number } => {
        if (!dates || dates.length === 0) return { current: 0, longest: 0 };
        const sortedTimestamps = dates.map(d => new Date(d).getTime()).sort((a, b) => b - a);
        
        let currentStreak = 0;
        let longestStreak = 0;
        
        // Calculate current streak
        const today = new Date();
        today.setHours(0,0,0,0);
        let lastDate = new Date(today);
        lastDate.setDate(lastDate.getDate() + 1);

        for (const timestamp of sortedTimestamps) {
            const date = new Date(timestamp);
            date.setHours(0,0,0,0);
            const diff = (lastDate.getTime() - date.getTime()) / (1000 * 3600 * 24);
            if (diff === 1) {
                currentStreak++;
            } else if (diff > 1 && !(lastDate.getTime() === new Date(today).setDate(today.getDate() + 1) && diff === 1)) {
                break;
            } else if (diff !== 0) { // Not today and not consecutive
                break;
            }
            lastDate = date;
        }

        // Calculate longest streak
        if (sortedTimestamps.length > 0) {
            longestStreak = 1;
            let currentLongest = 1;
            for (let i = 1; i < sortedTimestamps.length; i++) {
                const date1 = new Date(sortedTimestamps[i-1]);
                const date2 = new Date(sortedTimestamps[i]);
                date1.setHours(0,0,0,0);
                date2.setHours(0,0,0,0);

                const diffDays = (date1.getTime() - date2.getTime()) / (1000 * 3600 * 24);
                if (diffDays === 1) {
                    currentLongest++;
                } else if (diffDays > 1) {
                    currentLongest = 1;
                }
                if (currentLongest > longestStreak) {
                    longestStreak = currentLongest;
                }
            }
        } else {
            longestStreak = 0;
        }

        return { current: currentStreak, longest: longestStreak };
    };

    const handleToggleHabit = (habit: Goal & { type: 'habit' }) => {
        const todayStr = getLocalISODateString(new Date());
        const completedDates = habit.completedDates || [];
        const isCompletedToday = completedDates.includes(todayStr);

        let newCompletedDates;
        if (isCompletedToday) {
            newCompletedDates = completedDates.filter(d => d !== todayStr);
        } else {
            newCompletedDates = [...completedDates, todayStr];
        }

        const streaks = calculateStreak(newCompletedDates);
        updateItem(habit.id, { completedDates: newCompletedDates, currentStreak: streaks.current, longestStreak: streaks.longest });
    };

    const todayStr = getLocalISODateString(new Date());

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Goals & Habits</h1>
                <button onClick={() => { setGoalToEdit(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm">
                    <PlusIcon className="w-5 h-5" />
                    <span>New Goal</span>
                </button>
            </div>
            
            {isLoading && <Spinner />}

            {!isLoading && goals.length === 0 && (
                <EmptyState
                    title="Set Your Ambitions"
                    message="Create your first goal or habit to get started."
                    icon={<TrophyIcon className="w-16 h-16" />}
                    actionText="Add a New Goal"
                    onAction={() => setIsModalOpen(true)}
                />
            )}

            {!isLoading && goals.length > 0 && (
                <div className="space-y-8">
                    {habits.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><FireIcon className="w-6 h-6 text-orange-400" /> Daily Habits</h2>
                            <div className="bg-light-card dark:bg-dark-card rounded-xl flex flex-col md:flex-row min-h-[400px]">
                                {/* Left Panel: Habit List */}
                                <div className="md:w-1/3 md:border-r md:border-dark-border">
                                    <div className="p-2 space-y-1 md:max-h-[500px] md:overflow-y-auto">
                                        {habits.map(habit => {
                                            const isCompletedToday = (habit.completedDates || []).includes(todayStr);
                                            return (
                                                <div key={habit.id} id={`goal-${habit.id}`} className="group">
                                                    <button 
                                                        onClick={() => setSelectedHabitId(habit.id)}
                                                        className={`w-full flex items-center gap-3 p-3 text-left rounded-lg transition-colors ${selectedHabitId === habit.id ? 'bg-primary/10' : 'hover:bg-dark-border'}`}
                                                    >
                                                        <div onClick={(e) => { e.stopPropagation(); handleToggleHabit(habit); }} className={`w-7 h-7 rounded-md flex items-center justify-center border-2 transition-colors flex-shrink-0 ${isCompletedToday ? 'bg-primary border-primary animate-pop-in' : 'border-dark-border group-hover:bg-dark-bg'}`} aria-label={`Toggle habit: ${habit.text}`}>
                                                            {isCompletedToday && <CheckIcon className="w-4 h-4 text-white" />}
                                                        </div>
                                                        <span className="flex-1 font-medium truncate">{habit.text}</span>
                                                        <span className="font-semibold flex items-center gap-1 text-orange-400">
                                                            <FireIcon className="w-4 h-4"/> {habit.currentStreak || 0}
                                                        </span>
                                                    </button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                                
                                {/* Right Panel: Habit Details */}
                                <div className="flex-1 p-6">
                                    {selectedHabit ? (() => {
                                        let progress = 0;
                                        let isTargetMet = false;
                                        if(selectedHabit.targetType && selectedHabit.targetValue) {
                                            if (selectedHabit.targetType === 'completions') {
                                                progress = Math.min(100, Math.round(((selectedHabit.completedDates?.length || 0) / selectedHabit.targetValue) * 100));
                                                isTargetMet = (selectedHabit.completedDates?.length || 0) >= selectedHabit.targetValue;
                                            } else if (selectedHabit.targetType === 'streak') {
                                                progress = Math.min(100, Math.round(((selectedHabit.longestStreak || 0) / selectedHabit.targetValue) * 100));
                                                isTargetMet = (selectedHabit.longestStreak || 0) >= selectedHabit.targetValue;
                                            }
                                        }

                                        return (
                                            <div>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="text-xl font-bold">{selectedHabit.text}</h3>
                                                         <div className="text-sm text-dark-text-secondary flex gap-4 mt-1">
                                                            <span>Current Streak: <strong className="text-orange-400">{selectedHabit.currentStreak || 0}</strong></span>
                                                            <span>Longest Streak: <strong>{selectedHabit.longestStreak || 0}</strong></span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <button onClick={() => setHabitToReset(selectedHabit)} aria-label="Reset progress" className="p-2 hover:bg-dark-border rounded-md"><ArrowPathIcon className="w-5 h-5"/></button>
                                                        <button onClick={() => { setGoalToEdit(selectedHabit); setIsModalOpen(true); }} aria-label="Edit habit" className="p-2 hover:bg-dark-border rounded-md"><PencilIcon className="w-5 h-5"/></button>
                                                        <button onClick={() => setGoalToDelete(selectedHabit)} aria-label="Delete habit" className="p-2 hover:bg-dark-border rounded-md"><TrashIcon className="w-5 h-5"/></button>
                                                    </div>
                                                </div>
                                                
                                                {selectedHabit.targetValue && (
                                                    <div className="my-6">
                                                        <div className="flex justify-between text-sm font-medium text-dark-text-secondary mb-1">
                                                            <span>Target Progress ({selectedHabit.targetType})</span>
                                                            {isTargetMet ? <span className="text-green-400 font-bold">Completed!</span> : <span>{progress}%</span>}
                                                        </div>
                                                        <div className="w-full bg-dark-border rounded-full h-2">
                                                            <div className={`h-2 rounded-full transition-all duration-500 ${isTargetMet ? 'bg-green-400' : 'bg-primary'}`} style={{ width: `${progress}%` }}></div>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <div className="flex justify-between items-center mt-6 mb-2">
                                                    <h4 className="text-lg font-semibold">Progress</h4>
                                                    <div className="flex items-center gap-2">
                                                        <label htmlFor="calendar-days-select" className="text-sm font-medium text-dark-text-secondary">Show:</label>
                                                        <select
                                                            id="calendar-days-select"
                                                            value={calendarDays}
                                                            onChange={(e) => setCalendarDays(Number(e.target.value))}
                                                            className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-1 focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                                                        >
                                                            <option value="7">7 Days</option>
                                                            <option value="14">14 Days</option>
                                                            <option value="30">30 Days</option>
                                                            <option value="60">60 Days</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <HabitCalendarGrid completedDates={selectedHabit.completedDates || []} daysToShow={calendarDays} />
                                            </div>
                                        )
                                    })() : (
                                        <div className="flex items-center justify-center h-full">
                                            <p className="text-dark-text-secondary">Select a habit to see its details.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}

                    {targets.length > 0 && (
                         <section>
                            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><TrophyIcon className="w-6 h-6 text-yellow-400" /> Long-term Goals</h2>
                             <div className="grid md:grid-cols-2 gap-4">
                                {targets.map(target => {
                                    const progress = Math.min(100, Math.round(((target.currentValue || 0) / (target.targetValue || 1)) * 100));
                                    return (
                                        <div key={target.id} id={`goal-${target.id}`} className="bg-light-card dark:bg-dark-card p-4 rounded-xl group">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold">{target.text}</p>
                                                    <p className="text-sm font-bold text-primary">{target.currentValue || 0} / {target.targetValue || 0} {target.unit}</p>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => { setGoalToEdit(target); setIsModalOpen(true); }} aria-label="Edit goal"><PencilIcon className="w-5 h-5" /></button>
                                                    <button onClick={() => setGoalToDelete(target)} aria-label="Delete goal"><TrashIcon className="w-5 h-5" /></button>
                                                </div>
                                            </div>
                                            <div className="w-full bg-dark-border rounded-full h-2.5 mt-2">
                                                <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    )}
                </div>
            )}

            <GoalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveGoal} goalToEdit={goalToEdit} />

            <Modal isOpen={!!goalToDelete} onClose={() => setGoalToDelete(null)} title="Delete Goal?">
                <p>Are you sure you want to delete "{goalToDelete?.text}"? This action cannot be undone.</p>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={() => setGoalToDelete(null)} className="px-4 py-2 rounded-lg bg-dark-border">Cancel</button>
                    <button onClick={confirmDelete} disabled={isDeleting} className="px-4 py-2 rounded-lg bg-red-600 text-white w-24 h-10 flex items-center justify-center">
                        {isDeleting ? <ButtonSpinner /> : 'Delete'}
                    </button>
                </div>
            </Modal>
            
            <Modal isOpen={!!habitToReset} onClose={() => setHabitToReset(null)} title="Reset Progress?">
                <p>Are you sure you want to reset all progress for "{habitToReset?.text}"? All completed dates and streaks will be cleared.</p>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={() => setHabitToReset(null)} className="px-4 py-2 rounded-lg bg-dark-border">Cancel</button>
                    <button onClick={confirmReset} className="px-4 py-2 rounded-lg bg-red-600 text-white">Confirm Reset</button>
                </div>
            </Modal>
        </div>
    );
};

export default Goals;