-- テスト用初期データ挿入
-- パスワードは全て "password" をBCryptハッシュ化済み: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.

-- ユーザーデータ挿入（階層構造を含む）
INSERT INTO users (id, username, email, password, role, display_name, supervisor_id, is_active, created_at, updated_at) VALUES
-- 管理者
(1, 'admin', 'admin@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '管理者', '管理者太郎', NULL, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- 上長（管理者の下）
(2, 'manager1', 'manager1@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '上長', '田中上長', 1, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'manager2', 'manager2@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '上長', '佐藤課長', 1, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- 部下（上長の下）
(4, 'employee1', 'employee1@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '部下', '山田一郎', 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'employee2', 'employee2@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '部下', '鈴木花子', 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'employee3', 'employee3@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '部下', '高橋次郎', 3, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- 非アクティブユーザー（テスト用）
(7, 'inactive', 'inactive@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '部下', '退職者', 2, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 日報データ挿入
INSERT INTO daily_reports (id, user_id, title, work_content, status, report_date, submitted_at, created_at, updated_at) VALUES
-- 提出済み日報
(1, 4, '新機能開発進捗', 'ログイン機能の実装を完了しました。明日は権限管理機能の実装に取り組む予定です。', 'submitted', '2024-01-15', '2024-01-15 17:00:00', '2024-01-15 16:45:00', '2024-01-15 17:00:00'),
(2, 5, 'テスト実行結果', '単体テストの実装を進めました。カバレッジは80%を達成しています。', 'submitted', '2024-01-15', '2024-01-15 18:30:00', '2024-01-15 18:15:00', '2024-01-15 18:30:00'),
(3, 6, 'データベース設計', 'ユーザーテーブルとロールテーブルの設計を完了しました。', 'submitted', '2024-01-15', '2024-01-15 19:00:00', '2024-01-15 18:45:00', '2024-01-15 19:00:00'),

-- 下書き日報
(4, 4, 'API開発中', '認証APIの実装を開始しました。まだ途中段階です。', 'draft', '2024-01-16', NULL, '2024-01-16 14:00:00', '2024-01-16 14:30:00'),
(5, 5, 'バグ修正作業', 'フロントエンドのバリデーション処理にバグを発見しました。', 'draft', '2024-01-16', NULL, '2024-01-16 15:00:00', '2024-01-16 15:15:00'),

-- 過去の日報（複数日分）
(6, 4, '週次レビュー', '今週の成果をまとめました。予定通り進捗しています。', 'submitted', '2024-01-12', '2024-01-12 18:00:00', '2024-01-12 17:45:00', '2024-01-12 18:00:00'),
(7, 5, '研修参加報告', 'Spring Bootの研修に参加しました。新しい知識を習得できました。', 'submitted', '2024-01-12', '2024-01-12 19:30:00', '2024-01-12 19:15:00', '2024-01-12 19:30:00');

-- チームデータ挿入（将来機能用）
INSERT INTO teams (id, name, description, manager_id, is_active, created_at, updated_at) VALUES
(1, '開発チーム', 'システム開発を担当するチーム', 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'QAチーム', '品質保証を担当するチーム', 3, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ユーザー・チーム関連データ挿入
INSERT INTO user_teams (id, user_id, team_id, joined_at) VALUES
(1, 4, 1, CURRENT_TIMESTAMP),
(2, 5, 1, CURRENT_TIMESTAMP),
(3, 6, 2, CURRENT_TIMESTAMP);