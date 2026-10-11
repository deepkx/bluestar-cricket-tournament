package com.bluestar.tournament.repository;

import com.bluestar.tournament.entity.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {
    Optional<AdminUser> findByEmailIgnoreCase(String email);

    Optional<AdminUser> findFirstByActiveTrueOrderByIdAsc();

    long count();
}
