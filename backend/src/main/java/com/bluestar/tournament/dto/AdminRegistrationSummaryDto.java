package com.bluestar.tournament.dto;

import com.bluestar.tournament.domain.RegistrationStatus;

import java.time.Instant;

public record AdminRegistrationSummaryDto(
        Long id,
        String publicReference,
        String teamName,
        RegistrationStatus status,
        Instant createdAt,
        Instant confirmedAt
) {}
