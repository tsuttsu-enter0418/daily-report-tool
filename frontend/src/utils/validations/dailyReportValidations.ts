/* eslint-disable @typescript-eslint/naming-convention */
import { MessageConst } from "@/constants/MessageConst";
import * as yup from "yup";
// タイトル
export const VALIDATION__FORM_TITLE = yup
  .string()
  .required("タイトルは必須です")
  .max(200, "タイトルは200文字以内で入力してください");
// 作業内容
export const VALIDATION__FORM_WORK_CONTENT = yup
  .string()
  .required(MessageConst.REPORT.WORK_CONTENT_REQUIRED)
  .min(10, MessageConst.REPORT.WORK_CONTENT_MIN_LENGTH(10))
  .max(1000, MessageConst.REPORT.WORK_CONTENT_MAX_LENGTH(1000));
// 報告日
export const VALIDATION__FORM_REPORT_DATE = yup
  .string()
  .required("報告日は必須です")
  .matches(/^\d{4}-\d{2}-\d{2}$/, "日付はYYYY-MM-DD形式で入力してください");
