import { useState, useCallback } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  // lazy initializer: 初回レンダリング時のみ localStorage から値を読み込む
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : initialValue;
  });

  // useCallback でメモ化することで関数の参照を固定する
  // これにより、この関数を useEffect の依存配列に含めても無限ループが発生しない
  const setValue = useCallback(
    (value: T) => {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    },
    [key],
  );

  const removeValue = useCallback(() => {
    setStoredValue(initialValue);
    localStorage.removeItem(key);
  }, [initialValue, key]);

  // as const により readonly [T, (value: T) => void] として型推論される
  return [storedValue, setValue, removeValue] as const;
}
