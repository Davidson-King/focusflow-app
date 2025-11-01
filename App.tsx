
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { NotificationProvider } from './contexts/NotificationContext.tsx';
import { DataProvider } from './contexts/DataContext.tsx';
import { OfflineProvider } from './contexts/OfflineContext.tsx';

import LandingPage from './pages/LandingPage.tsx';
import DashboardLayout from './pages/DashboardLayout.tsx';
import Home from './pages/dashboard/Home.tsx';
import Tasks from './pages/dashboard/Tasks.tsx';
import Notes from './pages/dashboard/Notes.tsx';
import Journal from './pages/dashboard/Journal.tsx';
import Goals from './pages/dashboard/Goals.tsx';
import Timeline from './pages/dashboard/Timeline.tsx';
import Calendar from './pages/dashboard/Calendar.tsx';
import WeeklyReview from './pages/dashboard/WeeklyReview.tsx';
import Achievements from './pages/dashboard/Achievements.tsx';
import Settings from './pages/Settings.tsx';
import Help from './pages/Help.tsx';
import Support from './pages/Support.tsx';
import Contact from './pages/Contact.tsx';
import PrivacyPolicy from './pages/legal/PrivacyPolicy.tsx';
import TermsOfService from './pages/legal/TermsOfService.tsx';
import FAQ from './pages/legal/FAQ.tsx';
import TestRunner from './tests/TestRunner.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import SetupWizard from './pages/SetupWizard.tsx';
import { db } from './services/db.ts';

const App: React.FC = () => {
    const [showSetupWizard, setShowSetupWizard] = useState<boolean | null>(null);

    useEffect(() => {
        // Check if the user was just logged out to prevent setup from re-showing.
        const justLoggedOut = sessionStorage.getItem('focusflow_manual_logout') === 'true';

        const checkSetupStatus = async () => {
            if (justLoggedOut) {
                sessionStorage.removeItem('focusflow_manual_logout');
                setShowSetupWizard(false); // We know they've done setup.
                return;
            }

            // Standard check for first-time users.
            const hasSeenSetup = await db.get('settings', 'hasCompletedSetup');
            setShowSetupWizard(!hasSeenSetup);
        };
        checkSetupStatus();
    }, []);
    
    const handleFinishSetup = async () => {
        await db.put('settings', true, 'hasCompletedSetup');
        setShowSetupWizard(false);
    };

    if (showSetupWizard === null) {
        // You can return a loading spinner here while checking setup status
        return <div className="splash-screen-active"></div>;
    }

    if (showSetupWizard) {
        return (
            <ThemeProvider>
                <NotificationProvider>
                    <AuthProvider>
                        <HashRouter>
                            <Routes>
                                <Route path="/terms" element={<TermsOfService />} />
                                <Route path="/privacy" element={<PrivacyPolicy />} />
                                <Route path="*" element={<SetupWizard onFinish={handleFinishSetup} />} />
                            </Routes>
                        </HashRouter>
                    </AuthProvider>
                </NotificationProvider>
            </ThemeProvider>
        );
    }

    return (
        <ErrorBoundary>
            <ThemeProvider>
                <NotificationProvider>
                    <DataProvider>
                        <AuthProvider>
                            <OfflineProvider>
                                <HashRouter>
                                    <Routes>
                                        <Route path="/" element={<LandingPage />} />
                                        <Route path="/privacy" element={<PrivacyPolicy />} />
                                        <Route path="/terms" element={<TermsOfService />} />
                                        <Route path="/faq" element={<FAQ />} />
                                        <Route path="/dashboard" element={<DashboardLayout />}>
                                            <Route index element={<Navigate to="home" replace />} />
                                            <Route path="home" element={<Home />} />
                                            <Route path="tasks" element={<Tasks />} />
                                            <Route path="notes" element={<Notes />} />
                                            <Route path="journal" element={<Journal />} />
                                            <Route path="goals" element={<Goals />} />
                                            <Route path="timeline" element={<Timeline />} />
                                            <Route path="calendar" element={<Calendar />} />
                                            <Route path="review" element={<WeeklyReview />} />
                                            <Route path="achievements" element={<Achievements />} />
                                            <Route path="settings" element={<Settings />} />
                                            <Route path="help" element={<Help />} />
                                            <Route path="support" element={<Support />} />
                                            <Route path="contact" element={<Contact />} />
                                        </Route>
                                        <Route path="/tests" element={<TestRunner />} />
                                        <Route path="*" element={<Navigate to="/" />} />
                                    </Routes>
                                </HashRouter>
                            </OfflineProvider>
                        </AuthProvider>
                    </DataProvider>
                </NotificationProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
};

export default App;
