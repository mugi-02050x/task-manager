import { useState } from "react";
import type { TaskFormInput } from "../types/task";
import { useTaskManager } from "./useTaskManager";
import { handleAppError } from "../utils/error";

type ModalState =
  | { isOpen: false }
  | { isOpen: true; mode: "create"; parentId: string | null }
  | { isOpen: true; mode: "edit"; taskId: string };

const DEFAULT_FORM_VALUE: TaskFormInput = {
  taskName: "",
  description: "",
  status: "WAITING",
};

export function useTaskFormModal() {
  const taskManager = useTaskManager();
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false });

  const openCreateModal = (parentId: string | null) => {
    setModalState({ isOpen: true, mode: "create", parentId });
  };

  const openEditModal = (taskId: string) => {
    try {
      taskManager.getTask(taskId);
      setModalState({ isOpen: true, mode: "edit", taskId });
    } catch (error: unknown) {
      handleAppError(error, "対象タスクが存在しません");
    }
  };

  const closeModal = () => {
    setModalState({ isOpen: false });
  };

  const submitTaskForm = (input: TaskFormInput) => {
    if (!modalState.isOpen) return;
    try {
      if (modalState.mode === "create") {
        taskManager.saveTask({
          mode: "create",
          parentId: modalState.parentId,
          input,
        });
      } else {
        taskManager.saveTask({
          mode: "edit",
          taskId: modalState.taskId,
          input,
        });
      }
      closeModal();
    } catch (error: unknown) {
      handleAppError(error, "タスクの保存に失敗しました");
    }
  };

  let initialValue: TaskFormInput = DEFAULT_FORM_VALUE;
  let modalMode: "create" | "edit" = "create";
  if (modalState.isOpen) {
    modalMode = modalState.mode;
    if (modalState.mode === "edit") {
      const editingTask = taskManager.getTask(modalState.taskId);
      initialValue = {
        taskName: editingTask.taskName,
        description: editingTask.description,
        status: editingTask.status,
      };
    }
  }

  return {
    taskRoots: taskManager.getTaskRoots(),
    isModalOpen: modalState.isOpen,
    modalMode,
    initialValue,
    openCreateModal,
    openEditModal,
    closeModal,
    submitTaskForm,
  };
}
