import { useTaskManager } from "../../hooks/useTaskManager";
import TaskRow from "./TaskRow/TaskRow";

const TaskNode = ({ id }: { id: string }) => {
  const taskManager = useTaskManager();
  const task = taskManager.getTask(id);
  return (
    <>
      <TaskRow taskId={task.id} />
      <ul className="ml-8 border-l border-gray-300 pl-2">
        {taskManager.getTaskChildren(task.id).map((childTask) => (
          <li key={childTask.id}>
            <TaskNode id={childTask.id} />
          </li>
        ))}
      </ul>
    </>
  );
};

export default TaskNode;
