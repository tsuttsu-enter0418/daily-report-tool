import {
  Button as ChakraButton,
  type ButtonProps,
  Spinner,
} from "@chakra-ui/react";
import { forwardRef } from "react";
import { type ButtonVariant } from "../../types";

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

type CustomButtonProps = Omit<ButtonProps, "loading" | "variant"> & {
  /** ローディング状態（デフォルト: false） */
  loading?: boolean;
  /** ローディング時のテキスト */
  loadingText?: string;
  /** ボタンの用途に応じたバリアント */
  variant?: ButtonVariant;
};

/**
 * バリアントに応じたスタイルを返す
 */
const getVariantStyles = (variant: CustomButtonProps["variant"]) => {
  switch (variant) {
    case "primary":
      return {
        bg: "orange.500",
        color: "white",
        _hover: { bg: "orange.600" },
        _active: { bg: "orange.700" },
      };
    case "secondary":
      return {
        bg: "white",
        color: "gray.700",
        border: "2px solid",
        borderColor: "orange.200",
        _hover: { 
          bg: "orange.50",
          borderColor: "orange.300",
          transform: "translateY(-1px)",
          boxShadow: "sm"
        },
        _active: { 
          bg: "orange.100",
          borderColor: "orange.400",
          transform: "translateY(0)"
        },
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
        _hover: { bg: "orange.50" },
        _active: { bg: "orange.100" },
      };
    default:
      return {
        bg: "orange.500",
        color: "white",
        _hover: { bg: "orange.600" },
        _active: { bg: "orange.700" },
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
        bg={variantStyles.bg}
        color={variantStyles.color}
        _hover={variantStyles._hover}
        _active={variantStyles._active}
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
