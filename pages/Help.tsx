import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon, BookOpenIcon } from '../components/Icons.tsx';

interface HelpTopicProps {
    title: string;
    children: React.ReactNode;
}

const HelpTopic: React.FC<HelpTopicProps> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const contentId = `help-content-${title.replace(/\s+/g, '-').toLowerCase()}`;
    return (
        <div className="border-b border-light-border dark:border-dark-border">
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-controls={contentId}
                className="w-full flex justify-between items-center text-left py-4 px-2 hover:bg-light-bg dark:hover:bg-dark-border rounded-md"
            >
                <h3 className="text-lg font-semibold">{title}</h3>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
                id={contentId}
                hidden={!isOpen}
                className="px-2 pb-4 text-dark-text-secondary space-y-3 prose prose-invert prose-sm max-w-none"
            >
                {children}
            </div>
        </div>
    );
};

const Help: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <BookOpenIcon className="w-16 h-16 mx-auto text-primary mb-4" />
                <h1 className="text-4xl font-bold">Help & Guides</h1>
                <p className="text-dark-text-secondary mt-2">
                    Everything you need to know to get the most out of FocusFlow.
                </p>
            </div>

            <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl">
                <HelpTopic title="Getting Started">
                    <p>Welcome to FocusFlow! Here's how to get started:</p>
                    <ul>
                        <li><strong>Onboarding:</strong> If you're a new user, the setup wizard helps you configure your name and basic settings.</li>
                        <li><strong>Installing as an App (PWA):</strong> For a native app-like experience, you can install FocusFlow to your device's home screen. Look for an "Install" or "Add to Home Screen" button in your browser's address bar or menu. This enables full offline functionality.</li>
                    </ul>
                </HelpTopic>

                <HelpTopic title="Tasks">
                    <p>The Tasks module is your central to-do list.</p>
                    <ul>
                        <li><strong>Creating Tasks:</strong> Use the input form at the top to quickly add new tasks. You can assign a due date and priority level.</li>
                        <li><strong>Sub-tasks:</strong> To break down larger tasks, hover over a task and click the reply icon to add a sub-task.</li>
                        <li><strong>Recurring Tasks:</strong> When you set a due date, an option for recurrence (daily, weekly, monthly) appears. When you complete a recurring task, a new one will be automatically created for the next cycle.</li>
                    </ul>
                </HelpTopic>

                <HelpTopic title="Notes & Journal">
                    <p>Capture your thoughts, ideas, and reflections with our powerful editor.</p>
                    <ul>
                        <li><strong>Rich Text Editing:</strong> Use the formatting toolbar (it appears when you select text) to add headings, lists, bold/italic text, links, and more.</li>
                        <li><strong>Folders:</strong> Organize your notes and journal entries by creating folders. You can manage folders and move items between them using the dropdowns in the sidebar and editor.</li>
                        <li><strong>Tags (Notes only):</strong> Add tags to your notes for another layer of organization. You can search by tags in the notes list.</li>
                    </ul>
                </HelpTopic>
                
                <HelpTopic title="Goals & Habits">
                     <p>Define and track what matters most to you.</p>
                    <ul>
                        <li><strong>Daily Habits:</strong> These are recurring actions you want to perform every day. Mark them complete each day to build streaks. You can view your progress in a calendar grid.</li>
                        <li><strong>Long-term Goals:</strong> These are goals with a measurable target (e.g., save $1000, read 12 books). You can update your current progress, and the progress bar will reflect how close you are to your target.</li>
                    </ul>
                </HelpTopic>
                
                <HelpTopic title="Data Management (Important!)">
                    <p>FocusFlow is a <strong>local-first</strong> application. This means your data is private and stored only on your device.</p>
                    <ul>
                        <li><strong>No Cloud Sync:</strong> We do not have a server that stores your data. This is great for privacy but means <strong>you are responsible for backing up your data</strong>.</li>
                        <li><strong>Exporting Data:</strong> Go to <Link to="/dashboard/settings" className="text-primary hover:underline">Settings</Link> and use the "Export Data" feature to save a JSON file of all your information. Do this regularly!</li>
                        <li><strong>Importing Data:</strong> Use the "Import Data" feature to restore from a backup file. This will merge the backup with your existing data, overwriting any items with the same ID.</li>
                    </ul>
                </HelpTopic>
                
                <HelpTopic title="Customization">
                     <p>Make FocusFlow your own.</p>
                    <ul>
                        <li><strong>Themes:</strong> In <Link to="/dashboard/settings" className="text-primary hover:underline">Settings</Link>, you can switch between light and dark mode, and choose from several color themes to personalize the look.</li>
                        <li><strong>Dashboard Layout:</strong> On the <Link to="/dashboard/home" className="text-primary hover:underline">Home</Link> screen, click "Edit Layout" in the top header. You can then drag and drop widgets to reorder them or use the eye icon to hide/show them.</li>
                    </ul>
                </HelpTopic>

                <div className="text-center mt-6">
                    <p>Still have questions? Visit our <Link to="/faq" className="text-primary hover:underline">FAQ page</Link> or <Link to="/dashboard/contact" className="text-primary hover:underline">contact us</Link>.</p>
                </div>
            </div>
        </div>
    );
};

export default Help;