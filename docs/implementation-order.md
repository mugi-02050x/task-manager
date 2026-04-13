# 実装順序

作成日: 2026-04-13

---

## Phase 1: 基盤層

依存関係のない純粋関数・汎用フックから先に作る。

- [x] `src/utils/timeCalculator.ts` — 実績時間集計ロジック（`calcElapsed()`）
- [x] `src/utils/taskTree.ts` — ツリー操作ユーティリティ（子取得・深さ/件数上限チェック）
- [x] `src/hooks/useLocalStorage.ts` — localStorage 汎用フック

---

## Phase 2: 状態管理層

`reducer` / `initialState` は `src/reducers/taskReducer.ts` に実装済み。Context と カスタムフックを組み立てる。

- [ ] `src/contexts/TaskContext.tsx` — タスク状態・dispatch（useLocalStorage で自動保存）
- [ ] `src/contexts/TimerContext.tsx` — タイマー状態（runningTaskId / startedAt）
- [ ] `src/hooks/useTaskManager.ts` — タスク CRUD（addTask / updateTask / deleteTask / changeStatus）
- [ ] `src/hooks/useTimer.ts` — タイマー開始/停止（15分未満は破棄）

---

## Phase 3: UI 層

Context Provider を上位に置き、上から順に組み立てる。

- [ ] `src/App.tsx` — Context Provider でラップするシンプルな構成に書き直し
- [ ] `src/components/Header/Header.tsx` — タイトル・エクスポートボタン
- [ ] `src/components/Header/ExportImportButton.tsx` — パネル開閉ボタン
- [ ] `src/components/TaskTree/TaskTree.tsx` — ルートタスク一覧 + タスク追加ボタン
- [ ] `src/components/TaskTree/TaskNode.tsx` — 再帰コンポーネント（子タスクを再帰的にレンダリング）
- [ ] `src/components/TaskTree/TaskRow/StatusBadge.tsx` — ステータス表示・クリックで変更
- [ ] `src/components/TaskTree/TaskRow/TimerButton.tsx` — タイマー開始/停止ボタン
- [ ] `src/components/TaskTree/TaskRow/ElapsedTime.tsx` — 実績時間の表示
- [ ] `src/components/TaskTree/TaskRow/TaskActionMenu.tsx` — 編集・子タスク追加・削除メニュー
- [ ] `src/components/TaskTree/TaskRow/TaskRow.tsx` — 1行分の表示レイアウト
- [ ] `src/components/TaskFormModal/TaskNameInput.tsx` — タスク名入力
- [ ] `src/components/TaskFormModal/DescriptionTextarea.tsx` — 説明入力
- [ ] `src/components/TaskFormModal/StatusSelect.tsx` — ステータス選択
- [ ] `src/components/TaskFormModal/TaskFormModal.tsx` — モーダル全体
- [ ] `src/hooks/useExport.ts` — CSV/JSON エクスポート・インポート処理
- [ ] `src/components/ExportImportPanel/ExportImportPanel.tsx` — エクスポート/インポート UI

---

## 実装済みファイル（着手不要）

- [x] `src/types/task.ts` — Task / TaskTrackRecord の型定義
- [x] `src/reducers/taskReducer.ts` — タスクの state 更新ロジック
