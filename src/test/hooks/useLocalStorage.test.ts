import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "../../hooks/useLocalStorage";

const TEST_KEY = "test-key";

// localStorage のモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

vi.stubGlobal("localStorage", localStorageMock);

// テスト間で localStorage が汚染されないようにクリアする
beforeEach(() => {
  localStorage.clear();
});

describe("useLocalStorage", () => {
  it("localStorageに値がないとき、initialValueを返す", () => {
    const { result } = renderHook(() => useLocalStorage(TEST_KEY, "initial"));
    expect(result.current[0]).toBe("initial");
  });

  it("localStorageに値があるとき、その値を返す", () => {
    localStorage.setItem(TEST_KEY, JSON.stringify("saved"));
    const { result } = renderHook(() => useLocalStorage(TEST_KEY, "initial"));
    expect(result.current[0]).toBe("saved");
  });

  it("setValueを呼ぶと、stateが更新される", () => {
    const { result } = renderHook(() => useLocalStorage(TEST_KEY, "initial"));
    act(() => {
      result.current[1]("updated");
    });
    expect(result.current[0]).toBe("updated");
  });

  it("setValueを呼ぶと、localStorageに保存される", () => {
    const { result } = renderHook(() => useLocalStorage(TEST_KEY, "initial"));
    act(() => {
      result.current[1]("updated");
    });
    expect(localStorage.getItem(TEST_KEY)).toBe(JSON.stringify("updated"));
  });
});
