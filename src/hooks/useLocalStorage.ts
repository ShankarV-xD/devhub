"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * AR2: useLocalStorage
 *
 * Generic, SSR-safe hook for reading and writing a value to localStorage.
 * The initial value is read lazily to avoid hydration mismatches.
 *
 * Usage:
 *   const [theme, setTheme] = useLocalStorage<'dark' | 'light'>('theme', 'dark');
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Lazy initializer — only runs once and is safe in SSR (window may not exist)
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.error(`[useLocalStorage] Error reading key "${key}":`, error);
      return initialValue;
    }
  });

  // Write to localStorage whenever the stored value changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`[useLocalStorage] Error writing key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Stable setter — accepts a value or an updater function (mirrors useState API)
  const setValue = useCallback(
    (value: T | ((current: T) => T)) => {
      setStoredValue((current) =>
        value instanceof Function ? value(current) : value,
      );
    },
    [],
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(key);
    }
    setStoredValue(initialValue);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}
