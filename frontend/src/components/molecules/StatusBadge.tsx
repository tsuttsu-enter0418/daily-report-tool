import { Badge } from "@chakra-ui/react";
import { memo, useMemo } from "react";
import { type StatusBadgeType, type CommonComponentProps } from "../../types";

/**
 * ステータス表示バッジコンポーネント (Molecule)
 *
 * 機能:
 * - 開発モード・本番モードの表示
 * - 日報ステータスの表示
 * - 色分けによる状態の視覚化
 *
 * 再利用場面:
 * - ログイン画面での開発モード表示
 * - ホーム画面でのAPI使用状況表示
 * - 日報一覧での進捗ステータス表示
 */

/**
 * StatusBadgeコンポーネントのProps型定義（型安全性向上）
 */
type StatusBadgeProps = CommonComponentProps & {
  /** 表示するステータスタイプ（必須） */
  status: StatusBadgeType;
  /** 表示テキスト（必須） */
  children: React.ReactNode;
  /** バッジのバリアント（デフォルト: solid） */
  variant?: "solid" | "outline" | "subtle";
  /** サイズ（デフォルト: sm） */
  size?: "xs" | "sm" | "md" | "lg";
};

/**
 * ステータスに応じた色スキームを決定
 */
const getColorScheme = (status: StatusBadgeType) => {
  switch (status) {
    case "dev-mock":
      return "orange";
    case "dev-api":
      return "teal";
    case "production":
      return "pink";
    case "success":
      return "teal";
    case "warning":
      return "yellow";
    case "error":
      return "red";
    default:
      return "orange";
  }
};

/**
 * ステータスに応じたアクセシブルな説明を生成
 */
const getStatusDescription = (status: StatusBadgeType): string => {
  switch (status) {
    case "dev-mock":
      return "開発モード（モックAPI使用中）";
    case "dev-api":
      return "開発モード（実API使用中）";
    case "production":
      return "本番環境";
    case "success":
      return "成功ステータス";
    case "warning":
      return "警告ステータス";
    case "error":
      return "エラーステータス";
    default:
      return "ステータス情報";
  }
};

const StatusBadgeComponent = ({
  status,
  children,
  variant = "solid",
  "aria-label": ariaLabel,
}: StatusBadgeProps) => {
  const colorScheme = useMemo(() => getColorScheme(status), [status]);
  const defaultAriaLabel = useMemo(
    () => ariaLabel || getStatusDescription(status),
    [ariaLabel, status],
  );

  return (
    <Badge
      colorScheme={colorScheme}
      variant={variant}
      fontWeight="semibold"
      fontSize="xs"
      px={3}
      py={1}
      borderRadius="full"
      role="status"
      aria-label={defaultAriaLabel}
    >
      {children}
    </Badge>
  );
};

// メモ化による再レンダリング最適化
export const StatusBadge = memo(StatusBadgeComponent);
