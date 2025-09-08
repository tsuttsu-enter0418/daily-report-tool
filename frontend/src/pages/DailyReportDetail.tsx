import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Card,
  Stack,
  Spinner,
  Center,
  Alert,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Button, HomeButton } from "../components/atoms";
import { StatusBadge, DeleteConfirmDialog, StatusChangeDialog } from "../components/molecules";
import { useAuth, useDailyReports, useToast } from "../hooks";
import { MessageConst } from "../constants/MessageConst";
import type { DailyReportResponse } from "../types";

/**
 * 日報詳細画面コンポーネント (Organism)
 *
 * 機能:
 * - 個別日報の詳細表示
 * - 編集・削除機能
 * - ステータス表示
 * - 権限制御（本人・上司のみ）
 *
 * 対象ユーザー:
 * - 日報作成者本人
 * - 上司（部下の日報確認）
 * - 管理者
 */

type DailyReportDetailProps = {
  /** 日報ID（右ペイン使用時にpropsで指定） */
  reportId?: number;
};

const DailyReportDetailComponent = ({ reportId: propReportId }: DailyReportDetailProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [report, setReport] = useState<DailyReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    isDeleting: false,
    errorMessage: "",
  });
  const [statusDialog, setStatusDialog] = useState<{
    isOpen: boolean;
    newStatus: "draft" | "submitted" | null;
    isChanging: boolean;
    errorMessage: string;
  }>({
    isOpen: false,
    newStatus: null,
    isChanging: false,
    errorMessage: "",
  });

  // 日報データ管理フック
  const { getReport, deleteReport, updateReport } = useDailyReports(undefined, false);

  // 日報IDを数値に変換（propsが優先、なければuseParamsから取得）
  const reportId = useMemo(() => {
    if (propReportId !== undefined) {
      return propReportId;
    }
    return id ? parseInt(id, 10) : null;
  }, [propReportId, id]);

  // 開発モード表示判定
  const isDevelopment = useMemo(() => import.meta.env.DEV, []);
  const useRealAPI = useMemo(() => import.meta.env.VITE_USE_REAL_API === "true", []);

  // 権限判定
  const canEdit = useMemo(() => {
    if (!user || !report) return false;

    // 本人、上司、管理者のみ編集可能
    return (
      Number(user.id) === report.userId ||
      user.role === "管理者" ||
      (user.role === "上長" && report.userId === Number(user.id)) // 上司の場合は部下の日報
    );
  }, [user, report]);

  const canDelete = useMemo(() => {
    if (!user || !report) return false;

    // 本人、管理者のみ削除可能
    return Number(user.id) === report.userId || user.role === "管理者";
  }, [user, report]);

  // 日報データ読み込み
  useEffect(() => {
    const loadReport = async () => {
      if (!reportId) {
        setError("無効な日報IDです");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("📖 日報詳細データ読み込み開始:", reportId);
        const data = await getReport(reportId);

        if (data) {
          setReport(data);
          console.log("✅ 日報詳細データ読み込み完了:", data.title);
        } else {
          setError("日報が見つかりません");
        }
      } catch (err) {
        console.error("❌ 日報詳細データ読み込み失敗:", err);
        setError("日報の読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, [reportId, getReport]);

  // 編集ボタン処理
  const handleEdit = useCallback(() => {
    if (reportId) {
      navigate(`/report/edit/${reportId}`);
    }
  }, [reportId, navigate]);

  // 削除ボタン処理
  const handleDelete = useCallback(() => {
    setDeleteDialog({
      isOpen: true,
      isDeleting: false,
      errorMessage: "",
    });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!reportId) return;

    setDeleteDialog((prev) => ({
      ...prev,
      isDeleting: true,
      errorMessage: "",
    }));

    try {
      console.log("🗑️ 日報削除処理開始:", reportId);
      await deleteReport(reportId);
      console.log("✅ 日報削除完了:", reportId);

      // 成功Toast表示
      toast.deleted("日報");

      // 成功時のリダイレクト
      navigate("/report/list");
    } catch (err) {
      console.error("❌ 日報削除失敗:", err);

      // エラーToast表示
      toast.deleteError("日報", "削除処理中にエラーが発生しました");

      setDeleteDialog((prev) => ({
        ...prev,
        isDeleting: false,
        errorMessage: "日報の削除に失敗しました。もう一度お試しください。",
      }));
    }
  }, [reportId, deleteReport, navigate]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog({
      isOpen: false,
      isDeleting: false,
      errorMessage: "",
    });
  }, []);

  // ステータス変更ボタン処理
  const handleStatusChange = useCallback((newStatus: "draft" | "submitted") => {
    setStatusDialog({
      isOpen: true,
      newStatus,
      isChanging: false,
      errorMessage: "",
    });
  }, []);

  const handleStatusChangeConfirm = useCallback(
    async (newStatus: "draft" | "submitted") => {
      if (!reportId || !report) return;

      setStatusDialog((prev) => ({
        ...prev,
        isChanging: true,
        errorMessage: "",
      }));

      try {
        console.log("📝 ステータス変更処理開始:", reportId, newStatus);

        // 現在のデータを保持してステータスのみ変更
        const updateData = {
          title: report.title,
          workContent: report.workContent,
          reportDate: report.reportDate,
          status: newStatus,
        };

        const updatedReport = await updateReport(reportId, updateData);

        if (updatedReport) {
          console.log("✅ ステータス変更完了:", newStatus);
          setReport(updatedReport);

          // 成功Toast表示
          toast.statusChanged(newStatus, "日報");

          setStatusDialog({
            isOpen: false,
            newStatus: null,
            isChanging: false,
            errorMessage: "",
          });
        } else {
          setStatusDialog((prev) => ({
            ...prev,
            isChanging: false,
            errorMessage: "ステータスの変更に失敗しました。もう一度お試しください。",
          }));
        }
      } catch (err) {
        console.error("❌ ステータス変更失敗:", err);

        // エラーToast表示
        toast.updateError("日報", "ステータス変更中にエラーが発生しました");

        setStatusDialog((prev) => ({
          ...prev,
          isChanging: false,
          errorMessage: "ステータス変更処理中にエラーが発生しました。",
        }));
      }
    },
    [reportId, report, updateReport],
  );

  const handleStatusChangeCancel = useCallback(() => {
    setStatusDialog({
      isOpen: false,
      newStatus: null,
      isChanging: false,
      errorMessage: "",
    });
  }, []);

  // 戻るボタン処理
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // ローディング表示
  if (isLoading) {
    return (
      <Box w="100vw" minH="100vh" bg="#F9FAFB">
        <Center py={20}>
          <VStack gap={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color="gray.600" fontSize="lg">
              日報データを読み込み中...
            </Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  // エラー表示
  if (error) {
    return (
      <Box w="100vw" minH="100vh" bg="#F9FAFB">
        <Box maxW="4xl" mx="auto" px={{ base: 4, md: 8 }} py={8}>
          <VStack gap={6}>
            <Alert.Root status="error" borderRadius="md">
              <Alert.Description>{error}</Alert.Description>
            </Alert.Root>
            <Button variant="secondary" onClick={handleBack}>
              戻る
            </Button>
          </VStack>
        </Box>
      </Box>
    );
  }

  // 日報が見つからない場合
  if (!report) {
    return (
      <Box w="100vw" minH="100vh" bg="#F9FAFB">
        <Box maxW="4xl" mx="auto" px={{ base: 4, md: 8 }} py={8}>
          <VStack gap={6}>
            <Text fontSize="lg" color="gray.600">
              日報が見つかりません
            </Text>
            <Button variant="secondary" onClick={handleBack}>
              戻る
            </Button>
          </VStack>
        </Box>
      </Box>
    );
  }

  return (
    <Box w="100vw" minH="100vh" bg="#F9FAFB">
      <Box maxW="4xl" mx="auto" px={{ base: 4, md: 8 }} py={8}>
        <VStack gap={8} align="stretch">
          {/* ヘッダー */}
          <Box w="full">
            <VStack align="start" gap={4}>
              <HStack justify="space-between" w="full">
                <HStack wrap="wrap" gap={4}>
                  <Heading size="xl" color="gray.800">
                    日報詳細
                  </Heading>

                  {/* 開発モード表示 */}
                  {isDevelopment && !useRealAPI && (
                    <StatusBadge status="dev-mock">{MessageConst.DEV.MOCK_API_MODE}</StatusBadge>
                  )}
                  {isDevelopment && useRealAPI && (
                    <StatusBadge status="dev-api">{MessageConst.DEV.REAL_API_MODE}</StatusBadge>
                  )}
                </HStack>
                <HomeButton />
              </HStack>
            </VStack>
          </Box>

          {/* 日報詳細カード */}
          <Card.Root
            variant="elevated"
            bg="white"
            borderRadius="lg"
            boxShadow="0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
            border="1px"
            borderColor="gray.200"
          >
            <Card.Body p={8}>
              <VStack gap={6} align="stretch">
                {/* タイトル・ステータス */}
                <HStack justify="space-between" wrap="wrap" gap={4}>
                  <Heading size="lg" color="gray.800" wordBreak="break-word">
                    {report.title}
                  </Heading>
                  <StatusBadge status={report.status}>
                    {report.status === "draft" ? "下書き" : "提出済み"}
                  </StatusBadge>
                </HStack>

                {/* 基本情報 */}
                <VStack gap={4} align="stretch">
                  <HStack wrap="wrap" gap={6}>
                    <Text fontSize="md" color="gray.600">
                      <Text as="span" fontWeight="semibold">
                        報告日:
                      </Text>{" "}
                      {report.reportDate}
                    </Text>
                    <Text fontSize="md" color="gray.600">
                      <Text as="span" fontWeight="semibold">
                        作成者:
                      </Text>{" "}
                      {report.displayName || report.username}
                    </Text>
                  </HStack>

                  {report.submittedAt && (
                    <Text fontSize="md" color="gray.600">
                      <Text as="span" fontWeight="semibold">
                        提出日時:
                      </Text>{" "}
                      {new Date(report.submittedAt).toLocaleString()}
                    </Text>
                  )}
                </VStack>

                {/* 作業内容 */}
                <Box>
                  <Text fontSize="lg" fontWeight="semibold" color="gray.800" mb={3}>
                    作業内容
                  </Text>
                  <Box
                    p={4}
                    bg="gray.50"
                    borderRadius="md"
                    borderColor="gray.200"
                    borderWidth="1px"
                    minH="200px"
                    whiteSpace="pre-wrap"
                    fontSize="md"
                    color="gray.800"
                    lineHeight="1.6"
                  >
                    {report.workContent || "作業内容が入力されていません"}
                  </Box>
                </Box>

                {/* 文字数情報 */}
                <Text fontSize="sm" color="gray.600" textAlign="right">
                  文字数: {report.workContent?.length || 0} 文字
                </Text>

                {/* アクションボタン */}
                <Stack direction={{ base: "column", md: "row" }} gap={4} justify="space-between">
                  <Button variant="secondary" onClick={handleBack}>
                    戻る
                  </Button>

                  <HStack gap={3}>
                    {/* ステータス変更ボタン */}
                    {canEdit && report.status === "draft" && (
                      <Button variant="primary" onClick={() => handleStatusChange("submitted")}>
                        提出する
                      </Button>
                    )}

                    {canEdit && report.status === "submitted" && (
                      <Button variant="secondary" onClick={() => handleStatusChange("draft")}>
                        下書きに戻す
                      </Button>
                    )}

                    {canEdit && (
                      <Button variant="secondary" onClick={handleEdit}>
                        編集
                      </Button>
                    )}

                    {canDelete && (
                      <Button variant="danger" onClick={handleDelete}>
                        削除
                      </Button>
                    )}
                  </HStack>
                </Stack>
              </VStack>
            </Card.Body>
          </Card.Root>
        </VStack>
      </Box>

      {/* 削除確認ダイアログ */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={report?.title || ""}
        description="削除された日報は復元できません。"
        isDeleting={deleteDialog.isDeleting}
        errorMessage={deleteDialog.errorMessage}
      />

      {/* ステータス変更確認ダイアログ */}
      {statusDialog.newStatus && (
        <StatusChangeDialog
          isOpen={statusDialog.isOpen}
          onClose={handleStatusChangeCancel}
          onConfirm={handleStatusChangeConfirm}
          reportTitle={report?.title || ""}
          currentStatus={report?.status || "draft"}
          newStatus={statusDialog.newStatus}
          isChanging={statusDialog.isChanging}
          errorMessage={statusDialog.errorMessage}
        />
      )}
    </Box>
  );
};

// メモ化による再レンダリング最適化
export const DailyReportDetail = memo(DailyReportDetailComponent);
