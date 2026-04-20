import { useState } from "react";
import type { TaskFormInput, TaskStatus } from "../../types/task";

const STATUS_OPTIONS: TaskStatus[] = ["WAITING", "WORKING", "COMPLETED"];

type TaskFormModalProps = {
  mode: "create" | "edit";
  initialValue: TaskFormInput;
  onSubmit: (input: TaskFormInput) => void;
  onClose: () => void;
};

const TaskFormModal = ({
  mode,
  initialValue,
  onSubmit,
  onClose,
}: TaskFormModalProps) => {
  const [taskName, setTaskName] = useState(initialValue.taskName);
  const [description, setDescription] = useState(initialValue.description);
  const [status, setStatus] = useState<TaskStatus>(initialValue.status);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const normalizedName = taskName.trim();
    if (!normalizedName) {
      alert("タスク名を入力してください");
      return;
    }
    onSubmit({
      taskName: normalizedName,
      description,
      status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded bg-white p-4 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">
          {mode === "create" ? "タスクを追加" : "タスクを編集"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="task-name" className="block text-sm font-medium">
              タスク名
            </label>
            <input
              id="task-name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full rounded border border-gray-300 px-2 py-1"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="task-description"
              className="block text-sm font-medium"
            >
              説明
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded border border-gray-300 px-2 py-1"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="task-status" className="block text-sm font-medium">
              ステータス
            </label>
            <select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full rounded border border-gray-300 px-2 py-1"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}>
              キャンセル
            </button>
            <button type="submit">
              {mode === "create" ? "追加する" : "更新する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;
