import { Box, HStack, VStack, Heading, Text } from "@chakra-ui/react";
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
    case "completed": return "success";
    case "pending": return "warning";
    case "draft": return "error";
    default: return "error";
  }
};

/**
 * ステータスに応じた日本語テキストを取得
 */
const getStatusText = (status: ReportCardData["status"]) => {
  switch (status) {
    case "completed": return MessageConst.DASHBOARD.STATUS_COMPLETED;
    case "pending": return MessageConst.DASHBOARD.STATUS_PENDING;
    case "draft": return MessageConst.DASHBOARD.STATUS_DRAFT;
    default: return "不明";
  }
};

export const ReportCard = ({ report, onClick }: ReportCardProps) => {
  return (
    <Box
      p={10}
      bg="rgba(255, 251, 235, 0.9)"
      borderRadius="xl"
      boxShadow="0 4px 20px rgba(251, 146, 60, 0.15)"
      border="2px"
      borderColor="orange.200"
      cursor="pointer"
      transition="all 0.3s"
      w="full"
      minH="200px"
      _hover={{
        boxShadow: "0 8px 30px rgba(251, 146, 60, 0.25)",
        transform: "translateY(-6px)",
        borderColor: "orange.400",
        bg: "rgba(255, 247, 237, 1)"
      }}
      onClick={onClick}
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
        >
          {report.author.charAt(0)}
        </Box>

        {/* 日報情報 */}
        <VStack align="start" gap={4} flex={1} h="full" justify="center">
          <HStack justify="space-between" w="full" align="start">
            <VStack align="start" gap={2} flex={1}>
              <Heading size="lg" color="orange.800" lineHeight="1.3">
                {report.title}
              </Heading>
              <Text fontSize="lg" color="amber.700" fontWeight="medium">
                {report.author}, {report.team}
              </Text>
            </VStack>
            <Box flexShrink={0} ml={6}>
              <StatusBadge status={getStatusColor(report.status)}>
                {getStatusText(report.status)}
              </StatusBadge>
            </Box>
          </HStack>
          <Text fontSize="md" color="amber.600" fontWeight="medium">
            提出日: {report.date}
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
};