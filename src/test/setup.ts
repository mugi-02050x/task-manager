import '@testing-library/jest-dom'
import { vi, beforeEach, afterEach } from "vitest";

// localStorage のモック（全テストで共通利用）
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

vi.stubGlobal("localStorage", localStorageMock);

// テスト間で localStorage が汚染されないようにクリアする
beforeEach(() => {
  localStorage.clear();
});

// vi.spyOn で設定したモックをテストごとにリセットする
afterEach(() => {
  vi.restoreAllMocks();
});
