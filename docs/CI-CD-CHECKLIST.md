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
  - [ ] `backend/pom.xml` に JaCoCo Plugin 追加
  - [ ] 並行テスト実行設定確認
  
- [ ] **GitHub Actions ワークフロー**
  - [ ] `.github/workflows/backend-ci.yml` 作成済み
  - [ ] PostgreSQL Services 設定確認
  - [ ] テスト実行ステップ確認
  - [ ] コード品質チェック設定確認

### 動作確認
- [ ] **ローカルテスト実行**
  ```bash
  cd backend
  ./mvnw test -Dspring.profiles.active=test
  ```
  - [ ] JUnit テストが成功する
  - [ ] テストカバレッジレポートが生成される
  
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

### Phase 1 完了条件
- [ ] **パフォーマンス基準達成**
  - [ ] CI 実行時間 < 10分
  - [ ] テストカバレッジ ≥ 80%
  - [ ] 並行テスト実行動作確認
  
- [ ] **品質基準達成**
  - [ ] Checkstyle エラー 0件
  - [ ] セキュリティスキャン Critical 0件
  - [ ] Docker イメージ脆弱性スキャン通過

---

## 📋 Phase 2: CD基盤構築 チェックリスト

### 事前準備
- [ ] **Phase 1 完了確認**
  - [ ] CI ワークフローが安定動作している
  - [ ] すべてのテストが継続的に成功している
  
- [ ] **AWS リソース確認**
  - [ ] ECR リポジトリ `daily-report-backend` 存在確認
  - [ ] ECS クラスター `daily-report-cluster` 動作確認
  - [ ] ECS サービス `daily-report-task-service` 状態確認
  - [ ] 既存タスク定義の最新バージョン確認

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

### Phase 2 完了条件
- [ ] **パフォーマンス基準達成**
  - [ ] CD 実行時間 < 15分
  - [ ] デプロイ成功率 ≥ 95%
  - [ ] ヘルスチェック応答時間 < 30秒
  
- [ ] **運用基準達成**
  - [ ] デプロイ後の API 正常動作確認
  - [ ] ゼロダウンタイムデプロイ確認
  - [ ] 古い ECR イメージ自動削除動作確認

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

**チェックリスト最終更新**: 2025年9月20日  
**関連ドキュメント**: [CI-CD-IMPLEMENTATION-PLAN.md](./CI-CD-IMPLEMENTATION-PLAN.md)