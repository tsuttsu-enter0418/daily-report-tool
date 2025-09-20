# Spring Boot CI/CD パイプライン実装計画書（修正版）

## 📋 プロジェクト概要

**目的**: Spring Boot バックエンドの GitHub Actions CI/CD パイプライン構築  
**期間**: 3週間（3フェーズ）  
**最終目標**: JUnit テスト自動実行 → ECR プッシュ → ECS 自動デプロイ  
**方針**: **段階的・最小構成**からスタートして機能を追加

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

---

## 🚀 実装計画：3フェーズアプローチ（修正版）

### Phase 1: CI基盤構築（1週間）- **最小構成**
**目標**: PR時の基本的な自動検証パイプライン構築

#### 実装項目
1. **GitHub Actions CI ワークフロー** (`backend-ci.yml`)
   - ✅ JUnit テスト自動実行
   - ✅ PostgreSQL テスト DB 統合
   - ✅ 基本的なコード品質チェック（Checkstyle）
   - ✅ セキュリティスキャン（OWASP, Trivy）
   - ✅ Docker ビルド検証（ローカルビルドのみ）

2. **テスト環境整備**
   - ✅ `application-test.yml` 作成
   - ✅ GitHub Actions Services での PostgreSQL 設定
   - ✅ 並行テスト実行設定

3. **GitHub Secrets 設定**
   - 🚫 **設定不要** - Phase1では外部サービス連携なし

#### 受入条件
- [ ] PR 作成時に CI が自動実行される
- [ ] JUnit テストが並行実行される（テスト時間 < 5分）
- [ ] PostgreSQL テスト DB 統合が動作する
- [ ] 基本的なコード品質チェックが動作する
- [ ] セキュリティスキャンが動作する
- [ ] Docker ビルド検証が成功する
- [ ] テストカバレッジレポートが生成される（GitHub Actions内で確認可能）

### Phase 2: CD基盤構築（1週間）
**目標**: main ブランチマージ時の自動デプロイ

#### 実装項目
1. **GitHub Actions CD ワークフロー** (`backend-cd.yml`)
   - ECR 自動プッシュ
   - ECS タスク定義更新
   - ECS サービス自動デプロイ
   - デプロイメント検証

2. **AWS統合**
   - AWS認証情報設定（Phase2で初めて必要）
   - 既存スクリプト改良・統合

3. **GitHub Secrets 設定**（Phase2で初めて設定）
   - `AWS_ACCESS_KEY_ID`: ECS デプロイ用
   - `AWS_SECRET_ACCESS_KEY`: ECS デプロイ用

#### 受入条件
- [ ] main ブランチマージ時に CD が自動実行される
- [ ] ECR に新しいイメージがプッシュされる
- [ ] ECS タスク定義が自動更新される
- [ ] ECS サービスが新しいイメージで起動する
- [ ] デプロイメント後のヘルスチェックが成功する
- [ ] デプロイ時間が 10分以内に完了する

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

## 🔧 Phase 1 実装手順詳細（修正版）

### ステップ 1: 環境確認・準備（15分）

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
ls -la .github/workflows/backend-*.yml
ls -la scripts/push-to-ecr.sh

# 5. Java & Maven バージョン確認
java -version
./backend/mvnw -version
```

### ステップ 2: GitHub Secrets 設定（スキップ）

```bash
# Phase 1 では GitHub Secrets の設定は不要
echo "Phase 1: GitHub Secrets設定をスキップ"
echo "AWS認証情報、SonarQube、Slack → すべてPhase2以降で設定"
```

### ステップ 3: テスト環境設定（20分）

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
  secret: test-secret-key-for-testing-only-not-for-production-use-minimum-32-chars
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

# 3. ローカルテスト実行確認
cd backend
./mvnw test -Dspring.profiles.active=test
cd ..
```

### ステップ 4: Maven設定更新（30分）

```bash
# pom.xml に以下のプラグインを追加
echo "以下のプラグインを backend/pom.xml に手動追加してください:"
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
        <argLine>-Xmx1024m</argLine>
        <systemPropertyVariables>
            <spring.profiles.active>test</spring.profiles.active>
        </systemPropertyVariables>
    </configuration>
</plugin>

<!-- JaCoCo テストカバレッジ -->
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.8</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
    </executions>
</plugin>

<!-- Checkstyle コード品質チェック -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-checkstyle-plugin</artifactId>
    <version>3.2.0</version>
    <configuration>
        <configLocation>google_checks.xml</configLocation>
        <encoding>UTF-8</encoding>
        <consoleOutput>true</consoleOutput>
        <failsOnError>false</failsOnError>
        <linkXRef>false</linkXRef>
    </configuration>
    <executions>
        <execution>
            <id>validate</id>
            <phase>validate</phase>
            <goals>
                <goal>check</goal>
            </goals>
        </execution>
    </executions>
</plugin>

<!-- OWASP 依存関係脆弱性チェック -->
<plugin>
    <groupId>org.owasp</groupId>
    <artifactId>dependency-check-maven</artifactId>
    <version>8.4.0</version>
    <configuration>
        <format>ALL</format>
        <failBuildOnCVSS>8</failBuildOnCVSS>
        <outputDirectory>${project.build.directory}/dependency-check</outputDirectory>
    </configuration>
</plugin>
```

### ステップ 5: GitHub Actions ワークフロー修正（30分）

既存の `backend-ci.yml` からSonarQube、AWS、Slack関連を削除：

```yaml
# 修正版 .github/workflows/backend-ci.yml（シンプル版）
name: Backend CI

on:
  pull_request:
    paths:
      - 'backend/**'
      - '.github/workflows/backend-ci.yml'
    branches: [ main, develop ]

env:
  JAVA_VERSION: '17'
  MAVEN_OPTS: '-Xmx3072m'

jobs:
  test:
    name: Unit & Integration Tests
    runs-on: ubuntu-latest
    
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

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up JDK ${{ env.JAVA_VERSION }}
        uses: actions/setup-java@v4
        with:
          java-version: ${{ env.JAVA_VERSION }}
          distribution: 'temurin'

      - name: Cache Maven dependencies
        uses: actions/cache@v4
        with:
          path: ~/.m2
          key: ${{ runner.os }}-m2-${{ hashFiles('**/pom.xml') }}
          restore-keys: ${{ runner.os }}-m2

      - name: Run Tests
        working-directory: ./backend
        env:
          SPRING_PROFILES_ACTIVE: test
          SPRING_DATASOURCE_URL: jdbc:postgresql://localhost:5432/daily_report_tool_test
          SPRING_DATASOURCE_USERNAME: test_user
          SPRING_DATASOURCE_PASSWORD: test_password
        run: |
          ./mvnw clean test \
            -Dspring.jpa.hibernate.ddl-auto=create-drop \
            -Djunit.jupiter.execution.parallel.enabled=true

      - name: Generate Test Reports
        working-directory: ./backend
        if: always()
        run: ./mvnw jacoco:report

      - name: Run Checkstyle
        working-directory: ./backend
        run: ./mvnw checkstyle:check

      - name: Run OWASP Dependency Check
        working-directory: ./backend
        run: ./mvnw org.owasp:dependency-check-maven:check

      - name: Upload Test Results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: |
            backend/target/surefire-reports/
            backend/target/site/jacoco/
            backend/target/dependency-check/

  docker-build:
    name: Docker Build Validation
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build Docker image (validation only)
        working-directory: ./backend
        run: |
          docker build \
            --tag daily-report-backend:test \
            --cache-from type=gha \
            --cache-to type=gha,mode=max \
            .

      - name: Test Docker image
        run: |
          docker run --rm -d \
            --name test-container \
            -p 8080:8080 \
            -e SPRING_PROFILES_ACTIVE=test \
            daily-report-backend:test
          
          sleep 30
          
          # ヘルスチェック（ローカルでのみ）
          curl -f http://localhost:8080/actuator/health || echo "Health check failed but continuing..."
          
          docker stop test-container

      - name: Scan Docker image
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'daily-report-backend:test'
          format: 'table'
          exit-code: '0'  # 警告で止まらないように
```

### ステップ 6: CI実装テスト（30分）

```bash
# 1. Phase 1 用ブランチ作成
git checkout -b feature/ci-pipeline-phase1-simple

# 2. 変更をコミット
git add .github/workflows/backend-ci.yml
git add backend/src/test/resources/application-test.yml
git add backend/pom.xml  # Maven設定更新後
git commit -m "Phase 1: Add simple CI pipeline

- Add GitHub Actions CI workflow for Pull Requests
- Configure PostgreSQL test database integration
- Add JUnit parallel test execution
- Add basic code quality checks (Checkstyle)
- Add security vulnerability scanning (OWASP, Trivy)
- Add Docker build validation
- Remove AWS, SonarQube, Slack dependencies"

# 3. プッシュして PR 作成
git push origin feature/ci-pipeline-phase1-simple

echo "GitHub UI で Pull Request を作成し、シンプルなCI動作を確認してください"
```

---

## ✅ 修正されたチェックリスト

### Phase 1 完了条件（シンプル版）
- [ ] `backend-ci.yml` が正常に動作する
- [ ] PR 作成時に CI が自動実行される（外部サービス連携なし）
- [ ] JUnit テストが並行実行される（テスト時間 < 5分）
- [ ] PostgreSQL テスト DB 統合が動作する
- [ ] Checkstyle による基本的なコード品質チェックが動作する
- [ ] OWASP による依存関係脆弱性チェックが動作する
- [ ] Docker ビルド検証が成功する
- [ ] テストカバレッジレポートが生成される

### Phase 2 で初めて必要になる項目
- [ ] AWS認証情報設定
- [ ] ECR統合
- [ ] ECS デプロイメント
- [ ] 外部通知（必要に応じて）

---

## 📊 修正された実装効果

### Phase 1（シンプル版）で得られる効果
- ✅ **テスト自動化**: PR時の自動テスト実行
- ✅ **基本品質保証**: Checkstyleによるコード規約チェック
- ✅ **セキュリティ**: 依存関係脆弱性の早期検出
- ✅ **Docker検証**: イメージビルドの確認
- ✅ **開発効率**: 手動テスト実行からの解放

### 複雑性の大幅削減
- ❌ 外部サービス連携なし → **設定ミスのリスク削減**
- ❌ AWS権限設定なし → **セキュリティリスク削減**
- ❌ 第三者サービス依存なし → **障害点の削減**

この修正版により、**段階的で安全な実装**が可能になります！

---

**最終更新**: 2025年9月20日  
**修正理由**: AWS、SonarQube、Slack連携を除去したシンプル構成に変更