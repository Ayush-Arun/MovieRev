package com.cinevault.repository;

import com.cinevault.entity.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {

    @Query("SELECT o FROM OtpCode o WHERE o.email = :email AND o.used = false ORDER BY o.expiresAt DESC")
    Optional<OtpCode> findLatestValidByEmail(String email);

    @Modifying
    @Transactional
    @Query("DELETE FROM OtpCode o WHERE o.email = :email")
    void deleteAllByEmail(String email);
}
