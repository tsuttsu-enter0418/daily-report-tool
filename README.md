# 日報管理システム (Daily Report Tool)

React + Spring Boot + PostgreSQL で構築された日報管理システム

## 背景・目的

### 初めての個人開発

プログラミングからインフラまで全て一人（と AI）で作ってみようと思ったことから始めた。
実務では触れたことのない自分の興味がある技術を選べるだけ選んで取り組むことにした。
AWS は初めてなので、簡単にデプロイできるサービスではなく、実際に企業が利用しているサービスの組み合わせを想定して構築。

### 日報を作成することによるメリットを生み出したい

日報を出すことで報連相による上司からの的確なフィードバックを受けたり、日報を出した自身が振り返りを行うことで次に繋げることができると思う。
一方、実務の中で日報を提出しない後輩は「煩わしい」や「意味がない」といった意見があった。
そこで、日報を出すことによる恩恵を受けやすいシステムを作ろうと考えた

## 📋 機能

✅ **ログイン認証**

- JWT 認証によるセキュアなログイン
- ユーザー名: `admin` / パスワード: `password`

✅ **ホーム画面**

- SPA
- ユーザーの権限に応じて選択できるメニューを制御する（実装予定）

✅ **日報作成**

- 「タイトル」「作業日付」「作業内容」を登録する
- 「タイトル」と「作業内容」には文字数カウンタを表示
- ステータスを持たせて「下書き」と「提出」を選択できる

✅ **日報一覧**

- （現在）ログインユーザーの日報情報をカード形式で表示する
  - 編集ボタンで編集可能
  - 削除ボタンで削除可能
- フィルター機能（実装予定）
- コメント機能（実装予定）
  - ビジュアル的に楽しそうな表示にしたい（実装予定）
- 日報詳細画面（モーダル）（実装予定）

🧐 **ユーザー管理**

- ユーザー情報の一覧表示（ChakraUI）
- ユーザー情報の登録
- 上長の部下登録機能

🧐 **AI 要約機能**

- 自身の直近一週間の日報内容を要約する
  - GeminiAPI 使用

🧐 **部下日報一覧**

- 配下の部下の日報を一覧で表示して作業内容を並べて一度に確認する（実装予定）

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
- **Maven** (依存関係管理)

### テスト環境

- **Vitest** (単体テスト・統合テスト)
- **React Testing Library** (UI コンポーネントテスト)
- **fetch モック** (実 API 挙動シミュレーション)
- **ChakraProvider 統合** (テストユーティリティ自動ラップ)
- **JUnit**(Java テストツール)

### データベース・インフラ

- **AWS**
  - CloudFront
  - S3
  - Route53
  - ACM
  - ECS for Fargate
  - ECR
  - ALB
  - RDS（PostgrSQL）
  - VPC
  - SecretManager
- **Docker/Docker compose**（ローカル環境）

### CI/CD

- **GithubActions**

### 開発・設計手法

- **アトミックデザイン** (コンポーネント設計)
- **レスポンシブデザイン** (SimpleGrid レイアウト)
- **確認ダイアログパターン** (安全な操作確認)
- **Toast 通知システム** (統一されたフィードバック)
- **コード品質重視** (ESLint strict・型安全性・本番最適化)
- **ISSUE 駆動開発**

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
