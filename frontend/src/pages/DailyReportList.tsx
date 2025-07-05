import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  SimpleGrid,
  Card,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { useState, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/atoms";
import { StatusBadge } from "../components/molecules";
import { useAuth, useMyDailyReports } from "../hooks";
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

/**
 * 個人日報カードコンポーネント (Molecule)
 */
type PersonalReportCardProps = {
  report: DailyReportResponse;
  onEdit: (reportId: number) => void;
  onDelete: (reportId: number) => void;
};

const PersonalReportCardComponent = ({
  report,
  onEdit,
  onDelete,
}: PersonalReportCardProps) => {
  const statusColor = useMemo(() => {
    switch (report.status) {
      case "submitted":
        return "success";
      case "draft":
        return "warning";
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
  const truncatedContent = useMemo(
    () =>
      report.workContent.length > 100
        ? report.workContent.substring(0, 100) + "..."
        : report.workContent,
    [report.workContent],
  );

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
      bg="rgba(255, 251, 235, 0.9)"
      borderRadius="xl"
      boxShadow="0 4px 20px rgba(251, 146, 60, 0.15)"
      border="2px"
      borderColor="orange.200"
      transition="all 0.3s"
      _hover={{
        boxShadow: "0 8px 30px rgba(251, 146, 60, 0.25)",
        transform: "translateY(-2px)",
        borderColor: "orange.400",
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
          <Box
            p={3}
            bg="white"
            borderRadius="md"
            border="1px"
            borderColor="orange.100"
          >
            <Text fontSize="sm" color="gray.700" lineHeight="1.5">
              {truncatedContent}
            </Text>
          </Box>

          {/* アクションボタン */}
          <HStack gap={2} justify="flex-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(report.id)}
            >
              {MessageConst.REPORT.EDIT_REPORT}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(report.id)}
            >
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

const DailyReportListComponent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentFilter, setCurrentFilter] = useState<FilterType>("all");
  
  // 日報データ取得
  const { reports, isLoading, error, deleteReport, refetch } = useMyDailyReports();

  // 開発モード表示判定（メモ化）
  const isDevelopment = useMemo(() => import.meta.env.DEV, []);
  const useRealAPI = useMemo(
    () => import.meta.env.VITE_USE_REAL_API === "true",
    [],
  );

  // フィルタリング処理（メモ化）
  const filteredReports = useMemo(
    () =>
      reports.filter((report) => {
        switch (currentFilter) {
          case "submitted":
            return report.status === "submitted";
          case "draft":
            return report.status === "draft";
          default:
            return true;
        }
      }),
    [reports, currentFilter],
  );

  // ハンドラー関数（メモ化）
  const handleCreateNew = useCallback(() => {
    navigate("/report/create");
  }, [navigate]);

  const handleEdit = useCallback(
    (reportId: number) => {
      navigate(`/report/edit/${reportId}`);
    },
    [navigate],
  );

  const handleDelete = useCallback(
    async (reportId: number) => {
      try {
        // 削除確認ダイアログ
        const confirmed = window.confirm("日報を削除しますか？");
        if (!confirmed) return;

        console.log(`日報削除: ${reportId}`);
        const success = await deleteReport(reportId);
        
        if (success) {
          // 削除成功の場合は自動的にリストから除去される（useDailyReportsフック内で処理）
          console.log("✅ 日報削除完了");
        }
      } catch (error) {
        console.error("❌ 日報削除処理エラー:", error);
      }
    },
    [deleteReport],
  );

  const handleFilterChange = useCallback((filter: FilterType) => {
    setCurrentFilter(filter);
  }, []);

  return (
    <Box
      w="100vw"
      minH="100vh"
      background="linear-gradient(135deg, #FFF7ED 0%, #FED7AA 30%, #FECACA 70%, #FEF3C7 100%)"
    >
      <Box maxW="7xl" mx="auto" px={{ base: 4, md: 8 }} py={8}>
        <VStack gap={8} align="stretch">
          {/* ヘッダー */}
          <Box w="full">
            <VStack align="start" gap={4}>
              <HStack wrap="wrap" gap={4}>
                <Heading size="xl" color="gray.800">
                  {MessageConst.REPORT.LIST_TITLE}
                </Heading>

                {/* 開発モード表示 */}
                {isDevelopment && !useRealAPI && (
                  <StatusBadge status="dev-mock">
                    {MessageConst.DEV.MOCK_API_MODE}
                  </StatusBadge>
                )}
                {isDevelopment && useRealAPI && (
                  <StatusBadge status="dev-api">
                    {MessageConst.DEV.REAL_API_MODE}
                  </StatusBadge>
                )}
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

          {/* フィルターボタン */}
          <HStack gap={2}>
            <Button
              variant={currentFilter === "all" ? "primary" : "secondary"}
              onClick={() => handleFilterChange("all")}
            >
              {MessageConst.REPORT.FILTER_ALL_REPORTS}
            </Button>
            <Button
              variant={currentFilter === "submitted" ? "primary" : "secondary"}
              onClick={() => handleFilterChange("submitted")}
            >
              {MessageConst.REPORT.FILTER_SUBMITTED}
            </Button>
            <Button
              variant={currentFilter === "draft" ? "primary" : "secondary"}
              onClick={() => handleFilterChange("draft")}
            >
              {MessageConst.REPORT.FILTER_DRAFTS}
            </Button>
          </HStack>

          {/* 開発モード時の説明 */}
          {isDevelopment && !useRealAPI && (
            <Box
              p={4}
              bg="blue.50"
              borderRadius="md"
              borderLeftWidth="4px"
              borderLeftColor="blue.400"
            >
              <VStack align="start" gap={1}>
                <Text fontSize="sm" color="blue.700">
                  <strong>{MessageConst.DEV.MOCK_API_DESCRIPTION}</strong>
                </Text>
                <Text fontSize="sm" color="blue.600">
                  現在はモックデータを表示しています。実際の日報データは今後連携予定です。
                </Text>
              </VStack>
            </Box>
          )}

          {/* 日報一覧 */}
          {isLoading ? (
            <Center py={20}>
              <VStack gap={4}>
                <Spinner size="xl" color="orange.500" />
                <Text color="gray.600" fontSize="lg">
                  日報データを読み込み中...
                </Text>
              </VStack>
            </Center>
          ) : error ? (
            <Center py={20}>
              <VStack gap={4}>
                <Text color="red.500" fontSize="lg" fontWeight="medium">
                  データの読み込みに失敗しました
                </Text>
                <Text color="gray.600" fontSize="md">
                  {error}
                </Text>
                <Button variant="primary" onClick={refetch}>
                  再試行
                </Button>
              </VStack>
            </Center>
          ) : filteredReports.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} w="full">
              {filteredReports.map((report) => (
                <PersonalReportCard
                  key={report.id}
                  report={report}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </SimpleGrid>
          ) : (
            /* 空状態 */
            <Box textAlign="center" py={10} w="full">
              <VStack gap={4}>
                <Text color="gray.600" fontSize="lg" fontWeight="semibold">
                  {currentFilter === "all"
                    ? MessageConst.REPORT.NO_REPORTS_MESSAGE
                    : `${getFilterText(currentFilter)}の日報がありません`}
                </Text>
                <Text color="gray.500" fontSize="md">
                  {MessageConst.REPORT.CREATE_FIRST_REPORT}
                </Text>
                <Button variant="primary" onClick={handleCreateNew}>
                  {MessageConst.ACTION.CREATE_REPORT}
                </Button>
              </VStack>
            </Box>
          )}
        </VStack>
      </Box>
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
