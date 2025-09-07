import { memo, useMemo } from "react";
import { Card, VStack, HStack, Text, Box } from "@chakra-ui/react";
import { Button } from "../atoms";
import { StatusBadge } from "./StatusBadge";
import { formatDate, formatOptionalDateTime } from "../../utils";
import { MessageConst } from "../../constants/MessageConst";
import type { DailyReportResponse } from "../../types";

/**
 * 個人日報カードコンポーネント (Molecule)
 * 
 * 機能:
 * - 日報データの表示カード
 * - 日付フォーマット処理（共通ユーティリティ使用）
 * - ステータス表示・操作ボタン
 * - メモ化による再レンダリング最適化
 * 
 * 使用場面:
 * - 日報一覧画面での個別日報表示
 * - 検索結果の日報カード表示
 * - ダッシュボード画面での日報表示
 */

export type PersonalReportCardProps = {
  /** 表示する日報データ */
  report: DailyReportResponse;
  /** 詳細表示時のハンドラー */
  onView: (reportId: number) => void;
  /** 編集時のハンドラー */
  onEdit: (reportId: number) => void;
  /** 削除時のハンドラー */
  onDelete: (reportId: number) => void;
};

/**
 * PersonalReportCard本体コンポーネント
 */
const PersonalReportCardComponent = ({
  report,
  onView,
  onEdit,
  onDelete,
}: PersonalReportCardProps) => {
  // 作業内容のプレビュー表示（最初の100文字）
  const previewContent = useMemo(
    () =>
      report.workContent.length > 100
        ? `${report.workContent.slice(0, 100)}...`
        : report.workContent,
    [report.workContent],
  );

  // 日付フォーマット（共通ユーティリティ使用・メモ化）
  const formattedDates = useMemo(
    () => ({
      reportDate: formatDate(report.reportDate),
      createdAt: formatOptionalDateTime(report.createdAt),
      submittedAt: formatOptionalDateTime(report.submittedAt),
    }),
    [report.reportDate, report.createdAt, report.submittedAt],
  );

  return (
    <Card.Root
      variant="elevated"
      size="md"
      borderLeft="4px solid"
      borderLeftColor={report.status === "submitted" ? "blue.400" : "orange.400"}
      bg="white"
      boxShadow="md"
      _hover={{
        boxShadow: "lg",
        transform: "translateY(-2px)",
        borderLeftColor: report.status === "submitted" ? "blue.600" : "orange.600",
      }}
      transition="all 0.2s ease-in-out"
      cursor="pointer"
    >
      <Card.Body p={5}>
        <VStack align="stretch" gap={3}>
          {/* ヘッダー行: タイトルとステータス */}
          <HStack justify="space-between" align="flex-start">
            <Box flex={1} minW={0}>
              <Text
                fontSize="lg"
                fontWeight="bold"
                color="gray.800"
                noOfLines={2}
                lineHeight="1.3"
                mb={1}
              >
                {report.title}
              </Text>
              <Text fontSize="sm" color="blue.600" fontWeight="medium">
                {formattedDates.reportDate}
              </Text>
            </Box>
            <StatusBadge status={report.status} />
          </HStack>

          {/* 作業内容プレビュー */}
          <Box>
            <Text
              fontSize="sm"
              color="gray.700"
              lineHeight="1.5"
              noOfLines={3}
              whiteSpace="pre-wrap"
            >
              {previewContent}
            </Text>
          </Box>

          {/* メタデータ */}
          <VStack align="stretch" gap={1}>
            <HStack justify="space-between" fontSize="xs" color="gray.500">
              <Text>作成: {formattedDates.createdAt}</Text>
              {formattedDates.submittedAt && (
                <Text>提出: {formattedDates.submittedAt}</Text>
              )}
            </HStack>
          </VStack>

          {/* アクションボタン */}
          <HStack justify="flex-end" gap={2} mt={2}>
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

/**
 * PersonalReportCard（メモ化による最適化版）
 */
export const PersonalReportCard = memo(PersonalReportCardComponent);