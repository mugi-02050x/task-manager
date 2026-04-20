import { useState } from "react";
import { useTaskOperations } from "../../../hooks/useTaskOperations";
import type { TaskStatus } from "../../../types/task";
import {
  STATUS_BADGE_STYLE,
  STATUS_LABELS,
  STATUS_OPTIONS,
} from "../../../constants/taskStatus";

const StatusBadge = ({ taskId }: { taskId: string }) => {
  const taskOperations = useTaskOperations();
  const task = taskOperations.getTask(taskId);
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
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
      className={`h-8 w-auto min-w-[4.5rem] shrink-0 whitespace-nowrap rounded-md border px-2 py-1 text-xs font-medium ${STATUS_BADGE_STYLE[task.status]}`}
    >
      {STATUS_LABELS[task.status]}
    </button>
  );
};

export default StatusBadge;
