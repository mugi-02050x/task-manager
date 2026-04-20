import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "../../hooks/useLocalStorage";

const TEST_KEY = "test-key";

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

  it("removeValueを呼ぶと、stateをinitialValueに戻してlocalStorageから削除する", () => {
    localStorage.setItem(TEST_KEY, JSON.stringify("saved"));
    const { result } = renderHook(() => useLocalStorage(TEST_KEY, "initial"));

    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe("initial");
    expect(localStorage.getItem(TEST_KEY)).toBeNull();
  });

  it("enabled=false のとき、localStorageの保存値を読み込まない", () => {
    localStorage.setItem(TEST_KEY, JSON.stringify("saved"));
    const { result } = renderHook(() =>
      useLocalStorage(TEST_KEY, "initial", { enabled: false }),
    );
    expect(result.current[0]).toBe("initial");
    expect(localStorage.getItem(TEST_KEY)).toBe(JSON.stringify("saved"));
  });

  it("enabled=false のとき、setValueを呼んでもlocalStorageに保存しない", () => {
    const { result } = renderHook(() =>
      useLocalStorage(TEST_KEY, "initial", { enabled: false }),
    );

    act(() => {
      result.current[1]("updated");
    });

    expect(result.current[0]).toBe("updated");
    expect(localStorage.getItem(TEST_KEY)).toBeNull();
  });
});
