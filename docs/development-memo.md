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

---

## 7. Q&A

**Q. `-D` オプションとは何ですか？**  
`--save-dev` の省略形。開発環境のみで使うパッケージとして `devDependencies` に追加する。Vitest や Testing Library はテスト実行用のツールなので本番ビルドには含める必要がない。

**Q. Tailwind のクラスを追加しても反映されない**  
Tailwind v4 はスタイルを CSS Cascade Layers に格納する。レイヤー外のカスタムCSSはレイヤー内より常に優先されるため、`h1 { color: ... }` のような既存スタイルが Tailwind のユーティリティクラスを上書きする。Vite テンプレートのデモ用CSSを削除するか、レイヤー外のスタイルが当たっていない要素で確認する。
