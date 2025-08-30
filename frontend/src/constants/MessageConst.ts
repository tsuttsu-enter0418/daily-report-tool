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

  // ===== ダッシュボード関連 =====
  DASHBOARD: {
    TEAM_REPORTS_TITLE: "チーム日報",
    SUPERVISOR_GREETING: (name: string) => `${name} さんのチーム管理画面`,
    FILTER_ALL: "すべて",
    FILTER_COMPLETED: "提出済み",
    FILTER_PENDING: "確認待ち",
    STATUS_COMPLETED: "提出済み",
    STATUS_PENDING: "確認待ち",
    STATUS_DRAFT: "下書き",
    NO_REPORTS_TITLE: "まだ日報が提出されていません",
    NO_REPORTS_MESSAGE: "部下からの日報提出をお待ちください",
    MOCK_DASHBOARD_DESCRIPTION:
      "現在はモックデータを表示しています。実際の日報機能は今後実装予定です。",
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
    VIEW_TEAM_REPORTS: "📊 チーム日報を確認",
    CREATE_REPORT: "📝 日報を作成",
    VIEW_HISTORY: "📖 自分の日報履歴",
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

  // ===== 日報関連 =====
  REPORT: {
    // 成功・失敗メッセージ
    CREATE_SUCCESS: "日報を作成しました",
    UPDATE_SUCCESS: "日報を更新しました",
    DELETE_SUCCESS: "日報を削除しました",
    SAVE_DRAFT_SUCCESS: "下書きを保存しました",
    CREATE_FAILED: "日報の作成に失敗しました",
    UPDATE_FAILED: "日報の更新に失敗しました",
    DELETE_FAILED: "日報の削除に失敗しました",
    NOT_FOUND: "日報が見つかりません",

    // フォームタイトル・ラベル
    CREATE_FORM_TITLE: "日報作成",
    EDIT_FORM_TITLE: "日報編集",
    WORK_CONTENT_LABEL: "今日の作業内容",
    WORK_CONTENT_PLACEHOLDER: "今日行った作業内容を詳しく記載してください...",

    // バリデーション
    WORK_CONTENT_REQUIRED: "作業内容は必須です",
    WORK_CONTENT_MIN_LENGTH: (min: number) => `作業内容は${min}文字以上で入力してください`,
    WORK_CONTENT_MAX_LENGTH: (max: number) => `作業内容は${max}文字以内で入力してください`,

    // アクション
    SUBMIT_REPORT: "日報を提出",
    SAVE_DRAFT: "下書き保存",
    EDIT_REPORT: "編集",
    DELETE_REPORT: "削除",

    // 説明・ガイド
    FORM_DESCRIPTION: "本日の作業内容を記入して日報を作成してください。",
    DRAFT_AUTO_SAVE: "内容は自動的に下書きとして保存されます。",
    SUBMIT_CONFIRMATION: "日報を提出しますか？提出後は上司に通知されます。",

    // 一覧画面
    LIST_TITLE: "自分の日報履歴",
    LIST_DESCRIPTION: "過去に作成した日報の一覧を確認できます。",
    NO_REPORTS_MESSAGE: "まだ日報を作成していません。",
    CREATE_FIRST_REPORT: "最初の日報を作成しましょう。",
    FILTER_ALL_REPORTS: "すべて",
    FILTER_SUBMITTED: "提出済み",
    FILTER_DRAFTS: "下書き",
    SORT_BY_DATE: "作成日順",
    SORT_BY_STATUS: "ステータス順",
  },
} as const;
