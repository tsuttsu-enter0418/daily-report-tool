import { useState, useCallback } from "react";
import type { DailyReportResponse } from "../types";
import type { useToast } from "./useToast";

/**
 * 削除ダイアログ状態管理カスタムフック
 *
 * 機能:
 * - 削除ダイアログの状態管理（開閉・ローディング・エラー）
 * - 削除処理のフロー制御（確認→実行→結果通知）
 * - エラーハンドリング・成功/失敗フィードバック
 *
 * 使用場面:
 * - 日報削除処理での確認ダイアログ表示・制御
 * - 削除処理中のローディング状態管理
 * - 削除エラー時のエラー表示・リトライ機能
 *
 * 責務:
 * - UI状態とビジネスロジックの分離
 * - 削除処理の安全な実行制御
 * - ユーザーフィードバック機能の統合
 */

/**
 * 削除ダイアログの状態型定義
 */
export type DeleteDialogState = {
  /** ダイアログの開閉状態 */
  isOpen: boolean;
  /** 削除対象の日報ID */
  reportId: number | null;
  /** 削除対象の日報タイトル（確認表示用） */
  reportTitle: string;
  /** 削除処理中かどうか */
  isDeleting: boolean;
  /** エラーメッセージ（エラー時のみ） */
  errorMessage: string;
};

/**
 * useDeleteDialogの設定オプション
 */
export type UseDeleteDialogOptions = {
  /** 削除実行関数 */
  deleteReport: (id: number) => Promise<boolean>;
  /** トースト通知フック */
  toast: ReturnType<typeof useToast>;
  /** 日報一覧（削除対象の検索用） */
  reports: DailyReportResponse[];
};

/**
 * useDeleteDialogの戻り値
 */
export type UseDeleteDialogReturn = {
  /** 現在の削除ダイアログ状態 */
  deleteDialog: DeleteDialogState;
  /** 削除ダイアログを開く */
  handleDelete: (reportId: number) => void;
  /** 削除を確定実行する */
  handleDeleteConfirm: () => Promise<void>;
  /** 削除をキャンセルする */
  handleDeleteCancel: () => void;
};

// 削除処理ヘルパー関数
const createInitialDeleteState = (): DeleteDialogState => ({
  isOpen: false,
  reportId: null,
  reportTitle: "",
  isDeleting: false,
  errorMessage: "",
});

const createSuccessDeleteState = createInitialDeleteState;

const createErrorDeleteState =
  (errorMessage: string) =>
  (prev: DeleteDialogState): DeleteDialogState => ({
    ...prev,
    isDeleting: false,
    errorMessage,
  });

const setDeletingState = (prev: DeleteDialogState): DeleteDialogState => ({
  ...prev,
  isDeleting: true,
  errorMessage: "",
});

/**
 * 削除ダイアログ状態管理フック
 *
 * @param options - 削除処理オプション
 * @returns 削除ダイアログ制御インターフェース
 *
 * @example
 * ```typescript
 * const deleteDialogState = useDeleteDialog({
 *   deleteReport,
 *   toast,
 *   reports
 * });
 *
 * // 削除ダイアログを開く
 * deleteDialogState.handleDelete(reportId);
 *
 * // JSXで使用
 * <DeleteConfirmDialog
 *   isOpen={deleteDialogState.deleteDialog.isOpen}
 *   onConfirm={deleteDialogState.handleDeleteConfirm}
 *   onClose={deleteDialogState.handleDeleteCancel}
 *   // ...other props
 * />
 * ```
 */
export const useDeleteDialog = ({
  deleteReport,
  toast,
  reports,
}: UseDeleteDialogOptions): UseDeleteDialogReturn => {
  const [deleteDialog, setDeleteDialog] = useState(createInitialDeleteState);

  /**
   * 削除ダイアログを開く
   * 指定されたIDの日報を削除対象として設定し、確認ダイアログを表示
   */
  const handleDelete = useCallback(
    (reportId: number) => {
      const targetReport = reports.find((r) => r.id === reportId);
      if (!targetReport) return;

      // 削除ダイアログを開く
      setDeleteDialog({
        isOpen: true,
        reportId,
        reportTitle: targetReport.title,
        isDeleting: false,
        errorMessage: "",
      });
    },
    [reports],
  );

  /**
   * 削除成功時の処理
   * 成功通知を表示し、ダイアログを閉じる
   */
  const handleDeleteSuccess = useCallback(() => {
    toast.deleted("日報");
    setDeleteDialog(createSuccessDeleteState());
  }, [toast]);

  /**
   * 削除エラー時の処理
   * エラー通知を表示し、ダイアログにエラー状態を設定
   */
  const handleDeleteError = useCallback(
    (error: unknown, isApiError: boolean = false) => {
      console.error("❌ 日報削除処理エラー:", error);
      const errorMessage = isApiError
        ? "削除に失敗しました。もう一度お試しください。"
        : "削除処理中にエラーが発生しました。";

      toast.deleteError(
        "日報",
        isApiError ? "削除に失敗しました" : "削除処理中にエラーが発生しました",
      );
      setDeleteDialog(createErrorDeleteState(errorMessage));
    },
    [toast],
  );

  /**
   * 削除を確定実行する
   * 削除APIを呼び出し、結果に応じて成功/エラー処理を実行
   */
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteDialog.reportId) return;

    setDeleteDialog(setDeletingState);

    try {
      const success = await deleteReport(deleteDialog.reportId);

      if (success) {
        handleDeleteSuccess();
      } else {
        handleDeleteError(null, true);
      }
    } catch (error) {
      handleDeleteError(error, false);
    }
  }, [deleteDialog.reportId, deleteReport, handleDeleteSuccess, handleDeleteError]);

  /**
   * 削除をキャンセルする
   * ダイアログを閉じ、状態を初期化
   */
  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog(createInitialDeleteState());
  }, []);

  return {
    deleteDialog,
    handleDelete,
    handleDeleteConfirm,
    handleDeleteCancel,
  };
};
