import React from 'react';
import { expect } from 'chai';
import { render, screen, userEvent, waitFor, cleanup } from '../test-utils';
import { clearDB } from '../test-utils';
import App from '../../App.tsx';

// This test suite simulates a full user flow for the Tasks feature.
// Tests are stateful and run in order to mimic a user's journey.
export default [
    {
        name: '[Tasks] should navigate to dashboard and add a new task',
        fn: async () => {
            // Setup: Clear database and render the app from the landing page.
            await clearDB();
            cleanup(); 
            render(<App />);

            // 1. Navigate from landing page to the dashboard.
            await userEvent.click(await screen.findByRole('link', { name: /Get Started/i }));
            
            // 2. Navigate to Tasks page.
            await userEvent.click(await screen.findByRole('link', { name: /Tasks/i }));

            // 3. Find the task input field on the Tasks page.
            const taskInput = await screen.findByPlaceholderText('Add a new task...');
            expect(taskInput).to.exist;

            // 4. Add a new task by typing text and clicking the add button.
            const taskText = 'My first test task';
            await userEvent.type(taskInput, taskText);
            const addButton = screen.getByRole('button', { name: /add task/i });
            await userEvent.click(addButton);

            // 5. Verify the new task appears in the list.
            await waitFor(() => {
                expect(screen.getByText(taskText)).to.exist;
            });
        }
    },
    {
        name: '[Tasks] should allow a user to complete a task',
        fn: async () => {
            // This test assumes the previous test's state (one task exists).
            const taskText = 'My first test task';
            expect(screen.getByText(taskText)).to.exist;
            
            // 1. Find and click the checkbox to complete the task.
            const checkbox = screen.getByLabelText(/Mark task as complete/i);
            await userEvent.click(checkbox);
            
            // 2. Verify the task now has the 'line-through' style.
            await waitFor(() => {
                 const taskElement = screen.getByText(taskText);
                 expect(taskElement.classList.contains('line-through')).to.be.true;
            });

            // 3. Toggle back to incomplete.
            await userEvent.click(screen.getByLabelText(/Mark task as incomplete/i));
             await waitFor(() => {
                 const taskElement = screen.getByText(taskText);
                 expect(taskElement.classList.contains('line-through')).to.be.false;
            });
        }
    },
     {
        name: '[Tasks] should allow a user to delete a task',
        fn: async () => {
            // This test assumes the previous test's state.
            const taskText = 'My first test task';
            const taskItem = screen.getByText(taskText).closest('div.group');
            
            if(!taskItem) throw new Error('Task item container not found');

            // 1. Find the delete button within the task item.
            const deleteButton = taskItem.querySelector(`[aria-label="Delete task: ${taskText}"]`);
            if(!deleteButton) throw new Error('Delete button not found');
            
            // 2. Click the delete button.
            await userEvent.click(deleteButton);

            // 3. Confirm in the modal.
            await userEvent.click(await screen.findByRole('button', { name: /Delete Task/i }));
            
            // 4. Verify the task is removed from the DOM.
            await waitFor(() => {
                expect(screen.queryByText(taskText)).to.be.null;
            });
        }
    }
];
