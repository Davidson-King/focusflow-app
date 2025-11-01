
import { useState, useEffect, Dispatch, SetStateAction } from 'react';

function getStorageValue<T>(key: string, defaultValue: T): T {
  // getting stored value
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse localStorage value", e);
        return defaultValue;
      }
    }
  }
  return defaultValue;
}

// FIX: Correctly typed the return value with Dispatch and SetStateAction to resolve namespace error.
export const useLocalStorage = <T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    // storing value
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch(e) {
        console.error("Failed to set localStorage value", e);
    }
  }, [key, value]);

  return [value, setValue];
};
