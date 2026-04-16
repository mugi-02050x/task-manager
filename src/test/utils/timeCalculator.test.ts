import { describe, it, expect } from "vitest";
import { calcElapsed, formatElapsed } from "../../utils/timeCalculator";
import type { TaskTrackRecord } from "../../types/task";

describe("calcElapsed", () => {
  it("対象タスクの実績が0件のとき、0を返す", () => {
    const records: TaskTrackRecord[] = [];
    expect(calcElapsed(records, "task-1")).toBe(0);
  });

  it("対象タスクの実績が1件のとき、その実績時間をミリ秒で返す", () => {
    const records: TaskTrackRecord[] = [
      {
        id: "1",
        taskId: "task-1",
        startDatetime: new Date("2024-01-01T10:00:00"),
        endDatetime: new Date("2024-01-01T11:00:00"), // 1時間 = 3600000ms
      },
    ];
    expect(calcElapsed(records, "task-1")).toBe(3600000);
  });

  it("対象タスク以外の実績が含まれているとき、対象タスクの実績時間のみを返す", () => {
    const records: TaskTrackRecord[] = [
      {
        id: "1",
        taskId: "task-1",
        startDatetime: new Date("2024-01-01T10:00:00"),
        endDatetime: new Date("2024-01-01T11:00:00"), // 1時間 = 3600000ms
      },
      {
        id: "2",
        taskId: "task-2",
        startDatetime: new Date("2024-01-01T11:00:00"),
        endDatetime: new Date("2024-01-01T13:00:00"), // 2時間
      },
    ];
    expect(calcElapsed(records, "task-1")).toBe(3600000);
  });

  it("対象タスクの実績が複数件含まれているとき、実績時間の合計をミリ秒で返す", () => {
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
    expect(calcElapsed(records, "task-1")).toBe(10800000); // 3時間 = 10800000ms
  });
});

describe("formatElapsed", () => {
  it("0ミリ秒のとき、0を返す", () => {
    expect(formatElapsed(0)).toBe(0);
  });
  it("15分未満のとき、0を返す", () => {
    const ms = 14 * 60 * 1000; // 14分
    expect(formatElapsed(ms)).toBe(0);
  });
  it("ちょうど15分のとき、0.25を返す", () => {
    const ms = 15 * 60 * 1000; // 15分
    expect(formatElapsed(ms)).toBe(0.25);
  });
  it("0.25h単位に切り捨てた値を返す", () => {
    const ms = 29 * 60 * 1000; // 29分 → 0.25h単位で切り捨て → 0.25
    expect(formatElapsed(ms)).toBe(0.25);
  });
});
