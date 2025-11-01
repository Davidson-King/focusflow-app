import React from 'react';
import { expect } from 'chai';
import { render, screen, userEvent, waitFor, cleanup } from '../test-utils';
import { clearDB } from '../test-utils';
import App from '../../App.tsx';

export default [
    {
        name: '[Goals] should create a new habit',
        fn: async () => {
            await clearDB();
            cleanup(); 
            render(<App />);

            // 1. Navigate to Dashboard
            await userEvent.click(await screen.findByRole('link', { name: /Open App/i }));
            
            // 2. Navigate to Goals
            await userEvent.click(await screen.findByRole('link', { name: /Goals/i }));

            // 3. Create a new Goal
            const newGoalButton = await screen.findByRole('button', { name: /New Goal/i });
            await userEvent.click(newGoalButton);

            const modalInput = await screen.findByPlaceholderText('e.g., Read 10 pages daily');
            await userEvent.type(modalInput, 'Test Daily Habit');
            await userEvent.click(screen.getByRole('button', { name: /Save Goal/i }));

            // 4. Verify the new habit appears
            await waitFor(() => {
                expect(screen.getByText('Test Daily Habit')).to.exist;
            });
        }
    },
    {
        name: '[Goals] should toggle a habit\'s completion status',
        fn: async () => {
            const habitText = 'Test Daily Habit';
            const habitRow = screen.getByText(habitText).closest('div');
            if (!habitRow) throw new Error('Habit row not found');

            const checkboxButton = habitRow.querySelector('button');
            if (!checkboxButton) throw new Error('Checkbox button not found');

            await userEvent.click(checkboxButton);
            // Confirm in modal
            await userEvent.click(await screen.findByRole('button', { name: 'Confirm' }));
            
            await waitFor(() => {
                expect(checkboxButton.querySelector('svg')).to.exist;
            });

            await userEvent.click(checkboxButton);
             await waitFor(() => {
                expect(checkboxButton.querySelector('svg')).to.be.null;
            });
        }
    },
    {
        name: '[Goals] should delete a habit',
        fn: async () => {
            const habitText = 'Test Daily Habit';
            const habitRow = screen.getByText(habitText).closest('div.group');
            if (!habitRow) throw new Error('Habit row not found');
            
            const deleteButton = habitRow.querySelector('button[aria-label^="Delete"]');
            if(!deleteButton) throw new Error('Delete button not found');
            await userEvent.click(deleteButton);

            const confirmButton = await screen.findByRole('button', { name: /Delete/i });
            await userEvent.click(confirmButton);

            await waitFor(() => {
                expect(screen.queryByText(habitText)).to.be.null;
                expect(screen.getByText('Create your first goal or habit to get started.')).to.exist;
            });
        }
    }
];