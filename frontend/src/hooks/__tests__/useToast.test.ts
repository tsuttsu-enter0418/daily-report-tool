/* eslint-disable max-nested-callbacks */
/**
 * useToast カスタムフックのテストファイル
 *
 * 機能:
 * - Toast通知機能の単体テスト
 * - 成功・エラー・警告・情報の4つのステータス対応テスト
 * - API操作用便利メソッドのテスト
 * - モック使用による外部依存排除テスト
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToast } from "../useToast";

// ChakraUI依存を排除するためtoasterをモック化
vi.mock("@/components/ui/toaster");

describe("useToast", () => {
  let mockToasterCreate: ReturnType<typeof vi.fn>;

  // 各テスト前にモックをセットアップ
  beforeEach(async () => {
    vi.clearAllMocks();

    // モックモジュールをインポートしてcreate関数を設定
    const { toaster } = await import("@/components/ui/toaster");
    mockToasterCreate = vi.fn();
    toaster.create = mockToasterCreate;
  });

  describe("基本機能", () => {
    it("フックが正しい関数を返す", () => {
      const { result } = renderHook(() => useToast());

      expect(typeof result.current.showSuccess).toBe("function");
      expect(typeof result.current.showError).toBe("function");
      expect(typeof result.current.showWarning).toBe("function");
      expect(typeof result.current.showInfo).toBe("function");
      expect(typeof result.current.showToast).toBe("function");

      // API操作用メソッドの存在確認
      expect(typeof result.current.created).toBe("function");
      expect(typeof result.current.updated).toBe("function");
      expect(typeof result.current.deleted).toBe("function");
    });
  });

  describe("基本Toast表示", () => {
    it("成功メッセージを正しく表示する", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showSuccess("保存完了", "データが保存されました");
      });

      expect(mockToasterCreate).toHaveBeenCalledWith({
        title: "保存完了",
        description: "データが保存されました",
        type: "success",
        duration: 5000,
        closable: true,
      });
    });

    it("エラーメッセージを正しく表示する", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showError("エラー発生", "もう一度お試しください");
      });

      expect(mockToasterCreate).toHaveBeenCalledWith({
        title: "エラー発生",
        description: "もう一度お試しください",
        type: "error",
        duration: 7000, // エラーは長めに表示
        closable: true,
      });
    });

    it("警告メッセージを正しく表示する", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showWarning("注意", "設定を確認してください");
      });

      expect(mockToasterCreate).toHaveBeenCalledWith({
        title: "注意",
        description: "設定を確認してください",
        type: "warning",
        duration: 5000,
        closable: true,
      });
    });

    it("情報メッセージを正しく表示する", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showInfo("お知らせ", "新機能が追加されました");
      });

      expect(mockToasterCreate).toHaveBeenCalledWith({
        title: "お知らせ",
        description: "新機能が追加されました",
        type: "info",
        duration: 5000,
        closable: true,
      });
    });
  });

  describe("API操作用メソッド", () => {
    it("created - 作成成功メッセージを表示する", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.created("日報");
      });

      expect(mockToasterCreate).toHaveBeenCalledWith({
        title: "日報を作成しました",
        description: "正常に保存されました",
        type: "success",
        duration: 5000,
        closable: true,
      });
    });

    it("updated - 更新成功メッセージを表示する", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.updated("日報");
      });

      expect(mockToasterCreate).toHaveBeenCalledWith({
        title: "日報を更新しました",
        description: "変更内容が保存されました",
        type: "success",
        duration: 5000,
        closable: true,
      });
    });

    it("deleted - 削除成功メッセージを表示する", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.deleted("日報");
      });

      expect(mockToasterCreate).toHaveBeenCalledWith({
        title: "日報を削除しました",
        description: "正常に削除されました",
        type: "success",
        duration: 5000,
        closable: true,
      });
    });

    it("statusChanged - ステータス変更メッセージを表示する", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.statusChanged("submitted", "日報");
      });

      expect(mockToasterCreate).toHaveBeenCalledWith({
        title: "日報のステータスを変更しました",
        description: "「提出済み」に変更されました",
        type: "success",
        duration: 5000,
        closable: true,
      });
    });
  });

  describe("エラー系メソッド", () => {
    it("createError - 作成エラーメッセージを表示する", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.createError("日報", "サーバーエラー");
      });

      expect(mockToasterCreate).toHaveBeenCalledWith({
        title: "日報の作成に失敗しました",
        description: "サーバーエラー",
        type: "error",
        duration: 7000,
        closable: true,
      });
    });

    it("networkError - ネットワークエラーメッセージを表示する", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.networkError();
      });

      expect(mockToasterCreate).toHaveBeenCalledWith({
        title: "ネットワークエラーが発生しました",
        description: "インターネット接続を確認してください",
        type: "error",
        duration: 7000,
        closable: true,
      });
    });

    it("authError - 認証エラーメッセージを表示する", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.authError();
      });

      expect(mockToasterCreate).toHaveBeenCalledWith({
        title: "認証エラーが発生しました",
        description: "再度ログインしてください",
        type: "error",
        duration: 7000,
        closable: true,
      });
    });
  });

  describe("情報系メソッド", () => {
    it("unsavedChanges - 未保存警告メッセージを表示する", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.unsavedChanges();
      });

      expect(mockToasterCreate).toHaveBeenCalledWith({
        title: "未保存の変更があります",
        description: "変更内容が失われる可能性があります",
        type: "warning",
        duration: 5000,
        closable: true,
      });
    });

    it("autoSaved - 自動保存情報メッセージを表示する", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.autoSaved();
      });

      expect(mockToasterCreate).toHaveBeenCalledWith({
        title: "自動保存しました",
        description: "変更内容が保存されました",
        type: "info",
        duration: 5000,
        closable: true,
      });
    });
  });

  describe("エッジケース", () => {
    it("空文字のタイトルでもエラーにならない", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showSuccess("");
      });

      expect(mockToasterCreate).toHaveBeenCalledWith({
        title: "",
        description: undefined,
        type: "success",
        duration: 5000,
        closable: true,
      });
    });

    it("非常に長いメッセージでもエラーにならない", () => {
      const { result } = renderHook(() => useToast());
      const longTitle = "あ".repeat(1000);
      const longDescription = "い".repeat(2000);

      act(() => {
        result.current.showSuccess(longTitle, longDescription);
      });

      expect(mockToasterCreate).toHaveBeenCalledWith({
        title: longTitle,
        description: longDescription,
        type: "success",
        duration: 5000,
        closable: true,
      });
    });

    it("フックアンマウント後もエラーにならない", () => {
      const { result, unmount } = renderHook(() => useToast());

      unmount();

      // useCallbackによる安全なメモ化のテスト
      expect(() => {
        result.current.showSuccess("テスト");
      }).not.toThrow();
    });
  });

  describe("説明なしパターン", () => {
    it("descriptionがundefinedでも正常動作", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showSuccess("保存完了");
      });

      expect(mockToasterCreate).toHaveBeenCalledWith({
        title: "保存完了",
        description: undefined,
        type: "success",
        duration: 5000,
        closable: true,
      });
    });

    it("デフォルトパラメータで正常動作", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.created();
      });

      expect(mockToasterCreate).toHaveBeenCalledWith({
        title: "データを作成しました",
        description: "正常に保存されました",
        type: "success",
        duration: 5000,
        closable: true,
      });
    });
  });
});
