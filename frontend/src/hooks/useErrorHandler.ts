import { useCallback } from "react";
import { toaster } from "../components/ui/toaster";
import { type ApiError } from "../types";

/**
 * エラーハンドリングカスタムフック
 *
 * 機能:
 * - API エラーの統一的な処理
 * - ユーザーフレンドリーなエラーメッセージ表示
 * - エラーログ記録
 * - 型安全なエラーハンドリング
 *
 * 使用場面:
 * - API呼び出しでのエラー処理
 * - フォーム送信エラー処理
 * - 非同期処理エラー処理
 */

export const useErrorHandler = () => {
  /**
   * APIエラーを処理する
   */
  const handleApiError = useCallback((error: ApiError | Error | unknown) => {
    console.error("API Error:", error);

    if (error && typeof error === "object" && "message" in error) {
      const apiError = error as ApiError;

      // ステータスコードに応じたエラーメッセージ
      switch (apiError.status) {
        case 400:
          toaster.create({
            title: "エラー",
            description: apiError.message || "入力内容に問題があります。",
            type: "error",
            duration: 5000,
          });
          break;
        case 401:
          toaster.create({
            title: "認証エラー",
            description: "ログインが必要です。再度ログインしてください。",
            type: "error",
            duration: 5000,
          });
          break;
        case 403:
          toaster.create({
            title: "権限エラー",
            description: "この操作を行う権限がありません。",
            type: "error",
            duration: 5000,
          });
          break;
        case 404:
          toaster.create({
            title: "データが見つかりません",
            description: "指定されたデータが見つかりません。",
            type: "error",
            duration: 5000,
          });
          break;
        case 500:
          toaster.create({
            title: "サーバーエラー",
            description:
              "サーバーでエラーが発生しました。しばらくしてから再度お試しください。",
            type: "error",
            duration: 5000,
          });
          break;
        default:
          toaster.create({
            title: "エラー",
            description: apiError.message || "予期しないエラーが発生しました。",
            type: "error",
            duration: 5000,
          });
      }
    } else {
      // 不明なエラー
      toaster.create({
        title: "エラー",
        description: "予期しないエラーが発生しました。",
        type: "error",
        duration: 5000,
      });
    }
  }, []);

  /**
   * ネットワークエラーを処理する
   */
  const handleNetworkError = useCallback(() => {
    toaster.create({
      title: "ネットワークエラー",
      description:
        "ネットワークに接続できません。インターネット接続を確認してください。",
      type: "error",
      duration: 5000,
    });
  }, []);

  /**
   * バリデーションエラーを処理する
   */
  const handleValidationError = useCallback((message: string) => {
    toaster.create({
      title: "バリデーションエラー",
      description: message,
      type: "warning",
      duration: 4000,
    });
  }, []);

  /**
   * 成功メッセージを表示する
   */
  const showSuccess = useCallback((message: string) => {
    toaster.create({
      title: "成功",
      description: message,
      type: "success",
      duration: 3000,
    });
  }, []);

  /**
   * 情報メッセージを表示する
   */
  const showInfo = useCallback((message: string) => {
    toaster.create({
      title: "情報",
      description: message,
      type: "info",
      duration: 4000,
    });
  }, []);

  /**
   * 汎用的なエラーハンドリング
   */
  const handleError = useCallback(
    (error: unknown, context?: string) => {
      const errorMessage = context ? `${context}: ${error}` : String(error);
      console.error("Error:", errorMessage);

      // 開発環境でのみ詳細なエラーログ
      if (import.meta.env.DEV) {
        console.error("Error context:", context);
        console.error("Error details:", error);
      }

      if (error && typeof error === "object" && "message" in error) {
        handleApiError(error as ApiError);
      } else {
        toaster.create({
          title: "エラー",
          description: "予期しないエラーが発生しました。",
          type: "error",
          duration: 5000,
        });
      }
    },
    [handleApiError],
  );

  return {
    handleApiError,
    handleNetworkError,
    handleValidationError,
    handleError,
    showSuccess,
    showInfo,
  };
};
