// Main
type TaskStatus = "WAITING" | "WORKING" | "COMPLETED";

type Task = {
  id: string;
  taskName: string;
  description: string;
  status: TaskStatus;
  parentId: string | null;
  dispOrder: number;
  createdAt: Date;
};

type TaskTrackRecord = {
  id: string;
  taskId: string;
  startDatetime: Date;
  endDatetime: Date;
};

// State
type TaskState = {
  tasks: Array<Task>;
  trackRecords: Array<TaskTrackRecord>;
};

// Action
type AddTaskAction = {
  type: "ADD_TASK";
  payload: Task;
};

type UpdateTaskAction = {
  type: "UPDATE_TASK";
  payload: Task;
};

type DeleteTaskAction = {
  type: "DELETE_TASK";
  payload: string; // タスクID
};

type ChangeStatusAction = {
  type: "CHANGE_STATUS";
  payload: { id: string; status: TaskStatus };
};

type AddTrackRecordAction = {
  type: "ADD_TRACK_RECORD";
  payload: TaskTrackRecord;
};

type DeleteTrackRecordAction = {
  type: "DELETE_TRACK_RECORD";
  payload: string; // 実績レコードID
};

type ImportAction = {
  type: "IMPORT";
  payload: TaskState;
};

type TaskAction =
  | AddTaskAction
  | UpdateTaskAction
  | DeleteTaskAction
  | ChangeStatusAction
  | AddTrackRecordAction
  | DeleteTrackRecordAction
  | ImportAction;

type CreateTaskParams = {
  taskName: string;
  description: string;
  status: TaskStatus;
  parentId: string | null;
};

type UpdateTaskParams = {
  taskName: string;
  description: string;
  status: TaskStatus;
};

export type {
  TaskStatus,
  Task,
  TaskTrackRecord,
  TaskState,
  TaskAction,
  CreateTaskParams,
  UpdateTaskParams,
};
