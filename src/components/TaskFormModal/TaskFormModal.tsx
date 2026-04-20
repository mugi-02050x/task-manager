import { useState } from "react";
import type { TaskFormInput, TaskStatus } from "../../types/task";

const STATUS_OPTIONS: TaskStatus[] = ["WAITING", "WORKING", "COMPLETED"];
const STATUS_LABELS: Record<TaskStatus, string> = {
  WAITING: "未着手",
  WORKING: "進行中",
  COMPLETED: "完了",
};

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl md:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {mode === "create" ? "タスクを追加" : "タスクを編集"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 transition hover:bg-slate-100"
          >
            閉じる
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="task-name"
              className="block text-sm font-medium text-slate-700"
            >
              タスク名
            </label>
            <input
              id="task-name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="例: ドキュメント作成"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="task-description"
              className="block text-sm font-medium text-slate-700"
            >
              説明
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="必要ならタスクの目的やメモを入力"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="task-status"
              className="block text-sm font-medium text-slate-700"
            >
              ステータス
            </label>
            <select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {STATUS_LABELS[option]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-500"
            >
              {mode === "create" ? "追加する" : "更新する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;
