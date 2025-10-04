package com.example.dailyreport.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.dailyreport.entity.User;
import com.example.dailyreport.repository.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> getUsers() {
        return userRepository.findAll();
    }

    public void changeValidUser(User targetUser) {
        boolean result = !targetUser.getIsActive();
        targetUser.setIsActive(result);
        targetUser.onUpdate();
        userRepository.save(targetUser);
    }

    public void deleteUser(User targetUser) {
        userRepository.delete(targetUser);
    }

    public void updateUser(User targetUser) {
        targetUser.onUpdate();
        userRepository.save(targetUser);
    }

    public void createUser(User createUser) {
        String encodedPassword = passwordEncoder.encode(createUser.getPassword());
        createUser.setPassword(encodedPassword);
        userRepository.save(createUser);
    }
}
