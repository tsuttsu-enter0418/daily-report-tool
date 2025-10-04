package com.example.dailyreport.unit.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.dailyreport.entity.User;
import com.example.dailyreport.repository.UserRepository;
import com.example.dailyreport.service.UserService;

/**
 * Userメンテ機能のServiceクラス単体テスト この機能はTDDで開発
 *
 * テスト対象：
 * - ユーザー一覧取得
 * - ユーザー検索
 * - ユーザー削除
 * - ユーザー編集
 *
 * モック対象：
 * - UserRepository: ユーザー検索をモック化
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserService 単体テスト")
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;
    private User activeUser1;
    private User activeUser2;

    @BeforeEach
    void setUp() {
        // アクティブユーザー
        LocalDate now = LocalDate.now();
        activeUser1 = User.builder().id(1L)
                .username("ActiveUser1")
                .email("test1@email.com")
                .role("部下")
                .displayName("有効 太郎1")
                .isActive(true)
                .build();
        activeUser2 = User.builder()
                .id(2L)
                .username("ActiveUser2")
                .email("test2@email.com")
                .role("部下")
                .displayName("有効 太郎2")
                .isActive(true)
                .build();
    }

    @Nested
    @DisplayName("正常系テスト")
    class SuccessTest {

        @Test
        @DisplayName("ユーザー一覧の初期表示情報(全件）取得")
        void userService_GetUserInfo_Ok() {
            // Given：モックの設定
            List<User> activeUsers = new ArrayList<>();
            activeUsers.add(activeUser1);
            activeUsers.add(activeUser2);
            when(userRepository.findAll()).thenReturn(activeUsers);
            // When：ユーザー情報取得
            List<User> responseUsers = userService.getUsers();
            // Then：有効なユーザが返却される
            assertThat(responseUsers).isNotNull();
            assertThat(responseUsers).hasSize(2);
            User user1 = responseUsers.get(0);
            assertThat(user1.getId()).isEqualTo(1L);
            assertThat(user1.getUsername()).isEqualTo("ActiveUser1");
            User user2 = responseUsers.get(1);
            assertThat(user2.getId()).isEqualTo(2L);
            assertThat(user2.getUsername()).isEqualTo("ActiveUser2");

            // モック呼び出し検証
            verify(userRepository, times(1)).findAll();
        }

        @Test
        @DisplayName("ユーザーのアクティブを切り替え")
        void userService_toggleUser_Ok() {
            // Given
            activeUser1.setIsActive(false);
            // When
            userService.changeValidUser(activeUser1);
            userService.changeValidUser(activeUser2);
            // Then
            verify(userRepository, times(1)).save(activeUser1);
            assertThat(activeUser1.getIsActive()).isEqualTo(true);
            verify(userRepository, times(1)).save(activeUser2);
            assertThat(activeUser2.getIsActive()).isEqualTo(false);

        }

        @Test
        @DisplayName("ユーザー削除を削除する")
        void userService_deleteUser_Ok() {
            // Given
            // When
            userService.deleteUser(activeUser1);
            // Then
            verify(userRepository, times(1)).delete(activeUser1);
        }

        @Test
        @DisplayName("ユーザー編集を行う")
        void userService_updateUser_Ok() {
            // Given
            // When
            userService.updateUser(activeUser1);
            // Then
            verify(userRepository, times(1)).save(activeUser1);
        }

        @Test
        @DisplayName("ユーザー登録を行う")
        void userService_createUser_Ok() {
            // Given
            String password = "password";
            String encodedPassword = "encodedPassword";
            User createUser = User.builder()
                    .username("newUser")
                    .email("new@email.com")
                    .displayName("新規次郎")
                    .role("部下")
                    .isActive(true)
                    .password(password)
                    .build();
            when(passwordEncoder.encode(createUser.getPassword())).thenReturn(encodedPassword);

            // When
            userService.createUser(createUser);

            // Then
            verify(passwordEncoder, times(1)).encode(password);
            verify(userRepository, times(1)).save(createUser);
            assertThat(createUser.getPassword()).isEqualTo(encodedPassword);
        }
    }
}
