/* eslint-disable complexity */
import { Box, Heading, VStack, HStack, Text, SimpleGrid } from "@chakra-ui/react";
import { useState, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, HomeButton } from "../components/atoms";
import {
  StatusBadge,
  DeleteConfirmDialog,
  PersonalReportCard,
  LoadingState,
  ErrorState,
  EmptyState,
} from "../components/molecules";
import type { SearchCriteria } from "../components/molecules/SearchForm";
import { useAuth, useMyDailyReports, useToast, useDeleteDialog } from "../hooks";
import { MessageConst } from "../constants/MessageConst";
import type { DailyReportStatus, DailyReportResponse } from "../types";

/**
 * 個人日報一覧ページ (Organism)
 *
 * 機能:
 * - 個人の日報履歴一覧表示
 * - ステータス別フィルタリング
 * - 新規作成・編集・削除機能
 * - レスポンシブカードレイアウト
 *
 * 対象ユーザー:
 * - すべてのログインユーザー
 *
 * 表示情報:
 * - 日報作成日
 * - ステータス（提出済み・下書き）
 * - 作業内容（抜粋）
 * - アクションボタン（編集・削除）
 */

type FilterType = "all" | DailyReportStatus;

// フィルタリングヘルパー関数
const filterByStatus = (
  reports: DailyReportResponse[],
  filter: FilterType,
): DailyReportResponse[] => {
  if (filter === "all") return reports;
  return reports.filter((report) => report.status === filter);
};

const filterByTitle = (reports: DailyReportResponse[], title: string): DailyReportResponse[] => {
  if (!title) return reports;
  return reports.filter((report) => report.title.toLowerCase().includes(title.toLowerCase()));
};

const filterByContent = (
  reports: DailyReportResponse[],
  content: string,
): DailyReportResponse[] => {
  if (!content) return reports;
  return reports.filter((report) =>
    report.workContent.toLowerCase().includes(content.toLowerCase()),
  );
};

const filterByDateRange = (
  reports: DailyReportResponse[],
  startDate: string,
  endDate: string,
): DailyReportResponse[] => {
  return reports.filter((report) => {
    const reportDate = new Date(report.reportDate);

    if (startDate) {
      const searchStartDate = new Date(startDate);
      if (reportDate < searchStartDate) return false;
    }

    if (endDate) {
      const searchEndDate = new Date(endDate);
      if (reportDate > searchEndDate) return false;
    }

    return true;
  });
};

const applyAllFilters = (
  reports: DailyReportResponse[],
  filter: FilterType,
  searchCriteria: SearchCriteria,
): DailyReportResponse[] => {
  let filtered = filterByStatus(reports, filter);
  filtered = filterByTitle(filtered, searchCriteria.title);
  filtered = filterByContent(filtered, searchCriteria.content);
  filtered = filterByDateRange(filtered, searchCriteria.startDate, searchCriteria.endDate);
  return filtered;
};

// 削除ダイアログの状態管理はuseDeleteDialogフックに移行済み

// PersonalReportCard コンポーネントは molecules に移行完了

// LoadingState・ErrorState・EmptyState は molecules ディレクトリに移行済み

/**
 * 日報一覧表示コンポーネント
 */
type ReportListProps = {
  reports: DailyReportResponse[];
  onView: (reportId: number) => void;
  onEdit: (reportId: number) => void;
  onDelete: (reportId: number) => void;
};

const ReportList = memo(({ reports, onView, onEdit, onDelete }: ReportListProps) => (
  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} w="full">
    {reports.map((report) => (
      <PersonalReportCard
        key={report.id}
        report={report}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ))}
  </SimpleGrid>
));

const DailyReportListComponent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [currentFilter] = useState<FilterType>("all");
  const [searchCriteria] = useState<SearchCriteria>({
    title: "",
    content: "",
    startDate: "",
    endDate: "",
  });

  // 日報データ取得
  const { reports, isLoading, error, deleteReport, refetch } = useMyDailyReports();

  // 削除ダイアログ状態管理（カスタムフック）
  const { deleteDialog, handleDelete, handleDeleteConfirm, handleDeleteCancel } = useDeleteDialog({
    deleteReport,
    toast,
    reports,
  });

  // 開発モード表示判定（メモ化）
  const isDevelopment = useMemo(() => import.meta.env.DEV, []);
  const useRealAPI = useMemo(() => import.meta.env.VITE_USE_REAL_API === "true", []);

  // フィルタリング処理（メモ化）
  const filteredReports = useMemo(
    () => applyAllFilters(reports, currentFilter, searchCriteria),
    [reports, currentFilter, searchCriteria],
  );

  // ハンドラー関数（メモ化）
  const handleCreateNew = useCallback(() => {
    navigate("/report/create");
  }, [navigate]);

  const handleView = useCallback(
    (reportId: number) => {
      navigate(`/report/detail/${reportId}`);
    },
    [navigate],
  );

  const handleEdit = useCallback(
    (reportId: number) => {
      navigate(`/report/edit/${reportId}`);
    },
    [navigate],
  );

  // 削除処理は useDeleteDialog フックに移行済み
  // フィルタリング・検索機能は将来実装予定

  return (
    <Box w="100vw" minH="100vh" bg="#F9FAFB">
      <Box maxW="7xl" mx="auto" px={{ base: 4, md: 8 }} py={8}>
        <VStack gap={8} align="stretch">
          {/* ヘッダー */}
          <Box w="full">
            <VStack align="start" gap={4}>
              <HStack justify="space-between" w="full">
                <HStack wrap="wrap" gap={4}>
                  <Heading size="xl" color="gray.800">
                    {MessageConst.REPORT.LIST_TITLE}
                  </Heading>

                  {/* 開発モード表示 */}
                  {isDevelopment && !useRealAPI && (
                    <StatusBadge status="dev-mock">{MessageConst.DEV.MOCK_API_MODE}</StatusBadge>
                  )}
                  {isDevelopment && useRealAPI && (
                    <StatusBadge status="dev-api">{MessageConst.DEV.REAL_API_MODE}</StatusBadge>
                  )}
                </HStack>
                <HomeButton />
              </HStack>

              {user && (
                <Text color="gray.700" fontSize="lg" fontWeight="medium">
                  {user.displayName || user.username} さんの日報履歴
                </Text>
              )}

              <Text color="gray.700" fontSize="md">
                {MessageConst.REPORT.LIST_DESCRIPTION}
              </Text>
            </VStack>
          </Box>

          {/* 新規作成ボタン */}
          <HStack justify="flex-end">
            <Button variant="primary" onClick={handleCreateNew}>
              {MessageConst.ACTION.CREATE_REPORT}
            </Button>
          </HStack>

          {/* 検索結果件数表示 */}
          {!isLoading && !error && (
            <HStack justify="space-between" align="center">
              <Text color="gray.600" fontSize="md">
                {filteredReports.length > 0
                  ? `${filteredReports.length} 件の日報が見つかりました`
                  : "条件に一致する日報はありません"}
              </Text>
              {filteredReports.length !== reports.length && (
                <Text color="gray.500" fontSize="sm">
                  全 {reports.length} 件中
                </Text>
              )}
            </HStack>
          )}

          {/* 日報一覧 */}
          {isLoading ? (
            <LoadingState message="日報データを読み込み中..." />
          ) : error ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : filteredReports.length > 0 ? (
            <ReportList
              reports={filteredReports}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <EmptyState
              title={
                currentFilter === "all"
                  ? MessageConst.REPORT.NO_REPORTS_MESSAGE
                  : `${getFilterText(currentFilter)}の日報がありません`
              }
              description={MessageConst.REPORT.CREATE_FIRST_REPORT}
              actionLabel={MessageConst.ACTION.CREATE_REPORT}
              onAction={handleCreateNew}
            />
          )}
        </VStack>
      </Box>

      {/* 削除確認ダイアログ */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={deleteDialog.reportTitle}
        description="削除された日報は復元できません。"
        isDeleting={deleteDialog.isDeleting}
        errorMessage={deleteDialog.errorMessage}
      />
    </Box>
  );
};

// メモ化による再レンダリング最適化
export const DailyReportList = memo(DailyReportListComponent);

// フィルター名を取得するヘルパー関数
const getFilterText = (filter: FilterType): string => {
  switch (filter) {
    case "submitted":
      return MessageConst.REPORT.FILTER_SUBMITTED;
    case "draft":
      return MessageConst.REPORT.FILTER_DRAFTS;
    default:
      return MessageConst.REPORT.FILTER_ALL_REPORTS;
  }
};
