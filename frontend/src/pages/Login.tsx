import { Box, VStack, Heading, Card, Text } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "../components/atoms";
import { InputField, StatusBadge } from "../components/molecules";
import { useLogin, type LoginFormData } from "../hooks";
import { MessageConst } from "../constants/MessageConst";

/**
 * ログインフォームのバリデーションスキーマ
 */
const schema = yup.object({
  username: yup.string().required(MessageConst.VALIDATION.REQUIRED_USERNAME),
  password: yup.string().required(MessageConst.VALIDATION.REQUIRED_PASSWORD),
});

/**
 * ログインページコンポーネント (Organism)
 *
 * 機能:
 * - ユーザー認証フォーム
 * - 画面幅いっぱいの表示で中央配置
 * - 開発/本番モード表示
 * - Toastによるエラーハンドリング
 * - 認証成功時のリダイレクト
 *
 * 状態管理:
 * - フォームデータ (React Hook Form)
 * - ローディング状態
 * - Toastによるメッセージ表示
 *
 * レイアウト:
 * - 画面全体: 100vw × 100vh
 * - コンテンツ: 中央配置のカード（最大400px）
 * - レスポンシブ対応済み
 */
export const Login = () => {
  const { isLoading, login } = useLogin();

  // 開発モードかどうかの判定
  const isDevelopment = import.meta.env.DEV;
  const useRealAPI = import.meta.env.VITE_USE_REAL_API === "true";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
  });

  return (
    <Box minH="100vh" w="100vw" bg="gray.50">
      <Box
        w="full"
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={{ base: 4, md: 8 }}
      >
        <Card.Root maxW="400px" w="full" shadow="lg">
          <Card.Body p={8}>
            <VStack gap={6}>
              <Heading size="lg" textAlign="center">
                {MessageConst.APP.TITLE}
              </Heading>
              <Heading size="md" textAlign="center" color="gray.600">
                {MessageConst.ACTION.LOGIN}
              </Heading>

              {/* 開発モード表示 */}
              {isDevelopment && !useRealAPI && (
                <StatusBadge status="dev-mock">
                  {MessageConst.DEV.MOCK_API_MODE}
                </StatusBadge>
              )}
              {isDevelopment && useRealAPI && (
                <StatusBadge status="dev-api">
                  {MessageConst.DEV.REAL_API_MODE}
                </StatusBadge>
              )}

              <Box as="form" onSubmit={handleSubmit(login)} w="full">
                <VStack gap={4}>
                  <InputField
                    label={MessageConst.LABEL.USERNAME}
                    placeholder={MessageConst.PLACEHOLDER.USERNAME}
                    error={errors.username?.message}
                    isInvalid={!!errors.username}
                    {...register("username")}
                  />

                  <InputField
                    label={MessageConst.LABEL.PASSWORD}
                    type="password"
                    placeholder={MessageConst.PLACEHOLDER.PASSWORD}
                    error={errors.password?.message}
                    isInvalid={!!errors.password}
                    {...register("password")}
                  />

                  <Button
                    type="submit"
                    w="full"
                    variant="primary"
                    loading={isLoading}
                    loadingText={MessageConst.SYSTEM.AUTHENTICATING}
                  >
                    {MessageConst.ACTION.LOGIN}
                  </Button>
                </VStack>
              </Box>

              <Box textAlign="center" fontSize="sm" color="gray.600">
                <Text>{MessageConst.DEV.TEST_ACCOUNT_INFO}</Text>
                <Text>{MessageConst.DEV.TEST_CREDENTIALS}</Text>
              </Box>
            </VStack>
          </Card.Body>
        </Card.Root>
      </Box>
    </Box>
  );
};
