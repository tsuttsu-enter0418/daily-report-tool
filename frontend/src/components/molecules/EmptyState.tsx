import { memo } from "react";
import { Box, VStack, Text } from "@chakra-ui/react";
import { Button } from "../atoms";

/**
 * 空状態表示コンポーネント (Molecule)
 *
 * 機能:
 * - データが存在しない場合の統一された空状態表示
 * - 適切なメッセージとアクションボタンの提供
 * - メモ化による再レンダリング最適化
 *
 * 使用場面:
 * - 日報データが存在しない場合
 * - 検索結果が0件の場合
 * - フィルタリング後にデータがない場合
 */

export type EmptyStateProps = {
  /** メインメッセージ */
  title: string;
  /** サブメッセージ */
  description: string;
  /** アクションボタンのラベル */
  actionLabel: string;
  /** アクションボタンクリック時のハンドラー */
  onAction: () => void;
  /** アクションボタンのバリアント */
  actionVariant?: "primary" | "secondary" | "danger";
};

/**
 * EmptyState 本体コンポーネント
 */
const EmptyStateComponent = ({
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = "primary",
}: EmptyStateProps) => (
  <Box textAlign="center" py={10} w="full">
    <VStack gap={4}>
      <Text color="gray.600" fontSize="lg" fontWeight="semibold">
        {title}
      </Text>
      <Text color="gray.500" fontSize="md">
        {description}
      </Text>
      <Button variant={actionVariant} onClick={onAction}>
        {actionLabel}
      </Button>
    </VStack>
  </Box>
);

/**
 * EmptyState（メモ化による最適化版）
 */
export const EmptyState = memo(EmptyStateComponent);
