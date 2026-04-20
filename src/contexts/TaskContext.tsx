import { createContext, useContext, useEffect, useReducer, useRef } from "react";
import type { Dispatch, ReactNode } from "react";
import { reducer, initialState } from "../reducers/taskReducer";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { TaskStateSchema } from "../schemas/task";
import type { TaskState, TaskAction } from "../types/task";
import { APP_SETTINGS } from "../config/appSettings";

type TaskContextType = {
  state: TaskState;
  dispatch: Dispatch<TaskAction>;
  clearState: () => void;
};

const TaskContext = createContext<TaskContextType | null>(null);

type TaskProviderProps = {
  children: ReactNode;
};

function TaskProvider({ children }: TaskProviderProps) {
  const [storedState, setStoredState, removeStoredState] = useLocalStorage<TaskState>(
    "task-manager",
    initialState,
    { enabled: APP_SETTINGS.enableLocalStoragePersist },
  );
  const skipNextPersistRef = useRef(false);
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
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }
    setStoredState(state);
  }, [state, setStoredState]);

  const clearState = () => {
    skipNextPersistRef.current = true;
    removeStoredState();
    dispatch({ type: "IMPORT", payload: initialState });
  };

  return (
    <TaskContext.Provider value={{ state, dispatch, clearState }}>
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
