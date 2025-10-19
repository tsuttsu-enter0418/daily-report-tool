package com.example.dailyreport.security;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.example.dailyreport.dto.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Spring Security 未認証エラー時のカスタムハンドラー
 *
 * <p>機能:
 * - JWT トークンなし、または無効なトークンでアクセス時のレスポンスをカスタマイズ
 * - ApiResponse 形式で統一されたエラーメッセージを返却
 * - 401 Unauthorized ステータスコードを設定
 *
 * <p>使用箇所:
 * - SecurityConfig で登録
 * - 認証が必要なエンドポイントに未認証でアクセスした際に呼び出される
 *
 * <p>レスポンス例:
 * <pre>
 * HTTP/1.1 401 Unauthorized
 * {
 *   "success": false,
 *   "message": "認証が必要です。ログインしてください",
 *   "data": null
 * }
 * </pre>
 */
@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException authException) throws IOException, ServletException {

        // レスポンス設定
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        // カスタムエラーレスポンス作成
        ApiResponse<Object> errorResponse = new ApiResponse<>(
                false,
                "認証が必要です。ログインしてください",
                null);

        // JSON形式で出力
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}
