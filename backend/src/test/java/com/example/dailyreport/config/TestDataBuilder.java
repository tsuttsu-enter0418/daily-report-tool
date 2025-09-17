package com.example.dailyreport.config;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.dailyreport.dto.DailyReportRequest;
import com.example.dailyreport.dto.LoginRequest;
import com.example.dailyreport.entity.DailyReport;
import com.example.dailyreport.entity.User;

/**
 * テストデータ生成用ビルダークラス
 *
 * <p>
 * 機能: - 各種エンティティのテストデータ生成 
 * - DTO・リクエストオブジェクトのテストデータ生成 
 * - ビルダーパターンによる柔軟なデータ設定 
 * - デフォルト値設定によるシンプルなテストデータ作成
 *
 * <p>
 * 使用例:
 * ```java // デフォルトユーザー作成 User user = TestDataBuilder.createDefaultUser().build();
 *
 * <p>
 * // カスタムユーザー作成 User manager = TestDataBuilder.createDefaultUser() .username("manager") .role("上長")
 * .build(); ```
 *
 * <p>
 * 設計方針: 
 * - 実際のプロダクションデータに近い形式 
 * - テストケース間での一貫性保持 
 * - 日本語データ対応 
 * - バリデーション制約を考慮した値設定
 */
public class TestDataBuilder {

    /**
     * デフォルトユーザーのビルダーを作成
     *
     * @return User.UserBuilder<?, ?> デフォルト値が設定されたユーザービルダー
     */
    public static User.UserBuilder<?, ?> createDefaultUser() {
        return User.builder().id(1L).username("testuser").email("test@company.com")
                .password(TestConfig.TestConstants.TEST_PASSWORD_ENCODED).role("部下")
                .displayName("テストユーザー").supervisorId(null).isActive(true)
                .createdAt(LocalDateTime.parse("2024-01-01T10:00:00"))
                .updatedAt(LocalDateTime.parse("2024-01-01T10:00:00"));
    }

    /**
     * 管理者ユーザーのビルダーを作成
     *
     * @return User.UserBuilder<?, ?> 管理者設定のユーザービルダー
     */
    public static User.UserBuilder<?, ?> createAdminUser() {
        return User.builder().id(1L).username(TestConfig.TestConstants.ADMIN_USERNAME)
                .email(TestConfig.TestConstants.ADMIN_EMAIL)
                .password(TestConfig.TestConstants.TEST_PASSWORD_ENCODED)
                .role(TestConfig.TestConstants.ADMIN_ROLE).displayName("管理者太郎").supervisorId(null)
                .isActive(true).createdAt(LocalDateTime.parse("2024-01-01T09:00:00"))
                .updatedAt(LocalDateTime.parse("2024-01-01T09:00:00"));
    }

    /**
     * 上長ユーザーのビルダーを作成
     *
     * @return User.UserBuilder<?, ?> 上長設定のユーザービルダー
     */
    public static User.UserBuilder<?, ?> createManagerUser() {
        return User.builder().id(2L).username(TestConfig.TestConstants.MANAGER_USERNAME)
                .email(TestConfig.TestConstants.MANAGER_EMAIL)
                .password(TestConfig.TestConstants.TEST_PASSWORD_ENCODED)
                .role(TestConfig.TestConstants.MANAGER_ROLE).displayName("田中上長").supervisorId(1L) // 管理者の下
                .isActive(true).createdAt(LocalDateTime.parse("2024-01-01T09:30:00"))
                .updatedAt(LocalDateTime.parse("2024-01-01T09:30:00"));
    }

    /**
     * 部下ユーザーのビルダーを作成
     *
     * @return User.UserBuilder<?, ?> 部下設定のユーザービルダー
     */
    public static User.UserBuilder<?, ?> createEmployeeUser() {
        return User.builder().id(4L).username(TestConfig.TestConstants.EMPLOYEE_USERNAME)
                .email(TestConfig.TestConstants.EMPLOYEE_EMAIL)
                .password(TestConfig.TestConstants.TEST_PASSWORD_ENCODED)
                .role(TestConfig.TestConstants.EMPLOYEE_ROLE).displayName("山田一郎").supervisorId(2L) // 上長の下
                .isActive(true).createdAt(LocalDateTime.parse("2024-01-01T10:00:00"))
                .updatedAt(LocalDateTime.parse("2024-01-01T10:00:00"));
    }

    /**
     * デフォルト日報のビルダーを作成
     *
     * @return DailyReport.DailyReportBuilder<?, ?> デフォルト値が設定された日報ビルダー
     */
    public static DailyReport.DailyReportBuilder<?, ?> createDefaultDailyReport() {
        return DailyReport.builder().id(1L).userId(4L) // employee1のID
                .title(TestConfig.TestConstants.TEST_REPORT_TITLE)
                .workContent(TestConfig.TestConstants.TEST_REPORT_CONTENT)
                .status(TestConfig.TestConstants.STATUS_DRAFT)
                .reportDate(LocalDate.parse("2024-01-15")).submittedAt(null)
                .createdAt(LocalDateTime.parse("2024-01-15T10:00:00"))
                .updatedAt(LocalDateTime.parse("2024-01-15T10:00:00"));
    }

    /**
     * 提出済み日報のビルダーを作成
     *
     * @return DailyReport.DailyReportBuilder<?, ?> 提出済み設定の日報ビルダー
     */
    public static DailyReport.DailyReportBuilder<?, ?> createSubmittedDailyReport() {
        return DailyReport.builder().id(2L).userId(4L).title("提出済み日報")
                .workContent("今日の作業を完了しました。明日は新しいタスクに取り組みます。")
                .status(TestConfig.TestConstants.STATUS_SUBMITTED)
                .reportDate(LocalDate.parse("2024-01-14"))
                .submittedAt(LocalDateTime.parse("2024-01-14T18:00:00"))
                .createdAt(LocalDateTime.parse("2024-01-14T17:30:00"))
                .updatedAt(LocalDateTime.parse("2024-01-14T18:00:00"));
    }

    /**
     * デフォルトログインリクエストを作成
     *
     * @return LoginRequest デフォルト値のログインリクエスト
     */
    public static LoginRequest createDefaultLoginRequest() {
        return new LoginRequest(TestConfig.TestConstants.EMPLOYEE_USERNAME,
                TestConfig.TestConstants.TEST_PASSWORD);
    }

    /**
     * 管理者ログインリクエストを作成
     *
     * @return LoginRequest 管理者ログインリクエスト
     */
    public static LoginRequest createAdminLoginRequest() {
        return new LoginRequest(TestConfig.TestConstants.ADMIN_USERNAME,
                TestConfig.TestConstants.TEST_PASSWORD);
    }

    /**
     * 無効なログインリクエストを作成
     *
     * @return LoginRequest 無効なログインリクエスト
     */
    public static LoginRequest createInvalidLoginRequest() {
        return new LoginRequest(TestConfig.TestConstants.INVALID_USERNAME,
                TestConfig.TestConstants.INVALID_PASSWORD);
    }

    /**
     * 日報作成リクエストのビルダーを作成
     *
     * @return DailyReportRequest.DailyReportRequestBuilder デフォルト値の日報リクエストビルダー
     */
    public static DailyReportRequest.DailyReportRequestBuilder createDefaultDailyReportRequest() {
        return DailyReportRequest.builder().title(TestConfig.TestConstants.TEST_REPORT_TITLE)
                .workContent(TestConfig.TestConstants.TEST_REPORT_CONTENT)
                .reportDate(LocalDate.parse("2024-01-15"))
                .status(TestConfig.TestConstants.STATUS_DRAFT);
    }

    /**
     * 更新用日報リクエストのビルダーを作成
     *
     * @return DailyReportRequest.DailyReportRequestBuilder 更新用の日報リクエストビルダー
     */
    public static DailyReportRequest.DailyReportRequestBuilder createUpdateDailyReportRequest() {
        return DailyReportRequest.builder().title("更新されたタイトル")
                .workContent(TestConfig.TestConstants.UPDATED_REPORT_CONTENT)
                .reportDate(LocalDate.parse("2024-01-15"))
                .status(TestConfig.TestConstants.STATUS_DRAFT);
    }

    /**
     * バリデーションエラー用日報リクエストのビルダーを作成 （タイトルが長すぎる、内容が空など）
     *
     * @return DailyReportRequest.DailyReportRequestBuilder バリデーションエラー用リクエストビルダー
     */
    public static DailyReportRequest.DailyReportRequestBuilder createInvalidDailyReportRequest() {
        return DailyReportRequest.builder().title(TestConfig.TestUtils.generateLongString(250)) // 制限超過
                .workContent("") // 空文字
                .reportDate(null) // null日付
                .status("invalid-status"); // 無効なステータス
    }
}
