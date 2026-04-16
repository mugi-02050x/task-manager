import { useTaskContext } from "../contexts/TaskContext";
import { useTaskManager } from "./useTaskManager";
import { calcElapsed, formatElapsed } from "../utils/timeCalculator";

/**
 * 指定したタスクの実績時間の合計を返す
 * 子孫タスクの実績も含めて合算してからフォーマットする
 * trackRecords が更新されると自動的に再計算される
 */
export function useElapsed(taskId: string): number {
  const { state } = useTaskContext();
  const taskManager = useTaskManager();

  const targetIds = [taskId, ...taskManager.getTaskDescendants(taskId).map((t) => t.id)];

  const totalMs = targetIds.reduce(
    (total, id) => total + calcElapsed(state.trackRecords, id),
    0,
  );

  return formatElapsed(totalMs);
}
