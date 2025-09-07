import { HStack } from "@chakra-ui/react";
import { memo } from "react";
import { StatusBadge } from "../molecules";
import { MessageConst } from "../../constants/MessageConst";

type DevModeSectionProps = {
  isDevelopment: boolean;
  useRealAPI: boolean;
};

/**
 * 開発モード情報表示セクション (Organism)
 *
 * 機能:
 * - 開発環境での API モード表示（Mock/Real）
 * - 開発者向けの情報提供
 * - API 切り替え説明の表示
 *
 * 表示条件:
 * - 開発モード時のみ表示
 * - Mock API / Real API の状態表示
 * - 青色のアクセントカラーで開発情報を強調
 */
const DevModeSectionComponent = ({ isDevelopment, useRealAPI }: DevModeSectionProps) => {
  if (!isDevelopment) return null;

  return (
    <>
      {/* API モード状態表示 */}
      <HStack>
        {!useRealAPI && (
          <StatusBadge status="dev-mock">{MessageConst.DEV.MOCK_API_MODE}</StatusBadge>
        )}
        {useRealAPI && <StatusBadge status="dev-api">{MessageConst.DEV.REAL_API_MODE}</StatusBadge>}
      </HStack>
    </>
  );
};

export const DevModeSection = memo(DevModeSectionComponent);
