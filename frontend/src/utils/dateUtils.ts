/**
 * 日付フォーマットユーティリティ
 * 
 * 機能:
 * - 日付の統一フォーマット処理
 * - エラーハンドリング対応
 * - プロジェクト全体での再利用可能
 * 
 * 使用場面:
 * - 日報一覧・詳細画面での日付表示
 * - 作成日時・更新日時の表示
 * - フォーム入力値の表示用フォーマット
 */

/**
 * 日付を YYYY/MM/DD 形式でフォーマット
 * 
 * @param dateString - ISO文字列形式の日付 (例: "2024-12-22")
 * @returns フォーマットされた日付文字列 (例: "2024/12/22")
 * 
 * @example
 * ```typescript
 * formatDate("2024-12-22") // "2024/12/22"
 * formatDate("invalid-date") // "invalid-date" (エラー時は元の値を返す)
 * ```
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    
    // 無効な日付の場合は例外を発生させる
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    // エラー時は元の文字列をそのまま返す（デバッグ目的）
    console.warn(`日付フォーマットエラー: ${dateString}`);
    return dateString;
  }
};

/**
 * 日時を YYYY/MM/DD HH:MM 形式でフォーマット
 * 
 * @param dateString - ISO文字列形式の日時 (例: "2024-12-22T18:30:00.000Z")
 * @returns フォーマットされた日時文字列 (例: "2024/12/22 18:30")
 * 
 * @example
 * ```typescript
 * formatDateTime("2024-12-22T18:30:00.000Z") // "2024/12/22 18:30"
 * formatDateTime("invalid-datetime") // "invalid-datetime" (エラー時は元の値を返す)
 * ```
 */
export const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    
    // 無効な日付の場合は例外を発生させる
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    // エラー時は元の文字列をそのまま返す（デバッグ目的）
    console.warn(`日時フォーマットエラー: ${dateString}`);
    return dateString;
  }
};

/**
 * 日付文字列の妥当性をチェック
 * 
 * @param dateString - チェック対象の日付文字列
 * @returns 有効な日付かどうか
 * 
 * @example
 * ```typescript
 * isValidDate("2024-12-22") // true
 * isValidDate("invalid-date") // false
 * ```
 */
export const isValidDate = (dateString: string): boolean => {
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};

/**
 * オプショナルな日時をフォーマット（null/undefined対応）
 * 
 * @param dateString - オプショナルな日時文字列
 * @returns フォーマットされた日時文字列またはnull
 * 
 * @example
 * ```typescript
 * formatOptionalDateTime("2024-12-22T18:30:00.000Z") // "2024/12/22 18:30"
 * formatOptionalDateTime(null) // null
 * formatOptionalDateTime(undefined) // null
 * ```
 */
export const formatOptionalDateTime = (dateString?: string | null): string | null => {
  if (!dateString) {
    return null;
  }
  return formatDateTime(dateString);
};