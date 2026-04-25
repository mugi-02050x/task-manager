# 開発メモ

作成日: 2026-04-05  
最終整理日: 2026-04-25

このドキュメントは、開発中に残した時系列メモをカテゴリ別に要約したもの。

---

## プロジェクト構成

- React + Vite + TypeScript
- Tailwind CSS
- Vitest + React Testing Library
- GitHub Pages + GitHub Actions

### Q&A

**Q. Vite の設定で `defineConfig` はどこから import するべきか？**  
A. テスト設定を含めるため `vitest/config` から import する。`vite` から import すると `test` プロパティで型エラーになる。

**Q. Tailwind CSS v4 では設定ファイルが必要か？**  
A. 基本的には不要。`@tailwindcss/vite` を Vite plugin に追加し、`src/index.css` で `@import "tailwindcss";` する。

**Q. `-D` オプションとは何か？**  
A. `--save-dev` の省略形。Vitest や Testing Library のような開発・テスト用パッケージを `devDependencies` に追加する。

---

## 状態管理

タスク状態は `tasks` と `trackRecords` を持つ `TaskState` として扱う。更新は reducer に集約し、Context から dispatch する。

### 重要な判断

- `TaskReducer.ts` は `reducer` と `initialState` などの純粋な状態更新に寄せる。
- `useReducer` の呼び出しは `TaskContext.tsx` に置く。
- `IMPORT` は `tasks` だけでなく `trackRecords` も含む `TaskState` 全体を受け取る。
- 日付フィールドは `endDatetime` に統一する。
- state は直接変更せず、必ず新しいオブジェクト・配列を返す。

### Q&A

**Q. `dispatch` は何を state として登録するのか？**  
A. reducer が return した新しい state を登録する。React は参照の変化で再レンダリングを判断するため、破壊的変更は避ける。

**Q. action の `payload` とは何か？**  
A. action に必要なデータ本体。`type` が命令の種類、`payload` がその命令に必要な値。

**Q. Action も型定義する必要があるか？**  
A. 必要。判別共用体にすると `type` ごとに `payload` の型が絞り込まれ、typo もコンパイル時に検出できる。

**Q. reducer と Context を分ける理由は？**  
A. reducer を純粋関数として保てるため、単体テストしやすい。Context は Hook と Provider の責務に集中できる。

---

## 時間計算・タスク階層

実績時間とタスク階層は UI から切り離し、utils / hooks 側で扱う。

### 重要な判断

- 実績時間は各レコードで丸めず、合計してから 0.25h 単位に変換する。
- `calcElapsed` は単一タスクの実績合算に限定する。
- 親タスクの実績は、子孫タスクIDを集めて合算する。
- 階層探索は再帰 DFS を採用する。
- `getDepth` などは対象タスクが見つからない場合のガードを持つ。

### Q&A

**Q. なぜ各レコードを個別に丸めないのか？**  
A. レコードごとに切り捨てると誤差が積み重なるため。合計後に1回だけ丸める方が正確。

**Q. `calcElapsed` だけで親タスクの実績を計算できるか？**  
A. できない。`calcElapsed` は単一タスク用。親タスクは `useElapsed` 側で子孫IDを集めて合算する。

**Q. Hook をループ内で呼べるか？**  
A. 呼べない。Hook はコンポーネントまたはカスタムフックのトップレベルで呼ぶ。Hook 内部で通常のループ処理を行うのは問題ない。

---

## localStorage・永続化

localStorage 永続化は開発環境で必要な場合に使う。GitHub Pages では訪問者のブラウザに意図せず保存しない方針。

### 重要な判断

- localStorage から復元した日付は文字列になるため、zod で Date に変換する。
- 保存データの削除では localStorage と React state の両方を初期化する。
- state 初期化直後に `useEffect` が再保存しないよう、1回だけ persist をスキップする。
- GitHub Pages デプロイ時は `VITE_ENABLE_LOCAL_STORAGE_PERSIST` を設定しない。
- ローカルで永続化を有効にする場合のみ `.env.local` を使う。

### Q&A

**Q. 保存データのクリア機能では何を削除するのか？**  
A. localStorage の保存キーと、画面上で保持している React state の両方を初期化する。

**Q. なぜ localStorage のキー削除だけではだめか？**  
A. localStorage だけ削除しても、表示中の React state は残るため。UI と保存内容がずれないように state も初期化する。

**Q. クリア直後に初期 state が再保存されないようにする理由は？**  
A. `useEffect` による永続化が走ると、削除直後に空の初期 state が localStorage へ再作成されるため。クリア直後の1回だけ persist をスキップする。

**Q. クリア後にタスクを追加するとどうなるか？**  
A. 初期状態から新しい state が作られ、その内容で localStorage キーが再作成される。クリア済みの古いデータは戻らない。

**Q. `.env.local` はデプロイ設定に含めるべきか？**  
A. 含めない。ローカル開発専用で、`.gitignore` により追跡対象外にする。

---

## テスト方針

ロジックは hooks / utils / reducer に寄せ、そこを重点的にテストする。コンポーネントテストは必要性が出るまで厚くしない。

### 重要な判断

- reducer は純粋関数なので直接呼び出してテストする。
- Context は dispatch が state に反映されることを中心に確認する。
- `src/test/setup.ts` で localStorage モックと mock 後処理を共通化する。
- 時刻依存テストは `vi.useFakeTimers()` と `vi.setSystemTime()` を使う。
- JSON文字列のテストデータは手書きせず `JSON.stringify` で生成する。

### Q&A

**Q. reducer テストで `renderHook` は必要か？**  
A. 不要。reducer は `(state, action) => newState` の純粋関数なので直接テストできる。

**Q. `setup.ts` は無視してよいか？**  
A. 無視しない。全テスト共通の localStorage モックや `vi.restoreAllMocks()` を担う。

**Q. `toEqual` と `toMatchObject` はどう使い分けるか？**  
A. 全体一致を見たい場合は `toEqual`。変更対象フィールドだけ確認したい場合は `toMatchObject`。

**Q. コンポーネントテストは必要か？**  
A. 現状では必須ではない。ロジックが hooks / utils / reducer に集約されているため、まずそこをテストする。

---

## UI・フォーム

UI コンポーネントは表示に寄せ、状態更新やビジネスロジックは hooks / context に寄せる。

### 重要な判断

- コンポーネントの操作入口は `useTaskOperations` にする。
- `useTaskManager` は状態管理寄りの下位フックとして扱う。
- `TaskFormModal` は新規作成と編集を同じモーダルで扱う。
- submit 時の create/edit 分岐は `useTaskOperations` 経由で扱う。
- モーダル管理は `useTaskFormModal` に切り出す。
- フォーム入力専用型として `TaskFormInput` を定義する。
- 編集対象が見つからない場合は空フォームにせず、エラー扱いにする。

### Q&A

**Q. 新規作成と編集でモーダルを分けるべきか？**  
A. 分けなくてよい。`mode: "create" | "edit"` で submit 時の処理だけ分岐する。

**Q. モーダル状態を Context に入れるべきか？**  
A. 今回は不要。局所的な UI 状態なので `TaskTree` 配下で管理する方が責務が明確。

**Q. 編集中に元データが更新された場合、自動同期すべきか？**  
A. 自動同期は入力中の値を壊すリスクがある。単一ユーザー前提では過剰対応せず、必要になったら保存時競合検知を検討する。

**Q. JSX 内のコメントはどう書くか？**  
A. `{/* comment */}` を使う。`//` は文字列としてレンダリングされることがある。

---

## CSS・レスポンシブ

Tailwind のユーティリティクラスをコンポーネント近くに置き、どこを変えると見た目が変わるか追いやすくする。

### 重要な判断

- まず構造を固め、その後に Tailwind で見た目を調整する。
- グローバルCSSを作り込みすぎず、各コンポーネントで必要なクラスを持つ。
- モバイルでは固定幅の横並びを避け、情報を縦方向に整理する。
- デスクトップでは横1行レイアウトを維持する。
- 深い階層でも破綻しないよう、モバイルではインデントと余白を小さくする。

### Q&A

**Q. Tailwind のクラスを付けても反映されない場合は？**  
A. 既存CSSが Tailwind のユーティリティより優先されている可能性がある。Vite テンプレート由来のデモCSSなどを確認する。

**Q. モバイルで横並びが崩れる原因は？**  
A. 固定幅要素と `flex-row` の合計幅が画面幅を超えるため。モバイルでは縦積みと可変幅を優先する。

**Q. タップ領域はどの程度必要か？**  
A. モバイルでは `h-10` 以上を目安にする。小さいボタンはミスタップが増える。

---

## GitHub・ブランチ運用

公開後は `main` をリリース・デプロイ用、`develop` を統合用、`feature/*` を作業用として扱う。

### 基本フロー

1. `develop` から `feature/*` を作成する
2. `feature/*` で作業する
3. `feature/* -> develop` の PR を作成して merge する
4. 公開したいタイミングで `develop -> main` の PR を作成する
5. `main` merge 後に GitHub Pages へデプロイする

### 重要な判断

- default branch は `main` のままにする。
- 1人運用では reviewer 必須にはしない。
- `Require a pull request before merging` は ON。
- `Require status checks to pass before merging` は OFF。
- `Restrict updates` は OFF。
- `Block force pushes` と `Restrict deletions` は ON。
- public リポジトリでも、他人が勝手に push できるわけではない。

### Q&A

**Q. public リポジトリは誰でも commit できるのか？**  
A. できない。public は閲覧可能という意味で、push には write 権限が必要。

**Q. 1人運用でレビュー必須にすべきか？**  
A. 基本的には不要。自分のPRを自分で必須レビューする運用は詰まりやすい。

**Q. `Restrict updates` は direct push 禁止として使えるか？**  
A. 注意が必要。bypass 権限を持たない更新全体を制限するため、PR merge まで `Cannot update this protected ref` で止まることがある。1人運用では OFF にする。

**Q. `required_status_checks` はいつ使うべきか？**  
A. チーム運用や外部PRを受ける場合など、CI成功を merge 条件にしたいとき。現在は軽量運用のため未設定。

---

## GitHub Pages・Actions

GitHub Pages は Vite のプロジェクトページとして公開する。

```txt
https://<GitHubユーザー名>.github.io/task-manager/
```

### 重要な設定

- `vite.config.ts` に `base: "/task-manager/"` を設定する。
- GitHub の `Settings > Pages > Build and deployment > Source` を `GitHub Actions` にする。
- Pages 設定は初回 workflow 実行前に行う。
- workflow では Node 24 を使い、CI環境を安定させる。
- `npm ci` で lockfile に基づく再現性の高い install を行う。

### 現行 workflow の挙動

- `pull_request -> main`（対象パス変更あり）
  - `build` を実行する
  - `deploy` は実行しない
- `push -> main`（対象パス変更あり）
  - `build` を実行する
  - `deploy` で GitHub Pages に反映する
- docs-only 変更（`docs/**`, `*.md` など）
  - workflow 自体を起動しない
- `workflow_dispatch`
  - 手動実行できる

対象パス:

```yaml
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
```

### 動作確認チェックリスト

1. docs-only の PR を作る
2. Actions に `Deploy to GitHub Pages` が出ないことを確認する
3. `src/**` を含む PR を作る
4. `build` が実行されることを確認する
5. `develop -> main` を merge する
6. `main` 反映後、アプリ影響ファイル変更で `build` と `deploy` が実行されることを確認する

### Q&A

**Q. Pages 有効化は workflow で自動化するのか？**  
A. 基本は GitHub Web の `Settings > Pages` で設定する。未設定だと `actions/configure-pages` で `Not Found` が出ることがある。

**Q. `deploy` ジョブは PR でも必要か？**  
A. 不要。必須チェックを設定していないため、PRでは `build` だけでよい。

**Q. docs-only 変更でもデプロイが必要か？**  
A. 不要。`paths` でアプリ影響ファイルに限定し、docs-only では workflow を起動しない。

**Q. `develop` に新workflowがあればすぐ有効になるか？**  
A. `main` 上の workflow 定義が使われるため、`main` に merge されるまでは旧workflowが実行される。

**Q. private リポジトリでも Pages は使えるか？**  
A. workflow の定義・実行は可能。GitHub Pages の利用可否はプランに依存する。

---

## セキュリティ・公開前確認

公開前には、コミット履歴・環境変数・サンプルデータに機密情報が含まれないことを確認する。

### 重要な判断

- `.env.local` は追跡しない。
- `*.local` と `*.local.json` は `.gitignore` に含める。
- deploy workflow の `id-token` は GitHub Actions の権限定義でありシークレットではない。
- Git commit email は GitHub の noreply を使う。
- 既に公開済みのメールアドレスを消す場合は履歴書き換えが必要になる。

### Q&A

**Q. Git のメールアドレスは隠すべきか？**  
A. 公開リポジトリでは noreply を使うのが無難。author / committer email は履歴から見える。

**Q. 履歴を書き換えると何が起きるか？**  
A. コミットハッシュが変わる。古いURL参照や既存cloneに影響するため、自分だけのリポジトリか慎重に確認する。

**Q. APIキーらしい値がないかどう確認するか？**  
A. `.env*`, docs, sample data, test data, workflow を確認する。サンプルIDや GitHub Actions の権限定義はシークレットではない。
