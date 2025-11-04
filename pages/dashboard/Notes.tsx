

import React, { useState, useMemo, useEffect, useContext, useCallback } from 'react';
import { useIndexedDB } from '../../hooks/useIndexedDB.ts';
import type { Note, Folder } from '../../types.ts';
import { PlusIcon, TrashIcon, FolderIcon, PencilIcon, Cog6ToothIcon } from '../../components/Icons.tsx';
import EmptyState from '../../components/EmptyState.tsx';
import Spinner from '../../components/Spinner.tsx';
import Modal from '../../components/Modal.tsx';
import { AuthContext } from '../../contexts/AuthContext.tsx';
import { useNotifier } from '../../contexts/NotificationContext.tsx';
import TagInput from '../../components/TagInput.tsx';
import RichTextEditor from '../../components/RichTextEditor.tsx';
import { useLocation } from 'react-router-dom';
// FIX: Use a named import for 'FixedSizeList' from 'react-window' to resolve the property does not exist error.
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
    allNotes: Note[];
    updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
}> = ({ isOpen, onClose, allNotes, updateNote }) => {
    const { user } = useContext(AuthContext);
    const { items: folders, addItem, updateItem, deleteItem } = useIndexedDB<Folder>('folders');
    const noteFolders = useMemo(() => folders.filter(f => f.type === 'note'), [folders]);
    
    const [newFolderName, setNewFolderName] = useState('');
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [editingFolderName, setEditingFolderName] = useState('');
    const { addNotification } = useNotifier();

    const handleAddFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newFolderName.trim() && user) {
            await addItem({ user_id: user.id, name: newFolderName.trim(), type: 'note', createdAt: Date.now() });
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
        if (!window.confirm(`Are you sure you want to delete the folder "${folder.name}"? All notes inside will be moved to "Uncategorized".`)) {
            return;
        }
        try {
            const notesToUpdate = allNotes.filter(n => n.folderId === folder.id);
            await Promise.all(notesToUpdate.map(note => updateNote(note.id, { folderId: null })));
            await deleteItem(folder.id);
            addNotification(`Folder "${folder.name}" deleted.`, 'success');
        } catch (error) {
            addNotification('Failed to delete folder.', 'error');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manage Note Folders">
            <div className="space-y-4">
                <form onSubmit={handleAddFolder} className="flex gap-2">
                    <input
                        type="text"
                        value={newFolderName}
                        onChange={e => setNewFolderName(e.target.value)}
                        placeholder="New folder name..."
                        className="flex-1 p-2 bg-light-card dark:bg-dark-card border rounded-lg"
                    />
                    <button type="submit" className="p-2 bg-primary text-white rounded-lg"><PlusIcon className="w-5 h-5" /></button>
                </form>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {noteFolders.map(folder => (
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

const NoteEditor: React.FC<{
    note: Note;
    folders: Folder[];
    onUpdate: (id: string, updates: Partial<Note>) => Promise<void>;
    onDeleteRequest: (note: Note) => void;
}> = ({ note, folders, onUpdate, onDeleteRequest }) => {
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);
    const [tags, setTags] = useState(note.tags || []);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
    const { addNotification } = useNotifier();

    const debouncedTitle = useDebounce(title, 500);
    const debouncedContentForSave = useDebounce(content, 1000);
    const debouncedTags = useDebounce(tags, 500);

    // Debounce word count calculation to prevent lag on large notes
    const [wordCount, setWordCount] = useState(() => countWords(note.content));
    const debouncedContentForWordCount = useDebounce(content, 250);

    useEffect(() => {
        setWordCount(countWords(debouncedContentForWordCount));
    }, [debouncedContentForWordCount]);

    useEffect(() => {
        // Only reset the editor state when the note ID changes, not on every re-render.
        // This prevents the cursor jump during auto-save.
        setTitle(note.title);
        setContent(note.content);
        setTags(note.tags || []);
        setSaveStatus('saved');
        setWordCount(countWords(note.content));
    }, [note.id]);
    
    const handleAutoSave = useCallback(async (updates: Partial<Note>) => {
        if(saveStatus === 'saved') return;
        setSaveStatus('saving');
        try {
            await onUpdate(note.id, updates);
            setSaveStatus('saved');
        } catch (error) {
            addNotification('Failed to save note. Please check your connection.', 'error');
            setSaveStatus('unsaved');
        }
    }, [note.id, onUpdate, saveStatus, addNotification]);
    
    useEffect(() => {
        if(debouncedTitle !== note.title || debouncedTags !== note.tags || debouncedContentForSave !== note.content) {
            handleAutoSave({ title: debouncedTitle, content: debouncedContentForSave, tags: debouncedTags, updatedAt: Date.now() });
        }
    }, [debouncedTitle, debouncedContentForSave, debouncedTags, note, handleAutoSave]);

    return (
        <div className="flex flex-col h-full bg-light-card dark:bg-dark-card rounded-r-xl">
            <div className="p-4 border-b border-light-border dark:border-dark-border">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setSaveStatus('unsaved'); }}
                    placeholder="Note Title"
                    className="w-full bg-light-card dark:bg-dark-card p-2 -mx-2 rounded-lg text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Note Title"
                />
            </div>
            <div className="flex-1 overflow-y-auto rich-text-editor">
                 <div className="max-w-4xl mx-auto h-full p-4 md:p-6">
                    <RichTextEditor value={content} onChange={(newContent) => { setContent(newContent); setSaveStatus('unsaved'); }} ariaLabel="Note content editor" placeholder="Start writing your note here..." />
                 </div>
            </div>
            <div className="p-2 border-t border-light-border dark:border-dark-border">
                <div className="px-2">
                    <TagInput tags={tags} onChange={(newTags) => { setTags(newTags); setSaveStatus('unsaved'); }} />
                </div>
                 <div className="p-2 flex justify-between items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-dark-text-secondary">
                        <FolderIcon className="w-4 h-4" aria-hidden="true" />
                        <select
                            value={note.folderId || 'uncategorized'}
                            onChange={(e) => {
                                const newFolderId = e.target.value === 'uncategorized' ? null : e.target.value;
                                onUpdate(note.id, { folderId: newFolderId });
                                addNotification(`Note moved to ${e.target.selectedOptions[0].text}`, 'success');
                            }}
                            className="bg-transparent focus:outline-none p-1 rounded hover:bg-dark-border"
                            aria-label="Move note to folder"
                        >
                            <option value="uncategorized">Uncategorized</option>
                            {folders.map(folder => (
                                <option key={folder.id} value={folder.id}>{folder.name}</option>
                            ))}
                        </select>
                    </div>
                     <div className="flex items-center gap-4">
                        <span className="text-sm text-dark-text-secondary">{wordCount} words</span>
                        <span className="text-sm text-dark-text-secondary italic">
                            {saveStatus === 'saving' && 'Saving...'}
                            {saveStatus === 'saved' && 'All changes saved'}
                            {saveStatus === 'unsaved' && 'Unsaved changes'}
                        </span>
                        <button onClick={() => onDeleteRequest(note)} aria-label="Delete note" className="p-2 text-dark-text-secondary hover:text-red-500 rounded-lg hover:bg-red-500/10">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Notes: React.FC = () => {
    const { user } = useContext(AuthContext);
    const { addNotification } = useNotifier();
    const { items: allNotes, isLoading, addItem, updateItem, deleteItem } = useIndexedDB<Note>('notes');
    const { items: folders } = useIndexedDB<Folder>('folders');
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 250);
    const [selectedFolderId, setSelectedFolderId] = useState<string | 'all' | 'uncategorized'>('all');
    const [isFolderManagerOpen, setIsFolderManagerOpen] = useState(false);
    const location = useLocation();

    const noteFolders = useMemo(() => folders.filter(f => f.type === 'note').sort((a,b) => a.name.localeCompare(b.name)), [folders]);

    const sortedNotes = useMemo(() => {
        const lowerCaseQuery = debouncedSearchTerm.toLowerCase();

        const filtered = allNotes.filter(note => {
            // Folder filtering
            if (selectedFolderId === 'uncategorized' && note.folderId) {
                return false;
            }
            if (selectedFolderId !== 'all' && selectedFolderId !== 'uncategorized' && note.folderId !== selectedFolderId) {
                return false;
            }
            
            // Search term filtering
            if (debouncedSearchTerm) {
                const hasTagMatch = note.tags?.some(tag => tag.toLowerCase().includes(lowerCaseQuery));
                if (!note.title.toLowerCase().includes(lowerCaseQuery) && !hasTagMatch) {
                    return false;
                }
            }
            
            return true;
        });
        
        return filtered.sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
    }, [allNotes, debouncedSearchTerm, selectedFolderId]);
    
    useEffect(() => {
        const currentNoteExists = sortedNotes.some(n => n.id === selectedNoteId);

        if (location.state?.selectedNoteId && allNotes.find(n => n.id === location.state.selectedNoteId)) {
            const note = allNotes.find(n => n.id === location.state.selectedNoteId);
            setSelectedNoteId(note!.id);
            setSelectedFolderId(note!.folderId || 'uncategorized');
        } else if (!currentNoteExists && sortedNotes.length > 0) {
            setSelectedNoteId(sortedNotes[0].id);
        } else if (sortedNotes.length === 0) {
            setSelectedNoteId(null);
        }
    }, [sortedNotes, selectedNoteId, location.state, allNotes]);

    const handleAddNote = async () => {
        if (!user) return;
        try {
            const newNoteData = {
                user_id: user.id,
                title: 'Untitled Note',
                content: '',
                tags: [],
                folderId: (selectedFolderId !== 'all' && selectedFolderId !== 'uncategorized') ? selectedFolderId : null,
                createdAt: Date.now(),
            };
            const newNote = await addItem(newNoteData);
            setSelectedNoteId(newNote.id);
        } catch (error) {
            addNotification('Failed to create note. Please check your connection and try again.', 'error');
        }
    };
    
    const confirmDelete = async () => {
        if (!noteToDelete || isDeleting) return;
        setIsDeleting(true);
        
        const element = document.getElementById(`note-row-${noteToDelete.id}`);
        if (element) {
            element.classList.add('animate-item-out');
        }

        setTimeout(async () => {
            try {
                await deleteItem(noteToDelete.id);
                addNotification('Note deleted.', 'success');
                if (selectedNoteId === noteToDelete.id) {
                    const newSelectionIndex = sortedNotes.findIndex(n => n.id === noteToDelete.id) -1;
                    setSelectedNoteId(sortedNotes.length > 1 ? sortedNotes[Math.max(0, newSelectionIndex)].id : null);
                }
            } catch (error) {
                addNotification('Failed to delete note. Please try again.', 'error');
            } finally {
                setNoteToDelete(null);
                setIsDeleting(false);
            }
        }, 300); // Animation duration
    };
    
    const selectedNote = useMemo(() => allNotes.find(n => n.id === selectedNoteId), [allNotes, selectedNoteId]);

    const NoteRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const note = sortedNotes[index];
        return (
            <div id={`note-row-${note.id}`} style={style}>
                <button onClick={() => setSelectedNoteId(note.id)} className={`w-full h-full text-left p-4 border-b border-light-border dark:border-dark-border hover:bg-light-bg dark:hover:bg-dark-border ${selectedNoteId === note.id ? 'bg-primary/10' : ''}`}>
                    <h3 className="font-semibold truncate">{note.title}</h3>
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary truncate">{new Date(note.updatedAt || note.createdAt).toLocaleString()}</p>
                </button>
            </div>
        );
    };

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-10rem)] -m-6">
            <div className="w-full md:w-1/3 md:min-w-[250px] md:max-w-[350px] h-1/3 md:h-full bg-light-card dark:bg-dark-card border-b md:border-b-0 md:border-r border-light-border dark:border-dark-border flex flex-col">
                <div className="p-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
                    <h1 className="text-xl font-bold">Notes</h1>
                    <button onClick={handleAddNote} aria-label="Create new note" className="p-2 bg-primary text-white rounded-lg hover:bg-primary-hover">
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>
                 <div className="p-2 border-b border-light-border dark:border-dark-border">
                    <input type="text" placeholder="Search notes or #tags" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-3 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg" />
                </div>
                 <div className="p-2 border-b border-light-border dark:border-dark-border">
                    <label htmlFor="folder-filter" className="sr-only">Filter by folder</label>
                    <div className="flex gap-2">
                        <select
                            id="folder-filter"
                            value={selectedFolderId}
                            onChange={e => setSelectedFolderId(e.target.value)}
                            className="flex-1 w-full p-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg"
                        >
                            <option value="all">All Notes</option>
                            <option value="uncategorized">Uncategorized</option>
                            {noteFolders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                        <button onClick={() => setIsFolderManagerOpen(true)} className="p-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg" aria-label="Manage folders">
                            <Cog6ToothIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? <div className="p-4"><div className="flex justify-center items-center h-full"><Spinner /></div></div> : sortedNotes.length > 0 ? (
                        <AutoSizer>
                            {({ height, width }) => (
                                <FixedSizeList
                                    height={height}
                                    itemCount={sortedNotes.length}
                                    itemSize={65}
                                    width={width}
                                >
                                    {NoteRow}
                                </FixedSizeList>
                            )}
                        </AutoSizer>
                    ) : (
                        <div className="p-4 text-center text-sm text-dark-text-secondary">No notes found.</div>
                    )}
                </div>
            </div>
            <div className="flex-1 h-2/3 md:h-full">
                {selectedNote ? (
                    <NoteEditor key={selectedNote.id} note={selectedNote} folders={noteFolders} onUpdate={updateItem} onDeleteRequest={setNoteToDelete} />
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <EmptyState 
                            title={allNotes.length > 0 ? "No Note Selected" : "Capture Your Ideas"}
                            message={allNotes.length > 0 ? "Select a note from the list to begin." : "Create your first note to capture your thoughts, ideas, and inspiration."}
                            icon={<PencilIcon className="w-12 h-12" />}
                            actionText="Create a New Note"
                            onAction={handleAddNote}
                        />
                    </div>
                )}
            </div>
            
             <Modal isOpen={!!noteToDelete} onClose={() => setNoteToDelete(null)} title="Delete Note?">
                {noteToDelete && <p className="mb-6">Are you sure you want to permanently delete the note "{noteToDelete.title}"?</p>}
                <div className="flex justify-end gap-3">
                    <button onClick={() => setNoteToDelete(null)} className="px-4 py-2 rounded-lg bg-dark-border">Cancel</button>
                    <button onClick={confirmDelete} disabled={isDeleting} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 w-32 h-10 flex justify-center items-center">
                        {isDeleting ? <ButtonSpinner /> : 'Delete Note'}
                    </button>
                </div>
            </Modal>
            <FolderManagerModal isOpen={isFolderManagerOpen} onClose={() => setIsFolderManagerOpen(false)} allNotes={allNotes} updateNote={updateItem} />
        </div>
    );
};

export default Notes;