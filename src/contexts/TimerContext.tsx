import { createContext, useContext, useState, type ReactNode } from "react";

type TimerContextType = {
  runningTaskId: string | null;
  startedAt: Date | null;
  setRunningTaskId: (id: string | null) => void;
  setStartedAt: (date: Date | null) => void;
};

const TimerContext = createContext<TimerContextType | null>(null);

type TimerProviderProps = {
  children: ReactNode;
};

function TimerProvider({ children }: TimerProviderProps) {
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<Date | null>(null);

  return (
    <TimerContext.Provider
      value={{ runningTaskId, startedAt, setRunningTaskId, setStartedAt }}
    >
      {children}
    </TimerContext.Provider>
  );
}

function useTimerContext() {
  const context = useContext(TimerContext);
  if (!context) throw new Error("TimerProvider の外で使われています");
  return context;
}

export { TimerProvider, useTimerContext };
