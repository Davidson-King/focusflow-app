
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotifier } from '../contexts/NotificationContext.tsx';
import { useOnlineStatus } from '../contexts/OfflineContext.tsx';
import { db } from '../services/db.ts';
import { generateUUID } from '../utils/uuid.ts';
import ButtonSpinner from '../components/ButtonSpinner.tsx';

// IMPORTANT: Replace this with your own Formspree endpoint.
// Create a new form at https://formspree.io/ and paste the endpoint here.
export const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xqabvvzb';

const Contact: React.FC = () => {
    const { addNotification } = useNotifier();
    const isOnline = useOnlineStatus();
    
    const [subject, setSubject] = useState('FocusFlow Feedback');
    const [body, setBody] = useState('');
    const [senderEmail, setSenderEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!body.trim() || isSending) return;

        setIsSending(true);

        const formData = new FormData();
        formData.append('_replyto', senderEmail);
        formData.append('subject', subject);
        formData.append('message', body);

        if (isOnline) {
            try {
                const response = await fetch(FORMSPREE_ENDPOINT, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                if (response.ok) {
                    addNotification('Your feedback has been sent successfully!', 'success');
                    setBody('');
                    setSenderEmail('');
                } else {
                    throw new Error('Failed to send feedback.');
                }
            } catch (error) {
                console.error('Feedback submission error:', error);
                addNotification('Could not send feedback. Please try again later.', 'error');
            } finally {
                setIsSending(false);
            }
        } else {
            // Offline: save to outbox
            try {
                const feedbackItem = {
                    id: generateUUID(),
                    subject,
                    body,
                    createdAt: Date.now()
                };
                await db.put('feedback-outbox', feedbackItem);
                addNotification('You are offline. Your feedback is saved and will be sent when you reconnect.', 'info');
                setBody('');
                setSenderEmail('');
            } catch (error) {
                addNotification('Could not save feedback for offline sending.', 'error');
            } finally {
                setIsSending(false);
            }
        }
    };
    
    return (
        <div className="max-w-2xl mx-auto">
            <Link to="/dashboard/support" className="text-primary hover:underline mb-6 inline-block">&larr; Back to Support</Link>
            <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl">
                <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
                <p className="text-dark-text-secondary mb-6">
                    Have a question, suggestion, or bug report? We'd love to hear from you.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email-address" className="block text-sm font-medium text-dark-text-secondary">Your Email (Optional)</label>
                        <input
                            id="email-address"
                            type="email"
                            name="_replyto"
                            value={senderEmail}
                            onChange={(e) => setSenderEmail(e.target.value)}
                            placeholder="So we can reply to you"
                            className="mt-1 w-full p-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg"
                        />
                    </div>
                    <div>
                        <label htmlFor="email-subject" className="block text-sm font-medium text-dark-text-secondary">Subject</label>
                        <input
                            id="email-subject"
                            type="text"
                            name="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="mt-1 w-full p-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg"
                        />
                    </div>
                    <div>
                        <label htmlFor="email-body" className="block text-sm font-medium text-dark-text-secondary">Message</label>
                        <textarea
                            id="email-body"
                            name="message"
                            rows={8}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Tell us what you think..."
                            required
                            className="mt-1 w-full p-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg resize-y"
                        />
                    </div>
                     <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={!body.trim() || isSending}
                            className="px-6 py-3 rounded-lg font-semibold text-white transition-colors w-40 h-12 flex items-center justify-center bg-primary hover:bg-primary-hover disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                           {isSending ? <ButtonSpinner /> : 'Send Feedback'}
                        </button>
                    </div>
                </form>
                 <p className="text-xs text-center text-dark-text-secondary mt-4">
                    {isOnline ? 'Your message will be sent directly.' : "You're offline. Your message will be sent when you reconnect."}
                </p>
                 <p className="text-xs text-center text-dark-text-secondary mt-2">
                    This form uses <a href="https://formspree.io" target="_blank" rel="noopener noreferrer" className="underline">Formspree</a>. Your message will be sent to our support team.
                </p>
            </div>
        </div>
    );
};

export default Contact;
