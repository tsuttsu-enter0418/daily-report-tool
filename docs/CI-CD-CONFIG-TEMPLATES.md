# CI/CD 設定ファイルテンプレート集

## 📋 このファイルの使い方

**目的**: 実装時に必要な設定ファイルのテンプレートを提供  
**使用方法**: 必要な設定をコピー&ペーストして利用  
**更新**: 実装進捗に応じて設定値を調整

---

## 🧪 テスト設定ファイル

### backend/src/test/resources/application-test.yml
```yaml
# Spring Boot テスト環境設定
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
  secret: test-secret-key-for-testing-only-not-for-production-use-32chars-minimum
  expiration: 86400000
  auth:
    enabled: true

# ログ設定（テスト用）
logging:
  level:
    com.example.dailyreport: DEBUG
    org.springframework.security: WARN
    org.hibernate.SQL: WARN
    org.springframework.web: WARN

# テスト高速化設定
junit:
  jupiter:
    execution:
      parallel:
        enabled: true
        mode:
          default: concurrent
        config:
          strategy: dynamic
          factor: 1.0

# Jackson 設定
spring:
  jackson:
    serialization:
      write-dates-as-timestamps: false
    time-zone: Asia/Tokyo
    locale: ja_JP
```

### backend/src/test/resources/logback-test.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!-- コンソール出力設定 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <!-- ログレベル設定 -->
    <logger name="com.example.dailyreport" level="DEBUG" />
    <logger name="org.springframework.security" level="WARN" />
    <logger name="org.hibernate.SQL" level="WARN" />
    <logger name="org.springframework.web" level="WARN" />
    
    <!-- ルートロガー -->
    <root level="INFO">
        <appender-ref ref="CONSOLE" />
    </root>
</configuration>
```

---

## 🏗️ Maven 設定追加

### backend/pom.xml 追加設定
```xml
<!-- プロパティセクションに追加 -->
<properties>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    
    <!-- テスト関連バージョン -->
    <maven-surefire-plugin.version>3.0.0-M9</maven-surefire-plugin.version>
    <maven-failsafe-plugin.version>3.0.0-M9</maven-failsafe-plugin.version>
    <jacoco-maven-plugin.version>0.8.8</jacoco-maven-plugin.version>
    <checkstyle-maven-plugin.version>3.2.0</checkstyle-maven-plugin.version>
</properties>

<!-- プラグインセクションに追加 -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>${maven-surefire-plugin.version}</version>
    <configuration>
        <!-- 並行テスト実行設定 -->
        <parallel>methods</parallel>
        <threadCount>4</threadCount>
        <forkCount>2</forkCount>
        <reuseForks>true</reuseForks>
        
        <!-- メモリ設定 -->
        <argLine>-Xmx1024m -XX:MaxPermSize=256m</argLine>
        
        <!-- テストプロファイル -->
        <systemPropertyVariables>
            <spring.profiles.active>test</spring.profiles.active>
        </systemPropertyVariables>
        
        <!-- テスト結果出力 -->
        <useFile>false</useFile>
        <includes>
            <include>**/*Test.java</include>
            <include>**/*Tests.java</include>
        </includes>
    </configuration>
</plugin>

<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-failsafe-plugin</artifactId>
    <version>${maven-failsafe-plugin.version}</version>
    <configuration>
        <includes>
            <include>**/*IntegrationTest.java</include>
            <include>**/*IT.java</include>
        </includes>
        <systemPropertyVariables>
            <spring.profiles.active>test</spring.profiles.active>
        </systemPropertyVariables>
    </configuration>
    <executions>
        <execution>
            <goals>
                <goal>integration-test</goal>
                <goal>verify</goal>
            </goals>
        </execution>
    </executions>
</plugin>

<!-- JaCoCo テストカバレッジ -->
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>${jacoco-maven-plugin.version}</version>
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
        <execution>
            <id>check</id>
            <goals>
                <goal>check</goal>
            </goals>
            <configuration>
                <rules>
                    <rule>
                        <element>PACKAGE</element>
                        <limits>
                            <limit>
                                <counter>LINE</counter>
                                <value>COVEREDRATIO</value>
                                <minimum>0.80</minimum>
                            </limit>
                        </limits>
                    </rule>
                </rules>
            </configuration>
        </execution>
    </executions>
</plugin>

<!-- Checkstyle コード品質チェック -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-checkstyle-plugin</artifactId>
    <version>${checkstyle-maven-plugin.version}</version>
    <configuration>
        <configLocation>checkstyle.xml</configLocation>
        <encoding>UTF-8</encoding>
        <consoleOutput>true</consoleOutput>
        <failsOnError>true</failsOnError>
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
        <failBuildOnCVSS>7</failBuildOnCVSS>
        <outputDirectory>${project.build.directory}/dependency-check</outputDirectory>
    </configuration>
    <executions>
        <execution>
            <goals>
                <goal>check</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

---

## 🔧 Checkstyle 設定

### backend/checkstyle.xml
```xml
<?xml version="1.0"?>
<!DOCTYPE module PUBLIC
    "-//Puppy Crawl//DTD Check Configuration 1.3//EN"
    "http://www.puppycrawl.com/dtds/configuration_1_3.dtd">

<module name="Checker">
    <property name="charset" value="UTF-8"/>
    <property name="severity" value="warning"/>
    
    <!-- ファイルレベルチェック -->
    <module name="FileTabCharacter">
        <property name="eachLine" value="true"/>
    </module>
    
    <module name="TreeWalker">
        <!-- 命名規則 -->
        <module name="ConstantName"/>
        <module name="LocalFinalVariableName"/>
        <module name="LocalVariableName"/>
        <module name="MemberName"/>
        <module name="MethodName"/>
        <module name="PackageName"/>
        <module name="ParameterName"/>
        <module name="StaticVariableName"/>
        <module name="TypeName"/>
        
        <!-- インポート -->
        <module name="AvoidStarImport"/>
        <module name="IllegalImport"/>
        <module name="RedundantImport"/>
        <module name="UnusedImports"/>
        
        <!-- サイズ制限 -->
        <module name="LineLength">
            <property name="max" value="120"/>
        </module>
        <module name="MethodLength">
            <property name="max" value="100"/>
        </module>
        <module name="ParameterNumber">
            <property name="max" value="7"/>
        </module>
        
        <!-- 空白 -->
        <module name="EmptyForIteratorPad"/>
        <module name="GenericWhitespace"/>
        <module name="MethodParamPad"/>
        <module name="NoWhitespaceAfter"/>
        <module name="NoWhitespaceBefore"/>
        <module name="OperatorWrap"/>
        <module name="ParenPad"/>
        <module name="TypecastParenPad"/>
        <module name="WhitespaceAfter"/>
        <module name="WhitespaceAround"/>
        
        <!-- 修飾子 -->
        <module name="ModifierOrder"/>
        <module name="RedundantModifier"/>
        
        <!-- ブロック -->
        <module name="AvoidNestedBlocks"/>
        <module name="EmptyBlock"/>
        <module name="LeftCurly"/>
        <module name="NeedBraces"/>
        <module name="RightCurly"/>
        
        <!-- 複雑度 -->
        <module name="CyclomaticComplexity">
            <property name="max" value="10"/>
        </module>
        
        <!-- その他 -->
        <module name="EmptyStatement"/>
        <module name="EqualsHashCode"/>
        <module name="HiddenField">
            <property name="ignoreSetter" value="true"/>
            <property name="ignoreConstructorParameter" value="true"/>
        </module>
        <module name="IllegalInstantiation"/>
        <module name="InnerAssignment"/>
        <module name="MissingSwitchDefault"/>
        <module name="SimplifyBooleanExpression"/>
        <module name="SimplifyBooleanReturn"/>
    </module>
</module>
```

---

## 🐳 Docker 設定

### backend/Dockerfile.multi-stage
```dockerfile
# マルチステージビルド用 Dockerfile
# Build Stage
FROM openjdk:17-jdk-slim as builder

WORKDIR /app

# Maven Wrapper と依存関係ファイルをコピー
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# 依存関係のダウンロード（キャッシュ効率化）
RUN ./mvnw dependency:go-offline -B

# ソースコードをコピー
COPY src src

# アプリケーションビルド
RUN ./mvnw clean package -DskipTests -B

# Production Stage
FROM openjdk:17-jre-slim as production

# セキュリティ: 非rootユーザー作成
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# 作業ディレクトリ作成
WORKDIR /app

# JAR ファイルをコピー
COPY --from=builder /app/target/*.jar app.jar

# 権限設定
RUN chown -R appuser:appgroup /app
USER appuser

# ヘルスチェック設定
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# ポート公開
EXPOSE 8080

# JVM 最適化オプション
ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseG1GC -XX:+UseContainerSupport"

# アプリケーション実行
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

---

## 🚀 GitHub Actions 環境変数テンプレート

### .github/workflows/環境変数設定
```yaml
# 共通環境変数
env:
  # Java 設定
  JAVA_VERSION: '17'
  MAVEN_OPTS: '-Xmx3072m'
  
  # AWS 設定
  AWS_REGION: 'ap-northeast-1'
  AWS_ACCOUNT_ID: '691443742677'
  
  # ECR 設定
  ECR_REPOSITORY: 'daily-report-backend'
  
  # ECS 設定
  ECS_CLUSTER: 'daily-report-cluster'
  ECS_SERVICE: 'daily-report-task-service'
  ECS_TASK_DEFINITION: 'daily-report-task'
  
  # アプリケーション設定
  SPRING_PROFILES_ACTIVE: 'production'
  
  # 通知設定
  SLACK_CHANNEL: '#daily-report-tool'
  
  # パフォーマンス設定
  CI_TIMEOUT_MINUTES: 15
  CD_TIMEOUT_MINUTES: 20
  HEALTH_CHECK_TIMEOUT: 300
  HEALTH_CHECK_RETRY: 5
```

---

## 📊 SonarQube 設定

### sonar-project.properties
```properties
# SonarQube プロジェクト設定
sonar.projectKey=daily-report-tool-backend
sonar.projectName=Daily Report Tool Backend
sonar.projectVersion=1.0

# ソースコード設定
sonar.sources=src/main/java
sonar.tests=src/test/java
sonar.java.source=17
sonar.java.target=17

# 除外設定
sonar.exclusions=**/*Application.java,**/*Config.java,**/dto/**,**/entity/**
sonar.test.exclusions=**/*Test.java

# カバレッジ設定
sonar.java.coveragePlugin=jacoco
sonar.jacoco.reportPaths=target/jacoco.exec
sonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml

# 品質ゲート設定
sonar.qualitygate.wait=true

# 言語設定
sonar.sourceEncoding=UTF-8
```

---

## 🔐 セキュリティ設定

### .github/workflows/security-scan.yml
```yaml
# セキュリティスキャン専用ワークフロー
name: Security Scan

on:
  schedule:
    - cron: '0 2 * * 1'  # 毎週月曜日 2:00 AM
  workflow_dispatch:

jobs:
  security-scan:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: './backend'
          format: 'sarif'
          output: 'trivy-results.sarif'
          
      - name: Upload Trivy scan results to GitHub Security tab
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'
          
      - name: OWASP Dependency Check
        working-directory: ./backend
        run: |
          ./mvnw org.owasp:dependency-check-maven:check
          
      - name: Upload OWASP results
        uses: actions/upload-artifact@v4
        with:
          name: owasp-reports
          path: backend/target/dependency-check-report.html
```

---

## 📈 監視・メトリクス設定

### CloudWatch カスタムメトリクス
```bash
# GitHub Actions からの CloudWatch メトリクス送信例
aws cloudwatch put-metric-data \
  --namespace "CICD/Daily-Report-Tool" \
  --metric-data \
    MetricName=DeploymentSuccess,Value=1,Unit=Count,Timestamp=$(date -u +%Y-%m-%dT%H:%M:%S) \
    MetricName=DeploymentDuration,Value=${DEPLOYMENT_DURATION},Unit=Seconds,Timestamp=$(date -u +%Y-%m-%dT%H:%M:%S) \
    MetricName=TestCoverage,Value=${TEST_COVERAGE},Unit=Percent,Timestamp=$(date -u +%Y-%m-%dT%H:%M:%S)
```

### Slack 通知テンプレート
```json
{
  "text": "Daily Report Tool - Deployment Notification",
  "attachments": [
    {
      "color": "good",
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "*🚀 Deployment Successful*\n\n*Repository:* `daily-report-tool`\n*Branch:* `main`\n*Commit:* <${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/commit/${GITHUB_SHA}|`${GITHUB_SHA:0:7}`>\n*Image:* `${ECR_IMAGE_URI}`\n*Duration:* ${DEPLOYMENT_DURATION}s\n\n*View Details:* <${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}|GitHub Actions>"
          }
        }
      ]
    }
  ]
}
```

---

## 🧪 テストデータ設定

### backend/src/test/resources/data.sql
```sql
-- テスト用初期データ
INSERT INTO users (id, username, email, password, role, display_name, supervisor_id, is_active, created_at, updated_at) VALUES
(1, 'admin', 'admin@test.com', '$2a$10$test.hash.for.admin.password', '管理者', '管理者ユーザー', NULL, true, NOW(), NOW()),
(2, 'supervisor', 'supervisor@test.com', '$2a$10$test.hash.for.supervisor.password', '上長', '上長ユーザー', 1, true, NOW(), NOW()),
(3, 'user1', 'user1@test.com', '$2a$10$test.hash.for.user1.password', '部下', '部下ユーザー1', 2, true, NOW(), NOW()),
(4, 'user2', 'user2@test.com', '$2a$10$test.hash.for.user2.password', '部下', '部下ユーザー2', 2, true, NOW(), NOW());

INSERT INTO daily_reports (id, user_id, title, work_content, status, report_date, submitted_at, created_at, updated_at) VALUES
(1, 3, 'テスト日報1', 'テスト作業内容1', 'submitted', CURRENT_DATE, NOW(), NOW(), NOW()),
(2, 3, 'テスト日報2', 'テスト作業内容2', 'draft', CURRENT_DATE - 1, NULL, NOW(), NOW()),
(3, 4, 'テスト日報3', 'テスト作業内容3', 'submitted', CURRENT_DATE, NOW(), NOW(), NOW());
```

---

**設定テンプレート最終更新**: 2025年9月20日  
**関連ドキュメント**: [CI-CD-IMPLEMENTATION-PLAN.md](./CI-CD-IMPLEMENTATION-PLAN.md), [CI-CD-CHECKLIST.md](./CI-CD-CHECKLIST.md)