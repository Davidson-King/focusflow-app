import React from 'react';
import { PlusIcon } from './Icons';

interface EmptyStateProps {
    title: string;
    message: string;
    icon?: React.ReactNode;
    actionText?: string;
    onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, message, icon, actionText, onAction }) => {
    return (
        <div className="text-center p-8 border-2 border-dashed border-light-border dark:border-dark-border rounded-xl">
            {icon && <div className="mx-auto mb-4 text-light-text-secondary dark:text-dark-text-secondary">{icon}</div>}
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">{message}</p>
            {actionText && onAction && (
                <button 
                    onClick={onAction} 
                    className="mt-6 flex items-center justify-center gap-2 mx-auto bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>{actionText}</span>
                </button>
            )}
        </div>
    );
};

export default EmptyState;