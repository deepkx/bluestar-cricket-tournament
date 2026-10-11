package com.bluestar.tournament.controller;

import com.bluestar.tournament.dto.*;
import com.bluestar.tournament.service.ContentService;
import com.bluestar.tournament.service.MatchService;
import com.bluestar.tournament.service.RegistrationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class PublicContentController {

    private final RegistrationService registrationService;
    private final MatchService matchService;
    private final ContentService contentService;

    public PublicContentController(
            RegistrationService registrationService,
            MatchService matchService,
            ContentService contentService) {
        this.registrationService = registrationService;
        this.matchService = matchService;
        this.contentService = contentService;
    }

    @GetMapping("/teams")
    public List<TeamPublicDto> teams(@RequestParam(required = false) String q) {
        return registrationService.listConfirmedTeams(q);
    }

    @GetMapping("/teams/by-name")
    public TeamDetailPublicDto teamByName(@RequestParam String name) {
        return registrationService.getConfirmedTeamDetail(name);
    }

    @GetMapping("/matches")
    public List<MatchPublicDto> matches(@RequestParam(defaultValue = "false") boolean upcomingOnly) {
        return matchService.publicMatches(false).stream()
                .filter(m -> !upcomingOnly || !"COMPLETED".equals(m.matchStatus()))
                .toList();
    }

    @GetMapping("/results")
    public List<MatchPublicDto> results() {
        return matchService.publicMatches(true);
    }

    @GetMapping("/bracket")
    public List<MatchPublicDto> bracket() {
        return matchService.bracketView();
    }

    @GetMapping("/announcements")
    public List<AnnouncementPublicDto> announcements() {
        return contentService.announcements();
    }

    @GetMapping("/sponsors")
    public List<SponsorPublicDto> sponsors() {
        return contentService.sponsors();
    }

    @GetMapping("/gallery")
    public List<GalleryPublicDto> gallery() {
        return contentService.gallery();
    }
}
