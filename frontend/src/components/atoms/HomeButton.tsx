import { useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./Button";
import { type CommonComponentProps } from "../../types";

/**
 * ホームボタンコンポーネント (Atom)
 *
 * 機能:
 * - ホーム画面（/home）への遷移
 * - 統一されたスタイル設定
 * - 全ページで再利用可能
 *
 * 使用場面:
 * - 各ページのヘッダー部分
 * - ユーザーがホーム画面に戻りたい時
 * - ナビゲーション導線として
 */

type HomeButtonProps = CommonComponentProps & {
  /** ボタンのサイズ（デフォルト: md） */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** ボタンテキスト（デフォルト: ホームに戻る） */
  children?: React.ReactNode;
};

const HomeButtonComponent = ({
  size = "md",
  children = "ホームに戻る",
  "aria-label": ariaLabel,
  ...props
}: HomeButtonProps) => {
  const navigate = useNavigate();

  const handleGoHome = useCallback(() => {
    navigate("/home");
  }, [navigate]);

  return (
    <Button
      variant="secondary"
      size={size}
      onClick={handleGoHome}
      aria-label={ariaLabel || "ホーム画面に戻る"}
      {...props}
    >
      {children}
    </Button>
  );
};

// メモ化による再レンダリング最適化
export const HomeButton = memo(HomeButtonComponent);