import { useTaskManager } from "../../../hooks/useTaskManager";
import { useElapsed } from "../../../hooks/useElapsed";
import StatusBadge from "./StatusBadge";
import TaskActionMenu from "./TaskActionMenu";
import Timer from "./Timer";

type TaskRowProps = {
  taskId: string;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEditTask: (taskId: string) => void;
  onAddChildTask: (parentId: string) => void;
};

const TaskRow = ({
  taskId,
  hasChildren,
  isExpanded,
  onToggleExpand,
  onEditTask,
  onAddChildTask,
}: TaskRowProps) => {
  const taskManager = useTaskManager();
  const task = taskManager.getTask(taskId);
  const elapsed = useElapsed(taskId).toFixed(2);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs md:flex md:items-center md:gap-3">
      <div className="flex items-start justify-between gap-2 md:flex-1">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          {hasChildren ? (
            <button
              type="button"
              onClick={onToggleExpand}
              className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-slate-300 bg-white text-xs text-slate-600 transition hover:bg-slate-100"
              aria-label={isExpanded ? "子タスクを折りたたむ" : "子タスクを展開する"}
            >
              {isExpanded ? "▼" : "▶"}
            </button>
          ) : (
            <span className="mt-0.5 inline-block h-6 w-6 shrink-0" aria-hidden />
          )}
          <p className="min-w-0 flex-1 break-all text-sm font-medium text-slate-900 md:text-base">
            {task.taskName}
          </p>
        </div>
        <div className="md:hidden">
          <TaskActionMenu
            taskId={taskId}
            onEditTask={onEditTask}
            onAddChildTask={onAddChildTask}
          />
        </div>
      </div>

      <div className="mt-2 flex items-center gap-3 md:mt-0 md:gap-2">
        <StatusBadge taskId={taskId} />
        <span className="text-sm font-medium tabular-nums text-slate-600 md:inline-flex md:h-8 md:w-[4.8rem] md:items-center md:justify-center md:rounded-md md:bg-slate-100 md:px-2 md:text-xs md:text-slate-700">
          {elapsed}h
        </span>
      </div>

      {!hasChildren && (
        <div className="mt-2 md:mt-0 md:shrink-0">
          <Timer taskId={taskId} fullWidth />
        </div>
      )}
      {hasChildren && (
        <div className="hidden md:block md:shrink-0">
          <Timer taskId={taskId} />
        </div>
      )}

      <div className="hidden md:block md:shrink-0">
        <TaskActionMenu
          taskId={taskId}
          onEditTask={onEditTask}
          onAddChildTask={onAddChildTask}
        />
      </div>
    </div>
  );
};

export default TaskRow;
