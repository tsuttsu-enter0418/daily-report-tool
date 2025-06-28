/**
 * mockApi サービスのユニットテスト
 * 
 * テスト対象:
 * - ログイン認証機能
 * - トークン検証機能
 * - ユーザー情報取得機能
 * - エラーハンドリング
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockApi } from '../mockApi'

describe('mockApi', () => {
  beforeEach(() => {
    // 各テスト前にタイマーをリセット
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  describe('login', () => {
    it('正常なログイン情報で認証が成功する', async () => {
      const loginData = {
        username: 'admin',
        password: 'password'
      }

      // APIの遅延をスキップ
      vi.advanceTimersByTime(1000)

      const result = await mockApi.login(loginData)

      expect(result).toEqual({
        token: expect.stringContaining('mock-jwt-token-1-'),
        username: 'admin',
        role: '管理者'
      })
    })

    it('存在しないユーザー名でログインが失敗する', async () => {
      const loginData = {
        username: 'nonexistent',
        password: 'password'
      }

      vi.advanceTimersByTime(1000)

      await expect(mockApi.login(loginData)).rejects.toThrow(
        'ユーザー名またはパスワードが正しくありません'
      )
    })

    it('間違ったパスワードでログインが失敗する', async () => {
      const loginData = {
        username: 'admin',
        password: 'wrongpassword'
      }

      vi.advanceTimersByTime(1000)

      await expect(mockApi.login(loginData)).rejects.toThrow(
        'ユーザー名またはパスワードが正しくありません'
      )
    })

    it('各ユーザーで正しい役職が返される', async () => {
      const testCases = [
        { username: 'admin', expectedRole: '管理者' },
        { username: 'manager', expectedRole: '上長' },
        { username: 'employee1', expectedRole: '部下' }
      ]

      for (const testCase of testCases) {
        vi.advanceTimersByTime(1000)
        
        const result = await mockApi.login({
          username: testCase.username,
          password: 'password'
        })

        expect(result.role).toBe(testCase.expectedRole)
        expect(result.username).toBe(testCase.username)
      }
    })
  })

  describe('validateToken', () => {
    it('有効なモックトークンの検証が成功する', async () => {
      const validToken = 'mock-jwt-token-1-12345'

      vi.advanceTimersByTime(300)

      const isValid = await mockApi.validateToken(validToken)

      expect(isValid).toBe(true)
    })

    it('無効なトークンの検証が失敗する', async () => {
      const invalidToken = 'invalid-token'

      vi.advanceTimersByTime(300)

      const isValid = await mockApi.validateToken(invalidToken)

      expect(isValid).toBe(false)
    })

    it('空文字トークンの検証が失敗する', async () => {
      const emptyToken = ''

      vi.advanceTimersByTime(300)

      const isValid = await mockApi.validateToken(emptyToken)

      expect(isValid).toBe(false)
    })
  })

  describe('getUserInfo', () => {
    it('有効なトークンでユーザー情報を取得できる', async () => {
      const validToken = 'mock-jwt-token-1-12345'

      vi.advanceTimersByTime(300)

      const userInfo = await mockApi.getUserInfo(validToken)

      expect(userInfo).toEqual({
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: '管理者'
      })
    })

    it('無効なトークンでユーザー情報取得がnullを返す', async () => {
      const invalidToken = 'invalid-token'

      vi.advanceTimersByTime(300)

      const userInfo = await mockApi.getUserInfo(invalidToken)

      expect(userInfo).toBeNull()
    })

    it('存在しないユーザーIDのトークンでnullを返す', async () => {
      const tokenWithInvalidUserId = 'mock-jwt-token-999-12345'

      vi.advanceTimersByTime(300)

      const userInfo = await mockApi.getUserInfo(tokenWithInvalidUserId)

      expect(userInfo).toBeNull()
    })
  })
})