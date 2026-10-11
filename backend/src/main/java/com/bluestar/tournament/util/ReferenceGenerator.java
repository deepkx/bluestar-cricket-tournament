package com.bluestar.tournament.util;

import java.security.SecureRandom;
import java.util.HexFormat;

public final class ReferenceGenerator {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private ReferenceGenerator() {}

    public static String publicReference() {
        StringBuilder sb = new StringBuilder("BS-");
        for (int i = 0; i < 8; i++) {
            sb.append(REF_CHARS.charAt(RANDOM.nextInt(REF_CHARS.length())));
        }
        return sb.toString();
    }

    public static String trackingToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }
}
