import { useTaskContext } from "../contexts/TaskContext";
import type {
  Task,
  TaskStatus,
  CreateTaskParams,
  UpdateTaskParams,
} from "../types/task";
import { TaskStateSchema } from "../schemas/task";
import {
  countChildren,
  countRootTasks,
  getChildren,
  getDepth,
  getDescendants,
  getRootTasks,
  getTask as getTaskById,
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

  /**
   * JSONをバリデーションしてstateをインポートする
   * バリデーション失敗時はエラーをスローする
   */
  function importState(json: string): void {
    try {
      const data = TaskStateSchema.parse(JSON.parse(json));
      dispatch({ type: "IMPORT", payload: data });
    } catch {
      throw new Error("不正なファイル形式です");
    }
  }

  /**
   * 現在の state を JSON 文字列に変換してファイルダウンロードする
   */
  function exportState(): void {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "task-manager.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * 指定したIDのタスクを返す
   * タスクが存在しない場合はエラーをスローする
   */
  function getTask(id: string): Task {
    const task: Task | null = getTaskById(state.tasks, id);
    if (!task) throw new Error("対象タスクが存在しません");
    return task;
  }

  /**
   * 指定した親タスクの子タスク一覧を返す
   */
  function getTaskChildren(parentId: string | null): Task[] {
    return getChildren(state.tasks, parentId);
  }

  /**
   * ルートタスク一覧を返す
   */
  function getTaskRoots(): Task[] {
    return getRootTasks(state.tasks);
  }

  /**
   * 指定したタスクの子孫タスクを全て返す
   */
  function getTaskDescendants(taskId: string): Task[] {
    return getDescendants(state.tasks, taskId);
  }

  return {
    tasks: state.tasks,
    addTask,
    getTask,
    updateTask,
    deleteTask,
    changeStatus,
    importState,
    getTaskChildren,
    getTaskRoots,
    getTaskDescendants,
    exportState,
  };
}
