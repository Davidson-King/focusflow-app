
import React, { useState, useRef, useEffect } from 'react';
import { XIcon } from './Icons.tsx';
import { chatbotResponses, defaultResponse } from '../constants/chatbotData.ts';

const TypingIndicator: React.FC = () => (
    <div className="flex justify-start">
        <div className="p-2 rounded-lg bg-dark-border">
            <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </div>
);

const initialQuestions = [
    "What is FocusFlow?",
    "How does pricing work?",
    "Where is my data stored?",
    "Is there a mobile app?",
];

const getBotResponse = (userInput: string): string => {
    const lowerCaseInput = userInput.toLowerCase();
    const foundResponse = chatbotResponses.find(pair =>
        pair.keywords.some(keyword => lowerCaseInput.includes(keyword))
    );
    return foundResponse ? foundResponse.response : defaultResponse;
};

const SupportChatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setMessages([{ sender: 'bot', text: "Hello! I'm the FocusFlow support bot. How can I help you today?" }]);
        }
    }, [isOpen]);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || isTyping) return;

        const userMessage = { sender: 'user' as const, text };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);
        
        setTimeout(() => {
            const botResponse = getBotResponse(text);
            setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
            setIsTyping(false);
        }, 1000); // Simulate bot "thinking"
    };


    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(inputValue);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-5 right-5 bg-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-40 hover:bg-primary-hover transition-transform hover:scale-110"
                aria-label="Open support chat"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </button>
        );
    }

    return (
        <div className="fixed bottom-5 right-5 w-[calc(100vw-2.5rem)] sm:w-80 h-[60vh] sm:h-96 bg-dark-card border border-dark-border rounded-xl shadow-2xl flex flex-col z-50 animate-fade-in-up">
            <header className="p-3 flex justify-between items-center bg-dark-bg rounded-t-xl border-b border-dark-border flex-shrink-0">
                <h3 className="font-semibold">FocusFlow Support</h3>
                <button onClick={() => setIsOpen(false)} aria-label="Close support chat" className="p-1 rounded-full hover:bg-dark-border"><XIcon className="w-5 h-5" /></button>
            </header>
            <main className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <p className={`max-w-[80%] p-2 rounded-lg ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-dark-border'}`}>
                            {msg.text}
                        </p>
                    </div>
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
            </main>
            <footer className="p-2 border-t border-dark-border">
                 <div className="flex flex-wrap gap-1 mb-2">
                    {initialQuestions.map(q => (
                        <button key={q} onClick={() => handleSendMessage(q)} className="text-xs bg-dark-border px-2 py-1 rounded-full hover:bg-opacity-70">{q}</button>
                    ))}
                 </div>
                 <form onSubmit={handleFormSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask a question..."
                        className="flex-1 bg-dark-bg border border-dark-border rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                    <button type="submit" className="bg-primary text-white px-3 rounded-lg hover:bg-primary-hover" aria-label="Send message" disabled={isTyping}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                 </form>
            </footer>
        </div>
    );
};

export default SupportChatbot;