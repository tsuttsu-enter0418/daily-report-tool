/**
 * 状態管理ストア（Jotai Atoms）
 *
 * 特徴:
 * - グローバル状態管理
 * - コンポーネント間でのデータ共有
 * - ローカルストレージとの同期
 * - TypeScript完全対応
 *
 * 使用場面:
 * - ユーザー認証状態
 * - アプリケーション設定
 * - 共有データの管理
 */

export {
  authStateAtom,
  userAtom,
  isAuthenticatedAtom,
  tokenAtom,
  loginAtom,
  logoutAtom,
  updateUserAtom,
} from "./userStore";

export type { AuthState } from "./userStore";
