import type { TaskState, TaskAction } from "../types/task";

function reducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case "ADD_TASK":
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task,
        ),
      };
    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
      };
    case "CHANGE_STATUS":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? { ...task, status: action.payload.status }
            : task,
        ),
      };
    case "ADD_TRACK_RECORD":
      return {
        ...state,
        trackRecords: [...state.trackRecords, action.payload],
      };
    case "DELETE_TRACK_RECORD":
      return {
        ...state,
        trackRecords: state.trackRecords.filter((t) => t.id !== action.payload),
      };
    case "IMPORT":
      return action.payload;
    default:
      return state; // 変更なしの場合は現在の state をそのまま返す
  }
}

const initialState: TaskState = {
  tasks: [],
  trackRecords: [],
};

// コンポーネントやカスタムフックからしか呼び出せない、
// const [taskState, taskDispatch] = useReducer(reducer, initiallState);

export { reducer, initialState };
