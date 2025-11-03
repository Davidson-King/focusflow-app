import React, { createContext, useState, useCallback, PropsWithChildren, useContext, useEffect } from 'react';

interface ServiceWorkerContextType {
  isUpdateAvailable: boolean;
  updateAssets: () => void;
}

export const ServiceWorkerContext = createContext<ServiceWorkerContextType>({
  isUpdateAvailable: false,
  updateAssets: () => {},
});

export const useServiceWorker = () => useContext(ServiceWorkerContext);

export const ServiceWorkerProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
    const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                // This event fires when the service worker controlling the page changes.
                // We use this to reload the page once the new worker has taken over.
                let refreshing = false;
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    if (refreshing) return;
                    window.location.reload();
                    refreshing = true;
                });

                // This event fires when a new service worker is found and starts installing.
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            // When the new worker is installed and waiting to activate,
                            // and there's an active worker, we show the update prompt.
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                setWaitingWorker(newWorker);
                                setIsUpdateAvailable(true);
                            }
                        });
                    }
                });

                // If there's already a waiting worker, we can show the prompt immediately.
                if (registration.waiting) {
                    setWaitingWorker(registration.waiting);
                    setIsUpdateAvailable(true);
                }
            }).catch(error => {
                console.error('Service Worker registration failed:', error);
            });
        }
    }, []);

    const updateAssets = useCallback(() => {
        if (waitingWorker) {
            // Send a message to the waiting service worker to activate itself.
            waitingWorker.postMessage({ type: 'SKIP_WAITING' });
        }
    }, [waitingWorker]);

    return (
        <ServiceWorkerContext.Provider value={{ isUpdateAvailable, updateAssets }}>
            {children}
        </ServiceWorkerContext.Provider>
    );
};
