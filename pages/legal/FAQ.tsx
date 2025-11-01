import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon } from '../../components/Icons.tsx';
import SupportChatbot from '../../components/SupportChatbot.tsx';

interface FAQItemProps {
    question: string;
    children: React.ReactNode;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const answerId = `faq-answer-${question.replace(/\s+/g, '-').toLowerCase()}`;
    return (
        <div className="border-b border-dark-border py-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-controls={answerId}
                className="w-full flex justify-between items-center text-left"
            >
                <h3 className="text-lg font-semibold">{question}</h3>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
                id={answerId}
                hidden={!isOpen}
                className="mt-4 text-dark-text-secondary space-y-4"
            >
                {children}
            </div>
        </div>
    );
};


const FAQ: React.FC = () => {
    return (
        <div className="bg-dark-bg text-dark-text min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto bg-dark-card p-6 sm:p-10 rounded-xl border border-dark-border">
                <Link to="/" className="text-primary hover:underline mb-8 block">&larr; Back to Home</Link>
                <h1 className="text-4xl font-bold mb-6 text-dark-text">Frequently Asked Questions & Support</h1>
                
                <div className="space-y-4">
                    <FAQItem question="Is FocusFlow free?">
                        <p>
                            Yes, FocusFlow is currently free to use with all features enabled. We want to build a great product and community first.
                        </p>
                        <p>
                           In the future, we may introduce a fair pricing model to ensure the sustainable development of the app. We promise to be transparent about any changes and will always strive to keep the core features accessible.
                        </p>
                    </FAQItem>
                     <FAQItem question="Where is my data stored?">
                        <p>
                            Your data is stored exclusively on your device in your browser's IndexedDB. This means it's fast, private, and works completely offline. We, the developers of FocusFlow, do not have access to your data. Your data never leaves your computer.
                        </p>
                    </FAQItem>
                    <FAQItem question="What happens if I clear my browser data?">
                        <p>
                            <strong>Warning:</strong> Since your data is stored locally, clearing your browser's site data for FocusFlow will permanently delete all your tasks, notes, etc. There is no way to recover it unless you have recently exported a backup.
                        </p>
                    </FAQItem>
                     <FAQItem question="How do I back up my data?">
                        <p>
                           You can export all your data as a single JSON file from the Settings page. We recommend doing this periodically. You can also import this file to restore your data on any device. The app will remind you to do this by default.
                        </p>
                    </FAQItem>
                    <FAQItem question="Is there a mobile app?">
                        <p>
                           FocusFlow is a Progressive Web App (PWA). This means you can "install" it to your home screen on any modern phone, tablet, or desktop computer. It will look and feel just like a native app and work offline. Simply look for the "Add to Home Screen" or "Install App" option in your browser's menu.
                        </p>
                    </FAQItem>
                </div>
            </div>
            <SupportChatbot />
        </div>
    );
};

export default FAQ;