import { Field, Input } from "@chakra-ui/react";
import { forwardRef } from "react";

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

type InputFieldProps = {
  /** ラベルテキスト */
  label: string;
  /** プレースホルダーテキスト */
  placeholder?: string;
  /** 入力タイプ（text, password, email等） */
  type?: string;
  /** エラーメッセージ */
  error?: string;
  /** バリデーションエラー状態 */
  isInvalid?: boolean;
  /** その他のInput props */
  [key: string]: any;
};

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, placeholder, type = "text", error, isInvalid, ...props }, ref) => {
    return (
      <Field.Root invalid={isInvalid}>
        <Field.Label>{label}</Field.Label>
        <Input
          ref={ref}
          type={type}
          placeholder={placeholder}
          {...props}
        />
        {error && (
          <Field.ErrorText>{error}</Field.ErrorText>
        )}
      </Field.Root>
    );
  }
);