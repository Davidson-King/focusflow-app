import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define the schema of the database.
interface FocusFlowDB extends DBSchema {
    tasks: {
        key: string;
        value: any;
    };
    notes: {
        key: string;
        value: any;
    };
    journal: {
        key: string;
        value: any;
    };
    goals: {
        key: string;
        value: any;
    };
    timelines: {
        key: string;
        value: any;
    };
    folders: {
        key: string;
        value: any;
    };
    userProfile: {
        key: string;
        value: any;
    };
    settings: {
        key: string;
        value: any;
    };
    milestones: {
        key: string;
        value: any;
    };
    achievements: {
        key: string;
        value: any;
    };
    'feedback-outbox': {
        key: string;
        value: any;
    };
}

// FIX: Explicitly define store names to prevent type widening from `keyof FocusFlowDB` to `string`.
// This resolves issues with passing store names to the `idb` library methods.
type StoreName = 'tasks' | 'notes' | 'journal' | 'goals' | 'timelines' | 'folders' | 'userProfile' | 'settings' | 'milestones' | 'achievements' | 'feedback-outbox';

let dbPromise: Promise<IDBPDatabase<FocusFlowDB>>;

const initDB = () => {
    if (!dbPromise) {
        dbPromise = openDB<FocusFlowDB>('FocusFlowDB', 4, {
            upgrade(db, oldVersion, newVersion, transaction) {
                // FIX: Use the specific StoreName[] type to prevent type-widening issues with generics in the idb library.
                const stores: StoreName[] = ['tasks', 'notes', 'journal', 'goals', 'timelines', 'folders', 'milestones', 'feedback-outbox', 'achievements'];

                for (const storeName of stores) {
                    if (!db.objectStoreNames.contains(storeName)) {
                        db.createObjectStore(storeName, { keyPath: 'id' });
                    }
                }

                if (!db.objectStoreNames.contains('userProfile')) {
                    db.createObjectStore('userProfile');
                }
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings');
                }

                // Migration from v2 (achievements) to v3 (milestones)
                if (oldVersion < 3 && db.objectStoreNames.contains('achievements') && newVersion >= 3) {
                    // This is a placeholder for a more complex migration if needed.
                    // For now, we just ensure the new store exists.
                    // If we needed to move data, we would do it here.
                    db.deleteObjectStore('achievements');
                }

                if(oldVersion < 4 && newVersion >= 4) {
                    if (!db.objectStoreNames.contains('achievements')) {
                        db.createObjectStore('achievements', { keyPath: 'id' });
                    }
                }
            },
        });
    }
    return dbPromise;
};

export const db = {
    async get<T extends StoreName>(storeName: T, key: string): Promise<FocusFlowDB[T]['value'] | undefined> {
        const db = await initDB();
        return db.get(storeName, key);
    },
    async getAll<T extends StoreName>(storeName: T): Promise<FocusFlowDB[T]['value'][]> {
        const db = await initDB();
        return db.getAll(storeName);
    },
    async getAllEntries<T extends StoreName>(storeName: T): Promise<{key: any, value: any}[]> {
        const db = await initDB();
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        let cursor = await store.openCursor();
        const entries = [];
        while(cursor) {
            entries.push({ key: cursor.key, value: cursor.value });
            cursor = await cursor.continue();
        }
        return entries;
    },
    async put<T extends StoreName>(storeName: T, value: any, key?: string): Promise<void> {
        const db = await initDB();
        await db.put(storeName, value, key);
    },
    async putAll<T extends StoreName>(storeName: T, values: any[]): Promise<void> {
        const db = await initDB();
        const tx = db.transaction(storeName, 'readwrite');
        await Promise.all(values.map(val => tx.store.put(val)));
        await tx.done;
    },
    async delete<T extends StoreName>(storeName: T, key: string): Promise<void> {
        const db = await initDB();
        await db.delete(storeName, key);
    },
    async clear<T extends StoreName>(storeName: T): Promise<void> {
        const db = await initDB();
        await db.clear(storeName);
    }
};
