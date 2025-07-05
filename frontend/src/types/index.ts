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
  DailyReportStatus,
  DailyReportCreateRequest,
  DailyReportUpdateRequest,
  DailyReportResponse,
  DailyReportListParams,
} from "./api";

// API型ガード
export { isLoginResponse, isApiError, isUserInfo } from "./api";

// コンポーネント関連の型定義
export type {
  ReportCardData,
  FilterType,
  ButtonVariant,
  StatusBadgeType,
  ValidationState,
  LoadingState,
  ErrorState,
  ClickHandler,
  ClickHandlerWithParam,
  AsyncClickHandler,
  AsyncClickHandlerWithParam,
  EventHandler,
  FormSubmitHandler,
  InputChangeHandler,
  KeyboardEventHandler,
  SortOrder,
  SortField,
  SortConfig,
  PaginationConfig,
  CommonComponentProps,
} from "./components";

// コンポーネント型ガード
export { isValidationState, isLoadingState } from "./components";

// フォーム関連の型定義
export type {
  FormFieldConfig,
  LoginFormData,
  DailyReportFormData,
  UserRegistrationFormData,
  ValidationRule,
  FieldValidation,
  FormSubmissionState,
  FormState,
  FormEventHandlers,
} from "./forms";

// フォーム型ガード
export {
  isLoginFormData,
  isDailyReportFormData,
  isFormSubmissionState,
} from "./forms";
