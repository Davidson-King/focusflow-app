import React from 'react';
import { Link } from 'react-router-dom';

const LegalSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-3 text-dark-text">{title}</h2>
        <div className="space-y-4 text-dark-text-secondary leading-relaxed">
            {children}
        </div>
    </div>
);

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="bg-dark-bg text-dark-text min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto bg-dark-card p-6 sm:p-10 rounded-xl border border-dark-border">
                <Link to="/dashboard" className="text-primary hover:underline mb-8 block">&larr; Back to App</Link>
                <h1 className="text-4xl font-bold mb-6 text-dark-text">Privacy Policy</h1>
                <p className="text-dark-text-secondary mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                <LegalSection title="1. Our Commitment to Your Privacy">
                    <p>
                        Welcome to FocusFlow ("we," "us," or "our"). This Privacy Policy explains how we handle information in relation to your use of our application, FocusFlow (the "Service").
                    </p>
                    <p>
                        Our philosophy is simple: <strong>your data is yours</strong>. The Service is designed to be a private, local-first application. We do not require an account, and we collect the absolute minimum data required to improve our Service, always with transparency.
                    </p>
                </LegalSection>
                
                <LegalSection title="2. Information We Collect">
                    <h3 className="text-lg font-semibold text-dark-text mt-4">A. Your User Content (Not Collected by Us)</h3>
                    <p>
                        All of your personal and productivity data, including but not limited to your tasks, notes, journal entries, goals, and timelines ("User Content"), is stored directly and exclusively on your device using your browser's local storage (IndexedDB).
                    </p>
                     <p>
                        <strong>We do not have access to, transmit, or store your User Content on any servers.</strong> You are in complete control of this data. Because we do not store your User Content, we cannot access, restore, or recover it if you lose it.
                    </p>

                    <h3 className="text-lg font-semibold text-dark-text mt-4">B. Anonymous Usage Analytics</h3>
                    <p>
                        To understand how our Service is used and to make it better, we use a privacy-focused analytics platform, GoatCounter. This service helps us count visitors and see general usage trends without tracking individual users. GoatCounter does not use cookies and does not collect any personal data or personally identifiable information (PII).
                    </p>
                    <p>
                        The anonymous data collected includes:
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Page URLs visited within the app</li>
                        <li>HTTP Referer header</li>
                        <li>Browser and operating system information</li>
                        <li>Screen size</li>
                        <li>Country and region (derived from the IP address, but the IP address itself is not stored)</li>
                    </ul>
                    <p>
                        You can learn more about GoatCounter's commitment to privacy on their <a href="https://www.goatcounter.com/help/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">privacy policy page</a>.
                    </p>

                    <h3 className="text-lg font-semibold text-dark-text mt-4">C. Contact Information</h3>
                    <p>
                        If you choose to contact us for support or feedback (e.g., via our contact form or direct email), we will collect your email address and any other information you voluntarily provide. We use this information solely to respond to your inquiry.
                    </p>
                </LegalSection>

                <LegalSection title="3. How We Use Information">
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>To Provide and Maintain the Service:</strong> We use the local storage capabilities of your browser to run the application offline and store your User Content on your device.</li>
                        <li><strong>To Improve the Service:</strong> Anonymous analytics data helps us identify popular features, understand user needs, diagnose problems, and enhance the user experience.</li>
                        <li><strong>To Respond to You:</strong> If you contact us, we use your provided information solely to communicate with you and provide support.</li>
                    </ul>
                </LegalSection>
                
                <LegalSection title="4. Information Sharing and Disclosure">
                     <p>We do not sell, rent, or share your personal information. Your User Content is never shared because we never have access to it. We may share aggregated and completely anonymous analytics data for marketing or reporting purposes, but this data cannot be used to identify you in any way.</p>
                </LegalSection>

                <LegalSection title="5. Data Security and Retention">
                    <p>
                        <strong>User Content:</strong> The security of your User Content is your responsibility, as it is stored on your personal device. We strongly recommend using the app's export feature to create regular backups. Your data remains on your device until you delete it by clearing your browser's storage for our site.
                    </p>
                    <p>
                        <strong>Other Information:</strong> We retain contact information for as long as necessary to resolve your support query. Anonymous analytics data is managed according to GoatCounter's data retention policies.
                    </p>
                </LegalSection>

                <LegalSection title="6. Your Rights and Choices">
                    <p>
                        You have complete control over your User Content. You have the right to access, modify, export, and delete your data at any time directly within the application.
                    </p>
                </LegalSection>
                
                <LegalSection title="7. Changes to This Privacy Policy">
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
                    </p>
                </LegalSection>

                 <LegalSection title="8. Contact Us">
                    <p>
                        If you have any questions about this Privacy Policy, please contact us through the <Link to="/dashboard/contact" className="text-primary hover:underline">Contact Form</Link> in the app or via email at: <a href="mailto:hq.focusflow@gmail.com" className="text-primary hover:underline">hq.focusflow@gmail.com</a>.
                    </p>
                </LegalSection>
            </div>
        </div>
    );
};

export default PrivacyPolicy;