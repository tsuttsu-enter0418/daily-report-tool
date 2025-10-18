package com.example.dailyreport.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * API統一レスポンス型
 * すべてのAPIレスポンスをこの形式で返すことで、フロントエンドでの処理を統一
 *
 * @param <T> レスポンスデータの型
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    /**
     * 処理の成功/失敗を示すフラグ
     */
    private boolean success;

    /**
     * レスポンスメッセージ（成功時・エラー時の説明）
     */
    private String message;

    /**
     * レスポンスデータ（成功時のみ設定、エラー時はnull）
     */
    private T data;

    /**
     * 成功レスポンスを生成するヘルパーメソッド
     *
     * @param <T>     データの型
     * @param message 成功メッセージ
     * @param data    レスポンスデータ
     * @return ApiResponseインスタンス
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, message, data);
    }

    /**
     * エラーレスポンスを生成するヘルパーメソッド
     *
     * @param <T>     データの型
     * @param message エラーメッセージ
     * @return ApiResponseインスタンス
     */
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
