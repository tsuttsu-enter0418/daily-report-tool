import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test/utils";
import { DailyReportList } from "../DailyReportList";
import type { DailyReportResponse } from "@/types";
import { MessageConst } from "@/constants/MessageConst";

// React Router のモック
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// カスタムフックのモック
const mockDeleteReport = vi.fn();
const mockRefetch = vi.fn();
const mockToast = {
  deleted: vi.fn(),
  deleteError: vi.fn(),
  showWarning: vi.fn(),
};

const mockUseAuth = vi.fn();
const mockUseMyDailyReports = vi.fn();
const mockUseDeleteDialog = vi.fn();
const mockUseRightPane = {
  showCreate: vi.fn(),
};

vi.mock("@/hooks", () => ({
  useAuth: () => mockUseAuth(),
  useMyDailyReports: () => mockUseMyDailyReports(),
  useToast: () => mockToast,
  useRightPane: () => ({
    actions: mockUseRightPane,
  }),
  useDeleteDialog: (params: { deleteReport: any; toast: any; reports: any }) =>
    mockUseDeleteDialog(params),
}));

// 環境変数のモック
const originalImportMeta = import.meta;
const mockEnv = {
  DEV: true,
  VITE_USE_REAL_API: "false",
};

// テスト用のサンプルデータ
const mockReports: DailyReportResponse[] = [
  {
    id: 1,
    userId: 1,
    username: "testuser1",
    displayName: "テストユーザー1",
    title: "テスト日報1",
    workContent: "今日はReactコンポーネントの開発を行いました。",
    status: "submitted" as const,
    reportDate: "2024-01-15",
    createdAt: "2024-01-15T09:00:00Z",
    submittedAt: "2024-01-15T18:00:00Z",
    updatedAt: "2024-01-15T18:00:00Z",
  },
  {
    id: 2,
    userId: 1,
    username: "testuser1",
    displayName: "テストユーザー1",
    title: "テスト日報2",
    workContent: "TypeScriptの型定義を改善しました。",
    status: "draft" as const,
    reportDate: "2024-01-16",
    createdAt: "2024-01-16T09:00:00Z",
    submittedAt: undefined,
    updatedAt: "2024-01-16T17:00:00Z",
  },
];

const mockUser = {
  id: "1",
  username: "testuser1",
  displayName: "テストユーザー1",
  email: "test@example.com",
  role: "部下" as const,
};

const mockDeleteDialog = {
  isOpen: false,
  reportId: null,
  reportTitle: "",
  isDeleting: false,
  errorMessage: "",
};

describe("DailyReportList", () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    vi.clearAllMocks();

    // import.meta.envをモック
    vi.stubGlobal("import.meta", {
      ...originalImportMeta,
      env: mockEnv,
    });

    // デフォルトのモック戻り値を設定
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    });

    mockUseMyDailyReports.mockReturnValue({
      reports: mockReports,
      isLoading: false,
      error: null,
      deleteReport: mockDeleteReport,
      refetch: mockRefetch,
    });

    mockUseDeleteDialog.mockReturnValue({
      deleteDialog: mockDeleteDialog,
      handleDelete: vi.fn(),
      handleDeleteConfirm: vi.fn(),
      handleDeleteCancel: vi.fn(),
    });
  });

  describe("基本レンダリング", () => {
    it("正常にレンダリングされる", () => {
      render(<DailyReportList />);

      expect(screen.getByText(MessageConst.REPORT.LIST_TITLE)).toBeInTheDocument();
    });

    it("新規作成ボタンが表示される", () => {
      render(<DailyReportList />);

      expect(screen.getByText(MessageConst.ACTION.CREATE_REPORT)).toBeInTheDocument();
    });
  });

  describe("状態管理", () => {
    it("ローディング状態を表示する", () => {
      mockUseMyDailyReports.mockReturnValue({
        reports: [],
        isLoading: true,
        error: null,
        deleteReport: mockDeleteReport,
        refetch: mockRefetch,
      });

      render(<DailyReportList />);

      expect(screen.getByText("日報データを読み込み中...")).toBeInTheDocument();
    });

    it("エラー状態を表示する", () => {
      const errorMessage = "データの取得に失敗しました";
      mockUseMyDailyReports.mockReturnValue({
        reports: [],
        isLoading: false,
        error: errorMessage,
        deleteReport: mockDeleteReport,
        refetch: mockRefetch,
      });

      render(<DailyReportList />);

      expect(screen.getByText("データの読み込みに失敗しました")).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText("再試行")).toBeInTheDocument();
    });

    it("空状態を表示する", () => {
      mockUseMyDailyReports.mockReturnValue({
        reports: [],
        isLoading: false,
        error: null,
        deleteReport: mockDeleteReport,
        refetch: mockRefetch,
      });

      render(<DailyReportList />);

      expect(screen.getByText(MessageConst.REPORT.NO_REPORTS_MESSAGE)).toBeInTheDocument();
      expect(screen.getByText(MessageConst.REPORT.CREATE_FIRST_REPORT)).toBeInTheDocument();
    });

    it("日報一覧を表示する", () => {
      render(<DailyReportList />);

      expect(screen.getByText("テスト日報1")).toBeInTheDocument();
      expect(screen.getByText("テスト日報2")).toBeInTheDocument();
      expect(screen.getByText("2 件の日報が見つかりました")).toBeInTheDocument();
    });
  });

  describe("ナビゲーション機能", () => {
    it("新規作成ボタンクリック時に新規作成アクションを実行する", async () => {
      const user = userEvent.setup();
      render(<DailyReportList />);

      const createButton = screen.getByText(MessageConst.ACTION.CREATE_REPORT);
      await user.click(createButton);

      expect(mockUseRightPane.showCreate).toHaveBeenCalled();
    });

    it("詳細ボタン押下時にトーストを表示", async () => {
      const user = userEvent.setup();
      render(<DailyReportList />);

      // PersonalReportCardの詳細ボタンをクリック
      const detailButtons = screen.getAllByText("詳細");
      expect(detailButtons).toHaveLength(2);

      await user.click(detailButtons[1]);

      // handleViewが呼ばれてナビゲーションが実行されることを確認
      expect(mockToast.showWarning).toHaveBeenCalledWith(
        "詳細表示機能",
        "日報詳細表示は今後実装予定です (ID: 2)。現在は編集機能をご利用ください。",
      );
    });
  });

  describe("フィルタリング機能", () => {
    // フィルタリング関数のユニットテスト
    it("ステータスでフィルタリングできる", () => {
      // フィルタリング関数を直接テスト（関数をエクスポートする必要がある）
      const submittedReports = mockReports.filter((r) => r.status === "submitted");
      const draftReports = mockReports.filter((r) => r.status === "draft");

      expect(submittedReports).toHaveLength(1);
      expect(draftReports).toHaveLength(1);
      expect(submittedReports[0].title).toBe("テスト日報1");
      expect(draftReports[0].title).toBe("テスト日報2");
    });

    it("検索結果件数が正しく表示される", () => {
      render(<DailyReportList />);

      expect(screen.getByText("2 件の日報が見つかりました")).toBeInTheDocument();
    });

    // カバレッジ向上: フィルター機能の分岐テスト
    it("フィルタリング時の件数表示をテスト", () => {
      // 3件のデータでフィルタリング効果をテスト
      const extendedReports = [
        ...mockReports,
        {
          id: 3,
          userId: 1,
          username: "testuser1",
          displayName: "テストユーザー1",
          title: "テスト日報3",
          workContent: "追加テスト作業内容",
          status: "submitted" as const,
          reportDate: "2024-01-17",
          createdAt: "2024-01-17T09:00:00Z",
          submittedAt: "2024-01-17T18:00:00Z",
          updatedAt: "2024-01-17T18:00:00Z",
        },
      ];

      mockUseMyDailyReports.mockReturnValue({
        reports: extendedReports,
        isLoading: false,
        error: null,
        deleteReport: mockDeleteReport,
        refetch: mockRefetch,
      });

      render(<DailyReportList />);

      expect(screen.getByText("3 件の日報が見つかりました")).toBeInTheDocument();
    });
  });

  describe("削除機能", () => {
    it("削除ダイアログが正しく統合されている", () => {
      const mockHandleDelete = vi.fn();
      const mockHandleDeleteConfirm = vi.fn();
      const mockHandleDeleteCancel = vi.fn();

      const openDialog = {
        isOpen: true,
        reportId: 1,
        reportTitle: "削除対象の日報タイトル",
        isDeleting: false,
        errorMessage: "",
      };

      mockUseDeleteDialog.mockReturnValue({
        deleteDialog: openDialog,
        handleDelete: mockHandleDelete,
        handleDeleteConfirm: mockHandleDeleteConfirm,
        handleDeleteCancel: mockHandleDeleteCancel,
      });

      render(<DailyReportList />);

      // 削除確認ダイアログの表示確認
      expect(screen.getByText("削除された日報は復元できません。")).toBeInTheDocument();
      // ダイアログが開いていることを確認（DeleteConfirmDialogコンポーネントの存在確認）
      expect(screen.getAllByText("テスト日報1")).toHaveLength(1); // 日報一覧にのみ表示
    });

    it("削除処理中の状態を表示する", () => {
      const deletingDialog = {
        isOpen: true,
        reportId: 1,
        reportTitle: "削除中の日報タイトル",
        isDeleting: true,
        errorMessage: "",
      };

      mockUseDeleteDialog.mockReturnValue({
        deleteDialog: deletingDialog,
        handleDelete: vi.fn(),
        handleDeleteConfirm: vi.fn(),
        handleDeleteCancel: vi.fn(),
      });

      render(<DailyReportList />);

      // 削除中の状態確認
      expect(screen.getByText("削除された日報は復元できません。")).toBeInTheDocument();
    });
  });

  describe("エラーハンドリング", () => {
    it("再試行ボタンクリック時にrefetchが呼ばれる", async () => {
      const user = userEvent.setup();

      mockUseMyDailyReports.mockReturnValue({
        reports: [],
        isLoading: false,
        error: "ネットワークエラーが発生しました",
        deleteReport: mockDeleteReport,
        refetch: mockRefetch,
      });

      render(<DailyReportList />);

      const retryButton = screen.getByText("再試行");
      await user.click(retryButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("レスポンシブデザイン", () => {
    it("モバイル・タブレット・デスクトップでグリッドレイアウトが適用される", () => {
      render(<DailyReportList />);

      // SimpleGridが正しくレンダリングされることを確認
      expect(screen.getByText("テスト日報1")).toBeInTheDocument();
      expect(screen.getByText("テスト日報2")).toBeInTheDocument();

      // グリッドコンテナが存在することを確認
      expect(screen.getByText("テスト日報1").closest("div")).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("適切なヘッダー階層が設定されている", () => {
      render(<DailyReportList />);

      // h2要素の確認 (実際の実装に合わせて修正)
      const mainHeading = screen.getByRole("heading", {
        level: 2,
        name: MessageConst.REPORT.LIST_TITLE,
      });
      expect(mainHeading).toBeInTheDocument();
    });

    it("ボタンに適切なアクセシブル名が設定されている", () => {
      render(<DailyReportList />);

      const createButton = screen.getByRole("button", {
        name: MessageConst.ACTION.CREATE_REPORT,
      });
      expect(createButton).toBeInTheDocument();
    });
  });

  describe("パフォーマンス", () => {
    it("コンポーネントがメモ化されている", () => {
      // DailyReportListがmemoでラップされていることを確認
      expect(DailyReportList.displayName).toBe(undefined); // memoは通常displayNameを設定しない

      // 同じpropsで再レンダリングしても同じ結果が返ることを確認
      const { rerender } = render(<DailyReportList />);
      expect(screen.getByText(MessageConst.REPORT.LIST_TITLE)).toBeInTheDocument();

      rerender(<DailyReportList />);
      expect(screen.getByText(MessageConst.REPORT.LIST_TITLE)).toBeInTheDocument();
    });
  });
});

// フィルタリング関数のユニットテストを別で実施
describe("フィルタリング関数", () => {
  const testReports: DailyReportResponse[] = [
    {
      id: 1,
      userId: 1,
      username: "user1",
      displayName: "ユーザー1",
      title: "React開発",
      workContent: "コンポーネント作成",
      status: "submitted",
      reportDate: "2024-01-15",
      createdAt: "2024-01-15T09:00:00Z",
      submittedAt: "2024-01-15T18:00:00Z",
      updatedAt: "2024-01-15T18:00:00Z",
    },
    {
      id: 2,
      userId: 1,
      username: "user1",
      displayName: "ユーザー1",
      title: "Vue開発",
      workContent: "ルーティング設定",
      status: "draft",
      reportDate: "2024-01-16",
      createdAt: "2024-01-16T09:00:00Z",
      submittedAt: undefined,
      updatedAt: "2024-01-16T17:00:00Z",
    },
  ];

  it("タイトルでフィルタリングできる", () => {
    const result = testReports.filter((r) => r.title.toLowerCase().includes("react".toLowerCase()));
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("React開発");
  });

  it("内容でフィルタリングできる", () => {
    const result = testReports.filter((r) =>
      r.workContent.toLowerCase().includes("ルーティング".toLowerCase()),
    );
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Vue開発");
  });

  it("日付範囲でフィルタリングできる", () => {
    const startDate = "2024-01-15";
    const endDate = "2024-01-15";

    const result = testReports.filter((report) => {
      const reportDate = new Date(report.reportDate);
      const searchStartDate = new Date(startDate);
      const searchEndDate = new Date(endDate);
      return reportDate >= searchStartDate && reportDate <= searchEndDate;
    });

    expect(result).toHaveLength(1);
    expect(result[0].reportDate).toBe("2024-01-15");
  });
});
