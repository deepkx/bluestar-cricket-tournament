package com.bluestar.tournament.controller;

import com.bluestar.tournament.dto.AnnouncementAdminDto;
import com.bluestar.tournament.dto.GalleryAdminDto;
import com.bluestar.tournament.dto.SponsorAdminDto;
import com.bluestar.tournament.service.AdminContentService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminContentController {

    private final AdminContentService adminContentService;

    public AdminContentController(AdminContentService adminContentService) {
        this.adminContentService = adminContentService;
    }

    @GetMapping("/announcements")
    public List<AnnouncementAdminDto> announcements() {
        return adminContentService.listAnnouncements();
    }

    @PostMapping("/announcements")
    @ResponseStatus(HttpStatus.CREATED)
    public AnnouncementAdminDto createAnnouncement(@RequestBody AnnouncementAdminDto dto) {
        return adminContentService.saveAnnouncement(dto);
    }

    @PutMapping("/announcements/{id}")
    public AnnouncementAdminDto updateAnnouncement(@PathVariable Long id, @RequestBody AnnouncementAdminDto dto) {
        return adminContentService.saveAnnouncement(new AnnouncementAdminDto(id, dto.title(), dto.message(), dto.priority(), dto.published(), dto.publishedAt()));
    }

    @DeleteMapping("/announcements/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAnnouncement(@PathVariable Long id) {
        adminContentService.deleteAnnouncement(id);
    }

    @GetMapping("/sponsors")
    public List<SponsorAdminDto> sponsors() {
        return adminContentService.listSponsors();
    }

    @PostMapping("/sponsors")
    @ResponseStatus(HttpStatus.CREATED)
    public SponsorAdminDto createSponsor(@RequestBody SponsorAdminDto dto) {
        return adminContentService.saveSponsor(dto);
    }

    @PutMapping("/sponsors/{id}")
    public SponsorAdminDto updateSponsor(@PathVariable Long id, @RequestBody SponsorAdminDto dto) {
        return adminContentService.saveSponsor(new SponsorAdminDto(id, dto.name(), dto.logoPath(), dto.website(), dto.category(), dto.displayOrder(), dto.active()));
    }

    @DeleteMapping("/sponsors/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSponsor(@PathVariable Long id) {
        adminContentService.deleteSponsor(id);
    }

    @GetMapping("/gallery")
    public List<GalleryAdminDto> gallery() {
        return adminContentService.listGallery();
    }

    @PostMapping("/gallery")
    @ResponseStatus(HttpStatus.CREATED)
    public GalleryAdminDto createGallery(@RequestBody GalleryAdminDto dto) {
        return adminContentService.saveGallery(dto);
    }

    @PutMapping("/gallery/{id}")
    public GalleryAdminDto updateGallery(@PathVariable Long id, @RequestBody GalleryAdminDto dto) {
        return adminContentService.saveGallery(new GalleryAdminDto(id, dto.imagePath(), dto.caption(), dto.displayOrder(), dto.published()));
    }

    @DeleteMapping("/gallery/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteGallery(@PathVariable Long id) {
        adminContentService.deleteGallery(id);
    }
}
