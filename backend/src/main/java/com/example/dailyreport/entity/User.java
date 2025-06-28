package com.example.dailyreport.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

/**
 * ユーザー情報を管理するエンティティクラス
 * 
 * 機能:
 * - ユーザーの基本情報を保存（ID、ユーザー名、メール、パスワード、役職）
 * - 日本企業の階層構造に対応（管理者、上長、部下）
 * - BCryptによるパスワードハッシュ化に対応
 * - 作成日時の自動記録
 * - Lombokによるボイラープレートコード削減
 * 
 * データベーステーブル: users
 * 関連: daily_reports テーブルとの1対多の関係
 * 
 * Lombok注釈:
 * - @Data: getter/setter、toString、equals、hashCode自動生成
 * - @NoArgsConstructor: デフォルトコンストラクタ生成
 * - @AllArgsConstructor: 全フィールドコンストラクタ生成
 * - @Builder: Builderパターン対応
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    /** ユーザーID（主キー、自動生成） */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** ユーザー名（一意制約、ログイン用） */
    @Column(unique = true, nullable = false)
    private String username;

    /** メールアドレス（一意制約） */
    @Column(unique = true, nullable = false)
    private String email;

    /** パスワード（BCryptハッシュ化済み） */
    @Column(nullable = false)
    private String password;

    /** ユーザーの役職（管理者、上長、部下） */
    @Column(nullable = false)
    @Builder.Default
    private String role = "部下";

    /** アカウント作成日時 */
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    /**
     * JPA エンティティの永続化前処理
     * 作成日時を自動設定
     */
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}