#!/bin/bash

# CI Issues Fix Script
# GitHub ActionsのCIエラーを修正するスクリプト

set -e

# 色付き出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

echo_info "🔧 CI Issues Fix Script 開始..."

# バックエンドディレクトリに移動
cd backend

# ===================================
# Fix 1: コードフォーマット自動修正
# ===================================
echo_info "=== Fix 1: コードフォーマット修正 ==="
if ./mvnw spotless:apply; then
    echo_success "✅ コードフォーマット修正完了"
else
    echo_error "❌ コードフォーマット修正失敗"
fi

# ===================================
# Fix 2: ビルド成果物のクリーンアップ
# ===================================
echo_info "=== Fix 2: ビルド成果物クリーンアップ ==="

# Maven targetディレクトリクリーン（ビルド成果物のみ）
if [ -d "target" ]; then
    rm -rf target
    echo_success "✅ target/ ディレクトリ削除完了"
fi

# 一時ファイル削除（安全なもののみ）
for file in "*.log" "*.tmp" ".DS_Store"; do
    if ls $file 1> /dev/null 2>&1; then
        rm -f $file
        echo_success "✅ $file 削除完了"
    fi
done

# IDE設定ファイルは削除しない（開発者設定保護）
echo_info "💡 IDE設定(.idea/, .vscode/, .settings/)は保護されます"
echo_info "   必要に応じて手動で削除してください"

# ===================================
# Fix 3: 権限設定修正
# ===================================
echo_info "=== Fix 3: 権限設定修正 ==="
chmod +x mvnw
echo_success "✅ mvnw に実行権限付与完了"

# ===================================
# Fix 4: テスト用設定ファイル確認・修正
# ===================================
echo_info "=== Fix 4: テスト設定確認 ==="

# application-test.properties の確認・作成
TEST_PROPS="src/main/resources/application-test.properties"
if [ ! -f "$TEST_PROPS" ]; then
    echo_info "テスト用設定ファイルを作成中..."
    cat > "$TEST_PROPS" << 'EOF'
# Test Environment Configuration
spring.profiles.active=test

# H2 In-Memory Database for Testing
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password

# JPA/Hibernate Configuration
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false
spring.jpa.open-in-view=false

# JWT Configuration (テスト用)
jwt.secret=testSecretKeyForUnitTestsOnly1234567890
jwt.expiration=3600000
jwt.auth.enabled=false

# Debug Configuration
debug.default.user.username=testuser
debug.default.user.role=部下

# Logging Configuration
logging.level.org.springframework.web=WARN
logging.level.org.hibernate=WARN
logging.level.org.springframework.security=WARN
logging.level.com.example.dailyreport=INFO

# Disable security for tests
spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration
EOF
    echo_success "✅ application-test.properties 作成完了"
else
    echo_success "✅ application-test.properties 既存"
fi

# ===================================
# Fix 5: pom.xml の統合テスト設定修正
# ===================================
echo_info "=== Fix 5: 統合テスト設定確認 ==="

# 統合テストファイルが存在するかチェック
if ! find src/test -name "*IntegrationTest.java" | grep -q .; then
    echo_warning "⚠️ 統合テストファイルが存在しません"
    echo_info "💡 統合テストをスキップするよう設定を推奨"
fi

# ===================================
# Fix 6: Checkstyle 設定修正
# ===================================
echo_info "=== Fix 6: Checkstyle 設定確認 ==="

# google_checks.xml が参照できるか確認
if ! ./mvnw checkstyle:checkstyle -q >/dev/null 2>&1; then
    echo_warning "⚠️ Checkstyle 設定に問題がある可能性"
    echo_info "💡 pom.xml の checkstyle 設定を確認推奨"
fi

# ===================================
# Fix 7: 最終確認テスト
# ===================================
echo_info "=== Fix 7: 修正後テスト実行 ==="

# 基本コンパイルテスト
if ./mvnw clean compile -q; then
    echo_success "✅ コンパイル確認 OK"
else
    echo_error "❌ コンパイルエラーが残存"
fi

# テスト実行
if ./mvnw test -q -Dspring.profiles.active=test; then
    echo_success "✅ テスト実行確認 OK"
else
    echo_error "❌ テストエラーが残存"
fi

echo_info "=================================="
echo_success "🎉 CI Issues Fix 完了！"
echo_info "=================================="

echo_info ""
echo_info "📋 修正内容:"
echo_info "  ✅ コードフォーマット修正"
echo_info "  ✅ 不要ファイル削除"
echo_info "  ✅ 権限設定修正"
echo_info "  ✅ テスト設定ファイル確認"
echo_info ""
echo_info "🔧 次のステップ:"
echo_info "  1. ./scripts/quick-check.sh で基本チェック"
echo_info "  2. ./scripts/check-backend-ci.sh で完全チェック"
echo_info "  3. git add . && git commit -m '修正内容' でコミット"