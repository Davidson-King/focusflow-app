import React from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../hooks/useScrollAnimation.ts';
import { 
    CheckCircleIcon, BookOpenIcon, TrophyIcon, CalendarDaysIcon, MapIcon, ShieldCheckIcon, CloudArrowDownIcon, CheckIcon
} from '../components/Icons.tsx';

const FeatureCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
    className?: string;
}> = ({ icon, title, children, className }) => {
    return (
        <div className={`bg-dark-bg border border-dark-border rounded-xl p-6 text-left transition-all duration-300 hover:border-primary hover:shadow-glow ${className}`}>
            <div className="text-primary mb-4">{icon}</div>
            <h4 className="font-semibold text-lg mb-2">{title}</h4>
            <p className="text-dark-text-secondary text-sm">{children}</p>
        </div>
    );
};

const LandingPage: React.FC = () => {
    const heroSectionAnim = useScrollAnimation();
    const pwaSectionAnim = useScrollAnimation();
    const pricingSectionAnim = useScrollAnimation();
    const featuresSectionAnim = useScrollAnimation();

    return (
        <div className="bg-dark-bg text-dark-text overflow-x-hidden">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-10 p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">FocusFlow</h1>
                    <Link to="/dashboard" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors">
                        Open App
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main>
                <section ref={heroSectionAnim.ref as React.RefObject<HTMLDivElement>} className={`scroll-animate ${heroSectionAnim.isVisible ? 'is-visible' : ''} relative h-screen flex items-center justify-center text-center px-4 animated-background`}>
                    <div className="flex flex-col items-center">
                        <h2 className="animate-child text-5xl md:text-7xl font-extrabold leading-tight mb-4">
                            Find Your Flow.
                            <br />
                            <span className="text-primary">Achieve Your Goals.</span>
                        </h2>
                        <p className="animate-child delay-100 max-w-2xl mx-auto text-lg md:text-xl text-dark-text-secondary mb-8">
                            The minimalist, privacy-first productivity dashboard to organize your life. All your data stays on your device.
                        </p>
                        <Link to="/dashboard" className="animate-child delay-200 bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-hover transition-colors shadow-glow">
                            Get Started - It's Free
                        </Link>
                    </div>
                </section>
                
                {/* Features Section */}
                <section ref={featuresSectionAnim.ref as React.RefObject<HTMLDivElement>} className={`scroll-animate ${featuresSectionAnim.isVisible ? 'is-visible' : ''} container mx-auto py-20 px-4`}>
                    <h3 className="animate-child text-4xl font-bold text-center mb-12">All-in-One Productivity Hub</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard icon={<CheckCircleIcon className="w-8 h-8" aria-hidden="true" />} title="Task Management" className="animate-child delay-100">
                            Organize your to-do lists, set priorities, and track progress with a simple and intuitive interface.
                        </FeatureCard>
                        <FeatureCard icon={<BookOpenIcon className="w-8 h-8" aria-hidden="true" />} title="Notes & Journal" className="animate-child delay-200">
                            Capture your thoughts, ideas, and reflections. Your personal knowledge base, always available.
                        </FeatureCard>
                        <FeatureCard icon={<TrophyIcon className="w-8 h-8" aria-hidden="true" />} title="Goal Tracking" className="animate-child delay-300">
                            Define your habits and long-term goals. Visualize your progress and stay motivated.
                        </FeatureCard>
                        <FeatureCard icon={<CalendarDaysIcon className="w-8 h-8" aria-hidden="true" />} title="Calendar View" className="animate-child delay-100">
                            See your tasks and journal entries in a monthly view to plan ahead and reflect on your past achievements.
                        </FeatureCard>
                        <FeatureCard icon={<MapIcon className="w-8 h-8" aria-hidden="true" />} title="Personal Timeline" className="animate-child delay-200">
                            Create custom timelines to visualize project milestones, life events, or personal journeys.
                        </FeatureCard>
                        <FeatureCard icon={<ShieldCheckIcon className="w-8 h-8" aria-hidden="true" />} title="Privacy First" className="animate-child delay-300">
                            Your data is yours. Everything is stored locally on your device. No clouds, no accounts, no tracking.
                        </FeatureCard>
                    </div>
                </section>

                {/* PWA Section */}
                <section ref={pwaSectionAnim.ref as React.RefObject<HTMLDivElement>} className={`scroll-animate ${pwaSectionAnim.isVisible ? 'is-visible' : ''} bg-dark-card py-20 px-4`}>
                    <div className="container mx-auto text-center">
                         <CloudArrowDownIcon className="animate-child w-12 h-12 text-primary mx-auto mb-4" aria-hidden="true" />
                         <h3 className="animate-child delay-100 text-4xl font-bold mb-4">Works Offline, On Any Device</h3>
                         <p className="animate-child delay-200 max-w-2xl mx-auto text-dark-text-secondary">
                             FocusFlow is a Progressive Web App (PWA). Install it to your home screen on your phone, tablet, or desktop for an app-like experience that's always available, even without an internet connection.
                         </p>
                    </div>
                </section>

                {/* Pricing Section */}
                <section ref={pricingSectionAnim.ref as React.RefObject<HTMLDivElement>} className={`scroll-animate ${pricingSectionAnim.isVisible ? 'is-visible' : ''} container mx-auto py-20 px-4 text-center`}>
                    <h3 className="animate-child text-4xl font-bold mb-4">Free During Early Access</h3>
                    <p className="animate-child delay-100 max-w-2xl mx-auto text-dark-text-secondary mb-8">
                        All features are available for free to our early users as we build and refine the app. We'll introduce a fair and simple pricing model in the future to support development.
                    </p>
                    <Link to="/dashboard" className="animate-child delay-200 bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-hover transition-colors shadow-glow">
                        Start Focusing Now
                    </Link>
                </section>
            </main>
            
            {/* Footer */}
            <footer className="border-t border-dark-border py-8 px-4">
                <div className="container mx-auto text-center text-dark-text-secondary text-sm">
                    <p>&copy; {new Date().getFullYear()} FocusFlow. All Rights Reserved.</p>
                    <div className="mt-4 space-x-4">
                        <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-primary">Terms of Service</Link>
                        <Link to="/faq" className="hover:text-primary">FAQ</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;