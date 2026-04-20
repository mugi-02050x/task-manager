import { useTaskContext } from "./useTaskContext";
import { useTimerContext } from "./useTimerContext";
import type { TaskTrackRecord } from "../types/task";
import { formatElapsed } from "../utils/timeCalculator";

export function useTimer() {
  const { dispatch } = useTaskContext();
  const { runningTaskId, startedAt, setRunningTaskId, setStartedAt } =
    useTimerContext();

  /**
   * タイマーを開始する
   * すでに別のタスクのタイマーが動いている場合は自動停止してから開始する
   */
  function start(taskId: string): void {
    stop();
    setRunningTaskId(taskId);
    setStartedAt(new Date());
  }

  /**
   * タイマーを停止する
   * 15分未満の場合は trackRecord を保存しない
   */
  function stop(): void {
    const endDatetime = new Date();
    const elapsedMs = startedAt
      ? endDatetime.getTime() - startedAt.getTime()
      : 0;

    // formatElapsed は 0.25h（15分）単位に切り捨てて返す
    // 15分未満の場合は 0 が返るため、0より大きい場合のみ trackRecord を保存する
    if (runningTaskId && startedAt && formatElapsed(elapsedMs) > 0) {
      const payload: TaskTrackRecord = {
        id: crypto.randomUUID(),
        taskId: runningTaskId,
        startDatetime: startedAt,
        endDatetime,
      };
      dispatch({ type: "ADD_TRACK_RECORD", payload: payload });
    }

    reset();
  }

  function reset(): void {
    setRunningTaskId(null);
    setStartedAt(null);
  }

  return {
    runningTaskId,
    startedAt,
    start,
    stop,
    reset,
  };
}
