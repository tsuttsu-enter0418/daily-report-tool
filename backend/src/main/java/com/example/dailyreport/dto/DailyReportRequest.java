package com.example.dailyreport.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 日報作成・更新リクエストDTO
 *
 * <p>機能: - 日報作成時のリクエストデータ受け取り - 日報更新時のリクエストデータ受け取り - バリデーション機能による入力値検証 - フロントエンドからのJSON形式データ変換
 *
 * <p>バリデーション: - title: 必須、最大200文字 - workContent: 必須、最大1000文字 - reportDate: 必須 - status:
 * 必須（draft/submitted）
 *
 * <p>使用場面: - POST /api/daily-reports （新規作成） - PUT /api/daily-reports/{id} （更新）
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyReportRequest {

    /** 日報タイトル */
    @NotBlank(message = "タイトルは必須です")
    @Size(max = 200, message = "タイトルは200文字以内で入力してください")
    private String title;

    /** 今日の作業内容 */
    @NotBlank(message = "作業内容は必須です")
    @Size(min = 10, max = 1000, message = "作業内容は10文字以上1000文字以内で入力してください")
    private String workContent;

    /** 対象日 */
    @NotNull(message = "対象日は必須です")
    private LocalDate reportDate;

    /** ステータス（draft: 下書き, submitted: 提出済み） */
    @NotBlank(message = "ステータスは必須です")
    private String status;

    /**
     * 下書きかどうかを判定
     *
     * @return 下書きの場合true
     */
    public boolean isDraft() {
        return "draft".equals(this.status);
    }

    /**
     * 提出済みかどうかを判定
     *
     * @return 提出済みの場合true
     */
    public boolean isSubmitted() {
        return "submitted".equals(this.status);
    }
}
