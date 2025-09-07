/// <reference types="vite/client" />

/**
 * Vite 環境変数の型定義
 *
 * import.meta.env でアクセス可能な環境変数に型安全性を提供
 */
interface ImportMetaEnv {
  readonly VITE_USE_REAL_API: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
