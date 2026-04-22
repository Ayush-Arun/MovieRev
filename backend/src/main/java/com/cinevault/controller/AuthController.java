package com.cinevault.controller;

import com.cinevault.dto.AuthDtos.*;
import com.cinevault.entity.OtpToken;
import com.cinevault.entity.RefreshToken;
import com.cinevault.entity.User;
import com.cinevault.repository.OtpTokenRepository;
import com.cinevault.repository.RefreshTokenRepository;
import com.cinevault.repository.UserRepository;
import com.cinevault.security.JwtUtil;
import com.cinevault.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Random;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private OtpTokenRepository otpTokenRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already taken!");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setUsername(request.username());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setDisplayName(request.displayName());
        user.setRole("user");
        user.setIsVerified(false);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        if (request.sessionId() != null) {
            try {
                jdbcTemplate.queryForList("SELECT merge_guest_to_user(CAST(? AS UUID), ?)", request.sessionId(), user.getId());
            } catch (Exception e) {
                System.err.println("Guest merge failed: " + e.getMessage());
            }
        }

        String otpValue = generateOtp();
        OtpToken otpToken = new OtpToken(user.getEmail(), otpValue, "REGISTER", LocalDateTime.now().plusMinutes(10));
        otpTokenRepository.save(otpToken);
        emailService.sendOtp(user.getEmail(), otpValue, "REGISTER");

        return ResponseEntity.ok("OTP sent to email for verification.");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        Optional<OtpToken> tokenOpt = otpTokenRepository.findByEmailAndOtpAndPurpose(request.email(), request.otp(), "REGISTER");
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid OTP or Email.");
        }
        OtpToken token = tokenOpt.get();
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("OTP has expired.");
        }

        User user = userRepository.findByEmail(request.email()).orElseThrow();
        user.setIsVerified(true);
        userRepository.save(user);
        
        otpTokenRepository.deleteByEmailAndPurpose(request.email(), "REGISTER");

        // We can't automatically log them in without password unless we skip authManager.
        // It's mostly requested they login manually, or we could just say "Verified, please login."
        return ResponseEntity.ok("Verification successful. Please login.");
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.email()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found.");
        }
        if (user.getIsVerified()) {
            return ResponseEntity.badRequest().body("User is already verified.");
        }

        otpTokenRepository.deleteByEmailAndPurpose(user.getEmail(), "REGISTER");
        String otpValue = generateOtp();
        OtpToken otpToken = new OtpToken(user.getEmail(), otpValue, "REGISTER", LocalDateTime.now().plusMinutes(10));
        otpTokenRepository.save(otpToken);
        emailService.sendOtp(user.getEmail(), otpValue, "REGISTER");

        return ResponseEntity.ok("New OTP sent via email.");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.email()).orElse(null);
        if (user == null) {
            return ResponseEntity.ok("If an account with that email exists, an OTP has been sent."); // generic response to prevent discovery
        }

        otpTokenRepository.deleteByEmailAndPurpose(user.getEmail(), "RESET_PASSWORD");
        String otpValue = generateOtp();
        OtpToken otpToken = new OtpToken(user.getEmail(), otpValue, "RESET_PASSWORD", LocalDateTime.now().plusMinutes(10));
        otpTokenRepository.save(otpToken);
        emailService.sendOtp(user.getEmail(), otpValue, "RESET_PASSWORD");

        return ResponseEntity.ok("If an account with that email exists, an OTP has been sent.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        Optional<OtpToken> tokenOpt = otpTokenRepository.findByEmailAndOtpAndPurpose(request.email(), request.otp(), "RESET_PASSWORD");
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid OTP or Email.");
        }
        OtpToken token = tokenOpt.get();
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("OTP has expired.");
        }

        User user = userRepository.findByEmail(request.email()).orElseThrow();
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        
        otpTokenRepository.deleteByEmailAndPurpose(request.email(), "RESET_PASSWORD");

        return ResponseEntity.ok("Password successfully reset.");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.email()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }
        if (!user.getIsVerified()) {
            return ResponseEntity.status(403).body("Account not verified.");
        }

        if (request.sessionId() != null) {
            try {
                jdbcTemplate.queryForList("SELECT merge_guest_to_user(CAST(? AS UUID), ?)", request.sessionId(), user.getId());
            } catch (Exception e) {
                System.err.println("Guest merge failed: " + e.getMessage());
            }
        }
        return authenticateAndGenerateResponse(request.email(), request.password());
    }

    private ResponseEntity<?> authenticateAndGenerateResponse(String email, String password) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );
        } catch (DisabledException | LockedException ex) {
            return ResponseEntity.status(403).body("Account not verified. Please check your email for the OTP.");
        } catch (Exception ex) {
            return ResponseEntity.status(401).body("Invalid credentials.");
        }

        User user = userRepository.findByEmail(email).orElseThrow();

        String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getId(), user.getRole());
        String refreshTokenString = jwtUtil.generateRefreshToken(user.getEmail());

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(passwordEncoder.encode(refreshTokenString));
        
        Date expiration = jwtUtil.getExpirationDateFromRefreshToken(refreshTokenString);
        refreshToken.setExpiresAt(expiration.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());
        
        refreshTokenRepository.save(refreshToken);

        UserDto userDto = new UserDto(user.getId(), user.getEmail(), user.getUsername(), user.getDisplayName(), user.getAvatarUrl(), user.getRole());
        return ResponseEntity.ok(new AuthResponse(userDto, accessToken, refreshTokenString));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody RefreshRequest request) {
        String token = request.refreshToken();
        if (!jwtUtil.validateRefreshToken(token)) {
            return ResponseEntity.status(401).body("Invalid refresh token");
        }

        String email = jwtUtil.getEmailFromRefreshToken(token);
        User user = userRepository.findByEmail(email).orElseThrow();

        String newAccessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getId(), user.getRole());
        String newRefreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        return ResponseEntity.ok(new AuthResponse(null, newAccessToken, newRefreshToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody RefreshRequest request) {
        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(new UserDto(user.getId(), user.getEmail(), user.getUsername(), user.getDisplayName(), user.getAvatarUrl(), user.getRole()));
    }
}
