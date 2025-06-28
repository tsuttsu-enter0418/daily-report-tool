-- database/init.sql
-- 日報作成支援ツール用テーブル

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT '部下',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 日報テーブル
CREATE TABLE IF NOT EXISTS daily_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    report_date DATE NOT NULL,
    content TEXT NOT NULL,
    next_plan TEXT,
    status VARCHAR(20) DEFAULT '順調',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 初期データ投入 (パスワードは全て"password"のBCryptハッシュ)
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@example.com', '$2a$10$fBWb/XKtxOGFrNj4NXQL5OLWYGJeUf4zAD7yPHaQcLSDMbMKKfHGW', '管理者'),
('manager', 'manager@example.com', '$2a$10$Q7k7DjQ7QQQQQQQQQQQQQeYQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ', '上長'),
('employee1', 'emp1@example.com', '$2a$10$Q7k7DjQ7QQQQQQQQQQQQQeYQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ', '部下')
ON CONFLICT (username) DO NOTHING;