package com.bluestar.tournament.dto;

import java.time.Instant;

public record AdminPaymentDto(
        Long id,
        String registrationReference,
        String teamName,
        long amountPaise,
        String currency,
        String providerOrderId,
        String providerPaymentId,
        String paymentStatus,
        Instant paidAt
) {}
