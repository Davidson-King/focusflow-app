import React, { createContext, useState, useEffect, useCallback, PropsWithChildren, useContext } from 'react';
import type { User } from '../types.ts';
import { useLocalStorage } from '../hooks/useLocalStorage.ts';
import { DEFAULT_DASHBOARD_LAYOUT } from '../constants/dashboard.ts';
import { db } from '../services/db.ts';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  updateUser: (data: Partial<Pick<User, 'name' | 'dashboardLayout' | 'avatar'>>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  updateUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    const [name, setName] = useState('FocusFlow User'); // Manage name with local state to avoid premature saving
    const [layout, setLayout] = useLocalStorage('focusflow-dashboard-layout', DEFAULT_DASHBOARD_LAYOUT);
    const [avatar, setAvatar] = useState('/favicon.svg');
    const [isLoading, setIsLoading] = useState(true);

    const user: User | null = {
        id: 'local-user',
        email: '',
        name: name,
        avatar: avatar,
        dashboardLayout: layout,
        isMockUser: true,
    };
    
    useEffect(() => {
        const loadUserData = async () => {
            // Load name from localStorage manually to prevent useLocalStorage from setting a default
            const storedName = localStorage.getItem('focusflow-username');
            if (storedName) {
                try {
                    setName(JSON.parse(storedName));
                } catch { /* ignore parsing errors */ }
            }
            
            const storedAvatar = await db.get('userProfile', 'avatar');
            if (storedAvatar) {
                setAvatar(storedAvatar);
            }

            // Simulate loading to allow splash screen to show
            const timer = setTimeout(() => {
                setIsLoading(false);
                const splashScreen = document.getElementById('splash-screen');
                if (splashScreen) {
                    splashScreen.classList.add('fade-out');
                    setTimeout(() => {
                        splashScreen.remove();
                    }, 500);
                }
            }, 500);
            return () => clearTimeout(timer);
        };
        loadUserData();
    }, []);

    const updateUser = useCallback(async (data: Partial<Pick<User, 'name' | 'dashboardLayout' | 'avatar'>>) => {
        if (data.name) {
            setName(data.name);
            localStorage.setItem('focusflow-username', JSON.stringify(data.name)); // Manually set localStorage
        }
        if (data.dashboardLayout) {
            setLayout(data.dashboardLayout);
        }
        if (typeof data.avatar !== 'undefined') {
            if (data.avatar === 'DEFAULT') {
                await db.delete('userProfile', 'avatar');
                setAvatar('/favicon.svg');
            } else {
                await db.put('userProfile', data.avatar, 'avatar');
                setAvatar(data.avatar);
            }
        }
    }, [setLayout]);

    const value = { user, isLoading, updateUser };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};