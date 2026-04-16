import { useTimer } from "../../../hooks/useTimer";
import { useTaskManager } from "../../../hooks/useTaskManager";
import { useElapsed } from "../../../hooks/useElapsed";

const Timer = ({ taskId }: { taskId: string }) => {
  const taskManager = useTaskManager();
  const timer = useTimer();
  const hasChildren = taskManager.getTaskChildren(taskId).length > 0;

  const isRunning = timer.runningTaskId === taskId;

  return (
    <div className="flex items-center gap-1">
      {!hasChildren && (
        <button
          onClick={() => (isRunning ? timer.stop() : timer.start(taskId))}
        >
          {isRunning ? "■ 停止" : "▶ 開始"}
        </button>
      )}
      実績: {useElapsed(taskId)}
    </div>
  );
};

export default Timer;
