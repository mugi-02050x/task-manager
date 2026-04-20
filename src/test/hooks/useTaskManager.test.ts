import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { TaskProvider, useTaskContext } from "../../contexts/TaskContext";
import { useTaskManager } from "../../hooks/useTaskManager";
import type {
  CreateTaskParams,
  UpdateTaskParams,
  TaskFormInput,
} from "../../types/task";

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

const formInput: TaskFormInput = {
  taskName: "フォーム入力",
  description: "フォーム説明",
  status: "WORKING",
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
      act(() => {
        result.current.addTask(rootParams);
      });
      const task = result.current.tasks[0];
      act(() => {
        result.current.updateTask(task.id, updateParams);
      });
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

  describe("saveTask", () => {
    it("create モードではタスクが追加される", () => {
      const { result } = renderHook(() => useTaskManager(), { wrapper });

      act(() => {
        result.current.saveTask({
          mode: "create",
          parentId: null,
          input: formInput,
        });
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0]).toMatchObject({
        ...formInput,
        parentId: null,
      });
    });

    it("edit モードでは既存タスクが更新される", () => {
      const { result } = renderHook(() => useTaskManager(), { wrapper });
      act(() => {
        result.current.addTask(rootParams);
      });
      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.saveTask({
          mode: "edit",
          taskId,
          input: formInput,
        });
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0]).toMatchObject(formInput);
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
        act(() => {
          result.current.deleteTask("unknownId");
        });
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

  describe("getTask", () => {
    it("対象タスクが存在するとき、そのタスクを返す", () => {
      const { result } = renderHook(() => useTaskManager(), { wrapper });
      act(() => {
        result.current.addTask(rootParams);
      });

      const taskId = result.current.tasks[0].id;
      const task = result.current.getTask(taskId);

      expect(task).toMatchObject(rootParams);
    });

    it("対象タスクが存在しないとき、エラーをスローする", () => {
      const { result } = renderHook(() => useTaskManager(), { wrapper });
      act(() => {
        result.current.addTask(rootParams);
      });

      const taskId = "unknownId";

      expect(() => {
        act(() => {
          result.current.getTask(taskId);
        });
      }).toThrow("対象タスクが存在しません");
    });
  });

  describe("importState", () => {
    it("正しいJSON文字列を渡すと、stateがインポートされる", () => {
      const { result } = renderHook(
        () => ({ manager: useTaskManager(), context: useTaskContext() }),
        { wrapper },
      );
      const jsonStr = JSON.stringify({
        tasks: [
          {
            id: "task-1",
            taskName: "タスク1",
            description: "",
            status: "WAITING",
            parentId: null,
            dispOrder: 1,
            createdAt: new Date("2024-01-01"),
          },
        ],
        trackRecords: [
          {
            id: "record-1",
            taskId: "task-1",
            startDatetime: new Date("2024-01-01T10:00:00"),
            endDatetime: new Date("2024-01-01T11:00:00"),
          },
        ],
      });

      act(() => {
        result.current.manager.importState(jsonStr);
      });
      expect(result.current.context.state.tasks).toHaveLength(1);
      expect(result.current.context.state.trackRecords).toHaveLength(1);
    });

    it("不正なJSON文字列を渡すと、エラーをスローする", () => {
      const { result } = renderHook(
        () => ({ manager: useTaskManager(), context: useTaskContext() }),
        { wrapper },
      );
      const jsonStr = JSON.stringify({
        trackRecords: [
          {
            id: "task-1",
            taskName: "タスク1",
            description: "",
            status: "WAITING",
            parentId: null,
            dispOrder: 1,
            createdAt: new Date("2024-01-01"),
          },
        ],
        tasks: [
          {
            id: "record-1",
            taskId: "task-1",
            startDatetime: new Date("2024-01-01T10:00:00"),
            endDatetime: new Date("2024-01-01T11:00:00"),
          },
        ],
      });
      expect(() => {
        act(() => {
          result.current.manager.importState(jsonStr);
        });
      }).toThrow("不正なファイル形式です");

      expect(result.current.context.state.tasks).toHaveLength(0);
      expect(result.current.context.state.trackRecords).toHaveLength(0);
    });
  });

  describe("exportState", () => {
    it("現在のstateをJSONファイルとしてダウンロードする", () => {
      const { result } = renderHook(() => useTaskManager(), { wrapper });

      // ブラウザAPIをモック
      const mockClick = vi.fn();
      const mockAnchor = { href: "", download: "", click: mockClick };
      vi.spyOn(document, "createElement").mockReturnValue(
        mockAnchor as unknown as HTMLElement,
      );
      vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
      vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

      act(() => {
        result.current.addTask(rootParams);
      });
      act(() => {
        result.current.exportState();
      });

      expect(mockAnchor.download).toBe("task-manager.json");
      expect(mockClick).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
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

  describe("clearState", () => {
    it("stateを初期化し、localStorageからも削除する", () => {
      const { result } = renderHook(
        () => ({ manager: useTaskManager(), context: useTaskContext() }),
        { wrapper },
      );

      act(() => {
        result.current.manager.addTask(rootParams);
      });
      expect(result.current.manager.tasks).toHaveLength(1);
      expect(localStorage.getItem("task-manager")).not.toBeNull();

      act(() => {
        result.current.manager.clearState();
      });

      expect(result.current.context.state.tasks).toHaveLength(0);
      expect(result.current.context.state.trackRecords).toHaveLength(0);
      expect(localStorage.getItem("task-manager")).toBeNull();
    });
  });
});
