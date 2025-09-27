package com.example.dailyreport.integration.controller;

import static com.example.dailyreport.config.TestConfig.TestConstants.ADMIN_EMAIL;
import static com.example.dailyreport.config.TestConfig.TestConstants.ADMIN_ROLE;
import static com.example.dailyreport.config.TestConfig.TestConstants.ADMIN_USERNAME;
import static com.example.dailyreport.config.TestConfig.TestConstants.INVALID_PASSWORD;
import static com.example.dailyreport.config.TestConfig.TestConstants.INVALID_USERNAME;
import static com.example.dailyreport.config.TestConfig.TestConstants.TEST_PASSWORD;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
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
import com.example.dailyreport.dto.LoginRequest;
import com.example.dailyreport.dto.LoginResponse;
import com.example.dailyreport.entity.User;
import com.example.dailyreport.repository.UserRepository;
import com.example.dailyreport.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * AuthController統合テスト
 *
 * <p>
 * テスト対象: - POST /api/auth/login ログイン機能 - POST /api/auth/validate JWT検証機能
 *
 * <p>
 * テストパターン: - 正常系：有効な認証情報での成功ケース - 異常系：無効な認証情報での失敗ケース - エラーハンドリング：例外発生時の適切なレスポンス
 *
 * <p>
 * 使用技術: - @WebMvcTest：Web層のみのスライステスト - @MockBean：サービス層のモック化 - MockMvc：HTTP リクエスト/レスポンスのテスト
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {"jwt.auth.enabled=true", // 実際の設定を使用
        "debug.default.user.username=admin" // BaseController用
})
@DisplayName("AuthController 統合テスト")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private UserRepository userRepository;

    private LoginRequest validLoginRequest;
    private LoginRequest invalidLoginRequest;
    private LoginResponse successLoginResponse;
    private User testUser;

    @BeforeEach
    void setUp() {
        // テストデータ準備
        validLoginRequest = new LoginRequest(ADMIN_USERNAME, TEST_PASSWORD);
        invalidLoginRequest = new LoginRequest(INVALID_USERNAME, INVALID_PASSWORD);

        successLoginResponse =
                LoginResponse.builder().token("test.jwt.token").id("1").username(ADMIN_USERNAME)
                        .email(ADMIN_EMAIL).role(ADMIN_ROLE).displayName(ADMIN_USERNAME).build();

        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername(ADMIN_USERNAME);
        testUser.setEmail(ADMIN_EMAIL);
        testUser.setRole(ADMIN_ROLE);
        testUser.setDisplayName(ADMIN_USERNAME);

        // BaseController用のUserRepositoryモック設定
        when(userRepository.findByUsername(ADMIN_USERNAME)).thenReturn(Optional.of(testUser));
    }

    // =================================================
    // POST /api/auth/login テスト
    // =================================================

    @Test
    @DisplayName("ログイン成功 - 有効な認証情報")
    void login_ValidCredentials_ReturnsSuccess() throws Exception {
        // Given
        when(authService.authenticateUser(any(LoginRequest.class)))
                .thenReturn(successLoginResponse);

        // When & Then
        mockMvc.perform(post("/api/auth/login").with(csrf()) // CSRF token追加
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validLoginRequest))).andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json;charset=UTF-8"))
                .andExpect(jsonPath("$.token").value("test.jwt.token"))
                .andExpect(jsonPath("$.username").value(ADMIN_USERNAME))
                .andExpect(jsonPath("$.role").value(ADMIN_ROLE));

        // サービスメソッドが呼ばれたことを検証
        verify(authService, times(1)).authenticateUser(any(LoginRequest.class));
    }

    @Test
    @DisplayName("ログイン失敗 - 無効な認証情報")
    void login_InvalidCredentials_ReturnsBadRequest() throws Exception {
        // Given
        when(authService.authenticateUser(any(LoginRequest.class)))
                .thenThrow(new RuntimeException("ユーザーが見つかりません"));

        // When & Then
        mockMvc.perform(post("/api/auth/login").with(csrf()) // CSRF token追加
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidLoginRequest))).andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(content().string("ログインに失敗しました: ユーザーが見つかりません"));

        verify(authService, times(1)).authenticateUser(any(LoginRequest.class));
    }

    @Test
    @DisplayName("ログイン失敗 - 空のリクエストボディ")
    void login_EmptyRequestBody_ReturnsBadRequest() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/auth/login").with(csrf()) // CSRF token追加
                .contentType(MediaType.APPLICATION_JSON).content("{}")).andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("ログイン失敗 - JSONフォーマットエラー")
    void login_InvalidJsonFormat_ReturnsBadRequest() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/auth/login").with(csrf()) // CSRF token追加
                .contentType(MediaType.APPLICATION_JSON).content("invalid json")).andDo(print())
                .andExpect(status().isBadRequest());
    }

    // =================================================
    // POST /api/auth/validate テスト
    // =================================================

    @Test
    @WithMockUser(username = ADMIN_USERNAME, roles = {"ADMIN"})
    @DisplayName("JWT検証成功 - 有効なトークン")
    void validateToken_ValidToken_ReturnsOk() throws Exception {
        // Given
        when(userRepository.findByUsername(ADMIN_USERNAME)).thenReturn(Optional.of(testUser));

        // When & Then
        mockMvc.perform(get("/api/auth/validate")).andDo(print()).andExpect(status().isOk());

        verify(userRepository, times(1)).findByUsername(ADMIN_USERNAME);
    }

    @Test
    @DisplayName("JWT検証失敗 - 認証なし")
    void validateToken_NoAuthentication_ReturnsUnauthorized() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/auth/validate")).andDo(print())
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "nonexistent", roles = {"USER"})
    @DisplayName("JWT検証失敗 - 存在しないユーザー")
    void validateToken_UserNotFound_ReturnsUnauthorized() throws Exception {
        // Given
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/api/auth/validate")).andDo(print())
                .andExpect(status().isUnauthorized());

        verify(userRepository, times(1)).findByUsername("nonexistent");
    }

    // =================================================
    // パフォーマンステスト・境界値テスト
    // =================================================

    @Test
    @DisplayName("大量リクエスト処理テスト")
    void login_HighVolumeRequests_HandlesGracefully() throws Exception {
        // Given
        when(authService.authenticateUser(any(LoginRequest.class)))
                .thenReturn(successLoginResponse);

        // When & Then - 複数回リクエストを送信
        for (int i = 0; i < 10; i++) {
            mockMvc.perform(post("/api/auth/login").with(csrf()) // CSRF token追加
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(validLoginRequest)))
                    .andExpect(status().isOk());
        }

        verify(authService, times(10)).authenticateUser(any(LoginRequest.class));
    }

    @Test
    @DisplayName("長いユーザー名でのログイン")
    void login_VeryLongUsername_HandlesGracefully() throws Exception {
        // Given
        String longUsername = TestConfig.TestUtils.generateLongString(1000);
        LoginRequest longUsernameRequest = new LoginRequest(longUsername, TEST_PASSWORD);

        when(authService.authenticateUser(any(LoginRequest.class)))
                .thenThrow(new RuntimeException("ユーザー名が長すぎます"));

        // When & Then
        mockMvc.perform(post("/api/auth/login").with(csrf()) // CSRF token追加
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(longUsernameRequest))).andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(content().string("ログインに失敗しました: ユーザー名が長すぎます"));
    }
}
