import { useTaskManager } from "../../hooks/useTaskManager";
import TaskNode from "./TaskNode";

const TaskTree = () => {
  const taskManager = useTaskManager();
  return (
    <>
      <div className="flex justify-end">
        {/* TODO: タスク追加モーダル実装後に反映 */}
        <button onClick={() => alert("モーダルを開く")}>タスクを追加</button>
      </div>
      <div>
        <ul>
          {taskManager.getTaskRoots().map((rootTask) => (
            <li key={rootTask.id}>
              <TaskNode id={rootTask.id} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default TaskTree;
