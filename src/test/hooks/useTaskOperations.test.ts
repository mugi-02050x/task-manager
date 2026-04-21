import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { TaskProvider } from "../../contexts/TaskContext";
import { TimerProvider } from "../../contexts/TimerContext";
import { useTaskOperations } from "../../hooks/useTaskOperations";
import { useTimer } from "../../hooks/useTimer";
import { useTaskContext } from "../../hooks/useTaskContext";

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

  it("計測中タスクに対して子タスクを追加するとタイマーを停止する", () => {
    const { result } = renderHook(
      () => ({
        operations: useTaskOperations(),
        timer: useTimer(),
      }),
      { wrapper },
    );

    act(() => {
      result.current.operations.saveTask({
        mode: "create",
        parentId: null,
        input: {
          taskName: "親タスク",
          description: "",
          status: "WAITING",
        },
      });
    });

    const parentId = result.current.operations.tasks[0].id;

    act(() => {
      result.current.timer.start(parentId);
    });

    expect(result.current.timer.runningTaskId).toBe(parentId);

    act(() => {
      result.current.operations.saveTask({
        mode: "create",
        parentId,
        input: {
          taskName: "子タスク",
          description: "",
          status: "WAITING",
        },
      });
    });

    expect(result.current.timer.runningTaskId).toBeNull();
    expect(result.current.timer.startedAt).toBeNull();
    expect(result.current.operations.tasks).toHaveLength(2);
    expect(result.current.operations.tasks[1].parentId).toBe(parentId);
  });

  it("削除時に runningTaskId が削除対象ならタイマーをリセットする", () => {
    const { result } = renderHook(
      () => ({
        operations: useTaskOperations(),
        timer: useTimer(),
      }),
      { wrapper },
    );

    act(() => {
      result.current.operations.saveTask({
        mode: "create",
        parentId: null,
        input: {
          taskName: "親タスク",
          description: "",
          status: "WAITING",
        },
      });
    });

    const parentId = result.current.operations.tasks[0].id;

    act(() => {
      result.current.operations.saveTask({
        mode: "create",
        parentId,
        input: {
          taskName: "子タスク",
          description: "",
          status: "WAITING",
        },
      });
    });

    const childId = result.current.operations.tasks[1].id;

    act(() => {
      result.current.timer.start(childId);
    });

    expect(result.current.timer.runningTaskId).toBe(childId);

    act(() => {
      result.current.operations.deleteTask(parentId);
    });

    expect(result.current.timer.runningTaskId).toBeNull();
    expect(result.current.timer.startedAt).toBeNull();
    expect(result.current.operations.tasks).toHaveLength(0);
  });

  it("clear 実行時にタイマー状態をリセットする", () => {
    const { result } = renderHook(
      () => ({
        operations: useTaskOperations(),
        timer: useTimer(),
      }),
      { wrapper },
    );

    act(() => {
      result.current.operations.saveTask({
        mode: "create",
        parentId: null,
        input: {
          taskName: "タスク1",
          description: "",
          status: "WAITING",
        },
      });
    });

    const taskId = result.current.operations.tasks[0].id;

    act(() => {
      result.current.timer.start(taskId);
    });

    expect(result.current.timer.runningTaskId).toBe(taskId);

    act(() => {
      result.current.operations.clearState();
    });

    expect(result.current.timer.runningTaskId).toBeNull();
    expect(result.current.timer.startedAt).toBeNull();
    expect(result.current.operations.tasks).toHaveLength(0);
  });

  it("import 成功時にタイマー状態をリセットする", () => {
    const { result } = renderHook(
      () => ({
        operations: useTaskOperations(),
        timer: useTimer(),
        context: useTaskContext(),
      }),
      { wrapper },
    );

    act(() => {
      result.current.operations.saveTask({
        mode: "create",
        parentId: null,
        input: {
          taskName: "現在タスク",
          description: "",
          status: "WAITING",
        },
      });
    });
    const currentTaskId = result.current.operations.tasks[0].id;

    act(() => {
      result.current.timer.start(currentTaskId);
    });

    const jsonStr = JSON.stringify({
      tasks: [
        {
          id: "imported-task",
          taskName: "imported",
          description: "",
          status: "WAITING",
          parentId: null,
          dispOrder: 1,
          createdAt: new Date("2024-01-01"),
        },
      ],
      trackRecords: [],
    });

    act(() => {
      result.current.operations.importState(jsonStr);
    });

    expect(result.current.timer.runningTaskId).toBeNull();
    expect(result.current.timer.startedAt).toBeNull();
    expect(result.current.context.state.tasks).toHaveLength(1);
    expect(result.current.context.state.tasks[0].id).toBe("imported-task");
  });

  it("import 失敗時にタイマー状態を維持する", () => {
    const { result } = renderHook(
      () => ({
        operations: useTaskOperations(),
        timer: useTimer(),
      }),
      { wrapper },
    );

    act(() => {
      result.current.operations.saveTask({
        mode: "create",
        parentId: null,
        input: {
          taskName: "現在タスク",
          description: "",
          status: "WAITING",
        },
      });
    });
    const currentTaskId = result.current.operations.tasks[0].id;

    act(() => {
      result.current.timer.start(currentTaskId);
    });

    const beforeStartedAt = result.current.timer.startedAt;

    expect(() => {
      act(() => {
        result.current.operations.importState("invalid-json");
      });
    }).toThrow("不正なファイル形式です");

    expect(result.current.timer.runningTaskId).toBe(currentTaskId);
    expect(result.current.timer.startedAt).toBe(beforeStartedAt);
  });
});
