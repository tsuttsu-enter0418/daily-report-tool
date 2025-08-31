#!/bin/bash

# フロントエンドS3デプロイスクリプト
# 使用方法: ./scripts/deploy-frontend.sh

set -e

# 設定（実際の値に置き換えてください）
BUCKET_NAME="kouhei-portfolio.net"  # 実際のS3バケット名
CLOUDFRONT_DISTRIBUTION_ID="E2WDA103AF64NB"      # CloudFrontディストリビューションID
BUILD_DIR="./frontend/dist"

echo "🚀 フロントエンドデプロイ開始..."

# 1. フロントエンドビルド
echo "📦 フロントエンドビルド中..."
cd frontend
npm install
npm run build:prod
cd ..

# 2. S3アップロード（キャッシュ最適化）
echo "☁️  S3にアップロード中..."

# 静的アセット: 1年キャッシュ（JS/CSS/フォント等）
echo "  📦 静的アセットファイルアップロード（1年キャッシュ）..."
aws s3 sync $BUILD_DIR/assets s3://$BUCKET_NAME/assets --delete \
  --cache-control "max-age=31536000, public, immutable"

# HTMLファイル: 1時間キャッシュ
echo "  📄 HTMLファイルアップロード（1時間キャッシュ）..."
aws s3 sync $BUILD_DIR s3://$BUCKET_NAME --delete \
  --exclude "assets/*" --include "*.html" \
  --cache-control "max-age=3600, public, must-revalidate"

# その他ファイル（favicon.ico, manifest.json等）: 1日キャッシュ  
echo "  🔧 その他ファイルアップロード（1日キャッシュ）..."
aws s3 sync $BUILD_DIR s3://$BUCKET_NAME --delete \
  --exclude "assets/*" --exclude "*.html" \
  --cache-control "max-age=86400, public"

# 3. CloudFrontキャッシュクリア（オプション、コスト発生）
echo "🔄 CloudFrontキャッシュクリア..."
# aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"

echo "✅ デプロイ完了！"
echo "🌐 URL: https://kouhei-portfolio.net"