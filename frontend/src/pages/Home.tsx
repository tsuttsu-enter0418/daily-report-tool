import { Box, Heading, Text, VStack, HStack, Badge } from "@chakra-ui/react";
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
export const Home = () => {
  const { user, logout } = useAuth();
  
  // 開発モードかどうかの判定
  const isDevelopment = import.meta.env.DEV;
  const useRealAPI = import.meta.env.VITE_USE_REAL_API === 'true';

  return (
    <Box p={8}>
      <VStack spacing={6} align="start">
        <HStack>
          <Heading size="lg">{MessageConst.APP.TITLE}</Heading>
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
          <Box p={4} bg="green.50" borderRadius="md" borderLeftWidth="4px" borderLeftColor="green.400">
            <VStack align="start" spacing={2}>
              <HStack>
                <Text fontSize="lg" fontWeight="semibold">
                  {MessageConst.AUTH.LOGIN_SUCCESS_DESCRIPTION(user.displayName || user.username)}
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
        
        <Text fontSize="lg">{MessageConst.APP.WELCOME_MESSAGE}</Text>
        <Text>{MessageConst.APP.HOME_DESCRIPTION}</Text>
        
        {/* 開発モード時の説明 */}
        {isDevelopment && !useRealAPI && (
          <Box p={4} bg="blue.50" borderRadius="md" borderLeftWidth="4px" borderLeftColor="blue.400">
            <VStack align="start" spacing={1}>
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