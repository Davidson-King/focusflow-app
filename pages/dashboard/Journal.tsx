
import React, { useState, useMemo, useEffect, useContext, useCallback } from 'react';
import { useIndexedDB } from '../../hooks/useIndexedDB.ts';
import type { JournalEntry, Folder } from '../../types.ts';
import { PlusIcon, TrashIcon, BookOpenIcon, FolderIcon, PencilIcon, Cog6ToothIcon } from '../../components/Icons.tsx';
import EmptyState from '../../components/EmptyState.tsx';
import Spinner from '../../components/Spinner.tsx';
import Modal from '../../components/Modal.tsx';
import { AuthContext } from '../../contexts/AuthContext.tsx';
import { useNotifier } from '../../contexts/NotificationContext.tsx';
import RichTextEditor from '../../components/RichTextEditor.tsx';
import { useLocation } from 'react-router-dom';
// FIX: Changed import of 'react-window' from a namespace import to a named import to resolve module resolution error.
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import ButtonSpinner from '../../components/ButtonSpinner.tsx';
import { countWords } from '../../utils/text.ts';

const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

const FolderManagerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    allEntries: JournalEntry[];
    updateEntry: (id: string, updates: Partial<JournalEntry>) => Promise<void>;
}> = ({ isOpen, onClose, allEntries, updateEntry }) => {
    const { user } = useContext(AuthContext);
    const { items: folders, addItem, updateItem, deleteItem } = useIndexedDB<Folder>('folders');
    const journalFolders = useMemo(() => folders.filter(f => f.type === 'journal'), [folders]);
    
    const [newFolderName, setNewFolderName] = useState('');
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [editingFolderName, setEditingFolderName] = useState('');
    const { addNotification } = useNotifier();

    const handleAddFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newFolderName.trim() && user) {
            await addItem({ user_id: user.id, name: newFolderName.trim(), type: 'journal', createdAt: Date.now() });
            setNewFolderName('');
        }
    };

    const handleStartEdit = (folder: Folder) => {
        setEditingFolderId(folder.id);
        setEditingFolderName(folder.name);
    };

    const handleSaveEdit = async (folderId: string) => {
        if (editingFolderName.trim()) {
            await updateItem(folderId, { name: editingFolderName.trim() });
            setEditingFolderId(null);
        }
    };

    const handleDeleteFolder = async (folder: Folder) => {
        if (!window.confirm(`Are you sure you want to delete the folder "${folder.name}"? All entries inside will be moved to "Uncategorized".`)) {
            return;
        }
        try {
            const entriesToUpdate = allEntries.filter(n => n.folderId === folder.id);
            await Promise.all(entriesToUpdate.map(entry => updateEntry(entry.id, { folderId: null })));
            await deleteItem(folder.id);
            addNotification(`Folder "${folder.name}" deleted.`, 'success');
        } catch (error) {
            addNotification('Failed to delete folder.', 'error');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manage Journal Folders">
            <div className="space-y-4">
                <form onSubmit={handleAddFolder} className="flex gap-2">
                    <input
                        type="text"
                        value={newFolderName}
                        onChange={e => setNewFolderName(e.target.value)}
                        placeholder="New folder name..."
                        className="flex-1 p-2 bg-light-bg dark:bg-dark-bg border rounded-lg"
                    />
                    <button type="submit" className="p-2 bg-primary text-white rounded-lg"><PlusIcon className="w-5 h-5" /></button>
                </form>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {journalFolders.map(folder => (
                        <div key={folder.id} className="flex items-center gap-2 p-2 bg-light-bg dark:bg-dark-bg rounded-md">
                            {editingFolderId === folder.id ? (
                                <input
                                    type="text"
                                    value={editingFolderName}
                                    onChange={e => setEditingFolderName(e.target.value)}
                                    onBlur={() => handleSaveEdit(folder.id)}
                                    onKeyDown={e => e.key === 'Enter' && handleSaveEdit(folder.id)}
                                    className="flex-1 bg-transparent focus:outline-none"
                                    autoFocus
                                />
                            ) : (
                                <span className="flex-1">{folder.name}</span>
                            )}
                            <button onClick={() => handleStartEdit(folder)}><PencilIcon className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteFolder(folder)}><TrashIcon className="w-4 h-4" /></button>
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    );
};

const JournalEditor: React.FC<{
    entry: JournalEntry;
    folders: Folder[];
    onUpdate: (id: string, updates: Partial<JournalEntry>) => Promise<void>;
    onDeleteRequest: (entry: JournalEntry) => void;
}> = ({ entry, folders, onUpdate, onDeleteRequest }) => {
    const [title, setTitle] = useState(entry.title);
    const [content, setContent] = useState(entry.content);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
    const { addNotification } = useNotifier();

    const debouncedTitle = useDebounce(title, 500);
    const debouncedContentForSave = useDebounce(content, 1000);
    
    // Debounce word count calculation to prevent lag on large entries
    const [wordCount, setWordCount] = useState(() => countWords(entry.content));
    const debouncedContentForWordCount = useDebounce(content, 250);

    useEffect(() => {
        setWordCount(countWords(debouncedContentForWordCount));
    }, [debouncedContentForWordCount]);

    useEffect(() => {
        setTitle(entry.title);
        setContent(entry.content);
        setSaveStatus('saved');
        setWordCount(countWords(entry.content));
    }, [entry]);

    const handleAutoSave = useCallback(async (updates: Partial<JournalEntry>) => {
        if (saveStatus === 'saved') return;
        setSaveStatus('saving');
        try {
            await onUpdate(entry.id, updates);
            setSaveStatus('saved');
        } catch (error) {
            addNotification('Failed to save journal entry. Please check your connection.', 'error');
            setSaveStatus('unsaved');
        }
    }, [entry.id, onUpdate, saveStatus, addNotification]);

    useEffect(() => {
        if(debouncedTitle !== entry.title || debouncedContentForSave !== entry.content) {
            handleAutoSave({ title: debouncedTitle, content: debouncedContentForSave, updatedAt: Date.now() });
        }
    }, [debouncedTitle, debouncedContentForSave, entry, handleAutoSave]);

    return (
        <div className="flex flex-col h-full bg-light-card dark:bg-dark-card rounded-r-xl">
            <div className="p-4 border-b border-light-border dark:border-dark-border">
                <div className="flex items-center justify-between gap-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => { setTitle(e.target.value); setSaveStatus('unsaved'); }}
                        placeholder="Entry Title"
                        className="w-full flex-1 bg-light-card dark:bg-dark-card p-2 -mx-2 rounded-lg text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="Journal Entry Title"
                    />
                     <div className="flex items-center gap-1 text-sm text-dark-text-secondary">
                        <FolderIcon className="w-4 h-4" aria-hidden="true" />
                        <select
                            value={entry.folderId || 'uncategorized'}
                            onChange={(e) => {
                                const newFolderId = e.target.value === 'uncategorized' ? null : e.target.value;
                                onUpdate(entry.id, { folderId: newFolderId });
                                addNotification(`Entry moved to ${e.target.selectedOptions[0].text}`, 'success');
                            }}
                            className="bg-transparent focus:outline-none p-1 rounded hover:bg-dark-border"
                            aria-label="Move entry to folder"
                        >
                            <option value="uncategorized">Uncategorized</option>
                            {folders.map(folder => (
                                <option key={folder.id} value={folder.id}>{folder.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto rich-text-editor">
                 <div className="max-w-4xl mx-auto h-full p-4 md:p-6">
                    <RichTextEditor value={content} onChange={(newContent) => { setContent(newContent); setSaveStatus('unsaved'); }} ariaLabel="Journal content editor" placeholder="What's on your mind?" />
                 </div>
            </div>
             <div className="p-2 border-t border-light-border dark:border-dark-border flex justify-between items-center gap-4">
                <span className="text-sm text-dark-text-secondary">{wordCount} words</span>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-dark-text-secondary italic">
                        {saveStatus === 'saving' && 'Saving...'}
                        {saveStatus === 'saved' && 'All changes saved'}
                        {saveStatus === 'unsaved' && 'Unsaved changes'}
                    </span>
                    <button onClick={() => onDeleteRequest(entry)} aria-label={`Delete entry: ${entry.title}`} className="p-2 text-dark-text-secondary hover:text-red-500 rounded-lg hover:bg-red-500/10">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const Journal: React.FC = () => {
    const { user } = useContext(AuthContext);
    const { addNotification } = useNotifier();
    const { items: allEntries, isLoading, addItem, updateItem, deleteItem } = useIndexedDB<JournalEntry>('journal');
    const { items: folders } = useIndexedDB<Folder>('folders');
    const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
    const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 250);
    const [selectedFolderId, setSelectedFolderId] = useState<string | 'all' | 'uncategorized'>('all');
    const [isFolderManagerOpen, setIsFolderManagerOpen] = useState(false);
    const location = useLocation();

    const journalFolders = useMemo(() => folders.filter(f => f.type === 'journal').sort((a,b) => a.name.localeCompare(b.name)), [folders]);

    const sortedEntries = useMemo(() => {
        const lowerCaseQuery = debouncedSearchTerm.toLowerCase();

        const filtered = allEntries.filter(entry => {
            // Folder filtering
            if (selectedFolderId === 'uncategorized' && entry.folderId) {
                return false;
            }
            if (selectedFolderId !== 'all' && selectedFolderId !== 'uncategorized' && entry.folderId !== selectedFolderId) {
                return false;
            }
            
            // Search term filtering
            if (debouncedSearchTerm) {
                if (!entry.title.toLowerCase().includes(lowerCaseQuery)) {
                    return false;
                }
            }
            
            return true;
        });
        
        // FIX: Ensure sorting works correctly by accessing required `createdAt` property.
        return filtered.sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
    }, [allEntries, debouncedSearchTerm, selectedFolderId]);
    
    useEffect(() => {
        const currentEntryExists = sortedEntries.some(e => e.id === selectedEntryId);

        if (location.state?.selectedEntryId && allEntries.find(e => e.id === location.state.selectedEntryId)) {
            const entry = allEntries.find(e => e.id === location.state.selectedEntryId);
            setSelectedEntryId(entry!.id);
            setSelectedFolderId(entry!.folderId || 'uncategorized');
        } else if (!currentEntryExists && sortedEntries.length > 0) {
            setSelectedEntryId(sortedEntries[0].id);
        } else if (sortedEntries.length === 0) {
            setSelectedEntryId(null);
        }
    }, [sortedEntries, selectedEntryId, location.state, allEntries]);

    const handleAddEntry = async () => {
        if (!user) return;
        try {
            const newEntryData = {
                user_id: user.id,
                title: 'Untitled Entry',
                content: '',
                folderId: (selectedFolderId !== 'all' && selectedFolderId !== 'uncategorized') ? selectedFolderId : null,
                createdAt: Date.now(),
            };
            const newEntry = await addItem(newEntryData);
            setSelectedEntryId(newEntry.id);
        } catch (error) {
            addNotification('Failed to create entry. Please check your connection and try again.', 'error');
        }
    };
    
    const confirmDelete = async () => {
        if (!entryToDelete || isDeleting) return;
        setIsDeleting(true);
        
        const element = document.getElementById(`journal-row-${entryToDelete.id}`);
        if (element) {
            element.classList.add('animate-item-out');
        }

        setTimeout(async () => {
            try {
                await deleteItem(entryToDelete.id);
                addNotification('Entry deleted.', 'success');
                if (selectedEntryId === entryToDelete.id) {
                    const newSelectionIndex = sortedEntries.findIndex(n => n.id === entryToDelete.id) -1;
                    setSelectedEntryId(sortedEntries.length > 1 ? sortedEntries[Math.max(0, newSelectionIndex)].id : null);
                }
            } catch (error) {
                addNotification('Failed to delete entry. Please check your connection and try again.', 'error');
            } finally {
                setEntryToDelete(null);
                setIsDeleting(false);
            }
        }, 300); // Animation duration
    };
    
    const selectedEntry = useMemo(() => allEntries.find(e => e.id === selectedEntryId), [allEntries, selectedEntryId]);

    const EntryRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const entry = sortedEntries[index];
        return (
            <div id={`journal-row-${entry.id}`} style={style}>
                <button onClick={() => setSelectedEntryId(entry.id)} className={`w-full h-full text-left p-4 border-b border-light-border dark:border-dark-border hover:bg-light-bg dark:hover:bg-dark-border ${selectedEntryId === entry.id ? 'bg-primary/10' : ''}`}>
                    <h3 className="font-semibold truncate">{entry.title}</h3>
                    {/* FIX: Ensure createdAt is always present to prevent runtime errors. */}
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary truncate">{new Date(entry.updatedAt || entry.createdAt).toLocaleString()}</p>
                </button>
            </div>
        );
    };

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-10rem)] -m-6">
            <div className="w-full md:w-1/3 md:min-w-[250px] md:max-w-[350px] h-1/3 md:h-full bg-light-card dark:bg-dark-card border-b md:border-b-0 md:border-r border-light-border dark:border-dark-border flex flex-col">
                <div className="p-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
                    <h1 className="text-xl font-bold">Journal</h1>
                    <button onClick={handleAddEntry} aria-label="Create new journal entry" className="p-2 bg-primary text-white rounded-lg hover:bg-primary-hover">
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>
                 <div className="p-2 border-b border-light-border dark:border-dark-border">
                    <input type="text" placeholder="Search entries..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg" />
                </div>
                 <div className="p-2 border-b border-light-border dark:border-dark-border">
                    <label htmlFor="folder-filter" className="sr-only">Filter by folder</label>
                    <div className="flex gap-2">
                        <select
                            id="folder-filter"
                            value={selectedFolderId}
                            onChange={e => setSelectedFolderId(e.target.value)}
                            className="flex-1 w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg"
                        >
                            <option value="all">All Entries</option>
                            <option value="uncategorized">Uncategorized</option>
                            {journalFolders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                        <button onClick={() => setIsFolderManagerOpen(true)} className="p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg" aria-label="Manage folders">
                            <Cog6ToothIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? <div className="p-4"><div className="flex justify-center items-center h-full"><Spinner /></div></div> : sortedEntries.length > 0 ? (
                        <AutoSizer>
                            {({ height, width }) => (
                                <FixedSizeList
                                    height={height}
                                    itemCount={sortedEntries.length}
                                    itemSize={65}
                                    width={width}
                                >
                                    {EntryRow}
                                </FixedSizeList>
                            )}
                        </AutoSizer>
                    ) : (
                        <div className="p-4 text-center text-sm text-dark-text-secondary">No entries found.</div>
                    )}
                </div>
            </div>
            <div className="flex-1 h-2/3 md:h-full">
                {selectedEntry ? (
                    <JournalEditor key={selectedEntry.id} entry={selectedEntry} folders={journalFolders} onUpdate={updateItem} onDeleteRequest={setEntryToDelete} />
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <EmptyState 
                            title={allEntries.length > 0 ? "No Entry Selected" : "Start Your Journal"}
                            message={allEntries.length > 0 ? "Select an entry from the list to begin." : "Create your first entry to capture your thoughts and reflections."}
                            icon={<BookOpenIcon className="w-12 h-12" />}
                            actionText="Create a New Entry"
                            onAction={handleAddEntry}
                        />
                    </div>
                )}
            </div>
            
             <Modal isOpen={!!entryToDelete} onClose={() => setEntryToDelete(null)} title="Delete Entry?">
                {entryToDelete && <p className="mb-6">Are you sure you want to permanently delete the entry "{entryToDelete.title}"?</p>}
                <div className="flex justify-end gap-3">
                    <button onClick={() => setEntryToDelete(null)} className="px-4 py-2 rounded-lg bg-dark-border">Cancel</button>
                    <button onClick={confirmDelete} disabled={isDeleting} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 w-32 h-10 flex justify-center items-center">
                        {isDeleting ? <ButtonSpinner /> : 'Delete Entry'}
                    </button>
                </div>
            </Modal>
            <FolderManagerModal isOpen={isFolderManagerOpen} onClose={() => setIsFolderManagerOpen(false)} allEntries={allEntries} updateEntry={updateItem} />
        </div>
    );
};

export default Journal;
