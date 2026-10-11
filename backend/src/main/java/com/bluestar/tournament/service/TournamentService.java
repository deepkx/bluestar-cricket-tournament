package com.bluestar.tournament.service;

import com.bluestar.tournament.config.AppProperties;
import com.bluestar.tournament.dto.TournamentAvailabilityDto;
import com.bluestar.tournament.dto.TournamentPublicDto;
import com.bluestar.tournament.entity.SiteSettings;
import com.bluestar.tournament.entity.Tournament;
import com.bluestar.tournament.exception.ApiException;
import com.bluestar.tournament.repository.RegistrationRepository;
import com.bluestar.tournament.repository.SiteSettingsRepository;
import com.bluestar.tournament.repository.TournamentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;

@Service
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final RegistrationRepository registrationRepository;
    private final SiteSettingsRepository siteSettingsRepository;
    private final AppProperties appProperties;

    public TournamentService(
            TournamentRepository tournamentRepository,
            RegistrationRepository registrationRepository,
            SiteSettingsRepository siteSettingsRepository,
            AppProperties appProperties) {
        this.tournamentRepository = tournamentRepository;
        this.registrationRepository = registrationRepository;
        this.siteSettingsRepository = siteSettingsRepository;
        this.appProperties = appProperties;
    }

    @Transactional(readOnly = true)
    public Tournament requireCurrent() {
        return tournamentRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NO_TOURNAMENT", "Tournament not configured"));
    }

    @Transactional(readOnly = true)
    public TournamentPublicDto getCurrentPublic() {
        Tournament t = requireCurrent();
        SiteSettings contact = siteSettingsRepository.findFirstByOrderByIdAsc().orElse(null);
        return TournamentPublicDto.from(
                t,
                contact,
                isRegistrationOpen(t),
                appProperties.effectiveMinSquadSize(t.getMinSquadSize()),
                appProperties.registrationTestMinSquad());
    }

    @Transactional(readOnly = true)
    public TournamentAvailabilityDto getAvailability() {
        Tournament t = requireCurrent();
        Instant now = Instant.now();
        long occupied = registrationRepository.countOccupiedSlots(t.getId(), now);
        int available = (int) Math.max(0, t.getMaxTeams() - occupied);
        return new TournamentAvailabilityDto(
                t.getMaxTeams(),
                (int) occupied,
                available,
                isRegistrationOpen(t),
                t.getEntryFeePaise()
        );
    }

    public boolean isRegistrationOpen(Tournament t) {
        if (t.isRegistrationClosedOverride()) {
            return false;
        }
        if (t.isRegistrationOpenOverride()) {
            return true;
        }
        Instant now = Instant.now();
        ZoneId zone = ZoneId.of(t.getTimezone());
        Instant opens = t.getRegistrationOpensAt();
        Instant closes = t.getRegistrationClosesAt();
        if (opens != null && now.isBefore(opens)) {
            return false;
        }
        if (closes != null && now.isAfter(closes)) {
            return false;
        }
        return opens != null || closes != null;
    }

    @Transactional(readOnly = true)
    public SiteSettings getSiteSettings() {
        return siteSettingsRepository.findFirstByOrderByIdAsc()
                .orElseGet(SiteSettings::new);
    }
}
