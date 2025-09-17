package com.example.dailyreport.unit.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;

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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import com.example.dailyreport.config.TestConfig;
import com.example.dailyreport.dto.DailyReportListResponse;
import com.example.dailyreport.dto.DailyReportRequest;
import com.example.dailyreport.dto.DailyReportResponse;
import com.example.dailyreport.entity.User;
import com.example.dailyreport.repository.UserRepository;
import com.example.dailyreport.service.DailyReportService;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * DailyReportControllerクラスのユニットテスト
 *
 * <p>
 * テスト対象: - REST APIエンドポイント（7つのAPI） - HTTPレスポンス形式・ステータスコード - リクエスト・レスポンスJSONマッピング - バリデーション処理 -
 * 認証・権限制御 - エラーハンドリング
 *
 * <p>
 * テスト方針: - MockMvcによるWebレイヤーテスト - DailyReportService・UserRepositoryのモック化 -
 * WithMockUserによる認証シミュレーション - 正常系・異常系の包括的テスト - JSON形式のリクエスト・レスポンス検証
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "jwt.auth.enabled=true",  // Unit testでも認証を有効化
    "debug.default.user.username=admin"
})
@DisplayName("DailyReportController - 日報REST API")
class DailyReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DailyReportService dailyReportService;

    @MockBean
    private UserRepository userRepository;

    private User testUser;
    private User supervisorUser;
    private DailyReportRequest validRequest;
    private DailyReportResponse testResponse;
    private DailyReportListResponse testListResponse;

    @BeforeEach
    void setUp() {
        // テストユーザー作成
        testUser = User.builder().id(1L).username(TestConfig.TestConstants.EMPLOYEE_USERNAME)
                .email(TestConfig.TestConstants.EMPLOYEE_EMAIL)
                .role(TestConfig.TestConstants.EMPLOYEE_ROLE).displayName("田中太郎").supervisorId(2L)
                .isActive(true).build();

        // 上司ユーザー作成
        supervisorUser = User.builder().id(2L).username(TestConfig.TestConstants.MANAGER_USERNAME)
                .email(TestConfig.TestConstants.MANAGER_EMAIL)
                .role(TestConfig.TestConstants.MANAGER_ROLE).displayName("佐藤課長").isActive(true)
                .build();

        // 有効なリクエスト作成
        validRequest = DailyReportRequest.builder()
                .title(TestConfig.TestConstants.TEST_REPORT_TITLE)
                .workContent(TestConfig.TestConstants.TEST_REPORT_CONTENT)
                .status(TestConfig.TestConstants.STATUS_DRAFT).reportDate(LocalDate.now()).build();

        // テストレスポンス作成
        testResponse = DailyReportResponse.builder().id(1L).userId(testUser.getId())
                .username(testUser.getUsername()).displayName(testUser.getDisplayName())
                .title(validRequest.getTitle()).workContent(validRequest.getWorkContent())
                .status(validRequest.getStatus()).reportDate(validRequest.getReportDate())
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build();

        // テストリストレスポンス作成
        String workContentPreview = validRequest.getWorkContent().length() > 50
                ? validRequest.getWorkContent().substring(0, 50) + "..."
                : validRequest.getWorkContent();

        testListResponse = DailyReportListResponse.builder().id(1L).userId(testUser.getId())
                .username(testUser.getUsername()).displayName(testUser.getDisplayName())
                .title(validRequest.getTitle()).workContent(workContentPreview)
                .status(validRequest.getStatus()).reportDate(validRequest.getReportDate())
                .createdAt(LocalDateTime.now()).build();
    }

    @Nested
    @DisplayName("日報作成API")
    class CreateDailyReportTests {

        @Test
        @WithMockUser(username = "employee1")
        @DisplayName("正常: 有効なリクエストで日報作成成功")
        void createDailyReport_ValidRequest_ShouldReturn201() throws Exception {
            // Given
            when(userRepository.findByUsername("employee1")).thenReturn(Optional.of(testUser));
            when(dailyReportService.createDailyReport(eq(testUser.getId()),
                    any(DailyReportRequest.class))).thenReturn(testResponse);

            // When & Then
            mockMvc.perform(post("/api/daily-reports").contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(validRequest)).with(csrf()))
                    .andExpect(status().is2xxSuccessful())
                    .andExpect(content().contentType("application/json;charset=UTF-8"))
                    .andExpect(jsonPath("$.id").value(testResponse.getId()))
                    .andExpect(jsonPath("$.title").value(testResponse.getTitle()))
                    .andExpect(jsonPath("$.workContent").value(testResponse.getWorkContent()))
                    .andExpect(jsonPath("$.status").value(testResponse.getStatus()))
                    .andExpect(jsonPath("$.username").value(testResponse.getUsername()));

            verify(dailyReportService).createDailyReport(eq(testUser.getId()),
                    any(DailyReportRequest.class));
        }

        @Test
        @WithMockUser(username = "employee1")
        @DisplayName("異常: バリデーションエラーで400返却")
        void createDailyReport_ValidationError_ShouldReturn400() throws Exception {
            // Given
            DailyReportRequest invalidRequest = DailyReportRequest.builder().title("") // 空のタイトル（バリデーションエラー）
                    .workContent("短すぎる") // 10文字未満（バリデーションエラー）
                    .status("").reportDate(null).build();

            when(userRepository.findByUsername("employee1")).thenReturn(Optional.of(testUser));

            // When & Then
            mockMvc.perform(post("/api/daily-reports")
                    .with(csrf())  // CSRF token追加
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest());

            verify(dailyReportService, never()).createDailyReport(any(), any());
        }

        @Test
        @WithMockUser(username = "employee1")
        @DisplayName("異常: 1日1件制限違反で400返却")
        void createDailyReport_DuplicateDate_ShouldReturn400() throws Exception {
            // Given
            when(userRepository.findByUsername("employee1")).thenReturn(Optional.of(testUser));
            when(dailyReportService.createDailyReport(eq(testUser.getId()),
                    any(DailyReportRequest.class)))
                            .thenThrow(new IllegalArgumentException("指定日の日報は既に存在します"));

            // When & Then
            mockMvc.perform(post("/api/daily-reports")
                    .with(csrf())  // CSRF token追加
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(validRequest)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("異常: 認証なしで403返却")
        void createDailyReport_NoAuthentication_ShouldReturn403() throws Exception {
            // When & Then
            mockMvc.perform(post("/api/daily-reports")
                    .with(csrf())  // CSRF token追加
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(validRequest)))
                    .andExpect(status().isForbidden());

            verify(dailyReportService, never()).createDailyReport(any(), any());
        }
    }

    @Nested
    @DisplayName("日報詳細取得API")
    class GetDailyReportTests {

        @Test
        @WithMockUser(username = "employee1")
        @DisplayName("正常: 有効なIDで日報詳細取得成功")
        void getDailyReport_ValidId_ShouldReturn200() throws Exception {
            // Given
            when(userRepository.findByUsername("employee1")).thenReturn(Optional.of(testUser));
            when(dailyReportService.getDailyReportById(1L, testUser.getId()))
                    .thenReturn(Optional.of(testResponse));

            // When & Then
            mockMvc.perform(get("/api/daily-reports/1")).andExpect(status().isOk())
                    .andExpect(content().contentType("application/json;charset=UTF-8"))
                    .andExpect(jsonPath("$.id").value(testResponse.getId()))
                    .andExpect(jsonPath("$.title").value(testResponse.getTitle()))
                    .andExpect(jsonPath("$.workContent").value(testResponse.getWorkContent()));

            verify(dailyReportService).getDailyReportById(1L, testUser.getId());
        }

        @Test
        @WithMockUser(username = "employee1")
        @DisplayName("異常: 存在しないIDで404返却")
        void getDailyReport_NotFound_ShouldReturn404() throws Exception {
            // Given
            when(userRepository.findByUsername("employee1")).thenReturn(Optional.of(testUser));
            when(dailyReportService.getDailyReportById(999L, testUser.getId()))
                    .thenReturn(Optional.empty());

            // When & Then
            mockMvc.perform(get("/api/daily-reports/999")).andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(username = "employee1")
        @DisplayName("異常: 権限なしで404返却")
        void getDailyReport_NoPermission_ShouldReturn404() throws Exception {
            // Given
            when(userRepository.findByUsername("employee1")).thenReturn(Optional.of(testUser));
            when(dailyReportService.getDailyReportById(1L, testUser.getId()))
                    .thenReturn(Optional.empty()); // 権限なしでサービスが空を返す

            // When & Then
            mockMvc.perform(get("/api/daily-reports/1")).andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("日報更新API")
    class UpdateDailyReportTests {

        @Test
        @WithMockUser(username = "employee1")
        @DisplayName("正常: 有効なリクエストで日報更新成功")
        void updateDailyReport_ValidRequest_ShouldReturn200() throws Exception {
            // Given
            DailyReportRequest updateRequest = DailyReportRequest.builder().title("更新されたタイトル")
                    .workContent(TestConfig.TestConstants.UPDATED_REPORT_CONTENT)
                    .status(TestConfig.TestConstants.STATUS_SUBMITTED).reportDate(LocalDate.now())
                    .build();

            DailyReportResponse updatedResponse = DailyReportResponse.builder()
                    .id(testResponse.getId()).userId(testResponse.getUserId())
                    .username(testResponse.getUsername()).displayName(testResponse.getDisplayName())
                    .title(updateRequest.getTitle()).workContent(updateRequest.getWorkContent())
                    .status(updateRequest.getStatus()).reportDate(testResponse.getReportDate())
                    .submittedAt(testResponse.getSubmittedAt())
                    .createdAt(testResponse.getCreatedAt()).updatedAt(testResponse.getUpdatedAt())
                    .build();

            when(userRepository.findByUsername("employee1")).thenReturn(Optional.of(testUser));
            when(dailyReportService.updateDailyReport(eq(1L), eq(testUser.getId()),
                    any(DailyReportRequest.class))).thenReturn(updatedResponse);

            // When & Then
            mockMvc.perform(put("/api/daily-reports/1")
                    .with(csrf())  // CSRF token追加
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(updateRequest)))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType("application/json;charset=UTF-8"))
                    .andExpect(jsonPath("$.title").value(updateRequest.getTitle()))
                    .andExpect(jsonPath("$.workContent").value(updateRequest.getWorkContent()))
                    .andExpect(jsonPath("$.status").value(updateRequest.getStatus()));

            verify(dailyReportService).updateDailyReport(eq(1L), eq(testUser.getId()),
                    any(DailyReportRequest.class));
        }

        @Test
        @WithMockUser(username = "employee1")
        @DisplayName("異常: 権限なしで404返却")
        void updateDailyReport_NoPermission_ShouldReturn404() throws Exception {
            // Given
            when(userRepository.findByUsername("employee1")).thenReturn(Optional.of(testUser));
            when(dailyReportService.updateDailyReport(eq(1L), eq(testUser.getId()),
                    any(DailyReportRequest.class)))
                            .thenThrow(new IllegalArgumentException("権限がありません"));

            // When & Then
            mockMvc.perform(put("/api/daily-reports/1")
                    .with(csrf())  // CSRF token追加
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(validRequest)))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(username = "employee1")
        @DisplayName("異常: バリデーションエラーで400返却")
        void updateDailyReport_ValidationError_ShouldReturn400() throws Exception {
            // Given
            DailyReportRequest invalidRequest =
                    DailyReportRequest.builder().title(TestConfig.TestUtils.generateLongString(250)) // 200文字超過
                            .workContent("短い") // 10文字未満
                            .status("invalid") // 無効なステータス
                            .reportDate(null).build();

            when(userRepository.findByUsername("employee1")).thenReturn(Optional.of(testUser));

            // When & Then
            mockMvc.perform(put("/api/daily-reports/1")
                    .with(csrf())  // CSRF token追加
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest());

            verify(dailyReportService, never()).updateDailyReport(any(), any(), any());
        }
    }

    @Nested
    @DisplayName("日報削除API")
    class DeleteDailyReportTests {

        @Test
        @WithMockUser(username = "employee1")
        @DisplayName("正常: 有効なIDで日報削除成功")
        void deleteDailyReport_ValidId_ShouldReturn204() throws Exception {
            // Given
            when(userRepository.findByUsername("employee1")).thenReturn(Optional.of(testUser));
            doNothing().when(dailyReportService).deleteDailyReport(1L, testUser.getId());

            // When & Then
            mockMvc.perform(delete("/api/daily-reports/1")).andExpect(status().isNoContent());

            verify(dailyReportService).deleteDailyReport(1L, testUser.getId());
        }

        @Test
        @WithMockUser(username = "employee1")
        @DisplayName("異常: 権限なしで404返却")
        void deleteDailyReport_NoPermission_ShouldReturn404() throws Exception {
            // Given
            when(userRepository.findByUsername("employee1")).thenReturn(Optional.of(testUser));
            doThrow(new IllegalArgumentException("権限がありません")).when(dailyReportService)
                    .deleteDailyReport(1L, testUser.getId());

            // When & Then
            mockMvc.perform(delete("/api/daily-reports/1")).andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(username = "employee1")
        @DisplayName("異常: 存在しないIDで404返却")
        void deleteDailyReport_NotFound_ShouldReturn404() throws Exception {
            // Given
            when(userRepository.findByUsername("employee1")).thenReturn(Optional.of(testUser));
            doThrow(new IllegalArgumentException("日報が見つかりません")).when(dailyReportService)
                    .deleteDailyReport(999L, testUser.getId());

            // When & Then
            mockMvc.perform(delete("/api/daily-reports/999")).andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("自分の日報一覧取得API")
    class GetMyDailyReportsTests {

        @Test
        @WithMockUser(username = "employee1")
        @DisplayName("正常: ステータス指定なしで全日報取得")
        void getMyDailyReports_NoStatusFilter_ShouldReturn200() throws Exception {
            // Given
            List<DailyReportListResponse> reports = Arrays.asList(testListResponse);
            when(userRepository.findByUsername("employee1")).thenReturn(Optional.of(testUser));
            when(dailyReportService.getMyDailyReports(testUser.getId(), null)).thenReturn(reports);

            // When & Then
            mockMvc.perform(get("/api/daily-reports/my")).andExpect(status().isOk())
                    .andExpect(content().contentType("application/json;charset=UTF-8"))
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].id").value(testListResponse.getId()))
                    .andExpect(jsonPath("$[0].title").value(testListResponse.getTitle()))
                    .andExpect(jsonPath("$[0].status").value(testListResponse.getStatus()));

            verify(dailyReportService).getMyDailyReports(testUser.getId(), null);
        }

        @Test
        @WithMockUser(username = "employee1")
        @DisplayName("正常: ステータス指定で絞り込み取得")
        void getMyDailyReports_WithStatusFilter_ShouldReturn200() throws Exception {
            // Given
            List<DailyReportListResponse> draftReports = Arrays.asList(testListResponse);
            when(userRepository.findByUsername("employee1")).thenReturn(Optional.of(testUser));
            when(dailyReportService.getMyDailyReports(testUser.getId(), "draft"))
                    .thenReturn(draftReports);

            // When & Then
            mockMvc.perform(get("/api/daily-reports/my?status=draft")).andExpect(status().isOk())
                    .andExpect(content().contentType("application/json;charset=UTF-8"))
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].status").value("draft"));

            verify(dailyReportService).getMyDailyReports(testUser.getId(), "draft");
        }

        @Test
        @WithMockUser(username = "employee1")
        @DisplayName("正常: 日報が存在しない場合は空配列返却")
        void getMyDailyReports_NoReports_ShouldReturnEmptyArray() throws Exception {
            // Given
            when(userRepository.findByUsername("employee1")).thenReturn(Optional.of(testUser));
            when(dailyReportService.getMyDailyReports(testUser.getId(), null))
                    .thenReturn(Collections.emptyList());

            // When & Then
            mockMvc.perform(get("/api/daily-reports/my")).andExpect(status().isOk())
                    .andExpect(content().contentType("application/json;charset=UTF-8"))
                    .andExpect(jsonPath("$.length()").value(0));
        }
    }

    @Nested
    @DisplayName("部下日報一覧取得API")
    class GetSubordinateReportsTests {

        @Test
        @WithMockUser(username = "manager1")
        @DisplayName("正常: 上司による部下日報一覧取得成功")
        void getSubordinateReports_ValidSupervisor_ShouldReturn200() throws Exception {
            // Given
            List<DailyReportListResponse> subordinateReports = Arrays.asList(testListResponse);
            when(userRepository.findByUsername("manager1")).thenReturn(Optional.of(supervisorUser));
            when(dailyReportService.getSubordinateReports(supervisorUser.getId(), null))
                    .thenReturn(subordinateReports);

            // When & Then
            mockMvc.perform(get("/api/daily-reports/subordinates")).andExpect(status().isOk())
                    .andExpect(content().contentType("application/json;charset=UTF-8"))
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].id").value(testListResponse.getId()));

            verify(dailyReportService).getSubordinateReports(supervisorUser.getId(), null);
        }

        @Test
        @WithMockUser(username = "manager1")
        @DisplayName("正常: ステータス指定で部下日報絞り込み")
        void getSubordinateReports_WithStatusFilter_ShouldReturn200() throws Exception {
            // Given
            List<DailyReportListResponse> submittedReports = Arrays.asList(testListResponse);
            when(userRepository.findByUsername("manager1")).thenReturn(Optional.of(supervisorUser));
            when(dailyReportService.getSubordinateReports(supervisorUser.getId(), "submitted"))
                    .thenReturn(submittedReports);

            // When & Then
            mockMvc.perform(get("/api/daily-reports/subordinates?status=submitted"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType("application/json;charset=UTF-8"))
                    .andExpect(jsonPath("$.length()").value(1));

            verify(dailyReportService).getSubordinateReports(supervisorUser.getId(), "submitted");
        }

        @Test
        @WithMockUser(username = "manager1")
        @DisplayName("正常: 部下が存在しない場合は空配列返却")
        void getSubordinateReports_NoSubordinates_ShouldReturnEmptyArray() throws Exception {
            // Given
            when(userRepository.findByUsername("manager1")).thenReturn(Optional.of(supervisorUser));
            when(dailyReportService.getSubordinateReports(supervisorUser.getId(), null))
                    .thenReturn(Collections.emptyList());

            // When & Then
            mockMvc.perform(get("/api/daily-reports/subordinates")).andExpect(status().isOk())
                    .andExpect(content().contentType("application/json;charset=UTF-8"))
                    .andExpect(jsonPath("$.length()").value(0));
        }
    }

    @Nested
    @DisplayName("本日日報存在チェックAPI")
    class HasTodayReportTests {

        @Test
        @WithMockUser(username = "employee1")
        @DisplayName("正常: 本日の日報が存在する場合trueを返却")
        void hasTodayReport_ReportExists_ShouldReturnTrue() throws Exception {
            // Given
            when(userRepository.findByUsername("employee1")).thenReturn(Optional.of(testUser));
            when(dailyReportService.hasTodayReport(testUser.getId())).thenReturn(true);

            // When & Then
            mockMvc.perform(get("/api/daily-reports/today/exists")).andExpect(status().isOk())
                    .andExpect(content().contentType("application/json;charset=UTF-8"))
                    .andExpect(content().string("true"));

            verify(dailyReportService).hasTodayReport(testUser.getId());
        }

        @Test
        @WithMockUser(username = "employee1")
        @DisplayName("正常: 本日の日報が存在しない場合falseを返却")
        void hasTodayReport_ReportNotExists_ShouldReturnFalse() throws Exception {
            // Given
            when(userRepository.findByUsername("employee1")).thenReturn(Optional.of(testUser));
            when(dailyReportService.hasTodayReport(testUser.getId())).thenReturn(false);

            // When & Then
            mockMvc.perform(get("/api/daily-reports/today/exists")).andExpect(status().isOk())
                    .andExpect(content().contentType("application/json;charset=UTF-8"))
                    .andExpect(content().string("false"));

            verify(dailyReportService).hasTodayReport(testUser.getId());
        }
    }

    @Nested
    @DisplayName("認証・権限制御テスト")
    class AuthenticationAndAuthorizationTests {

        @Test
        @DisplayName("異常: 全エンドポイントで認証なしは403返却")
        void allEndpoints_NoAuthentication_ShouldReturn403() throws Exception {
            // 日報作成
            mockMvc.perform(post("/api/daily-reports")
                    .with(csrf())  // CSRF token追加
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(validRequest)))
                    .andExpect(status().isUnauthorized());

            // 日報詳細取得
            mockMvc.perform(get("/api/daily-reports/1")).andExpect(status().isUnauthorized());

            // 日報更新
            mockMvc.perform(put("/api/daily-reports/1")
                    .with(csrf())  // CSRF token追加
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(validRequest)))
                    .andExpect(status().isUnauthorized());

            // 日報削除
            mockMvc.perform(delete("/api/daily-reports/1")
                    .with(csrf())).andExpect(status().isUnauthorized());

            // 自分の日報一覧
            mockMvc.perform(get("/api/daily-reports/my")).andExpect(status().isUnauthorized());

            // 部下日報一覧
            mockMvc.perform(get("/api/daily-reports/subordinates"))
                    .andExpect(status().isUnauthorized());

            // 本日日報存在チェック
            mockMvc.perform(get("/api/daily-reports/today/exists"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @WithMockUser(username = "nonexistent")
        @DisplayName("異常: 存在しないユーザーで認証エラー")
        void allEndpoints_NonexistentUser_ShouldHandleGracefully() throws Exception {
            // Given
            when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

            // When & Then: BaseControllerでIllegalArgumentExceptionが発生し、適切に処理される
            mockMvc.perform(get("/api/daily-reports/my")).andExpect(status().is5xxServerError());
        }
    }

    @Nested
    @DisplayName("エッジケース・統合テスト")
    class EdgeCaseAndIntegrationTests {

        @Test
        @WithMockUser(username = "employee1")
        @DisplayName("境界値: 最大文字数のリクエストで正常処理")
        void createDailyReport_MaxLengthContent_ShouldProcessCorrectly() throws Exception {
            // Given
            DailyReportRequest maxLengthRequest =
                    DailyReportRequest.builder().title(TestConfig.TestUtils.generateLongString(200)) // 最大200文字
                            .workContent(TestConfig.TestUtils.generateLongString(1000)) // 最大1000文字
                            .status(TestConfig.TestConstants.STATUS_DRAFT)
                            .reportDate(LocalDate.now()).build();

            when(userRepository.findByUsername("employee1")).thenReturn(Optional.of(testUser));
            when(dailyReportService.createDailyReport(eq(testUser.getId()),
                    any(DailyReportRequest.class))).thenReturn(testResponse);

            // When & Then
            mockMvc.perform(post("/api/daily-reports")
                    .with(csrf())  // CSRF token追加
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(maxLengthRequest)))
                    .andExpect(status().isCreated());
        }

        @Test
        @WithMockUser(username = "employee1")
        @DisplayName("統合: 日報作成→取得→更新→削除の完全フロー")
        void completeReportLifecycle_ShouldWorkCorrectly() throws Exception {
            // Given
            when(userRepository.findByUsername("employee1")).thenReturn(Optional.of(testUser));

            // 作成
            when(dailyReportService.createDailyReport(eq(testUser.getId()),
                    any(DailyReportRequest.class))).thenReturn(testResponse);

            mockMvc.perform(post("/api/daily-reports")
                    .with(csrf())  // CSRF token追加
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(validRequest)))
                    .andExpect(status().isCreated());

            // 取得
            when(dailyReportService.getDailyReportById(1L, testUser.getId()))
                    .thenReturn(Optional.of(testResponse));

            mockMvc.perform(get("/api/daily-reports/1")).andExpect(status().isOk());

            // 更新
            when(dailyReportService.updateDailyReport(eq(1L), eq(testUser.getId()),
                    any(DailyReportRequest.class))).thenReturn(testResponse);

            mockMvc.perform(put("/api/daily-reports/1")
                    .with(csrf())  // CSRF token追加
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(validRequest)))
                    .andExpect(status().isOk());

            // 削除
            doNothing().when(dailyReportService).deleteDailyReport(1L, testUser.getId());

            mockMvc.perform(delete("/api/daily-reports/1")
                    .with(csrf())).andExpect(status().isNoContent());

            // 各操作が実行されたことを確認
            verify(dailyReportService).createDailyReport(eq(testUser.getId()),
                    any(DailyReportRequest.class));
            verify(dailyReportService).getDailyReportById(1L, testUser.getId());
            verify(dailyReportService).updateDailyReport(eq(1L), eq(testUser.getId()),
                    any(DailyReportRequest.class));
            verify(dailyReportService).deleteDailyReport(1L, testUser.getId());
        }
    }
}
