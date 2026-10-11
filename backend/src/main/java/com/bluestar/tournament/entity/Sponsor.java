package com.bluestar.tournament.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "sponsors")
public class Sponsor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tournament_id")
    private Tournament tournament;

    @Column(nullable = false)
    private String name;

    @Column(name = "logo_path")
    private String logoPath;

    private String website;

    private String category;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(nullable = false)
    private boolean active;

    public Long getId() { return id; }
    public Tournament getTournament() { return tournament; }
    public void setTournament(Tournament tournament) { this.tournament = tournament; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getLogoPath() { return logoPath; }
    public void setLogoPath(String logoPath) { this.logoPath = logoPath; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public int getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(int displayOrder) { this.displayOrder = displayOrder; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
