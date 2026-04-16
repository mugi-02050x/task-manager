import { z } from "zod";

const TaskStatusSchema = z.enum(["WAITING", "WORKING", "COMPLETED"]);

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

const TaskStateSchema = z.object({
  tasks: z.array(TaskSchema),
  trackRecords: z.array(TaskTrackRecordSchema),
});

export { TaskStateSchema };
