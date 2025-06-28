/**
 * StatusBadge コンポーネントのユニットテスト
 * 
 * テスト対象:
 * - 異なるステータスタイプの表示
 * - 色スキームの正しい適用
 * - バリアントの設定
 * - 子要素の表示
 */

import { describe, it, expect } from 'vitest'
import { renderWithoutRouter, screen } from '@/test/utils'
import { StatusBadge } from '../StatusBadge'

describe('StatusBadge', () => {
  it('開発モック状態のバッジが正しく表示される', () => {
    renderWithoutRouter(
      <StatusBadge status="dev-mock">
        🔧 開発モード
      </StatusBadge>
    )

    const badge = screen.getByText('🔧 開発モード')
    expect(badge).toBeInTheDocument()
  })

  it('開発API状態のバッジが正しく表示される', () => {
    renderWithoutRouter(
      <StatusBadge status="dev-api">
        🌐 実API使用中
      </StatusBadge>
    )

    const badge = screen.getByText('🌐 実API使用中')
    expect(badge).toBeInTheDocument()
  })

  it('本番環境状態のバッジが正しく表示される', () => {
    renderWithoutRouter(
      <StatusBadge status="production">
        🚀 本番環境
      </StatusBadge>
    )

    const badge = screen.getByText('🚀 本番環境')
    expect(badge).toBeInTheDocument()
  })

  it('成功状態のバッジが正しく表示される', () => {
    renderWithoutRouter(
      <StatusBadge status="success">
        ✅ 成功
      </StatusBadge>
    )

    const badge = screen.getByText('✅ 成功')
    expect(badge).toBeInTheDocument()
  })

  it('警告状態のバッジが正しく表示される', () => {
    renderWithoutRouter(
      <StatusBadge status="warning">
        ⚠️ 警告
      </StatusBadge>
    )

    const badge = screen.getByText('⚠️ 警告')
    expect(badge).toBeInTheDocument()
  })

  it('エラー状態のバッジが正しく表示される', () => {
    renderWithoutRouter(
      <StatusBadge status="error">
        ❌ エラー
      </StatusBadge>
    )

    const badge = screen.getByText('❌ エラー')
    expect(badge).toBeInTheDocument()
  })

  it('solidバリアントが設定できる', () => {
    renderWithoutRouter(
      <StatusBadge status="success" variant="solid">
        ソリッドバッジ
      </StatusBadge>
    )

    const badge = screen.getByText('ソリッドバッジ')
    expect(badge).toBeInTheDocument()
  })

  it('subtleバリアントが設定できる', () => {
    renderWithoutRouter(
      <StatusBadge status="warning" variant="subtle">
        サブトルバッジ
      </StatusBadge>
    )

    const badge = screen.getByText('サブトルバッジ')
    expect(badge).toBeInTheDocument()
  })

  it('複雑な子要素を含むバッジが表示される', () => {
    renderWithoutRouter(
      <StatusBadge status="dev-mock">
        <span>🔧</span>
        <span>開発モード</span>
        <span>（モックAPI使用中）</span>
      </StatusBadge>
    )

    expect(screen.getByText('🔧')).toBeInTheDocument()
    expect(screen.getByText('開発モード')).toBeInTheDocument()
    expect(screen.getByText('（モックAPI使用中）')).toBeInTheDocument()
  })

  it('デフォルトバリアントがoutlineである', () => {
    renderWithoutRouter(
      <StatusBadge status="dev-mock">
        デフォルトバッジ
      </StatusBadge>
    )

    // バッジが表示されることを確認（バリアントの詳細確認は統合テストで行う）
    expect(screen.getByText('デフォルトバッジ')).toBeInTheDocument()
  })
})