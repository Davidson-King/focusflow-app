import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import { useIndexedDB } from '../hooks/useIndexedDB';
import { Task, Note, JournalEntry, Goal, Timeline } from '../types';
import { SearchIcon, CheckIcon, BookOpenIcon, PencilIcon as JournalIcon, DocumentTextIcon, TrophyIcon, MapIcon } from './Icons';

type SearchResult = {
    id: string;
    type: 'Task' | 'Note' | 'Journal' | 'Goal' | 'Timeline';
    title: string;
    path: string;
    state?: any;
};

const GlobalSearchModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const { items: tasks } = useIndexedDB<Task>('tasks');
    const { items: notes } = useIndexedDB<Note>('notes');
    const { items: journalEntries } = useIndexedDB<JournalEntry>('journal');
    const { items: goals } = useIndexedDB<Goal>('goals');
    const { items: timelines } = useIndexedDB<Timeline>('timelines');
    const navigate = useNavigate();

    // Clear query when modal is closed
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => setQuery(''), 200); // Delay to prevent flicker
        }
    }, [isOpen]);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const lowerCaseQuery = query.toLowerCase();
        const newResults: SearchResult[] = [];

        // Search tasks
        tasks.forEach(task => {
            if (task.text.toLowerCase().includes(lowerCaseQuery)) {
                newResults.push({ id: task.id, type: 'Task', title: task.text, path: '/dashboard/tasks' });
            }
        });

        // Search notes
        notes.forEach(note => {
            if (note.title.toLowerCase().includes(lowerCaseQuery) || note.content.toLowerCase().includes(lowerCaseQuery)) {
                newResults.push({ id: note.id, type: 'Note', title: note.title, path: '/dashboard/notes', state: { selectedNoteId: note.id } });
            }
        });
        
        // Search journal entries
        journalEntries.forEach(entry => {
            if (entry.title.toLowerCase().includes(lowerCaseQuery) || entry.content.toLowerCase().includes(lowerCaseQuery)) {
                 newResults.push({ id: entry.id, type: 'Journal', title: entry.title, path: '/dashboard/journal', state: { selectedEntryId: entry.id } });
            }
        });
        
        // Search goals
        goals.forEach(goal => {
            if (goal.text.toLowerCase().includes(lowerCaseQuery)) {
                newResults.push({ id: goal.id, type: 'Goal', title: goal.text, path: '/dashboard/goals' });
            }
        });

        // Search timelines
        timelines.forEach(timeline => {
            if (timeline.name.toLowerCase().includes(lowerCaseQuery)) {
                newResults.push({ id: timeline.id, type: 'Timeline', title: timeline.name, path: '/dashboard/timeline' });
            }
        });

        setResults(newResults.slice(0, 10)); // Limit results
    }, [query, tasks, notes, journalEntries, goals, timelines]);
    
    const handleSelectResult = (result: SearchResult) => {
        navigate(result.path, { state: result.state });
        onClose();
    };

    const iconMap: Record<SearchResult['type'], React.ReactNode> = {
        'Task': <CheckIcon className="w-5 h-5" />,
        'Note': <BookOpenIcon className="w-5 h-5" />,
        'Journal': <JournalIcon className="w-5 h-5" />,
        'Goal': <TrophyIcon className="w-5 h-5" />,
        'Timeline': <MapIcon className="w-5 h-5" />,
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Global Search">
            <div className="flex flex-col">
                <div className="relative mb-4">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search tasks, notes, goals..."
                        className="w-full p-3 pl-10 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg"
                        autoFocus
                    />
                </div>
                {results.length > 0 ? (
                    <ul className="space-y-2 max-h-80 overflow-y-auto">
                        {results.map(result => (
                            <li key={`${result.type}-${result.id}`}>
                                <button onClick={() => handleSelectResult(result)} className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-light-bg dark:hover:bg-dark-border">
                                    <div className="text-gray-400">{iconMap[result.type]}</div>
                                    <div>
                                        <p className="font-medium">{result.title}</p>
                                        <p className="text-xs text-gray-500">{result.type}</p>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : query.trim() ? (
                    <div className="text-center py-8">
                        <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-400 mb-2"/>
                        <p className="font-semibold">No Results Found</p>
                        <p className="text-sm text-gray-500">Try a different search term.</p>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <SearchIcon className="w-12 h-12 mx-auto text-gray-400 mb-2"/>
                        <p className="font-semibold">Find Anything</p>
                        <p className="text-sm text-gray-500">Start typing to search across your entire dashboard.</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default GlobalSearchModal;