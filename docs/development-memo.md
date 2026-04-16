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
npm install -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

| パッケージ | 役割 |
|-----------|------|
| `vitest` | Viteと統合されたテストランナー。`npm test` でテストを実行する |
| `@vitest/coverage-v8` | テストカバレッジを計測する |
| `jsdom` | ブラウザ環境をNode.js上で模倣する（DOMの操作が可能になる） |
| `@testing-library/react` | Reactコンポーネントをテスト用にレンダリングする |
| `@testing-library/jest-dom` | `toBeInTheDocument()` などのDOM用マッチャーを追加する |
| `@testing-library/user-event` | クリックや入力などのユーザー操作をシミュレートする |

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
import '@testing-library/jest-dom'
```

全テストファイルの実行前にこのファイルが読み込まれるため、`toBeInTheDocument()` などが使えるようになる。

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
A. 無視しない。`vite.config.ts` の `setupFiles` に登録されており、全テストで DOM 用マッチャー（`toBeInTheDocument()` 等）が使えるようになっている。将来のコンポーネントテストの準備として活きる。

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
