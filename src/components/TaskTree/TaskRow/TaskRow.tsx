import { useTaskManager } from "../../../hooks/useTaskManager";
import StatusBadge from "./StatusBadge";
import TaskActionMenu from "./TaskActionMenu";
import Timer from "./Timer";

const TaskRow = ({ taskId }: { taskId: string }) => {
  const taskManager = useTaskManager();
  const task = taskManager.getTask(taskId);

  return (
    <div className="flex items-center gap-2">
      <span>{task.taskName}</span>
      <StatusBadge taskId={taskId} />
      <Timer taskId={taskId} />
      <TaskActionMenu taskId={taskId} />
    </div>
  );
};

export default TaskRow;
