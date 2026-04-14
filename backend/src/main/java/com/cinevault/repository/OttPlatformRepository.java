package com.cinevault.repository;

import com.cinevault.entity.OttPlatform;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OttPlatformRepository extends JpaRepository<OttPlatform, Long> {
    Optional<OttPlatform> findByTmdbProviderId(Integer tmdbProviderId);
}
