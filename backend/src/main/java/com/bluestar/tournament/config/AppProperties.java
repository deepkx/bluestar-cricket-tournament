package com.bluestar.tournament.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        String corsAllowedOrigins,
        String uploadDir,
        int slotReservationMinutes,
        boolean registrationTestMinSquad,
        AdminBootstrap admin,
        Razorpay razorpay
) {
    /** Effective minimum squad for registration when {@link #registrationTestMinSquad()} is enabled. */
    public static final int TEST_MIN_SQUAD_SIZE = 2;

    public int effectiveMinSquadSize(int tournamentMinSquadSize) {
        return registrationTestMinSquad ? TEST_MIN_SQUAD_SIZE : tournamentMinSquadSize;
    }

    public record AdminBootstrap(String bootstrapEmail, String bootstrapPassword, String quickPassword) {}
    public record Razorpay(String keyId, String keySecret, String webhookSecret) {}
}
