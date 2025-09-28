package com.example.dailyreport.unit.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import org.springframework.test.web.servlet.MockMvc;

import com.example.dailyreport.config.TestConfig;
import com.example.dailyreport.dto.LoginRequest;
import com.example.dailyreport.dto.LoginResponse;
import com.example.dailyreport.entity.User;
import com.example.dailyreport.repository.UserRepository;
import com.example.dailyreport.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * AuthControllerクラスのユニットテスト
 *
 * <p>テスト対象: - POST /api/auth/login: ユーザーログイン認証 - GET /api/auth/validate: JWTトークンの有効性検証 - GET
 * /api/auth/me: 現在のユーザー情報取得
 *
 * <p>テスト方針: - WebMvcTestによるWebレイヤーテスト - AuthServiceをモック化してコントローラー動作をテスト - 正常系・異常系の包括的テスト -
 * JSON形式のリクエスト・レスポンス検証
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("AuthController - 認証API")
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;

    @Autowired private ObjectMapper objectMapper;

    @MockBean private AuthService authService;

    @MockBean private UserRepository userRepository;

    private User testUser;
    private LoginRequest validLoginRequest;
    private LoginRequest invalidLoginRequest;
    private LoginResponse expectedLoginResponse;

    @BeforeEach
    void setUp() {
        // テストユーザー作成
        testUser =
                User.builder()
                        .id(1L)
                        .username(TestConfig.TestConstants.ADMIN_USERNAME)
                        .email(TestConfig.TestConstants.ADMIN_EMAIL)
                        .role(TestConfig.TestConstants.ADMIN_ROLE)
                        .displayName("管理者ユーザー")
                        .isActive(true)
                        .build();

        // 有効なログインリクエスト
        validLoginRequest =
                LoginRequest.builder()
                        .username(TestConfig.TestConstants.ADMIN_USERNAME)
                        .password(TestConfig.TestConstants.TEST_PASSWORD)
                        .build();

        // 無効なログインリクエスト
        invalidLoginRequest =
                LoginRequest.builder()
                        .username(TestConfig.TestConstants.INVALID_USERNAME)
                        .password(TestConfig.TestConstants.INVALID_PASSWORD)
                        .build();

        // 期待されるログインレスポンス
        expectedLoginResponse =
                LoginResponse.builder()
                        .token(TestConfig.TestConstants.VALID_JWT_TOKEN)
                        .id(testUser.getId().toString())
                        .username(testUser.getUsername())
                        .email(testUser.getEmail())
                        .role(testUser.getRole())
                        .displayName(testUser.getDisplayName())
                        .build();

        // BaseController用のUserRepositoryモック設定
        when(userRepository.findByUsername(TestConfig.TestConstants.ADMIN_USERNAME))
                .thenReturn(Optional.of(testUser));
        when(userRepository.findByUsername(TestConfig.TestConstants.EMPLOYEE_USERNAME))
                .thenReturn(Optional.of(testUser));
        when(userRepository.findByUsername(TestConfig.TestConstants.MANAGER_USERNAME))
                .thenReturn(Optional.of(testUser));
    }

    @Nested
    @DisplayName("POST /api/auth/login - ログイン認証")
    class LoginTests {

        @Test
        @DisplayName("正常: 有効なログイン情報で認証成功")
        void login_ValidCredentials_ShouldReturn200() throws Exception {
            // Given
            when(authService.authenticateUser(any(LoginRequest.class)))
                    .thenReturn(expectedLoginResponse);

            // When & Then
            mockMvc.perform(
                            post("/api/auth/login")
                                    .with(csrf()) // CSRF token追加
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(validLoginRequest)))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType("application/json;charset=UTF-8"))
                    .andExpect(jsonPath("$.token").value(TestConfig.TestConstants.VALID_JWT_TOKEN))
                    .andExpect(jsonPath("$.id").value(testUser.getId().toString()))
                    .andExpect(jsonPath("$.username").value(testUser.getUsername()))
                    .andExpect(jsonPath("$.email").value(testUser.getEmail()))
                    .andExpect(jsonPath("$.role").value(testUser.getRole()))
                    .andExpect(jsonPath("$.displayName").value(testUser.getDisplayName()));
            // authService.authenticateUserが1回呼び出される
            verify(authService).authenticateUser(any(LoginRequest.class));
            // responsOKの場合
        }

        @Test
        @DisplayName("異常: 無効なログイン情報で認証失敗")
        void login_InvalidCredentials_ShouldReturn400() throws Exception {
            // Given
            when(authService.authenticateUser(any(LoginRequest.class)))
                    .thenThrow(new RuntimeException("ユーザーが見つかりません"));

            // When & Then
            mockMvc.perform(
                            post("/api/auth/login")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(invalidLoginRequest)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().contentType("application/json;charset=UTF-8"))
                    .andExpect(jsonPath("$.message").value("ログインに失敗しました: ユーザーが見つかりません"))
                    .andExpect(jsonPath("$.status").value("400"));

            verify(authService).authenticateUser(any(LoginRequest.class));
        }

        @Test
        @DisplayName("異常: パスワード不一致で認証失敗")
        void login_WrongPassword_ShouldReturn400() throws Exception {
            // Given
            when(authService.authenticateUser(any(LoginRequest.class)))
                    .thenThrow(new RuntimeException("パスワードが一致しません"));

            // When & Then
            mockMvc.perform(
                            post("/api/auth/login")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(invalidLoginRequest)))
                    // 検証（エラーが発生するか）
                    .andExpect(status().isBadRequest())
                    .andExpect(content().contentType("application/json;charset=UTF-8"))
                    .andExpect(jsonPath("$.message").value("ログインに失敗しました: パスワードが一致しません"))
                    .andExpect(jsonPath("$.status").value("400"));

            verify(authService).authenticateUser(any(LoginRequest.class));
        }

        @Test
        @DisplayName("異常: バリデーションエラーで400返却")
        void login_ValidationError_ShouldReturn400() throws Exception {
            // Given
            LoginRequest emptyRequest = LoginRequest.builder().username("").password("").build();
            when(authService.authenticateUser(emptyRequest))
                    .thenThrow(new RuntimeException("ユーザーが見つかりません"));

            // When & Then
            mockMvc.perform(
                            post("/api/auth/login")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(emptyRequest)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value("ログインに失敗しました: ユーザーが見つかりません"))
                    .andExpect(jsonPath("$.status").value("400"));

            // バリデーションエラーのため、AuthServiceは呼ばれない
            verify(authService).authenticateUser(emptyRequest);
        }

        @Test
        @DisplayName("異常: 空のリクエストボディで400返却")
        void login_EmptyRequestBody_ShouldReturn400() throws Exception {
            // When & Then
            mockMvc.perform(
                            post("/api/auth/login")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(""))
                    .andExpect(status().isBadRequest());

            verifyNoInteractions(authService);
        }

        @Test
        @DisplayName("異常: 不正なJSON形式で400返却")
        void login_InvalidJson_ShouldReturn400() throws Exception {
            // When & Then
            mockMvc.perform(
                            post("/api/auth/login")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content("{invalid json"))
                    .andExpect(status().isBadRequest());

            verifyNoInteractions(authService);
        }

        @Test
        @DisplayName("異常: Content-Typeがない場合のエラー処理")
        void login_NoContentType_ShouldReturn415() throws Exception {
            // When & Then
            mockMvc.perform(
                            post("/api/auth/login")
                                    .content(objectMapper.writeValueAsString(validLoginRequest)))
                    .andExpect(status().isUnsupportedMediaType());

            verifyNoInteractions(authService);
        }
    }

    @Nested
    @DisplayName("GET /api/auth/validate - トークン検証")
    class ValidateTokenTests {

        @Test
        @WithMockUser(username = "admin")
        @DisplayName("正常: 有効な認証情報でトークン検証成功")
        void validateToken_ValidAuth_ShouldReturn200() throws Exception {
            // Given
            when(userRepository.findByUsername("admin")).thenReturn(Optional.of(testUser));

            // When & Then
            mockMvc.perform(get("/api/auth/validate")).andExpect(status().isOk());

            verify(userRepository).findByUsername("admin");
        }

        @Test
        @WithMockUser(username = "nonexistent")
        @DisplayName("異常: 存在しないユーザーで401返却")
        void validateToken_NonexistentUser_ShouldReturn401() throws Exception {
            // Given
            when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

            // When & Then
            mockMvc.perform(get("/api/auth/validate")).andExpect(status().isUnauthorized());

            verify(userRepository).findByUsername("nonexistent");
        }

        @Test
        @DisplayName("異常: 認証なしで401返却")
        void validateToken_NoAuth_ShouldReturn401() throws Exception {
            // When & Then - 認証なしでアクセス
            mockMvc.perform(get("/api/auth/validate")).andExpect(status().isUnauthorized());

            // UserRepositoryが呼ばれないことを確認
            verifyNoInteractions(userRepository);
        }
    }

    @Nested
    @DisplayName("GET /api/auth/me - ユーザー情報取得")
    class GetCurrentUserTests {

        @Test
        @WithMockUser(username = "admin")
        @DisplayName("正常: 有効な認証情報でユーザー情報取得成功")
        void getCurrentUser_ValidAuth_ShouldReturn200() throws Exception {
            // Given
            when(userRepository.findByUsername("admin")).thenReturn(Optional.of(testUser));

            // When & Then
            mockMvc.perform(get("/api/auth/me"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType("application/json;charset=UTF-8"))
                    .andExpect(jsonPath("$.token").value("")) // /meではトークンは空
                    .andExpect(jsonPath("$.id").value(testUser.getId().toString()))
                    .andExpect(jsonPath("$.username").value(testUser.getUsername()))
                    .andExpect(jsonPath("$.email").value(testUser.getEmail()))
                    .andExpect(jsonPath("$.role").value(testUser.getRole()))
                    .andExpect(jsonPath("$.displayName").value(testUser.getDisplayName()));

            verify(userRepository).findByUsername("admin");
        }

        @Test
        @WithMockUser(username = "employee1")
        @DisplayName("正常: 部下ユーザーの情報取得成功")
        void getCurrentUser_EmployeeUser_ShouldReturn200() throws Exception {
            // Given
            User employeeUser =
                    User.builder()
                            .id(2L)
                            .username(TestConfig.TestConstants.EMPLOYEE_USERNAME)
                            .email(TestConfig.TestConstants.EMPLOYEE_EMAIL)
                            .role(TestConfig.TestConstants.EMPLOYEE_ROLE)
                            .displayName("部下ユーザー")
                            .isActive(true)
                            .build();

            when(userRepository.findByUsername(TestConfig.TestConstants.EMPLOYEE_USERNAME))
                    .thenReturn(Optional.of(employeeUser));

            // When & Then
            mockMvc.perform(get("/api/auth/me"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType("application/json;charset=UTF-8"))
                    .andExpect(jsonPath("$.token").value(""))
                    .andExpect(jsonPath("$.id").value("2"))
                    .andExpect(
                            jsonPath("$.username")
                                    .value(TestConfig.TestConstants.EMPLOYEE_USERNAME))
                    .andExpect(jsonPath("$.role").value(TestConfig.TestConstants.EMPLOYEE_ROLE));

            verify(userRepository).findByUsername(TestConfig.TestConstants.EMPLOYEE_USERNAME);
        }

        @Test
        @WithMockUser(username = "nonexistent")
        @DisplayName("異常: 存在しないユーザーで401返却")
        void getCurrentUser_NonexistentUser_ShouldReturn401() throws Exception {
            // Given
            when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

            // When & Then
            mockMvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());

            verify(userRepository).findByUsername("nonexistent");
        }

        @Test
        @DisplayName("異常: 認証なしで401返却")
        void getCurrentUser_NoAuth_ShouldReturn401() throws Exception {
            // When & Then - 認証なしでアクセス
            mockMvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());

            // UserRepositoryが呼ばれないことを確認
            verifyNoInteractions(userRepository);
        }
    }

    @Nested
    @DisplayName("エラーハンドリング・エッジケース")
    class ErrorHandlingAndEdgeCaseTests {

        @Test
        @DisplayName("境界値: 非常に長いユーザー名でのログイン")
        void login_VeryLongUsername_ShouldHandle() throws Exception {
            // Given
            LoginRequest longUsernameRequest =
                    LoginRequest.builder()
                            .username(TestConfig.TestUtils.generateLongString(100))
                            .password(TestConfig.TestConstants.TEST_PASSWORD)
                            .build();

            when(authService.authenticateUser(any(LoginRequest.class)))
                    .thenThrow(new RuntimeException("ユーザーが見つかりません"));

            // When & Then
            mockMvc.perform(
                            post("/api/auth/login")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(longUsernameRequest)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").exists());

            verify(authService).authenticateUser(any(LoginRequest.class));
        }

        @Test
        @DisplayName("境界値: 特殊文字を含むユーザー名でのログイン")
        void login_SpecialCharactersUsername_ShouldHandle() throws Exception {
            // Given
            LoginRequest specialRequest =
                    LoginRequest.builder()
                            .username("user@domain.com")
                            .password(TestConfig.TestConstants.TEST_PASSWORD)
                            .build();

            when(authService.authenticateUser(any(LoginRequest.class)))
                    .thenReturn(expectedLoginResponse);

            // When & Then
            mockMvc.perform(
                            post("/api/auth/login")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(specialRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").exists());

            verify(authService).authenticateUser(any(LoginRequest.class));
        }

        @Test
        @WithMockUser(username = "admin")
        @DisplayName("統合: 複数のAPIエンドポイントを連続して呼び出し")
        void multipleEndpoints_ShouldWorkIndependently() throws Exception {
            // Given
            when(userRepository.findByUsername("admin")).thenReturn(Optional.of(testUser));
            when(authService.authenticateUser(any(LoginRequest.class)))
                    .thenReturn(expectedLoginResponse);

            // When & Then - ログイン（認証不要）
            mockMvc.perform(
                            post("/api/auth/login")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(validLoginRequest)))
                    .andExpect(status().isOk());

            // When & Then - トークン検証（認証必要）
            mockMvc.perform(get("/api/auth/validate")).andExpect(status().isOk());

            // When & Then - ユーザー情報取得（認証必要）
            mockMvc.perform(get("/api/auth/me")).andExpect(status().isOk());

            verify(authService).authenticateUser(any(LoginRequest.class));
            verify(userRepository, atLeast(2)).findByUsername("admin");
        }
    }

    @Nested
    @WithMockUser(username = "admin")
    @DisplayName("HTTP メソッド・エンドポイント検証")
    class HttpMethodAndEndpointTests {

        @Test
        @DisplayName("異常: GET /api/auth/loginは405返却")
        void loginEndpoint_GetMethod_ShouldReturn405() throws Exception {
            mockMvc.perform(get("/api/auth/login")).andExpect(status().isMethodNotAllowed());

            verifyNoInteractions(authService);
        }

        @Test
        @DisplayName("異常: POST /api/auth/validateは405返却")
        void validateEndpoint_PostMethod_ShouldReturn405() throws Exception {
            mockMvc.perform(
                            post("/api/auth/validate")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content("{}"))
                    .andExpect(status().isMethodNotAllowed());

            verifyNoInteractions(authService);
        }

        @Test
        @DisplayName("異常: POST /api/auth/meは405返却")
        void meEndpoint_PostMethod_ShouldReturn405() throws Exception {
            mockMvc.perform(
                            post("/api/auth/me")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content("{}"))
                    .andExpect(status().isMethodNotAllowed());

            verifyNoInteractions(authService);
        }

        @Test
        @DisplayName("異常: 存在しないエンドポイントは404返却")
        void nonExistentEndpoint_ShouldReturn404() throws Exception {
            mockMvc.perform(get("/api/auth/nonexistent")).andExpect(status().isNotFound());

            verifyNoInteractions(authService);
        }
    }
}
