import { useTaskManager } from "../../../hooks/useTaskManager";
import StatusBadge from "./StatusBadge";
import TaskActionMenu from "./TaskActionMenu";
import Timer from "./Timer";

type TaskRowProps = {
  taskId: string;
  onEditTask: (taskId: string) => void;
  onAddChildTask: (parentId: string) => void;
};

const TaskRow = ({ taskId, onEditTask, onAddChildTask }: TaskRowProps) => {
  const taskManager = useTaskManager();
  const task = taskManager.getTask(taskId);

  return (
    <div className="flex items-center gap-2">
      <span>{task.taskName}</span>
      <StatusBadge taskId={taskId} />
      <Timer taskId={taskId} />
      <TaskActionMenu
        taskId={taskId}
        onEditTask={onEditTask}
        onAddChildTask={onAddChildTask}
      />
    </div>
  );
};

export default TaskRow;
