# CLAUDE.md

必ず日本語で回答してください。  
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.  
どのファイルを作成するときにもコメントでどういう機能を持つファイル/クラスなのかを明記してください。  
第三者の開発者が見ても開発できるようにコメントは適宜積極的に記載するようにしましょう

## Project Overview

This is a daily report management system (日報管理システム) built with a React frontend and Spring Boot backend, designed for Japanese business environments with user roles (管理者/上長/部下).

### プロジェクトのゴール

- **転職アピール点**: React/TS 学習意欲 + Java 実務経験
- **独自性**: 進捗ステータス可視化による効率的な部下管理
- **技術レベル**: Clean Architecture 意識、CI/CD 実装、テスト自動化
- **成長**: 自分自身の技術的成長を促進する

## Architecture

- **Frontend**: React + TypeScript using Vite, Chakra UI3.2, react-icon5.5 for components
- **Backend**: Spring Boot 3.2.0 with Java 17, Maven for dependency management
- **Database**: PostgreSQL with JPA/Hibernate
- **Deployment**: Docker Compose for containerized development

## Development Commands

### Frontend (React + Vite)

```bash
cd frontend
npm run dev          # Start development server with mock API (recommended for frontend dev)
npm run dev:mock     # Explicitly use mock API (same as above)
npm run dev:api      # Use real backend API (requires backend to be running)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run    # Start Spring Boot application on port 8080
./mvnw clean compile     # Compile the project
./mvnw test              # Run tests
```

### Docker Development

```bash
# Full stack development
docker-compose up             # Starts database, backend, and frontend
docker-compose up frontend    # Start frontend container only
docker-compose up backend     # Start backend and database only
```

## Project Structure

### Frontend Architecture

- Uses Chakra UI v3.2 with custom theme system and latest component API
- Vite configuration includes proxy to backend at `/api` -> `http://localhost:8080`
- Component structure follows UI provider pattern with color mode support
- Dependencies include React Query, React Router, React Hook Form, Jotai for state management
- **Mock API System**: Frontend can run independently with mock authentication for development
  - Mock API simulates login with username/password validation
  - Environment variables control whether to use mock or real API
  - Development modes: `npm run dev` (mock) vs `npm run dev:api` (real backend)
- **アトミックデザイン実装**: 段階的な component 分割によるメンテナビリティ向上
- **カスタムフック活用**: ビジネスロジックと UI の分離（例: useLogin）
- **統一メッセージ管理**: MessageConst による一元的なテキスト管理
- **型定義の統一**: type エイリアス優先による柔軟な型合成

#### アトミックデザイン定義

##### 判定基準

| レベル   | 特徴                     | 例                      | 状態管理 |
| -------- | ------------------------ | ----------------------- | -------- |
| Atom     | 最小単位、単体で意味あり | Button, Input           | なし     |
| Molecule | 小機能、再利用性高       | InputField, StatusBadge | 最小限   |
| Organism | 業務機能単位             | DailyReportForm, Header | あり     |

##### 迷った時の判断基準

1. **再利用性**: 他の画面でも使える → Molecule 寄り
2. **ビジネスロジック**: 日報特有の処理がある → Organism 寄り
3. **独立性**: 単体テストしやすい → 適切な粒度

##### 例外ルール

- 迷ったら**大きめ**に分類（後で分割は簡単）
- プロジェクト初期は**Organism 多め**で OK
- 再利用が必要になった時点で Molecule 化

#### TypeScript 型定義方針

##### type vs interface の選択基準

**type エイリアス優先方針**を採用しています：

```typescript
// ✅ 推奨: type エイリアス使用
export type UserInfo = {
  id: string;
  username: string;
  role: UserRole;
};

// ❌ 非推奨: interface使用
export interface UserInfo {
  id: string;
  username: string;
  role: UserRole;
}
```

##### 選択理由

| 項目             | type                  | interface           | 採用理由       |
| ---------------- | --------------------- | ------------------- | -------------- |
| **型合成**       | ✅ `&` 演算子         | ❌ `extends` のみ   | 柔軟な合成     |
| **ユニオン型**   | ✅ 直接定義可能       | ❌ 不可             | 状態管理で有用 |
| **計算型**       | ✅ `keyof`, `Pick` 等 | ❌ 制限あり         | 動的型生成     |
| **プリミティブ** | ✅ `string`, `number` | ❌ オブジェクトのみ | 統一性         |

##### 実装例

```typescript
// ユニオン型
export type UserRole = "管理者" | "上長" | "部下";

// 型合成
export type LoginFormData = LoginRequest;
export type CustomButtonProps = Omit<ButtonProps, "loading"> & {
  loading?: boolean;
  variant?: "primary" | "secondary";
};

// 計算型
export type UserKeys = keyof UserInfo;
export type PublicUserInfo = Pick<UserInfo, "username" | "role">;
```

##### フォルダ構成

```
src/types/
├── index.ts        # 型定義の統一エクスポート
├── api.ts          # API関連型
├── components.ts   # コンポーネント型（将来）
└── forms.ts        # フォーム型（将来）
```

### Backend Architecture

- Spring Boot with web and JPA starters
- PostgreSQL integration configured
- Maven wrapper included for consistent builds
- Docker-ready with multi-stage build optimization
- Lombok を導入し、model クラスは簡潔な内容にする

### Database Schema

- `users` table: id, username, email, role (管理者/上長/部下), created_at
- `daily_reports` table: id, user_id, report_date, content, next_plan, status, timestamps
- Initial seed data included for testing

### テスト設計

- バックエンド: JUnit
- フロントエンド：
  - Jest(Unit Test)
  - RTL(Integration)
  - Playwright(E2E)

#### 並行開発ルール

- 新機能実装時は必ずテストも作成

### API 設計(Open API)

- **Spring Boot**: springdoc-openapi-ui
- **自動生成**: API 仕様書 + TypeScript 型定義
- **テスト連携**: API 仕様からモックデータ生成

#### 開発フロー

1. OpenAPI 仕様書作成（設計）
2. フロント：型定義自動生成
3. バック：Controller 実装
4. 統合テスト：仕様書ベースでテスト

## Current Development State

✅ **ログイン機能完成**: JWT 認証によるセキュアなログインシステム実装済み
✅ **モック API 機能**: フロントエンド独立開発環境を構築済み
✅ **フルスタック構成**: Docker Compose で PostgreSQL、Spring Boot、React 連携
✅ **アーキテクチャ改善**: アトミックデザイン + カスタムフック + メッセージ管理システム導入
✅ **Jotai 状態管理**: ユーザー情報の全画面参照可能な状態管理実装
✅ **Lombok 導入**: バックエンドのボイラープレートコード削減
✅ **OpenAPI/Swagger**: 自動生成 API 仕様書とテスト環境
✅ **型定義統一**: type エイリアス優先による型安全性と柔軟性向上
✅ **上司ダッシュボード**: レスポンシブ対応の部下日報管理画面実装
✅ **暖色系デザインシステム**: フレッシュで暖かみのあるUI/UXデザイン実装
✅ **データベース設計統一**: DATABASE_DESIGN.md準拠の完全スキーマ実装
✅ **日報CRUD API**: DailyReport完全実装（Entity・Repository・Service・Controller）
✅ **上司-部下関係**: ユーザー階層管理・権限制御機能実装
✅ **ChakraUI v3.2完全対応**: TypeScriptエラー修正、最新API仕様適用
✅ **Vitest設定修正**: テストファイル環境構築、型定義統一
🔄 **API連携準備**: 実API対応、フロントエンド-バックエンド統合準備中

### 実装済み機能

#### フロントエンド

- React Hook Form + Yup によるバリデーション付きログイン画面
- JWT 認証トークンの Cookie 自動保存・管理
- 保護されたルーティング（認証必須ページ）
- ログアウト機能
- **モック API 対応**: バックエンド不要でフロントエンド開発可能
- **アトミックデザイン導入**: Button/Toast の Atom 化、useLogin カスタムフック化
- **メッセージ管理**: MessageConst による統一されたメッセージ管理システム
- **ChakraUI v3.2 完全対応**: 最新 API 使用（Card.Root/Card.Body, Field.Root 等）
- **Jotai 状態管理**: ユーザー情報の全画面参照、ローカルストレージ同期
- **型定義統一**: type エイリアス使用による型安全性と柔軟性向上
- **カスタムフック**: useLogin, useAuth によるロジック分離
- **上司ダッシュボード**: SimpleGrid によるレスポンシブ日報一覧表示
- **暖色系デザインシステム**: オレンジ・アンバー基調のフレッシュなUIデザイン
- **レスポンシブ対応**: モバイル1列、タブレット2列、PC3列の自動調整レイアウト
- **ChakraUI v3.2完全対応**: Field.Root、Card.Root等の最新API適用、TypeScriptエラー完全解消
- **Vitest設定修正**: テスト環境構築、型定義統一、単体テスト実行環境整備
- **API連携準備**: 実API対応準備、モック API からリアル API への切り替え機能

#### バックエンド

- Spring Security + JWT 認証システム
- BCrypt によるパスワードハッシュ化
- PostgreSQL 連携（JPA/Hibernate）
- CORS 設定済み
- Docker 対応設定
- **Lombok 導入**: @Data, @Builder, @NoArgsConstructor 等でボイラープレート削減
- **OpenAPI/Swagger**: 自動生成 API 仕様書（http://localhost:8080/swagger-ui.html）
- **型安全 DTO**: LoginRequest/Response の完全型定義
- **日報CRUD API**: 完全実装済み（作成・取得・更新・削除）
- **上司-部下関係**: supervisor_id による階層管理実装
- **権限制御**: 本人・上司のみアクセス可能な認可システム
- **1日1件制限**: ユニーク制約による重複防止機能
- **ステータス管理**: 下書き・提出済みの状態管理

#### データベース

- **users テーブル**: 拡張済み（id, username, email, password, role, display_name, supervisor_id, is_active）
- **daily_reports テーブル**: 完全実装（id, user_id, title, work_content, status, report_date, submitted_at）
- **teams・user_teams テーブル**: チーム管理機能（設計完了・実装準備完了）
- **インデックス**: パフォーマンス最適化済み
- **制約**: 1日1件制限・文字数制限・外部キー制約
- **トリガー**: updated_at自動更新機能
- **初期データ**: 階層関係・チーム・サンプル日報データ

### UI/UXデザインシステム

- **暖色系カラーパレット**: オレンジ・アンバー・イエロー基調
- **グラデーション背景**: 複数色による滑らかなフレッシュデザイン
- **カードUIシステム**: 半透明背景・暖色ボーダー・ホバーアニメーション
- **StatusBadge**: 暖色系統一されたバッジシステム（success: teal, warning: yellow等）
- **レスポンシブレイアウト**: SimpleGridによる画面幅対応（1/2/3列）

### 開発モード

- **モック開発**: `npm run dev` - バックエンド不要、モック API で画面開発
- **連携開発**: `npm run dev:api` - 実際のバックエンド API 使用
- **フルスタック**: `docker-compose up` - 全サービス連携

## Key Technical Details

- Frontend proxy configuration handles API routing through Vite
- Docker configuration optimized for development with volume mounts
- PostgreSQL uses Japanese-friendly character encoding
- Maven configuration includes Spring Boot parent for dependency management

## 🔧 Claude Code 開発環境設定

### メモリ・タイムアウト最適化済み

- Node.js: 4GB メモリ上限（React/TS 大規模ビルド対応）
- コマンド実行: 最大 20 分（Docker 初回起動対応）
- コスト警告: 有効（使用制限管理）

### 開発時の注意点

- 長時間処理（Docker build 等）は事前に時間を伝える
- メモリ大量消費処理はこまめに確認
- テスト実行時にメモリ不足が起きたら報告

## Git Commit ルール

- コミットは 1 機能改修するたびにコミットする
- コミットはフロントエンド、バックエンド混在すると見づらいので分けてコミットする
- コミットコメントは簡潔に箇条書きで行う
