import { useEffect, useReducer, useRef } from "react";
import type { ReactNode } from "react";
import { reducer, initialState } from "../reducers/taskReducer";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { TaskStateSchema } from "../schemas/task";
import type { TaskState } from "../types/task";
import { APP_SETTINGS } from "../config/appSettings";
import { TaskContext } from "./taskContextStore";

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

export { TaskProvider };
