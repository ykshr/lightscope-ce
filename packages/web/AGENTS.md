# AGENTS.md (web)

Stack:
- React 19
- Vite
- TanStack React Query v5
- GraphQL Codegen
- Tailwind v4
- shadcn/ui
- Radix UI
- Recharts
- Vitest

---

## コーディング規約
- **データ取得ルール**:
  - 生成された GraphQL フック (`useQuery`, `useMutation`) を使用してください。
  - `fetch` を手動で使用したり、新たに `axios` などを導入することは避けてください。
- **状態管理**:
  - サーバー状態の管理には React Query を使用してください。
  - カスタムのグローバルストア、Redux、Zustand の導入は避けてください。
- **UIとスタイリングのルール**:
  - 可能な限り `shadcn/ui` のプリミティブコンポーネントを使用してください。
  - スタイリングには Tailwind v4 のユーティリティクラスのみを使用し、カスタムCSSファイルやインラインスタイルは避けてください。
  - 既存のコンポーネントとの一貫性を保ち、追加する `className` は最小限に留めてください。

## 実行・テストコマンド
- 開発サーバー起動:
  ```bash
  pnpm --filter @lightscope-ce/web run dev
  ```
- ビルド:
  ```bash
  pnpm --filter @lightscope-ce/web run build
  ```
- テスト実行 (Vitest):
  ```bash
  pnpm --filter @lightscope-ce/web run test
  ```
- GraphQLコード生成 (React Query 用フックの生成):
  ```bash
  pnpm --filter @lightscope-ce/web run codegen
  ```

## プロジェクト構造
- `src/components/`: 再利用可能な UI コンポーネント (shadcn/ui 含む)。
- `src/pages/`: ルーティングに対応する各ページコンポーネント。
- `src/helpers/`: 認証 (`better-auth` クライアントなど) やユーティリティ関数。
- `src/hooks/`: カスタムフックや、GraphQL Codegen で生成されたフック。

## 禁止事項
- **パフォーマンス**:
  - アナリティクスのダッシュボードは重くなりがちです。レンダリング中に重い集計処理を実行しないでください。集計はバックエンド (ClickHouse) に任せることを優先してください。
  - 必要な場合は `useMemo` などを活用して重い変換処理をメモ化してください。
- **テスト**:
  - Vitest と Testing Library を使用してください。
  - 必要な場合を除き、DOM全体の完全なモック作成は避けてください。
