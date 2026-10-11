package com.bluestar.tournament.dto;

import com.bluestar.tournament.domain.RegistrationStatus;

import java.time.Instant;

public record RegistrationStatusResponse(
        String publicReference,
        String teamName,
        RegistrationStatus status,
        long entryFeePaise,
        Instant confirmedAt,
        boolean canRetryPayment
) {}
