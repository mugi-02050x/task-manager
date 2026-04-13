import type { Task } from "../types/task";

/**
 * 指定した親IDを持つ子タスクの一覧を返す
 * @param tasks タスクの配列
 * @param parentId 親タスクのID（ルートタスクの場合はnull）
 * @returns 子タスクの配列
 */
export function getChildren(tasks: Task[], parentId: string | null): Task[] {
  return tasks.filter((task) => task.parentId === parentId);
}

/**
 * ルートタスク（親タスクを持たないタスク）の一覧を返す
 * @param tasks タスクの配列
 * @returns ルートタスクの配列
 */
export function getRootTasks(tasks: Task[]): Task[] {
  return tasks.filter((task) => task.parentId === null);
}

/**
 * 指定したタスクの階層の深さを返す（ルートタスクは1）
 * @param tasks タスクの配列
 * @param taskId 対象タスクのID
 * @returns 階層の深さ
 */
export function getDepth(tasks: Task[], taskId: string): number {
  const target = tasks.find((task) => task.id === taskId);
  if (!target) return 0;
  if (target.parentId === null) {
    return 1;
  }
  return getDepth(tasks, target.parentId) + 1;
}

/**
 * 指定した親タスクの子タスク件数を返す
 * @param tasks タスクの配列
 * @param parentId 親タスクのID
 * @returns 子タスクの件数
 */
export function countChildren(tasks: Task[], parentId: string): number {
  return getChildren(tasks, parentId).length;
}

/**
 * 指定したタスクの子孫タスク（子・孫・ひ孫...）を全て返す
 * @param tasks タスクの配列
 * @param taskId 対象タスクのID
 * @returns 子孫タスクの配列
 */
export function getDescendants(tasks: Task[], taskId: string): Task[] {
  const children = getChildren(tasks, taskId);
  const descendants: Task[] = [...children];

  for (const child of children) {
    descendants.push(...getDescendants(tasks, child.id));
  }

  return descendants;
}
