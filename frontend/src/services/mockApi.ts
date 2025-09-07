import type {
  LoginRequest,
  LoginResponse,
  UserRole,
  DailyReportResponse,
  DailyReportCreateRequest,
  DailyReportUpdateRequest,
  DailyReportListParams,
  UserInfo,
} from "../types";

/**
 * モックAPIサービス
 *
 * 機能:
 * - バックエンド不要でのフロントエンド開発サポート
 * - 実際のAPIと同じインターフェースを提供
 * - ログイン認証、トークン検証、ユーザー情報取得をシミュレート
 * - 日報CRUD操作の完全シミュレート
 * - 遅延処理で実際のAPI通信を模擬
 *
 * 使用場面:
 * - フロントエンド独立開発
 * - UIテスト
 * - デモンストレーション
 * - 画面開発効率化
 */

/**
 * モックユーザーの型定義（型安全性向上）
 */
type MockUser = {
  /** ユーザーID */
  readonly id: string;
  /** ユーザー名 */
  username: string;
  /** メールアドレス */
  email: string;
  /** ユーザー役職（型安全性向上） */
  role: UserRole;
};

// モックユーザーデータ
const mockUsers: MockUser[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@example.com",
    role: "管理者",
  },
  {
    id: "2",
    username: "manager",
    email: "manager@example.com",
    role: "上長",
  },
  {
    id: "3",
    username: "employee1",
    email: "emp1@example.com",
    role: "部下",
  },
];

/**
 * モック日報データ（開発効率化用）
 *
 * 特徴:
 * - 多様な作業内容パターン
 * - submitted/draft ステータス混在
 * - 異なる日付での日報履歴
 * - リアルなビジネス作業内容
 * - UI表示確認用の様々な文字数パターン
 */
const mockDailyReports: DailyReportResponse[] = [
  {
    id: 1,
    userId: 3,
    username: "employee1",
    displayName: "田中太郎",
    title: "React コンポーネントのリファクタリング作業",
    workContent:
      "本日は日報管理システムのフロントエンド改修を実施しました。具体的には、DailyReportListコンポーネントのパフォーマンス最適化を行い、メモ化を活用して不要な再レンダリングを防ぎました。また、ChakraUI v3.2の最新API仕様に対応するため、Card.RootやField.Rootの複合コンポーネント構造に移行しました。テストコードも併せて更新し、全11テストケースが正常に動作することを確認しています。明日は削除機能の確認ダイアログ実装を予定しています。",
    status: "submitted",
    reportDate: "2024-12-20",
    submittedAt: "2024-12-20T18:30:00.000Z",
    createdAt: "2024-12-20T17:45:00.000Z",
    updatedAt: "2024-12-20T18:30:00.000Z",
  },
  {
    id: 2,
    userId: 3,
    username: "employee1",
    displayName: "田中太郎",
    title: "バックエンドAPI統合テスト",
    workContent:
      "Spring Boot側のデイリーレポートAPIとの統合テストを実施しました。JWT認証フローが正常に動作し、CORS設定も問題ないことを確認。PostgreSQLとの接続も安定しています。",
    status: "draft",
    reportDate: "2024-12-21",
    submittedAt: undefined,
    createdAt: "2024-12-21T16:20:00.000Z",
    updatedAt: "2024-12-21T16:20:00.000Z",
  },
  {
    id: 3,
    userId: 3,
    username: "employee1",
    displayName: "田中太郎",
    title: "データベース設計レビュー会議",
    workContent:
      "午前中はデータベース設計のレビュー会議に参加しました。users テーブルとdaily_reportsテーブルの関係性、インデックス設計について議論。supervisor_id による階層構造の実装方針を確認しました。午後はpgAdminを使用してテストデータの投入を行い、N+1問題が発生しないようクエリ最適化を実施。パフォーマンステストの結果、想定通りの応答時間を達成できています。",
    status: "submitted",
    reportDate: "2024-12-19",
    submittedAt: "2024-12-19T19:15:00.000Z",
    createdAt: "2024-12-19T17:30:00.000Z",
    updatedAt: "2024-12-19T19:15:00.000Z",
  },
  {
    id: 4,
    userId: 3,
    username: "employee1",
    displayName: "田中太郎",
    title: "Vitest テスト環境改善",
    workContent:
      "テストの安定性向上のため、Vitestの設定を見直しました。非同期処理のタイムアウト問題を解決し、ChakraProviderの統合テストエラーも修正。テストユーティリティを作成して再利用可能にしています。",
    status: "draft",
    reportDate: "2024-12-18",
    submittedAt: undefined,
    createdAt: "2024-12-18T15:45:00.000Z",
    updatedAt: "2024-12-18T17:10:00.000Z",
  },
  {
    id: 5,
    userId: 3,
    username: "employee1",
    displayName: "田中太郎",
    title: "CI/CD パイプライン構築・Docker環境最適化",
    workContent:
      "今週は開発環境の改善に注力しました。GitHub Actions を使用したCI/CDパイプラインを構築し、プルリクエスト時に自動でビルド・テストが実行される仕組みを整備。Docker Compose設定も見直し、frontend、backend、PostgreSQL、pgAdminの統合環境を構築しました。multi-stage buildによるイメージサイズ最適化も実施し、本番デプロイ時間を30%短縮。開発者の生産性向上とデプロイリスク軽減を両立できる環境が完成しました。来週は監視ツールの導入を検討予定です。",
    status: "submitted",
    reportDate: "2024-12-13",
    submittedAt: "2024-12-13T18:00:00.000Z",
    createdAt: "2024-12-13T17:15:00.000Z",
    updatedAt: "2024-12-13T18:00:00.000Z",
  },
  {
    id: 6,
    userId: 3,
    username: "employee1",
    displayName: "田中太郎",
    title: "TypeScript 型安全性強化",
    workContent:
      "プロジェクト全体の型安全性を向上させました。interface から type エイリアスへの移行を完了し、ユニオン型と型合成を活用。ESLintエラーを97%削減（232→3件）し、本番環境でのランタイムエラーを大幅に減らしました。",
    status: "submitted",
    reportDate: "2024-11-20",
    submittedAt: "2024-11-20T17:45:00.000Z",
    createdAt: "2024-11-20T16:30:00.000Z",
    updatedAt: "2024-11-20T17:45:00.000Z",
  },
  {
    id: 7,
    userId: 3,
    username: "employee1",
    displayName: "田中太郎",
    title: "アクセシビリティ対応・WCAG準拠作業",
    workContent:
      "WebアプリケーションのアクセシビリティをWCAG 2.1 AA準拠レベルまで向上させる作業を実施。Spinnerコンポーネントにaria-label属性を追加し、スクリーンリーダー対応を強化。キーボードナビゲーションの改善とカラーコントラスト比の調整も完了。障害者支援技術での動作確認を行い、より多くのユーザーが利用できるインクルーシブな設計を実現しました。",
    status: "submitted",
    reportDate: "2024-12-15",
    submittedAt: "2024-12-15T19:00:00.000Z",
    createdAt: "2024-12-15T17:20:00.000Z",
    updatedAt: "2024-12-15T19:00:00.000Z",
  },
  {
    id: 8,
    userId: 3,
    username: "employee1",
    displayName: "田中太郎",
    title: "今日のタスク整理中...",
    workContent:
      "今日は朝のスタンドアップで確認したタスクをまとめています。まだ作業途中なので後で詳細を記載予定です。",
    status: "draft",
    reportDate: "2024-12-22",
    submittedAt: undefined,
    createdAt: "2024-12-22T09:30:00.000Z",
    updatedAt: "2024-12-22T09:30:00.000Z",
  },
];

// 現在のユーザー情報を取得するヘルパー
const getCurrentUser = (token: string): MockUser | null => {
  if (!token.startsWith("mock-jwt-token-")) {
    return null;
  }
  const parts = token.split("-");
  const userId = parts[3];
  return mockUsers.find((u) => u.id.toString() === userId) || null;
};

// 日報ID生成用カウンター（新規作成時に使用）
let nextReportId = mockDailyReports.length + 1;

// APIの遅延をシミュレート
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    // API呼び出しの遅延をシミュレート
    await delay(800);

    // ユーザー認証をシミュレート
    const user = mockUsers.find((u) => u.username === loginData.username);

    if (!user || loginData.password !== "password") {
      throw new Error("ユーザー名またはパスワードが正しくありません");
    }

    // JWTトークンをシミュレート
    const mockToken = `mock-jwt-token-${user.id}-${Date.now()}`;

    return {
      token: mockToken,
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      displayName: user.username,
    };
  },

  async validateToken(token: string): Promise<boolean> {
    await delay(200);
    // モックトークンの簡単な検証
    return token.startsWith("mock-jwt-token-");
  },

  async getUserInfo(token: string): Promise<UserInfo | null> {
    await delay(200);

    const user = getCurrentUser(token);
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      displayName: user.username,
    };
  },

  /**
   * 日報一覧取得（モック実装）
   * @param token JWT トークン
   * @param params 検索パラメータ
   * @returns 現在ユーザーの日報一覧
   */
  async getDailyReports(
    token: string,
    params?: DailyReportListParams,
  ): Promise<DailyReportResponse[]> {
    await delay(600);

    const user = getCurrentUser(token);
    if (!user) {
      throw new Error("認証が必要です");
    }

    // 現在ユーザーの日報のみ取得
    let userReports = mockDailyReports.filter((report) => report.userId.toString() === user.id);

    // ステータスフィルタリング
    if (params?.status) {
      userReports = userReports.filter((report) => report.status === params.status);
    }

    // 日付フィルタリング（yearMonth形式: YYYY-MM）
    if (params?.yearMonth) {
      const [year, month] = params.yearMonth.split("-");
      userReports = userReports.filter((report) => {
        const reportDate = new Date(report.reportDate);
        return (
          reportDate.getFullYear().toString() === year &&
          (reportDate.getMonth() + 1).toString().padStart(2, "0") === month
        );
      });
    }

    // 作成日時の降順でソート
    userReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // ページネーション（簡易実装）
    if (params?.page !== undefined && params?.size) {
      const startIndex = params.page * params.size;
      const endIndex = startIndex + params.size;
      userReports = userReports.slice(startIndex, endIndex);
    }

    console.log(`📋 モック日報一覧取得成功: ${userReports.length}件`);
    return userReports;
  },

  /**
   * 日報作成（モック実装）
   * @param token JWT トークン
   * @param reportData 作成データ
   * @returns 作成された日報
   */
  async createDailyReport(
    token: string,
    reportData: DailyReportCreateRequest,
  ): Promise<DailyReportResponse> {
    await delay(800);

    const user = getCurrentUser(token);
    if (!user) {
      throw new Error("認証が必要です");
    }

    // 同一日付の日報が既に存在するかチェック
    const existingReport = mockDailyReports.find(
      (report) =>
        report.userId.toString() === user.id && report.reportDate === reportData.reportDate,
    );

    if (existingReport) {
      throw new Error("指定された日付の日報は既に存在します");
    }

    const now = new Date().toISOString();
    const newReport: DailyReportResponse = {
      id: nextReportId++,
      userId: parseInt(user.id),
      username: user.username,
      displayName: user.username,
      title: reportData.title,
      workContent: reportData.workContent,
      status: reportData.status,
      reportDate: reportData.reportDate,
      submittedAt: reportData.status === "submitted" ? now : undefined,
      createdAt: now,
      updatedAt: now,
    };

    // モックデータに追加
    mockDailyReports.push(newReport);

    console.log(`📝 モック日報作成成功: ${newReport.title}`);
    return newReport;
  },

  /**
   * 日報取得（モック実装）
   * @param token JWT トークン
   * @param id 日報ID
   * @returns 日報詳細
   */
  async getDailyReport(token: string, id: number): Promise<DailyReportResponse | null> {
    await delay(400);

    const user = getCurrentUser(token);
    if (!user) {
      throw new Error("認証が必要です");
    }

    const report = mockDailyReports.find((r) => r.id === id && r.userId.toString() === user.id);

    if (!report) {
      console.warn(`📄 モック日報が見つかりません: ${id}`);
      return null;
    }

    console.log(`📖 モック日報取得成功: ${report.title}`);
    return report;
  },

  /**
   * 日報更新（モック実装）
   * @param token JWT トークン
   * @param id 日報ID
   * @param reportData 更新データ
   * @returns 更新された日報
   */
  async updateDailyReport(
    token: string,
    id: number,
    reportData: DailyReportUpdateRequest,
  ): Promise<DailyReportResponse> {
    await delay(700);

    const user = getCurrentUser(token);
    if (!user) {
      throw new Error("認証が必要です");
    }

    const reportIndex = mockDailyReports.findIndex(
      (r) => r.id === id && r.userId.toString() === user.id,
    );

    if (reportIndex === -1) {
      throw new Error("指定された日報が見つかりません");
    }

    // 日付変更時の重複チェック
    if (reportData.reportDate !== mockDailyReports[reportIndex].reportDate) {
      const existingReport = mockDailyReports.find(
        (report) =>
          report.userId.toString() === user.id &&
          report.reportDate === reportData.reportDate &&
          report.id !== id,
      );

      if (existingReport) {
        throw new Error("指定された日付の日報は既に存在します");
      }
    }

    const now = new Date().toISOString();
    const previousStatus = mockDailyReports[reportIndex].status;

    // 日報更新
    mockDailyReports[reportIndex] = {
      ...mockDailyReports[reportIndex],
      title: reportData.title,
      workContent: reportData.workContent,
      status: reportData.status,
      reportDate: reportData.reportDate,
      submittedAt:
        reportData.status === "submitted" && previousStatus === "draft"
          ? now
          : mockDailyReports[reportIndex].submittedAt,
      updatedAt: now,
    };

    const updatedReport = mockDailyReports[reportIndex];
    console.log(`✏️ モック日報更新成功: ${updatedReport.title}`);
    return updatedReport;
  },

  /**
   * 日報削除（モック実装）
   * @param token JWT トークン
   * @param id 日報ID
   */
  async deleteDailyReport(token: string, id: number): Promise<void> {
    await delay(500);

    const user = getCurrentUser(token);
    if (!user) {
      throw new Error("認証が必要です");
    }

    const reportIndex = mockDailyReports.findIndex(
      (r) => r.id === id && r.userId.toString() === user.id,
    );

    if (reportIndex === -1) {
      throw new Error("指定された日報が見つかりません");
    }

    // モックデータから削除
    const deletedReport = mockDailyReports.splice(reportIndex, 1)[0];
    console.log(`🗑️ モック日報削除成功: ${deletedReport.title} (ID: ${id})`);
  },
};
