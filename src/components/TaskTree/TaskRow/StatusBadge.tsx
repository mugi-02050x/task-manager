import { useState } from "react";
import { useTaskManager } from "../../../hooks/useTaskManager";
import type { TaskStatus } from "../../../types/task";

const STATUS_LABELS: Record<TaskStatus, string> = {
  WAITING: "未着手",
  WORKING: "進行中",
  COMPLETED: "完了",
};

const STATUS_OPTIONS: TaskStatus[] = ["WAITING", "WORKING", "COMPLETED"];

const StatusBadge = ({ taskId }: { taskId: string }) => {
  const taskManager = useTaskManager();
  const task = taskManager.getTask(taskId);
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TaskStatus;
    if (newStatus !== task.status) {
      taskManager.changeStatus(taskId, newStatus);
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
    <button onClick={() => setIsOpen(true)}>
      {STATUS_LABELS[task.status]}
    </button>
  );
};

export default StatusBadge;
