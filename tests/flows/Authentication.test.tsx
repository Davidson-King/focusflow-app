import React from 'react';
import { expect } from 'chai';
import { render, screen, userEvent, waitFor, cleanup } from '../test-utils';
import { clearDB } from '../test-utils';
import App from '../../App.tsx';

export default [
    {
        name: '[Auth] should navigate from landing page to dashboard',
        fn: async () => {
            await clearDB();
            cleanup();
            render(<App />);

            // User is on landing page, find the call to action
            const getStartedButton = await screen.findByRole('link', { name: /Get Started/i });
            await userEvent.click(getStartedButton);

            // Verify user is on the dashboard
            await waitFor(() => {
                // The mock user from test-utils is "Test User"
                expect(screen.getByText(/Good Morning, Test User!/i)).to.exist;
            });
        }
    }
];
