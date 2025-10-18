package com.example.dailyreport.service;

import org.apache.commons.lang3.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.dailyreport.entity.User;
import com.example.dailyreport.repository.UserRepository;

@Service
public class BaseService {
    @Autowired
    protected UserRepository userRepository;

    /**
     * 管理者かどうかをチェック
     *
     * @param loginUserId ユーザーID
     * @return true: 管理者、false: 管理者以外
     */
    public boolean checkIsAdmin(String loginUserId) {
        User user = userRepository.findByIdAndRole(loginUserId, "管理者").orElse(null);
        return ObjectUtils.isEmpty(user);
    }
}
