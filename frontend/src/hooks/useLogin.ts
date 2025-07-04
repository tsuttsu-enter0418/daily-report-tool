import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSetAtom } from "jotai";
import Cookies from "js-cookie";
import { apiService } from "../services/apiService";
import { MessageConst } from "../constants/MessageConst";
import { loginAtom } from "../stores";
import { useErrorHandler } from "./useErrorHandler";
import type { LoginRequest, UserRole } from "../types";

/**
 * ログイン機能を管理するカスタムフック
 *
 * 機能:
 * - ログイン処理の実行
 * - ローディング状態の管理
 * - エラーハンドリング
 * - 成功時のリダイレクト
 * - Toastメッセージ表示
 *
 * 責務:
 * - UIとロジックの分離
 * - 認証状態の管理
 * - API通信の抽象化
 * - メッセージ表示の統一化
 */

export type LoginFormData = LoginRequest;

export type UseLoginReturn = {
  /** ローディング状態 */
  isLoading: boolean;
  /** ログイン処理実行関数 */
  login: (data: LoginFormData) => Promise<void>;
};

/**
 * ログイン機能カスタムフック
 *
 * @returns {UseLoginReturn} ログイン機能のインターface
 */
export const useLogin = (): UseLoginReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useSetAtom(loginAtom);
  const { handleError, showSuccess } = useErrorHandler();

  /**
   * ログイン処理
   *
   * 処理フロー:
   * 1. ローディング状態をONに設定
   * 2. APIサービス経由でログイン認証
   * 3. 成功時: JWT トークンをCookieに保存
   * 4. 成功時: ユーザー情報をJotai状態管理に保存
   * 5. 成功Toast表示後、ホーム画面へリダイレクト
   * 6. 失敗時: エラーToastを表示（画面遷移なし）
   * 7. 最終的にローディング状態をOFFに設定
   *
   * @param data - ログインフォームデータ
   */
  const performLogin = async (data: LoginFormData): Promise<void> => {
    setIsLoading(true);

    try {
      const result = await apiService.login(data);

      // JWT トークンをCookieに保存（1日間有効）
      Cookies.set("authToken", result.token, { expires: 1 });

      // ユーザー情報をJotai状態管理に保存
      login({
        user: {
          id: result.id || "1",
          username: result.username,
          email: result.email || "",
          role: (result.role as UserRole) || "部下",
          displayName: result.displayName || result.username,
        },
        token: result.token,
      });

      // 成功時のToast表示
      showSuccess(
        MessageConst.AUTH.LOGIN_SUCCESS_DESCRIPTION(result.username)
      );

      // Toastを見せるために少し遅れてリダイレクト
      setTimeout(() => {
        navigate("/home");
      }, 500);
    } catch (err) {
      // エラーハンドリング
      handleError(err, 'ログイン処理');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    login: performLogin,
  };
};
