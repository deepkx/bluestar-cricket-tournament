package com.bluestar.tournament.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AdminRegistrationUpdateRequest(
        @Size(max = 128) String teamName,
        @Size(max = 128) String city,
        @Size(max = 128) String captainName,
        @Valid List<PlayerUpdate> players,
        @Valid List<NewPlayer> newPlayers,
        List<Long> removePlayerIds
) {
    public record PlayerUpdate(
            Long id,
            @Size(max = 128) String fullName,
            Boolean captain,
            Integer jerseyNumber,
            @Size(max = 64) String playingRole,
            /** Index into multipart `playerPhotos` list for this player's new image. */
            Integer photoUploadIndex
    ) {}

    public record NewPlayer(
            @Size(max = 128) String fullName,
            Boolean captain,
            Integer jerseyNumber,
            @Size(max = 64) String playingRole,
            Integer photoUploadIndex
    ) {}
}
