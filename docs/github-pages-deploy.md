# GitHub Pages デプロイ手順

このドキュメントでは、Vite + React で作成した本アプリを GitHub Pages にデプロイする手順をまとめる。

公開先は GitHub Pages のプロジェクトページを想定する。

```txt
https://<GitHubユーザー名>.github.io/task-manager/
```

## 前提条件

- GitHub リポジトリが作成済みであること
- ローカルで依存関係をインストール済みであること

```bash
npm install
```

- デプロイ前に以下のコマンドが通ること

```bash
npm run lint
npm test -- --run
npm run build
```

## 1. Vite の base を設定する

GitHub Pages のプロジェクトページでは、アプリがリポジトリ名のパス配下で配信される。

本リポジトリ名は `task-manager` のため、`vite.config.ts` に `base: "/task-manager/"` を設定する。

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/task-manager/",
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/hooks/**", "src/utils/**"],
      thresholds: { lines: 80 },
    },
  },
});
```

リポジトリ名を変更した場合は、`base` も `/<repository-name>/` に変更する。

```ts
base: "/<repository-name>/";
```

ユーザーサイトとして `https://<GitHubユーザー名>.github.io/` の直下に公開する場合は、`base: "/"` を設定する。

## 2. GitHub Actions ワークフローを作成する

`.github/workflows/deploy.yml` を作成する。

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
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
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
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

この設定では、`main` ブランチに push すると自動でデプロイされる。

手動で実行したい場合は、GitHub の `Actions` タブから `Deploy to GitHub Pages` を選択し、`Run workflow` を実行する。

## 3. GitHub Pages の公開元を設定する（先に実施）

GitHub のリポジトリ画面で以下を設定する。

1. `Settings` を開く
2. `Pages` を開く
3. `Build and deployment` の `Source` を `GitHub Actions` に変更する

この設定を先に行わないと、`actions/configure-pages` ステップで `Get Pages site failed (Not Found)` が発生する場合がある。

## 4. デプロイを確認する

`main` ブランチに push する。

```bash
git push origin main
```

GitHub の `Actions` タブで `Deploy to GitHub Pages` が成功していることを確認する。

成功後、以下の URL にアクセスする。

```txt
https://<GitHubユーザー名>.github.io/task-manager/
```

確認観点は以下。

- アプリ画面が表示される
- ブラウザをリロードしても 404 にならない
- タスクの追加・編集・削除ができる
- JSON の Import / Export ができる
- localStorage 永続化がデフォルトOFFである

## 5. develop ブランチを作成する

デプロイ後の通常開発は `develop` ブランチで行う。

`main` ブランチは GitHub Pages へのデプロイトリガーとして扱い、公開してよい状態だけを反映する。

初回デプロイ後、`main` から `develop` を作成して push する。

```bash
git switch main
git pull origin main
git switch -c develop
git push -u origin develop
```

以降の修正は `develop` ブランチで行う。

```bash
git switch develop
```

修正後、ローカルで品質チェックを実行する。

```bash
npm run lint
npm test -- --run
npm run build
```

問題なければ `develop` に push する。

```bash
git push origin develop
```

公開したいタイミングで、`develop` から `main` へ Pull Request を作成して merge する。

`main` に merge されると、GitHub Actions により GitHub Pages へ自動デプロイされる。

## localStorage 永続化について

本アプリは GitHub Pages で公開した際に、訪問者のブラウザ環境へ意図せずデータを保存しない方針としている。

そのため、GitHub Pages デプロイ時は `VITE_ENABLE_LOCAL_STORAGE_PERSIST` を設定しない。

開発環境で永続化を有効にしたい場合のみ、プロジェクトルートに `.env.local` を作成する。

```env
VITE_ENABLE_LOCAL_STORAGE_PERSIST=true
```

`.env.local` はローカル開発用の設定であり、GitHub Pages のデプロイ設定には含めない。

## よくある質問

### なぜ workflow では Node 24 を使うのか

GitHub Actions 側の実行環境を安定させるため、LTS 系の Node を固定している。

ローカルで Node 25 を使っていても動作する場合はあるが、CI とローカルの差分で不整合が起きる可能性がある。

### `npm ci` とは何か

`npm ci` は CI 向けのクリーンインストールで、`package-lock.json` を厳密に使って依存関係を再現する。

`npm install` と違い、lockfile と不整合がある場合はエラーで停止するため、デプロイ時の再現性が高い。

### private リポジトリのまま GitHub Pages は使えるか

workflow の定義・実行自体は private のまま可能。

ただし GitHub Pages の利用可否はプランに依存するため、公開方針と契約プランを確認して運用する。

### 手順のどこで Pages を有効化すべきか

`Settings > Pages > Build and deployment > Source = GitHub Actions` は、初回デプロイ実行前に設定する。

先に設定しないと、`actions/configure-pages` で `Get Pages site failed (Not Found)` が発生することがある。

## トラブルシュート

### 画面が真っ白になる

`vite.config.ts` の `base` を確認する。

プロジェクトページの場合、`base` は `"/task-manager/"` にする。

### CSS や JS が読み込まれない

`base` とリポジトリ名が一致していない可能性がある。

公開 URL が `https://<GitHubユーザー名>.github.io/task-manager/` の場合、`base` は `"/task-manager/"` にする。

### 404 になる

GitHub Pages の `Source` が `GitHub Actions` になっているか確認する。

また、`Actions` タブでワークフローが成功しているか確認する。

### データが保存されない

GitHub Pages デプロイ時は localStorage 永続化をデフォルトOFFにしている。

永続化を確認したい場合は、ローカル開発環境で `.env.local` に `VITE_ENABLE_LOCAL_STORAGE_PERSIST=true` を設定して確認する。
