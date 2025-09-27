#!/bin/bash

# Backend CI Check Script - Local Version
# GitHub Actionsと同じ処理をローカルで段階的に実行

set -e  # エラー時に停止

# 色付き出力用の関数
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

echo_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# プロジェクトルートに移動
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo_info "Backend CI チェック開始..."
echo_info "プロジェクトディレクトリ: $(pwd)"

# バックエンドディレクトリに移動
cd backend

# エラーカウンター
ERROR_COUNT=0

# ===================================
# Step 1: 基本ビルド確認
# ===================================
echo_info "=== Step 1: Clean & Compile ==="
if ./mvnw clean compile; then
    echo_success "✅ コンパイル成功"
else
    echo_error "❌ コンパイル失敗"
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

# ===================================
# Step 2: Validation
# ===================================
echo_info "=== Step 2: Maven Validate ==="
if ./mvnw validate; then
    echo_success "✅ Maven Validate 成功"
else
    echo_error "❌ Maven Validate 失敗"
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

# ===================================
# Step 3: Unit Tests
# ===================================
echo_info "=== Step 3: Unit Tests ==="
echo_info "単体テスト実行中..."
if ./mvnw test \
    -Dspring.profiles.active=test \
    -Dspring.jpa.hibernate.ddl-auto=create-drop \
    -Djunit.jupiter.execution.parallel.enabled=true \
    -Djunit.jupiter.execution.parallel.mode.default=concurrent; then
    echo_success "✅ 単体テスト成功"
else
    echo_error "❌ 単体テスト失敗"
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

# ===================================
# Step 4: JaCoCo Coverage Report
# ===================================
echo_info "=== Step 4: Test Coverage Report ==="
if ./mvnw jacoco:report; then
    echo_success "✅ カバレッジレポート生成成功"
    if [ -f "target/site/jacoco/index.html" ]; then
        echo_info "📊 カバレッジレポート: backend/target/site/jacoco/index.html"
    fi
else
    echo_error "❌ カバレッジレポート生成失敗"
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

# ===================================
# Step 5: Integration Tests (Optional)
# ===================================
echo_info "=== Step 5: Integration Tests ==="
# 統合テストファイルが存在するかチェック
if find src/test -name "*IntegrationTest.java" | grep -q .; then
    echo_info "統合テストファイルが見つかりました。実行中..."
    if ./mvnw verify \
        -Dspring.profiles.active=test \
        -Dspring.jpa.hibernate.ddl-auto=create-drop \
        -Dtest=**/*IntegrationTest; then
        echo_success "✅ 統合テスト成功"
    else
        echo_error "❌ 統合テスト失敗"
        ERROR_COUNT=$((ERROR_COUNT + 1))
    fi
else
    echo_warning "⚠️ 統合テストファイルが見つかりませんでした（スキップ）"
fi

# ===================================
# Step 6: Checkstyle Check
# ===================================
echo_info "=== Step 6: Checkstyle Check ==="
if ./mvnw checkstyle:check; then
    echo_success "✅ Checkstyle チェック成功"
else
    echo_warning "⚠️ Checkstyle チェック失敗（継続）"
    echo_info "💡 修正方法: ./mvnw spotless:apply でフォーマット自動修正"
    # Checkstyleは警告として扱う（CIでもfailsOnError=false）
fi

# ===================================
# Step 7: Code Formatting Check
# ===================================
echo_info "=== Step 7: Code Formatting Check ==="
if ./mvnw spotless:check; then
    echo_success "✅ コードフォーマットチェック成功"
else
    echo_warning "⚠️ コードフォーマット違反があります"
    echo_info "💡 修正方法: ./mvnw spotless:apply"
    # フォーマットも警告として扱う
fi

# ===================================
# Step 8: Security Scan (OWASP)
# ===================================
echo_info "=== Step 8: Security Vulnerability Scan ==="
echo_info "⏳ OWASP Dependency Check実行中（時間がかかります）..."
if timeout 300 ./mvnw org.owasp:dependency-check-maven:check; then
    echo_success "✅ セキュリティスキャン成功"
    if [ -f "target/dependency-check/dependency-check-report.html" ]; then
        echo_info "📋 セキュリティレポート: backend/target/dependency-check/dependency-check-report.html"
    fi
else
    echo_warning "⚠️ セキュリティスキャンでタイムアウトまたは脆弱性を検出"
    echo_info "💡 詳細は target/dependency-check/ を確認してください"
fi

# ===================================
# Step 9: Package Build
# ===================================
echo_info "=== Step 9: Package Build ==="
if ./mvnw package -DskipTests; then
    echo_success "✅ JAR パッケージング成功"
    if [ -f "target/daily-report-tool-0.0.1-SNAPSHOT.jar" ]; then
        echo_info "📦 JAR ファイル: backend/target/daily-report-tool-0.0.1-SNAPSHOT.jar"
    fi
else
    echo_error "❌ JAR パッケージング失敗"
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

# ===================================
# Step 10: Docker Build Test
# ===================================
echo_info "=== Step 10: Docker Build Test ==="
if command -v docker >/dev/null 2>&1; then
    if docker build -t daily-report-backend-test .; then
        echo_success "✅ Docker ビルド成功"
        # テスト用イメージを削除
        docker rmi daily-report-backend-test >/dev/null 2>&1
    else
        echo_error "❌ Docker ビルド失敗"
        ERROR_COUNT=$((ERROR_COUNT + 1))
    fi
else
    echo_warning "⚠️ Docker が見つかりません（スキップ）"
fi

# ===================================
# 結果サマリー
# ===================================
echo_info "=================================="
echo_info "CI チェック結果サマリー"
echo_info "=================================="

if [ $ERROR_COUNT -eq 0 ]; then
    echo_success "🎉 全ての重要なチェックが成功しました！"
    echo_success "✅ GitHub Actions CI も成功する可能性が高いです"
else
    echo_error "❌ $ERROR_COUNT 個の重要なエラーがあります"
    echo_error "🔧 これらのエラーを修正してからpushしてください"
fi

# 追加情報
echo_info ""
echo_info "📁 生成されたレポートファイル:"
[ -f "target/site/jacoco/index.html" ] && echo_info "  - カバレッジ: backend/target/site/jacoco/index.html"
[ -f "target/dependency-check/dependency-check-report.html" ] && echo_info "  - セキュリティ: backend/target/dependency-check/dependency-check-report.html"
[ -f "target/checkstyle-result.xml" ] && echo_info "  - Checkstyle: backend/target/checkstyle-result.xml"

echo_info ""
echo_info "🔧 よく使うコマンド:"
echo_info "  - コードフォーマット修正: ./mvnw spotless:apply"
echo_info "  - テストのみ実行: ./mvnw test"
echo_info "  - カバレッジ表示: open backend/target/site/jacoco/index.html"

exit $ERROR_COUNT