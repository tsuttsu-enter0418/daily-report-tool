/**
 * realApi の実APIテスト
 *
 * テスト対象:
 * - 実API呼び出しの基本動作
 * - fetchモックを使用した実APIレスポンスの検証
 * - エラーハンドリング
 * - 実際のエンドポイントへの呼び出し確認
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// fetch のモック
global.fetch = vi.fn();

// localStorage のモック
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// 環境変数を実API使用に設定
vi.stubGlobal("import.meta", {
  env: {
    DEV: true,
    VITE_USE_REAL_API: "true",
    VITE_API_URL: "http://localhost:8080",
  },
});

describe("実API テスト", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("実APIでのlogin", () => {
    it("ログインが成功する", async () => {
      const loginData = {
        username: "admin",
        password: "password",
      };

      const mockResponseData = {
        token: "real-jwt-token-12345",
        username: "admin",
        role: "管理者",
      };

      // fetch のモック設定
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponseData),
        status: 200,
        statusText: "OK",
      } as Response);

      // 環境変数を再設定してモジュールを動的インポート
      vi.stubGlobal("import.meta", {
        env: {
          DEV: true,
          VITE_USE_REAL_API: "true",
          VITE_API_URL: "http://localhost:8080",
        },
      });

      // realApi を取得
      const { realApi } = await import("../apiService");
      const result = await realApi.login(loginData);

      expect(result).toEqual({
        token: "real-jwt-token-12345",
        username: "admin",
        role: "管理者",
      });

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        }
      );
    });

    it("ログインが失敗する", async () => {
      const loginData = {
        username: "admin",
        password: "wrongpassword",
      };

      // fetch のエラーレスポンスモック
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: () => Promise.resolve({ message: "認証に失敗しました" }),
      } as Response);

      const { realApi } = await import("../apiService");

      await expect(realApi.login(loginData)).rejects.toThrow(
        "認証に失敗しました。ログイン情報を確認してください。"
      );

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        }
      );
    });

    it("ネットワークエラーでログインが失敗する", async () => {
      const loginData = {
        username: "admin",
        password: "password",
      };

      // ネットワークエラーをシミュレート
      vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

      const { realApi } = await import("../apiService");

      await expect(realApi.login(loginData)).rejects.toThrow();
    });
  });

  describe("実APIでのvalidateToken", () => {
    it("トークン検証が成功する", async () => {
      const token = "real-jwt-token-12345";

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
      } as Response);

      const { realApi } = await import("../apiService");
      const isValid = await realApi.validateToken(token);

      expect(isValid).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/auth/validate",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
    });

    it("トークン検証が失敗する", async () => {
      const token = "invalid-token";

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      } as Response);

      const { realApi } = await import("../apiService");
      const isValid = await realApi.validateToken(token);

      expect(isValid).toBe(false);
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/auth/validate",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
    });

    it("ネットワークエラー時にfalseを返す", async () => {
      const token = "some-token";

      vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

      const { realApi } = await import("../apiService");
      const isValid = await realApi.validateToken(token);

      expect(isValid).toBe(false);
    });
  });

  describe("実APIでのgetUserInfo", () => {
    it("ユーザー情報取得が成功する", async () => {
      const token = "real-jwt-token-12345";
      const mockUserInfo = {
        id: "1",
        username: "admin",
        email: "admin@example.com",
        role: "管理者",
        displayName: "管理者",
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserInfo),
        status: 200,
        statusText: "OK",
      } as Response);

      const { realApi } = await import("../apiService");
      const userInfo = await realApi.getUserInfo(token);

      expect(userInfo).toEqual(mockUserInfo);
      expect(fetch).toHaveBeenCalledWith("http://localhost:8080/api/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    });

    it("ユーザー情報取得が失敗する", async () => {
      const token = "invalid-token";

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      } as Response);

      const { realApi } = await import("../apiService");
      const userInfo = await realApi.getUserInfo(token);

      expect(userInfo).toBeNull();
      expect(fetch).toHaveBeenCalledWith("http://localhost:8080/api/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    });
  });

  describe("実APIでの日報操作", () => {
    it("日報作成が成功する", async () => {
      const reportData = {
        title: "テスト日報",
        workContent: "テスト内容",
        status: "submitted" as const,
        reportDate: "2024-01-15",
      };

      const mockResponseData = {
        id: 1,
        title: "テスト日報",
        workContent: "テスト内容",
        status: "submitted",
        reportDate: "2024-01-15",
        userId: "1",
        submittedAt: "2024-01-15T10:00:00Z",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponseData),
        status: 201,
        statusText: "Created",
      } as Response);

      const { realApi } = await import("../apiService");
      const result = await realApi.createDailyReport(reportData);

      expect(result).toEqual(mockResponseData);
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/daily-reports",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reportData),
        }
      );
    });

    it("日報取得が成功する", async () => {
      const reportId = 1;
      const mockResponseData = {
        id: 1,
        title: "テスト日報",
        workContent: "テスト内容",
        status: "submitted",
        reportDate: "2024-01-15",
        userId: "1",
        submittedAt: "2024-01-15T10:00:00Z",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponseData),
        status: 200,
        statusText: "OK",
      } as Response);

      const { realApi } = await import("../apiService");
      const result = await realApi.getDailyReport(reportId);

      expect(result).toEqual(mockResponseData);
      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:8080/api/daily-reports/${reportId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    it("日報一覧取得が成功する", async () => {
      const params = {
        page: 0,
        size: 10,
        status: "submitted" as const,
      };

      const mockResponseData = [
        {
          id: 1,
          title: "テスト日報1",
          workContent: "テスト内容1",
          status: "submitted",
          reportDate: "2024-01-15",
          userId: "1",
          submittedAt: "2024-01-15T10:00:00Z",
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-15T10:00:00Z",
        },
        {
          id: 2,
          title: "テスト日報2",
          workContent: "テスト内容2",
          status: "submitted",
          reportDate: "2024-01-16",
          userId: "1",
          submittedAt: "2024-01-16T10:00:00Z",
          createdAt: "2024-01-16T10:00:00Z",
          updatedAt: "2024-01-16T10:00:00Z",
        },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponseData),
        status: 200,
        statusText: "OK",
      } as Response);

      const { realApi } = await import("../apiService");
      const result = await realApi.getDailyReports(params);

      expect(result).toEqual(mockResponseData);
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/daily-reports?page=0&size=10&status=submitted",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    it("日報削除が成功する", async () => {
      const reportId = 1;

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 204,
        statusText: "No Content",
      } as Response);

      const { realApi } = await import("../apiService");
      await realApi.deleteDailyReport(reportId);

      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:8080/api/daily-reports/${reportId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });
  });
});
