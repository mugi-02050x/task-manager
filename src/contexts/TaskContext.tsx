import { createContext, useContext, useEffect, useReducer } from "react";
import type { Dispatch, ReactNode } from "react";
import { reducer, initialState } from "../reducers/taskReducer";
import { useLocalStorage } from "../hooks/useLocalStorage";
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
  const [state, dispatch] = useReducer(reducer, storedState); // localStorage の値を初期値に

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
