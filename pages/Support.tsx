import React, { useState } from 'react';
import { InstagramIcon, ShareIcon, HeartIcon } from '../components/Icons.tsx';
import { Link } from 'react-router-dom';
import { useNotifier } from '../contexts/NotificationContext.tsx';

const AppPreviews: React.FC = () => (
    <div className="grid grid-cols-2 gap-2 my-4 max-w-[200px] mx-auto">
        {/* Desktop Preview */}
        <div className="aspect-[4/3] bg-dark-bg rounded p-1 border border-dark-border shadow-md">
            <div className="flex items-center gap-0.5 mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-dark-text-secondary"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-dark-text-secondary"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-dark-text-secondary"></div>
            </div>
            <div className="bg-dark-card h-[calc(100%-0.625rem)] rounded-sm flex">
                <div className="w-1/3 bg-dark-border/50 h-full rounded-l-sm"></div>
                <div className="w-2/3 p-1">
                    <div className="w-3/4 h-1 bg-primary rounded-full mb-1"></div>
                    <div className="w-1/2 h-1 bg-dark-border rounded-full"></div>
                </div>
            </div>
        </div>
        {/* Mobile Preview */}
        <div className="aspect-[9/16] bg-dark-bg rounded p-1 border border-dark-border shadow-md">
             <div className="w-1/2 h-1 mx-auto rounded-full bg-dark-text-secondary mb-1"></div>
             <div className="bg-dark-card h-[calc(100%-0.5rem)] rounded-sm p-1">
                 <div className="w-full h-2 bg-primary rounded-full mb-1"></div>
                 <div className="w-3/4 h-1 bg-dark-border rounded-full mb-0.5"></div>
                 <div className="w-3/4 h-1 bg-dark-border rounded-full"></div>
             </div>
        </div>
    </div>
);

const SupportCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    children: React.ReactNode;
}> = ({ icon, title, description, children }) => (
    <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl flex flex-col items-center text-center">
        <div className="text-primary mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-dark-text-secondary mb-6 flex-grow">{description}</p>
        {children}
    </div>
);

const Support: React.FC = () => {
    const { addNotification } = useNotifier();
    const [copyText, setCopyText] = useState('Copy Story Message');

    const shareText = encodeURIComponent("I've been boosting my productivity with FocusFlow, the free, offline-first app that keeps my data private. Finally, a tool that helps me focus without distractions. You should check it out! #productivity #focus #privacy");
    const appUrl = "https://focusflowlab.netlify.app";
    const shareUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(appUrl)}`;
    
    const instagramMessage = `Loving FocusFlow for staying organized! It's a free, private, and offline-first productivity app. Highly recommend! #focusflow #productivity #privacyfirst`;

    const handleCopy = () => {
        navigator.clipboard.writeText(instagramMessage).then(() => {
            setCopyText('Copied to Clipboard!');
            addNotification('Message copied!', 'success');
            setTimeout(() => setCopyText('Copy Story Message'), 3000);
        }).catch(err => {
            console.error("Failed to copy text: ", err);
            addNotification('Could not copy message.', 'error');
        });
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2 text-center">Support FocusFlow</h1>
            <p className="text-dark-text-secondary mb-8 text-center">
                FocusFlow is a free, passion-driven project. If you find it useful, here are some ways you can support its development and help the community grow.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
                 <SupportCard
                    icon={<InstagramIcon className="w-16 h-16 text-pink-500" />}
                    title="Share on Instagram"
                    description="Help spread the word by sharing a post or story with your followers. We've prepared a message for you to copy!"
                >
                    <div className="w-full">
                         <button
                            onClick={handleCopy}
                            className="w-full bg-dark-border text-white font-semibold py-3 px-4 rounded-lg hover:bg-opacity-80 transition-colors"
                        >
                            {copyText}
                        </button>
                    </div>
                </SupportCard>

                <SupportCard
                    icon={<ShareIcon className="w-16 h-16 text-primary" />}
                    title="Share the App"
                    description="Word-of-mouth is the best way to help FocusFlow grow. Share it with a friend or colleague who might benefit from a private, focused workspace."
                >
                    <AppPreviews />
                     <a
                        href={shareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary-hover transition-colors"
                    >
                        Share on X (Twitter)
                    </a>
                </SupportCard>
                
                 <SupportCard
                    icon={<HeartIcon className="w-16 h-16 text-pink-500" />}
                    title="Provide Feedback"
                    description="Have an idea for a feature or found a bug? Your feedback is invaluable in making FocusFlow better for everyone."
                >
                     <Link
                        to="/dashboard/contact"
                        className="w-full bg-pink-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors"
                    >
                        Send Feedback
                    </Link>
                </SupportCard>
            </div>
        </div>
    );
};

export default Support;