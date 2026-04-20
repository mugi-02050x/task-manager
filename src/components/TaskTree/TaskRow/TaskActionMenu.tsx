import { useState } from "react";
import { useTaskManager } from "../../../hooks/useTaskManager";

const ACTIONS = [
  { value: "EDIT", label: "編集" },
  { value: "ADD_CHILD", label: "子タスク追加" },
  { value: "DELETE", label: "削除" },
] as const;

type Action = (typeof ACTIONS)[number]["value"];

type TaskActionMenuProps = {
  taskId: string;
  onEditTask: (taskId: string) => void;
  onAddChildTask: (parentId: string) => void;
};

const TaskActionMenu = ({
  taskId,
  onEditTask,
  onAddChildTask,
}: TaskActionMenuProps) => {
  const taskManager = useTaskManager();
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const action = e.target.value as Action;
    setIsOpen(false);
    switch (action) {
      case "EDIT":
        return onEditTask(taskId);
      case "ADD_CHILD":
        return onAddChildTask(taskId);
      case "DELETE":
        return taskManager.deleteTask(taskId);
      default:
        return;
    }
  };

  if (isOpen) {
    return (
      <select
        value=""
        onChange={handleChange}
        onBlur={() => setIsOpen(false)}
        autoFocus
      >
        <option value="" disabled>
          操作を選択
        </option>
        {ACTIONS.map((action) => (
          <option key={action.value} value={action.value}>
            {action.label}
          </option>
        ))}
      </select>
    );
  }

  return <button onClick={() => setIsOpen(true)}>...</button>;
};

export default TaskActionMenu;
