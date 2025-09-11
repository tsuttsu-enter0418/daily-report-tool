import { atom } from "jotai";

/**
 * 右ペイン表示状態の型定義
 *
 * 機能:
 * - 右ペインで表示するコンテンツの種類を管理
 * - 各状態に必要なパラメータを型安全に定義
 *
 * 状態種別:
 * - create: 新規日報作成フォーム
 * - edit: 既存日報編集フォーム（reportIdが必要）
 * - list: 日報一覧表示
 * - detail: 日報詳細表示（reportIdが必要）
 * - supervisor: 上司ダッシュボード（チーム日報確認）
 */
export type RightPaneView =
  | { type: "create" }
  | { type: "edit"; reportId: number }
  | { type: "list" }
  | { type: "detail"; reportId: number }
  | { type: "supervisor" };

/**
 * 右ペイン状態管理atom
 *
 * 機能:
 * - 右ペインの表示内容を全体で管理
 * - 左側ペインのアクションボタンからの状態変更を受け付け
 * - SPA内でのシームレスなコンテンツ切り替えを実現
 *
 * デフォルト状態: 新規作成フォーム
 */
export const rightPaneViewAtom = atom<RightPaneView>({ type: "create" });
