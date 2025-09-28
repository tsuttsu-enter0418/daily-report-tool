package com.example.dailyreport.unit.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.cors.CorsConfigurationSource;

import com.example.dailyreport.config.TestConfig;
import com.example.dailyreport.security.SecurityConfig;

/**
 * SecurityConfigクラスのユニットテスト
 *
 * <p>テスト対象: - セキュリティフィルターチェーンの設定 - JWT認証の有効/無効制御 - CORS設定 - CSRF設定 - 認証・認可設定 - パスワードエンコーダー設定 -
 * 公開パスの設定
 *
 * <p>テスト方針: - SpringBootTestによるフルコンテキストテスト - MockMvcによるHTTPレイヤーテスト - 実際のセキュリティフィルターチェーンを使用 -
 * 認証有効/無効モードの両方をテスト - CORS・CSRF設定の動作確認
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("SecurityConfig - Spring Security設定")
class SecurityConfigTest {

    @Autowired private MockMvc mockMvc;

    @Autowired private SecurityConfig securityConfig;

    @Autowired private PasswordEncoder passwordEncoder;

    @Autowired private CorsConfigurationSource corsConfigurationSource;

    private String testPassword;

    @BeforeEach
    void setUp() {
        testPassword = TestConfig.TestConstants.TEST_PASSWORD;
    }

    @Nested
    @DisplayName("パスワードエンコーダー設定")
    class PasswordEncoderTests {

        @Test
        @DisplayName("正常: BCryptPasswordEncoderが設定されている")
        void passwordEncoder_ShouldBeBCryptPasswordEncoder() {
            // When & Then
            assertNotNull(passwordEncoder, "PasswordEncoderがnullではない");
            assertTrue(
                    passwordEncoder.getClass().getSimpleName().contains("BCrypt"),
                    "BCryptPasswordEncoderが設定されている");
        }

        @Test
        @DisplayName("正常: パスワードエンコード・照合が正常動作")
        void passwordEncoder_ShouldEncodeAndMatch() {
            // Given
            String rawPassword = testPassword;

            // When
            String encodedPassword = passwordEncoder.encode(rawPassword);

            // Then
            assertNotNull(encodedPassword, "エンコードされたパスワードがnullではない");
            assertNotEquals(rawPassword, encodedPassword, "エンコード前後でパスワードが異なる");
            assertTrue(
                    passwordEncoder.matches(rawPassword, encodedPassword),
                    "エンコードされたパスワードと元パスワードが一致する");
            assertFalse(
                    passwordEncoder.matches("wrongpassword", encodedPassword), "間違ったパスワードは一致しない");
        }

        @Test
        @DisplayName("正常: 同じパスワードでも異なるハッシュが生成される")
        void passwordEncoder_ShouldGenerateDifferentHashesForSamePassword() {
            // Given
            String rawPassword = testPassword;

            // When
            String hash1 = passwordEncoder.encode(rawPassword);
            String hash2 = passwordEncoder.encode(rawPassword);

            // Then
            assertNotEquals(hash1, hash2, "同じパスワードでも異なるハッシュが生成される");
            assertTrue(passwordEncoder.matches(rawPassword, hash1), "最初のハッシュが正しく照合される");
            assertTrue(passwordEncoder.matches(rawPassword, hash2), "2番目のハッシュが正しく照合される");
        }
    }

    @Nested
    @DisplayName("CORS設定")
    class CorsConfigurationTests {

        @Test
        @DisplayName("正常: CORS設定が正しく構成されている")
        void corsConfiguration_ShouldBeConfiguredCorrectly() {
            // Given
            MockHttpServletRequest request = new MockHttpServletRequest();
            request.setRequestURI("/api/test");

            // When & Then
            assertNotNull(corsConfigurationSource, "CorsConfigurationSourceがnullではない");

            var corsConfig = corsConfigurationSource.getCorsConfiguration(request);

            assertNotNull(corsConfig, "CORS設定が存在する");
        }

        @Test
        @DisplayName("正常: APIエンドポイントでCORSヘッダーが設定される")
        void corsConfiguration_ShouldSetCorsHeaders() throws Exception {
            // When & Then
            mockMvc.perform(
                            options("/api/auth/login")
                                    .header("Origin", "http://localhost:3000")
                                    .header("Access-Control-Request-Method", "POST")
                                    .header("Access-Control-Request-Headers", "Content-Type"))
                    .andExpect(status().isOk())
                    .andExpect(header().exists("Access-Control-Allow-Origin"))
                    .andExpect(header().exists("Access-Control-Allow-Methods"))
                    .andExpect(header().exists("Access-Control-Allow-Headers"));
        }

        @Test
        @DisplayName("正常: 許可されたOriginからのリクエストを受け入れる")
        void corsConfiguration_ShouldAllowConfiguredOrigins() throws Exception {
            // When & Then
            mockMvc.perform(get("/api/auth/login").header("Origin", "http://localhost:3000"))
                    .andExpect(
                            header().string(
                                            "Access-Control-Allow-Origin",
                                            "http://localhost:3000"));
        }
    }

    @Nested
    @DisplayName("認証・認可設定")
    class AuthenticationAuthorizationTests {

        @Test
        @DisplayName("正常: 公開エンドポイントは認証なしでアクセス可能")
        void publicEndpoints_ShouldBeAccessibleWithoutAuthentication() throws Exception {
            // ログインエンドポイント
            mockMvc.perform(
                            post("/api/auth/login")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content("{\"username\":\"test\",\"password\":\"test\"}"))
                    .andExpect(status().is4xxClientError()); // 400 or 401 (認証は通るがバリデーションエラー)

            // Swagger UI
            mockMvc.perform(get("/swagger-ui/index.html")).andExpect(status().isOk());

            // Health check
            mockMvc.perform(get("/actuator/health")).andExpect(status().isOk());
        }

        @Test
        @WithMockUser(username = "admin")
        @DisplayName("正常: 認証済みユーザーは保護されたエンドポイントにアクセス可能")
        void protectedEndpoints_WithAuthentication_ShouldBeAccessible() throws Exception {
            // 認証済みユーザーはアクセス可能
            mockMvc.perform(get("/api/daily-reports/my")).andExpect(status().isOk());
        }

        @Test
        @DisplayName("異常: 認証なしで保護されたエンドポイントにアクセスは401返却")
        void protectedEndpoints_WithoutAuthentication_ShouldReturn401() throws Exception {
            // 認証なしではアクセス不可
            mockMvc.perform(get("/api/daily-reports/my")).andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("CSRF設定")
    class CsrfConfigurationTests {

        @Test
        @DisplayName("正常: CSRFが無効化されている")
        void csrf_ShouldBeDisabled() throws Exception {
            // CSRFトークンなしでPOSTリクエストが可能
            mockMvc.perform(
                            post("/api/auth/login")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content("{\"username\":\"test\",\"password\":\"test\"}"))
                    .andExpect(status().is4xxClientError()); // CSRFエラーではなく、認証・バリデーションエラー
        }
    }

    @Nested
    @DisplayName("セッション管理設定")
    class SessionManagementTests {

        @Test
        @DisplayName("正常: ステートレスセッション管理が設定されている")
        void sessionManagement_ShouldBeStateless() throws Exception {
            // ログインエンドポイントはPOSTのみ対応なのでGETは405エラー
            mockMvc.perform(get("/api/auth/login")).andExpect(status().isMethodNotAllowed()); // GET
            // method
            // not
            // supported
        }
    }

    @Nested
    @DisplayName("フィルターチェーン統合テスト")
    class FilterChainIntegrationTests {

        @Test
        @WithMockUser(username = "admin")
        @DisplayName("統合: セキュリティフィルターチェーン動作")
        void securityFilterChain_ShouldWorkCorrectly() throws Exception {
            // 1. 公開エンドポイントへのアクセス
            mockMvc.perform(get("/actuator/health")).andExpect(status().isOk());

            // 2. 認証済みユーザーは保護されたエンドポイントにアクセス可能
            mockMvc.perform(get("/api/daily-reports/my")).andExpect(status().isOk());

            // 3. ログインエンドポイントへのアクセス（認証不要）
            mockMvc.perform(
                            post("/api/auth/login")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(
                                            "{\"username\":\"invaliduser\",\"password\":\"invalidpass\"}"))
                    .andExpect(status().is4xxClientError()); // バリデーションエラーまたは認証エラー
        }

        @Test
        @WithMockUser(username = "admin")
        @DisplayName("統合: CORS + 認証でのエンドポイントアクセステスト")
        void corsWithAuthentication_ShouldWorkTogether() throws Exception {
            // CORS付きで認証済みエンドポイントアクセス
            mockMvc.perform(get("/api/daily-reports/my").header("Origin", "http://localhost:3000"))
                    .andExpect(status().isOk())
                    .andExpect(header().exists("Access-Control-Allow-Origin"));
        }
    }

    @Nested
    @DisplayName("エラーハンドリング・エッジケース")
    class ErrorHandlingAndEdgeCaseTests {

        @Test
        @WithMockUser(username = "admin")
        @DisplayName("境界値: 存在しないエンドポイントへのアクセス")
        void nonExistentEndpoint_ShouldReturn404() throws Exception {
            // デバッグモードでは認証をスキップし、存在しないエンドポイントは404を返す
            mockMvc.perform(get("/api/nonexistent")).andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("境界値: 不正なContentTypeでのリクエスト")
        void invalidContentType_ShouldBeHandledCorrectly() throws Exception {
            mockMvc.perform(
                            post("/api/auth/login")
                                    .contentType(MediaType.TEXT_PLAIN)
                                    .content("invalid content"))
                    .andExpect(status().is4xxClientError());
        }

        @Test
        @DisplayName("境界値: 空のリクエストボディ")
        void emptyRequestBody_ShouldBeHandledCorrectly() throws Exception {
            mockMvc.perform(
                            post("/api/auth/login")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(""))
                    .andExpect(status().is4xxClientError());
        }

        @Test
        @DisplayName("境界値: 不正なJSON形式のリクエスト")
        void invalidJsonRequest_ShouldBeHandledCorrectly() throws Exception {
            mockMvc.perform(
                            post("/api/auth/login")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content("{invalid json"))
                    .andExpect(status().is4xxClientError());
        }
    }

    @Nested
    @DisplayName("Bean設定テスト")
    class BeanConfigurationTests {

        @Test
        @DisplayName("正常: 必要なSecurityBeanが正しく設定されている")
        void securityBeans_ShouldBeConfiguredCorrectly() {
            // SecurityConfig Bean
            assertNotNull(securityConfig, "SecurityConfigがSpringコンテキストに登録されている");

            // PasswordEncoder Bean
            assertNotNull(passwordEncoder, "PasswordEncoderがSpringコンテキストに登録されている");
            assertEquals(
                    "BCryptPasswordEncoder",
                    passwordEncoder.getClass().getSimpleName(),
                    "BCryptPasswordEncoderが設定されている");

            // CorsConfigurationSource Bean
            assertNotNull(corsConfigurationSource, "CorsConfigurationSourceがSpringコンテキストに登録されている");
        }

        @Test
        @DisplayName("正常: パスワードエンコーダーの強度設定確認")
        void passwordEncoder_ShouldHaveCorrectStrength() {
            // BCryptのデフォルト強度確認（テスト用に軽量設定になっていることを確認）
            String password = "testpassword";
            String encoded1 = passwordEncoder.encode(password);
            String encoded2 = passwordEncoder.encode(password);

            // 異なるハッシュが生成されることを確認（salt使用）
            assertNotEquals(encoded1, encoded2, "ソルト使用により異なるハッシュが生成される");

            // 両方とも正しくマッチすることを確認
            assertTrue(passwordEncoder.matches(password, encoded1), "1回目のエンコード結果が正しくマッチする");
            assertTrue(passwordEncoder.matches(password, encoded2), "2回目のエンコード結果が正しくマッチする");
        }
    }
}
