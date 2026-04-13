# 画面設計・コンポーネント構成

作成日: 2026-04-04  
ステータス: 設計完了

---

## 1. 画面一覧

| 画面名 | 役割 |
|-------|------|
| タスク一覧画面 | メイン画面。ツリー表示・ステータス変更・タイマー操作 |
| タスク作成/編集モーダル | タスクの作成・編集フォーム |
| エクスポート/インポートパネル | CSV/JSON の出力・読み込み |

---

## 2. ワイヤーフレーム

### タスク一覧画面（メイン）

```
┌─────────────────────────────────────────────────┐
│  Task Manager                    [Import][Export] │  ← Header
├─────────────────────────────────────────────────┤
│                                                   │
│  ▼ タスクA            [進行中]   1.50h [・・・]  │  ← TaskRow（子あり → タイマーなし）
│    ▼ 子タスクA-1      [未着手]   0.00h [・・・]  │  ← TaskRow（子あり → タイマーなし）
│      子タスクA-1-1    [完了  ] ▶  0.75h [・・・]  │  ← TaskRow（リーフ → タイマーあり）
│    子タスクA-2        [未着手] ▶  0.00h [・・・]  │  ← TaskRow（リーフ → タイマーあり）
│                                                   │
│  タスクB              [未着手] ▶  0.00h [・・・]  │  ← TaskRow（リーフ → タイマーあり）
│                                                   │
│  [+ タスクを追加]                                 │  ← AddRootTaskButton
│                                                   │
└─────────────────────────────────────────────────┘
```

凡例:
- `▼` / `▶` : 子タスクの折りたたみ・展開トグル（子タスクがある場合のみ表示）
- `[進行中]` : ステータスバッジ（クリックで変更）
- `▶` : タイマー開始ボタン（リーフタスクのみ表示。計測中は `■` 停止ボタン）
- `1h30m` : 実績時間（リーフタスクは自身の記録、親タスクは子の合計）
- `[・・・]` : アクションメニュー（編集・子タスク追加・削除）

---

### タスク作成/編集モーダル

```
┌───────────────────────────────┐
│  タスクを追加         [×]     │
├───────────────────────────────┤
│  タスク名 *                   │
│  ┌──────────────────────────┐ │
│  │                          │ │
│  └──────────────────────────┘ │
│                               │
│  説明                         │
│  ┌──────────────────────────┐ │
│  │                          │ │
│  │                          │ │
│  └──────────────────────────┘ │
│                               │
│  ステータス                   │
│  ┌──────────────────────────┐ │
│  │ 未着手               ▼   │ │
│  └──────────────────────────┘ │
│                               │
│          [キャンセル] [保存]   │
└───────────────────────────────┘
```

---

### エクスポート/インポートパネル

```
┌───────────────────────────────┐
│  データ管理           [×]     │
├───────────────────────────────┤
│  エクスポート                 │
│  [CSVをダウンロード]          │  ← 実績時間集計データ
│  [JSONをダウンロード]         │  ← タスク全データ
│                               │
│  インポート                   │
│  [JSONファイルを選択]         │
│  ※既存データは上書きされます  │
└───────────────────────────────┘
```

---

## 3. コンポーネント構成

```
src/
├── App.tsx                        # ルートコンポーネント・Contextプロバイダー
├── components/
│   ├── Header/
│   │   ├── Header.tsx             # タイトル・エクスポートボタン
│   │   └── ExportImportButton.tsx # エクスポート/インポートパネル開閉ボタン
│   ├── TaskTree/
│   │   ├── TaskTree.tsx           # タスク一覧のルート・AddRootTaskButton
│   │   ├── TaskNode.tsx           # 再帰コンポーネント（子タスクを再帰的にレンダリング）
│   │   └── TaskRow/
│   │       ├── TaskRow.tsx        # 1行分の表示レイアウト
│   │       ├── StatusBadge.tsx    # ステータス表示・クリックで変更
│   │       ├── TimerButton.tsx    # タイマー開始/停止ボタン
│   │       ├── ElapsedTime.tsx    # 実績時間の表示
│   │       └── TaskActionMenu.tsx # 編集・子タスク追加・削除メニュー
│   ├── TaskFormModal/
│   │   ├── TaskFormModal.tsx      # モーダル全体
│   │   ├── TaskNameInput.tsx      # タスク名入力
│   │   ├── DescriptionTextarea.tsx # 説明入力
│   │   └── StatusSelect.tsx       # ステータス選択
│   └── ExportImportPanel/
│       └── ExportImportPanel.tsx  # エクスポート/インポートUI
├── hooks/
│   ├── useTaskManager.ts          # タスクのCRUD・ツリー操作
│   ├── useTimer.ts                # タイマー開始/停止・実行状態の管理
│   ├── useLocalStorage.ts         # localStorageへの読み書き
│   └── useExport.ts               # CSV/JSONエクスポート処理
├── contexts/
│   ├── TaskContext.tsx             # タスク状態・dispatch
│   └── TimerContext.tsx            # タイマー状態（実行中タスクID）
├── reducers/
│   └── taskReducer.ts             # タスクのstate更新ロジック
├── types/
│   └── task.ts                    # Task / TaskTrackRecord の型定義
└── utils/
    ├── taskTree.ts                # ツリー操作ユーティリティ（追加・削除・更新）
    └── timeCalculator.ts          # 実績時間集計ロジック
```

---

## 4. 状態管理方針

### グローバル状態（Context + useReducer）

```
TaskContext
  - tasks: Task[]                  # フラットなタスク配列（parent_idで親子関係を管理）
  - trackRecords: TaskTrackRecord[] # 実績記録の配列
  - dispatch: Dispatch             # アクション発行

TimerContext
  - runningTaskId: string | null   # 現在タイマーが動いているタスクID（同時に1つのみ）
  - startedAt: Date | null         # タイマー開始時刻
```

### ローカル状態（useState）

| コンポーネント | 状態 |
|-------------|------|
| TaskFormModal | `isOpen`, フォーム入力値（name / description / status） |
| ExportImportPanel | `isOpen` |
| TaskNode | `isExpanded`（子タスクの展開/折りたたみ） |
| TaskActionMenu | `isMenuOpen` |

### localStorage との同期

`useLocalStorage` カスタムフックで管理。  
`tasks` と `trackRecords` の変更を検知して自動保存する。

---

## 5. カスタムフック仕様

### `useTaskManager`

タスクのCRUD・ツリー操作を提供する。

```ts
const {
  tasks,
  addTask,       // (params: CreateTaskParams) => void
  updateTask,    // (id: string, params: UpdateTaskParams) => void
  deleteTask,    // (id: string) => void
  changeStatus,  // (id: string, status: TaskStatus) => void
} = useTaskManager()
```

### `useTimer`

タイマーの開始/停止と実行状態の管理を提供する。  
実績時間の集計は `utils/timeCalculator.ts` の `calcElapsed()` が担う。

```ts
const {
  runningTaskId, // string | null  現在タイマーが動いているタスクID
  startedAt,     // Date | null    タイマー開始時刻
  start,         // (taskId: string) => void
  stop,          // () => void
} = useTimer()
```

**`stop()` の内部フロー:**
1. `startedAt` との差分で経過時間を算出
2. 15分未満なら `TaskTrackRecord` を破棄して終了
3. 15分以上なら `dispatch(ADD_TRACK_RECORD)` → `TaskContext` に保存

### `useLocalStorage`

任意のデータを localStorage に永続化する汎用フック。

```ts
const [value, setValue] = useLocalStorage<T>(key: string, initialValue: T)
```

### `useExport`

CSV/JSON のエクスポートを提供する。

```ts
const {
  exportCsv,   // () => void  ← 実績時間集計データ
  exportJson,  // () => void  ← タスク全データ
  importJson,  // (file: File) => void
} = useExport()
```

---

## 6. データフロー

### タイマー停止時（実績保存）

```
useTimer.stop()
    │
    ├─ 経過時間 < 15分 → TrackRecord を破棄して終了
    │
    └─ 経過時間 ≥ 15分 → dispatch(ADD_TRACK_RECORD) → TaskContext (trackRecords 更新)
                                                           │
                                                           └─ useLocalStorage → localStorage に自動保存
```

### 実績時間の表示時

```
ElapsedTime コンポーネント（レンダリング）
    │
    ├─ TaskContext から trackRecords を取得
    ├─ TimerContext から runningTaskId / startedAt を取得
    └─ calcElapsed(records, runningTaskId, startedAt) → 合計時間を表示
```

### タスク CRUD 時

```
ユーザー操作
    │
    ▼
コンポーネント（TaskFormModal 等）
    │
    ▼
useTaskManager
    │
    ├─ dispatch → taskReducer → TaskContext (tasks 更新)
    │
    └─ useLocalStorage → localStorage に自動保存
```

---

## 7. 設計上の意思決定

| 決定事項 | 内容 | 理由 |
|---------|------|------|
| タスクのデータ構造 | フラット配列（parent_idで親子関係） | ネスト構造よりCRUDが容易。ツリー表示はレンダリング時に再帰で組み立てる |
| 同時実行タイマーの制限 | 1つのみ | 実績記録の重複を防ぐ。新しいタイマーを開始すると前のタイマーが自動停止 |
| 最小記録単位 | 0.25h（15分） | data-model.md の設計に準拠。15分未満のレコードは保存しない |
| Context の分割 | TaskContext / TimerContext | 別々に変更されるため分割。タイマー更新でタスクリストを再レンダリングしない |
| タイマーボタンの表示条件 | リーフタスク（子なし）のみ表示 | 親タスクは子の実績を集計して表示するだけ。親にタイマーをつけると「自身の作業時間」と「子の集計時間」が混在して整合性が崩れる |

---

## 8. Q&A ログ

**Q. `getElapsed` は `useTimer` の責務と異なりませんか？**  
A. その通り。`useTimer` の責務はタイマーの開始/停止と実行状態の管理のみ。実績時間の集計は `utils/timeCalculator.ts` の `calcElapsed()` に移動し、`ElapsedTime` コンポーネントが表示時に呼ぶ設計に修正した。

**Q. `useTimer.stop()` → `TaskContext` → `timeCalculator` の流れですか？**  
A. 違う。フローは2つに分かれる。  
- **保存フロー**: `stop()` → 経過時間チェック → `dispatch(ADD_TRACK_RECORD)` → `TaskContext`  
- **表示フロー**: `ElapsedTime` レンダリング時に `TaskContext` の `trackRecords` と `TimerContext` の `startedAt` を取得して `calcElapsed()` を呼ぶ  
`timeCalculator` は `stop()` の中では使われない。

**Q. 子タスクを持つ親タスクにはタイマーボタンは表示されませんよね？**  
A. その通り。タイマーボタンはリーフタスク（子なし）のみ表示する。親タスクに付けると「自身の作業時間」と「子の集計時間」が混在して整合性が崩れるため。`{task.children.length === 0 && <TimerButton />}` で制御する。

**Q. コンポーネント構成はどういうロジックで考えればよいですか？**  
A. 3ステップで考える。  
1. ワイヤーフレームを「見た目のかたまり（ブロック）」で切る  
2. 繰り返し・再帰を見つけてコンポーネント化する（同じ構造が何度も出る → 分割候補）  
3. 「1つのことだけ」やっているか確認する（「〜と〜をやる」と説明が2つになったら分割候補）  
最初から完璧に設計しなくてよい。実装しながら「大きすぎる」と感じたら分割する。
