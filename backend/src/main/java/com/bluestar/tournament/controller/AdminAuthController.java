package com.bluestar.tournament.controller;

import com.bluestar.tournament.dto.AdminLoginRequest;
import com.bluestar.tournament.dto.AdminLoginResponse;
import com.bluestar.tournament.dto.AdminQuickLoginRequest;
import com.bluestar.tournament.service.AdminAuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/auth")
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    public AdminAuthController(AdminAuthService adminAuthService) {
        this.adminAuthService = adminAuthService;
    }

    @PostMapping("/login")
    public AdminLoginResponse login(@Valid @RequestBody AdminLoginRequest request) {
        return adminAuthService.login(request);
    }

    @PostMapping("/quick-login")
    public AdminLoginResponse quickLogin(@Valid @RequestBody AdminQuickLoginRequest request) {
        return adminAuthService.quickLogin(request);
    }

    @PostMapping("/logout")
    public void logout() {
        // Stateless JWT — client discards token
    }
}
