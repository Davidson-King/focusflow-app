import React from 'react';
import { expect } from 'chai';
import { render, screen, userEvent, waitFor, cleanup } from '../test-utils';
import { clearDB } from '../test-utils';
import App from '../../App.tsx';

// Mock the Quill.js editor, which is loaded from a CDN and not available in JSDOM.
class MockQuill {
    root: { innerHTML: string };
    listeners: Record<string, Function>;
    constructor(element: HTMLElement, options: any) {
        this.root = { innerHTML: '' };
        this.listeners = {};
        if (options.placeholder) element.setAttribute('data-placeholder', options.placeholder);
        element.innerHTML = '<div><br></div>';
    }
    on(event: string, callback: Function) { this.listeners[event] = callback; }
}
(globalThis as any).Quill = MockQuill;

// This test suite simulates a full user flow for the Notes feature.
export default [
    {
        name: '[Notes] should create a new note',
        fn: async () => {
            // Setup
            await clearDB();
            cleanup(); 
            render(<App />);

            // 1. Navigate to dashboard
            await userEvent.click(await screen.findByRole('link', { name: /Get Started/i }));

            // 2. Navigate to Notes page
            await userEvent.click(await screen.findByRole('link', { name: /Notes/i }));

            // 3. Click "Create new note"
            const newNoteButton = await screen.findByRole('button', { name: /Create new note/i });
            await userEvent.click(newNoteButton);

            // 4. Verify the new note is created and selected
            await waitFor(() => {
                const titleInput = screen.getByPlaceholderText('Note Title');
                expect((titleInput as HTMLInputElement).value).to.equal('Untitled Note');
                expect(screen.getByText('Untitled Note')).to.exist;
            });
        }
    },
    {
        name: '[Notes] should update a note\'s title',
        fn: async () => {
            // This test assumes the previous test's state (one note exists).
            const newTitle = 'My Updated Note Title';

            // 1. Update the title
            const titleInput = screen.getByPlaceholderText('Note Title');
            await userEvent.clear(titleInput);
            await userEvent.type(titleInput, newTitle);
            
            // 2. Wait for debounce and verify changes are reflected
            await waitFor(() => {
                expect(screen.getByText(newTitle)).to.exist;
                expect(screen.getByText('All changes saved')).to.exist;
            }, { timeout: 2000 });
        }
    },
    {
        name: '[Notes] should delete a note',
        fn: async () => {
            // This test assumes the previous test's state.
            const noteTitle = 'My Updated Note Title';
            expect(await screen.findByText(noteTitle)).to.exist;

            // 1. Click the delete button in the editor
            const deleteButton = screen.getByRole('button', { name: /Delete note/i });
            await userEvent.click(deleteButton);
            
            // 2. Confirm deletion in the modal
            const confirmButton = await screen.findByRole('button', { name: /Delete Note/i });
            await userEvent.click(confirmButton);

            // 3. Verify the note is removed
            await waitFor(() => {
                expect(screen.queryByText(noteTitle)).to.be.null;
                expect(screen.queryByPlaceholderText('Note Title')).to.be.null;
            });
        }
    }
];
