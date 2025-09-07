import { memo } from "react";
import { Center, VStack, Text } from "@chakra-ui/react";
import { Button } from "../atoms";

/**
 * エラー状態表示コンポーネント (Molecule)
 *
 * 機能:
 * - データ取得エラーの統一されたエラー表示
 * - エラーメッセージとリトライボタンの表示
 * - メモ化による再レンダリング最適化
 *
 * 使用場面:
 * - API通信エラー時の表示
 * - データ取得失敗時のフィードバック
 * - ネットワークエラー時のリトライ機能
 */

export type ErrorStateProps = {
  /** エラーメッセージ */
  error: string;
  /** 再試行時のハンドラー */
  onRetry: () => void;
  /** エラータイトル */
  title?: string;
  /** リトライボタンのラベル */
  retryLabel?: string;
};

/**
 * ErrorState 本体コンポーネント
 */
const ErrorStateComponent = ({
  error,
  onRetry,
  title = "データの読み込みに失敗しました",
  retryLabel = "再試行",
}: ErrorStateProps) => (
  <Center py={20}>
    <VStack gap={4}>
      <Text color="red.500" fontSize="lg" fontWeight="medium">
        {title}
      </Text>
      <Text color="gray.600" fontSize="md" textAlign="center">
        {error}
      </Text>
      <Button variant="primary" onClick={onRetry}>
        {retryLabel}
      </Button>
    </VStack>
  </Center>
);

/**
 * ErrorState（メモ化による最適化版）
 */
export const ErrorState = memo(ErrorStateComponent);
