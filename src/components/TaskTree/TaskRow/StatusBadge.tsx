import { useState } from "react";
import { useTaskOperations } from "../../../hooks/useTaskOperations";
import type { TaskStatus } from "../../../types/task";

const STATUS_LABELS: Record<TaskStatus, string> = {
  WAITING: "未着手",
  WORKING: "進行中",
  COMPLETED: "完了",
};

const STATUS_OPTIONS: TaskStatus[] = ["WAITING", "WORKING", "COMPLETED"];
const STATUS_STYLE: Record<TaskStatus, string> = {
  WAITING: "border-slate-300 bg-slate-100 text-slate-700",
  WORKING: "border-amber-200 bg-amber-100 text-amber-700",
  COMPLETED: "border-emerald-200 bg-emerald-100 text-emerald-700",
};

const StatusBadge = ({ taskId }: { taskId: string }) => {
  const taskOperations = useTaskOperations();
  const task = taskOperations.getTask(taskId);
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TaskStatus;
    if (newStatus !== task.status) {
      taskOperations.changeStatus(taskId, newStatus);
    }
    setIsOpen(false);
  };

  if (isOpen) {
    return (
      <select
        value={task.status}
        onChange={handleChange}
        onBlur={() => setIsOpen(false)}
        autoFocus
        className="h-8 w-auto min-w-[4.5rem] shrink-0 whitespace-nowrap rounded-md border border-slate-300 bg-white px-2 py-1 text-center text-xs text-slate-700 focus:border-sky-500 focus:outline-none"
      >
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>
    );
  }

  return (
    <button
      onClick={() => setIsOpen(true)}
      className={`h-8 w-auto min-w-[4.5rem] shrink-0 whitespace-nowrap rounded-md border px-2 py-1 text-xs font-medium ${STATUS_STYLE[task.status]}`}
    >
      {STATUS_LABELS[task.status]}
    </button>
  );
};

export default StatusBadge;
