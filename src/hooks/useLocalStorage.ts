import { Dispatch, SetStateAction, useEffect, useState } from 'react';

type SetValue<T> = Dispatch<SetStateAction<T>>;

const readStorageValue = <T>(key: string, initialValue: T) => {
  if (typeof window === 'undefined') {
    return initialValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : initialValue;
  } catch {
    return initialValue;
  }
};

export const useLocalStorage = <T>(key: string, initialValue: T): [T, SetValue<T>, () => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => readStorageValue(key, initialValue));

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // Ignore storage errors so forms keep working in private browsing contexts.
    }
  }, [key, storedValue]);

  const removeValue = () => {
    window.localStorage.removeItem(key);
    setStoredValue(initialValue);
  };

  return [storedValue, setStoredValue, removeValue];
};

