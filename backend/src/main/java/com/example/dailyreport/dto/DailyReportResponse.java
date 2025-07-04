package com.example.dailyreport.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 日報レスポンスDTO
 * 
 * 機能:
 * - 日報詳細情報のレスポンスデータ送信
 * - エンティティからDTOへの変換
 * - フロントエンドへのJSON形式データ提供
 * - 作成者情報の含有
 * 
 * 使用場面:
 * - GET /api/daily-reports/{id} （詳細取得）
 * - POST /api/daily-reports （作成後のレスポンス）
 * - PUT /api/daily-reports/{id} （更新後のレスポンス）
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyReportResponse {

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

    /** 今日の作業内容 */
    private String workContent;

    /** ステータス（draft: 下書き, submitted: 提出済み） */
    private String status;

    /** 対象日 */
    private LocalDate reportDate;

    /** 提出日時 */
    private LocalDateTime submittedAt;

    /** 作成日時 */
    private LocalDateTime createdAt;

    /** 更新日時 */
    private LocalDateTime updatedAt;

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
     * 作業内容のプレビューを取得（100文字で切り詰め）
     * @return プレビュー文字列
     */
    public String getWorkContentPreview() {
        if (workContent == null) {
            return "";
        }
        return workContent.length() > 100 
            ? workContent.substring(0, 100) + "..." 
            : workContent;
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
}