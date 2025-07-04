/**
 * apiService の統合テスト
 *
 * テスト対象:
 * - 環境変数による API 切り替え
 * - モック API 使用時の動作
 * - 実 API 使用時の動作（モック）
 * - エラーハンドリング
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiService } from "../apiService";

// fetch のモック
global.fetch = vi.fn();

describe("apiService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe("login - 開発モード（モックAPI使用）", () => {
    beforeEach(() => {
      // 開発環境でモックAPI使用の設定
      vi.stubGlobal("import.meta", {
        env: {
          DEV: true,
          VITE_USE_REAL_API: "false",
        },
      });
    });

    it("モックAPIでログインが成功する", async () => {
      const loginData = {
        username: "admin",
        password: "password",
      };

      vi.advanceTimersByTime(1000);

      const result = await apiService.login(loginData);

      expect(result).toEqual({
        token: expect.stringContaining("mock-jwt-token-1-"),
        username: "admin",
        role: "管理者",
      });

      // fetch が呼ばれていないことを確認（モックAPI使用）
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe("login - 開発モード（実API使用）", () => {
    beforeEach(() => {
      // 開発環境で実API使用の設定
      vi.stubGlobal("import.meta", {
        env: {
          DEV: true,
          VITE_USE_REAL_API: "true",
        },
      });
    });

    it("実APIでログインが成功する", async () => {
      const loginData = {
        username: "admin",
        password: "password",
      };

      const mockResponse = {
        token: "real-jwt-token",
        username: "admin",
        role: "管理者",
      };

      // fetch のモック設定
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await apiService.login(loginData);

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });
    });

    it("実APIでログインが失敗する", async () => {
      const loginData = {
        username: "admin",
        password: "wrongpassword",
      };

      // fetch のエラーレスポンスモック
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response);

      await expect(apiService.login(loginData)).rejects.toThrow(
        "ログインに失敗しました。ユーザー名またはパスワードが正しくありません。",
      );
    });
  });

  describe("validateToken", () => {
    it("モックAPIでトークン検証が成功する", async () => {
      vi.stubGlobal("import.meta", {
        env: {
          DEV: true,
          VITE_USE_REAL_API: "false",
        },
      });

      const token = "mock-jwt-token-1-12345";

      vi.advanceTimersByTime(300);

      const isValid = await apiService.validateToken(token);

      expect(isValid).toBe(true);
      expect(fetch).not.toHaveBeenCalled();
    });

    it("実APIでトークン検証が成功する", async () => {
      vi.stubGlobal("import.meta", {
        env: {
          DEV: true,
          VITE_USE_REAL_API: "true",
        },
      });

      const token = "real-jwt-token";

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
      } as Response);

      const isValid = await apiService.validateToken(token);

      expect(isValid).toBe(true);
      expect(fetch).toHaveBeenCalledWith("/api/auth/validate", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    });

    it("実APIでトークン検証が失敗する", async () => {
      vi.stubGlobal("import.meta", {
        env: {
          DEV: true,
          VITE_USE_REAL_API: "true",
        },
      });

      const token = "invalid-token";

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
      } as Response);

      const isValid = await apiService.validateToken(token);

      expect(isValid).toBe(false);
    });

    it("ネットワークエラー時にfalseを返す", async () => {
      vi.stubGlobal("import.meta", {
        env: {
          DEV: true,
          VITE_USE_REAL_API: "true",
        },
      });

      const token = "some-token";

      vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

      const isValid = await apiService.validateToken(token);

      expect(isValid).toBe(false);
    });
  });
});
