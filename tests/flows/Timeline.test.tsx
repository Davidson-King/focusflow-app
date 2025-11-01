import React from 'react';
import { expect } from 'chai';
import { render, screen, userEvent, waitFor, cleanup } from '../test-utils';
import { clearDB } from '../test-utils';
import App from '../../App.tsx';

export default [
    {
        name: '[Timeline] should create a new timeline and add an event',
        fn: async () => {
            await clearDB();
            cleanup(); 
            render(<App />);

            // 1. Navigate to Dashboard
            await userEvent.click(await screen.findByRole('link', { name: /Open App/i }));
            
            // 2. Navigate to Timeline
            await userEvent.click(await screen.findByRole('link', { name: /Timeline/i }));

            // 3. Create a new Timeline
            const timelineName = 'Project X Launch';
            const nameInput = await screen.findByPlaceholderText('New timeline name...');
            await userEvent.type(nameInput, timelineName);
            await userEvent.click(screen.getByRole('button', { name: /Create new timeline/i }));
            
            await waitFor(async () => {
                 expect(await screen.findByText(timelineName)).to.exist;
            });

            // 4. Add an event to the timeline
            await userEvent.click(screen.getByRole('button', { name: /Add Event/i }));
            const titleInput = await screen.findByLabelText('Title');
            await userEvent.type(titleInput, 'Kickoff Meeting');
            await userEvent.click(screen.getByRole('button', { name: /Save/i }));
            
            // 5. Verify the event appears
            await waitFor(() => {
                 expect(screen.getByText('Kickoff Meeting')).to.exist;
            });
        }
    },
    {
        name: '[Timeline] should delete an event',
        fn: async () => {
            const eventTitle = 'Kickoff Meeting';
            const eventContainer = screen.getByText(eventTitle).closest('div.group');
            if (!eventContainer) throw new Error('Event container not found');
            
            const deleteButton = eventContainer.querySelector('button[aria-label^="Delete"]');
            if(!deleteButton) throw new Error('Delete button not found');
            await userEvent.click(deleteButton);
            
            await waitFor(() => {
                expect(screen.queryByText(eventTitle)).to.be.null;
            });
        }
    },
    {
        name: '[Timeline] should delete the timeline',
        fn: async () => {
            const timelineName = 'Project X Launch';
            expect(await screen.findByText(timelineName)).to.exist;

            const deleteButton = screen.getByRole('button', { name: /Delete timeline/i });
            await userEvent.click(deleteButton);

            await waitFor(() => {
                expect(screen.queryByText(timelineName)).to.be.null;
                expect(screen.getByText('Create your first timeline to get started.')).to.exist;
            });
        }
    }
];