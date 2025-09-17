package com.example.dailyreport.security;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

/**
 * JWT（JSON Web Token）トークンの生成・検証を行うユーティリティクラス
 *
 * <p>機能: - JWTトークンの生成（ユーザー名、役職を含む） - トークンからのユーザー情報抽出 - トークンの有効性検証 - トークンの期限切れチェック
 *
 * <p>セキュリティ: - HMAC SHA-256署名アルゴリズム使用 - 設定可能な秘密鍵とトークン有効期限 - トークン改ざん検知機能
 *
 * <p>設定値: - jwt.secret: JWT署名用秘密鍵（デフォルト: mySecretKey） - jwt.expiration: トークン有効期限（ミリ秒、デフォルト:
 * 86400000 = 24時間）
 */
@Component
public class JwtUtil {

    /** JWT署名用秘密鍵（application.propertiesから設定可能） */
    @Value("${jwt.secret:mySecretKey}")
    private String secret;

    /** JWTトークン有効期限（ミリ秒単位、デフォルト24時間） */
    @Value("${jwt.expiration:86400000}")
    private Long expiration;

    /**
     * JWT署名用の秘密鍵を生成 HMAC SHA-256アルゴリズムに適したSecretKeyを返す
     *
     * @return HMAC SHA-256用の秘密鍵
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * JWTトークンを生成 ユーザー名をsubject、役職をclaimとして含むトークンを作成
     *
     * @param username ユーザー名（JWTのsubjectに設定）
     * @param role ユーザーの役職（カスタムclaimに設定）
     * @return 生成されたJWTトークン文字列
     */
    public String generateToken(String username, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * JWTトークンからユーザー名を抽出
     *
     * @param token JWTトークン文字列
     * @return トークンに含まれるユーザー名
     * @throws JwtException トークンが無効またはパースエラーの場合
     */
    public String getUsernameFromToken(String token) {
        Claims claims =
                Jwts.parserBuilder()
                        .setSigningKey(getSigningKey())
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

        return claims.getSubject();
    }

    /**
     * JWTトークンから役職情報を抽出
     *
     * @param token JWTトークン文字列
     * @return トークンに含まれる役職（管理者/上長/部下）
     * @throws JwtException トークンが無効またはパースエラーの場合
     */
    public String getRoleFromToken(String token) {
        Claims claims =
                Jwts.parserBuilder()
                        .setSigningKey(getSigningKey())
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

        return claims.get("role", String.class);
    }

    /**
     * JWTトークンの有効性を検証 署名の検証、有効期限チェック、フォーマット確認を行う
     *
     * @param token 検証対象のJWTトークン文字列
     * @return トークンが有効な場合true、無効な場合false
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * JWTトークンが期限切れかどうかをチェック
     *
     * @param token チェック対象のJWTトークン文字列
     * @return トークンが期限切れまたは無効な場合true、有効な場合false
     */
    public boolean isTokenExpired(String token) {
        try {
            Claims claims =
                    Jwts.parserBuilder()
                            .setSigningKey(getSigningKey())
                            .build()
                            .parseClaimsJws(token)
                            .getBody();

            return claims.getExpiration().before(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            // パースエラーの場合も期限切れとして扱う
            return true;
        }
    }
}
