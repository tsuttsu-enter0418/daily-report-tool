/**
 * useDailyReports custom hook test file
 *
 * Features:
 * - Daily report data management hook tests
 * - CRUD operations testing (Create, Read, Update, Delete)
 * - Loading state and error handling tests
 * - API integration with mock testing
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useDailyReports } from "../useDailyReports";
import type {
  DailyReportResponse,
  DailyReportCreateRequest,
  DailyReportUpdateRequest,
} from "../../types";

// Mock API service
vi.mock("../../services/apiService");

// Mock useErrorHandler hook
vi.mock("../useErrorHandler");

describe("useDailyReports", () => {
  let mockApiService: any;
  let mockHandleError: ReturnType<typeof vi.fn>;
  let mockShowSuccess: ReturnType<typeof vi.fn>;

  // Sample test data
  const sampleReport: DailyReportResponse = {
    id: 1,
    title: "Daily Report 2025-01-15",
    workContent: "Implemented React testing",
    status: "submitted",
    reportDate: "2025-01-15",
    submittedAt: "2025-01-15T10:00:00Z",
    userId: 1,
    username: "test-user",
    createdAt: "2025-01-15T09:00:00Z",
    updatedAt: "2025-01-15T09:30:00Z",
  };

  const sampleCreateRequest: DailyReportCreateRequest = {
    title: "New Daily Report",
    workContent: "Testing implementation",
    status: "submitted",
    reportDate: "2025-01-16",
  };

  const sampleUpdateRequest: DailyReportUpdateRequest = {
    title: "Updated Daily Report",
    workContent: "Updated testing implementation",
    status: "submitted",
    reportDate: "2025-01-16",
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup API service mocks
    const apiServiceModule = await import("../../services/apiService");
    mockApiService = {
      getDailyReports: vi.fn(),
      createDailyReport: vi.fn(),
      updateDailyReport: vi.fn(),
      deleteDailyReport: vi.fn(),
      getDailyReport: vi.fn(),
    };
    Object.assign(apiServiceModule.apiService, mockApiService);

    // Setup error handler mocks
    mockHandleError = vi.fn();
    mockShowSuccess = vi.fn();
    vi.mocked(await import("../useErrorHandler")).useErrorHandler.mockReturnValue({
      handleApiError: vi.fn(),
      handleNetworkError: vi.fn(),
      handleValidationError: vi.fn(),
      handleError: mockHandleError,
      showSuccess: mockShowSuccess,
      showInfo: vi.fn(),
    });
  });

  describe("initialization", () => {
    it("initializes with empty reports and loading false when autoFetch is false", () => {
      // Arrange & Act: Create hook with autoFetch disabled
      const { result } = renderHook(() => useDailyReports(undefined, false));

      // Assert: Initial state is correct
      expect(result.current.reports).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.refetch).toBe("function");
      expect(typeof result.current.createReport).toBe("function");
      expect(typeof result.current.updateReport).toBe("function");
      expect(typeof result.current.deleteReport).toBe("function");
      expect(typeof result.current.getReport).toBe("function");
    });

    it("automatically fetches data when autoFetch is true", async () => {
      // Arrange: Setup successful API response
      mockApiService.getDailyReports.mockResolvedValue([sampleReport]);

      // Act: Create hook with autoFetch enabled
      const { result } = renderHook(() => useDailyReports());

      // Wait for API call to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Data is fetched and loaded
      expect(mockApiService.getDailyReports).toHaveBeenCalledTimes(1);
      expect(result.current.reports).toEqual([sampleReport]);
      expect(result.current.error).toBeNull();
    });
  });

  describe("fetchReports (refetch)", () => {
    it("successfully fetches and loads reports", async () => {
      // Arrange: Setup successful API response
      const reports = [sampleReport];
      mockApiService.getDailyReports.mockResolvedValue(reports);

      const { result } = renderHook(() => useDailyReports(undefined, false));

      // Act: Fetch reports
      await act(async () => {
        await result.current.refetch();
      });

      // Assert: Reports are loaded correctly
      expect(result.current.reports).toEqual(reports);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockApiService.getDailyReports).toHaveBeenCalledTimes(1);
    });

    it("handles fetch error correctly", async () => {
      // Arrange: Setup API error
      const error = new Error("API Error");
      mockApiService.getDailyReports.mockRejectedValue(error);

      const { result } = renderHook(() => useDailyReports(undefined, false));

      // Act: Attempt to fetch reports
      await act(async () => {
        await result.current.refetch();
      });

      // Assert: Error is handled correctly
      expect(result.current.reports).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe("API Error");
      expect(mockHandleError).toHaveBeenCalledWith(error, "日報一覧取得");
    });

    it("sets loading state during fetch", async () => {
      // Arrange: Setup delayed API response
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockApiService.getDailyReports.mockReturnValue(promise);

      const { result } = renderHook(() => useDailyReports(undefined, false));

      // Act: Start fetch
      act(() => {
        result.current.refetch();
      });

      // Assert: Loading state is true during fetch
      expect(result.current.isLoading).toBe(true);

      // Complete the promise
      act(() => {
        resolvePromise([sampleReport]);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("createReport", () => {
    it("successfully creates a new report", async () => {
      // Arrange: Setup successful API response
      mockApiService.createDailyReport.mockResolvedValue(sampleReport);

      const { result } = renderHook(() => useDailyReports(undefined, false));

      // Act: Create report
      let createdReport: DailyReportResponse | null = null;
      await act(async () => {
        createdReport = await result.current.createReport(sampleCreateRequest);
      });

      // Assert: Report is created and added to list
      expect(createdReport).toEqual(sampleReport);
      expect(result.current.reports).toEqual([sampleReport]);
      expect(mockApiService.createDailyReport).toHaveBeenCalledWith(sampleCreateRequest);
      expect(mockShowSuccess).toHaveBeenCalledWith("日報が正常に作成されました");
    });

    it("handles creation error correctly", async () => {
      // Arrange: Setup API error
      const error = new Error("Creation failed");
      mockApiService.createDailyReport.mockRejectedValue(error);

      const { result } = renderHook(() => useDailyReports(undefined, false));

      // Act: Attempt to create report
      let createdReport: DailyReportResponse | null = null;
      await act(async () => {
        createdReport = await result.current.createReport(sampleCreateRequest);
      });

      // Assert: Error is handled, null is returned
      expect(createdReport).toBeNull();
      expect(result.current.reports).toEqual([]);
      expect(mockHandleError).toHaveBeenCalledWith(error, "日報作成");
    });
  });

  describe("updateReport", () => {
    it("successfully updates an existing report", async () => {
      // Arrange: Setup initial data and successful update
      const initialReports = [sampleReport];
      const updatedReport = { ...sampleReport, title: "Updated Title" };
      mockApiService.updateDailyReport.mockResolvedValue(updatedReport);

      const { result } = renderHook(() => useDailyReports(undefined, false));

      // Set initial reports
      act(() => {
        result.current.reports.push(...initialReports);
      });

      // Act: Update report
      let updateResult: DailyReportResponse | null = null;
      await act(async () => {
        updateResult = await result.current.updateReport(1, sampleUpdateRequest);
      });

      // Assert: Report is updated in the list
      expect(updateResult).toEqual(updatedReport);
      expect(mockApiService.updateDailyReport).toHaveBeenCalledWith(1, sampleUpdateRequest);
      expect(mockShowSuccess).toHaveBeenCalledWith("日報が正常に更新されました");
    });

    it("handles update error correctly", async () => {
      // Arrange: Setup API error
      const error = new Error("Update failed");
      mockApiService.updateDailyReport.mockRejectedValue(error);

      const { result } = renderHook(() => useDailyReports(undefined, false));

      // Act: Attempt to update report
      let updateResult: DailyReportResponse | null = null;
      await act(async () => {
        updateResult = await result.current.updateReport(1, sampleUpdateRequest);
      });

      // Assert: Error is handled, null is returned
      expect(updateResult).toBeNull();
      expect(mockHandleError).toHaveBeenCalledWith(error, "日報更新");
    });
  });

  describe("deleteReport", () => {
    it("successfully deletes a report", async () => {
      // Arrange: Setup initial data and successful deletion
      mockApiService.deleteDailyReport.mockResolvedValue(undefined);

      const { result } = renderHook(() => useDailyReports(undefined, false));

      // Manually set initial state with a report
      act(() => {
        result.current.reports.length = 0;
        result.current.reports.push(sampleReport);
      });

      // Act: Delete report
      let deleteResult: boolean = false;
      await act(async () => {
        deleteResult = await result.current.deleteReport(1);
      });

      // Assert: Report is deleted successfully
      expect(deleteResult).toBe(true);
      expect(mockApiService.deleteDailyReport).toHaveBeenCalledWith(1);
      expect(mockShowSuccess).toHaveBeenCalledWith("日報が正常に削除されました");
    });

    it("handles deletion error correctly", async () => {
      // Arrange: Setup API error
      const error = new Error("Deletion failed");
      mockApiService.deleteDailyReport.mockRejectedValue(error);

      const { result } = renderHook(() => useDailyReports(undefined, false));

      // Act: Attempt to delete report
      let deleteResult: boolean = true;
      await act(async () => {
        deleteResult = await result.current.deleteReport(1);
      });

      // Assert: Error is handled, false is returned
      expect(deleteResult).toBe(false);
      expect(mockHandleError).toHaveBeenCalledWith(error, "日報削除");
    });
  });

  describe("getReport", () => {
    it("successfully retrieves a single report", async () => {
      // Arrange: Setup successful API response
      mockApiService.getDailyReport.mockResolvedValue(sampleReport);

      const { result } = renderHook(() => useDailyReports(undefined, false));

      // Act: Get single report
      let retrievedReport: DailyReportResponse | null = null;
      await act(async () => {
        retrievedReport = await result.current.getReport(1);
      });

      // Assert: Report is retrieved correctly
      expect(retrievedReport).toEqual(sampleReport);
      expect(mockApiService.getDailyReport).toHaveBeenCalledWith(1);
    });

    it("handles get report error correctly", async () => {
      // Arrange: Setup API error
      const error = new Error("Retrieval failed");
      mockApiService.getDailyReport.mockRejectedValue(error);

      const { result } = renderHook(() => useDailyReports(undefined, false));

      // Act: Attempt to get report
      let retrievedReport: DailyReportResponse | null = undefined as any;
      await act(async () => {
        retrievedReport = await result.current.getReport(1);
      });

      // Assert: Error is handled, null is returned
      expect(retrievedReport).toBeNull();
      expect(mockHandleError).toHaveBeenCalledWith(error, "日報詳細取得");
    });

    it("handles case when report is not found", async () => {
      // Arrange: Setup API response with null
      mockApiService.getDailyReport.mockResolvedValue(null);

      const { result } = renderHook(() => useDailyReports(undefined, false));

      // Act: Get non-existent report
      let retrievedReport: DailyReportResponse | null = undefined as any;
      await act(async () => {
        retrievedReport = await result.current.getReport(999);
      });

      // Assert: Null is returned for non-existent report
      expect(retrievedReport).toBeNull();
      expect(mockApiService.getDailyReport).toHaveBeenCalledWith(999);
    });
  });

  describe("edge cases", () => {
    it("handles multiple simultaneous operations correctly", async () => {
      // Arrange: Setup different API responses
      mockApiService.getDailyReports.mockResolvedValue([sampleReport]);
      mockApiService.createDailyReport.mockResolvedValue({
        ...sampleReport,
        id: 2,
      });

      const { result } = renderHook(() => useDailyReports(undefined, false));

      // Act: Perform multiple operations simultaneously
      await act(async () => {
        await Promise.all([
          result.current.refetch(),
          result.current.createReport(sampleCreateRequest),
        ]);
      });

      // Assert: All operations complete successfully
      expect(mockApiService.getDailyReports).toHaveBeenCalled();
      expect(mockApiService.createDailyReport).toHaveBeenCalled();
      expect(result.current.reports.length).toBeGreaterThan(0);
    });

    it("maintains data integrity after multiple operations", async () => {
      // Arrange: Setup successful operations
      mockApiService.createDailyReport.mockResolvedValue(sampleReport);
      mockApiService.updateDailyReport.mockResolvedValue({
        ...sampleReport,
        title: "Updated",
      });
      mockApiService.deleteDailyReport.mockResolvedValue(undefined);

      const { result } = renderHook(() => useDailyReports(undefined, false));

      // Act: Perform create, update, delete sequence
      await act(async () => {
        await result.current.createReport(sampleCreateRequest);
      });

      await act(async () => {
        await result.current.updateReport(1, sampleUpdateRequest);
      });

      await act(async () => {
        await result.current.deleteReport(1);
      });

      // Assert: Operations maintain data integrity
      expect(mockApiService.createDailyReport).toHaveBeenCalled();
      expect(mockApiService.updateDailyReport).toHaveBeenCalled();
      expect(mockApiService.deleteDailyReport).toHaveBeenCalled();
    });
  });
});
