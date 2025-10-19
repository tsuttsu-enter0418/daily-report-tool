package com.example.dailyreport.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dailyreport.dto.ApiResponse;
import com.example.dailyreport.dto.UserRequest;
import com.example.dailyreport.entity.User;
import com.example.dailyreport.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/user")
@Tag(name = "User", description = "ユーザー管理API")
@PreAuthorize("hasRole('管理者')")
public class UserController extends BaseController {

    @Autowired
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    @Operation(summary = "ユーザー一覧取得", description = "ユーザーを全件取得")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "取得成功")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "権限エラー")
    @GetMapping("/")
    public ResponseEntity<ApiResponse<List<User>>> getUsers(Authentication authentication) {

        List<User> users = userService.getUsers();
        return ResponseEntity.ok(ApiResponse.success(users, null));
    }

    // TODO: バリデーションエラー時のレスポンスボディ対応
    // 現状: @Validatedによるバリデーションエラー時、レスポンスボディは空（400ステータスのみ）
    // 対応案1:
    // application.propertiesでserver.error.include-binding-errors=alwaysを設定（推奨）
    // 対応案2: GlobalExceptionHandlerでカスタムエラーレスポンス実装
    // 対応案3: ApiResponseに統合（全Controller修正が必要）
    @Operation(summary = "ユーザー作成", description = "新規ユーザーを作成します")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "作成成功")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "権限エラー")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "バリデーションエラー（レスポンスボディなし）")
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<User>> createUser(@Validated @RequestBody UserRequest request) {

        try {
            // ObjectMapperでDTOからEntityへマッピング
            User user = objectMapper.convertValue(request, User.class);
            // ユーザー作成（パスワードハッシュ化はService層で実施）
            userService.createUser(user);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(user, "ユーザーを作成しました"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("ユーザー作成に失敗しました：" + e.getMessage()));
        }

    }

    @Operation(summary = "ユーザー更新", description = "ユーザー情報を更新します")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "更新成功")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "権限エラー")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "バリデーションエラー（レスポンスボディなし）")
    @PostMapping("/update")
    public ResponseEntity<ApiResponse<User>> updateUser(@Validated @RequestBody UserRequest request) {

        try {
            // ObjectMapperでDTOからEntityへマッピング
            User user = objectMapper.convertValue(request, User.class);
            // ユーザー更新（パスワードハッシュ化はService層で実施）
            userService.updateUser(user);

            return ResponseEntity.ok(ApiResponse.success(user, "ユーザーを更新しました"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("ユーザー更新に失敗しました：" + e.getMessage()));
        }
    }

}
