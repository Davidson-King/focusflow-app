import React from 'react';
import { useServiceWorker } from '../contexts/ServiceWorkerContext.tsx';
import { ArrowPathIcon } from './Icons.tsx';

const UpdateNotification: React.FC = () => {
    const { isUpdateAvailable, updateAssets } = useServiceWorker();

    if (!isUpdateAvailable) {
        return null;
    }

    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
        >
            <div className="bg-dark-card border border-primary-glow rounded-lg shadow-lg p-4 flex items-center justify-between animate-fade-in-up">
                <div>
                    <p className="font-semibold text-dark-text">Update Available</p>
                    <p className="text-sm text-dark-text-secondary">A new version of FocusFlow is ready.</p>
                </div>
                <button
                    onClick={updateAssets}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover"
                >
                    <ArrowPathIcon className="w-4 h-4" />
                    <span>Refresh</span>
                </button>
            </div>
        </div>
    );
};

export default UpdateNotification;
