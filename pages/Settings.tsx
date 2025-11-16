import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ThemeContext } from '../contexts/ThemeContext.tsx';
import { AuthContext } from '../contexts/AuthContext.tsx';
import { themes } from '../constants/themes.ts';
import { useNotifier } from '../contexts/NotificationContext.tsx';
import { db } from '../services/db.ts';
import ButtonSpinner from '../components/ButtonSpinner.tsx';
import { SunIcon, MoonIcon, CloudArrowDownIcon, CheckCircleIcon } from '../components/Icons.tsx';
import PreImportWarningModal from '../components/PreImportWarningModal.tsx';
import { fileToBase64, resizeImage } from '../utils/image.ts';
import { useDataVersion } from '../contexts/DataContext.tsx';
import { exportData } from '../utils/data.ts';
import { usePWA } from '../contexts/PWAContext.tsx';

const showImportOverlay = (status: 'importing' | 'reloading' | 'error', message?: string) => {
    let overlay = document.getElementById('import-process-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'import-process-overlay';
        Object.assign(overlay.style, {
            position: 'fixed', inset: '0', backgroundColor: 'rgba(18, 18, 18, 0.95)', zIndex: '99999',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: '#E5E5E7', fontFamily: "'Inter', sans-serif", transition: 'opacity 0.3s ease-in-out', opacity: '0'
        });
        document.body.appendChild(overlay);
        setTimeout(() => overlay!.style.opacity = '1', 10);
    }

    const spinnerHTML = `<div style="width: 48px; height: 48px; border: 5px solid #007AFF; border-bottom-color: transparent; border-radius: 50%; display: inline-block; box-sizing: border-box; animation: splash-rotation 1s linear infinite; margin-top: 20px;"></div>`;
    const styleSheet = document.createElement("style");
    styleSheet.id = "overlay-spinner-style";
    styleSheet.innerText = `@keyframes splash-rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
    if (!document.getElementById('overlay-spinner-style')) {
        document.head.appendChild(styleSheet);
    }
    
    let titleText = '';
    let messageText = '';

    switch(status) {
        case 'importing':
            titleText = 'Importing Data...';
            messageText = 'Please do not close this page.';
            overlay.innerHTML = `<h1 style="font-size: 2rem; font-weight: 700;">${titleText}</h1><p style="margin-top: 1rem;">${messageText}</p>${spinnerHTML}`;
            break;
        case 'reloading':
            titleText = 'Import Successful';
            messageText = 'Reloading application...';
            overlay.innerHTML = `<h1 style="font-size: 2rem; font-weight: 700;">${titleText}</h1><p style="margin-top: 1rem;">${messageText}</p>${spinnerHTML}`;
            break;
        case 'error':
             titleText = 'Import Failed';
             messageText = message || 'The file may be invalid or corrupted.';
             overlay.innerHTML = `<h1 style="font-size: 2rem; font-weight: 700; color: #EF4444;">${titleText}</h1><p style="margin-top: 1rem;">${messageText}</p><button id="close-overlay-btn" style="margin-top: 2rem; padding: 0.75rem 1.5rem; background-color: #007AFF; color: white; border: none; border-radius: 8px; cursor: pointer;">Close</button>`;
             document.getElementById('close-overlay-btn')?.addEventListener('click', () => removeImportOverlay());
             break;
    }
};

const removeImportOverlay = () => {
    const overlay = document.getElementById('import-process-overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
    }
    const styleSheet = document.getElementById('overlay-spinner-style');
    if (styleSheet) {
        styleSheet.remove();
    }
};

const validateBackupData = (data: any): boolean => {
    if (typeof data !== 'object' || data === null) {
        throw new Error("Invalid file format. The backup file should contain a single JSON object.");
    }

    const requiredStores: Record<string, 'array' | 'keyvalue'> = {
        tasks: 'array', notes: 'array', journal: 'array', goals: 'array',
        timelines: 'array', folders: 'array', userProfile: 'keyvalue', settings: 'keyvalue'
    };

    for (const storeName in requiredStores) {
        if (!(storeName in data)) {
            throw new Error(`Corrupted backup file. Missing required data store: '${storeName}'. This does not appear to be a FocusFlow backup.`);
        }
    }

    for (const storeName in data) {
        if (!data.hasOwnProperty(storeName)) continue;
        
        const storeData = data[storeName];
        if (!Array.isArray(storeData)) {
             throw new Error(`Corrupted backup file. Data for '${storeName}' is not in the correct format.`);
        }
        
        if (storeData.length > 0) {
            const item = storeData[0];
            if (typeof item !== 'object' || item === null) {
                throw new Error(`Corrupted backup file. Invalid item found in '${storeName}'.`);
            }

            if (requiredStores[storeName] === 'array' && typeof item.id !== 'string') {
                throw new Error(`Corrupted backup file. An item in '${storeName}' is missing a required 'id'.`);
            }
            
            if (requiredStores[storeName] === 'keyvalue' && typeof item.key === 'undefined') {
                throw new Error(`Corrupted backup file. A key-value item in '${storeName}' is malformed.`);
            }
        }
    }
    
    return true;
}

const Settings: React.FC = () => {
    const { mode, toggleMode, colorTheme, setColorTheme } = useContext(ThemeContext);
    const { user, updateUser } = useContext(AuthContext);
    const { addNotification } = useNotifier();
    const { incrementDataVersion } = useDataVersion();
    const { installPromptEvent, isAppInstalled, triggerInstallPrompt } = usePWA();
    
    const [name, setName] = useState(user?.name || '');
    const [isPreImportModalOpen, setIsPreImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const importInputRef = React.useRef<HTMLInputElement>(null);
    const avatarInputRef = React.useRef<HTMLInputElement>(null);
    const [isSavingName, setIsSavingName] = useState(false);
    const [exportReminderFreq, setExportReminderFreq] = useState(30);

    useEffect(() => {
        if (user) {
            setName(user.name);
        }
        db.get('settings', 'exportReminderFrequency').then(freq => {
            if (freq !== undefined) setExportReminderFreq(freq);
        });
    }, [user]);

    const handleNameUpdate = async () => {
        if (user && name.trim() && name !== user.name) {
            setIsSavingName(true);
            try {
                await updateUser({ name: name.trim() });
                addNotification('Name updated successfully!', 'success');
            } finally {
                setIsSavingName(false);
            }
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const base64 = await fileToBase64(file);
            const resizedBase64 = await resizeImage(base64);
            await updateUser({ avatar: resizedBase64 });
            addNotification('Profile picture updated!', 'success');
        } catch (error) {
            addNotification('Failed to update profile picture.', 'error');
            console.error(error);
        } finally {
            if (e.target) e.target.value = '';
        }
    };

    const handleRemoveAvatar = async () => {
        await updateUser({ avatar: 'DEFAULT' });
        addNotification('Profile picture removed.', 'success');
    };

    const handleExportData = async () => {
        const success = await exportData();
        if (success) {
            addNotification('Data exported successfully.', 'success');
        } else {
            addNotification('Failed to export data. Please try again.', 'error');
        }
    };
    
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setImportFile(file);
        if (file) {
            handleConfirmImport(file);
        }
    };

    const handleProceedToImport = () => {
        setIsPreImportModalOpen(false);
        importInputRef.current?.click();
    };

    const handleConfirmImport = useCallback((file: File) => {
        if (!file) return;
        
        showImportOverlay('importing');
    
        const reader = new FileReader();
    
        reader.onload = async (e) => {
            try {
                if (!e.target?.result) throw new Error("File appears to be empty.");

                let data;
                try {
                    data = JSON.parse(e.target.result as string);
                } catch (jsonError) {
                    throw new Error("Invalid file format. The file is not valid JSON.");
                }

                validateBackupData(data);
                const allStores: ('tasks' | 'notes' | 'journal' | 'goals' | 'timelines' | 'folders' | 'userProfile' | 'settings' | 'milestones' | 'achievements')[] = ['tasks', 'notes', 'journal', 'goals', 'timelines', 'folders', 'userProfile', 'settings', 'milestones', 'achievements'];

                for (const storeName of allStores) {
                    if (data[storeName]) {
                        if (storeName === 'userProfile' || storeName === 'settings') {
                            for (const item of data[storeName]) {
                                await db.put(storeName, item.value, item.key);
                            }
                        } else {
                            await db.putAll(storeName, data[storeName]);
                        }
                    }
                }
                
                showImportOverlay('reloading');
                incrementDataVersion();
                
                setTimeout(() => window.location.reload(), 1500);

            } catch (error: any) {
                console.error("Import failed:", error);
                showImportOverlay('error', error.message);
            } finally {
                setImportFile(null);
                if (importInputRef.current) importInputRef.current.value = '';
            }
        };
        
        reader.onerror = () => showImportOverlay('error', 'Failed to read the file.');
    
        reader.readAsText(file);
    }, [incrementDataVersion]);
    
     const updateReminderFrequency = (freq: number) => {
        setExportReminderFreq(freq);
        db.put('settings', freq, 'exportReminderFrequency');
        addNotification('Backup reminder updated.', 'success');
     }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Settings</h1>
            <div className="space-y-6">

                {/* Profile Section */}
                <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl">
                    <h2 className="text-xl font-semibold mb-4 border-b border-light-border dark:border-dark-border pb-2">Profile</h2>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative group">
                             <img src={user?.avatar} alt="User avatar" className="w-24 h-24 rounded-full object-cover" />
                             <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden"/>
                                <button onClick={() => avatarInputRef.current?.click()} className="text-white text-xs">Change</button>
                             </div>
                        </div>
                        <div className="flex-1 w-full">
                            <label htmlFor="user-name" className="block text-sm font-medium text-dark-text-secondary">Name</label>
                            <div className="mt-1 flex gap-2">
                                <input id="user-name" type="text" value={name} onChange={e => setName(e.target.value)} onBlur={handleNameUpdate} className="flex-1 p-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg" />
                                <button onClick={handleNameUpdate} disabled={isSavingName} className="px-4 py-2 bg-primary text-white rounded-lg w-24 h-10 flex justify-center items-center">
                                    {isSavingName ? <ButtonSpinner/> : 'Save'}
                                </button>
                            </div>
                        </div>
                        {user?.avatar !== '/favicon.svg' && (
                             <button onClick={handleRemoveAvatar} className="text-xs text-red-400 hover:underline">Remove picture</button>
                        )}
                    </div>
                </div>

                {/* Appearance Section */}
                <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl">
                    <h2 className="text-xl font-semibold mb-4 border-b border-light-border dark:border-dark-border pb-2">Appearance</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                             <h3 className="font-medium">Theme</h3>
                             <div className="flex items-center gap-2 p-1 bg-light-bg dark:bg-dark-bg rounded-lg">
                                <button onClick={() => mode === 'dark' && toggleMode()} className={`p-1.5 rounded-md ${mode === 'light' ? 'bg-white shadow' : ''}`}><SunIcon className="w-5 h-5"/></button>
                                <button onClick={() => mode === 'light' && toggleMode()} className={`p-1.5 rounded-md ${mode === 'dark' ? 'bg-dark-border shadow' : ''}`}><MoonIcon className="w-5 h-5"/></button>
                             </div>
                        </div>
                         <div className="flex justify-between items-center">
                             <h3 className="font-medium">Color</h3>
                             <div className="flex items-center gap-2">
                                {themes.map(theme => (
                                    <button key={theme.name} onClick={() => setColorTheme(theme.name)} aria-label={`Select ${theme.displayName} theme`} className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${colorTheme === theme.name ? 'ring-2 ring-offset-2 ring-offset-dark-card ring-primary' : ''}`} style={{backgroundColor: theme.colors.primary}}></button>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>

                {/* Application Section */}
                <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl">
                    <h2 className="text-xl font-semibold mb-2 border-b border-light-border dark:border-dark-border pb-2">Application</h2>
                    <p className="text-sm text-dark-text-secondary mb-4">Get a native app-like experience with offline access by installing FocusFlow to your device.</p>
                    {isAppInstalled ? (
                        <div className="flex items-center gap-3 p-3 bg-green-500/10 text-green-400 rounded-lg">
                            <CheckCircleIcon className="w-6 h-6" />
                            <span className="font-semibold">FocusFlow is already installed on this device.</span>
                        </div>
                    ) : installPromptEvent ? (
                        <button 
                            onClick={triggerInstallPrompt} 
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover"
                        >
                            <CloudArrowDownIcon className="w-5 h-5" />
                            <span>Install FocusFlow App</span>
                        </button>
                    ) : (
                        <p className="text-sm text-dark-text-secondary">App installation is not currently available for your browser, or you may have dismissed the prompt.</p>
                    )}
                </div>

                {/* Data Management Section */}
                <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl">
                    <h2 className="text-xl font-semibold mb-4 border-b border-light-border dark:border-dark-border pb-2">Data Management</h2>
                    <p className="text-sm text-dark-text-secondary mb-4">Your data is stored locally on this device. We recommend exporting it regularly as a backup.</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={handleExportData} className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-semibold">Export Data</button>
                        <input type="file" ref={importInputRef} accept=".json" onChange={handleFileSelect} className="hidden"/>
                        <button onClick={() => setIsPreImportModalOpen(true)} className="flex-1 px-4 py-3 bg-light-bg dark:bg-dark-border rounded-lg font-semibold">Import Data</button>
                    </div>
                     <div className="mt-4">
                        <label htmlFor="reminder-freq" className="block text-sm font-medium text-dark-text-secondary">Backup Reminder Frequency</label>
                        <select id="reminder-freq" value={exportReminderFreq} onChange={e => updateReminderFrequency(Number(e.target.value))} className="mt-1 w-full max-w-xs p-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg">
                            <option value="7">Every 7 days</option>
                            <option value="14">Every 14 days</option>
                            <option value="30">Every 30 days</option>
                            <option value="0">Never remind me</option>
                        </select>
                     </div>
                </div>

                <PreImportWarningModal 
                    isOpen={isPreImportModalOpen}
                    onClose={() => setIsPreImportModalOpen(false)}
                    onProceed={handleProceedToImport}
                    onExport={handleExportData}
                />
            </div>
        </div>
    );
};

export default Settings;
