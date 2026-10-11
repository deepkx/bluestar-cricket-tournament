package com.bluestar.tournament.service;

import com.bluestar.tournament.dto.TournamentSettingsDto;
import com.bluestar.tournament.dto.TournamentSettingsUpdateRequest;
import com.bluestar.tournament.entity.SiteSettings;
import com.bluestar.tournament.entity.Tournament;
import com.bluestar.tournament.repository.SiteSettingsRepository;
import com.bluestar.tournament.repository.TournamentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminTournamentService {

    private final TournamentRepository tournamentRepository;
    private final SiteSettingsRepository siteSettingsRepository;

    public AdminTournamentService(TournamentRepository tournamentRepository, SiteSettingsRepository siteSettingsRepository) {
        this.tournamentRepository = tournamentRepository;
        this.siteSettingsRepository = siteSettingsRepository;
    }

    @Transactional(readOnly = true)
    public TournamentSettingsDto getSettings() {
        Tournament t = tournamentRepository.findFirstByOrderByIdAsc().orElseThrow();
        SiteSettings s = siteSettingsRepository.findFirstByOrderByIdAsc().orElseGet(SiteSettings::new);
        return TournamentSettingsDto.from(t, s);
    }

    @Transactional
    public TournamentSettingsDto update(TournamentSettingsUpdateRequest req) {
        Tournament t = tournamentRepository.findFirstByOrderByIdAsc().orElseThrow();

        if (req.name() != null) t.setName(req.name().trim());
        if (req.description() != null) t.setDescription(blankToNull(req.description()));
        if (req.entryFeePaise() != null) t.setEntryFeePaise(req.entryFeePaise());
        if (req.maxTeams() != null) t.setMaxTeams(req.maxTeams());
        if (req.minSquadSize() != null) t.setMinSquadSize(req.minSquadSize());
        if (req.maxSquadSize() != null) t.setMaxSquadSize(req.maxSquadSize());
        if (req.registrationOpensAt() != null || req.registrationOpensAtClear()) {
            t.setRegistrationOpensAt(req.registrationOpensAtClear() ? null : req.registrationOpensAt());
        }
        if (req.registrationClosesAt() != null || req.registrationClosesAtClear()) {
            t.setRegistrationClosesAt(req.registrationClosesAtClear() ? null : req.registrationClosesAt());
        }
        if (req.registrationMode() != null) {
            switch (req.registrationMode()) {
                case FORCE_OPEN -> {
                    t.setRegistrationOpenOverride(true);
                    t.setRegistrationClosedOverride(false);
                }
                case FORCE_CLOSED -> {
                    t.setRegistrationOpenOverride(false);
                    t.setRegistrationClosedOverride(true);
                }
                case SCHEDULE -> {
                    t.setRegistrationOpenOverride(false);
                    t.setRegistrationClosedOverride(false);
                }
                default -> { }
            }
        } else {
            if (req.registrationOpenOverride() != null) {
                t.setRegistrationOpenOverride(req.registrationOpenOverride());
            }
            if (req.registrationClosedOverride() != null) {
                t.setRegistrationClosedOverride(req.registrationClosedOverride());
            }
        }
        if (req.fixtureAnnouncementAt() != null || req.fixtureAnnouncementAtClear()) {
            t.setFixtureAnnouncementAt(req.fixtureAnnouncementAtClear() ? null : req.fixtureAnnouncementAt());
        }
        if (req.tournamentStartsAt() != null || req.tournamentStartsAtClear()) {
            t.setTournamentStartsAt(req.tournamentStartsAtClear() ? null : req.tournamentStartsAt());
        }
        if (req.fixturesPublished() != null) t.setFixturesPublished(req.fixturesPublished());
        if (req.timezone() != null && !req.timezone().isBlank()) t.setTimezone(req.timezone().trim());
        if (req.venue() != null) t.setVenue(blankToNull(req.venue()));
        if (req.rules() != null) t.setRules(blankToNull(req.rules()));
        tournamentRepository.save(t);

        SiteSettings s = siteSettingsRepository.findFirstByOrderByIdAsc().orElseGet(() -> {
            SiteSettings ns = new SiteSettings();
            siteSettingsRepository.save(ns);
            return ns;
        });
        if (req.contactEmail() != null) s.setContactEmail(blankToNull(req.contactEmail()));
        if (req.contactPhone() != null) s.setContactPhone(blankToNull(req.contactPhone()));
        if (req.contactAddress() != null) s.setContactAddress(blankToNull(req.contactAddress()));
        siteSettingsRepository.save(s);
        return TournamentSettingsDto.from(t, s);
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
