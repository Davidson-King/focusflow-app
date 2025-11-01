// utils/data.ts
import { db } from '../services/db';

/**
 * Gathers all data from specified IndexedDB stores, creates a JSON backup file,
 * and initiates a download. Updates the 'lastExportDate' setting on success.
 * @returns {Promise<boolean>} - True if the export was successful, false otherwise.
 */
export const exportData = async (): Promise<boolean> => {
    try {
        // FIX: Explicitly type store names to match the DB schema keys.
        const allStores: ('tasks' | 'notes' | 'journal' | 'goals' | 'timelines' | 'folders' | 'userProfile' | 'settings' | 'achievements')[] = ['tasks', 'notes', 'journal', 'goals', 'timelines', 'folders', 'userProfile', 'settings', 'achievements'];
        const dataToExport: Record<string, any> = {};
        for (const storeName of allStores) {
            // Use getAllEntries for key-value stores to preserve keys.
            if (storeName === 'userProfile' || storeName === 'settings') {
                dataToExport[storeName] = await db.getAllEntries(storeName);
            } else {
                dataToExport[storeName] = await db.getAll(storeName);
            }
        }
        
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
        const link = document.createElement('a');
        link.href = jsonString;
        link.download = `focusflow-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        // Update the last export date in settings after a successful export.
        await db.put('settings', Date.now(), 'lastExportDate');
        return true;
    } catch (e) {
        console.error("Failed to export data:", e);
        return false;
    }
};