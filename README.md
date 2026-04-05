# タスクm理アプリ

タスクの詳細・実績時間を管理するWebアプリケーション。

## 機能

- タスクのCRUD（作成・読み取り・更新・削除）
- タスクの階層構造（深さ最大5階層・子タスク最大20件）
- ステータス管理（未着手・進行中・完了）
- 開始/終了タイマーによる実績時間の自動算出
- 実績時間の自動集計
- データエクスポート（実績・タスク詳細）
- データインポート
- localStorageへのデータ保存

## 技術スタック

| 項目 | 内容 |
|------|------|
| フレームワーク | React + Vite |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| テスト | Vitest + React Testing Library |
| データ保存 | localStorage |
| デプロイ | GitHub Pages |

## 開発環境のセットアップ

```bash
npm install
npm run dev
```

## テスト

```bash
# テスト実行（ウォッチモード）
npm test

# カバレッジ計測
npm run test:coverage
```

## ドキュメント

- [要件定義](docs/requirements.md)
- [データモデル](docs/data-model.md)
- [画面設計・コンポーネント構成](docs/screen-design.md)
- [開発中のメモ](docs/development-memo.md)
