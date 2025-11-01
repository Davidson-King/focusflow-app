
import React, { useState, useMemo } from 'react';
import { useIndexedDB } from '../../hooks/useIndexedDB.ts';
import { Task, JournalEntry } from '../../types.ts';
import { ChevronDownIcon } from '../../components/Icons.tsx';
import { Link } from 'react-router-dom';

const Calendar: React.FC = () => {
    const { items: tasks } = useIndexedDB<Task>('tasks');
    const { items: journalEntries } = useIndexedDB<JournalEntry>('journal');
    const [currentDate, setCurrentDate] = useState(new Date());

    const { daysInMonth, startDay, month, year } = useMemo(() => {
        const date = new Date(currentDate);
        date.setDate(1);
        const year = date.getFullYear();
        const month = date.getMonth();
        const startDay = date.getDay(); // 0 for Sunday
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        return { daysInMonth, startDay, month, year };
    }, [currentDate]);
    
    const itemsByDate = useMemo(() => {
        const map = new Map<string, { tasks: Task[], journal: JournalEntry[] }>();

        tasks.forEach(task => {
            if (task.dueDate) {
                if (!map.has(task.dueDate)) map.set(task.dueDate, { tasks: [], journal: [] });
                map.get(task.dueDate)!.tasks.push(task);
            }
        });

        journalEntries.forEach(entry => {
            const dateStr = new Date(entry.createdAt).toISOString().split('T')[0];
            if (!map.has(dateStr)) map.set(dateStr, { tasks: [], journal: [] });
            map.get(dateStr)!.journal.push(entry);
        });

        return map;
    }, [tasks, journalEntries]);

    const changeMonth = (delta: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + delta);
            return newDate;
        });
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate)}</h1>
                <div className="flex items-center gap-2">
                    <button onClick={() => changeMonth(-1)} aria-label="Previous month" className="p-2 rounded-lg hover:bg-dark-border"><ChevronDownIcon className="w-5 h-5 rotate-90" /></button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1.5 text-sm font-semibold rounded-lg hover:bg-dark-border">Today</button>
                    <button onClick={() => changeMonth(1)} aria-label="Next month" className="p-2 rounded-lg hover:bg-dark-border"><ChevronDownIcon className="w-5 h-5 -rotate-90" /></button>
                </div>
            </div>

            <div className="grid grid-cols-7 bg-light-card dark:bg-dark-card rounded-xl border border-light-border dark:border-dark-border">
                {weekDays.map(day => (
                    <div key={day} className="text-center font-semibold p-3 text-sm text-light-text-secondary dark:text-dark-text-secondary border-b border-light-border dark:border-dark-border">{day}</div>
                ))}
                
                {Array.from({ length: startDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="border-r border-light-border dark:border-dark-border"></div>
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(year, month, day);
                    const dateStr = date.toISOString().split('T')[0];
                    const items = itemsByDate.get(dateStr);
                    const isToday = new Date().toDateString() === date.toDateString();
                    
                    return (
                        <div key={day} className={`relative p-2 h-32 overflow-y-auto border-t border-r border-light-border dark:border-dark-border`}>
                            <div className={`text-sm font-semibold mb-1 ${isToday ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                                {day}
                            </div>
                            <div className="space-y-1">
                                {items?.tasks.map(t => (
                                    <Link to="/dashboard/tasks" key={`task-${t.id}`} title={t.text} className={`block text-xs p-1 rounded truncate ${t.completed ? 'bg-green-500/20 text-green-300 line-through' : 'bg-blue-500/20 text-blue-300'}`}>{t.text}</Link>
                                ))}
                                {items?.journal.map(j => (
                                    <Link to="/dashboard/journal" state={{selectedEntryId: j.id}} key={`journal-${j.id}`} title={j.title} className="block text-xs p-1 rounded bg-purple-500/20 text-purple-300 truncate">{j.title}</Link>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Calendar;
