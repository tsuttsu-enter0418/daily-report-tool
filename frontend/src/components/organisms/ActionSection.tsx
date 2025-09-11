import { Box, VStack, Text } from "@chakra-ui/react";
import { memo } from "react";
import { Button } from "../atoms";
import type { UserInfo } from "../../types";
import { MessageConst } from "../../constants/MessageConst";
import { useRightPane } from "@/hooks/useRightPane";

type ActionSectionProps = {
  user: UserInfo;
};

/**
 * アクション機能セクション (Organism)
 *
 * 機能:
 * - ユーザーの役職に応じた機能ボタン表示
 * - 上司ダッシュボード・日報作成・履歴閲覧への導線
 * - 権限制御による適切な機能提供
 *
 * ナビゲーション:
 * - 上長・管理者: 上司ダッシュボードアクセス可能
 * - 全ユーザー: 日報作成・履歴閲覧可能
 * - React Router によるSPA内遷移
 */
const ActionSectionComponent = ({ user }: ActionSectionProps) => {
  const { actions } = useRightPane();

  // 上長・管理者かどうかの判定
  const canAccessSupervisorDashboard = user.role === "上長" || user.role === "管理者";

  // 右ペイン状態更新ハンドラー（useRightPane内でメモ化済み）
  const handleSupervisorDashboard = actions.showSupervisor;
  const handleCreateReport = actions.showCreate;
  const handleViewHistory = actions.showList;

  return (
    <Box p={4} bg="gray.50" borderRadius="md" w="full">
      <VStack align="start" gap={3}>
        <Text fontSize="md" fontWeight="semibold" color="gray.700">
          利用可能な機能
        </Text>
        <VStack gap={3} align="start">
          {canAccessSupervisorDashboard && (
            <Button
              variant="secondary"
              w="100%"
              justifyContent="left"
              onClick={handleSupervisorDashboard}
            >
              {MessageConst.ACTION.VIEW_TEAM_REPORTS}
            </Button>
          )}
          <Button variant="secondary" w="100%" justifyContent="left" onClick={handleCreateReport}>
            {MessageConst.ACTION.CREATE_REPORT}
          </Button>
          <Button variant="secondary" w="100%" justifyContent="left" onClick={handleViewHistory}>
            {MessageConst.ACTION.VIEW_HISTORY}
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
};

export const ActionSection = memo(ActionSectionComponent);
