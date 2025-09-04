import { Box, VStack, Text } from "@chakra-ui/react";
import { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../atoms";
import type { UserInfo } from "../../types";
import { MessageConst } from "../../constants/MessageConst";

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
  const navigate = useNavigate();

  // 上長・管理者かどうかの判定
  const canAccessSupervisorDashboard = user.role === "上長" || user.role === "管理者";

  // ナビゲーションハンドラー
  const handleSupervisorDashboard = useCallback(() => {
    navigate("/supervisor");
  }, [navigate]);

  const handleCreateReport = useCallback(() => {
    navigate("/report/create");
  }, [navigate]);

  const handleViewHistory = useCallback(() => {
    navigate("/report/list");
  }, [navigate]);

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
