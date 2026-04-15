import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { TaskProvider, useTaskContext } from "../../contexts/TaskContext";
import { useTaskManager } from "../../hooks/useTaskManager";
import type { CreateTaskParams, UpdateTaskParams } from "../../types/task";

const wrapper = ({ children }: { children: React.ReactNode }) =>
  TaskProvider({ children });

const rootParams: CreateTaskParams = {
  taskName: "タスク1",
  description: "説明1",
  status: "WAITING",
  parentId: null,
};

const updateParams: UpdateTaskParams = {
  taskName: "タスク2",
  description: "説明2",
  status: "COMPLETED",
};

describe("useTaskManager", () => {
  describe("addTask", () => {
    it("タスクを追加すると tasks に追加される", () => {
      const { result } = renderHook(() => useTaskManager(), { wrapper });
      act(() => {
        result.current.addTask(rootParams);
      });
      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0]).toMatchObject(rootParams);
    });

    it("ルートタスクの dispOrder は既存のルートタスク件数 + 1 になる", () => {
      const { result } = renderHook(() => useTaskManager(), { wrapper });
      // act を分けることで、1回目の addTask の state 更新が完了してから
      // 2回目の addTask が実行される（同一 act 内では state が更新されないため）
      act(() => {
        result.current.addTask(rootParams);
      });
      act(() => {
        result.current.addTask(rootParams);
      });
      expect(result.current.tasks[0].dispOrder).toBe(1);
      expect(result.current.tasks[1].dispOrder).toBe(2);
    });

    it("子タスクの dispOrder は既存の子タスク件数 + 1 になる", () => {
      const { result } = renderHook(() => useTaskManager(), { wrapper });
      act(() => {
        result.current.addTask(rootParams);
      });
      const parentId = result.current.tasks[0].id;
      // act を分けることで、1回目の addTask の state 更新が完了してから
      // 2回目の addTask が実行される（同一 act 内では state が更新されないため）
      act(() => {
        result.current.addTask({ ...rootParams, parentId });
      });
      act(() => {
        result.current.addTask({ ...rootParams, parentId });
      });
      const children = result.current.tasks.filter(
        (t) => t.parentId === parentId,
      );
      expect(children[0].dispOrder).toBe(1);
      expect(children[1].dispOrder).toBe(2);
    });

    it("親タスクの深さが5のとき、子タスクの追加でエラーになる", () => {
      const { result } = renderHook(() => useTaskManager(), { wrapper });
      // 5階層のタスクを作成
      act(() => {
        result.current.addTask(rootParams); // 深さ1
      });
      let parentId = result.current.tasks[0].id;
      for (let i = 0; i < 4; i++) {
        act(() => {
          result.current.addTask({ ...rootParams, parentId });
        });
        parentId = result.current.tasks[result.current.tasks.length - 1].id;
      }
      // 深さ6になる子タスクの追加でエラー
      expect(() => {
        act(() => {
          result.current.addTask({ ...rootParams, parentId });
        });
      }).toThrow("タスク階層の上限を超えています");
    });

    it("子タスクが20件のとき、子タスクの追加でエラーになる", () => {
      const { result } = renderHook(() => useTaskManager(), { wrapper });
      act(() => {
        result.current.addTask(rootParams);
      });
      const parentId = result.current.tasks[0].id;
      // 20件の子タスクを追加
      act(() => {
        for (let i = 0; i < 20; i++) {
          result.current.addTask({ ...rootParams, parentId });
        }
      });
      expect(() => {
        act(() => {
          result.current.addTask({ ...rootParams, parentId });
        });
      }).toThrow("子タスクの上限を超えています");
    });
  });

  describe("updateTask", () => {
    it("タスクを更新すると tasks が更新される", () => {
      const { result } = renderHook(() => useTaskManager(), { wrapper });
      act(() => {
        result.current.addTask(rootParams);
      });
      const taskId = result.current.tasks[0].id;
      act(() => {
        result.current.updateTask(taskId, updateParams);
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0]).toMatchObject(updateParams);
    });
    it("更新対象外のフィールドは変更されない", () => {
      const { result } = renderHook(() => useTaskManager(), { wrapper });
      act(() => { result.current.addTask(rootParams); });
      const task = result.current.tasks[0];
      act(() => { result.current.updateTask(task.id, updateParams); });
      expect(result.current.tasks[0]).toMatchObject({
        id: task.id,
        parentId: task.parentId,
        dispOrder: task.dispOrder,
        createdAt: task.createdAt,
      });
    });

    it("存在しないタスクを更新するとエラーになる", () => {
      const { result } = renderHook(() => useTaskManager(), { wrapper });
      // act を分けることで、1回目の addTask の state 更新が完了してから
      // 2回目の addTask が実行される（同一 act 内では state が更新されないため）
      act(() => {
        result.current.addTask(rootParams);
      });
      expect(() => {
        act(() => {
          result.current.updateTask("unknownId", { ...rootParams });
        });
      }).toThrow("更新対象が存在しません");
    });
  });

  describe("deleteTask", () => {
    it("タスクを削除すると tasks から削除される", () => {
      const { result } = renderHook(() => useTaskManager(), { wrapper });
      act(() => {
        result.current.addTask(rootParams);
      });
      const taskId = result.current.tasks[0].id;
      act(() => {
        result.current.deleteTask(taskId);
      });
      expect(result.current.tasks).toHaveLength(0);
    });

    it("子タスクが存在するとき、子タスクも合わせて削除される", () => {
      const { result } = renderHook(() => useTaskManager(), { wrapper });
      act(() => {
        result.current.addTask(rootParams);
      });
      const parentId = result.current.tasks[0].id;
      act(() => {
        result.current.addTask({ ...rootParams, parentId });
      });
      act(() => {
        result.current.deleteTask(parentId);
      });
      expect(result.current.tasks).toHaveLength(0);
    });

    it("存在しないタスクを削除してもエラーにならない", () => {
      const { result } = renderHook(() => useTaskManager(), { wrapper });
      expect(() => {
        act(() => { result.current.deleteTask("unknownId"); });
      }).not.toThrow();
    });

    it("関連する trackRecords も合わせて削除される", () => {
      const { result } = renderHook(
        () => ({ manager: useTaskManager(), context: useTaskContext() }),
        { wrapper },
      );
      act(() => {
        result.current.manager.addTask(rootParams);
      });
      const taskId = result.current.manager.tasks[0].id;
      // trackRecord を直接 dispatch で追加
      act(() => {
        result.current.context.dispatch({
          type: "ADD_TRACK_RECORD",
          payload: {
            id: "record-1",
            taskId,
            startDatetime: new Date("2024-01-01T10:00:00"),
            endDatetime: new Date("2024-01-01T11:00:00"),
          },
        });
      });
      act(() => {
        result.current.manager.deleteTask(taskId);
      });
      expect(result.current.context.state.trackRecords).toHaveLength(0);
    });
  });

  describe("changeStatus", () => {
    it("ステータスを変更すると tasks のステータスが更新される", () => {
      const { result } = renderHook(() => useTaskManager(), { wrapper });
      act(() => {
        result.current.addTask(rootParams);
      });
      const taskId = result.current.tasks[0].id;
      act(() => {
        result.current.changeStatus(taskId, "COMPLETED");
      });
      expect(result.current.tasks[0].status).toBe("COMPLETED");
    });
  });
});
