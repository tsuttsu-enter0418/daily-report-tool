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

#### ChakraUI v3.2 コーディングルール

##### 重要：API 仕様の変更点

ChakraUI v3.2 では従来の単一コンポーネントから複合コンポーネント構成に変更されました：

```typescript
// ✅ v3.2 推奨：複合コンポーネント使用
<Card.Root>
  <Card.Body>
    <Card.Title>タイトル</Card.Title>
  </Card.Body>
</Card.Root>

// ❌ v2.x 旧式：単一コンポーネント（エラーになる）
<Card>
  <CardBody>
    <CardTitle>タイトル</CardTitle>
  </CardBody>
</Card>
```

##### 必須対応事項

1. **複合コンポーネントの使用**

   - `Card` → `Card.Root` + `Card.Body`
   - `Field` → `Field.Root` + `Field.Label` + `Field.HelperText`
   - `Button` → `Button.Root` または `Button`（単体可）

2. **型定義の確認**

   - `ButtonProps` → ChakraUI の最新型定義を使用
   - カスタム Props 作成時は `Omit<>` で型合成

3. **公式ドキュメント確認**
   - バージョンアップ時は必ず公式ドキュメントで API 変更を確認
   - TypeScript エラーが発生した場合は最新の型定義をチェック

##### 開発時の注意点

- **段階的移行**: 既存コンポーネントは一気に変更せず、段階的に最新 API 化
- **テスト実行**: API 変更後は必ずテストを実行してエラーがないか確認
- **一貫性維持**: プロジェクト内で ChakraUI の記載方法を統一

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
✅ **暖色系デザインシステム**: フレッシュで暖かみのある UI/UX デザイン実装
✅ **データベース設計統一**: DATABASE_DESIGN.md 準拠の完全スキーマ実装
✅ **日報 CRUD API**: DailyReport 完全実装（Entity・Repository・Service・Controller）
✅ **上司-部下関係**: ユーザー階層管理・権限制御機能実装
✅ **ChakraUI v3.2 完全対応**: TypeScript エラー修正、最新 API 仕様適用
✅ **Vitest 設定修正**: テストファイル環境構築、型定義統一
✅ **JWT認証システム完全実装**: フィルター・SecurityConfig・権限制御完成
✅ **バックエンドCRUD完成**: 日報API・ユーザー階層・データベース設計完全実装
🔄 **フロントエンド-バックエンド統合**: 実API連携・データフロー統合実装中

## 📋 次期実装計画 (Next Implementation Plan)

### フェーズ1: 重要な統合作業 (最優先 - Phase 1: Critical Integration)

#### 🔥 フロントエンド-バックエンド統合
- **実API統合実装**: モックAPIから実API への切り替え
  - 日報CRUD API 統合 (`/api/daily-reports/**`)
  - JWT トークン自動送信機能の実装
  - API レスポンスのエラーハンドリング強化
  - 認証フローの完全統合テスト

- **データフロー統合**: 
  - `apiService.ts` の実API 対応完全実装
  - モックデータから実データへの置き換え
  - 型定義の統一（フロント-バック間）
  - リアルタイムデータ同期機能

#### 🔧 統合テスト・品質保証
- **E2E テスト実装**: Playwright による完全統合テスト
- **API 統合テスト**: Jest + MSW による統合テストスイート
- **認証フロー検証**: ログイン-CRUD-ログアウト の完全フロー

### フェーズ2: 機能完成 (高優先 - Phase 2: Feature Completion)

#### 📱 UI/UX 機能拡張
- **日報詳細画面**: 個別日報の詳細表示・編集機能
- **高度な検索機能**: タイトル・内容・日付での検索・フィルタリング
- **削除機能完全実装**: 確認ダイアログ + 実際のデータ削除処理
- **ステータス管理UI**: 下書き⇔提出済み状態の視覚的管理

#### 🔔 通知・UX システム
- **リアルタイム通知**: 日報提出・承認通知のリアルタイム表示
- **Toast通知強化**: API 操作結果の適切なフィードバック
- **ローディング状態**: 全API 呼び出しでのローディングUX
- **エラーバウンダリ**: 予期しないエラーのグレースフル処理

### フェーズ3: 高度な機能 (中優先 - Phase 3: Advanced Features)

#### ⚙️ 管理・設定機能
- **ユーザー設定画面**: プロフィール編集・パスワード変更
- **管理者ダッシュボード**: 全社日報分析・ユーザー管理
- **チーム管理機能**: チーム作成・メンバー管理・権限設定
- **データエクスポート**: 日報のPDF/Excel エクスポート機能

#### 🎨 デザイン・アクセシビリティ
- **ダークモード実装**: システム設定対応のテーマ切り替え
- **アクセシビリティ向上**: WCAG準拠のキーボードナビゲーション
- **モバイル最適化**: PWA対応・オフライン機能
- **多言語対応**: 日本語・英語の国際化対応

### フェーズ4: 本番運用準備 (低優先 - Phase 4: Production Readiness)

#### 🚀 DevOps・デプロイメント
- **CI/CD パイプライン**: GitHub Actions による自動デプロイ
- **Docker 本番対応**: multi-stage build最適化・セキュリティ強化
- **モニタリング**: ログ収集・メトリクス監視・アラート設定
- **セキュリティ監査**: 脆弱性スキャン・ペネトレーションテスト

#### 📊 パフォーマンス・スケーラビリティ
- **フロントエンド最適化**: コード分割・遅延読み込み・バンドル最適化
- **バックエンド最適化**: クエリ最適化・キャッシュ戦略・API レート制限
- **データベース最適化**: インデックス調整・パーティショニング
- **CDN・キャッシュ**: 静的コンテンツ配信最適化

### 🎯 現在の推奨作業 (Immediate Next Steps)

**今すぐ実装すべき項目 (Priority 1)**:
1. **日報作成API統合**: フォームからバックエンドへの実際のデータ送信
2. **日報一覧API統合**: 実際のデータベースからの日報データ取得
3. **認証API統合**: ログイン時の実JWT トークン取得・検証

**次に実装する項目 (Priority 2)**:
1. **エラーハンドリング**: 401/403/500エラーの適切な処理
2. **ローディング状態**: 全API呼び出しでのUXフィードバック
3. **日報詳細画面**: CRUD操作の完全な実装

### 🔍 技術的な実装ガイドライン

#### API統合ベストプラクティス
- **環境変数管理**: `.env.development` / `.env.production` での設定分離
- **型安全性**: TypeScript での厳密なAPI レスポンス型定義
- **エラーハンドリング**: try-catch + カスタムエラークラスでの一元管理
- **認証ヘッダー**: Axios interceptor でのJWT自動付与

#### コード品質管理
- **ESLint/Prettier**: 自動フォーマット・品質チェック
- **Husky**: pre-commit フック でのコード品質保証
- **測定指標**: カバレッジ80%以上・TypeScript strict mode
- **ドキュメント**: 新機能実装時のREADME・コメント更新

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
- **暖色系デザインシステム**: オレンジ・アンバー基調のフレッシュな UI デザイン
- **レスポンシブ対応**: モバイル 1 列、タブレット 2 列、PC3 列の自動調整レイアウト
- **ChakraUI v3.2 完全対応**: Field.Root、Card.Root 等の最新 API 適用、TypeScript エラー完全解消
- **Vitest 設定修正**: テスト環境構築、型定義統一、単体テスト実行環境整備
- **API 連携準備**: 実 API 対応準備、モック API からリアル API への切り替え機能

#### バックエンド

- **Spring Security + JWT 認証システム完全実装**
  - JwtAuthenticationFilter: トークン検証・SecurityContext設定
  - SecurityConfig: フィルター統合・認証フロー設定
  - JwtUtil: 包括的JWT操作・セキュリティ考慮済み
- **BCrypt パスワードハッシュ化 + セキュリティ強化**
- **PostgreSQL 完全統合**（JPA/Hibernate + 最適化設定）
- **CORS 設定完了** + 開発・本番環境対応
- **Docker 本番対応設定** + multi-stage build最適化
- **Lombok 完全導入**: @Data, @Builder, @NoArgsConstructor 等でボイラープレート削減
- **OpenAPI/Swagger 完全設定**: JWT認証対応自動生成API仕様書（http://localhost:8080/swagger-ui.html）
- **型安全 DTO システム**: Request/Response の完全型定義・バリデーション
- **日報 CRUD API 完全実装**: 作成・取得・更新・削除 + 権限制御
- **ユーザー階層管理**: supervisor_id による上司-部下関係 + 権限制御
- **認可システム**: 本人・上司のみアクセス可能な包括的権限制御
- **データ整合性**: 1日1件制限・文字数制限・外部キー制約
- **ステータス管理**: draft・submitted状態 + 自動タイムスタンプ
- **本番対応設定**: 接続プール・ログ管理・Actuator・日本語対応

#### データベース

- **users テーブル**: 拡張済み（id, username, email, password, role, display_name, supervisor_id, is_active）
- **daily_reports テーブル**: 完全実装（id, user_id, title, work_content, status, report_date, submitted_at）
- **teams・user_teams テーブル**: チーム管理機能（設計完了・実装準備完了）
- **インデックス**: パフォーマンス最適化済み
- **制約**: 1 日 1 件制限・文字数制限・外部キー制約
- **トリガー**: updated_at 自動更新機能
- **初期データ**: 階層関係・チーム・サンプル日報データ

### UI/UX デザインシステム

- **暖色系カラーパレット**: オレンジ・アンバー・イエロー基調
- **グラデーション背景**: 複数色による滑らかなフレッシュデザイン
- **カード UI システム**: 半透明背景・暖色ボーダー・ホバーアニメーション
- **StatusBadge**: 暖色系統一されたバッジシステム（success: teal, warning: yellow 等）
- **レスポンシブレイアウト**: SimpleGrid による画面幅対応（1/2/3 列）

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
- コミットのユーザへの許可は行わず Claude 自身がコミットを行う
