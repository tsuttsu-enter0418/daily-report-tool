#!/bin/bash

# Quick Backend Check - 基本的なチェックのみ実行
# 時間をかけずに基本的な問題をチェック

set -e

# 色付き出力
RED='\033[0;31m'
GREEN='\033[0;32m'
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

# プロジェクトルートに移動
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT/backend"

echo_info "🚀 Quick Backend Check 開始..."

# エラーカウンター
ERROR_COUNT=0

# 基本コンパイル
echo_info "=== コンパイルチェック ==="
if ./mvnw clean compile -q; then
    echo_success "✅ コンパイル OK"
else
    echo_error "❌ コンパイルエラー"
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

# テスト実行
echo_info "=== テスト実行 ==="
if ./mvnw test -q -Dspring.profiles.active=test; then
    echo_success "✅ テスト OK"
else
    echo_error "❌ テストエラー"
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

# フォーマットチェック
echo_info "=== フォーマットチェック ==="
if ./mvnw spotless:check -q; then
    echo_success "✅ フォーマット OK"
else
    echo_error "❌ フォーマット違反あり"
    echo_info "💡 修正: ./mvnw spotless:apply"
fi

# 結果
if [ $ERROR_COUNT -eq 0 ]; then
    echo_success "🎉 基本チェック全て OK！"
else
    echo_error "❌ $ERROR_COUNT 個のエラーあり"
fi

echo_info ""
echo_info "🔧 コマンド:"
echo_info "  フル CI チェック: ./scripts/check-backend-ci.sh"
echo_info "  フォーマット修正: cd backend && ./mvnw spotless:apply"

exit $ERROR_COUNT