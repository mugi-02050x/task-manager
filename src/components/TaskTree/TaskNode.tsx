import { useState } from "react";
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
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = children.length > 0;

  return (
    <>
      <TaskRow
        taskId={task.id}
        hasChildren={hasChildren}
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded((prev) => !prev)}
        onEditTask={onEditTask}
        onAddChildTask={onAddChildTask}
      />
      {hasChildren && isExpanded && (
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
