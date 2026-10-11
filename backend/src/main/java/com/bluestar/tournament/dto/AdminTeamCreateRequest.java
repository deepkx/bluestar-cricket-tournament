package com.bluestar.tournament.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminTeamCreateRequest(
        @NotBlank @Size(max = 128) String teamName,
        @NotBlank @Size(max = 128) String captainName
) {}
