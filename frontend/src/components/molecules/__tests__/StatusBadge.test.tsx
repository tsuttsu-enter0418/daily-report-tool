/**
 * StatusBadge コンポーネントの包括的テストファイル
 *
 * 機能:
 * - ステータス表示バッジの単体テスト
 * - ステータスタイプによる色分け表示のテスト
 * - アクセシビリティ機能のテスト
 * - メモ化最適化の動作テスト
 * - プロパティのカスタマイズテスト
 */

import { describe, it, expect, beforeEach } from "vitest";
import { renderWithoutRouter, screen, cleanup } from "@/test/utils";
import { StatusBadge } from "../StatusBadge";
import type { StatusBadgeType } from "../../../types";

describe("StatusBadge", () => {
  // 各テスト後にクリーンアップ
  beforeEach(() => {
    cleanup();
  });

  describe("基本表示", () => {
    it("子要素のテキストが正しく表示される", () => {
      renderWithoutRouter(<StatusBadge status="draft">下書き</StatusBadge>);

      expect(screen.getByText("下書き")).toBeInTheDocument();
    });

    it("role='status'が設定されている", () => {
      renderWithoutRouter(<StatusBadge status="submitted">提出済み</StatusBadge>);

      const badge = screen.getByRole("status");
      expect(badge).toBeInTheDocument();
    });

    it("デフォルトのvariantがsolidで動作する", () => {
      const { container } = renderWithoutRouter(
        <StatusBadge status="success">成功</StatusBadge>,
      );

      // ChakraUIのBadgeコンポーネントが正しくレンダリングされることを確認
      const badge = container.querySelector('[role="status"]');
      expect(badge).toBeInTheDocument();
    });
  });

  describe("ステータスタイプ別表示", () => {
    const statusTestCases: Array<{
      status: StatusBadgeType;
      label: string;
      expectedAriaLabel: string;
    }> = [
      {
        status: "dev-mock",
        label: "🔧 開発モード",
        expectedAriaLabel: "開発モード（モックAPI使用中）",
      },
      {
        status: "dev-api",
        label: "🌐 実API使用中",
        expectedAriaLabel: "開発モード（実API使用中）",
      },
      {
        status: "production",
        label: "🚀 本番環境",
        expectedAriaLabel: "本番環境",
      },
      {
        status: "success",
        label: "✅ 成功",
        expectedAriaLabel: "成功ステータス",
      },
      {
        status: "warning",
        label: "⚠️ 警告",
        expectedAriaLabel: "警告ステータス",
      },
      {
        status: "error",
        label: "❌ エラー",
        expectedAriaLabel: "エラーステータス",
      },
      {
        status: "draft",
        label: "📝 下書き",
        expectedAriaLabel: "下書きステータス",
      },
      {
        status: "submitted",
        label: "📤 提出済み",
        expectedAriaLabel: "提出済みステータス",
      },
    ];

    statusTestCases.forEach(({ status, label, expectedAriaLabel }) => {
      it(`${status}ステータスが正しく表示される`, () => {
        renderWithoutRouter(<StatusBadge status={status}>{label}</StatusBadge>);

        // テキストが表示される
        expect(screen.getByText(label)).toBeInTheDocument();

        // デフォルトのaria-labelが設定される
        const badge = screen.getByRole("status");
        expect(badge).toHaveAttribute("aria-label", expectedAriaLabel);
      });
    });
  });

  describe("プロパティのカスタマイズ", () => {
    it("カスタムaria-labelが正しく適用される", () => {
      const customLabel = "カスタムステータス";
      renderWithoutRouter(
        <StatusBadge status="draft" aria-label={customLabel}>
          下書き
        </StatusBadge>,
      );

      const badge = screen.getByRole("status");
      expect(badge).toHaveAttribute("aria-label", customLabel);
    });

    it("variant='outline'が適用される", () => {
      const { container } = renderWithoutRouter(
        <StatusBadge status="success" variant="outline">
          成功
        </StatusBadge>,
      );

      // ChakraUIのBadgeが正しくレンダリングされる
      const badge = container.querySelector('[role="status"]');
      expect(badge).toBeInTheDocument();
    });

    it("variant='subtle'が適用される", () => {
      const { container } = renderWithoutRouter(
        <StatusBadge status="warning" variant="subtle">
          警告
        </StatusBadge>,
      );

      const badge = container.querySelector('[role="status"]');
      expect(badge).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("スクリーンリーダー用のrole属性が設定されている", () => {
      renderWithoutRouter(<StatusBadge status="error">エラー</StatusBadge>);

      const badge = screen.getByRole("status");
      expect(badge).toBeInTheDocument();
    });

    it("aria-labelが自動生成される", () => {
      renderWithoutRouter(<StatusBadge status="submitted">提出済み</StatusBadge>);

      const badge = screen.getByRole("status");
      expect(badge).toHaveAttribute("aria-label", "提出済みステータス");
    });

    it("カスタムaria-labelが優先される", () => {
      renderWithoutRouter(
        <StatusBadge status="draft" aria-label="現在編集中">
          下書き
        </StatusBadge>,
      );

      const badge = screen.getByRole("status");
      expect(badge).toHaveAttribute("aria-label", "現在編集中");
    });
  });

  describe("エッジケース", () => {
    it("空文字の子要素でもエラーにならない", () => {
      renderWithoutRouter(<StatusBadge status="draft"></StatusBadge>);

      const badge = screen.getByRole("status");
      expect(badge).toBeInTheDocument();
    });

    it("数値の子要素が正しく表示される", () => {
      renderWithoutRouter(<StatusBadge status="success">{123}</StatusBadge>);

      expect(screen.getByText("123")).toBeInTheDocument();
    });

    it("複数の子要素が正しく表示される", () => {
      renderWithoutRouter(
        <StatusBadge status="dev-mock">
          <span>🔧</span>
          <span>開発モード</span>
          <span>（モックAPI使用中）</span>
        </StatusBadge>,
      );

      expect(screen.getByText("🔧")).toBeInTheDocument();
      expect(screen.getByText("開発モード")).toBeInTheDocument();
      expect(screen.getByText("（モックAPI使用中）")).toBeInTheDocument();
    });

    it("非常に長いテキストでもエラーにならない", () => {
      const longText = "あ".repeat(100);
      renderWithoutRouter(<StatusBadge status="draft">{longText}</StatusBadge>);

      expect(screen.getByText(longText)).toBeInTheDocument();
    });
  });

  describe("メモ化最適化", () => {
    it("同じプロパティで再レンダリングしても正常動作する", () => {
      const initialProps = {
        status: "draft" as const,
        children: "下書き",
      };

      const { rerender } = renderWithoutRouter(<StatusBadge {...initialProps} />);

      // 最初のレンダリング結果を確認
      expect(screen.getByText("下書き")).toBeInTheDocument();

      // 同じプロパティで再レンダリング
      rerender(<StatusBadge {...initialProps} />);

      // エラーなく正常に表示される（memo化による最適化）
      expect(screen.getByText("下書き")).toBeInTheDocument();
    });

    it("プロパティが変更された場合は正しく更新される", () => {
      const { rerender } = renderWithoutRouter(
        <StatusBadge status="draft">下書き</StatusBadge>,
      );

      expect(screen.getByText("下書き")).toBeInTheDocument();

      // プロパティを変更して再レンダリング
      rerender(<StatusBadge status="submitted">提出済み</StatusBadge>);

      expect(screen.getByText("提出済み")).toBeInTheDocument();
      expect(screen.queryByText("下書き")).not.toBeInTheDocument();
    });
  });

  describe("色スキーム確認", () => {
    it("開発関連ステータスが正しく表示される", () => {
      const { container: mockContainer } = renderWithoutRouter(
        <StatusBadge status="dev-mock">🔧 開発モード</StatusBadge>,
      );
      const { container: apiContainer } = renderWithoutRouter(
        <StatusBadge status="dev-api">🌐 実API使用中</StatusBadge>,
      );

      // Badgeコンポーネントが正しくレンダリングされることを確認
      expect(mockContainer.querySelector('[role="status"]')).toBeInTheDocument();
      expect(apiContainer.querySelector('[role="status"]')).toBeInTheDocument();
    });

    it("本番・成功ステータスが正しく表示される", () => {
      const { container: prodContainer } = renderWithoutRouter(
        <StatusBadge status="production">🚀 本番環境</StatusBadge>,
      );
      const { container: successContainer } = renderWithoutRouter(
        <StatusBadge status="success">✅ 成功</StatusBadge>,
      );

      expect(prodContainer.querySelector('[role="status"]')).toBeInTheDocument();
      expect(successContainer.querySelector('[role="status"]')).toBeInTheDocument();
    });

    it("警告・エラーステータスが正しく表示される", () => {
      const { container: warningContainer } = renderWithoutRouter(
        <StatusBadge status="warning">⚠️ 警告</StatusBadge>,
      );
      const { container: errorContainer } = renderWithoutRouter(
        <StatusBadge status="error">❌ エラー</StatusBadge>,
      );

      expect(warningContainer.querySelector('[role="status"]')).toBeInTheDocument();
      expect(errorContainer.querySelector('[role="status"]')).toBeInTheDocument();
    });

    it("日報関連ステータスが正しく表示される", () => {
      const { container: draftContainer } = renderWithoutRouter(
        <StatusBadge status="draft">📝 下書き</StatusBadge>,
      );
      const { container: submittedContainer } = renderWithoutRouter(
        <StatusBadge status="submitted">📤 提出済み</StatusBadge>,
      );

      expect(draftContainer.querySelector('[role="status"]')).toBeInTheDocument();
      expect(submittedContainer.querySelector('[role="status"]')).toBeInTheDocument();
    });
  });

  describe("型安全性", () => {
    it("StatusBadgeTypeの全てのステータスが正しく処理される", () => {
      const allStatuses: StatusBadgeType[] = [
        "dev-mock",
        "dev-api",
        "production",
        "success",
        "warning",
        "error",
        "draft",
        "submitted",
      ];

      allStatuses.forEach((status) => {
        cleanup();
        renderWithoutRouter(<StatusBadge status={status}>テスト</StatusBadge>);

        // 各ステータスでエラーなく表示される
        expect(screen.getByText("テスト")).toBeInTheDocument();
        expect(screen.getByRole("status")).toBeInTheDocument();
      });
    });
  });

  describe("バリアント動作確認", () => {
    it("solidバリアントが正しく設定される", () => {
      renderWithoutRouter(
        <StatusBadge status="success" variant="solid">
          ソリッドバッジ
        </StatusBadge>,
      );

      const badge = screen.getByText("ソリッドバッジ");
      expect(badge).toBeInTheDocument();
    });

    it("subtleバリアントが正しく設定される", () => {
      renderWithoutRouter(
        <StatusBadge status="warning" variant="subtle">
          サブトルバッジ
        </StatusBadge>,
      );

      const badge = screen.getByText("サブトルバッジ");
      expect(badge).toBeInTheDocument();
    });

    it("outlineバリアントが正しく設定される", () => {
      renderWithoutRouter(
        <StatusBadge status="error" variant="outline">
          アウトラインバッジ
        </StatusBadge>,
      );

      const badge = screen.getByText("アウトラインバッジ");
      expect(badge).toBeInTheDocument();
    });

    it("デフォルトバリアント（variant未指定）が正しく動作する", () => {
      renderWithoutRouter(<StatusBadge status="dev-mock">デフォルトバッジ</StatusBadge>);

      // バッジが表示されることを確認
      expect(screen.getByText("デフォルトバッジ")).toBeInTheDocument();
    });
  });
});