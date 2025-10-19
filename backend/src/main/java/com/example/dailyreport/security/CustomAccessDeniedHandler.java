package com.example.dailyreport.security;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import com.example.dailyreport.dto.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Spring Security @PreAuthorize 権限エラー時のカスタムハンドラー
 *
 * <p>機能:
 * - @PreAuthorize でアクセス拒否された際のレスポンスをカスタマイズ
 * - ApiResponse 形式で統一されたエラーメッセージを返却
 * - 403 Forbidden ステータスコードを設定
 *
 * <p>使用箇所:
 * - SecurityConfig で登録
 * - @PreAuthorize("hasRole('管理者')") などで権限不足時に呼び出される
 *
 * <p>レスポンス例:
 * <pre>
 * HTTP/1.1 403 Forbidden
 * {
 *   "success": false,
 *   "message": "この操作を実行する権限がありません",
 *   "data": null
 * }
 * </pre>
 */
@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
            AccessDeniedException accessDeniedException) throws IOException, ServletException {

        // レスポンス設定
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        // カスタムエラーレスポンス作成
        ApiResponse<Object> errorResponse = new ApiResponse<>(
                false,
                "この操作を実行する権限がありません",
                null);

        // JSON形式で出力
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}
