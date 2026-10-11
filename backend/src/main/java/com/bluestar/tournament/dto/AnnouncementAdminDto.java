package com.bluestar.tournament.dto;

import com.bluestar.tournament.entity.Announcement;

import java.time.Instant;

public record AnnouncementAdminDto(
        Long id,
        String title,
        String message,
        int priority,
        boolean published,
        Instant publishedAt
) {
    public static AnnouncementAdminDto from(Announcement a) {
        return new AnnouncementAdminDto(a.getId(), a.getTitle(), a.getMessage(), a.getPriority(), a.isPublished(), a.getPublishedAt());
    }
}
