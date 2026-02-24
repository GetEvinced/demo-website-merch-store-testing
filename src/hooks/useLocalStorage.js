import { useState, useEffect } from 'react';

/**
 * A drop-in replacement for useState that persists the value in localStorage.
 * @param {string} key  - The localStorage key
 * @param {*} initialValue - The default value when nothing is stored yet
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // ignore write errors (e.g. private browsing quota exceeded)
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
