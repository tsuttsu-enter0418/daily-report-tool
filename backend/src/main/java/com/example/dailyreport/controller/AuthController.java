package com.example.dailyreport.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dailyreport.dto.LoginRequest;
import com.example.dailyreport.dto.LoginResponse;
import com.example.dailyreport.entity.User;
import com.example.dailyreport.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * 認証関連のAPIエンドポイントを提供するコントローラー
 *
 * <p>主な機能: - ユーザーログイン認証 - JWT トークンの発行 - 認証エラーハンドリング
 *
 * <p>エンドポイント: - POST /api/auth/login: ユーザーログイン - GET /api/auth/validate: JWTトークン有効性検証 - GET
 * /api/auth/me: 現在のユーザー情報取得
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "認証 API", description = "ユーザー認証に関するAPIエンドポイント")
public class AuthController extends BaseController {

    @Autowired private AuthService authService;

    /**
     * ユーザーログイン認証
     *
     * @param loginRequest ログイン情報（ユーザー名、パスワード）
     * @return ログイン成功時: JWT トークン、ユーザー情報 ログイン失敗時: エラーメッセージ
     */
    @Operation(
            summary = "ユーザーログイン",
            description = "ユーザー名とパスワードで認証を行い、成功時にJWTトークンを発行します。",
            requestBody =
                    @io.swagger.v3.oas.annotations.parameters.RequestBody(
                            description = "ログイン情報",
                            required = true,
                            content =
                                    @Content(
                                            mediaType = "application/json",
                                            schema = @Schema(implementation = LoginRequest.class),
                                            examples =
                                                    @ExampleObject(
                                                            name = "ログイン例",
                                                            value =
                                                                    """
                                    {
                                      "username": "admin",
                                      "password": "password"
                                    }
                                    """))))
    @ApiResponses(
            value = {
                @ApiResponse(
                        responseCode = "200",
                        description = "ログイン成功",
                        content =
                                @Content(
                                        mediaType = "application/json",
                                        schema = @Schema(implementation = LoginResponse.class),
                                        examples =
                                                @ExampleObject(
                                                        name = "成功例",
                                                        value =
                                                                """
                                    {
                                      "token": "eyJhbGciOiJIUzI1NiJ9...",
                                      "id": "1",
                                      "username": "admin",
                                      "email": "admin@example.com",
                                      "role": "管理者",
                                      "displayName": "admin"
                                    }
                                    """))),
                @ApiResponse(
                        responseCode = "400",
                        description = "ログイン失敗",
                        content =
                                @Content(
                                        mediaType = "application/json",
                                        examples =
                                                @ExampleObject(
                                                        name = "失敗例",
                                                        value =
                                                                """
                                    {
                                      "message": "ログインに失敗しました: ユーザーが見つかりません",
                                      "status": "400"
                                    }
                                    """)))
            })
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Parameter(description = "ログイン情報", required = true) @RequestBody
                    LoginRequest loginRequest) {
        try {
            LoginResponse response = authService.authenticateUser(loginRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "ログインに失敗しました: " + e.getMessage());
            errorResponse.put("status", "400");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * JWTトークンの有効性検証
     *
     * @param authentication JWT認証情報
     * @return トークンが有効な場合200、無効な場合401
     */
    @Operation(summary = "JWTトークン検証", description = "現在のJWTトークンの有効性を検証します。")
    @ApiResponses(
            value = {
                @ApiResponse(responseCode = "200", description = "トークン有効"),
                @ApiResponse(responseCode = "401", description = "トークン無効")
            })
    @GetMapping("/validate")
    public ResponseEntity<Void> validateToken(Authentication authentication) {
        try {
            getUserIdFromAuth(authentication);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    /**
     * 現在のユーザー情報取得
     *
     * @param authentication JWT認証情報
     * @return ユーザー情報
     */
    @Operation(summary = "現在のユーザー情報取得", description = "認証済みユーザーの詳細情報を取得します。")
    @ApiResponses(
            value = {
                @ApiResponse(
                        responseCode = "200",
                        description = "ユーザー情報取得成功",
                        content =
                                @Content(
                                        mediaType = "application/json",
                                        schema = @Schema(implementation = LoginResponse.class),
                                        examples =
                                                @ExampleObject(
                                                        name = "ユーザー情報例",
                                                        value =
                                                                """
                                    {
                                      "token": "",
                                      "id": "1",
                                      "username": "admin",
                                      "email": "admin@example.com",
                                      "role": "管理者",
                                      "displayName": "admin"
                                    }
                                    """))),
                @ApiResponse(responseCode = "401", description = "認証失敗")
            })
    @GetMapping("/me")
    public ResponseEntity<LoginResponse> getCurrentUser(Authentication authentication) {
        try {
            User user = getUserFromAuth(authentication);

            LoginResponse response =
                    LoginResponse.builder()
                            .token("") // /meエンドポイントではトークンは空
                            .id(user.getId().toString())
                            .username(user.getUsername())
                            .email(user.getEmail())
                            .role(user.getRole())
                            .displayName(user.getDisplayName())
                            .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }
}
