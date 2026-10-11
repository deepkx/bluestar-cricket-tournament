package com.bluestar.tournament.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

public record RegistrationCreateRequest(
        @NotBlank @Size(max = 128) String teamName,
        @Size(max = 128) String city,
        @Valid @NotNull CaptainDto captain,
        @Valid @NotNull @Size(min = 2, max = 15) List<PlayerDto> players,
        @AssertTrue(message = "You must accept the tournament rules") Boolean rulesAccepted
) {
    public record CaptainDto(@NotBlank @Size(max = 128) String fullName) {}

    public record PlayerDto(
            @NotBlank @Size(max = 128) String fullName,
            @Min(0) @Max(999) Integer jerseyNumber,
            @Pattern(regexp = "^(Batter|Bowler|All-rounder|Wicketkeeper)?$") String playingRole,
            Boolean isCaptain
    ) {}
}
