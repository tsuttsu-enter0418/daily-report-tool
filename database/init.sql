-- database/init.sql
-- 日報管理システム用テーブル定義
-- DATABASE_DESIGN.mdの設計に基づいて実装

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT '部下',
    display_name VARCHAR(100),
    supervisor_id BIGINT REFERENCES users(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 日報テーブル
CREATE TABLE IF NOT EXISTS daily_reports (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    work_content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    report_date DATE NOT NULL,
    submitted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 1日1件制限
    UNIQUE(user_id, report_date),
    
    -- 作業内容文字数制限
    CONSTRAINT work_content_length CHECK (CHAR_LENGTH(work_content) <= 1000)
);

-- チームテーブル
CREATE TABLE IF NOT EXISTS teams (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    leader_id BIGINT REFERENCES users(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ユーザー・チーム関係テーブル
CREATE TABLE IF NOT EXISTS user_teams (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    team_id BIGINT NOT NULL REFERENCES teams(id),
    team_role VARCHAR(20) NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP NULL
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_users_supervisor_id ON users(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_daily_reports_user_id ON daily_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_status ON daily_reports(status);
CREATE INDEX IF NOT EXISTS idx_daily_reports_report_date ON daily_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_teams_leader_id ON teams(leader_id);
CREATE INDEX IF NOT EXISTS idx_user_teams_user_id ON user_teams(user_id);
CREATE INDEX IF NOT EXISTS idx_user_teams_team_id ON user_teams(team_id);

-- updated_at自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_atトリガー作成
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_reports_updated_at BEFORE UPDATE ON daily_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 初期データ投入 (パスワードは全て"password"のBCryptハッシュ)
INSERT INTO users (username, email, password, role, display_name) VALUES 
('admin', 'admin@example.com', '$2a$10$Hw39vRyt7.Fegc29QKjhAOwbpuYQsolQ1PMTydVOP.hG..ts1ihXy', '管理者', '管理者'),
('manager', 'manager@example.com', '$2a$10$Hw39vRyt7.Fegc29QKjhAOwbpuYQsolQ1PMTydVOP.hG..ts1ihXy', '上長', '田中 佐智子'),
('employee1', 'emp1@example.com', '$2a$10$Hw39vRyt7.Fegc29QKjhAOwbpuYQsolQ1PMTydVOP.hG..ts1ihXy', '部下', '佐藤 大輔'),
('employee2', 'emp2@example.com', '$2a$10$Hw39vRyt7.Fegc29QKjhAOwbpuYQsolQ1PMTydVOP.hG..ts1ihXy', '部下', '鈴木 美穂')
ON CONFLICT (username) DO NOTHING;

-- 上司-部下関係設定
UPDATE users SET supervisor_id = (SELECT id FROM users WHERE username = 'manager') 
WHERE username IN ('employee1', 'employee2');

-- 初期チームデータ
INSERT INTO teams (name, description, leader_id) VALUES 
('開発チーム', 'システム開発・保守担当', (SELECT id FROM users WHERE username = 'manager')),
('営業チーム', '営業活動・顧客対応担当', (SELECT id FROM users WHERE username = 'manager'))
ON CONFLICT (name) DO NOTHING;

-- チームメンバー関係
INSERT INTO user_teams (user_id, team_id, team_role) VALUES 
((SELECT id FROM users WHERE username = 'manager'), (SELECT id FROM teams WHERE name = '開発チーム'), 'leader'),
((SELECT id FROM users WHERE username = 'employee1'), (SELECT id FROM teams WHERE name = '開発チーム'), 'member'),
((SELECT id FROM users WHERE username = 'employee2'), (SELECT id FROM teams WHERE name = '営業チーム'), 'member')
ON CONFLICT DO NOTHING;

-- サンプル日報データ
INSERT INTO daily_reports (user_id, title, work_content, status, report_date, submitted_at) VALUES 
((SELECT id FROM users WHERE username = 'employee1'), '2024年1月15日の日報', 'プロジェクトXの要件定義を実施しました。クライアントとのミーティングで詳細な仕様を確認し、技術スタックの選定を行いました。', 'submitted', '2024-01-15', '2024-01-15 18:30:00'),
((SELECT id FROM users WHERE username = 'employee1'), '2024年1月16日の日報', 'UI/UXデザインのプロトタイプ作成を開始。Figmaでワイヤーフレームを作成中です。', 'draft', '2024-01-16', NULL),
((SELECT id FROM users WHERE username = 'employee2'), '2024年1月15日の日報', '営業チーム会議に参加し、月次売上目標の進捗確認を行いました。新規顧客開拓のアプローチ方法について検討しました。', 'submitted', '2024-01-15', '2024-01-15 17:45:00')
ON CONFLICT DO NOTHING;