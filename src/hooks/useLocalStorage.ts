import { useState, useCallback } from "react";

type UseLocalStorageOptions = {
  enabled?: boolean;
};

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: UseLocalStorageOptions,
) {
  const isEnabled = options?.enabled ?? true;

  // lazy initializer: 初回レンダリング時のみ localStorage から値を読み込む
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!isEnabled) return initialValue;
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : initialValue;
  });

  // useCallback でメモ化することで関数の参照を固定する
  // これにより、この関数を useEffect の依存配列に含めても無限ループが発生しない
  const setValue = useCallback(
    (value: T) => {
      setStoredValue(value);
      if (!isEnabled) return;
      localStorage.setItem(key, JSON.stringify(value));
    },
    [isEnabled, key],
  );

  const removeValue = useCallback(() => {
    setStoredValue(initialValue);
    if (!isEnabled) return;
    localStorage.removeItem(key);
  }, [initialValue, isEnabled, key]);

  // as const により readonly [T, (value: T) => void] として型推論される
  return [storedValue, setValue, removeValue] as const;
}
