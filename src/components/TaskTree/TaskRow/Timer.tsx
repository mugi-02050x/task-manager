import { useTimer } from "../../../hooks/useTimer";
import { useTaskManager } from "../../../hooks/useTaskManager";

type TimerProps = {
  taskId: string;
  fullWidth?: boolean;
};

const Timer = ({ taskId, fullWidth = false }: TimerProps) => {
  const taskManager = useTaskManager();
  const timer = useTimer();
  const hasChildren = taskManager.getTaskChildren(taskId).length > 0;

  const isRunning = timer.runningTaskId === taskId;
  const sizeClass = fullWidth
    ? "h-10 w-full text-sm"
    : "h-8 w-[4.6rem] text-xs";

  if (hasChildren) {
    return (
      <button
        type="button"
        disabled
        aria-label="子タスクを持つため計測できません"
        className={`shrink-0 cursor-not-allowed rounded-md bg-slate-200 px-2 py-1 font-medium whitespace-nowrap text-slate-400 shadow-xs ${sizeClass}`}
      >
        ▶ 開始
      </button>
    );
  }

  return (
    <button
      onClick={() => (isRunning ? timer.stop() : timer.start(taskId))}
      className={`shrink-0 rounded-md px-2 py-1 font-medium whitespace-nowrap text-white shadow-sm transition ${sizeClass} ${
        isRunning
          ? "bg-rose-600 hover:bg-rose-500"
          : "bg-sky-600 hover:bg-sky-500"
      }`}
    >
      {isRunning ? "■ 停止" : "▶ 開始"}
    </button>
  );
};

export default Timer;
