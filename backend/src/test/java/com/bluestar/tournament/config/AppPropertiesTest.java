package com.bluestar.tournament.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AppPropertiesTest {

    private static AppProperties props(boolean registrationTestMinSquad) {
        return new AppProperties(
                "http://localhost:5173",
                "./uploads",
                30,
                registrationTestMinSquad,
                new AppProperties.AdminBootstrap(null, null, null),
                new AppProperties.Razorpay(null, null, null));
    }

    @Test
    void effectiveMinSquadUsesTournamentMinWhenTestFlagOff() {
        assertEquals(11, props(false).effectiveMinSquadSize(11));
    }

    @Test
    void effectiveMinSquadIsTwoWhenTestFlagOn() {
        assertEquals(2, props(true).effectiveMinSquadSize(11));
    }
}
