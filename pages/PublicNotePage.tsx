import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/db.ts';
import type { Note } from '../types.ts';
import Spinner from '../components/Spinner.tsx';
import { DocumentTextIcon } from '../components/Icons.tsx';

const PublicNotePage: React.FC = () => {
    const { shareId } = useParams<{ shareId: string }>();
    const [note, setNote] = useState<Note | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNote = async () => {
            if (!shareId) {
                setError('Invalid link.');
                setIsLoading(false);
                return;
            }
            try {
                // This is inefficient but necessary for a local-first app without a backend.
                // It iterates through all notes to find the one with the matching shareId.
                const allNotes = await db.getAll('notes');
                const foundNote = allNotes.find(n => n.shareId === shareId);
                if (foundNote) {
                    setNote(foundNote);
                } else {
                    setError('Note not found or sharing has been disabled.');
                }
            } catch (e) {
                setError('Could not retrieve note.');
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNote();
    }, [shareId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (error || !note) {
        return (
            <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center text-center p-4">
                <DocumentTextIcon className="w-16 h-16 text-dark-text-secondary mb-4" />
                <h1 className="text-2xl font-bold text-dark-text mb-2">Note Not Available</h1>
                <p className="text-dark-text-secondary">{error}</p>
                <Link to="/" className="mt-6 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors">
                    Go to FocusFlow
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-bg text-dark-text font-sans">
            <div className="max-w-4xl mx-auto p-4 sm:p-8">
                <main className="bg-dark-card p-6 sm:p-10 rounded-xl border border-dark-border">
                    <h1 className="text-4xl font-bold mb-4">{note.title}</h1>
                    <p className="text-sm text-dark-text-secondary mb-6">
                        Published on {new Date(note.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <div 
                        className="rich-text-view"
                        dangerouslySetInnerHTML={{ __html: note.content }} 
                    />
                </main>
                <footer className="text-center mt-8">
                    <Link to="/" className="text-sm text-dark-text-secondary hover:text-primary transition-colors">
                        Created with FocusFlow
                    </Link>
                </footer>
            </div>
        </div>
    );
};

export default PublicNotePage;
