package com.example.dailyreport.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.dailyreport.entity.User;
import com.example.dailyreport.repository.UserRepository;

/**
 * ユーザー管理サービス
 * ユーザーの取得・作成・更新・削除・有効/無効切り替えを提供
 */
@Service
public class UserService extends BaseService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * 全ユーザー取得
     *
     * @return 全ユーザーリスト
     */
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    /**
     * ユーザーの有効/無効を切り替え
     *
     * @param targetUser 対象ユーザー
     */
    public void changeValidUser(User targetUser) {
        boolean result = !targetUser.getIsActive();
        targetUser.setIsActive(result);
        userRepository.save(targetUser);
    }

    /**
     * ユーザー削除
     *
     * @param targetUser 削除対象ユーザー
     */
    public void deleteUser(User targetUser) {
        userRepository.findById(targetUser.getId()).ifPresent(user -> userRepository.delete(user));
    }

    /**
     * ユーザー情報更新（楽観的ロック対応）
     *
     * @param targetUser 更新対象ユーザー
     * @throws RuntimeException 排他制御エラー時
     */
    public void updateUser(User targetUser) throws RuntimeException {
        Optional<User> optionalUser = userRepository.findById(targetUser.getId());
        // 削除チェック
        if (optionalUser.isEmpty()) {
            throw new RuntimeException("対象のユーザーは削除されています。");
        }
        User user = optionalUser.get();
        // 排他チェック（楽観的ロック）
        if (!user.isLocked(targetUser.getUpdatedAt())) {
            throw new RuntimeException("既に編集されています。更新してください。");
        }

        user.setDisplayName(targetUser.getDisplayName());
        user.setEmail(targetUser.getEmail());
        user.setRole(targetUser.getRole());
        user.setIsActive(targetUser.getIsActive());
        userRepository.save(user);
    }

    /**
     * ユーザー新規作成（パスワードハッシュ化）
     *
     * @param user 作成するユーザー情報（Controllerでマッピング済み）
     */
    public void createUser(User user) throws RuntimeException {
        user.setIsActive(true);
        // パスワードをハッシュ化
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);

        userRepository.save(user);
    }
}
