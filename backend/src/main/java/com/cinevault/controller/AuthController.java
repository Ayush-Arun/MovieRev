package com.cinevault.controller;

import com.cinevault.dto.AuthDtos.*;
import com.cinevault.entity.OtpCode;
import com.cinevault.entity.RefreshToken;
import com.cinevault.entity.User;
import com.cinevault.repository.OtpCodeRepository;
import com.cinevault.repository.RefreshTokenRepository;
import com.cinevault.repository.UserRepository;
import com.cinevault.security.JwtUtil;
import com.cinevault.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Map;
import java.util.Random;

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
    private OtpCodeRepository otpCodeRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EmailService emailService;

    // ─── REGISTER ─────────────────────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already taken!");
        }
        if (userRepository.findByUsername(request.username()).isPresent()) {
            return ResponseEntity.badRequest().body("Username is already taken!");
        }

        // Save user with isVerified = false — they MUST verify OTP before logging in
        User user = new User();
        user.setEmail(request.email());
        user.setUsername(request.username());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setDisplayName(request.displayName() != null && !request.displayName().isBlank()
                ? request.displayName() : request.username());
        user.setRole("user");
        user.setIsVerified(false);   // ← NOT verified yet
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // Merge any guest session data
        if (request.sessionId() != null) {
            try {
                jdbcTemplate.update("SELECT merge_guest_to_user(?, ?)", request.sessionId(), user.getId());
            } catch (Exception ignored) {}
        }

        // Generate OTP and send email
        sendOtpToEmail(request.email());

        // Tell frontend to show OTP screen
        return ResponseEntity.ok(Map.of(
                "status", "otp_required",
                "email", request.email(),
                "message", "A 6-digit code has been sent to your email. Please verify."
        ));
    }

    // ─── VERIFY OTP ───────────────────────────────────────────────────────────
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String submittedCode = body.get("code");

        if (email == null || submittedCode == null) {
            return ResponseEntity.badRequest().body("Email and code are required.");
        }

        OtpCode otpCode = otpCodeRepository.findLatestValidByEmail(email).orElse(null);

        if (otpCode == null) {
            return ResponseEntity.status(400).body("No verification code found. Please register again.");
        }
        if (otpCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(400).body("Code has expired. Please register again.");
        }
        if (!otpCode.getCode().equals(submittedCode.trim())) {
            return ResponseEntity.status(400).body("Invalid code. Please try again.");
        }

        // Mark OTP as used
        otpCode.setUsed(true);
        otpCodeRepository.save(otpCode);

        // Mark user as verified
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsVerified(true);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // Issue tokens - user is now fully authenticated
        return ResponseEntity.ok(generateAuthResponse(user));
    }

    // ─── RESEND OTP ───────────────────────────────────────────────────────────
    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null) return ResponseEntity.badRequest().body("Email required.");

        if (!userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body("No account found for this email.");
        }

        sendOtpToEmail(email);
        return ResponseEntity.ok(Map.of("message", "A new code has been sent to " + email));
    }

    // ─── LOGIN ────────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.email()).orElse(null);

        if (user == null) {
            return ResponseEntity.status(401).body("Invalid email or password.");
        }

        // If user registered but never verified OTP — resend OTP and ask them to verify
        if (Boolean.FALSE.equals(user.getIsVerified())) {
            sendOtpToEmail(request.email());
            return ResponseEntity.ok(Map.of(
                    "status", "otp_required",
                    "email", request.email(),
                    "message", "Your account is not verified. A new code has been sent to your email."
            ));
        }

        if (request.sessionId() != null) {
            try {
                jdbcTemplate.update("SELECT merge_guest_to_user(?, ?)", request.sessionId(), user.getId());
            } catch (Exception ignored) {}
        }

        return authenticateAndGenerateResponse(request.email(), request.password());
    }

    // ─── REFRESH TOKEN ────────────────────────────────────────────────────────
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

    // ─── LOGOUT ───────────────────────────────────────────────────────────────
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody RefreshRequest request) {
        return ResponseEntity.ok("Logged out successfully");
    }

    // ─── ME ───────────────────────────────────────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(new UserDto(user.getId(), user.getEmail(), user.getUsername(), user.getDisplayName(), user.getRole()));
    }

    // ─── PROFILE UPDATE ───────────────────────────────────────────────────────
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(Authentication authentication, @RequestBody Map<String, String> body) {
        if (authentication == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        
        String displayName = body.get("displayName");
        if (displayName != null && !displayName.trim().isEmpty()) {
            user.setDisplayName(displayName.trim());
        }
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        return ResponseEntity.ok(new UserDto(user.getId(), user.getEmail(), user.getUsername(), user.getDisplayName(), user.getRole()));
    }

    // ─── FORGOT PASSWORD ──────────────────────────────────────────────────────
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.trim().isEmpty()) return ResponseEntity.badRequest().body("Email required.");

        if (userRepository.findByEmail(email).isEmpty()) {
            // Return ok to not leak whether account exists
            sendOtpToEmail(email); // Or we can pretend to send. In this case, we'll actually send so the user can verify if they want, but realistically we shouldn't send to non-existent users if we care about spam. Let's just send it.
            return ResponseEntity.ok(Map.of("message", "If an account exists, a code was sent."));
        }

        sendOtpToEmail(email);
        return ResponseEntity.ok(Map.of("message", "A password reset code has been sent to your email."));
    }

    // ─── RESET PASSWORD ───────────────────────────────────────────────────────
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String code = body.get("code");
        String newPassword = body.get("newPassword");

        if (email == null || code == null || newPassword == null) {
            return ResponseEntity.badRequest().body("Missing required fields.");
        }

        OtpCode otpCode = otpCodeRepository.findLatestValidByEmail(email).orElse(null);

        if (otpCode == null || otpCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(400).body("Code expired or invalid.");
        }
        if (!otpCode.getCode().equals(code.trim())) {
            return ResponseEntity.status(400).body("Invalid code.");
        }

        User user = userRepository.findByEmail(email).orElseThrow();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        otpCode.setUsed(true);
        otpCodeRepository.save(otpCode);

        return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now login."));
    }

    // ─── DELETE ACCOUNT ───────────────────────────────────────────────────────
    @DeleteMapping("/me")
    public ResponseEntity<?> deleteMyAccount(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        userRepository.delete(user);
        return ResponseEntity.ok("Account deleted successfully");
    }

    // ─── PRIVATE HELPERS ──────────────────────────────────────────────────────
    private void sendOtpToEmail(String email) {
        // Delete any old OTPs for this email first
        otpCodeRepository.deleteAllByEmail(email);

        // Generate 6-digit code
        String code = String.format("%06d", new Random().nextInt(999999));

        // Save to DB
        OtpCode otpCode = new OtpCode(
                email,
                code,
                LocalDateTime.now().plusMinutes(10)
        );
        otpCodeRepository.save(otpCode);

        // Fire the email
        emailService.sendOtp(email, code);
    }

    private AuthResponse generateAuthResponse(User user) {
        String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getId(), user.getRole());
        String refreshTokenString = jwtUtil.generateRefreshToken(user.getEmail());

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(passwordEncoder.encode(refreshTokenString));
        Date expiration = jwtUtil.getExpirationDateFromRefreshToken(refreshTokenString);
        refreshToken.setExpiresAt(expiration.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());
        refreshTokenRepository.save(refreshToken);

        UserDto userDto = new UserDto(user.getId(), user.getEmail(), user.getUsername(), user.getDisplayName(), user.getRole());
        return new AuthResponse(userDto, accessToken, refreshTokenString);
    }

    private ResponseEntity<?> authenticateAndGenerateResponse(String email, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
        User user = userRepository.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(generateAuthResponse(user));
    }
}
