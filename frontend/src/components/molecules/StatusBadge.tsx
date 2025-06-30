import { Badge } from "@chakra-ui/react";

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

type StatusBadgeProps = {
  /** 表示するステータスタイプ */
  status: "dev-mock" | "dev-api" | "production" | "success" | "warning" | "error";
  /** 表示テキスト */
  children: React.ReactNode;
  /** バッジのバリアント */
  variant?: "solid" | "outline" | "subtle";
};

/**
 * ステータスに応じた色スキームを決定
 */
const getColorScheme = (status: StatusBadgeProps["status"]) => {
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

export const StatusBadge = ({ 
  status, 
  children, 
  variant = "solid" 
}: StatusBadgeProps) => {
  return (
    <Badge 
      colorScheme={getColorScheme(status)} 
      variant={variant}
      fontWeight="semibold"
      fontSize="xs"
      px={3}
      py={1}
      borderRadius="full"
    >
      {children}
    </Badge>
  );
};