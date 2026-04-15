import { describe, it, expect } from "vitest";
import { initialState, reducer } from "../../reducers/taskReducer.ts";
import type {
  Task,
  TaskTrackRecord,
  TaskAction,
  TaskState,
  TaskStatus,
} from "../../types/task.ts";

const newTask: Task = {
  id: "task-1",
  taskName: "テストタスク",
  description: "",
  status: "WAITING",
  parentId: null,
  dispOrder: 1,
  createdAt: new Date("2024-01-01"),
};

describe("taskReducer", () => {
  // add
  it("ADD_TASK を dispatch すると tasks に追加される", () => {
    const state: TaskState = initialState;
    const action: TaskAction = { type: "ADD_TASK", payload: newTask };

    const nextState = reducer(state, action);

    expect(nextState.tasks).toHaveLength(1);
    expect(nextState.trackRecords).toHaveLength(0);
  });

  it("UPDATE_TASKをdispatchするとき、idが一致しているtaskが更新される", () => {
    const state: TaskState = { tasks: [newTask], trackRecords: [] };
    const updateTask: Task = {
      ...newTask,
      taskName: "更新タスク",
      description: "更新後の説明",
      status: "WORKING",
      dispOrder: 2,
    };

    const action: TaskAction = { type: "UPDATE_TASK", payload: updateTask };

    const nextState = reducer(state, action);

    expect(nextState.tasks).toHaveLength(1);
    expect(nextState.tasks[0]).toEqual(updateTask);
    expect(nextState.trackRecords).toHaveLength(0);
  });

  it("UPDATE_TASKをdispatchするかつ、payload.idと一致するtaskが存在しないとき、更新されない", () => {
    const state: TaskState = { tasks: [newTask], trackRecords: [] };
    const updateTask: Task = {
      ...newTask,
      id: "task-2",
      taskName: "更新タスク",
      description: "更新後の説明",
      status: "WORKING",
      dispOrder: 2,
    };

    const action: TaskAction = { type: "UPDATE_TASK", payload: updateTask };

    const nextState = reducer(state, action);

    expect(nextState.tasks).toHaveLength(1);
    expect(nextState.tasks[0]).toEqual(newTask);
    expect(nextState.trackRecords).toHaveLength(0);
  });

  it("DELETE_TASKをdispatchするとき、idが一致するtaskが削除される", () => {
    const state: TaskState = { tasks: [newTask], trackRecords: [] };
    const action: TaskAction = { type: "DELETE_TASK", payload: newTask.id };

    const nextState = reducer(state, action);

    expect(nextState.tasks).toHaveLength(0);
    expect(nextState.trackRecords).toHaveLength(0);
  });

  it("DELETE_TASKをdispatchするかつ、payload.idと一致するtaskが存在しないとき、削除されない", () => {
    const state: TaskState = { tasks: [newTask], trackRecords: [] };
    const action: TaskAction = { type: "DELETE_TASK", payload: "unknownId" };

    const nextState = reducer(state, action);

    expect(nextState.tasks).toHaveLength(1);
    expect(nextState.trackRecords).toHaveLength(0);
  });
  it("CHANGE_STATUSをdispatchするとき、idが一致するtaskのstatusが更新される", () => {
    const state: TaskState = { tasks: [newTask], trackRecords: [] };
    const updateStatus: TaskStatus = "COMPLETED";
    const action: TaskAction = {
      type: "CHANGE_STATUS",
      payload: { id: newTask.id, status: updateStatus },
    };

    const nextState = reducer(state, action);

    expect(nextState.tasks).toHaveLength(1);
    expect(nextState.tasks[0]).toEqual({ ...newTask, status: updateStatus });
    expect(nextState.trackRecords).toHaveLength(0);
  });

  it("CHANGE_STATUSをdispatchするかつ、payload.idと一致するtaskが存在しないとき、更新されない", () => {
    const state: TaskState = { tasks: [newTask], trackRecords: [] };
    const updateStatus: TaskStatus = "COMPLETED";
    const action: TaskAction = {
      type: "CHANGE_STATUS",
      payload: { id: "unknownId", status: updateStatus },
    };

    const nextState = reducer(state, action);

    expect(nextState.tasks).toHaveLength(1);
    expect(nextState.tasks[0]).toEqual(newTask);
    expect(nextState.trackRecords).toHaveLength(0);
  });
  it("ADD_TRACK_RECORDをdispatchするとき、trackRecordsに登録される", () => {
    const trackRecord: TaskTrackRecord = {
      id: "record-1",
      taskId: newTask.id,
      startDatetime: new Date("2024-01-01T10:00:00"),
      endDatetime: new Date("2024-01-01T11:00:00"),
    };
    const state: TaskState = initialState;
    const action: TaskAction = {
      type: "ADD_TRACK_RECORD",
      payload: trackRecord,
    };

    const nextState = reducer(state, action);

    expect(nextState.trackRecords).toHaveLength(1);
    expect(nextState.trackRecords[0]).toEqual(trackRecord);
  });

  it("DELETE_TRACK_RECORDをdispatchするとき、idが一致するtrackRecordが削除される", () => {
    const trackRecord: TaskTrackRecord = {
      id: "record-1",
      taskId: newTask.id,
      startDatetime: new Date("2024-01-01T10:00:00"),
      endDatetime: new Date("2024-01-01T11:00:00"),
    };
    const state: TaskState = { tasks: [], trackRecords: [trackRecord] };
    const action: TaskAction = {
      type: "DELETE_TRACK_RECORD",
      payload: trackRecord.id,
    };

    const nextState = reducer(state, action);

    expect(nextState.trackRecords).toHaveLength(0);
  });

  it("IMPORTをdispatchするとき、payloadでstateが置き換えられる", () => {
    const importState: TaskState = {
      tasks: [newTask],
      trackRecords: [
        {
          id: "record-1",
          taskId: newTask.id,
          startDatetime: new Date("2024-01-01T10:00:00"),
          endDatetime: new Date("2024-01-01T11:00:00"),
        },
      ],
    };
    const action: TaskAction = { type: "IMPORT", payload: importState };

    const nextState = reducer(initialState, action);

    expect(nextState).toEqual(importState);
  });
});
