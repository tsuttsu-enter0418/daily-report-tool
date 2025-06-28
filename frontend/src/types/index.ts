/**
 * 型定義エクスポート（Types）
 * 
 * 特徴:
 * - プロジェクト全体の型定義を統一管理
 * - APIレスポンス、ユーザー情報、フォームデータの型安全性
 * - TypeScript厳密チェック対応
 * - バックエンドとの型統一
 * - interfaceではなくtypeエイリアスを使用
 * 
 * 使用場面:
 * - コンポーネント間での型共有
 * - APIレスポンスの型安全性確保
 * - フォームバリデーション
 * - 型合成とユニオン型の活用
 * 
 * 設計方針:
 * - type > interface の優先使用
 * - 型合成の柔軟性を重視
 * - プリミティブ型の明確な定義
 * - ユニオン型の積極活用
 */

// API関連の型定義
export type {
  LoginRequest,
  LoginResponse,
  ApiError,
  UserInfo,
  UserRole,
} from "./api";

// 他の型定義がある場合は追加
// export type { ... } from "./components";
// export type { ... } from "./forms";