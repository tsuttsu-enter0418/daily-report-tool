package com.example.dailyreport.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 日報一覧レスポンスDTO
 * 
 * 機能:
 * - 日報一覧情報の軽量レスポンスデータ送信
 * - 必要最小限の情報のみ含有（パフォーマンス最適化）
 * - リスト表示用のプレビュー情報提供
 * - 上司ダッシュボードでの表示に最適化
 * 
 * 使用場面:
 * - GET /api/daily-reports （一覧取得）
 * - GET /api/daily-reports/my （自分の日報一覧）
 * - GET /api/daily-reports/subordinates （部下の日報一覧）
 * 
 * 特徴:
 * - 作業内容はプレビュー版のみ（100文字制限）
 * - 必要な情報のみで軽量化
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyReportListResponse {

    /** 日報ID */
    private Long id;

    /** 作成者ID */
    private Long userId;

    /** 作成者ユーザー名 */
    private String username;

    /** 作成者表示名 */
    private String displayName;

    /** 日報タイトル */
    private String title;

    /** 作業内容プレビュー（100文字以内） */
    private String workContent;

    /** ステータス（draft: 下書き, submitted: 提出済み） */
    private String status;

    /** 対象日 */
    private LocalDate reportDate;

    /** 提出日時 */
    private LocalDateTime submittedAt;

    /** 作成日時 */
    private LocalDateTime createdAt;

    /**
     * 下書きかどうかを判定
     * @return 下書きの場合true
     */
    public boolean isDraft() {
        return "draft".equals(this.status);
    }

    /**
     * 提出済みかどうかを判定
     * @return 提出済みの場合true
     */
    public boolean isSubmitted() {
        return "submitted".equals(this.status);
    }

    /**
     * 表示用作成者名を取得
     * displayNameがある場合はそれを、ない場合はusernameを返す
     * @return 表示用作成者名
     */
    public String getAuthorDisplayName() {
        return displayName != null && !displayName.trim().isEmpty() 
            ? displayName 
            : username;
    }

    /**
     * ステータス表示用文字列を取得
     * @return ステータス文字列（提出済み/下書き）
     */
    public String getStatusDisplayText() {
        return isSubmitted() ? "提出済み" : "下書き";
    }
}