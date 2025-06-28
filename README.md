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
- カスタムフック導入（useLogin）
- 統一メッセージ管理（MessageConst）
- ChakraUI v3.2 完全対応

## 🛠 技術スタック

- **フロントエンド**: React 19 + TypeScript + Vite + Chakra UI v3.2
- **バックエンド**: Spring Boot 3.2 + Spring Security + JWT
- **データベース**: PostgreSQL 15
- **インフラ**: Docker Compose
- **アーキテクチャ**: アトミックデザイン + カスタムフック + 統一メッセージ管理

## 📁 プロジェクト構成

```
daily-report-tool/
├── frontend/          # React アプリケーション
├── backend/           # Spring Boot アプリケーション  
├── database/          # PostgreSQL 初期化スクリプト
├── docker-compose.yml # Docker 構成
└── README.md
```

## 🔧 開発コマンド

### フロントエンド
```bash
cd frontend
npm run dev          # モックAPI使用（推奨）
npm run dev:api      # 実API使用（要バックエンド起動）
npm run build        # 本番ビルド
npm run lint         # ESLint実行
```

### バックエンド
```bash
cd backend
./mvnw spring-boot:run    # Spring Boot起動
./mvnw clean compile     # コンパイル
./mvnw test              # テスト実行
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

- [ ] 日報CRUD機能
- [ ] ユーザー管理機能
- [ ] 承認ワークフロー
- [ ] レポート機能
- [ ] 通知機能

## 📄 ライセンス

MIT License