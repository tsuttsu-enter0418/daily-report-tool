import { memo } from "react";
import { Center, VStack, Spinner, Text } from "@chakra-ui/react";

/**
 * ローディング状態表示コンポーネント (Molecule)
 *
 * 機能:
 * - データ読み込み中の統一されたローディング表示
 * - スピナーとメッセージでユーザーフィードバック
 * - メモ化による再レンダリング最適化
 *
 * 使用場面:
 * - 日報一覧のデータ取得中
 * - API リクエスト処理中の待機表示
 * - 非同期処理のローディング状態
 */

export type LoadingStateProps = {
  /** ローディングメッセージ */
  message?: string;
  /** スピナーサイズ */
  size?: "sm" | "md" | "lg" | "xl";
  /** スピナーの色 */
  color?: string;
};

/**
 * LoadingState 本体コンポーネント
 */
const LoadingStateComponent = ({
  message = "データを読み込み中...",
  size = "xl",
  color = "blue.500",
}: LoadingStateProps) => (
  <Center py={20}>
    <VStack gap={4}>
      <Spinner size={size} color={color} aria-label="読み込み中" />
      <Text color="gray.600" fontSize="lg">
        {message}
      </Text>
    </VStack>
  </Center>
);

/**
 * LoadingState（メモ化による最適化版）
 */
export const LoadingState = memo(LoadingStateComponent);
