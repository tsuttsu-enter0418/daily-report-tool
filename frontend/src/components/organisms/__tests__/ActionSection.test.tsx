import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@/test/utils";
import { ActionSection } from "../ActionSection";
import type { UserInfo } from "../../../types";

// react-router-dom のモック
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

/**
 * ActionSection コンポーネントのテスト
 *
 * テスト対象:
 * - 権限に応じたボタン表示
 * - ナビゲーション機能
 * - 各役職での適切な権限制御
 */
describe("ActionSection", () => {
  const baseUser: UserInfo = {
    id: "1",
    username: "testuser",
    displayName: "テストユーザー",
    role: "部下",
    email: "test@example.com",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("部下ユーザーには上司ダッシュボードボタンが表示されない", () => {
    const { queryByText, getByText } = render(<ActionSection user={baseUser} />);

    // 上司ダッシュボードボタンは表示されない
    expect(queryByText(/チーム日報を確認/)).not.toBeInTheDocument();

    // 基本機能は表示される
    expect(getByText(/日報を作成/)).toBeInTheDocument();
    expect(getByText(/自分の日報履歴/)).toBeInTheDocument();
  });

  it("上長ユーザーには上司ダッシュボードボタンが表示される", () => {
    const supervisorUser: UserInfo = {
      ...baseUser,
      role: "上長",
    };

    const { getByText } = render(<ActionSection user={supervisorUser} />);

    expect(getByText(/チーム日報を確認/)).toBeInTheDocument();
    expect(getByText(/日報を作成/)).toBeInTheDocument();
    expect(getByText(/自分の日報履歴/)).toBeInTheDocument();
  });

  it("管理者ユーザーには上司ダッシュボードボタンが表示される", () => {
    const adminUser: UserInfo = {
      ...baseUser,
      role: "管理者",
    };

    const { getByText } = render(<ActionSection user={adminUser} />);

    expect(getByText(/チーム日報を確認/)).toBeInTheDocument();
    expect(getByText(/日報を作成/)).toBeInTheDocument();
    expect(getByText(/自分の日報履歴/)).toBeInTheDocument();
  });

  it("上司ダッシュボードボタンをクリックすると正しいパスに遷移する", () => {
    const supervisorUser: UserInfo = {
      ...baseUser,
      role: "上長",
    };

    const { getByText } = render(<ActionSection user={supervisorUser} />);

    fireEvent.click(getByText(/チーム日報を確認/));
    expect(mockNavigate).toHaveBeenCalledWith("/supervisor");
  });

  it("日報作成ボタンをクリックすると正しいパスに遷移する", () => {
    const { getByText } = render(<ActionSection user={baseUser} />);

    fireEvent.click(getByText(/日報を作成/));
    expect(mockNavigate).toHaveBeenCalledWith("/report/create");
  });

  it("履歴閲覧ボタンをクリックすると正しいパスに遷移する", () => {
    const { getByText } = render(<ActionSection user={baseUser} />);

    fireEvent.click(getByText(/自分の日報履歴/));
    expect(mockNavigate).toHaveBeenCalledWith("/report/list");
  });
});
