import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { TaskProvider } from "../../contexts/TaskContext";
import { useTaskFormModal } from "../../hooks/useTaskFormModal";
import { useTaskManager } from "../../hooks/useTaskManager";
import type { CreateTaskParams, TaskFormInput } from "../../types/task";

const wrapper = ({ children }: { children: React.ReactNode }) =>
  TaskProvider({ children });

const createParams: CreateTaskParams = {
  taskName: "既存タスク",
  description: "既存説明",
  status: "WAITING",
  parentId: null,
};

const formInput: TaskFormInput = {
  taskName: "更新後タスク",
  description: "更新後説明",
  status: "WORKING",
};

describe("useTaskFormModal", () => {
  it("openCreateModal で create モーダルが開き、初期値が空になる", () => {
    const { result } = renderHook(() => useTaskFormModal(), { wrapper });

    act(() => {
      result.current.openCreateModal(null);
    });

    expect(result.current.isModalOpen).toBe(true);
    expect(result.current.modalMode).toBe("create");
    expect(result.current.initialValue).toEqual({
      taskName: "",
      description: "",
      status: "WAITING",
    });
  });

  it("存在しない taskId で openEditModal するとモーダルを開かずにエラー通知する", () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const { result } = renderHook(() => useTaskFormModal(), { wrapper });

    act(() => {
      result.current.openEditModal("unknown-task-id");
    });

    expect(alertSpy).toHaveBeenCalledWith("対象タスクが存在しません");
    expect(result.current.isModalOpen).toBe(false);
  });

  it("create モードで submitTaskForm するとタスクを追加してモーダルを閉じる", () => {
    const { result } = renderHook(
      () => ({ modal: useTaskFormModal(), manager: useTaskManager() }),
      { wrapper },
    );

    act(() => {
      result.current.modal.openCreateModal(null);
    });
    act(() => {
      result.current.modal.submitTaskForm(formInput);
    });

    expect(result.current.modal.isModalOpen).toBe(false);
    expect(result.current.manager.tasks).toHaveLength(1);
    expect(result.current.manager.tasks[0]).toMatchObject({
      ...formInput,
      parentId: null,
    });
  });

  it("edit モードで submitTaskForm すると既存タスクを更新してモーダルを閉じる", () => {
    const { result } = renderHook(
      () => ({ modal: useTaskFormModal(), manager: useTaskManager() }),
      { wrapper },
    );

    act(() => {
      result.current.manager.addTask(createParams);
    });
    const taskId = result.current.manager.tasks[0].id;

    act(() => {
      result.current.modal.openEditModal(taskId);
    });
    act(() => {
      result.current.modal.submitTaskForm(formInput);
    });

    expect(result.current.modal.isModalOpen).toBe(false);
    expect(result.current.manager.tasks).toHaveLength(1);
    expect(result.current.manager.tasks[0]).toMatchObject(formInput);
  });
});
