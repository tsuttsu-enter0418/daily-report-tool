/**
 * テスト環境のセットアップファイル
 *
 * 機能:
 * - Jest DOM マッチャーの設定
 * - グローバルなテスト設定
 * - モックの初期設定
 */

import "@testing-library/jest-dom";
import { beforeAll, afterAll, vi } from "vitest";

// matchMediaのモック設定（ChakraUI対応）
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ResizeObserverのモック設定（ChakraUI対応）
Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
});

// 環境変数のモック設定
Object.defineProperty(import.meta, "env", {
  value: {
    DEV: true,
    VITE_USE_REAL_API: "false",
  },
  writable: true,
});

// Console error/warn の抑制（テスト実行時の不要なログを削減）
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (typeof args[0] === "string" && args[0].includes("Warning: ReactDOM.render is deprecated")) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    if (typeof args[0] === "string" && args[0].includes("componentWillReceiveProps")) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
