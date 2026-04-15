import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { TaskProvider, useTaskContext } from "../../contexts/TaskContext";
import type { Task } from "../../types/task";

// renderHook の wrapper オプションで TaskProvider でラップする
// これにより useTaskContext が Provider 内で実行される
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TaskProvider>{children}</TaskProvider>
);

const newTask: Task = {
  id: "task-1",
  taskName: "テストタスク",
  description: "",
  status: "WAITING",
  parentId: null,
  dispOrder: 1,
  createdAt: new Date("2024-01-01"),
};

describe("TaskContext", () => {
  it("初期状態で tasks が空配列を返す", () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });
    expect(result.current.state.tasks).toEqual([]);
  });

  it("ADD_TASK を dispatch すると tasks に追加される", () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });
    act(() => {
      result.current.dispatch({ type: "ADD_TASK", payload: newTask });
    });
    expect(result.current.state.tasks).toEqual([newTask]);
  });

  it("DELETE_TASK を dispatch すると tasks から削除される", () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });
    act(() => {
      result.current.dispatch({ type: "ADD_TASK", payload: newTask });
    });
    act(() => {
      result.current.dispatch({ type: "DELETE_TASK", payload: "task-1" });
    });
    expect(result.current.state.tasks).toEqual([]);
  });

  it("CHANGE_STATUS を dispatch すると status が更新される", () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });
    act(() => {
      result.current.dispatch({ type: "ADD_TASK", payload: newTask });
    });
    act(() => {
      result.current.dispatch({
        type: "CHANGE_STATUS",
        payload: { id: "task-1", status: "WORKING" },
      });
    });
    expect(result.current.state.tasks[0].status).toBe("WORKING");
  });
});
