package com.bluestar.tournament.dto;

import com.bluestar.tournament.entity.Sponsor;

public record SponsorAdminDto(
        Long id,
        String name,
        String logoPath,
        String website,
        String category,
        int displayOrder,
        boolean active
) {
    public static SponsorAdminDto from(Sponsor s) {
        return new SponsorAdminDto(s.getId(), s.getName(), s.getLogoPath(), s.getWebsite(), s.getCategory(), s.getDisplayOrder(), s.isActive());
    }
}
