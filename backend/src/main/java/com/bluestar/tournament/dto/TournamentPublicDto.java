package com.bluestar.tournament.dto;

import com.bluestar.tournament.entity.SiteSettings;
import com.bluestar.tournament.entity.Tournament;

import java.time.Instant;

public record TournamentPublicDto(
        Long id,
        String name,
        String description,
        String format,
        long entryFeePaise,
        int maxTeams,
        int minSquadSize,
        int maxSquadSize,
        boolean registrationTestMode,
        boolean registrationOpen,
        Instant registrationOpensAt,
        Instant registrationClosesAt,
        Instant fixtureAnnouncementAt,
        Instant tournamentStartsAt,
        boolean fixturesPublished,
        String timezone,
        String venue,
        String rules,
        ContactPublicDto contact
) {
    public static TournamentPublicDto from(
            Tournament t,
            SiteSettings settings,
            boolean registrationOpen,
            int effectiveMinSquadSize,
            boolean registrationTestMode) {
        ContactPublicDto contact = settings == null ? new ContactPublicDto(null, null, null) :
                new ContactPublicDto(settings.getContactEmail(), settings.getContactPhone(), settings.getContactAddress());
        return new TournamentPublicDto(
                t.getId(),
                t.getName(),
                t.getDescription(),
                t.getFormat(),
                t.getEntryFeePaise(),
                t.getMaxTeams(),
                effectiveMinSquadSize,
                t.getMaxSquadSize(),
                registrationTestMode,
                registrationOpen,
                t.getRegistrationOpensAt(),
                t.getRegistrationClosesAt(),
                t.getFixtureAnnouncementAt(),
                t.getTournamentStartsAt(),
                t.isFixturesPublished(),
                t.getTimezone(),
                t.getVenue(),
                t.getRules(),
                contact
        );
    }
}
