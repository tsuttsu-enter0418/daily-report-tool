package com.example.dailyreport.unit.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.dailyreport.dto.LoginRequest;
import com.example.dailyreport.dto.LoginResponse;
import com.example.dailyreport.entity.User;
import com.example.dailyreport.repository.UserRepository;
import com.example.dailyreport.security.JwtUtil;
import com.example.dailyreport.service.AuthService;

/**
 * AuthServiceの単体テスト
 * 
 * テスト対象:
 * - authenticateUser メソッド
 * - ユーザー認証ロジック
 * - パスワード検証
 * - JWTトークン生成
 * - エラーハンドリング
 * 
 * モック対象:
 * - UserRepository: ユーザー検索をモック化
 * - PasswordEncoder: パスワード検証をモック化  
 * - JwtUtil: JWT生成をモック化
 * 
 * テストパターン:
 * - 正常系: 有効な認証情報での成功ケース
 * - 異常系: 無効な認証情報での失敗ケース
 * - 境界値: 特殊な値での動作確認
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService 単体テスト")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private LoginRequest validLoginRequest;
    private User validUser;
    private String generatedToken;

    @BeforeEach
    void setUp() {
        // Given: 共通テストデータ準備
        validLoginRequest = LoginRequest.builder()
                .username("testuser")
                .password("password123")
                .build();

        validUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("testuser@company.com")
                .password("$2a$10$encoded.password.hash")
                .role("部下")
                .displayName("テストユーザー")
                .isActive(true)
                .build();

        generatedToken = "jwt.token.example.123";
    }

    @Nested
    @DisplayName("正常系テスト")
    class SuccessTest {

        @Test
        @DisplayName("有効な認証情報で認証成功")
        void authenticateUser_ValidCredentials_ShouldReturnLoginResponse() {
            // Given: モックの動作設定
            when(userRepository.findByUsername("testuser"))
                    .thenReturn(Optional.of(validUser));
            when(passwordEncoder.matches("password123", validUser.getPassword()))
                    .thenReturn(true);
            when(jwtUtil.generateToken("testuser", "部下"))
                    .thenReturn(generatedToken);

            // When: 認証実行
            LoginResponse response = authService.authenticateUser(validLoginRequest);

            // Then: 期待する結果が返る
            assertThat(response).isNotNull();
            assertThat(response.getToken()).isEqualTo(generatedToken);
            assertThat(response.getId()).isEqualTo("1");
            assertThat(response.getUsername()).isEqualTo("testuser");
            assertThat(response.getEmail()).isEqualTo("testuser@company.com");
            assertThat(response.getRole()).isEqualTo("部下");
            assertThat(response.getDisplayName()).isEqualTo("テストユーザー");

            // モック呼び出し検証
            verify(userRepository, times(1)).findByUsername("testuser");
            verify(passwordEncoder, times(1)).matches("password123", validUser.getPassword());
            verify(jwtUtil, times(1)).generateToken("testuser", "部下");
        }

        @Test
        @DisplayName("displayNameがnullの場合はusernameをフォールバック")
        void authenticateUser_NullDisplayName_ShouldFallbackToUsername() {
            // Given: displayNameがnullのユーザー
            User userWithNullDisplayName = User.builder()
                    .id(1L)
                    .username("testuser")
                    .email("testuser@company.com")
                    .password("encoded.password")
                    .role("部下")
                    .displayName(null)
                    .isActive(true)
                    .build();

            when(userRepository.findByUsername("testuser"))
                    .thenReturn(Optional.of(userWithNullDisplayName));
            when(passwordEncoder.matches("password123", userWithNullDisplayName.getPassword()))
                    .thenReturn(true);
            when(jwtUtil.generateToken("testuser", "部下"))
                    .thenReturn(generatedToken);

            // When: 認証実行
            LoginResponse response = authService.authenticateUser(validLoginRequest);

            // Then: usernameがdisplayNameとして使用される
            assertThat(response.getDisplayName()).isEqualTo("testuser");
        }

        @Test
        @DisplayName("displayNameが空文字の場合はusernameをフォールバック")
        void authenticateUser_EmptyDisplayName_ShouldFallbackToUsername() {
            // Given: displayNameが空文字のユーザー
            User userWithEmptyDisplayName = User.builder()
                    .id(1L)
                    .username("testuser")
                    .email("testuser@company.com")
                    .password("encoded.password")
                    .role("部下")
                    .displayName("   ")  // 空白のみ
                    .isActive(true)
                    .build();

            when(userRepository.findByUsername("testuser"))
                    .thenReturn(Optional.of(userWithEmptyDisplayName));
            when(passwordEncoder.matches("password123", userWithEmptyDisplayName.getPassword()))
                    .thenReturn(true);
            when(jwtUtil.generateToken("testuser", "部下"))
                    .thenReturn(generatedToken);

            // When: 認証実行
            LoginResponse response = authService.authenticateUser(validLoginRequest);

            // Then: usernameがdisplayNameとして使用される
            assertThat(response.getDisplayName()).isEqualTo("testuser");
        }

        @Test
        @DisplayName("管理者ロールでの認証成功")
        void authenticateUser_AdminRole_ShouldAuthenticateSuccessfully() {
            // Given: 管理者ユーザー
            User adminUser = User.builder()
                    .id(2L)
                    .username("admin")
                    .email("admin@company.com")
                    .password("encoded.admin.password")
                    .role("管理者")
                    .displayName("管理者")
                    .isActive(true)
                    .build();

            LoginRequest adminLoginRequest = LoginRequest.builder()
                    .username("admin")
                    .password("adminpassword")
                    .build();

            when(userRepository.findByUsername("admin"))
                    .thenReturn(Optional.of(adminUser));
            when(passwordEncoder.matches("adminpassword", adminUser.getPassword()))
                    .thenReturn(true);
            when(jwtUtil.generateToken("admin", "管理者"))
                    .thenReturn("admin.jwt.token");

            // When: 管理者認証実行
            LoginResponse response = authService.authenticateUser(adminLoginRequest);

            // Then: 管理者として認証成功
            assertThat(response.getRole()).isEqualTo("管理者");
            assertThat(response.getUsername()).isEqualTo("admin");
            assertThat(response.getToken()).isEqualTo("admin.jwt.token");
        }
    }

    @Nested
    @DisplayName("異常系テスト")
    class ErrorTest {

        @Test
        @DisplayName("存在しないユーザー名で認証失敗")
        void authenticateUser_UserNotFound_ShouldThrowException() {
            // Given: 存在しないユーザー
            LoginRequest invalidUserRequest = LoginRequest.builder()
                    .username("nonexistent")
                    .password("password123")
                    .build();

            when(userRepository.findByUsername("nonexistent"))
                    .thenReturn(Optional.empty());

            // When & Then: 例外発生を検証
            assertThatThrownBy(() -> authService.authenticateUser(invalidUserRequest))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("ユーザーが見つかりません");

            // パスワード検証やJWT生成が実行されないことを確認
            verify(passwordEncoder, never()).matches(anyString(), anyString());
            verify(jwtUtil, never()).generateToken(anyString(), anyString());
        }

        @Test
        @DisplayName("間違ったパスワードで認証失敗")
        void authenticateUser_WrongPassword_ShouldThrowException() {
            // Given: 正しいユーザー、間違ったパスワード
            LoginRequest wrongPasswordRequest = LoginRequest.builder()
                    .username("testuser")
                    .password("wrongpassword")
                    .build();

            when(userRepository.findByUsername("testuser"))
                    .thenReturn(Optional.of(validUser));
            when(passwordEncoder.matches("wrongpassword", validUser.getPassword()))
                    .thenReturn(false);

            // When & Then: 例外発生を検証
            assertThatThrownBy(() -> authService.authenticateUser(wrongPasswordRequest))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("パスワードが正しくありません");

            // JWT生成が実行されないことを確認
            verify(jwtUtil, never()).generateToken(anyString(), anyString());
        }

        @Test
        @DisplayName("null パスワードで認証失敗")
        void authenticateUser_NullPassword_ShouldThrowException() {
            // Given: nullパスワード
            LoginRequest nullPasswordRequest = LoginRequest.builder()
                    .username("testuser")
                    .password(null)
                    .build();

            when(userRepository.findByUsername("testuser"))
                    .thenReturn(Optional.of(validUser));
            when(passwordEncoder.matches(null, validUser.getPassword()))
                    .thenReturn(false);

            // When & Then: 例外発生を検証
            assertThatThrownBy(() -> authService.authenticateUser(nullPasswordRequest))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("パスワードが正しくありません");
        }

        @Test
        @DisplayName("空文字パスワードで認証失敗")
        void authenticateUser_EmptyPassword_ShouldThrowException() {
            // Given: 空文字パスワード
            LoginRequest emptyPasswordRequest = LoginRequest.builder()
                    .username("testuser")
                    .password("")
                    .build();

            when(userRepository.findByUsername("testuser"))
                    .thenReturn(Optional.of(validUser));
            when(passwordEncoder.matches("", validUser.getPassword()))
                    .thenReturn(false);

            // When & Then: 例外発生を検証
            assertThatThrownBy(() -> authService.authenticateUser(emptyPasswordRequest))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("パスワードが正しくありません");
        }
    }

    @Nested
    @DisplayName("依存関係との連携テスト")
    class IntegrationWithDependenciesTest {

        @Test
        @DisplayName("UserRepositoryが複数回呼び出されないことを確認")
        void authenticateUser_ShouldCallUserRepositoryOnlyOnce() {
            // Given
            when(userRepository.findByUsername("testuser"))
                    .thenReturn(Optional.of(validUser));
            when(passwordEncoder.matches("password123", validUser.getPassword()))
                    .thenReturn(true);
            when(jwtUtil.generateToken("testuser", "部下"))
                    .thenReturn(generatedToken);

            // When
            authService.authenticateUser(validLoginRequest);

            // Then: UserRepositoryは1回だけ呼び出される
            verify(userRepository, times(1)).findByUsername("testuser");
            verify(userRepository, only()).findByUsername("testuser");
        }

        @Test
        @DisplayName("JwtUtilが正しい引数で呼び出されることを確認")
        void authenticateUser_ShouldCallJwtUtilWithCorrectArguments() {
            // Given
            when(userRepository.findByUsername("testuser"))
                    .thenReturn(Optional.of(validUser));
            when(passwordEncoder.matches("password123", validUser.getPassword()))
                    .thenReturn(true);
            when(jwtUtil.generateToken(eq("testuser"), eq("部下")))
                    .thenReturn(generatedToken);

            // When
            authService.authenticateUser(validLoginRequest);

            // Then: JwtUtilが正確な引数で呼び出される
            verify(jwtUtil).generateToken("testuser", "部下");
        }

        @Test
        @DisplayName("PasswordEncoderがBCryptで検証することを確認")
        void authenticateUser_ShouldUsePasswordEncoderForVerification() {
            // Given
            when(userRepository.findByUsername("testuser"))
                    .thenReturn(Optional.of(validUser));
            when(passwordEncoder.matches(eq("password123"), eq(validUser.getPassword())))
                    .thenReturn(true);
            when(jwtUtil.generateToken("testuser", "部下"))
                    .thenReturn(generatedToken);

            // When
            authService.authenticateUser(validLoginRequest);

            // Then: PasswordEncoderが正確な引数で呼び出される
            verify(passwordEncoder).matches("password123", validUser.getPassword());
        }
    }

    @Nested
    @DisplayName("境界値・特殊ケーステスト")
    class BoundaryValueTest {

        @Test
        @DisplayName("非常に長いユーザー名での認証")
        void authenticateUser_VeryLongUsername_ShouldHandleCorrectly() {
            // Given: 長いユーザー名
            String longUsername = "a".repeat(100);
            LoginRequest longUsernameRequest = LoginRequest.builder()
                    .username(longUsername)
                    .password("password")
                    .build();

            User longUsernameUser = User.builder()
                    .id(1L)
                    .username(longUsername)
                    .email("longuser@company.com")
                    .password("encoded.password")
                    .role("部下")
                    .displayName("長い名前のユーザー")
                    .isActive(true)
                    .build();

            when(userRepository.findByUsername(longUsername))
                    .thenReturn(Optional.of(longUsernameUser));
            when(passwordEncoder.matches("password", longUsernameUser.getPassword()))
                    .thenReturn(true);
            when(jwtUtil.generateToken(longUsername, "部下"))
                    .thenReturn(generatedToken);

            // When: 認証実行
            LoginResponse response = authService.authenticateUser(longUsernameRequest);

            // Then: 正常に処理される
            assertThat(response).isNotNull();
            assertThat(response.getUsername()).isEqualTo(longUsername);
        }

        @Test
        @DisplayName("日本語文字が含まれるユーザー名での認証")
        void authenticateUser_JapaneseUsername_ShouldHandleCorrectly() {
            // Given: 日本語ユーザー名
            String japaneseUsername = "田中太郎";
            LoginRequest japaneseUsernameRequest = LoginRequest.builder()
                    .username(japaneseUsername)
                    .password("password")
                    .build();

            User japaneseUsernameUser = User.builder()
                    .id(1L)
                    .username(japaneseUsername)
                    .email("tanaka@company.com")
                    .password("encoded.password")
                    .role("上長")
                    .displayName("田中 太郎")
                    .isActive(true)
                    .build();

            when(userRepository.findByUsername(japaneseUsername))
                    .thenReturn(Optional.of(japaneseUsernameUser));
            when(passwordEncoder.matches("password", japaneseUsernameUser.getPassword()))
                    .thenReturn(true);
            when(jwtUtil.generateToken(japaneseUsername, "上長"))
                    .thenReturn(generatedToken);

            // When: 認証実行
            LoginResponse response = authService.authenticateUser(japaneseUsernameRequest);

            // Then: 日本語文字が正しく処理される
            assertThat(response).isNotNull();
            assertThat(response.getUsername()).isEqualTo("田中太郎");
            assertThat(response.getDisplayName()).isEqualTo("田中 太郎");
            assertThat(response.getRole()).isEqualTo("上長");
        }
    }
}