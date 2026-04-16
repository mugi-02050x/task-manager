import type { TaskTrackRecord } from "../types/task";

/**
 * 指定したタスクの実績時間の合計をミリ秒で返す
 * フォーマットは呼び出し側で行う
 * @param trackRecords 実績レコードの配列
 * @param taskId 集計対象のタスクID
 * @returns 実績時間の合計（ミリ秒）
 */
function calcElapsed(
  trackRecords: Array<TaskTrackRecord>,
  taskId: string,
): number {
  return trackRecords
    .filter((record) => record.taskId === taskId)
    .reduce((total, record) => {
      return (
        total + record.endDatetime.getTime() - record.startDatetime.getTime()
      );
    }, 0);
}

/**
 * 実績時間の合計（ミリ秒）をフォーマットして返す
 * ※フォーマット形式を変更する場合はこの関数を差し替える
 * @param diff 実績時間の合計（ミリ秒）
 * @returns フォーマットされた実績時間（0.25h単位）
 */
function formatElapsed(diff: number): number {
  return toQuarterHour(diff);
}

/**
 * ミリ秒を0.25h単位に切り捨てた時間（h）に変換する
 * @param diff 経過時間（ミリ秒）
 * @returns 0.25h単位に切り捨てた時間（h）
 */
function toQuarterHour(diff: number): number {
  const diffInHours = diff / (1000 * 60 * 60);
  const floorHours = Math.floor(diffInHours * 4) / 4;
  return floorHours;
}

export { calcElapsed, formatElapsed };
