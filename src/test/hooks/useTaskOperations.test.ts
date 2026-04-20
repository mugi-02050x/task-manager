import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { TaskProvider } from "../../contexts/TaskContext";
import { TimerProvider } from "../../contexts/TimerContext";
import { useTaskOperations } from "../../hooks/useTaskOperations";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  TaskProvider({ children: TimerProvider({ children }) })
);

describe("useTaskOperations", () => {
  it("taskManager の委譲として saveTask(create) が動作する", () => {
    const { result } = renderHook(() => useTaskOperations(), { wrapper });

    act(() => {
      result.current.saveTask({
        mode: "create",
        parentId: null,
        input: {
          taskName: "タスク1",
          description: "説明",
          status: "WAITING",
        },
      });
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0]).toMatchObject({
      taskName: "タスク1",
      description: "説明",
      status: "WAITING",
      parentId: null,
    });
  });

  it.todo("計測中タスクに対して子タスク追加する際の整合性を検証する");
  it.todo("削除時に runningTaskId が削除対象ならタイマーをリセットする");
  it.todo("clear / import 実行時にタイマー状態をリセットする");
});
