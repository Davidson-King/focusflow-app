import React, { useState, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.tsx';
import { db } from '../services/db.ts';
import { fileToBase64, resizeImage } from '../utils/image.ts';
import { useNotifier } from '../contexts/NotificationContext.tsx';
import { RocketLaunchIcon, UserIcon, ShieldCheckIcon } from '../components/Icons.tsx';
import ButtonSpinner from '../components/ButtonSpinner.tsx';

const TOTAL_STEPS = 4;

interface SetupWizardProps {
    onFinish: () => void;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ onFinish }) => {
    const { updateUser } = useContext(AuthContext);
    const { addNotification } = useNotifier();

    const [currentStep, setCurrentStep] = useState(1);
    const [isFinishing, setIsFinishing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        ageRange: '',
        useCase: '',
        source: '',
        avatar: null as string | null,
        agreedToTerms: false,
    });
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            addNotification('Image is too large (max 2MB)', 'error');
            return;
        }
        try {
            const base64 = await fileToBase64(file);
            const resized = await resizeImage(base64);
            setFormData(prev => ({ ...prev, avatar: resized }));
        } catch (err) {
            addNotification('Could not process image.', 'error');
        }
    };
    
    const handleNext = () => currentStep < TOTAL_STEPS && setCurrentStep(s => s + 1);
    const handleBack = () => currentStep > 1 && setCurrentStep(s => s - 1);

    const handleFinish = async () => {
        if (!formData.agreedToTerms || isFinishing) return;
        setIsFinishing(true);
        try {
            await updateUser({ name: formData.name || 'FocusFlow User', avatar: formData.avatar || 'DEFAULT' });
            await db.put('settings', formData.ageRange, 'userAgeRange');
            await db.put('settings', formData.useCase, 'userUseCase');
            await db.put('settings', formData.source, 'userSource');
            
            onFinish();

        } catch (error) {
            addNotification('Could not save settings. Please try again.', 'error');
            setIsFinishing(false);
        }
    };

    const isNextDisabled = currentStep === 1 && !formData.name.trim();
    const isFinishDisabled = !formData.agreedToTerms;
    
    const renderStepContent = () => {
        switch (currentStep) {
            case 1: return (
                <>
                    <RocketLaunchIcon className="w-12 h-12 mx-auto text-primary" />
                    <h2 className="text-2xl font-bold">Welcome to FocusFlow!</h2>
                    <p className="text-dark-text-secondary">Let's get your dashboard set up. First, what should we call you?</p>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter your name..." className="w-full p-3 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg text-center text-light-text dark:text-dark-text" autoFocus />
                </>
            );
            case 2: return (
                <>
                     <UserIcon className="w-12 h-12 mx-auto text-primary" />
                    <h2 className="text-2xl font-bold">Tell us a bit about yourself</h2>
                    <p className="text-dark-text-secondary">This is optional and helps us improve the app.</p>
                    <div className="space-y-4 text-left">
                        <label className="block">
                            <span className="text-sm">What's your age range?</span>
                            <select name="ageRange" value={formData.ageRange} onChange={handleInputChange} className="mt-1 w-full p-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg text-light-text dark:text-dark-text">
                                <option value="">Select an option...</option>
                                <option value="under_18">Under 18</option>
                                <option value="18_24">18-24</option>
                                <option value="25_34">25-34</option>
                                <option value="35_44">35-44</option>
                                <option value="45_plus">45+</option>
                            </select>
                        </label>
                        <label className="block">
                            <span className="text-sm">What will you use FocusFlow for?</span>
                            <select name="useCase" value={formData.useCase} onChange={handleInputChange} className="mt-1 w-full p-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg text-light-text dark:text-dark-text">
                                <option value="">Select an option...</option>
                                <option value="work">Work & Professional</option>
                                <option value="school">School & Studies</option>
                                <option value="personal">Personal Projects</option>
                                <option value="journaling">Journaling & Well-being</option>
                                <option value="other">Other</option>
                            </select>
                        </label>
                        <label className="block">
                             <span className="text-sm">How did you hear about us?</span>
                             <select name="source" value={formData.source} onChange={handleInputChange} className="mt-1 w-full p-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg text-light-text dark:text-dark-text">
                                <option value="">Select an option...</option>
                                <option value="social_media">Social Media (X, Instagram, etc.)</option>
                                <option value="friend">Friend / Colleague</option>
                                <option value="search_engine">Search Engine (Google, etc.)</option>
                                <option value="blog_post">Blog Post / Article</option>
                                <option value="other">Other</option>
                            </select>
                        </label>
                    </div>
                </>
            );
            case 3: return (
                <>
                    <UserIcon className="w-12 h-12 mx-auto text-primary" />
                    <h2 className="text-2xl font-bold">Set a Profile Picture</h2>
                    <p className="text-dark-text-secondary">This is optional. You can change it later in Settings.</p>
                    <div className="flex flex-col items-center gap-4">
                        <img src={formData.avatar || '/favicon.svg'} alt="Avatar preview" className="w-24 h-24 rounded-full object-cover bg-dark-bg" />
                        <input type="file" ref={avatarInputRef} onChange={handleAvatarSelect} accept="image/*" className="hidden" />
                        <div className="flex gap-4">
                            <button onClick={() => avatarInputRef.current?.click()} className="px-4 py-2 bg-dark-border rounded-lg">Upload Picture</button>
                             <button onClick={handleNext} className="px-4 py-2 rounded-lg font-semibold hover:bg-light-bg dark:hover:bg-dark-border">Skip for now</button>
                        </div>
                    </div>
                </>
            );
            case 4: return (
                 <>
                    <ShieldCheckIcon className="w-12 h-12 mx-auto text-primary" />
                    <h2 className="text-2xl font-bold">One Last Step</h2>
                    <p className="text-dark-text-secondary">Please review and agree to our terms to continue.</p>
                    <div className="flex items-start gap-3 p-3 text-left">
                        <input type="checkbox" id="terms" checked={formData.agreedToTerms} onChange={e => setFormData(p => ({...p, agreedToTerms: e.target.checked}))} className="mt-1 w-5 h-5 rounded text-primary bg-dark-border border-dark-border focus:ring-primary focus:ring-2 shrink-0" />
                        <label htmlFor="terms" className="text-sm">
                            I have read and agree to the <Link to="/terms" target="_blank" className="text-primary underline">Terms of Service</Link> and <Link to="/privacy" target="_blank" className="text-primary underline">Privacy Policy</Link>.
                        </label>
                    </div>
                </>
            );
            default: return null;
        }
    }

    return (
        <div className="fixed inset-0 bg-dark-bg flex items-center justify-center p-4">
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-lg w-full max-w-md text-center p-8 space-y-6">
                
                <div className="flex justify-center gap-2">
                    {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
                        <div key={index} className={`w-1/4 h-1.5 rounded-full transition-colors ${currentStep > index ? 'bg-primary' : 'bg-light-border dark:bg-dark-border'}`}></div>
                    ))}
                </div>

                <div className="min-h-[280px] flex flex-col justify-center space-y-4">
                    {renderStepContent()}
                </div>

                <div className="flex justify-between items-center pt-4">
                    <button onClick={handleBack} className={`px-4 py-2 rounded-lg font-semibold hover:bg-light-bg dark:hover:bg-dark-border ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}>Back</button>

                    {currentStep < TOTAL_STEPS ? (
                        <button onClick={handleNext} disabled={isNextDisabled} className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover disabled:opacity-50">Next</button>
                    ) : (
                        <button onClick={handleFinish} disabled={isFinishDisabled || isFinishing} className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover disabled:opacity-50 w-32 h-10 flex justify-center items-center">
                            {isFinishing ? <ButtonSpinner /> : 'Finish Setup'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SetupWizard;
