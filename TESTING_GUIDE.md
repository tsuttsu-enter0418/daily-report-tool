# 📋 React テストコード完全学習ガイド

React + TypeScript プロジェクトでのテストコード作成方法を**初心者向け**に詳しく解説します。
実際のコード例とともに、テストの考え方から実装まで段階的に学べます。

## 🤔 なぜテストが必要なの？

テストとは「コードが正しく動作するかを自動的に確認する仕組み」です。

### テストのメリット
- **バグの早期発見**: 修正コストが安い段階で問題を見つけられる
- **安心してリファクタリング**: コードを改善しても既存機能が壊れないと確信できる
- **ドキュメントの役割**: テストコードを見れば、どういう動作を期待しているかが分かる
- **品質向上**: 品質の高いコードが書けるようになる

## 🏗 テストの種類と役割

### 1. 単体テスト (Unit Test)
**1つの機能だけを個別にテストする**

```
例: ログインボタンをクリックしたら、正しい処理が呼ばれるか？
```

- **対象**: コンポーネント、関数、クラスなど
- **メリット**: 問題箇所を特定しやすい
- **実行速度**: 高速
- **使用ツール**: Vitest, Jest

### 2. 統合テスト (Integration Test)
**複数の機能が連携して正しく動作するかテストする**

```
例: ログインフォームに入力→送信→認証→画面遷移が正しく動作するか？
```

- **対象**: 複数コンポーネントの連携
- **メリット**: 実際の使用に近い状態でテストできる
- **実行速度**: 中程度
- **使用ツール**: React Testing Library

### 3. E2Eテスト (End-to-End Test)
**ユーザーが実際に操作する流れを再現してテストする**

```
例: ブラウザを自動操作して、ログイン→日報作成→保存まで一連の流れをテスト
```

- **対象**: アプリケーション全体
- **メリット**: 最も本番環境に近い状態でテストできる
- **実行速度**: 低速
- **使用ツール**: Playwright, Cypress

## 🛠 このプロジェクトで使用しているテストツール

### Vitest
- **役割**: JavaScript/TypeScriptのテスト実行エンジン
- **特徴**: Viteと連携して高速動作
- **用途**: 単体テスト、関数テスト

### React Testing Library (RTL)
- **役割**: Reactコンポーネントのテスト
- **特徴**: ユーザーの視点でテストを書ける
- **用途**: コンポーネントの表示・操作テスト

### JUnit (バックエンド)
- **役割**: Javaのテストフレームワーク
- **特徴**: Spring Bootと連携
- **用途**: APIの動作テスト

## 📁 テストファイルの場所と命名規則

```
src/
├── components/
│   ├── atoms/
│   │   ├── Button.tsx          # 実装ファイル
│   │   └── __tests__/
│   │       └── Button.test.tsx # テストファイル
│   └── molecules/
├── hooks/
│   ├── useLogin.ts
│   └── __tests__/
│       └── useLogin.test.ts
└── services/
    ├── apiService.ts
    └── __tests__/
        └── apiService.test.ts
```

### 命名規則
- テストファイル: `○○.test.tsx` または `○○.spec.tsx`
- テストフォルダ: `__tests__/`

## 🎯 実装されているテストの例

### 1. ログインページのテスト
**ファイル**: `src/pages/__tests__/Login.test.tsx`

```typescript
// ログインフォームが正しく表示されるかテスト
test('ログインフォームが表示される', () => {
  render(<Login />);
  expect(screen.getByLabelText('ユーザー名')).toBeInTheDocument();
  expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
});

// ログインボタンをクリックしたときの動作をテスト
test('ログインボタンクリックで認証処理が実行される', async () => {
  // ... テストコード
});
```

### 2. APIサービスのテスト
**ファイル**: `src/services/__tests__/apiService.test.ts`

```typescript
// ログインAPIが正常に動作するかテスト
test('正常なログイン情報で認証が成功する', async () => {
  const result = await apiService.login({
    username: 'admin',
    password: 'password'
  });
  expect(result.token).toBeTruthy();
});
```

### 3. カスタムフックのテスト
**ファイル**: `src/hooks/__tests__/useLogin.test.ts`

```typescript
// useLoginフックが正しく動作するかテスト
test('ログイン成功時にトークンが保存される', async () => {
  const { result } = renderHook(() => useLogin());
  await act(async () => {
    await result.current.login({ username: 'admin', password: 'password' });
  });
  expect(Cookies.get('authToken')).toBeTruthy();
});
```

## ⚡ テストの実行方法

### フロントエンドテストの実行

```bash
# プロジェクトルートで
cd frontend

# 全テスト実行
npm run test

# 特定のファイルのみテスト
npm run test Login.test.tsx

# テスト結果を継続監視（ファイル変更時に自動実行）
npm run test:watch

# カバレッジ（テスト網羅率）を確認
npm run test:coverage
```

### バックエンドテストの実行

```bash
# プロジェクトルートで
cd backend

# 全テスト実行
./mvnw test

# 特定のテストクラスのみ実行
./mvnw test -Dtest=AuthControllerTest
```

## 📊 テスト結果の見方

### 成功例
```
✓ ログインフォームが表示される (25ms)
✓ ログインボタンクリックで認証処理が実行される (150ms)
✓ エラー時にToastが表示される (89ms)

Test Files  1 passed (1)
     Tests  3 passed (3)
```

### 失敗例
```
✗ ログインボタンクリックで認証処理が実行される (150ms)
  Expected: "success"
  Received: "error"
  
  at Login.test.tsx:45:23
```

## 📝 初心者向け：テストの書き方完全ガイド

### Step 1: テスト対象を分析する

テストを書く前に、以下を明確にします：

```typescript
// 例: useToast フック
const useToast = () => {
  return {
    showSuccess: (title: string, description?: string) => void,
    showError: (title: string, description?: string) => void,
    showWarning: (title: string, description?: string) => void,
  };
};
```

**分析項目：**
- 🔍 **入力（引数）**: 何を受け取るか？
- 🎯 **出力（戻り値）**: 何を返すか？
- ⚡ **副作用**: Toast表示、API呼び出し等の見えない処理
- 🚫 **エッジケース**: エラー、空文字、null等の特殊ケース

### Step 2: テストケースを洗い出す

```typescript
// useToast のテストケース例
describe('useToast', () => {
  describe('showSuccess', () => {
    // ✅ 正常系（基本動作）
    it('タイトルのみでToastを表示する');
    it('タイトル + 説明でToastを表示する');
    
    // ⚠️ エッジケース（境界値・特殊値）
    it('空文字のタイトルでもエラーにならない');
    it('非常に長いメッセージを適切に処理する');
    
    // 🚫 異常系（エラーハンドリング）
    it('undefined を渡してもエラーにならない');
  });
});
```

### Step 3: describe と it の正しい使い分け

```typescript
describe('useToast', () => {              // 📦 テスト対象の名前
  describe('基本機能', () => {            // 📂 機能・カテゴリでグループ化
    it('フックが正しい関数を返す', () => {
      // 🔬 具体的なテストケース
    });
  });
  
  describe('showSuccess', () => {          // 📂 メソッドごとにグループ化
    it('成功メッセージを正しく表示する', () => {
      // 🔬 具体的なテストケース
    });
  });
});
```

### Step 4: モックを設定する

外部依存関係をモック化して、テスト対象のみを検証します：

```typescript
// 🎭 Toaster のモック（ChakraUI依存を排除）
const mockToasterCreate = vi.fn();
vi.mock('@/components/ui/toaster', () => ({
  toaster: {
    create: mockToasterCreate,
  },
}));

// 🔄 テスト前にモックをリセット
beforeEach(() => {
  vi.clearAllMocks();
});
```

### Step 5: AAA パターンでテストを実装

```typescript
it('成功メッセージを正しく表示する', () => {
  // 🏗️ Arrange: テストデータとフックを準備
  const { result } = renderHook(() => useToast());
  const title = '保存完了';
  const description = 'データが保存されました';
  
  // ⚡ Act: 実際の処理を実行
  act(() => {
    result.current.showSuccess(title, description);
  });
  
  // ✅ Assert: 期待する結果を検証
  expect(mockToasterCreate).toHaveBeenCalledWith({
    title: '保存完了',
    description: 'データが保存されました',
    type: 'success',
    duration: 5000,
    closable: true,
  });
  
  // 📊 呼び出し回数も確認
  expect(mockToasterCreate).toHaveBeenCalledTimes(1);
});
```

## 🎨 コンポーネントテストの考え方

### ❌ 実装詳細をテストしない

```typescript
// ダメな例：内部state を直接テスト
expect(component.state.isLoading).toBe(true);
expect(component.find('.loading-spinner')).toHaveLength(1);
```

### ✅ ユーザー視点でテストする

```typescript
// 良い例：ユーザーが見る結果をテスト
expect(screen.getByText('読み込み中...')).toBeInTheDocument();
expect(screen.getByRole('progressbar')).toBeInTheDocument();
```

### 🎯 アクセシビリティを重視したセレクター

**優先順位の高い順：**

1. **Role**: `getByRole('button', { name: '保存' })`
2. **Label**: `getByLabelText('パスワード')`
3. **Text**: `getByText('ログイン')`
4. **TestId**: `getByTestId('submit-button')` （最後の手段）

```typescript
// 良い例：role を使用
await user.click(screen.getByRole('button', { name: '保存' }));

// 悪い例：class名を使用
await user.click(screen.getByClassName('btn-save'));
```

## 🔧 カスタムフックテストの特徴

### renderHook を使用

```typescript
import { renderHook, act } from '@testing-library/react';

it('useToast フックが正しい関数を返す', () => {
  const { result } = renderHook(() => useToast());
  
  // 🔍 戻り値の型チェック
  expect(typeof result.current.showSuccess).toBe('function');
  expect(typeof result.current.showError).toBe('function');
  expect(typeof result.current.showWarning).toBe('function');
});
```

### act() で状態変更をラップ

```typescript
// 🎭 状態変更を伴う処理は act() でラップ
act(() => {
  result.current.showSuccess('メッセージ');
});

// 🔄 非同期処理の場合
await act(async () => {
  await result.current.submitForm(data);
});
```

## 🧩 統合テストのアプローチ

### コンポーネント間の連携をテスト

```typescript
it('日報作成フォームが正しく動作する', async () => {
  const user = userEvent.setup();
  
  // 🖼️ コンポーネントをレンダリング
  render(<DailyReportForm />);
  
  // ⌨️ ユーザー操作をシミュレート
  await user.type(screen.getByLabelText('タイトル'), '今日の作業');
  await user.type(screen.getByLabelText('内容'), 'React開発を行いました');
  
  // 🖱️ ボタンクリック
  await user.click(screen.getByRole('button', { name: '保存' }));
  
  // ✅ 結果を確認（非同期処理のため findBy を使用）
  expect(await screen.findByText('日報が保存されました')).toBeInTheDocument();
});
```

## 🔧 テストを書くときのコツ

### 1. 「何をテストするか」を明確にする
- ❌ 悪い例: `test('ログイン', () => { ... })`
- ✅ 良い例: `test('正しいユーザー名とパスワードでログインが成功する', () => { ... })`

### 2. AAA パターンを使う
```typescript
test('ログインが成功する', () => {
  // Arrange: テストの準備
  const mockUser = { username: 'admin', password: 'password' };
  
  // Act: 実際の動作
  const result = login(mockUser);
  
  // Assert: 結果の確認
  expect(result.success).toBe(true);
});
```

### 3. エッジケースもテストする
- 正常系だけでなく、エラーケースもテストする
- 空文字、null、undefined などの境界値もテストする

## 🎨 モック（Mock）とは？

**モック**: 本物の代わりに使う「偽物」のこと

### なぜモックを使うの？
- **外部依存を排除**: APIサーバーが起動していなくてもテストできる
- **テスト速度向上**: 実際の通信を行わないので高速
- **テスト結果の安定化**: 外部要因でテストが失敗することがない

### モックの例
```typescript
// 本物のAPIの代わりに偽物のAPIを使用
vi.mock('../services/apiService', () => ({
  apiService: {
    login: vi.fn().mockResolvedValue({
      token: 'fake-token',
      username: 'admin'
    })
  }
}));
```

## 📈 テストカバレッジとは？

**カバレッジ**: コードのどれくらいの部分がテストされているかの割合

```
File                | % Stmts | % Branch | % Funcs | % Lines
--------------------|---------|----------|---------|--------
Login.tsx           |   85.7  |   75.0   |  100.0  |  85.7
useLogin.ts         |   90.9  |   83.3   |  100.0  |  90.9
apiService.ts       |   92.3  |   88.9   |  100.0  |  92.3
```

- **% Stmts**: 実行された文の割合
- **% Branch**: 条件分岐の網羅率
- **% Funcs**: テストされた関数の割合
- **% Lines**: 実行された行の割合

### カバレッジの目安
- **80%以上**: 良好
- **90%以上**: 優秀
- **100%**: 完璧（ただし必ずしも必要ではない）

## 🚀 テスト駆動開発（TDD）とは？

**TDD**: テストを先に書いてから実装する開発手法

### TDDの流れ
1. **Red**: 失敗するテストを書く
2. **Green**: テストが通る最小限の実装をする
3. **Refactor**: コードを改善する

### メリット
- 仕様が明確になる
- 余計な機能を作らなくなる
- リファクタリングが安全になる

## 📋 テスト作成チェックリスト

### ✅ 単体テスト

- [ ] **正常系**のテストケース（基本動作）
- [ ] **異常系**（エラー）のテストケース
- [ ] **エッジケース**（境界値・特殊値）のテストケース
- [ ] **モック**が適切に設定されている
- [ ] **テスト名**が何をテストしているか明確
- [ ] **AAA パターン**で構造化されている

### ✅ コンポーネントテスト

- [ ] **初期表示**が正しい
- [ ] **プロパティ**が正しく反映される
- [ ] **ユーザーインタラクション**が動作する
- [ ] **条件分岐**がすべてテストされている
- [ ] **アクセシビリティ**を考慮したセレクター使用
- [ ] **ローディング状態**の表示確認

### ✅ 統合テスト

- [ ] **ユーザーの操作フロー**をテスト
- [ ] **コンポーネント間の連携**をテスト
- [ ] **状態管理**との連携をテスト
- [ ] **API通信**との連携をテスト（モック使用）

## 🚀 実践的なテスト戦略

### 1. 重要度順にテストを書く

```
🔥 高優先度（必須）
├── カスタムフック（useToast, useDailyReports）
├── 重要なコンポーネント（削除確認ダイアログ）
└── 複雑なページ（日報詳細画面）

⚡ 中優先度（推奨）
├── 基本コンポーネント（StatusBadge, SearchForm）
└── ユーティリティ関数

💡 低優先度（余裕があれば）
└── 静的なコンポーネント（レイアウト等）
```

### 2. テストファースト vs テストラスト

**テストファースト（TDD）:**
- テスト → 実装 → リファクタリング
- 設計が明確になる
- 上級者向け

**テストラスト（初心者推奨）:**
- 実装 → テスト → リファクタリング
- 動作するものから始められる
- 理解しやすい

### 3. カバレッジの目標

```bash
# カバレッジ確認
npm run test:coverage
```

**推奨カバレッジ:**
- **80%以上**: 十分な品質
- **100%**: 理想的だが時間とのバランスを考慮
- **重要な部分は100%**: カスタムフック、ビジネスロジック

## 🎯 このプロジェクトでのテスト戦略

### 現在のテスト状況
- ✅ ログイン機能の単体・統合テスト
- ✅ APIサービスのモックテスト
- ✅ カスタムフックのテスト（useLogin, useAuth）
- ✅ UIコンポーネントのテスト（StatusBadge, InputField）

### 📈 次期追加予定（優先順）
1. **useToast.test.ts** - 新作カスタムフック・Toast通知機能
2. **DeleteConfirmDialog.test.tsx** - 重要な操作確認コンポーネント
3. **useDailyReports.test.ts** - 主要ビジネスロジック・API連携
4. **DailyReportDetail.test.tsx** - 複雑なページコンポーネント
5. **E2Eテスト（Playwright）** - エンドツーエンドテスト

## 🔍 トラブルシューティング

### よくある問題と解決方法

#### 1. テストが途中で止まる
```bash
# タイムアウト設定を長くする
npm run test -- --testTimeout=10000
```

#### 2. モックが効かない
```typescript
// vi.mockの位置を確認（importより前に書く）
vi.mock('./apiService');
import { apiService } from './apiService';
```

#### 3. DOM要素が見つからない
```typescript
// screen.debugを使って実際のDOMを確認
screen.debug();
```

## 📚 参考リンク

- [Vitest公式ドキュメント](https://vitest.dev/)
- [React Testing Library公式](https://testing-library.com/docs/react-testing-library/intro/)
- [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/)

---

## 🎓 学習リソース

### 📚 公式ドキュメント

- [Vitest](https://vitest.dev/) - 高速テストランナー
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) - Reactコンポーネントテスト
- [Jest DOM](https://github.com/testing-library/jest-dom) - DOM要素のアサーション

### 💡 実践のコツ

1. **小さく始める**: 簡単なコンポーネントからスタート
2. **継続する**: 毎日少しずつテストを追加
3. **リファクタリング**: テストがあるから安心してコード改善
4. **チーム共有**: テストの書き方をチームで統一
5. **失敗を恐れない**: 最初は完璧でなくても OK

### 🌟 初心者が陥りがちな罠と対策

#### ❌ 避けるべきこと
- 実装詳細（内部state、private method）をテスト
- テスト名が何をテストしているか不明確
- モックを使いすぎて何をテストしているか分からない
- E2Eテストばかり書いて実行時間が長くなる

#### ✅ 心がけること
- ユーザーの視点でテスト（見える結果・操作）
- テスト名で仕様を明確に表現
- 必要最小限のモックで依存関係を排除
- テストピラミッド（単体多め・統合適度・E2E少数）

---

## 🚀 次のステップ

このガイドを読んだ後は、以下の順序で実践しましょう：

1. **📖 サンプルコードを読む**: `useToast.test.ts` で実際のテスト実装を確認
2. **✏️ 簡単なテストを書く**: StatusBadge等の既存コンポーネントを参考に
3. **🔄 テストを実行する**: `npm run test` でテストの動作を確認
4. **📈 徐々に複雑に**: カスタムフック→統合テスト→E2Eテストへ

**💡 覚えておきたいポイント**
- テストは「未来の自分への贈り物」
- 小さなテストから始めて、徐々に覚えていく  
- 100%完璧である必要はない、まずは書いてみることが大切
- **実際に手を動かすことが最も重要な学習方法**

---

**🎯 目標設定の例**
- 📅 **1週目**: useToast のテストを完成させる
- 📅 **2週目**: コンポーネントテストを2つ追加
- 📅 **3週目**: 統合テストに挑戦
- 📅 **4週目**: カバレッジ80%を目指す