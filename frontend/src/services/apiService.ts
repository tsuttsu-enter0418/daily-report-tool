import { mockApi } from "./mockApi";
import type { LoginRequest, LoginResponse } from "../types";

/**
 * APIサービス統合モジュール
 *
 * 機能:
 * - 開発環境でのモックAPI使用
 * - 本番環境での実際のAPI使用
 * - 環境変数による自動切り替え
 * - 型安全なAPIレスポンス処理
 *
 * 使用方法:
 * - 開発: npm run dev (モックAPI)
 * - 開発+実API: npm run dev:api (実際のAPI)
 * - 本番: 常に実際のAPI
 */

// 環境変数から開発モードかどうかを判定
const isDevelopment = import.meta.env.DEV;
const useRealAPI = import.meta.env.VITE_USE_REAL_API === "true";

/**
 * 実際のバックエンドAPIとの通信を担当
 */
const realApi = {
  /**
   * 実際のバックエンドログインAPI呼び出し
   * @param loginData ログイン情報
   * @returns JWT トークンとユーザー情報
   */
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      throw new Error(
        "ログインに失敗しました。ユーザー名またはパスワードが正しくありません。",
      );
    }

    return await response.json();
  },
};

/**
 * フロントエンドアプリケーションのメインAPIサービス
 * 環境に応じてモックAPIまたは実際のAPIを使用
 */
export const apiService = {
  /**
   * ユーザーログイン
   * @param loginData ログイン情報
   * @returns JWT トークンとユーザー情報
   */
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    // 開発環境でかつ実際のAPIを使用しない場合はモックを使用
    if (isDevelopment && !useRealAPI) {
      console.log("🔧 開発モード: モックAPIを使用中");
      return mockApi.login(loginData);
    }

    console.log("🌐 本番モード: 実際のAPIを使用中");
    return realApi.login(loginData);
  },

  /**
   * JWT トークンの有効性検証
   * @param token JWT トークン
   * @returns トークンが有効かどうか
   */
  async validateToken(token: string): Promise<boolean> {
    if (isDevelopment && !useRealAPI) {
      return mockApi.validateToken(token);
    }

    // 実際のトークン検証ロジック
    try {
      const response = await fetch("/api/auth/validate", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};
