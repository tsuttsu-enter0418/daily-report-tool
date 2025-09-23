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

## 🔧 開発コマンド

### フロントエンド

```bash
cd frontend
npm run dev              # 基本開発モード（環境変数による API 切替）
npm run dev:mock         # 明示的にモックAPI使用
npm run dev:api          # 実API使用（要バックエンド起動）
npm run build            # 本番ビルド
npm run build:prod       # 本番環境用ビルド
npm run lint             # ESLint実行
npm run lint:fix         # ESLint自動修正
npm run format           # Prettier フォーマット実行
npm run format:check     # フォーマット確認
npm run typecheck        # TypeScript型チェック
npm run check:all        # lint, format:check, typecheck 一括実行
npm run test             # テスト実行 (改善完了: 全テスト成功・タイムアウト問題解決済み)
npm run test:watch       # ウォッチモードテスト
npm run test:coverage    # カバレッジ付きテスト
npm test -- realApi      # 実APIテストのみ実行 (12テスト)
npm test -- apiService   # モックAPIテストのみ実行 (11テスト)
```

### バックエンド

```bash
cd backend
./mvnw spring-boot:run   # Spring Boot起動
./mvnw clean compile     # コンパイル
./mvnw test              # テスト実行

# コード品質・フォーマット
./mvnw spotless:check    # コードフォーマット確認
./mvnw spotless:apply    # コードフォーマット実行

# テストカバレッジ
./mvnw test jacoco:report  # テスト実行 + カバレッジレポート生成

# API仕様書アクセス
# Swagger UI: http://localhost:8080/swagger-ui.html
# OpenAPI JSON: http://localhost:8080/v3/api-docs
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
- **Email**: admin1@example.com
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
# Email: admin1@example.com / Password: admin123
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
