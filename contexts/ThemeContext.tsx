import React, { createContext, useState, useEffect, useCallback, PropsWithChildren } from 'react';
import type { Mode } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage.ts';
import { themes } from '../constants/themes.ts';

interface ThemeContextType {
  mode: Mode;
  toggleMode: () => void;
  colorTheme: string;
  setColorTheme: (themeName: string) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  toggleMode: () => {},
  colorTheme: 'default',
  setColorTheme: () => {},
});

export const ThemeProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    const [mode, setMode] = useLocalStorage<Mode>('focusflow-theme-mode', 'dark');
    const [colorTheme, setColorTheme] = useLocalStorage<string>('focusflow-color-theme', 'default');

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(mode);
    }, [mode]);

    useEffect(() => {
        const selectedTheme = themes.find(t => t.name === colorTheme) || themes[0];
        const root = window.document.documentElement;
        root.style.setProperty('--primary', selectedTheme.colors.primary);
        root.style.setProperty('--primary-hover', selectedTheme.colors.primaryHover);
        root.style.setProperty('--primary-glow', selectedTheme.colors.primaryGlow);
    }, [colorTheme]);

    const toggleMode = useCallback(() => {
        setMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
    }, [setMode]);

    const value = { mode, toggleMode, colorTheme, setColorTheme };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
