package com.bluestar.tournament.service;

import com.bluestar.tournament.dto.AnnouncementPublicDto;
import com.bluestar.tournament.dto.GalleryPublicDto;
import com.bluestar.tournament.dto.SponsorPublicDto;
import com.bluestar.tournament.entity.Tournament;
import com.bluestar.tournament.repository.AnnouncementRepository;
import com.bluestar.tournament.repository.GalleryItemRepository;
import com.bluestar.tournament.repository.SponsorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ContentService {

    private final AnnouncementRepository announcementRepository;
    private final SponsorRepository sponsorRepository;
    private final GalleryItemRepository galleryItemRepository;
    private final TournamentService tournamentService;

    public ContentService(
            AnnouncementRepository announcementRepository,
            SponsorRepository sponsorRepository,
            GalleryItemRepository galleryItemRepository,
            TournamentService tournamentService) {
        this.announcementRepository = announcementRepository;
        this.sponsorRepository = sponsorRepository;
        this.galleryItemRepository = galleryItemRepository;
        this.tournamentService = tournamentService;
    }

    @Transactional(readOnly = true)
    public List<AnnouncementPublicDto> announcements() {
        Tournament t = tournamentService.requireCurrent();
        return announcementRepository.findByTournamentIdAndPublishedTrueOrderByPriorityDescPublishedAtDesc(t.getId())
                .stream()
                .map(a -> new AnnouncementPublicDto(a.getTitle(), a.getMessage(), a.getPublishedAt(), a.getPriority()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SponsorPublicDto> sponsors() {
        Tournament t = tournamentService.requireCurrent();
        return sponsorRepository.findByTournamentIdAndActiveTrueOrderByDisplayOrderAsc(t.getId())
                .stream()
                .map(s -> new SponsorPublicDto(s.getName(), s.getLogoPath(), s.getWebsite(), s.getCategory()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GalleryPublicDto> gallery() {
        Tournament t = tournamentService.requireCurrent();
        return galleryItemRepository.findByTournamentIdAndPublishedTrueOrderByDisplayOrderAsc(t.getId())
                .stream()
                .map(g -> new GalleryPublicDto(g.getImagePath(), g.getCaption()))
                .toList();
    }
}
