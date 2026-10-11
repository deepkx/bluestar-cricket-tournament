package com.bluestar.tournament.dto;

public record AdminDashboardDto(
        int maxTeams,
        int confirmedRegistrations,
        int pendingPayments,
        int failedPayments,
        int availableSlots,
        long totalCollectionsPaise,
        boolean fixturesPublished
) {}
