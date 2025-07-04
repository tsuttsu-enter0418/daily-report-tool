# 日報管理システム (Daily Report Tool)

React + Spring Boot + PostgreSQL で構築された企業向け日報管理システム

## 🚀 クイックスタート

### フロントエンド開発（推奨）
バックエンド不要でフロントエンド開発が可能：
```bash
cd frontend
npm install
npm run dev          # モックAPIで起動 → http://localhost:3000
```

### フルスタック開発
```bash
docker-compose up    # 全サービス起動
```

## 📋 機能

✅ **ログイン認証**
- JWT認証によるセキュアなログイン
- ユーザー名: `admin` / パスワード: `password`
- Cookie自動保存でログイン状態維持

✅ **開発環境**
- モックAPI: フロントエンド独立開発
- 実API連携: バックエンド連携開発
- Docker: フルスタック開発

✅ **アーキテクチャ改善**
- アトミックデザイン実装（Button/Toast のAtom化）
- カスタムフック導入（useLogin, useAuth）
- 統一メッセージ管理（MessageConst）
- ChakraUI v3.2 完全対応

✅ **状態管理**
- Jotai による全画面ユーザー情報参照
- ローカルストレージ同期でページリロード対応
- 認証状態の一元管理

✅ **開発効率向上**
- Lombok によるボイラープレートコード削減
- OpenAPI/Swagger による自動API仕様書生成
- type エイリアス優先による柔軟な型定義
- モック API による独立開発環境

✅ **上司ダッシュボード**
- 部下の日報一覧表示・管理機能
- ステータスフィルタリング（完了/保留/全件）
- レスポンシブ対応（モバイル1列、タブレット2列、PC3列）
- アバター付きカードUIで直感的な進捗確認

✅ **暖色系フレッシュデザイン**
- オレンジ・アンバー・イエロー基調のカラーパレット
- グラデーション背景による美しいUI体験
- ホバーアニメーションとシャドウ効果
- 統一されたStatusBadgeカラーシステム

## 🛠 技術スタック

### フロントエンド
- **React 19** + **TypeScript** + **Vite**
- **Chakra UI v3.2** (UIコンポーネント)
- **Jotai** (状態管理)
- **React Router** (ルーティング)
- **React Hook Form** + **Yup** (フォーム管理)
- **Axios** (HTTP通信)

### バックエンド  
- **Spring Boot 3.2** + **Java 17**
- **Spring Security** + **JWT認証**
- **JPA/Hibernate** (ORM)
- **Lombok** (ボイラープレート削減)
- **SpringDoc OpenAPI** (API仕様書生成)

### データベース・インフラ
- **PostgreSQL 15**
- **Docker Compose** (コンテナ管理)
- **Maven** (依存関係管理)

### 開発・設計手法
- **アトミックデザイン** (コンポーネント設計)
- **Clean Architecture** 意識
- **type エイリアス優先** (TypeScript型定義)
- **モック API** (独立開発環境)
- **暖色系デザインシステム** (統一されたUI/UX)
- **レスポンシブデザイン** (SimpleGridレイアウト)

## 📁 プロジェクト構成

```
daily-report-tool/
├── frontend/                  # React アプリケーション
│   ├── src/
│   │   ├── components/        # アトミックデザイン構成
│   │   │   ├── atoms/         # 最小単位コンポーネント
│   │   │   ├── molecules/     # 小機能コンポーネント
│   │   │   └── ui/            # ChakraUI設定
│   │   ├── hooks/             # カスタムフック
│   │   ├── stores/            # Jotai状態管理
│   │   ├── types/             # TypeScript型定義
│   │   ├── services/          # API通信・モック
│   │   ├── constants/         # 定数・メッセージ
│   │   └── pages/             # ページコンポーネント
│   └── package.json
├── backend/                   # Spring Boot アプリケーション
│   ├── src/main/java/com/example/dailyreport/
│   │   ├── controller/        # REST API コントローラー
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

## 🔧 開発コマンド

### フロントエンド
```bash
cd frontend
npm run dev              # モックAPI使用（推奨）
npm run dev:api          # 実API使用（要バックエンド起動）
npm run build            # 本番ビルド
npm run lint             # ESLint実行
npm run test             # テスト実行
npm run test:coverage    # カバレッジ付きテスト
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

### Docker
```bash
docker-compose up             # 全サービス起動
docker-compose up frontend    # フロントエンドのみ
docker-compose up backend     # バックエンド + DB
```

## 🔐 認証情報

テスト用アカウント:
- **管理者**: admin / password
- **上長**: manager / password  
- **部下**: employee1 / password

## 🏗 開発モード

### 1. モック開発モード
フロントエンドのみで開発する場合:
```bash
npm run dev    # バックエンド不要、画面遷移確認可能
```

### 2. API連携モード  
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

## 📝 今後の開発予定

### 🎯 Phase 2: 日報機能
- [x] 上司ダッシュボード（部下日報一覧表示）
- [x] レスポンシブカードレイアウト
- [x] ステータスバッジシステム
- [x] **日報CRUD API完全実装**（作成・取得・更新・削除）
- [x] **データベース設計統一**（DATABASE_DESIGN.md準拠）
- [x] **権限制御システム**（本人・上司のみアクセス）
- [x] **1日1件制限機能**
- [ ] フロントエンド-バックエンドAPI連携
- [ ] 日報詳細表示モーダル
- [ ] 画像添付機能

### 🎯 Phase 3: 管理機能  
- [ ] ユーザー管理（CRUD）
- [ ] 承認ワークフロー
- [ ] ダッシュボード（進捗可視化）
- [ ] レポート機能（CSV出力等）

### 🎯 Phase 4: 拡張機能
- [ ] 通知機能（メール・Push）
- [ ] コメント・フィードバック機能
- [ ] モバイル対応（PWA）
- [ ] 多言語対応（i18n）

### 🎨 デザインシステム拡張
- [x] 暖色系フレッシュデザイン実装
- [x] レスポンシブSimpleGridレイアウト
- [ ] ダークモード対応
- [ ] アニメーションライブラリ導入

### 🔧 技術改善
- [ ] E2Eテスト（Playwright）導入
- [ ] CI/CD パイプライン構築
- [ ] Docker本番環境対応
- [ ] パフォーマンス最適化

## 📄 ライセンス

MIT License