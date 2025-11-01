import React, { createContext, useState, useCallback, PropsWithChildren, useContext } from 'react';
import type { Notification, NotificationType } from '../types';

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (message: string, type: NotificationType) => void;
    removeNotification: (id: number) => void;
}

export const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    addNotification: () => {},
    removeNotification: () => {},
});

export const useNotifier = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const removeNotification = useCallback((id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const addNotification = useCallback((message: string, type: NotificationType) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            removeNotification(id);
        }, 5000); // Auto-remove after 5 seconds
    }, [removeNotification]);

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};
