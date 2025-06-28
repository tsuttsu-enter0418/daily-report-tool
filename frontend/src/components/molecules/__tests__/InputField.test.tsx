/**
 * InputField コンポーネントのユニットテスト
 * 
 * テスト対象:
 * - 基本的なレンダリング
 * - プロップスの正しい反映
 * - エラー状態の表示
 * - ユーザー入力の処理
 * - アクセシビリティ
 */

import { describe, it, expect, vi } from 'vitest'
import { renderWithoutRouter, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { InputField } from '../InputField'

describe('InputField', () => {
  it('ラベルとプレースホルダーが正しく表示される', () => {
    renderWithoutRouter(
      <InputField
        label="ユーザー名"
        placeholder="ユーザー名を入力してください"
      />
    )

    expect(screen.getByText('ユーザー名')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('ユーザー名を入力してください')).toBeInTheDocument()
  })

  it('エラーメッセージが表示される', () => {
    renderWithoutRouter(
      <InputField
        label="パスワード"
        error="パスワードは必須です"
        isInvalid={true}
      />
    )

    expect(screen.getByText('パスワードは必須です')).toBeInTheDocument()
  })

  it('エラーがない場合はエラーメッセージが表示されない', () => {
    renderWithoutRouter(
      <InputField
        label="メールアドレス"
        placeholder="email@example.com"
      />
    )

    expect(screen.queryByText(/エラー/)).not.toBeInTheDocument()
  })

  it('異なるinputタイプが正しく設定される', () => {
    const { rerender } = renderWithoutRouter(
      <InputField
        label="パスワード"
        type="password"
        data-testid="password-input"
      />
    )

    const passwordInput = screen.getByTestId('password-input')
    expect(passwordInput).toHaveAttribute('type', 'password')

    rerender(
      <InputField
        label="メール"
        type="email"
        data-testid="email-input"
      />
    )

    const emailInput = screen.getByTestId('email-input')
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  it('ユーザーの入力が正しく処理される', async () => {
    const user = userEvent.setup()
    const mockOnChange = vi.fn()

    renderWithoutRouter(
      <InputField
        label="テスト入力"
        onChange={mockOnChange}
        data-testid="test-input"
      />
    )

    const input = screen.getByTestId('test-input')
    
    await user.type(input, 'テストテキスト')

    expect(input).toHaveValue('テストテキスト')
  })

  it('無効状態のスタイルが適用される', () => {
    renderWithoutRouter(
      <InputField
        label="無効な入力"
        isInvalid={true}
        data-testid="invalid-input"
      />
    )

    const fieldRoot = screen.getByTestId('invalid-input').closest('[data-invalid]')
    expect(fieldRoot).toBeInTheDocument()
  })

  it('追加のpropsが正しく渡される', () => {
    renderWithoutRouter(
      <InputField
        label="カスタム入力"
        maxLength={10}
        disabled={true}
        data-testid="custom-input"
      />
    )

    const input = screen.getByTestId('custom-input')
    expect(input).toHaveAttribute('maxlength', '10')
    expect(input).toBeDisabled()
  })

  it('refが正しく転送される', () => {
    let inputRef: HTMLInputElement | null = null

    const TestComponent = () => (
      <InputField
        label="Ref テスト"
        ref={(el) => { inputRef = el }}
        data-testid="ref-input"
      />
    )

    renderWithoutRouter(<TestComponent />)

    expect(inputRef).toBeInstanceOf(HTMLInputElement)
    expect(inputRef).toBe(screen.getByTestId('ref-input'))
  })

  it('ラベルとinputが正しく関連付けられている', () => {
    renderWithoutRouter(
      <InputField
        label="アクセシビリティテスト"
        data-testid="accessibility-input"
      />
    )

    const input = screen.getByTestId('accessibility-input')
    const label = screen.getByText('アクセシビリティテスト')

    // ラベルクリックでinputにフォーカスが当たることを確認
    expect(input).toHaveAccessibleName('アクセシビリティテスト')
  })
})