package com.bluestar.tournament.dto;

public record RegistrationCreatedResponse(
        String publicReference,
        String trackingToken,
        long entryFeePaise,
        String currency
) {}
