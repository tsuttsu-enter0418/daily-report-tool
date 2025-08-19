import { Box, HStack, VStack, Heading, Text } from "@chakra-ui/react";
import { memo, useCallback, useMemo } from "react";
import { StatusBadge } from "./StatusBadge";
import { MessageConst } from "../../constants/MessageConst";
import { type ReportCardData, type ClickHandler } from "../../types";

/**
 * 日報カードコンポーネント (Molecule)
 *
 * 機能:
 * - 日報の概要情報を表示
 * - ステータスバッジによる状態表示
 * - グラデーションアバター表示
 * - ホバーエフェクト
 *
 * 再利用場面:
 * - 上司ダッシュボード
 * - 日報一覧画面
 * - 検索結果表示
 */

type ReportCardProps = {
  /** 日報データ */
  report: ReportCardData;
  /** クリック時のハンドラー */
  onClick: ClickHandler;
};

/**
 * ステータスに応じたStatusBadgeの色を取得
 */
const getStatusColor = (status: ReportCardData["status"]) => {
  switch (status) {
    case "completed":
      return "success";
    case "pending":
      return "warning";
    case "draft":
      return "error";
    default:
      return "error";
  }
};

/**
 * ステータスに応じた日本語テキストを取得
 */
const getStatusText = (status: ReportCardData["status"]) => {
  switch (status) {
    case "completed":
      return MessageConst.DASHBOARD.STATUS_COMPLETED;
    case "pending":
      return MessageConst.DASHBOARD.STATUS_PENDING;
    case "draft":
      return MessageConst.DASHBOARD.STATUS_DRAFT;
    default:
      return "不明";
  }
};

const ReportCardComponent = ({ report, onClick }: ReportCardProps) => {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick();
      }
    },
    [onClick],
  );

  const ariaLabel = useMemo(
    () =>
      `${report.author}の日報「${report.title}」を開く。ステータス: ${getStatusText(report.status)}、提出日: ${report.date}`,
    [report.author, report.title, report.status, report.date],
  );

  const statusColor = useMemo(
    () => getStatusColor(report.status),
    [report.status],
  );
  const statusText = useMemo(
    () => getStatusText(report.status),
    [report.status],
  );

  return (
    <Box
      p={6}
      bg="white"
      borderRadius="lg"
      boxShadow="0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
      border="1px"
      borderColor="gray.200"
      cursor="pointer"
      transition="all 0.2s"
      w="full"
      minH="180px"
      _hover={{
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        transform: "translateY(-2px)",
        borderColor: "gray.300",
      }}
      _focus={{
        outline: "2px solid",
        outlineColor: "blue.500",
        outlineOffset: "2px",
      }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
    >
      <HStack gap={8} align="center" h="full">
        {/* アバター */}
        <Box
          w="100px"
          h="100px"
          borderRadius="xl"
          background={report.avatarBg}
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="white"
          fontWeight="bold"
          fontSize="3xl"
          flexShrink={0}
          boxShadow="lg"
          aria-label={`${report.author}のアバター`}
          role="img"
        >
          {report.author.charAt(0)}
        </Box>

        {/* 日報情報 */}
        <VStack align="start" gap={4} flex={1} h="full" justify="center">
          <HStack justify="space-between" w="full" align="start">
            <VStack align="start" gap={2} flex={1}>
              <Heading size="lg" color="gray.800" lineHeight="1.3">
                {report.title}
              </Heading>
              <Text fontSize="lg" color="gray.700" fontWeight="medium">
                {report.author}, {report.team}
              </Text>
            </VStack>
            <Box flexShrink={0} ml={6}>
              <StatusBadge status={statusColor}>{statusText}</StatusBadge>
            </Box>
          </HStack>
          <Text fontSize="md" color="gray.600" fontWeight="medium">
            提出日: {report.date}
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
};

// メモ化による再レンダリング最適化
export const ReportCard = memo(ReportCardComponent);
