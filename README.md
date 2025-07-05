# 日報管理システム (Daily Report Tool)

React + Spring Boot + PostgreSQL で構築された企業向け日報管理システム

## 🚀 クイックスタート

### フロントエンド開発（推奨）
実API統合完成により、モックまたは実APIを選択可能：
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

✅ **最新技術対応**
- ChakraUI v3.2完全対応（TypeScriptエラー解消）
- Vitest設定修正（テスト環境構築完了）
- 実API統合完成（モック→リアルAPI移行完了）

✅ **日報管理機能完成**
- 日報作成・編集・削除・詳細表示の完全CRUD実装
- ステータス管理（下書き⇔提出済み）リアルタイム変更
- 高度な検索機能（タイトル・内容・日付フィルタリング）
- セキュアな削除機能（確認ダイアログ + データ保護）

✅ **UX/UI強化**
- Toast通知システム（成功・エラー・警告・情報対応）
- 確認ダイアログシステム（操作安全性向上）
- 権限制御強化（本人・上司・管理者の適切なアクセス制御）
- ローディング状態とエラーハンドリング統一

## 🛠 技術スタック

### フロントエンド
- **React 19** + **TypeScript** + **Vite**
- **Chakra UI v3.2** (UIコンポーネント・Toast通知)
- **Jotai** (状態管理)
- **React Router** (ルーティング)
- **React Hook Form** + **Yup** (フォーム管理・バリデーション)
- **Axios** (HTTP通信・API統合)
- **カスタムフック** (useToast, useDailyReports, useAuth等)

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
- **実API統合** (モックから完全移行)
- **暖色系デザインシステム** (統一されたUI/UX)
- **レスポンシブデザイン** (SimpleGridレイアウト)
- **確認ダイアログパターン** (安全な操作確認)
- **Toast通知システム** (統一されたフィードバック)
- **カスタムフック活用** (ロジック分離・再利用性向上)

## 📁 プロジェクト構成

```
daily-report-tool/
├── frontend/                  # React アプリケーション
│   ├── src/
│   │   ├── components/        # アトミックデザイン構成
│   │   │   ├── atoms/         # 最小単位コンポーネント (Button等)
│   │   │   ├── molecules/     # 小機能コンポーネント (SearchForm, DeleteConfirmDialog等)
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

## 📝 開発状況・今後の予定

### ✅ Phase 1: 基盤システム（完了）
- [x] JWT認証システム完全実装
- [x] フロントエンド-バックエンド統合
- [x] Docker開発環境構築
- [x] モック API システム
- [x] データベース設計・実装

### ✅ Phase 2: 日報機能（完了）
- [x] 上司ダッシュボード（部下日報一覧表示）
- [x] レスポンシブカードレイアウト
- [x] ステータスバッジシステム
- [x] **日報CRUD API完全実装**（作成・取得・更新・削除）
- [x] **フロントエンド-バックエンドAPI連携完成**
- [x] **日報詳細画面**（表示・編集・削除・ステータス変更）
- [x] **高度な検索機能**（タイトル・内容・日付フィルタリング）
- [x] **削除機能完全実装**（確認ダイアログ + セキュア削除）
- [x] **ステータス管理UI**（下書き⇔提出済み状態管理）
- [x] **Toast通知システム**（API操作結果フィードバック）
- [x] **権限制御システム**（本人・上司・管理者アクセス制御）

### 🎯 Phase 3: 高度な機能（現在の開発対象）
- [ ] ユーザー設定画面（プロフィール編集・パスワード変更）
- [ ] 管理者ダッシュボード（全社日報分析・ユーザー管理）
- [ ] チーム管理機能（チーム作成・メンバー管理・権限設定）
- [ ] データエクスポート機能（PDF・Excel出力）
- [ ] 承認ワークフロー（上司承認・コメント機能）

### 🎯 Phase 4: 拡張機能
- [ ] 通知機能（メール・Push）
- [ ] コメント・フィードバック機能
- [ ] モバイル対応（PWA）
- [ ] 多言語対応（i18n）

### 🎨 デザインシステム拡張
- [x] 暖色系フレッシュデザイン実装
- [x] レスポンシブSimpleGridレイアウト
- [x] 確認ダイアログシステム統一
- [x] Toast通知デザイン（4つのステータス対応）
- [x] 検索UI（折りたたみ可能フォーム）
- [x] ステータス変更UI（視覚的遷移表示）
- [ ] ダークモード対応
- [ ] アニメーションライブラリ導入

### 🔧 技術改善・品質向上
- [x] 実API統合完成（モック→リアルAPI移行）
- [x] 包括的エラーハンドリング実装
- [x] Toast通知システム統一
- [x] 権限制御強化
- [ ] エラーバウンダリ実装（予期しないエラー処理）
- [ ] E2Eテスト（Playwright）導入
- [ ] CI/CD パイプライン構築
- [ ] Docker本番環境対応
- [ ] パフォーマンス最適化

## 📄 ライセンス

MIT License