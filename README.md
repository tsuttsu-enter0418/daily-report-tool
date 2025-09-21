# 日報管理システム (Daily Report Tool)

React + Spring Boot + PostgreSQL で構築された企業向け日報管理システム

## 🚀 クイックスタート

### フロントエンド開発（推奨）

実 API 統合完成により、モックまたは実 API を選択可能：

```bash
cd frontend
npm install
npm run dev          # モックAPIで起動 → http://localhost:3000
npm run dev:api      # 実APIで起動（要バックエンド起動）
```

### フルスタック開発

```bash
docker-compose up    # 全サービス起動（推奨：完全動作確認）
```

## 📋 機能

✅ **ログイン認証**

- JWT 認証によるセキュアなログイン
- ユーザー名: `admin` / パスワード: `password`
- Cookie 自動保存でログイン状態維持

✅ **開発環境**

- モック API: フロントエンド独立開発
- 実 API 連携: バックエンド連携開発
- Docker: フルスタック開発

✅ **アーキテクチャ改善**

- アトミックデザイン実装（Button/Toast の Atom 化）
- カスタムフック導入（useLogin, useAuth）
- 統一メッセージ管理（MessageConst）
- ChakraUI v3.2 完全対応

✅ **状態管理**

- Jotai による全画面ユーザー情報参照
- ローカルストレージ同期でページリロード対応
- 認証状態の一元管理

✅ **開発効率向上**

- Lombok によるボイラープレートコード削減
- OpenAPI/Swagger による自動 API 仕様書生成
- type エイリアス優先による柔軟な型定義
- モック API による独立開発環境

✅ **上司ダッシュボード**

- 部下の日報一覧表示・管理機能
- ステータスフィルタリング（完了/保留/全件）
- レスポンシブ対応（モバイル 1 列、タブレット 2 列、PC3 列）
- アバター付きカード UI で直感的な進捗確認

✅ **暖色系フレッシュデザイン**

- オレンジ・アンバー・イエロー基調のカラーパレット
- ホバーアニメーションとシャドウ効果
- 統一された StatusBadge カラーシステム

✅ **最新技術対応**

- ChakraUI v3.2 完全対応（TypeScript エラー解消）
- Vitest 設定修正（テスト環境構築完了）
- 実 API 統合完成（モック → リアル API 移行完了）
- **コード品質向上完了**（ESLint エラー 97%削減：232→3・型安全性強化）
- **テスト品質大幅向上完了**（API サービステスト改善・ChakraProvider エラー修正・実 API テスト完全実装）
- **アクセシビリティ強化完了**（Spinner コンポーネント aria-label 追加・WCAG 準拠向上）
- **テスト安定性向上完了**（ProtectedRoute テストタイムアウト解決・非同期処理最適化）
- **コンポーネント共通化完了**（DatePickerField・DevModeIndicator の Molecule 化・再利用性向上）
- **包括的テスト実装完了**（DailyReportForm 18 テストケース・フォーム機能完全カバレッジ）

✅ **日報管理機能完成**

- 日報作成・編集・削除・詳細表示の完全 CRUD 実装
- ステータス管理（下書き ⇔ 提出済み）リアルタイム変更
- 高度な検索機能（タイトル・内容・日付フィルタリング）
- セキュアな削除機能（確認ダイアログ + データ保護）

✅ **UX/UI 強化**

- Toast 通知システム（成功・エラー・警告・情報対応）
- 確認ダイアログシステム（操作安全性向上）
- 権限制御強化（本人・上司・管理者の適切なアクセス制御）
- ローディング状態とエラーハンドリング統一

## 🛠 技術スタック

### フロントエンド

- **React 19** + **TypeScript** + **Vite**
- **Chakra UI v3.2** (UI コンポーネント・Toast 通知)
- **Jotai** (状態管理)
- **React Router** (ルーティング)
- **React Hook Form** + **Yup** (フォーム管理・バリデーション)
- **Axios** (HTTP 通信・API 統合)
- **カスタムフック** (useToast, useDailyReports, useAuth 等)

### テスト環境（大幅向上完了）

- **Vitest** (単体テスト・統合テスト)
- **React Testing Library** (UI コンポーネントテスト)
- **fetch モック** (実 API 挙動シミュレーション)
- **ChakraProvider 統合** (テストユーティリティ自動ラップ)
- **テストファイル構成**:
  - `apiService.test.ts` - シンプルモック API テスト (11 テスト成功)
  - `realApi.test.ts` - 完全実 API テスト (12 テスト成功)
  - `DailyReportForm.test.tsx` - 包括的フォームテスト (18 テストケース)
  - `ProtectedRoute.test.tsx` - タイムアウト問題解決済み統合テスト
  - `Login.test.tsx` - ログイン機能統合テスト
  - `DeleteConfirmDialog.test.tsx` - ChakraProvider 対応統合テスト

### バックエンド

- **Spring Boot 3.2** + **Java 17**
- **Spring Security** + **JWT 認証**
- **BaseController** (共通認証処理・デバッグモード対応)
- **JPA/Hibernate** (ORM)
- **Lombok** (ボイラープレート削減)
- **SpringDoc OpenAPI** (API 仕様書生成)

### データベース・インフラ

- **PostgreSQL 15**
- **pgAdmin 4** (PostgreSQL GUI 管理ツール)
- **Docker Compose** (コンテナ管理)
- **Maven** (依存関係管理)

### 開発・設計手法

- **アトミックデザイン** (コンポーネント設計)
- **Clean Architecture** 意識
- **type エイリアス優先** (TypeScript 型定義)
- **実 API 統合** (モックから完全移行)
- **暖色系デザインシステム** (統一された UI/UX)
- **レスポンシブデザイン** (SimpleGrid レイアウト)
- **確認ダイアログパターン** (安全な操作確認)
- **Toast 通知システム** (統一されたフィードバック)
- **カスタムフック活用** (ロジック分離・再利用性向上)
- **コード品質重視** (ESLint strict・型安全性・本番最適化)

## 📁 プロジェクト構成

```
daily-report-tool/
├── frontend/                  # React アプリケーション
│   ├── src/
│   │   ├── components/        # アトミックデザイン構成
│   │   │   ├── atoms/         # 最小単位コンポーネント (Button等)
│   │   │   ├── molecules/     # 小機能コンポーネント (DatePickerField, DevModeIndicator, SearchForm, DeleteConfirmDialog等)
│   │   │   └── ui/            # ChakraUI設定
│   │   ├── hooks/             # カスタムフック (useToast, useDailyReports等)
│   │   ├── stores/            # Jotai状態管理
│   │   ├── types/             # TypeScript型定義 (api.ts, components.ts等)
│   │   ├── services/          # API通信・実API統合
│   │   ├── constants/         # 定数・メッセージ
│   │   └── pages/             # ページコンポーネント (詳細画面, 検索機能等)
│   └── package.json
├── backend/                   # Spring Boot アプリケーション
│   ├── src/main/java/com/example/dailyreport/
│   │   ├── controller/        # REST API コントローラー
│   │   │   ├── BaseController.java      # 共通認証処理基底クラス
│   │   │   ├── AuthController.java      # 認証API
│   │   │   └── DailyReportController.java # 日報管理API
│   │   ├── service/           # ビジネスロジック
│   │   ├── entity/            # JPA エンティティ (Lombok使用)
│   │   ├── dto/               # データ転送オブジェクト
│   │   ├── repository/        # データアクセス層
│   │   ├── security/          # 認証・認可設定
│   │   └── config/            # 設定クラス (OpenAPI等)
│   └── pom.xml
├── database/                  # PostgreSQL 初期化
│   └── init.sql
├── docker-compose.yml         # Docker 構成
├── CLAUDE.md                  # 開発ガイドライン
├── TESTING_GUIDE.md           # テスト手法ガイド
└── README.md
```

## 🏗 AWS設定

本プロジェクトは以下のAWSサービスを使用しています。

### CloudFront（CDN・静的サイト配信）

**ディストリビューション情報**
- **Distribution ID**: `E2WDA103AF64NB`
- **ドメイン**: `kouhei-portfolio.net`
- **CloudFront URL**: `d33fixrixjks4n.cloudfront.net`

**OAC（Origin Access Control）設定**
- **OAC ID**: `E3B8LDMOGYQY9U`
- **Origin**: S3 REST APIエンドポイント（`kouhei-portfolio.net.s3.ap-northeast-1.amazonaws.com`）
- **設定ファイル**: `dist-config.yaml`

**設定変更履歴**
```bash
# OAC設定適用
aws cloudfront update-distribution --id E2WDA103AF64NB --cli-input-yaml file://dist-config.yaml
```

**重要な変更点**
- S3ウェブサイトエンドポイント → S3 REST APIエンドポイントに変更
- `CustomOriginConfig` → `S3OriginConfig`に変更
- OACによるセキュアなS3アクセス制御を実現

### RDS（PostgreSQL データベース）

**インスタンス情報**
- **DB Instance**: `daily-report-tool`
- **Engine**: `PostgreSQL`
- **Parameter Group**: `rds-postgres-custom`
- **Status**: `available`

**クエリログ設定（有効化済み）**
```bash
# クエリログ関連パラメータ
log_statement = all                    # すべてのSQL文をログ出力
log_min_duration_statement = 0         # すべてのクエリ（0ms以上）をログ出力
log_line_prefix = %t:%r:%u@%d:[%p]:   # 詳細ログフォーマット
```

**CloudWatch Logs統合**
- **ログ出力先**: `/aws/rds/instance/daily-report-tool/postgresql`
- **ログストリーム**: `daily-report-tool.0`
- **用途**: デバッグ・パフォーマンス分析・セキュリティ監査

**ログ確認コマンド**
```bash
# RDS基本情報確認
aws rds describe-db-instances --db-instance-identifier daily-report-tool

# クエリログパラメータ確認
aws rds describe-db-parameters --db-parameter-group-name rds-postgres-custom \
  --query 'Parameters[?contains(ParameterName, `log_statement`)]'

# CloudWatch Logsからクエリログ確認
aws logs get-log-events \
  --log-group-name "/aws/rds/instance/daily-report-tool/postgresql" \
  --log-stream-name "daily-report-tool.0" \
  --limit 50
```

### S3（静的サイトホスティング）

**バケット設定**
- **バケット名**: `kouhei-portfolio.net`
- **リージョン**: `ap-northeast-1`
- **アクセス制御**: CloudFront OAC経由のみ

**セキュリティ強化**
- 直接S3アクセスをブロック
- CloudFront経由でのみアクセス可能
- OACによる認証済みリクエストのみ許可

### 設定ファイル

**`dist-config.yaml`** - CloudFront設定
```yaml
# 主要設定項目
DomainName: kouhei-portfolio.net.s3.ap-northeast-1.amazonaws.com
OriginAccessControlId: 'E3B8LDMOGYQY9U'
S3OriginConfig:
  OriginAccessIdentity: ''
```

**運用メモ**
- CloudFront設定変更は5-15分で反映
- RDSクエリログは全てのSQL文を記録（パフォーマンス影響を考慮）
- OAC設定により、S3への不正アクセスを防止

## 🔧 開発コマンド

### フロントエンド

```bash
cd frontend
npm run dev              # モックAPI使用（推奨）
npm run dev:api          # 実API使用（要バックエンド起動）
npm run build            # 本番ビルド
npm run lint             # ESLint実行
npm run test             # テスト実行 (改善完了: 全テスト成功・タイムアウト問題解決済み)
npm run test:coverage    # カバレッジ付きテスト
npm test -- realApi      # 実APIテストのみ実行 (12テスト)
npm test -- apiService   # モックAPIテストのみ実行 (11テスト)
```

### バックエンド

```bash
cd backend
./mvnw spring-boot:run   # Spring Boot起動
./mvnw clean compile    # コンパイル
./mvnw test             # テスト実行

# Swagger UI アクセス
# http://localhost:8080/swagger-ui.html
```

### デバッグモード（JWT 認証無効化）

API のデバッグ時にトークン検証を無効化する場合：

```bash
# 1. JWT認証を無効化
# backend/src/main/resources/application.properties を編集
jwt.auth.enabled=false

# 2. DBのみDocker起動
docker-compose up database

# 3. Javaをローカル起動
cd backend
./mvnw spring-boot:run

# 4. 認証なしでAPI直接テスト
curl http://localhost:8080/api/daily-reports/my
curl http://localhost:8080/swagger-ui/index.html
```

**注意**：

- デバッグ後は `jwt.auth.enabled=true` に戻してください
- デバッグモードでは**全 API**がトークンなしでアクセス可能
- 本番環境では必ず認証を有効化してください

**BaseController 対応**：

- 全 Controller で共通の認証処理を使用
- デバッグモード時は自動的にデフォルトユーザー（user1）を使用
- 権限判定メソッド（isAdmin、isSupervisor）が利用可能

### Docker

```bash
docker-compose up             # 全サービス起動
docker-compose up frontend    # フロントエンドのみ
docker-compose up backend     # バックエンド + DB
docker-compose up pgadmin     # pgAdmin（PostgreSQL GUI）のみ
docker-compose up database pgadmin  # DB管理環境（PostgreSQL + pgAdmin）
```

## 🔐 認証情報

### アプリケーション

テスト用アカウント:

- **管理者**: admin / password
- **上長**: manager / password
- **部下**: employee1 / password

### pgAdmin（データベース管理）

- **URL**: http://localhost:5050
- **Email**: admin@example.com
- **Password**: admin123

### PostgreSQL（データベース）

- **Host**: localhost（外部接続）/ database（Docker 内部）
- **Port**: 5432
- **Database**: daily_report_tool
- **Username**: admin
- **Password**: reportAdmin

## 🏗 開発モード

### 1. モック開発モード

フロントエンドのみで開発する場合:

```bash
npm run dev    # バックエンド不要、画面遷移確認可能
```

### 2. API 連携モード

バックエンドと連携して開発する場合:

```bash
# 1. バックエンド起動
docker-compose up backend

# 2. フロントエンド起動（別ターミナル）
npm run dev:api
```

### 3. フルスタックモード

全サービス連携:

```bash
docker-compose up
```

### 4. データベース管理モード

PostgreSQL + pgAdmin でデータベース管理:

```bash
docker-compose up database pgadmin

# pgAdmin アクセス: http://localhost:5050
# Email: admin@example.com / Password: admin123
# PostgreSQL接続: Host=database, Port=5432, DB=daily_report_tool, User=admin, Pass=reportAdmin
```

## 📝 開発状況・今後の予定

### ✅ Phase 1: 基盤システム（完了）

- [x] JWT 認証システム完全実装
- [x] フロントエンド-バックエンド統合
- [x] Docker 開発環境構築
- [x] モック API システム
- [x] データベース設計・実装

### ✅ Phase 2: 日報機能（完了）

- [x] 上司ダッシュボード（部下日報一覧表示）
- [x] レスポンシブカードレイアウト
- [x] ステータスバッジシステム
- [x] **日報 CRUD API 完全実装**（作成・取得・更新・削除）
- [x] **フロントエンド-バックエンド API 連携完成**
- [x] **日報詳細画面**（表示・編集・削除・ステータス変更）
- [x] **高度な検索機能**（タイトル・内容・日付フィルタリング）
- [x] **削除機能完全実装**（確認ダイアログ + セキュア削除）
- [x] **ステータス管理 UI**（下書き ⇔ 提出済み状態管理）
- [x] **Toast 通知システム**（API 操作結果フィードバック）
- [x] **権限制御システム**（本人・上司・管理者アクセス制御）

### 🎯 Phase 3: 高度な機能（現在の開発対象）

- [ ] ユーザー設定画面（プロフィール編集・パスワード変更）
- [ ] 管理者ダッシュボード（全社日報分析・ユーザー管理）
- [ ] チーム管理機能（チーム作成・メンバー管理・権限設定）
- [ ] データエクスポート機能（PDF・Excel 出力）
- [ ] 承認ワークフロー（上司承認・コメント機能）

### 🎨 デザインシステム拡張

- [x] レスポンシブ SimpleGrid レイアウト
- [x] 確認ダイアログシステム統一
- [x] Toast 通知デザイン（4 つのステータス対応）
- [x] 検索 UI（折りたたみ可能フォーム）
- [x] ステータス変更 UI（視覚的遷移表示）
- [ ] ダークモード対応
- [ ] アニメーションライブラリ導入

### 🔧 技術改善・品質向上

- [x] 実 API 統合完成（モック → リアル API 移行）
- [x] 包括的エラーハンドリング実装
- [x] Toast 通知システム統一
- [x] 権限制御強化
- [x] **BaseController 実装**（共通認証処理・デバッグモード対応・コード重複削減）
- [x] **デバッグモード対応**（JWT 認証無効化・トークンレス開発環境・IDE デバッグ効率向上）
- [x] **pgAdmin 統合**（PostgreSQL GUI 管理ツール・Docker 統合・データベース管理効率化）
- [x] **ESLint エラー 97%削減**（232→3 エラー・型安全性強化・本番環境最適化）
- [x] **TypeScript 型安全性向上**（useToast, color-mode, main.tsx 修正完了）
- [x] **本番環境ログ最適化**（console.log 開発環境限定・パフォーマンス向上）
- [x] **テスト安定性向上**（ProtectedRoute テストタイムアウト解決・非同期処理最適化）
- [x] **アクセシビリティ強化**（Spinner コンポーネント aria-label 追加・WCAG 準拠向上）
- [x] **コンポーネント共通化**（DatePickerField・DevModeIndicator の Molecule 化・再利用性向上）
- [x] **包括的テスト実装**（DailyReportForm 18 テストケース・フォーム機能完全カバレッジ）
- [x] **静的解析品質向上**（ESLint/TypeScript 警告修正・complexity 対応・未使用変数削除）
- [ ] エラーバウンダリ実装（予期しないエラー処理）
- [ ] E2E テスト（Playwright）導入
- [ ] CI/CD パイプライン構築
- [ ] Docker 本番環境対応
- [ ] パフォーマンス最適化

## 📄 ライセンス

MIT License
