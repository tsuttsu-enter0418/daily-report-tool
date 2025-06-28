import { type ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAtomValue, useSetAtom } from "jotai";
import Cookies from "js-cookie";
import { apiService } from "../services/apiService";
import { Box, Spinner, Text } from "@chakra-ui/react";
import { isAuthenticatedAtom, logoutAtom } from "../stores";

/**
 * 認証保護ルートコンポーネント (Organism)
 * 
 * 機能:
 * - Jotai状態管理からの認証状態確認
 * - JWT トークンの存在確認
 * - トークンの有効性検証
 * - 未認証時のログイン画面リダイレクト
 * - 認証中のローディング表示
 * 
 * 使用場面:
 * - ホーム画面など認証が必要なページ
 * - 管理者専用ページ
 * - ユーザー設定ページ
 */

type ProtectedRouteProps = {
  children: ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const performLogout = useSetAtom(logoutAtom);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    /**
     * 認証状態の検証処理
     * 
     * 処理フロー:
     * 1. Jotai状態管理の認証状態を確認
     * 2. 未認証の場合、Cookieから JWT トークンを取得
     * 3. トークンが存在しない場合はログイン画面へ
     * 4. APIサービス経由でトークンの有効性を検証
     * 5. 無効な場合はCookieを削除してJotai状態をクリア、ログイン画面へ
     * 6. 有効な場合は認証完了として子コンポーネントを表示
     */
    const validateAuth = async () => {
      // Jotai状態管理で既に認証済みの場合はスキップ
      if (isAuthenticated) {
        setIsValidating(false);
        return;
      }

      const token = Cookies.get("authToken");
      
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const isValid = await apiService.validateToken(token);
        if (!isValid) {
          // 無効なトークンの場合、Cookieを削除してJotai状態をクリア
          Cookies.remove("authToken");
          performLogout();
          navigate("/login");
        }
      } catch (error) {
        console.error("認証エラー:", error);
        Cookies.remove("authToken");
        performLogout();
        navigate("/login");
      } finally {
        setIsValidating(false);
      }
    };

    validateAuth();
  }, [navigate, isAuthenticated, performLogout]);

  if (isValidating) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        alignItems="center" 
        justifyContent="center" 
        height="100vh"
        gap={4}
      >
        <Spinner size="lg" />
        <Text>認証確認中...</Text>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};