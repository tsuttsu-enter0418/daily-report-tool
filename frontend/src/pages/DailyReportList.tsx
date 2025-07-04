import { 
  Box, 
  Heading, 
  VStack, 
  HStack, 
  Text, 
  SimpleGrid,
  Card
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/atoms";
import { StatusBadge } from "../components/molecules";
import { useAuth } from "../hooks";
import { MessageConst } from "../constants/MessageConst";

/**
 * 個人日報一覧ページ (Organism)
 * 
 * 機能:
 * - 個人の日報履歴一覧表示
 * - ステータス別フィルタリング
 * - 新規作成・編集・削除機能
 * - レスポンシブカードレイアウト
 * 
 * 対象ユーザー:
 * - すべてのログインユーザー
 * 
 * 表示情報:
 * - 日報作成日
 * - ステータス（提出済み・下書き）
 * - 作業内容（抜粋）
 * - アクションボタン（編集・削除）
 */

type FilterType = "all" | "submitted" | "draft";

type PersonalReport = {
  id: string;
  title: string;
  workContent: string;
  status: "submitted" | "draft";
  createdAt: string;
  submittedAt?: string;
};

// モックデータ
const mockPersonalReports: PersonalReport[] = [
  {
    id: "my-1",
    title: "2024年1月15日の日報",
    workContent: "プロジェクトXの要件定義を実施しました。クライアントとのミーティングで詳細な仕様を確認し、技術スタックの選定を行いました。React + TypeScriptでの開発方針が決定し、来週からプロトタイプ開発に着手予定です。",
    status: "submitted",
    createdAt: "2024-01-15",
    submittedAt: "2024-01-15 18:30"
  },
  {
    id: "my-2", 
    title: "2024年1月16日の日報",
    workContent: "UI/UXデザインのプロトタイプ作成を開始。Figmaでワイヤーフレームを作成し、カラーパレットとコンポーネント設計を検討しました。",
    status: "draft",
    createdAt: "2024-01-16"
  },
  {
    id: "my-3",
    title: "2024年1月17日の日報", 
    workContent: "フロントエンド開発環境のセットアップを完了。Vite + React + TypeScript + ChakraUIの構成で開発環境を構築しました。ESLintとPrettierの設定も完了し、開発準備が整いました。",
    status: "submitted",
    createdAt: "2024-01-17",
    submittedAt: "2024-01-17 17:45"
  },
  {
    id: "my-4",
    title: "2024年1月18日の日報",
    workContent: "認証システムの実装に着手。JWT認証とBCryptパスワードハッシュ化を実装しました。",
    status: "draft", 
    createdAt: "2024-01-18"
  }
];

/**
 * 個人日報カードコンポーネント (Molecule)
 */
type PersonalReportCardProps = {
  report: PersonalReport;
  onEdit: (reportId: string) => void;
  onDelete: (reportId: string) => void;
};

const PersonalReportCard = ({ report, onEdit, onDelete }: PersonalReportCardProps) => {
  const getStatusColor = (status: PersonalReport["status"]) => {
    switch (status) {
      case "submitted": return "success";
      case "draft": return "warning";
      default: return "error";
    }
  };

  const getStatusText = (status: PersonalReport["status"]) => {
    switch (status) {
      case "submitted": return MessageConst.REPORT.FILTER_SUBMITTED;
      case "draft": return MessageConst.REPORT.FILTER_DRAFTS;
      default: return "不明";
    }
  };

  // 作業内容を100文字で切り詰め
  const truncatedContent = report.workContent.length > 100 
    ? report.workContent.substring(0, 100) + "..." 
    : report.workContent;

  return (
    <Card.Root
      variant="elevated"
      bg="rgba(255, 251, 235, 0.9)"
      borderRadius="xl"
      boxShadow="0 4px 20px rgba(251, 146, 60, 0.15)"
      border="2px"
      borderColor="orange.200"
      transition="all 0.3s"
      _hover={{
        boxShadow: "0 8px 30px rgba(251, 146, 60, 0.25)",
        transform: "translateY(-2px)",
        borderColor: "orange.400"
      }}
    >
      <Card.Body p={6}>
        <VStack align="stretch" gap={4}>
          {/* ヘッダー部分 */}
          <HStack justify="space-between" align="start">
            <VStack align="start" gap={1} flex={1}>
              <Heading size="md" color="gray.800" lineHeight="1.3">
                {report.title}
              </Heading>
              <Text fontSize="sm" color="gray.600">
                作成日: {report.createdAt}
              </Text>
              {report.submittedAt && (
                <Text fontSize="sm" color="teal.600">
                  提出日: {report.submittedAt}
                </Text>
              )}
            </VStack>
            <StatusBadge status={getStatusColor(report.status)}>
              {getStatusText(report.status)}
            </StatusBadge>
          </HStack>

          {/* 作業内容プレビュー */}
          <Box
            p={3}
            bg="white"
            borderRadius="md"
            border="1px"
            borderColor="orange.100"
          >
            <Text fontSize="sm" color="gray.700" lineHeight="1.5">
              {truncatedContent}
            </Text>
          </Box>

          {/* アクションボタン */}
          <HStack gap={2} justify="flex-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(report.id)}
            >
              {MessageConst.REPORT.EDIT_REPORT}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(report.id)}
            >
              {MessageConst.REPORT.DELETE_REPORT}
            </Button>
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};

export const DailyReportList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentFilter, setCurrentFilter] = useState<FilterType>("all");

  // 開発モード表示判定
  const isDevelopment = import.meta.env.DEV;
  const useRealAPI = import.meta.env.VITE_USE_REAL_API === 'true';

  // フィルタリング処理
  const filteredReports = mockPersonalReports.filter(report => {
    switch (currentFilter) {
      case "submitted": return report.status === "submitted";
      case "draft": return report.status === "draft";
      default: return true;
    }
  });

  // ハンドラー関数
  const handleCreateNew = () => {
    navigate("/report/create");
  };

  const handleEdit = (reportId: string) => {
    navigate(`/report/edit/${reportId}`);
  };

  const handleDelete = (reportId: string) => {
    console.log(`日報削除: ${reportId}`);
    // TODO: 削除確認ダイアログ + 実際の削除処理
  };

  const handleFilterChange = (filter: FilterType) => {
    setCurrentFilter(filter);
  };

  return (
    <Box 
      w="100vw"
      minH="100vh"
      background="linear-gradient(135deg, #FFF7ED 0%, #FED7AA 30%, #FECACA 70%, #FEF3C7 100%)"
    >
      <Box 
        maxW="7xl" 
        mx="auto" 
        px={{ base: 4, md: 8 }}
        py={8}
      >
        <VStack gap={8} align="stretch">
          {/* ヘッダー */}
          <Box w="full">
            <VStack align="start" gap={4}>
              <HStack wrap="wrap" gap={4}>
                <Heading size="xl" color="gray.800">
                  {MessageConst.REPORT.LIST_TITLE}
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
                <Text color="gray.700" fontSize="lg" fontWeight="medium">
                  {user.displayName || user.username} さんの日報履歴
                </Text>
              )}
              
              <Text color="gray.700" fontSize="md">
                {MessageConst.REPORT.LIST_DESCRIPTION}
              </Text>
            </VStack>
          </Box>

          {/* 新規作成ボタン */}
          <HStack justify="flex-end">
            <Button variant="primary" onClick={handleCreateNew}>
              {MessageConst.ACTION.CREATE_REPORT}
            </Button>
          </HStack>

          {/* フィルターボタン */}
          <HStack gap={2}>
            <Button 
              variant={currentFilter === "all" ? "primary" : "secondary"}
              onClick={() => handleFilterChange("all")}
            >
              {MessageConst.REPORT.FILTER_ALL_REPORTS}
            </Button>
            <Button 
              variant={currentFilter === "submitted" ? "primary" : "secondary"}
              onClick={() => handleFilterChange("submitted")}
            >
              {MessageConst.REPORT.FILTER_SUBMITTED}
            </Button>
            <Button 
              variant={currentFilter === "draft" ? "primary" : "secondary"}
              onClick={() => handleFilterChange("draft")}
            >
              {MessageConst.REPORT.FILTER_DRAFTS}
            </Button>
          </HStack>

          {/* 開発モード時の説明 */}
          {isDevelopment && !useRealAPI && (
            <Box p={4} bg="blue.50" borderRadius="md" borderLeftWidth="4px" borderLeftColor="blue.400">
              <VStack align="start" gap={1}>
                <Text fontSize="sm" color="blue.700">
                  <strong>{MessageConst.DEV.MOCK_API_DESCRIPTION}</strong>
                </Text>
                <Text fontSize="sm" color="blue.600">
                  現在はモックデータを表示しています。実際の日報データは今後連携予定です。
                </Text>
              </VStack>
            </Box>
          )}

          {/* 日報一覧 */}
          {filteredReports.length > 0 ? (
            <SimpleGrid 
              columns={{ base: 1, md: 2, lg: 3 }} 
              gap={6} 
              w="full"
            >
              {filteredReports.map((report) => (
                <PersonalReportCard
                  key={report.id}
                  report={report}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </SimpleGrid>
          ) : (
            /* 空状態 */
            <Box 
              textAlign="center" 
              py={10}
              w="full"
            >
              <VStack gap={4}>
                <Text color="gray.600" fontSize="lg" fontWeight="semibold">
                  {currentFilter === "all" ? MessageConst.REPORT.NO_REPORTS_MESSAGE : `${getFilterText(currentFilter)}の日報がありません`}
                </Text>
                <Text color="gray.500" fontSize="md">
                  {MessageConst.REPORT.CREATE_FIRST_REPORT}
                </Text>
                <Button variant="primary" onClick={handleCreateNew}>
                  {MessageConst.ACTION.CREATE_REPORT}
                </Button>
              </VStack>
            </Box>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

// フィルター名を取得するヘルパー関数
const getFilterText = (filter: FilterType): string => {
  switch (filter) {
    case "submitted": return MessageConst.REPORT.FILTER_SUBMITTED;
    case "draft": return MessageConst.REPORT.FILTER_DRAFTS;
    default: return MessageConst.REPORT.FILTER_ALL_REPORTS;
  }
};