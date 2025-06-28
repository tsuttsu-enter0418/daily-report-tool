package com.example.dailyreport.service;

import com.example.dailyreport.dto.LoginRequest;
import com.example.dailyreport.dto.LoginResponse;
import com.example.dailyreport.entity.User;
import com.example.dailyreport.repository.UserRepository;
import com.example.dailyreport.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * 認証関連のビジネスロジックを担当するサービスクラス
 * 
 * 機能:
 * - ユーザー認証の実行
 * - パスワード検証（BCrypt）
 * - JWT トークンの生成
 * - 認証エラーのハンドリング
 * 
 * 依存関係:
 * - UserRepository: ユーザー情報の取得
 * - PasswordEncoder: パスワードの暗号化・検証
 * - JwtUtil: JWT トークンの生成・検証
 */
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * ユーザー認証を実行し、成功時にJWTトークンを発行
     * 
     * 処理フロー:
     * 1. ユーザー名でユーザー情報を検索
     * 2. ユーザーが存在しない場合は例外を投げる
     * 3. BCryptでパスワードを検証
     * 4. パスワードが一致しない場合は例外を投げる
     * 5. 認証成功時にJWTトークンを生成・返却
     * 
     * @param loginRequest ログイン情報（ユーザー名、パスワード）
     * @return LoginResponse JWTトークンとユーザー情報
     * @throws RuntimeException ユーザーが見つからない、またはパスワードが間違っている場合
     */
    public LoginResponse authenticateUser(LoginRequest loginRequest) {
        // ユーザー名でユーザー情報を検索
        Optional<User> userOptional = userRepository.findByUsername(loginRequest.getUsername());
        
        if (userOptional.isEmpty()) {
            throw new RuntimeException("ユーザーが見つかりません");
        }
        
        User user = userOptional.get();
        
        // BCryptでパスワード検証
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("パスワードが正しくありません");
        }
        
        // 認証成功: JWTトークン生成
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
        
        // Lombokの@Builderを使用してレスポンス作成
        return LoginResponse.builder()
                .token(token)
                .id(user.getId().toString())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .displayName(user.getUsername()) // 表示名はユーザー名をデフォルトとする
                .build();
    }
}