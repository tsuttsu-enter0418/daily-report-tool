import { toaster } from "@/components/ui/toaster";
import { useCallback } from "react";

/**
 * カスタムToastフック
 *
 * 機能:
 * - API操作結果の統一されたToast通知
 * - 成功・エラー・警告・情報の4つのステータス対応
 * - アクセシビリティ対応
 * - 一貫したスタイリング
 *
 * 使用場面:
 * - API操作後のフィードバック
 * - ユーザーアクションの結果通知
 * - エラーメッセージの表示
 */

/**
 * Toast通知の種類
 */
export type ToastType = "success" | "error" | "warning" | "info";

/**
 * Toast通知のオプション
 */
type ToastOptions = {
  /** タイトル */
  title: string;
  /** 説明（オプション） */
  description?: string;
  /** 表示時間（デフォルト: 5000ms） */
  duration?: number;
  /** 閉じるボタンの表示（デフォルト: true） */
  isClosable?: boolean;
  /** 位置（デフォルト: "top-right"） */
  position?: "top" | "top-left" | "top-right" | "bottom" | "bottom-left" | "bottom-right";
};

/**
 * カスタムToastフック
 */
export const useToast = () => {
  // const chakraToast = Toaster();

  // Toast表示の共通処理
  const showToast = useCallback((type: ToastType, options: ToastOptions) => {
    const { title, description, duration = 5000, isClosable = true } = options;

    toaster.create({
      title,
      description,
      type,
      duration,
      closable: isClosable,
    });
  }, []);

  // 成功Toast
  const showSuccess = useCallback(
    (title: string, description?: string) => {
      showToast("success", { title, description });
    },
    [showToast],
  );

  // エラーToast
  const showError = useCallback(
    (title: string, description?: string) => {
      showToast("error", {
        title,
        description,
        duration: 7000, // エラーは少し長めに表示
      });
    },
    [showToast],
  );

  // 警告Toast
  const showWarning = useCallback(
    (title: string, description?: string) => {
      showToast("warning", { title, description });
    },
    [showToast],
  );

  // 情報Toast
  const showInfo = useCallback(
    (title: string, description?: string) => {
      showToast("info", { title, description });
    },
    [showToast],
  );

  // API操作用の便利メソッド
  const apiOperations = {
    // 作成成功
    created: useCallback(
      (resourceName: string = "データ") => {
        showSuccess(`${resourceName}を作成しました`, "正常に保存されました");
      },
      [showSuccess],
    ),

    // 更新成功
    updated: useCallback(
      (resourceName: string = "データ") => {
        showSuccess(`${resourceName}を更新しました`, "変更内容が保存されました");
      },
      [showSuccess],
    ),

    // 削除成功
    deleted: useCallback(
      (resourceName: string = "データ") => {
        showSuccess(`${resourceName}を削除しました`, "正常に削除されました");
      },
      [showSuccess],
    ),

    // 提出成功
    submitted: useCallback(
      (resourceName: string = "日報") => {
        showSuccess(`${resourceName}を提出しました`, "上司に送信されました");
      },
      [showSuccess],
    ),

    // 下書き保存成功
    savedAsDraft: useCallback(
      (resourceName: string = "日報") => {
        showSuccess(`${resourceName}を下書き保存しました`, "後で編集・提出できます");
      },
      [showSuccess],
    ),

    // ステータス変更成功
    statusChanged: useCallback(
      (newStatus: string, resourceName: string = "日報") => {
        const statusText = newStatus === "submitted" ? "提出済み" : "下書き";
        showSuccess(
          `${resourceName}のステータスを変更しました`,
          `「${statusText}」に変更されました`,
        );
      },
      [showSuccess],
    ),

    // 作成エラー
    createError: useCallback(
      (resourceName: string = "データ", error?: string) => {
        showError(`${resourceName}の作成に失敗しました`, error || "もう一度お試しください");
      },
      [showError],
    ),

    // 更新エラー
    updateError: useCallback(
      (resourceName: string = "データ", error?: string) => {
        showError(`${resourceName}の更新に失敗しました`, error || "もう一度お試しください");
      },
      [showError],
    ),

    // 削除エラー
    deleteError: useCallback(
      (resourceName: string = "データ", error?: string) => {
        showError(`${resourceName}の削除に失敗しました`, error || "もう一度お試しください");
      },
      [showError],
    ),

    // 読み込みエラー
    loadError: useCallback(
      (resourceName: string = "データ", error?: string) => {
        showError(
          `${resourceName}の読み込みに失敗しました`,
          error || "ページを再読み込みしてください",
        );
      },
      [showError],
    ),

    // ネットワークエラー
    networkError: useCallback(() => {
      showError("ネットワークエラーが発生しました", "インターネット接続を確認してください");
    }, [showError]),

    // 認証エラー
    authError: useCallback(() => {
      showError("認証エラーが発生しました", "再度ログインしてください");
    }, [showError]),

    // 権限エラー
    permissionError: useCallback(() => {
      showError("権限がありません", "この操作を実行する権限がありません");
    }, [showError]),

    // 警告メッセージ
    unsavedChanges: useCallback(() => {
      showWarning("未保存の変更があります", "変更内容が失われる可能性があります");
    }, [showWarning]),

    // 情報メッセージ
    autoSaved: useCallback(() => {
      showInfo("自動保存しました", "変更内容が保存されました");
    }, [showInfo]),
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showToast,
    ...apiOperations,
  };
};
