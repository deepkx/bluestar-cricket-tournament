package com.bluestar.tournament.dto;

import java.time.Instant;

public record AnnouncementPublicDto(String title, String message, Instant publishedAt, int priority) {}
