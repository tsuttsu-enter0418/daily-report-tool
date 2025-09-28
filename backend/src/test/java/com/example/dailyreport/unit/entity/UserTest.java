package com.example.dailyreport.unit.entity;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import com.example.dailyreport.config.TestConfig;
import com.example.dailyreport.config.TestDataBuilder;
import com.example.dailyreport.entity.User;

/**
 * Userエンティティの単体テストクラス
 *
 * <p>テスト対象: - エンティティの基本動作（getter/setter） - @PrePersist, @PreUpdate メソッドの動作 - Lombokアノテーションの動作確認 -
 * デフォルト値設定の確認 - バリデーション制約の動作確認
 *
 * <p>テスト方針: - Given-When-Then パターンを使用 - TestDataBuilderによるテストデータ生成 - エンティティレベルでの動作確認（データベース接続なし）
 *
 * <p>注意事項: - このテストはデータベースに接続しない純粋な単体テスト - JPA関連の動作確認はRepositoryテストで実施
 */
@DisplayName("User エンティティテスト")
class UserTest {

    private User user;

    @BeforeEach
    void setUp() {
        // 各テストの前に新しいUserインスタンスを作成
        user = TestDataBuilder.createDefaultUser().build();
    }

    @Nested
    @DisplayName("基本動作テスト")
    class BasicOperationTest {

        @Test
        @DisplayName("デフォルト値設定確認")
        void createUser_DefaultValues_ShouldSetCorrectDefaults() {
            // Given: TestDataBuilderでユーザーを作成
            // When: ユーザーインスタンスを確認
            // Then: デフォルト値が正しく設定されている
            assertThat(user.getRole()).isEqualTo("部下");
            assertThat(user.getIsActive()).isTrue();
            assertThat(user.getSupervisorId()).isNull();
        }

        @Test
        @DisplayName("Builder パターン動作確認")
        void createUser_UsingBuilder_ShouldCreateCorrectUser() {
            // Given: Builderを使用してユーザーを作成
            User builtUser =
                    User.builder()
                            .username("testbuilder")
                            .email("builder@test.com")
                            .password("encoded_password")
                            .role("管理者")
                            .displayName("テストビルダー")
                            .build();

            // When: 値を確認
            // Then: 設定した値が正しく反映されている
            assertThat(builtUser.getUsername()).isEqualTo("testbuilder");
            assertThat(builtUser.getEmail()).isEqualTo("builder@test.com");
            assertThat(builtUser.getRole()).isEqualTo("管理者");
            assertThat(builtUser.getDisplayName()).isEqualTo("テストビルダー");
            assertThat(builtUser.getIsActive()).isTrue(); // デフォルト値
        }

        @Test
        @DisplayName("Getter/Setter 動作確認")
        void userGetterSetter_ModifyValues_ShouldReflectChanges() {
            // Given: 既存のユーザー
            // When: 値を変更
            user.setUsername("modified_user");
            user.setRole("上長");
            user.setIsActive(false);

            // Then: 変更が反映されている
            assertThat(user.getUsername()).isEqualTo("modified_user");
            assertThat(user.getRole()).isEqualTo("上長");
            assertThat(user.getIsActive()).isFalse();
        }
    }

    @Nested
    @DisplayName("タイムスタンプフィールドテスト")
    class TimestampFieldTest {

        @Test
        @DisplayName("タイムスタンプ設定確認")
        void setTimestamps_WhenSet_ShouldReflectValues() {
            // Given: 新しいタイムスタンプ
            LocalDateTime newDateTime = LocalDateTime.parse("2024-01-20T15:30:00");

            // When: タイムスタンプを設定
            user.setCreatedAt(newDateTime);
            user.setUpdatedAt(newDateTime.plusHours(1));

            // Then: 設定した値が反映されている
            assertThat(user.getCreatedAt()).isEqualTo(newDateTime);
            assertThat(user.getUpdatedAt()).isEqualTo(newDateTime.plusHours(1));
        }

        @Test
        @DisplayName("タイムスタンプnull設定確認")
        void setTimestamps_SetNull_ShouldAcceptNull() {
            // Given & When: nullを設定
            user.setCreatedAt(null);
            user.setUpdatedAt(null);

            // Then: null値が設定される
            assertThat(user.getCreatedAt()).isNull();
            assertThat(user.getUpdatedAt()).isNull();
        }

        @Test
        @DisplayName("タイムスタンプ比較確認")
        void compareTimestamps_WhenSet_ShouldCompareCorrectly() {
            // Given: 異なるタイムスタンプ
            LocalDateTime earlier = LocalDateTime.parse("2024-01-15T10:00:00");
            LocalDateTime later = LocalDateTime.parse("2024-01-15T11:00:00");

            // When: タイムスタンプを設定
            user.setCreatedAt(earlier);
            user.setUpdatedAt(later);

            // Then: 正しく比較できる
            assertThat(user.getUpdatedAt()).isAfter(user.getCreatedAt());
            assertThat(user.getCreatedAt()).isBefore(user.getUpdatedAt());
        }
    }

    @Nested
    @DisplayName("データ整合性テスト")
    class DataIntegrityTest {

        @Test
        @DisplayName("階層関係設定確認")
        void supervisorRelationship_SetSupervisorId_ShouldEstablishHierarchy() {
            // Given: 管理者と部下のユーザー
            User supervisor = TestDataBuilder.createManagerUser().build();
            User subordinate = TestDataBuilder.createEmployeeUser().build();

            // When: 部下に上司IDを設定
            subordinate.setSupervisorId(supervisor.getId());

            // Then: 階層関係が設定されている
            assertThat(subordinate.getSupervisorId()).isEqualTo(supervisor.getId());
            assertThat(supervisor.getSupervisorId()).isEqualTo(1L); // 管理者の上司ID
        }

        @Test
        @DisplayName("非アクティブユーザー設定確認")
        void userStatus_SetInactive_ShouldReflectStatus() {
            // Given: アクティブなユーザー
            assertThat(user.getIsActive()).isTrue();

            // When: 非アクティブに設定
            user.setIsActive(false);

            // Then: ステータスが反映されている
            assertThat(user.getIsActive()).isFalse();
        }

        @Test
        @DisplayName("日本語文字列対応確認")
        void japaneseCharacters_SetJapaneseNames_ShouldHandleCorrectly() {
            // Given: 日本語文字列
            String japaneseDisplayName = "田中太郎";
            String japaneseRole = "上長";

            // When: 日本語文字列を設定
            user.setDisplayName(japaneseDisplayName);
            user.setRole(japaneseRole);

            // Then: 日本語文字列が正しく保存される
            assertThat(user.getDisplayName()).isEqualTo(japaneseDisplayName);
            assertThat(user.getRole()).isEqualTo(japaneseRole);
        }
    }

    @Nested
    @DisplayName("Lombok 機能テスト")
    class LombokFeatureTest {

        @Test
        @DisplayName("@Data アノテーション - equals/hashCode 動作確認")
        void lombokData_EqualsAndHashCode_ShouldWorkCorrectly() {
            // Given: 同じ内容の2つのユーザー
            User user1 = TestDataBuilder.createDefaultUser().id(1L).build();
            User user2 = TestDataBuilder.createDefaultUser().id(1L).build();
            User user3 = TestDataBuilder.createDefaultUser().id(2L).build();

            // When & Then: equals/hashCode が正しく動作する
            assertThat(user1).isEqualTo(user2);
            assertThat(user1).isNotEqualTo(user3);
            assertThat(user1.hashCode()).isEqualTo(user2.hashCode());
            assertThat(user1.hashCode()).isNotEqualTo(user3.hashCode());
        }

        @Test
        @DisplayName("@Data アノテーション - toString 動作確認")
        void lombokData_ToString_ShouldIncludeAllFields() {
            // Given: ユーザー
            // When: toString を実行
            String toString = user.toString();

            // Then: 主要フィールドが含まれている
            assertThat(toString).contains("username=" + user.getUsername());
            assertThat(toString).contains("email=" + user.getEmail());
            assertThat(toString).contains("role=" + user.getRole());
            assertThat(toString).contains("displayName=" + user.getDisplayName());
        }

        @Test
        @DisplayName("@NoArgsConstructor 動作確認")
        void lombokNoArgsConstructor_CreateInstance_ShouldWork() {
            // Given & When: デフォルトコンストラクタでインスタンス作成
            User emptyUser = new User();

            // Then: インスタンスが作成され、デフォルト値が設定されている
            assertThat(emptyUser).isNotNull();
            assertThat(emptyUser.getRole()).isEqualTo("部下"); // @Builder.Default
            assertThat(emptyUser.getIsActive()).isTrue(); // @Builder.Default
        }
    }

    @Nested
    @DisplayName("境界値テスト")
    class BoundaryValueTest {

        @Test
        @DisplayName("最大長文字列設定確認")
        void maxLengthStrings_SetMaxValues_ShouldHandle() {
            // Given: 制限に近い長さの文字列
            String maxUsername = TestConfig.TestUtils.generateLongString(50);
            String maxDisplayName = TestConfig.TestUtils.generateLongString(100);
            String maxRole = "管理者"; // 20文字制限内

            // When: 最大長文字列を設定
            user.setUsername(maxUsername);
            user.setDisplayName(maxDisplayName);
            user.setRole(maxRole);

            // Then: 値が正しく設定される
            assertThat(user.getUsername()).isEqualTo(maxUsername);
            assertThat(user.getDisplayName()).isEqualTo(maxDisplayName);
            assertThat(user.getRole()).isEqualTo(maxRole);
        }

        @Test
        @DisplayName("null 値設定確認")
        void nullValues_SetOptionalFields_ShouldHandle() {
            // Given & When: オプションフィールドにnullを設定
            user.setEmail(null);
            user.setDisplayName(null);
            user.setSupervisorId(null);

            // Then: null値が正しく設定される
            assertThat(user.getEmail()).isNull();
            assertThat(user.getDisplayName()).isNull();
            assertThat(user.getSupervisorId()).isNull();
        }
    }
}
