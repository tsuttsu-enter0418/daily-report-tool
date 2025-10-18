package com.example.dailyreport.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ユーザー新規作成リクエストDTO
 * APIリクエストとして受け取るユーザー作成情報
 * エンティティとは分離して、セキュリティとバリデーションを強化
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateUserRequest {

    /**
     * ユーザー名（ログインID）
     */
    @NotBlank(message = "ユーザー名は必須です")
    @Size(max = 50, message = "ユーザー名は50文字以下で入力してください")
    private String username;

    /**
     * パスワード（平文で受け取り、サービス層でハッシュ化）
     */
    @NotBlank(message = "パスワードは必須です")
    @Size(min = 8, max = 100, message = "パスワードは8文字以上100文字以下で入力してください")
    private String password;

    /**
     * メールアドレス
     */
    @NotBlank(message = "メールアドレスは必須です")
    @Email(message = "正しいメールアドレス形式で入力してください")
    private String email;

    /**
     * 表示名
     */
    @NotBlank(message = "表示名は必須です")
    @Size(max = 100, message = "表示名は100文字以下で入力してください")
    private String displayName;

    /**
     * ロール（管理者/上長/部下）
     */
    @NotBlank(message = "ロールは必須です")
    private String role;
}
