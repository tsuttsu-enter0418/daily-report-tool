package com.example.dailyreport.unit.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;
import java.util.Arrays;
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
import com.example.dailyreport.dto.UserRequest;
import com.example.dailyreport.entity.User;
import com.example.dailyreport.repository.UserRepository;
import com.example.dailyreport.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * UserControllerクラスのユニットテスト
 *
 * <p>
 * テスト対象:
 * - ユーザー管理REST APIエンドポイント
 * - HTTPレスポンス形式・ステータスコード
 * - リクエスト・レスポンスJSONマッピング
 * - 認証・権限制御
 * - エラーハンドリング
 *
 * <p>
 * テスト方針:
 * - MockMvcによるWebレイヤーテスト
 * - UserService・UserRepositoryのモック化
 * - WithMockUserによる認証シミュレーション
 * - 正常系・異常系の包括的テスト
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "jwt.auth.enabled=true", // Unit testでも認証を有効化
        "debug.default.user.username=admin"
})
@DisplayName("UserController - ユーザー管理REST API")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @MockBean
    private UserRepository userRepository;

    private User testUser;
    private User adminUser;
    private User managerUser;
    private UserRequest createUserRequest;
    private UserRequest invalidUserRequest;
    private UserRequest updateUserRequest;

    @BeforeEach
    void setUp() {
        // 一般ユーザー作成
        testUser = User.builder()
                .id(1L)
                .username(TestConfig.TestConstants.EMPLOYEE_USERNAME)
                .email(TestConfig.TestConstants.EMPLOYEE_EMAIL)
                .password("encodedPassword")
                .role(TestConfig.TestConstants.EMPLOYEE_ROLE)
                .displayName("田中太郎")
                .supervisorId(2L)
                .isActive(true)
                .build();

        // 管理者ユーザー作成
        adminUser = User.builder()
                .id(3L)
                .username("admin")
                .email("admin@example.com")
                .password("encodedPassword")
                .role("管理者")
                .displayName("管理者")
                .isActive(true)
                .build();

        // 上司ユーザー作成
        managerUser = User.builder()
                .id(2L)
                .username(TestConfig.TestConstants.MANAGER_USERNAME)
                .email(TestConfig.TestConstants.MANAGER_EMAIL)
                .password("encodedPassword")
                .role(TestConfig.TestConstants.MANAGER_ROLE)
                .displayName("佐藤課長")
                .isActive(true)
                .build();
        // ユーザーリクエスト
        createUserRequest = UserRequest.builder()
                .username("testuser")
                .password("testpass123")
                .email("test@example.com")
                .displayName("テストユーザー")
                .role("部下")
                .build();
        invalidUserRequest = UserRequest.builder()
                .username("")
                .password("")
                .email("") // 重複しているメールアドレスを入力
                .displayName("")
                .role("")
                .build();
        updateUserRequest = UserRequest.builder()
                .username("testuser")
                .password("testpass123")
                .email("test@example.com")
                .displayName("テストユーザー")
                .role("部下")
                .build();
        // updateUser =
        // "{\"id\":\"1\",\"username\":\"testuser\",\"password\":\"testpass123\",\"email\":\"test@example.com\",\"displayName\":\"テストユーザー\",\"}";
    }

    @Nested
    @DisplayName("ユーザー一覧取得API")
    class GetUsersTests {

        @Test
        @WithMockUser(username = "admin", roles = { "管理者" })
        @DisplayName("ユーザー一覧を取得する")
        void getUsers_Ok() throws Exception {
            // - Given: 管理者ユーザーでログイン、ユーザー3人分のテストデータ準備
            List<User> users = Arrays.asList(testUser, managerUser, adminUser);
            // when(userService.checkIsAdmin("admin")).thenReturn(true);
            when(userRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
            when(userService.getUsers()).thenReturn(users);
            // - When: GET /user/?param=test を実行
            mockMvc.perform(get("/user/").param("loginUserId", "admin"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType("application/json;charset=UTF-8"))
                    .andExpect(content().contentType("application/json;charset=UTF-8"));
            verify(userService, times(1)).getUsers();
        }

        // TODO: 異常系 - 一般ユーザーがアクセスした場合は403返却
        @Test
        @WithMockUser(username = "test", roles = { "部下" })
        @DisplayName("一般ユーザーがアクセスした場合は403返却")
        void getUsers_Error() throws Exception {
            // - Given: 一般ユーザーでログイン
            // - When: GET /user/?param=test を実行 // - Then: ステータス403
            mockMvc.perform(get("/user/"))
                    .andExpect(status().is4xxClientError())
                    .andExpect(content().contentType("application/json;charset=UTF-8"))
                    .andExpect(jsonPath("$.message").value("この操作を実行する権限がありません"));
            verify(userService, times(0)).getUsers();

        }

        // TODO: 正常系 - ユーザーが存在しない場合は空配列返却
        @Test
        @WithMockUser(username = "admin", roles = { "管理者" })
        @DisplayName("ユーザー一覧を取得する")
        void getUsers_emptyReturn_Ok() throws Exception {
            // - Given: 管理者ユーザーでログイン、userService.getUsers()が空リスト返却
            when(userService.getUsers()).thenReturn(new ArrayList<>());
            // - When: GET /user/?param=test を実行 Then: ステータス200、空のJSON配列返却
            mockMvc.perform(get("/user/"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType("application/json;charset=UTF-8"));

            verify(userService, times(1)).getUsers();
        }

        // -

        // TODO: 異常系 - 認証なしで401返却
        @Test
        @DisplayName("認証なしで401返却")
        void getUsers_ErrorSkip() throws Exception {
            // - Given: 認証なし
            // - When: GET /user/?param=test を実行
            mockMvc.perform(get("/user/").param("loginUserId", "admin"))
                    .andExpect(status().isUnauthorized());
            // - Then: ステータス401、userService.getUsers()は呼ばれない
            verify(userService, times(0)).getUsers();
        }

    }

    @Nested
    @DisplayName("ユーザー作成API")
    class CreateUserTests {
        @Test
        @DisplayName("正常_ユーザーを作成する")
        @WithMockUser(username = "admin", roles = { "管理者" })
        void createUser_Ok() throws Exception {
            // - Given: 管理者ユーザーでログイン、正しいリクエストボディ
            // - When: POST /user/create に正しいJSONを送信
            mockMvc.perform(post("/user/create")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(createUserRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(content().contentType("application/json;charset=UTF-8"))
                    // ApiResponseの構造を検証
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").value("ユーザーを作成しました"))
                    .andExpect(jsonPath("$.data").exists());
            // - Then: ステータス201、userService.createUser()が呼ばれる
            verify(userService, times(1)).createUser(any(User.class));
        }

        @Test
        @DisplayName("異常_バリデーションエラー")
        @WithMockUser(username = "admin", roles = { "管理者" })
        void createUser_validationError() throws Exception {
            // - Given: 管理者ユーザーでログイン、不正なリクエストボディ（全フィールド空文字）
            // - When: POST /user/create に不正なJSONを送信
            // TODO: 現状はレスポンスボディが空（400ステータスのみ）
            // 将来的にバリデーションエラー詳細をレスポンスボディに含める場合は、
            // このテストケースを拡張してエラーメッセージの検証を追加すること
            mockMvc.perform(post("/user/create")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidUserRequest)))
                    .andExpect(status().isBadRequest());
            // - Then: createUser()は呼ばれない
            verify(userService, times(0)).createUser(any(User.class));
        }

        @Test
        @WithMockUser(username = "admin", roles = { "管理者" })
        @DisplayName("Serviceにて異常終了")
        void createUser_Error() throws Exception {
            // Given: 管理者ユーザーでログイン、正しいリクエストボディでExceptionを返す
            doThrow(new RuntimeException()).when(userService).createUser(any(User.class));
            // When: POST /user/create に正しいJSONを送信
            // Then: ステータス500、userService.createUser()が呼ばれる
            mockMvc.perform(post("/user/create")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(createUserRequest)))
                    .andExpect(status().isInternalServerError())
                    .andExpect(content().contentType("application/json;charset=UTF-8"))
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.message").exists());
        }
    }

    @Nested
    @DisplayName("ユーザー更新API")
    class UpdateUserTests {
        @Test
        @DisplayName("正常_ユーザーを更新する")
        @WithMockUser(username = "admin", roles = { "管理者" })
        void updateUser_Ok() throws Exception {
            // - Given: 管理者ユーザーでログイン、正しいリクエストボディ
            // - When: POST /user/update に正しいJSONを送信
            mockMvc.perform(post("/user/update")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(updateUserRequest)))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType("application/json;charset=UTF-8"))
                    // ApiResponseの構造を検証
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").value("ユーザーを更新しました"))
                    .andExpect(jsonPath("$.data").exists());
            // - Then: ステータス200、userService.updateUser()が呼ばれる
            verify(userService, times(1)).updateUser(any(User.class));
        }

        @Test
        @DisplayName("異常_バリデーションエラー")
        @WithMockUser(username = "admin", roles = { "管理者" })
        void updateUser_validationError() throws Exception {
            // - Given: 管理者ユーザーでログイン、不正なリクエストボディ（全フィールド空文字）
            // - When: POST /user/update に不正なJSONを送信
            // TODO: 現状はレスポンスボディが空（400ステータスのみ）
            // 将来的にバリデーションエラー詳細をレスポンスボディに含める場合は、
            // このテストケースを拡張してエラーメッセージの検証を追加すること
            mockMvc.perform(post("/user/update")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidUserRequest)))
                    .andExpect(status().isBadRequest());
            // - Then: updateUser()は呼ばれない
            verify(userService, times(0)).updateUser(any(User.class));
        }

        @Test
        @DisplayName("異常_Serviceにて異常終了")
        @WithMockUser(username = "admin", roles = { "管理者" })
        void updateUser_Error() throws Exception {
            // Given: 管理者ユーザーでログイン、正しいリクエストボディでExceptionを返す
            doThrow(new RuntimeException()).when(userService).updateUser(any(User.class));
            // When: POST /user/update に正しいJSONを送信
            // Then: ステータス500、userService.updateUser()が呼ばれる
            mockMvc.perform(post("/user/update")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(updateUserRequest)))
                    .andExpect(status().isInternalServerError())
                    .andExpect(content().contentType("application/json;charset=UTF-8"))
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.message").exists());
        }
    }

    @Nested
    @DisplayName("認証・権限制御テスト")
    class AuthenticationAndAuthorizationTests {

        // TODO: 異常系 - 全エンドポイントで認証なしは401返却
        // - Given: 認証なし
        // - When: 各エンドポイントにアクセス
        // - Then: すべて401返却

        // TODO: 異常系 - 存在しないユーザーで認証エラー
        // - Given: 存在しないユーザー名でログイン
        // - When: GET /user/?param=test を実行
        // - Then: ステータス500（BaseControllerで例外発生）

        @Test
        @DisplayName("部下権限でアクセス")
        @WithMockUser(username = "test", roles = { TestConfig.TestConstants.EMPLOYEE_ROLE })
        void access_BukaRoll_denied() throws Exception {
            // Given

            // When&Then
            mockMvc.perform(get("/user/"))
                    // Then
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.message").value("この操作を実行する権限がありません"));
            verify(userService, times(0)).getUsers();
        }

    }
}
