import { useContext } from "react";
import { TimerContext } from "../contexts/timerContextStore";
import type { TimerContextType } from "../contexts/timerContextStore";

function useTimerContext(): TimerContextType {
  const context = useContext(TimerContext);
  if (!context) throw new Error("TimerProvider の外で使われています");
  return context;
}

export { useTimerContext };
