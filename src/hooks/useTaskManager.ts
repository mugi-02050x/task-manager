import { useTaskContext } from "../contexts/TaskContext";
import type { Task, TaskStatus, CreateTaskParams, UpdateTaskParams } from "../types/task";
import {
  countChildren,
  countRootTasks,
  getChildren,
  getDepth,
} from "../utils/taskTree";

export function useTaskManager() {
  const { state, dispatch } = useTaskContext();

  /**
   * タスクを追加する
   * 階層の深さ（最大5）・子タスク件数（最大20）のバリデーションを行う
   */
  function addTask(params: CreateTaskParams): void {
    const currentCount = params.parentId
      ? countChildren(state.tasks, params.parentId)
      : countRootTasks(state.tasks);

    // validation
    // 階層の深さ
    if (params.parentId && getDepth(state.tasks, params.parentId) >= 5)
      throw new Error("タスク階層の上限を超えています");
    // 子タスクの数
    if (params.parentId && currentCount >= 20)
      throw new Error("子タスクの上限を超えています");

    // registration
    const payload: Task = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      dispOrder: currentCount + 1,
      ...params,
    };
    dispatch({ type: "ADD_TASK", payload: payload });
  }

  /**
   * タスクを更新する
   */
  function updateTask(id: string, params: UpdateTaskParams): void {
    const currentTask = state.tasks.find((task) => task.id === id);
    if (!currentTask) throw new Error("更新対象が存在しません");
    const payload: Task = {
      ...currentTask,
      taskName: params.taskName,
      description: params.description,
      status: params.status,
    };
    dispatch({ type: "UPDATE_TASK", payload: payload });
  }

  /**
   * タスクを削除する
   * 子孫タスクと関連する trackRecords も合わせて削除する
   */
  function deleteTask(id: string): void {
    dispatch({ type: "DELETE_TASK", payload: id });
    state.trackRecords
      .filter((trackRecord) => trackRecord.taskId === id)
      .forEach((trackRecord) => {
        dispatch({ type: "DELETE_TRACK_RECORD", payload: trackRecord.id });
      });

    getChildren(state.tasks, id).forEach((task) => {
      deleteTask(task.id);
    });
  }

  /**
   * タスクのステータスを変更する
   */
  function changeStatus(id: string, status: TaskStatus): void {
    dispatch({ type: "CHANGE_STATUS", payload: { id, status } });
  }

  return {
    tasks: state.tasks,
    addTask,
    updateTask,
    deleteTask,
    changeStatus,
  };
}
