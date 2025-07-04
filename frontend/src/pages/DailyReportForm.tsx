import { 
  Box, 
  Heading, 
  VStack, 
  HStack, 
  Text, 
  Textarea,
  Card,
  Field,
  Stack
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/atoms";
import { StatusBadge } from "../components/molecules";
import { useAuth } from "../hooks";
import { MessageConst } from "../constants/MessageConst";
import { useState } from "react";

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

export const DailyReportForm = ({ 
  isEditMode = false, 
  initialData 
}: Omit<DailyReportFormProps, 'reportId'>) => {
  const { user } = useAuth();
  const { id: reportId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);

  // 開発モード表示判定
  const isDevelopment = import.meta.env.DEV;
  const useRealAPI = import.meta.env.VITE_USE_REAL_API === 'true';

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

  // 提出処理
  const onSubmit = async (data: DailyReportFormData) => {
    setIsSubmitting(true);
    try {
      console.log("日報提出:", { ...data, reportId, isEditMode });
      // TODO: 実際のAPI呼び出し実装
      await new Promise(resolve => setTimeout(resolve, 1000)); // モック遅延
      
      if (isEditMode) {
        console.log("日報更新完了");
        // TODO: 成功Toast表示
      } else {
        console.log("日報作成完了");
        // TODO: 成功Toast表示
      }
      
      // TODO: ダッシュボードまたは一覧画面に遷移
    } catch (error) {
      console.error("日報提出エラー:", error);
      // TODO: エラーToast表示
    } finally {
      setIsSubmitting(false);
    }
  };

  // 下書き保存処理
  const handleSaveDraft = async () => {
    setIsDraftSaving(true);
    try {
      const currentData = { workContent };
      console.log("下書き保存:", currentData);
      // TODO: 実際のAPI呼び出し実装
      await new Promise(resolve => setTimeout(resolve, 500)); // モック遅延
      
      console.log("下書き保存完了");
      // TODO: 成功Toast表示
    } catch (error) {
      console.error("下書き保存エラー:", error);
      // TODO: エラーToast表示
    } finally {
      setIsDraftSaving(false);
    }
  };

  // 戻る処理
  const handleBack = () => {
    navigate(-1); // 前のページに戻る
  };

  return (
    <Box 
      w="100vw"
      minH="100vh"
      background="linear-gradient(135deg, #FFF7ED 0%, #FED7AA 30%, #FECACA 70%, #FEF3C7 100%)"
    >
      <Box 
        maxW="4xl" 
        mx="auto" 
        px={{ base: 4, md: 8 }}
        py={8}
      >
        <VStack gap={8} align="stretch">
          {/* ヘッダー */}
          <Box w="full">
            <VStack align="start" gap={4}>
              <HStack wrap="wrap" gap={4}>
                <Heading size="xl" color="orange.800">
                  {isEditMode ? MessageConst.REPORT.EDIT_FORM_TITLE : MessageConst.REPORT.CREATE_FORM_TITLE}
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
                <Text color="amber.700" fontSize="lg">
                  {user.displayName || user.username} さんの日報
                </Text>
              )}
              
              <Text color="amber.600" fontSize="md">
                {MessageConst.REPORT.FORM_DESCRIPTION}
              </Text>
            </VStack>
          </Box>

          {/* 開発モード時の説明 */}
          {isDevelopment && !useRealAPI && (
            <Box p={4} bg="blue.50" borderRadius="md" borderLeftWidth="4px" borderLeftColor="blue.400">
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
                    <Field.Label color="orange.800" fontSize="lg" fontWeight="semibold">
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
                        borderColor: "orange.300"
                      }}
                      _focus={{
                        borderColor: "orange.400",
                        boxShadow: "0 0 0 1px rgba(251, 146, 60, 0.3)"
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
                      <Text fontSize="sm" color="amber.600">
                        {workContent?.length || 0} / 1000文字
                      </Text>
                    </HStack>
                  </Field.Root>

                  {/* 自動保存説明 */}
                  <Box p={3} bg="amber.50" borderRadius="md" borderLeftWidth="3px" borderLeftColor="amber.400">
                    <Text fontSize="sm" color="amber.700">
                      💡 {MessageConst.REPORT.DRAFT_AUTO_SAVE}
                    </Text>
                  </Box>

                  {/* アクションボタン */}
                  <Stack direction={{ base: "column", md: "row" }} gap={4} justify="space-between">
                    <HStack gap={3}>
                      <Button 
                        variant="secondary" 
                        onClick={handleBack}
                      >
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
                      loadingText={isEditMode ? MessageConst.SYSTEM.SAVING : MessageConst.SYSTEM.PROCESSING}
                      disabled={!isValid}
                      size="lg"
                    >
                      {isEditMode ? MessageConst.ACTION.UPDATE : MessageConst.REPORT.SUBMIT_REPORT}
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