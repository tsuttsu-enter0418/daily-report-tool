/**
 * カスタムフック（Custom Hooks）
 *
 * 特徴:
 * - ロジックの再利用性
 * - UIとビジネスロジックの分離
 * - テスタビリティの向上
 * - 状態管理の抽象化
 *
 * 例: useLogin, useAuth, useApi, useLocalStorage
 */

export { useLogin } from "./useLogin";
export type { LoginFormData, UseLoginReturn } from "./useLogin";

export { useAuth } from "./useAuth";
export type { UseAuthReturn } from "./useAuth";

export { useErrorHandler } from "./useErrorHandler";

export { useDailyReports, useMyDailyReports, useSubordinateReports } from "./useDailyReports";
export type { UseDailyReportsReturn } from "./useDailyReports";

export { useToast } from "./useToast";
export type { ToastType } from "./useToast";

export { useDeleteDialog } from "./useDeleteDialog";
export type {
  DeleteDialogState,
  UseDeleteDialogOptions,
  UseDeleteDialogReturn,
} from "./useDeleteDialog";
