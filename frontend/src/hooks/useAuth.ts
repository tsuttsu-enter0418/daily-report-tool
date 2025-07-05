import { useAtomValue, useSetAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import {
  userAtom,
  isAuthenticatedAtom,
  tokenAtom,
  logoutAtom,
} from "../stores";
import { apiService } from "../services/apiService";
import { Toast } from "../components/atoms";
import { MessageConst } from "../constants/MessageConst";

/**
 * 認証関連の機能を提供するカスタムフック
 *
 * 機能:
 * - ユーザー情報の取得
 * - 認証状態の確認
 * - ログアウト処理
 * - 認証トークンの取得
 *
 * 使用場面:
 * - 認証が必要な画面でのユーザー情報表示
 * - ログアウトボタンの実装
 * - API呼び出し時のトークン取得
 * - 認証状態に応じた画面制御
 */

export type UseAuthReturn = {
  /** 現在のユーザー情報 */
  user: ReturnType<typeof useAtomValue<typeof userAtom>>;
  /** 認証済みかどうか */
  isAuthenticated: boolean;
  /** 認証トークン */
  token: string | null;
  /** ログアウト処理 */
  logout: () => void;
};

/**
 * 認証機能カスタムフック
 *
 * @returns {UseAuthReturn} 認証機能のインターface
 */
export const useAuth = (): UseAuthReturn => {
  const user = useAtomValue(userAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const token = useAtomValue(tokenAtom);
  const performLogout = useSetAtom(logoutAtom);
  const navigate = useNavigate();

  /**
   * ログアウト処理
   *
   * 処理フロー:
   * 1. localStorageから認証トークンを削除
   * 2. Jotai状態管理から認証情報をクリア
   * 3. ログアウト成功のToast表示
   * 4. ログイン画面にリダイレクト
   */
  const logout = (): void => {
    console.log("🚪 ログアウト開始");

    // localStorageから認証トークンを削除
    apiService.removeAuthToken();

    // Jotai状態管理から認証情報をクリア
    performLogout();

    // ログアウト成功のToast表示
    Toast.success({
      title: MessageConst.AUTH.LOGOUT_SUCCESS,
      duration: 2000,
    });

    console.log("✅ ログアウト完了");

    // ログイン画面にリダイレクト
    navigate("/login");
  };

  return {
    user,
    isAuthenticated,
    token,
    logout,
  };
};
