import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Textarea,
  Card,
  Field,
  Stack,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/atoms";
import { StatusBadge } from "../components/molecules";
import { useAuth } from "../hooks";
import { useErrorHandler } from "../hooks";
import { MessageConst } from "../constants/MessageConst";
import { useState, useCallback, useMemo, memo } from "react";

/**
 * 日報作成・編集フォームページ (Organism)
 *
 * 機能:
 * - 日報の新規作成
 * - 既存日報の編集
 * - 作業内容の入力・バリデーション
 * - 下書き保存・正式提出
 *
 * 対象ユーザー:
 * - 部下役職のユーザー
 * - 日報作成が必要なすべてのユーザー
 *
 * バリデーション:
 * - 作業内容: 必須、10文字以上、1000文字以内
 */

type DailyReportFormData = {
  workContent: string;
};

type DailyReportFormProps = {
  /** 編集モード（true: 編集, false: 新規作成） */
  isEditMode?: boolean;
  /** 編集対象の日報ID（編集モードの場合） */
  reportId?: string;
  /** 初期値（編集モードの場合） */
  initialData?: Partial<DailyReportFormData>;
};

// バリデーションスキーマ
const validationSchema = yup.object({
  workContent: yup
    .string()
    .required(MessageConst.REPORT.WORK_CONTENT_REQUIRED)
    .min(10, MessageConst.REPORT.WORK_CONTENT_MIN_LENGTH(10))
    .max(1000, MessageConst.REPORT.WORK_CONTENT_MAX_LENGTH(1000)),
});

const DailyReportFormComponent = ({
  isEditMode = false,
  initialData,
}: Omit<DailyReportFormProps, "reportId">) => {
  const { user } = useAuth();
  const { handleError, showSuccess, showInfo } = useErrorHandler();
  const { id: reportId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);

  // 開発モード表示判定（メモ化）
  const isDevelopment = useMemo(() => import.meta.env.DEV, []);
  const useRealAPI = useMemo(
    () => import.meta.env.VITE_USE_REAL_API === "true",
    [],
  );

  // React Hook Form セットアップ
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<DailyReportFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      workContent: initialData?.workContent || "",
    },
    mode: "onChange",
  });

  // フォーム値の監視（文字数カウント用）
  const workContent = watch("workContent");

  // 提出処理（メモ化）
  const onSubmit = useCallback(
    async (data: DailyReportFormData) => {
      setIsSubmitting(true);
      try {
        console.log("日報提出:", { ...data, reportId, isEditMode });
        // TODO: 実際のAPI呼び出し実装
        await new Promise((resolve) => setTimeout(resolve, 1000)); // モック遅延

        if (isEditMode) {
          showSuccess(MessageConst.REPORT.UPDATE_SUCCESS);
          showInfo("日報が更新されました。");
        } else {
          showSuccess(MessageConst.REPORT.CREATE_SUCCESS);
          showInfo("日報が作成されました。");
        }

        // 成功時のリダイレクト
        setTimeout(() => {
          navigate("/home");
        }, 1000);
      } catch (error) {
        handleError(error, "日報提出処理");
      } finally {
        setIsSubmitting(false);
      }
    },
    [reportId, isEditMode, handleError, showSuccess, showInfo, navigate],
  );

  // 下書き保存処理（メモ化）
  const handleSaveDraft = useCallback(async () => {
    setIsDraftSaving(true);
    try {
      const currentData = { workContent };
      console.log("下書き保存:", currentData);
      // TODO: 実際のAPI呼び出し実装
      await new Promise((resolve) => setTimeout(resolve, 500)); // モック遅延

      showSuccess("下書きが保存されました。");
    } catch (error) {
      handleError(error, "下書き保存処理");
    } finally {
      setIsDraftSaving(false);
    }
  }, [workContent, handleError, showSuccess]);

  // 戻る処理（メモ化）
  const handleBack = useCallback(() => {
    navigate(-1); // 前のページに戻る
  }, [navigate]);

  return (
    <Box
      w="100vw"
      minH="100vh"
      background="linear-gradient(135deg, #FFF7ED 0%, #FED7AA 30%, #FECACA 70%, #FEF3C7 100%)"
    >
      <Box maxW="4xl" mx="auto" px={{ base: 4, md: 8 }} py={8}>
        <VStack gap={8} align="stretch">
          {/* ヘッダー */}
          <Box w="full">
            <VStack align="start" gap={4}>
              <HStack wrap="wrap" gap={4}>
                <Heading size="xl" color="gray.800">
                  {isEditMode
                    ? MessageConst.REPORT.EDIT_FORM_TITLE
                    : MessageConst.REPORT.CREATE_FORM_TITLE}
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
              </HStack>

              {user && (
                <Text color="gray.700" fontSize="lg">
                  {user.displayName || user.username} さんの日報
                </Text>
              )}

              <Text color="gray.700" fontSize="md">
                {MessageConst.REPORT.FORM_DESCRIPTION}
              </Text>
            </VStack>
          </Box>

          {/* 開発モード時の説明 */}
          {isDevelopment && !useRealAPI && (
            <Box
              p={4}
              bg="blue.50"
              borderRadius="md"
              borderLeftWidth="4px"
              borderLeftColor="blue.400"
            >
              <VStack align="start" gap={1}>
                <Text fontSize="sm" color="blue.700">
                  <strong>{MessageConst.DEV.MOCK_API_DESCRIPTION}</strong>
                </Text>
                <Text fontSize="sm" color="blue.600">
                  フォーム送信はモック処理されます。実際のデータ保存は行われません。
                </Text>
              </VStack>
            </Box>
          )}

          {/* メインフォーム */}
          <Card.Root
            variant="elevated"
            bg="rgba(255, 251, 235, 0.9)"
            borderRadius="xl"
            boxShadow="0 4px 20px rgba(251, 146, 60, 0.15)"
            border="2px"
            borderColor="orange.200"
          >
            <Card.Body p={8}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <VStack gap={6} align="stretch">
                  {/* 作業内容入力 */}
                  <Field.Root invalid={!!errors.workContent}>
                    <Field.Label
                      color="gray.800"
                      fontSize="lg"
                      fontWeight="semibold"
                    >
                      {MessageConst.REPORT.WORK_CONTENT_LABEL}
                    </Field.Label>

                    <Textarea
                      {...register("workContent")}
                      placeholder={MessageConst.REPORT.WORK_CONTENT_PLACEHOLDER}
                      rows={10}
                      resize="vertical"
                      bg="white"
                      borderColor="orange.200"
                      borderWidth="2px"
                      borderRadius="lg"
                      _hover={{
                        borderColor: "orange.300",
                      }}
                      _focus={{
                        borderColor: "orange.400",
                        boxShadow: "0 0 0 1px rgba(251, 146, 60, 0.3)",
                      }}
                      fontSize="md"
                      color="gray.700"
                    />

                    {/* 文字数カウント */}
                    <HStack justify="space-between" mt={2}>
                      <Box>
                        {errors.workContent && (
                          <Field.ErrorText color="red.500">
                            {errors.workContent.message}
                          </Field.ErrorText>
                        )}
                      </Box>
                      <Text fontSize="sm" color="gray.600">
                        {workContent?.length || 0} / 1000文字
                      </Text>
                    </HStack>
                  </Field.Root>

                  {/* 自動保存説明 */}
                  <Box
                    p={3}
                    bg="amber.500"
                    borderRadius="md"
                    borderLeftWidth="3px"
                    borderRightWidth="3px"
                    borderLeftColor="amber.400"
                  >
                    <Text fontSize="sm" color="gray.700">
                      💡 {MessageConst.REPORT.DRAFT_AUTO_SAVE}
                    </Text>
                  </Box>

                  {/* アクションボタン */}
                  <Stack
                    direction={{ base: "column", md: "row" }}
                    gap={4}
                    justify="space-between"
                  >
                    <HStack gap={3}>
                      <Button variant="secondary" onClick={handleBack}>
                        {MessageConst.ACTION.BACK}
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={handleSaveDraft}
                        loading={isDraftSaving}
                        loadingText={MessageConst.SYSTEM.SAVING}
                      >
                        {MessageConst.REPORT.SAVE_DRAFT}
                      </Button>
                    </HStack>

                    <Button
                      type="submit"
                      variant="primary"
                      loading={isSubmitting}
                      loadingText={
                        isEditMode
                          ? MessageConst.SYSTEM.SAVING
                          : MessageConst.SYSTEM.PROCESSING
                      }
                      disabled={!isValid}
                      size="lg"
                    >
                      {isEditMode
                        ? MessageConst.ACTION.UPDATE
                        : MessageConst.REPORT.SUBMIT_REPORT}
                    </Button>
                  </Stack>
                </VStack>
              </form>
            </Card.Body>
          </Card.Root>
        </VStack>
      </Box>
    </Box>
  );
};

// メモ化による再レンダリング最適化
export const DailyReportForm = memo(DailyReportFormComponent);
