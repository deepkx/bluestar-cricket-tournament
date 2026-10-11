package com.bluestar.tournament.service;

import com.bluestar.tournament.config.AppProperties;
import com.bluestar.tournament.dto.AdminLoginRequest;
import com.bluestar.tournament.dto.AdminLoginResponse;
import com.bluestar.tournament.dto.AdminQuickLoginRequest;
import com.bluestar.tournament.entity.AdminUser;
import com.bluestar.tournament.exception.ApiException;
import com.bluestar.tournament.repository.AdminUserRepository;
import com.bluestar.tournament.security.AdminTokenService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class AdminAuthService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminTokenService tokenService;
    private final AppProperties appProperties;
    private final ConcurrentHashMap<String, AtomicInteger> loginAttempts = new ConcurrentHashMap<>();

    public AdminAuthService(
            AdminUserRepository adminUserRepository,
            PasswordEncoder passwordEncoder,
            AdminTokenService tokenService,
            AppProperties appProperties) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
        this.appProperties = appProperties;
    }

    public AdminLoginResponse login(AdminLoginRequest request) {
        String key = request.email().toLowerCase();
        AtomicInteger attempts = loginAttempts.computeIfAbsent(key, k -> new AtomicInteger());
        if (attempts.get() >= 10) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMIT", "Too many login attempts");
        }
        AdminUser user = adminUserRepository.findByEmailIgnoreCase(key)
                .orElseThrow(() -> {
                    attempts.incrementAndGet();
                    return new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid email or password");
                });
        if (!user.isActive() || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            attempts.incrementAndGet();
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid email or password");
        }
        attempts.set(0);
        String token = tokenService.createToken(user.getId(), user.getEmail());
        return new AdminLoginResponse(token, user.getEmail());
    }

    public AdminLoginResponse quickLogin(AdminQuickLoginRequest request) {
        String expected = appProperties.admin().quickPassword();
        if (expected == null || expected.isBlank()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "QUICK_LOGIN_DISABLED", "Quick admin login is not configured");
        }
        if (!expected.equals(request.password())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Incorrect password");
        }
        AdminUser user = adminUserRepository.findFirstByActiveTrueOrderByIdAsc()
                .orElseThrow(() -> new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "NO_ADMIN", "No admin user exists"));
        String token = tokenService.createToken(user.getId(), user.getEmail());
        return new AdminLoginResponse(token, user.getEmail());
    }
}
