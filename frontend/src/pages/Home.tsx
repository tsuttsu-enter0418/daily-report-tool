import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import { useMemo, memo } from "react";
import { UserInfoSection, DevModeSection, ActionSection } from "../components/organisms";
import { useAuth } from "../hooks";
import { MessageConst } from "../constants/MessageConst";
import { LogoutButton } from "@/components/molecules/LogoutButton";

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

  // 開発モードの判定（メモ化）
  const isDevelopment = useMemo(() => import.meta.env.DEV, []);
  const useRealAPI = useMemo(() => import.meta.env.VITE_USE_REAL_API === "true", []);

  return (
    <Box p={8} minH="100vh" bg="#F9FAFB">
      <VStack gap={6} align="start">
        <Heading size="lg" color="gray.800">
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
  );
};

// メモ化による再レンダリング最適化
export const Home = memo(HomeComponent);
