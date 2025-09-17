package com.example.dailyreport.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;

import com.example.dailyreport.entity.User;
import com.example.dailyreport.repository.UserRepository;

import lombok.extern.slf4j.Slf4j;

/**
 * Controller共通基底クラス
 *
 * <p>
 * 機能: - JWT認証の有効/無効制御 - デバッグモード時のデフォルトユーザー処理 - 認証情報からユーザーIDを取得する共通メソッド - 全Controllerで使用する共通処理を提供
 *
 * <p>
 * 使用方法: - 各Controllerクラスでこのクラスを継承 - getUserIdFromAuth()メソッドで認証情報からユーザーIDを取得 -
 * デバッグモード時は自動的にデフォルトユーザー（user1）を使用
 *
 * <p>
 * デバッグモード: - jwt.auth.enabled=false の場合、認証をスキップ - 全APIリクエストがデフォルトユーザー（user1）として実行 -
 * トークンなしでAPIテストが可能
 */
@Slf4j
public abstract class BaseController {

    @Autowired
    protected UserRepository userRepository;

    /** JWT認証の有効/無効を制御 デバッグ時は false に設定 */
    @Value("${jwt.auth.enabled:true}")
    protected boolean jwtAuthEnabled;

    /** デバッグモード時のデフォルトユーザー名 */
    @Value("${debug.default.user.username:user1}")
    protected String debugDefaultUsername;

    /**
     * 認証情報からユーザーIDを取得 デバッグモード時はデフォルトユーザーを使用
     *
     * <p>
     * 処理フロー: 1. 通常モード：JWT認証からusernameを取得 2. デバッグモード：デフォルトユーザー名を使用 3. usernameでUserエンティティを検索 4.
     * 見つかったUserのIDを返却
     *
     * @param authentication Spring Security認証情報（JWTから生成、デバッグモードではnull可）
     * @return ユーザーID
     * @throws IllegalArgumentException 認証情報が無効、またはユーザーが見つからない場合
     */
    protected Long getUserIdFromAuth(Authentication authentication) {
        try {
            String username;

            // デバッグモードの場合
            if (!jwtAuthEnabled) {
                username = debugDefaultUsername;
                log.debug("デバッグモード: デフォルトユーザー使用 username={}", username);
            } else {
                // 通常モード：JWT認証からusernameを取得
                if (authentication == null) {
                    throw new IllegalArgumentException("認証情報が存在しません");
                }
                username = authentication.getName();
                log.debug("通常モード: 認証ユーザー名取得 username={}", username);
            }

            // usernameでUserエンティティを検索してIDを取得
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("ユーザーが見つかりません: " + username));

            log.debug("ユーザーID取得成功: username={}, userId={}", username, user.getId());
            return user.getId();

        } catch (Exception e) {
            log.error("ユーザーID取得エラー: username={}, error={}",
                    authentication != null ? authentication.getName() : "デバッグモード", e.getMessage());
            throw new IllegalArgumentException("認証情報が無効です: " + e.getMessage());
        }
    }

    /**
     * 認証情報からユーザー情報を取得 デバッグモード時はデフォルトユーザーを使用
     *
     * @param authentication Spring Security認証情報（JWTから生成、デバッグモードではnull可）
     * @return ユーザー情報
     * @throws IllegalArgumentException 認証情報が無効、またはユーザーが見つからない場合
     */
    protected User getUserFromAuth(Authentication authentication) {
        try {
            String username;

            // デバッグモードの場合
            if (!jwtAuthEnabled) {
                username = debugDefaultUsername;
                log.debug("デバッグモード: デフォルトユーザー使用 username={}", username);
            } else {
                // 通常モード：JWT認証からusernameを取得
                if (authentication == null) {
                    throw new IllegalArgumentException("認証情報が存在しません");
                }
                username = authentication.getName();
                log.debug("通常モード: 認証ユーザー名取得 username={}", username);
            }

            // usernameでUserエンティティを検索
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("ユーザーが見つかりません: " + username));

            log.debug("ユーザー情報取得成功: username={}, userId={}", username, user.getId());
            return user;

        } catch (Exception e) {
            log.error("ユーザー情報取得エラー: username={}, error={}",
                    authentication != null ? authentication.getName() : "デバッグモード", e.getMessage());
            throw new IllegalArgumentException("認証情報が無効です: " + e.getMessage());
        }
    }

    /**
     * 現在のユーザーの権限を取得 デバッグモード時はデフォルトユーザーの権限を使用
     *
     * @param authentication Spring Security認証情報（JWTから生成、デバッグモードではnull可）
     * @return ユーザーの権限（例：管理者、上長、部下）
     * @throws IllegalArgumentException 認証情報が無効、またはユーザーが見つからない場合
     */
    protected String getCurrentUserRole(Authentication authentication) {
        User user = getUserFromAuth(authentication);
        return user.getRole();
    }

    /**
     * 現在のユーザーが管理者かどうかを判定
     *
     * @param authentication Spring Security認証情報（JWTから生成、デバッグモードではnull可）
     * @return true：管理者、false：管理者以外
     */
    protected boolean isAdmin(Authentication authentication) {
        try {
            String role = getCurrentUserRole(authentication);
            return "管理者".equals(role);
        } catch (Exception e) {
            log.warn("管理者権限チェック失敗: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 現在のユーザーが上長かどうかを判定
     *
     * @param authentication Spring Security認証情報（JWTから生成、デバッグモードではnull可）
     * @return true：上長、false：上長以外
     */
    protected boolean isSupervisor(Authentication authentication) {
        try {
            String role = getCurrentUserRole(authentication);
            return "上長".equals(role);
        } catch (Exception e) {
            log.warn("上長権限チェック失敗: {}", e.getMessage());
            return false;
        }
    }

    /**
     * デバッグモードが有効かどうかを判定
     *
     * @return true：デバッグモード有効、false：通常モード
     */
    protected boolean isDebugMode() {
        return !jwtAuthEnabled;
    }
}
