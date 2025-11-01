import React from 'react';
import { expect } from 'chai';
import { render, screen, userEvent, waitFor, cleanup } from '../test-utils';
import { clearDB } from '../test-utils';
import App from '../../App.tsx';

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


// This test suite simulates a full user flow for the Journal feature.
export default [
    {
        name: '[Journal] should create a new entry',
        fn: async () => {
            // Setup
            await clearDB();
            cleanup(); 
            render(<App />);

            // 1. Navigate to dashboard
            await userEvent.click(await screen.findByRole('link', { name: /Get Started/i }));
            
            // 2. Navigate to Journal page
            await userEvent.click(await screen.findByRole('link', { name: /Journal/i }));

            // 3. Click "Create new journal entry"
            const newEntryButton = await screen.findByRole('button', { name: /Create new journal entry/i });
            await userEvent.click(newEntryButton);

            // 4. Verify the new entry is created and selected
            await waitFor(async () => {
                expect(await screen.findByText('Untitled Entry')).to.exist;
                const titleInput = screen.getByPlaceholderText("Entry Title");
                expect((titleInput as HTMLInputElement).value).to.equal('Untitled Entry');
            });
        }
    },
    {
        name: '[Journal] should update the entry title',
        fn: async () => {
            // This test assumes the previous test's state.
            const newTitle = 'My E2E Journal Entry';
            
            const titleInput = screen.getByPlaceholderText("Entry Title");
            await userEvent.clear(titleInput);
            await userEvent.type(titleInput, newTitle);

            // Wait for debounce and verify the title is saved
            await waitFor(() => {
                expect(screen.getByText(newTitle)).to.exist;
                expect(screen.getByText('All changes saved')).to.exist;
            }, { timeout: 1500 });
        }
    },
    {
        name: '[Journal] should delete the entry',
        fn: async () => {
            // This test assumes the previous test's state.
            const entryTitle = 'My E2E Journal Entry';
            expect(await screen.findByText(entryTitle)).to.exist;
            
            // 1. Click the delete button
            const deleteButton = screen.getByRole('button', { name: `Delete entry: ${entryTitle}` });
            await userEvent.click(deleteButton);
            
            // 2. Confirm deletion in the modal
            const confirmButton = await screen.findByRole('button', { name: /Delete Entry/i });
            await userEvent.click(confirmButton);

            // 3. Verify the entry is removed
            await waitFor(() => {
                expect(screen.queryByText(entryTitle)).to.be.null;
                expect(screen.queryByPlaceholderText("Entry Title")).to.be.null;
            });
        }
    }
];
