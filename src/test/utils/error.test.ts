import { describe, expect, it, vi } from "vitest";
import { getErrorMessage, handleAppError } from "../../utils/error";

describe("getErrorMessage", () => {
  it("Error インスタンスのとき、message を返す", () => {
    expect(getErrorMessage(new Error("テストエラー"))).toBe("テストエラー");
  });

  it("Error 以外のとき、fallbackMessage を返す", () => {
    expect(getErrorMessage("unexpected", "フォールバック")).toBe(
      "フォールバック",
    );
  });
});

describe("handleAppError", () => {
  it("エラーメッセージを alert で表示する", () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    handleAppError(new Error("テストエラー"));

    expect(alertSpy).toHaveBeenCalledWith("テストエラー");
  });
});
