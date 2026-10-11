package com.bluestar.tournament.service;

import com.bluestar.tournament.dto.AnnouncementAdminDto;
import com.bluestar.tournament.dto.GalleryAdminDto;
import com.bluestar.tournament.dto.SponsorAdminDto;
import com.bluestar.tournament.entity.Announcement;
import com.bluestar.tournament.entity.GalleryItem;
import com.bluestar.tournament.entity.Sponsor;
import com.bluestar.tournament.entity.Tournament;
import com.bluestar.tournament.exception.ApiException;
import com.bluestar.tournament.repository.AnnouncementRepository;
import com.bluestar.tournament.repository.GalleryItemRepository;
import com.bluestar.tournament.repository.SponsorRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class AdminContentService {

    private final AnnouncementRepository announcementRepository;
    private final SponsorRepository sponsorRepository;
    private final GalleryItemRepository galleryItemRepository;
    private final TournamentService tournamentService;

    public AdminContentService(
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
    public List<AnnouncementAdminDto> listAnnouncements() {
        return announcementRepository.findByTournamentIdOrderByPriorityDescCreatedAtDesc(tournamentId())
                .stream().map(AnnouncementAdminDto::from).toList();
    }

    @Transactional
    public AnnouncementAdminDto saveAnnouncement(AnnouncementAdminDto dto) {
        Tournament t = tournamentService.requireCurrent();
        Announcement a = dto.id() != null ? announcementRepository.findById(dto.id()).orElse(new Announcement()) : new Announcement();
        a.setTournament(t);
        a.setTitle(dto.title());
        a.setMessage(dto.message());
        a.setPriority(dto.priority());
        a.setPublished(dto.published());
        if (dto.published() && a.getPublishedAt() == null) {
            a.setPublishedAt(Instant.now());
        }
        return AnnouncementAdminDto.from(announcementRepository.save(a));
    }

    @Transactional
    public void deleteAnnouncement(Long id) {
        announcementRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<SponsorAdminDto> listSponsors() {
        return sponsorRepository.findByTournamentIdOrderByDisplayOrderAsc(tournamentId())
                .stream().map(SponsorAdminDto::from).toList();
    }

    @Transactional
    public SponsorAdminDto saveSponsor(SponsorAdminDto dto) {
        Sponsor s = dto.id() != null ? sponsorRepository.findById(dto.id()).orElse(new Sponsor()) : new Sponsor();
        s.setTournament(tournamentService.requireCurrent());
        s.setName(dto.name());
        s.setLogoPath(dto.logoPath());
        s.setWebsite(dto.website());
        s.setCategory(dto.category());
        s.setDisplayOrder(dto.displayOrder());
        s.setActive(dto.active());
        return SponsorAdminDto.from(sponsorRepository.save(s));
    }

    @Transactional
    public void deleteSponsor(Long id) {
        sponsorRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<GalleryAdminDto> listGallery() {
        return galleryItemRepository.findByTournamentIdOrderByDisplayOrderAsc(tournamentId())
                .stream().map(GalleryAdminDto::from).toList();
    }

    @Transactional
    public GalleryAdminDto saveGallery(GalleryAdminDto dto) {
        GalleryItem g = dto.id() != null ? galleryItemRepository.findById(dto.id()).orElse(new GalleryItem()) : new GalleryItem();
        g.setTournament(tournamentService.requireCurrent());
        g.setImagePath(dto.imagePath());
        g.setCaption(dto.caption());
        g.setDisplayOrder(dto.displayOrder());
        g.setPublished(dto.published());
        return GalleryAdminDto.from(galleryItemRepository.save(g));
    }

    @Transactional
    public void deleteGallery(Long id) {
        galleryItemRepository.deleteById(id);
    }

    private Long tournamentId() {
        return tournamentService.requireCurrent().getId();
    }
}
