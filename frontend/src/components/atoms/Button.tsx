import {
  Button as ChakraButton,
  type ButtonProps,
  Spinner,
} from "@chakra-ui/react";
import { forwardRef, useMemo } from "react";
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
  /** アクセシブルなボタンラベル（スクリーンリーダー用） */
  "aria-label"?: string;
  /** ボタンの詳細説明（必要に応じて） */
  "aria-describedby"?: string;
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
    ref
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
            <Spinner 
              size="sm" 
              mr={2}
              aria-label="読み込み中"
            />
            {loadingText || children}
          </>
        ) : (
          children
        )}
      </ChakraButton>
    );
  }
);

ButtonComponent.displayName = "Button";

// メモ化による再レンダリング最適化
export const Button = ButtonComponent;
