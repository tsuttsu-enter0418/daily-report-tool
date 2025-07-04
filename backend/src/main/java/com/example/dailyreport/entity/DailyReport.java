package com.example.dailyreport.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 日報情報を管理するエンティティクラス
 * 
 * 機能:
 * - 日報の基本情報を保存（ID、ユーザーID、タイトル、作業内容、ステータス）
 * - 日報の対象日と提出日時管理
 * - ステータス管理（下書き/提出済み）
 * - 作業内容の文字数制限（1000文字以内）
 * - 1日1件制限の実装（ユーザーID + 対象日でユニーク）
 * - 作成・更新日時の自動記録
 * - Lombokによるボイラープレートコード削減
 * 
 * データベーステーブル: daily_reports
 * 関連: 
 * - users テーブルとの多対1の関係（user_id）
 * 
 * 制約:
 * - 1日1件制限: UNIQUE(user_id, report_date)
 * - 作業内容文字数制限: work_content <= 1000文字
 * 
 * Lombok注釈:
 * - @Data: getter/setter、toString、equals、hashCode自動生成
 * - @NoArgsConstructor: デフォルトコンストラクタ生成
 * - @AllArgsConstructor: 全フィールドコンストラクタ生成
 * - @Builder: Builderパターン対応
 */
@Entity
@Table(
    name = "daily_reports",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_user_date",
            columnNames = {"user_id", "report_date"}
        )
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyReport {
    
    /** 日報ID（主キー、自動生成） */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 作成者ID（外部キー、users.id） */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /** 日報タイトル */
    @Column(nullable = false, length = 200)
    private String title;

    /** 今日の作業内容（最大1000文字） */
    @Column(name = "work_content", nullable = false, columnDefinition = "TEXT")
    private String workContent;

    /** ステータス（draft: 下書き, submitted: 提出済み） */
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "draft";

    /** 対象日（どの日の日報か） */
    @Column(name = "report_date", nullable = false)
    private LocalDate reportDate;

    /** 提出日時（ステータスがsubmittedの場合のみ設定） */
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    /** 日報作成日時 */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /** 日報更新日時 */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /** ユーザーとの関連（多対1） */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    /**
     * JPA エンティティの永続化前処理
     * 作成日時・更新日時を自動設定
     */
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
        // デフォルト対象日を今日に設定
        if (reportDate == null) {
            reportDate = LocalDate.now();
        }
    }

    /**
     * JPA エンティティの更新前処理
     * 更新日時を自動設定
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * 日報を提出済みにする
     * ステータスを"submitted"に変更し、提出日時を設定
     */
    public void submit() {
        this.status = "submitted";
        this.submittedAt = LocalDateTime.now();
    }

    /**
     * 日報を下書きに戻す
     * ステータスを"draft"に変更し、提出日時をクリア
     */
    public void markAsDraft() {
        this.status = "draft";
        this.submittedAt = null;
    }

    /**
     * 提出済みかどうかを判定
     * @return 提出済みの場合true
     */
    public boolean isSubmitted() {
        return "submitted".equals(this.status);
    }

    /**
     * 下書きかどうかを判定
     * @return 下書きの場合true
     */
    public boolean isDraft() {
        return "draft".equals(this.status);
    }
}