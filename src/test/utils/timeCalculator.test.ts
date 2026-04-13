import { describe, it, expect } from "vitest";
import { calcElapsed } from "../../utils/timeCalculator";
import type { TaskTrackRecord } from "../../types/task";

// 共通ケース
describe("calcElapsed", () => {
  it("対象タスクの実績が0件のとき、0を返す", () => {
    const records: TaskTrackRecord[] = [];
    expect(calcElapsed(records, "task-1")).toBe(0);
  });
  it("対象タスクの実績が1件のとき、その実績時間を返す", () => {
    const records: TaskTrackRecord[] = [
      {
        id: "1",
        taskId: "task-1",
        startDatetime: new Date("2024-01-01T10:00:00"),
        endDatetime: new Date("2024-01-01T11:00:00"), // 1時間
      },
    ];
    expect(calcElapsed(records, "task-1")).toBe(1.0);
  });

  it("対象タスク以外の実績が含まれているとき、対象タスクの実績時間のみを返す", () => {
    const records: TaskTrackRecord[] = [
      {
        id: "1",
        taskId: "task-1",
        startDatetime: new Date("2024-01-01T10:00:00"),
        endDatetime: new Date("2024-01-01T11:00:00"), // 1時間
      },
      {
        id: "2",
        taskId: "task-2",
        startDatetime: new Date("2024-01-01T11:00:00"),
        endDatetime: new Date("2024-01-01T13:00:00"), // 2時間
      },
    ];
    expect(calcElapsed(records, "task-1")).toBe(1.0);
  });

  it("対象タスクの実績が複数件含まれているとき、実績時間の合計を返す", () => {
    const records: TaskTrackRecord[] = [
      {
        id: "1",
        taskId: "task-1",
        startDatetime: new Date("2024-01-01T10:00:00"),
        endDatetime: new Date("2024-01-01T11:00:00"), // 1時間
      },
      {
        id: "2",
        taskId: "task-1",
        startDatetime: new Date("2024-01-01T11:00:00"),
        endDatetime: new Date("2024-01-01T13:00:00"), // 2時間
      },
    ];
    expect(calcElapsed(records, "task-1")).toBe(3.0);
  });

  // フォーマットが0.25hの場合のケース
  it("対象タスクの実績の合計が0.25未満のとき、0を返す", () => {
    const records: TaskTrackRecord[] = [
      {
        id: "1",
        taskId: "task-1",
        startDatetime: new Date("2024-01-01T10:00:00"),
        endDatetime: new Date("2024-01-01T10:13:00"), // 13分
      },
      {
        id: "2",
        taskId: "task-1",
        startDatetime: new Date("2024-01-01T10:13:00"),
        endDatetime: new Date("2024-01-01T10:14:00"), // 1分
      },
    ];
    expect(calcElapsed(records, "task-1")).toBe(0);
  });

  it("対象タスクの実績の合計が0.25のとき、0.25を返す", () => {
    const records: TaskTrackRecord[] = [
      {
        id: "1",
        taskId: "task-1",
        startDatetime: new Date("2024-01-01T10:00:00"),
        endDatetime: new Date("2024-01-01T10:14:00"), // 14分
      },
      {
        id: "2",
        taskId: "task-1",
        startDatetime: new Date("2024-01-01T10:14:00"),
        endDatetime: new Date("2024-01-01T10:15:00"), // 1分
      },
    ];
    expect(calcElapsed(records, "task-1")).toBe(0.25);
  });

  it("対象タスクの実績の合計が0.375のとき、0.25単位に合わせて1.25を返す", () => {
    const records: TaskTrackRecord[] = [
      {
        id: "1",
        taskId: "task-1",
        startDatetime: new Date("2024-01-01T10:00:00"),
        endDatetime: new Date("2024-01-01T10:14:00"), // 1時間
      },
      {
        id: "2",
        taskId: "task-1",
        startDatetime: new Date("2024-01-01T11:00:00"),
        endDatetime: new Date("2024-01-01T11:15:00"), // 2時間
      },
    ];
    expect(calcElapsed(records, "task-1")).toBe(0.25);
  });
});
