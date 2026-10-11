package com.bluestar.tournament.dto;

import com.bluestar.tournament.domain.RegistrationStatus;
import com.bluestar.tournament.entity.Registration;

import java.time.Instant;
import java.util.List;

public record AdminRegistrationDetailDto(
        Long id,
        String publicReference,
        String teamName,
        String city,
        RegistrationStatus status,
        String captainName,
        String captainPhone,
        String captainEmail,
        String teamLogoUrl,
        List<PlayerLine> players,
        Instant createdAt,
        Instant confirmedAt
) {
    public record PlayerLine(
            Long id,
            String fullName,
            Integer jerseyNumber,
            String role,
            boolean captain,
            String photoUrl
    ) {}

    public static AdminRegistrationDetailDto from(Registration r) {
        List<PlayerLine> players = r.getPlayers().stream()
                .map(p -> new PlayerLine(
                        p.getId(),
                        p.getFullName(),
                        p.getJerseyNumber(),
                        p.getPlayingRole(),
                        p.isCaptain(),
                        p.getPhotoPath()))
                .toList();
        return new AdminRegistrationDetailDto(
                r.getId(),
                r.getPublicReference(),
                r.getTeamName(),
                r.getCity(),
                r.getStatus(),
                r.getContact().getCaptainName(),
                r.getContact().getPhone(),
                r.getContact().getEmail(),
                r.getTeamLogoPath(),
                players,
                r.getCreatedAt(),
                r.getConfirmedAt()
        );
    }
}
