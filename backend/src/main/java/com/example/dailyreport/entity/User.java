package com.example.dailyreport.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * ユーザー情報を管理するエンティティクラス
 *
 * <p>
 * 機能: - ユーザーの基本情報を保存（ID、ユーザー名、メール、パスワード、役職） - 日本企業の階層構造に対応（管理者、上長、部下） - 上司-部下関係の管理（supervisor_id） -
 * 表示名管理（display_name） - アクティブ状態管理（is_active） - BCryptによるパスワードハッシュ化に対応 - 作成・更新日時の自動記録 -
 * Lombokによるボイラープレートコード削減
 *
 * <p>
 * データベーステーブル: users 関連: - daily_reports テーブルとの1対多の関係 - 自己参照（上司-部下関係） - teams
 * テーブルとの多対多の関係（user_teams経由）
 *
 * <p>
 * Lombok注釈: - @Data: getter/setter、toString、equals、hashCode自動生成 - @NoArgsConstructor:
 * デフォルトコンストラクタ生成 - @AllArgsConstructor: 全フィールドコンストラクタ生成 - @Builder: Builderパターン対応
 */
@Entity
@Table(name = "users")
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class User extends BaseEntity {

    /** ユーザーID（主キー、自動生成） */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** ユーザー名（一意制約、ログイン用） */
    @Column(unique = true, nullable = false, length = 50)
    private String username;

    /** メールアドレス（一意制約） */
    @Column(unique = true, length = 255)
    private String email;

    /** パスワード（BCryptハッシュ化済み） */
    @Column(nullable = false, length = 255)
    private String password;

    /** ユーザーの役職（管理者、上長、部下） */
    @Column(nullable = false, length = 20)
    private String role = "部下";

    /** 表示名（画面表示用の名前） */
    @Column(name = "display_name", length = 100)
    private String displayName;

    /** 直属の上司ID（自己参照外部キー） */
    @Column(name = "supervisor_id")
    private Long supervisorId;

    /** アクティブフラグ（論理削除用） */
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
