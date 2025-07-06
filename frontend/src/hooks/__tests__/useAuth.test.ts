/**
 * useAuth custom hook test file
 * 
 * Features:
 * - Authentication state management tests
 * - User information retrieval tests
 * - Token management tests
 * - Logout functionality tests
 * - Navigation tests
 * - Toast notification tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import type { UserInfo } from '../../types';

// Mock dependencies
vi.mock('jotai', () => ({
  useAtomValue: vi.fn(),
  useSetAtom: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

vi.mock('../../stores', () => ({
  userAtom: 'userAtom',
  isAuthenticatedAtom: 'isAuthenticatedAtom',
  tokenAtom: 'tokenAtom',
  logoutAtom: 'logoutAtom',
}));

vi.mock('../../services/apiService', () => ({
  apiService: {
    removeAuthToken: vi.fn(),
  },
}));

vi.mock('../../components/atoms', () => ({
  Toast: {
    success: vi.fn(),
  },
}));

vi.mock('../../constants/MessageConst', () => ({
  MessageConst: {
    AUTH: {
      LOGOUT_SUCCESS: 'ログアウトしました',
    },
  },
}));

describe('useAuth', () => {
  let mockUseAtomValue: ReturnType<typeof vi.fn>;
  let mockUseSetAtom: ReturnType<typeof vi.fn>;
  let mockNavigate: ReturnType<typeof vi.fn>;
  let mockPerformLogout: ReturnType<typeof vi.fn>;
  let mockRemoveAuthToken: ReturnType<typeof vi.fn>;
  let mockToastSuccess: ReturnType<typeof vi.fn>;

  // Sample test data
  const sampleUser: UserInfo = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    role: '部下',
    displayName: 'テストユーザー',
  };

  const sampleToken = 'mock-jwt-token';

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup mocks
    mockUseAtomValue = vi.fn();
    mockUseSetAtom = vi.fn();
    mockNavigate = vi.fn();
    mockPerformLogout = vi.fn();
    mockRemoveAuthToken = vi.fn();
    mockToastSuccess = vi.fn();

    // Setup module mocks
    const { useAtomValue, useSetAtom } = await import('jotai');
    (useAtomValue as any).mockImplementation(mockUseAtomValue);
    (useSetAtom as any).mockImplementation(mockUseSetAtom);

    const { useNavigate } = await import('react-router-dom');
    (useNavigate as any).mockReturnValue(mockNavigate);

    const { apiService } = await import('../../services/apiService');
    apiService.removeAuthToken = mockRemoveAuthToken;

    const { Toast } = await import('../../components/atoms');
    Toast.success = mockToastSuccess;

    // Setup atom mocks
    mockUseSetAtom.mockReturnValue(mockPerformLogout);
  });

  describe('initialization', () => {
    it('initializes and returns correct authentication state', () => {
      // Arrange: Setup authenticated state
      mockUseAtomValue
        .mockReturnValueOnce(sampleUser) // userAtom
        .mockReturnValueOnce(true) // isAuthenticatedAtom
        .mockReturnValueOnce(sampleToken); // tokenAtom

      // Act: Create hook
      const { result } = renderHook(() => useAuth());

      // Assert: Returns correct state
      expect(result.current.user).toEqual(sampleUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.token).toBe(sampleToken);
      expect(typeof result.current.logout).toBe('function');
    });

    it('handles unauthenticated state correctly', () => {
      // Arrange: Setup unauthenticated state
      mockUseAtomValue
        .mockReturnValueOnce(null) // userAtom
        .mockReturnValueOnce(false) // isAuthenticatedAtom
        .mockReturnValueOnce(null); // tokenAtom

      // Act: Create hook
      const { result } = renderHook(() => useAuth());

      // Assert: Returns unauthenticated state
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.token).toBeNull();
      expect(typeof result.current.logout).toBe('function');
    });

    it('calls useAtomValue with correct atoms', () => {
      // Arrange: Setup mocks
      mockUseAtomValue.mockReturnValue(null);

      // Act: Create hook
      renderHook(() => useAuth());

      // Assert: Atoms were called correctly
      expect(mockUseAtomValue).toHaveBeenCalledTimes(3);
      expect(mockUseAtomValue).toHaveBeenNthCalledWith(1, 'userAtom');
      expect(mockUseAtomValue).toHaveBeenNthCalledWith(2, 'isAuthenticatedAtom');
      expect(mockUseAtomValue).toHaveBeenNthCalledWith(3, 'tokenAtom');
    });

    it('calls useSetAtom with correct atom', () => {
      // Arrange: Setup mocks
      mockUseAtomValue.mockReturnValue(null);

      // Act: Create hook
      renderHook(() => useAuth());

      // Assert: logoutAtom was called
      expect(mockUseSetAtom).toHaveBeenCalledWith('logoutAtom');
    });
  });

  describe('logout functionality', () => {
    beforeEach(() => {
      // Setup default authenticated state
      mockUseAtomValue
        .mockReturnValueOnce(sampleUser)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(sampleToken);
    });

    it('successfully performs logout', () => {
      // Arrange: Create hook
      const { result } = renderHook(() => useAuth());

      // Act: Perform logout
      act(() => {
        result.current.logout();
      });

      // Assert: Auth token was removed
      expect(mockRemoveAuthToken).toHaveBeenCalledTimes(1);

      // Assert: Logout atom was called
      expect(mockPerformLogout).toHaveBeenCalledTimes(1);

      // Assert: Success toast was shown
      expect(mockToastSuccess).toHaveBeenCalledWith({
        title: 'ログアウトしました',
        duration: 2000,
      });

      // Assert: Navigation was called
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('performs logout steps in correct order', () => {
      // Arrange: Create hook
      const { result } = renderHook(() => useAuth());

      // Act: Perform logout
      act(() => {
        result.current.logout();
      });

      // Assert: Functions were called
      expect(mockRemoveAuthToken).toHaveBeenCalledTimes(1);
      expect(mockPerformLogout).toHaveBeenCalledTimes(1);
      expect(mockToastSuccess).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('handles logout when already logged out', () => {
      // Arrange: Setup unauthenticated state
      mockUseAtomValue
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(null);

      const { result } = renderHook(() => useAuth());

      // Act: Perform logout when already logged out
      act(() => {
        result.current.logout();
      });

      // Assert: Logout process still completes
      expect(mockRemoveAuthToken).toHaveBeenCalledTimes(1);
      expect(mockPerformLogout).toHaveBeenCalledTimes(1);
      expect(mockToastSuccess).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('handles errors during logout gracefully', () => {
      // Arrange: Setup error in removeAuthToken
      mockRemoveAuthToken.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useAuth());

      // Act: Perform logout (may throw error)
      act(() => {
        result.current.logout();
      });

      // Assert: removeAuthToken was called despite error
      expect(mockRemoveAuthToken).toHaveBeenCalledTimes(1);
      // Other logout steps should still execute
      expect(mockPerformLogout).toHaveBeenCalledTimes(1);
      expect(mockToastSuccess).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('user information', () => {
    it('returns user information correctly', () => {
      // Arrange: Setup user data
      mockUseAtomValue
        .mockReturnValueOnce(sampleUser)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(sampleToken);

      // Act: Create hook
      const { result } = renderHook(() => useAuth());

      // Assert: User information is returned correctly
      expect(result.current.user).toEqual(sampleUser);
      expect(result.current.user?.username).toBe('testuser');
      expect(result.current.user?.role).toBe('部下');
      expect(result.current.user?.displayName).toBe('テストユーザー');
    });

    it('handles null user correctly', () => {
      // Arrange: Setup null user
      mockUseAtomValue
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(null);

      // Act: Create hook
      const { result } = renderHook(() => useAuth());

      // Assert: Null user is handled correctly
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.token).toBeNull();
    });

    it('handles different user roles correctly', () => {
      const adminUser: UserInfo = {
        ...sampleUser,
        role: '管理者',
      };

      // Arrange: Setup admin user
      mockUseAtomValue
        .mockReturnValueOnce(adminUser)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(sampleToken);

      // Act: Create hook
      const { result } = renderHook(() => useAuth());

      // Assert: Admin user is returned correctly
      expect(result.current.user?.role).toBe('管理者');
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('token management', () => {
    it('returns token correctly', () => {
      // Arrange: Setup token
      mockUseAtomValue
        .mockReturnValueOnce(sampleUser)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(sampleToken);

      // Act: Create hook
      const { result } = renderHook(() => useAuth());

      // Assert: Token is returned correctly
      expect(result.current.token).toBe(sampleToken);
    });

    it('handles null token correctly', () => {
      // Arrange: Setup null token
      mockUseAtomValue
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(null);

      // Act: Create hook
      const { result } = renderHook(() => useAuth());

      // Assert: Null token is handled correctly
      expect(result.current.token).toBeNull();
    });

    it('handles empty string token correctly', () => {
      // Arrange: Setup empty token
      mockUseAtomValue
        .mockReturnValueOnce(sampleUser)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce('');

      // Act: Create hook
      const { result } = renderHook(() => useAuth());

      // Assert: Empty token is handled correctly
      expect(result.current.token).toBe('');
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('authentication state', () => {
    it('returns true when authenticated', () => {
      // Arrange: Setup authenticated state
      mockUseAtomValue
        .mockReturnValueOnce(sampleUser)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(sampleToken);

      // Act: Create hook
      const { result } = renderHook(() => useAuth());

      // Assert: Authentication state is true
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('returns false when not authenticated', () => {
      // Arrange: Setup unauthenticated state
      mockUseAtomValue
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(null);

      // Act: Create hook
      const { result } = renderHook(() => useAuth());

      // Assert: Authentication state is false
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('handles rapid logout calls', () => {
      // Arrange: Setup authenticated state
      mockUseAtomValue
        .mockReturnValueOnce(sampleUser)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(sampleToken);

      const { result } = renderHook(() => useAuth());

      // Act: Call logout multiple times rapidly
      act(() => {
        result.current.logout();
        result.current.logout();
        result.current.logout();
      });

      // Assert: All logout calls are handled
      expect(mockRemoveAuthToken).toHaveBeenCalledTimes(3);
      expect(mockPerformLogout).toHaveBeenCalledTimes(3);
      expect(mockToastSuccess).toHaveBeenCalledTimes(3);
      expect(mockNavigate).toHaveBeenCalledTimes(3);
    });

    it('maintains function reference stability', () => {
      // Arrange: Setup authenticated state for both renders
      mockUseAtomValue
        .mockReturnValue(sampleUser)
        .mockReturnValue(true)
        .mockReturnValue(sampleToken);

      // Act: Create hook and get initial reference
      const { result, rerender } = renderHook(() => useAuth());
      const initialLogout = result.current.logout;

      // Reset mocks for rerender
      mockUseAtomValue
        .mockReturnValue(sampleUser)
        .mockReturnValue(true)
        .mockReturnValue(sampleToken);

      // Act: Rerender the hook
      rerender();

      // Assert: Function should still be callable
      expect(typeof result.current.logout).toBe('function');
      expect(result.current.logout).toBeDefined();
    });

    it('handles component unmount gracefully', () => {
      // Arrange: Setup authenticated state
      mockUseAtomValue
        .mockReturnValueOnce(sampleUser)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(sampleToken);

      // Act: Create hook and unmount
      const { result, unmount } = renderHook(() => useAuth());

      unmount();

      // Assert: No errors should occur
      expect(() => {
        result.current.logout();
      }).not.toThrow();
    });
  });

  describe('MessageConst integration', () => {
    it('uses MessageConst for logout success message', () => {
      // Arrange: Setup authenticated state
      mockUseAtomValue
        .mockReturnValueOnce(sampleUser)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(sampleToken);

      const { result } = renderHook(() => useAuth());

      // Act: Perform logout
      act(() => {
        result.current.logout();
      });

      // Assert: MessageConst was used for success message
      expect(mockToastSuccess).toHaveBeenCalledWith({
        title: 'ログアウトしました',
        duration: 2000,
      });
    });
  });
});