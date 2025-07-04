import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import type { UserRole } from "../types";

/**
 * ユーザー情報の型定義（状態管理用）
 *
 * 機能:
 * - ログインユーザーの基本情報を管理
 * - 全画面で参照可能な状態管理
 * - ローカルストレージとの同期
 */
export type UserInfo = {
  /** ユーザーID */
  id: string;
  /** ユーザー名 */
  username: string;
  /** メールアドレス */
  email: string;
  /** ユーザー役職 */
  role: UserRole;
  /** 表示名 */
  displayName?: string;
};

/**
 * 認証状態の型定義
 */
export type AuthState = {
  /** 認証済みかどうか */
  isAuthenticated: boolean;
  /** ユーザー情報 */
  user: UserInfo | null;
  /** 認証トークン */
  token: string | null;
};

/**
 * 初期認証状態
 */
const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

/**
 * 認証状態Atom（ローカルストレージ同期）
 *
 * 機能:
 * - ログイン状態の永続化
 * - ページリロード時の状態復元
 * - 自動ログアウト対応
 *
 * 使用場面:
 * - ログイン/ログアウト処理
 * - 認証が必要な画面での状態確認
 * - ユーザー情報の表示
 */
export const authStateAtom = atomWithStorage<AuthState>(
  "authState",
  initialAuthState,
);

/**
 * ユーザー情報取得Atom（読み取り専用）
 *
 * 使用例:
 * const user = useAtomValue(userAtom);
 * console.log(`ようこそ、${user?.username}さん`);
 */
export const userAtom = atom<UserInfo | null>((get) => {
  const authState = get(authStateAtom);
  return authState.user;
});

/**
 * 認証状態取得Atom（読み取り専用）
 *
 * 使用例:
 * const isAuthenticated = useAtomValue(isAuthenticatedAtom);
 * if (!isAuthenticated) return <LoginPage />;
 */
export const isAuthenticatedAtom = atom<boolean>((get) => {
  const authState = get(authStateAtom);
  return authState.isAuthenticated;
});

/**
 * 認証トークン取得Atom（読み取り専用）
 *
 * 使用例:
 * const token = useAtomValue(tokenAtom);
 * // API呼び出し時にヘッダーに設定
 */
export const tokenAtom = atom<string | null>((get) => {
  const authState = get(authStateAtom);
  return authState.token;
});

/**
 * ログインアクションAtom（書き込み専用）
 *
 * 機能:
 * - ユーザー情報とトークンを状態に保存
 * - 認証状態をtrueに設定
 * - ローカルストレージに自動保存
 *
 * 使用例:
 * const login = useSetAtom(loginAtom);
 * await login({ user: userInfo, token: "jwt-token" });
 */
export const loginAtom = atom(
  null,
  (_get, set, { user, token }: { user: UserInfo; token: string }) => {
    set(authStateAtom, {
      isAuthenticated: true,
      user,
      token,
    });
  },
);

/**
 * ログアウトアクションAtom（書き込み専用）
 *
 * 機能:
 * - 認証状態を初期化
 * - ローカルストレージをクリア
 * - Cookie削除は呼び出し元で実行
 *
 * 使用例:
 * const logout = useSetAtom(logoutAtom);
 * logout();
 */
export const logoutAtom = atom(null, (_get, set) => {
  set(authStateAtom, initialAuthState);
});

/**
 * ユーザー情報更新Atom（書き込み専用）
 *
 * 機能:
 * - 部分的なユーザー情報更新
 * - 認証状態は維持
 *
 * 使用例:
 * const updateUser = useSetAtom(updateUserAtom);
 * updateUser({ displayName: "新しい表示名" });
 */
export const updateUserAtom = atom(
  null,
  (get, set, userUpdate: Partial<UserInfo>) => {
    const currentState = get(authStateAtom);
    if (currentState.user) {
      set(authStateAtom, {
        ...currentState,
        user: {
          ...currentState.user,
          ...userUpdate,
        },
      });
    }
  },
);
