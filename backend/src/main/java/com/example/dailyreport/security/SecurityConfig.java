package com.example.dailyreport.security;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Spring Security設定クラス
 *
 * <p>機能: - JWT認証の有効/無効制御 - デバッグモード時の認証スキップ - CORS設定 - エンドポイントアクセス制御
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired private JwtAuthenticationFilter jwtAuthenticationFilter;

    /** JWT認証の有効/無効を制御 デバッグプロファイル時は false に設定 */
    @Value("${jwt.auth.enabled:true}")
    private boolean jwtAuthEnabled;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(
                        session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions -> 
                    exceptions.authenticationEntryPoint((request, response, authException) -> {
                        response.setStatus(401);
                        response.setContentType("application/json;charset=UTF-8");
                        response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"認証が必要です\"}");
                    }));

        // JWT認証の有効/無効を制御
        if (jwtAuthEnabled) {
            // 通常モード：JWT認証を適用
            http.authorizeHttpRequests(
                            auth ->
                                    auth.requestMatchers("/api/auth/login")
                                            .permitAll()
                                            .requestMatchers("/swagger-ui/**", "/v3/api-docs/**")
                                            .permitAll()
                                            .requestMatchers("/actuator/health")
                                            .permitAll()
                                            .anyRequest()
                                            .authenticated())
                    .addFilterBefore(
                            jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        } else {
            // デバッグモード：すべてのリクエストを許可
            http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        }

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // 本番環境対応：ALBからの内部リクエストも許可
        configuration.setAllowedOriginPatterns(
                Arrays.asList(
                        "http://localhost:3000", // 開発環境
                        "http://*", // ALB内部リクエスト
                        "https://*" // 本番HTTPS環境
                        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Actuatorエンドポイントもヘルスチェック用にCORS許可
        source.registerCorsConfiguration("/api/**", configuration);
        source.registerCorsConfiguration("/actuator/**", configuration);
        return source;
    }
}
