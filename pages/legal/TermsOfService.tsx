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

const TermsOfService: React.FC = () => {
    return (
        <div className="bg-dark-bg text-dark-text min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto bg-dark-card p-6 sm:p-10 rounded-xl border border-dark-border">
                <Link to="/dashboard" className="text-primary hover:underline mb-8 block">&larr; Back to App</Link>
                <h1 className="text-4xl font-bold mb-6 text-dark-text">Terms of Service</h1>
                <p className="text-dark-text-secondary mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                <p className="mb-8">
                    These Terms of Service ("Terms") govern your access to and use of the FocusFlow application and its related services (collectively, the "Service"). Please read these Terms carefully. By accessing or using the Service, you agree to be bound by these Terms and our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                </p>

                <LegalSection title="1. The Service">
                    <p>
                        FocusFlow is a "local-first" productivity application designed to help you manage tasks, notes, and other personal data. "Local-first" means that your data ("User Content") is stored primarily on your own device's browser storage (IndexedDB). The Service is designed to work offline and does not require an account or an active internet connection for its core functionality.
                    </p>
                </LegalSection>

                <LegalSection title="2. User Content and Data Responsibility">
                    <p>
                        <strong>You retain full ownership of your User Content.</strong> We do not have access to, transmit, copy, or store your User Content on our servers. You are granting us a limited license solely to store this data on your local device as part of the Service's functionality.
                    </p>
                     <p>
                        <strong>You are solely responsible for the accuracy, legality, and maintenance of your User Content.</strong> This includes creating and storing regular backups to prevent data loss. The Service provides an "Export Data" feature for this purpose. We are not responsible for any loss, corruption, or deletion of your User Content that may result from clearing your browser data, device failure, or any other cause.
                    </p>
                </LegalSection>
                
                <LegalSection title="3. Fees and Payment">
                    <p>
                        <strong>Early Access Period:</strong> The Service is currently provided free of charge during an "Early Access Period." We appreciate your support and feedback during this phase.
                    </p>
                    <p>
                        <strong>Future Pricing:</strong> We reserve the right, at our sole discretion, to introduce fees for the use of the Service or for certain premium features in the future. We will provide you with at least 30 days' advance notice of any such pricing changes. Your continued use of the Service or features after the fees become effective constitutes your agreement to pay the new fees.
                    </p>
                </LegalSection>
                
                <LegalSection title="4. License to Use the Service">
                     <p>
                        Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, and revocable license to access and use the Service for your personal, non-commercial use.
                    </p>
                </LegalSection>
                
                <LegalSection title="5. Prohibited Activities">
                    <p>
                        You agree not to engage in any of the following prohibited activities: (i) copying, distributing, or disclosing any part of the Service in any medium; (ii) using any automated system, including "robots," "spiders," "offline readers," etc., to access the Service; (iii) attempting to interfere with, compromise the system integrity or security of, or decipher any transmissions to or from the servers running the Service (even though core data is local); (iv) taking any action that imposes an unreasonable load on our infrastructure; (v) attempting to reverse engineer, decompile, or otherwise discover the source code of the Service.
                    </p>
                </LegalSection>

                <LegalSection title="6. Termination">
                    <p>
                        You may stop using the Service at any time. We may permanently or temporarily terminate or suspend your access to the Service without notice and liability for any reason, including if in our sole determination you violate any provision of these Terms.
                    </p>
                </LegalSection>

                <LegalSection title="7. Disclaimer of Warranties">
                    <p>
                        THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. YOUR USE OF THE SERVICE IS AT YOUR OWN RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, THE SERVICE IS PROVIDED WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
                    </p>
                </LegalSection>
                
                <LegalSection title="8. Limitation of Liability">
                    <p>
                        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL FOCUSFLOW, ITS AFFILIATES, AGENTS, DIRECTORS, OR EMPLOYEES BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO THE USE OF, OR INABILITY TO USE, THE SERVICE.
                    </p>
                </LegalSection>

                <LegalSection title="9. General Provisions">
                    <p>
                        <strong>Changes to Terms:</strong> We reserve the right to modify these Terms at any time. We will provide notice of material changes by updating the "Last updated" date. By continuing to use the Service after changes become effective, you agree to be bound by the revised Terms.
                    </p>
                    <p>
                        <strong>Governing Law:</strong> These Terms shall be governed by the laws of the jurisdiction in which the company is based, without respect to its conflict of laws principles.
                    </p>
                     <p>
                        <strong>Entire Agreement:</strong> These Terms, together with the Privacy Policy, constitute the entire agreement between you and FocusFlow regarding the Service and supersede all prior agreements.
                    </p>
                </LegalSection>

                <LegalSection title="10. Contact Us">
                     <p>
                        If you have any questions about these Terms, please contact us at: <a href="mailto:hq.focusflow@gmail.com" className="text-primary hover:underline">hq.focusflow@gmail.com</a>.
                    </p>
                </LegalSection>
            </div>
        </div>
    );
};

export default TermsOfService;