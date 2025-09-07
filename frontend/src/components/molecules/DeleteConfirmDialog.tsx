import { Box, VStack, HStack, Text, Heading, Card, Alert } from "@chakra-ui/react";
import { MdDelete, MdWarning } from "react-icons/md";
import { useCallback, memo } from "react";
import { Button } from "../atoms";
import type { CommonComponentProps } from "../../types";

/**
 * 削除確認ダイアログコンポーネント (Molecule)
 *
 * 機能:
 * - 削除操作の確認ダイアログ表示
 * - 削除対象の情報表示
 * - 安全な削除操作の実行
 * - エラーハンドリング
 *
 * 使用場面:
 * - 日報削除時の確認
 * - その他重要なデータ削除時の確認
 */

/**
 * DeleteConfirmDialogコンポーネントのProps型定義
 */
type DeleteConfirmDialogProps = CommonComponentProps & {
  /** ダイアログの表示状態 */
  isOpen: boolean;
  /** ダイアログを閉じる関数 */
  onClose: () => void;
  /** 削除確定時の関数 */
  onConfirm: () => Promise<void> | void;
  /** 削除対象のタイトル */
  title: string;
  /** 削除対象の詳細（オプション） */
  description?: string;
  /** 削除中のローディング状態 */
  isDeleting?: boolean;
  /** 削除操作でエラーが発生した場合のメッセージ */
  errorMessage?: string;
  /** ダイアログのサイズ */
  size?: "sm" | "md" | "lg";
};

const DeleteConfirmDialogComponent = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isDeleting = false,
  errorMessage,
  size = "md",
}: DeleteConfirmDialogProps) => {
  // 削除確定ハンドラー
  const handleConfirm = useCallback(async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error("削除処理エラー:", error);
    }
  }, [onConfirm]);

  // キャンセルハンドラー
  const handleCancel = useCallback(() => {
    if (!isDeleting) {
      onClose();
    }
  }, [onClose, isDeleting]);

  if (!isOpen) return null;

  const maxWidth = {
    sm: "sm",
    md: "md",
    lg: "lg",
  }[size];

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0, 0, 0, 0.5)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={1000}
      p={4}
    >
      <Card.Root
        bg="white"
        borderRadius="xl"
        boxShadow="2xl"
        maxW={maxWidth}
        w="full"
        mx={4}
        overflow="hidden"
      >
        <Card.Body p={6}>
          <VStack gap={5} align="stretch">
            {/* ヘッダー */}
            <HStack gap={3} align="start">
              <Box p={2} bg="red.100" borderRadius="full" color="red.600">
                <MdWarning size={20} />
              </Box>
              <VStack align="start" flex={1} gap={1}>
                <Heading size="md" color="gray.800">
                  削除の確認
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  この操作は取り消すことができません
                </Text>
              </VStack>
            </HStack>

            {/* 削除対象の情報 */}
            <Box p={4} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200">
              <VStack align="start" gap={2}>
                <Text fontWeight="semibold" color="gray.800">
                  削除対象:
                </Text>
                <Text color="gray.700" wordBreak="break-word">
                  {title}
                </Text>
                {description && (
                  <Text color="gray.600" fontSize="sm">
                    {description}
                  </Text>
                )}
              </VStack>
            </Box>

            {/* 警告メッセージ */}
            <Alert.Root status="warning" borderRadius="md">
              <VStack align="start" gap={1} flex={1}>
                <Text fontSize="sm" fontWeight="medium">
                  本当に削除しますか？
                </Text>
                <Text fontSize="sm" color="gray.50">
                  削除されたデータは復元できません。
                </Text>
              </VStack>
            </Alert.Root>

            {/* エラーメッセージ */}
            {errorMessage && (
              <Alert.Root status="error" borderRadius="md">
                <Text fontSize="sm">{errorMessage}</Text>
              </Alert.Root>
            )}

            {/* アクションボタン */}
            <HStack gap={3} justify="flex-end">
              <Button variant="secondary" onClick={handleCancel} disabled={isDeleting}>
                キャンセル
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirm}
                loading={isDeleting}
                loadingText="削除中..."
              >
                {!isDeleting ? <MdDelete /> : undefined}
                削除する
              </Button>
            </HStack>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  );
};

// メモ化による再レンダリング最適化
export const DeleteConfirmDialog = memo(DeleteConfirmDialogComponent);
