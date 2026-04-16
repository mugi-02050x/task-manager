import { describe, it, expect } from "vitest";
import {
  getChildren,
  getDepth,
  getTask,
  countChildren,
  getDescendants,
} from "../../utils/taskTree";
import type { Task } from "../../types/task";

const tasks: Task[] = [
  {
    id: "task-1",
    taskName: "タスク1",
    description: "",
    status: "WAITING",
    parentId: null,
    dispOrder: 1,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "task-2",
    taskName: "タスク2",
    description: "",
    status: "WAITING",
    parentId: "task-1",
    dispOrder: 1,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "task-3",
    taskName: "タスク3",
    description: "",
    status: "WAITING",
    parentId: "task-1",
    dispOrder: 2,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "task-4",
    taskName: "タスク4",
    description: "",
    status: "WAITING",
    parentId: "task-2",
    dispOrder: 1,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "task-5",
    taskName: "タスク5",
    description: "",
    status: "WAITING",
    parentId: null,
    dispOrder: 2,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "task-6",
    taskName: "タスク6",
    description: "",
    status: "WAITING",
    parentId: "task-5",
    dispOrder: 1,
    createdAt: new Date("2024-01-01"),
  },
];

describe("taskTree", () => {
  describe("getTask", () => {
    it("対象タスクが見つかるとき、そのタスクを返す", () => {
      const task = getTask(tasks, "task-1");
      expect(task).toMatchObject({ id: "task-1" });
    });
    it("対象タスクが見つからないとき、nullを返す", () => {
      expect(getTask(tasks, "task-99")).toBeNull();
    });
  });

  describe("getChildren", () => {
    it("対象タスクが0件のとき、空のリストを返す", () => {
      const expect_val: Task[] = [];
      expect(getChildren(tasks, "task-99")).toEqual(expect_val);
    });

    // getRootTasks
    it("対象IDがnullのとき、ルートタスクの一覧を返す", () => {
      const expect_val: Task[] = [
        ...tasks.filter((task) => task.parentId === null),
      ];
      expect(getChildren(tasks, null)).toEqual(expect_val);
    });

    it("対象タスクの子タスクが1件のとき、1件返す", () => {
      const expect_val: Task[] = [
        ...tasks.filter((task) => task.id === "task-6"),
      ];
      expect(getChildren(tasks, "task-5")).toEqual(expect_val);
    });

    it("対象タスクの子タスクが複数件のとき、複数件返す", () => {
      const expect_val: Task[] = [
        ...tasks.filter((task) => task.id === "task-2" || task.id === "task-3"),
      ];

      expect(getChildren(tasks, "task-1")).toEqual(expect_val);
    });
  });

  describe("getDepth", () => {
    it("対象タスクが見つからないとき、0を返す", () => {
      expect(getDepth(tasks, "task-99")).toBe(0);
    });

    it("対象タスクがルートタスクのとき、1を返す", () => {
      expect(getDepth(tasks, "task-1")).toBe(1);
    });

    it("対象タスクのルートタスクではないとき、その階層を返す", () => {
      expect(getDepth(tasks, "task-4")).toBe(3);
    });
  });

  describe("countChildren", () => {
    it("対象タスクが見つからないとき、0を返す", () => {
      expect(countChildren(tasks, "task-99")).toBe(0);
    });

    it("対象タスクに孫タスクが存在しないとき、子タスクの数を返す", () => {
      expect(countChildren(tasks, "task-5")).toBe(1);
    });

    it("対象タスクに孫タスクが存在するとき、孫タスクを含めない子タスクの数を返す", () => {
      expect(countChildren(tasks, "task-1")).toBe(2);
    });
  });

  describe("getDescendants", () => {
    it("対象タスクが見つからないとき、空のリストを返す", () => {
      const expect_val: Task[] = [];
      expect(getDescendants(tasks, "task-99")).toEqual(expect_val);
    });

    it("対象タスクの子タスク見つからないとき、空のリストを返す", () => {
      const expect_val: Task[] = [];
      expect(getDescendants(tasks, "task-6")).toEqual(expect_val);
    });

    it("対象タスクの孫タスクが存在するとき、孫タスクを含めたタスクのリスト返す", () => {
      const expect_val: Task[] = [
        ...tasks.filter(
          (task) =>
            task.id === "task-3" ||
            task.id === "task-2" ||
            task.id === "task-4",
        ),
      ];
      expect(getDescendants(tasks, "task-1")).toEqual(expect_val);
    });
  });
});
