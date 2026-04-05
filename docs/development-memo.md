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

## 7. Q&A

**Q. `-D` オプションとは何ですか？**  
`--save-dev` の省略形。開発環境のみで使うパッケージとして `devDependencies` に追加する。Vitest や Testing Library はテスト実行用のツールなので本番ビルドには含める必要がない。

**Q. Tailwind のクラスを追加しても反映されない**  
Tailwind v4 はスタイルを CSS Cascade Layers に格納する。レイヤー外のカスタムCSSはレイヤー内より常に優先されるため、`h1 { color: ... }` のような既存スタイルが Tailwind のユーティリティクラスを上書きする。Vite テンプレートのデモ用CSSを削除するか、レイヤー外のスタイルが当たっていない要素で確認する。
