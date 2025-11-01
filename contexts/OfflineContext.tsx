import React, { createContext, PropsWithChildren, useContext, useEffect, useRef } from 'react';
import { useOnlineStatus as useOnlineStatusHook } from '../hooks/useOnlineStatus';
import { db } from '../services/db';
import { useNotifier } from './NotificationContext';
import { FeedbackOutboxItem } from '../types';
import { FORMSPREE_ENDPOINT } from '../pages/Contact';

const OnlineStatusContext = createContext<boolean>(true);

// Function to send a single feedback item
const sendFeedback = async (item: FeedbackOutboxItem) => {
    const formData = new FormData();
    formData.append('subject', item.subject);
    formData.append('message', item.body);

    const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
};

export const OfflineProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    const isOnline = useOnlineStatusHook();
    const { addNotification } = useNotifier();
    const prevOnlineStatus = useRef(isOnline);

    useEffect(() => {
        const processOutbox = async () => {
            try {
                const outboxItems = await db.getAll('feedback-outbox') as FeedbackOutboxItem[];
                if (outboxItems.length === 0) return;

                const sendPromises = outboxItems.map(async (item) => {
                    await sendFeedback(item);
                    await db.delete('feedback-outbox', item.id);
                });
                
                await Promise.all(sendPromises);

                if (outboxItems.length > 0) {
                    addNotification(`Successfully sent ${outboxItems.length} message(s) from your outbox.`, 'success');
                }
            } catch (error) {
                console.error('Failed to process feedback outbox:', error);
                addNotification('Could not send some messages from your outbox. Will try again later.', 'error');
            }
        };

        // If we just came online, process the outbox
        if (isOnline && !prevOnlineStatus.current) {
            processOutbox();
        }

        prevOnlineStatus.current = isOnline;

    }, [isOnline, addNotification]);


    return (
        <OnlineStatusContext.Provider value={isOnline}>
            {children}
        </OnlineStatusContext.Provider>
    );
};

export const useOnlineStatus = () => {
    return useContext(OnlineStatusContext);
};
