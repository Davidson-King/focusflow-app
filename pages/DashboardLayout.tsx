import React, { useState, useContext, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { HomeIcon, CheckCircleIcon, BookOpenIcon, DocumentTextIcon, MapIcon, CalendarIcon, AwardIcon, Cog6ToothIcon, QuestionMarkCircleIcon, HeartIcon, SearchIcon, Bars3Icon, PencilSquareIcon, XIcon, ArrowLeftOnRectangleIcon, ChartBarIcon, CloudArrowDownIcon, RocketLaunchIcon, TrophyIcon } from '../components/Icons.tsx';
import { AuthContext } from '../contexts/AuthContext.tsx';
import GlobalSearchModal from '../components/GlobalSearchModal.tsx';
import BackupReminderModal from '../components/BackupReminderModal.tsx';
import { db } from '../services/db.ts';
import { exportData } from '../utils/data.ts';
import { useNotifier } from '../contexts/NotificationContext.tsx';
import { usePWA } from '../contexts/PWAContext.tsx';
import UpdateNotification from '../components/UpdateNotification.tsx';
import { useMilestoneChecker } from '../hooks/useMilestoneChecker.ts';

const navLinks = [
    { to: 'home', text: 'Home', icon: HomeIcon },
    { to: 'tasks', text: 'Tasks', icon: CheckCircleIcon },
    { to: 'notes', text: 'Notes', icon: BookOpenIcon },
    { to: 'journal', text: 'Journal', icon: DocumentTextIcon },
    { to: 'goals', text: 'Goals', icon: RocketLaunchIcon },
    { to: 'timeline', text: 'Timeline', icon: MapIcon },
    { to: 'calendar', text: 'Calendar', icon: CalendarIcon },
    { to: 'review', text: 'Weekly Review', icon: ChartBarIcon },
    { to: 'achievements', text: 'Achievements', icon: TrophyIcon },
    { to: 'milestones', text: 'Milestones', icon: AwardIcon },
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
    const [showBackupReminder, setShowBackupReminder] = useState(false);
    const { installPromptEvent, isAppInstalled, triggerInstallPrompt } = usePWA();
    const { addNotification } = useNotifier();

    useMilestoneChecker();

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    useEffect(() => {
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
    }, []);
    
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
        setShowBackupReminder(false);
    };

    const handleLogout = () => {
        sessionStorage.setItem('focusflow_manual_logout', 'true');
        window.location.assign('/');
    };

    return (
        <div className="flex h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
            <aside className={`absolute md:relative z-20 md:z-auto h-full w-64 bg-light-card dark:bg-dark-card border-r border-light-border dark:border-dark-border flex-shrink-0 flex flex-col p-4 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 sidebar-scrollbar`}>
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
                            onClick={triggerInstallPrompt}
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
            <BackupReminderModal isOpen={showBackupReminder} onClose={handleRemindLater} onExport={handleBackupNow} />
            <UpdateNotification />
        </div>
    );
};

export default DashboardLayout;
