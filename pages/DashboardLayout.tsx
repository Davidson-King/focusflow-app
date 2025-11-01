
import React, { useState, useContext, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { HomeIcon, CheckCircleIcon, BookOpenIcon, DocumentTextIcon, TrophyIcon, MapIcon, CalendarIcon, AwardIcon, Cog6ToothIcon, QuestionMarkCircleIcon, HeartIcon, SearchIcon, Bars3Icon, PencilSquareIcon, XIcon, ArrowLeftOnRectangleIcon, ChartBarIcon, CloudArrowDownIcon } from '../components/Icons.tsx';
import { AuthContext } from '../contexts/AuthContext.tsx';
import GlobalSearchModal from '../components/GlobalSearchModal.tsx';
import OnboardingModal from '../components/OnboardingModal.tsx';
import BackupReminderModal from '../components/BackupReminderModal.tsx';
import { db } from '../services/db.ts';
import { exportData } from '../utils/data.ts';
import { useNotifier } from '../contexts/NotificationContext.tsx';

const navLinks = [
    { to: 'home', text: 'Home', icon: HomeIcon },
    { to: 'tasks', text: 'Tasks', icon: CheckCircleIcon },
    { to: 'notes', text: 'Notes', icon: BookOpenIcon },
    { to: 'journal', text: 'Journal', icon: DocumentTextIcon },
    { to: 'goals', text: 'Goals', icon: TrophyIcon },
    { to: 'timeline', text: 'Timeline', icon: MapIcon },
    { to: 'calendar', text: 'Calendar', icon: CalendarIcon },
    { to: 'review', text: 'Weekly Review', icon: ChartBarIcon },
    { to: 'achievements', text: 'Achievements', icon: AwardIcon },
];

const bottomLinks = [
    { to: 'help', text: 'Help & Guides', icon: QuestionMarkCircleIcon },
    { to: 'support', text: 'Support Us', icon: HeartIcon },
    { to: 'settings', text: 'Settings', icon: Cog6ToothIcon },
]

const NavItem: React.FC<{ to: string, text: string, icon: React.FC<any> }> = ({ to, text, icon: Icon }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-light-bg dark:hover:bg-dark-border'
            }`
        }
    >
        <Icon className="w-5 h-5" />
        <span>{text}</span>
    </NavLink>
);

const DashboardLayout: React.FC = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isEditLayout, setIsEditLayout] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showBackupReminder, setShowBackupReminder] = useState(false);
    const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
    const [isAppInstalled, setIsAppInstalled] = useState(false);
    const { addNotification } = useNotifier();

    useEffect(() => {
        setIsSidebarOpen(false); // Close sidebar on navigation
    }, [location.pathname]);

    useEffect(() => {
        // Check for onboarding status
        const checkOnboarding = async () => {
            const hasOnboarded = await db.get('settings', 'hasSeenOnboarding');
            if (!hasOnboarded) {
                setShowOnboarding(true);
            }
        };
        checkOnboarding();

        // Check for backup reminder
        const checkBackupReminder = async () => {
            const reminderFreq = await db.get('settings', 'exportReminderFrequency') ?? 30;
            if (reminderFreq === 0) return;

            const lastExport = await db.get('settings', 'lastExportDate') ?? 0;
            const daysSinceExport = (Date.now() - lastExport) / (1000 * 3600 * 24);
            
            if (daysSinceExport > reminderFreq) {
                setShowBackupReminder(true);
            }
        };
        checkBackupReminder();
        
        // PWA Install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPromptEvent(e);
        };
        const handleAppInstalled = () => {
            setInstallPromptEvent(null);
            setIsAppInstalled(true);
        };

        if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
            setIsAppInstalled(true);
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };

    }, []);
    
    const handleInstallClick = () => {
        if (installPromptEvent && installPromptEvent.prompt) {
            installPromptEvent.prompt();
            installPromptEvent.userChoice.then((choiceResult: { outcome: string }) => {
                if (choiceResult.outcome === 'accepted') {
                    addNotification('FocusFlow installed successfully!', 'success');
                }
                setInstallPromptEvent(null);
            });
        }
    };

    const handleOnboardingClose = async () => {
        await db.put('settings', true, 'hasSeenOnboarding');
        setShowOnboarding(false);
    };
    
    const handleBackupNow = async () => {
        const success = await exportData();
        if(success) {
            addNotification("Backup successful!", "success");
            setShowBackupReminder(false);
        } else {
            addNotification("Backup failed. Please try again.", "error");
        }
    };

    const handleRemindLater = async () => {
        // For simplicity, just close it. A more robust solution might snooze it.
        setShowBackupReminder(false);
    };

    const handleLogout = () => {
        // Set a flag in session storage to indicate a deliberate logout.
        // This helps the app distinguish a logout-reload from a first-time visit.
        sessionStorage.setItem('focusflow_manual_logout', 'true');
        // Full page reload to the landing page.
        window.location.assign('/');
    };

    return (
        <div className="flex h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
            {/* Sidebar */}
            <aside className={`absolute md:relative z-20 md:z-auto h-full w-64 bg-light-card dark:bg-dark-card border-r border-light-border dark:border-dark-border flex-shrink-0 flex flex-col p-4 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="flex justify-between items-center mb-6">
                     <h1 className="text-2xl font-bold text-primary">FocusFlow</h1>
                     <button className="md:hidden p-1" onClick={() => setIsSidebarOpen(false)}><XIcon className="w-6 h-6"/></button>
                </div>
               
                <nav className="flex-grow space-y-1 overflow-y-auto">
                    {navLinks.map(link => <NavItem key={link.to} {...link} />)}
                </nav>

                 {!isAppInstalled && installPromptEvent && (
                    <div className="my-2">
                        <button
                            onClick={handleInstallClick}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/20 text-primary font-semibold hover:bg-primary/30 transition-colors"
                        >
                            <CloudArrowDownIcon className="w-5 h-5" />
                            <span>Install App</span>
                        </button>
                    </div>
                )}

                <div className="flex-shrink-0 space-y-1 mt-4">
                    {bottomLinks.map(link => <NavItem key={link.to} {...link} />)}
                    <div className="pt-2 border-t border-dark-border">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-light-bg dark:hover:bg-dark-border"
                        >
                            <ArrowLeftOnRectangleIcon className="w-5 h-5"/>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="flex-shrink-0 bg-light-card dark:bg-dark-card border-b border-light-border dark:border-dark-border p-4 flex justify-between items-center">
                    <button className="md:hidden p-1" onClick={() => setIsSidebarOpen(true)}>
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <div className="flex-1 flex justify-end items-center gap-4">
                        {location.pathname === '/dashboard/home' && (
                            <button onClick={() => setIsEditLayout(prev => !prev)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-light-bg dark:bg-dark-border text-sm font-semibold">
                                <PencilSquareIcon className="w-4 h-4" />
                                <span>{isEditLayout ? 'Done Editing' : 'Edit Layout'}</span>
                            </button>
                        )}
                        <button onClick={() => setIsSearchOpen(true)} aria-label="Open search" className="p-2 rounded-full hover:bg-light-bg dark:hover:bg-dark-border">
                            <SearchIcon className="w-5 h-5" />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-dark-bg">
                            <img src={user?.avatar} alt="User avatar" className="w-full h-full object-cover rounded-full" />
                        </div>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-6">
                    <Outlet context={{ isEditLayout }} />
                </div>
            </main>
            <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
            <OnboardingModal isOpen={showOnboarding} onClose={handleOnboardingClose} />
            <BackupReminderModal isOpen={showBackupReminder} onClose={handleRemindLater} onExport={handleBackupNow} />
        </div>
    );
};

export default DashboardLayout;
