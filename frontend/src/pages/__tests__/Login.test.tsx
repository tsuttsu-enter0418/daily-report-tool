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
import { render, screen, waitFor } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { Login } from "../Login";
import Cookies from "js-cookie";

// Cookiesのモック
vi.mock("js-cookie");
const mockCookies = vi.mocked(Cookies);

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
const mockToasterCreate = vi.fn();
vi.mock("@/components/ui/toaster", () => ({
  toaster: {
    create: mockToasterCreate,
  },
}));

// apiServiceのモック
vi.mock("@/services/apiService", () => ({
  apiService: {
    login: vi.fn(),
  },
}));

import { apiService } from "@/services/apiService";
const mockApiService = vi.mocked(apiService);

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();

    // デフォルトで開発環境（モックAPI使用）に設定
    vi.stubGlobal("import.meta", {
      env: {
        DEV: true,
        VITE_USE_REAL_API: "false",
      },
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("ログインページの基本要素が表示される", () => {
    render(<Login />);

    expect(screen.getByText("日報管理システム")).toBeInTheDocument();
    expect(screen.getByText("ログイン")).toBeInTheDocument();
    expect(screen.getByLabelText("ユーザー名")).toBeInTheDocument();
    expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "ログイン" }),
    ).toBeInTheDocument();
    expect(screen.getByText("テストアカウント:")).toBeInTheDocument();
  });

  it("開発モード（モックAPI）のバッジが表示される", () => {
    render(<Login />);

    expect(
      screen.getByText("🔧 開発モード (モックAPI使用中)"),
    ).toBeInTheDocument();
  });

  it("開発モード（実API）のバッジが表示される", () => {
    vi.stubGlobal("import.meta", {
      env: {
        DEV: true,
        VITE_USE_REAL_API: "true",
      },
    });

    render(<Login />);

    expect(
      screen.getByText("🌐 開発モード (実際のAPI使用中)"),
    ).toBeInTheDocument();
  });

  it("フォームバリデーションが正しく動作する", async () => {
    const user = userEvent.setup();
    render(<Login />);

    const submitButton = screen.getByRole("button", { name: "ログイン" });

    // 空の状態で送信
    await user.click(submitButton);

    await waitFor(() => {
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

    // ローディング状態の確認
    expect(screen.getByText("ログイン中...")).toBeInTheDocument();

    await waitFor(() => {
      // 成功Toastの確認
      expect(mockToasterCreate).toHaveBeenCalledWith({
        title: "ログイン成功",
        description: "adminさん、おかえりなさい",
        status: "success",
        duration: 2000,
      });

      // Cookieにトークンが保存されることを確認
      expect(mockCookies.set).toHaveBeenCalledWith(
        "authToken",
        "mock-jwt-token",
        { expires: 7 },
      );
    });

    // 遅延後にナビゲートが呼ばれることを確認
    vi.advanceTimersByTime(500);

    await waitFor(() => {
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

    await waitFor(() => {
      // エラーToastの確認
      expect(mockToasterCreate).toHaveBeenCalledWith({
        title: "ログイン失敗",
        description: "ユーザー名またはパスワードが正しくありません",
        status: "error",
        duration: 4000,
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

    await waitFor(() => {
      expect(mockToasterCreate).toHaveBeenCalledWith({
        title: "ログイン失敗",
        description: "Network error",
        status: "error",
        duration: 4000,
      });
    });
  });

  it("ローディング中はフォーム送信が無効になる", async () => {
    const user = userEvent.setup();

    // ログイン処理を遅延させる
    mockApiService.login.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                token: "token",
                id: "1",
                username: "admin",
                email: "admin@example.com",
                role: "管理者",
              }),
            2000,
          ),
        ),
    );

    render(<Login />);

    const usernameInput = screen.getByLabelText("ユーザー名");
    const passwordInput = screen.getByLabelText("パスワード");
    const submitButton = screen.getByRole("button", { name: "ログイン" });

    await user.type(usernameInput, "admin");
    await user.type(passwordInput, "password");
    await user.click(submitButton);

    // ローディング状態の確認
    expect(screen.getByText("ログイン中...")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // 追加クリックしても処理が重複しないことを確認
    const callCount = mockApiService.login.mock.calls.length;
    await user.click(submitButton);
    expect(mockApiService.login.mock.calls.length).toBe(callCount);
  });
});
