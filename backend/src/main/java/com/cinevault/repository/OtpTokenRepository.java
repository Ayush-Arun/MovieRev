package com.cinevault.repository;

import com.cinevault.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findByEmailAndOtpAndPurpose(String email, String otp, String purpose);

    @Transactional
    void deleteByEmailAndPurpose(String email, String purpose);
}
