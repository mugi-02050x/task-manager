import { createContext } from "react";
import type { Dispatch } from "react";
import type { TaskAction, TaskState } from "../types/task";

type TaskContextType = {
  state: TaskState;
  dispatch: Dispatch<TaskAction>;
  clearState: () => void;
};

const TaskContext = createContext<TaskContextType | null>(null);

export { TaskContext };
export type { TaskContextType };
