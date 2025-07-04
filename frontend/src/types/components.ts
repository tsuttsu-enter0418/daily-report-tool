/**
 * コンポーネント関連の型定義
 * 
 * 機能:
 * - コンポーネント間で共有される型定義
 * - プロパティの型安全性確保
 * - 再利用可能なコンポーネントの型統一
 * 
 * 使用場面:
 * - コンポーネントのPropsの型定義
 * - 状態管理の型定義
 * - イベントハンドラーの型定義
 * 
 * 設計方針:
 * - type エイリアス使用
 * - 型合成の柔軟性重視
 * - コンポーネント単位での型グループ化
 */

/**
 * 日報カードコンポーネント用の型定義
 */
export type ReportCardData = {
  /** 日報ID */
  id: string;
  /** 日報タイトル */
  title: string;
  /** 作成者名 */
  author: string;
  /** 所属チーム */
  team: string;
  /** 日報ステータス */
  status: "completed" | "pending" | "draft";
  /** 提出日 */
  date: string;
  /** アバター背景色（グラデーション） */
  avatarBg: string;
};

/**
 * フィルタータイプ（ダッシュボード用）
 */
export type FilterType = "all" | "completed" | "pending";

/**
 * カスタムボタンのバリアント
 */
export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

/**
 * ステータスバッジのタイプ
 */
export type StatusBadgeType = 
  | "dev-mock" 
  | "dev-api" 
  | "production" 
  | "success" 
  | "warning" 
  | "error";

/**
 * 入力フィールドのバリデーション状態
 */
export type ValidationState = {
  /** エラーメッセージ */
  error?: string;
  /** バリデーション失敗状態 */
  isInvalid?: boolean;
  /** バリデーション成功状態 */
  isValid?: boolean;
};

/**
 * 共通のクリックハンドラー
 */
export type ClickHandler = () => void;

/**
 * 共通のイベントハンドラー
 */
export type EventHandler<T = any> = (event: T) => void;

/**
 * 日報リストのソート順
 */
export type SortOrder = "asc" | "desc";

/**
 * 日報リストのソート項目
 */
export type SortField = "date" | "author" | "status" | "title";