package com.example.dailyreport.controller;

import com.example.dailyreport.dto.LoginRequest;
import com.example.dailyreport.dto.LoginResponse;
import com.example.dailyreport.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 認証関連のAPIエンドポイントを提供するコントローラー
 * 
 * 主な機能:
 * - ユーザーログイン認証
 * - JWT トークンの発行
 * - 認証エラーハンドリング
 * 
 * エンドポイント:
 * - POST /api/auth/login: ユーザーログイン
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "認証 API", description = "ユーザー認証に関するAPIエンドポイント")
public class AuthController extends BaseController {

    @Autowired
    private AuthService authService;

    /**
     * ユーザーログイン認証
     * 
     * @param loginRequest ログイン情報（ユーザー名、パスワード）
     * @return ログイン成功時: JWT トークン、ユーザー情報
     *         ログイン失敗時: エラーメッセージ
     */
    @Operation(
            summary = "ユーザーログイン",
            description = "ユーザー名とパスワードで認証を行い、成功時にJWTトークンを発行します。",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "ログイン情報",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = LoginRequest.class),
                            examples = @ExampleObject(
                                    name = "ログイン例",
                                    value = """
                                            {
                                              "username": "admin",
                                              "password": "password"
                                            }
                                            """
                            )
                    )
            )
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "ログイン成功",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = LoginResponse.class),
                            examples = @ExampleObject(
                                    name = "成功例",
                                    value = """
                                            {
                                              "token": "eyJhbGciOiJIUzI1NiJ9...",
                                              "id": "1",
                                              "username": "admin",
                                              "email": "admin@example.com",
                                              "role": "管理者",
                                              "displayName": "admin"
                                            }
                                            """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "ログイン失敗",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    name = "失敗例",
                                    value = "\"ログインに失敗しました: ユーザーが見つかりません\""
                            )
                    )
            )
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Parameter(description = "ログイン情報", required = true)
            @RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse response = authService.authenticateUser(loginRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("ログインに失敗しました: " + e.getMessage());
        }
    }
}