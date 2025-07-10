/**
 * ProtectedRoute コンポーネントのユニットテスト
 *
 * テスト対象:
 * - 認証状態の確認
 * - トークンが存在しない場合のリダイレクト
 * - トークン検証中のローディング表示
 * - 認証成功時の子コンポーネント表示
 * - 認証失敗時の処理
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@/test/utils";
import { ProtectedRoute } from "../ProtectedRoute";
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

// apiServiceのモック
vi.mock("@/services/apiService", () => ({
  apiService: {
    validateToken: vi.fn(),
  },
}));

// Jotai状態管理のモック
const mockIsAuthenticated = { value: false };
const mockPerformLogout = vi.fn();
vi.mock("jotai", async () => {
  const actual = await vi.importActual("jotai");
  return {
    ...actual,
    useAtomValue: vi.fn(() => mockIsAuthenticated.value),
    useSetAtom: vi.fn(() => mockPerformLogout),
  };
});

import { apiService } from "@/services/apiService";
const mockApiService = vi.mocked(apiService);

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
    mockIsAuthenticated.value = false;
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  const TestChild = () => <div>保護されたコンテンツ</div>;

  it("トークンが存在しない場合、ログイン画面にリダイレクトする", () => {
    mockCookies.get.mockReturnValue(undefined as any);

    render(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/login");
    expect(screen.queryByText("保護されたコンテンツ")).not.toBeInTheDocument();
  });

  it("トークン検証中はローディング画面を表示する", async () => {
    mockCookies.get.mockReturnValue("valid-token" as any);
    mockApiService.validateToken.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(true), 1000))
    );

    render(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>
    );

    expect(screen.getByText("認証確認中...")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument(); // Spinner
    expect(screen.queryByText("保護されたコンテンツ")).not.toBeInTheDocument();
  });

  it("有効なトークンの場合、子コンポーネントを表示する", async () => {
    // 既に認証済みの状態に設定
    mockIsAuthenticated.value = true;
    mockCookies.get.mockReturnValue("valid-token" as any);
    mockApiService.validateToken.mockResolvedValue(true);

    render(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>
    );

    // 既に認証済みの場合、即座に子コンポーネントが表示される
    expect(screen.getByText("保護されたコンテンツ")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("無効なトークンの場合、Cookieを削除してログイン画面にリダイレクトする", async () => {
    mockCookies.get.mockReturnValue("invalid-token" as any);
    mockApiService.validateToken.mockResolvedValue(false);

    render(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockCookies.remove).toHaveBeenCalledWith("authToken");
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    expect(screen.queryByText("保護されたコンテンツ")).not.toBeInTheDocument();
  });

  it("トークン検証でエラーが発生した場合、Cookieを削除してログイン画面にリダイレクトする", async () => {
    mockCookies.get.mockReturnValue("error-token" as any);
    mockApiService.validateToken.mockRejectedValue(new Error("Network error"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockCookies.remove).toHaveBeenCalledWith("authToken");
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    expect(consoleSpy).toHaveBeenCalledWith("認証エラー:", expect.any(Error));
    expect(screen.queryByText("保護されたコンテンツ")).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("認証が完了するまで子コンポーネントが表示されない", async () => {
    mockCookies.get.mockReturnValue("valid-token" as any);

    let resolveValidation: (value: boolean) => void = () => {};
    mockApiService.validateToken.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveValidation = resolve;
        }),
    );

    render(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>
    );

    // 検証完了前
    expect(screen.getByText("認証確認中...")).toBeInTheDocument();
    expect(screen.queryByText("保護されたコンテンツ")).not.toBeInTheDocument();

    // 検証完了後
    resolveValidation(true);

    await waitFor(() => {
      expect(screen.getByText("保護されたコンテンツ")).toBeInTheDocument();
    });

    expect(screen.queryByText("認証確認中...")).not.toBeInTheDocument();
  });
});
