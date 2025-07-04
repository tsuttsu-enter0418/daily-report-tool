import { Field, Input } from "@chakra-ui/react";
import { forwardRef, useId, useMemo, memo } from "react";
import { type ValidationState } from "../../types";

/**
 * 入力フィールドコンポーネント (Molecule)
 * 
 * 機能:
 * - ラベル付きの入力フィールド
 * - エラーメッセージ表示
 * - バリデーション状態の視覚化
 * 
 * 再利用場面:
 * - ログインフォーム
 * - ユーザー登録フォーム
 * - 各種設定フォーム
 */

type InputFieldProps = ValidationState & {
  /** ラベルテキスト */
  label: string;
  /** プレースホルダーテキスト */
  placeholder?: string;
  /** 入力タイプ（text, password, email等） */
  type?: string;
  /** 必須フィールドかどうか */
  required?: boolean;
  /** アクセシブルな説明（スクリーンリーダー用） */
  "aria-label"?: string;
  /** 追加の説明ID */
  "aria-describedby"?: string;
  /** その他のInput props */
  [key: string]: any;
};

const InputFieldComponent = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ 
    label, 
    placeholder, 
    type = "text", 
    error, 
    isInvalid, 
    required = false,
    "aria-label": ariaLabel,
    "aria-describedby": ariaDescribedby,
    ...props 
  }, ref) => {
    const errorId = useId();
    const isErrorState = useMemo(() => isInvalid || !!error, [isInvalid, error]);
    
    // エラーがある場合のaria-describedby設定
    const describedBy = useMemo(() => 
      isErrorState 
        ? [ariaDescribedby, errorId].filter(Boolean).join(' ')
        : ariaDescribedby,
      [isErrorState, ariaDescribedby, errorId]
    );

    return (
      <Field.Root invalid={isErrorState}>
        <Field.Label>
          {label}
          {required && (
            <span aria-label="必須項目" style={{ color: 'red', marginLeft: '4px' }}>
              *
            </span>
          )}
        </Field.Label>
        <Input
          ref={ref}
          type={type}
          placeholder={placeholder}
          required={required}
          aria-label={ariaLabel || label}
          aria-describedby={describedBy}
          aria-invalid={isErrorState}
          {...props}
        />
        {error && (
          <Field.ErrorText id={errorId} role="alert">
            {error}
          </Field.ErrorText>
        )}
      </Field.Root>
    );
  }
);

InputFieldComponent.displayName = "InputField";

// メモ化による再レンダリング最適化
export const InputField = memo(InputFieldComponent);