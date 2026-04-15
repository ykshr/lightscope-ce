# LightScope CE - アプリ公開に向けた残タスク

現在のプロジェクト全体と詳細なコードの確認に基づき、アプリを一般公開するために実施しなければならない残タスクを以下に整理します。

## 1. 型安全性とリンターエラーの解消
現在、コードベース（特に `packages/web`）に多くのESLintの警告（39件）が存在しています。主に `@typescript-eslint/no-explicit-any` や `react-refresh/only-export-components` によるものです。
- **タスク:** `packages/web` 内のすべての `any` 型を解消する。GraphQLのレスポンスやコンポーネントの内部状態に対して厳密な型定義を適用する。
  - *対象ファイル例:* `packages/web/src/components/charts/helpers/useProcessData.tsx`, `packages/web/src/components/maps/MapCountry.tsx` 等
- **タスク:** コンポーネントファイルから定数や関数を分離し、Fast Refreshの警告を解消する。
  - *対象ファイル例:* `packages/web/src/components/charts/templates/Filter.tsx`, `packages/web/src/components/filters/DateFilter.tsx`, `packages/web/src/components/tables/templates/Sort.tsx`
- **タスク:** `MapCountry.tsx` における `react-hooks/exhaustive-deps` の警告を解消する。

## 2. 動的データの統合（モックデータの置換）
いくつかのページでは、APIに接続されておらず、ハードコードされたサンプルデータ（モックデータ）が使用されています。これを実際のAPI通信に置き換える必要があります。
- **タスク:** `packages/web/src/pages/article/index.tsx` 等で使われている `SAMPLE_ARTICLE` を、GraphQL等を通じたAPIからの実際のデータフェッチ処理に置き換える。

## 3. 未実装機能やTODOの解消
自動生成ファイルなどに残っているTODOなどを整理・確認します。
- **タスク:** Prismaクライアントの自動生成ファイル (`packages/api/src/__generated__/prisma/runtime/client.d.ts`) などに残るTODOコメントの確認。直接編集は避けるルール(`AGENTS.md`)のため、Prismaのスキーマ定義側や仕様に問題がないか確認する。

## 4. セキュリティとパフォーマンスの最適化
- **タスク:** 最終的なセキュリティ監査を実施する。環境変数 (`ALLOWED_ORIGINS`, `JWT_SECRET`, `DATABASE_URL` 等) が本番環境で適切に設定されるよう、ハードコードやデフォルト値への依存がないか確認する。
- **タスク:** Viteのビルド出力で警告が出ているバンドルサイズ（500kB超）の最適化。`dynamic import()` を用いたコード分割や、`manualChunks` の設定を行い、初期ロードのパフォーマンスを改善する。

## 5. デプロイ環境の構成
本番環境での安全なデプロイに向けたインフラ・CI/CD設定を確実にする。
- **タスク:** 本番用の環境変数の構成とレビュー（特にAPI・プロキシのCORS設定のための `ALLOWED_ORIGINS` の厳密化など）。
- **タスク:** 本番環境へのデプロイメントパイプライン（CI/CD）の確認と構築。現在の `ci.yml` はテスト・ビルドまでを実行しているので、必要に応じてデプロイステップを追加する。
- **タスク:** `packages/web/dist` のビルドアセットが本番環境（CDNやNginxなど）でセキュアかつ効率的に配信されるよう設定を確認する。

## 6. テスト拡充
- **タスク:** カバレッジの向上。現在のCIでテストは通過しているが、フロントエンドのコンポーネント等で不足している単体テスト・結合テストを追加する。
- **タスク:** E2Eテスト（Playwright）のシナリオ拡充。認証、データ取り込み、ダッシュボードの表示など、ユーザーのクリティカルパスが網羅されているか確認する。

## 7. ドキュメントの更新
- **タスク:** `README.md` を更新し、ローカルのDocker Composeによる起動手順だけでなく、本番デプロイ向けの手順や構成について追記する。
