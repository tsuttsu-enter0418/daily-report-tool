import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@/test/utils";
import { Home } from "../Home";
import type { UserInfo } from "../../types";

// react-router-dom のモック
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// useAuth フックのモック
const mockLogout = vi.fn();
const mockUseAuth = vi.fn();
vi.mock("../../hooks", () => ({
  useAuth: () => mockUseAuth(),
}));

/**
 * Home ページコンポーネントの統合テスト
 * 
 * テスト対象:
 * - 分割されたコンポーネントの正しい統合
 * - ユーザー情報の表示統合
 * - ナビゲーション機能の統合
 * - ログアウト機能
 */
describe("Home", () => {
  const mockUser: UserInfo = {
    id: "1",
    username: "testuser",
    displayName: "テストユーザー",
    role: "部下",
    email: "test@example.com",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    });
  });

  it("ホーム画面の基本要素が表示される", () => {
    const { getByText } = render(<Home />);
    
    expect(getByText("日報管理システム")).toBeInTheDocument();
    expect(getByText("日報管理システムへようこそ")).toBeInTheDocument();
    expect(getByText("ログアウト")).toBeInTheDocument();
  });

  it("ログインユーザーの情報が表示される", () => {
    const { getByText } = render(<Home />);
    
    expect(getByText(/テストユーザー/)).toBeInTheDocument();
    expect(getByText("部下")).toBeInTheDocument();
  });

  it("ユーザーがnullの場合、ユーザー情報セクションが表示されない", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      logout: mockLogout,
    });
    
    const { queryByText } = render(<Home />);
    
    expect(queryByText(/テストユーザー/)).not.toBeInTheDocument();
    expect(queryByText("部下")).not.toBeInTheDocument();
  });

  it("ログアウトボタンをクリックするとlogout関数が呼ばれる", () => {
    const { getByText } = render(<Home />);
    
    fireEvent.click(getByText("ログアウト"));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it("上長ユーザーには適切な機能が表示される", () => {
    const supervisorUser: UserInfo = {
      ...mockUser,
      role: "上長",
    };
    
    mockUseAuth.mockReturnValue({
      user: supervisorUser,
      logout: mockLogout,
    });
    
    const { getByText } = render(<Home />);
    
    expect(getByText(/チーム日報を確認/)).toBeInTheDocument();
    expect(getByText(/日報を作成/)).toBeInTheDocument();
    expect(getByText(/自分の日報履歴/)).toBeInTheDocument();
  });

  it("管理者ユーザーには適切な機能が表示される", () => {
    const adminUser: UserInfo = {
      ...mockUser,
      role: "管理者",
    };
    
    mockUseAuth.mockReturnValue({
      user: adminUser,
      logout: mockLogout,
    });
    
    const { getByText } = render(<Home />);
    
    expect(getByText(/チーム日報を確認/)).toBeInTheDocument();
    expect(getByText(/日報を作成/)).toBeInTheDocument();
    expect(getByText(/自分の日報履歴/)).toBeInTheDocument();
  });
});