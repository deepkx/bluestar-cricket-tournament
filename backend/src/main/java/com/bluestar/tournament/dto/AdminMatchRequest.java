package com.bluestar.tournament.dto;

import java.time.Instant;

public record AdminMatchRequest(
        Integer roundNumber,
        Integer matchNumber,
        Integer bracketSlot,
        Long teamARegistrationId,
        Long teamBRegistrationId,
        Instant scheduledAt,
        String venue,
        String notes,
        Boolean published,
        String matchStatus
) {}
