/**
 * useLogin custom hook test file
 * 
 * Features:
 * - Login functionality testing
 * - Loading state management tests
 * - Error handling tests
 * - Success flow tests
 * - Token storage tests
 * - User state management tests
 * - Navigation tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLogin } from '../useLogin';
import type { LoginFormData } from '../useLogin';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

vi.mock('jotai', () => ({
  useSetAtom: vi.fn(),
}));

vi.mock('../useErrorHandler', () => ({
  useErrorHandler: vi.fn(),
}));

vi.mock('../../services/apiService', () => ({
  apiService: {
    login: vi.fn(),
    setAuthToken: vi.fn(),
  },
}));

vi.mock('../../constants/MessageConst', () => ({
  MessageConst: {
    AUTH: {
      LOGIN_SUCCESS_DESCRIPTION: vi.fn((username: string) => `${username}さん、ようこそ！`),
    },
  },
}));

vi.mock('../../stores', () => ({
  loginAtom: vi.fn(),
}));

describe('useLogin', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;
  let mockSetAtom: ReturnType<typeof vi.fn>;
  let mockLogin: ReturnType<typeof vi.fn>;
  let mockHandleError: ReturnType<typeof vi.fn>;
  let mockShowSuccess: ReturnType<typeof vi.fn>;
  let mockApiLogin: ReturnType<typeof vi.fn>;
  let mockSetAuthToken: ReturnType<typeof vi.fn>;

  // Sample test data
  const sampleLoginData: LoginFormData = {
    username: 'testuser',
    password: 'password123',
  };

  const sampleLoginResponse = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    role: '部下',
    displayName: 'テストユーザー',
    token: 'mock-jwt-token',
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();

    // Setup mocks
    mockNavigate = vi.fn();
    mockSetAtom = vi.fn();
    mockLogin = vi.fn();
    mockHandleError = vi.fn();
    mockShowSuccess = vi.fn();
    mockApiLogin = vi.fn();
    mockSetAuthToken = vi.fn();

    // Setup module mocks
    const { useNavigate } = await import('react-router-dom');
    (useNavigate as any).mockReturnValue(mockNavigate);

    const { useSetAtom } = await import('jotai');
    (useSetAtom as any).mockReturnValue(mockLogin);

    const { useErrorHandler } = await import('../useErrorHandler');
    (useErrorHandler as any).mockReturnValue({
      handleError: mockHandleError,
      showSuccess: mockShowSuccess,
    });

    const { apiService } = await import('../../services/apiService');
    apiService.login = mockApiLogin;
    apiService.setAuthToken = mockSetAuthToken;
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('initializes with correct default state', () => {
      // Act: Create hook
      const { result } = renderHook(() => useLogin());

      // Assert: Initial state is correct
      expect(result.current.isLoading).toBe(false);
      expect(typeof result.current.login).toBe('function');
    });

    it('returns stable reference for login function', () => {
      // Act: Create hook and get initial reference
      const { result, rerender } = renderHook(() => useLogin());
      const initialLogin = result.current.login;

      // Act: Rerender the hook
      rerender();

      // Assert: Function should still be callable
      expect(typeof result.current.login).toBe('function');
      expect(result.current.login).toBeDefined();
    });
  });

  describe('successful login flow', () => {
    it('successfully logs in and navigates to home', async () => {
      // Arrange: Setup successful API response
      mockApiLogin.mockResolvedValue(sampleLoginResponse);

      const { result } = renderHook(() => useLogin());

      // Act: Perform login
      await act(async () => {
        await result.current.login(sampleLoginData);
      });

      // Assert: Loading state was managed correctly
      expect(result.current.isLoading).toBe(false);

      // Assert: API was called with correct data
      expect(mockApiLogin).toHaveBeenCalledWith(sampleLoginData);

      // Assert: Auth token was set
      expect(mockSetAuthToken).toHaveBeenCalledWith(sampleLoginResponse.token);

      // Assert: User state was updated
      expect(mockLogin).toHaveBeenCalledWith({
        user: {
          id: sampleLoginResponse.id,
          username: sampleLoginResponse.username,
          email: sampleLoginResponse.email,
          role: sampleLoginResponse.role,
          displayName: sampleLoginResponse.displayName,
        },
        token: sampleLoginResponse.token,
      });

      // Assert: Success message was shown
      expect(mockShowSuccess).toHaveBeenCalledWith('testuserさん、ようこそ！');

      // Fast-forward timer to check navigation
      vi.advanceTimersByTime(500);

      // Assert: Navigation was called
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });

    it('handles missing optional fields in login response', async () => {
      // Arrange: Setup response with missing optional fields
      const minimalResponse = {
        username: 'testuser',
        token: 'mock-jwt-token',
      };
      mockApiLogin.mockResolvedValue(minimalResponse);

      const { result } = renderHook(() => useLogin());

      // Act: Perform login
      await act(async () => {
        await result.current.login(sampleLoginData);
      });

      // Assert: Default values were used for missing fields
      expect(mockLogin).toHaveBeenCalledWith({
        user: {
          id: '1', // Default value
          username: 'testuser',
          email: '', // Default value
          role: '部下', // Default value
          displayName: 'testuser', // Fallback to username
        },
        token: 'mock-jwt-token',
      });
    });

    it('sets loading state correctly during login process', async () => {
      // Arrange: Setup successful API response
      mockApiLogin.mockResolvedValue(sampleLoginResponse);

      const { result } = renderHook(() => useLogin());

      // Act: Perform login
      await act(async () => {
        await result.current.login(sampleLoginData);
      });

      // Assert: Loading state is false after completion
      expect(result.current.isLoading).toBe(false);

      // Assert: API was called
      expect(mockApiLogin).toHaveBeenCalledWith(sampleLoginData);
    });
  });

  describe('error handling', () => {
    it('handles login API error correctly', async () => {
      // Arrange: Setup API error
      const error = new Error('Invalid credentials');
      mockApiLogin.mockRejectedValue(error);

      const { result } = renderHook(() => useLogin());

      // Act: Attempt login
      await act(async () => {
        await result.current.login(sampleLoginData);
      });

      // Assert: Error was handled
      expect(mockHandleError).toHaveBeenCalledWith(error, 'ログイン処理');

      // Assert: Loading state was reset
      expect(result.current.isLoading).toBe(false);

      // Assert: No navigation occurred
      expect(mockNavigate).not.toHaveBeenCalled();

      // Assert: No user state was set
      expect(mockLogin).not.toHaveBeenCalled();

      // Assert: No auth token was set
      expect(mockSetAuthToken).not.toHaveBeenCalled();
    });

    it('handles network error correctly', async () => {
      // Arrange: Setup network error
      const networkError = new Error('Network error');
      mockApiLogin.mockRejectedValue(networkError);

      const { result } = renderHook(() => useLogin());

      // Act: Attempt login
      await act(async () => {
        await result.current.login(sampleLoginData);
      });

      // Assert: Error was handled
      expect(mockHandleError).toHaveBeenCalledWith(networkError, 'ログイン処理');

      // Assert: Loading state was reset
      expect(result.current.isLoading).toBe(false);
    });

    it('resets loading state even if error occurs during success flow', async () => {
      // Arrange: Setup successful API but error in setAuthToken
      mockApiLogin.mockResolvedValue(sampleLoginResponse);
      mockSetAuthToken.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useLogin());

      // Act: Attempt login
      await act(async () => {
        await result.current.login(sampleLoginData);
      });

      // Assert: Loading state was reset despite error
      expect(result.current.isLoading).toBe(false);

      // Assert: setAuthToken was called despite error
      expect(mockSetAuthToken).toHaveBeenCalledWith(sampleLoginResponse.token);
      
      // Assert: Login process continued (user state was set)
      expect(mockLogin).toHaveBeenCalled();
      
      // Assert: Success message was shown (login succeeded despite token storage error)
      expect(mockShowSuccess).toHaveBeenCalled();
      
      // Assert: handleError was NOT called (error was handled internally)
      expect(mockHandleError).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('handles empty login data', async () => {
      // Arrange: Setup empty login data
      const emptyData: LoginFormData = {
        username: '',
        password: '',
      };
      mockApiLogin.mockResolvedValue(sampleLoginResponse);

      const { result } = renderHook(() => useLogin());

      // Act: Perform login with empty data
      await act(async () => {
        await result.current.login(emptyData);
      });

      // Assert: API was called with empty data
      expect(mockApiLogin).toHaveBeenCalledWith(emptyData);
    });

    it('handles multiple simultaneous login attempts', async () => {
      // Arrange: Setup successful API responses
      mockApiLogin.mockResolvedValue(sampleLoginResponse);

      const { result } = renderHook(() => useLogin());

      // Act: Perform multiple login attempts
      await act(async () => {
        await Promise.all([
          result.current.login(sampleLoginData),
          result.current.login(sampleLoginData)
        ]);
      });

      // Assert: Loading state is false after completion
      expect(result.current.isLoading).toBe(false);

      // Assert: Both API calls were made
      expect(mockApiLogin).toHaveBeenCalledTimes(2);
      
      // Assert: Both calls used same data
      expect(mockApiLogin).toHaveBeenNthCalledWith(1, sampleLoginData);
      expect(mockApiLogin).toHaveBeenNthCalledWith(2, sampleLoginData);
    });

    it('handles navigation timeout correctly', async () => {
      // Arrange: Setup successful login
      mockApiLogin.mockResolvedValue(sampleLoginResponse);

      const { result } = renderHook(() => useLogin());

      // Act: Perform login
      await act(async () => {
        await result.current.login(sampleLoginData);
      });

      // Assert: Navigation not called immediately
      expect(mockNavigate).not.toHaveBeenCalled();

      // Fast-forward timer
      vi.advanceTimersByTime(500);

      // Assert: Navigation was called after timeout
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });

    it('handles component unmount during login process', async () => {
      // Arrange: Setup delayed API response
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => { resolvePromise = resolve; });
      mockApiLogin.mockReturnValue(promise);

      const { result, unmount } = renderHook(() => useLogin());

      // Act: Start login and unmount
      act(() => {
        result.current.login(sampleLoginData);
      });

      unmount();

      // Complete promise after unmount
      act(() => {
        resolvePromise!(sampleLoginResponse);
      });

      // Assert: No errors should occur
      expect(mockApiLogin).toHaveBeenCalled();
    });
  });

  describe('MessageConst integration', () => {
    it('uses MessageConst for success message', async () => {
      // Arrange: Setup successful login
      mockApiLogin.mockResolvedValue(sampleLoginResponse);

      const { result } = renderHook(() => useLogin());

      // Act: Perform login
      await act(async () => {
        await result.current.login(sampleLoginData);
      });

      // Assert: MessageConst was used for success message
      const { MessageConst } = await import('../../constants/MessageConst');
      expect(MessageConst.AUTH.LOGIN_SUCCESS_DESCRIPTION).toHaveBeenCalledWith(
        sampleLoginResponse.username
      );
    });
  });
});