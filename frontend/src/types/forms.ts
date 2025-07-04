/**
 * フォーム関連の型定義
 * 
 * 機能:
 * - フォームデータの型安全性確保
 * - バリデーション関連の型定義
 * - フォームイベントハンドラーの型統一
 * 
 * 使用場面:
 * - フォームコンポーネントでの型定義
 * - バリデーションライブラリとの連携
 * - React Hook Formとの統合
 * 
 * 設計方針:
 * - ジェネリック型の積極活用
 * - 厳密な型制約
 * - 再利用可能な型構造
 */

import type { ValidationState } from './components';

/**
 * フォームフィールドの基本型定義
 */
export type FormFieldConfig<T = string> = {
  /** フィールド名 */
  readonly name: string;
  /** ラベルテキスト */
  readonly label: string;
  /** プレースホルダーテキスト */
  readonly placeholder?: string;
  /** 必須フィールドかどうか */
  readonly required?: boolean;
  /** 初期値 */
  readonly defaultValue?: T;
  /** 入力タイプ */
  readonly type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';
};

/**
 * ログインフォームの型定義
 */
export type LoginFormData = {
  /** ユーザー名（必須） */
  username: string;
  /** パスワード（必須） */
  password: string;
  /** ログイン状態保持（オプション） */
  rememberMe?: boolean;
};

/**
 * 日報フォームの型定義
 */
export type DailyReportFormData = {
  /** 日報タイトル（オプション） */
  title?: string;
  /** 作業内容（必須） */
  workContent: string;
  /** 翌日の予定（オプション） */
  nextPlan?: string;
  /** 特記事項（オプション） */
  notes?: string;
  /** ステータス */
  status: 'draft' | 'submitted';
  /** 報告日 */
  reportDate: string;
};

/**
 * ユーザー登録フォームの型定義
 */
export type UserRegistrationFormData = {
  /** ユーザー名（必須） */
  username: string;
  /** メールアドレス（必須） */
  email: string;
  /** パスワード（必須） */
  password: string;
  /** パスワード確認（必須） */
  confirmPassword: string;
  /** 表示名（オプション） */
  displayName?: string;
  /** 同意チェック（必須） */
  agreeToTerms: boolean;
};

/**
 * フォームバリデーションルールの型定義
 */
export type ValidationRule<T = any> = {
  /** バリデーション関数 */
  validator: (value: T) => boolean | Promise<boolean>;
  /** エラーメッセージ */
  message: string;
  /** バリデーションタイプ */
  type: 'required' | 'pattern' | 'minLength' | 'maxLength' | 'custom';
};

/**
 * フィールドバリデーション設定
 */
export type FieldValidation<T = any> = {
  /** フィールド名 */
  field: string;
  /** バリデーションルール配列 */
  rules: ValidationRule<T>[];
};

/**
 * フォーム送信状態の型定義
 */
export type FormSubmissionState = {
  /** 送信中かどうか */
  readonly isSubmitting: boolean;
  /** 送信完了かどうか */
  readonly isSubmitted: boolean;
  /** 送信成功かどうか */
  readonly isSuccess: boolean;
  /** エラー情報 */
  readonly error?: string;
  /** 送信開始時刻 */
  readonly submittedAt?: Date;
};

/**
 * フォームの状態管理型
 */
export type FormState<T = Record<string, any>> = {
  /** フォームデータ */
  data: T;
  /** バリデーション状態 */
  validation: Record<keyof T, ValidationState>;
  /** 送信状態 */
  submission: FormSubmissionState;
  /** フォームの変更フラグ */
  readonly isDirty: boolean;
  /** フォームの有効性 */
  readonly isValid: boolean;
};

/**
 * フォームイベントハンドラーの型定義
 */
export type FormEventHandlers<T = Record<string, any>> = {
  /** フィールド値変更時 */
  onFieldChange: (field: keyof T, value: T[keyof T]) => void;
  /** フォーム送信時 */
  onSubmit: (data: T) => void | Promise<void>;
  /** フォームリセット時 */
  onReset: () => void;
  /** バリデーション実行時 */
  onValidate: (field?: keyof T) => Promise<boolean>;
};

/**
 * 型ガード：ログインフォームデータの検証
 */
export const isLoginFormData = (obj: unknown): obj is LoginFormData => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'username' in obj &&
    'password' in obj &&
    typeof (obj as LoginFormData).username === 'string' &&
    typeof (obj as LoginFormData).password === 'string' &&
    (obj as LoginFormData).username.length > 0 &&
    (obj as LoginFormData).password.length > 0
  );
};

/**
 * 型ガード：日報フォームデータの検証
 */
export const isDailyReportFormData = (obj: unknown): obj is DailyReportFormData => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'workContent' in obj &&
    'status' in obj &&
    'reportDate' in obj &&
    typeof (obj as DailyReportFormData).workContent === 'string' &&
    ['draft', 'submitted'].includes((obj as DailyReportFormData).status) &&
    typeof (obj as DailyReportFormData).reportDate === 'string' &&
    (obj as DailyReportFormData).workContent.length > 0
  );
};

/**
 * 型ガード：フォーム送信状態の検証
 */
export const isFormSubmissionState = (obj: unknown): obj is FormSubmissionState => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'isSubmitting' in obj &&
    'isSubmitted' in obj &&
    'isSuccess' in obj &&
    typeof (obj as FormSubmissionState).isSubmitting === 'boolean' &&
    typeof (obj as FormSubmissionState).isSubmitted === 'boolean' &&
    typeof (obj as FormSubmissionState).isSuccess === 'boolean'
  );
};