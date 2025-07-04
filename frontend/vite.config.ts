import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 3000,
    host: "0.0.0.0", // Docker対応
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    // バンドルサイズ最適化
    rollupOptions: {
      output: {
        manualChunks: {
          // ベンダーライブラリを分離
          vendor: ['react', 'react-dom'],
          // ChakraUIを分離
          chakra: ['@chakra-ui/react'],
          // ルーティングライブラリを分離
          router: ['react-router-dom'],
          // 状態管理ライブラリを分離
          state: ['jotai'],
          // その他ユーティリティライブラリ
          utils: ['js-cookie', 'axios', 'react-hook-form', 'yup'],
        },
      },
    },
    // チャンクサイズ警告の閾値を調整
    chunkSizeWarningLimit: 1000,
    // gzip圧縮を有効化
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 本番環境でconsole.logを除去
        drop_debugger: true,
      },
    },
  },
  define: {
    // 環境変数の設定
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
