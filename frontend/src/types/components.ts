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
  | "error"
  | "draft"
  | "submitted";

/**
 * 入力フィールドのバリデーション状態（型安全性向上）
 */
export type ValidationState = {
  /** エラーメッセージ（オプション） */
  readonly error?: string;
  /** バリデーション失敗状態（オプション） */
  readonly isInvalid?: boolean;
  /** バリデーション成功状態（オプション） */
  readonly isValid?: boolean;
};

/**
 * ローディング状態の型定義
 */
export type LoadingState = {
  /** ローディング中かどうか */
  readonly isLoading: boolean;
  /** ローディングメッセージ（オプション） */
  readonly loadingMessage?: string;
};

/**
 * エラー状態の型定義
 */
export type ErrorState = {
  /** エラーがあるかどうか */
  readonly hasError: boolean;
  /** エラーメッセージ（オプション） */
  readonly errorMessage?: string;
  /** エラーコード（オプション） */
  readonly errorCode?: string;
};

/**
 * 共通のクリックハンドラー
 */
export type ClickHandler = () => void;

/**
 * パラメータ付きクリックハンドラー（ジェネリック）
 */
export type ClickHandlerWithParam<T = string> = (param: T) => void;

/**
 * 非同期クリックハンドラー
 */
export type AsyncClickHandler = () => Promise<void>;

/**
 * 非同期パラメータ付きクリックハンドラー
 */
export type AsyncClickHandlerWithParam<T = string> = (
  param: T,
) => Promise<void>;

/**
 * Reactイベントハンドラー（型安全性向上）
 */
export type EventHandler<T = React.SyntheticEvent> = (event: T) => void;

/**
 * フォーム送信ハンドラー
 */
export type FormSubmitHandler = (
  event: React.FormEvent<HTMLFormElement>,
) => void;

/**
 * 入力変更ハンドラー
 */
export type InputChangeHandler = (
  event: React.ChangeEvent<HTMLInputElement>,
) => void;

/**
 * キーボードイベントハンドラー
 */
export type KeyboardEventHandler = (event: React.KeyboardEvent) => void;

/**
 * 日報リストのソート順
 */
export type SortOrder = "asc" | "desc";

/**
 * 日報リストのソート項目
 */
export type SortField = "date" | "author" | "status" | "title";

/**
 * ジェネリックソート設定
 */
export type SortConfig<T = string> = {
  /** ソート対象フィールド */
  field: T;
  /** ソート順 */
  order: SortOrder;
};

/**
 * ページネーション設定
 */
export type PaginationConfig = {
  /** 現在のページ番号（1から始まる） */
  readonly currentPage: number;
  /** 1ページあたりのアイテム数 */
  readonly pageSize: number;
  /** 全アイテム数 */
  readonly totalItems: number;
  /** 全ページ数 */
  readonly totalPages: number;
};

/**
 * コンポーネントの共通プロップス（ジェネリック）
 */
export type CommonComponentProps = {
  /** 要素のID（オプション） */
  id?: string;
  /** CSSクラス名（オプション） */
  className?: string;
  /** テストID（オプション） */
  "data-testid"?: string;
  /** アクセシビリティラベル（オプション） */
  "aria-label"?: string;
  /** 要素の説明（オプション） */
  "aria-describedby"?: string;
};

/**
 * 型ガード：バリデーション状態の検証
 */
export const isValidationState = (obj: unknown): obj is ValidationState => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    (typeof (obj as ValidationState).error === "string" ||
      (obj as ValidationState).error === undefined) &&
    (typeof (obj as ValidationState).isInvalid === "boolean" ||
      (obj as ValidationState).isInvalid === undefined) &&
    (typeof (obj as ValidationState).isValid === "boolean" ||
      (obj as ValidationState).isValid === undefined)
  );
};

/**
 * 型ガード：ローディング状態の検証
 */
export const isLoadingState = (obj: unknown): obj is LoadingState => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as LoadingState).isLoading === "boolean" &&
    (typeof (obj as LoadingState).loadingMessage === "string" ||
      (obj as LoadingState).loadingMessage === undefined)
  );
};
