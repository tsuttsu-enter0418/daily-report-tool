/**
 * Login ページの統合テスト
 *
 * テスト対象:
 * - ページの基本表示
 * - フォームバリデーション
 * - ログイン成功・失敗の処理
 * - Toast通知の表示
 * - 開発モード表示
 * - ユーザーインタラクション
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, setupCommonMocks, clearCommonMocks } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { Login } from "../Login";

// 共通モック設定
const { localStorage: mockLocalStorage } = setupCommonMocks();

// useNavigateのモック
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// toasterのモック
const mockToasterCreate = vi.hoisted(() => vi.fn());
vi.mock("@/components/ui/toaster", () => {
  return {
    toaster: {
      create: mockToasterCreate,
    },
  };
});

// apiServiceのモック
vi.mock("@/services/apiService", () => ({
  apiService: {
    login: vi.fn(),
    setAuthToken: vi.fn(),
  },
}));

import { apiService } from "@/services/apiService";
const mockApiService = vi.mocked(apiService);

describe("Login", () => {
  beforeEach(() => {
    clearCommonMocks();
    vi.clearAllTimers();
    vi.useRealTimers();

    // デフォルトで開発環境（モックAPI使用）に設定
    vi.stubGlobal("import.meta", {
      env: {
        DEV: true,
        VITE_USE_REAL_API: "false",
      },
    });
  });

  afterEach(() => {
    clearCommonMocks();
    vi.useRealTimers();
  });

  it("ログインページの基本要素が表示される", () => {
    render(<Login />);

    expect(screen.getByText("日報管理システム")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "ログイン" })).toBeInTheDocument();
    expect(screen.getByLabelText("ユーザー名")).toBeInTheDocument();
    expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ログイン" })).toBeInTheDocument();
    expect(screen.getByText("テストアカウント:")).toBeInTheDocument();
  });

  it("フォームバリデーションが正しく動作する", async () => {
    const user = userEvent.setup();
    render(<Login />);

    const submitButton = screen.getByRole("button", { name: "ログイン" });

    // 空の状態で送信
    await user.click(submitButton);

    await vi.waitFor(() => {
      expect(screen.getByText("ユーザー名は必須です")).toBeInTheDocument();
      expect(screen.getByText("パスワードは必須です")).toBeInTheDocument();
    });
  });

  it("ログイン成功時の処理が正しく動作する", async () => {
    const user = userEvent.setup();

    mockApiService.login.mockResolvedValue({
      token: "mock-jwt-token",
      id: "1",
      username: "admin",
      email: "admin@example.com",
      role: "管理者",
    });

    render(<Login />);

    const usernameInput = screen.getByLabelText("ユーザー名");
    const passwordInput = screen.getByLabelText("パスワード");
    const submitButton = screen.getByRole("button", { name: "ログイン" });

    await user.type(usernameInput, "admin");
    await user.type(passwordInput, "password");
    await user.click(submitButton);

    await vi.waitFor(() => {
      // 成功Toastの確認
      expect(mockToasterCreate).toHaveBeenCalledWith({
        title: "成功",
        description: "adminさん、おかえりなさい",
        type: "success",
        duration: 3000,
      });

      // localStorageに認証状態が保存されることを確認
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "authState",
        expect.stringContaining("mock-jwt-token"),
      );

      // 遅延後にナビゲートが呼ばれることを確認
      expect(mockNavigate).toHaveBeenCalledWith("/home");
    });
  });

  it("ログイン失敗時の処理が正しく動作する", async () => {
    const user = userEvent.setup();

    mockApiService.login.mockRejectedValue(
      new Error("ユーザー名またはパスワードが正しくありません"),
    );

    render(<Login />);

    const usernameInput = screen.getByLabelText("ユーザー名");
    const passwordInput = screen.getByLabelText("パスワード");
    const submitButton = screen.getByRole("button", { name: "ログイン" });

    await user.type(usernameInput, "admin");
    await user.type(passwordInput, "wrongpassword");
    await user.click(submitButton);

    await vi.waitFor(() => {
      // エラーToastの確認
      expect(mockToasterCreate).toHaveBeenCalledWith({
        title: "エラー",
        description: "ユーザー名またはパスワードが正しくありません",
        type: "error",
        duration: 5000,
      });
    });

    // ナビゲートが呼ばれないことを確認
    expect(mockNavigate).not.toHaveBeenCalled();

    // フォームがリセットされずに入力値が保持されることを確認
    expect(usernameInput).toHaveValue("admin");
    expect(passwordInput).toHaveValue("wrongpassword");
  });

  it("ネットワークエラー時の処理が正しく動作する", async () => {
    const user = userEvent.setup();

    mockApiService.login.mockRejectedValue(new Error("Network error"));

    render(<Login />);

    const usernameInput = screen.getByLabelText("ユーザー名");
    const passwordInput = screen.getByLabelText("パスワード");
    const submitButton = screen.getByRole("button", { name: "ログイン" });

    await user.type(usernameInput, "admin");
    await user.type(passwordInput, "password");
    await user.click(submitButton);

    await vi.waitFor(() => {
      expect(mockToasterCreate).toHaveBeenCalledWith({
        title: "エラー",
        description: "Network error",
        type: "error",
        duration: 5000,
      });
    });
  });

  it("ローディング中はフォーム送信が無効になる", async () => {
    const user = userEvent.setup();

    // ログイン処理を遅延させる
    let resolveLogin: (value: any) => void;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });

    mockApiService.login.mockReturnValue(loginPromise as any);
    render(<Login />);

    const usernameInput = screen.getByLabelText("ユーザー名");
    const passwordInput = screen.getByLabelText("パスワード");
    const submitButton = screen.getByRole("button", { name: "ログイン" });

    await user.type(usernameInput, "admin");
    await user.type(passwordInput, "password");
    await user.click(submitButton);

    // ローディング状態の確認
    await vi.waitFor(
      () => {
        expect(screen.getByText("認証中...")).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
      },
      { timeout: 3000 },
    );

    // 追加クリックしても処理が重複しないことを確認
    const callCount = mockApiService.login.mock.calls.length;
    await user.click(submitButton);
    expect(mockApiService.login.mock.calls.length).toBe(callCount);

    // テストクリーンアップのためにプロミスを解決
    resolveLogin({
      token: "token",
      id: "1",
      username: "admin",
      email: "admin@example.com",
      role: "管理者",
    });

    // プロミス解決後の処理を待つ
    await vi.waitFor(
      () => {
        expect(mockToasterCreate).toHaveBeenCalled();
      },
      { timeout: 5000 },
    );
  });
});
