package com.bluestar.tournament.repository;

import com.bluestar.tournament.entity.SiteSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SiteSettingsRepository extends JpaRepository<SiteSettings, Long> {
    Optional<SiteSettings> findFirstByOrderByIdAsc();
}
