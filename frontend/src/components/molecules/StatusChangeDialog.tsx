import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  Alert,
} from "@chakra-ui/react";
import { MdCheck, MdEdit } from "react-icons/md";
import { useCallback, memo } from "react";
import { Button } from "../atoms";
import { StatusBadge } from "./StatusBadge";
import type { CommonComponentProps, DailyReportStatus } from "../../types";

/**
 * ステータス変更確認ダイアログコンポーネント (Molecule)
 *
 * 機能:
 * - 日報ステータス変更の確認ダイアログ表示
 * - 下書き→提出済み / 提出済み→下書きの変更
 * - 変更理由の説明表示
 * - エラーハンドリング
 *
 * 使用場面:
 * - 日報詳細画面でのステータス変更
 * - 日報一覧画面での一括ステータス変更
 */

/**
 * StatusChangeDialogコンポーネントのProps型定義
 */
type StatusChangeDialogProps = CommonComponentProps & {
  /** ダイアログの表示状態 */
  isOpen: boolean;
  /** ダイアログを閉じる関数 */
  onClose: () => void;
  /** ステータス変更確定時の関数 */
  onConfirm: (newStatus: DailyReportStatus) => Promise<void> | void;
  /** 日報タイトル */
  reportTitle: string;
  /** 現在のステータス */
  currentStatus: DailyReportStatus;
  /** 変更後のステータス */
  newStatus: DailyReportStatus;
  /** ステータス変更中のローディング状態 */
  isChanging?: boolean;
  /** エラーが発生した場合のメッセージ */
  errorMessage?: string;
  /** ダイアログのサイズ */
  size?: "sm" | "md" | "lg";
};

/**
 * ステータス変更の説明を取得
 */
const getStatusChangeDescription = (
  currentStatus: DailyReportStatus,
  newStatus: DailyReportStatus,
): { title: string; description: string; icon: React.ReactElement } => {
  if (currentStatus === "draft" && newStatus === "submitted") {
    return {
      title: "日報を提出しますか？",
      description:
        "下書きから提出済み状態に変更します。提出後も編集や取り下げは可能です。",
      icon: <MdCheck />,
    };
  }

  if (currentStatus === "submitted" && newStatus === "draft") {
    return {
      title: "日報を取り下げますか？",
      description:
        "提出済みから下書き状態に戻します。再度提出するまで上司には表示されません。",
      icon: <MdEdit />,
    };
  }

  return {
    title: "ステータスを変更しますか？",
    description: "日報の状態を変更します。",
    icon: <EditIcon />,
  };
};

/**
 * ステータス表示名を取得
 */
const getStatusDisplayName = (status: DailyReportStatus): string => {
  switch (status) {
    case "draft":
      return "下書き";
    case "submitted":
      return "提出済み";
    default:
      return "不明";
  }
};

const StatusChangeDialogComponent = ({
  isOpen,
  onClose,
  onConfirm,
  reportTitle,
  currentStatus,
  newStatus,
  isChanging = false,
  errorMessage,
  size = "md",
}: StatusChangeDialogProps) => {
  // ステータス変更確定ハンドラー
  const handleConfirm = useCallback(async () => {
    try {
      await onConfirm(newStatus);
    } catch (error) {
      console.error("ステータス変更処理エラー:", error);
    }
  }, [onConfirm, newStatus]);

  // キャンセルハンドラー
  const handleCancel = useCallback(() => {
    if (!isChanging) {
      onClose();
    }
  }, [onClose, isChanging]);

  // ステータス変更の説明を取得
  const { title, description, icon } = getStatusChangeDescription(
    currentStatus,
    newStatus,
  );

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
              <Box p={2} bg="orange.100" borderRadius="full" color="orange.600">
                {icon}
              </Box>
              <VStack align="start" flex={1} gap={1}>
                <Heading size="md" color="gray.800">
                  {title}
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  {description}
                </Text>
              </VStack>
            </HStack>

            {/* 対象日報の情報 */}
            <Box
              p={4}
              bg="gray.50"
              borderRadius="md"
              border="1px"
              borderColor="gray.200"
            >
              <VStack align="start" gap={3}>
                <Text fontWeight="semibold" color="gray.800">
                  対象日報:
                </Text>
                <Text color="gray.700" wordBreak="break-word">
                  {reportTitle}
                </Text>

                {/* ステータス変更の視覚的表示 */}
                <HStack gap={3} align="center">
                  <VStack gap={1} align="center">
                    <Text fontSize="sm" color="gray.600">
                      現在
                    </Text>
                    <StatusBadge status={currentStatus}>
                      {getStatusDisplayName(currentStatus)}
                    </StatusBadge>
                  </VStack>

                  <Text color="gray.400" fontSize="lg">
                    →
                  </Text>

                  <VStack gap={1} align="center">
                    <Text fontSize="sm" color="gray.600">
                      変更後
                    </Text>
                    <StatusBadge status={newStatus}>
                      {getStatusDisplayName(newStatus)}
                    </StatusBadge>
                  </VStack>
                </HStack>
              </VStack>
            </Box>

            {/* 情報メッセージ */}
            <Alert.Root status="info" borderRadius="md">
              <VStack align="start" gap={1} flex={1}>
                <Text fontSize="sm" fontWeight="medium">
                  {newStatus === "submitted"
                    ? "提出後も編集・取り下げが可能です"
                    : "下書きに戻すと上司には表示されません"}
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
              <Button
                variant="secondary"
                onClick={handleCancel}
                disabled={isChanging}
              >
                キャンセル
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirm}
                loading={isChanging}
                loadingText="変更中..."
                leftIcon={!isChanging ? icon : undefined}
              >
                {newStatus === "submitted" ? "提出する" : "下書きに戻す"}
              </Button>
            </HStack>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  );
};

// メモ化による再レンダリング最適化
export const StatusChangeDialog = memo(StatusChangeDialogComponent);
