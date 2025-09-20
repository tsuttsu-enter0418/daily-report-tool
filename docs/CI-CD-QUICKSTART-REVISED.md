# CI/CD クイックスタートガイド（修正版）

## 🚀 このファイルの使い方

**目的**: **シンプル構成**で即座にCI/CD実装作業を開始できるクイックリファレンス  
**方針**: 外部サービス依存なし、GitHub Secrets設定不要  
**前提**: [CI-CD-IMPLEMENTATION-PLAN-REVISED.md](./CI-CD-IMPLEMENTATION-PLAN-REVISED.md) を事前に確認済み

---

## 📍 現在の実装状況（2025年9月時点）

### ✅ 完了済み項目
- [x] シンプルなGitHub Actions ワークフローファイル作成済み
  - `.github/workflows/backend-ci-simple.yml` (Phase 1用・シンプル版)
  - `.github/workflows/backend-cd.yml` (Phase 2用・AWS統合版)
- [x] 既存の ECR プッシュスクリプト確認済み
  - `scripts/push-to-ecr.sh` (Phase 2で使用)
- [x] 修正された実装計画書作成済み
  - AWS、SonarQube、Slack依存を除去

### 🔄 次に実装すべき項目
1. **Phase 1**: シンプルCI基盤構築 (推定1週間) ← **GitHub Secrets設定不要**
2. **Phase 2**: AWS統合CD基盤構築 (推定1週間) ← ここで初めてAWS設定
3. **Phase 3**: 高度機能実装 (推定1週間)

---

## ⚡ 即座開始: Phase 1 実装手順（シンプル版）

### ステップ 1: 環境確認・準備 (10分)

```bash
# 1. 作業ディレクトリ移動
cd /Users/tsutsuikouhei/Desktop/Portfolio/daily-report-tool

# 2. 現在のブランチ確認
git status
git branch

# 3. 最新状態に更新
git checkout main
git pull origin main

# 4. 必要なファイル存在確認
ls -la .github/workflows/backend-ci-simple.yml
ls -la docs/CI-CD-IMPLEMENTATION-PLAN-REVISED.md

# 5. Java & Maven バージョン確認
java -version
./backend/mvnw -version
```

### ステップ 2: GitHub Secrets 設定 (スキップ!)

```bash
# 🎉 Phase 1 では GitHub Secrets の設定は完全不要！
echo "✅ GitHub Secrets設定をスキップ"
echo "理由: AWS連携なし、SonarQube使用なし、Slack通知なし"
echo "Phase 2 で初めてAWS認証情報を設定します"
```

### ステップ 3: テスト環境設定 (15分)

```bash
# 1. テスト設定ディレクトリ作成
mkdir -p backend/src/test/resources

# 2. application-test.yml 作成
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
  
  profiles:
    active: test

# JWT 設定（テスト用）
jwt:
  secret: test-secret-key-for-testing-only-minimum-32-chars-required-for-hmac
  expiration: 86400000
  auth:
    enabled: true

# ログ設定（テスト用・簡潔）
logging:
  level:
    com.example.dailyreport: INFO
    org.springframework.security: WARN
    org.hibernate.SQL: WARN

# テスト並行実行設定
junit:
  jupiter:
    execution:
      parallel:
        enabled: true
        mode:
          default: concurrent
EOF

# 3. ローカルテスト実行確認
cd backend
./mvnw test -Dspring.profiles.active=test
RESULT=$?
cd ..

if [ $RESULT -eq 0 ]; then
    echo "✅ ローカルテスト成功"
else
    echo "❌ ローカルテスト失敗 - 修正が必要"
    echo "テスト設定を確認してください"
fi
```

### ステップ 4: Maven設定確認・更新 (20分)

```bash
echo "backend/pom.xml に以下のプラグインが必要です:"
echo "1. maven-surefire-plugin（並行テスト実行）"
echo "2. jacoco-maven-plugin（テストカバレッジ）"
echo "3. maven-checkstyle-plugin（コード品質）"
echo "4. dependency-check-maven（セキュリティスキャン）"
echo ""
echo "詳細設定は docs/CI-CD-IMPLEMENTATION-PLAN-REVISED.md を参照"

# 基本的なプラグインが存在するか確認
grep -q "maven-surefire-plugin" backend/pom.xml && echo "✅ Surefire plugin found" || echo "❌ Surefire plugin missing"
grep -q "jacoco-maven-plugin" backend/pom.xml && echo "✅ JaCoCo plugin found" || echo "❌ JaCoCo plugin missing"
grep -q "maven-checkstyle-plugin" backend/pom.xml && echo "✅ Checkstyle plugin found" || echo "❌ Checkstyle plugin missing"
```

### ステップ 5: CI ワークフロー実装テスト (20分)

```bash
# 1. Phase 1 シンプル版ブランチ作成
git checkout -b feature/ci-pipeline-phase1-simple

# 2. ワークフローファイル確認
echo "作成済みファイル:"
ls -la .github/workflows/backend-ci-simple.yml

# 3. 変更をコミット
git add .github/workflows/backend-ci-simple.yml
git add backend/src/test/resources/application-test.yml
git add docs/CI-CD-IMPLEMENTATION-PLAN-REVISED.md
git add docs/CI-CD-QUICKSTART-REVISED.md

# Maven設定更新した場合のみ
if git diff --cached --name-only | grep -q pom.xml; then
    echo "pom.xml の変更も含めます"
fi

git commit -m "Phase 1: Add simple CI pipeline (no external dependencies)

- Add GitHub Actions CI workflow without AWS/SonarQube/Slack
- Configure PostgreSQL test database integration
- Add JUnit parallel test execution
- Add basic code quality checks (Checkstyle only)
- Add security vulnerability scanning (OWASP only)
- Add Docker build validation (local only)
- No GitHub Secrets required for Phase 1"

# 4. プッシュして PR 作成
git push origin feature/ci-pipeline-phase1-simple

echo ""
echo "🎉 Phase 1 準備完了！"
echo ""
echo "次のステップ:"
echo "1. GitHub で Pull Request を作成"
echo "2. CI ワークフローの自動実行を確認"
echo "3. すべてのチェックが通ることを確認"
echo ""
echo "PR作成URL:"
echo "https://github.com/tsuttsu-enter0418/daily-report-tool/compare/feature/ci-pipeline-phase1-simple"
```

---

## ⚡ 即座開始: Phase 2 実装手順

### Phase 1 完了後の開始手順

```bash
# 1. Phase 1 完了確認
echo "Phase 1 完了チェック:"
echo "✅ シンプルCI ワークフローが正常動作している"
echo "✅ JUnit テストが継続的に成功している"
echo "✅ 基本的なコード品質チェックが通過している"
echo "✅ Docker ビルドが成功している"

# 2. Phase 2 ブランチ作成
git checkout main
git pull origin main
git checkout -b feature/cd-pipeline-phase2

# 3. 🔧 ここで初めて AWS 設定が必要！
echo "⚠️ Phase 2 では AWS 認証情報が必要です"
echo "GitHub Repository Settings → Secrets で以下を設定:"
echo "- AWS_ACCESS_KEY_ID"
echo "- AWS_SECRET_ACCESS_KEY"

# 4. ECR リポジトリ確認・作成
aws ecr describe-repositories --repository-names daily-report-backend --region ap-northeast-1 2>/dev/null || {
    echo "ECR リポジトリを作成します..."
    aws ecr create-repository --repository-name daily-report-backend --region ap-northeast-1
}

# 5. CD ワークフロー確認
cat .github/workflows/backend-cd.yml | head -20
```

---

## 🔍 トラブルシューティング - 即座対応（シンプル版）

### GitHub Actions が実行されない

```bash
# 原因確認手順
echo "1. ワークフローファイルの構文確認:"
cat .github/workflows/backend-ci-simple.yml | grep -E "^name:|^on:|^jobs:"

echo "2. ブランチ・パス設定確認:"
cat .github/workflows/backend-ci-simple.yml | grep -A 5 "on:"

echo "3. ファイル名確認:"
ls -la .github/workflows/backend-ci*
```

### JUnit テスト失敗

```bash
# ローカルテスト実行
cd backend
./mvnw clean test -Dspring.profiles.active=test

# PostgreSQL 接続確認（GitHub Actions Services は自動起動）
echo "テスト DB 設定確認:"
cat src/test/resources/application-test.yml | grep -E "url:|username:|password:"

# テスト結果詳細確認
find target -name "*.txt" -path "*/surefire-reports/*" -exec cat {} \;
```

### Docker ビルド失敗

```bash
# Docker ビルド確認
cd backend
docker build -t daily-report-backend:test .

# ビルドログ詳細確認
docker build --progress=plain --no-cache -t daily-report-backend:test .
```

### コード品質チェック失敗

```bash
# Checkstyle 実行
cd backend
./mvnw checkstyle:check

# 結果確認
cat target/checkstyle-result.xml | grep -E "error|severity"
```

---

## 📊 Phase 1 完了確認コマンド（シンプル版）

```bash
echo "=== Phase 1 完了確認 ==="

# 1. ローカルテスト確認
cd backend
./mvnw test -Dspring.profiles.active=test
TEST_RESULT=$?
cd ..

if [ $TEST_RESULT -eq 0 ]; then
    echo "✅ JUnit テスト正常実行"
else
    echo "❌ JUnit テスト失敗 - 修正が必要"
fi

# 2. Docker ビルド確認
cd backend
docker build -t daily-report-backend:test . > /dev/null 2>&1
DOCKER_RESULT=$?
cd ..

if [ $DOCKER_RESULT -eq 0 ]; then
    echo "✅ Docker ビルド正常実行"
else
    echo "❌ Docker ビルド失敗 - 修正が必要"
fi

# 3. Checkstyle 確認
cd backend
./mvnw checkstyle:check > /dev/null 2>&1
CHECKSTYLE_RESULT=$?
cd ..

if [ $CHECKSTYLE_RESULT -eq 0 ]; then
    echo "✅ Checkstyle チェック通過"
else
    echo "⚠️ Checkstyle 警告あり - 確認推奨"
fi

echo ""
echo "Phase 1 完了条件:"
echo "- CI 実行時間 < 10分"
echo "- テスト成功率 100%"
echo "- Docker ビルド成功"
echo "- 外部サービス依存なし ✅"
```

---

## 📋 Phase 1 のメリット（シンプル版）

### ✅ 即座に得られる効果
- **テスト自動化**: PR作成で自動テスト実行
- **品質保証**: Checkstyle による基本的なコード規約チェック
- **セキュリティ**: OWASP による依存関係脆弱性検出
- **Docker検証**: イメージビルドの自動確認
- **開発効率**: 手動テスト実行からの解放

### ✅ リスク削減効果
- **設定ミスなし**: GitHub Secrets 設定不要
- **外部依存なし**: SonarQube、Slack、AWS 等の障害に影響されない
- **セキュリティリスクなし**: 認証情報の管理不要
- **シンプル**: 理解しやすく、メンテナンス性が高い

### ✅ 段階的実装のメリット
- **学習コスト低**: 1つずつ機能を理解しながら実装
- **デバッグしやすい**: 問題の切り分けが簡単
- **安全**: 一度に多くの変更を行わない

---

## 🔄 Phase 2 への移行タイミング

### Phase 1 が安定してから Phase 2 開始
```bash
# 以下がすべて安定してから Phase 2 開始
echo "Phase 2 開始条件:"
echo "- Phase 1 CI が継続的に成功している"
echo "- チーム全員が Phase 1 の動作を理解している"
echo "- コード品質が安定している"
echo "- AWS 認証情報の準備が完了している"
```

---

**クイックスタート（修正版）最終更新**: 2025年9月20日  
**シンプル化理由**: AWS、SonarQube、Slack連携を除去した段階的実装アプローチ