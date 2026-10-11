package com.bluestar.tournament.dto;

import java.time.Instant;

public record MatchPublicDto(
        Long id,
        int roundNumber,
        int matchNumber,
        int bracketSlot,
        String teamAName,
        String teamBName,
        Long teamARegistrationId,
        Long teamBRegistrationId,
        Instant scheduledAt,
        String venue,
        String winnerName,
        String resultSummary,
        String matchStatus,
        boolean published
) {}
