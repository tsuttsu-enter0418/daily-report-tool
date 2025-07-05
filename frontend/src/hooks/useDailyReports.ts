import { useState, useEffect, useCallback } from "react";
import { apiService } from "../services/apiService";
import { useErrorHandler } from "./useErrorHandler";
import type {
  DailyReportResponse,
  DailyReportCreateRequest,
  DailyReportUpdateRequest,
  DailyReportListParams,
} from "../types";

/**
 * 日報データ管理カスタムフック
 *
 * 機能:
 * - 日報一覧の取得・管理
 * - 日報の作成・更新・削除
 * - ローディング状態とエラーハンドリング
 * - データの自動リフレッシュ
 *
 * 責務:
 * - APIとコンポーネント間のデータフロー管理
 * - エラー状態の統一管理
 * - ローディング状態の管理
 * - データの永続化とキャッシュ
 */

export type UseDailyReportsReturn = {
  /** 日報一覧データ */
  reports: DailyReportResponse[];
  /** ローディング状態 */
  isLoading: boolean;
  /** エラー状態 */
  error: string | null;
  /** 日報一覧の再取得 */
  refetch: () => Promise<void>;
  /** 日報作成 */
  createReport: (
    data: DailyReportCreateRequest,
  ) => Promise<DailyReportResponse | null>;
  /** 日報更新 */
  updateReport: (
    id: number,
    data: DailyReportUpdateRequest,
  ) => Promise<DailyReportResponse | null>;
  /** 日報削除 */
  deleteReport: (id: number) => Promise<boolean>;
  /** 単一日報取得 */
  getReport: (id: number) => Promise<DailyReportResponse | null>;
};

/**
 * 日報データ管理フック
 *
 * @param params - 初期検索パラメータ
 * @param autoFetch - 自動取得するかどうか（デフォルト: true）
 * @returns 日報データ管理インターフェース
 */
export const useDailyReports = (
  params?: DailyReportListParams,
  autoFetch: boolean = true,
): UseDailyReportsReturn => {
  const [reports, setReports] = useState<DailyReportResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleError, showSuccess } = useErrorHandler();

  /**
   * 日報一覧取得
   */
  const fetchReports = useCallback(
    async (searchParams?: DailyReportListParams): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("📋 日報一覧取得開始", searchParams);
        const data = await apiService.getDailyReports(searchParams);
        setReports(data);
        console.log("✅ 日報一覧取得成功:", data.length, "件");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "日報一覧の取得に失敗しました";
        setError(errorMessage);
        handleError(err, "日報一覧取得");
        console.error("❌ 日報一覧取得失敗:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [handleError],
  );

  /**
   * 日報一覧の再取得
   */
  const refetch = useCallback(async (): Promise<void> => {
    await fetchReports(params);
  }, [fetchReports, params]);

  /**
   * 日報作成
   */
  const createReport = useCallback(
    async (
      data: DailyReportCreateRequest,
    ): Promise<DailyReportResponse | null> => {
      try {
        console.log("📝 日報作成開始", data.title);
        const newReport = await apiService.createDailyReport(data);

        // 作成された日報をリストに追加
        setReports((prevReports) => [newReport, ...prevReports]);

        showSuccess("日報が正常に作成されました");
        console.log("✅ 日報作成成功:", newReport.title);
        return newReport;
      } catch (err) {
        handleError(err, "日報作成");
        console.error("❌ 日報作成失敗:", err);
        return null;
      }
    },
    [handleError, showSuccess],
  );

  /**
   * 日報更新
   */
  const updateReport = useCallback(
    async (
      id: number,
      data: DailyReportUpdateRequest,
    ): Promise<DailyReportResponse | null> => {
      try {
        console.log("✏️ 日報更新開始", id, data.title);
        const updatedReport = await apiService.updateDailyReport(id, data);

        // 更新された日報をリストに反映
        setReports((prevReports) =>
          prevReports.map((report) =>
            report.id === id ? updatedReport : report,
          ),
        );

        showSuccess("日報が正常に更新されました");
        console.log("✅ 日報更新成功:", updatedReport.title);
        return updatedReport;
      } catch (err) {
        handleError(err, "日報更新");
        console.error("❌ 日報更新失敗:", err);
        return null;
      }
    },
    [handleError, showSuccess],
  );

  /**
   * 日報削除
   */
  const deleteReport = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        console.log("🗑️ 日報削除開始", id);
        await apiService.deleteDailyReport(id);

        // 削除された日報をリストから除去
        setReports((prevReports) =>
          prevReports.filter((report) => report.id !== id),
        );

        showSuccess("日報が正常に削除されました");
        console.log("✅ 日報削除成功:", id);
        return true;
      } catch (err) {
        handleError(err, "日報削除");
        console.error("❌ 日報削除失敗:", err);
        return false;
      }
    },
    [handleError, showSuccess],
  );

  /**
   * 単一日報取得
   */
  const getReport = useCallback(
    async (id: number): Promise<DailyReportResponse | null> => {
      try {
        console.log("📖 日報詳細取得開始", id);
        const report = await apiService.getDailyReport(id);

        if (report) {
          console.log("✅ 日報詳細取得成功:", report.title);
        } else {
          console.warn("📄 指定された日報が見つかりません:", id);
        }

        return report;
      } catch (err) {
        handleError(err, "日報詳細取得");
        console.error("❌ 日報詳細取得失敗:", err);
        return null;
      }
    },
    [handleError],
  );

  // 初期データ取得
  useEffect(() => {
    if (autoFetch) {
      fetchReports(params);
    }
  }, [fetchReports, params, autoFetch]);

  return {
    reports,
    isLoading,
    error,
    refetch,
    createReport,
    updateReport,
    deleteReport,
    getReport,
  };
};

/**
 * 個人日報データ管理フック（簡易版）
 * 現在のユーザーの日報のみを取得
 */
export const useMyDailyReports = (): UseDailyReportsReturn => {
  return useDailyReports();
};

/**
 * 部下日報データ管理フック（上司用）
 * 部下の日報を取得するためのフック
 */
export const useSubordinateReports = (): UseDailyReportsReturn => {
  // TODO: 将来的に部下の日報のみを取得するAPIを追加する場合
  return useDailyReports();
};
