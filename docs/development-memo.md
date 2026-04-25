# 環境構築メモ

作成日: 2026-04-05

---

## 構成

- React + Vite + TypeScript
- Vitest + React Testing Library

---

## 1. プロジェクト作成

```bash
npm create vite@latest . -- --template react-ts
```

Vite は高速なビルドツール。`react-ts` テンプレートを指定することで、React + TypeScript の構成が最初から整った状態で作成される。

---

## 2. テストライブラリの導入

```bash
npm install -D vitest @vitest/coverage-v8 jsdom @testing-library/react
```

| パッケージ | 役割 |
|-----------|------|
| `vitest` | Viteと統合されたテストランナー。`npm test` でテストを実行する |
| `@vitest/coverage-v8` | テストカバレッジを計測する |
| `jsdom` | ブラウザ環境をNode.js上で模倣する（DOMの操作が可能になる） |
| `@testing-library/react` | Reactコンポーネントをテスト用にレンダリングする |

---

## 3. 設定ファイル

### `vite.config.ts`

```ts
import { defineConfig } from "vitest/config" // vitestの型を認識させる

test: {
  environment: 'jsdom',                       // ブラウザ環境で動かす
  globals: true,                              // describe/it/expect をimport不要で使える
  setupFiles: ['./src/test/setup.ts'],        // テスト前に毎回実行するファイル
  coverage: {
    include: ['src/hooks/**', 'src/utils/**'], // カバレッジの対象
    thresholds: { lines: 80 },                // 80%未満でテスト失敗
  },
}
```

- `defineConfig` は `vitest/config` からインポートする（`vite` からだと `test` プロパティが型エラーになる）

### `src/test/setup.ts`

```ts
import { vi, beforeEach, afterEach } from "vitest";
```

全テストファイルの実行前にこのファイルが読み込まれ、`localStorage` モックの初期化や `vi.restoreAllMocks()` の共通後処理を行う。

### `tsconfig.app.json`

```json
"types": ["vite/client", "vitest/globals"]
```

`describe` や `expect` を TypeScript が認識できるようになる。

### `package.json`

```json
"test": "vitest",                        // ウォッチモードでテスト実行
"test:coverage": "vitest run --coverage" // カバレッジ計測
```

---

## 4. つまずきポイント

- `defineConfig` を `vite` からインポートすると `test` プロパティで `No overload matches this call` エラーが発生する
  - → `vitest/config` からインポートすることで解決

---

## 5. Tailwind CSS の導入

```bash
npm install tailwindcss @tailwindcss/vite
```

v4からは設定ファイル（`tailwind.config.js`）が不要。以下の2ファイルのみ変更する。

### `vite.config.ts`

```ts
import tailwindcss from "@tailwindcss/vite";

plugins: [react(), tailwindcss()],
```

### `src/index.css`

```css
@import "tailwindcss";
```

先頭に追加する。設定変更後は開発サーバーの再起動が必要。

---

## 6. GitHubへのpush

```bash
git init                            # カレントディレクトリに .git を作成し、独立したリポジトリとして初期化
git add .                           # 変更ファイルをステージング
git commit -m "メッセージ"          # コミット
git remote add origin <URL>         # リモートリポジトリを登録
git branch -m master main           # ブランチ名を master から main にリネーム
git push -u origin main             # リモートに push（-u で追跡ブランチを設定）
```

### つまずきポイント

- `git rev-parse --show-toplevel`: gitリポジトリのルートディレクトリを表示するコマンド。`~/work/` が返ってきた場合、`~/work/` に `.git` が存在しており、カレントディレクトリが独立したリポジトリになっていないことを意味する
- `git init` を意図しないディレクトリで実行すると、そのディレクトリ以下が1つのリポジトリとして扱われる。配下に別のリポジトリがある場合は「embedded git repository」として警告が出る
- `git push -u origin main` でブランチが存在しないエラーが出た場合、コミットが済んでいないかブランチ名が異なる（`master` のまま等）

---

## 8. taskReducer 実装（2026-04-06）

### 実装内容

- `src/types/task.ts`: 型定義（Task / TaskTrackRecord / TaskState / TaskAction）
- `src/reducers/TaskReducer.ts`: reducer関数・initialState

### 実装したAction

| Action | 内容 |
|--------|------|
| `ADD_TASK` | tasks配列にタスクを追加 |
| `UPDATE_TASK` | 対象タスクを全フィールド更新 |
| `DELETE_TASK` | 対象タスクをIDで削除 |
| `CHANGE_STATUS` | 対象タスクのstatusのみ更新 |
| `ADD_TRACK_RECORD` | trackRecords配列にレコードを追加 |
| `DELETE_TRACK_RECORD` | 対象レコードをIDで削除 |
| `CHANGE_END_DATETIME` | 対象レコードのendDatetimeのみ更新 |
| `IMPORT` | payload（TaskState）で全データを上書き |

### 指摘・修正事項

- `useReducer` をファイルのトップレベルで呼んでいた → Hookはコンポーネント/カスタムフック内でしか呼べない。`useReducer` の呼び出しは `TaskContext.tsx` 側に移動し、`TaskReducer.ts` は `reducer` と `initialState` のみ export する
- `initiallState` typo（l が2つ）→ `initialState` に修正
- `ImportAction` の payload が `Array<Task>` のみだった → `trackRecords` も復元する必要があるため `TaskState` に変更
- フィールド名の揺れ: `endDateTime`（大文字T）→ `endDatetime`（小文字t）に統一

### Q&A

**Q. `dispatch` は return の値を登録するのか？**  
A. その通り。`reducer` が新しい state を return し、`useReducer` がその戻り値を次の state として登録（セット）する。Reactは参照が変わったかどうかで再レンダリングを判断するため、必ず新しいオブジェクトを return する。

**Q. `{ ...state, tasks: [...state.tasks, action.payload] }` の意味は？**  
A. スプレッド構文によるコピー。`...state` で全プロパティを展開し、後ろに書いた `tasks` で上書きする。`...state.tasks` は配列の全要素を展開して末尾に新要素を追加する。元の state を直接変更すると React が変化を検知できないため、必ず新しいオブジェクト・配列を作って返す。

**Q. action.payload とは？**  
A. dispatch 時に渡すオブジェクトの「データの荷物」。`type` が命令の種類、`payload` が命令に必要なデータ。`payload` という名前は慣習。

**Q. Action も型定義するのか？**  
A. 判別共用体（Discriminated Union）パターンで定義する。`type` の文字列リテラルをキーに型を絞り込むことで、switch 文の各 case で payload の型が自動確定し、補完が効く。typo するとコンパイルエラーになる利点もある。

**Q. useReducer をファイルのトップレベルで呼べないのはなぜ？**  
A. Hooks のルール（Rules of Hooks）により、Hooks はコンポーネントまたはカスタムフックの直下でしか呼べない。トップレベルで呼ぶと実行時エラーになる。

**Q. reducer と initialState のためにファイルを分割する理由は？**  
A. このプロジェクト規模（Action 8個）では分割しなくてもよい。`TaskContext.tsx` に reducer・initialState・useReducer をまとめる構成も一般的。分割する主な理由は「Actionが20個以上になりファイルが肥大化するとき」「reducer 単体のテストを書くとき」「複数の Context で同じ reducer を再利用するとき」。

---

## 9. 実装開始（2026-04-13）

### 実装順序

`docs/implementation-order.md` に実装順序をチェックリスト形式で作成。Phase 1（基盤層）→ Phase 2（状態管理層）→ Phase 3（UI層）の順で進める。

### `src/utils/timeCalculator.ts` 実装

- `calcElapsed(trackRecords, taskId)`: 指定タスクの実績時間合計を返す
- `formatElapsed(diff)`: ミリ秒をフォーマットして返す（差し替え可能な設計）
- `toQuarterHour(diff)`: ミリ秒を0.25h単位に切り捨てて返す

**設計上の意思決定:**
- 各レコードを個別に変換するのではなく、合計してから1回 `formatElapsed` を通す設計に変更。各レコードで切り捨てると誤差が積み重なるため
- `formatElapsed` を差し替えポイントとして切り出すことで、将来「1時間25分」形式などへの変更に対応できる
- `calcElapsed` の戻り値は `number`（時間単位）。表示フォーマットは `ElapsedTime.tsx` が担う

**呼び出し元:** `ElapsedTime.tsx` が `calcElapsed` をインポートして呼び出す。親タスクへの集計も `ElapsedTime.tsx` 側で子の `taskId` を収集して `calcElapsed` を複数回呼んで合算する。

### `src/utils/taskTree.ts` 実装

- `getChildren(tasks, parentId)`: 指定した親IDの子タスク一覧を返す
- `getDepth(tasks, taskId)`: タスクの階層の深さを返す（ルートは1、再帰実装）
- `countChildren(tasks, parentId)`: 子タスクの件数を返す（`getChildren` を内部利用）
- `getDescendants(tasks, taskId)`: 子孫タスクを全て返す（DFS・再帰実装）

**設計上の意思決定:**
- `getDepth` の対象タスクが見つからない場合は `find` で `undefined` になるためガード処理が必要
- `getDescendants` はBFS（whileループ）とDFS（再帰）どちらでも実装可能。`let` を避けるため再帰（DFS）を採用

### Vitestテストコードの書き方

```ts
describe("グループ名", () => {
  it("〜のとき、〜を返す", () => {
    const result = 対象関数(...);
    expect(result).toBe(期待値);
  });
});
```

- `describe`: テスト対象のグループ名
- `it`: 1つのテストケース
- `expect().toBe()`: 期待値との一致を検証

**テストの実行:**

```bash
npx vitest run           # 1回実行
npx vitest               # ウォッチモード
npx vitest run --coverage  # カバレッジ付き
```

**ファイル配置:** `src/test/` 配下に `utils/` / `hooks/` / `components/` でサブディレクトリを分けて管理。

### Q&A

**Q. `setup.ts` は無視して良いか？**  
A. 無視しない。`vite.config.ts` の `setupFiles` に登録されており、全テスト共通の `localStorage` モックやモックの後処理をここで実行している。

**Q. テストファイルのインポートはワイルドカードで書けるか？**  
A. `import * as taskTree from "../../utils/taskTree"` で可能。ただし呼び出し時に `taskTree.getChildren(...)` のようなプレフィックスが必要になるため、名前付きインポートの方が一般的。

**Q. `getDescendants` をBFSで `let` なしに書けるか？**  
A. `flatMap` を使えば書けるが、再帰になるため結果的にDFSと同じ方式になる。

### `src/hooks/useLocalStorage.ts` 実装

```ts
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : initialValue;
  });

  const setValue = (value: T) => {
    setStoredValue(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  return [storedValue, setValue] as const;
}
```

**ポイント:**

- **lazy initializer**: `useState` に関数を渡すことで初回レンダリング時のみ `localStorage.getItem` が実行される。値を直接渡すと毎回実行されるため非効率
- **`setValue`**: React の state 更新と localStorage への書き込みを同時に行う。呼び出し側は localStorage を意識せずに `useState` と同じ感覚で使える
- **`as const`**: 戻り値を `(T | (value: T) => void)[]` ではなく `readonly [T, (value: T) => void]` のタプル型として推論させる。`useState` と同じ形式

### `src/contexts/TaskContext.tsx` 実装

- `TaskContext`: `createContext` で作成。初期値は `null`（Provider 外で使ったときにエラーで検知するため）
- `TaskProvider`: `useReducer` + `useLocalStorage` を組み合わせて state を管理・永続化する
- `useTaskContext`: `useContext(TaskContext)` のラッパー。`null` チェックを内包する

**`useEffect` で localStorage に自動保存:**

```ts
useEffect(() => {
  setStoredState(state);
}, [state, setStoredState]);
```

state が変わるたびにレンダリング後に実行される。`dispatch` 直後に保存すると1つ前の state が保存されてしまうため `useEffect` が必要。

**`useCallback` で無限ループを防止:**

`setValue`（`setStoredState`）は毎回新しい関数参照が生成されるため、`useEffect` の依存配列に含めると無限ループが発生する。`useLocalStorage` 内で `useCallback` を使い関数参照を固定することで解決。

### Context のテストパターン

```tsx
// wrapper で Provider をラップして renderHook に渡す
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TaskProvider>{children}</TaskProvider>
);
const { result } = renderHook(() => useTaskContext(), { wrapper });
```

Context のテストでは「dispatch が正しく Context に反映されるか」に絞る。reducer の全 Action 検証は `taskReducer.test.ts` で行う。

### localStorage モックの共通化

`src/test/setup.ts` に localStorage モックと `beforeEach` のクリア処理を追加することで全テストファイルで共通利用できる。各テストファイルへの個別記述が不要になる。

### Vitest について

**利用場面:** Vite を使ったプロジェクト（React / Vue 等）。Next.js など Vite 以外では Jest が選ばれることが多い。

**代替手段:**

| ツール | 特徴 |
|--------|------|
| Jest | 最も普及。Next.js のデフォルト |
| Mocha | 古くからある。アサーションライブラリを別途用意する必要がある |
| Playwright | E2E テスト向け。実際のブラウザで動作する |
| Cypress | E2E テスト向け。GUI があり視覚的に確認しやすい |

**React Testing Library との役割分担:**

| テスト対象 | 使うもの | 検証する内容 |
|-----------|---------|-------------|
| 純粋関数・utils | Vitest のみ | 戻り値 |
| カスタムフック・Context | `renderHook` + Vitest | `result.current` の値 |
| コンポーネント | `render` + React Testing Library | DOM の状態・ユーザー操作への反応 |

React Testing Library はコンポーネントを実際にレンダリングした結果の DOM を検証する。state を直接見ないのは「ユーザーは state を見ることができないから」という思想に基づく。

**E2E テストが必要なケース:**

React Testing Library は jsdom 上で動くため、以下は再現できない。

- ブラウザ間の差異
- 実際のネットワーク通信
- ファイルダウンロード等のブラウザ固有機能
- 実際の localStorage の永続化（ブラウザ再起動後の復元など）

このアプリは1画面・ローカルのみ・API なしのため E2E テストは不要。

### `src/hooks/useTaskManager.ts` 実装

- `addTask`: UUID生成・`createdAt`・`dispOrder` を内部で付与して dispatch。階層深さ（最大5）・子タスク件数（最大20）のバリデーションあり
- `updateTask`: 対象タスクを `find` で取得し、`...currentTask` を先に展開して `params` で上書き
- `deleteTask`: 対象タスクと子孫タスク・関連 trackRecords を再帰で削除
- `changeStatus`: `CHANGE_STATUS` action を dispatch

**設計上の意思決定:**

- `CreateTaskParams` / `UpdateTaskParams` は `src/types/task.ts` に移動して外部から利用可能にした
- `deleteTask` で存在しない ID を渡してもエラーにならない（`filter` の仕様）。テストケースとして「エラーにならない」ことを明示的に検証する

**テストのポイント:**

- `dispOrder` の検証で同一 `act` 内に複数の `addTask` を入れると state が更新される前に次の `addTask` が実行されるため `act` を分ける必要がある
- `id` / `createdAt` は内部生成のため `toMatchObject` でビジネスロジック上重要なフィールドのみ検証する
- `crypto.randomUUID` / `Date` はブラウザ・JS 標準の関数なのでモック不要
- `toMatchObject` は渡したフィールドのみ検証し、余分なフィールドは無視する

**`vi.spyOn` のリセット共通化:**

`src/test/setup.ts` に `afterEach(() => { vi.restoreAllMocks(); })` を追加することで、各テストファイルでのリセット処理が不要になる。

---

## 10. useTimer・taskReducer テスト実装（2026-04-15）

### `src/hooks/useTimer.ts` 実装

- `start(taskId)`: `stop()` を呼んでから `runningTaskId` と `startedAt` をセット
- `stop()`: 経過時間が15分以上のときのみ `ADD_TRACK_RECORD` を dispatch して trackRecord を登録

**15分判定の実装:**

```ts
if (
  runningTaskId &&
  startedAt &&
  formatElapsed(Date.now() - startedAt.getTime()) > 0
) { ... }
```

`formatElapsed` は0.25h（15分）単位に切り捨てるため、15分未満は `0` が返る。`> 0` チェックで15分判定を行う。タスク再開時は新規レコードとして追加され、既存レコードを更新する処理は発生しない。

**`CHANGE_END_DATETIME` の削除:**

タイマー停止時に `ADD_TRACK_RECORD` で追加し、以降でレコードを更新する処理は発生しない設計のため削除。

### `useTimer.test.tsx` テストパターン

**Fake Timer を使った時間制御:**

`vi.spyOn(globalThis, "Date")` でのモックは型エラーが起きるケースがある。`vi.useFakeTimers()` と `vi.setSystemTime()` を使うことで `new Date()` と `Date.now()` の両方を一括制御できる。

```ts
vi.useFakeTimers();
vi.setSystemTime(new Date("2024-01-01T10:00:00")); // start 時刻

act(() => { result.current.manager.start("taskId"); });

vi.setSystemTime(new Date("2024-01-01T10:10:00")); // 10分後に stop
act(() => { result.current.manager.stop(); });

vi.useRealTimers(); // テスト後は必ず元に戻す
```

**複数フックを同時にテストする場合:**

```tsx
const { result } = renderHook(
  () => ({ manager: useTimer(), context: useTaskContext() }),
  { wrapper },
);
// result.current.manager.start() / result.current.context.state.trackRecords
```

1つの `renderHook` で複数のフックをまとめてテストできる。

### `taskReducer.test.ts` テストパターン

reducer は純粋関数のため `renderHook` / `wrapper` は不要。関数を直接呼び出してテストする。

```ts
const state = { tasks: [], trackRecords: [] };
const nextState = reducer(state, action);
expect(nextState.tasks).toHaveLength(1);
```

**検証に使うマッチャー:**

| マッチャー | 用途 |
|-----------|------|
| `toEqual` | オブジェクト全フィールドを再帰比較 |
| `toMatchObject` | 指定フィールドのみ検証（余分なフィールドは無視） |
| `toHaveLength` | 配列の要素数を確認 |

更新対象フィールドが明確な場合は `toMatchObject` で変更箇所に絞る方がシンプル。

### Q&A

**Q. `taskReducer` のテストは React のレンダリングを意識しなくて良いか？**  
A. 意識不要。reducer は `(state, action) => newState` の純粋関数。React や Context とは無関係なので `renderHook` や `wrapper` は使わない。state もオブジェクトリテラルで直接作れる。

**Q. 更新後のタスクの比較は `toEqual` か `toMatchObject` か？**  
A. どちらも使える。変更箇所が明確なら `toMatchObject` で対象フィールドに絞る方がシンプル。全フィールドを確認したい場合は `toEqual` を使う。

---

## 11. UI層実装（2026-04-16）

### コンポーネント実装方針

- **ロジック・構造を先に固めてからTailwindでスタイルを当てる**（構造が変わるとクラスも書き直しになるため）
- **コンポーネントは `useTaskManager` だけを import する**（taskTree.ts を直接使わない）
- JSX内のコメントは `{/* */}` を使う（`//` はそのまま文字列としてレンダリングされる）
- `map` で要素を生成する際は必ず `key` を設定する

### `useEffect` の注意点

StrictMode では `useEffect` が2回実行される（1回目→クリーンアップ→2回目）。クリーンアップで打ち消せない副作用（タスク追加等）は `useEffect` に書かない。動作確認用データは localStorage に直接投入する。

### zod によるバリデーション

TypeScript の型情報は実行時に消えるため、JSONファイルの型チェックには zod を使う。

```ts
const TaskStateSchema = z.object({
  tasks: z.array(TaskSchema),
  trackRecords: z.array(TaskTrackRecordSchema),
});

// z.coerce.date() で日付文字列を Date 型に自動変換
const data = TaskStateSchema.parse(JSON.parse(json));
```

localStorage から復元した値も日付が文字列になるため、`useReducer` の initializer で zod スキーマを通して変換する。

```ts
const [state, dispatch] = useReducer(reducer, storedState, (s) => {
  try {
    return TaskStateSchema.parse(s);
  } catch {
    return initialState;
  }
});
```

### `useElapsed` の設計

実績時間の計算は `useTaskManager` や `useTimer` ではなく、専用の `useElapsed` フックに切り出す。

- `calcElapsed`: ミリ秒の合算のみ担当（フォーマットしない）
- `formatElapsed`: ミリ秒を0.25h単位に変換
- `useElapsed`: 自身と子孫タスクのIDをループして `calcElapsed` で合算し、`formatElapsed` で変換

`trackRecords` が更新されると自動的に再計算される（明示的なトリガー不要）。

### `exportState` のテスト

ブラウザAPIをモックして検証する。

```ts
const mockClick = vi.fn();
const mockAnchor = { href: "", download: "", click: mockClick };
vi.spyOn(document, "createElement").mockReturnValue(mockAnchor as unknown as HTMLElement);
vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
```

### JSON文字列のテストデータ

テンプレートリテラルでJSONを書くと形式エラーになりやすい（キーのクォートなし・`new Date()` 使用不可）。`JSON.stringify` でオブジェクトから生成する方が確実。

```ts
const jsonStr = JSON.stringify({ tasks: [...], trackRecords: [...] });
```

### Q&A

**Q. `useEffect` で state を変更するような操作はしない方が良いか？**  
A. クリーンアップで打ち消せない副作用は避けた方が良い。クリーンアップ関数は `return () => { ... }` の形で書く必要があり、`return forEach(...)` はクリーンアップとして機能しない（`forEach` の戻り値 `undefined` を return しているだけ）。

**Q. タイマーが動いているかどうかの検知方法は？**  
A. `useTimer` が返す `runningTaskId` と自分の `taskId` を比較する。`runningTaskId === taskId` で自分のタスクが実行中かどうかを判定できる。

**Q. `calcElapsed` で親タスクの実績を計算できるか？**  
A. できない。`calcElapsed` は単一タスクの合算のみ。`useElapsed` 側で子孫タスクのIDを収集してループし、合算してから `formatElapsed` を通す。各タスクで `formatElapsed` を呼ぶと切り捨て誤差が積み重なるため、合算後に1回だけ呼ぶ。

**Q. Hook をループの中で呼べないとはどういうことか？**  
A. `getDescendants().reduce(task => useElapsed(task.id))` のような書き方はできない。Hook のルール上、Hook はコンポーネント/カスタムフックのトップレベルでしか呼べない。Hook の中でループを使うのは問題ない。

**Q. コンポーネントのテストは必要か？**  
A. このアプリの規模では不要。ロジックは hooks/utils/reducer に集約されてテスト済みで、UIの確認はブラウザで直接行える。コンポーネントテストが有効なのは複雑なユーザー操作フローや条件分岐の多いUIがある場合。

---

## 7. Q&A

**Q. `-D` オプションとは何ですか？**  
`--save-dev` の省略形。開発環境のみで使うパッケージとして `devDependencies` に追加する。Vitest や Testing Library はテスト実行用のツールなので本番ビルドには含める必要がない。

**Q. Tailwind のクラスを追加しても反映されない**  
Tailwind v4 はスタイルを CSS Cascade Layers に格納する。レイヤー外のカスタムCSSはレイヤー内より常に優先されるため、`h1 { color: ... }` のような既存スタイルが Tailwind のユーティリティクラスを上書きする。Vite テンプレートのデモ用CSSを削除するか、レイヤー外のスタイルが当たっていない要素で確認する。

---

## 12. TaskFormModal 実装・設計Q&A（2026-04-20）

### 実装方針

- 新規作成と更新は **同じモーダル** を使う（`mode: "create" | "edit"`）
- `TaskFormModal` は入力UIに寄せ、保存の分岐は `useTaskManager.saveTask` に集約する
- `TaskTree` の可読性低下を避けるため、モーダル管理ロジックは `useTaskFormModal` に抽出する

### 実装で追加したもの

- `src/hooks/useTaskManager.ts`
  - `saveTask` を追加（create/edit 分岐）
- `src/types/task.ts`
  - `TaskFormInput` を追加（フォーム入力専用の型）
- `src/hooks/useTaskFormModal.ts`
  - モーダルの開閉・初期値生成・submit処理を管理
- `src/components/TaskFormModal/TaskFormModal.tsx`
  - フォームUI本体
- `src/test/hooks/useTaskFormModal.test.ts`
  - モーダル管理ロジックの最小テスト

### Q&A

**Q. TaskFormModal は入力項目ごとにコンポーネント分割すべきか？**  
A. 今回の規模では必須ではない。まずは1ファイルで実装し、再利用要件やバリデーション複雑化が出た段階で分割する。

**Q. 新規作成と更新はモーダルを分けるべきか？**  
A. 分けなくてよい。同一モーダルで `mode` によって submit 時の処理だけ分岐する。

**Q. `taskId` だけを props で渡してモーダル内部で取得してもよいか？**  
A. 可能だが注意点がある。新規作成（親ID）と編集（対象ID）の意味が混ざるため、`mode` と必要IDを明示する方が安全。

**Q. 「同期条件によってバグが出る」とは？**  
A. 編集中フォームのローカルstateを、Contextの更新で毎回再初期化すると、入力途中の値が上書きされる。初期化は「開いた時/対象切替時」に限定する。

**Q. 元データ更新を同期しないと先祖返りしないか？**  
A. リスクはある。自動同期で入力破壊を起こすより、保存時に競合を検知する（`version` / `updatedAt` など）の方が安全。今回の単一ユーザー前提では過剰対応は不要。

**Q. モーダルは非表示時に ReactNode 上に存在するか？**  
A. 実装次第。`{isOpen && <Modal />}` ならアンマウントされる。フォームはこの方式の方が初期化管理が簡単。

**Q. モーダル状態は Context に入れるべきか？**  
A. 今回は不要。グローバル共有状態ではなく局所UI状態なので、`TaskTree` 配下で管理する方が責務が明確。

**Q. `edit` で対象タスクが見つからない場合はどうするか？**  
A. エラー扱いにする。空フォームへフォールバックしない。`openEditModal` と初期値生成の両方で `getTask` により存在確認する。

**Q. テストはコンポーネント側で必要か？**  
A. 方針としてコンポーネントテストを厚くしない。ロジックをフックへ寄せ、`useTaskFormModal` の最小ケース（open/create/edit/submit）をテストする。

**Q. `UpdateTaskParams` をフォーム入力型として使うのは適切か？**  
A. 意味が曖昧になるため `TaskFormInput` を定義して分離した。命名と責務を一致させることで可読性を上げる。

**Q. `TaskFormModal/TaskFormModal.tsx` のようなディレクトリ名とファイル名の重複はどう扱うか？**  
A. 1ファイル運用ならフラット化も選択肢。現状は将来の分割余地を残して維持しても問題なし。

---

## 13. CSS適用方針メモ（2026-04-20）

### 今回の目的

- 「まず動く」状態から、「どこを編集すれば見た目が変わるか」が分かる状態へ寄せる
- 学習者が追いやすいように、**各コンポーネントで必要なクラスだけ持つ**構成にする

### スタイルを決めるときの判断順

1. 画面全体の土台（余白・背景・文字）を `index.css` で最小限に整える  
2. 各コンポーネントで役割に応じた見た目を付ける（Header / TaskRow / Modal など）  
3. 状態によって見た目が変わる部分だけ条件付きクラスにする（ステータス色、タイマー開始/停止）

### なぜこの方針にしたか

- 先にグローバルCSSを作り込みすぎると、どの見た目がどこ由来か分かりにくくなる
- Tailwindのユーティリティをコンポーネント直近に置くと、JSXを読むだけで見た目を追える
- 初学者にとって「1つの要素に対して、1か所を直せば見た目が変わる」状態が学習しやすい

### 今回の具体的な適用ルール

- **レイアウト**
  - `App` はコンテンツ最大幅と余白を担当
  - `TaskTree` はカード枠 + 空状態メッセージを担当
  - `TaskNode` は階層表示（左ボーダーとインデント）を担当
- **操作要素**
  - 主要操作（追加・保存）は強い色（`bg-emerald-600`, `bg-sky-600`）
  - 補助操作（キャンセル・メニュー）は白背景 + 境界線
- **状態表示**
  - `StatusBadge`: 未着手/進行中/完了で色分け
  - `Timer`: 実行中は停止ボタンを赤系、開始は青系
- **フォーム**
  - モーダル入力は `focus` 時の枠色とリングを統一し、どこに入力中か分かりやすくする

### 変更時の実践ルール（学習用）

- 1回で全部変えず、まず「余白」「色」「文字サイズ」を1つずつ調整する
- クラスは短くても意味ごとにまとめる（例: レイアウト系 → 色系 → 状態系）
- 迷ったら次の優先順位で決める  
  - 視認性（読めるか）  
  - 操作性（押せると分かるか）  
  - 一貫性（同じ役割の部品が同じ見た目か）

---

## モバイル向けレイアウト再設計（2026-04-20）

### 背景

初期レイアウトは各コントロール（ステータス・経過時間・タイマー・操作メニュー）に固定幅を持たせ `flex-row` で横並びにしていた。`md:` 以上では問題なかったが、モバイル幅（~375px）＋階層ネストが深くなると横幅合計 ~20rem が収まらず、折り返しやはみ出しが発生して使いづらかった。

### 方針

- **モバイル（既定）**: 縦方向の3行構成にして情報を整理
- **デスクトップ (`md:` 以上)**: 従来の横1行レイアウトを維持
- 固定幅の pill ボックスはモバイルではプレーンテキスト化、デスクトップでのみ装飾的なボックスに戻す

### 変更点

#### `TaskRow.tsx`

モバイルでは縦3行、`md:` で `flex-row` の1行になるよう、ブレークポイントで構造を切り替えた。

```
┌──────────────────────────────┐
│ タスク名                [⋮]   │  row1: 名前 + アイコンメニュー
│ ● 進行中   3.50h              │  row2: ステータス + 経過時間
│ [──── ▶ 開始 (全幅) ────]    │  row3: 計測ボタン（leaf のみ）
└──────────────────────────────┘
```

- 親タスクはモバイルでは row3 を出さず、デスクトップでは無効状態のボタンを表示して位置を揃える
- `TaskActionMenu` はモバイルで row1 の右上、デスクトップで末尾に配置するため同じコンポーネントを2箇所に置き `md:hidden` / `hidden md:block` で出し分ける

#### `Timer.tsx`

- `fullWidth` prop を追加
  - `true`: `h-10 w-full text-sm` でタップしやすい大きめボタン（モバイル）
  - `false`: 従来の `h-8 w-[4.6rem] text-xs`（デスクトップ）
- 親タスク時の disabled 表示ロジックは維持（`bg-slate-200 text-slate-400 cursor-not-allowed`）

#### `TaskActionMenu.tsx`

- 「・・・」のテキストボタン（`w-[4.8rem]`）→ `⋮` の正方形アイコンボタン（`w-8 h-8`）に変更
- 選択時の `<select>` は開閉時に幅が増えるので `w-[7rem]` を確保
- 結果、モバイルでもタップ領域を維持しつつ横幅を節約

#### `StatusBadge.tsx`

- 固定幅 `w-[5.4rem]` を撤廃し `w-auto min-w-[4.5rem]` に
- ラベル長（未着手 / 進行中 / 完了）に応じた自然な幅になり、横方向の余白ロスを削減

#### `TaskNode.tsx`

- 階層インデントをモバイルで縮小: `ml-3 pl-3` → `ml-2 pl-2`
- デスクトップは `md:ml-7 md:pl-4` → `md:ml-5 md:pl-4` に詰めた
- 深い階層でもカード幅を確保しやすくなる

#### 余白調整

- `App.tsx` の `main`: `px-4 py-6` → `px-3 py-4`（モバイルのみ）
- `TaskTree.tsx` の section: `p-4` → `p-3`（モバイルのみ）、内側背景エリア `p-3` → `p-2`
- デスクトップの余白は `md:` 指定で従来通り維持

### 学び

- **「固定幅 × flex-wrap」は狭幅で破綻する**: モバイルでは幅を固定せず、コンテンツに合わせた可変幅＋縦積みが安定
- **ブレークポイントで構造自体を切り替える**: 同じ DOM を CSS だけで整えるのには限界があり、`md:hidden` / `hidden md:block` で配置そのものを切り替えた方がシンプルになる場面がある
- **タップ領域はモバイルで `h-10` 以上を確保**: 小さい `h-8` ボタンはデスクトップなら十分だがモバイルではミスタップが増える

---

## localStorage保存データ削除機能（2026-04-20）

### 目的

- 保存済みのタスクデータを UI から明示的に削除できるようにする
- localStorage のキー削除だけでなく、画面上の state も同時に初期化する

### 実装内容

- `src/hooks/useLocalStorage.ts`
  - `removeValue` を追加
  - `localStorage.removeItem(key)` を行い、フック内部の state も `initialValue` に戻す
- `src/contexts/TaskContext.tsx`
  - `clearState` を追加
  - `dispatch({ type: "IMPORT", payload: initialState })` で Context の state を初期化
  - `skipNextPersistRef` を使い、削除直後に初期 state を localStorage に再保存しないよう制御
- `src/hooks/useTaskManager.ts`
  - `clearState` を追加し、UI から呼べるようにした
- `src/components/Header/Header.tsx`
  - `Clear` ボタンを追加
  - `window.confirm` で確認後、`taskManager.clearState()` を呼ぶ

### 設計上のポイント

**Q. localStorage のキーを削除するだけではだめか？**  
A. だめ。画面上の React state はそのまま残るため、UI と保存内容がずれる。state と localStorage を同時に初期化する必要がある。

**Q. state を初期化すると `useEffect` でまた localStorage に保存されないか？**  
A. 通常は保存される。今回は `skipNextPersistRef` を 1 回だけ立てることで、削除直後の 1 回の保存をスキップしている。

**Q. 削除後にタスクを追加するとどうなるか？**  
A. 初期状態から新しく state が作られ、その内容で localStorage の `task-manager` キーが再作成される。削除済みの古いデータは戻らない。

### テスト

- `useLocalStorage.test.ts`
  - `removeValue` 実行で state が `initialValue` に戻り、localStorage から削除されることを確認
- `useTaskManager.test.ts`
  - `clearState` 実行で Context の state が空になり、`task-manager` キーも削除されることを確認

---

## GitHub Pages公開前の確認と履歴整理（2026-04-21）

### 背景

GitHub Pages で公開する前に、デプロイ手順・ブランチ運用・公開リポジトリに含まれる情報を確認した。

### GitHub Pagesデプロイ手順

GitHub Pages デプロイ手順をこの `development-memo.md` に集約し、以下を整理した。

- Vite の `base` 設定
  - プロジェクトページとして公開するため `base: "/task-manager/"` を設定する
- GitHub Actions によるデプロイ
  - `main` ブランチへの push をトリガーに `npm ci` → `lint` → `test` → `build` → GitHub Pages deploy を実行する
- GitHub Pages の設定
  - `Settings > Pages > Build and deployment > Source` を `GitHub Actions` にする
- localStorage 永続化
  - GitHub Pages では訪問者のブラウザ環境を汚さないため、`VITE_ENABLE_LOCAL_STORAGE_PERSIST` は設定しない
  - ローカル開発で確認する場合のみ `.env.local` に設定する

### デプロイ後のブランチ運用

公開後は `main` をデプロイトリガーとして扱い、通常開発は `develop` ブランチで行う方針にした。

運用イメージ:

1. 初回公開後、`main` から `develop` を作成する
2. 日常の修正は `develop` で行う
3. `develop` で `npm run lint` / `npm test -- --run` / `npm run build` を確認する
4. 公開したいタイミングで `develop` から `main` へ Pull Request を作成する
5. `main` に merge されたら GitHub Actions で GitHub Pages に自動デプロイする

この運用により、作業中の変更が直接公開されることを避けられる。

### センシティブ情報チェック

公開前に以下を確認した。

- `.env.local` は存在するが、内容は `VITE_ENABLE_LOCAL_STORAGE_PERSIST=false` のみ
- `.env.local` は `.gitignore` の `*.local` により追跡対象外
- APIキー、アクセストークン、秘密鍵、パスワードらしい文字列は見つからなかった
- deploy workflow に含まれる `id-token` は GitHub Actions の権限定義であり、シークレットではない
- `docs/sample-data.json` やテスト内の `task-1` などはサンプルIDであり、実データではない

### Gitコミットメールの扱い

**Q. Git のメールアドレスは一般的に隠すべきか？**  
A. 個人開発・学習用リポジトリを公開する場合は、GitHub の noreply メールにするのが無難。コミット履歴の author / committer email は公開リポジトリで見えるため、スパムや個人情報の露出を減らせる。

**Q. すでに push 済みの場合はどうするか？**  
A. 今後のコミットだけ noreply にする方法と、過去履歴を書き換える方法がある。今回は自分以外が利用していないリポジトリのため、過去履歴も書き換える方針にした。

### 実施内容

- GitHub の ID付き noreply メールを確認
- 全コミットの author / committer email を noreply に置換
- ローカル Git 設定も noreply に変更
- `origin/main` に `--force-with-lease` で反映

確認結果:

- `git log --all` 上の author / committer email は noreply のみ
- 履歴内に元のメールアドレス文字列は見つからない
- 今後のローカルコミットも noreply メールで作成される

### コミットハッシュ変更の影響

履歴を書き換えると、同じ内容でも Git 上は別コミットとして扱われるため、コミットハッシュが変わる。

影響:

- 古い commit URL は参照できなくなることがある
- 他の clone 済み環境では `git pull` が素直に進まないことがある
- 古い `main` から派生したブランチがある場合は rebase や再作成が必要になる
- GitHub Actions や GitHub Pages の過去実行履歴は古いコミットを指す場合がある

今回は自分以外が利用していない前提のため、実害は小さいと判断した。別環境で clone 済みの場合は、未保存作業がなければ再 clone が最も簡単。

---

## GitHub Pagesデプロイ手順（2026-04-25 移行）

公開先は GitHub Pages のプロジェクトページを想定する。

```txt
https://<GitHubユーザー名>.github.io/task-manager/
```

### 前提条件

- GitHub リポジトリが作成済みであること
- ローカルで依存関係をインストール済みであること

```bash
npm install
```

- デプロイ前に以下が通ること

```bash
npm run lint
npm test -- --run
npm run build
```

### 実施順

1. `vite.config.ts` に `base: "/task-manager/"` を設定する
2. `.github/workflows/deploy.yml` を作成する
3. GitHub の `Settings > Pages > Build and deployment > Source` を `GitHub Actions` に設定する（初回 push 前に実施）
4. `main` に push してデプロイ確認する
5. デプロイ後、`develop` ブランチを作成し、以降は `feature/* -> develop -> main` で運用する

### deploy.yml（現行）

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
    paths:
      - "src/**"
      - "public/**"
      - "index.html"
      - "package.json"
      - "package-lock.json"
      - "vite.config.ts"
      - "tsconfig*.json"
      - "eslint.config.js"
      - ".github/workflows/deploy.yml"
  pull_request:
    branches:
      - main
    paths:
      - "src/**"
      - "public/**"
      - "index.html"
      - "package.json"
      - "package-lock.json"
      - "vite.config.ts"
      - "tsconfig*.json"
      - "eslint.config.js"
      - ".github/workflows/deploy.yml"
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test -- --run

      - name: Build
        run: npm run build

      - name: Setup Pages
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        uses: actions/configure-pages@v5

      - name: Upload artifact
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    env:
      FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true

    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 運用メモ

- `main` はデプロイ専用ブランチとして扱う
- 通常開発は `develop` 基点で行う
- リリース単位で `develop -> main` の PR を作成してマージする
- docs-only 変更（`docs/**` や `*.md`）では workflow を起動しない

### よくある質問

**Q. なぜ workflow では Node 24 を使うのか？**  
A. GitHub Actions 側の実行環境を安定させるため。ローカルが Node 25 でも、CI は LTS 系で固定する。

**Q. `npm ci` とは？**  
A. lockfile を厳密に使う CI 向けクリーンインストール。再現性が高い。

**Q. private リポジトリのまま使えるか？**  
A. workflow の定義・実行は private のまま可能。GitHub Pages 利用可否はプラン依存。

**Q. Pages 有効化はいつ実施するか？**  
A. 初回デプロイ実行前。未設定だと `actions/configure-pages` で `Not Found` が出ることがある。

---

## Branch Protection Rulesメモ（main）

最終的に `main` は Ruleset を `Active` にして運用する。`Disabled` だとルールは適用されない。

### 設定可能な主なルール（概要）

- `Require a pull request before merging`
  - `main` への変更を PR 経由に制限する
- `Require status checks to pass before merging`
  - 指定した CI チェック（lint/test/build など）の成功をマージ条件にする
- `Restrict updates`
  - 対象ブランチへの直接 push を禁止する
- `Block force pushes`
  - force push を禁止し、履歴の強制書き換えを防ぐ
- `Restrict deletions`
  - 対象ブランチの削除を禁止する
- `Require linear history`
  - merge commit を禁止し、線形履歴（rebase/squash）に限定する
- `Require signed commits`
  - 署名付きコミットのみ許可する
- `Require deployments to succeed before merging`
  - 指定 Environment へのデプロイ成功をマージ条件にする
  - 今回の構成（`main` push 後に `github-pages` デプロイ）では通常は必須化しない
- `Require review from Code Owners`
  - `CODEOWNERS` 指定パスに対して、owner レビューを必須化する
  - 1人運用では運用負荷が高いため通常は使わない

### 現在の方針（1人運用）

- `Require a pull request before merging`: ON
- `Require status checks to pass before merging`: OFF（`required_status_checks` は未設定）
- `Restrict updates`: OFF
- `Block force pushes`: ON
- `Restrict deletions`: ON
- `Bypass`: 未設定

`Restrict updates` は一見 direct push 禁止に見えるが、bypass 権限を持つユーザー以外による対象ブランチ更新を広く制限する。

PR の merge も最終的には `main` ブランチ更新なので、`Restrict updates` を ON にしたまま bypass 未設定にすると、PR からの merge も `Cannot update this protected ref` でブロックされる。

1人運用では、direct push を避ける目的は `Require a pull request before merging` で担い、`Restrict updates` は OFF にする。

`required_status_checks` を使わない運用のため、PR でのチェック成功は merge 条件に含めない。品質確認は必要に応じてローカル実行で担保する。

### 確認結果

- `Restrict updates` 有効 + Ruleset `Active` 後、`main` への直接 push は `GH013` で拒否されることを確認済み
- `Enforcement status` が `Disabled` の場合は、同じ設定でも直接 push が通る
- `Restrict updates` 有効 + bypass 未設定では、PR merge 時にも `Cannot update this protected ref` が発生する
- `Restrict updates` を OFF にすると `develop -> main` の PR を merge できる
