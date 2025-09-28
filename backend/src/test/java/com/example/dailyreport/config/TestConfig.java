package com.example.dailyreport.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

/**
 * JUnitテスト用の共通設定クラス
 *
 * <p>機能: - テスト専用のBean設定 - テスト環境でのPasswordEncoder設定 - 共通テストユーティリティの提供 - モックオブジェクトの設定
 *
 * <p>使用方法: - テストクラスで @Import(TestConfig.class) で読み込み - または @SpringBootTest で自動読み込み
 *
 * <p>注意事項: - テスト環境でのみ使用されるConfiguration - プロダクション環境では読み込まれない - @TestConfiguration により自動的にテスト環境として認識
 */
@TestConfiguration
@ActiveProfiles("test")
public class TestConfig {

    /**
     * テスト用PasswordEncoderの設定
     *
     * <p>プロダクション環境と同じBCryptPasswordEncoderを使用するが、 テスト用の軽量設定（strength=4）で高速化
     *
     * @return BCryptPasswordEncoder テスト用パスワードエンコーダー
     */
    @Bean
    @Primary
    public PasswordEncoder testPasswordEncoder() {
        // テスト用に軽量設定（strength=4、デフォルトは10）
        // テスト実行時間を短縮しつつ、実際のBCrypt動作を確認
        return new BCryptPasswordEncoder(4);
    }

    /** テスト用の共通設定値定数クラス */
    public static class TestConstants {

        /** テスト用の共通パスワード（平文） */
        public static final String TEST_PASSWORD = "password";

        /** テスト用の共通パスワード（BCryptハッシュ化済み） */
        public static final String TEST_PASSWORD_ENCODED =
                "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.";

        /** テスト用JWT秘密鍵 */
        public static final String TEST_JWT_SECRET =
                "testSecretKeyForJunitTestingPurposesOnly123456789";

        /** テスト用JWT有効期限（1時間） */
        public static final long TEST_JWT_EXPIRATION = 3600000L;

        /** テスト用有効JWTトークン（モック用） */
        public static final String VALID_JWT_TOKEN =
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token";

        /** 管理者ユーザー情報 */
        public static final String ADMIN_USERNAME = "admin";

        public static final String ADMIN_EMAIL = "admin@company.com";
        public static final String ADMIN_ROLE = "管理者";

        /** 上長ユーザー情報 */
        public static final String MANAGER_USERNAME = "manager1";

        public static final String MANAGER_EMAIL = "manager1@company.com";
        public static final String MANAGER_ROLE = "上長";

        /** 部下ユーザー情報 */
        public static final String EMPLOYEE_USERNAME = "employee1";

        public static final String EMPLOYEE_EMAIL = "employee1@company.com";
        public static final String EMPLOYEE_ROLE = "部下";

        /** 無効ユーザー情報 */
        public static final String INVALID_USERNAME = "nonexistent";

        public static final String INVALID_PASSWORD = "wrongpassword";

        /** テスト用日報データ */
        public static final String TEST_REPORT_TITLE = "テスト用日報タイトル";

        public static final String TEST_REPORT_CONTENT = "テスト用の作業内容です。今日は新機能の実装を行いました。";
        public static final String UPDATED_REPORT_CONTENT = "更新されたテスト用の作業内容です。";

        /** ステータス定数 */
        public static final String STATUS_DRAFT = "draft";

        public static final String STATUS_SUBMITTED = "submitted";
    }

    /** テスト用のユーティリティメソッド */
    public static class TestUtils {

        /**
         * テスト用の固定日時を取得 テストの一貫性を保つため、固定の日時を返却
         *
         * @return 固定の日時文字列 "2024-01-15T10:00:00"
         */
        public static String getFixedTestDateTime() {
            return "2024-01-15T10:00:00";
        }

        /**
         * テスト用の固定日付を取得
         *
         * @return 固定の日付文字列 "2024-01-15"
         */
        public static String getFixedTestDate() {
            return "2024-01-15";
        }

        /**
         * 長い文字列を生成（バリデーションテスト用）
         *
         * @param length 生成する文字列の長さ
         * @return 指定された長さの文字列
         */
        public static String generateLongString(int length) {
            StringBuilder sb = new StringBuilder();
            String pattern = "あいうえおかきくけこ";
            for (int i = 0; i < length; i++) {
                sb.append(pattern.charAt(i % pattern.length()));
            }
            return sb.toString();
        }
    }
}
