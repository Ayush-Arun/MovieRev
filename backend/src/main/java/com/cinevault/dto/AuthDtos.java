package com.cinevault.dto;

import java.util.UUID;

public class AuthDtos {

    public record RegisterRequest(
            String email,
            String username,
            String password,
            String displayName,
            UUID sessionId
    ) {}

    public record LoginRequest(
            String email,
            String password,
            UUID sessionId
    ) {}

    public record RefreshRequest(
            String refreshToken
    ) {}

    public record VerifyOtpRequest(
            String email,
            String otp
    ) {}

    public record ForgotPasswordRequest(
            String email
    ) {}

    public record ResetPasswordRequest(
            String email,
            String otp,
            String newPassword
    ) {}

    public record AuthResponse(
            UserDto user,
            String accessToken,
            String refreshToken
    ) {}

    public record UserDto(
            Long id,
            String email,
            String username,
            String displayName,
            String avatarUrl,
            String role
    ) {}
}
