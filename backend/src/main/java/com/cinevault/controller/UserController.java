package com.cinevault.controller;

import com.cinevault.dto.AuthDtos.UserDto;
import com.cinevault.dto.UserDtos.UpdateUserRequest;
import com.cinevault.entity.User;
import com.cinevault.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PutMapping("/me/settings")
    public ResponseEntity<?> updateSettings(@RequestBody UpdateUserRequest request, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();

        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();

        if (request.displayName() != null && !request.displayName().isBlank()) {
            user.setDisplayName(request.displayName());
        }
        
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(request.avatarUrl());
        }

        if (request.newPassword() != null && !request.newPassword().isBlank()) {
            if (request.currentPassword() == null || request.currentPassword().isBlank() || !passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
                return ResponseEntity.badRequest().body("Invalid current password");
            }
            user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        }

        userRepository.save(user);

        return ResponseEntity.ok(new UserDto(user.getId(), user.getEmail(), user.getUsername(), user.getDisplayName(), user.getAvatarUrl(), user.getRole()));
    }
}
