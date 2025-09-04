/* eslint-disable complexity */
import { Fragment } from "react";
import { Box, VStack, Text } from "@chakra-ui/react";
import { StatusBadge } from "./StatusBadge";
import { MessageConst } from "../../constants/MessageConst";

/**
 * DevModeIndicator (Molecule)
 *
 * 機能:
 * - 開発モード時のAPI状態表示（バッジ）
 * - モックAPI使用時の説明ボックス表示
 * - 本番環境では表示されない開発者向け情報
 *
 * 使用例:
 * ```tsx
 * <DevModeIndicator
 *   isDevelopment={isDevelopment}
 *   useRealAPI={useRealAPI}
 * />
 * ```
 *
 * 表示パターン:
 * - 本番環境: 何も表示しない
 * - 開発環境 + モックAPI: モックバッジ + 説明ボックス
 * - 開発環境 + 実API: 実APIバッジのみ
 */

type DevModeIndicatorProps = {
  /** 開発環境かどうか */
  isDevelopment: boolean;
  /** 実APIを使用するかどうか */
  useRealAPI: boolean;
  /** バッジ表示モード: "inline" | "block" */
  badgeMode?: "inline" | "block";
  /** 説明ボックスを表示するかどうか */
  showDescription?: boolean;
  /** バッジを表示するかどうか */
  showBadge?: boolean;
};

export const DevModeIndicator = ({
  isDevelopment,
  useRealAPI,
  badgeMode = "inline",
  showDescription = true,
  showBadge = true,
}: DevModeIndicatorProps) => {
  // 本番環境では何も表示しない
  if (!isDevelopment) {
    return null;
  }

  return (
    <Fragment>
      {/* 開発モードバッジ表示 */}
      {showBadge && (
        <>
          {badgeMode === "inline" ? (
            // インライン表示（ヘッダー内等）
            <Fragment>
              {!useRealAPI && (
                <StatusBadge status="dev-mock">{MessageConst.DEV.MOCK_API_MODE}</StatusBadge>
              )}
              {useRealAPI && (
                <StatusBadge status="dev-api">{MessageConst.DEV.REAL_API_MODE}</StatusBadge>
              )}
            </Fragment>
          ) : (
            // ブロック表示（独立したセクション）
            <Box>
              {!useRealAPI && (
                <StatusBadge status="dev-mock">{MessageConst.DEV.MOCK_API_MODE}</StatusBadge>
              )}
              {useRealAPI && (
                <StatusBadge status="dev-api">{MessageConst.DEV.REAL_API_MODE}</StatusBadge>
              )}
            </Box>
          )}
        </>
      )}
    </Fragment>
  );
};
