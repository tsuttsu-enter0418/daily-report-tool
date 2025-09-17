package com.example.dailyreport.unit.repository;

import static org.assertj.core.api.Assertions.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import com.example.dailyreport.entity.User;
import com.example.dailyreport.repository.UserRepository;

/**
 * UserRepositoryの単体テスト
 * 
 * テスト対象: - findByUsername メソッド - findByEmail メソッド - findBySupervisorId メソッド - カスタムクエリメソッドの動作確認
 * 
 * 使用技術: - @DataJpaTest: JPA Repository層のスライステスト - TestEntityManager: JPA テスト用のエンティティ管理 - H2
 * Database: インメモリテストDB
 */
@DataJpaTest
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@TestPropertySource(properties = {"spring.jpa.defer-datasource-initialization=false",
        "spring.sql.init.mode=never"})
@DisplayName("UserRepository テスト")
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    private User testUser;
    private User managerUser;
    private User subordinateUser;
    private String dateTimeString;

    @BeforeEach
    void setUp() {
        // データベースを完全にクリアしてからテストデータを準備
        entityManager.clear();
        dateTimeString = System.currentTimeMillis() + "";

        // Given: テストデータの準備（IDを明示的に設定しない）
        managerUser = User.builder().username("manager_" + dateTimeString)
                .email("manager" + dateTimeString + "@company.com").password("encoded_password")
                .role("管理者").displayName("管理者太郎").supervisorId(null).isActive(true).build();
        managerUser = entityManager.persistAndFlush(managerUser);

        testUser = User.builder().username("testuser_" + dateTimeString)
                .email("testuser" + dateTimeString + "@company.com").password("encoded_password")
                .role("上長").displayName("上長花子").supervisorId(managerUser.getId()).isActive(true)
                .build();
        testUser = entityManager.persistAndFlush(testUser);

        subordinateUser = User.builder().username("subordinate_" + dateTimeString)
                .email("subordinate" + dateTimeString + "@company.com").password("encoded_password")
                .role("部下").displayName("部下次郎").supervisorId(testUser.getId()).isActive(true)
                .build();
        subordinateUser = entityManager.persistAndFlush(subordinateUser);

        // テスト前の状態をクリア（キャッシュ対策）
        entityManager.clear();
    }

    @Nested
    @DisplayName("findByUsername メソッドテスト")
    class FindByUsernameTest {

        @Test
        @DisplayName("存在するユーザー名で検索 - 正常取得")
        void findByUsername_ExistingUser_ShouldReturnUser() {
            // When: 存在するユーザー名で検索
            Optional<User> result = userRepository.findByUsername(testUser.getUsername());

            // Then: ユーザーが取得できる
            assertThat(result).isPresent();
            assertThat(result.get().getUsername()).isEqualTo(testUser.getUsername());
            assertThat(result.get().getEmail()).isEqualTo(testUser.getEmail());
            assertThat(result.get().getRole()).isEqualTo("上長");
        }

        @Test
        @DisplayName("存在しないユーザー名で検索 - 空の結果")
        void findByUsername_NonExistingUser_ShouldReturnEmpty() {
            // When: 存在しないユーザー名で検索
            Optional<User> result = userRepository.findByUsername("nonexistent");

            // Then: 空の結果が返る
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("null値で検索 - 例外またはfalse")
        void findByUsername_NullUsername_ShouldHandleGracefully() {
            // When & Then: null値の場合の動作確認
            Optional<User> result = userRepository.findByUsername(null);
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("findByEmail メソッドテスト")
    class FindByEmailTest {

        @Test
        @DisplayName("存在するメールアドレスで検索 - 正常取得")
        void findByEmail_ExistingEmail_ShouldReturnUser() {
            // given：対象のデータ
            String targetEmail = "testuser" + dateTimeString + "@company.com";
            String targetUsername = "testuser_" + dateTimeString;
            // When: 存在するメールアドレスで検索
            Optional<User> result = userRepository.findByEmail(testUser.getEmail());

            // Then: ユーザーが取得できる
            assertThat(result).isPresent();
            assertThat(result.get().getEmail()).isEqualTo(targetEmail);
            assertThat(result.get().getUsername()).isEqualTo(targetUsername);
        }

        @Test
        @DisplayName("大文字小文字の違いを考慮した検索")
        void findByEmail_CaseSensitive_ShouldRespectCase() {
            // When: 大文字でメールアドレス検索
            Optional<User> result = userRepository.findByEmail("TESTUSER@COMPANY.COM");

            // Then: 大文字小文字が区別される場合は見つからない
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("findBySupervisorId メソッドテスト")
    class FindBySupervisorIdTest {

        @Test
        @DisplayName("上司IDで部下を検索 - リスト取得")
        void findBySupervisorId_ExistingSupervisor_ShouldReturnSubordinates() {
            // given
            String targetUsername = "subordinate_" + dateTimeString;
            // When: 上司IDで部下を検索
            List<User> subordinates = userRepository.findBySupervisorId(testUser.getId());

            // Then: 部下のリストが取得できる
            assertThat(subordinates).hasSize(1);
            assertThat(subordinates.get(0).getUsername()).isEqualTo(targetUsername);
            assertThat(subordinates.get(0).getSupervisorId()).isEqualTo(testUser.getId());
        }

        @Test
        @DisplayName("部下が存在しない上司ID - 空のリスト")
        void findBySupervisorId_NoSubordinates_ShouldReturnEmptyList() {
            // When: 部下が存在しない上司IDで検索
            List<User> subordinates = userRepository.findBySupervisorId(subordinateUser.getId());

            // Then: 空のリストが返る
            assertThat(subordinates).isEmpty();
        }

        @Test
        @DisplayName("存在しない上司ID - 空のリスト")
        void findBySupervisorId_NonExistingSupervisor_ShouldReturnEmptyList() {
            // When: 存在しない上司IDで検索
            List<User> subordinates = userRepository.findBySupervisorId(99999L);

            // Then: 空のリストが返る
            assertThat(subordinates).isEmpty();
        }
    }

    @Nested
    @DisplayName("基本的なCRUD操作テスト")
    class BasicCrudTest {

        @Test
        @DisplayName("新しいユーザーの保存")
        void save_NewUser_ShouldPersistCorrectly() {
            // Given: 新しいユーザー
            User newUser = User.builder().username("newuser").email("newuser@company.com")
                    .password("password").role("部下").displayName("新規ユーザー").isActive(true).build();

            // When: 保存
            User savedUser = userRepository.save(newUser);

            // Then: 正しく保存され、IDが生成される
            assertThat(savedUser.getId()).isNotNull();
            assertThat(savedUser.getUsername()).isEqualTo("newuser");
            assertThat(savedUser.getIsActive()).isTrue(); // デフォルト値
        }

        @Test
        @DisplayName("既存ユーザーの更新")
        void save_ExistingUser_ShouldUpdateCorrectly() {
            // Given: 既存ユーザーの変更
            testUser.setDisplayName("更新された名前");
            testUser.setRole("管理者");

            // When: 更新
            User updatedUser = userRepository.save(testUser);

            // Then: 変更が反映される
            assertThat(updatedUser.getId()).isEqualTo(testUser.getId());
            assertThat(updatedUser.getDisplayName()).isEqualTo("更新された名前");
            assertThat(updatedUser.getRole()).isEqualTo("管理者");
        }

        @Test
        @DisplayName("ユーザー削除")
        void delete_ExistingUser_ShouldRemoveFromDatabase() {
            // Given: 削除対象のユーザーID
            Long userIdToDelete = subordinateUser.getId();

            // When: ユーザー削除
            userRepository.deleteById(userIdToDelete);
            entityManager.flush(); // 強制的にDB反映

            // Then: ユーザーが削除されている
            Optional<User> deletedUser = userRepository.findById(userIdToDelete);
            assertThat(deletedUser).isEmpty();
        }
    }

    @Nested
    @DisplayName("データ整合性テスト")
    class DataIntegrityTest {

        @Test
        @DisplayName("一意制約違反 - 重複ユーザー名")
        void save_DuplicateUsername_ShouldThrowException() {
            // Given: 既存と同じユーザー名の新しいユーザー
            User duplicateUser = User.builder().username("testuser001") // 既存と重複
                    .email("different@company.com").password("password").role("部下")
                    .displayName("重複ユーザー").build();

            // When & Then: 一意制約違反で例外発生
            assertThatThrownBy(() -> {
                userRepository.save(duplicateUser);
                entityManager.flush(); // 強制的にDB制約チェック
            }).isInstanceOf(Exception.class);
        }

        @Test
        @DisplayName("階層関係の確認")
        void hierarchicalRelationship_SupervisorSubordinate_ShouldMaintainConsistency() {
            // When: 階層関係の確認
            List<User> managersSubordinates =
                    userRepository.findBySupervisorId(managerUser.getId());
            List<User> testuserSubordinates = userRepository.findBySupervisorId(testUser.getId());

            // Then: 階層構造が正しく維持されている
            assertThat(managersSubordinates).hasSize(1);
            assertThat(managersSubordinates.get(0).getUsername())
                    .isEqualTo("testuser_" + dateTimeString);

            assertThat(testuserSubordinates).hasSize(1);
            assertThat(testuserSubordinates.get(0).getUsername())
                    .isEqualTo("subordinate_" + dateTimeString);
        }
    }

    @Nested
    @DisplayName("パフォーマンステスト")
    class PerformanceTest {

        @Test
        @DisplayName("大量データでの検索性能")
        void findByUsername_WithLargeDataset_ShouldPerformEfficiently() {
            // Given: 大量のテストデータ作成
            String targetUsername = null;
            long timestamp = System.currentTimeMillis();

            for (int i = 0; i < 100; i++) {
                String username = "bulkuser" + i + "_" + timestamp;
                User user = User.builder().username(username)
                        .email("bulkuser" + i + "_" + timestamp + "@company.com")
                        .password("password").role("部下").displayName("バルクユーザー" + i)
                        .supervisorId(testUser.getId()).isActive(true).build();
                entityManager.persist(user);

                // 50番目のユーザー名を保存（検索対象）
                if (i == 50) {
                    targetUsername = username;
                }
            }
            entityManager.flush();

            // When: 検索実行（時間測定）
            long startTime = System.currentTimeMillis();
            Optional<User> result = userRepository.findByUsername(targetUsername);
            long endTime = System.currentTimeMillis();

            // Then: 合理的な時間内で結果取得
            assertThat(result).isPresent();
            assertThat(endTime - startTime).isLessThan(1000); // 1秒以内
        }
    }
}
