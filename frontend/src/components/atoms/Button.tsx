import {
  Button as ChakraButton,
  type ButtonProps,
  Spinner,
} from "@chakra-ui/react";
import { forwardRef } from "react";

/**
 * カスタムButtonコンポーネント (Atom)
 *
 * 機能:
 * - ChakraUI v3.2対応のButtonラッパー
 * - 手動実装のローディング機能（Spinner + disabled）
 * - 統一されたスタイル設定
 * - プロジェクト標準のButton設定
 * - 4つのバリアント（primary, secondary, danger, ghost）
 *
 * 使用場面:
 * - フォーム送信ボタン
 * - アクションボタン
 * - ナビゲーションボタン
 */

type CustomButtonProps = Omit<ButtonProps, "loading"> & {
  /** ローディング状態（デフォルト: false） */
  loading?: boolean;
  /** ローディング時のテキスト */
  loadingText?: string;
  /** ボタンの用途に応じたバリアント */
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

/**
 * バリアントに応じたスタイルを返す
 */
const getVariantStyles = (variant: CustomButtonProps["variant"]) => {
  switch (variant) {
    case "primary":
      return {
        bg: "blue.500",
        color: "white",
        _hover: { bg: "blue.600" },
        _active: { bg: "blue.700" },
      };
    case "secondary":
      return {
        bg: "gray.100",
        color: "gray.700",
        _hover: { bg: "gray.200" },
        _active: { bg: "gray.300" },
      };
    case "danger":
      return {
        bg: "red.500",
        color: "white",
        _hover: { bg: "red.600" },
        _active: { bg: "red.700" },
      };
    case "ghost":
      return {
        bg: "transparent",
        _hover: { bg: "gray.100" },
        _active: { bg: "gray.200" },
      };
    default:
      return {
        bg: "blue.500",
        color: "white",
        _hover: { bg: "blue.600" },
        _active: { bg: "blue.700" },
      };
  }
};

export const Button = forwardRef<HTMLButtonElement, CustomButtonProps>(
  (
    {
      children,
      loading = false,
      loadingText,
      variant = "primary",
      size = "lg",
      fontWeight = "semibold",
      disabled,
      ...props
    },
    ref
  ) => {
    const variantStyles = getVariantStyles(variant);

    return (
      <ChakraButton
        ref={ref}
        disabled={disabled || loading}
        size={size}
        fontWeight={fontWeight}
        {...variantStyles}
        {...props}
      >
        {loading ? (
          <>
            <Spinner size="sm" mr={2} />
            {loadingText || children}
          </>
        ) : (
          children
        )}
      </ChakraButton>
    );
  }
);
