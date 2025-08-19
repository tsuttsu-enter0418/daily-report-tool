import { Box, Heading, Text, VStack, HStack, Badge } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useCallback, useMemo, memo } from "react";
import { Button } from "../components/atoms";
import { StatusBadge } from "../components/molecules";
import { useAuth } from "../hooks";
import { MessageConst } from "../constants/MessageConst";

/**
 * ホームページコンポーネント (Organism)
 *
 * 機能:
 * - ログイン成功後のメイン画面
 * - ユーザー情報表示（Jotai状態管理から取得）
 * - 開発モード表示
 * - ログアウト機能
 * - 今後の日報管理機能への入り口
 *
 * 状態管理:
 * - Jotaiによるユーザー情報管理
 * - 環境変数による表示切り替え
 */
const HomeComponent = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 開発モードかどうかの判定（メモ化）
  const isDevelopment = useMemo(() => import.meta.env.DEV, []);
  const useRealAPI = useMemo(
    () => import.meta.env.VITE_USE_REAL_API === "true",
    [],
  );

  // 上長・管理者かどうかの判定（メモ化）
  const canAccessSupervisorDashboard = useMemo(
    () => user?.role === "上長" || user?.role === "管理者",
    [user?.role],
  );

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
    <Box p={8} minH="100vh" bg="#F9FAFB">
      <VStack gap={6} align="start">
        <HStack>
          <Heading size="lg" color="gray.800">
            {MessageConst.APP.TITLE}
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

        {/* ユーザー情報表示 */}
        {user && (
          <Box
            p={4}
            bg="green.50"
            borderRadius="md"
            borderLeftWidth="4px"
            borderLeftColor="green.400"
          >
            <VStack align="start" gap={2}>
              <HStack>
                <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                  {MessageConst.AUTH.LOGIN_SUCCESS_DESCRIPTION(
                    user.displayName || user.username,
                  )}
                </Text>
                <Badge colorScheme="blue" variant="solid">
                  {user.role}
                </Badge>
              </HStack>
              <Text fontSize="sm" color="gray.600">
                ID: {user.id} | Email: {user.email || "未設定"}
              </Text>
            </VStack>
          </Box>
        )}

        {/* 役職別アクション */}
        {user && (
          <Box p={4} bg="gray.50" borderRadius="md" w="full">
            <VStack align="start" gap={3}>
              <Text fontSize="md" fontWeight="semibold" color="gray.700">
                利用可能な機能
              </Text>
              <HStack gap={3}>
                {canAccessSupervisorDashboard && (
                  <Button variant="primary" onClick={handleSupervisorDashboard}>
                    {MessageConst.ACTION.VIEW_TEAM_REPORTS}
                  </Button>
                )}
                <Button variant="secondary" onClick={handleCreateReport}>
                  {MessageConst.ACTION.CREATE_REPORT}
                </Button>
                <Button variant="secondary" onClick={handleViewHistory}>
                  {MessageConst.ACTION.VIEW_HISTORY}
                </Button>
              </HStack>
            </VStack>
          </Box>
        )}

        <Text fontSize="lg" color="gray.700">
          {MessageConst.APP.WELCOME_MESSAGE}
        </Text>
        <Text color="gray.700">{MessageConst.APP.HOME_DESCRIPTION}</Text>

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
                {MessageConst.DEV.REAL_API_SWITCH_INSTRUCTION}
              </Text>
            </VStack>
          </Box>
        )}

        <Button variant="danger" onClick={logout}>
          {MessageConst.ACTION.LOGOUT}
        </Button>
      </VStack>
    </Box>
  );
};

// メモ化による再レンダリング最適化
export const Home = memo(HomeComponent);
