import type { LoginRequest, LoginResponse } from "../types";

/**
 * モックAPIサービス
 * 
 * 機能:
 * - バックエンド不要でのフロントエンド開発サポート
 * - 実際のAPIと同じインターフェースを提供
 * - ログイン認証、トークン検証、ユーザー情報取得をシミュレート
 * - 遅延処理で実際のAPI通信を模擬
 * 
 * 使用場面:
 * - フロントエンド独立開発
 * - UIテスト
 * - デモンストレーション
 */

type MockUser = {
  id: string;
  username: string;
  email: string;
  role: string;
};

// モックユーザーデータ
const mockUsers: MockUser[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@example.com",
    role: "管理者",
  },
  {
    id: "2",
    username: "manager",
    email: "manager@example.com",
    role: "上長",
  },
  {
    id: "3",
    username: "employee1",
    email: "emp1@example.com",
    role: "部下",
  },
];

// APIの遅延をシミュレート
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    // API呼び出しの遅延をシミュレート
    await delay(800);

    // ユーザー認証をシミュレート
    const user = mockUsers.find((u) => u.username === loginData.username);

    if (!user || loginData.password !== "password") {
      throw new Error("ユーザー名またはパスワードが正しくありません");
    }

    // JWTトークンをシミュレート
    const mockToken = `mock-jwt-token-${user.id}-${Date.now()}`;

    return {
      token: mockToken,
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      displayName: user.username,
    };
  },

  async validateToken(token: string): Promise<boolean> {
    await delay(200);
    // モックトークンの簡単な検証
    return token.startsWith("mock-jwt-token-");
  },

  async getUserInfo(token: string): Promise<MockUser | null> {
    await delay(200);

    if (!token.startsWith("mock-jwt-token-")) {
      return null;
    }

    // トークンからユーザーIDを抽出（モック実装）
    const parts = token.split("-");
    const userId = parts[3];

    return mockUsers.find((u) => u.id.toString() === userId) || null;
  },
};
