/* eslint-disable max-lines, max-nested-callbacks, @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test/utils";
import { DailyReportForm } from "../DailyReportForm";
import type { DailyReportResponse } from "@/types";
import { MessageConst } from "@/constants/MessageConst";

// React Router のモック
const mockNavigate = vi.fn();
const mockUseParams = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

// カスタムフックのモック
const mockCreateReport = vi.fn();
const mockUpdateReport = vi.fn();
const mockGetReport = vi.fn();
const mockToast = {
  submitted: vi.fn(),
  updated: vi.fn(),
  savedAsDraft: vi.fn(),
  createError: vi.fn(),
  updateError: vi.fn(),
};

vi.mock("@/hooks", () => ({
  useDailyReports: () => ({
    createReport: mockCreateReport,
    updateReport: mockUpdateReport,
    getReport: mockGetReport,
  }),
  useToast: () => mockToast,
}));

// 環境変数のモック
Object.defineProperty(import.meta, "env", {
  value: {
    ...import.meta.env,
    DEV: true,
    VITE_USE_REAL_API: "false",
  },
  writable: true,
});

// CSSファイルのモック
vi.mock("react-datepicker/dist/react-datepicker.css", () => ({}));

// StatusBadgeのモック
vi.mock("@/components/molecules/StatusBadge", () => ({
  StatusBadge: ({ children, status, ...props }: any) => (
    <span data-testid={`status-badge-${status}`} {...props}>
      {children}
    </span>
  ),
}));

// DevModeIndicatorのモック;
vi.mock("@/components/molecules/DevModeIndicator", () => ({
  DevModeIndicator: ({ isDevelopment, useRealAPI, showDescription }: any) => {
    if (!isDevelopment) return null;
    return (
      <div data-testid="dev-mode-indicator">
        {!useRealAPI && <span>{MessageConst.DEV.MOCK_API_MODE}</span>}
        {useRealAPI && <span>実 API</span>}
        {showDescription && !useRealAPI && (
          <div>フォーム送信はモック処理されます。実際のデータ保存は行われません。</div>
        )}
      </div>
    );
  },
}));

// MessageConstのモック
vi.mock("@/constants/MessageConst", () => ({
  MessageConst: {
    REPORT: {
      CREATE_FORM_TITLE: "日報作成",
      EDIT_FORM_TITLE: "日報編集",
      WORK_CONTENT_REQUIRED: "作業内容は必須です",
      WORK_CONTENT_MIN_LENGTH: (length: number) => `作業内容は${length}文字以上で入力してください`,
      WORK_CONTENT_MAX_LENGTH: (length: number) => `作業内容は${length}文字以内で入力してください`,
      WORK_CONTENT_LABEL: "作業内容",
      WORK_CONTENT_PLACEHOLDER: "今日の作業内容を入力してください",
      SAVE_DRAFT: "下書き保存",
      SUBMIT_REPORT: "日報を提出",
    },
    ACTION: {
      BACK: "戻る",
      UPDATE: "更新",
    },
    SYSTEM: {
      SAVING: "保存中...",
      PROCESSING: "処理中...",
    },
    DEV: {
      MOCK_API_MODE: "モック APIモード",
      REAL_API_MODE: "実 API",
      MOCK_API_DESCRIPTION: "モック API 詳細",
    },
  },
}));

// Buttonコンポーネントのモック
vi.mock("@/components/atoms", () => ({
  Button: ({ children, onClick, type, variant, loading, disabled, loadingText, ...props }: any) => (
    <button
      type={type || "button"}
      onClick={onClick}
      disabled={disabled || loading}
      data-variant={variant}
      {...props}
    >
      {loading ? loadingText || "Loading..." : children}
    </button>
  ),
}));

/**
 * DailyReportForm コンポーネントのテスト
 *
 * 機能テスト:
 * - 基本レンダリング
 * - フォーム入力・バリデーション
 * - 新規作成モード
 * - 編集モード
 * - ボタン動作（戻る、下書き保存、送信）
 * - 開発モード表示
 * - ローディング状態
 */

describe("DailyReportForm", () => {
  const user = userEvent.setup({ delay: 0 });

  // サンプルレポートデータ
  const mockReportData: DailyReportResponse = {
    id: 1,
    title: "テスト日報",
    workContent: "テスト作業内容です。今日は新しい機能の実装を行いました。",
    reportDate: "2024-01-15",
    status: "draft",
    submittedAt: undefined,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    userId: 1,
    username: "testuser",
  };

  beforeEach(() => {
    // 各テスト前にモックをクリア
    vi.clearAllMocks();

    // デフォルトの戻り値設定
    mockUseParams.mockReturnValue({});
    mockCreateReport.mockResolvedValue(mockReportData);
    mockUpdateReport.mockResolvedValue(mockReportData);
    mockGetReport.mockResolvedValue(mockReportData);
  });

  describe("基本レンダリング", () => {
    it("新規作成モードで正常にレンダリングされる", () => {
      render(<DailyReportForm />);

      // タイトル表示の確認
      expect(screen.getByText("日報作成")).toBeInTheDocument();

      // フォームフィールドの表示確認
      expect(screen.getByLabelText(/日報タイトル/)).toBeInTheDocument();
      expect(screen.getByLabelText(/報告日/)).toBeInTheDocument();
      expect(screen.getByLabelText(/作業内容/)).toBeInTheDocument();

      // ボタンの表示確認
      expect(screen.getByRole("button", { name: "下書き保存" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "日報を提出" })).toBeInTheDocument();
    });

    it("編集モードで正常にレンダリングされる", async () => {
      mockUseParams.mockReturnValue({ id: "1" });

      render(<DailyReportForm isEditMode={true} />);

      // 編集モードのタイトル確認
      await waitFor(() => {
        expect(screen.getByText("日報編集")).toBeInTheDocument();
      });

      // 更新ボタンの確認
      await waitFor(() => {
        expect(screen.getByRole("button", { name: "更新" })).toBeInTheDocument();
      });
    });

    it("必須マークが正しく表示される", () => {
      expect.assertions(3);

      render(<DailyReportForm />);

      const titleLabel = screen.getByLabelText(/日報タイトル/).parentElement;
      const dateLabel = screen.getByTestId("required-datepicker").parentElement;
      const contentsLabel = screen.getByLabelText(/作業内容/).parentElement;
      if (!titleLabel || !dateLabel || !contentsLabel) return;

      // // 必須フィールドのラベルに * 取得
      const requiredTitle = within(titleLabel).getByText("*");
      const requireddate = within(dateLabel).getByText("*");
      const requiredContents = within(contentsLabel).getByText("*");

      // 結果確認
      expect(requiredTitle).toBeInTheDocument();
      expect(requireddate).toBeInTheDocument();
      expect(requiredContents).toBeInTheDocument();
    });
  });

  describe("開発モード表示", () => {
    it("開発環境でモックAPIバッジが表示される", () => {
      render(<DailyReportForm />);

      expect(screen.getByText(MessageConst.DEV.MOCK_API_MODE)).toBeInTheDocument();
    });
  });

  describe("フォーム入力", () => {
    it("各フィールドに正常に入力できる", async () => {
      render(<DailyReportForm />);

      const titleInput = screen.getByLabelText(/日報タイトル/);
      const workContentTextarea = screen.getByLabelText(/作業内容/);
      const dateInput = screen.getByPlaceholderText("日付を選択してください");

      // 入力実行
      await user.type(titleInput, "テストタイトル");
      await user.type(workContentTextarea, "テスト作業内容です。");

      // 入力値確認
      expect(titleInput).toHaveValue("テストタイトル");
      expect(workContentTextarea).toHaveValue("テスト作業内容です。");
      expect(dateInput).toBeInTheDocument(); // DatePickerは複雑なので存在確認のみ
    });

    it("文字数カウントが正しく動作する", async () => {
      render(<DailyReportForm />);

      const titleInput = screen.getByLabelText(/日報タイトル/);
      const workContentTextarea = screen.getByLabelText(/作業内容/);

      await user.type(titleInput, "テスト");
      await user.type(workContentTextarea, "テスト作業");

      // 文字数カウントの確認（実際の表示形式に合わせる）
      expect(screen.getByText(/現在:\s*3/)).toBeInTheDocument(); // タイトル
      expect(screen.getByText(/5\s*\/\s*1000文字/)).toBeInTheDocument(); // 作業内容
    });
  });

  describe("バリデーション", () => {
    it("必須フィールドが空の場合エラーが表示される", async () => {
      render(<DailyReportForm />);

      const submitButton = screen.getByRole("button", { name: "日報を提出" });
      await user.click(submitButton);

      // バリデーションエラーの確認
      await vi.waitFor(() => {
        expect(screen.getByText("タイトルは必須です")).toBeInTheDocument();
      });
      // 報告内容
      await vi.waitFor(() => {
        expect(screen.getByText("作業内容は必須です")).toBeInTheDocument();
      });
    });

    it("作業内容の文字数制限が動作する", async () => {
      render(<DailyReportForm />);

      const titleInput = screen.getByLabelText(/日報タイトル/);
      const workContentTextarea = screen.getByLabelText(/作業内容/);
      const submitButton = screen.getByRole("button", { name: "日報を提出" });

      // 有効な入力
      await user.type(titleInput, "テストタイトル");
      await user.type(workContentTextarea, "短すぎる");
      await user.click(submitButton);

      // 最小文字数エラーの確認
      await waitFor(() => {
        expect(screen.getByText("作業内容は10文字以上で入力してください")).toBeInTheDocument();
      });
    });

    it("タイトルの文字数制限が動作する", async () => {
      render(<DailyReportForm />);

      const titleInput = screen.getByLabelText(/日報タイトル/);
      const workContentInput = screen.getByLabelText(/作業内容/);

      const longTitle = "あ".repeat(201); // 201文字
      const longContents = "あ".repeat(1001); // 1001文字

      // fireEventを使用して高速化
      fireEvent.change(titleInput, { target: { value: longTitle } });
      fireEvent.change(workContentInput, { target: { value: longContents } });

      const submitButton = screen.getByRole("button", { name: "日報を提出" });
      await user.click(submitButton);

      await vi.waitFor(() => {
        expect(screen.getByText("タイトルは200文字以内で入力してください")).toBeInTheDocument();
      });
    });
  });

  describe("フォーム送信", () => {
    const validFormData = {
      title: "テスト日報",
      workContent: "テスト作業内容です。今日は新機能の実装を行いました。",
      date: "2024-01-15",
    };

    it("新規作成で正常に送信される", async () => {
      render(<DailyReportForm />);

      // フォーム入力（日付はデフォルト値を使用）
      await user.type(screen.getByLabelText(/日報タイトル/), validFormData.title);
      await user.type(screen.getByLabelText(/作業内容/), validFormData.workContent);

      // 送信実行
      const submitButton = screen.getByRole("button", { name: "日報を提出" });
      await user.click(submitButton);

      // API呼び出し確認
      await waitFor(() => {
        expect(mockCreateReport).toHaveBeenCalledWith(
          expect.objectContaining({
            title: validFormData.title,
            workContent: validFormData.workContent,
            status: "submitted",
          }),
        );
      });

      // トースト表示確認
      expect(mockToast.submitted).toHaveBeenCalledWith("日報");
    });

    it("下書き保存が正常に動作する", async () => {
      render(<DailyReportForm />);

      // フォーム入力
      await user.type(screen.getByLabelText(/日報タイトル/), validFormData.title);
      await user.type(screen.getByLabelText(/作業内容/), validFormData.workContent);

      // 下書き保存実行
      const draftButton = screen.getByRole("button", { name: "下書き保存" });
      await user.click(draftButton);

      // API呼び出し確認
      await waitFor(() => {
        expect(mockCreateReport).toHaveBeenCalledWith(
          expect.objectContaining({
            title: validFormData.title,
            workContent: validFormData.workContent,
            status: "draft",
          }),
        );
      });

      // トースト表示確認
      expect(mockToast.savedAsDraft).toHaveBeenCalledWith("日報");
    });

    it("編集モードで更新が正常に動作する", async () => {
      mockUseParams.mockReturnValue({ id: "1" });

      render(<DailyReportForm isEditMode={true} />);

      // データ読み込み待ち（フォームにデータが設定されるまで待機）
      const titleInput = await vi.waitFor(() => {
        const titleInput = screen.getByLabelText(/日報タイトル/) as HTMLInputElement;
        expect(titleInput.value).toBe(mockReportData.title);
        return titleInput;
      });

      // 内容変更
      await user.clear(titleInput);
      await user.type(titleInput, "更新されたタイトル");

      // 更新実行
      const updateButton = screen.getByRole("button", { name: "更新" });
      await user.click(updateButton);

      // API呼び出し確認
      await vi.waitFor(() => {
        expect(mockUpdateReport).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            title: "更新されたタイトル",
            status: "submitted",
          }),
        );
      });

      // トースト表示確認
      expect(mockToast.updated).toHaveBeenCalledWith("日報");
    });
  });

  describe("ボタン動作", () => {
    it("バリデーションエラーがある場合でもボタンは有効である", async () => {
      render(<DailyReportForm />);

      const submitButton = screen.getByRole("button", { name: "日報を提出" });

      // 必要な入力をして有効化確認
      await user.type(screen.getByLabelText(/日報タイトル/), "テストタイトル");
      await user.type(
        screen.getByLabelText(/作業内容/),
        "テスト作業内容です。これは10文字以上の内容です。",
      );

      await vi.waitFor(
        () => {
          expect(submitButton).toBeEnabled();
        },
        { timeout: 3000 },
      );
    });
  });

  describe("ローディング状態", () => {
    it("編集モードでデータ読み込み中のローディング表示", async () => {
      mockUseParams.mockReturnValue({ id: "1" });

      // データ読み込みを遅延させる
      let resolvePromise: (value: any) => void = () => {};
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockGetReport.mockReturnValue(promise);

      render(<DailyReportForm isEditMode={true} />);

      // ローディング表示確認
      expect(screen.getByText("日報データを読み込み中...")).toBeInTheDocument();

      // データ読み込み完了
      resolvePromise(mockReportData);

      // ローディングが消えることを確認
      await vi.waitFor(() => {
        expect(screen.queryByText("日報データを読み込み中...")).not.toBeInTheDocument();
      });
    });

    it("送信中のローディング状態", async () => {
      mockCreateReport.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockReportData), 100)),
      );

      render(<DailyReportForm />);

      // フォーム入力
      await user.type(screen.getByLabelText(/日報タイトル/), "テストタイトル");
      await user.type(screen.getByLabelText(/作業内容/), "テスト作業内容です。");

      // 送信実行
      const submitButton = screen.getByRole("button", { name: "日報を提出" });
      await user.click(submitButton);

      // ローディング状態確認
      expect(screen.getByText("処理中...")).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  describe("エラーハンドリング", () => {
    it("送信エラー時にエラートーストが表示される", async () => {
      mockCreateReport.mockRejectedValue(new Error("送信失敗"));

      render(<DailyReportForm />);

      // フォーム入力
      await user.type(screen.getByLabelText(/日報タイトル/), "テストタイトル");
      await user.type(screen.getByLabelText(/作業内容/), "テスト作業内容です。");

      // 送信実行
      const submitButton = screen.getByRole("button", { name: "日報を提出" });
      await user.click(submitButton);

      // エラートースト確認
      await waitFor(() => {
        expect(mockToast.createError).toHaveBeenCalledWith(
          "日報",
          "提出処理中にエラーが発生しました",
        );
      });
    });

    it("編集モードでデータ取得エラー時にリダイレクトされる", async () => {
      mockUseParams.mockReturnValue({ id: "1" });
      mockGetReport.mockRejectedValue(new Error("データ取得失敗"));

      render(<DailyReportForm isEditMode={true} />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/reports");
      });
    });
  });
});
