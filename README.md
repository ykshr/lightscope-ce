# LightScope CE

LightScope CE (Community Edition) は、ClickHouseを活用した高性能なWebアナリティクスプラットフォームです。TypeScriptを用いたモノレポ構成で開発されており、リアルタイムなデータ集計とモダンなダッシュボードを提供します。

## プロジェクト構成

本プロジェクトは **pnpm workspaces** を使用して以下のパッケージを管理しています。

- **packages/web**: フロントエンドアプリケーション (React, Vite, TailwindCSS, Recharts)
- **packages/api**: GraphQL API バックエンド (Node.js, Hono `@hono/graphql-server`, ClickHouse)
- **packages/proxy**: トラッカーイベント収集用のREST API (Node.js, Hono, ClickHouse)
- **packages/clickhouse**: ClickHouseデータベースの設定とSQLマイグレーション
- **packages/tracker**: トラッカーユーティリティスクリプト
- **packages/mock-site**: Nginxで配信される動作確認用のモックサイト
- **packages/e2e**: Playwrightとtsxを使用したエンドツーエンド（E2E）テスト

## 技術スタック

- **フロントエンド**: React, TypeScript, Vite, Tailwind CSS, Radix UI, TanStack Query
- **バックエンド**: Node.js, TypeScript, Hono, GraphQL API (apiパッケージ), REST API (proxyパッケージ)
- **データベース**: ClickHouse (高速な分析クエリ向け)
- **インフラ**: Docker, Docker Compose, Nginx

## はじめに (Getting Started)

### 前提条件 (Prerequisites)

- Node.js (v20以上を推奨)
- pnpm (v9以上を推奨)
- Docker および Docker Compose (フルスタック環境の実行に必要)

### インストール (Installation)

1. リポジトリをクローンします。
   ```bash
   git clone https://github.com/ykshr/lightscope-ce.git
   cd lightscope-ce
   ```

2. 依存関係をインストールします。
   ```bash
   pnpm install
   ```

3. 環境変数を設定します。
   ```bash
   cp .env.example .env
   ```
   必要に応じて `.env` ファイルの内容を確認・更新してください。
   *注意:* `api` および `proxy` パッケージのCORSオリジンは `ALLOWED_ORIGINS` 環境変数で制限されています（デフォルトは `[]` です）。

### ローカルでの実行方法 (Running Locally)

Docker Compose を使用して、すべてのサービスを一度に起動することができます。

```bash
docker compose up -d --build
```

これにより、以下のサービスが起動します。
- **ClickHouse**: `http://localhost:8123`
- **API**: `http://localhost:3000`
- **Proxy**: `http://localhost:3001`
- **Web (ダッシュボード)**: `http://localhost:5173`
- **Mock Site**: `http://localhost:8080`

*注意:* Docker Hubの未認証でのプル制限により、ClickHouseイメージの取得に失敗する場合があります。その場合はログインするか時間を置いて再試行してください。

### 開発・運用に関するコマンド (Available Scripts)

リポジトリのルートディレクトリから以下のコマンドを実行できます。

- `pnpm run format` : Prettierを使用してコードのフォーマットを自動修正します。
- `pnpm run ci` : すべてのパッケージに対して、静的解析(Lint)、型チェック、フォーマット確認、ユニットテスト、ビルドを実行します。プルリクエストを作成する前などに必ず実行し、エラーがないことを確認してください。
- `pnpm run test:e2e` : E2Eテストを実行します。

## アーキテクチャの概要 (Architecture Overview)

LightScopeは主に以下のコンポーネントで構成されています。

1. **データ収集 (Proxy)**: トラッカーからの分析イベントを受信するREST API。
2. **API (API)**: ダッシュボード向けにデータを提供するGraphQL API。
3. **データ保存 (Storage)**: 大量のイベントデータの保存とリアルタイムな集計を行うための ClickHouse。
4. **ダッシュボード (Web)**: データを可視化するためのReactアプリケーション。

## ライセンス (License)

MIT License
