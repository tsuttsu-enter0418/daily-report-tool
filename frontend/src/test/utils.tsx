/**
 * テストユーティリティ関数
 * 
 * 機能:
 * - コンポーネントテスト用のレンダリング関数
 * - Chakra UI Provider とルーターのセットアップ
 * - 共通のテストヘルパー関数
 */

import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from '@/components/ui/provider'
import { Toaster } from '@/components/ui/toaster'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * テスト用のプロバイダーラッパー
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <Provider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
          <Toaster />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  )
}

/**
 * カスタムレンダー関数
 * Chakra UI、React Router、React Queryを含む完全なプロバイダーでコンポーネントをレンダー
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

/**
 * ルーターなしのシンプルなレンダー関数
 * 単体コンポーネントのテスト用
 */
const renderWithoutRouter = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const SimpleWrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    return (
      <Provider>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster />
        </QueryClientProvider>
      </Provider>
    )
  }

  return render(ui, { wrapper: SimpleWrapper, ...options })
}

// re-export everything
export * from '@testing-library/react'
export { customRender as render, renderWithoutRouter }