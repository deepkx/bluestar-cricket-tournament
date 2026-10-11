package com.bluestar.tournament.dto;

import com.bluestar.tournament.entity.GalleryItem;

public record GalleryAdminDto(
        Long id,
        String imagePath,
        String caption,
        int displayOrder,
        boolean published
) {
    public static GalleryAdminDto from(GalleryItem g) {
        return new GalleryAdminDto(g.getId(), g.getImagePath(), g.getCaption(), g.getDisplayOrder(), g.isPublished());
    }
}
