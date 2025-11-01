import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { XIcon } from './Icons';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previouslyFocusedElement = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        previouslyFocusedElement.current = document.activeElement as HTMLElement;
        document.body.style.overflow = 'hidden';
        
        const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // Set initial focus
        setTimeout(() => firstElement.focus(), 50);

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }

            if (event.key === 'Tab') {
                const isShiftPressed = event.shiftKey;

                if (!isShiftPressed && document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                }

                if (isShiftPressed && document.activeElement === firstElement) {
                    lastElement.focus();
                    event.preventDefault();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
            previouslyFocusedElement.current?.focus();
        };
    }, [isOpen, onClose]);
    
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (e.target === modalRef.current) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div 
            ref={modalRef}
            onClick={handleOverlayClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-lg w-full max-w-md max-h-[90vh] flex flex-col animate-slide-up">
                <div className="flex justify-between items-center p-4 border-b border-light-border dark:border-dark-border">
                    <h2 id="modal-title" className="text-xl font-semibold">{title}</h2>
                    <button onClick={onClose} aria-label="Close modal" className="p-1 rounded-full hover:bg-light-bg dark:hover:bg-dark-border">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;