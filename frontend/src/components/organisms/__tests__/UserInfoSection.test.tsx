import { describe, it, expect } from "vitest";
import { render } from "@/test/utils";
import { UserInfoSection } from "../UserInfoSection";
import type { UserInfo } from "../../../types";

/**
 * UserInfoSection コンポーネントのテスト
 * 
 * テスト対象:
 * - ユーザー情報の正しい表示
 * - 表示名の優先表示ロジック
 * - ロールバッジの表示
 * - Email未設定時の適切な表示
 */
describe("UserInfoSection", () => {
  const mockUser: UserInfo = {
    id: "1",
    username: "testuser",
    displayName: "テストユーザー",
    role: "部下",
    email: "test@example.com",
  };

  it("ユーザー情報が正しく表示される", () => {
    const { getByText } = render(<UserInfoSection user={mockUser} />);
    
    expect(getByText(/テストユーザー/)).toBeInTheDocument();
    expect(getByText("部下")).toBeInTheDocument();
    expect(getByText(/ID: 1/)).toBeInTheDocument();
    expect(getByText(/Email: test@example.com/)).toBeInTheDocument();
  });

  it("表示名がない場合はユーザー名が表示される", () => {
    const userWithoutDisplayName: UserInfo = {
      ...mockUser,
      displayName: undefined,
    };
    
    const { getByText } = render(<UserInfoSection user={userWithoutDisplayName} />);
    
    expect(getByText(/testuser/)).toBeInTheDocument();
  });

  it("Emailが未設定の場合は「未設定」が表示される", () => {
    const userWithoutEmail: UserInfo = {
      ...mockUser,
      email: undefined,
    };
    
    const { getByText } = render(<UserInfoSection user={userWithoutEmail} />);
    
    expect(getByText(/Email: 未設定/)).toBeInTheDocument();
  });

  it("管理者ロールが正しく表示される", () => {
    const adminUser: UserInfo = {
      ...mockUser,
      role: "管理者",
    };
    
    const { getByText } = render(<UserInfoSection user={adminUser} />);
    
    expect(getByText("管理者")).toBeInTheDocument();
  });

  it("上長ロールが正しく表示される", () => {
    const supervisorUser: UserInfo = {
      ...mockUser,
      role: "上長",
    };
    
    const { getByText } = render(<UserInfoSection user={supervisorUser} />);
    
    expect(getByText("上長")).toBeInTheDocument();
  });
});