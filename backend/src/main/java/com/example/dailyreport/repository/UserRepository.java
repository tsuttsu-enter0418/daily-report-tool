package com.example.dailyreport.repository;

import com.example.dailyreport.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ユーザーデータアクセス層
 * 
 * 機能:
 * - ユーザーの基本CRUD操作
 * - ユーザー名・メールでの検索
 * - 上司-部下関係検索
 * - アクティブユーザー管理
 * 
 * 主要メソッド:
 * - findByUsername: ログイン認証用
 * - findBySupervisorId: 上司による部下一覧取得
 * - findByIsActiveTrue: アクティブユーザー一覧
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * ユーザー名での検索
     * @param username ユーザー名
     * @return ユーザー情報
     */
    Optional<User> findByUsername(String username);
    
    /**
     * メールアドレスでの検索
     * @param email メールアドレス
     * @return ユーザー情報
     */
    Optional<User> findByEmail(String email);
    
    /**
     * ユーザー名の存在チェック
     * @param username ユーザー名
     * @return 存在する場合true
     */
    boolean existsByUsername(String username);
    
    /**
     * メールアドレスの存在チェック
     * @param email メールアドレス
     * @return 存在する場合true
     */
    boolean existsByEmail(String email);
    
    /**
     * 指定上司の部下一覧取得
     * @param supervisorId 上司ID
     * @return 部下一覧
     */
    List<User> findBySupervisorId(Long supervisorId);
    
    /**
     * アクティブユーザー一覧取得
     * @return アクティブユーザー一覧
     */
    List<User> findByIsActiveTrue();
    
    /**
     * 役職別ユーザー一覧取得
     * @param role 役職
     * @return ユーザー一覧
     */
    List<User> findByRole(String role);
    
    /**
     * アクティブかつ指定上司の部下一覧取得
     * @param supervisorId 上司ID
     * @return アクティブな部下一覧
     */
    List<User> findBySupervisorIdAndIsActiveTrue(Long supervisorId);
}