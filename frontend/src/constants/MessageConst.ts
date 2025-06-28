/**
 * アプリケーション全体のメッセージ定数管理
 * 
 * 機能:
 * - 統一されたメッセージ管理
 * - 多言語対応の基盤
 * - メッセージの一元管理
 * - タイポの防止
 * 
 * 使用場面:
 * - Toast表示
 * - バリデーションエラー
 * - 確認ダイアログ
 * - システムメッセージ
 */

export const MessageConst = {
  // ===== 認証関連 =====
  AUTH: {
    LOGIN_SUCCESS_TITLE: "ログイン成功",
    LOGIN_SUCCESS_DESCRIPTION: (username: string) => `${username}さん、おかえりなさい`,
    LOGIN_FAILED_TITLE: "ログイン失敗",
    LOGIN_FAILED_INVALID_CREDENTIALS: "ユーザー名またはパスワードが正しくありません",
    LOGIN_FAILED_NETWORK_ERROR: "ネットワークエラーが発生しました",
    LOGOUT_SUCCESS: "ログアウトしました",
    TOKEN_EXPIRED: "セッションが期限切れです。再度ログインしてください",
    UNAUTHORIZED: "認証が必要です",
  },

  // ===== バリデーション関連 =====
  VALIDATION: {
    REQUIRED_USERNAME: "ユーザー名は必須です",
    REQUIRED_PASSWORD: "パスワードは必須です",
    REQUIRED_EMAIL: "メールアドレスは必須です",
    INVALID_EMAIL: "有効なメールアドレスを入力してください",
    PASSWORD_MIN_LENGTH: (min: number) => `パスワードは${min}文字以上で入力してください`,
    USERNAME_MIN_LENGTH: (min: number) => `ユーザー名は${min}文字以上で入力してください`,
  },

  // ===== システム関連 =====
  SYSTEM: {
    LOADING: "読み込み中...",
    SAVING: "保存中...",
    DELETING: "削除中...",
    PROCESSING: "処理中...",
    AUTHENTICATING: "認証中...",
    VALIDATING: "確認中...",
    NETWORK_ERROR: "ネットワークエラーが発生しました",
    UNEXPECTED_ERROR: "予期しないエラーが発生しました",
    MAINTENANCE: "システムメンテナンス中です",
  },

  // ===== アプリケーション情報 =====
  APP: {
    TITLE: "日報管理システム",
    WELCOME_MESSAGE: "日報管理システムへようこそ！",
    HOME_DESCRIPTION: "ここから日報の作成や管理を行うことができます。",
  },

  // ===== 開発・デバッグ関連 =====
  DEV: {
    MOCK_API_MODE: "🔧 開発モード (モックAPI使用中)",
    REAL_API_MODE: "🌐 開発モード (実際のAPI使用中)",
    PRODUCTION_MODE: "🚀 本番環境",
    TEST_ACCOUNT_INFO: "テストアカウント:",
    TEST_CREDENTIALS: "ユーザー名: admin, パスワード: password",
    MOCK_API_DESCRIPTION: "モックAPIを使用しています。",
    REAL_API_SWITCH_INSTRUCTION: "実際のAPIを使用する場合は npm run dev:api で起動してください。",
  },

  // ===== ボタン・アクション関連 =====
  ACTION: {
    LOGIN: "ログイン",
    LOGOUT: "ログアウト",
    SUBMIT: "送信",
    CANCEL: "キャンセル",
    SAVE: "保存",
    DELETE: "削除",
    EDIT: "編集",
    CREATE: "作成",
    UPDATE: "更新",
    BACK: "戻る",
    NEXT: "次へ",
    CONFIRM: "確認",
    RETRY: "再試行",
  },

  // ===== フォームラベル関連 =====
  LABEL: {
    USERNAME: "ユーザー名",
    PASSWORD: "パスワード",
    EMAIL: "メールアドレス",
    CONFIRM_PASSWORD: "パスワード確認",
    REMEMBER_ME: "ログイン状態を保持",
  },

  // ===== プレースホルダー関連 =====
  PLACEHOLDER: {
    USERNAME: "ユーザー名を入力",
    PASSWORD: "パスワードを入力",
    EMAIL: "メールアドレスを入力",
    SEARCH: "検索...",
  },

  // ===== 日報関連（将来拡張用） =====
  REPORT: {
    CREATE_SUCCESS: "日報を作成しました",
    UPDATE_SUCCESS: "日報を更新しました",
    DELETE_SUCCESS: "日報を削除しました",
    CREATE_FAILED: "日報の作成に失敗しました",
    UPDATE_FAILED: "日報の更新に失敗しました",
    DELETE_FAILED: "日報の削除に失敗しました",
    NOT_FOUND: "日報が見つかりません",
  },
} as const;