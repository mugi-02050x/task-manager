import { useContext } from "react";
import { TaskContext } from "../contexts/taskContextStore";
import type { TaskContextType } from "../contexts/taskContextStore";

function useTaskContext(): TaskContextType {
  const context = useContext(TaskContext);
  if (!context) throw new Error("TaskProvider の外で使われています");
  return context;
}

export { useTaskContext };
