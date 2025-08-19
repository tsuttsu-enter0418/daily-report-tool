/* eslint-disable complexity */
import { Box, Heading, VStack, HStack, Text, SimpleGrid, Card, Spinner, Center } from "@chakra-ui/react";
import { useState, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, HomeButton } from "../components/atoms";
import { StatusBadge, SearchForm, DeleteConfirmDialog } from "../components/molecules";
import type { SearchCriteria } from "../components/molecules/SearchForm";
import { useAuth, useMyDailyReports, useToast } from "../hooks";
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
const filterByStatus = (reports: DailyReportResponse[], filter: FilterType): DailyReportResponse[] => {
  if (filter === "all") return reports;
  return reports.filter((report) => report.status === filter);
};

const filterByTitle = (reports: DailyReportResponse[], title: string): DailyReportResponse[] => {
  if (!title) return reports;
  return reports.filter((report) => report.title.toLowerCase().includes(title.toLowerCase()));
};

const filterByContent = (reports: DailyReportResponse[], content: string): DailyReportResponse[] => {
  if (!content) return reports;
  return reports.filter((report) => report.workContent.toLowerCase().includes(content.toLowerCase()));
};

const filterByDateRange = (reports: DailyReportResponse[], startDate: string, endDate: string): DailyReportResponse[] => {
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

const applyAllFilters = (reports: DailyReportResponse[], filter: FilterType, searchCriteria: SearchCriteria): DailyReportResponse[] => {
  let filtered = filterByStatus(reports, filter);
  filtered = filterByTitle(filtered, searchCriteria.title);
  filtered = filterByContent(filtered, searchCriteria.content);
  filtered = filterByDateRange(filtered, searchCriteria.startDate, searchCriteria.endDate);
  return filtered;
};

// 削除処理ヘルパー関数
const createInitialDeleteState = () => ({
  isOpen: false,
  reportId: null,
  reportTitle: "",
  isDeleting: false,
  errorMessage: "",
});

const createSuccessDeleteState = createInitialDeleteState;

const createErrorDeleteState = (errorMessage: string) => (prev: any) => ({
  ...prev,
  isDeleting: false,
  errorMessage,
});

const setDeletingState = (prev: any) => ({
  ...prev,
  isDeleting: true,
  errorMessage: "",
});

/**
 * 個人日報カードコンポーネント (Molecule)
 */
type PersonalReportCardProps = {
  report: DailyReportResponse;
  onView: (reportId: number) => void;
  onEdit: (reportId: number) => void;
  onDelete: (reportId: number) => void;
};

const PersonalReportCardComponent = ({ report, onView, onEdit, onDelete }: PersonalReportCardProps) => {
  const statusColor = useMemo(() => {
    switch (report.status) {
      case "submitted":
        return "submitted";
      case "draft":
        return "draft";
      default:
        return "error";
    }
  }, [report.status]);

  const statusText = useMemo(() => {
    switch (report.status) {
      case "submitted":
        return MessageConst.REPORT.FILTER_SUBMITTED;
      case "draft":
        return MessageConst.REPORT.FILTER_DRAFTS;
      default:
        return "不明";
    }
  }, [report.status]);

  // 作業内容を100文字で切り詰め（メモ化）
  const truncatedContent = useMemo(() => (report.workContent.length > 100 ? report.workContent.substring(0, 100) + "..." : report.workContent), [report.workContent]);

  // 日付フォーマット（メモ化）
  const formattedDates = useMemo(() => {
    const formatDate = (dateString: string) => {
      try {
        return new Date(dateString).toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      } catch {
        return dateString;
      }
    };

    const formatDateTime = (dateString: string) => {
      try {
        return new Date(dateString).toLocaleString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return dateString;
      }
    };

    return {
      reportDate: formatDate(report.reportDate),
      createdAt: formatDateTime(report.createdAt),
      submittedAt: report.submittedAt ? formatDateTime(report.submittedAt) : null,
    };
  }, [report.reportDate, report.createdAt, report.submittedAt]);

  return (
    <Card.Root
      variant="elevated"
      bg="white"
      borderRadius="lg"
      boxShadow="0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
      border="1px"
      borderColor="gray.200"
      transition="all 0.2s"
      _hover={{
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        transform: "translateY(-2px)",
        borderColor: "gray.300",
      }}
    >
      <Card.Body p={6}>
        <VStack align="stretch" gap={4}>
          {/* ヘッダー部分 */}
          <HStack justify="space-between" align="start">
            <VStack align="start" gap={1} flex={1}>
              <Heading size="md" color="gray.800" lineHeight="1.3">
                {report.title}
              </Heading>
              <Text fontSize="sm" color="gray.600">
                対象日: {formattedDates.reportDate}
              </Text>
              <Text fontSize="sm" color="gray.500">
                作成: {formattedDates.createdAt}
              </Text>
              {formattedDates.submittedAt && (
                <Text fontSize="sm" color="teal.600">
                  提出: {formattedDates.submittedAt}
                </Text>
              )}
            </VStack>
            <StatusBadge status={statusColor}>{statusText}</StatusBadge>
          </HStack>

          {/* 作業内容プレビュー */}
          <Box p={3} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200">
            <Text fontSize="sm" color="gray.700" lineHeight="1.5">
              {truncatedContent}
            </Text>
          </Box>

          {/* アクションボタン */}
          <HStack gap={2} justify="flex-end">
            <Button variant="primary" size="sm" onClick={() => onView(report.id)}>
              詳細
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onEdit(report.id)}>
              {MessageConst.REPORT.EDIT_REPORT}
            </Button>
            <Button variant="danger" size="sm" onClick={() => onDelete(report.id)}>
              {MessageConst.REPORT.DELETE_REPORT}
            </Button>
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};

// メモ化による再レンダリング最適化
const PersonalReportCard = memo(PersonalReportCardComponent);

/**
 * ローディング状態コンポーネント
 */
const LoadingState = memo(() => (
  <Center py={20}>
    <VStack gap={4}>
      <Spinner size="xl" color="blue.500" />
      <Text color="gray.600" fontSize="lg">
        日報データを読み込み中...
      </Text>
    </VStack>
  </Center>
));

/**
 * エラー状態コンポーネント
 */
type ErrorStateProps = {
  error: string;
  onRetry: () => void;
};

const ErrorState = memo(({ error, onRetry }: ErrorStateProps) => (
  <Center py={20}>
    <VStack gap={4}>
      <Text color="red.500" fontSize="lg" fontWeight="medium">
        データの読み込みに失敗しました
      </Text>
      <Text color="gray.600" fontSize="md">
        {error}
      </Text>
      <Button variant="primary" onClick={onRetry}>
        再試行
      </Button>
    </VStack>
  </Center>
));

/**
 * 空状態コンポーネント
 */
type EmptyStateProps = {
  currentFilter: FilterType;
  onCreateNew: () => void;
};

const EmptyState = memo(({ currentFilter, onCreateNew }: EmptyStateProps) => (
  <Box textAlign="center" py={10} w="full">
    <VStack gap={4}>
      <Text color="gray.600" fontSize="lg" fontWeight="semibold">
        {currentFilter === "all" ? MessageConst.REPORT.NO_REPORTS_MESSAGE : `${getFilterText(currentFilter)}の日報がありません`}
      </Text>
      <Text color="gray.500" fontSize="md">
        {MessageConst.REPORT.CREATE_FIRST_REPORT}
      </Text>
      <Button variant="primary" onClick={onCreateNew}>
        {MessageConst.ACTION.CREATE_REPORT}
      </Button>
    </VStack>
  </Box>
));

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
      <PersonalReportCard key={report.id} report={report} onView={onView} onEdit={onEdit} onDelete={onDelete} />
    ))}
  </SimpleGrid>
));

const DailyReportListComponent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [currentFilter, setCurrentFilter] = useState<FilterType>("all");
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    title: "",
    content: "",
    startDate: "",
    endDate: "",
  });
  const [deleteDialog, setDeleteDialog] = useState(createInitialDeleteState);

  // 日報データ取得
  const { reports, isLoading, error, deleteReport, refetch } = useMyDailyReports();

  // 開発モード表示判定（メモ化）
  const isDevelopment = useMemo(() => import.meta.env.DEV, []);
  const useRealAPI = useMemo(() => import.meta.env.VITE_USE_REAL_API === "true", []);

  // フィルタリング処理（メモ化）
  const filteredReports = useMemo(() => applyAllFilters(reports, currentFilter, searchCriteria), [reports, currentFilter, searchCriteria]);

  // ハンドラー関数（メモ化）
  const handleCreateNew = useCallback(() => {
    navigate("/report/create");
  }, [navigate]);

  const handleView = useCallback(
    (reportId: number) => {
      navigate(`/report/detail/${reportId}`);
    },
    [navigate]
  );

  const handleEdit = useCallback(
    (reportId: number) => {
      navigate(`/report/edit/${reportId}`);
    },
    [navigate]
  );

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
    [reports]
  );

  const handleDeleteSuccess = useCallback(() => {
    console.log("✅ 日報削除完了");
    toast.deleted("日報");
    setDeleteDialog(createSuccessDeleteState());
  }, [toast]);

  const handleDeleteError = useCallback(
    (error: unknown, isApiError: boolean = false) => {
      console.error("❌ 日報削除処理エラー:", error);
      const errorMessage = isApiError ? "削除に失敗しました。もう一度お試しください。" : "削除処理中にエラーが発生しました。";

      toast.deleteError("日報", isApiError ? "削除に失敗しました" : "削除処理中にエラーが発生しました");
      setDeleteDialog(createErrorDeleteState(errorMessage));
    },
    [toast]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteDialog.reportId) return;

    setDeleteDialog(setDeletingState);

    try {
      console.log(`日報削除: ${deleteDialog.reportId}`);
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

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog(createInitialDeleteState());
  }, []);

  // const handleFilterChange = useCallback((filter: FilterType) => {
  //   setCurrentFilter(filter);
  // }, []);

  // const handleSearchChange = useCallback((criteria: SearchCriteria) => {
  //   setSearchCriteria(criteria);
  // }, []);

  // const handleClearSearch = useCallback(() => {
  //   setSearchCriteria({
  //     title: "",
  //     content: "",
  //     startDate: "",
  //     endDate: "",
  //   });
  // }, []);

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
                  {isDevelopment && !useRealAPI && <StatusBadge status="dev-mock">{MessageConst.DEV.MOCK_API_MODE}</StatusBadge>}
                  {isDevelopment && useRealAPI && <StatusBadge status="dev-api">{MessageConst.DEV.REAL_API_MODE}</StatusBadge>}
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
                {filteredReports.length > 0 ? `${filteredReports.length} 件の日報が見つかりました` : "条件に一致する日報はありません"}
              </Text>
              {filteredReports.length !== reports.length && (
                <Text color="gray.500" fontSize="sm">
                  全 {reports.length} 件中
                </Text>
              )}
            </HStack>
          )}

          {/* 日報一覧 */}
          {isLoading ? <LoadingState /> : error ? <ErrorState error={error} onRetry={refetch} /> : filteredReports.length > 0 ? <ReportList reports={filteredReports} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} /> : <EmptyState currentFilter={currentFilter} onCreateNew={handleCreateNew} />}
        </VStack>
      </Box>

      {/* 削除確認ダイアログ */}
      <DeleteConfirmDialog isOpen={deleteDialog.isOpen} onClose={handleDeleteCancel} onConfirm={handleDeleteConfirm} title={deleteDialog.reportTitle} description="削除された日報は復元できません。" isDeleting={deleteDialog.isDeleting} errorMessage={deleteDialog.errorMessage} />
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
