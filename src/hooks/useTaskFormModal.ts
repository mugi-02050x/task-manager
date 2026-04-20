import { useState } from "react";
import type { TaskFormInput } from "../types/task";
import { useTaskOperations } from "./useTaskOperations";
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
  const taskOperations = useTaskOperations();
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false });

  const openCreateModal = (parentId: string | null) => {
    setModalState({ isOpen: true, mode: "create", parentId });
  };

  const openEditModal = (taskId: string) => {
    try {
      taskOperations.getTask(taskId);
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
        taskOperations.saveTask({
          mode: "create",
          parentId: modalState.parentId,
          input,
        });
      } else {
        taskOperations.saveTask({
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

  const editingTask =
    modalState.isOpen && modalState.mode === "edit"
      ? taskOperations.getTask(modalState.taskId)
      : null;

  const modalMode: "create" | "edit" =
    modalState.isOpen ? modalState.mode : "create";

  const initialValue: TaskFormInput = editingTask
    ? {
        taskName: editingTask.taskName,
        description: editingTask.description,
        status: editingTask.status,
      }
    : DEFAULT_FORM_VALUE;

  return {
    taskRoots: taskOperations.getTaskRoots(),
    isModalOpen: modalState.isOpen,
    modalMode,
    initialValue,
    openCreateModal,
    openEditModal,
    closeModal,
    submitTaskForm,
  };
}
