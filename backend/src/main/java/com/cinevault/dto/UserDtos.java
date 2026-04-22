package com.cinevault.dto;

public class UserDtos {
    public record UpdateUserRequest(
            String displayName,
            String avatarUrl,
            String currentPassword,
            String newPassword
    ) {}
}
