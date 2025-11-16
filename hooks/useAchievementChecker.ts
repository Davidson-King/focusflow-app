import { useEffect, useRef } from 'react';
import { useIndexedDB } from './useIndexedDB';
import { useNotifier } from '../contexts/NotificationContext';
import { checkAchievements } from '../services/achievementService';
import { ALL_ACHIEVEMENTS } from '../constants/achievements';
import type { Task, Note, JournalEntry, Folder, Goal, Achievement } from '../types';
// FIX: Import db service directly to save achievements with predefined IDs.
import { db } from '../services/db';

export const useAchievementChecker = () => {
    const { items: tasks } = useIndexedDB<Task>('tasks');
    const { items: notes } = useIndexedDB<Note>('notes');
    const { items: journalEntries } = useIndexedDB<JournalEntry>('journal');
    const { items: folders } = useIndexedDB<Folder>('folders');
    const { items: goals } = useIndexedDB<Goal>('goals');
    // FIX: Get refreshItems instead of addItem, as addItem generates a new UUID which is incorrect for achievements.
    const { items: unlockedAchievements, refreshItems } = useIndexedDB<Achievement>('achievements');

    const { addNotification } = useNotifier();
    const isInitialLoad = useRef(true);

    useEffect(() => {
        // Prevent checking on the very first render,
        // which could fire notifications for already-earned achievements.
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            return;
        }
        
        const dataSnapshot = { tasks, notes, journalEntries, folders, goals };
        const newAchievementIds = checkAchievements(dataSnapshot, unlockedAchievements);

        if (newAchievementIds.length > 0) {
            const unlock = async () => {
                for (const id of newAchievementIds) {
                    const achievementDef = ALL_ACHIEVEMENTS[id];
                    if (achievementDef) {
                        // 1. Add to database directly with the correct, predefined ID.
                        await db.put('achievements', {
                            id: achievementDef.id,
                            name: achievementDef.name,
                            description: achievementDef.description,
                            achievedOn: Date.now()
                        });
                        
                        // 2. Show notification
                        addNotification(`Achievement Unlocked: ${achievementDef.name}!`, 'success');
                    }
                }
                // 3. Refresh the hook's state to reflect the new achievements.
                await refreshItems();
            };
            unlock();
        }
    // We only want to run this when the *content* of the data changes,
    // not just the array references on every render.
    // By stringifying the lengths, we create a stable dependency that only changes when items are added/removed.
    // This is a performance optimization.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        JSON.stringify(tasks.map(t => t.completed)), 
        notes.length, 
        journalEntries.length, 
        folders.length, 
        goals.length,
        JSON.stringify(goals.map(g => g.type === 'habit' && g.currentStreak))
    ]);
};
