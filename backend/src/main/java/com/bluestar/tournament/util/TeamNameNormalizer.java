package com.bluestar.tournament.util;

public final class TeamNameNormalizer {
    private TeamNameNormalizer() {}

    public static String normalize(String teamName) {
        if (teamName == null) return "";
        return teamName.trim().toLowerCase().replaceAll("\\s+", " ");
    }
}
