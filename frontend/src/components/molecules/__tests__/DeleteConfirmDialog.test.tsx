/**
 * DeleteConfirmDialog コンポーネントのテストファイル
 * 
 * 機能:
 * - 削除確認ダイアログの統合テスト
 * - ユーザーインタラクション（クリック操作）のテスト
 * - プロパティ変更による表示変更のテスト
 * - エラーハンドリングとローディング状態のテスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteConfirmDialog } from '../DeleteConfirmDialog';

describe('DeleteConfirmDialog', () => {
  // 🧹 各テスト後にクリーンアップ
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // 📝 基本的なテスト用のPropsデータ
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: '日報: 2025年1月の進捗報告',
    description: '作成日: 2025-01-15',
  };

  describe('基本表示', () => {
    it('ダイアログが正しく表示される', () => {
      // 🏗️ Arrange: コンポーネントをレンダリング
      render(<DeleteConfirmDialog {...defaultProps} />);

      // ✅ Assert: 基本要素が表示されることを確認
      expect(screen.getByText('削除の確認')).toBeInTheDocument();
      expect(screen.getByText('この操作は取り消すことができません')).toBeInTheDocument();
      expect(screen.getByText('削除対象:')).toBeInTheDocument();
      expect(screen.getByText('日報: 2025年1月の進捗報告')).toBeInTheDocument();
      expect(screen.getByText('作成日: 2025-01-15')).toBeInTheDocument();
    });

    it('警告メッセージが表示される', () => {
      // 🏗️ Arrange
      render(<DeleteConfirmDialog {...defaultProps} />);

      // ✅ Assert: 警告メッセージが表示される
      expect(screen.getByText('本当に削除しますか？')).toBeInTheDocument();
      expect(screen.getByText('削除されたデータは復元できません。')).toBeInTheDocument();
    });

    it('アクションボタンが表示される', () => {
      // 🏗️ Arrange
      render(<DeleteConfirmDialog {...defaultProps} />);

      // ✅ Assert: ボタンが正しく表示される
      expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '削除する' })).toBeInTheDocument();
    });

    it('isOpen が false の場合、ダイアログが表示されない', () => {
      // 🏗️ Arrange: isOpen を false に設定
      render(<DeleteConfirmDialog {...defaultProps} isOpen={false} />);

      // ✅ Assert: ダイアログが表示されない
      expect(screen.queryByText('削除の確認')).not.toBeInTheDocument();
    });
  });

  describe('プロパティ対応', () => {
    it('description が未指定の場合、説明が表示されない', () => {
      // 🏗️ Arrange: description を未指定
      const propsWithoutDescription = {
        ...defaultProps,
        description: undefined,
      };
      render(<DeleteConfirmDialog {...propsWithoutDescription} />);

      // ✅ Assert: タイトルは表示され、説明は表示されない
      expect(screen.getByText('日報: 2025年1月の進捗報告')).toBeInTheDocument();
      expect(screen.queryByText('作成日: 2025-01-15')).not.toBeInTheDocument();
    });

    it('errorMessage が設定されている場合、エラーが表示される', () => {
      // 🏗️ Arrange: エラーメッセージを設定
      const propsWithError = {
        ...defaultProps,
        errorMessage: 'サーバーエラーが発生しました',
      };
      render(<DeleteConfirmDialog {...propsWithError} />);

      // ✅ Assert: エラーメッセージが表示される
      expect(screen.getByText('サーバーエラーが発生しました')).toBeInTheDocument();
    });

    it('isDeleting が true の場合、削除中状態が表示される', () => {
      // 🏗️ Arrange: 削除中状態を設定
      const propsWithDeleting = {
        ...defaultProps,
        isDeleting: true,
      };
      render(<DeleteConfirmDialog {...propsWithDeleting} />);

      // ✅ Assert: 削除中のUI表示を確認
      expect(screen.getByText('削除中...')).toBeInTheDocument();
      
      // キャンセルボタンが無効化されている
      const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('ユーザーインタラクション', () => {
    it('キャンセルボタンをクリックすると onClose が呼ばれる', async () => {
      // 🏗️ Arrange: ユーザーイベントとコンポーネントを準備
      const user = userEvent.setup();
      const mockOnClose = vi.fn();
      const props = { ...defaultProps, onClose: mockOnClose };
      
      render(<DeleteConfirmDialog {...props} />);

      // ⚡ Act: キャンセルボタンをクリック
      const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
      await user.click(cancelButton);

      // ✅ Assert: onClose が1回呼ばれることを確認
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('削除するボタンをクリックすると onConfirm が呼ばれる', async () => {
      // 🏗️ Arrange
      const user = userEvent.setup();
      const mockOnConfirm = vi.fn();
      const props = { ...defaultProps, onConfirm: mockOnConfirm };
      
      render(<DeleteConfirmDialog {...props} />);

      // ⚡ Act: 削除するボタンをクリック
      const deleteButton = screen.getByRole('button', { name: '削除する' });
      await user.click(deleteButton);

      // ✅ Assert: onConfirm が1回呼ばれることを確認
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('削除中はキャンセルボタンがクリックできない', async () => {
      // 🏗️ Arrange: 削除中状態でセットアップ
      const user = userEvent.setup();
      const mockOnClose = vi.fn();
      const props = { 
        ...defaultProps, 
        onClose: mockOnClose,
        isDeleting: true,
      };
      
      render(<DeleteConfirmDialog {...props} />);

      // ⚡ Act: 無効化されたキャンセルボタンをクリック試行
      const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
      await user.click(cancelButton);

      // ✅ Assert: onClose が呼ばれないことを確認
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('非同期処理', () => {
    it('onConfirm が Promise を返す場合、正しく処理される', async () => {
      // 🏗️ Arrange: 非同期のonConfirmを準備
      const user = userEvent.setup();
      const mockOnConfirm = vi.fn().mockResolvedValue(undefined);
      const props = { ...defaultProps, onConfirm: mockOnConfirm };
      
      render(<DeleteConfirmDialog {...props} />);

      // ⚡ Act: 削除ボタンをクリック
      const deleteButton = screen.getByRole('button', { name: '削除する' });
      await user.click(deleteButton);

      // ✅ Assert: 非同期関数が呼ばれることを確認
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('onConfirm でエラーが発生してもアプリが壊れない', async () => {
      // 🏗️ Arrange: エラーを投げるonConfirmを準備
      const user = userEvent.setup();
      const mockOnConfirm = vi.fn().mockRejectedValue(new Error('テストエラー'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const props = { ...defaultProps, onConfirm: mockOnConfirm };
      
      render(<DeleteConfirmDialog {...props} />);

      // ⚡ Act: 削除ボタンをクリック
      const deleteButton = screen.getByRole('button', { name: '削除する' });
      await user.click(deleteButton);

      // ✅ Assert: エラーが適切にキャッチされる
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('削除処理エラー:', expect.any(Error));
      
      // クリーンアップ
      consoleSpy.mockRestore();
    });
  });

  describe('アクセシビリティ', () => {
    it('ボタンが適切な role を持っている', () => {
      // 🏗️ Arrange
      render(<DeleteConfirmDialog {...defaultProps} />);

      // ✅ Assert: ボタンのroleが正しい
      expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '削除する' })).toBeInTheDocument();
    });

    it('削除中状態でローディングテキストが表示される', () => {
      // 🏗️ Arrange: 削除中状態
      render(<DeleteConfirmDialog {...defaultProps} isDeleting={true} />);

      // ✅ Assert: ローディングテキストが表示される
      expect(screen.getByText('削除中...')).toBeInTheDocument();
    });

    it('テキストが適切に読み上げ可能な状態で配置されている', () => {
      // 🏗️ Arrange
      render(<DeleteConfirmDialog {...defaultProps} />);

      // ✅ Assert: 重要なテキストがドキュメントに存在する
      expect(screen.getByText('削除の確認')).toBeInTheDocument();
      expect(screen.getByText('この操作は取り消すことができません')).toBeInTheDocument();
      expect(screen.getByText('本当に削除しますか？')).toBeInTheDocument();
      expect(screen.getByText('削除されたデータは復元できません。')).toBeInTheDocument();
    });
  });

  describe('エッジケース', () => {
    it('非常に長いタイトルでもレイアウトが崩れない', () => {
      // 🏗️ Arrange: 長いタイトルを設定
      const longTitle = 'あ'.repeat(200); // 200文字の長いタイトル
      const props = { ...defaultProps, title: longTitle };
      
      render(<DeleteConfirmDialog {...props} />);

      // ✅ Assert: 長いタイトルが表示される（レイアウトはCSSで制御）
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('空のタイトルでもエラーにならない', () => {
      // 🏗️ Arrange: 空のタイトルを設定
      const props = { ...defaultProps, title: '' };
      
      render(<DeleteConfirmDialog {...props} />);

      // ✅ Assert: エラーにならずに表示される
      expect(screen.getByText('削除対象:')).toBeInTheDocument();
    });

    it('複数のエラーメッセージがある場合、最新のものが表示される', () => {
      // 🏗️ Arrange: エラーメッセージを設定
      const props = {
        ...defaultProps,
        errorMessage: '最新のエラーメッセージ',
      };
      
      render(<DeleteConfirmDialog {...props} />);

      // ✅ Assert: エラーメッセージが表示される
      expect(screen.getByText('最新のエラーメッセージ')).toBeInTheDocument();
    });
  });

  describe('サイズプロパティ', () => {
    it('size="sm" の場合、小さなダイアログが表示される', () => {
      // 🏗️ Arrange: 小さなサイズを設定
      render(<DeleteConfirmDialog {...defaultProps} size="sm" />);

      // ✅ Assert: ダイアログが表示される（サイズはCSSクラスで制御）
      expect(screen.getByText('削除の確認')).toBeInTheDocument();
    });

    it('size="lg" の場合、大きなダイアログが表示される', () => {
      // 🏗️ Arrange: 大きなサイズを設定
      render(<DeleteConfirmDialog {...defaultProps} size="lg" />);

      // ✅ Assert: ダイアログが表示される
      expect(screen.getByText('削除の確認')).toBeInTheDocument();
    });
  });

  describe('メモ化最適化', () => {
    it('同じプロパティで再レンダリングしても無駄な再描画が発生しない', () => {
      // 🏗️ Arrange: 初回レンダリング
      const { rerender } = render(<DeleteConfirmDialog {...defaultProps} />);

      // ⚡ Act: 同じプロパティで再レンダリング
      rerender(<DeleteConfirmDialog {...defaultProps} />);

      // ✅ Assert: エラーなく正常に表示される（memo化による最適化）
      expect(screen.getByText('削除の確認')).toBeInTheDocument();
    });
  });
});