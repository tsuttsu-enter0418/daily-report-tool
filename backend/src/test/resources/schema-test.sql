-- テスト用データベーススキーマ（H2データベース用）
-- 日報管理システムのテスト環境構築

-- 既存テーブル削除（テスト環境初期化）
DROP TABLE IF EXISTS daily_reports;
DROP TABLE IF EXISTS user_teams;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS users;

-- ユーザーテーブル作成
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT '部下',
    display_name VARCHAR(100),
    supervisor_id BIGINT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 外部キー制約
    CONSTRAINT fk_users_supervisor FOREIGN KEY (supervisor_id) REFERENCES users(id)
);

-- 日報テーブル作成
CREATE TABLE daily_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    work_content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    report_date DATE NOT NULL,
    submitted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 外部キー制約
    CONSTRAINT fk_daily_reports_user FOREIGN KEY (user_id) REFERENCES users(id),
    
    -- ユニーク制約（1日1件制限）
    CONSTRAINT uk_user_date UNIQUE (user_id, report_date)
);

-- チームテーブル作成（将来機能用）
CREATE TABLE teams (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    manager_id BIGINT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 外部キー制約
    CONSTRAINT fk_teams_manager FOREIGN KEY (manager_id) REFERENCES users(id)
);

-- ユーザー・チーム関連テーブル作成（多対多関係）
CREATE TABLE user_teams (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    team_id BIGINT NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 外部キー制約
    CONSTRAINT fk_user_teams_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_user_teams_team FOREIGN KEY (team_id) REFERENCES teams(id),
    
    -- ユニーク制約（同一ユーザーは同一チームに1回のみ参加）
    CONSTRAINT uk_user_team UNIQUE (user_id, team_id)
);

-- インデックス作成（パフォーマンス最適化）
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_supervisor_id ON users(supervisor_id);
CREATE INDEX idx_daily_reports_user_id ON daily_reports(user_id);
CREATE INDEX idx_daily_reports_report_date ON daily_reports(report_date);
CREATE INDEX idx_daily_reports_status ON daily_reports(status);
CREATE INDEX idx_user_teams_user_id ON user_teams(user_id);
CREATE INDEX idx_user_teams_team_id ON user_teams(team_id);