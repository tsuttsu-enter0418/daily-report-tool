package com.example.dailyreport.unit.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
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
import com.example.dailyreport.entity.User;
import com.example.dailyreport.repository.UserRepository;
import com.example.dailyreport.service.UserService;

/**
 * Userメンテ機能のServiceクラス単体テスト この機能はTDDで開発
 *
 * テスト対象： - ユーザー覧取得 - ユーザー検索 - ユーザー削除 - ユーザー編集
 *
 * モック対象： - UserRepository: ユーザー検索をモック化
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserService 単体テスト")
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private List<User> activeUsers;

    @BeforeEach
    void setUp() {
        // アクティブユーザーリストの初期化
        activeUsers = new ArrayList<>();

        // アクティブユーザー
        User activeUser1 = User.builder().id(1L).username("ActiveUser1").email("test1@email.com")
                .role("部下").displayName("有効 太郎1").isActive(true).build();
        User activeUser2 = User.builder().id(2L).username("ActiveUser2").email("test2@email.com")
                .role("部下").displayName("有効 太郎2").isActive(true).build();
        activeUsers.add(activeUser1);
        activeUsers.add(activeUser2);
    }

    @Nested
    @DisplayName("正常系テスト")
    class SuccessTest {

        @Test
        @DisplayName("ユーザー一覧の初期表示（有効なユーザー）情報取得")
        void userService_GetUserInfo_Ok() {
            // Given：モックの設定
            when(userRepository.findByIsActiveTrue()).thenReturn(activeUsers);
            // When：ユーザー情報取得
            List<User> responseUsers = userService.getUsers();
            // Then：有効なユーザが返却される
            assertThat(responseUsers).isNotNull();
            assertThat(responseUsers.size()).isEqualTo(2);
            User user1 = responseUsers.get(0);
            assertThat(user1.getId()).isEqualTo(1L);
            assertThat(user1.getUsername()).isEqualTo("ActiveUser1");

            // モック呼び出し検証
            verify(userRepository, times(1)).findByIsActiveTrue();
        }
    }
}
