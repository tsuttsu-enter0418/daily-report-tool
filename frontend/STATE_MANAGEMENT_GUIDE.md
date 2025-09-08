# 状態管理統一ガイド

## 🎯 改善内容

**問題**: 状態管理が分散し、直接atom操作が複数箇所に点在していた  
**解決**: 中央集権的なカスタムフック経由での状態管理に統一

### ✅ Before（問題のあった実装）

```typescript
// ❌ 複数箇所で直接atom操作
// Home.tsx
const [rightPaneView] = useAtom(rightPaneViewAtom);

// ActionSection.tsx  
const setRightPaneView = useSetAtom(rightPaneViewAtom);

// 問題点:
// - 状態更新の追跡困難
// - デバッグの複雑化
// - テストの困難さ
// - 保守性の低下
```

### ✅ After（統一された実装）

```typescript
// ✅ 中央集権的カスタムフック経由
// hooks/useRightPane.ts
export const useRightPane = () => {
  const [view, setView] = useAtom(rightPaneViewAtom);
  return {
    view,
    actions: {
      showCreate: () => setView({ type: 'create' }),
      showEdit: (id) => setView({ type: 'edit', reportId: id }),
      showList: () => setView({ type: 'list' }),
      showDetail: (id) => setView({ type: 'detail', reportId: id }),
      showSupervisor: () => setView({ type: 'supervisor' }),
    }
  };
};

// 使用例
const { view, actions } = useRightPane();
actions.showCreate(); // 型安全なアクション
```

## 📊 統一された状態管理アーキテクチャ

### 🌟 グローバル状態管理（Jotai）

| 状態 | 管理方法 | 永続化 | アクセス方法 |
|------|----------|--------|-------------|
| **認証状態** | userStore.ts | ✅ ローカルストレージ | useAuth() |
| **右ペイン表示** | rightPaneAtom.ts | ❌ セッションのみ | useRightPane() |

### 🔧 ローカル状態管理（React useState）

| 用途 | 管理場所 | 責務 |
|------|----------|------|
| **API状態** | useDailyReports | データ取得・更新・エラー管理 |
| **ダイアログ状態** | useDeleteDialog | モーダル開閉・確認処理 |
| **フォーム状態** | React Hook Form | 入力データ・バリデーション |

## 🎨 状態管理パターン

### ✅ 推奨パターン

```typescript
// 1. グローバル状態：カスタムフック経由
const { user, logout } = useAuth();
const { view, actions } = useRightPane();

// 2. ローカル状態：関連する状態をカスタムフックで統合
const { reports, isLoading, error, deleteReport } = useDailyReports();

// 3. フォーム状態：React Hook Form
const { register, handleSubmit, formState: { errors } } = useForm();
```

### ❌ 避けるべきパターン

```typescript
// ❌ 直接atom操作（デバッグ困難）
const setRightPaneView = useSetAtom(rightPaneViewAtom);

// ❌ 関連状態の分散（保守性低下）
const [report, setReport] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);
const [deleteDialog, setDeleteDialog] = useState({});
const [statusDialog, setStatusDialog] = useState({});
```

## 🔍 状態管理の責務分担

### 📁 グローバル状態

- **userStore** (`src/stores/userStore.ts`)
  - 認証情報の永続化
  - ユーザー情報の管理
  - ログイン/ログアウト処理

- **rightPaneAtom** (`src/atoms/rightPaneAtom.ts`)  
  - 右ペイン表示制御
  - UI状態の統一管理

### 🎣 カスタムフック

- **useRightPane** (`src/hooks/useRightPane.ts`)
  - 右ペイン状態の中央集権的管理
  - 型安全なアクション提供

- **useAuth** (`src/hooks/useAuth.ts`)
  - 認証状態の抽象化
  - ログアウト処理の統一

- **useDailyReports** (`src/hooks/useDailyReports.ts`)  
  - 日報API状態管理
  - CRUD操作の抽象化

## 🚨 問題の早期発見

### 🔍 チェックポイント

状態管理で以下を見つけたら要改善：

```typescript
// ❌ 直接atom操作
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
const setValue = useSetAtom(someAtom);

// ❌ 関連状態の分散  
const [stateA, setStateA] = useState();
const [stateB, setStateB] = useState(); 
const [stateC, setStateC] = useState();

// ❌ 状態更新の重複
// 複数箇所で同じ状態を更新
```

### ✅ 改善アプローチ

1. **カスタムフック化**: 関連状態をまとめる
2. **アクションパターン**: 状態更新を関数として抽象化  
3. **中央集権化**: 1つの状態は1箇所からのみ更新

## 📈 メリット

### 🎯 Before → After

| 項目 | Before | After |
|------|--------|-------|
| **デバッグ** | 困難（状態変更箇所が分散） | 容易（カスタムフック内でログ出力） |
| **テスト** | 複雑（各箇所で異なるパターン） | シンプル（カスタムフック単体テスト） |
| **型安全性** | 部分的 | 完全（アクション関数で保証） |
| **保守性** | 低（影響範囲不明） | 高（依存関係明確） |
| **学習コスト** | 高（パターン混在） | 低（統一パターン） |

## 🔄 今後の拡張

### 🚀 新しい状態追加時

```typescript
// 1. Atom定義（必要に応じて）
export const newFeatureAtom = atom(initialState);

// 2. カスタムフック作成
export const useNewFeature = () => {
  const [state, setState] = useAtom(newFeatureAtom);
  
  const actions = {
    action1: () => setState(newState1),
    action2: (param) => setState(newState2),
  };
  
  return { state, actions };
};

// 3. コンポーネントで使用
const { state, actions } = useNewFeature();
```

## 📋 まとめ

✅ **統一された状態管理パターン**により以下を実現：

- 🔍 **デバッグの容易性**: 状態変更の追跡可能
- 🧪 **テストの簡素化**: カスタムフック単体でテスト  
- 🛡️ **型安全性**: アクション関数での型保証
- 📚 **保守性向上**: 依存関係の明確化
- 🎓 **学習コスト削減**: 統一パターンによる理解しやすさ

この統一アプローチにより、プロジェクトの拡張性と保守性が大幅に向上しました。