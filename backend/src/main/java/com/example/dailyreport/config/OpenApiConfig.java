package com.example.dailyreport.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;

/**
 * OpenAPI（Swagger）設定クラス
 *
 * <p>機能: - API仕様書の自動生成設定 - Swagger UI の設定 - JWT認証スキーマの定義 - API情報の設定（バージョン、説明、ライセンス等）
 *
 * <p>アクセス方法: - Swagger UI: http://localhost:8080/swagger-ui.html - OpenAPI JSON:
 * http://localhost:8080/v3/api-docs
 *
 * <p>機能詳細: - JWT Bearer Token 認証対応 - 開発・本番環境のサーバー設定 - 日本語での説明文 - ライセンス情報の記載
 */
@Configuration
public class OpenApiConfig {

    /**
     * OpenAPI設定のBean定義
     *
     * @return OpenAPI設定オブジェクト
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(createApiInfo())
                .servers(createServers())
                .components(createComponents())
                .addSecurityItem(createSecurityRequirement());
    }

    /**
     * API基本情報の作成
     *
     * @return API情報オブジェクト
     */
    private Info createApiInfo() {
        return new Info()
                .title("日報管理システム API")
                .description(
                        """
                        企業向け日報管理システムのREST API仕様書

                        ## 主な機能
                        - JWT認証によるユーザーログイン
                        - ユーザー管理（管理者、上長、部下の役職対応）
                        - 日報のCRUD操作
                        - 承認ワークフロー

                        ## 認証方式
                        - Bearer Token (JWT)
                        - ログイン成功後に取得したトークンをAuthorizationヘッダーに設定

                        ## 技術スタック
                        - Spring Boot 3.2.0
                        - Spring Security + JWT
                        - PostgreSQL
                        - JPA/Hibernate
                        - Lombok
                        """)
                .version("1.0.0")
                .contact(createContact())
                .license(createLicense());
    }

    /**
     * 連絡先情報の作成
     *
     * @return 連絡先情報オブジェクト
     */
    private Contact createContact() {
        return new Contact()
                .name("開発チーム")
                .email("dev@example.com")
                .url("https://github.com/example/daily-report-tool");
    }

    /**
     * ライセンス情報の作成
     *
     * @return ライセンス情報オブジェクト
     */
    private License createLicense() {
        return new License().name("MIT License").url("https://opensource.org/licenses/MIT");
    }

    /**
     * サーバー情報の作成
     *
     * @return サーバー情報リスト
     */
    private List<Server> createServers() {
        return List.of(
                new Server().url("http://localhost:8080").description("開発環境"),
                new Server().url("https://api.example.com").description("本番環境"));
    }

    /**
     * セキュリティコンポーネントの作成 JWT Bearer Token認証スキーマを定義
     *
     * @return コンポーネント設定オブジェクト
     */
    private Components createComponents() {
        return new Components().addSecuritySchemes("JWT", createSecurityScheme());
    }

    /**
     * JWT認証スキーマの作成
     *
     * @return セキュリティスキーマオブジェクト
     */
    private SecurityScheme createSecurityScheme() {
        return new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .name("JWT")
                .description("JWT Bearer Token認証。ログイン後に取得したトークンを設定してください。");
    }

    /**
     * セキュリティ要件の作成
     *
     * @return セキュリティ要件オブジェクト
     */
    private SecurityRequirement createSecurityRequirement() {
        return new SecurityRequirement().addList("JWT");
    }
}
