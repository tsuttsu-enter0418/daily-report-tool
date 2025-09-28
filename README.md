# 日報管理システム (Daily Report Tool)

React + Spring Boot + PostgreSQL で構築された企業向け日報管理システム

## 背景・目的
### 初めての個人開発
ほぼ経験はないが学んでみたいと思った技術でシステムを構築したかったため
### 日報を作成することによるメリットを生み出したい
日報を出すことで報連相による上司からの的確なフィードバックを受けたり、日報を出した自身が振り返りを行うことで次に繋げることができると思う。  
一方、実務の中で日報を提出しない後輩は「煩わしい」や「意味がない」といった意見があった。
そこで、日報を出すことによる恩恵を受けやすいシステムを作ろうと考えた

## 📋 機能

✅ **ログイン認証**
- JWT 認証によるセキュアなログイン
- ユーザー名: `admin` / パスワード: `password`
- SPA
✅ **ホーム画面**
✅ **日報作成**

## 🛠 技術スタック

### フロントエンド

- **React 19** + **TypeScript** + **Vite**
- **Chakra UI v3.2** (UI コンポーネント・Toast 通知)
- **Jotai** (状態管理)
- **React Router** (ルーティング)
- **React Hook Form** + **Yup** (フォーム管理・バリデーション)
- **Axios** (HTTP 通信・API 統合)
- **カスタムフック** (useToast, useDailyReports, useAuth 等)

### バックエンド

- **Spring Boot 3.2** + **Java 17**
- **Spring Security** + **JWT 認証**
- **BaseController** (共通認証処理・デバッグモード対応)
- **JPA/Hibernate** (ORM)
- **Lombok** (ボイラープレート削減)
- **SpringDoc OpenAPI** (API 仕様書生成)


### テスト環境

- **Vitest** (単体テスト・統合テスト)
- **React Testing Library** (UI コンポーネントテスト)
- **fetch モック** (実 API 挙動シミュレーション)
- **ChakraProvider 統合** (テストユーティリティ自動ラップ)
- **JUnit**(Java テストツール)

### データベース・インフラ
- **PostgreSQL 15**
- **Docker Compose** (コンテナ管理)
- **Maven** (依存関係管理)

### 開発・設計手法

- **アトミックデザイン** (コンポーネント設計)
- **レスポンシブデザイン** (SimpleGrid レイアウト)
- **確認ダイアログパターン** (安全な操作確認)
- **Toast 通知システム** (統一されたフィードバック)
- **コード品質重視** (ESLint strict・型安全性・本番最適化)

## 📁 プロジェクト構成

```
daily-report-tool/
├── frontend/                  # React アプリケーション
│   ├── src/
│   │   ├── components/        # アトミックデザイン構成
│   │   │   ├── atoms/         # 最小単位コンポーネント (Button, HomeButton, Toast)
│   │   │   ├── molecules/     # 小機能コンポーネント (DatePickerField, DevModeIndicator, SearchForm等)
│   │   │   ├── organisms/     # 複合機能コンポーネント (ActionSection, DevModeSection等)
│   │   │   └── ui/            # ChakraUI設定 (provider, toaster, color-mode等)
│   │   ├── hooks/             # カスタムフック (useToast, useDailyReports, useAuth等)
│   │   │   └── __tests__/     # フックのテスト
│   │   ├── stores/            # Jotai状態管理 (userStore等)
│   │   ├── types/             # TypeScript型定義 (api.ts, components.ts, forms.ts)
│   │   ├── services/          # API通信・実API統合
│   │   │   └── __tests__/     # APIテスト (mockApi, realApi, apiService)
│   │   ├── constants/         # 定数・メッセージ (MessageConst)
│   │   ├── pages/             # ページコンポーネント (詳細画面, 検索機能等)
│   │   │   └── __tests__/     # ページテスト
│   │   ├── utils/             # ユーティリティ関数
│   │   │   └── validations/   # バリデーション関数
│   │   ├── test/              # テストユーティリティ
│   │   └── atoms/             # 追加のAtom状態管理
│   ├── coverage/              # テストカバレッジレポート
│   └── package.json
├── backend/                   # Spring Boot アプリケーション
│   ├── src/
│   │   ├── main/java/com/example/dailyreport/
│   │   │   ├── controller/    # REST API コントローラー
│   │   │   │   ├── BaseController.java      # 共通認証処理基底クラス
│   │   │   │   ├── AuthController.java      # 認証API
│   │   │   │   └── DailyReportController.java # 日報管理API
│   │   │   ├── service/       # ビジネスロジック
│   │   │   ├── entity/        # JPA エンティティ (Lombok使用)
│   │   │   ├── dto/           # データ転送オブジェクト
│   │   │   ├── repository/    # データアクセス層
│   │   │   ├── security/      # 認証・認可設定
│   │   │   └── config/        # 設定クラス (OpenAPI等)
│   │   ├── test/java/com/example/dailyreport/
│   │   │   ├── unit/          # 単体テスト
│   │   │   │   ├── controller/  # コントローラーテスト
│   │   │   │   ├── service/     # サービステスト
│   │   │   │   ├── repository/  # リポジトリテスト
│   │   │   │   ├── security/    # セキュリティテスト
│   │   │   │   └── entity/      # エンティティテスト
│   │   │   ├── integration/   # 統合テスト
│   │   │   └── config/        # テスト設定
│   │   └── main/resources/    # 設定ファイル
│   └── pom.xml
├── database/                  # PostgreSQL 初期化
│   └── init.sql
├── docs/                      # プロジェクトドキュメント
│   ├── CI-CD-*.md            # CI/CD関連ドキュメント
│   └── github-issues-*.md    # GitHub Issues テンプレート
├── scripts/                   # デプロイメントスクリプト
│   ├── deploy-frontend.sh    # フロントエンドデプロイ
│   └── push-to-ecr.sh       # ECRプッシュスクリプト
├── docker-compose.yml         # Docker 構成
├── CLAUDE.md                  # 開発ガイドライン
├── DATABASE_DESIGN.md         # データベース設計書
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

## 📄 ライセンス

MIT License
