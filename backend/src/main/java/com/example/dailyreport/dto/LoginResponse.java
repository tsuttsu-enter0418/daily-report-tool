package com.example.dailyreport.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ログインレスポンス用のDTOクラス
 *
 * <p>機能: - 認証成功時にフロントエンドに返すデータ - JWT トークンとユーザー情報を格納 - JSON形式でクライアントに送信される - Lombokによるボイラープレートコード削減
 *
 * <p>使用場面: - POST /api/auth/login のレスポンスボディ - AuthController での認証成功レスポンス
 *
 * <p>Lombok注釈: - @Data: getter/setter、toString、equals、hashCode自動生成 - @NoArgsConstructor:
 * デフォルトコンストラクタ生成（JSON用） - @AllArgsConstructor: 全フィールドコンストラクタ生成 - @Builder: Builderパターン対応
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "ログインレスポンス情報")
public class LoginResponse {

    /** JWT認証トークン */
    @Schema(
            description = "JWT認証トークン",
            example =
                    "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiLnrqHnkIblj6IiLCJpYXQiOjE2MjQ5NzY2MDAsImV4cCI6MTYyNDk4MDIwMH0...",
            required = true)
    private String token;

    /** ユーザーID */
    @Schema(description = "ユーザーID", example = "1", required = true)
    private String id;

    /** ユーザー名 */
    @Schema(description = "ユーザー名", example = "admin", required = true)
    private String username;

    /** メールアドレス */
    @Schema(description = "メールアドレス", example = "admin@example.com")
    private String email;

    /** ユーザー役職 */
    @Schema(
            description = "ユーザー役職",
            example = "管理者",
            allowableValues = {"管理者", "上長", "部下"})
    private String role;

    /** 表示名 */
    @Schema(description = "表示名", example = "admin")
    private String displayName;
}
