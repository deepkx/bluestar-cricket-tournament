package com.bluestar.tournament.dto;

public record TournamentAvailabilityDto(
        int maxTeams,
        int occupiedSlots,
        int availableSlots,
        boolean registrationOpen,
        long entryFeePaise
) {}
