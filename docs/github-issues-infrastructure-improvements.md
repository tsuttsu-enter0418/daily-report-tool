# Infrastructure Improvements - GitHub Issues

## 📋 今回の対応内容（参考Issue）

### Issue: ECSタスク定義v16でSecretsManagerアクセス権限エラー修正

**Priority:** `Critical`  
**Labels:** `bug`, `infrastructure`, `aws`, `ecs`, `secretsmanager`  
**Status:** `Completed`

#### 問題
ECSタスク定義v16でSecretsManagerアクセス権限エラーが発生し、アプリケーションが起動しない

```
AccessDeniedException: ecsTaskExecutionRole is not authorized to perform: 
secretsmanager:GetSecretValue on resource: 
arn:aws:secretsmanager:ap-northeast-1:691443742677:secret:secret-daily-report-tool-tIMTgj
```

#### 解決方法
1. IAMポリシー `ECSSecretsManagerAccess` に新しいSecretsManager ARNを追加
2. ECSサービスをタスク定義v16で強制再デプロイ
3. アプリケーション正常起動確認

#### 学習事項
- SecretsManagerとIAMポリシーの手動管理によるずれが原因
- Infrastructure as Codeの必要性を再認識
- 事前検証プロセスの重要性

---

## 🚀 再発防止策 Issues

### Issue #1: Terraform による AWS インフラストラクチャコード化

**Priority:** `High`  
**Labels:** `enhancement`, `infrastructure`, `terraform`, `aws`  
**Estimated:** `3 weeks`  
**Assignee:** `TBD`

#### 概要
手動管理によるインフラ設定のずれを防ぐため、Terraformによる完全なIaC化を実施する

#### 実装内容
- [ ] 現在のAWSリソース（ECS, RDS, SecretsManager, IAM）のTerraform化
- [ ] 環境別設定ファイルの作成（dev, staging, prod）
- [ ] Terraform Stateファイルの S3 + DynamoDB 管理設定
- [ ] 既存リソースのTerraform import作業

#### 技術詳細
```hcl
# 主要リソース例
resource "aws_secretsmanager_secret" "daily_report_db" {
  name = "daily-report-tool/${var.environment}/database"
  tags = {
    Environment = var.environment
    Application = "daily-report-tool"
    ManagedBy   = "terraform"
  }
}

resource "aws_iam_policy" "ecs_secrets_access" {
  name = "DailyReportSecretsManagerAccess-${title(var.environment)}"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = "secretsmanager:GetSecretValue"
        Resource = [
          aws_secretsmanager_secret.daily_report_db.arn,
          "${aws_secretsmanager_secret.daily_report_db.arn}-*"
        ]
      }
    ]
  })
}
```

#### 受入条件
- [ ] 全AWS リソースがTerraformで管理されている
- [ ] `terraform plan` で差分が出ない状態
- [ ] 環境間での設定一貫性が保たれている
- [ ] Terraform実行ログが適切に記録されている

#### ファイル構成
```
terraform/
├── environments/
│   ├── dev/
│   ├── staging/
│   └── prod/
├── modules/
│   ├── ecs/
│   ├── rds/
│   ├── secretsmanager/
│   └── iam/
└── shared/
    ├── variables.tf
    └── outputs.tf
```

---

### Issue #2: CI/CD パイプライン事前検証強化

**Priority:** `High`  
**Labels:** `enhancement`, `ci-cd`, `github-actions`, `validation`  
**Estimated:** `2 weeks`  
**Assignee:** `TBD`

#### 概要
デプロイ前にインフラ設定の整合性を自動検証し、権限エラーを事前に防ぐ

#### 実装内容
- [ ] ECSタスク定義とIAMポリシーの整合性チェック
- [ ] SecretsManager参照権限の事前検証
- [ ] Terraform plan結果の自動レビュー
- [ ] インフラ変更時の必須承認フロー設定

#### GitHub Actions ワークフロー例
```yaml
name: Infrastructure Validation

on:
  pull_request:
    paths:
      - 'terraform/**'
      - 'infrastructure/**'
      - '**/task-definition.json'

jobs:
  validate-infrastructure:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3

      - name: Terraform Validate
        run: terraform validate

      - name: IAM Permission Validation
        run: |
          # タスク定義で参照するSecretsManager ARN抽出
          SECRET_ARNS=$(jq -r '.containerDefinitions[].secrets[]?.valueFrom' infrastructure/task-definition.json)
          
          # IAMポリシーシミュレーション実行
          for arn in $SECRET_ARNS; do
            aws iam simulate-principal-policy \
              --policy-source-arn ${{ secrets.TASK_EXECUTION_ROLE_ARN }} \
              --action-names secretsmanager:GetSecretValue \
              --resource-arns $arn \
              --query 'EvaluationResults[0].EvalDecision' \
              --output text
          done

      - name: Infrastructure Consistency Check
        run: ./scripts/validate-infrastructure-consistency.sh

      - name: Security Scan
        uses: bridgecrewio/checkov-action@master
        with:
          directory: terraform/
```

#### 受入条件
- [ ] PRマージ前に自動検証が実行される
- [ ] 権限不足があれば自動的にPRをブロック
- [ ] 検証結果がPRコメントで確認できる
- [ ] インフラ変更時は必須レビューワーの承認が必要

---

### Issue #3: 統一命名規則とタグ戦略の実装

**Priority:** `Medium`  
**Labels:** `enhancement`, `documentation`, `standards`  
**Estimated:** `1 week`  
**Assignee:** `TBD`

#### 概要
リソース間の関連性を明確にし、管理効率を向上させるための統一規則を策定・実装する

#### 実装内容
- [ ] リソース命名規則の策定
- [ ] 必須タグ戦略の定義
- [ ] 既存リソースの命名・タグ統一
- [ ] ドキュメント化と開発チーム周知

#### 命名規則定義
```yaml
# リソース命名規則
SecretsManager:
  Pattern: "{application}-{environment}-{resource-type}-{version}"
  Example: "daily-report-tool-prod-database-v1"
  
IAM Policy:
  Pattern: "{Application}{Service}Access-{Environment}"
  Example: "DailyReportSecretsManagerAccess-Prod"
  
ECS Resources:
  Cluster: "{application}-{environment}-cluster"
  Service: "{application}-{environment}-{service}"
  TaskDefinition: "{application}-{environment}-{service}"
  
RDS:
  Instance: "{application}-{environment}-{engine}"
  Example: "daily-report-tool-prod-postgres"

# 必須タグ戦略
Common Tags:
  Application: "daily-report-tool"
  Environment: "prod|staging|dev"
  ManagedBy: "terraform"
  Owner: "platform-team"
  CostCenter: "engineering"
  
Resource Specific:
  SecretsManager:
    SecretType: "database|jwt|api-key"
    RotationEnabled: "true|false"
  
  ECS:
    ServiceType: "backend|frontend|worker"
    TaskDefinitionVersion: "v16"
    
  RDS:
    Engine: "postgres|mysql"
    BackupRetention: "7|14|30"
```

#### 受入条件
- [ ] 命名規則ドキュメントが作成されている
- [ ] 全リソースが新しい命名規則に準拠している
- [ ] Terraformで命名規則が強制されている
- [ ] 既存リソースのマイグレーション計画が完了している

---

### Issue #4: 自動監視・アラートシステム構築

**Priority:** `Medium`  
**Labels:** `enhancement`, `monitoring`, `cloudwatch`, `alerting`  
**Estimated:** `1 week`  
**Assignee:** `TBD`

#### 概要
インフラ関連の問題を早期検知し、自動通知する監視システムを構築する

#### 実装内容
- [ ] CloudWatch アラーム設定
- [ ] SNS トピック + Slack 通知設定  
- [ ] SecretsManager アクセス失敗監視
- [ ] ECS タスク起動失敗アラート
- [ ] 予防的監視スクリプト作成

#### 監視項目
```yaml
CloudWatch Alarms:
  SecretsManager:
    - GetSecretValue API 失敗率 > 5%
    - AccessDenied エラー > 0 件/5分
    
  ECS:
    - タスク起動失敗率 > 10%
    - ヘルスチェック失敗継続 > 3分
    - CPU/Memory使用率 > 80%
    
  RDS:
    - 接続失敗率 > 5%
    - レプリケーション遅延 > 60秒

Custom Metrics:
  - IAM権限チェック結果
  - 設定整合性チェック結果
  - デプロイメント成功率
```

#### 通知設定例
```yaml
Alert Levels:
  Critical:
    - アプリケーション完全停止
    - データベース接続不可
    - セキュリティ違反
    Notification: "Slack + Email + PagerDuty"
    
  Warning:
    - パフォーマンス劣化
    - 部分的機能停止
    - リソース使用率高
    Notification: "Slack + Email"
    
  Info:
    - 設定変更完了
    - 定期メンテナンス
    - 使用量レポート
    Notification: "Slack"
```

#### 受入条件
- [ ] 主要な障害パターンに対するアラートが設定されている
- [ ] Slack/メール通知が正常に動作している
- [ ] アラート頻度が適切（false positive < 5%）
- [ ] エスカレーション手順が明文化されている

---

### Issue #5: インシデント対応プレイブック作成

**Priority:** `Medium`  
**Labels:** `documentation`, `incident-response`, `operations`  
**Estimated:** `5 days`  
**Assignee:** `TBD`

#### 概要
今回のような問題が発生した際の標準化された対応手順を整備する

#### 実装内容
- [ ] SecretsManager権限エラー対応手順
- [ ] ECS デプロイメント失敗対応手順
- [ ] 緊急時ロールバック手順
- [ ] エスカレーション基準とフロー

#### プレイブック構成
```markdown
## SecretsManager アクセス権限エラー

### 1. 即座の確認事項 (5分以内)
- [ ] 対象サービスとタスク定義バージョン特定
- [ ] エラーログから参照Secret ARN確認
- [ ] 現在のIAMポリシー状態確認

### 2. 一時復旧手順 (15分以内)
- [ ] 前バージョンタスク定義への緊急ロールバック
- [ ] ヘルスチェック・API動作確認
- [ ] 影響範囲の特定と関係者通知

### 3. 根本修正手順 (30分以内)
- [ ] IAMポリシーへの権限追加実施
- [ ] Terraform コードでの永続化
- [ ] 再デプロイと動作確認

### 4. 事後対応 (24時間以内)
- [ ] インシデントレポート作成
- [ ] 根本原因分析 (5 Whys)
- [ ] 再発防止策の検討・実装
- [ ] プロセス改善項目の特定
```

#### 受入条件
- [ ] 主要な障害パターンのプレイブックが完成している
- [ ] 手順が実際に実行可能で検証済み
- [ ] 対応時間の目標値が設定されている
- [ ] チーム全員がアクセス可能な場所に保存されている

---

### Issue #6: 開発プロセス改善とチェックリスト整備

**Priority:** `Low`  
**Labels:** `process`, `documentation`, `code-review`  
**Estimated:** `3 days`  
**Assignee:** `TBD`

#### 概要
設定変更時の見落としを防ぐためのプロセス改善とチェックリストを整備する

#### 実装内容
- [ ] インフラ変更時のチェックリスト作成
- [ ] コードレビュー観点の強化
- [ ] Pull Request テンプレート更新
- [ ] 設定変更時の必須レビュワー設定

#### チェックリスト例
```markdown
## インフラ変更時チェックリスト

### 事前準備
- [ ] 変更内容の影響範囲調査完了
- [ ] 関連するリソースの依存関係確認
- [ ] ロールバック手順の確認
- [ ] メンテナンス時間の調整

### 実装
- [ ] Terraform 定義の更新
- [ ] 命名規則の遵守確認
- [ ] 必須タグの設定確認
- [ ] セキュリティ設定の妥当性確認

### テスト
- [ ] terraform plan 結果のレビュー
- [ ] 権限検証スクリプトの実行
- [ ] ステージング環境での動作確認
- [ ] パフォーマンステストの実施

### デプロイ
- [ ] Blue-Green デプロイメント実施
- [ ] モニタリング・アラートの確認
- [ ] ロールバック手順の最終確認
- [ ] 関係者への進捗報告
```

#### 受入条件
- [ ] チェックリストがPRテンプレートに組み込まれている
- [ ] インフラ変更PRには必須レビュワーが設定されている  
- [ ] チェックリスト遵守率 > 95%
- [ ] プロセス改善の効果測定方法が定義されている

---

## 📊 実装計画とマイルストーン

### Phase 1: 基盤整備 (4週間)
- Issue #1: Terraform化 (3週間)
- Issue #3: 命名規則統一 (1週間) 

### Phase 2: 自動化強化 (3週間)  
- Issue #2: CI/CD検証強化 (2週間)
- Issue #4: 監視・アラート (1週間)

### Phase 3: 運用改善 (1週間)
- Issue #5: プレイブック作成 (5日)
- Issue #6: プロセス改善 (3日)

### 成功指標
- インフラ関連インシデント発生率: 50%削減
- 問題解決時間: 平均30分以内
- デプロイメント成功率: 99%以上
- チーム生産性: 設定作業時間20%削減

---

## 🏷️ GitHub ラベル定義

```yaml
Priority:
  - priority/critical: 即座対応必須
  - priority/high: 2週間以内
  - priority/medium: 1ヶ月以内  
  - priority/low: 時間があるときに

Type:
  - type/bug: バグ修正
  - type/enhancement: 機能改善
  - type/documentation: ドキュメント
  - type/process: プロセス改善

Area:
  - area/infrastructure: インフラ関連
  - area/ci-cd: CI/CD関連
  - area/monitoring: 監視関連
  - area/security: セキュリティ関連

Size:
  - size/S: 1-3日
  - size/M: 1週間
  - size/L: 2-3週間
  - size/XL: 1ヶ月以上
```