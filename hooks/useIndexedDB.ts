
import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/db.ts';
import { generateUUID } from '../utils/uuid.ts';

export const useIndexedDB = <T extends { id: string }>(storeName: any) => {
    const [items, setItems] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refreshItems = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await db.getAll(storeName);
            setItems(data as T[]);
        } catch (error) {
            console.error(`Failed to fetch from ${storeName}:`, error);
        } finally {
            setIsLoading(false);
        }
    }, [storeName]);

    useEffect(() => {
        refreshItems();
    }, [refreshItems]);

    const addItem = async (item: Omit<T, 'id'>): Promise<T> => {
        const newItem = { ...item, id: generateUUID() } as T;
        await db.put(storeName, newItem);
        await refreshItems();
        return newItem;
    };

    const updateItem = async (id: string, updates: Partial<T>): Promise<void> => {
        const item = await db.get(storeName, id);
        if (item) {
            const updatedItem = { ...item, ...updates, updatedAt: Date.now() };
            await db.put(storeName, updatedItem);
            await refreshItems();
        }
    };

    const deleteItem = async (id: string): Promise<void> => {
        await db.delete(storeName, id);
        await refreshItems();
    };

    return { items, isLoading, addItem, updateItem, deleteItem, refreshItems };
};
