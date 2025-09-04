import { Text, Field } from "@chakra-ui/react";
import { DatePicker } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, useCallback, useEffect } from "react";
import type {
  UseFormRegister,
  UseFormSetValue,
  FieldErrors,
  FieldValues,
  Path,
} from "react-hook-form";

/**
 * DatePickerField (Molecule)
 *
 * 機能:
 * - React DatePickerとChakraUIのField構造を統合
 * - React Hook Formとの完全な統合
 * - バリデーション表示対応
 * - ChakraUI他コンポーネントと統一されたスタイリング
 *
 * 使用例:
 * ```tsx
 * <DatePickerField
 *   name="reportDate"
 *   label="報告日"
 *   isRequired
 *   register={register}
 *   setValue={setValue}
 *   errors={errors}
 *   helperText="日報の対象日を選択してください"
 * />
 * ```
 */

type DatePickerFieldProps<T extends FieldValues = FieldValues> = {
  /** フィールド名（React Hook Form用） */
  name: Path<T>;
  /** ラベルテキスト */
  label: string;
  /** 必須フィールドかどうか */
  isRequired?: boolean;
  /** プレースホルダーテキスト */
  placeholder?: string;
  /** ヘルプテキスト */
  helperText?: string;
  /** 日付フォーマット（デフォルト: "yyyy/MM/dd"） */
  dateFormat?: string;
  /** React Hook Form のregister関数 */
  register: UseFormRegister<T>;
  /** React Hook Form のsetValue関数 */
  setValue: UseFormSetValue<T>;
  /** React Hook Form のerrors */
  errors: FieldErrors<T>;
  /** 初期値（YYYY-MM-DD形式の文字列） */
  defaultValue?: string;
  /** DatePickerのその他のプロパティ */
  [key: string]: any;
};

export const DatePickerField = <T extends FieldValues = FieldValues>({
  name,
  label,
  isRequired = false,
  placeholder = "日付を選択してください",
  helperText,
  dateFormat = "yyyy/MM/dd",
  register,
  setValue,
  errors,
  defaultValue,
  ...datePickerProps
}: DatePickerFieldProps<T>) => {
  // DatePicker用の日付状態管理
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // エラーメッセージの取得
  const error = errors[name];

  // 初期値の設定
  useEffect(() => {
    if (defaultValue && !selectedDate) {
      const date = new Date(defaultValue);
      setSelectedDate(date);
    }
  }, [defaultValue, selectedDate]);

  // DatePicker変更時の処理
  const handleDateChange = useCallback(
    (date: Date | null) => {
      setSelectedDate(date);
      if (date) {
        // Date をYYYY-MM-DD形式の文字列に変換
        const formattedDate = date.toISOString().split("T")[0];
        setValue(name, formattedDate, { shouldValidate: true });
      }
    },
    [name, setValue],
  );

  return (
    <Field.Root invalid={!!error}>
      <Field.Label fontSize="md" fontWeight="semibold" color="gray.800">
        {label}
        {isRequired && (
          <Text as="span" color="red.500" ml={1}>
            *
          </Text>
        )}
      </Field.Label>

      <DatePicker
        dateFormat={dateFormat}
        selected={selectedDate}
        onChange={handleDateChange}
        placeholderText={placeholder}
        className="custom-datepicker"
        {...datePickerProps}
      />

      {/* 隠しフィールド: React Hook Form用 */}
      <input type="hidden" {...register(name)} />

      {/* エラーメッセージ */}
      {error && (
        <Field.ErrorText color="red.500" fontSize="sm">
          {error.message as string}
        </Field.ErrorText>
      )}

      {/* ヘルプテキスト */}
      {helperText && (
        <Field.HelperText color="gray.600" fontSize="sm">
          {helperText}
        </Field.HelperText>
      )}
    </Field.Root>
  );
};
