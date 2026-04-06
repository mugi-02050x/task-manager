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

## 7. Q&A

**Q. `-D` オプションとは何ですか？**  
`--save-dev` の省略形。開発環境のみで使うパッケージとして `devDependencies` に追加する。Vitest や Testing Library はテスト実行用のツールなので本番ビルドには含める必要がない。

**Q. Tailwind のクラスを追加しても反映されない**  
Tailwind v4 はスタイルを CSS Cascade Layers に格納する。レイヤー外のカスタムCSSはレイヤー内より常に優先されるため、`h1 { color: ... }` のような既存スタイルが Tailwind のユーティリティクラスを上書きする。Vite テンプレートのデモ用CSSを削除するか、レイヤー外のスタイルが当たっていない要素で確認する。
