# AGENTS.md (api)

Stack:
- Node (ESM)
- Hono
- `@hono/graphql-server`
- Better Auth
- ClickHouse
- DataLoader
- GraphQL Codegen
- Zod
- Prisma (SQLite)

Entry: `src/index.ts`

---

## コーディング規約
- **リゾルバ層の責務**: リゾルバは薄く保ち、ビジネスロジックはサービスモジュールに記述してください。リゾルバ本体で直接SQLを実行することは禁止です。
- **入力値の検証**: GraphQLの型定義は実行時の検証を保証しません。外部からの入力はすべて Zod で検証し、正規化してから使用してください。
- **パフォーマンス**: 常に大規模なデータセットを想定してください。結果セット全体をメモリにロードすることは避け、事前集計されたテーブルを優先的に使用してください。
- **セキュリティ**:
  - `JWT_SECRET` のような機密情報は環境変数から取得し、ハードコードされたフォールバック値を使用しないでください（取得できない場合はエラーをスローすること）。
  - 生のSQLエラーをログに出力しないでください。
  - 内部のテーブル名をクライアントに公開しないでください。
  - クライアントが提供したカラム名をそのまま信用しないでください。

## 実行・テストコマンド
- 開発サーバー起動:
  ```bash
  pnpm --filter @lightscope-ce/api run dev
  ```
- ビルド (Prisma Client の生成を含む):
  ```bash
  pnpm --filter @lightscope-ce/api run build
  ```
- テスト実行 (Vitest):
  ```bash
  pnpm --filter @lightscope-ce/api run test
  ```
- GraphQLコード生成:
  ```bash
  pnpm --filter @lightscope-ce/api run codegen
  ```
- Prisma / Auth スキーマ生成:
  ```bash
  pnpm --filter @lightscope-ce/api run db:generate
  ```

## プロジェクト構造
- `src/index.ts`: アプリケーションのエントリーポイント
- `src/__generated__/`: `graphql-codegen` によって生成されたリゾルバの型・スキーマ、および Prisma Client (`@/__generated__/prisma/client` でインポート) が配置されます。
- `src/resolvers/`: GraphQL のリゾルバ（従来の `src/graphql/resolvers/` は廃止され、直下に配置されています）。
- `src/helpers/`: ユーティリティや認証プロバイダ (`better-auth` の設定など)。

## 禁止事項
- **ClickHouseに関する禁止事項**:
  - LIMIT なしの `SELECT *` の実行。
  - クライアント側での集計処理。
  - 安全でない文字列連結によるSQL構築 (必ず inline param `{paramName:DataType}` 構文を使用すること)。
  - 無制限のクエリ実行。
  - *例外を除き*、明示的な GROUP BY, WHERE, LIMIT を必ず指定してください。
- **GraphQL Codegenの禁止事項**:
  - `src/__generated__/` 配下のファイルを直接編集しないでください。スキーマやフラグメントを変更した後は、必ず `pnpm run codegen` を実行してください。
- **Prismaの禁止事項**:
  - 生成されたクライアントを `@prisma/client` から直接インポートしないでください（モジュール解決エラーを避けるため `@/__generated__/prisma/client` を使用してください）。
  - 不必要なフィールドをスキーマに追加しないでください。要件を満たす最小限に留めてください。
