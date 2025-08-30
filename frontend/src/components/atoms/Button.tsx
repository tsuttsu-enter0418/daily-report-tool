import { Button as ChakraButton, type ButtonProps, Spinner } from "@chakra-ui/react";
import { forwardRef, useMemo } from "react";
import { type ButtonVariant, type CommonComponentProps } from "../../types";

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

/**
 * カスタムButtonコンポーネントのProps型定義（型安全性向上）
 */
type CustomButtonProps = Omit<ButtonProps, "loading" | "variant"> &
  CommonComponentProps & {
    /** ローディング状態（デフォルト: false） */
    loading?: boolean;
    /** ローディング時のテキスト */
    loadingText?: string;
    /** ボタンの用途に応じたバリアント（デフォルト: primary） */
    variant?: ButtonVariant;
  };

/**
 * バリアントに応じたスタイルを返す
 */
const getVariantStyles = (variant: CustomButtonProps["variant"]) => {
  switch (variant) {
    case "primary":
      return {
        bg: "blue.600",
        color: "white",
        _hover: { bg: "blue.700" },
        _active: { bg: "blue.800" },
      };
    case "secondary":
      return {
        bg: "white",
        color: "gray.700",
        border: "1px solid",
        borderColor: "gray.300",
        _hover: {
          bg: "gray.50",
          borderColor: "gray.400",
          transform: "translateY(-1px)",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        },
        _active: {
          bg: "gray.100",
          borderColor: "gray.500",
          transform: "translateY(0)",
        },
      };
    case "danger":
      return {
        bg: "red.600",
        color: "white",
        _hover: { bg: "red.700" },
        _active: { bg: "red.800" },
      };
    case "ghost":
      return {
        bg: "transparent",
        _hover: { bg: "gray.100" },
        _active: { bg: "gray.200" },
      };
    default:
      return {
        bg: "blue.600",
        color: "white",
        _hover: { bg: "blue.700" },
        _active: { bg: "blue.800" },
      };
  }
};

const ButtonComponent = forwardRef<HTMLButtonElement, CustomButtonProps>(
  (
    {
      children,
      loading = false,
      loadingText,
      variant = "primary",
      size = "lg",
      fontWeight = "semibold",
      disabled,
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedby,
      ...props
    },
    ref,
  ) => {
    const variantStyles = useMemo(() => getVariantStyles(variant), [variant]);
    const isDisabled = useMemo(() => disabled || loading, [disabled, loading]);

    return (
      <ChakraButton
        ref={ref}
        disabled={isDisabled}
        size={size}
        fontWeight={fontWeight}
        bg={variantStyles.bg}
        color={variantStyles.color}
        _hover={!isDisabled ? variantStyles._hover : undefined}
        _active={!isDisabled ? variantStyles._active : undefined}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        aria-busy={loading}
        aria-disabled={isDisabled}
        role="button"
        {...props}
      >
        {loading ? (
          <>
            <Spinner size="sm" mr={2} aria-label="読み込み中" />
            {loadingText || children}
          </>
        ) : (
          children
        )}
      </ChakraButton>
    );
  },
);

ButtonComponent.displayName = "Button";

// メモ化による再レンダリング最適化
export const Button = ButtonComponent;
