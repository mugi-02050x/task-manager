import { createContext } from "react";

type TimerContextType = {
  runningTaskId: string | null;
  startedAt: Date | null;
  setRunningTaskId: (id: string | null) => void;
  setStartedAt: (date: Date | null) => void;
};

const TimerContext = createContext<TimerContextType | null>(null);

export { TimerContext };
export type { TimerContextType };
