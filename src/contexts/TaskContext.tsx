import { createContext, useContext, useEffect, useReducer } from "react";
import type { Dispatch, ReactNode } from "react";
import { reducer, initialState } from "../reducers/taskReducer";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { TaskStateSchema } from "../schemas/task";
import type { TaskState, TaskAction } from "../types/task";

type TaskContextType = {
  state: TaskState;
  dispatch: Dispatch<TaskAction>;
};

const TaskContext = createContext<TaskContextType | null>(null);

type TaskProviderProps = {
  children: ReactNode;
};

function TaskProvider({ children }: TaskProviderProps) {
  const [storedState, setStoredState] = useLocalStorage<TaskState>(
    "task-manager",
    initialState,
  );
  // useReducer の第3引数（initializer）で zod スキーマを通し、
  // localStorage から復元した日付文字列を Date 型に変換する
  const [state, dispatch] = useReducer(reducer, storedState, (s) => {
    try {
      return TaskStateSchema.parse(s);
    } catch {
      return initialState;
    }
  });

  // state が変わるたびに localStorage に保存する
  useEffect(() => {
    setStoredState(state);
  }, [state]);

  return (
    <TaskContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
}

function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) throw new Error("TaskProvider の外で使われています");
  return context;
}

export { TaskProvider, useTaskContext };
