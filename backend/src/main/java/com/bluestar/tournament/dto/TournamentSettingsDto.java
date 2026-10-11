package com.bluestar.tournament.dto;

import com.bluestar.tournament.entity.SiteSettings;
import com.bluestar.tournament.entity.Tournament;

import java.time.Instant;

public record TournamentSettingsDto(
        Long id,
        String name,
        String description,
        long entryFeePaise,
        int maxTeams,
        int minSquadSize,
        int maxSquadSize,
        Instant registrationOpensAt,
        Instant registrationClosesAt,
        boolean registrationOpenOverride,
        boolean registrationClosedOverride,
        Instant fixtureAnnouncementAt,
        Instant tournamentStartsAt,
        boolean fixturesPublished,
        String timezone,
        String venue,
        String rules,
        String contactEmail,
        String contactPhone,
        String contactAddress
) {
    public static TournamentSettingsDto from(Tournament t, SiteSettings s) {
        return new TournamentSettingsDto(
                t.getId(),
                t.getName(),
                t.getDescription(),
                t.getEntryFeePaise(),
                t.getMaxTeams(),
                t.getMinSquadSize(),
                t.getMaxSquadSize(),
                t.getRegistrationOpensAt(),
                t.getRegistrationClosesAt(),
                t.isRegistrationOpenOverride(),
                t.isRegistrationClosedOverride(),
                t.getFixtureAnnouncementAt(),
                t.getTournamentStartsAt(),
                t.isFixturesPublished(),
                t.getTimezone(),
                t.getVenue(),
                t.getRules(),
                s.getContactEmail(),
                s.getContactPhone(),
                s.getContactAddress()
        );
    }
}
