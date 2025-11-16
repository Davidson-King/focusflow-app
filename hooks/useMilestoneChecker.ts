import { useEffect, useRef, useState } from 'react';
import { useIndexedDB } from './useIndexedDB';
import { useNotifier } from '../contexts/NotificationContext';
import { checkMilestones } from '../services/milestoneService';
import { ALL_MILESTONES } from '../constants/milestones';
import type { Task, Note, JournalEntry, Folder, Goal, Milestone } from '../types';
import { db } from '../services/db';

export const useMilestoneChecker = () => {
    const { items: tasks, isLoading: tasksLoading } = useIndexedDB<Task>('tasks');
    const { items: notes, isLoading: notesLoading } = useIndexedDB<Note>('notes');
    const { items: journalEntries, isLoading: journalLoading } = useIndexedDB<JournalEntry>('journal');
    const { items: folders, isLoading: foldersLoading } = useIndexedDB<Folder>('folders');
    const { items: goals, isLoading: goalsLoading } = useIndexedDB<Goal>('goals');
    const { items: unlockedMilestones, refreshItems } = useIndexedDB<Milestone>('milestones');

    const { addNotification } = useNotifier();
    const isInitialLoad = useRef(true);
    const [isDataReady, setIsDataReady] = useState(false);

    // Track when all necessary data has been loaded for the first time
    useEffect(() => {
        if (!tasksLoading && !notesLoading && !journalLoading && !foldersLoading && !goalsLoading && !isDataReady) {
            setIsDataReady(true);
        }
    }, [tasksLoading, notesLoading, journalLoading, foldersLoading, goalsLoading, isDataReady]);

    const performCheck = async (isRetroactive: boolean) => {
        const dataSnapshot = { tasks, notes, journalEntries, folders, goals };
        const newMilestoneIds = checkMilestones(dataSnapshot, unlockedMilestones);

        if (newMilestoneIds.length > 0) {
            for (const id of newMilestoneIds) {
                const milestoneDef = ALL_MILESTONES[id];
                if (milestoneDef) {
                    await db.put('milestones', {
                        id: milestoneDef.id,
                        name: milestoneDef.name,
                        description: milestoneDef.description,
                        achievedOn: Date.now()
                    });
                    
                    if (!isRetroactive) {
                        addNotification(`Milestone Unlocked: ${milestoneDef.name}!`, 'success');
                    }
                }
            }
            await refreshItems();
             if (isRetroactive && newMilestoneIds.length > 0) {
                addNotification(`You've been awarded ${newMilestoneIds.length} new milestone(s) for your past progress!`, 'info');
             }
        }
    };

    // Effect for retroactive check on initial load
    useEffect(() => {
        const retroactiveCheck = async () => {
            if (isDataReady && isInitialLoad.current) {
                isInitialLoad.current = false;
                const hasChecked = await db.get('settings', 'hasDoneRetroactiveCheck');
                if (!hasChecked) {
                    await performCheck(true);
                    await db.put('settings', true, 'hasDoneRetroactiveCheck');
                }
            }
        };
        retroactiveCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDataReady]);

    // Effect for subsequent checks as data changes
    useEffect(() => {
        if (!isInitialLoad.current) {
            performCheck(false);
        }
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
