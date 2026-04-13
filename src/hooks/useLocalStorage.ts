import { useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  // lazy initializer: 初回レンダリング時のみ localStorage から値を読み込む
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : initialValue;
  });

  // state の更新と localStorage への書き込みを同時に行う
  const setValue = (value: T) => {
    setStoredValue(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  // as const により readonly [T, (value: T) => void] として型推論される
  return [storedValue, setValue] as const;
}
