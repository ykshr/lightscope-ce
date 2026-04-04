# AGENTS.md (proxy)

Stack:
- Node (ESM)
- Hono
- ClickHouse
- Zod
- LRU Cache

Entry: `src/index.ts`

---

## コーディング規約
- **エンドポイントの責務**: トラッカーからのイベントを高速に受け取り、検証し、ClickHouseに保存することが主な役割です。
- **入力値の検証**: Zod を使用して、受信したペイロードが正しいフォーマットであることを厳密に検証してください。
- **CORS と認証**: JwtAuth プロバイダは、JWTの `origin` クレームに対して `Origin` または `Referer` ヘッダを厳密に検証します。これらのヘッダが欠落している場合は未承認（追跡防止）として扱います。

## 実行・テストコマンド
- 開発サーバー起動:
  ```bash
  pnpm --filter @lightscope-ce/proxy run dev
  ```
- ビルド:
  ```bash
  pnpm --filter @lightscope-ce/proxy run build
  ```
- テスト実行 (Vitest):
  ```bash
  pnpm --filter @lightscope-ce/proxy run test
  ```

## プロジェクト構造
- `src/index.ts`: Hono アプリケーションのエントリーポイント
- `src/helpers/`: トラッカーデータのパース、IPアドレスのジオロケーション（MaxMindなど）のユーティリティ関数。
- `src/routes/`: 各種 REST API のルート定義。

## 禁止事項
- **セキュリティ**:
  - `ALLOWED_ORIGIN` が設定されていない場合、CORSミドルウェアはスキップされブラウザのSame-Origin Policyが適用されます。この挙動を無断で変更しないでください。
  - SQLインジェクションを防ぐため、ClickHouseへのデータ挿入時には必ずパラメータ化されたクエリを使用してください。
- **パフォーマンス**:
  - トラッカーからのリクエストをブロックするような重い同期処理を導入しないでください。
