package com.bluestar.tournament.controller;

import com.bluestar.tournament.dto.TournamentSettingsDto;
import com.bluestar.tournament.dto.TournamentSettingsUpdateRequest;
import com.bluestar.tournament.service.AdminTournamentService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/tournament")
public class AdminTournamentController {

    private final AdminTournamentService adminTournamentService;

    public AdminTournamentController(AdminTournamentService adminTournamentService) {
        this.adminTournamentService = adminTournamentService;
    }

    @GetMapping("/settings")
    public TournamentSettingsDto settings() {
        return adminTournamentService.getSettings();
    }

    @PatchMapping("/settings")
    public TournamentSettingsDto update(@RequestBody TournamentSettingsUpdateRequest request) {
        return adminTournamentService.update(request);
    }
}
