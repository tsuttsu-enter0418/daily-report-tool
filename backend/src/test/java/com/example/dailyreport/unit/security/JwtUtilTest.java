package com.example.dailyreport.unit.security;

import static org.junit.jupiter.api.Assertions.*;

import java.lang.reflect.Field;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import com.example.dailyreport.config.TestConfig;
import com.example.dailyreport.security.JwtUtil;

import io.jsonwebtoken.JwtException;

/**
 * JwtUtilクラスのユニットテスト
 *
 * <p>テスト対象: - トークンの生成・検証機能 - ユーザー情報の抽出機能 - トークンの期限切れチェック機能 - エラーハンドリング機能
 *
 * <p>テスト方針: - 正常系・異常系の網羅的テスト - 実際のJWTライブラリを使用した統合テスト - リフレクションによるプライベートフィールドの設定
 * - TestConfigの定数を使用した一貫性のあるテスト
 */
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("JwtUtil - JWT トークン管理ユーティリティ")
class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() throws Exception {
        jwtUtil = new JwtUtil();

        // リフレクションでプライベートフィールドを設定
        setPrivateField(jwtUtil, "secret", TestConfig.TestConstants.TEST_JWT_SECRET);
        setPrivateField(jwtUtil, "expiration", TestConfig.TestConstants.TEST_JWT_EXPIRATION);
    }

    /**
     * リフレクションを使用してプライベートフィールドに値を設定
     *
     * @param target 対象オブジェクト
     * @param fieldName フィールド名
     * @param value 設定する値
     */
    private void setPrivateField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }

    @Nested
    @DisplayName("トークン生成機能")
    class TokenGenerationTests {

        @Test
        @DisplayName("正常: 有効なユーザー名と役職でトークンを生成")
        void generateToken_ValidUsernameAndRole_ShouldReturnValidToken() {
            // Given
            String username = TestConfig.TestConstants.ADMIN_USERNAME;
            String role = TestConfig.TestConstants.ADMIN_ROLE;

            // When
            String token = jwtUtil.generateToken(username, role);

            // Then
            assertNotNull(token, "生成されたトークンがnullではない");
            assertFalse(token.isEmpty(), "生成されたトークンが空文字ではない");
            assertTrue(token.matches("^[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+$"),
                    "JWTの正しいフォーマット（header.payload.signature）");

            // 生成されたトークンから情報が正しく抽出できることを確認
            assertEquals(username, jwtUtil.getUsernameFromToken(token));
            assertEquals(role, jwtUtil.getRoleFromToken(token));
            assertTrue(jwtUtil.validateToken(token));
        }

        @Test
        @DisplayName("正常: 部下ユーザーでトークンを生成")
        void generateToken_EmployeeUser_ShouldReturnValidToken() {
            // Given
            String username = TestConfig.TestConstants.EMPLOYEE_USERNAME;
            String role = TestConfig.TestConstants.EMPLOYEE_ROLE;

            // When
            String token = jwtUtil.generateToken(username, role);

            // Then
            assertNotNull(token);
            assertEquals(username, jwtUtil.getUsernameFromToken(token));
            assertEquals(role, jwtUtil.getRoleFromToken(token));
            assertTrue(jwtUtil.validateToken(token));
        }

        @Test
        @DisplayName("正常: 上長ユーザーでトークンを生成")
        void generateToken_ManagerUser_ShouldReturnValidToken() {
            // Given
            String username = TestConfig.TestConstants.MANAGER_USERNAME;
            String role = TestConfig.TestConstants.MANAGER_ROLE;

            // When
            String token = jwtUtil.generateToken(username, role);

            // Then
            assertNotNull(token);
            assertEquals(username, jwtUtil.getUsernameFromToken(token));
            assertEquals(role, jwtUtil.getRoleFromToken(token));
            assertTrue(jwtUtil.validateToken(token));
        }
    }

    @Nested
    @DisplayName("ユーザー名抽出機能")
    class UsernameExtractionTests {

        @Test
        @DisplayName("正常: 有効なトークンからユーザー名を抽出")
        void getUsernameFromToken_ValidToken_ShouldReturnUsername() {
            // Given
            String expectedUsername = TestConfig.TestConstants.ADMIN_USERNAME;
            String token = jwtUtil.generateToken(expectedUsername, TestConfig.TestConstants.ADMIN_ROLE);

            // When
            String actualUsername = jwtUtil.getUsernameFromToken(token);

            // Then
            assertEquals(expectedUsername, actualUsername, "トークンから正しいユーザー名が抽出される");
        }

        @Test
        @DisplayName("異常: 無効なトークンからユーザー名抽出時に例外発生")
        void getUsernameFromToken_InvalidToken_ShouldThrowException() {
            // Given
            String invalidToken = "invalid.jwt.token";

            // When & Then
            assertThrows(JwtException.class, () -> jwtUtil.getUsernameFromToken(invalidToken),
                    "無効なトークンでJwtException例外が発生");
        }

        @Test
        @DisplayName("異常: 空文字トークンからユーザー名抽出時に例外発生")
        void getUsernameFromToken_EmptyToken_ShouldThrowException() {
            // Given
            String emptyToken = "";

            // When & Then
            assertThrows(Exception.class, () -> jwtUtil.getUsernameFromToken(emptyToken),
                    "空文字トークンで例外が発生");
        }

        @Test
        @DisplayName("異常: nullトークンからユーザー名抽出時に例外発生")
        void getUsernameFromToken_NullToken_ShouldThrowException() {
            // Given
            String nullToken = null;

            // When & Then
            assertThrows(Exception.class, () -> jwtUtil.getUsernameFromToken(nullToken),
                    "nullトークンで例外が発生");
        }
    }

    @Nested
    @DisplayName("役職情報抽出機能")
    class RoleExtractionTests {

        @Test
        @DisplayName("正常: 有効なトークンから役職を抽出")
        void getRoleFromToken_ValidToken_ShouldReturnRole() {
            // Given
            String expectedRole = TestConfig.TestConstants.MANAGER_ROLE;
            String token = jwtUtil.generateToken(TestConfig.TestConstants.MANAGER_USERNAME, expectedRole);

            // When
            String actualRole = jwtUtil.getRoleFromToken(token);

            // Then
            assertEquals(expectedRole, actualRole, "トークンから正しい役職が抽出される");
        }

        @Test
        @DisplayName("異常: 無効なトークンから役職抽出時に例外発生")
        void getRoleFromToken_InvalidToken_ShouldThrowException() {
            // Given
            String invalidToken = "invalid.jwt.token";

            // When & Then
            assertThrows(JwtException.class, () -> jwtUtil.getRoleFromToken(invalidToken),
                    "無効なトークンでJwtException例外が発生");
        }

        @Test
        @DisplayName("異常: nullトークンから役職抽出時に例外発生")
        void getRoleFromToken_NullToken_ShouldThrowException() {
            // Given
            String nullToken = null;

            // When & Then
            assertThrows(Exception.class, () -> jwtUtil.getRoleFromToken(nullToken),
                    "nullトークンで例外が発生");
        }
    }

    @Nested
    @DisplayName("トークン検証機能")
    class TokenValidationTests {

        @Test
        @DisplayName("正常: 有効なトークンの検証成功")
        void validateToken_ValidToken_ShouldReturnTrue() {
            // Given
            String token = jwtUtil.generateToken(
                    TestConfig.TestConstants.ADMIN_USERNAME, TestConfig.TestConstants.ADMIN_ROLE);

            // When
            boolean isValid = jwtUtil.validateToken(token);

            // Then
            assertTrue(isValid, "有効なトークンの検証が成功");
        }

        @Test
        @DisplayName("異常: 無効なトークンの検証失敗")
        void validateToken_InvalidToken_ShouldReturnFalse() {
            // Given
            String invalidToken = "invalid.jwt.token";

            // When
            boolean isValid = jwtUtil.validateToken(invalidToken);

            // Then
            assertFalse(isValid, "無効なトークンの検証が失敗");
        }

        @Test
        @DisplayName("異常: 空文字トークンの検証失敗")
        void validateToken_EmptyToken_ShouldReturnFalse() {
            // Given
            String emptyToken = "";

            // When
            boolean isValid = jwtUtil.validateToken(emptyToken);

            // Then
            assertFalse(isValid, "空文字トークンの検証が失敗");
        }

        @Test
        @DisplayName("異常: nullトークンの検証失敗")
        void validateToken_NullToken_ShouldReturnFalse() {
            // Given
            String nullToken = null;

            // When
            boolean isValid = jwtUtil.validateToken(nullToken);

            // Then
            assertFalse(isValid, "nullトークンの検証が失敗");
        }

        @Test
        @DisplayName("異常: 改ざんされたトークンの検証失敗")
        void validateToken_TamperedToken_ShouldReturnFalse() {
            // Given
            String validToken = jwtUtil.generateToken(
                    TestConfig.TestConstants.ADMIN_USERNAME, TestConfig.TestConstants.ADMIN_ROLE);
            String tamperedToken = validToken.substring(0, validToken.length() - 10) + "tampered123";

            // When
            boolean isValid = jwtUtil.validateToken(tamperedToken);

            // Then
            assertFalse(isValid, "改ざんされたトークンの検証が失敗");
        }
    }

    @Nested
    @DisplayName("トークン期限切れチェック機能")
    class TokenExpirationTests {

        @Test
        @DisplayName("正常: 有効期限内のトークンは期限切れではない")
        void isTokenExpired_ValidToken_ShouldReturnFalse() {
            // Given
            String token = jwtUtil.generateToken(
                    TestConfig.TestConstants.ADMIN_USERNAME, TestConfig.TestConstants.ADMIN_ROLE);

            // When
            boolean isExpired = jwtUtil.isTokenExpired(token);

            // Then
            assertFalse(isExpired, "有効期限内のトークンは期限切れではない");
        }

        @Test
        @DisplayName("異常: 無効なトークンは期限切れとして扱われる")
        void isTokenExpired_InvalidToken_ShouldReturnTrue() {
            // Given
            String invalidToken = "invalid.jwt.token";

            // When
            boolean isExpired = jwtUtil.isTokenExpired(invalidToken);

            // Then
            assertTrue(isExpired, "無効なトークンは期限切れとして扱われる");
        }

        @Test
        @DisplayName("異常: nullトークンは期限切れとして扱われる")
        void isTokenExpired_NullToken_ShouldReturnTrue() {
            // Given
            String nullToken = null;

            // When
            boolean isExpired = jwtUtil.isTokenExpired(nullToken);

            // Then
            assertTrue(isExpired, "nullトークンは期限切れとして扱われる");
        }

        @Test
        @DisplayName("正常: 期限切れトークンのテスト（短い有効期限で検証）")
        void isTokenExpired_ExpiredToken_ShouldReturnTrue() throws Exception {
            // Given: 極短い有効期限（1ミリ秒）でJwtUtilを設定
            JwtUtil shortExpirationJwtUtil = new JwtUtil();
            setPrivateField(shortExpirationJwtUtil, "secret", TestConfig.TestConstants.TEST_JWT_SECRET);
            setPrivateField(shortExpirationJwtUtil, "expiration", 1L); // 1ミリ秒

            String token = shortExpirationJwtUtil.generateToken(
                    TestConfig.TestConstants.ADMIN_USERNAME, TestConfig.TestConstants.ADMIN_ROLE);

            // トークン生成後に待機して期限切れにする
            Thread.sleep(10);

            // When
            boolean isExpired = shortExpirationJwtUtil.isTokenExpired(token);

            // Then
            assertTrue(isExpired, "期限切れトークンは期限切れとして判定される");
        }
    }

    @Nested
    @DisplayName("エッジケース・統合テスト")
    class EdgeCaseAndIntegrationTests {

        @Test
        @DisplayName("統合: トークン生成から検証までの完全フロー")
        void completeTokenFlow_ShouldWorkCorrectly() {
            // Given
            String username = TestConfig.TestConstants.EMPLOYEE_USERNAME;
            String role = TestConfig.TestConstants.EMPLOYEE_ROLE;

            // When: トークン生成
            String token = jwtUtil.generateToken(username, role);

            // Then: 生成されたトークンの完全検証
            assertNotNull(token, "トークンが生成される");
            assertTrue(jwtUtil.validateToken(token), "トークンが有効");
            assertFalse(jwtUtil.isTokenExpired(token), "トークンが期限切れではない");
            assertEquals(username, jwtUtil.getUsernameFromToken(token), "ユーザー名が正しく抽出される");
            assertEquals(role, jwtUtil.getRoleFromToken(token), "役職が正しく抽出される");
        }

        @Test
        @DisplayName("セキュリティ: 異なる秘密鍵で生成されたトークンは無効")
        void tokenWithDifferentSecret_ShouldBeInvalid() throws Exception {
            // Given: 異なる秘密鍵でJwtUtilを作成（256 bits以上の安全な長さ）
            JwtUtil differentSecretJwtUtil = new JwtUtil();
            setPrivateField(differentSecretJwtUtil, "secret", "differentSecretKeyForSecurityTestPurpose32BytesMin");
            setPrivateField(differentSecretJwtUtil, "expiration", TestConfig.TestConstants.TEST_JWT_EXPIRATION);

            String tokenWithDifferentSecret = differentSecretJwtUtil.generateToken(
                    TestConfig.TestConstants.ADMIN_USERNAME, TestConfig.TestConstants.ADMIN_ROLE);

            // When & Then: 元のJwtUtilでは無効なトークンとして扱われる
            assertFalse(jwtUtil.validateToken(tokenWithDifferentSecret),
                    "異なる秘密鍵で生成されたトークンは無効");
            assertTrue(jwtUtil.isTokenExpired(tokenWithDifferentSecret),
                    "異なる秘密鍵で生成されたトークンは期限切れとして扱われる");
        }

        @Test
        @DisplayName("境界値: 日本語文字を含むユーザー名と役職")
        void generateToken_JapaneseCharacters_ShouldWorkCorrectly() {
            // Given
            String japaneseUsername = "山田太郎";
            String japaneseRole = "課長代理";

            // When
            String token = jwtUtil.generateToken(japaneseUsername, japaneseRole);

            // Then
            assertNotNull(token);
            assertTrue(jwtUtil.validateToken(token));
            assertEquals(japaneseUsername, jwtUtil.getUsernameFromToken(token));
            assertEquals(japaneseRole, jwtUtil.getRoleFromToken(token));
        }

        @Test
        @DisplayName("境界値: 長いユーザー名と役職での動作確認")
        void generateToken_LongStrings_ShouldWorkCorrectly() {
            // Given
            String longUsername = TestConfig.TestUtils.generateLongString(100);
            String longRole = TestConfig.TestUtils.generateLongString(50);

            // When
            String token = jwtUtil.generateToken(longUsername, longRole);

            // Then
            assertNotNull(token);
            assertTrue(jwtUtil.validateToken(token));
            assertEquals(longUsername, jwtUtil.getUsernameFromToken(token));
            assertEquals(longRole, jwtUtil.getRoleFromToken(token));
        }
    }
}