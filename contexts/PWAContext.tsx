import React, { createContext, useState, useEffect, useContext, PropsWithChildren, useCallback } from 'react';
import { useNotifier } from './NotificationContext.tsx';

interface PWAContextType {
    installPromptEvent: Event | null;
    isAppInstalled: boolean;
    triggerInstallPrompt: () => void;
}

export const PWAContext = createContext<PWAContextType>({
    installPromptEvent: null,
    isAppInstalled: false,
    triggerInstallPrompt: () => {},
});

export const usePWA = () => useContext(PWAContext);

export const PWAProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    const [installPromptEvent, setInstallPromptEvent] = useState<Event | null>(null);
    const [isAppInstalled, setIsAppInstalled] = useState(false);
    const { addNotification } = useNotifier();

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPromptEvent(e);
        };

        const handleAppInstalled = () => {
            setInstallPromptEvent(null);
            setIsAppInstalled(true);
        };

        if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
            setIsAppInstalled(true);
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const triggerInstallPrompt = useCallback(() => {
        if (installPromptEvent && (installPromptEvent as any).prompt) {
            (installPromptEvent as any).prompt();
            (installPromptEvent as any).userChoice.then((choiceResult: { outcome: string }) => {
                if (choiceResult.outcome === 'accepted') {
                    addNotification('FocusFlow installed successfully!', 'success');
                }
                setInstallPromptEvent(null);
            });
        }
    }, [installPromptEvent, addNotification]);
    
    const value = { installPromptEvent, isAppInstalled, triggerInstallPrompt };

    return (
        <PWAContext.Provider value={value}>
            {children}
        </PWAContext.Provider>
    );
};
