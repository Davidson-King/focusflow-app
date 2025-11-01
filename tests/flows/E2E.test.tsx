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
        if (options.placeholder) {
            element.setAttribute('data-placeholder', options.placeholder);
        }
        element.innerHTML = '<div><br></div>';
    }
    on(event: string, callback: Function) { this.listeners[event] = callback; }
}
(globalThis as any).Quill = MockQuill;


export default [
    {
        name: 'should guide a user from landing page through core features',
        fn: async () => {
            await clearDB();
            cleanup(); 
            render(<App />);

            // == 1. LANDING PAGE & ONBOARDING ==
            await userEvent.click(await screen.findByRole('link', { name: /Get Started/i }));
            
            expect(await screen.findByText(/Welcome to your dashboard!/i)).to.exist;
            await userEvent.click(screen.getByRole('button', { name: /Next/i })); 
            await userEvent.click(screen.getByRole('button', { name: /Next/i })); 
            await userEvent.click(screen.getByRole('button', { name: /Next/i })); 
            await userEvent.click(screen.getByRole('button', { name: /Next/i })); 
            await userEvent.click(screen.getByRole('button', { name: /Next/i })); 
            await userEvent.click(screen.getByRole('button', { name: /Finish Tour/i }));
            
            await waitFor(() => {
                expect(screen.queryByText(/Welcome to your dashboard!/i)).to.be.null;
            });

            // == 2. TASKS ==
            await userEvent.click(await screen.findByRole('link', { name: /Tasks/i }));
            const taskInput = await screen.findByPlaceholderText('Add a new task...');
            const taskText = 'Complete E2E test';
            await userEvent.type(taskInput, taskText);
            await userEvent.click(screen.getByRole('button', { name: /add task/i }));
            await waitFor(() => expect(screen.getByText(taskText)).to.exist);
            const checkbox = screen.getByLabelText(/Mark task as complete/i);
            await userEvent.click(checkbox);
            await waitFor(() => {
                 const taskElement = screen.getByText(taskText);
                 expect(taskElement.classList.contains('line-through')).to.be.true;
            });

            // == 3. NOTES ==
            await userEvent.click(screen.getByRole('link', { name: /Notes/i }));
            await userEvent.click(await screen.findByRole('button', { name: /Create new note/i }));
            await waitFor(() => expect(screen.getByPlaceholderText('Note Title')).to.exist);
            const titleInput = screen.getByPlaceholderText('Note Title');
            const newTitle = 'E2E Test Note';
            await userEvent.clear(titleInput);
            await userEvent.type(titleInput, newTitle);
            
            await waitFor(() => expect(screen.getByText(newTitle)).to.exist, { timeout: 1500 });
            expect(await screen.findByText('All changes saved')).to.exist;

            // == 4. GOALS ==
            await userEvent.click(screen.getByRole('link', { name: /Goals/i }));
            await userEvent.click(await screen.findByRole('button', { name: /New Goal/i }));
            const modalInput = await screen.findByPlaceholderText('e.g., Read 10 pages daily');
            await userEvent.type(modalInput, 'Test E2E Habit');
            await userEvent.click(screen.getByRole('button', { name: /Save Goal/i }));
            await waitFor(() => expect(screen.getByText('Test E2E Habit')).to.exist);

             // == 5. SETTINGS ==
            await userEvent.click(screen.getByRole('link', { name: /Settings/i }));
            const nameInput = await screen.findByLabelText('Name');
            await userEvent.clear(nameInput);
            await userEvent.type(nameInput, 'E2E Tester');
            await userEvent.click(screen.getByRole('button', { name: /Save/i }));
            expect(await screen.findByText('Name updated successfully!')).to.exist;
        }
    }
];