# テスト機能ガイド 📋

このプロジェクトで使用されているテスト機能について、初心者向けに分かりやすく説明します。

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

## 🎯 このプロジェクトでのテスト戦略

### 現在のテスト状況
- ✅ ログイン機能の単体・統合テスト
- ✅ APIサービスのモックテスト
- ✅ カスタムフックのテスト
- ✅ UIコンポーネントのテスト

### 今後追加予定
- [ ] E2Eテスト（Playwright）
- [ ] バックエンドAPIテスト
- [ ] パフォーマンステスト

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

**💡 覚えておきたいポイント**
- テストは「未来の自分への贈り物」
- 小さなテストから始めて、徐々に覚えていく
- 100%完璧である必要はない、まずは書いてみることが大切