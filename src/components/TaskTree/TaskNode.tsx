import { useTaskManager } from "../../hooks/useTaskManager";
import TaskRow from "./TaskRow/TaskRow";

type TaskNodeProps = {
  id: string;
  onEditTask: (taskId: string) => void;
  onAddChildTask: (parentId: string) => void;
};

const TaskNode = ({ id, onEditTask, onAddChildTask }: TaskNodeProps) => {
  const taskManager = useTaskManager();
  const task = taskManager.getTask(id);
  return (
    <>
      <TaskRow
        taskId={task.id}
        onEditTask={onEditTask}
        onAddChildTask={onAddChildTask}
      />
      <ul className="ml-8 border-l border-gray-300 pl-2">
        {taskManager.getTaskChildren(task.id).map((childTask) => (
          <li key={childTask.id}>
            <TaskNode
              id={childTask.id}
              onEditTask={onEditTask}
              onAddChildTask={onAddChildTask}
            />
          </li>
        ))}
      </ul>
    </>
  );
};

export default TaskNode;
