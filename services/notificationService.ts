import type { Task } from '../types';

const isSupported = () => 'Notification' in window && 'serviceWorker' in navigator;

const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported()) {
        console.warn('Notifications not supported in this browser.');
        return 'denied';
    }
    return await Notification.requestPermission();
};

const scheduleTaskNotification = async (task: Task): Promise<void> => {
    // Time-based notifications have been removed as per user request.
    // This function is kept as a no-op placeholder for potential future notification types.
    return Promise.resolve();
};

const cancelTaskNotification = async (taskId: string): Promise<void> => {
    // Time-based notifications have been removed as per user request.
    // This function is kept as a no-op placeholder.
    return Promise.resolve();
};

export const notificationService = {
    isSupported,
    requestPermission,
    scheduleTaskNotification,
    cancelTaskNotification,
};