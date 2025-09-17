package com.example.dailyreport.security;

import java.io.IOException;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * JWT認証フィルター
 *
 * <p>
 * 機能: - HTTPリクエストのAuthorizationヘッダーからJWTトークンを抽出 - JwtUtilを使用してトークンの有効性を検証 - 有効なトークンの場合、Spring
 * SecurityのSecurityContextに認証情報を設定 - 無効または存在しないトークンの場合は何もしない
 *
 * <p>
 * フィルター動作: - /api/auth/**パスは認証をスキップ（ログイン処理のため） - Authorizationヘッダーが存在しない場合はスキップ -
 * Bearer形式でないトークンはスキップ - 有効なJWTトークンからユーザー名と権限を抽出してSecurityContextに設定
 *
 * <p>
 * セキュリティ考慮事項: - トークン検証失敗時はログ出力してリクエストを継続 - 認証情報はリクエスト毎にクリア - 権限情報もJWTトークンから設定
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        // /api/auth/**パスは認証をスキップ
        String requestPath = request.getRequestURI();
        if (requestPath.startsWith("/api/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Authorizationヘッダーからトークンを抽出
        String token = extractTokenFromRequest(request);
        System.out.println(SecurityContextHolder.getContext().getAuthentication());

        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                // JWTトークンの検証
                if (jwtUtil.validateToken(token) && !jwtUtil.isTokenExpired(token)) {
                    // トークンからユーザー情報を抽出
                    String username = jwtUtil.getUsernameFromToken(token);
                    String role = jwtUtil.getRoleFromToken(token);

                    // Spring Security用の権限オブジェクト作成
                    SimpleGrantedAuthority authority =
                            new SimpleGrantedAuthority("ROLE_" + role.toUpperCase());

                    // 認証オブジェクト作成
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(username, null,
                                    Collections.singletonList(authority));

                    // リクエスト詳細情報を設定
                    authentication
                            .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // SecurityContextに認証情報を設定
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    logger.debug("JWT認証成功: ユーザー=" + username + ", 権限=" + role);
                }
            } catch (JwtException e) {
                logger.warn("JWT認証失敗: " + e.getMessage());
                // 認証失敗の場合は何もしない（既存のセキュリティチェーンが処理）
            } catch (Exception e) {
                logger.error("JWT認証処理でエラーが発生しました: " + e.getMessage());
            }
        }

        // 次のフィルターに処理を委譲
        filterChain.doFilter(request, response);
    }

    /**
     * HTTPリクエストからJWTトークンを抽出 Authorizationヘッダーから "Bearer " プレフィックスを除去してトークンを取得
     *
     * @param request HTTPリクエストオブジェクト
     * @return JWTトークン文字列（存在しない場合はnull）
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // "Bearer " を除去
        }

        return null;
    }
}
