import React, { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';
import type { Notification, NotificationType } from '../types';
import { CheckIcon, XIcon } from './Icons';

const typeClasses: Record<NotificationType, { bg: string; text: string; icon: React.ReactNode }> = {
    success: {
        bg: 'bg-green-500',
        text: 'text-white',
        icon: <CheckIcon className="w-5 h-5" />
    },
    error: {
        bg: 'bg-red-500',
        text: 'text-white',
        icon: <XIcon className="w-5 h-5" />
    },
    info: {
        bg: 'bg-blue-500',
        text: 'text-white',
        icon: <CheckIcon className="w-5 h-5" />
    },
};

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
    const { removeNotification } = useContext(NotificationContext);
    const classes = typeClasses[notification.type];

    return (
        <div
            className={`flex items-center p-3 rounded-lg shadow-lg animate-fade-in-down ${classes.bg} ${classes.text}`}
        >
            <div className="flex-shrink-0 mr-3">{classes.icon}</div>
            <div className="flex-1 font-medium">{notification.message}</div>
            <button onClick={() => removeNotification(notification.id)} aria-label="Dismiss notification" className="ml-4 p-1 rounded-full hover:bg-white/20">
                <XIcon className="w-4 h-4" />
            </button>
        </div>
    );
};


const NotificationContainer: React.FC = () => {
    const { notifications } = useContext(NotificationContext);

    return (
        <div role="status" aria-live="polite" aria-atomic="true" className="fixed top-5 right-5 z-50 space-y-3 w-80">
            {notifications.map(n => (
                <NotificationItem key={n.id} notification={n} />
            ))}
        </div>
    );
};

export default NotificationContainer;