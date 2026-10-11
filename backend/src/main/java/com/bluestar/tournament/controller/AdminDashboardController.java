package com.bluestar.tournament.controller;

import com.bluestar.tournament.dto.AdminDashboardDto;
import com.bluestar.tournament.service.AdminDashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    public AdminDashboardController(AdminDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public AdminDashboardDto dashboard() {
        return dashboardService.dashboard();
    }
}
