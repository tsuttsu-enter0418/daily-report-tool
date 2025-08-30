import { toaster } from "../ui/toaster";

/**
 * カスタムToastユーティリティ (Atom)
 *
 * 機能:
 * - ChakraUI v3.2対応のToastラッパー
 * - 統一されたToast表示設定
 * - タイプ別の適切なduration設定
 * - プロジェクト標準のToast管理
 *
 * 使用場面:
 * - 成功メッセージ表示
 * - エラーメッセージ表示
 * - 情報メッセージ表示
 * - 警告メッセージ表示
 */

export type ToastOptions = {
  /** タイトル */
  title: string;
  /** 説明文 */
  description?: string;
  /** 表示継続時間（ミリ秒）*/
  duration?: number;
  /** クローズ可能かどうか */
  isClosable?: boolean;
};

/**
 * Toastタイプ別のデフォルト設定
 */
const getToastDefaults = (type: "success" | "error" | "warning" | "info") => {
  switch (type) {
    case "success":
      return { duration: 3000, isClosable: true };
    case "error":
      return { duration: 5000, isClosable: true };
    case "warning":
      return { duration: 4000, isClosable: true };
    case "info":
      return { duration: 3000, isClosable: true };
    default:
      return { duration: 3000, isClosable: true };
  }
};

/**
 * カスタムToastオブジェクト
 */
export const Toast = {
  /**
   * 成功メッセージを表示
   */
  success: (options: ToastOptions) => {
    const defaults = getToastDefaults("success");
    toaster.create({
      type: "success",
      ...defaults,
      ...options,
    });
  },

  /**
   * エラーメッセージを表示
   */
  error: (options: ToastOptions) => {
    const defaults = getToastDefaults("error");
    toaster.create({
      type: "error",
      ...defaults,
      ...options,
    });
  },

  /**
   * 警告メッセージを表示
   */
  warning: (options: ToastOptions) => {
    const defaults = getToastDefaults("warning");
    toaster.create({
      type: "warning",
      ...defaults,
      ...options,
    });
  },

  /**
   * 情報メッセージを表示
   */
  info: (options: ToastOptions) => {
    const defaults = getToastDefaults("info");
    toaster.create({
      type: "info",
      ...defaults,
      ...options,
    });
  },

  /**
   * カスタムToastを表示
   */
  custom: (type: "success" | "error" | "warning" | "info", options: ToastOptions) => {
    const defaults = getToastDefaults(type);
    toaster.create({
      type,
      ...defaults,
      ...options,
    });
  },
};
