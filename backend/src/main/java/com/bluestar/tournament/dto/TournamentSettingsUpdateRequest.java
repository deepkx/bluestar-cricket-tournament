package com.bluestar.tournament.dto;

import java.time.Instant;

public record TournamentSettingsUpdateRequest(
        String name,
        String description,
        Long entryFeePaise,
        Integer maxTeams,
        Integer minSquadSize,
        Integer maxSquadSize,
        Instant registrationOpensAt,
        Boolean registrationOpensAtClear,
        Instant registrationClosesAt,
        Boolean registrationClosesAtClear,
        RegistrationMode registrationMode,
        Boolean registrationOpenOverride,
        Boolean registrationClosedOverride,
        Instant fixtureAnnouncementAt,
        Boolean fixtureAnnouncementAtClear,
        Instant tournamentStartsAt,
        Boolean tournamentStartsAtClear,
        Boolean fixturesPublished,
        String timezone,
        String venue,
        String rules,
        String contactEmail,
        String contactPhone,
        String contactAddress
) {
    public enum RegistrationMode {
        SCHEDULE,
        FORCE_OPEN,
        FORCE_CLOSED
    }
}
