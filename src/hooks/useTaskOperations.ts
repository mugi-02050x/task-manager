import { useTaskManager } from "./useTaskManager";
import type { SaveTaskParams } from "./useTaskManager";
import { useTimer } from "./useTimer";

/**
 * アプリケーション操作の統合窓口。
 * 将来的に task + timer の整合性制御をここへ集約する。
 */
export function useTaskOperations() {
  const taskManager = useTaskManager();
  const timer = useTimer();

  /**
   * TaskForm 送信時の統合窓口。
   * 現状は create/edit 分岐を taskManager に委譲するのみ。
   * 将来は必要に応じて submit 前後の共通整合処理をここに寄せる。
   */
  function saveTask(params: SaveTaskParams): void {
    if (
      timer.runningTaskId &&
      params.mode === "create" &&
      params.parentId === timer.runningTaskId
    ) {
      timer.stop();
    }
    taskManager.saveTask(params);
  }

  /**
   * タスク削除の統合窓口。
   * 将来は削除対象（子孫含む）に runningTaskId が含まれる場合に
   * タイマー停止/リセットを先に行ってから deleteTask を実行する。
   */
  function deleteTask(id: string): void {
    const targetIds: Array<string> = [
      id,
      ...taskManager.getTaskDescendants(id).map((task) => task.id),
    ];

    if (timer.runningTaskId && targetIds.includes(timer.runningTaskId)) {
      timer.reset();
    }
    taskManager.deleteTask(id);
  }

  /**
   * 全体初期化の統合窓口。
   * 将来は clear 実行前にタイマー状態を必ずリセットする。
   */
  function clearState(): void {
    timer.reset();
    taskManager.clearState();
  }

  /**
   * インポートの統合窓口。
   * import 成功後にタイマー状態をリセットし、
   * import 失敗時は計測中状態を維持する。
   */
  function importState(json: string): void {
    taskManager.importState(json);
    timer.reset();
  }

  return {
    tasks: taskManager.tasks,
    saveTask,
    deleteTask,
    clearState,
    importState,
    changeStatus: taskManager.changeStatus,
    getTask: taskManager.getTask,
    getTaskChildren: taskManager.getTaskChildren,
    getTaskRoots: taskManager.getTaskRoots,
    getTaskDescendants: taskManager.getTaskDescendants,
    exportState: taskManager.exportState,
  };
}
