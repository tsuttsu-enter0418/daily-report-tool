import { memo } from "react";
import { Button } from "../atoms/Button";
import { MessageConst } from "../../constants/MessageConst";

type LogoutButtonProps = {
  logout: () => void;
};

/**
 * ログアウトボタンコンポーネント (Molecule)
 *
 * 機能:
 * - ログアウト実行ボタン
 * - 危険操作を示すvariantスタイル
 * - メッセージ定数による統一テキスト
 */
const LogoutButtonComponent = ({ logout }: LogoutButtonProps) => {
  return (
    <Button variant="danger" onClick={logout}>
      {MessageConst.ACTION.LOGOUT}
    </Button>
  );
};

export const LogoutButton = memo(LogoutButtonComponent);
