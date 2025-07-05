/**
 * API関連の型定義
 *
 * 機能:
 * - APIレスポンスの型安全性確保
 * - フロントエンド/バックエンド間の型統一
 * - TypeScript厳密チェック対応
 * - type使用による型合成の柔軟性向上
 *
 * 使用場面:
 * - APIサービス層での型定義
 * - コンポーネントでのAPIデータ利用
 * - モックAPIとの型統一
 *
 * 設計方針:
 * - interfaceではなくtypeを使用
 * - 型合成やユニオン型の活用
 * - プリミティブ型の明確な定義
 */

/**
 * ログインリクエストの型定義
 */
export type LoginRequest = {
  username: string;
  password: string;
};

/**
 * ユーザー役職の型定義
 * ※ LoginResponseより前に定義する必要がある
 */
export type UserRole = "管理者" | "上長" | "部下";

/**
 * ログインレスポンスの型定義
 * バックエンドAPIとモックAPIで共通使用
 */
export type LoginResponse = {
  /** JWT認証トークン */
  token: string;
  /** ユーザーID */
  id: string;
  /** ユーザー名 */
  username: string;
  /** メールアドレス */
  email: string;
  /** ユーザー役職（型安全性向上） */
  role: UserRole;
  /** 表示名 */
  displayName?: string;
};

/**
 * APIエラーレスポンスの型定義
 */
export type ApiError = {
  message: string;
  status?: number;
  code?: string;
};

/**
 * ユーザー情報の型定義（詳細版）
 */
export type UserInfo = {
  /** ユーザーID（必須） */
  readonly id: string;
  /** ユーザー名（必須） */
  username: string;
  /** メールアドレス（必須） */
  email: string;
  /** ユーザー役職（必須、型安全性向上） */
  role: UserRole;
  /** 表示名（オプション） */
  displayName?: string;
  /** アカウント作成日時（オプション） */
  readonly createdAt?: string;
  /** 最終更新日時（オプション） */
  readonly updatedAt?: string;
};

/**
 * 日報ステータスの型定義
 */
export type DailyReportStatus = "draft" | "submitted";

/**
 * 日報作成リクエストの型定義
 * バックエンドのDailyReportRequestと対応
 */
export type DailyReportCreateRequest = {
  /** 日報タイトル（必須） */
  title: string;
  /** 作業内容（必須、10-1000文字） */
  workContent: string;
  /** 対象日（必須、YYYY-MM-DD形式） */
  reportDate: string;
  /** ステータス（必須） */
  status: DailyReportStatus;
};

/**
 * 日報更新リクエストの型定義
 * 作成リクエストと同じ構造
 */
export type DailyReportUpdateRequest = DailyReportCreateRequest;

/**
 * 日報レスポンスの型定義
 * バックエンドのDailyReportResponseと対応
 */
export type DailyReportResponse = {
  /** 日報ID */
  readonly id: number;
  /** 作成者ID */
  readonly userId: number;
  /** 作成者ユーザー名 */
  readonly username: string;
  /** 作成者表示名 */
  readonly displayName?: string;
  /** 日報タイトル */
  title: string;
  /** 作業内容 */
  workContent: string;
  /** ステータス */
  status: DailyReportStatus;
  /** 対象日 */
  reportDate: string;
  /** 提出日時 */
  readonly submittedAt?: string;
  /** 作成日時 */
  readonly createdAt: string;
  /** 更新日時 */
  readonly updatedAt: string;
};

/**
 * 日報一覧取得パラメータの型定義
 */
export type DailyReportListParams = {
  /** ページ番号（0ベース） */
  page?: number;
  /** 1ページあたりの件数 */
  size?: number;
  /** ステータスフィルター */
  status?: DailyReportStatus;
  /** 対象年月（YYYY-MM形式） */
  yearMonth?: string;
};

/**
 * 型ガード：ログインレスポンスの検証
 */
export const isLoginResponse = (obj: unknown): obj is LoginResponse => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "token" in obj &&
    "id" in obj &&
    "username" in obj &&
    "email" in obj &&
    "role" in obj &&
    typeof (obj as LoginResponse).token === "string" &&
    typeof (obj as LoginResponse).id === "string" &&
    typeof (obj as LoginResponse).username === "string" &&
    typeof (obj as LoginResponse).email === "string" &&
    ["管理者", "上長", "部下"].includes((obj as LoginResponse).role)
  );
};

/**
 * 型ガード：APIエラーの検証
 */
export const isApiError = (obj: unknown): obj is ApiError => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "message" in obj &&
    typeof (obj as ApiError).message === "string"
  );
};

/**
 * 型ガード：ユーザー情報の検証
 */
export const isUserInfo = (obj: unknown): obj is UserInfo => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "username" in obj &&
    "email" in obj &&
    "role" in obj &&
    typeof (obj as UserInfo).id === "string" &&
    typeof (obj as UserInfo).username === "string" &&
    typeof (obj as UserInfo).email === "string" &&
    ["管理者", "上長", "部下"].includes((obj as UserInfo).role)
  );
};
