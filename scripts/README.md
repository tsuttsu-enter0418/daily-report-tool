# Backend CI Scripts

GitHub ActionsのCIエラーをローカルで事前チェック・修正するスクリプト集です。

## 📋 利用可能なスクリプト

### 1. `fix-ci-issues.sh` - CI問題修正
```bash
./scripts/fix-ci-issues.sh
```
**用途**: GitHub ActionsのCIエラーを自動修正
- コードフォーマット修正
- 不要ファイル削除
- 権限設定修正
- テスト設定ファイル作成

### 2. `quick-check.sh` - 基本チェック
```bash
./scripts/quick-check.sh
```
**用途**: 高速な基本チェック（2-3分）
- コンパイル確認
- 単体テスト実行
- フォーマットチェック

### 3. `check-backend-ci.sh` - 完全CIチェック
```bash
./scripts/check-backend-ci.sh
```
**用途**: GitHub Actionsと同等の完全チェック（10-15分）
- 全てのビルド段階を実行
- セキュリティスキャン
- カバレッジレポート生成
- Docker ビルドテスト

## 🚀 推奨ワークフロー

### 日常開発時
```bash
# 1. 開発後の基本チェック
./scripts/quick-check.sh

# 2. エラーがある場合は修正
cd backend && ./mvnw spotless:apply
```

### Push前の完全チェック
```bash
# 1. CI問題を事前修正
./scripts/fix-ci-issues.sh

# 2. 完全CIチェック実行
./scripts/check-backend-ci.sh

# 3. 問題なければコミット・プッシュ
git add .
git commit -m "機能追加・修正内容"
git push
```

### GitHub Actions CI エラー解決
```bash
# 1. 修正スクリプト実行
./scripts/fix-ci-issues.sh

# 2. ローカルで完全チェック
./scripts/check-backend-ci.sh

# 3. 修正をコミット
git add .
git commit -m "CI エラー修正"
git push
```

## 📊 生成されるレポート

実行後、以下のレポートが生成されます：
- **カバレッジレポート**: `backend/target/site/jacoco/index.html`
- **セキュリティレポート**: `backend/target/dependency-check/dependency-check-report.html`
- **Checkstyle レポート**: `backend/target/checkstyle-result.xml`

## 🔧 トラブルシューティング

### よくあるエラー

**コンパイルエラー**
```bash
cd backend && ./mvnw clean compile
```

**フォーマットエラー**
```bash
cd backend && ./mvnw spotless:apply
```

**テストエラー**
```bash
cd backend && ./mvnw test -Dspring.profiles.active=test
```

**Docker エラー**
```bash
# Docker デーモン起動確認
docker info
```

### 権限エラーが発生した場合
```bash
chmod +x scripts/*.sh
```

## 💡 Tips

- **時短**: `quick-check.sh` で日常的にチェック
- **完全**: `check-backend-ci.sh` でプッシュ前確認
- **修正**: `fix-ci-issues.sh` でエラー一括修正
- **並行**: 複数ターミナルで並行実行も可能