import { Text, Field } from "@chakra-ui/react";
import { DatePicker } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";

/**
 * DatePickerField (Molecule)
 *
 * 機能:
 * - シンプルな日付選択フィールド
 * - React Hook Form Controller統合
 * - ChakraUI統一デザイン
 *
 * 使用例:
 * ```tsx
 * <DatePickerField
 *   name="reportDate"
 *   label="報告日"
 *   isRequired
 *   control={control}
 * />
 * ```
 */

type DatePickerFieldProps<T extends FieldValues = FieldValues> = {
  /** フィールド名 */
  name: FieldPath<T>;
  /** ラベルテキスト */
  label: string;
  /** 必須フィールドかどうか */
  isRequired?: boolean;
  /** プレースホルダーテキスト */
  placeholder?: string;
  /** ヘルプテキスト */
  helperText?: string;
  /** React Hook Form のcontrol */
  control: Control<T>;
};

export const DatePickerField = <T extends FieldValues = FieldValues>({
  name,
  label,
  isRequired = false,
  placeholder = "日付を選択してください",
  helperText,
  control,
}: DatePickerFieldProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <Field.Root invalid={!!error}>
          <Field.Label fontSize="md" fontWeight="semibold" color="gray.800" htmlFor="datepicker">
            {label}
            {isRequired && (
              <Text as="span" color="red.500" ml={1} data-testid="required-datepicker">
                *
              </Text>
            )}
          </Field.Label>

          <DatePicker
            selected={value ? new Date(value) : null}
            onChange={(date) => {
              const formattedDate = date ? date.toISOString().split("T")[0] : "";
              onChange(formattedDate);
            }}
            placeholderText={placeholder}
            dateFormat="yyyy/MM/dd"
            className="custom-datepicker"
            id="datepicker"
          />

          {error && (
            <Field.ErrorText color="red.500" fontSize="sm">
              {error.message as string}
            </Field.ErrorText>
          )}

          {helperText && (
            <Field.HelperText color="gray.600" fontSize="sm">
              {helperText}
            </Field.HelperText>
          )}
        </Field.Root>
      )}
    />
  );
};
