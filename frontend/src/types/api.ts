/**
 * API関連の型定義
 * 
 * 機能:
 * - APIレスポンスの型安全性確保
 * - フロントエンド/バックエンド間の型統一
 * - TypeScript厳密チェック対応
 * - type使用による型合成の柔軟性向上
 * 
 * 使用場面:
 * - APIサービス層での型定義
 * - コンポーネントでのAPIデータ利用
 * - モックAPIとの型統一
 * 
 * 設計方針:
 * - interfaceではなくtypeを使用
 * - 型合成やユニオン型の活用
 * - プリミティブ型の明確な定義
 */

/**
 * ログインリクエストの型定義
 */
export type LoginRequest = {
  username: string;
  password: string;
};

/**
 * ログインレスポンスの型定義
 * バックエンドAPIとモックAPIで共通使用
 */
export type LoginResponse = {
  /** JWT認証トークン */
  token: string;
  /** ユーザーID */
  id: string;
  /** ユーザー名 */
  username: string;
  /** メールアドレス */
  email: string;
  /** ユーザー役職 */
  role: string;
  /** 表示名 */
  displayName?: string;
};

/**
 * APIエラーレスポンスの型定義
 */
export type ApiError = {
  message: string;
  status?: number;
  code?: string;
};

/**
 * ユーザー役職の型定義
 */
export type UserRole = "管理者" | "上長" | "部下";

/**
 * ユーザー情報の型定義（詳細版）
 */
export type UserInfo = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  displayName?: string;
  createdAt?: string;
  updatedAt?: string;
};