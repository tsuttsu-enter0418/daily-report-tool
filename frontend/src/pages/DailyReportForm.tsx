/* eslint-disable max-lines */
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Textarea,
  Card,
  Field,
  Input,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/atoms";
import { DatePickerField, DevModeIndicator } from "../components/molecules";
import { useDailyReports, useToast } from "../hooks";
import { MessageConst } from "../constants/MessageConst";
import { useState, useCallback, useMemo, memo, useEffect } from "react";
import type { DailyReportCreateRequest, DailyReportResponse } from "../types";
import * as validations from "../utils/validations";

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
 * - タイトル: 必須、200文字以内
 * - 作業内容: 必須、10文字以上、1000文字以内
 * - 報告日: 必須、YYYY-MM-DD形式
 */

type DailyReportFormData = {
  title: string;
  workContent: string;
  reportDate: string;
};

type DailyReportFormProps = {
  /** 編集モード（true: 編集, false: 新規作成） */
  isEditMode?: boolean;
  /** 編集対象の日報ID（編集モードの場合） */
  reportId?: number;
  /** 初期値（編集モードの場合） */
  initialData?: Partial<DailyReportFormData>;
};

// バリデーションスキーマ
const validationSchema = yup.object({
  title: validations.VALIDATION__FORM_TITLE,
  workContent: validations.VALIDATION__FORM_WORK_CONTENT,
  reportDate: validations.VALIDATION__FORM_REPORT_DATE,
});

// eslint-disable-next-line complexity
const DailyReportFormComponent = ({
  isEditMode = false,
  initialData,
}: Omit<DailyReportFormProps, "reportId">) => {
  const { id: reportIdParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  // 日報データ管理フック
  const { createReport, updateReport, getReport } = useDailyReports(undefined, false);

  // reportIdをnumberに変換
  const reportId = reportIdParam ? parseInt(reportIdParam, 10) : undefined;

  // 開発モード表示判定（メモ化）
  const isDevelopment = useMemo(() => import.meta.env.DEV, []);
  const useRealAPI = useMemo(() => import.meta.env.VITE_USE_REAL_API === "true", []);

  const handleEdit = useCallback(
    (reportId: number) => {
      navigate(`/report/edit/${reportId}`);
    },
    [navigate],
  );

  // 今日の日付をYYYY-MM-DD形式で取得
  const getTodayDate = useCallback(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }, []);

  // React Hook Form セットアップ
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
    control,
  } = useForm<DailyReportFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      title: initialData?.title || "",
      workContent: initialData?.workContent || "",
      reportDate: initialData?.reportDate || getTodayDate(),
    },
    mode: "onChange",
  });

  // フォーム値の監視（文字数カウント用）
  const workContent = watch("workContent");
  const title = watch("title");

  // 編集モード時の既存データ読み込み
  useEffect(() => {
    const loadReportData = async () => {
      if (isEditMode && reportId) {
        setIsLoadingReport(true);
        try {
          const report = await getReport(reportId);

          if (report) {
            // フォームに既存データを設定
            reset({
              title: report.title,
              workContent: report.workContent,
              reportDate: report.reportDate,
            });
          } else {
            navigate("/reports");
          }
        } catch {
          navigate("/reports");
        } finally {
          setIsLoadingReport(false);
        }
      }
    };

    loadReportData();
  }, [isEditMode, reportId, getReport, reset, navigate]);

  // 提出処理（メモ化）
  const onSubmit = useCallback(
    async (data: DailyReportFormData) => {
      setIsSubmitting(true);
      try {
        const reportData: DailyReportCreateRequest = {
          title: data.title,
          workContent: data.workContent,
          reportDate: data.reportDate,
          status: "submitted", // 正式提出
        };

        let result: DailyReportResponse | null = null;

        if (isEditMode && reportId) {
          // 更新処理
          result = await updateReport(reportId, reportData);
        } else {
          // 新規作成処理
          result = await createReport(reportData);
        }

        if (result) {
          // 成功Toast表示
          if (isEditMode) {
            toast.updated("日報");
          } else {
            toast.submitted("日報");
          }

          // 成功時のリダイレクト
          handleEdit(result.id);
        }
      } catch (error) {
        console.error("❌ 日報提出失敗:", error);

        // エラーToast表示
        if (isEditMode) {
          toast.updateError("日報", "更新処理中にエラーが発生しました");
        } else {
          toast.createError("日報", "提出処理中にエラーが発生しました");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [reportId, isEditMode, updateReport, createReport, toast, handleEdit],
  );

  // 下書き保存処理（メモ化）
  const handleSaveDraft = useCallback(async () => {
    // フォームの現在値を取得
    const currentValues = watch();

    // 必須フィールドのチェック（下書きの場合は緩めに）
    if (!currentValues.title?.trim()) {
      return;
    }

    setIsDraftSaving(true);
    try {
      const reportData: DailyReportCreateRequest = {
        title: currentValues.title,
        workContent: currentValues.workContent || "",
        reportDate: currentValues.reportDate,
        status: "draft", // 下書き
      };

      let result: DailyReportResponse | null = null;

      if (isEditMode && reportId) {
        // 更新処理
        result = await updateReport(reportId, reportData);
      } else {
        // 新規作成処理
        result = await createReport(reportData);
      }

      if (result) {
        // 成功Toast表示
        toast.savedAsDraft("日報");

        // 新規作成から編集モードに切り替え
        if (!isEditMode) {
          navigate(`/report/edit/${result.id}`, { replace: true });
        }
      }
    } catch {
      // エラーToast表示
      toast.updateError("日報", "下書き保存中にエラーが発生しました");
    } finally {
      setIsDraftSaving(false);
    }
  }, [watch, isEditMode, reportId, createReport, updateReport, navigate, toast]);

  // 戻る処理（メモ化）
  const handleBack = useCallback(() => {
    navigate(-1); // 前のページに戻る
  }, [navigate]);

  return (
    <Box w="100%" minH="100%" bg="#F9FAFB">
      <Box w="100%" px={{ base: 2, md: 3 }} py={4}>
        <VStack gap={8} align="stretch">
          {/* ヘッダー */}
          <Box w="full">
            <VStack align="start" gap={4}>
              <HStack justify="space-between" w="full">
                <HStack wrap="wrap" gap={4}>
                  <Heading size="lg" color="gray.800">
                    {isEditMode
                      ? MessageConst.REPORT.EDIT_FORM_TITLE
                      : MessageConst.REPORT.CREATE_FORM_TITLE}
                  </Heading>

                  {/* 開発モード表示 */}
                  <DevModeIndicator
                    isDevelopment={isDevelopment}
                    useRealAPI={useRealAPI}
                    badgeMode="inline"
                    showDescription={false}
                  />
                </HStack>
              </HStack>
            </VStack>
          </Box>

          {/* ローディング表示（編集モード時のデータ読み込み） */}
          {isLoadingReport && (
            <Center py={20}>
              <VStack gap={4}>
                <Spinner size="xl" color="blue.500" />
                <Text color="gray.600" fontSize="lg">
                  日報データを読み込み中...
                </Text>
              </VStack>
            </Center>
          )}

          {/* メインフォーム */}
          {!isLoadingReport && (
            <Card.Root
              variant="elevated"
              bg="white"
              borderRadius="lg"
              boxShadow="0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
              border="1px"
              borderColor="gray.200"
            >
              <Card.Body p={{ base: 3, md: 4 }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <VStack gap={6} align="stretch">
                    {/* タイトル入力 */}
                    <Field.Root invalid={!!errors.title}>
                      <Field.Label fontSize="md" fontWeight="semibold" color="gray.800">
                        日報タイトル
                        <Text as="span" color="red.500" ml={1}>
                          *
                        </Text>
                      </Field.Label>
                      <Input
                        {...register("title")}
                        placeholder="例: 2024年1月15日の日報"
                        bg="white"
                        borderRadius="md"
                        borderColor="gray.300"
                        color="gray.800"
                        _hover={{
                          borderColor: "gray.400",
                        }}
                        _focus={{
                          borderColor: "blue.500",
                          boxShadow: "0 0 0 1px #3B82F6",
                        }}
                      />
                      {errors.title && (
                        <Field.ErrorText color="red.500" fontSize="sm">
                          {errors.title.message}
                        </Field.ErrorText>
                      )}
                      <Field.HelperText color="gray.600" fontSize="sm">
                        最大200文字まで入力できます（現在: {title?.length || 0}
                        /200文字）
                      </Field.HelperText>
                    </Field.Root>

                    {/* 報告日入力 */}
                    <DatePickerField
                      name="reportDate"
                      label="報告日"
                      isRequired
                      control={control}
                      helperText="日報の対象日を選択してください"
                    />

                    {/* 作業内容入力 */}
                    <Field.Root invalid={!!errors.workContent}>
                      <Field.Label fontSize="md" fontWeight="semibold" color="gray.800">
                        {MessageConst.REPORT.WORK_CONTENT_LABEL}
                        <Text as="span" color="red.500" ml={1}>
                          *
                        </Text>
                      </Field.Label>

                      <Textarea
                        {...register("workContent")}
                        placeholder={MessageConst.REPORT.WORK_CONTENT_PLACEHOLDER}
                        rows={10}
                        resize="vertical"
                        bg="white"
                        borderColor="gray.300"
                        borderWidth="1px"
                        borderRadius="md"
                        _hover={{
                          borderColor: "gray.400",
                        }}
                        _focus={{
                          borderColor: "blue.500",
                          boxShadow: "0 0 0 1px #3B82F6",
                        }}
                        fontSize="md"
                        color="gray.800"
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
                    {/* アクションボタン */}
                    <HStack justify="end" w="full">
                      {/* 左側：戻る・下書き保存ボタン */}
                      <HStack gap={3}>
                        <Button
                          variant="secondary"
                          onClick={handleSaveDraft}
                          loading={isDraftSaving}
                          loadingText={MessageConst.SYSTEM.SAVING}
                        >
                          {MessageConst.REPORT.SAVE_DRAFT}
                        </Button>
                      </HStack>

                      {/* 右側：送信ボタン */}
                      <Button
                        type="submit"
                        variant="primary"
                        loading={isSubmitting}
                        loadingText={
                          isEditMode ? MessageConst.SYSTEM.SAVING : MessageConst.SYSTEM.PROCESSING
                        }
                        size="lg"
                      >
                        {isEditMode
                          ? MessageConst.ACTION.UPDATE
                          : MessageConst.REPORT.SUBMIT_REPORT}
                      </Button>
                    </HStack>
                  </VStack>
                </form>
              </Card.Body>
            </Card.Root>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

// メモ化による再レンダリング最適化
export const DailyReportForm = memo(DailyReportFormComponent);
