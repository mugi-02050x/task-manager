import { useState, type ReactNode } from "react";
import { TimerContext } from "./timerContextStore";

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

export { TimerProvider };
