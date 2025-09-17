package com.example.dailyreport;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 日報管理システムのメインアプリケーションクラス
 *
 * <p>機能: - Spring Boot アプリケーションのエントリーポイント - 自動設定の有効化 - コンポーネントスキャンの開始点
 *
 * <p>アーキテクチャ: - Spring Boot 3.2.0 - Java 17 - PostgreSQL連携 - JWT認証システム
 */
@SpringBootApplication
public class DailyReportApplication {
    /**
     * アプリケーションのメインメソッド Spring Boot コンテナを起動し、組み込みTomcatサーバーでアプリケーションを実行
     *
     * @param args コマンドライン引数
     */
    public static void main(String[] args) {
        SpringApplication.run(DailyReportApplication.class, args);
    }
}
