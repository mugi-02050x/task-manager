import { z } from "zod";
import { TASK_STATUSES } from "../types/task";
import { countChildren, getDepth } from "../utils/taskTree";

const TaskStatusSchema = z.enum(TASK_STATUSES);

const TaskSchema = z.object({
  id: z.string(),
  taskName: z.string(),
  description: z.string(),
  status: TaskStatusSchema,
  parentId: z.string().nullable(),
  dispOrder: z.number(),
  createdAt: z.coerce.date(),
});

const TaskTrackRecordSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  startDatetime: z.coerce.date(),
  endDatetime: z.coerce.date(),
});

const TaskStateSchema = z
  .object({
    tasks: z.array(TaskSchema),
    trackRecords: z.array(TaskTrackRecordSchema),
  })
  .superRefine((state, ctx) => {
    const taskIds = new Set(state.tasks.map((task) => task.id));
    const taskMap = new Map(state.tasks.map((task) => [task.id, task]));
    const trackRecordIds = new Set(
      state.trackRecords.map((trackRecord) => trackRecord.id),
    );

    const hasCycle = (taskId: string): boolean => {
      const visited = new Set<string>();
      let currentId: string | null = taskId;

      while (currentId !== null) {
        if (visited.has(currentId)) return true;
        visited.add(currentId);

        const currentTask = taskMap.get(currentId);
        if (!currentTask) return false;
        currentId = currentTask.parentId;
      }

      return false;
    };

    // 重複 task.id は import 失敗
    if (state.tasks.length !== taskIds.size) {
      ctx.addIssue({
        code: "custom",
        message: "タスクIDが重複しています。",
      });
    }

    for (const task of state.tasks) {
      // 存在しない parentId は import 失敗
      if (task.parentId !== null && !taskIds.has(task.parentId)) {
        ctx.addIssue({
          code: "custom",
          message: "存在しない親タスクを参照しています",
        });
      }

      // 循環参照は import 失敗
      if (hasCycle(task.id)) {
        ctx.addIssue({
          code: "custom",
          message: "タスクの親子関係が循環しています",
        });
      } else if (getDepth(state.tasks, task.id) > 5) {
        // 階層6以上は import 失敗
        // 循環していない場合のみ確認(getDepthは循環参照に未対応)
        ctx.addIssue({
          code: "custom",
          message: "タスク階層の上限を超えています",
        });
      }

      // 子タスク21件は import 失敗
      if (countChildren(state.tasks, task.id) > 20) {
        ctx.addIssue({
          code: "custom",
          message: "子タスクの上限を超えています",
        });
      }
    }

    // 重複 trackRecord.id は import 失敗
    if (state.trackRecords.length !== trackRecordIds.size) {
      ctx.addIssue({
        code: "custom",
        message: "実績IDが重複しています。",
      });
    }

    for (const trackRecord of state.trackRecords) {
      // 存在しない taskId を持つ trackRecord は import 失敗
      if (!taskIds.has(trackRecord.taskId)) {
        ctx.addIssue({
          code: "custom",
          message: "存在しないタスクの実績があります",
        });
      }

      // endDatetime < startDatetime は import 失敗
      if (trackRecord.endDatetime < trackRecord.startDatetime) {
        ctx.addIssue({
          code: "custom",
          message: "開始時刻と終了時刻が逆転している実績があります",
        });
      }
    }
  });

export { TaskStateSchema };
