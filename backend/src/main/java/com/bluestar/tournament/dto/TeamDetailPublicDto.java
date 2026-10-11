package com.bluestar.tournament.dto;

import java.time.Instant;
import java.util.List;

public record TeamDetailPublicDto(
        String teamName,
        String logoUrl,
        String captainName,
        Instant confirmedAt,
        List<PlayerLine> players
) {
    public record PlayerLine(String fullName, boolean captain, String photoUrl) {}
}
