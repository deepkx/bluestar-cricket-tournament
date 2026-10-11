package com.bluestar.tournament.controller;

import com.bluestar.tournament.dto.AdminMatchRequest;
import com.bluestar.tournament.dto.MatchPublicDto;
import com.bluestar.tournament.dto.MatchResultRequest;
import com.bluestar.tournament.service.AdminMatchService;
import com.bluestar.tournament.service.MatchService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/matches")
public class AdminMatchController {

    private final AdminMatchService adminMatchService;
    private final MatchService matchService;

    public AdminMatchController(AdminMatchService adminMatchService, MatchService matchService) {
        this.adminMatchService = adminMatchService;
        this.matchService = matchService;
    }

    @GetMapping
    public List<MatchPublicDto> list() {
        return adminMatchService.listAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MatchPublicDto create(@RequestBody AdminMatchRequest request) {
        return adminMatchService.create(request);
    }

    @PatchMapping("/{id}")
    public MatchPublicDto update(@PathVariable Long id, @RequestBody AdminMatchRequest request) {
        return adminMatchService.update(id, request);
    }

    @PostMapping("/{id}/result")
    public MatchPublicDto result(@PathVariable Long id, @Valid @RequestBody MatchResultRequest request) {
        return matchService.recordResult(id, request);
    }
}
