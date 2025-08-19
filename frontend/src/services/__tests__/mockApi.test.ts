/**
 * mockApi サービスのユニットテスト
 *
 * テスト対象:
 * - ログイン認証機能
 * - トークン検証機能
 * - ユーザー情報取得機能
 * - エラーハンドリング
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mockApi } from "../mockApi";

describe("mockApi", () => {
  beforeEach(() => {
    // 各テスト前にタイマーをリセット
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe("login", () => {
    it("正常なログイン情報で認証が成功する", async () => {
      const loginData = {
        username: "admin",
        password: "password",
      };

      // const result = await mockApi.login(loginData);
      const loginPromise = mockApi.login(loginData);

      // APIの遅延をスキップ
      vi.runAllTimers();

      const result = await loginPromise;
      expect(result).toEqual({
        token: expect.stringContaining("mock-jwt-token-1-"),
        username: "admin",
        role: "管理者",
        email: "admin@example.com",
        id: "1",
        displayName: "admin",
      });
    });

    it("存在しないユーザー名でログインが失敗する", async () => {
      const loginData = {
        username: "nonexistent",
        password: "password",
      };

      const loginPromise = mockApi.login(loginData);
      // APIの遅延をスキップ
      vi.runAllTimers();

      await expect(loginPromise).rejects.toThrow(
        "ユーザー名またはパスワードが正しくありません",
      );
    });

    it("間違ったパスワードでログインが失敗する", async () => {
      const loginData = {
        username: "admin",
        password: "wrongpassword",
      };

      const loginPromise = mockApi.login(loginData);
      // APIの遅延をスキップ
      vi.runAllTimers();

      await expect(loginPromise).rejects.toThrow(
        "ユーザー名またはパスワードが正しくありません",
      );
    });

    it("各ユーザーで正しい役職が返される", async () => {
      const testCases = [
        { username: "admin", expectedRole: "管理者" },
        { username: "manager", expectedRole: "上長" },
        { username: "employee1", expectedRole: "部下" },
      ];

      for (const testCase of testCases) {
        const loginPromise = mockApi.login({
          username: testCase.username,
          password: "password",
        });

        vi.runAllTimers();

        const result = await loginPromise;

        expect(result.role).toBe(testCase.expectedRole);
        expect(result.username).toBe(testCase.username);
      }
    });
  });

  describe("validateToken", () => {
    it("有効なモックトークンの検証が成功する", async () => {
      const validToken = "mock-jwt-token-1-12345";
      const loginPromise = mockApi.validateToken(validToken);

      vi.advanceTimersByTime(250);

      const isValid = await loginPromise;

      expect(isValid).toBe(true);
    });

    it("無効なトークンの検証が失敗する", async () => {
      const invalidToken = "invalid-token";

      const loginPromise = mockApi.validateToken(invalidToken);

      vi.advanceTimersByTime(250);

      const isValid = await loginPromise;

      expect(isValid).toBe(false);
    });

    it("空文字トークンの検証が失敗する", async () => {
      const emptyToken = "";

      const loginPromise = mockApi.validateToken(emptyToken);

      vi.advanceTimersByTime(250);

      const isValid = await loginPromise;

      expect(isValid).toBe(false);
    });
  });

  describe("getUserInfo", () => {
    it("有効なトークンでユーザー情報を取得できる", async () => {
      const validToken = "mock-jwt-token-1-12345";
      const loginPromise = mockApi.getUserInfo(validToken);

      vi.advanceTimersByTime(250);

      const userInfo = await loginPromise;

      expect(userInfo).toEqual({
        id: "1",
        username: "admin",
        email: "admin@example.com",
        role: "管理者",
      });
    });

    it("無効なトークンでユーザー情報取得がnullを返す", async () => {
      const invalidToken = "invalid-token";

      const loginPromise = mockApi.getUserInfo(invalidToken);

      vi.advanceTimersByTime(250);

      const userInfo = await loginPromise;

      expect(userInfo).toBeNull();
    });

    it("存在しないユーザーIDのトークンでnullを返す", async () => {
      const tokenWithInvalidUserId = "mock-jwt-token-999-12345";

      const loginPromise = mockApi.getUserInfo(tokenWithInvalidUserId);

      vi.advanceTimersByTime(250);

      const userInfo = await loginPromise;

      expect(userInfo).toBeNull();
    });
  });
});
