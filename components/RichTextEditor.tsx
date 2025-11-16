import React, { useEffect, useRef, useState, useMemo } from 'react';
import Quill from 'quill';
import Modal from './Modal';
import { Note } from '../types';

const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'header': 1 }, { 'header': 2 }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['blockquote', 'code-block'],
    ['link'],
    ['clean']
];

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  allNotes: Note[];
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, ariaLabel, allNotes }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillInstance = useRef<any>(null);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkSearchQuery, setLinkSearchQuery] = useState('');
    const linkRange = useRef<any>(null);

    const filteredNotes = useMemo(() => {
        if (!linkSearchQuery) return allNotes;
        return allNotes.filter(note => note.title.toLowerCase().includes(linkSearchQuery.toLowerCase()));
    }, [linkSearchQuery, allNotes]);

    const handleSelectNoteLink = (note: Note) => {
        const quill = quillInstance.current;
        if (quill && linkRange.current) {
            const cursorPosition = linkRange.current.index;
            // Delete the `[[` and the search query
            quill.deleteText(cursorPosition - 2, linkSearchQuery.length + 2);
            
            // Insert the note title as an internal link
            quill.insertText(cursorPosition - 2, note.title, 'internal-link', note.id);

            // Insert a space after the link for better editing flow
            quill.insertText(cursorPosition - 2 + note.title.length, ' ');
            quill.setSelection(cursorPosition - 2 + note.title.length + 1, 0);
        }
        setIsLinkModalOpen(false);
    };

    useEffect(() => {
        if (editorRef.current && !quillInstance.current) {
            // Define custom blot for internal links
            const Inline = Quill.import('blots/inline');
            class InternalLinkBlot extends Inline {
                static blotName = 'internal-link';
                static tagName = 'a';
                static create(value: any) {
                    let node = super.create();
                    node.setAttribute('data-note-id', value);
                    node.setAttribute('class', 'internal-link');
                    // Prevent navigation within the editor
                    node.setAttribute('href', 'javascript:void(0);'); 
                    return node;
                }
                static formats(domNode: HTMLElement) {
                    return domNode.getAttribute('data-note-id');
                }
            }
            Quill.register(InternalLinkBlot);

            const quill = new Quill(editorRef.current, {
                modules: { toolbar: toolbarOptions },
                theme: 'bubble',
                placeholder: placeholder || 'Start writing...',
            });
            quillInstance.current = quill;

            const editor = editorRef.current.querySelector('.ql-editor');
            if (editor && ariaLabel) {
                editor.setAttribute('aria-label', ariaLabel);
            }

            quill.on('text-change', (delta, oldDelta, source) => {
                if (source === 'user') {
                    onChange(quill.root.innerHTML);

                    const selection = quill.getSelection();
                    if (!selection) return;

                    const [leaf] = quill.getLeaf(selection.index);
                    if (leaf && leaf.text) {
                        const linkMatch = /\[\[(.*)$/.exec(leaf.text);
                        if (linkMatch) {
                            linkRange.current = quill.getSelection(true);
                            setLinkSearchQuery(linkMatch[1] || '');
                            setIsLinkModalOpen(true);
                        } else {
                            if (isLinkModalOpen) {
                                setIsLinkModalOpen(false);
                            }
                        }
                    } else {
                         if (isLinkModalOpen) {
                            setIsLinkModalOpen(false);
                        }
                    }
                }
            });
        }
    }, [ariaLabel, placeholder, onChange, isLinkModalOpen]);
    
    // Set initial content
    useEffect(() => {
        const quill = quillInstance.current;
        if (quill && quill.root.innerHTML !== value) {
            quill.root.innerHTML = value;
        }
    }, [value]);

    return (
        <>
            <div ref={editorRef} className="h-full" />
            <Modal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} title="Link to a Note">
                <input
                    type="text"
                    value={linkSearchQuery}
                    onChange={(e) => setLinkSearchQuery(e.target.value)}
                    placeholder="Search for a note..."
                    className="w-full p-2 mb-4 bg-dark-bg border border-dark-border rounded-lg"
                    autoFocus
                />
                <div className="max-h-60 overflow-y-auto">
                    {filteredNotes.length > 0 ? filteredNotes.map(note => (
                        <button
                            key={note.id}
                            onClick={() => handleSelectNoteLink(note)}
                            className="w-full text-left p-2 rounded-md hover:bg-dark-border"
                        >
                            {note.title}
                        </button>
                    )) : (
                        <div className="p-2 text-center text-sm text-dark-text-secondary">No notes found.</div>
                    )}
                </div>
            </Modal>
        </>
    );
};

export default RichTextEditor;
