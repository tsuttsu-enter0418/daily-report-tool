package com.example.dailyreport.unit.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import com.example.dailyreport.config.TestConfig;
import com.example.dailyreport.dto.DailyReportListResponse;
import com.example.dailyreport.dto.DailyReportRequest;
import com.example.dailyreport.dto.DailyReportResponse;
import com.example.dailyreport.entity.DailyReport;
import com.example.dailyreport.entity.User;
import com.example.dailyreport.repository.DailyReportRepository;
import com.example.dailyreport.repository.UserRepository;
import com.example.dailyreport.service.DailyReportService;

/**
 * DailyReportServiceクラスのユニットテスト
 *
 * <p>テスト対象: - CRUD操作（作成・取得・更新・削除） - 権限制御（本人・上司のみアクセス） - ビジネスルール（1日1件制限等）
 * - バリデーション処理 - ステータス管理（下書き・提出済み） - エラーハンドリング
 *
 * <p>テスト方針: - Mockitoによる依存関係のモック化 - 正常系・異常系の網羅的テスト - 権限制御ロジックの詳細テスト - エッジケース対応の確認
 */
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("DailyReportService - 日報ビジネスロジック")
class DailyReportServiceTest {

    @Mock private DailyReportRepository dailyReportRepository;

    @Mock private UserRepository userRepository;

    @InjectMocks private DailyReportService dailyReportService;

    private User testUser;
    private User supervisorUser;
    private User otherUser;
    private DailyReport testDailyReport;
    private DailyReportRequest validRequest;

    @BeforeEach
    void setUp() {
        // テストユーザー作成
        testUser =
                User.builder()
                        .id(1L)
                        .username(TestConfig.TestConstants.EMPLOYEE_USERNAME)
                        .email(TestConfig.TestConstants.EMPLOYEE_EMAIL)
                        .role(TestConfig.TestConstants.EMPLOYEE_ROLE)
                        .displayName("田中太郎")
                        .supervisorId(2L)
                        .isActive(true)
                        .build();

        // 上司ユーザー作成
        supervisorUser =
                User.builder()
                        .id(2L)
                        .username(TestConfig.TestConstants.MANAGER_USERNAME)
                        .email(TestConfig.TestConstants.MANAGER_EMAIL)
                        .role(TestConfig.TestConstants.MANAGER_ROLE)
                        .displayName("佐藤課長")
                        .isActive(true)
                        .build();

        // 他のユーザー作成
        otherUser =
                User.builder()
                        .id(3L)
                        .username("other_user")
                        .email("other@company.com")
                        .role(TestConfig.TestConstants.EMPLOYEE_ROLE)
                        .displayName("山田次郎")
                        .supervisorId(4L)
                        .isActive(true)
                        .build();

        // テスト日報作成
        testDailyReport =
                DailyReport.builder()
                        .id(1L)
                        .userId(testUser.getId())
                        .title(TestConfig.TestConstants.TEST_REPORT_TITLE)
                        .workContent(TestConfig.TestConstants.TEST_REPORT_CONTENT)
                        .status(TestConfig.TestConstants.STATUS_DRAFT)
                        .reportDate(LocalDate.now())
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();

        // 有効なリクエスト作成
        validRequest =
                DailyReportRequest.builder()
                        .title(TestConfig.TestConstants.TEST_REPORT_TITLE)
                        .workContent(TestConfig.TestConstants.TEST_REPORT_CONTENT)
                        .status(TestConfig.TestConstants.STATUS_DRAFT)
                        .reportDate(LocalDate.now())
                        .build();
    }

    @Nested
    @DisplayName("日報作成機能")
    class CreateDailyReportTests {

        @Test
        @DisplayName("正常: 有効なリクエストで日報作成成功")
        void createDailyReport_ValidRequest_ShouldReturnCreatedReport() {
            // Given
            when(dailyReportRepository.existsByUserIdAndReportDate(
                            testUser.getId(), validRequest.getReportDate()))
                    .thenReturn(false);
            when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
            when(dailyReportRepository.save(any(DailyReport.class))).thenReturn(testDailyReport);

            // When
            DailyReportResponse result =
                    dailyReportService.createDailyReport(testUser.getId(), validRequest);

            // Then
            assertNotNull(result, "作成された日報レスポンスがnullではない");
            assertEquals(testDailyReport.getId(), result.getId());
            assertEquals(testDailyReport.getTitle(), result.getTitle());
            assertEquals(testDailyReport.getWorkContent(), result.getWorkContent());
            assertEquals(testUser.getUsername(), result.getUsername());

            verify(dailyReportRepository).existsByUserIdAndReportDate(
                    testUser.getId(), validRequest.getReportDate());
            verify(userRepository).findById(testUser.getId());
            verify(dailyReportRepository).save(any(DailyReport.class));
        }

        @Test
        @DisplayName("正常: 提出済みステータスで日報作成")
        void createDailyReport_SubmittedStatus_ShouldSetSubmittedAt() {
            // Given
            validRequest.setStatus(TestConfig.TestConstants.STATUS_SUBMITTED);
            DailyReport submittedReport =
                    DailyReport.builder()
                            .id(1L)
                            .userId(testUser.getId())
                            .title(validRequest.getTitle())
                            .workContent(validRequest.getWorkContent())
                            .status(TestConfig.TestConstants.STATUS_SUBMITTED)
                            .reportDate(validRequest.getReportDate())
                            .submittedAt(LocalDateTime.now())
                            .build();

            when(dailyReportRepository.existsByUserIdAndReportDate(any(), any())).thenReturn(false);
            when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
            when(dailyReportRepository.save(any(DailyReport.class))).thenReturn(submittedReport);

            // When
            DailyReportResponse result =
                    dailyReportService.createDailyReport(testUser.getId(), validRequest);

            // Then
            assertNotNull(result);
            assertEquals(TestConfig.TestConstants.STATUS_SUBMITTED, result.getStatus());
            assertNotNull(result.getSubmittedAt(), "提出済みの場合、提出日時が設定される");
        }

        @Test
        @DisplayName("異常: 1日1件制限違反で例外発生")
        void createDailyReport_DuplicateDate_ShouldThrowException() {
            // Given
            when(dailyReportRepository.existsByUserIdAndReportDate(
                            testUser.getId(), validRequest.getReportDate()))
                    .thenReturn(true);

            // When & Then
            IllegalArgumentException exception =
                    assertThrows(
                            IllegalArgumentException.class,
                            () -> dailyReportService.createDailyReport(testUser.getId(), validRequest),
                            "1日1件制限違反でIllegalArgumentException例外が発生");

            assertEquals("指定日の日報は既に存在します", exception.getMessage());
            verify(dailyReportRepository, never()).save(any());
        }

        @Test
        @DisplayName("異常: 存在しないユーザーで例外発生")
        void createDailyReport_UserNotFound_ShouldThrowException() {
            // Given
            when(dailyReportRepository.existsByUserIdAndReportDate(any(), any())).thenReturn(false);
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            // When & Then
            IllegalArgumentException exception =
                    assertThrows(
                            IllegalArgumentException.class,
                            () -> dailyReportService.createDailyReport(999L, validRequest),
                            "存在しないユーザーでIllegalArgumentException例外が発生");

            assertEquals("ユーザーが見つかりません", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("日報更新機能")
    class UpdateDailyReportTests {

        @Test
        @DisplayName("正常: 本人による日報更新成功")
        void updateDailyReport_OwnerUpdate_ShouldReturnUpdatedReport() {
            // Given
            DailyReportRequest updateRequest =
                    DailyReportRequest.builder()
                            .title("更新されたタイトル")
                            .workContent(TestConfig.TestConstants.UPDATED_REPORT_CONTENT)
                            .status(TestConfig.TestConstants.STATUS_SUBMITTED)
                            .reportDate(LocalDate.now())
                            .build();

            DailyReport updatedReport =
                    DailyReport.builder()
                            .id(testDailyReport.getId())
                            .userId(testDailyReport.getUserId())
                            .title(updateRequest.getTitle())
                            .workContent(updateRequest.getWorkContent())
                            .status(updateRequest.getStatus())
                            .reportDate(testDailyReport.getReportDate())
                            .submittedAt(LocalDateTime.now())
                            .createdAt(testDailyReport.getCreatedAt())
                            .updatedAt(LocalDateTime.now())
                            .build();

            when(dailyReportRepository.findById(testDailyReport.getId()))
                    .thenReturn(Optional.of(testDailyReport));
            when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
            when(dailyReportRepository.save(any(DailyReport.class))).thenReturn(updatedReport);

            // When
            DailyReportResponse result =
                    dailyReportService.updateDailyReport(
                            testDailyReport.getId(), testUser.getId(), updateRequest);

            // Then
            assertNotNull(result);
            assertEquals(updateRequest.getTitle(), result.getTitle());
            assertEquals(updateRequest.getWorkContent(), result.getWorkContent());
            assertEquals(TestConfig.TestConstants.STATUS_SUBMITTED, result.getStatus());
            assertNotNull(result.getSubmittedAt(), "提出済み変更時、提出日時が設定される");
        }

        @Test
        @DisplayName("正常: 提出済みから下書きに戻す更新")
        void updateDailyReport_SubmittedToDraft_ShouldClearSubmittedAt() {
            // Given
            testDailyReport.setStatus(TestConfig.TestConstants.STATUS_SUBMITTED);
            testDailyReport.setSubmittedAt(LocalDateTime.now());

            DailyReportRequest updateRequest =
                    DailyReportRequest.builder()
                            .title(validRequest.getTitle())
                            .workContent(validRequest.getWorkContent())
                            .reportDate(validRequest.getReportDate())
                            .status(TestConfig.TestConstants.STATUS_DRAFT)
                            .build();

            when(dailyReportRepository.findById(testDailyReport.getId()))
                    .thenReturn(Optional.of(testDailyReport));
            when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
            when(dailyReportRepository.save(any(DailyReport.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            // When
            DailyReportResponse result =
                    dailyReportService.updateDailyReport(
                            testDailyReport.getId(), testUser.getId(), updateRequest);

            // Then
            assertNotNull(result);
            assertEquals(TestConfig.TestConstants.STATUS_DRAFT, result.getStatus());
            assertNull(result.getSubmittedAt(), "下書きに戻した場合、提出日時がクリアされる");
        }

        @Test
        @DisplayName("異常: 権限のないユーザーによる更新で例外発生")
        void updateDailyReport_UnauthorizedUser_ShouldThrowException() {
            // Given
            when(dailyReportRepository.findById(testDailyReport.getId()))
                    .thenReturn(Optional.of(testDailyReport));

            // When & Then
            IllegalArgumentException exception =
                    assertThrows(
                            IllegalArgumentException.class,
                            () ->
                                    dailyReportService.updateDailyReport(
                                            testDailyReport.getId(), otherUser.getId(), validRequest),
                            "権限のないユーザーでIllegalArgumentException例外が発生");

            assertEquals("権限がありません", exception.getMessage());
            verify(dailyReportRepository, never()).save(any());
        }

        @Test
        @DisplayName("異常: 存在しない日報の更新で例外発生")
        void updateDailyReport_ReportNotFound_ShouldThrowException() {
            // Given
            when(dailyReportRepository.findById(999L)).thenReturn(Optional.empty());

            // When & Then
            IllegalArgumentException exception =
                    assertThrows(
                            IllegalArgumentException.class,
                            () -> dailyReportService.updateDailyReport(999L, testUser.getId(), validRequest),
                            "存在しない日報でIllegalArgumentException例外が発生");

            assertEquals("日報が見つかりません", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("日報取得機能")
    class GetDailyReportTests {

        @Test
        @DisplayName("正常: 本人による日報詳細取得成功")
        void getDailyReportById_OwnerAccess_ShouldReturnReport() {
            // Given
            when(dailyReportRepository.findById(testDailyReport.getId()))
                    .thenReturn(Optional.of(testDailyReport));
            when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));

            // When
            Optional<DailyReportResponse> result =
                    dailyReportService.getDailyReportById(testDailyReport.getId(), testUser.getId());

            // Then
            assertTrue(result.isPresent(), "本人による日報詳細取得が成功");
            assertEquals(testDailyReport.getId(), result.get().getId());
            assertEquals(testUser.getUsername(), result.get().getUsername());
        }

        @Test
        @DisplayName("正常: 上司による部下日報詳細取得成功")
        void getDailyReportById_SupervisorAccess_ShouldReturnReport() {
            // Given
            when(dailyReportRepository.findById(testDailyReport.getId()))
                    .thenReturn(Optional.of(testDailyReport));
            when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));

            // When
            Optional<DailyReportResponse> result =
                    dailyReportService.getDailyReportById(
                            testDailyReport.getId(), supervisorUser.getId());

            // Then
            assertTrue(result.isPresent(), "上司による部下日報詳細取得が成功");
            assertEquals(testDailyReport.getId(), result.get().getId());
        }

        @Test
        @DisplayName("異常: 権限のないユーザーによる取得は空を返却")
        void getDailyReportById_UnauthorizedAccess_ShouldReturnEmpty() {
            // Given
            when(dailyReportRepository.findById(testDailyReport.getId()))
                    .thenReturn(Optional.of(testDailyReport));
            when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));

            // When
            Optional<DailyReportResponse> result =
                    dailyReportService.getDailyReportById(testDailyReport.getId(), otherUser.getId());

            // Then
            assertTrue(result.isEmpty(), "権限のないユーザーによる取得は空を返却");
        }

        @Test
        @DisplayName("異常: 存在しない日報の取得は空を返却")
        void getDailyReportById_ReportNotFound_ShouldReturnEmpty() {
            // Given
            when(dailyReportRepository.findById(999L)).thenReturn(Optional.empty());

            // When
            Optional<DailyReportResponse> result =
                    dailyReportService.getDailyReportById(999L, testUser.getId());

            // Then
            assertTrue(result.isEmpty(), "存在しない日報の取得は空を返却");
        }
    }

    @Nested
    @DisplayName("自分の日報一覧取得機能")
    class GetMyDailyReportsTests {

        @Test
        @DisplayName("正常: ステータス指定なしで全日報取得")
        void getMyDailyReports_NoStatusFilter_ShouldReturnAllReports() {
            // Given
            List<DailyReport> reports = Arrays.asList(testDailyReport);
            when(dailyReportRepository.findByUserIdOrderByReportDateDesc(testUser.getId()))
                    .thenReturn(reports);
            when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));

            // When
            List<DailyReportListResponse> result =
                    dailyReportService.getMyDailyReports(testUser.getId(), null);

            // Then
            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals(testDailyReport.getId(), result.get(0).getId());
            assertEquals(testUser.getUsername(), result.get(0).getUsername());
        }

        @Test
        @DisplayName("正常: ステータス指定で絞り込み取得")
        void getMyDailyReports_WithStatusFilter_ShouldReturnFilteredReports() {
            // Given
            List<DailyReport> draftReports = Arrays.asList(testDailyReport);
            when(dailyReportRepository.findByUserIdAndStatusOrderByReportDateDesc(
                            testUser.getId(), TestConfig.TestConstants.STATUS_DRAFT))
                    .thenReturn(draftReports);
            when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));

            // When
            List<DailyReportListResponse> result =
                    dailyReportService.getMyDailyReports(
                            testUser.getId(), TestConfig.TestConstants.STATUS_DRAFT);

            // Then
            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals(TestConfig.TestConstants.STATUS_DRAFT, result.get(0).getStatus());
        }

        @Test
        @DisplayName("正常: 空のステータス指定で全日報取得")
        void getMyDailyReports_EmptyStatusFilter_ShouldReturnAllReports() {
            // Given
            List<DailyReport> reports = Arrays.asList(testDailyReport);
            when(dailyReportRepository.findByUserIdOrderByReportDateDesc(testUser.getId()))
                    .thenReturn(reports);
            when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));

            // When
            List<DailyReportListResponse> result =
                    dailyReportService.getMyDailyReports(testUser.getId(), "  ");

            // Then
            assertNotNull(result);
            assertEquals(1, result.size());
        }

        @Test
        @DisplayName("正常: 作業内容プレビューの100文字制限")
        void getMyDailyReports_LongContent_ShouldTruncatePreview() {
            // Given
            String longContent = TestConfig.TestUtils.generateLongString(150);
            testDailyReport.setWorkContent(longContent);

            List<DailyReport> reports = Arrays.asList(testDailyReport);
            when(dailyReportRepository.findByUserIdOrderByReportDateDesc(testUser.getId()))
                    .thenReturn(reports);
            when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));

            // When
            List<DailyReportListResponse> result =
                    dailyReportService.getMyDailyReports(testUser.getId(), null);

            // Then
            assertNotNull(result);
            assertEquals(1, result.size());
            String preview = result.get(0).getWorkContent();
            assertTrue(preview.length() <= 103, "プレビューが100文字+...で制限される"); // 100文字 + "..."
            assertTrue(preview.endsWith("..."), "長いコンテンツは...で省略される");
        }
    }

    @Nested
    @DisplayName("部下日報一覧取得機能")
    class GetSubordinateReportsTests {

        @Test
        @DisplayName("正常: 上司による部下日報一覧取得成功")
        void getSubordinateReports_ValidSupervisor_ShouldReturnSubordinateReports() {
            // Given
            List<User> subordinates = Arrays.asList(testUser);
            List<DailyReport> reports = Arrays.asList(testDailyReport);

            when(userRepository.findBySupervisorId(supervisorUser.getId()))
                    .thenReturn(subordinates);
            when(dailyReportRepository.findByUserIdInOrderByReportDateDescUserIdAsc(
                            Arrays.asList(testUser.getId())))
                    .thenReturn(reports);

            // When
            List<DailyReportListResponse> result =
                    dailyReportService.getSubordinateReports(supervisorUser.getId(), null);

            // Then
            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals(testDailyReport.getId(), result.get(0).getId());
            assertEquals(testUser.getUsername(), result.get(0).getUsername());
        }

        @Test
        @DisplayName("正常: ステータス指定で部下日報絞り込み")
        void getSubordinateReports_WithStatusFilter_ShouldReturnFilteredReports() {
            // Given
            List<User> subordinates = Arrays.asList(testUser);
            List<DailyReport> draftReports = Arrays.asList(testDailyReport);

            when(userRepository.findBySupervisorId(supervisorUser.getId()))
                    .thenReturn(subordinates);
            when(dailyReportRepository.findByUserIdInAndStatusOrderByReportDateDescUserIdAsc(
                            Arrays.asList(testUser.getId()), TestConfig.TestConstants.STATUS_DRAFT))
                    .thenReturn(draftReports);

            // When
            List<DailyReportListResponse> result =
                    dailyReportService.getSubordinateReports(
                            supervisorUser.getId(), TestConfig.TestConstants.STATUS_DRAFT);

            // Then
            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals(TestConfig.TestConstants.STATUS_DRAFT, result.get(0).getStatus());
        }

        @Test
        @DisplayName("正常: 部下がいない場合は空リストを返却")
        void getSubordinateReports_NoSubordinates_ShouldReturnEmptyList() {
            // Given
            when(userRepository.findBySupervisorId(supervisorUser.getId()))
                    .thenReturn(Collections.emptyList());

            // When
            List<DailyReportListResponse> result =
                    dailyReportService.getSubordinateReports(supervisorUser.getId(), null);

            // Then
            assertNotNull(result);
            assertTrue(result.isEmpty(), "部下がいない場合は空リストを返却");
            verify(dailyReportRepository, never()).findByUserIdInOrderByReportDateDescUserIdAsc(any());
        }
    }

    @Nested
    @DisplayName("日報削除機能")
    class DeleteDailyReportTests {

        @Test
        @DisplayName("正常: 本人による日報削除成功")
        void deleteDailyReport_OwnerDelete_ShouldDeleteSuccessfully() {
            // Given
            when(dailyReportRepository.findById(testDailyReport.getId()))
                    .thenReturn(Optional.of(testDailyReport));
            doNothing().when(dailyReportRepository).delete(testDailyReport);

            // When
            assertDoesNotThrow(
                    () ->
                            dailyReportService.deleteDailyReport(
                                    testDailyReport.getId(), testUser.getId()),
                    "本人による日報削除が例外なく実行される");

            // Then
            verify(dailyReportRepository).findById(testDailyReport.getId());
            verify(dailyReportRepository).delete(testDailyReport);
        }

        @Test
        @DisplayName("異常: 権限のないユーザーによる削除で例外発生")
        void deleteDailyReport_UnauthorizedUser_ShouldThrowException() {
            // Given
            when(dailyReportRepository.findById(testDailyReport.getId()))
                    .thenReturn(Optional.of(testDailyReport));

            // When & Then
            IllegalArgumentException exception =
                    assertThrows(
                            IllegalArgumentException.class,
                            () ->
                                    dailyReportService.deleteDailyReport(
                                            testDailyReport.getId(), otherUser.getId()),
                            "権限のないユーザーでIllegalArgumentException例外が発生");

            assertEquals("権限がありません", exception.getMessage());
            verify(dailyReportRepository, never()).delete(any());
        }

        @Test
        @DisplayName("異常: 存在しない日報の削除で例外発生")
        void deleteDailyReport_ReportNotFound_ShouldThrowException() {
            // Given
            when(dailyReportRepository.findById(999L)).thenReturn(Optional.empty());

            // When & Then
            IllegalArgumentException exception =
                    assertThrows(
                            IllegalArgumentException.class,
                            () -> dailyReportService.deleteDailyReport(999L, testUser.getId()),
                            "存在しない日報でIllegalArgumentException例外が発生");

            assertEquals("日報が見つかりません", exception.getMessage());
            verify(dailyReportRepository, never()).delete(any());
        }
    }

    @Nested
    @DisplayName("本日日報存在チェック機能")
    class HasTodayReportTests {

        @Test
        @DisplayName("正常: 本日の日報が存在する場合trueを返却")
        void hasTodayReport_ReportExists_ShouldReturnTrue() {
            // Given
            when(dailyReportRepository.existsByUserIdAndReportDate(testUser.getId(), LocalDate.now()))
                    .thenReturn(true);

            // When
            boolean result = dailyReportService.hasTodayReport(testUser.getId());

            // Then
            assertTrue(result, "本日の日報が存在する場合trueを返却");
        }

        @Test
        @DisplayName("正常: 本日の日報が存在しない場合falseを返却")
        void hasTodayReport_ReportNotExists_ShouldReturnFalse() {
            // Given
            when(dailyReportRepository.existsByUserIdAndReportDate(testUser.getId(), LocalDate.now()))
                    .thenReturn(false);

            // When
            boolean result = dailyReportService.hasTodayReport(testUser.getId());

            // Then
            assertFalse(result, "本日の日報が存在しない場合falseを返却");
        }
    }

    @Nested
    @DisplayName("エッジケース・統合テスト")
    class EdgeCaseAndIntegrationTests {

        @Test
        @DisplayName("統合: 日報作成から削除までの完全フロー")
        void completeReportLifecycle_ShouldWorkCorrectly() {
            // Given: 作成フェーズ
            when(dailyReportRepository.existsByUserIdAndReportDate(any(), any())).thenReturn(false);
            when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
            when(dailyReportRepository.save(any(DailyReport.class))).thenReturn(testDailyReport);

            // When: 作成
            DailyReportResponse created =
                    dailyReportService.createDailyReport(testUser.getId(), validRequest);

            // Then: 作成確認
            assertNotNull(created);
            assertEquals(validRequest.getTitle(), created.getTitle());

            // Given: 更新フェーズ
            DailyReportRequest updateRequest =
                    DailyReportRequest.builder()
                            .title("更新されたタイトル")
                            .workContent(validRequest.getWorkContent())
                            .reportDate(validRequest.getReportDate())
                            .status(TestConfig.TestConstants.STATUS_SUBMITTED)
                            .build();
            when(dailyReportRepository.findById(testDailyReport.getId()))
                    .thenReturn(Optional.of(testDailyReport));

            // When: 更新
            DailyReportResponse updated =
                    dailyReportService.updateDailyReport(
                            testDailyReport.getId(), testUser.getId(), updateRequest);

            // Then: 更新確認
            assertNotNull(updated);
            assertEquals("更新されたタイトル", updated.getTitle());

            // When: 削除
            assertDoesNotThrow(
                    () ->
                            dailyReportService.deleteDailyReport(
                                    testDailyReport.getId(), testUser.getId()));

            // Then: 各操作が適切に実行された確認
            verify(dailyReportRepository, times(2)).save(any(DailyReport.class));
            verify(dailyReportRepository).delete(testDailyReport);
        }

        @Test
        @DisplayName("境界値: ユーザー情報がnullの場合の安全な処理")
        void convertToResponse_NullUser_ShouldHandleGracefully() {
            // Given
            when(dailyReportRepository.findById(testDailyReport.getId()))
                    .thenReturn(Optional.of(testDailyReport));
            when(userRepository.findById(testUser.getId())).thenReturn(Optional.empty());

            // When
            Optional<DailyReportResponse> result =
                    dailyReportService.getDailyReportById(testDailyReport.getId(), testUser.getId());

            // Then
            assertTrue(result.isPresent(), "ユーザー情報なしでも日報は取得できる");
            assertNull(result.get().getUsername(), "ユーザー名はnullで安全に処理される");
            assertNull(result.get().getDisplayName(), "表示名はnullで安全に処理される");
        }

        @Test
        @DisplayName("セキュリティ: 権限チェック機能の包括的テスト")
        void accessControl_ComprehensiveTest_ShouldWorkCorrectly() {
            // Given
            when(dailyReportRepository.findById(testDailyReport.getId()))
                    .thenReturn(Optional.of(testDailyReport));
            when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));

            // When & Then: 本人アクセス
            Optional<DailyReportResponse> ownerResult =
                    dailyReportService.getDailyReportById(testDailyReport.getId(), testUser.getId());
            assertTrue(ownerResult.isPresent(), "本人はアクセス可能");

            // When & Then: 上司アクセス
            Optional<DailyReportResponse> supervisorResult =
                    dailyReportService.getDailyReportById(
                            testDailyReport.getId(), supervisorUser.getId());
            assertTrue(supervisorResult.isPresent(), "上司はアクセス可能");

            // When & Then: 他人アクセス
            Optional<DailyReportResponse> otherResult =
                    dailyReportService.getDailyReportById(testDailyReport.getId(), otherUser.getId());
            assertTrue(otherResult.isEmpty(), "関係ないユーザーはアクセス不可");
        }
    }
}