import React from 'react';
import { expect } from 'chai';
import { render, screen, userEvent, waitFor, cleanup, act } from '../test-utils';
import { clearDB } from '../test-utils';
import App from '../../App.tsx';
import { db } from '../../services/db';

// This test suite simulates user flows for the Settings page.
export default [
    {
        name: '[Settings] should update user name',
        fn: async () => {
            // Setup
            await clearDB();
            cleanup(); 
            render(<App />);

            // 1. Navigate to dashboard
            await userEvent.click(await screen.findByRole('link', { name: /Open App/i }));
            
            // 2. Navigate to Settings
            await userEvent.click(await screen.findByRole('link', { name: /Settings/i }));
            
            // 3. Update the name
            const newName = 'Updated Tester Name';
            const nameInput = await screen.findByLabelText('Name');
            await userEvent.clear(nameInput);
            await userEvent.type(nameInput, newName);
            await userEvent.click(screen.getByRole('button', { name: /Save/i }));

            // 4. Verify name is updated on the Home page
            await userEvent.click(screen.getByRole('link', { name: /Home/i }));
            await waitFor(() => {
                expect(screen.getByText(`Good Morning, ${newName}!`)).to.exist;
            });
        }
    },
    {
        name: '[Settings] should export and import data with confirmation',
        fn: async () => {
            // This test assumes the user is logged in.
            
            // 1. Add some data to export
            await act(async () => {
                await db.put('tasks', { id: 'task1', text: 'Export me', user_id: 'local-user', completed: false, parentId: null, priority: 0, createdAt: Date.now() });
            });
            
            // 2. Navigate to Settings
            await userEvent.click(screen.getByRole('link', { name: /Settings/i }));
            
            // 3. Export data
            const exportButton = screen.getByRole('button', { name: /Export Data/i });
            await userEvent.click(exportButton);
            expect(await screen.findByText('Data exported successfully.')).to.exist;

            // 4. Import data
            const fileContent = JSON.stringify({
                tasks: [{ id: 'imported-task', text: 'Imported Task', user_id: 'local-user', completed: true, parentId: null, priority: 1, createdAt: Date.now() }],
                notes: [], journal: [], goals: [], timelines: [], folders: []
            });
            const file = new File([fileContent], 'backup.json', { type: 'application/json' });
            
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            await userEvent.upload(fileInput, file);
            
            // 5. Confirm the import in the modal
            const confirmInput = await screen.findByLabelText(/To confirm, please type/i);
            await userEvent.type(confirmInput, 'MERGE');

            const confirmButton = await screen.findByRole('button', { name: /Merge and Import/i });
            expect(confirmButton.hasAttribute('disabled')).to.be.false;
            await userEvent.click(confirmButton);
            
            // Wait for overlay to disappear
            await waitFor(() => {
                expect(document.getElementById('import-process-overlay')).to.be.null;
            }, { timeout: 3000 });
            
            // 7. Verify the data was actually imported
            const tasks = await db.getAll('tasks');
            expect(tasks.length).to.equal(1);
            expect(tasks[0].text).to.equal('Imported Task');
        }
    }
];