import { TASK_STATUSES, type TaskStatus } from "../types/task";

const STATUS_OPTIONS: TaskStatus[] = [...TASK_STATUSES];

const STATUS_LABELS: Record<TaskStatus, string> = {
  WAITING: "未着手",
  WORKING: "進行中",
  COMPLETED: "完了",
};

const STATUS_BADGE_STYLE: Record<TaskStatus, string> = {
  WAITING: "border-slate-300 bg-slate-100 text-slate-700",
  WORKING: "border-amber-200 bg-amber-100 text-amber-700",
  COMPLETED: "border-emerald-200 bg-emerald-100 text-emerald-700",
};

export { STATUS_OPTIONS, STATUS_LABELS, STATUS_BADGE_STYLE };
