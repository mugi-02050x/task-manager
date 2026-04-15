import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { TaskProvider, useTaskContext } from "../../contexts/TaskContext";
import { TimerProvider } from "../../contexts/TimerContext";
import { useTimer } from "../../hooks/useTimer";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TaskProvider>
    <TimerProvider>{children}</TimerProvider>
  </TaskProvider>
);

describe("useTimer", () => {
  describe("start", () => {
    it("対象のtaskIdがrunnningtaskIdが、現在時刻がstartedAtに設定される", () => {
      const { result } = renderHook(() => useTimer(), { wrapper });
      const taskId = "task-1";
      act(() => {
        result.current.start(taskId);
      });
      expect(result.current.runningTaskId).toBe(taskId);
      expect(result.current.startedAt).toBeInstanceOf(Date);
    });

    it("すでに実施中のtaskが存在するとき、stopしてから別のタスクがstartされる", () => {
      // task-1 を start した後、1時間後に task-2 を start することで
      // 内部の stop() で trackRecord が登録されることを確認する
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-01T10:00:00"));

      const { result } = renderHook(
        () => ({ manager: useTimer(), context: useTaskContext() }),
        { wrapper },
      );
      const taskId = "task-2";
      act(() => {
        result.current.manager.start("task-1");
      });
      const beforeState = {
        runningTaskId: result.current.manager.runningTaskId,
        startedAt: result.current.manager.startedAt,
      };

      // 1時間後に別タスクを start する
      vi.setSystemTime(new Date("2024-01-01T11:00:00"));
      act(() => {
        result.current.manager.start(taskId);
      });

      vi.useRealTimers();

      expect(result.current.context.state.trackRecords).toHaveLength(1);
      expect(result.current.manager.runningTaskId).toBe(taskId);
      expect(result.current.manager.startedAt).not.toBe(beforeState.startedAt);
    });
  });

  describe("stop", () => {
    it("startが実施がされていないとき、TaskTrackRecordを登録しない", () => {
      const { result } = renderHook(
        () => ({ manager: useTimer(), context: useTaskContext() }),
        { wrapper },
      );

      expect(result.current.manager.runningTaskId).toBeNull();
      expect(result.current.manager.startedAt).toBeNull();

      act(() => {
        result.current.manager.stop();
      });

      expect(result.current.context.state.trackRecords).toHaveLength(0);
      expect(result.current.manager.runningTaskId).toBeNull();
      expect(result.current.manager.startedAt).toBeNull();
    });

    it("タスクの経過時間が15分未満のとき、TaskTrackRecordを登録しない", () => {
      // vi.useFakeTimers() でシステム時刻を制御することで
      // new Date() と Date.now() の両方を一括してモックできる
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-01T10:00:00")); // start 時刻

      const { result } = renderHook(
        () => ({ manager: useTimer(), context: useTaskContext() }),
        { wrapper },
      );

      act(() => {
        result.current.manager.start("taskId");
      });

      // 10分後に stop する（15分未満なので trackRecord は登録されない）
      vi.setSystemTime(new Date("2024-01-01T10:10:00"));
      act(() => {
        result.current.manager.stop();
      });

      vi.useRealTimers();

      expect(result.current.context.state.trackRecords).toHaveLength(0);
      expect(result.current.manager.runningTaskId).toBeNull();
      expect(result.current.manager.startedAt).toBeNull();
    });

    it("タスクの経過時間が15分以上のとき、TaskTrackRecordに登録する", () => {
      // vi.useFakeTimers() でシステム時刻を制御することで
      // new Date() と Date.now() の両方を一括してモックできる
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-01T10:00:00")); // start 時刻

      const { result } = renderHook(
        () => ({ manager: useTimer(), context: useTaskContext() }),
        { wrapper },
      );

      act(() => {
        result.current.manager.start("taskId");
      });

      // 15分後に stop する（15分以上なので trackRecord に登録される）
      vi.setSystemTime(new Date("2024-01-01T10:15:00"));
      act(() => {
        result.current.manager.stop();
      });

      vi.useRealTimers();

      expect(result.current.context.state.trackRecords).toHaveLength(1);
      expect(result.current.manager.runningTaskId).toBeNull();
      expect(result.current.manager.startedAt).toBeNull();
    });
  });
});
