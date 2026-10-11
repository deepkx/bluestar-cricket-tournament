package com.bluestar.tournament.dto;

import jakarta.validation.constraints.NotNull;

public record MatchResultRequest(
        @NotNull Long winnerRegistrationId,
        String resultSummary
) {}
