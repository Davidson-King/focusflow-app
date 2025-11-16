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
            const registerSW = () => {
                const swUrl = `${window.location.origin}/sw.js`;
                navigator.serviceWorker.register(swUrl).then(registration => {
                    let refreshing = false;
                    navigator.serviceWorker.addEventListener('controllerchange', () => {
                        if (refreshing) return;
                        window.location.reload();
                        refreshing = true;
                    });

                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    setWaitingWorker(newWorker);
                                    setIsUpdateAvailable(true);
                                }
                            });
                        }
                    });

                    if (registration.waiting) {
                        setWaitingWorker(registration.waiting);
                        setIsUpdateAvailable(true);
                    }
                }).catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
            };

            window.addEventListener('load', registerSW);

            return () => {
                window.removeEventListener('load', registerSW);
            };
        }
    }, []);

    const updateAssets = useCallback(() => {
        if (waitingWorker) {
            waitingWorker.postMessage({ type: 'SKIP_WAITING' });
        }
    }, [waitingWorker]);

    return (
        <ServiceWorkerContext.Provider value={{ isUpdateAvailable, updateAssets }}>
            {children}
        </ServiceWorkerContext.Provider>
    );
};
