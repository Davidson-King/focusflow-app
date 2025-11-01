
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
    achievements: {
        key: string;
        value: any;
    };
    'feedback-outbox': {
        key: string;
        value: any;
    };
}

let dbPromise: Promise<IDBPDatabase<FocusFlowDB>>;

const initDB = () => {
    if (!dbPromise) {
        dbPromise = openDB<FocusFlowDB>('FocusFlowDB', 3, {
            upgrade(db, oldVersion, newVersion, transaction) {
                const stores: (keyof FocusFlowDB)[] = ['tasks', 'notes', 'journal', 'goals', 'timelines', 'folders', 'achievements', 'feedback-outbox'];

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
            },
        });
    }
    return dbPromise;
};

export const db = {
    async get<T extends keyof FocusFlowDB>(storeName: T, key: string): Promise<FocusFlowDB[T]['value'] | undefined> {
        const db = await initDB();
        return db.get(storeName, key);
    },
    async getAll<T extends keyof FocusFlowDB>(storeName: T): Promise<FocusFlowDB[T]['value'][]> {
        const db = await initDB();
        return db.getAll(storeName);
    },
    async getAllEntries<T extends keyof FocusFlowDB>(storeName: T): Promise<{key: any, value: any}[]> {
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
    async put<T extends keyof FocusFlowDB>(storeName: T, value: any, key?: string): Promise<void> {
        const db = await initDB();
        await db.put(storeName, value, key);
    },
    async putAll<T extends keyof FocusFlowDB>(storeName: T, values: any[]): Promise<void> {
        const db = await initDB();
        const tx = db.transaction(storeName, 'readwrite');
        await Promise.all(values.map(val => tx.store.put(val)));
        await tx.done;
    },
    async delete<T extends keyof FocusFlowDB>(storeName: T, key: string): Promise<void> {
        const db = await initDB();
        await db.delete(storeName, key);
    },
    async clear<T extends keyof FocusFlowDB>(storeName: T): Promise<void> {
        const db = await initDB();
        await db.clear(storeName);
    }
};
