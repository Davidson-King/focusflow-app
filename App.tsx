import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { NotificationProvider } from './contexts/NotificationContext.tsx';
import { DataProvider } from './contexts/DataContext.tsx';
import { OfflineProvider } from './contexts/OfflineContext.tsx';
import { PWAProvider } from './contexts/PWAContext.tsx';
import { ServiceWorkerProvider } from './contexts/ServiceWorkerContext.tsx';

import ErrorBoundary from './components/ErrorBoundary.tsx';
import NotificationContainer from './components/Notification.tsx';
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
import Milestones from './pages/dashboard/Milestones.tsx';
import Help from './pages/Help.tsx';
import Support from './pages/Support.tsx';
import Settings from './pages/Settings.tsx';
import Contact from './pages/Contact.tsx';
import PrivacyPolicy from './pages/legal/PrivacyPolicy.tsx';
import TermsOfService from './pages/legal/TermsOfService.tsx';
import FAQ from './pages/legal/FAQ.tsx';
import TestRunner from './tests/TestRunner.tsx';
import PublicNotePage from './pages/PublicNotePage.tsx';
import SetupWizard from './pages/SetupWizard.tsx';
import { db } from './services/db.ts';
import WhatsNewModal from './components/WhatsNewModal.tsx';

// Hardcode the version to remove the problematic import
const version = "1.5.0";

const App: React.FC = () => {
    const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null);
    const [showWhatsNew, setShowWhatsNew] = useState(false);

    useEffect(() => {
        const checkSetupAndVersion = async () => {
            const hasOnboarded = await db.get('settings', 'hasSeenOnboarding');
            setIsSetupComplete(!!hasOnboarded);
            
            const lastVersion = await db.get('settings', 'lastVersion');
            if (hasOnboarded && lastVersion !== version) {
                setShowWhatsNew(true);
            }
        };
        checkSetupAndVersion();
    }, []);

    const handleFinishSetup = () => {
        setIsSetupComplete(true);
        db.put('settings', true, 'hasSeenOnboarding');
        db.put('settings', version, 'lastVersion');
    };

    const handleCloseWhatsNew = () => {
        setShowWhatsNew(false);
        db.put('settings', version, 'lastVersion');
    };

    if (isSetupComplete === null) {
        return null; // or a loading spinner
    }

    return (
        <ErrorBoundary>
            <ThemeProvider>
                <NotificationProvider>
                    <AuthProvider>
                        <DataProvider>
                            <OfflineProvider>
                                <PWAProvider>
                                    <ServiceWorkerProvider>
                                        <HashRouter>
                                            <Routes>
                                                {!isSetupComplete ? (
                                                    <>
                                                        <Route path="/" element={<SetupWizard onFinish={handleFinishSetup} />} />
                                                        <Route path="*" element={<Navigate to="/" replace />} />
                                                    </>
                                                ) : (
                                                    <>
                                                        <Route path="/" element={<LandingPage />} />
                                                        <Route path="/public/note/:shareId" element={<PublicNotePage />} />
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
                                                            <Route path="milestones" element={<Milestones />} />
                                                            <Route path="help" element={<Help />} />
                                                            <Route path="support" element={<Support />} />
                                                            <Route path="settings" element={<Settings />} />
                                                            <Route path="contact" element={<Contact />} />
                                                        </Route>
                                                    </>
                                                )}
                                                <Route path="/privacy" element={<PrivacyPolicy />} />
                                                <Route path="/terms" element={<TermsOfService />} />
                                                <Route path="/faq" element={<FAQ />} />
                                                <Route path="/tests" element={<TestRunner />} />
                                            </Routes>
                                        </HashRouter>
                                        <NotificationContainer />
                                        {isSetupComplete && <WhatsNewModal isOpen={showWhatsNew} onClose={handleCloseWhatsNew} version={version} />}
                                    </ServiceWorkerProvider>
                                </PWAProvider>
                            </OfflineProvider>
                        </DataProvider>
                    </AuthProvider>
                </NotificationProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
};

export default App;
