import { Box, VStack, HStack, Text, Badge } from "@chakra-ui/react";
import { memo } from "react";
import type { UserInfo } from "../../types";
import { MessageConst } from "../../constants/MessageConst";

type UserInfoSectionProps = {
  user: UserInfo;
};

/**
 * ユーザー情報表示セクション (Organism)
 *
 * 機能:
 * - ログインユーザーの基本情報表示
 * - 表示名・ロール・ID・Emailの可視化
 * - 緑色の情報ボックスでの統一デザイン
 *
 * デザイン:
 * - 緑色のアクセントカラー（成功状態）
 * - 左ボーダーによる視覚的強調
 * - バッジによるロール表示
 */
const UserInfoSectionComponent = ({ user }: UserInfoSectionProps) => {
  return (
    <Box p={4} bg="green.50" borderRadius="md" borderLeftWidth="4px" borderLeftColor="green.400">
      <VStack align="start" gap={2}>
        <HStack>
          <Text fontSize="lg" fontWeight="semibold" color="gray.700">
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
  );
};

export const UserInfoSection = memo(UserInfoSectionComponent);
