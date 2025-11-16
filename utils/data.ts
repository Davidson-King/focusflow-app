import { db } from '../services/db';

export const exportData = async (): Promise<boolean> => {
    try {
        const allStores: ('tasks' | 'notes' | 'journal' | 'goals' | 'timelines' | 'folders' | 'userProfile' | 'settings' | 'milestones' | 'achievements')[] = ['tasks', 'notes', 'journal', 'goals', 'timelines', 'folders', 'userProfile', 'settings', 'milestones', 'achievements'];
        const dataToExport: Record<string, any> = {};
        for (const storeName of allStores) {
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

        await db.put('settings', Date.now(), 'lastExportDate');
        return true;
    } catch (e) {
        console.error("Failed to export data:", e);
        return false;
    }
};
