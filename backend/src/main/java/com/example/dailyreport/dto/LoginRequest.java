package com.example.dailyreport.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * ログインリクエスト用のDTOクラス
 * 
 * 機能:
 * - フロントエンドからのログイン情報を受け取る
 * - JSON形式のデータをJavaオブジェクトに変換
 * - バリデーション対象となるユーザー入力データ
 * - Lombokによるボイラープレートコード削減
 * 
 * 使用場面:
 * - POST /api/auth/login のリクエストボディ
 * - AuthController での認証処理
 * 
 * Lombok注釈:
 * - @Data: getter/setter、toString、equals、hashCode自動生成
 * - @NoArgsConstructor: デフォルトコンストラクタ生成（JSON用）
 * - @AllArgsConstructor: 全フィールドコンストラクタ生成
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "ログインリクエスト情報")
public class LoginRequest {
    
    /** ログイン用ユーザー名 */
    @Schema(description = "ユーザー名", example = "admin", required = true)
    private String username;
    
    /** プレーンテキストパスワード（認証時にハッシュ化と比較） */
    @Schema(description = "パスワード", example = "password", required = true)
    private String password;
}