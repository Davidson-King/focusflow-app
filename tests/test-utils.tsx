
import React, { PropsWithChildren, useMemo, useState } from 'react';
// Fix: Explicitly import screen, waitFor, cleanup, and act as they were not being exported correctly.
import { render as rtlRender, screen, waitFor, cleanup, act } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { AuthContext } from '../contexts/AuthContext';
// Fix: Removed 'Plan' as it is not an exported member of '../types'.
import type { User, Mode, DashboardLayoutItem } from '../types';
import { db } from '../services/db';
import { DEFAULT_DASHBOARD_LAYOUT } from '../constants/dashboard.ts';

const MockAuthProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    // This state mimics the useLocalStorage hook in the real AuthContext
    const [name, setName] = useState('Test User');
    const [layout, setLayout] = useState<DashboardLayoutItem[]>(DEFAULT_DASHBOARD_LAYOUT);

    const mockUser: User = {
        id: 'local-user',
        email: '',
        name: name,
        avatar: '/favicon.svg',
        dashboardLayout: layout,
        isMockUser: true,
    };

    const authValue = useMemo(() => ({
        user: mockUser,
        isLoading: false,
        updateUser: async (data: Partial<Pick<User, 'name' | 'dashboardLayout' | 'avatar'>>) => {
            if (data.name) setName(data.name);
            if (data.dashboardLayout) setLayout(data.dashboardLayout);
        },
    }), [mockUser, setName, setLayout]);

    return (
        <AuthContext.Provider value={authValue as any}>
            {children}
        </AuthContext.Provider>
    );
};

const AllTheProviders: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    const themeValue = {
        mode: 'dark' as Mode,
        toggleMode: () => {},
        colorTheme: 'default',
        setColorTheme: () => {}
    };

    return (
        <ThemeContext.Provider value={themeValue}>
            <NotificationProvider>
                 <HashRouter>
                    <MockAuthProvider>
                        {children}
                    </MockAuthProvider>
                </HashRouter>
            </NotificationProvider>
        </ThemeContext.Provider>
    );
};

const render = (ui: React.ReactElement, options?: any) =>
    rtlRender(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library
// export * from '@testing-library/react'; // This is removed to fix export issues.
export { default as userEvent } from '@testing-library/user-event';
// Export custom render method and other utilities
// Fix: Explicitly export screen, waitFor, cleanup, and act.
export { render, screen, waitFor, cleanup, act };

// Helper to clear DB before tests
export const clearDB = async () => {
    await Promise.all([
        db.clear('tasks'),
        db.clear('notes'),
        db.clear('journal'),
        db.clear('goals'),
        db.clear('timelines'),
        db.clear('folders'),
        db.clear('userProfile'),
        db.clear('settings'),
    ]);
    localStorage.clear();
};
