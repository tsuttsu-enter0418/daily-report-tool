# Node.js 18を使用（LTS版で安定）
FROM node:18-alpine

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
# 依存関係のキャッシュ効率化のため先にコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# アプリケーションコードを全てコピー
COPY . .

# React開発サーバーのポート3000を公開
EXPOSE 3000

# 開発サーバーを起動
# npm startでReactの開発サーバーが起動
CMD ["npm", "start"]