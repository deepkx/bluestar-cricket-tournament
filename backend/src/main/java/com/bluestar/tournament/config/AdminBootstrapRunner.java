package com.bluestar.tournament.config;

import com.bluestar.tournament.entity.AdminUser;
import com.bluestar.tournament.repository.AdminUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrapRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapRunner.class);

    private final AppProperties appProperties;
    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminBootstrapRunner(
            AppProperties appProperties,
            AdminUserRepository adminUserRepository,
            PasswordEncoder passwordEncoder) {
        this.appProperties = appProperties;
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        String email = appProperties.admin().bootstrapEmail();
        String password = appProperties.admin().bootstrapPassword();
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            log.info("Admin bootstrap skipped — set ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD to create an admin user.");
            return;
        }
        if (adminUserRepository.findByEmailIgnoreCase(email).isPresent()) {
            return;
        }
        AdminUser user = new AdminUser();
        user.setEmail(email.toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole("ADMIN");
        user.setActive(true);
        adminUserRepository.save(user);
        log.info("Bootstrap admin user created for {}", email);
    }
}
