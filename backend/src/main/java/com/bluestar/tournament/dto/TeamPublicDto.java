package com.bluestar.tournament.dto;

import com.bluestar.tournament.domain.RegistrationStatus;

import java.time.Instant;

public record TeamPublicDto(
        Long registrationId,
        String teamName,
        String logoUrl,
        RegistrationStatus status,
        Instant confirmedAt
) {}
