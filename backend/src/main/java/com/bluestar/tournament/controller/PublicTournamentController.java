package com.bluestar.tournament.controller;

import com.bluestar.tournament.dto.TournamentAvailabilityDto;
import com.bluestar.tournament.dto.TournamentPublicDto;
import com.bluestar.tournament.service.TournamentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/tournaments")
public class PublicTournamentController {

    private final TournamentService tournamentService;

    public PublicTournamentController(TournamentService tournamentService) {
        this.tournamentService = tournamentService;
    }

    @GetMapping("/current")
    public TournamentPublicDto current() {
        return tournamentService.getCurrentPublic();
    }

    @GetMapping("/current/availability")
    public TournamentAvailabilityDto availability() {
        return tournamentService.getAvailability();
    }
}
