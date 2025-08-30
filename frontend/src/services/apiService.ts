import { mockApi } from "./mockApi";
import type {
  LoginRequest,
  LoginResponse,
  UserInfo,
  DailyReportCreateRequest,
  DailyReportUpdateRequest,
  DailyReportResponse,
  DailyReportListParams,
} from "../types";

/**
 * APIサービス統合モジュール
 *
 * 機能:
 * - 開発環境でのモックAPI使用
 * - 本番環境での実際のAPI使用
 * - 環境変数による自動切り替え
 * - 型安全なAPIレスポンス処理
 *
 * 使用方法:
 * - 開発: npm run dev (モックAPI)
 * - 開発+実API: npm run dev:api (実際のAPI)
 * - 本番: 常に実際のAPI
 */

// 環境変数から開発モードかどうかを判定
const isDevelopment = import.meta.env.DEV;
const useRealAPI = import.meta.env.VITE_USE_REAL_API === "true";

/**
 * API基底URL設定
 * 環境変数から取得、デフォルトはローカル開発環境
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

/**
 * JWT トークンをローカルストレージから取得
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

/**
 * 共通APIリクエストヘルパー
 */
const createApiRequest = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  // JWT トークンが存在する場合は自動付与
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const requestOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  if (isDevelopment) {
    console.log(`🌐 API リクエスト: ${options.method || "GET"} ${url}`);
  }

  const response = await fetch(url, requestOptions);

  // レスポンスステータスのログ出力
  if (response.ok) {
    if (isDevelopment) {
      console.log(`✅ API成功: ${response.status} ${response.statusText}`);
    }
  } else {
    if (isDevelopment) {
      console.error(`❌ API失敗: ${response.status} ${response.statusText}`);
    }
  }

  return response;
};

/**
 * APIエラーレスポンスの処理
 */
const handleApiError = async (response: Response): Promise<never> => {
  let errorMessage = "APIエラーが発生しました";

  try {
    const errorData = await response.json();
    errorMessage = errorData.message || errorData.error || errorMessage;
  } catch {
    // JSONパースに失敗した場合はステータステキストを使用
    errorMessage = response.statusText || errorMessage;
  }

  // ステータスコード別のエラーメッセージ
  switch (response.status) {
    case 401:
      errorMessage = "認証に失敗しました。ログイン情報を確認してください。";
      break;
    case 403:
      errorMessage = "アクセス権限がありません。";
      break;
    case 404:
      errorMessage = "リクエストされたリソースが見つかりません。";
      break;
    case 500:
      errorMessage = "サーバーエラーが発生しました。しばらく後に再試行してください。";
      break;
  }

  throw new Error(errorMessage);
};

/**
 * 実際のバックエンドAPIとの通信を担当
 */
export const realApi = {
  /**
   * 実際のバックエンドログインAPI呼び出し
   * @param loginData ログイン情報
   * @returns JWT トークンとユーザー情報
   */
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await createApiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();

      // レスポンス型検証
      if (!data.token || !data.username) {
        throw new Error("ログインレスポンスの形式が正しくありません");
      }

      if (isDevelopment) {
        console.log("🔐 ログイン成功:", data.username);
      }
      return data;
    } catch (error) {
      console.error("🚨 ログインエラー:", error);
      throw error;
    }
  },

  /**
   * JWT トークンの有効性検証
   * @param token JWT トークン
   * @returns トークンが有効かどうか
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await createApiRequest("/api/auth/validate", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const isValid = response.ok;
      if (isDevelopment) {
        console.log(`🔍 トークン検証結果: ${isValid ? "有効" : "無効"}`);
      }
      return isValid;
    } catch (error) {
      console.error("🚨 トークン検証エラー:", error);
      return false;
    }
  },

  /**
   * ユーザー情報取得
   * @param token JWT トークン
   * @returns ユーザー情報
   */
  async getUserInfo(token: string): Promise<UserInfo | null> {
    try {
      const response = await createApiRequest("/api/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const userInfo = await response.json();
      if (isDevelopment) {
        console.log("👤 ユーザー情報取得成功:", userInfo.username);
      }
      return userInfo;
    } catch (error) {
      console.error("🚨 ユーザー情報取得エラー:", error);
      return null;
    }
  },

  /**
   * 日報作成
   * @param reportData 日報作成データ
   * @returns 作成された日報
   */
  async createDailyReport(reportData: DailyReportCreateRequest): Promise<DailyReportResponse> {
    try {
      const response = await createApiRequest("/api/daily-reports", {
        method: "POST",
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      if (isDevelopment) {
        console.log("📝 日報作成成功:", data.title);
      }
      return data;
    } catch (error) {
      console.error("🚨 日報作成エラー:", error);
      throw error;
    }
  },

  /**
   * 日報更新
   * @param id 日報ID
   * @param reportData 日報更新データ
   * @returns 更新された日報
   */
  async updateDailyReport(
    id: number,
    reportData: DailyReportUpdateRequest,
  ): Promise<DailyReportResponse> {
    try {
      const response = await createApiRequest(`/api/daily-reports/${id}`, {
        method: "PUT",
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      if (isDevelopment) {
        console.log("✏️ 日報更新成功:", data.title);
      }
      return data;
    } catch (error) {
      console.error("🚨 日報更新エラー:", error);
      throw error;
    }
  },

  /**
   * 日報取得（詳細）
   * @param id 日報ID
   * @returns 日報詳細
   */
  async getDailyReport(id: number): Promise<DailyReportResponse | null> {
    try {
      const response = await createApiRequest(`/api/daily-reports/${id}`, {
        method: "GET",
      });

      if (!response.ok) {
        if (response.status === 404) {
          if (isDevelopment) {
            console.warn("📄 日報が見つかりません:", id);
          }
          return null;
        }
        await handleApiError(response);
      }

      const data = await response.json();
      if (isDevelopment) {
        console.log("📖 日報取得成功:", data.title);
      }
      return data;
    } catch (error) {
      console.error("🚨 日報取得エラー:", error);
      return null;
    }
  },

  /**
   * 日報一覧取得
   * @param params 検索パラメータ
   * @returns 日報一覧
   */
  async getDailyReports(params?: DailyReportListParams): Promise<DailyReportResponse[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.page !== undefined) searchParams.append("page", params.page.toString());
      if (params?.size !== undefined) searchParams.append("size", params.size.toString());
      if (params?.status) searchParams.append("status", params.status);
      if (params?.yearMonth) searchParams.append("yearMonth", params.yearMonth);

      const url = `/api/daily-reports/my${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
      console.log(url);
      const response = await createApiRequest(url, {
        method: "GET",
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      if (isDevelopment) {
        console.log("📋 日報一覧取得成功:", data.length, "件");
      }
      return data;
    } catch (error) {
      console.error("🚨 日報一覧取得エラー:", error);
      throw error;
    }
  },

  /**
   * 日報削除
   * @param id 日報ID
   */
  async deleteDailyReport(id: number): Promise<void> {
    try {
      const response = await createApiRequest(`/api/daily-reports/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      if (isDevelopment) {
        console.log("🗑️ 日報削除成功:", id);
      }
    } catch (error) {
      console.error("🚨 日報削除エラー:", error);
      throw error;
    }
  },
};

/**
 * フロントエンドアプリケーションのメインAPIサービス
 * 環境に応じてモックAPIまたは実際のAPIを使用
 */
export const apiService = {
  /**
   * ユーザーログイン
   * @param loginData ログイン情報
   * @returns JWT トークンとユーザー情報
   */
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    // 開発環境でかつ実際のAPIを使用しない場合はモックを使用
    if (isDevelopment && !useRealAPI) {
      if (isDevelopment) {
        console.log("🔧 開発モード: モックAPIを使用中");
      }
      return mockApi.login(loginData);
    }

    if (isDevelopment) {
      console.log("🌐 実際のAPIを使用中");
    }
    return realApi.login(loginData);
  },

  /**
   * JWT トークンの有効性検証
   * @param token JWT トークン
   * @returns トークンが有効かどうか
   */
  async validateToken(token: string): Promise<boolean> {
    if (isDevelopment && !useRealAPI) {
      return mockApi.validateToken(token);
    }

    return realApi.validateToken(token);
  },

  /**
   * ユーザー情報取得
   * @param token JWT トークン
   * @returns ユーザー情報
   */
  async getUserInfo(token: string): Promise<UserInfo | null> {
    if (isDevelopment && !useRealAPI) {
      return mockApi.getUserInfo(token);
    }

    return realApi.getUserInfo(token);
  },

  /**
   * JWT トークンをlocalStorageに保存
   * @param token JWT トークン
   */
  setAuthToken(token: string): void {
    localStorage.setItem("authToken", token);
    if (isDevelopment) {
      console.log("💾 JWT トークンが保存されました");
    }
  },

  /**
   * JWT トークンをlocalStorageから取得
   * @returns JWT トークン
   */
  getAuthToken(): string | null {
    return localStorage.getItem("authToken");
  },

  /**
   * JWT トークンをlocalStorageから削除
   */
  removeAuthToken(): void {
    localStorage.removeItem("authToken");
    if (isDevelopment) {
      console.log("🗑️ JWT トークンが削除されました");
    }
  },

  /**
   * 日報作成
   * @param reportData 日報作成データ
   * @returns 作成された日報
   */
  async createDailyReport(reportData: DailyReportCreateRequest): Promise<DailyReportResponse> {
    if (isDevelopment && !useRealAPI) {
      // TODO: モックAPIに日報作成メソッドを追加
      throw new Error("モック日報作成機能は未実装です");
    }

    return realApi.createDailyReport(reportData);
  },

  /**
   * 日報更新
   * @param id 日報ID
   * @param reportData 日報更新データ
   * @returns 更新された日報
   */
  async updateDailyReport(
    id: number,
    reportData: DailyReportUpdateRequest,
  ): Promise<DailyReportResponse> {
    if (isDevelopment && !useRealAPI) {
      // TODO: モックAPIに日報更新メソッドを追加
      throw new Error("モック日報更新機能は未実装です");
    }

    return realApi.updateDailyReport(id, reportData);
  },

  /**
   * 日報取得（詳細）
   * @param id 日報ID
   * @returns 日報詳細
   */
  async getDailyReport(id: number): Promise<DailyReportResponse | null> {
    if (isDevelopment && !useRealAPI) {
      // TODO: モックAPIに日報取得メソッドを追加
      throw new Error("モック日報取得機能は未実装です");
    }

    return realApi.getDailyReport(id);
  },

  /**
   * 日報一覧取得
   * @param params 検索パラメータ
   * @returns 日報一覧
   */
  async getDailyReports(params?: DailyReportListParams): Promise<DailyReportResponse[]> {
    if (isDevelopment && !useRealAPI) {
      // TODO: モックAPIに日報一覧メソッドを追加
      throw new Error("モック日報一覧機能は未実装です");
    }

    return realApi.getDailyReports(params);
  },

  /**
   * 日報削除
   * @param id 日報ID
   */
  async deleteDailyReport(id: number): Promise<void> {
    if (isDevelopment && !useRealAPI) {
      // TODO: モックAPIに日報削除メソッドを追加
      throw new Error("モック日報削除機能は未実装です");
    }

    return realApi.deleteDailyReport(id);
  },
};
