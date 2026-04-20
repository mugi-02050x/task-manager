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
  const children = taskManager.getTaskChildren(task.id);

  return (
    <>
      <TaskRow
        taskId={task.id}
        onEditTask={onEditTask}
        onAddChildTask={onAddChildTask}
      />
      {children.length > 0 && (
        <ul className="mt-2 ml-2 space-y-2 border-l border-slate-300 pl-2 md:ml-5 md:pl-4">
          {children.map((childTask) => (
            <li key={childTask.id}>
              <TaskNode
                id={childTask.id}
                onEditTask={onEditTask}
                onAddChildTask={onAddChildTask}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default TaskNode;
