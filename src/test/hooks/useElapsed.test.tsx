import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { TaskProvider } from "../../contexts/TaskContext";
import { useTaskContext } from "../../hooks/useTaskContext";
import { useElapsed } from "../../hooks/useElapsed";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TaskProvider>{children}</TaskProvider>
);

describe("useElapsed", () => {
  it("trackRecordsが0件のとき、0を返す", () => {
    const { result } = renderHook(() => useElapsed("task-1"), { wrapper });
    expect(result.current).toBe(0);
  });

  it("親タスクのとき、子孫タスクの実績を含めた合計を返す", () => {
    const { result } = renderHook(
      () => ({ elapsed: useElapsed("task-1"), context: useTaskContext() }),
      { wrapper },
    );

    // task-1（親）→ task-2（子）の構造を作り、task-2 に実績を追加する
    act(() => {
      result.current.context.dispatch({
        type: "ADD_TRACK_RECORD",
        payload: {
          id: "record-1",
          taskId: "task-2",
          startDatetime: new Date("2024-01-01T10:00:00"),
          endDatetime: new Date("2024-01-01T11:00:00"), // 1時間
        },
      });
    });

    // task-1 の useElapsed は子孫（task-2）の実績を含めて返す
    // ただし task-1 と task-2 の親子関係は TaskContext に登録されていないため
    // getTaskDescendants が空を返し、task-1 自身の実績のみ集計される。
    // 子孫を含めた合算を確認するには tasks も追加する必要がある。
    act(() => {
      result.current.context.dispatch({
        type: "ADD_TASK",
        payload: {
          id: "task-1",
          taskName: "親タスク",
          description: "",
          status: "WAITING",
          parentId: null,
          dispOrder: 1,
          createdAt: new Date("2024-01-01"),
        },
      });
      result.current.context.dispatch({
        type: "ADD_TASK",
        payload: {
          id: "task-2",
          taskName: "子タスク",
          description: "",
          status: "WAITING",
          parentId: "task-1",
          dispOrder: 1,
          createdAt: new Date("2024-01-01"),
        },
      });
    });

    // 子タスク（task-2）の実績1時間が親タスク（task-1）の合計に含まれる
    expect(result.current.elapsed).toBe(1);
  });
});
