import { useCallback } from "react";
import { useAtom } from "jotai";
import { rightPaneViewAtom, type RightPaneView } from "../atoms/rightPaneAtom";

/**
 * 右ペイン状態管理カスタムフック
 *
 * 機能:
 * - 右ペイン表示状態の中央集権的管理
 * - 型安全な状態更新アクション提供
 * - 状態変更の統一インターフェース
 *
 * 設計方針:
 * - 直接atom操作を禁止し、このフック経由でのみ更新
 * - アクションベースパターンによる予測可能な状態変更
 * - デバッグ・テストの容易性確保
 *
 * 使用例:
 * const { view, actions } = useRightPane();
 * actions.showCreate();
 * actions.showEdit(reportId);
 */

export type UseRightPaneReturn = {
  /** 現在の右ペイン表示状態 */
  view: RightPaneView;
  /** 状態変更アクション群 */
  actions: {
    /** 新規日報作成画面を表示 */
    showCreate: () => void;
    /** 日報編集画面を表示 */
    showEdit: (reportId: number) => void;
    /** 日報一覧画面を表示 */
    showList: () => void;
    /** 日報詳細画面を表示 */
    showDetail: (reportId: number) => void;
    /** 上司ダッシュボードを表示 */
    showSupervisor: () => void;
  };
};

/**
 * 右ペイン状態管理フック
 *
 * @returns {UseRightPaneReturn} 右ペイン状態と操作アクション
 */
export const useRightPane = (): UseRightPaneReturn => {
  const [view, setView] = useAtom(rightPaneViewAtom);

  // アクション関数群（メモ化）
  const showCreate = useCallback(() => {
    console.log("🎯 右ペイン: 新規作成画面に変更");
    setView({ type: "create" });
  }, [setView]);

  const showEdit = useCallback(
    (reportId: number) => {
      console.log(`🎯 右ペイン: 編集画面に変更 (ID: ${reportId})`);
      setView({ type: "edit", reportId });
    },
    [setView],
  );

  const showList = useCallback(() => {
    console.log("🎯 右ペイン: 一覧画面に変更");
    setView({ type: "list" });
  }, [setView]);

  const showDetail = useCallback(
    (reportId: number) => {
      console.log(`🎯 右ペイン: 詳細画面に変更 (ID: ${reportId})`);
      setView({ type: "detail", reportId });
    },
    [setView],
  );

  const showSupervisor = useCallback(() => {
    console.log("🎯 右ペイン: 上司ダッシュボードに変更");
    setView({ type: "supervisor" });
  }, [setView]);

  return {
    view,
    actions: {
      showCreate,
      showEdit,
      showList,
      showDetail,
      showSupervisor,
    },
  };
};
