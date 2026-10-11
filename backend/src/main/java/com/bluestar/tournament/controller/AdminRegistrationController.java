package com.bluestar.tournament.controller;

import com.bluestar.tournament.domain.RegistrationStatus;
import com.bluestar.tournament.dto.AdminRegistrationDetailDto;
import com.bluestar.tournament.dto.AdminRegistrationSummaryDto;
import com.bluestar.tournament.dto.AdminRegistrationUpdateRequest;
import com.bluestar.tournament.dto.AdminTeamCreateRequest;
import com.bluestar.tournament.service.AdminRegistrationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/registrations")
public class AdminRegistrationController {

    private final AdminRegistrationService adminRegistrationService;

    public AdminRegistrationController(AdminRegistrationService adminRegistrationService) {
        this.adminRegistrationService = adminRegistrationService;
    }

    @GetMapping
    public Page<AdminRegistrationSummaryDto> list(
            @RequestParam(required = false) String q,
            Pageable pageable) {
        return adminRegistrationService.list(q, pageable);
    }

    @PostMapping("/teams")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminRegistrationDetailDto createTeam(@Valid @RequestBody AdminTeamCreateRequest request) {
        return adminRegistrationService.createTeam(request);
    }

    @PostMapping(value = "/teams/with-media", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public AdminRegistrationDetailDto createTeamWithMedia(
            @Valid @RequestPart("payload") AdminTeamCreateRequest request,
            @RequestPart(value = "teamLogo", required = false) MultipartFile teamLogo,
            @RequestPart(value = "captainPhoto", required = false) MultipartFile captainPhoto) {
        return adminRegistrationService.createTeamWithMedia(request, teamLogo, captainPhoto);
    }

    @DeleteMapping("/{id}/board")
    public java.util.Map<String, Boolean> removeFromBoard(@PathVariable Long id) {
        boolean removed = adminRegistrationService.removeFromBoard(id);
        return java.util.Map.of("deleted", removed);
    }

    @GetMapping("/{id}")
    public AdminRegistrationDetailDto detail(@PathVariable Long id) {
        return adminRegistrationService.detail(id);
    }

    @PutMapping("/{id}")
    public AdminRegistrationDetailDto update(
            @PathVariable Long id,
            @Valid @RequestBody AdminRegistrationUpdateRequest request) {
        return adminRegistrationService.update(id, request);
    }

    @PutMapping(value = "/{id}/with-media", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AdminRegistrationDetailDto updateWithMedia(
            @PathVariable Long id,
            @Valid @RequestPart("payload") AdminRegistrationUpdateRequest request,
            @RequestPart(value = "teamLogo", required = false) MultipartFile teamLogo,
            @RequestPart(value = "playerPhotos", required = false) List<MultipartFile> playerPhotos) {
        return adminRegistrationService.updateWithMedia(id, request, teamLogo, playerPhotos);
    }

    @PatchMapping("/{id}/status")
    public AdminRegistrationDetailDto updateStatus(
            @PathVariable Long id,
            @RequestParam RegistrationStatus status) {
        return adminRegistrationService.updateStatus(id, status);
    }

    @GetMapping("/export.csv")
    public ResponseEntity<String> exportCsv() {
        String csv = adminRegistrationService.exportCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=registrations.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}
