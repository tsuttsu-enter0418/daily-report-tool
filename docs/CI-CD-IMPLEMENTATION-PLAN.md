# Spring Boot CI/CD パイプライン実装計画書

## 📋 プロジェクト概要

**目的**: Spring Boot バックエンドの GitHub Actions CI/CD パイプライン構築  
**期間**: 3週間（3フェーズ）  
**最終目標**: JUnit テスト自動実行 → ECR プッシュ → ECS 自動デプロイ  

---

## 🎯 現状分析（2025年9月時点）

### ✅ 既存環境
- **Backend**: Spring Boot 3.2.0 + Java 17 + Maven
- **AWS**: ECS Fargate + ECR + SecretsManager + RDS PostgreSQL
- **既存スクリプト**: `/scripts/push-to-ecr.sh` （基本的なECRプッシュ機能）
- **ブランチ戦略**: feature → PR → main
- **現在のデプロイ**: 手動実行

### ❌ 課題
- JUnit テスト手動実行
- ECR プッシュ手動実行
- ECS デプロイメント手動実行
- コード品質チェックなし
- セキュリティスキャンなし
- ロールバック機能なし
- デプロイ状況の可視化なし

---

## 🚀 実装計画：3フェーズアプローチ

### Phase 1: CI基盤構築 ✅ **完了**
**目標**: PR時の自動検証パイプライン構築

#### 完了済み実装項目
1. **GitHub Actions CI ワークフロー** (`backend-ci.yml`) ✅
   - JUnit テスト自動実行（H2インメモリDB使用）
   - JaCoCo 0.8.11 テストカバレッジ（CSV/XML/HTML出力）
   - cicirello/jacoco-badge-generator@v2 統合
   - コード品質チェック（Checkstyle）
   - セキュリティスキャン（OWASP）
   - Docker ビルド検証

2. **テスト環境整備** ✅
   - Maven Surefire Plugin 並行テスト実行設定
   - JaCoCo-Surefire 連携設定
   - H2 PostgreSQL MODE 設定

3. **品質ゲート設定** ✅
   - テストカバレッジ 80% 以上（ライン）
   - ブランチカバレッジ 70% 以上
   - Entity/DTO/Config クラス除外設定

#### 受入条件 ✅ **全て完了**
- [x] PR 作成時に CI が自動実行される
- [x] JUnit テストが並行実行される
- [x] コード品質チェックが動作する
- [x] Docker イメージがビルドできる
- [x] テストカバレッジが 80% 以上

### Phase 2: CD基盤構築 + 統合テスト強化 🔥 **現在実装中**
**目標**: AWS自動デプロイ + PostgreSQL統合テスト環境構築

#### 重点実装項目（優先度順）

#### 🚀 **Priority 1: AWS CD基盤**
1. **GitHub Actions CD ワークフロー** (`backend-cd.yml`)
   - ECR 自動プッシュ（既存スクリプト活用）
   - ECS タスク定義更新
   - ECS サービス自動デプロイ
   - デプロイメント成功検証
   - ヘルスチェック + ロールバック機能

2. **AWS 統合設定**
   - GitHub Secrets 設定（AWS認証情報）
   - ECR リポジトリ確認・設定
   - ECS クラスター・サービス設定確認
   - IAM ロール・ポリシー設定

#### 🧪 **Priority 2: TestContainers統合テスト**
3. **PostgreSQL TestContainers 環境**
   - 統合テスト専用の TestContainers 設定
   - 単体テストは H2 継続（高速実行維持）
   - 統合テスト用データセット整備
   - CI環境での TestContainers 実行設定

#### 🔧 **Priority 3: 統合改良**
4. **既存スクリプト統合改良**
   - `scripts/push-to-ecr.sh` の GitHub Actions 対応
   - エラーハンドリング強化
   - ECS デプロイ機能追加

#### 🔧 **TestContainers 詳細設定例**
```xml
<!-- pom.xml TestContainers依存関係 -->
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>postgresql</artifactId>
    <scope>test</scope>
</dependency>
```

```java
// 統合テスト設定例
@SpringBootTest
@Testcontainers
@ActiveProfiles("integration-test")
class DailyReportIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17")
            .withDatabaseName("daily_report_tool_test")
            .withUsername("test_user")
            .withPassword("test_password");
}
```

#### 受入条件
#### 🚀 **AWS CD基盤（Priority 1）**
- [ ] main ブランチマージ時に CD が自動実行される
- [ ] ECR に新しいイメージがプッシュされる
- [ ] ECS タスク定義が更新される
- [ ] ECS サービスが新しいイメージで起動する
- [ ] ヘルスチェックが成功する

#### 🧪 **統合テスト（Priority 2）**
- [ ] TestContainers で PostgreSQL 統合テストが実行される
- [ ] 単体テストは H2 で高速実行を維持
- [ ] CI環境で TestContainers が正常動作する
- [ ] 統合テスト用データセットが整備される

### Phase 3: 高度機能実装（1週間）
**目標**: 本番運用レベルの機能追加

#### 実装項目
1. **Blue-Green デプロイメント**
   - トラフィック段階的切り替え
   - カナリアリリース対応

2. **自動ロールバック機能**
   - ヘルスチェック失敗時の自動復旧
   - パフォーマンス劣化検知

3. **高度監視・分析**
   - パフォーマンステスト統合
   - セキュリティ継続監視
   - デプロイメントメトリクス分析

#### 受入条件
- [ ] Blue-Green デプロイメントが動作する
- [ ] 障害時に自動ロールバックする
- [ ] パフォーマンステストが統合されている
- [ ] 詳細なメトリクスが収集されている

---

## 📁 ファイル構成

### 作成済みファイル
```
.github/workflows/
├── backend-ci.yml          # Phase 1: CI ワークフロー（作成済み）
└── backend-cd.yml          # Phase 2: CD ワークフロー（作成済み）

docs/
├── CI-CD-IMPLEMENTATION-PLAN.md     # この計画書
└── github-issues-infrastructure-improvements.md  # インフラ改善 Issues

scripts/
└── push-to-ecr.sh         # 既存 ECR プッシュスクリプト
```

### 作成予定ファイル
```
backend/src/test/resources/
└── application-test.yml    # テスト環境設定

scripts/
├── ecr-deploy.sh          # 改良版デプロイスクリプト
├── health-check.sh        # ヘルスチェックスクリプト
└── rollback.sh            # ロールバックスクリプト

.github/
├── PULL_REQUEST_TEMPLATE.md  # PR テンプレート
└── workflows/
    ├── backend-staging.yml    # ステージング環境用
    └── backend-performance.yml # パフォーマンステスト用
```

---

## 🔧 実装手順詳細

### Phase 1 開始手順

#### 1. GitHub Secrets 設定
```bash
# GitHub Repository Settings → Secrets and variables → Actions
# 以下を追加:
```

**必須 Secrets:**
| Key | Value | 用途 |
|-----|-------|------|
| `AWS_ACCESS_KEY_ID` | `AKIA...` | ECS デプロイ用 AWS アクセスキー |
| `AWS_SECRET_ACCESS_KEY` | `...` | ECS デプロイ用 AWS シークレットキー |
| `SONAR_TOKEN` | `...` | SonarQube 解析用トークン |
| `SLACK_WEBHOOK_URL` | `https://hooks.slack.com/...` | 通知用 Slack Webhook |

#### 2. テスト環境設定ファイル作成
```bash
# 作業ディレクトリ移動
cd /Users/tsutsuikouhei/Desktop/Portfolio/daily-report-tool

# テスト設定ファイル作成
mkdir -p backend/src/test/resources
cat > backend/src/test/resources/application-test.yml << 'EOF'
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/daily_report_tool_test
    username: test_user
    password: test_password
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: false
  
  profiles:
    active: test

# JWT 設定（テスト用）
jwt:
  secret: test-secret-key-for-testing-only-not-for-production
  expiration: 86400000
  auth:
    enabled: true

# ログ設定（テスト用）
logging:
  level:
    com.example.dailyreport: DEBUG
    org.springframework.security: WARN
    org.hibernate.SQL: WARN

# テスト高速化設定
junit:
  jupiter:
    execution:
      parallel:
        enabled: true
        mode:
          default: concurrent
EOF
```

#### 3. Maven テスト設定強化
```bash
# pom.xml にテスト並行実行設定追加
# 手動で以下を backend/pom.xml の <plugins> セクションに追加:
```

```xml
<!-- 並行テスト実行設定 -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>3.0.0-M9</version>
    <configuration>
        <parallel>methods</parallel>
        <threadCount>4</threadCount>
        <forkCount>2</forkCount>
        <reuseForks>true</reuseForks>
        <argLine>${jacoco.surefire.argLine}</argLine>
        <systemPropertyVariables>
            <spring.profiles.active>test</spring.profiles.active>
        </systemPropertyVariables>
    </configuration>
</plugin>

<!-- JaCoCo テストカバレッジ -->
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.11</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
            <configuration>
                <propertyName>jacoco.surefire.argLine</propertyName>
            </configuration>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
            <configuration>
                <formats>
                    <format>HTML</format>
                    <format>XML</format>
                    <format>CSV</format>
                </formats>
            </configuration>
        </execution>
    </executions>
    <configuration>
        <excludes>
            <exclude>**/entity/**</exclude>
            <exclude>**/dto/**</exclude>
            <exclude>**/DailyReportApplication*</exclude>
            <exclude>**/config/**</exclude>
        </excludes>
    </configuration>
</plugin>
```

#### 4. CI ワークフロー実装検証
```bash
# 新しいブランチ作成
git checkout -b feature/ci-pipeline-phase1

# 作成済みファイル確認
ls -la .github/workflows/backend-ci.yml

# 変更をコミット
git add .github/workflows/backend-ci.yml
git add backend/src/test/resources/application-test.yml
git add backend/pom.xml  # Maven 設定更新後
git commit -m "Phase 1: Add CI pipeline with automated testing

- Add GitHub Actions CI workflow for Pull Requests
- Configure PostgreSQL test database integration
- Add JUnit parallel test execution
- Add code quality checks (Checkstyle, SonarQube)
- Add security vulnerability scanning (OWASP, Trivy)
- Add Docker build validation
- Add test coverage reporting with JaCoCo 0.8.11
- Integrate cicirello/jacoco-badge-generator@v2 for coverage badges
- Configure CSV/XML/HTML output formats for coverage reports
- Add JaCoCo-Surefire integration with proper excludes"

# プッシュして PR 作成
git push origin feature/ci-pipeline-phase1

# GitHub UI で Pull Request 作成
# → CI ワークフローの動作確認
```

### Phase 2 開始手順（現在実装中）

#### 🚀 **Step 1: AWS CD基盤準備（Priority 1）**
```bash
# Phase 1 完了確認
echo "✅ Phase 1 完了状況確認:"
echo "- CI ワークフローが安定動作している"
echo "- テストカバレッジが 80% 以上を維持"
echo "- JaCoCo レポートが正常生成されている"

# Phase 2 ブランチ作成
git checkout main
git pull origin main
git checkout -b feature/aws-cd-phase2

# 既存 CD ワークフロー確認
ls -la .github/workflows/backend-cd.yml

# 既存 ECR スクリプト確認
ls -la scripts/push-to-ecr.sh
```

#### 🔧 **Step 2: AWS 認証設定**
```bash
# GitHub Secrets 設定（GitHub UI で実行）
echo "GitHub Repository → Settings → Secrets and variables → Actions"
echo "必要な Secrets:"
echo "- AWS_ACCESS_KEY_ID: ECS デプロイ用"
echo "- AWS_SECRET_ACCESS_KEY: ECS デプロイ用"
echo "- (オプション) SLACK_WEBHOOK_URL: 通知用"

# AWS リソース確認
aws ecr describe-repositories --repository-names daily-report-backend --region ap-northeast-1
aws ecs describe-clusters --clusters daily-report-cluster --region ap-northeast-1
aws ecs describe-services --cluster daily-report-cluster --services daily-report-task-service --region ap-northeast-1
```

#### 🧪 **Step 3: TestContainers統合テスト設定（Priority 2）**
```bash
# TestContainers 依存関係を pom.xml に追加確認
grep -q "testcontainers" backend/pom.xml || echo "⚠️ TestContainers依存関係の追加が必要"

# 統合テスト用設定ファイル作成
mkdir -p backend/src/test/resources
cat > backend/src/test/resources/application-integration-test.yml << 'EOF'
spring:
  profiles:
    active: integration-test
  datasource:
    # TestContainers が自動設定するため url は不要
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: create-drop
    database-platform: org.hibernate.dialect.PostgreSQLDialect
    show-sql: true

# JWT設定（テスト用）
jwt:
  secret: test-secret-key-for-integration-testing-32chars-minimum
  expiration: 86400000
  auth:
    enabled: true

# ログ設定（統合テスト用）
logging:
  level:
    com.example.dailyreport: DEBUG
    org.testcontainers: INFO
    com.github.dockerjava: WARN
EOF
```

#### 🔧 **Step 4: 既存スクリプト改良**
```bash
# 改良版 ECR デプロイスクリプト作成
cat > scripts/ecr-deploy-improved.sh << 'EOF'
#!/bin/bash
# GitHub Actions 対応 ECR デプロイスクリプト
set -euo pipefail

# 環境変数（GitHub Actions または手動設定）
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-691443742677}"
AWS_REGION="${AWS_REGION:-ap-northeast-1}"
ECR_REPOSITORY="${ECR_REPOSITORY:-daily-report-backend}"
IMAGE_TAG="${GITHUB_SHA:-latest}"
BUILD_CONTEXT="${BUILD_CONTEXT:-./backend}"

# ECS 設定
ECS_CLUSTER="${ECS_CLUSTER:-daily-report-cluster}"
ECS_SERVICE="${ECS_SERVICE:-daily-report-task-service}"
ECS_TASK_DEFINITION="${ECS_TASK_DEFINITION:-daily-report-task}"

# ログ関数
log_info() { echo "🔵 [INFO] $1"; }
log_success() { echo "✅ [SUCCESS] $1"; }
log_error() { echo "❌ [ERROR] $1"; }
log_warning() { echo "⚠️ [WARNING] $1"; }

# エラーハンドリング
trap 'log_error "Script failed at line $LINENO"' ERR

main() {
    log_info "Starting ECR deployment process..."
    
    # 1. 環境確認
    validate_environment
    
    # 2. Docker イメージビルド
    build_docker_image
    
    # 3. ECR プッシュ
    push_to_ecr
    
    # 4. ECS デプロイ
    deploy_to_ecs
    
    # 5. ヘルスチェック
    verify_deployment
    
    log_success "Deployment completed successfully!"
}

validate_environment() {
    log_info "Validating environment..."
    
    # AWS 認証確認
    if ! aws sts get-caller-identity > /dev/null 2>&1; then
        log_error "AWS authentication failed"
        exit 1
    fi
    
    # ECR リポジトリ存在確認
    if ! aws ecr describe-repositories --repository-names "$ECR_REPOSITORY" --region "$AWS_REGION" > /dev/null 2>&1; then
        log_warning "ECR repository not found, creating..."
        aws ecr create-repository --repository-name "$ECR_REPOSITORY" --region "$AWS_REGION"
    fi
    
    log_success "Environment validation completed"
}

build_docker_image() {
    log_info "Building Docker image..."
    
    cd "$BUILD_CONTEXT"
    
    # Maven ビルド
    ./mvnw clean package -DskipTests -Dspring.profiles.active=production
    
    # Docker ビルド
    docker build -f Dockerfile -t "$ECR_REPOSITORY:$IMAGE_TAG" .
    
    cd ..
    log_success "Docker image built: $ECR_REPOSITORY:$IMAGE_TAG"
}

push_to_ecr() {
    log_info "Pushing to ECR..."
    
    # ECR ログイン
    aws ecr get-login-password --region "$AWS_REGION" | \
        docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
    
    # タグ付け
    local ecr_uri="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$IMAGE_TAG"
    docker tag "$ECR_REPOSITORY:$IMAGE_TAG" "$ecr_uri"
    
    # プッシュ
    docker push "$ecr_uri"
    
    echo "ECR_IMAGE_URI=$ecr_uri" >> $GITHUB_OUTPUT 2>/dev/null || true
    log_success "Pushed to ECR: $ecr_uri"
}

deploy_to_ecs() {
    log_info "Deploying to ECS..."
    
    local ecr_uri="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$IMAGE_TAG"
    
    # 現在のタスク定義取得
    aws ecs describe-task-definition \
        --task-definition "$ECS_TASK_DEFINITION" \
        --query taskDefinition > task-definition.json
    
    # 新しいイメージでタスク定義更新
    jq --arg IMAGE "$ecr_uri" \
        '.containerDefinitions[0].image = $IMAGE | del(.taskDefinitionArn) | del(.revision) | del(.status) | del(.requiresAttributes) | del(.placementConstraints) | del(.compatibilities) | del(.registeredAt) | del(.registeredBy)' \
        task-definition.json > new-task-definition.json
    
    # 新しいタスク定義登録
    local task_def_arn=$(aws ecs register-task-definition \
        --cli-input-json file://new-task-definition.json \
        --query 'taskDefinition.taskDefinitionArn' \
        --output text)
    
    # ECS サービス更新
    aws ecs update-service \
        --cluster "$ECS_CLUSTER" \
        --service "$ECS_SERVICE" \
        --task-definition "$task_def_arn"
    
    log_success "ECS service updated with task definition: $task_def_arn"
}

verify_deployment() {
    log_info "Verifying deployment..."
    
    # サービス安定化待機
    aws ecs wait services-stable \
        --cluster "$ECS_CLUSTER" \
        --services "$ECS_SERVICE"
    
    # ヘルスチェック
    local health_url="https://api.kouhei-portfolio.net/actuator/health"
    local max_attempts=5
    
    for i in $(seq 1 $max_attempts); do
        log_info "Health check attempt $i/$max_attempts..."
        
        if curl -f -s "$health_url" > /dev/null; then
            log_success "Health check passed"
            return 0
        fi
        
        if [ $i -lt $max_attempts ]; then
            log_warning "Health check failed, retrying in 30s..."
            sleep 30
        fi
    done
    
    log_error "Health check failed after $max_attempts attempts"
    return 1
}

# クリーンアップ
cleanup() {
    rm -f task-definition.json new-task-definition.json 2>/dev/null || true
}
trap cleanup EXIT

# メイン実行
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
EOF

chmod +x scripts/ecr-deploy-improved.sh
```

#### 3. CD ワークフロー実装検証
```bash
# 変更をコミット
git add .github/workflows/backend-cd.yml
git add scripts/ecr-deploy-improved.sh
git commit -m "Phase 2: Add CD pipeline with automatic deployment

- Add GitHub Actions CD workflow for main branch
- Integrate ECR push functionality
- Add ECS task definition update
- Add ECS service automatic deployment
- Add deployment verification and health checks
- Add Slack notification integration
- Add improved ECR deployment script with error handling"

# プッシュして main にマージ
git push origin feature/cd-pipeline-phase2
# → GitHub UI で Pull Request 作成・マージ
# → CD ワークフローの動作確認
```

### Phase 3 開始手順

#### 1. 高度機能実装
```bash
# Phase 2 完了後、新しいブランチ作成
git checkout main
git pull origin main
git checkout -b feature/advanced-pipeline-phase3

# Blue-Green デプロイメント用ワークフロー作成
# 自動ロールバック機能実装
# パフォーマンステスト統合
```

---

## ✅ チェックリスト

### Phase 1 完了条件
- [ ] `backend-ci.yml` が正常に動作する
- [ ] PR 作成時に CI が自動実行される
- [ ] JUnit テストが並行実行される（テスト時間 < 5分）
- [ ] PostgreSQL テスト DB 統合が動作する
- [ ] コード品質チェック（Checkstyle）が動作する
- [ ] セキュリティスキャン（OWASP, Trivy）が動作する
- [ ] Docker ビルド検証が成功する
- [ ] テストカバレッジレポートが生成される
- [ ] PR にテスト結果がコメントされる

### Phase 2 完了条件
- [ ] `backend-cd.yml` が正常に動作する
- [ ] main ブランチマージ時に CD が自動実行される
- [ ] ECR に新しいイメージがプッシュされる
- [ ] ECS タスク定義が自動更新される
- [ ] ECS サービスが新しいイメージで起動する
- [ ] デプロイメント後のヘルスチェックが成功する
- [ ] Slack にデプロイ通知が送信される
- [ ] デプロイ時間が 10分以内に完了する
- [ ] 古い ECR イメージが自動削除される

### Phase 3 完了条件
- [ ] Blue-Green デプロイメントが動作する
- [ ] 障害時の自動ロールバックが動作する
- [ ] パフォーマンステストが統合される
- [ ] カナリアリリースが可能になる
- [ ] 詳細なデプロイメントメトリクスが収集される
- [ ] 複数環境（staging/prod）対応が完了する

---

## 🚨 トラブルシューティング

### よくある問題と解決方法

#### 1. GitHub Actions で JUnit テストが失敗する
**原因**: PostgreSQL テスト DB の接続問題
```yaml
# 解決方法: services 設定の確認
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_DB: daily_report_tool_test
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
    ports:
      - 5432:5432
```

#### 2. ECR プッシュ時の認証エラー
**原因**: AWS IAM 権限不足
```bash
# 解決方法: IAM ポリシー確認
aws iam list-attached-user-policies --user-name github-actions-user
# ECR アクセス権限が付与されているか確認
```

#### 3. ECS デプロイメントが失敗する
**原因**: タスク定義の設定問題
```bash
# 解決方法: タスク定義の詳細確認
aws ecs describe-task-definition --task-definition daily-report-task
# CPU/Memory、ネットワーク設定を確認
```

#### 4. ヘルスチェックが失敗する
**原因**: アプリケーション起動時間
```yaml
# 解決方法: 待機時間延長
health-check:
  retry-count: 10
  retry-interval: 30  # 30秒間隔
  timeout: 300        # 5分タイムアウト
```

---

## 📊 成功指標

### 定量的指標
- **デプロイ時間**: 30分 → 5分（83%短縮）
- **テスト実行時間**: 10分 → 3分（70%短縮）
- **リリース頻度**: 週1回 → 日複数回
- **障害検出時間**: 本番後 → 開発時（100%前倒し）
- **ロールバック時間**: 30分 → 3分（90%短縮）

### 定性的指標
- **開発者体験**: 手動作業の自動化により集中力向上
- **品質向上**: 自動テスト・品質チェックによる安定性向上  
- **運用効率**: 自動デプロイ・監視による運用負荷軽減
- **セキュリティ**: 継続的セキュリティスキャンによる安全性向上

---

## 📚 参考資料

### 技術ドキュメント
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Spring Boot Testing](https://spring.io/guides/gs/testing-web/)
- [Docker Multi-stage Builds](https://docs.docker.com/develop/dev-best-practices/)

### ベストプラクティス
- [12-Factor App](https://12factor.net/)
- [GitOps Principles](https://www.gitops.tech/)
- [CI/CD Security Best Practices](https://owasp.org/www-project-devsecops-guideline/)

---

## 📞 エスカレーション・サポート

### Phase 1 実装時の連絡先
- **GitHub Actions**: [GitHub Actions サポート](https://support.github.com/)
- **AWS ECS**: [AWS サポート](https://aws.amazon.com/support/)
- **Maven/Spring Boot**: [Spring コミュニティ](https://spring.io/community)

### 緊急時対応
1. **CI/CD パイプライン停止**: 手動デプロイに切り替え
2. **ECS デプロイ失敗**: 前バージョンへのロールバック実施  
3. **ECR アクセス不可**: 既存スクリプト `push-to-ecr.sh` の手動実行

---

---

## 📝 最新更新事項 (2025年9月28日)

### Phase 1 → Phase 2 移行完了
- [x] **Phase 1 完了状況**: CI基盤構築・JaCoCo統合・テスト自動化完成
- [x] **Phase 2 重点化**: AWS CD基盤（ECR/ECS デプロイ）を最優先に変更
- [x] **TestContainers計画**: 統合テスト用PostgreSQL環境の段階的導入計画追加

### 実装優先度の再整理
```yaml
Priority 1 (緊急): AWS CD基盤
  - GitHub Actions CD ワークフロー実装
  - ECR プッシュ自動化
  - ECS デプロイ自動化
  - ヘルスチェック・ロールバック機能

Priority 2 (重要): TestContainers統合テスト
  - PostgreSQL TestContainers 環境
  - 統合テスト用データセット
  - 単体テストは H2 継続（高速性維持）

Priority 3 (推奨): 統合改良
  - 既存スクリプト改良
  - 監視・通知機能強化
```

### 戦略的判断
- **単体テスト**: H2インメモリDB継続（開発効率重視）
- **統合テスト**: TestContainers PostgreSQL導入（品質保証強化）
- **デプロイ**: AWS ECR/ECS自動化を最優先（実用性重視）

---

**最終更新**: 2025年9月28日  
**次回レビュー**: Phase 2 AWS CD基盤完了時