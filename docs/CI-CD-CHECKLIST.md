# CI/CD 実装チェックリスト

## 🎯 このファイルの使い方

**目的**: コンテキストが失われても継続作業できるよう、各フェーズの詳細なチェックリストを提供  
**更新**: 各項目完了時に ✅ に変更  
**参照**: [CI-CD-IMPLEMENTATION-PLAN.md](./CI-CD-IMPLEMENTATION-PLAN.md) と併用

---

## 📋 Phase 1: CI基盤構築 チェックリスト

### 事前準備
- [ ] **GitHub Secrets 設定完了**
  - [ ] `AWS_ACCESS_KEY_ID` 設定済み
  - [ ] `AWS_SECRET_ACCESS_KEY` 設定済み  
  - [ ] `SONAR_TOKEN` 設定済み（SonarQube使用時）
  - [ ] `SLACK_WEBHOOK_URL` 設定済み
  
- [ ] **開発環境確認**
  - [ ] Java 17 インストール済み
  - [ ] Maven 3.8+ インストール済み
  - [ ] Docker インストール済み
  - [ ] AWS CLI 設定済み

### ファイル作成・更新
- [ ] **テスト設定ファイル作成**
  - [ ] `backend/src/test/resources/application-test.yml` 作成済み
  - [ ] PostgreSQL テスト DB 設定確認
  - [ ] JWT テスト用設定確認
  
- [ ] **Maven 設定更新**
  - [ ] `backend/pom.xml` に Surefire Plugin 追加
  - [ ] `backend/pom.xml` に JaCoCo Plugin 追加（バージョン 0.8.11+）
  - [ ] JaCoCo Plugin でCSV/XML/HTML形式出力設定確認
  - [ ] 並行テスト実行設定確認
  - [ ] JaCoCo Surefire 連携設定（`${jacoco.surefire.argLine}`）確認
  
- [ ] **GitHub Actions ワークフロー**
  - [ ] `.github/workflows/backend-ci.yml` 作成済み
  - [ ] PostgreSQL Services 設定確認
  - [ ] テスト実行ステップ確認
  - [ ] コード品質チェック設定確認
  - [ ] JaCoCo カバレッジレポート設定確認
    - [ ] `cicirello/jacoco-badge-generator@v2` アクション使用
    - [ ] `jacoco-csv-file: target/site/jacoco/jacoco.csv` 設定
    - [ ] カバレッジ基準値設定（例: 80%）

### 動作確認
- [ ] **ローカルテスト実行**
  ```bash
  cd backend
  ./mvnw test -Dspring.profiles.active=test
  ```
  - [ ] JUnit テストが成功する
  - [ ] JaCoCo カバレッジレポートが生成される
    - [ ] `target/site/jacoco/jacoco.csv` 存在確認
    - [ ] `target/site/jacoco/jacoco.xml` 存在確認
    - [ ] `target/site/jacoco/index.html` 存在確認
  
- [ ] **Docker ビルド確認**
  ```bash
  cd backend
  docker build -t daily-report-backend:test .
  ```
  - [ ] Docker イメージがビルドできる
  - [ ] イメージサイズが適切（< 500MB）
  
- [ ] **CI ワークフロー確認**
  - [ ] feature ブランチ作成・PR 作成
  - [ ] GitHub Actions が自動実行される
  - [ ] すべてのジョブが成功する
  - [ ] PR にテスト結果がコメントされる

### Phase 1 完了条件 ✅ **完了**
- [x] **パフォーマンス基準達成** ✅
  - [x] CI 実行時間 < 10分 ✅
  - [x] テストカバレッジ ≥ 80% ✅
  - [x] 並行テスト実行動作確認 ✅
  
- [x] **品質基準達成** ✅
  - [x] Checkstyle エラー 0件 ✅
  - [x] セキュリティスキャン Critical 0件 ✅
  - [x] Docker イメージ脆弱性スキャン通過 ✅

---

## 📋 Phase 2: AWS CD基盤構築 + TestContainers統合テスト チェックリスト

### 🎯 **重点目標**: AWS ECR/ECS 自動デプロイ + PostgreSQL 統合テスト環境

### 事前準備
- [ ] **Phase 1 完了確認** ✅
  - [x] CI ワークフローが安定動作している
  - [x] JaCoCo テストカバレッジ 80% 以上を維持
  - [x] H2 単体テストが高速実行されている
  
- [ ] **🚀 Priority 1: AWS CD基盤準備**
  - [ ] GitHub Secrets 設定完了
    - [ ] `AWS_ACCESS_KEY_ID` 設定済み
    - [ ] `AWS_SECRET_ACCESS_KEY` 設定済み
    - [ ] (オプション) `SLACK_WEBHOOK_URL` 設定済み
  - [ ] AWS リソース確認
    - [ ] ECR リポジトリ `daily-report-backend` 存在確認
    - [ ] ECS クラスター `daily-report-cluster` 動作確認
    - [ ] ECS サービス `daily-report-task-service` 状態確認
    - [ ] IAM ロール・ポリシー設定確認

- [ ] **🧪 Priority 2: TestContainers準備**
  - [ ] TestContainers 依存関係確認
    - [ ] `backend/pom.xml` に TestContainers PostgreSQL 追加済み
    - [ ] Maven バージョン TestContainers 対応確認

### ファイル作成・更新
- [ ] **CD ワークフロー作成**
  - [ ] `.github/workflows/backend-cd.yml` 作成済み
  - [ ] ECR プッシュステップ確認
  - [ ] ECS デプロイステップ確認
  - [ ] ヘルスチェックステップ確認
  
- [ ] **デプロイスクリプト改良**
  - [ ] `scripts/ecr-deploy-improved.sh` 作成済み
  - [ ] GitHub Actions 環境変数サポート確認
  - [ ] エラーハンドリング強化確認
  - [ ] ECS デプロイ機能追加確認

### 権限・認証確認
- [ ] **AWS IAM 権限確認**
  ```bash
  # ECR 権限確認
  aws ecr describe-repositories --repository-names daily-report-backend
  
  # ECS 権限確認  
  aws ecs describe-clusters --clusters daily-report-cluster
  aws ecs describe-services --cluster daily-report-cluster --services daily-report-task-service
  ```
  - [ ] ECR プッシュ権限確認
  - [ ] ECS タスク定義更新権限確認
  - [ ] ECS サービス更新権限確認

### 動作確認
#### 🚀 **Priority 1: AWS CD基盤動作確認**
- [ ] **ローカルデプロイスクリプト確認**
  ```bash
  # 環境変数設定してテスト実行
  export AWS_ACCOUNT_ID=691443742677
  export AWS_REGION=ap-northeast-1
  export ECR_REPOSITORY=daily-report-backend
  export IMAGE_TAG=test
  
  ./scripts/ecr-deploy-improved.sh
  ```
  - [ ] ECR プッシュが成功する
  - [ ] ECS タスク定義が更新される
  - [ ] ECS サービスが新しいイメージで起動する
  
- [ ] **CD ワークフロー確認**
  - [ ] main ブランチへのマージで CD 実行確認
  - [ ] ECR に新しいイメージプッシュ確認
  - [ ] ECS サービス更新確認
  - [ ] ヘルスチェック成功確認
  - [ ] Slack 通知送信確認

#### 🧪 **Priority 2: TestContainers統合テスト動作確認**
- [ ] **ローカル統合テスト確認**
  ```bash
  # TestContainers 統合テスト実行
  cd backend
  ./mvnw test -Dspring.profiles.active=integration-test
  ```
  - [ ] PostgreSQL TestContainers が起動する
  - [ ] 統合テストが正常実行される
  - [ ] 単体テストは H2 で高速実行維持
  - [ ] テストデータセットが正常動作する
  
- [ ] **CI環境でのTestContainers確認**
  - [ ] GitHub Actions で TestContainers 実行確認
  - [ ] Docker-in-Docker 権限設定確認
  - [ ] 統合テスト結果がCIレポートに含まれる確認

### Phase 2 完了条件

#### 🚀 **Priority 1: AWS CD基盤完了条件**
- [ ] **パフォーマンス基準達成**
  - [ ] CD 実行時間 < 15分
  - [ ] デプロイ成功率 ≥ 95%
  - [ ] ヘルスチェック応答時間 < 30秒
  
- [ ] **運用基準達成**
  - [ ] デプロイ後の API 正常動作確認
  - [ ] ゼロダウンタイムデプロイ確認
  - [ ] 古い ECR イメージ自動削除動作確認

#### 🧪 **Priority 2: TestContainers統合テスト完了条件**
- [ ] **統合テスト基準達成**
  - [ ] PostgreSQL TestContainers 正常動作
  - [ ] 統合テスト実行時間 < 10分
  - [ ] 単体テスト（H2）は < 5分維持
  - [ ] 統合テストカバレッジ ≥ 70%
  
- [ ] **テストデータ品質達成**
  - [ ] 実データに近いテストデータセット整備
  - [ ] マルチユーザー・権限テストシナリオ実装
  - [ ] データ整合性テスト完全実装

---

## 📋 Phase 3: 高度機能実装 チェックリスト

### 事前準備
- [ ] **Phase 2 完了確認**
  - [ ] CD ワークフローが安定動作している
  - [ ] デプロイメントが継続的に成功している
  
- [ ] **高度機能設計確認**
  - [ ] Blue-Green デプロイメント戦略決定
  - [ ] ロールバック条件・手順定義
  - [ ] パフォーマンステスト要件定義

### Blue-Green デプロイメント実装
- [ ] **ワークフロー拡張**
  - [ ] `.github/workflows/backend-blue-green.yml` 作成
  - [ ] トラフィック切り替えロジック実装
  - [ ] 段階的ロールアウト設定
  
- [ ] **ECS 設定拡張**
  - [ ] Blue/Green 用の複数タスク定義管理
  - [ ] ロードバランサー設定確認
  - [ ] ヘルスチェック詳細設定

### 自動ロールバック実装
- [ ] **監視・検知機能**
  - [ ] CloudWatch アラーム設定
  - [ ] ヘルスチェック失敗検知
  - [ ] パフォーマンス劣化検知
  
- [ ] **ロールバック実行機能**
  - [ ] `scripts/rollback.sh` 作成
  - [ ] 前バージョンへの自動復旧機能
  - [ ] 通知・ログ機能

### パフォーマンステスト統合
- [ ] **テスト環境構築**
  - [ ] `.github/workflows/backend-performance.yml` 作成
  - [ ] JMeter または k6 設定
  - [ ] パフォーマンス基準定義
  
- [ ] **結果分析・判定**
  - [ ] パフォーマンスメトリクス収集
  - [ ] 基準値との比較・判定
  - [ ] レポート生成・通知

### Phase 3 完了条件
- [ ] **高度機能動作確認**
  - [ ] Blue-Green デプロイメント成功
  - [ ] 障害時自動ロールバック動作確認
  - [ ] パフォーマンステスト自動実行確認
  
- [ ] **運用レベル基準達成**
  - [ ] 99.9% アップタイム維持
  - [ ] 障害復旧時間 < 5分
  - [ ] パフォーマンス基準継続達成

---

## 🚨 各フェーズ共通: トラブルシューティングチェック

### GitHub Actions 関連
- [ ] **ワークフロー実行エラー時**
  - [ ] GitHub Actions ログ詳細確認
  - [ ] Secrets 設定値確認
  - [ ] 権限エラーの場合は IAM ポリシー確認
  - [ ] タイムアウトの場合は実行時間設定確認
  
- [ ] **構文エラー・設定エラー時**
  - [ ] YAML構文確認（インデント・構造）
  - [ ] `run: |` ブロック内のbash構文確認（特に`if`文の`then`）
  - [ ] JaCoCo Action設定確認（cobertura vs cicirello）
  - [ ] ファイルパス確認（`jacoco.csv` vs `cobertura.xml`）

### AWS リソース関連
- [ ] **ECR 関連エラー時**
  - [ ] ECR リポジトリ存在確認
  - [ ] ECR プッシュ権限確認
  - [ ] Docker イメージサイズ確認（上限チェック）
  
- [ ] **ECS 関連エラー時**
  - [ ] ECS クラスター・サービス状態確認
  - [ ] タスク定義の設定値確認
  - [ ] SecretsManager アクセス権限確認

### アプリケーション関連
- [ ] **ヘルスチェック失敗時**
  - [ ] アプリケーションログ確認
  - [ ] データベース接続確認
  - [ ] JVM メモリ使用量確認
  - [ ] 起動時間・初期化処理確認

---

## 📊 完了報告テンプレート

### Phase 1 完了報告
```markdown
## Phase 1: CI基盤構築 完了報告

### ✅ 実装完了項目
- GitHub Actions CI ワークフロー
- JUnit テスト自動実行 (実行時間: X分)
- コード品質チェック統合
- セキュリティスキャン統合
- Docker ビルド検証

### 📊 パフォーマンス指標
- CI 実行時間: X分
- テストカバレッジ: X%
- 成功率: X%

### ⚠️ 判明した課題
- (課題があれば記載)

### 🔄 次フェーズへの引き継ぎ事項
- (Phase 2 で注意すべき点など)
```

### Phase 2 完了報告
```markdown
## Phase 2: CD基盤構築 完了報告

### ✅ 実装完了項目
- GitHub Actions CD ワークフロー
- ECR 自動プッシュ
- ECS 自動デプロイメント
- ヘルスチェック・検証機能
- Slack 通知統合

### 📊 パフォーマンス指標
- CD 実行時間: X分
- デプロイ成功率: X%
- ヘルスチェック応答時間: X秒

### ⚠️ 判明した課題
- (課題があれば記載)

### 🔄 次フェーズへの引き継ぎ事項
- (Phase 3 で注意すべき点など)
```

### Phase 3 完了報告
```markdown
## Phase 3: 高度機能実装 完了報告

### ✅ 実装完了項目
- Blue-Green デプロイメント
- 自動ロールバック機能
- パフォーマンステスト統合
- 高度監視・分析機能

### 📊 運用レベル指標
- アップタイム: X%
- 障害復旧時間: X分
- パフォーマンス基準達成率: X%

### 🎉 プロジェクト完了
- 総実装期間: X週間
- 最終的な改善効果: (デプロイ時間XX%短縮等)
```

---

---

## 📝 最新修正事項 (2025年9月28日)

### Phase 1 → Phase 2 移行戦略更新
- [x] **Phase 1 完了確認**
  - [x] CI基盤構築・JaCoCo統合・テスト自動化完成 ✅
  - [x] パフォーマンス・品質基準全達成 ✅
  - [x] GitHub Actions CI ワークフロー安定動作 ✅

- [x] **Phase 2 重点化戦略策定**
  - [x] Priority 1: AWS CD基盤（ECR/ECS デプロイ）最優先実装
  - [x] Priority 2: TestContainers PostgreSQL統合テスト段階的導入
  - [x] 戦略的判断: 単体テストH2継続・統合テストPostgreSQL TestContainers

### Phase 2 チェックリスト詳細化
- [x] **AWS CD基盤チェック項目**
  - [x] GitHub Secrets設定（AWS認証情報）
  - [x] ECR/ECS リソース確認手順
  - [x] デプロイスクリプト改良項目
  - [x] 動作確認・完了条件明確化

- [x] **TestContainers統合準備項目**
  - [x] 依存関係確認・設定ファイル作成手順
  - [x] ローカル・CI環境での動作確認項目
  - [x] テストデータ品質基準策定

### JaCoCo設定関連修正（前回完了分）
- [x] **JaCoCo Plugin設定見直し**
  - [x] 不正なCobertura形式生成設定を削除
  - [x] 標準的なJaCoCo設定に統一（CSV/XML/HTML出力）
  - [x] `backend/pom.xml` 設定完了

- [x] **GitHub Actions JaCoCo統合修正**
  - [x] `5monkeys/cobertura-action` → `cicirello/jacoco-badge-generator@v2` 変更
  - [x] `cobertura.xml` → `jacoco.csv` ファイル使用に変更
  - [x] カバレッジバッジ自動生成機能追加

- [x] **GitHub Actions構文修正**
  - [x] bash `if`文構文エラー修正（`then`追加）
  - [x] YAML構文検証済み

### 学んだ教訓
1. **段階的実装の重要性**: Phase 1完了確認後のPhase 2移行で安定性確保
2. **優先度設定の効果**: AWS CD基盤を最優先にしてリリース効率を重視
3. **TestContainers戦略**: 単体テスト高速性維持+統合テスト品質向上の両立
4. **JaCoCo vs Cobertura**: 形式不一致によるエラーを回避するため、JaCoCo専用ツール使用推奨
5. **bash構文チェック**: `run: |` ブロック内のスクリプトも厳密な構文チェック必要

---

**チェックリスト最終更新**: 2025年9月28日（Phase 2戦略反映）  
**次回更新予定**: Phase 2 AWS CD基盤完了時  
**関連ドキュメント**: [CI-CD-IMPLEMENTATION-PLAN.md](./CI-CD-IMPLEMENTATION-PLAN.md)