import { Box, Heading, VStack, HStack } from "@chakra-ui/react";
import { useMemo, memo, useCallback } from "react";
import { UserInfoSection, DevModeSection, ActionSection } from "../components/organisms";
import { useAuth, useRightPane } from "@/hooks";
import { MessageConst } from "../constants/MessageConst";
import { LogoutButton } from "@/components/molecules/LogoutButton";
import { DailyReportForm } from "./DailyReportForm";
import { DailyReportList } from "./DailyReportList";
import { SupervisorDashboard } from "./SupervisorDashboard";

/**
 * ホームページコンポーネント (Organism)
 *
 * 機能:
 * - ログイン成功後のメイン画面
 * - 分割されたセクションによる機能表示
 * - ログアウト機能
 *
 * アーキテクチャ:
 * - UserInfoSection: ユーザー情報表示
 * - DevModeSection: 開発モード情報
 * - ActionSection: 役職別機能ボタン
 */
const HomeComponent = () => {
  const { user, logout } = useAuth();
  const { view: rightPaneView } = useRightPane();

  // 開発モードの判定（メモ化）
  const isDevelopment = useMemo(() => import.meta.env.DEV, []);
  const useRealAPI = useMemo(() => import.meta.env.VITE_USE_REAL_API === "true", []);

  // 右ペイン表示コンテンツのレンダリング（メモ化）
  const renderRightPane = useCallback(() => {
    switch (rightPaneView.type) {
      case "create":
        return <DailyReportForm />;
      case "edit":
        return <DailyReportForm isEditMode reportId={rightPaneView.reportId} />;
      case "list":
        return <DailyReportList />;
      case "detail":
        // 詳細画面は今後実装予定のため、とりあえず一覧表示に戻す
        return <DailyReportList />;
      case "supervisor":
        return <SupervisorDashboard />;
      default:
        return <DailyReportForm />;
    }
  }, [rightPaneView]);

  return (
    <Box w="100vw" minH="100vh" bg="#F9FAFB">
      <HStack h="100vh" align="stretch" gap={0}>
        {/* 左側ペイン */}
        <Box w="20%" p={6} overflowY="auto" bg="#F9FAFB">
          <VStack gap={4} align="start">
            <Heading size="md" color="gray.800">
              {MessageConst.APP.TITLE}
            </Heading>

            {/* 開発モード情報表示 */}
            <DevModeSection isDevelopment={isDevelopment} useRealAPI={useRealAPI} />

            {/* ユーザー情報表示 */}
            {user && <UserInfoSection user={user} />}

            {/* 役職別アクション */}
            {user && <ActionSection user={user} />}

            <LogoutButton logout={logout} />
          </VStack>
        </Box>

        {/* 右側ペイン */}
        <Box flex="1" borderLeft="1px" borderColor="gray.200" bg="white" overflowY="auto" h="100vh">
          {renderRightPane()}
        </Box>
      </HStack>
    </Box>
  );
};

// メモ化による再レンダリング最適化
export const Home = memo(HomeComponent);
