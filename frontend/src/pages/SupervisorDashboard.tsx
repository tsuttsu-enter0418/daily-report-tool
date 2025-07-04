import { Box, Heading, VStack, HStack, Text, SimpleGrid } from "@chakra-ui/react";
import { Button } from "../components/atoms";
import { StatusBadge, ReportCard, type ReportCardData } from "../components/molecules";
import { useAuth } from "../hooks";
import { MessageConst } from "../constants/MessageConst";

/**
 * 上司用ダッシュボードページ (Organism)
 * 
 * 機能:
 * - 部下の日報を一括表示
 * - 日報のステータス確認
 * - フィルタリング機能（All, Completed, Pending）
 * - 各日報の詳細確認
 * 
 * 対象ユーザー:
 * - 上長役職のユーザー
 * - 管理者役職のユーザー
 * 
 * 表示情報:
 * - 日報タイトル
 * - 作成者名・所属チーム
 * - 提出ステータス
 * - アバター画像
 */

type FilterType = "all" | "completed" | "pending";

type MockReport = ReportCardData;

// モックデータ
const mockReports: MockReport[] = [
  {
    id: "1",
    title: "プロジェクトX進捗報告",
    author: "田中 佐智子",
    team: "マーケティングチーム",
    status: "completed",
    date: "2024-01-15",
    avatarBg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  {
    id: "2", 
    title: "クライアントミーティング議事録",
    author: "佐藤 大輔",
    team: "営業チーム",
    status: "completed",
    date: "2024-01-15",
    avatarBg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
  },
  {
    id: "3",
    title: "プロダクト戦略検討",
    author: "鈴木 恵美",
    team: "プロダクトチーム", 
    status: "pending",
    date: "2024-01-15",
    avatarBg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
  },
  {
    id: "4",
    title: "市場調査結果分析",
    author: "高橋 翔太",
    team: "リサーチチーム",
    status: "completed",
    date: "2024-01-15", 
    avatarBg: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
  },
  {
    id: "5",
    title: "キャンペーン効果測定",
    author: "山田 愛",
    team: "マーケティングチーム",
    status: "pending",
    date: "2024-01-15",
    avatarBg: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
  },
  {
    id: "6", 
    title: "営業パイプライン分析",
    author: "中村 健一",
    team: "営業チーム",
    status: "draft",
    date: "2024-01-15",
    avatarBg: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
  }
];


export const SupervisorDashboard = () => {
  const { user } = useAuth();

  // 開発モード表示判定
  const isDevelopment = import.meta.env.DEV;
  const useRealAPI = import.meta.env.VITE_USE_REAL_API === 'true';

  const handleReportClick = (reportId: string) => {
    console.log(`日報詳細表示: ${reportId}`);
    // 今後、日報詳細ページへの遷移を実装
  };

  const handleFilterClick = (filter: FilterType) => {
    console.log(`フィルター変更: ${filter}`);
    // 今後、フィルタリング機能を実装
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
              <Heading size="xl" color="orange.800">{MessageConst.DASHBOARD.TEAM_REPORTS_TITLE}</Heading>
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
                {MessageConst.DASHBOARD.SUPERVISOR_GREETING(user.displayName || user.username)}
              </Text>
            )}
          </VStack>
        </Box>

        {/* フィルターボタン */}
        <HStack gap={2}>
          <Button variant="primary" onClick={() => handleFilterClick("all")}>
            {MessageConst.DASHBOARD.FILTER_ALL}
          </Button>
          <Button variant="secondary" onClick={() => handleFilterClick("completed")}>
            {MessageConst.DASHBOARD.FILTER_COMPLETED}
          </Button>
          <Button variant="secondary" onClick={() => handleFilterClick("pending")}>
            {MessageConst.DASHBOARD.FILTER_PENDING}
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
                {MessageConst.DASHBOARD.MOCK_DASHBOARD_DESCRIPTION}
              </Text>
            </VStack>
          </Box>
        )}

        {/* 日報一覧 */}
        <SimpleGrid 
          columns={{ base: 1, md: 2, lg: 3 }} 
          gap={6} 
          w="full"
        >
          {mockReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onClick={() => handleReportClick(report.id)}
            />
          ))}
        </SimpleGrid>

        {/* 空状態（今後の実装用） */}
        {mockReports.length === 0 && (
          <Box 
            textAlign="center" 
            py={10}
            w="full"
          >
            <Text color="amber.600" fontSize="lg">
              {MessageConst.DASHBOARD.NO_REPORTS_TITLE}
            </Text>
            <Text color="amber.500" fontSize="sm" mt={2}>
              {MessageConst.DASHBOARD.NO_REPORTS_MESSAGE}
            </Text>
          </Box>
        )}
      </VStack>
      </Box>
    </Box>
  );
};